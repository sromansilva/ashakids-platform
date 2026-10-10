"""Contrato del primer flujo: solo fixture PostgreSQL descartable con guardas existentes."""
import asyncio
import json

import httpx
import pytest
from sqlalchemy import func, select

from app.main import app
from app.models.auth import SesionAutenticacion, Usuario
from app.models.auditoria import AuditoriaCambios
from app.models.perfiles import Paciente
from app.core.security import verify_password
from app.core.config import settings
from app.core import login_limiter


@pytest.fixture(autouse=True)
def isolated_limiter(monkeypatch):
    # Many synthetic sessions in one process; keep throttling enabled but isolate counters.
    monkeypatch.setattr(login_limiter, "login_limiter", login_limiter.LoginLimiter(
        settings.model_copy(update={"LOGIN_IP_LIMIT": 1000, "LOGIN_PAIR_LIMIT": 100})))

DNI = "12345678"  # Dato ficticio, no documento de una persona.
NEW_PASSWORD = "Familia-Prueba-Aislada-2026"
FAMILY = {"nombres": "Familia", "apellidos": "Sintética", "email": "familia@example.com",
          "dni": DNI, "hijos": [
              {"nombres_paciente": "Ana", "apellidos_paciente": "Prueba", "fecha_nacimiento": "2020-05-06", "sexo": "F"},
              {"nombres_paciente": "Luis", "apellidos_paciente": "Prueba", "fecha_nacimiento": "2021-06-07", "sexo": "M"},
          ]}


def client():
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


async def register(admin, **changes):
    response = await admin.post("/api/v1/admin/familias", json={**FAMILY, **changes})
    assert response.status_code == 201, response.text
    return response.json()


async def test_family_activation_rotation_and_isolation(clinical):
    clients, factory = clinical
    data = await register(clients["a90001"])
    code = data["cuenta"]["codigo_usuario"]
    assert code == "P90003" and len(data["hijos"]) == 2
    assert DNI not in json.dumps(data)
    async with client() as parent, client() as old_session:
        for browser in (parent, old_session):
            login = await browser.post("/api/v1/auth/login", json={"codigo_usuario": code.lower(), "password": DNI})
            assert login.status_code == 200
            assert login.json()["user"]["password_change_required"] is True
        for path in ("pacientes", "citas", "conversaciones", "padres/me", "usuarios", "admin/cuentas"):
            assert (await parent.get(f"/api/v1/{path}")).status_code == 403
        assert (await parent.patch(f"/api/v1/usuarios/{data['cuenta']['id_usuario']}", json={"password": NEW_PASSWORD})).status_code == 403
        assert (await parent.get("/api/v1/auth/me")).status_code == 200
        for payload, expected in [
            ({"current_password": DNI, "new_password": "corta"}, 422),
            ({"current_password": "87654321", "new_password": NEW_PASSWORD}, 403),
            ({"current_password": DNI, "new_password": NEW_PASSWORD, "id_usuario": 1}, 422),
        ]:
            assert (await parent.post("/api/v1/auth/activate", json=payload)).status_code == expected
        activation = await parent.post("/api/v1/auth/activate", json={"current_password": DNI, "new_password": NEW_PASSWORD})
        assert activation.status_code == 200, activation.text
        assert activation.json()["user"]["password_change_required"] is False
        assert "HttpOnly" in activation.headers["set-cookie"]
        assert (await old_session.get("/api/v1/auth/me")).status_code == 401
        assert (await parent.get("/api/v1/pacientes")).json()[0]["id_tutor"] == data["hijos"][0]["id_tutor"]
        assert (await parent.post("/api/v1/auth/activate", json={"current_password": DNI, "new_password": NEW_PASSWORD})).status_code == 409
        await parent.post("/api/v1/auth/logout")
        assert (await parent.post("/api/v1/auth/login", json={"codigo_usuario": code, "password": DNI})).status_code == 401
        assert (await parent.post("/api/v1/auth/login", json={"codigo_usuario": code, "password": NEW_PASSWORD})).status_code == 200
        assert len((await parent.get("/api/v1/pacientes")).json()) == 2
    child = data["hijos"][0]["id_paciente"]
    assert (await clients["p90001"].get(f"/api/v1/pacientes/{child}")).status_code == 404
    async with factory() as db:
        row = await db.get(Usuario, data["cuenta"]["id_usuario"])
        assert not row.password_change_required and verify_password(NEW_PASSWORD, row.password_hash)
        assert not verify_password(DNI, row.password_hash)
        audits = (await db.scalars(select(AuditoriaCambios))).all()
        assert DNI not in json.dumps([a.datos_nuevos for a in audits])
        sessions = (await db.scalars(select(SesionAutenticacion).where(SesionAutenticacion.id_usuario == row.id_usuario))).all()
        assert all(s.revocado for s in sessions) or sum(not s.revocado for s in sessions) == 1


@pytest.mark.parametrize("change", [{"hijos": []}, {"dni": "abc12345"}, {"id_tutor": 1},
    {"hijos": [{**FAMILY["hijos"][0], "fecha_nacimiento": "2999-01-01"}]}])
async def test_invalid_family_creates_nothing(clinical, change):
    clients, factory = clinical
    assert (await clients["a90001"].post("/api/v1/admin/familias", json={**FAMILY, **change})).status_code == 422
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(Usuario)) == 5
        assert await db.scalar(select(func.count()).select_from(Paciente)) == 0


async def test_only_admin_and_unique_codes_under_concurrency(clinical):
    clients, _ = clinical
    assert (await clients["p90001"].post("/api/v1/admin/familias", json=FAMILY)).status_code == 403
    async with client() as anonymous:
        assert (await anonymous.post("/api/v1/admin/familias", json=FAMILY)).status_code == 401
    responses = await asyncio.gather(*(register(clients["a90001"], email=f"family{i}@example.com") for i in range(3)))
    assert {r["cuenta"]["codigo_usuario"] for r in responses} == {"P90003", "P90004", "P90005"}
    duplicate = await clients["a90001"].post("/api/v1/admin/familias", json={**FAMILY, "email": "family0@example.com"})
    assert duplicate.status_code == 409


async def test_transaction_rolls_back_partial_family(clinical, monkeypatch):
    clients, factory = clinical
    import app.services.familias as families
    async def failing_audit(**kwargs):
        raise RuntimeError("Fallo sintético después del primer hijo")
    monkeypatch.setattr(families, "registrar_auditoria", failing_audit)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test") as admin:
        admin.cookies.update(clients["a90001"].cookies)
        assert (await admin.post("/api/v1/admin/familias", json=FAMILY)).status_code == 500
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(Usuario)) == 5
        assert await db.scalar(select(func.count()).select_from(Paciente)) == 0
        assert await db.scalar(select(func.count()).select_from(AuditoriaCambios)) == 0


async def test_parallel_activation_has_single_winner(clinical):
    clients, _ = clinical
    data = await register(clients["a90001"])
    code = data["cuenta"]["codigo_usuario"]
    async with client() as first, client() as second:
        for browser in (first, second):
            assert (await browser.post("/api/v1/auth/login", json={"codigo_usuario": code, "password": DNI})).status_code == 200
        responses = await asyncio.gather(*(browser.post("/api/v1/auth/activate", json={"current_password": DNI, "new_password": NEW_PASSWORD}) for browser in (first, second)))
        assert sorted(r.status_code for r in responses) == [200, 409]


async def test_other_creation_paths_require_activation(clinical):
    clients, _ = clinical
    admin = clients["a90001"]
    response = await admin.post("/api/v1/admin/cuentas/terapeutas", json={"nombres": "T", "apellidos": "Prueba", "email": "therapist@example.com", "password": DNI})
    assert response.status_code == 201, response.text
    assert response.json()["cuenta"]["codigo_usuario"].startswith("T")
    async with client() as therapist:
        login = await therapist.post("/api/v1/auth/login", json={"codigo_usuario": response.json()["cuenta"]["codigo_usuario"], "password": DNI})
        assert login.json()["user"]["password_change_required"]
        assert (await therapist.get("/api/v1/terapeutas/me")).status_code == 403
    generic = await admin.post("/api/v1/usuarios", json={"nombres": "P", "apellidos": "Prueba", "email": "generic@example.com", "codigo_usuario": "p77777", "rol": "PADRE", "password": NEW_PASSWORD})
    assert generic.status_code == 201
    async with client() as parent:
        login = await parent.post("/api/v1/auth/login", json={"codigo_usuario": "P77777", "password": NEW_PASSWORD})
        assert login.json()["user"]["password_change_required"]
        assert (await parent.get("/api/v1/pacientes")).status_code == 403

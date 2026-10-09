import asyncio
from datetime import datetime, timedelta, timezone

import httpx
import pytest
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.core import database
from app.core.config import settings
from app.main import app
from app.models.auth import Rol, SesionAutenticacion, Usuario, UsuarioRol
from app.models.clinica import Reserva, Sesion
from tests.clinical_helpers import PATIENT, journey, session_journey


async def test_duplicate_user_rolls_back_transaction(clinical):
    clients, factory = clinical
    response = await clients["a90001"].post("/api/v1/usuarios", json={
        "nombres": "Duplicado", "apellidos": "Prueba", "email": "diferente@example.com",
        "codigo_usuario": "p90001", "password": "Solo-Pruebas-Aisladas-2026", "rol": "PADRE"})
    assert response.status_code == 409
    assert "INSERT" not in response.text and "password_hash" not in response.text
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(Usuario)) == 5


async def test_network_failure_is_not_success(clinical, monkeypatch):
    clients, _ = clinical
    bad = create_async_engine("postgresql+asyncpg://audit@127.0.0.1:55438/ashakids_test_missing",
                              connect_args={"timeout": 1})
    try:
        monkeypatch.setattr(database, "async_session_factory", async_sessionmaker(bad))
        response = await clients["a90001"].get("/health/ready")
        assert response.status_code == 503
        assert "55438" not in response.text
    finally:
        await bad.dispose()


async def test_commit_failure_returns_conflict_and_rolls_back(clinical, monkeypatch):
    clients, factory = clinical
    class FailingCommit(AsyncSession):
        async def commit(self):
            raise IntegrityError("commit", {}, Exception("synthetic"))
    monkeypatch.setattr(database, "async_session_factory", async_sessionmaker(
        factory.kw["bind"], class_=FailingCommit, expire_on_commit=False))
    response = await clients["p90001"].post("/api/v1/pacientes", json=PATIENT)
    assert response.status_code == 409
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(Reserva)) == 0
        from app.models.perfiles import Paciente
        assert await db.scalar(select(func.count()).select_from(Paciente)) == 0


@pytest.mark.parametrize("change", [
    {"fecha_hora_inicio": "2020-01-01T10:00:00Z", "fecha_hora_fin": "2020-01-01T11:00:00Z"},
    {"fecha_hora_inicio": "2030-01-01T10:00:00"},
    {"fecha_hora_fin": "2000-01-01T10:00:00Z"},
    {"modalidad": "OTRO"},
])
async def test_bad_cita_payloads(clinical, change):
    clients, _ = clinical
    _, _, _, payload = await journey(clients)
    response = await clients["p90001"].post("/api/v1/citas", json={**payload, **change})
    assert response.status_code == 422


async def test_unassigned_cannot_create_treatment(clinical):
    clients, _ = clinical
    patient, _, cita, payload = await journey(clients)
    assert (await clients["t90002"].post("/api/v1/tratamientos", json={
        "id_paciente": patient["id_paciente"], "id_terapeuta": 2,
        "nombre_tratamiento": "Asignación no autorizada"})).status_code == 403
    assert (await clients["p90002"].post("/api/v1/citas", json=payload)).status_code == 404
    assert (await clients["p90001"].post("/api/v1/sesiones", json={"id_reserva": cita["id_reserva"]})).status_code == 403


async def test_session_concurrency_and_cita_lock(clinical):
    clients, factory = clinical
    _, _, cita, _ = await journey(clients)
    await clients["t90001"].patch(f"/api/v1/citas/{cita['id_reserva']}/estado", json={"estado_reserva": "CONFIRMADA"})
    responses = await asyncio.gather(*[clients[code].post("/api/v1/sesiones", json={"id_reserva": cita["id_reserva"]})
                                       for code in ["t90001", "a90001"]])
    assert sorted(r.status_code for r in responses) == [201, 409]
    response = await clients["p90001"].patch(f"/api/v1/citas/{cita['id_reserva']}/estado", json={"estado_reserva": "CANCELADA"})
    assert response.status_code == 409
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(Sesion)) == 1


async def test_profile_auth_logout_expiry_postgres(clinical):
    clients, factory = clinical
    for code, area in [("p90001", "padres"), ("t90001", "terapeutas"), ("a90001", "admin")]:
        assert (await clients[code].get("/api/v1/auth/me")).status_code == 200
        response = await clients[code].get(f"/api/v1/{area}/me")
        assert response.status_code == 200
        assert response.json()["user"]["codigo_usuario"] == code
    assert (await clients["p90001"].get("/api/v1/admin/me")).status_code == 403
    await clients["p90001"].post("/api/v1/auth/logout")
    assert (await clients["p90001"].get("/api/v1/auth/me")).status_code == 401
    async with factory.begin() as db:
        await db.execute(update(SesionAutenticacion).where(SesionAutenticacion.id_usuario == 4)
                         .values(fecha_expiracion=datetime.now(timezone.utc)-timedelta(hours=1)))
    assert (await clients["t90001"].get("/api/v1/auth/me")).status_code == 401


async def test_multirole_does_not_grant_family_edit(clinical):
    clients, factory = clinical
    patient, _, _, _ = await journey(clients)
    async with factory.begin() as db:
        role = await db.scalar(select(Rol.id_rol).where(Rol.nombre_rol == "PADRE"))
        db.add(UsuarioRol(id_usuario=4, id_rol=role))
    response = await clients["t90001"].put(f"/api/v1/pacientes/{patient['id_paciente']}", json=PATIENT)
    assert response.status_code == 403


async def test_production_cookie_and_origin(clinical, monkeypatch):
    clients, _ = clinical
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="https://test") as client:
        response = await client.post("/api/v1/auth/login", json={"codigo_usuario": "p90001", "password": "Solo-Pruebas-Aisladas-2026"})
        assert response.status_code == 200
        assert "Secure" in response.headers["set-cookie"] and "HttpOnly" in response.headers["set-cookie"]
        assert (await client.post("/api/v1/pacientes", json=PATIENT)).status_code == 403
        assert (await client.post("/api/v1/pacientes", json=PATIENT, headers={"Origin": settings.CORS_ORIGINS[0]})).status_code == 201

import asyncio
from datetime import datetime, timedelta, timezone

import httpx
import pytest
from sqlalchemy import func, select, text

from app.main import app
from app.models.auth import SesionAutenticacion, Usuario
from app.models.clinica import ReporteSesion, Reserva
from app.models.perfiles import Paciente
from tests.clinical_helpers import PATIENT, appointment_due, journey, session_journey


async def test_patient_persistence_and_ownership(clinical):
    clients, factory = clinical
    patient, _, _, _ = await journey(clients)
    key = patient["id_paciente"]
    async with factory() as db:
        assert (await db.get(Paciente, key)).nombres_paciente == PATIENT["nombres_paciente"]
    for code in ["p90001", "t90001", "a90001"]:
        response = await clients[code].get(f"/api/v1/pacientes/{key}")
        assert response.status_code == 200
    for code in ["p90002", "t90002"]:
        assert (await clients[code].get(f"/api/v1/pacientes/{key}")).status_code == 404
        assert (await clients[code].get("/api/v1/pacientes")).json() == []
    parent = clients["p90001"]
    assert (await parent.put(f"/api/v1/pacientes/{key}", json={**PATIENT, "nombres_paciente": "Editado"})).status_code == 200
    assert (await parent.delete(f"/api/v1/pacientes/{key}")).json()["activo"] is False
    async with factory() as db:
        assert await db.get(Paciente, key) is not None


@pytest.mark.parametrize("payload,status", [
    ({**PATIENT, "id_tutor": 2}, 403),
    ({**PATIENT, "fecha_nacimiento": "2999-01-01"}, 422),
    ({**PATIENT, "nombres_paciente": " "}, 422),
    ({**PATIENT, "activo": True}, 422),
])
async def test_patient_invalid_or_foreign(clinical, payload, status):
    clients, _ = clinical
    assert (await clients["p90001"].post("/api/v1/pacientes", json=payload)).status_code == status


async def test_admin_users_create_update_revoke(clinical):
    clients, factory = clinical
    admin = clients["a90001"]
    payload = {"nombres": "Nuevo", "apellidos": "Sintético", "email": "nuevo@example.com",
               "codigo_usuario": "p90003", "password": " Nueva-Clave-Prueba-2026 ", "rol": "PADRE"}
    response = await admin.post("/api/v1/usuarios", json=payload)
    assert response.status_code == 201, response.text
    key = response.json()["id_usuario"]
    assert response.json()["id_tutor"] is not None
    assert "password" not in response.text
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as fresh:
        login = await fresh.post("/api/v1/auth/login", json={
            "codigo_usuario": payload["codigo_usuario"], "password": payload["password"]})
        assert login.status_code == 200, "Las contraseñas no deben recortarse al guardar."
        changed = await admin.patch(f"/api/v1/usuarios/{key}", json={"password": "Otra-Clave-Prueba-2026"})
        assert changed.status_code == 200
        assert (await fresh.get("/api/v1/auth/me")).status_code == 401
        login = await fresh.post("/api/v1/auth/login", json={
            "codigo_usuario": payload["codigo_usuario"], "password": "Otra-Clave-Prueba-2026"})
        assert login.status_code == 200
    assert (await admin.get(f"/api/v1/usuarios/{key}")).status_code == 200
    assert (await admin.post("/api/v1/usuarios", json=payload)).status_code == 409
    assert (await clients["p90001"].get("/api/v1/usuarios")).status_code == 403
    users = (await admin.get("/api/v1/usuarios")).json()
    assert len(users) == 6
    response = await admin.patch("/api/v1/usuarios/2", json={"activo": False})
    assert response.status_code == 200
    assert (await clients["p90001"].get("/api/v1/auth/me")).status_code == 401
    async with factory() as db:
        sessions = (await db.scalars(select(SesionAutenticacion).where(SesionAutenticacion.id_usuario == 2))).all()
        assert all(s.revocado for s in sessions)
    assert (await admin.patch("/api/v1/usuarios/1", json={"activo": False})).status_code == 409
    assert (await admin.patch(f"/api/v1/usuarios/{key}", json={"nombres": None})).status_code == 422


async def test_cita_conflict_and_transitions(clinical):
    clients, _ = clinical
    patient, _, cita, payload = await journey(clients)
    key = cita["id_reserva"]
    parent, therapist = clients["p90001"], clients["t90001"]
    assert (await parent.post("/api/v1/citas", json=payload)).status_code == 409
    assert (await parent.patch(f"/api/v1/citas/{key}/estado", json={"estado_reserva": "CONFIRMADA"})).status_code == 403
    assert (await clients["p90002"].get(f"/api/v1/citas/{key}")).status_code == 404
    assert (await clients["t90002"].get("/api/v1/citas")).json() == []
    assert (await therapist.patch(f"/api/v1/citas/{key}/estado", json={"estado_reserva": "CONFIRMADA"})).status_code == 200
    schedule = {k: v for k, v in payload.items() if k != "id_tratamiento"}
    assert (await parent.put(f"/api/v1/citas/{key}", json=schedule)).json()["estado_reserva"] == "PENDIENTE"
    assert (await parent.patch(f"/api/v1/citas/{key}/estado", json={"estado_reserva": "CANCELADA"})).status_code == 200
    assert (await parent.put(f"/api/v1/citas/{key}", json=schedule)).status_code == 409
    assert (await parent.post("/api/v1/citas", json=payload)).status_code == 201
    assert (await parent.get(f"/api/v1/pacientes/{patient['id_paciente']}/tratamientos")).status_code == 200


async def test_concurrent_citas_only_one_persists(clinical):
    clients, factory = clinical
    _, _, cita, payload = await journey(clients)
    await clients["p90001"].patch(f"/api/v1/citas/{cita['id_reserva']}/estado", json={"estado_reserva": "CANCELADA"})
    responses = await asyncio.gather(*[
        clients[code].post("/api/v1/citas", json=payload) for code in ["p90001", "t90001"]])
    assert sorted(r.status_code for r in responses) == [201, 409]
    async with factory() as db:
        count = await db.scalar(select(func.count()).select_from(Reserva).where(Reserva.estado_reserva != "CANCELADA"))
        assert count == 1


async def test_session_report_and_state_machine(clinical):
    clients, factory = clinical
    _, cita, session = await session_journey(clients)
    key = session["id_sesion"]
    therapist, parent = clients["t90001"], clients["p90001"]
    assert (await parent.get(f"/api/v1/sesiones/{key}")).status_code == 200
    assert (await therapist.post("/api/v1/sesiones", json={"id_reserva": cita["id_reserva"]})).status_code == 409
    assert (await parent.post(f"/api/v1/sesiones/{key}/iniciar")).status_code == 403
    assert (await clients["t90002"].get(f"/api/v1/sesiones/{key}")).status_code == 404
    assert (await parent.get(f"/api/v1/sesiones/{key}/reporte")).status_code == 404
    assert (await therapist.post(f"/api/v1/sesiones/{key}/cerrar", json={"asistencia": "ASISTIO"})).status_code == 409
    assert (await therapist.post(f"/api/v1/sesiones/{key}/iniciar")).status_code == 409
    await appointment_due(factory, cita)
    assert (await therapist.post(f"/api/v1/sesiones/{key}/iniciar")).status_code == 200
    assert (await therapist.post(f"/api/v1/sesiones/{key}/iniciar")).status_code == 409
    assert (await therapist.put(f"/api/v1/sesiones/{key}/reporte", json={"objetivos_trabajados": "Solo prueba"})).status_code == 200
    assert (await parent.put(f"/api/v1/sesiones/{key}/reporte", json={})).status_code == 403
    assert (await parent.get(f"/api/v1/sesiones/{key}/reporte")).json()["objetivos_trabajados"] == "Solo prueba"
    assert (await therapist.post(f"/api/v1/sesiones/{key}/cerrar", json={"asistencia": "ASISTIO"})).status_code == 200
    assert (await therapist.post(f"/api/v1/sesiones/{key}/cerrar", json={"asistencia": "ASISTIO"})).status_code == 409
    assert (await parent.get(f"/api/v1/citas/{cita['id_reserva']}")).json()["estado_reserva"] == "COMPLETADA"
    assert len((await parent.get("/api/v1/sesiones")).json()) == 1
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(ReporteSesion)) == 1


async def test_session_no_show(clinical):
    clients, factory = clinical
    _, cita, row = await session_journey(clients)
    assert (await clients["t90001"].post(f"/api/v1/sesiones/{row['id_sesion']}/cerrar", json={"asistencia": "NO_ASISTIO"})).status_code == 409
    await appointment_due(factory, cita)
    response = await clients["t90001"].post(f"/api/v1/sesiones/{row['id_sesion']}/cerrar", json={"asistencia": "NO_ASISTIO"})
    assert response.status_code == 200
    assert response.json()["fecha_hora_inicio_real"] is None


async def test_csrf_pagination_and_missing_resources(clinical):
    clients, _ = clinical
    parent = clients["p90001"]
    assert (await parent.post("/api/v1/pacientes", json=PATIENT, headers={"Origin": "https://evil.invalid"})).status_code == 403
    assert (await parent.get("/api/v1/pacientes?limit=101")).status_code == 422
    assert (await parent.get("/api/v1/pacientes/999999")).status_code == 404
    assert (await parent.get("/health/ready")).status_code == 200


async def test_anonymous_routes_are_protected():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        for path, operations in app.openapi()["paths"].items():
            if not path.startswith("/api/v1") or path.endswith(("/login", "/logout")):
                continue
            for method in operations:
                response = await client.request(method.upper(), path.replace("{key}", "1"), json={})
                assert response.status_code == 401, (method, path, response.text)

from datetime import datetime, timedelta, timezone
from sqlalchemy import update
from app.models.clinica import Reserva
from zoneinfo import ZoneInfo

PATIENT = {"nombres_paciente": "Paciente", "apellidos_paciente": "Sintético",
           "fecha_nacimiento": "2020-01-01", "sexo": "Otro"}


async def journey(clients):
    admin, parent = clients["a90001"], clients["p90001"]
    response = await parent.post("/api/v1/pacientes", json=PATIENT)
    assert response.status_code == 201, response.text
    patient = response.json()
    response = await admin.post("/api/v1/tratamientos", json={
        "id_paciente": patient["id_paciente"], "id_terapeuta": 1,
        "nombre_tratamiento": "Plan de prueba"})
    assert response.status_code == 201, response.text
    treatment = response.json()
    start = (datetime.now(ZoneInfo("America/Lima")) + timedelta(days=1)).replace(hour=8, minute=0, second=0, microsecond=0)
    if start.weekday() == 6:
        start += timedelta(days=1)
    published = await clients["t90001"].put("/api/v1/terapeutas/1/disponibilidad", json={
        "turnos": [{"dia": day, "hora": hour} for day in range(6) for hour in range(8, 18)], "bloqueos": []})
    assert published.status_code == 200, published.text
    # La fixture reserva introducción real; el plan previo sirve solo a regresiones V26.
    payload = {"tipo_cita": "INTRODUCTORIA", "id_paciente": patient["id_paciente"], "id_terapeuta": 1,
               "fecha_hora_inicio": start.isoformat(),
               "fecha_hora_fin": (start + timedelta(minutes=45)).isoformat(), "modalidad": "VIRTUAL"}
    response = await parent.post("/api/v1/citas", json=payload)
    assert response.status_code == 201, response.text
    assert response.json()["estado_reserva"] == "CONFIRMADA"
    return patient, treatment, response.json(), payload


async def session_journey(clients):
    patient, treatment, cita, payload = await journey(clients)
    therapist = clients["t90001"]
    response = await therapist.patch(f"/api/v1/citas/{cita['id_reserva']}/estado",
                                     json={"estado_reserva": "CONFIRMADA"})
    assert response.status_code == 200, response.text
    response = await therapist.post("/api/v1/sesiones", json={"id_reserva": cita["id_reserva"]})
    assert response.status_code == 201, response.text
    return patient, cita, response.json()


async def appointment_due(factory, cita):
    """Simular paso del tiempo solamente en la BD local descartable."""
    now = datetime.now(timezone.utc)
    async with factory.begin() as db:
        await db.execute(update(Reserva).where(Reserva.id_reserva == cita["id_reserva"]).values(
            fecha_hora_inicio=now-timedelta(hours=2), fecha_hora_fin=now-timedelta(hours=1)))

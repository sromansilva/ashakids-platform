from sqlalchemy import select
from app.models.clinica import ReporteSesion
from tests.clinical_helpers import session_journey


async def test_paginated_projection_is_scoped(clinical):
    clients, factory = clinical
    patient, cita, session = await session_journey(clients)
    for code, count in [("a90001", 1), ("p90001", 1), ("t90001", 1), ("p90002", 0), ("t90002", 0)]:
        for path in ["pacientes", "citas", "sesiones"]:
            response = await clients[code].get(f"/api/v1/{path}?limit=1")
            assert response.status_code == 200, response.text
            assert response.headers["x-total-count"] == str(count)
            assert len(response.json()) == count
        response = await clients[code].get("/api/v1/citas?offset=10")
        assert response.json() == []
        assert response.headers["x-total-count"] == str(count)
    for code in ["a90001", "p90001", "t90001"]:
        response = await clients[code].get(f"/api/v1/citas/{cita['id_reserva']}")
        assert response.json()["id_sesion"] == session["id_sesion"]
        assert response.json()["paciente_nombre"]
        assert response.json()["terapeuta_nombre"]
        response = await clients[code].get(f"/api/v1/sesiones/{session['id_sesion']}")
        assert response.json()["cita"]["id_paciente"] == patient["id_paciente"]
        assert response.json()["reporte_disponible"] is False
    parent = clients["p90001"]
    assert (await parent.get("/api/v1/sesiones?con_reporte=true")).headers["x-total-count"] == "0"
    assert (await parent.get("/api/v1/citas?paciente=99999")).json() == []
    assert (await parent.get("/api/v1/citas?terapeuta=2")).json() == []
    assert (await parent.get("/api/v1/citas?estado=CANCELADA")).json() == []
    assert (await parent.get("/api/v1/citas?desde=2999-01-01T00:00:00Z")).json() == []
    assert (await parent.get("/api/v1/sesiones?estado=FINALIZADA")).json() == []
    assert (await parent.get("/api/v1/pacientes?q=INEXISTENTE")).json() == []
    assert (await parent.get("/api/v1/pacientes?activo=false")).json() == []
    treatments = await parent.get(f"/api/v1/pacientes/{patient['id_paciente']}/tratamientos")
    assert treatments.headers['x-total-count'] == '1'
    assert treatments.json()[0]['paciente_nombre']
    async with factory.begin() as db:
        db.add(ReporteSesion(id_sesion=session['id_sesion'], observaciones_iniciales='Sintético'))
    response = await parent.get("/api/v1/sesiones?con_reporte=true")
    assert response.headers['x-total-count'] == '1'
    assert response.json()[0]['reporte_disponible'] is True


async def test_user_filters_and_cors(clinical):
    clients, _ = clinical
    admin = clients['a90001']
    response = await admin.get('/api/v1/usuarios?rol=PADRE&activo=true&limit=1', headers={'Origin': 'http://localhost:5173'})
    assert response.headers['x-total-count'] == '2'
    assert 'X-Total-Count' in response.headers['access-control-expose-headers']
    assert response.json()[0]['id_tutor'] is not None
    assert (await admin.get('/api/v1/usuarios?q=t90002')).headers['x-total-count'] == '1'
    assert (await admin.get('/api/v1/usuarios?activo=false')).json() == []
    assert (await clients['p90001'].get('/api/v1/usuarios?rol=PADRE')).status_code == 403

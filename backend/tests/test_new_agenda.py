"""Flujo introductorio y agenda con PostgreSQL local descartable real."""
import asyncio
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy import func, select
from app.models.agenda import TurnoSemanal
from app.models.clinica import Reserva
from tests.clinical_helpers import PATIENT, appointment_due, session_journey


def next_start():
    day = (datetime.now(ZoneInfo('America/Lima')) + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    return day + timedelta(days=1) if day.weekday() == 6 else day


async def child(client):
    response = await client.post('/api/v1/pacientes', json=PATIENT)
    assert response.status_code == 201, response.text
    return response.json()['id_paciente']


async def publish(client, therapist=1, blocks=None):
    response = await client.put(f'/api/v1/terapeutas/{therapist}/disponibilidad', json={
        'turnos': [{'dia': d, 'hora': h} for d in range(6) for h in range(8, 18)], 'bloqueos': blocks or []})
    assert response.status_code == 200, response.text


def intro(patient, therapist=1, start=None):
    return {'id_paciente': patient, 'id_terapeuta': therapist, 'tipo_cita': 'INTRODUCTORIA',
            'fecha_hora_inicio': (start or next_start()).isoformat(), 'modalidad': 'PRESENCIAL'}


async def test_introduction_without_fake_plan_and_independent_children(clinical):
    clients, factory = clinical
    parent = clients['p90001']
    first, second = await child(parent), await child(parent)
    await publish(clients['t90001'])
    response = await parent.post('/api/v1/citas', json=intro(first))
    assert response.status_code == 201, response.text
    assert response.json()['estado_reserva'] == 'CONFIRMADA'
    assert response.json()['id_tratamiento'] is None
    assert datetime.fromisoformat(response.json()['fecha_hora_fin']) - datetime.fromisoformat(response.json()['fecha_hora_inicio']) == timedelta(minutes=45)
    assert (await parent.get(f'/api/v1/pacientes/{first}/tratamientos')).json() == []
    assert (await parent.get(f'/api/v1/pacientes/{first}/recorrido')).json()['introduccion_pendiente'] == response.json()['id_reserva']
    assert (await parent.get(f'/api/v1/pacientes/{second}/recorrido')).json()['introduccion_pendiente'] is None
    assert (await parent.post('/api/v1/citas', json=intro(first, start=next_start()+timedelta(hours=1)))).status_code == 409
    assert (await parent.post('/api/v1/citas', json=intro(second, start=next_start()+timedelta(hours=1)))).status_code == 201
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(Reserva)) == 2


async def test_publication_persistence_and_permissions(clinical):
    clients, factory = clinical
    for code in ['p90001', 't90002']:
        assert (await clients[code].put('/api/v1/terapeutas/1/disponibilidad', json={'turnos': []})).status_code == 403
    await publish(clients['t90001'])
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(TurnoSemanal)) == 60
    assert len((await clients['p90001'].get('/api/v1/terapeutas/1/disponibilidad')).json()['turnos']) == 60
    assert (await clients['t90001'].put('/api/v1/terapeutas/1/disponibilidad', json={'turnos': [{'dia': 6, 'hora': 8}]})).status_code == 422
    assert (await clients['t90001'].put('/api/v1/terapeutas/1/disponibilidad', json={'turnos': [{'dia': 0, 'hora': 8}]*2})).status_code == 422
    assert len((await clients['p90001'].get('/api/v1/terapeutas')).json()) == 2


async def test_slots_blocked_busy_and_exact_hour(clinical):
    clients, _ = clinical
    parent = clients['p90001']
    key = await child(parent)
    start = next_start()
    assert (await parent.post('/api/v1/citas', json=intro(key))).status_code == 409
    await publish(clients['t90001'], blocks=[{'inicio': start.isoformat(), 'fin': (start+timedelta(hours=1)).isoformat()}])
    assert (await parent.post('/api/v1/citas', json=intro(key))).status_code == 409
    date = start.date().isoformat()
    slots = (await parent.get(f'/api/v1/terapeutas/1/turnos?fecha={date}')).json()
    assert [s for s in slots if datetime.fromisoformat(s['inicio']).hour == 9][0]['motivo'] == 'Bloqueado'
    assert (await parent.post('/api/v1/citas', json=intro(key, start=start+timedelta(minutes=5)))).status_code == 422
    assert (await parent.post('/api/v1/citas', json={**intro(key), 'fecha_hora_fin': (start+timedelta(hours=1)).isoformat()})).status_code == 422
    await publish(clients['t90001'])
    assert (await parent.post('/api/v1/citas', json=intro(key))).status_code == 201
    slots = (await parent.get(f'/api/v1/terapeutas/1/turnos?fecha={date}')).json()
    assert [s for s in slots if datetime.fromisoformat(s['inicio']).hour == 9][0]['motivo'] == 'Ocupado'
    assert (await parent.get('/api/v1/terapeutas/1/turnos?fecha=2000-01-01')).status_code == 422


async def test_two_families_compete_for_one_slot(clinical):
    clients, _ = clinical
    one, two = await child(clients['p90001']), await child(clients['p90002'])
    await publish(clients['t90001'])
    results = await asyncio.gather(clients['p90001'].post('/api/v1/citas', json=intro(one)),
                                  clients['p90002'].post('/api/v1/citas', json=intro(two)))
    assert sorted(r.status_code for r in results) == [201, 409]


async def test_introduction_gate_requires_attendance_report_and_plan(clinical):
    clients, factory = clinical
    patient, appointment, session = await session_journey(clients)
    key = patient['id_paciente']
    parent, therapist = clients['p90001'], clients['t90001']
    plans = (await parent.get(f'/api/v1/pacientes/{key}/tratamientos')).json()
    therapy = {**intro(key, start=next_start()+timedelta(hours=1)), 'tipo_cita': 'TERAPIA', 'id_tratamiento': plans[0]['id_tratamiento']}
    assert (await parent.post('/api/v1/citas', json=therapy)).status_code == 409
    await appointment_due(factory, appointment)
    assert (await therapist.post(f"/api/v1/sesiones/{session['id_sesion']}/iniciar")).status_code == 200
    assert (await therapist.post(f"/api/v1/sesiones/{session['id_sesion']}/cerrar", json={'asistencia': 'ASISTIO'})).status_code == 200
    assert (await parent.get(f'/api/v1/pacientes/{key}/recorrido')).json()['terapia_habilitada'] is False
    assert (await therapist.put(f"/api/v1/sesiones/{session['id_sesion']}/reporte", json={'objetivos_trabajados': 'Atención sintética'})).status_code == 200
    assert (await parent.get(f'/api/v1/pacientes/{key}/recorrido')).json()['terapia_habilitada'] is False
    plan = await therapist.post(f"/api/v1/sesiones/{session['id_sesion']}/plan", json={
        'nombre_tratamiento': 'Lenguaje sintético', 'area': 'LENGUAJE',
        'mundos_asignados': ['LENGUAJE'], 'sesiones_recomendadas': 4})
    assert plan.status_code == 201, plan.text
    therapy['id_tratamiento'] = plan.json()['id_tratamiento']
    assert (await parent.get(f'/api/v1/pacientes/{key}/recorrido')).json()['terapia_habilitada'] is True
    assert (await parent.post('/api/v1/citas', json=therapy)).status_code == 201
    assert (await clients['p90002'].get(f'/api/v1/pacientes/{key}/recorrido')).status_code == 404

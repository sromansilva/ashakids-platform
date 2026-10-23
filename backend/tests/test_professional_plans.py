"""Nuevo recorrido sin plan previo; permisos, versiones y persistencia SQL local."""
import asyncio
import httpx
from sqlalchemy import select
from app.main import app
from app.models.clinica import Tratamiento
from tests.clinical_helpers import appointment_due
from tests.test_new_agenda import child, publish, intro, next_start
from tests.conftest import TEST_PASSWORD

PLAN = {'nombre_tratamiento': 'Plan sintético de lenguaje', 'area': 'LENGUAJE',
        'mundos_asignados': ['LENGUAJE', 'HABLA'], 'sesiones_recomendadas': 4,
        'descripcion': 'Práctica familiar de demostración.'}


async def attended(clients, factory, appointment, code='t90001'):
    professional = clients[code]
    response = await professional.post('/api/v1/sesiones', json={'id_reserva': appointment['id_reserva']})
    assert response.status_code == 201, response.text
    key = response.json()['id_sesion']
    await appointment_due(factory, appointment)
    assert (await professional.post(f'/api/v1/sesiones/{key}/iniciar')).status_code == 200
    assert (await professional.put(f'/api/v1/sesiones/{key}/reporte', json={
        'objetivos_trabajados': 'Reporte sintético del profesional', 'proximos_pasos': 'Continuidad'})).status_code == 200
    assert (await professional.post(f'/api/v1/sesiones/{key}/cerrar', json={'asistencia': 'ASISTIO'})).status_code == 200
    return key


async def initial(clinical):
    clients, factory = clinical
    patient = await child(clients['p90001'])
    await publish(clients['t90001'])
    response = await clients['p90001'].post('/api/v1/citas', json=intro(patient))
    assert response.status_code == 201, response.text
    key = await attended(clients, factory, response.json())
    return patient, key


async def test_real_plan_second_professional_history_and_versions(clinical):
    clients, factory = clinical
    patient, key = await initial(clinical)
    parent, first, second = clients['p90001'], clients['t90001'], clients['t90002']
    assert (await parent.get(f'/api/v1/pacientes/{patient}/tratamientos')).json() == []
    assert (await second.get(f'/api/v1/sesiones/{key}/reporte')).status_code == 404
    response = await first.post(f'/api/v1/sesiones/{key}/plan', json=PLAN)
    assert response.status_code == 201, response.text
    plan = response.json()
    assert plan['id_sesion_origen'] == key and plan['id_terapeuta'] == 1
    assert (await first.post(f'/api/v1/sesiones/{key}/plan', json=PLAN)).status_code == 409
    assert (await parent.get(f'/api/v1/pacientes/{patient}/recorrido')).json()['terapia_habilitada']
    await publish(second, 2)
    appointment = await parent.post('/api/v1/citas', json={**intro(patient, therapist=2),
        'tipo_cita': 'TERAPIA', 'id_tratamiento': plan['id_tratamiento']})
    assert appointment.status_code == 201, appointment.text
    assert (await second.get(f'/api/v1/pacientes/{patient}')).status_code == 200
    history = await second.get(f'/api/v1/sesiones?paciente={patient}&contexto=true')
    assert [s['id_sesion'] for s in history.json()] == [key]
    assert history.json()[0]['puede_editar'] is False
    assert (await second.get(f'/api/v1/sesiones/{key}/reporte')).status_code == 200
    pdf = await second.get(f'/api/v1/sesiones/{key}/reporte/pdf')
    assert pdf.status_code == 200 and pdf.content.startswith(b'%PDF')
    assert (await second.put(f'/api/v1/sesiones/{key}/reporte', json={})).status_code in {403,404}
    assert (await second.post(f'/api/v1/sesiones/{key}/plan', json=PLAN)).status_code == 403
    assert len((await second.get('/api/v1/sesiones')).json()) == 0
    next_key = await attended(clients, factory, appointment.json(), 't90002')
    updated = await second.post(f'/api/v1/sesiones/{next_key}/plan', json={**PLAN, 'area': 'HABLA', 'mundos_asignados': ['HABLA']})
    assert updated.status_code == 201, updated.text
    plans = (await parent.get(f'/api/v1/pacientes/{patient}/tratamientos')).json()
    assert len(plans) == 2 and [p['estado_tratamiento'] for p in plans] == ['FINALIZADO','ACTIVO']
    assert plans[0]['mundos_asignados'] == ['LENGUAJE','HABLA']
    assert plans[1]['id_terapeuta'] == 2
    assert (await first.get(f'/api/v1/sesiones/{next_key}/reporte')).status_code == 200
    assert (await clients['p90002'].get(f'/api/v1/sesiones/{key}/reporte/pdf')).status_code == 404
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as fresh:
        assert (await fresh.post('/api/v1/auth/login', json={'codigo_usuario': 'p90001', 'password': TEST_PASSWORD})).status_code == 200
        assert len((await fresh.get(f'/api/v1/pacientes/{patient}/tratamientos')).json()) == 2
        assert (await fresh.get(f'/api/v1/sesiones/{key}/reporte')).json()['objetivos_trabajados']
    async with factory() as db:
        assert len((await db.scalars(select(Tratamiento))).all()) == 2


async def test_authorization_revoked_when_future_booking_cancelled(clinical):
    clients, _ = clinical
    patient, key = await initial(clinical)
    await publish(clients['t90002'], 2)
    second_intro_child = await child(clients['p90001'])
    booking = await clients['p90001'].post('/api/v1/citas', json=intro(second_intro_child, therapist=2))
    appointment = booking.json()
    assert (await clients['t90002'].get(f'/api/v1/pacientes/{second_intro_child}')).status_code == 200
    assert (await clients['t90002'].get(f'/api/v1/pacientes/{patient}')).status_code == 404
    assert (await clients['p90001'].patch(f"/api/v1/citas/{appointment['id_reserva']}/estado", json={'estado_reserva':'CANCELADA'})).status_code == 200
    assert (await clients['t90002'].get(f'/api/v1/pacientes/{second_intro_child}')).status_code == 404
    assert (await clients['t90002'].get('/api/v1/sesiones?contexto=true')).status_code == 422


async def test_plan_guardrails_and_concurrent_publication(clinical):
    clients, factory = clinical
    patient = await child(clients['p90001'])
    await publish(clients['t90001'])
    appointment = (await clients['p90001'].post('/api/v1/citas', json=intro(patient))).json()
    session = (await clients['t90001'].post('/api/v1/sesiones', json={'id_reserva':appointment['id_reserva']})).json()
    key = session['id_sesion']
    path = f'/api/v1/sesiones/{key}/plan'
    assert (await clients['t90001'].post(path,json=PLAN)).status_code == 409
    for code in ['p90001','a90001']:
        assert (await clients[code].post(path,json=PLAN)).status_code == 403
    assert (await clients['a90001'].post('/api/v1/tratamientos', json={
        'id_paciente':patient,'id_terapeuta':1,'nombre_tratamiento':'No prescribir'})).status_code == 410
    await appointment_due(factory, appointment)
    assert (await clients['t90001'].post(f'/api/v1/sesiones/{key}/iniciar')).status_code == 200
    assert (await clients['t90001'].post(path,json=PLAN)).status_code == 409
    assert (await clients['t90001'].put(f'/api/v1/sesiones/{key}/reporte',json={'objetivos_trabajados':'Prueba'})).status_code == 200
    for change in [{'mundos_asignados':[]}, {'mundos_asignados':['HABLA','HABLA']}, {'area':'OTRA'}, {'sesiones_recomendadas':0}]:
        assert (await clients['t90001'].post(path,json={**PLAN,**change})).status_code == 422
    results = await asyncio.gather(*[clients['t90001'].post(path,json=PLAN) for _ in range(2)])
    assert sorted(r.status_code for r in results) == [201,409]

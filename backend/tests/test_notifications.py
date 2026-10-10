"""Notificaciones/preferencias con SQL aislado, sin datos ni servicios externos."""
import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy import select, update
from app.models.clinica import Reserva, Sesion
from app.models.notificaciones import Notificacion
from app.services.notificaciones import recordatorios
from tests.clinical_helpers import journey

PATH = '/api/v1/notificaciones'


async def inbox(client, **params):
    result = await client.get(PATH, params=params)
    assert result.status_code == 200, result.text
    return result.json()


async def test_preferences_persist_strict_and_are_owned(clinical):
    clients, _ = clinical
    one, two = clients['t90001'], clients['t90002']
    data = (await one.get(PATH+'/preferencias')).json()
    assert data == dict(nueva_cita=True, cancelacion=True, reprogramacion=True, recordatorio=True, mensajes=True)
    data.update(nueva_cita=False, mensajes=False)
    assert (await one.put(PATH+'/preferencias',json=data)).status_code == 200
    assert (await one.get(PATH+'/preferencias')).json() == data
    assert (await two.get(PATH+'/preferencias')).json()['nueva_cita'] is True
    for code in ['a90001','p90001','p90002']:
        assert (await clients[code].get(PATH)).status_code == 403
        assert (await clients[code].put(PATH+'/preferencias',json=data)).status_code == 403
    for extra in [{'id_usuario':5},{'nueva_cita':'false'},{'marketing':True}]:
        assert (await one.put(PATH+'/preferencias',json={**data,**extra})).status_code == 422


async def test_reservation_changes_read_status_pagination_and_isolation(clinical):
    clients, _ = clinical
    _, _, cita, payload = await journey(clients)
    parent, therapist, other = clients['p90001'], clients['t90001'], clients['t90002']
    first = await inbox(therapist)
    item = first['items'][0]
    assert first['sin_leer'] == first['total'] == 1
    assert item['tipo'] == 'NUEVA_CITA' and item['id_reserva'] == cita['id_reserva']
    assert 'Prueba Sintética reservó' in item['texto'] and '08:00' in item['texto']
    assert (await inbox(other))['total'] == 0
    assert (await other.patch(f"{PATH}/{item['id_notificacion']}/leida")).status_code == 404
    # Colisión e idéntica reprogramación no generan avisos duplicados.
    assert (await parent.post('/api/v1/citas',json=payload)).status_code == 409
    same = {'fecha_hora_inicio':cita['fecha_hora_inicio'],'modalidad':'VIRTUAL'}
    assert (await parent.put(f"/api/v1/citas/{cita['id_reserva']}",json=same)).status_code == 200
    assert (await inbox(therapist))['total'] == 1
    changed = {**same,'fecha_hora_inicio':(datetime.fromisoformat(cita['fecha_hora_inicio'])+timedelta(hours=1)).isoformat()}
    assert (await parent.put(f"/api/v1/citas/{cita['id_reserva']}",json=changed)).status_code == 200
    assert (await parent.patch(f"/api/v1/citas/{cita['id_reserva']}/estado",json={'estado_reserva':'CANCELADA'})).status_code == 200
    page = await inbox(therapist,limit=1,offset=1)
    assert page['total'] == page['sin_leer'] == 3 and len(page['items']) == 1
    assert page['items'][0]['tipo'] == 'REPROGRAMACION'
    seen = await therapist.patch(f"{PATH}/{item['id_notificacion']}/leida")
    again = await therapist.patch(f"{PATH}/{item['id_notificacion']}/leida")
    assert seen.json()['leida_en'] == again.json()['leida_en'] and seen.json()['leida_en'] is not None
    assert (await inbox(therapist,solo_sin_leer=True))['total'] == 2
    assert (await therapist.post(PATH+'/leidas')).status_code == 204
    assert (await inbox(therapist))['sin_leer'] == 0


async def test_disabled_preferences_affect_only_future_notifications(clinical):
    clients, _ = clinical
    therapist = clients['t90001']
    config = (await therapist.get(PATH+'/preferencias')).json()
    config.update(nueva_cita=False, cancelacion=False)
    await therapist.put(PATH+'/preferencias',json=config)
    _, _, cita, _ = await journey(clients)
    assert (await inbox(therapist))['total'] == 0
    start = datetime.fromisoformat(cita['fecha_hora_inicio'])+timedelta(hours=1)
    change = {'fecha_hora_inicio':start.isoformat(),'modalidad':'VIRTUAL'}
    await clients['p90001'].put(f"/api/v1/citas/{cita['id_reserva']}",json=change)
    assert (await inbox(therapist))['total'] == 1
    config['reprogramacion'] = False
    await therapist.put(PATH+'/preferencias',json=config)
    change['fecha_hora_inicio'] = (start+timedelta(hours=1)).isoformat()
    await clients['p90001'].put(f"/api/v1/citas/{cita['id_reserva']}",json=change)
    await clients['p90001'].patch(f"/api/v1/citas/{cita['id_reserva']}/estado",json={'estado_reserva':'CANCELADA'})
    assert (await inbox(therapist))['total'] == 1


async def test_event_and_reservation_rollback_together(clinical, monkeypatch):
    from app.services import citas as service
    clients, _ = clinical
    _, _, cita, _ = await journey(clients)
    original = service.avisar_cita
    async def fail_after_event(*args,**kwargs):
        await original(*args,**kwargs)
        raise HTTPException(500,'Fallo sintético antes del commit')
    monkeypatch.setattr(service,'avisar_cita',fail_after_event)
    response = await clients['p90001'].put(f"/api/v1/citas/{cita['id_reserva']}",json={
        'fecha_hora_inicio':(datetime.fromisoformat(cita['fecha_hora_inicio'])+timedelta(hours=1)).isoformat(),'modalidad':'VIRTUAL'})
    assert response.status_code == 500
    persisted = await clients['p90001'].get(f"/api/v1/citas/{cita['id_reserva']}")
    assert datetime.fromisoformat(persisted.json()['fecha_hora_inicio']) == datetime.fromisoformat(cita['fecha_hora_inicio'])
    assert (await inbox(clients['t90001']))['total'] == 1


async def test_message_notification_uses_authorised_contact_and_preferences(clinical):
    clients, _ = clinical
    await journey(clients)
    parent, therapist = clients['p90001'], clients['t90001']
    response = await parent.post('/api/v1/conversaciones',json={'id_tutor':1,'id_terapeuta':1})
    assert response.status_code == 200, response.text
    key = response.json()['id_conversacion']
    response = await parent.post(f'/api/v1/conversaciones/{key}/mensajes',json={'texto_mensaje':'Contenido privado sintético'})
    assert response.status_code == 201, response.text
    item = (await inbox(therapist))['items'][0]
    assert item['tipo'] == 'MENSAJE' and item['id_conversacion'] == key and 'privado' not in item['texto']
    config = (await therapist.get(PATH+'/preferencias')).json()
    config['mensajes'] = False
    await therapist.put(PATH+'/preferencias',json=config)
    assert (await parent.post(f'/api/v1/conversaciones/{key}/mensajes',json={'texto_mensaje':'Otro mensaje sintético'})).status_code == 201
    assert (await inbox(therapist))['total'] == 2
    assert (await inbox(clients['t90002']))['total'] == 0


async def test_reminders_window_concurrency_reprogramming_and_suppression(clinical):
    clients, factory = clinical
    _, _, cita, _ = await journey(clients)
    scheduled = datetime.fromisoformat(cita['fecha_hora_inicio'])
    async def run(now):
        async with factory.begin() as db:
            await recordatorios(db,ahora=now)
    await run(scheduled-timedelta(minutes=31))
    assert (await inbox(clients['t90001']))['total'] == 1
    # Una sesión registrada PROGRAMADA todavía necesita aviso; concurrencia sin duplicados.
    assert (await clients['t90001'].post('/api/v1/sesiones',json={'id_reserva':cita['id_reserva']})).status_code == 201
    await asyncio.gather(run(scheduled-timedelta(minutes=30)),run(scheduled-timedelta(minutes=30)))
    result = await inbox(clients['t90001'])
    assert [item['tipo'] for item in result['items']].count('RECORDATORIO') == 1
    async with factory.begin() as db:
        await db.execute(update(Reserva).where(Reserva.id_reserva == cita['id_reserva']).values(fecha_hora_inicio=scheduled+timedelta(days=1),fecha_hora_fin=scheduled+timedelta(days=1,minutes=45)))
    config = (await clients['t90001'].get(PATH+'/preferencias')).json()
    config['recordatorio'] = False
    await clients['t90001'].put(PATH+'/preferencias',json=config)
    await run(scheduled+timedelta(days=1,minutes=-20))
    assert (await inbox(clients['t90001']))['total'] == 2
    config['recordatorio'] = True
    await clients['t90001'].put(PATH+'/preferencias',json=config)
    async with factory.begin() as db:
        await db.execute(update(Sesion).where(Sesion.id_reserva == cita['id_reserva']).values(estado_sesion='EN_CURSO'))
    await run(scheduled+timedelta(days=1,minutes=-20))
    assert (await inbox(clients['t90001']))['total'] == 2
    await run(scheduled+timedelta(days=2))
    async with factory() as db:
        assert len((await db.scalars(select(Notificacion))).all()) == 2

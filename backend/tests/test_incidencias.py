from uuid import uuid4
import asyncio
import httpx
import pytest
from pydantic import ValidationError
from app.main import app
from app.schemas.incidencias import IncidenciaCrear
from sqlalchemy import text


@pytest.mark.parametrize('overrides', [dict(titulo='   '), dict(descripcion='x'*601), dict(tipo='inventado'), dict(id_usuario=42)])
def test_invalid_report(overrides):
    with pytest.raises(ValidationError):
        IncidenciaCrear.model_validate(dict(envio_id=uuid4(), tipo='Otro', titulo='Problema', descripcion='Descripción') | overrides)


@pytest.mark.asyncio
async def test_incidents_require_login():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        assert (await client.get('/api/v1/admin/incidencias')).status_code == 401
        assert (await client.post('/api/v1/incidencias', json=dict(envio_id=str(uuid4()), tipo='Otro', titulo='Error', descripcion='Prueba'))).status_code == 401
        assert (await client.patch('/api/v1/admin/incidencias/1', json={'estado':'LEIDA'})).status_code == 401


@pytest.mark.asyncio
async def test_persistence_permissions_retry_and_states(clinical):
    clients, factory = clinical
    # clinical valida que la conexión sea local ashakids_test_* antes de cederla.
    async with factory.begin() as db:
        await db.execute(text('TRUNCATE incidencias RESTART IDENTITY'))
    parent, therapist, admin = (clients[c] for c in ('p90001','t90001','a90001'))
    body = dict(envio_id=str(uuid4()), tipo='Funcional', titulo='Guardar no responde', descripcion='Prueba sintética de soporte.')
    first, concurrent = await asyncio.gather(*(parent.post('/api/v1/incidencias', json=body) for _ in range(2)))
    assert first.status_code == 201, first.text
    report_id = first.json()['id_incidencia']
    assert concurrent.status_code == 201 and concurrent.json()['id_incidencia'] == report_id
    again = await parent.post('/api/v1/incidencias', json=body)
    assert again.json()['id_incidencia'] == report_id
    assert (await parent.post('/api/v1/incidencias', json=body | {'titulo':'Otro'})).status_code == 409
    assert (await therapist.post('/api/v1/incidencias', json=body)).status_code == 409
    assert (await admin.post('/api/v1/incidencias', json=body)).status_code == 403
    for user in (parent, therapist):
        assert (await user.get('/api/v1/admin/incidencias')).status_code == 403
        assert (await user.patch(f'/api/v1/admin/incidencias/{report_id}', json={'estado':'RESUELTA'})).status_code == 403
    assert (await therapist.post('/api/v1/incidencias', json=body | {'envio_id':str(uuid4()), 'tipo':'Paciente / Agenda'})).status_code == 201
    listing = (await admin.get('/api/v1/admin/incidencias')).json()
    assert listing['total'] == 2
    assert listing['items'][1]['descripcion'] == body['descripcion']
    assert listing['items'][1]['rol'] == 'PADRE'
    assert len((await admin.get('/api/v1/admin/incidencias?limit=1&offset=1')).json()['items']) == 1
    for state in ['LEIDA','RESUELTA']:
        result = await admin.patch(f'/api/v1/admin/incidencias/{report_id}', json={'estado':state})
        assert result.status_code == 200 and result.json()['estado'] == state
    assert (await admin.patch(f'/api/v1/admin/incidencias/{report_id}', json={'estado':'LEIDA'})).status_code == 409
    assert (await admin.patch('/api/v1/admin/incidencias/999999', json={'estado':'LEIDA'})).status_code == 404
    assert (await admin.get('/api/v1/admin/incidencias')).json()['items'][1]['estado'] == 'RESUELTA'

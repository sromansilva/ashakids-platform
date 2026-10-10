from tests.clinical_helpers import journey


async def test_meeting_owned_virtual_persisted_and_safe_url(clinical):
    clients, _ = clinical
    _, _, appointment, _ = await journey(clients)
    key = appointment['id_reserva']
    path = f'/api/v1/citas/{key}/reunion'
    link = 'https://zoom.us/j/12345678901'  # Solo formato sintético; nunca abrir reunión.
    for code in ['p90001','t90002']:
        assert (await clients[code].put(path,json={'zoom_join_url':link})).status_code in {403,404}
    for invalid in ['http://zoom.us/j/1','https://zoom.us.evil.example/j/1','javascript:alert(1)','https://secret@zoom.us/j/1','https://zoom.us:8443/j/1']:
        assert (await clients['t90001'].put(path,json={'zoom_join_url':invalid})).status_code == 422
    response = await clients['t90001'].put(path,json={'zoom_join_url':link})
    assert response.status_code == 200, response.text
    view = await clients['p90001'].get(f'/api/v1/citas/{key}')
    assert view.json()['zoom_join_url'] == link and view.json()['puede_editar'] is False
    assert (await clients['t90001'].get(f'/api/v1/citas/{key}')).json()['puede_editar']
    assert (await clients['t90001'].put(path,json={'zoom_join_url':None})).json()['zoom_join_url'] is None
    assert (await clients['p90001'].patch(f'/api/v1/citas/{key}/estado',json={'estado_reserva':'CANCELADA'})).status_code == 200
    assert (await clients['t90001'].put(path,json={'zoom_join_url':link})).status_code == 409


async def test_presential_has_no_virtual_meeting(clinical):
    clients, _ = clinical
    _, _, appointment, _ = await journey(clients)
    key = appointment['id_reserva']
    assert (await clients['p90001'].put(f'/api/v1/citas/{key}',json={
        'fecha_hora_inicio':appointment['fecha_hora_inicio'],'modalidad':'PRESENCIAL'})).status_code == 200
    assert (await clients['t90001'].put(f'/api/v1/citas/{key}/reunion',json={
        'zoom_join_url':'https://zoom.us/j/12345678901'})).status_code == 409

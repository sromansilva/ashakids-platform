"""Adjuntos sobre PostgreSQL local descartable; sin datos compartidos."""
from uuid import uuid4
import pytest
from sqlalchemy import select, func
from app.models.mensajeria import MensajeAdjunto, Conversacion
from tests.test_learning_games import prepare


@pytest.mark.asyncio
async def test_roundtrip_access_retry_and_validation(clinical):
    clients, factory, _ = await prepare(clinical)
    parent, professional, other = clients['p90001'], clients['t90001'], clients['p90002']
    opened = await parent.post('/api/v1/conversaciones', json={'id_tutor': 1, 'id_terapeuta': 1})
    assert opened.status_code == 200
    chat = opened.json()['id_conversacion']
    path = f'/api/v1/conversaciones/{chat}/mensajes/adjunto'
    data = {'texto_mensaje': 'Archivo sintético', 'clave_envio': str(uuid4())}
    raw = 'Nota sintética persistente'.encode()
    file = {'archivo': ('nota.txt', raw, 'text/plain')}
    sent = await parent.post(path, data=data, files=file)
    assert sent.status_code == 201, sent.text
    item = sent.json(); attachment = item['adjuntos'][0]['id_adjunto']
    download = f'/api/v1/conversaciones/{chat}/adjuntos/{attachment}'
    for client in [parent, professional]:
        result = await client.get(download)
        assert result.status_code == 200 and result.content == raw
        assert 'attachment' in result.headers['content-disposition']
        assert 'no-store' in result.headers['cache-control']
    assert (await other.get(download)).status_code == 404
    assert (await clients['a90001'].get(download)).status_code == 403
    assert (await parent.get(f'/api/v1/conversaciones/{chat+99}/adjuntos/{attachment}')).status_code == 404
    repeat = await parent.post(path, data=data, files=file)
    assert repeat.status_code == 201 and repeat.json()['id_mensaje'] == item['id_mensaje']
    conflict = await parent.post(path, data=data, files={'archivo': ('nota.txt', b'Otra nota', 'text/plain')})
    assert conflict.status_code == 409
    history = (await professional.get(f'/api/v1/conversaciones/{chat}/mensajes')).json()['items']
    assert len(history) == 1 and history[0]['adjuntos'][0]['id_adjunto'] == attachment
    assert 'contenido' not in str(history) and 'url_archivo' not in str(history)
    for name, content, status in [('fake.png', b'No es imagen', 415), ('script.svg', b'<svg/>', 415),
            ('empty.txt', b'', 422), ('large.txt', b'x'*(10*1024*1024+1), 413),
            ('body.txt', b'x'*(11*1024*1024), 413)]:
        result = await parent.post(path, data={'clave_envio': str(uuid4())}, files={'archivo': (name, content, 'application/octet-stream')})
        assert result.status_code == status, result.text
    assert (await other.post(path, data={'clave_envio': str(uuid4())}, files=file)).status_code == 404
    async with factory() as db:
        assert await db.scalar(select(func.count()).select_from(MensajeAdjunto)) == 1


@pytest.mark.asyncio
async def test_only_attachment_media_types_and_closed_chat(clinical):
    clients, factory, _ = await prepare(clinical)
    parent = clients['p90001']
    chat = (await parent.post('/api/v1/conversaciones', json={'id_tutor': 1, 'id_terapeuta': 1})).json()['id_conversacion']
    path = f'/api/v1/conversaciones/{chat}/mensajes/adjunto'
    for name, raw, mime in [('imagen.png', b'\x89PNG\r\n\x1a\nrest', 'image/png'),
            ('audio.wav', b'RIFF1234WAVErest', 'audio/wav'), ('video.mp4', b'0000ftypisomrest', 'video/mp4'),
            ('documento.pdf', b'%PDF-1.7\nrest', 'application/pdf')]:
        result = await parent.post(path, data={'clave_envio': str(uuid4())}, files={'archivo': (name, raw, 'text/html')})
        assert result.status_code == 201, result.text
        assert result.json()['texto_mensaje'] is None
        attachment = result.json()['adjuntos'][0]['id_adjunto']
        downloaded = await parent.get(f'/api/v1/conversaciones/{chat}/adjuntos/{attachment}')
        assert downloaded.headers['content-type'].split(';')[0] == mime
    async with factory.begin() as db:
        row = await db.get(Conversacion, chat); row.estado = 'ARCHIVADA'
    result = await parent.post(path, data={'clave_envio': str(uuid4())}, files={'archivo': ('nota.txt', b'No enviado', 'text/plain')})
    assert result.status_code == 409
    assert len((await parent.get(f'/api/v1/conversaciones/{chat}/mensajes')).json()['items']) == 4

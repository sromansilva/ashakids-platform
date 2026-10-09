"""Unidades de mensajería: dependencias simuladas, sin conexión/limpieza de BD."""
from datetime import datetime, timezone
from types import SimpleNamespace as Row
from unittest.mock import AsyncMock, MagicMock
import httpx
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.dialects import postgresql
from app.main import app
from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.mensajeria import MensajeCrear, ConversacionCrear
from app.services import mensajeria as service

NOW = datetime.now(timezone.utc)
IDENTITY = (Row(id_usuario=7), ['PADRE'])
VIEW = dict(id_conversacion=12, id_tutor=3, id_terapeuta=4, estado='ACTIVA', ultima_actividad=NOW,
            puede_enviar=True, tutor_nombre='Tutor sintético', terapeuta_nombre='Profesional sintético',
            id_usuario_tutor=7, id_usuario_terapeuta=8)


@pytest.mark.parametrize('text', ['', '  ', '\n\t', 'x'*4001, 'hola\x00'])
def test_message_validation(text):
    with pytest.raises(ValidationError):
        MensajeCrear(texto_mensaje=text)


@pytest.mark.parametrize('field,value', [('id_usuario_emisor', 8), ('leido', True), ('fecha_envio', '2026-10-09')])
def test_sender_and_server_fields_cannot_be_forged(field, value):
    with pytest.raises(ValidationError):
        MensajeCrear(**{'texto_mensaje': 'Mensaje', field: value})


def test_unicode_and_markup_are_plain_text():
    assert MensajeCrear(texto_mensaje='  Niño 🎈 <script>texto</script>\nR  ').texto_mensaje == 'Niño 🎈 <script>texto</script>\nR'


def test_scope_is_participant_specific_and_admin_is_not_a_participant():
    with pytest.raises(HTTPException) as error:
        service.visibles((Row(id_usuario=1), ['ADMIN']))
    assert error.value.status_code == 403
    sql = str(service.visibles(IDENTITY).compile(dialect=postgresql.dialect(), compile_kwargs={'literal_binds': True}))
    assert 'tutores.id_usuario = 7' in sql
    assert 'terapeutas.id_usuario = 7' not in sql
    therapist = str(service.visibles((Row(id_usuario=8), ['TERAPEUTA'])).compile(compile_kwargs={'literal_binds': True}))
    assert 'terapeutas.id_usuario = 8' in therapist


@pytest.fixture
def db():
    previous = app.dependency_overrides.copy()
    mock = AsyncMock(); mock.add = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock
    app.dependency_overrides[get_current_user] = lambda: IDENTITY
    yield mock
    app.dependency_overrides.clear(); app.dependency_overrides.update(previous)


async def test_authorise_before_loading_messages(db, monkeypatch):
    monkeypatch.setattr(service, 'visible', AsyncMock(side_effect=HTTPException(404, 'Conversación no encontrada.')))
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/conversaciones/12/mensajes')
    assert response.status_code == 404
    db.scalars.assert_not_awaited()


async def test_message_cursor_fetches_bounded_previous_ids(db, monkeypatch):
    monkeypatch.setattr(service, 'visible', AsyncMock(return_value=Row(**VIEW)))
    messages = [Row(id_mensaje=x, id_conversacion=12, id_usuario_emisor=7, texto_mensaje='Sintético', fecha_envio=NOW) for x in [9,8,7]]
    result = MagicMock(); result.all.return_value = messages; db.scalars.return_value = result
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/conversaciones/12/mensajes?limit=2&before_id=10')
    assert response.status_code == 200
    assert [item['id_mensaje'] for item in response.json()['items']] == [9,8]
    assert response.json()['next_before_id'] == 8
    sql = str(db.scalars.call_args.args[0].compile(compile_kwargs={'literal_binds': True}))
    assert 'mensajes.id_mensaje < 10' in sql and 'LIMIT 3' in sql


async def test_contact_list_returns_complete_rows_not_first_scalar(db):
    db.scalar.return_value = 1
    result = MagicMock(); result.all.return_value = [Row(**{key: VIEW[key] for key in ['id_tutor','id_terapeuta','tutor_nombre','terapeuta_nombre']})]
    db.execute.return_value = result
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/conversaciones/contactos')
    assert response.status_code == 200 and response.headers['x-total-count'] == '1'
    assert response.json()[0]['terapeuta_nombre'] == VIEW['terapeuta_nombre']


async def test_open_existing_pair_reuses_history(db):
    existing = Row(**VIEW)
    db.scalar.side_effect = [Row(id_tutor=3), Row(id_tutor=3), existing]
    assert await service.abrir(db, IDENTITY, ConversacionCrear(id_tutor=3, id_terapeuta=4)) is existing
    db.add.assert_not_called()
    sql = str(db.scalar.call_args_list[1].args[0].compile())
    assert 'FOR UPDATE' in sql


async def test_open_cannot_use_an_unassigned_contact(db):
    db.scalar.return_value = None
    with pytest.raises(HTTPException) as error:
        await service.abrir(db, IDENTITY, ConversacionCrear(id_tutor=99, id_terapeuta=4))
    assert error.value.status_code == 403
    db.add.assert_not_called()


@pytest.mark.parametrize('estado,archived,active,status', [('ARCHIVADA', None, True,409), ('ACTIVA', NOW, True,409), ('ACTIVA', None, False,403)])
async def test_closed_or_unassigned_chat_blocks_writes(db, monkeypatch, estado, archived, active, status):
    monkeypatch.setattr(service, 'visible', AsyncMock(return_value=Row(**{**VIEW,'estado':estado,'fecha_archivado':archived})))
    db.scalar.return_value = Row(id_tutor=3) if active else None
    with pytest.raises(HTTPException) as error:
        await service.enviar(db, IDENTITY, 12, MensajeCrear(texto_mensaje='Mensaje'))
    assert error.value.status_code == status
    db.add.assert_not_called()


async def test_send_uses_authenticated_sender_and_locks_conversation(db, monkeypatch):
    visible = AsyncMock(return_value=Row(**VIEW, fecha_archivado=None))
    monkeypatch.setattr(service, 'visible', visible); db.scalar.return_value = Row(id_tutor=3)
    row = await service.enviar(db, IDENTITY, 12, MensajeCrear(texto_mensaje='Niño 🎈'))
    assert row.id_usuario_emisor == 7 and row.id_conversacion == 12 and row.leido is False
    visible.assert_awaited_once_with(db, IDENTITY, 12, lock=True)
    db.add.assert_called_once_with(row)
    db.flush.assert_awaited_once()


async def test_anonymous_requires_auth(db):
    app.dependency_overrides.pop(get_current_user)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/conversaciones')
    assert response.status_code == 401


@pytest.mark.parametrize('path', ['/12/mensajes?limit=101', '/12/mensajes?before_id=0', '/12/mensajes?before_id=2147483648', '/0/mensajes', '/2147483648/mensajes'])
async def test_integer_bounds_reject_before_resource_query(db, path):
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/conversaciones'+path)
    assert response.status_code == 422
    db.scalar.assert_not_awaited()

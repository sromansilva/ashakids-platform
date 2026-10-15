"""Contrato y permisos sin PostgreSQL ni datos reales."""
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
import httpx
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.dialects import postgresql
from app.main import app
from app.schemas.valoraciones import ValoracionCrear
from app.models.valoraciones import Valoracion
from app.services import valoraciones as service
from app.services.citas import citas_visibles


@pytest.mark.parametrize('data', [{'calificacion': 0}, {'calificacion': 6}, {'calificacion': True}, {'calificacion': 4.5}, {'calificacion': '5'}, {'calificacion': 5, 'comentario': 'x'*1001}, {'calificacion': 5, 'id_usuario': 99}])
def test_invalid_contract(data):
    with pytest.raises(ValidationError):
        ValoracionCrear.model_validate(data)


def test_comment_is_optional_and_trimmed():
    assert ValoracionCrear(calificacion=5, comentario='  ').comentario is None
    assert ValoracionCrear(calificacion=3, comentario=' bien ').comentario == 'bien'


def fixture(monkeypatch, *, role='PADRE', state='FINALIZADA', attendance='ASISTIO', family=True, previous=None):
    identity = (SimpleNamespace(id_usuario=7), [role])
    session = SimpleNamespace(id_sesion=3, id_reserva=4, estado_sesion=state, asistencia=attendance)
    patient = SimpleNamespace(id_paciente=5, id_tutor=2)
    appointment = SimpleNamespace(id_reserva=4, id_paciente=5)
    obtain = AsyncMock(side_effect=[session, patient])
    monkeypatch.setattr(service, 'obtener', obtain)
    monkeypatch.setattr(service, 'cita_visible', AsyncMock(return_value=appointment))
    monkeypatch.setattr(service, 'es_familia', AsyncMock(return_value=family))
    db = SimpleNamespace(scalar=AsyncMock(side_effect=['valoraciones_sesion', previous]), add=MagicMock(), flush=AsyncMock())
    return db, identity, obtain


@pytest.mark.asyncio
async def test_parent_can_rate_an_old_attended_session(monkeypatch):
    db, identity, obtain = fixture(monkeypatch)
    row = await service.crear(db, identity, 3, ValoracionCrear(calificacion=5, comentario='Gracias'))
    assert row.id_usuario == 7 and row.id_sesion == 3 and row.calificacion == 5
    obtain.assert_any_await(db, service.Sesion, 3, lock=True)
    db.add.assert_called_once_with(row)
    db.flush.assert_awaited_once()


@pytest.mark.parametrize('state,attendance', [('PROGRAMADA', None), ('EN_CURSO', 'ASISTIO'), ('FINALIZADA', 'NO_ASISTIO'), ('FINALIZADA', None)])
@pytest.mark.asyncio
async def test_rejects_unattended_or_unfinished(monkeypatch, state, attendance):
    db, identity, _ = fixture(monkeypatch, state=state, attendance=attendance)
    with pytest.raises(HTTPException) as caught:
        await service.crear(db, identity, 3, ValoracionCrear(calificacion=5))
    assert caught.value.status_code == 409
    db.add.assert_not_called()


@pytest.mark.parametrize('role', ['ADMIN', 'TERAPEUTA'])
@pytest.mark.asyncio
async def test_professionals_cannot_write_reviews(monkeypatch, role):
    db, identity, obtain = fixture(monkeypatch, role=role)
    with pytest.raises(HTTPException) as caught:
        await service.crear(db, identity, 3, ValoracionCrear(calificacion=5))
    assert caught.value.status_code == 403
    obtain.assert_not_awaited()


@pytest.mark.asyncio
async def test_other_family_does_not_write(monkeypatch):
    db, identity, _ = fixture(monkeypatch, family=False)
    with pytest.raises(HTTPException) as caught:
        await service.crear(db, identity, 3, ValoracionCrear(calificacion=5))
    assert caught.value.status_code == 404
    db.add.assert_not_called()


@pytest.mark.asyncio
async def test_session_read_does_not_use_extended_patient_context(monkeypatch):
    db, identity, _ = fixture(monkeypatch)
    assert await service.leer(db, identity, 3) is None
    service.cita_visible.assert_awaited_once_with(db, identity, 4)


@pytest.mark.asyncio
async def test_identical_retry_is_idempotent(monkeypatch):
    previous = SimpleNamespace(id_usuario=7, calificacion=4, comentario='Gracias')
    db, identity, _ = fixture(monkeypatch, previous=previous)
    assert await service.crear(db, identity, 3, ValoracionCrear(calificacion=4, comentario='Gracias')) is previous
    db.add.assert_not_called()


@pytest.mark.parametrize('user,rating,comment', [(8,4,'Gracias'), (7,5,'Gracias'), (7,4,'Cambio')])
@pytest.mark.asyncio
async def test_existing_review_cannot_be_overwritten(monkeypatch, user, rating, comment):
    db, identity, _ = fixture(monkeypatch, previous=SimpleNamespace(id_usuario=user, calificacion=rating, comentario=comment))
    with pytest.raises(HTTPException) as caught:
        await service.crear(db, identity, 3, ValoracionCrear(calificacion=4, comentario='Gracias'))
    assert caught.value.status_code == 409
    db.add.assert_not_called()


@pytest.mark.asyncio
async def test_missing_migration_has_explicit_pending_response():
    db = SimpleNamespace(scalar=AsyncMock(return_value=None))
    with pytest.raises(HTTPException) as caught:
        await service.disponible(db)
    assert caught.value.status_code == 503
    assert caught.value.detail == 'Valoraciones: próximamente.'


def test_constraints_and_visibility_sql():
    assert any(c.name == 'valoraciones_calificacion_ck' for c in Valoracion.__table__.constraints)
    assert any(getattr(c, 'columns', None) is not None and [col.name for col in c.columns] == ['id_sesion'] for c in Valoracion.__table__.constraints)
    sql = str(citas_visibles((SimpleNamespace(id_usuario=7), ['TERAPEUTA'])).compile(dialect=postgresql.dialect(), compile_kwargs={'literal_binds':True}))
    assert 'terapeutas.id_usuario = 7' in sql


@pytest.mark.asyncio
async def test_routes_require_authentication():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        assert (await client.get('/api/v1/valoraciones')).status_code == 401
        assert (await client.get('/api/v1/sesiones/3/valoracion')).status_code == 401
        assert (await client.post('/api/v1/sesiones/3/valoracion', json={'calificacion':5})).status_code == 401

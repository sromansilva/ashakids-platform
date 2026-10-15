"""PDF y rutas con dependencias simuladas; no conecta ni reinicia una BD."""
from datetime import datetime, timezone
from io import BytesIO
from types import SimpleNamespace as Row
from unittest.mock import AsyncMock
import httpx
import pytest
from fastapi import HTTPException
from pypdf import PdfReader
from app.api.deps import get_current_user
from app.core.database import get_db
from app.main import app
from app.services import sesiones
from app.services import presentacion
from app.services.report_pdf import build_report_pdf


def fixtures(**fields):
    session = Row(id_sesion=12, estado_sesion='FINALIZADA', asistencia='ASISTIO')
    appointment = Row(paciente_nombre='Niña Muñoz', terapeuta_nombre='María Peña',
                      fecha_hora_inicio=datetime(2026, 10, 9, 15, tzinfo=timezone.utc))
    report = Row(id_reporte_sesion=9, fecha_creacion=datetime(2026, 10, 9, 16, tzinfo=timezone.utc),
                 observaciones_iniciales='Observación: niño atento.', objetivos_trabajados='Pronunciación de la R',
                 nivel_ayuda=None, proximos_pasos='Práctica <img src="https://invalid.example"> & lectura.\nSegunda línea.')
    for key, value in fields.items():
        setattr(report, key, value)
    return session, appointment, report


def extract(pdf):
    reader = PdfReader(BytesIO(pdf))
    return reader, '\n'.join(page.extract_text() for page in reader.pages)


def test_pdf_content_accents_markup_and_missing_values():
    data = build_report_pdf(*fixtures())
    reader, text = extract(data)
    assert data.startswith(b'%PDF-') and len(reader.pages) == 1
    for value in ['Niña Muñoz', 'María Peña', 'Observación: niño atento.', 'Pronunciación de la R',
                  'No registrado', '<img src="https://invalid.example"> & lectura.', 'Segunda línea.',
                  '09/10/2026 10:00 (Lima)', 'No incluye notas privadas ni firma digital.']:
        assert value in text
    assert reader.pages[0].get('/Annots') is None  # markup no crea enlaces ni imágenes.


def test_pdf_paginates_without_truncating_long_fields():
    long = 'Observación extensa con ñ y tildes. '*290 + 'FIN-OBSERVACIONES'
    reader, text = extract(build_report_pdf(*fixtures(observaciones_iniciales=long,
        objetivos_trabajados='x'*10000+'FIN-OBJETIVOS', proximos_pasos='FIN-PASOS')))
    assert len(reader.pages) > 1
    for marker in ['FIN-OBSERVACIONES', 'FIN-OBJETIVOS', 'FIN-PASOS']:
        assert marker in text.replace('\n', '')
    assert text.count('Página ') == len(reader.pages)


def test_naive_registration_time_is_not_assigned_an_invented_timezone():
    _, text = extract(build_report_pdf(*fixtures(fecha_creacion=datetime(2026, 10, 9, 11))))
    assert '09/10/2026 11:00 (registro sin zona)' in text


def test_unsupported_character_fails_explicitly_without_partial_document():
    with pytest.raises(HTTPException) as error:
        build_report_pdf(*fixtures(proximos_pasos='Texto con 🦄'))
    assert error.value.status_code == 422


@pytest.fixture
def dependencies():
    previous = app.dependency_overrides.copy()
    db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: ('synthetic-user', ['PADRE'])
    yield db
    app.dependency_overrides.clear()
    app.dependency_overrides.update(previous)


async def test_route_reads_authorized_report_and_returns_attachment(dependencies, monkeypatch):
    visible = AsyncMock(return_value=fixtures())
    monkeypatch.setattr(sesiones, 'reporte_visible', visible)
    monkeypatch.setattr(presentacion, 'citas', AsyncMock(return_value=[fixtures()[1]]))
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/sesiones/12/reporte/pdf')
    assert response.status_code == 200
    assert response.headers['content-type'] == 'application/pdf'
    assert response.headers['content-disposition'] == 'attachment; filename="reporte-sesion-12.pdf"'
    assert response.headers['cache-control'] == 'no-store'
    assert response.headers['x-content-type-options'] == 'nosniff'
    visible.assert_awaited_once_with(dependencies, ('synthetic-user', ['PADRE']), 12)
    dependencies.add.assert_not_called()


@pytest.mark.parametrize('status,detail', [(404, 'Recurso no encontrado.'), (404, 'Reporte no registrado.'), (503, 'Base no disponible.')])
async def test_route_propagates_read_errors(dependencies, monkeypatch, status, detail):
    monkeypatch.setattr(sesiones, 'reporte_visible', AsyncMock(side_effect=HTTPException(status, detail)))
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/sesiones/12/reporte/pdf')
    assert response.status_code == status
    assert response.json()['detail'] == detail


async def test_route_requires_authentication(dependencies, monkeypatch):
    app.dependency_overrides.pop(get_current_user)
    visible = AsyncMock(); monkeypatch.setattr(sesiones, 'reporte_visible', visible)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/v1/sesiones/12/reporte/pdf')
    assert response.status_code == 401
    visible.assert_not_awaited()


async def test_shared_read_checks_session_access_before_report(dependencies, monkeypatch):
    monkeypatch.setattr(sesiones, 'sesion_visible', AsyncMock(side_effect=HTTPException(404, 'Recurso no encontrado.')))
    with pytest.raises(HTTPException):
        await sesiones.reporte_visible(dependencies, ('synthetic', []), 12)
    dependencies.scalar.assert_not_awaited()


async def test_shared_read_rejects_missing_report(dependencies, monkeypatch):
    monkeypatch.setattr(sesiones, 'sesion_visible', AsyncMock(return_value=fixtures()[:2]))
    dependencies.scalar.return_value = None
    with pytest.raises(HTTPException) as error:
        await sesiones.reporte_visible(dependencies, ('synthetic', []), 12)
    assert error.value.status_code == 404

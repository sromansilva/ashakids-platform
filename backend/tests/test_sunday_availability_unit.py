"""Domingo con dobles aislados: no usuarios, sesiones ni escrituras reales."""
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from app.core.config import settings
from app.modules.agenda.domain.schemas import DisponibilidadDatos, TurnoDatos
from app.modules.agenda.application import agenda


def sunday():
    now = datetime.now(agenda.LIMA)
    return (now + timedelta(days=7 - now.weekday() + 6)).replace(hour=12, minute=0, second=0, microsecond=0)


def test_seven_days_and_seventy_distinct_turns_are_valid():
    data = DisponibilidadDatos(turnos=[{'dia': d, 'hora': h} for d in range(7) for h in range(8, 18)])
    assert len(data.turnos) == 70
    assert len([t for t in data.turnos if t.dia == 6]) == 10
    with pytest.raises(ValidationError):
        DisponibilidadDatos(turnos=[{'dia': 6, 'hora': 8}] * 2)


@pytest.mark.parametrize('day,hour', [(-1, 8), (7, 8), (6, 7), (6, 18)])
def test_invalid_day_or_hour_remains_rejected(day, hour):
    with pytest.raises(ValidationError):
        TurnoDatos(dia=day, hora=hour)


@pytest.mark.asyncio
@pytest.mark.parametrize('published,blocked', [(False, False), (True, False), (True, True)])
async def test_sunday_respects_publication_and_blocks(published, blocked):
    db = SimpleNamespace(scalar=AsyncMock(side_effect=[1 if published else None, 1 if blocked else None]))
    start = sunday()
    with patch.object(agenda, 'disponibilidad', AsyncMock()):
        if published and not blocked:
            await agenda.validar_turno(db, 1, start, start + timedelta(minutes=settings.APPOINTMENT_DURATION_MINUTES))
        else:
            with pytest.raises(HTTPException) as rejected:
                await agenda.validar_turno(db, 1, start, start + timedelta(minutes=settings.APPOINTMENT_DURATION_MINUTES))
            assert rejected.value.status_code == 409


@pytest.mark.asyncio
async def test_sunday_slots_preserve_busy_and_blocked_reasons():
    start = sunday()
    duration = timedelta(minutes=settings.APPOINTMENT_DURATION_MINUTES)
    rows = MagicMock()
    rows.all.return_value = [SimpleNamespace(fecha_hora_inicio=start + timedelta(hours=1), fecha_hora_fin=start + timedelta(hours=1) + duration)]
    db = SimpleNamespace(scalars=AsyncMock(return_value=rows))
    config = {'turnos': [{'dia': 6, 'hora': h} for h in (12, 13, 14)],
              'bloqueos': [{'inicio': start, 'fin': start + duration}]}
    with patch.object(agenda, 'disponibilidad', AsyncMock(return_value=config)):
        slots = await agenda.turnos_del_dia(db, 1, start.date())
    by_hour = {s['inicio'].hour: s for s in slots}
    assert by_hour[8]['motivo'] == 'Fuera de disponibilidad'
    assert by_hour[12]['motivo'] == 'Bloqueado'
    assert by_hour[13]['motivo'] == 'Ocupado'
    assert by_hour[14]['disponible'] is True
    assert by_hour[14]['fin'] - by_hour[14]['inicio'] == duration

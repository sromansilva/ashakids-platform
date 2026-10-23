"""Proceso periódico optativo; requiere migración005 adoptada explícitamente."""
import asyncio
import logging
from app.core import database
from app.services.notificaciones import recordatorios

logger = logging.getLogger(__name__)


async def ejecutar():
    while True:
        try:
            if database.async_session_factory is not None:
                async with database.async_session_factory.begin() as db:
                    await recordatorios(db)
        except Exception as exc:
            logger.error('No se pudieron generar recordatorios: %s', type(exc).__name__)
        await asyncio.sleep(60)

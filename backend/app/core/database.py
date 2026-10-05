"""Configuración de base de datos con SQLAlchemy 2.x y asyncpg."""

import logging
from typing import AsyncGenerator, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Clase base declarativa para todos los modelos SQLAlchemy 2.x de ASHAKids."""
    pass


# Inicializar el motor asíncrono si DATABASE_URL está configurada
async_engine: Optional[AsyncEngine] = None
async_session_factory: Optional[async_sessionmaker[AsyncSession]] = None

if settings.DATABASE_URL:
    try:
        # Asegurar prefijo de driver asyncpg si se pasó postgresql://
        db_url = settings.DATABASE_URL
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        async_engine = create_async_engine(
            db_url,
            echo=False,
            future=True,
            pool_pre_ping=True,
        )
        async_session_factory = async_sessionmaker(
            bind=async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        logger.info("Motor asíncrono de SQLAlchemy 2.x inicializado con éxito.")
    except Exception as e:
        logger.warning("No se pudo inicializar la conexión a PostgreSQL: %s", e)


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """Generador de dependencias de sesión de base de datos para FastAPI.
    
    Cierra o hace rollback automáticamente tras cada petición HTTP.
    """
    if async_session_factory is None:
        # Si la base de datos aún no tiene DATABASE_URL configurada en el entorno,
        # yield None para permitir que el backend opere en modo desarrollo / mock
        yield None
        return

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

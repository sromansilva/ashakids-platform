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


# Inicializar el motor asíncrono
async_engine: Optional[AsyncEngine] = None
async_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


def init_db(database_url: Optional[str] = None) -> None:
    """Inicializa o actualiza el motor y la fábrica de sesiones asíncronas con SQLAlchemy 2.x."""
    global async_engine, async_session_factory
    url = database_url or settings.effective_database_url
    if not url:
        async_engine = None
        async_session_factory = None
        logger.warning("DATABASE_URL no está configurada. Las peticiones a BD retornarán 503 Service Unavailable.")
        return

    try:
        # Asegurar prefijo de driver asyncpg si se especificó postgresql://
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

        async_engine = create_async_engine(
            url,
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
        async_engine = None
        async_session_factory = None
        logger.error("Error al inicializar la conexión a PostgreSQL: %s", e)


# Inicialización en la carga del módulo
init_db()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Generador de dependencias de sesión de base de datos para FastAPI.
    
    Cierra o hace rollback automáticamente tras cada petición HTTP.
    Lanza HTTP 503 si la base de datos no está disponible en tiempo de ejecución.
    """
    if async_session_factory is None:
        logger.error("DATABASE_URL no configurada o motor no inicializado.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de base de datos no disponible. Verifique la configuración del servidor.",
        )

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

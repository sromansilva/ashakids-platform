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
from sqlalchemy.exc import IntegrityError, DBAPIError, TimeoutError as PoolTimeoutError

from app.core.config import settings
from app.core.database_transport import engine_options

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

        url, options = engine_options(url, settings)
        async_engine = create_async_engine(
            url, **options,
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
        logger.error("Error al inicializar PostgreSQL: %s", type(e).__name__)


# Inicialización en la carga del módulo
init_db()


async def rollback_safely(session):
    """No reemplazar el error original si también se pierde la conexión al revertir."""
    try:
        await session.rollback()
    except Exception as exc:
        logger.warning("Rollback no disponible: %s", type(exc).__name__)


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
        except IntegrityError:
            await rollback_safely(session)
            raise HTTPException(409, "Conflicto de datos: registro duplicado o referencia inválida.") from None
        except DBAPIError as exc:
            await rollback_safely(session)
            sqlstate = getattr(exc.orig, "sqlstate", None)
            if sqlstate in {"40001", "40P01"}:
                raise HTTPException(409, "Conflicto concurrente. Reintente la operación.") from None
            raise HTTPException(503, "Base de datos temporalmente no disponible.") from None
        except (OSError, TimeoutError, PoolTimeoutError):
            await rollback_safely(session)
            raise HTTPException(503, "Base de datos temporalmente no disponible.") from None
        except Exception:
            await rollback_safely(session)
            raise

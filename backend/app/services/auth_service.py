"""Servicio de autenticación y sesiones de usuario para ASHAKids.

Gestiona la autenticación mediante código de usuario (VARCHAR(6)), verificación de
contraseña con Argon2id, roles reales desde usuario_roles y persistencia de sesiones en PostgreSQL.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import logging
import secrets
from typing import List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.security import verify_password
from app.models.auth import SesionAutenticacion, Usuario, UsuarioRol

logger = logging.getLogger(__name__)


def hash_session_token(token: str) -> str:
    """Calcula el hash SHA-256 de un token de sesión aleatorio para almacenamiento seguro."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def authenticate_user(
    db: AsyncSession, codigo_usuario: str, password: str
) -> Optional[Tuple[Usuario, List[str]]]:
    """Autentica un usuario mediante su codigo_usuario único contra PostgreSQL real.
    
    Valida:
    1. Usuario existente con el codigo_usuario proporcionado.
    2. Usuario en estado activo (activo == True).
    3. Contraseña correcta verificada mediante Argon2id contra password_hash.
    4. Roles reales obtenidos mediante la relación usuario_roles -> roles (sin inferir del prefijo).
    
    Retorna (Usuario, roles: List[str]) o None si las credenciales son inválidas.
    """
    clean_codigo = codigo_usuario.strip()
    if not clean_codigo or not password:
        return None

    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.codigo_usuario == clean_codigo, Usuario.activo == True)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.activo:
        logger.info("Intento de login fallido: cuenta no encontrada o inactiva.")
        return None

    # Verificar contraseña con el hash Argon2id almacenado
    if not await run_in_threadpool(verify_password, password, user.password_hash):
        logger.info("Intento de login fallido: contraseña incorrecta.")
        return None

    # Obtener lista de roles activos desde la relación en base de datos
    roles = [
        ur.rol.nombre_rol
        for ur in user.roles_asignados
        if ur.activo and ur.rol
    ]

    if not any(r.upper() in {"PADRE", "TERAPEUTA", "ADMIN"} for r in roles):
        return None
    return user, roles


async def create_user_session(
    db: AsyncSession, id_usuario: int
) -> Tuple[str, datetime]:
    """Genera una sesión segura, persiste su hash en sesiones_autenticacion y retorna el token en texto claro."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=settings.SESSION_EXPIRE_HOURS)

    sesion = SesionAutenticacion(
        id_usuario=id_usuario,
        token_hash=token_hash,
        fecha_emision=now,
        fecha_expiracion=expires_at,
        ultima_actividad=now,
        mfa_verificado=False,
        revocado=False,
    )
    db.add(sesion)
    await db.flush()

    return raw_token, expires_at


async def get_user_by_session(
    db: AsyncSession, raw_token: str
) -> Optional[Tuple[Usuario, List[str]]]:
    """Recupera el usuario y sus roles a partir del token de sesión transportado en la cookie HttpOnly.
    
    Verifica:
    - Token hash existente en sesiones_autenticacion
    - Sesión no revocada (revocado == False)
    - Sesión no expirada (fecha_expiracion > now)
    - Usuario activo
    Actualiza ultima_actividad y retorna (Usuario, roles).
    """
    if not raw_token:
        return None

    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)

    stmt = (
        select(SesionAutenticacion)
        .options(
            selectinload(SesionAutenticacion.usuario)
            .selectinload(Usuario.roles_asignados)
            .selectinload(UsuarioRol.rol)
        )
        .where(
            SesionAutenticacion.token_hash == token_hash,
            SesionAutenticacion.revocado == False,
            SesionAutenticacion.fecha_expiracion > now,
        )
    )
    result = await db.execute(stmt)
    sesion = result.scalar_one_or_none()

    if not sesion or sesion.revocado or sesion.fecha_expiracion <= now:
        return None

    if not sesion.usuario or not sesion.usuario.activo:
        return None

    # Actualizar marca de última actividad
    sesion.ultima_actividad = now
    await db.flush()

    roles = [
        ur.rol.nombre_rol
        for ur in sesion.usuario.roles_asignados
        if ur.activo and ur.rol
    ]
    if not any(r.upper() in {"PADRE", "TERAPEUTA", "ADMIN"} for r in roles):
        return None
    return sesion.usuario, roles


async def revoke_session(db: AsyncSession, raw_token: str) -> bool:
    """Revoca la sesión activa registrando fecha de cierre en la base de datos."""
    if not raw_token:
        return False

    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)

    stmt = select(SesionAutenticacion).where(
        SesionAutenticacion.token_hash == token_hash,
        SesionAutenticacion.revocado == False,
    )
    result = await db.execute(stmt)
    sesion = result.scalar_one_or_none()
    if sesion:
        sesion.revocado = True
        sesion.fecha_cierre = now
        await db.flush()
        return True

    return False

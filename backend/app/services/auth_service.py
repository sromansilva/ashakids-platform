"""Servicio de autenticación y sesiones de usuario para ASHAKids."""

from datetime import datetime, timedelta, timezone
import hashlib
import logging
import secrets
from typing import List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.auth import Rol, SesionAutenticacion, Usuario, UsuarioRol

logger = logging.getLogger(__name__)

# Fallback en memoria para desarrollo local cuando DATABASE_URL no está configurada
_MOCK_SESSIONS: dict[str, dict] = {}
_DEV_USERS = {
    "admin@ashakids.test": {
        "id_usuario": 1,
        "email": "admin@ashakids.test",
        "nombres": "Administrador",
        "apellidos": "Sistema",
        "codigo_usuario": "ADM-001",
        "role": "ADMIN",
        "roles": ["ADMIN"],
        # Hash Argon2id verificado para '12345'
        "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$1g+bYnGFzLIGA6BHJ97bJg$Dwd6bTIoeVR9qhtbFGkbfqc/Skojf+NzhFIVGCM4pbU",
        "activo": True,
    },
    "terapeuta@ashakids.test": {
        "id_usuario": 2,
        "email": "terapeuta@ashakids.test",
        "nombres": "Terapeuta",
        "apellidos": "Especialista",
        "codigo_usuario": "TER-001",
        "role": "TERAPEUTA",
        "roles": ["TERAPEUTA"],
        # Hash Argon2id verificado para '12345'
        "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$p2TuAVJCzf8nnNFsvi52yQ$9NuywFvR29TQrydDshsSJF3ma0nqVtlc9HglTOYyZy0",
        "activo": True,
    },
    "padre@ashakids.test": {
        "id_usuario": 3,
        "email": "padre@ashakids.test",
        "nombres": "Padre",
        "apellidos": "Familia",
        "codigo_usuario": "PAD-001",
        "role": "PADRE",
        "roles": ["PADRE"],
        # Hash Argon2id verificado para '12345'
        "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$P/TJtC/T8lYNZJlVm36n9g$GXIJxNt4OXKufVfhdntELuvieKuG84Jjn32QWNdUoWM",
        "activo": True,
    },
}


def hash_session_token(token: str) -> str:
    """Calcula el hash SHA-256 de un token de sesión aleatorio para almacenamiento seguro."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def authenticate_user(
    db: Optional[AsyncSession], email: str, password: str
) -> Optional[Tuple[Usuario | dict, List[str]]]:
    """Autentica un usuario verificando activo y contraseña con Argon2id."""
    clean_email = email.strip().lower()

    if db is not None:
        # Búsqueda mediante SQLAlchemy 2.x
        stmt = (
            select(Usuario)
            .options(
                selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
            )
            .where(Usuario.email == clean_email, Usuario.activo == True)
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return None

        # Verificar contraseña con el hash Argon2id almacenado
        if not verify_password(password, user.password_hash):
            return None

        # Obtener lista de roles activos
        roles = [
            ur.rol.nombre_rol
            for ur in user.roles_asignados
            if ur.activo and ur.rol
        ]
        return user, roles

    # Fallback para desarrollo sin conexión activa a BD
    dev_user = _DEV_USERS.get(clean_email)
    if dev_user and dev_user["activo"]:
        if verify_password(password, dev_user["password_hash"]):
            return dev_user, dev_user["roles"]

    return None


async def create_user_session(
    db: Optional[AsyncSession], id_usuario: int
) -> Tuple[str, datetime]:
    """Genera una sesión segura, persiste su hash y retorna el token en texto claro para la cookie."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=settings.SESSION_EXPIRE_HOURS)

    if db is not None:
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
    else:
        _MOCK_SESSIONS[token_hash] = {
            "id_usuario": id_usuario,
            "expires_at": expires_at,
            "revoked": False,
        }

    return raw_token, expires_at


async def get_user_by_session(
    db: Optional[AsyncSession], raw_token: str
) -> Optional[Tuple[Usuario | dict, List[str]]]:
    """Recupera el usuario a partir del token de sesión transportado en la cookie."""
    if not raw_token:
        return None

    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)

    if db is not None:
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

        if not sesion or not sesion.usuario or not sesion.usuario.activo:
            return None

        # Actualizar marca de última actividad
        sesion.ultima_actividad = now
        await db.flush()

        roles = [
            ur.rol.nombre_rol
            for ur in sesion.usuario.roles_asignados
            if ur.activo and ur.rol
        ]
        return sesion.usuario, roles

    # Fallback desarrollo
    sess_data = _MOCK_SESSIONS.get(token_hash)
    if sess_data and not sess_data["revoked"] and sess_data["expires_at"] > now:
        uid = sess_data["id_usuario"]
        for u in _DEV_USERS.values():
            if u["id_usuario"] == uid:
                return u, u["roles"]

    return None


async def revoke_session(db: Optional[AsyncSession], raw_token: str) -> bool:
    """Revoca la sesión activa registrando fecha de cierre."""
    if not raw_token:
        return False

    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)

    if db is not None:
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

    if token_hash in _MOCK_SESSIONS:
        _MOCK_SESSIONS[token_hash]["revoked"] = True
        return True

    return False

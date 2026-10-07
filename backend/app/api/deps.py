"""Dependencias comunes de FastAPI para autenticación y autorización."""

from typing import List, Optional, Tuple
from fastapi import Cookie, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.auth import Usuario
from app.services.auth_service import get_user_by_session


async def get_current_token(
    request: Request,
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    """Obtiene el token de sesión de la cookie HttpOnly o del header Authorization."""
    # 1. Priorizar cookie HttpOnly
    cookie_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    # 2. Alternativa por header Bearer (para testing / API clients)
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()

    return None


async def get_current_user(
    token: Optional[str] = Depends(get_current_token),
    db: AsyncSession = Depends(get_db),
) -> Tuple[Usuario, List[str]]:
    """Valida la sesión y retorna el usuario autenticado y sus roles.
    
    Lanza HTTPException 401 si no está autenticado o la sesión expiró.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró una sesión activa.",
            headers={"WWW-Authenticate": "Cookie"},
        )

    auth_data = await get_user_by_session(db, token)
    if not auth_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida, revocada o expirada.",
            headers={"WWW-Authenticate": "Cookie"},
        )

    return auth_data


def require_role(required_role: str):
    """Dependencia para restringir el acceso a usuarios con un rol específico."""
    async def role_checker(
        current_data: Tuple[Usuario, List[str]] = Depends(get_current_user)
    ) -> Tuple[Usuario, List[str]]:
        _, roles = current_data
        # Coincidencia insensible a mayúsculas
        upper_roles = [r.upper() for r in roles]
        if required_role.upper() not in upper_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere el rol '{required_role.upper()}'.",
            )
        return current_data

    return role_checker


# Alias explícito para requerir usuario autenticado
require_authenticated_user = get_current_user

# Dependencias convenientes y semánticas por rol
require_padre = require_role("PADRE")
require_terapeuta = require_role("TERAPEUTA")
require_admin = require_role("ADMIN")

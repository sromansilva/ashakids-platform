"""Endpoints REST de autenticación y sesión de usuario."""

from typing import List, Tuple
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_token, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.auth import Usuario
from app.schemas.auth import AuthResponse, LoginRequest, MessageResponse, UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_user_session,
    revoke_session,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def build_user_response(user: Usuario | dict, roles: List[str]) -> UserResponse:
    """Construye un UserResponse seguro compatible con objetos SQLAlchemy y diccionarios."""
    if isinstance(user, dict):
        uid = user["id_usuario"]
        email = user["email"]
        nombres = user["nombres"]
        apellidos = user["apellidos"]
        codigo = user.get("codigo_usuario")
        activo = user.get("activo", True)
    else:
        uid = user.id_usuario
        email = user.email
        nombres = user.nombres
        apellidos = user.apellidos
        codigo = user.codigo_usuario
        activo = user.activo

    # Rol semántico principal en mayúsculas
    main_role = roles[0].upper() if roles else "PADRE"

    return UserResponse(
        id_usuario=uid,
        email=email,
        nombres=nombres,
        apellidos=apellidos,
        codigo_usuario=codigo,
        rol=main_role,
        roles=[r.upper() for r in roles],
        activo=activo,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Iniciar sesión",
    description="Verifica credenciales con Argon2id, genera una sesión segura y fija una cookie HttpOnly.",
)
async def login(
    req: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    auth_result = await authenticate_user(db, req.email, req.password)
    if not auth_result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas o cuenta inactiva.",
        )

    user, roles = auth_result
    uid = user["id_usuario"] if isinstance(user, dict) else user.id_usuario

    # Crear sesión y obtener token en texto claro para la cookie
    raw_token, expires_at = await create_user_session(db, uid)

    # Establecer cookie HttpOnly (protege contra XSS)
    is_prod = settings.ENVIRONMENT.lower() == "production"
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=is_prod,
        samesite="lax",
        max_age=settings.SESSION_EXPIRE_HOURS * 3600,
        path="/",
    )

    user_resp = build_user_response(user, roles)
    return AuthResponse(
        user=user_resp,
        message=f"Bienvenido a ASHAKids, {user_resp.nombres}.",
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Cerrar sesión",
    description="Revoca la sesión activa en el backend y limpia la cookie de sesión del navegador.",
)
async def logout(
    response: Response,
    token: str = Depends(get_current_token),
    db: AsyncSession = Depends(get_db),
):
    if token:
        await revoke_session(db, token)

    # Limpiar cookie en el cliente
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path="/",
    )
    return MessageResponse(message="Sesión cerrada correctamente.")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener usuario actual",
    description="Retorna el perfil y rol del usuario correspondiente a la sesión activa.",
)
async def get_me(
    current_data: Tuple[Usuario | dict, List[str]] = Depends(get_current_user),
):
    user, roles = current_data
    return build_user_response(user, roles)

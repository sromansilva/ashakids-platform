"""Endpoints REST de autenticación y sesión de usuario."""

from typing import List, Tuple
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_token, get_session_user
from app.core.config import settings
from app.core.database import get_db
from app.core.login_limiter import limit_login
from app.models.auth import Usuario
from app.schemas.auth import (ActivationRequest, AuthResponse, LoginRequest, MessageResponse, UserResponse,
                              EmailActivationRequest, ResendActivationRequest)
from app.services.email_activation import complete_email_activation, resend_activation
from app.services.auth_service import (
    authenticate_user,
    create_user_session,
    revoke_session,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])



@router.post("/create-password", response_model=MessageResponse)
async def create_password(req: EmailActivationRequest, request: Request,
                          db: AsyncSession = Depends(get_db, scope="function")):
    limit_login(request, "email-activation")
    await complete_email_activation(db, req.token, req.new_password)
    return MessageResponse(message="Contraseña creada. Ya puedes iniciar sesión con tu código de usuario.")


@router.post("/resend-activation", response_model=MessageResponse)
async def resend_password_link(req: ResendActivationRequest, request: Request,
                               db: AsyncSession = Depends(get_db, scope="function")):
    limit_login(request, "resend:" + req.codigo_usuario.strip().lower())
    await resend_activation(db, req.codigo_usuario)
    return MessageResponse(message="Si la cuenta está pendiente de activación, recibirás un enlace en su correo. Revisa también spam.")


def build_user_response(user: Usuario, roles: List[str]) -> UserResponse:
    """Construye un UserResponse seguro compatible con el modelo Usuario."""
    # Rol semántico principal en mayúsculas
    main_role = next((r for r in ("ADMIN", "TERAPEUTA", "PADRE") if r in [v.upper() for v in roles]), "")

    return UserResponse(
        id_usuario=user.id_usuario,
        email=user.email,
        nombres=user.nombres,
        apellidos=user.apellidos,
        codigo_usuario=user.codigo_usuario,
        rol=main_role,
        roles=[r.upper() for r in roles],
        activo=user.activo,
        password_change_required=getattr(user, "password_change_required", False) is True,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Iniciar sesión",
    description="Verifica credenciales con Argon2id por codigo_usuario, genera una sesión en PostgreSQL y fija una cookie HttpOnly.",
)
async def login(
    req: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db, scope="function"),
):
    limit_login(request, req.codigo_usuario)
    auth_result = await authenticate_user(db, req.codigo_usuario, req.password)
    if not auth_result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas o cuenta inactiva.",
        )

    user, roles = auth_result

    # Crear sesión en PostgreSQL y obtener token en texto claro para la cookie
    raw_token, expires_at = await create_user_session(db, user.id_usuario)

    # Establecer cookie HttpOnly (protege contra XSS)
    is_prod = settings.is_production
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
    description="Revoca la sesión activa en PostgreSQL y limpia la cookie de sesión del navegador.",
)
async def logout(
    response: Response,
    token: str = Depends(get_current_token),
    db: AsyncSession = Depends(get_db, scope="function"),
):
    if token:
        await revoke_session(db, token)

    # Limpiar cookie en el cliente
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path="/",
        secure=settings.is_production,
        httponly=True,
        samesite="lax",
    )
    return MessageResponse(message="Sesión cerrada correctamente.")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener usuario actual",
    description="Retorna el perfil y roles reales del usuario correspondientes a la sesión activa en PostgreSQL.",
)
async def get_me(
    current_data: Tuple[Usuario, List[str]] = Depends(get_session_user),
):
    user, roles = current_data
    return build_user_response(user, roles)


@router.post("/activate", response_model=AuthResponse, summary="Cambiar contraseña inicial")
async def activate(
    req: ActivationRequest,
    response: Response,
    request: Request,
    identity: tuple = Depends(get_session_user),
    db: AsyncSession = Depends(get_db, scope="function"),
):
    raise HTTPException(410, "Crea tu contraseña desde el enlace enviado al correo. Solicita otro enlace en /crear-contrasena.")

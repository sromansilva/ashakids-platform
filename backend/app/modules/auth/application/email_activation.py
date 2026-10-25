"""Enlaces de alta vinculados al hash privado y al correo actual, sin tabla nueva."""
import base64
import hashlib
import hmac
import time
import re

from fastapi import HTTPException
from sqlalchemy import func, select, update
from starlette.concurrency import run_in_threadpool
from datetime import datetime, timezone

from app.core.config import settings
from app.core.security import hash_password
from app.modules.auth.domain.models import Usuario, SesionAutenticacion
from app.modules.auth.infrastructure.gmail import send_welcome_email


def activation_token(user, *, now=None):
    expires = int(time.time() if now is None else now) + 86400
    payload = f"{user.id_usuario}.{expires}"
    signature = hmac.new(user.password_hash.encode(),
                         f"activate:{payload}:{user.email}".encode(), hashlib.sha256).digest()
    return payload + "." + base64.urlsafe_b64encode(signature).decode().rstrip("=")


def token_user_id(token):
    try:
        uid, expires, signature = token.split(".")
        if not (0 < int(uid) <= 2147483647) or int(expires) <= int(time.time()) or not re.fullmatch(r"[A-Za-z0-9_-]{43}", signature):
            raise ValueError
        return int(uid)
    except (ValueError, TypeError):
        raise HTTPException(400, "El enlace es inválido o venció. Solicita otro enlace.") from None


def validate_token(user, token):
    token_user_id(token)
    payload, signature = token.rsplit(".", 1)
    expected = hmac.new(user.password_hash.encode(),
                        f"activate:{payload}:{user.email}".encode(), hashlib.sha256).digest()
    encoded = base64.urlsafe_b64encode(expected).decode().rstrip("=")
    if (not user.activo or not user.password_change_required
            or str(user.id_usuario) != payload.split(".")[0]
            or not hmac.compare_digest(encoded, signature)):
        raise HTTPException(400, "El enlace es inválido o venció. Solicita otro enlace.")


async def welcome_for_user(db, user_id, role):
    user = await db.scalar(select(Usuario).where(Usuario.id_usuario == user_id))
    origin = (settings.PUBLIC_ORIGIN or "http://localhost:5174").rstrip("/")
    url = f"{origin}/crear-contrasena#token={activation_token(user)}"
    # No mantener una transacción abierta durante la llamada externa.
    to, name, code = user.email, f"{user.nombres} {user.apellidos}", user.codigo_usuario
    await db.commit()
    return await send_welcome_email(to=to, name=name, role=role, code=code, activation_url=url)


async def complete_email_activation(db, token, password):
    uid = token_user_id(token)
    user = await db.scalar(select(Usuario).where(Usuario.id_usuario == uid)
                           .with_for_update().execution_options(populate_existing=True))
    if not user:
        raise HTTPException(400, "El enlace es inválido o venció. Solicita otro enlace.")
    validate_token(user, token)
    user.password_hash = await run_in_threadpool(hash_password, password)
    user.password_change_required = False
    await db.execute(update(SesionAutenticacion).where(
        SesionAutenticacion.id_usuario == uid, SesionAutenticacion.revocado.is_(False)
    ).values(revocado=True, fecha_cierre=datetime.now(timezone.utc)))
    await db.flush()


async def resend_activation(db, code):
    user = await db.scalar(select(Usuario).where(
        func.lower(Usuario.codigo_usuario) == code.strip().lower(),
        Usuario.activo.is_(True), Usuario.password_change_required.is_(True)))
    if user:
        await welcome_for_user(db, user.id_usuario, "usuario")

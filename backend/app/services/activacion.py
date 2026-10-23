"""Activación obligatoria: bloqueo de usuario y rotación de todas sus sesiones."""
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, update
from starlette.concurrency import run_in_threadpool

from app.core.security import hash_password, verify_password
from app.models.auth import SesionAutenticacion, Usuario
from app.services.auth_service import create_user_session


async def activate_account(db, identity, data):
    user = await db.scalar(select(Usuario).where(
        Usuario.id_usuario == identity[0].id_usuario
    ).with_for_update().execution_options(populate_existing=True))
    if not user or not user.activo:
        raise HTTPException(401, "Cuenta inactiva o no disponible.")
    if not user.password_change_required:
        raise HTTPException(409, "La cuenta ya completó su activación.")
    if not await run_in_threadpool(verify_password, data.current_password, user.password_hash):
        raise HTTPException(403, "La contraseña inicial no es correcta.")
    if data.current_password == data.new_password:
        raise HTTPException(422, "Elija una contraseña diferente de la inicial.")
    user.password_hash = await run_in_threadpool(hash_password, data.new_password)
    user.password_change_required = False
    await db.execute(update(SesionAutenticacion).where(
        SesionAutenticacion.id_usuario == user.id_usuario,
        SesionAutenticacion.revocado.is_(False),
    ).values(revocado=True, fecha_cierre=datetime.now(timezone.utc)))
    token, _ = await create_user_session(db, user.id_usuario)
    await db.flush()
    return user, identity[1], token

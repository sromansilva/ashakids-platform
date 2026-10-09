"""Servicio para la administración del sistema y gestión integral de cuentas (/admin/cuentas)."""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select, update, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import hash_password
from app.models.auditoria import AuditoriaCambios
from app.models.auth import Administrador, Rol, SesionAutenticacion, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor
from app.schemas.admin import (
    ActualizarCuentaRequest,
    CrearPadreRequest,
    CrearTerapeutaRequest,
)

from app.services.admin_auditoria import registrar_auditoria
from app.services.admin_cuentas_lectura import _construir_cuenta_dict, contar_administradores_activos

async def suspender_cuenta(
    db: AsyncSession,
    id_usuario: int,
    actor: Usuario,
) -> Dict[str, Any]:
    """Suspende lógicamente una cuenta, revoca sesiones activas e impide nuevos accesos."""
    if id_usuario == actor.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No puedes suspender tu propia cuenta de administrador.",
        )

    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )

    # Verificar si es ADMIN y si es el último activo
    roles = [
        ur.rol.nombre_rol.upper()
        for ur in user.roles_asignados
        if ur.activo and ur.rol
    ]
    if "ADMIN" in roles:
        activos = await contar_administradores_activos(db)
        if activos <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede suspender al único administrador activo del sistema.",
            )

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()
    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()

    if not user.activo:
        cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
        return {
            "message": "La cuenta ya se encuentra suspendida.",
            "cuenta": cuenta_actual,
        }

    # Desactivar usuario
    user.activo = False

    # Revocar sesiones activas en sesiones_autenticacion
    now = datetime.now(timezone.utc)
    stmt_rev = (
        update(SesionAutenticacion)
        .where(
            SesionAutenticacion.id_usuario == user.id_usuario,
            SesionAutenticacion.revocado == False,
        )
        .values(revocado=True, fecha_cierre=now)
    )
    rev_res = await db.execute(stmt_rev)
    revocadas = rev_res.rowcount

    # Auditoría UPDATE
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="UPDATE",
        datos_anteriores={"activo": True},
        datos_nuevos={"activo": False, "sesiones_revocadas": revocadas},
    )
    await db.flush()

    cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
    return {
        "message": f"Cuenta suspendida correctamente. Se revocaron {revocadas} sesión(es) activa(s).",
        "cuenta": cuenta_actual,
    }


async def activar_cuenta(
    db: AsyncSession,
    id_usuario: int,
    actor: Usuario,
) -> Dict[str, Any]:
    """Reactiva una cuenta previamente suspendida (las sesiones anteriores siguen revocadas)."""
    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()
    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()

    if user.activo:
        cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
        return {
            "message": "La cuenta ya se encuentra activa.",
            "cuenta": cuenta_actual,
        }

    user.activo = True

    # Auditoría UPDATE
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="UPDATE",
        datos_anteriores={"activo": False},
        datos_nuevos={"activo": True},
    )
    await db.flush()

    cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
    return {
        "message": "Cuenta activada correctamente. El usuario ya puede iniciar sesión.",
        "cuenta": cuenta_actual,
    }

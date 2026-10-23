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

async def verificar_dependencias_cuenta(
    db: AsyncSession,
    user: Usuario,
) -> Optional[str]:
    """Verifica si la cuenta tiene relaciones clínicas o de historial que impiden el DELETE físico."""
    id_usr = user.id_usuario

    # 1. Verificar mensajes emitidos
    msg_count = (
        await db.execute(
            text("SELECT count(*) FROM public.mensajes WHERE id_usuario_emisor = :id"),
            {"id": id_usr},
        )
    ).scalar() or 0
    if msg_count > 0:
        return f"La cuenta posee {msg_count} mensaje(s) registrado(s) en conversaciones. No puede eliminarse; suspenda la cuenta en su lugar."

    # 2. Si es tutor, verificar pacientes y conversaciones
    tutor_res = await db.execute(
        select(Tutor.id_tutor).where(Tutor.id_usuario == id_usr)
    )
    id_tutor = tutor_res.scalar_one_or_none()
    if id_tutor:
        pacientes_count = (
            await db.execute(
                text("SELECT count(*) FROM public.pacientes WHERE id_tutor = :id"),
                {"id": id_tutor},
            )
        ).scalar() or 0
        if pacientes_count > 0:
            return f"La cuenta de tutor tiene {pacientes_count} paciente(s) infantil(es) asignado(s) con historial clínico. No puede eliminarse; suspenda la cuenta en su lugar."

        conv_count = (
            await db.execute(
                text("SELECT count(*) FROM public.conversaciones WHERE id_tutor = :id"),
                {"id": id_tutor},
            )
        ).scalar() or 0
        if conv_count > 0:
            return f"La cuenta de tutor tiene {conv_count} conversación(es) clínica(s) en su historial. No puede eliminarse; suspenda la cuenta en su lugar."

    # 3. Si es terapeuta, verificar tratamientos, reservas y conversaciones
    ter_res = await db.execute(
        select(Terapeuta.id_terapeuta).where(Terapeuta.id_usuario == id_usr)
    )
    id_terapeuta = ter_res.scalar_one_or_none()
    if id_terapeuta:
        trat_count = (
            await db.execute(
                text("SELECT count(*) FROM public.tratamientos WHERE id_terapeuta = :id"),
                {"id": id_terapeuta},
            )
        ).scalar() or 0
        if trat_count > 0:
            return f"El terapeuta tiene {trat_count} plan(es) de tratamiento asignado(s). No puede eliminarse; suspenda la cuenta en su lugar."

        res_count = (
            await db.execute(
                text("SELECT count(*) FROM public.reservas WHERE id_terapeuta = :id"),
                {"id": id_terapeuta},
            )
        ).scalar() or 0
        if res_count > 0:
            return f"El terapeuta tiene {res_count} reserva(s) terapéutica(s) en agenda. No puede eliminarse; suspenda la cuenta en su lugar."

        conv_t_count = (
            await db.execute(
                text("SELECT count(*) FROM public.conversaciones WHERE id_terapeuta = :id"),
                {"id": id_terapeuta},
            )
        ).scalar() or 0
        if conv_t_count > 0:
            return f"El terapeuta tiene {conv_t_count} conversación(es) activa(s) en el sistema. No puede eliminarse; suspenda la cuenta en su lugar."

    # 4. Verificar historial de auditoría como actor
    audit_count = (
        await db.execute(
            text(
                "SELECT count(*) FROM public.auditoria_cambios WHERE id_usuario_actor = :id"
            ),
            {"id": id_usr},
        )
    ).scalar() or 0
    if audit_count > 0:
        return (
            "La cuenta posee historial de auditoría como actor "
            f"({audit_count} evento(s)). "
            "Debe suspenderse en lugar de eliminarse para preservar "
            "la trazabilidad histórica."
        )

    return None


async def eliminar_cuenta(
    db: AsyncSession,
    id_usuario: int,
    actor: Usuario,
) -> Dict[str, Any]:
    """Elimina físicamente una cuenta si y solo si no posee dependencias clínicas/históricas."""
    if id_usuario == actor.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No puedes eliminar tu propia cuenta de administrador.",
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
                detail="No se puede eliminar al único administrador activo del sistema.",
            )

    # Verificar dependencias
    conflicto = await verificar_dependencias_cuenta(db, user)
    if conflicto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=conflicto,
        )

    # Registrar auditoría DELETE ANTES de la eliminación física
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="DELETE",
        datos_anteriores={
            "id_usuario": user.id_usuario,
            "codigo_usuario": user.codigo_usuario,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "email": user.email,
            "activo": user.activo,
            "roles": roles,
        },
        datos_nuevos=None,
    )
    await db.flush()

    # Eliminación en base de datos
    await db.delete(user)
    await db.flush()

    return {
        "message": f"Cuenta de usuario '{user.codigo_usuario}' eliminada permanentemente.",
        "id_usuario": id_usuario,
    }

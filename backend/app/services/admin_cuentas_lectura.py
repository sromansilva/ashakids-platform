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

async def contar_administradores_activos(db: AsyncSession) -> int:
    """Retorna la cantidad de administradores activos en el sistema."""
    stmt = (
        select(func.count(Usuario.id_usuario))
        .join(UsuarioRol, UsuarioRol.id_usuario == Usuario.id_usuario)
        .join(Rol, Rol.id_rol == UsuarioRol.id_rol)
        .where(
            Rol.nombre_rol == "ADMIN",
            Usuario.activo == True,
            UsuarioRol.activo == True,
        )
    )
    res = await db.execute(stmt)
    return res.scalar() or 0


async def _construir_cuenta_dict(
    user: Usuario,
    tutor: Optional[Tutor] = None,
    terapeuta: Optional[Terapeuta] = None,
    rol_override: Optional[str] = None,
) -> Dict[str, Any]:
    """Serializa un Usuario con su rol principal y perfil asociado."""
    if rol_override:
        main_role = rol_override.upper()
    else:
        roles = []
        if "roles_asignados" in user.__dict__:
            roles = [
                ur.rol.nombre_rol.upper()
                for ur in user.roles_asignados
                if ur.activo and "rol" in ur.__dict__ and ur.rol
            ]
        main_role = roles[0] if roles else "PADRE"

    tutor_dict = None
    if tutor:
        tutor_dict = {
            "id_tutor": tutor.id_tutor,
            "parentesco": tutor.parentesco,
            "telefono": tutor.telefono,
            "direccion": tutor.direccion,
        }

    terapeuta_dict = None
    if terapeuta:
        terapeuta_dict = {
            "id_terapeuta": terapeuta.id_terapeuta,
            "especialidad": terapeuta.especialidad,
            "anios_experiencia": terapeuta.anios_experiencia,
            "idiomas": terapeuta.idiomas,
            "descripcion_profesional": terapeuta.descripcion_profesional,
        }

    return {
        "id_usuario": user.id_usuario,
        "codigo_usuario": user.codigo_usuario,
        "email": user.email,
        "nombres": user.nombres,
        "apellidos": user.apellidos,
        "rol": main_role,
        "activo": user.activo,
        "fecha_creacion": user.fecha_creacion,
        "tutor": tutor_dict,
        "terapeuta": terapeuta_dict,
    }


async def listar_cuentas(
    db: AsyncSession,
    rol: Optional[str] = None,
    search: Optional[str] = None,
    activo: Optional[bool] = None,
) -> List[Dict[str, Any]]:
    """Lista las cuentas de usuario con roles y perfiles correspondientes."""
    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .order_by(Usuario.id_usuario.desc())
    )

    if activo is not None:
        stmt = stmt.where(Usuario.activo == activo)

    if search:
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            (func.lower(Usuario.nombres).like(term))
            | (func.lower(Usuario.apellidos).like(term))
            | (func.lower(Usuario.email).like(term))
            | (func.lower(Usuario.codigo_usuario).like(term))
        )

    res = await db.execute(stmt)
    usuarios = res.scalars().all()

    # Cargar perfiles de tutores y terapeutas
    user_ids = [u.id_usuario for u in usuarios]
    tutores_map: Dict[int, Tutor] = {}
    terapeutas_map: Dict[int, Terapeuta] = {}

    if user_ids:
        t_res = await db.execute(select(Tutor).where(Tutor.id_usuario.in_(user_ids)))
        for t in t_res.scalars().all():
            tutores_map[t.id_usuario] = t

        ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario.in_(user_ids)))
        for ter in ter_res.scalars().all():
            terapeutas_map[ter.id_usuario] = ter

    cuentas = []
    filtro_rol = rol.upper() if rol else None

    for u in usuarios:
        c_dict = await _construir_cuenta_dict(
            u,
            tutores_map.get(u.id_usuario),
            terapeutas_map.get(u.id_usuario),
        )
        if filtro_rol:
            if c_dict["rol"] != filtro_rol:
                continue
        cuentas.append(c_dict)

    return cuentas


async def obtener_cuenta(db: AsyncSession, id_usuario: int) -> Optional[Dict[str, Any]]:
    """Obtiene una cuenta individual por ID con su perfil detallado."""
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
        return None

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()

    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()

    return await _construir_cuenta_dict(user, tutor, terapeuta)

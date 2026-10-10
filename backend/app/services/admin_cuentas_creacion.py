"""Servicio para la administración del sistema y gestión integral de cuentas (/admin/cuentas)."""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select, update, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.concurrency import run_in_threadpool

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

async def generar_codigo_usuario(db: AsyncSession, prefijo: str) -> str:
    """Genera un código correlativo único de exactamente 6 caracteres (ej. 'p00002', 't00002')."""
    if prefijo not in ("p", "t", "a"):
        raise ValueError("Prefijo inválido para código de usuario.")

    # Serializar hasta el commit por rol; incluir códigos anteriores en ambas cajas.
    await db.execute(text("SELECT pg_advisory_xact_lock(:namespace, :role)"),
                     {"namespace": 20261010, "role": ord(prefijo)})
    stmt = select(Usuario.codigo_usuario).where(func.lower(Usuario.codigo_usuario).like(f"{prefijo}%"))
    result = await db.execute(stmt)
    codigos = result.scalars().all()

    max_num = 0
    pattern = re.compile(rf"^{prefijo}(\d{{5}})$")
    for cod in codigos:
        match = pattern.match(cod.lower())
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    siguiente = max_num + 1
    while True:
        if siguiente > 99999:
            raise HTTPException(409, "No quedan códigos disponibles para este rol.")
        candidato = f"{prefijo.upper()}{siguiente:05d}"
        # Verificar colisión
        chk_stmt = select(Usuario.id_usuario).where(func.upper(Usuario.codigo_usuario) == candidato)
        chk_res = await db.execute(chk_stmt)
        if chk_res.scalar_one_or_none() is None:
            return candidato
        siguiente += 1


async def crear_padre(
    db: AsyncSession,
    req: CrearPadreRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Crea atómicamente un Padre/Tutor: Usuario + Rol PADRE + Tutor + Auditoría."""
    clean_email = req.email.strip().lower()

    # Validar unicidad de email
    stmt_dup = select(Usuario.id_usuario).where(Usuario.email == clean_email)
    if (await db.execute(stmt_dup)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El correo electrónico '{clean_email}' ya está registrado.",
        )

    codigo = await generar_codigo_usuario(db, "p")
    pwd_hash = await run_in_threadpool(hash_password, req.password)

    user = Usuario(
        nombres=req.nombres.strip(),
        apellidos=req.apellidos.strip(),
        codigo_usuario=codigo,
        email=clean_email,
        password_hash=pwd_hash,
        password_change_required=True,
        activo=True,
    )
    db.add(user)
    await db.flush()

    # Obtener rol PADRE
    stmt_rol = select(Rol).where(Rol.nombre_rol == "PADRE")
    rol = (await db.execute(stmt_rol)).scalar_one()

    # Obtener ID del admin actor
    stmt_admin = select(Administrador.id_administrador).where(Administrador.id_usuario == actor.id_usuario)
    admin_id = (await db.execute(stmt_admin)).scalar_one_or_none()

    ur = UsuarioRol(
        id_usuario=user.id_usuario,
        id_rol=rol.id_rol,
        asignado_por=admin_id,
        activo=True,
    )
    db.add(ur)

    tutor = Tutor(
        id_usuario=user.id_usuario,
        parentesco=req.parentesco.strip() if req.parentesco else None,
        telefono=req.telefono.strip() if req.telefono else None,
        direccion=req.direccion.strip() if req.direccion else None,
    )
    db.add(tutor)
    await db.flush()

    # Registrar auditoría INSERT
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="INSERT",
        datos_anteriores=None,
        datos_nuevos={
            "id_usuario": user.id_usuario,
            "codigo_usuario": user.codigo_usuario,
            "email": user.email,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "rol": "PADRE",
            "activo": True,
            "parentesco": tutor.parentesco,
            "telefono": tutor.telefono,
            "direccion": tutor.direccion,
        },
    )
    await db.flush()

    return await _construir_cuenta_dict(user, tutor, None, rol_override="PADRE")


async def crear_terapeuta(
    db: AsyncSession,
    req: CrearTerapeutaRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Crea atómicamente un Terapeuta: Usuario + Rol TERAPEUTA + Terapeuta + Auditoría."""
    clean_email = req.email.strip().lower()

    # Validar unicidad de email
    stmt_dup = select(Usuario.id_usuario).where(Usuario.email == clean_email)
    if (await db.execute(stmt_dup)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El correo electrónico '{clean_email}' ya está registrado.",
        )

    codigo = await generar_codigo_usuario(db, "t")
    pwd_hash = await run_in_threadpool(hash_password, req.password)

    user = Usuario(
        nombres=req.nombres.strip(),
        apellidos=req.apellidos.strip(),
        codigo_usuario=codigo,
        email=clean_email,
        password_hash=pwd_hash,
        password_change_required=True,
        activo=True,
    )
    db.add(user)
    await db.flush()

    # Obtener rol TERAPEUTA
    stmt_rol = select(Rol).where(Rol.nombre_rol == "TERAPEUTA")
    rol = (await db.execute(stmt_rol)).scalar_one()

    # Obtener ID del admin actor
    stmt_admin = select(Administrador.id_administrador).where(Administrador.id_usuario == actor.id_usuario)
    admin_id = (await db.execute(stmt_admin)).scalar_one_or_none()

    ur = UsuarioRol(
        id_usuario=user.id_usuario,
        id_rol=rol.id_rol,
        asignado_por=admin_id,
        activo=True,
    )
    db.add(ur)

    terapeuta = Terapeuta(
        id_usuario=user.id_usuario,
        especialidad=req.especialidad.strip() if req.especialidad else None,
        anios_experiencia=req.anios_experiencia,
        idiomas=req.idiomas.strip() if req.idiomas else None,
        descripcion_profesional=req.descripcion_profesional.strip() if req.descripcion_profesional else None,
    )
    db.add(terapeuta)
    await db.flush()

    # Registrar auditoría INSERT
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="INSERT",
        datos_anteriores=None,
        datos_nuevos={
            "id_usuario": user.id_usuario,
            "codigo_usuario": user.codigo_usuario,
            "email": user.email,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "rol": "TERAPEUTA",
            "activo": True,
            "especialidad": terapeuta.especialidad,
            "anios_experiencia": terapeuta.anios_experiencia,
            "idiomas": terapeuta.idiomas,
        },
    )
    await db.flush()

    return await _construir_cuenta_dict(user, None, terapeuta, rol_override="TERAPEUTA")

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

from app.services.admin_auditoria import (
    sanitize_dict, registrar_auditoria,
)
from app.services.admin_cuentas_lectura import (
    contar_administradores_activos, _construir_cuenta_dict, listar_cuentas, obtener_cuenta,
)
from app.services.admin_cuentas_creacion import (
    generar_codigo_usuario, crear_padre, crear_terapeuta,
)
from app.services.admin_cuentas_estado import (
    suspender_cuenta, activar_cuenta,
)
from app.services.admin_cuentas_eliminacion import (
    verificar_dependencias_cuenta, eliminar_cuenta,
)
from app.services.admin_auditoria import SENSITIVE_KEYS


async def actualizar_cuenta(
    db: AsyncSession,
    id_usuario: int,
    req: ActualizarCuentaRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Actualiza de forma transaccional los datos de usuario y perfil con auditoría."""
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

    datos_anteriores: Dict[str, Any] = {}
    datos_nuevos: Dict[str, Any] = {}

    # Validar y actualizar email si se envió
    if req.email:
        clean_email = req.email.strip().lower()
        if clean_email != user.email:
            stmt_dup = select(Usuario.id_usuario).where(
                Usuario.email == clean_email,
                Usuario.id_usuario != id_usuario,
            )
            if (await db.execute(stmt_dup)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El correo electrónico '{clean_email}' ya pertenece a otro usuario.",
                )
            datos_anteriores["email"] = user.email
            datos_nuevos["email"] = clean_email
            user.email = clean_email

    if req.nombres and req.nombres.strip() != user.nombres:
        datos_anteriores["nombres"] = user.nombres
        datos_nuevos["nombres"] = req.nombres.strip()
        user.nombres = req.nombres.strip()

    if req.apellidos and req.apellidos.strip() != user.apellidos:
        datos_anteriores["apellidos"] = user.apellidos
        datos_nuevos["apellidos"] = req.apellidos.strip()
        user.apellidos = req.apellidos.strip()

    roles = [
        ur.rol.nombre_rol.upper()
        for ur in user.roles_asignados
        if ur.activo and ur.rol
    ]

    # Actualizar o inicializar Tutor
    if "PADRE" in roles:
        t_stmt = select(Tutor).where(Tutor.id_usuario == id_usuario)
        tutor = (await db.execute(t_stmt)).scalar_one_or_none()
        if not tutor:
            tutor = Tutor(id_usuario=id_usuario)
            db.add(tutor)
            await db.flush()

        if req.parentesco is not None and req.parentesco.strip() != (tutor.parentesco or ""):
            datos_anteriores["parentesco"] = tutor.parentesco
            datos_nuevos["parentesco"] = req.parentesco.strip()
            tutor.parentesco = req.parentesco.strip()

        if req.telefono is not None and req.telefono.strip() != (tutor.telefono or ""):
            datos_anteriores["telefono"] = tutor.telefono
            datos_nuevos["telefono"] = req.telefono.strip()
            tutor.telefono = req.telefono.strip()

        if req.direccion is not None and req.direccion.strip() != (tutor.direccion or ""):
            datos_anteriores["direccion"] = tutor.direccion
            datos_nuevos["direccion"] = req.direccion.strip()
            tutor.direccion = req.direccion.strip()

    # Actualizar o inicializar Terapeuta
    if "TERAPEUTA" in roles:
        ter_stmt = select(Terapeuta).where(Terapeuta.id_usuario == id_usuario)
        terapeuta = (await db.execute(ter_stmt)).scalar_one_or_none()
        if not terapeuta:
            terapeuta = Terapeuta(id_usuario=id_usuario)
            db.add(terapeuta)
            await db.flush()

        if req.especialidad is not None and req.especialidad.strip() != (terapeuta.especialidad or ""):
            datos_anteriores["especialidad"] = terapeuta.especialidad
            datos_nuevos["especialidad"] = req.especialidad.strip()
            terapeuta.especialidad = req.especialidad.strip()

        if req.anios_experiencia is not None and req.anios_experiencia != terapeuta.anios_experiencia:
            datos_anteriores["anios_experiencia"] = terapeuta.anios_experiencia
            datos_nuevos["anios_experiencia"] = req.anios_experiencia
            terapeuta.anios_experiencia = req.anios_experiencia

        if req.idiomas is not None and req.idiomas.strip() != (terapeuta.idiomas or ""):
            datos_anteriores["idiomas"] = terapeuta.idiomas
            datos_nuevos["idiomas"] = req.idiomas.strip()
            terapeuta.idiomas = req.idiomas.strip()

        if req.descripcion_profesional is not None and req.descripcion_profesional.strip() != (terapeuta.descripcion_profesional or ""):
            datos_anteriores["descripcion_profesional"] = terapeuta.descripcion_profesional
            datos_nuevos["descripcion_profesional"] = req.descripcion_profesional.strip()
            terapeuta.descripcion_profesional = req.descripcion_profesional.strip()

    # Auditar solo si hubo modificaciones reales
    if datos_nuevos:
        await registrar_auditoria(
            db=db,
            id_usuario_actor=actor.id_usuario,
            nombre_tabla="usuarios",
            nombre_entidad=str(user.id_usuario),
            accion="UPDATE",
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
        )
        await db.flush()

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()
    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()
    return await _construir_cuenta_dict(user, tutor, terapeuta)

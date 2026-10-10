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


SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "token",
    "token_hash",
    "raw_token",
    "cookie",
    "dni",
    "current_password",
    "new_password",
}


def sanitize_dict(data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Elimina contraseñas, hashes y tokens de los datos a auditar."""
    if not data:
        return None
    return {k: v for k, v in data.items() if k not in SENSITIVE_KEYS}


async def registrar_auditoria(
    db: AsyncSession,
    id_usuario_actor: Optional[int],
    nombre_tabla: str,
    nombre_entidad: str,
    accion: str,
    datos_anteriores: Optional[Dict[str, Any]] = None,
    datos_nuevos: Optional[Dict[str, Any]] = None,
) -> AuditoriaCambios:
    """Registra una operación en la tabla central 'auditoria_cambios' de forma transaccional."""
    auditoria = AuditoriaCambios(
        id_usuario_actor=id_usuario_actor,
        nombre_tabla=nombre_tabla,
        nombre_entidad=nombre_entidad,
        accion=accion,
        datos_anteriores=sanitize_dict(datos_anteriores),
        datos_nuevos=sanitize_dict(datos_nuevos),
    )
    db.add(auditoria)
    return auditoria

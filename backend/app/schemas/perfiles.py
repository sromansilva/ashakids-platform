"""Esquemas Pydantic para perfiles de roles específicos (Padre/Tutor, Terapeuta, Admin)."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.schemas.auth import UserResponse


class TutorData(BaseModel):
    id_tutor: Optional[int] = None
    parentesco: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PadreProfileResponse(BaseModel):
    """Respuesta para GET /api/v1/padres/me."""
    user: UserResponse
    perfil_tutor: Optional[TutorData] = None

    model_config = ConfigDict(from_attributes=True)


class TerapeutaData(BaseModel):
    id_terapeuta: Optional[int] = None
    especialidad: Optional[str] = None
    anios_experiencia: Optional[int] = None
    idiomas: Optional[str] = None
    descripcion_profesional: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TerapeutaProfileResponse(BaseModel):
    """Respuesta para GET /api/v1/terapeutas/me."""
    user: UserResponse
    perfil_terapeuta: Optional[TerapeutaData] = None

    model_config = ConfigDict(from_attributes=True)


class AdministradorData(BaseModel):
    id_administrador: Optional[int] = None
    fecha_creacion: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminProfileResponse(BaseModel):
    """Respuesta para GET /api/v1/admin/me."""
    user: UserResponse
    perfil_admin: Optional[AdministradorData] = None

    model_config = ConfigDict(from_attributes=True)

"""Esquemas Pydantic para el CRUD administrativo de cuentas (/admin/cuentas)."""

from datetime import datetime
import re
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.perfiles import TerapeutaData, TutorData
from app.schemas.reglas import Password
from typing import Annotated
from pydantic import StringConstraints

InitialDni = Annotated[str, StringConstraints(pattern=r"^[0-9]{8}$")]

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class CrearPadreRequest(BaseModel):
    """Payload para creación administrativa de Padre/Tutor."""
    nombres: str = Field(..., min_length=1, max_length=60)
    apellidos: str = Field(..., min_length=1, max_length=80)
    email: str = Field(..., min_length=3, max_length=150)
    password: InitialDni | Password
    parentesco: Optional[str] = Field(None, max_length=30)
    telefono: Optional[str] = Field(None, max_length=12)
    direccion: Optional[str] = Field(None, max_length=200)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Formato de correo electrónico no válido.")
        return clean

    @field_validator("nombres", "apellidos")
    @classmethod
    def validate_names(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("El campo no puede estar vacío.")
        return clean


class CrearTerapeutaRequest(BaseModel):
    """Payload para creación administrativa de Terapeuta."""
    nombres: str = Field(..., min_length=1, max_length=60)
    apellidos: str = Field(..., min_length=1, max_length=80)
    email: str = Field(..., min_length=3, max_length=150)
    password: InitialDni | Password
    especialidad: Optional[str] = Field(None, max_length=100)
    anios_experiencia: Optional[int] = Field(None, ge=0, le=70)
    idiomas: Optional[str] = Field(None, max_length=50)
    descripcion_profesional: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Formato de correo electrónico no válido.")
        return clean

    @field_validator("nombres", "apellidos")
    @classmethod
    def validate_names(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("El campo no puede estar vacío.")
        return clean


class ActualizarCuentaRequest(BaseModel):
    """Payload para edición de cuenta administrativa."""
    nombres: Optional[str] = Field(None, max_length=60)
    apellidos: Optional[str] = Field(None, max_length=80)
    email: Optional[str] = Field(None, max_length=150)
    parentesco: Optional[str] = Field(None, max_length=30)
    telefono: Optional[str] = Field(None, max_length=12)
    direccion: Optional[str] = Field(None, max_length=200)
    especialidad: Optional[str] = Field(None, max_length=100)
    anios_experiencia: Optional[int] = Field(None, ge=0, le=70)
    idiomas: Optional[str] = Field(None, max_length=50)
    descripcion_profesional: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = v.strip().lower()
        if not clean:
            return None
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Formato de correo electrónico no válido.")
        return clean


class CuentaItemResponse(BaseModel):
    """Representación de una cuenta en el panel administrativo."""
    id_usuario: int
    codigo_usuario: str
    email: str
    nombres: str
    apellidos: str
    rol: str
    activo: bool
    fecha_creacion: datetime
    tutor: Optional[TutorData] = None
    terapeuta: Optional[TerapeutaData] = None

    model_config = ConfigDict(from_attributes=True)


class CuentaListResponse(BaseModel):
    """Respuesta para listar cuentas administrativas."""
    items: List[CuentaItemResponse]
    total: int


class OperacionCuentaResponse(BaseModel):
    """Respuesta tras realizar operaciones sobre cuentas."""
    message: str
    cuenta: Optional[CuentaItemResponse] = None

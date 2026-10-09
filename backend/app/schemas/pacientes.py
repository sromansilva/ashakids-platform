"""Esquemas Pydantic para el dominio de Pacientes (Hijos) y Perfiles Infantiles."""

from datetime import date, datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator, model_validator
from app.schemas.reglas import Nombre, Apellido, Nacimiento, Sexo

ALLOWED_AVATARS = {
    "zorro",
    "oso",
    "conejo",
    "panda",
    "leon",
    "koala",
    "tortuga",
    "buho",
    "mono",
    "pinguino",
}

ALLOWED_SEXO = {"Masculino", "Femenino", "Otro"}


class CrearHijoRequest(BaseModel):
    """Payload de creación de hijo por parte de un tutor."""
    nombres_paciente: Nombre
    apellidos_paciente: Apellido
    fecha_nacimiento: Nacimiento
    sexo: Sexo
    avatar_nombre: str = Field(default="zorro", max_length=20, description="Slug del avatar del catálogo")

    @model_validator(mode="before")
    @classmethod
    def alias_nombres(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "nombres" in data and "nombres_paciente" not in data:
                data["nombres_paciente"] = data["nombres"]
            if "apellidos" in data and "apellidos_paciente" not in data:
                data["apellidos_paciente"] = data["apellidos"]
        return data

    @field_validator("avatar_nombre")
    @classmethod
    def validar_avatar(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ALLOWED_AVATARS:
            raise ValueError(f"Avatar inválido. Opciones permitidas: {', '.join(sorted(ALLOWED_AVATARS))}")
        return v_clean


class ActualizarHijoRequest(BaseModel):
    """Payload de edición de hijo admitido por el tutor."""
    nombres_paciente: Nombre | None = None
    apellidos_paciente: Apellido | None = None
    fecha_nacimiento: Nacimiento | None = None
    sexo: Sexo | None = None
    avatar_nombre: Optional[str] = Field(None, max_length=20)

    @model_validator(mode="before")
    @classmethod
    def alias_nombres(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "nombres" in data and "nombres_paciente" not in data:
                data["nombres_paciente"] = data["nombres"]
            if "apellidos" in data and "apellidos_paciente" not in data:
                data["apellidos_paciente"] = data["apellidos"]
        return data

    @model_validator(mode="after")
    def campos_enviados_no_nulos(self):
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError("Los campos enviados no admiten null.")
        return self

    @field_validator("avatar_nombre")
    @classmethod
    def validar_avatar_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v_clean = v.strip().lower()
        if v_clean not in ALLOWED_AVATARS:
            raise ValueError(f"Avatar inválido. Opciones permitidas: {', '.join(sorted(ALLOWED_AVATARS))}")
        return v_clean


class PerfilInfantilResponse(BaseModel):
    """Métricas gamificadas y formativas asociadas al paciente."""
    id_perfil: int
    id_paciente: int
    progreso: float
    racha_dias: int
    objetivos_totales: int
    objetivos_completados: int
    actividades_desarrolladas_total: int
    sesiones_totales: int
    fecha_ultima_sesion: Optional[datetime] = None
    experiencia: int
    nivel: int

    model_config = ConfigDict(from_attributes=True)


class HijoItemResponse(BaseModel):
    """Información completa de un hijo/paciente."""
    id_paciente: int
    id_tutor: int
    nombres_paciente: str
    apellidos_paciente: str
    fecha_nacimiento: date
    edad: int
    sexo: str
    avatar_nombre: str
    activo: bool
    fecha_registro: datetime
    perfil: Optional[PerfilInfantilResponse] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def nombres(self) -> str:
        return self.nombres_paciente

    @computed_field
    @property
    def apellidos(self) -> str:
        return self.apellidos_paciente

    @computed_field
    @property
    def edad_anios(self) -> int:
        return self.edad


class HijoListResponse(BaseModel):
    """Lista de pacientes retornados."""
    items: List[HijoItemResponse]
    total: int


class OperacionHijoResponse(BaseModel):
    """Respuesta a mutaciones del CRUD de pacientes."""
    message: str
    paciente: Optional[HijoItemResponse] = None

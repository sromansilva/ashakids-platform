from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ValoracionCrear(BaseModel):
    model_config = ConfigDict(extra='forbid')
    calificacion: int = Field(ge=1, le=5, strict=True)
    comentario: str | None = Field(default=None, max_length=1000)

    @field_validator('comentario')
    @classmethod
    def limpiar(cls, value):
        return value.strip() or None if value is not None else None


class ValoracionSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_valoracion: int
    id_sesion: int
    calificacion: int
    comentario: str | None
    fecha_creacion: datetime


class ValoracionListado(ValoracionSalida):
    autor_nombre: str
    fecha_sesion: datetime

from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

TipoIncidencia = Literal["Funcional", "Visual / Diseño", "Carga / Rendimiento", "Error de datos", "Paciente / Agenda", "Otro"]


class IncidenciaCrear(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    envio_id: UUID
    tipo: TipoIncidencia
    titulo: str = Field(min_length=1, max_length=120)
    descripcion: str = Field(min_length=1, max_length=600)


class IncidenciaEstado(BaseModel):
    model_config = ConfigDict(extra="forbid")
    estado: Literal["LEIDA", "RESUELTA"]


class IncidenciaSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_incidencia: int
    tipo: str
    titulo: str
    descripcion: str
    estado: str
    fecha_creacion: datetime


class IncidenciaAdmin(IncidenciaSalida):
    usuario: str
    rol: str


class IncidenciasLista(BaseModel):
    items: list[IncidenciaAdmin]
    total: int

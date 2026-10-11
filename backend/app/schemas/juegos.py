from uuid import UUID
from typing import Literal
from pydantic import Field
from app.schemas.clinica import Entrada

AreaMundo = Literal["HABLA", "LENGUAJE", "FLUIDEZ", "VOZ", "OROFACIAL"]


class IntentoCrear(Entrada):
    clave_intento: UUID
    version: Literal["basica-1"]
    nivel: int = Field(ge=1, le=3)
    respuestas: list[str] = Field(min_length=1, max_length=4)
    duracion_segundos: int = Field(ge=0, le=3600)
    ayudas_usadas: int = Field(ge=0, le=100)

from datetime import datetime
from pydantic import AwareDatetime, Field, model_validator
from app.schemas.clinica import Entrada


class TurnoDatos(Entrada):
    dia: int = Field(ge=0, le=5)
    hora: int = Field(ge=8, le=17)


class BloqueoDatos(Entrada):
    inicio: AwareDatetime
    fin: AwareDatetime

    @model_validator(mode="after")
    def orden(self):
        if self.fin <= self.inicio:
            raise ValueError("El bloqueo debe terminar después de su inicio.")
        return self


class DisponibilidadDatos(Entrada):
    turnos: list[TurnoDatos] = Field(max_length=60)
    bloqueos: list[BloqueoDatos] = Field(default_factory=list, max_length=60)

    @model_validator(mode="after")
    def unicos(self):
        if len({(t.dia, t.hora) for t in self.turnos}) != len(self.turnos):
            raise ValueError("No repita turnos.")
        return self


class TurnoSalida(Entrada):
    inicio: datetime
    fin: datetime
    disponible: bool
    motivo: str | None = None

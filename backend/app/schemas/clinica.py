"""Contratos explícitos, fechas con zona horaria y límites de entrada."""
from datetime import date, datetime, timedelta
from typing import Annotated, Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, field_validator, model_validator
from app.schemas.reglas import Nombre, Apellido, Nacimiento, Sexo

Id = Annotated[int, Field(gt=0)]
Nota = Annotated[str, Field(max_length=10000)]


class Entrada(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Salida(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PacienteDatos(Entrada):
    nombres_paciente: Nombre
    apellidos_paciente: Apellido
    fecha_nacimiento: Nacimiento
    sexo: Sexo


class PacienteCrear(PacienteDatos):
    id_tutor: Id | None = None


class PacienteSalida(PacienteDatos, Salida):
    # Lectura tolerante de vocabulario/datos antiguos; no reescribirlos al consultar.
    nombres_paciente: str
    apellidos_paciente: str
    fecha_nacimiento: date
    sexo: str
    id_paciente: int
    id_tutor: int
    activo: bool
    fecha_registro: datetime


class TratamientoCrear(Entrada):
    id_paciente: Id
    id_terapeuta: Id
    nombre_tratamiento: str = Field(min_length=1, max_length=100)
    descripcion: Nota | None = None
    sesiones_recomendadas: int | None = Field(default=None, ge=0)
    fecha_inicio: date | None = None


class TratamientoSalida(Salida):
    id_paciente: int | None = None
    paciente_nombre: str | None = None
    terapeuta_nombre: str | None = None
    id_tratamiento: int
    id_expediente: int
    id_terapeuta: int
    nombre_tratamiento: str
    descripcion: str | None
    sesiones_recomendadas: int | None
    estado_tratamiento: str
    fecha_inicio: date | None
    fecha_fin: date | None


class CitaHorario(Entrada):
    fecha_hora_inicio: AwareDatetime
    fecha_hora_fin: AwareDatetime | None = None
    modalidad: Literal["VIRTUAL", "PRESENCIAL"]
    localizacion: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def intervalo_valido(self):
        expected = self.fecha_hora_inicio + timedelta(minutes=45)
        if self.fecha_hora_fin is not None and self.fecha_hora_fin != expected:
            raise ValueError("La cita dura 45 minutos.")
        self.fecha_hora_fin = expected
        return self


class CitaCrear(CitaHorario):
    id_tratamiento: Id | None = None
    id_paciente: Id | None = None
    id_terapeuta: Id | None = None
    tipo_cita: Literal["INTRODUCTORIA", "TERAPIA"] = "TERAPIA"

    @model_validator(mode="after")
    def destino(self):
        if self.tipo_cita == "INTRODUCTORIA":
            if self.id_tratamiento or not self.id_paciente or not self.id_terapeuta:
                raise ValueError("La introducción requiere niño y terapeuta, sin tratamiento.")
        elif not self.id_tratamiento:
            raise ValueError("La terapia requiere un plan.")
        return self


class CitaEstado(Entrada):
    estado_reserva: Literal["CONFIRMADA", "CANCELADA"]


class CitaSalida(Salida):
    paciente_nombre: str | None = None
    terapeuta_nombre: str | None = None
    id_sesion: int | None = None
    id_reserva: int
    id_paciente: int
    id_terapeuta: int
    id_tratamiento: int | None
    tipo_cita: str
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    modalidad: str
    localizacion: str | None
    estado_reserva: str
    fecha_creacion: datetime


class SesionCrear(Entrada):
    id_reserva: Id


class SesionCerrar(Entrada):
    asistencia: Literal["ASISTIO", "NO_ASISTIO"]


class SesionSalida(Salida):
    cita: CitaSalida | None = None
    reporte_disponible: bool = False
    id_sesion: int
    id_reserva: int
    fecha_hora_inicio_real: datetime | None
    fecha_hora_fin_real: datetime | None
    asistencia: str | None
    estado_sesion: str


class ReporteDatos(Entrada):
    observaciones_iniciales: Nota | None = None
    objetivos_trabajados: Nota | None = None
    nivel_ayuda: Nota | None = None
    proximos_pasos: Nota | None = None


class ReporteSalida(ReporteDatos, Salida):
    id_reporte_sesion: int
    id_sesion: int
    fecha_creacion: datetime

"""Contratos explícitos, fechas con zona horaria y límites de entrada."""
from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, field_validator, model_validator

Id = Annotated[int, Field(gt=0)]
Nota = Annotated[str, Field(max_length=10000)]


class Entrada(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Salida(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PacienteDatos(Entrada):
    nombres_paciente: str = Field(min_length=1, max_length=60)
    apellidos_paciente: str = Field(min_length=1, max_length=80)
    fecha_nacimiento: date
    sexo: str = Field(min_length=1, max_length=10)

    @field_validator("fecha_nacimiento")
    @classmethod
    def nacimiento_no_futuro(cls, value):
        if value > date.today():
            raise ValueError("La fecha de nacimiento no puede ser futura.")
        return value


class PacienteCrear(PacienteDatos):
    id_tutor: Id | None = None


class PacienteSalida(PacienteDatos, Salida):
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
    fecha_hora_fin: AwareDatetime
    modalidad: Literal["VIRTUAL", "PRESENCIAL"]
    localizacion: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def intervalo_valido(self):
        if self.fecha_hora_fin <= self.fecha_hora_inicio:
            raise ValueError("El fin debe ser posterior al inicio.")
        return self


class CitaCrear(CitaHorario):
    id_tratamiento: Id


class CitaEstado(Entrada):
    estado_reserva: Literal["CONFIRMADA", "CANCELADA"]


class CitaSalida(Salida):
    paciente_nombre: str | None = None
    terapeuta_nombre: str | None = None
    id_sesion: int | None = None
    id_reserva: int
    id_paciente: int
    id_terapeuta: int
    id_tratamiento: int
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

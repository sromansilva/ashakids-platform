from datetime import datetime
from pydantic import Field, field_validator
from app.schemas.clinica import Entrada, Id, Salida


class ConversacionCrear(Entrada):
    id_tutor: Id = Field(le=2147483647)
    id_terapeuta: Id = Field(le=2147483647)


class ContactoSalida(Salida):
    id_tutor: int
    id_terapeuta: int
    tutor_nombre: str
    terapeuta_nombre: str


class ConversacionSalida(ContactoSalida):
    id_conversacion: int
    estado: str
    ultima_actividad: datetime
    puede_enviar: bool
    id_usuario_tutor: int
    id_usuario_terapeuta: int


class MensajeCrear(Entrada):
    texto_mensaje: str = Field(min_length=1, max_length=4000)

    @field_validator('texto_mensaje')
    @classmethod
    def texto_valido(cls, value):
        if not value.strip() or '\x00' in value:
            raise ValueError('Escribe un mensaje válido, sin caracteres nulos.')
        return value


class MensajeSalida(Salida):
    id_mensaje: int
    id_conversacion: int
    id_usuario_emisor: int | None
    texto_mensaje: str | None
    fecha_envio: datetime


class MensajesPagina(Salida):
    items: list[MensajeSalida]
    next_before_id: int | None


class ConversacionesPagina(Salida):
    items: list[ConversacionSalida]
    next_before_id: int | None

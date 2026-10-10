from datetime import datetime
from typing import Literal
from pydantic import StrictBool
from app.schemas.clinica import Entrada, Salida


class PreferenciasDatos(Entrada):
    nueva_cita: StrictBool = True
    cancelacion: StrictBool = True
    reprogramacion: StrictBool = True
    recordatorio: StrictBool = True
    mensajes: StrictBool = True


class NotificacionSalida(Salida):
    id_notificacion: int
    tipo: Literal['NUEVA_CITA', 'CANCELACION', 'REPROGRAMACION', 'RECORDATORIO', 'MENSAJE']
    titulo: str
    texto: str
    id_reserva: int | None
    id_conversacion: int | None
    fecha_creacion: datetime
    leida_en: datetime | None


class BandejaSalida(Entrada):
    items: list[NotificacionSalida]
    total: int
    sin_leer: int

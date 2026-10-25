"""Avisos internos y preferencias; migración explícita, sin DDL en runtime."""
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class PreferenciasNotificacion(Base):
    __tablename__ = 'preferencias_notificacion'
    id_usuario: Mapped[int] = mapped_column(ForeignKey('usuarios.id_usuario', ondelete='CASCADE'), primary_key=True)
    nueva_cita: Mapped[bool] = mapped_column(Boolean, server_default='true')
    cancelacion: Mapped[bool] = mapped_column(Boolean, server_default='true')
    reprogramacion: Mapped[bool] = mapped_column(Boolean, server_default='true')
    recordatorio: Mapped[bool] = mapped_column(Boolean, server_default='true')
    mensajes: Mapped[bool] = mapped_column(Boolean, server_default='true')


class Notificacion(Base):
    __tablename__ = 'notificaciones'
    __table_args__ = (UniqueConstraint('id_usuario', 'clave_evento', name='uq_notificacion_evento'),)
    id_notificacion: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(ForeignKey('usuarios.id_usuario', ondelete='CASCADE'))
    tipo: Mapped[str] = mapped_column(String(30))
    titulo: Mapped[str] = mapped_column(String(120))
    texto: Mapped[str] = mapped_column(Text)
    id_reserva: Mapped[int | None] = mapped_column(ForeignKey('reservas.id_reserva', ondelete='CASCADE'))
    id_conversacion: Mapped[int | None] = mapped_column(ForeignKey('conversaciones.id_conversacion', ondelete='CASCADE'))
    clave_evento: Mapped[str] = mapped_column(String(160))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    leida_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

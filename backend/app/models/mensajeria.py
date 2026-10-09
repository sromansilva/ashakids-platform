"""Mapeo de conversaciones/mensajes existentes; no ejecuta DDL."""
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Conversacion(Base):
    __tablename__ = 'conversaciones'
    id_conversacion: Mapped[int] = mapped_column(primary_key=True)
    id_tutor: Mapped[int] = mapped_column(ForeignKey('tutores.id_tutor'))
    id_terapeuta: Mapped[int | None] = mapped_column(ForeignKey('terapeutas.id_terapeuta'))
    estado: Mapped[str] = mapped_column(String(20))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ultima_actividad: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    fecha_archivado: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Mensaje(Base):
    __tablename__ = 'mensajes'
    id_mensaje: Mapped[int] = mapped_column(primary_key=True)
    id_conversacion: Mapped[int] = mapped_column(ForeignKey('conversaciones.id_conversacion'))
    id_usuario_emisor: Mapped[int | None] = mapped_column(ForeignKey('usuarios.id_usuario'))
    texto_mensaje: Mapped[str | None] = mapped_column(Text)
    fecha_envio: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    leido: Mapped[bool] = mapped_column(Boolean, server_default='false')

"""Mapeo de conversaciones/mensajes existentes; no ejecuta DDL."""
from datetime import datetime
from uuid import UUID
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, LargeBinary, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
    adjuntos: Mapped[list['MensajeAdjunto']] = relationship(lazy='raise')


class MensajeAdjunto(Base):
    __tablename__ = 'mensaje_adjuntos'
    id_adjunto: Mapped[int] = mapped_column(primary_key=True)
    id_mensaje: Mapped[int] = mapped_column(ForeignKey('mensajes.id_mensaje'))
    url_archivo: Mapped[str] = mapped_column(String(255))
    nombre_archivo: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(100))
    tamano_bytes: Mapped[int] = mapped_column(BigInteger)
    duracion_segundos: Mapped[int | None]
    contenido: Mapped[bytes | None] = mapped_column(LargeBinary, deferred=True)
    clave_envio: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), unique=True)
    sha256: Mapped[str | None] = mapped_column(String(64))

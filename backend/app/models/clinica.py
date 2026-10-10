"""Mapeo de tablas clínicas existentes; no ejecuta DDL ni crea diagnósticos."""
from datetime import date, datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Expediente(Base):
    __tablename__ = "expedientes"
    id_expediente: Mapped[int] = mapped_column(primary_key=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("pacientes.id_paciente"), unique=True)
    historial_clinico: Mapped[str | None] = mapped_column(Text)
    diagnostico_inicial: Mapped[str | None] = mapped_column(Text)
    fecha_apertura: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Tratamiento(Base):
    __tablename__ = "tratamientos"
    id_tratamiento: Mapped[int] = mapped_column(primary_key=True)
    id_expediente: Mapped[int] = mapped_column(ForeignKey("expedientes.id_expediente"))
    id_terapeuta: Mapped[int] = mapped_column(ForeignKey("terapeutas.id_terapeuta"))
    nombre_tratamiento: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[str | None] = mapped_column(Text)
    sesiones_recomendadas: Mapped[int | None]
    estado_tratamiento: Mapped[str] = mapped_column(String(20))
    fecha_inicio: Mapped[date | None]
    fecha_fin: Mapped[date | None]
    observaciones_cierre: Mapped[str | None] = mapped_column(Text)
    id_sesion_origen: Mapped[int | None] = mapped_column(ForeignKey("sesiones.id_sesion"), unique=True)
    area: Mapped[str | None] = mapped_column(String(20))
    mundos_asignados: Mapped[list[str]] = mapped_column(JSONB, default=list, server_default="[]")


class Reserva(Base):
    __tablename__ = "reservas"
    id_reserva: Mapped[int] = mapped_column(primary_key=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("pacientes.id_paciente"))
    id_terapeuta: Mapped[int] = mapped_column(ForeignKey("terapeutas.id_terapeuta"))
    id_tratamiento: Mapped[int | None] = mapped_column(ForeignKey("tratamientos.id_tratamiento"))
    tipo_cita: Mapped[str] = mapped_column(String(20), default="TERAPIA", server_default="TERAPIA")
    fecha_hora_inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    fecha_hora_fin: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    modalidad: Mapped[str] = mapped_column(String(10))
    localizacion: Mapped[str | None] = mapped_column(String(255))
    zoom_meeting_id: Mapped[str | None] = mapped_column(String(8))
    zoom_join_url: Mapped[str | None] = mapped_column(String(255))
    estado_reserva: Mapped[str] = mapped_column(String(20))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Sesion(Base):
    __tablename__ = "sesiones"
    id_sesion: Mapped[int] = mapped_column(primary_key=True)
    id_reserva: Mapped[int] = mapped_column(ForeignKey("reservas.id_reserva"), unique=True)
    fecha_hora_inicio_real: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    fecha_hora_fin_real: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    asistencia: Mapped[str | None] = mapped_column(String(20))
    estado_sesion: Mapped[str] = mapped_column(String(20))


class ReporteSesion(Base):
    __tablename__ = "reportes_sesion"
    id_reporte_sesion: Mapped[int] = mapped_column(primary_key=True)
    id_sesion: Mapped[int] = mapped_column(ForeignKey("sesiones.id_sesion"), unique=True)
    observaciones_iniciales: Mapped[str | None] = mapped_column(Text)
    objetivos_trabajados: Mapped[str | None] = mapped_column(Text)
    nivel_ayuda: Mapped[str | None] = mapped_column(Text)
    proximos_pasos: Mapped[str | None] = mapped_column(Text)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

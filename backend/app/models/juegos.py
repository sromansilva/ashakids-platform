"""Tablas educativas existentes: asignación por paciente, niveles e intentos."""
from datetime import datetime
from uuid import UUID
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Actividad(Base):
    __tablename__ = "actividades"
    id_actividad: Mapped[int] = mapped_column(primary_key=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("pacientes.id_paciente"))
    nombre_actividad: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[str | None] = mapped_column(Text)
    fecha_asignacion: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    estado_actividad: Mapped[str] = mapped_column(String(20))
    codigo_juego: Mapped[str | None] = mapped_column(String(40))
    version_contenido: Mapped[str | None] = mapped_column(String(30))


class Objetivo(Base):
    __tablename__ = "objetivos"
    id_objetivo: Mapped[int] = mapped_column(primary_key=True)
    id_actividad: Mapped[int] = mapped_column(ForeignKey("actividades.id_actividad"))
    titulo: Mapped[str] = mapped_column(String(150))
    descripcion: Mapped[str | None] = mapped_column(Text)
    resultados_objetivo: Mapped[dict | None] = mapped_column(JSONB)


class Mundo(Base):
    __tablename__ = "mundos"
    id_mundo: Mapped[int] = mapped_column(primary_key=True)
    id_actividad: Mapped[int] = mapped_column(ForeignKey("actividades.id_actividad"))
    nombre_mundo: Mapped[str] = mapped_column(String(50))
    descripcion: Mapped[str | None] = mapped_column(Text)
    objetivo: Mapped[str | None] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(default=True)


class Nivel(Base):
    __tablename__ = "niveles"
    id_nivel: Mapped[int] = mapped_column(primary_key=True)
    id_mundo: Mapped[int] = mapped_column(ForeignKey("mundos.id_mundo"))
    nombre_nivel: Mapped[str] = mapped_column(String(100))
    orden: Mapped[int]
    objetivo: Mapped[str | None] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(default=True)


class ResultadoNivel(Base):
    __tablename__ = "resultados_nivel"
    id_resultado_nivel: Mapped[int] = mapped_column(primary_key=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("pacientes.id_paciente"))
    id_nivel: Mapped[int] = mapped_column(ForeignKey("niveles.id_nivel"))
    numero_intento: Mapped[int]
    puntaje: Mapped[int | None]
    estrellas_obtenidas: Mapped[int | None]
    detalle_resultados: Mapped[dict | None] = mapped_column(JSONB)
    fecha_realizacion: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    clave_intento: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), unique=True)
    experiencia_otorgada: Mapped[int] = mapped_column(default=0)

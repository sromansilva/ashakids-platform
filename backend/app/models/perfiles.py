"""Modelos SQLAlchemy 2.x correspondientes a Perfiles, Logros, PerfilLogros y Pacientes."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Numeric,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tutor(Base):
    """Tabla 'tutores' en PostgreSQL (Perfil de Padre / Tutor)."""
    __tablename__ = "tutores"

    id_tutor: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id_usuario"), unique=True, nullable=False)
    parentesco: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    telefono: Mapped[Optional[str]] = mapped_column(String(12), nullable=True)
    direccion: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)


class Terapeuta(Base):
    """Tabla 'terapeutas' en PostgreSQL (Perfil de Especialista Clínico)."""
    __tablename__ = "terapeutas"

    id_terapeuta: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id_usuario"), unique=True, nullable=False)
    especialidad: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    anios_experiencia: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    idiomas: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    descripcion_profesional: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Paciente(Base):
    """Tabla 'pacientes' en PostgreSQL."""
    __tablename__ = "pacientes"

    id_paciente: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_tutor: Mapped[int] = mapped_column(Integer, ForeignKey("tutores.id_tutor"), nullable=False)
    nombres_paciente: Mapped[str] = mapped_column(String(60), nullable=False)
    apellidos_paciente: Mapped[str] = mapped_column(String(80), nullable=False)
    fecha_nacimiento: Mapped[date] = mapped_column(Date, nullable=False)
    sexo: Mapped[str] = mapped_column(String(10), nullable=False)
    avatar_nombre: Mapped[str] = mapped_column(
        String(20), default="zorro", server_default="'zorro'::character varying", nullable=False
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relación N:1 con Tutor
    tutor: Mapped["Tutor"] = relationship("Tutor", foreign_keys=[id_tutor])

    # Relación 1:1 con Perfil
    perfil: Mapped[Optional["Perfil"]] = relationship(
        "Perfil", back_populates="paciente", uselist=False
    )


class Perfil(Base):
    """Tabla 'perfiles' en PostgreSQL (Relación 1:1 con Pacientes)."""
    __tablename__ = "perfiles"

    id_perfil: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(
        Integer, ForeignKey("pacientes.id_paciente"), unique=True, nullable=False
    )
    progreso: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal('0.00'), nullable=False)
    racha_dias: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    objetivos_totales: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    objetivos_completados: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    actividades_desarrolladas_total: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sesiones_totales: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fecha_ultima_sesion: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    experiencia: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    nivel: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relaciones
    paciente: Mapped["Paciente"] = relationship("Paciente", back_populates="perfil")
    perfil_logros: Mapped[List["PerfilLogro"]] = relationship(
        "PerfilLogro", back_populates="perfil", cascade="all, delete-orphan"
    )


class Logro(Base):
    """Tabla 'logros' en PostgreSQL."""
    __tablename__ = "logros"

    id_logro: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre_logro: Mapped[str] = mapped_column(String(100), nullable=False)
    experiencia_logro: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    requisito_logro: Mapped[str] = mapped_column(Text, nullable=False)
    icono_logro: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relaciones
    perfil_logros: Mapped[List["PerfilLogro"]] = relationship(
        "PerfilLogro", back_populates="logro", cascade="all, delete-orphan"
    )


class PerfilLogro(Base):
    """Tabla 'perfil_logros' en PostgreSQL (Relación N:M entre Perfiles y Logros)."""
    __tablename__ = "perfil_logros"
    __table_args__ = (
        UniqueConstraint("id_perfil", "id_logro", name="uq_perfil_logro"),
    )

    id_perfil_logro: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_perfil: Mapped[int] = mapped_column(Integer, ForeignKey("perfiles.id_perfil"), nullable=False)
    id_logro: Mapped[int] = mapped_column(Integer, ForeignKey("logros.id_logro"), nullable=False)
    fecha_obtencion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    perfil: Mapped["Perfil"] = relationship("Perfil", back_populates="perfil_logros")
    logro: Mapped["Logro"] = relationship("Logro", back_populates="perfil_logros")

"""Modelos SQLAlchemy 2.x correspondientes al esquema exacto de ASHAKids."""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Usuario(Base):
    """Tabla 'usuarios' en PostgreSQL."""
    __tablename__ = "usuarios"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombres: Mapped[str] = mapped_column(String(60), nullable=False)
    apellidos: Mapped[str] = mapped_column(String(80), nullable=False)
    codigo_usuario: Mapped[str] = mapped_column(String(6), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    roles_asignados: Mapped[List["UsuarioRol"]] = relationship(
        "UsuarioRol",
        back_populates="usuario",
        cascade="all, delete-orphan",
        foreign_keys="[UsuarioRol.id_usuario]",
    )
    sesiones: Mapped[List["SesionAutenticacion"]] = relationship(
        "SesionAutenticacion",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )


class Rol(Base):
    """Tabla 'roles' en PostgreSQL (PADRE, TERAPEUTA, ADMIN)."""
    __tablename__ = "roles"

    id_rol: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre_rol: Mapped[str] = mapped_column(String(12), unique=True, nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    usuarios_asignados: Mapped[List["UsuarioRol"]] = relationship(
        "UsuarioRol", back_populates="rol"
    )


class Administrador(Base):
    """Tabla 'administradores' en PostgreSQL."""
    __tablename__ = "administradores"

    id_administrador: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class UsuarioRol(Base):
    """Tabla 'usuario_roles' en PostgreSQL (tabla intermedia de asignación de roles)."""
    __tablename__ = "usuario_roles"

    id_usuario_rol: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_rol: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    asignado_por: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("administradores.id_administrador"), nullable=True
    )
    fecha_asignacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relaciones
    usuario: Mapped["Usuario"] = relationship(
        "Usuario", back_populates="roles_asignados", foreign_keys=[id_usuario]
    )
    rol: Mapped["Rol"] = relationship("Rol", back_populates="usuarios_asignados")


class SesionAutenticacion(Base):
    """Tabla 'sesiones_autenticacion' para gestión de sesiones sin Supabase Auth."""
    __tablename__ = "sesiones_autenticacion"

    id_sesion_auth: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    fecha_emision: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    fecha_expiracion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ultima_actividad: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    mfa_verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revocado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fecha_cierre: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relación
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="sesiones")

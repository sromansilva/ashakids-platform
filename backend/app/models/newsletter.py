"""Modelo para suscripciones de boletín con doble confirmación."""

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class SuscripcionBoletin(Base):
    __tablename__ = "suscripciones_boletin"

    id_suscripcion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    correo: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    estado: Mapped[str] = mapped_column(String(10), nullable=False, default="PENDIENTE")
    token_confirmacion_hash: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    token_confirmacion_expira: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    token_baja_hash: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    consentimiento_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    confirmado_en: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    baja_en: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

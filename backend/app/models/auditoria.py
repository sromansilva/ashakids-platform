"""Modelo SQLAlchemy para la tabla central de auditoría del sistema."""

from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditoriaCambios(Base):
    """Tabla 'auditoria_cambios' en PostgreSQL."""
    __tablename__ = "auditoria_cambios"

    id_auditoria: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario_actor: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True
    )
    nombre_tabla: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre_entidad: Mapped[str] = mapped_column(String(50), nullable=False)
    accion: Mapped[str] = mapped_column(String(12), nullable=False)
    datos_anteriores: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    datos_nuevos: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    fecha_evento: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

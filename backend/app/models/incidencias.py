"""Reportes enviados por usuarios, separados de la información clínica."""
from datetime import datetime
from uuid import UUID
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Incidencia(Base):
    __tablename__ = "incidencias"
    __table_args__ = (
        CheckConstraint("rol IN ('PADRE','TERAPEUTA')", name="incidencias_rol_ck"),
        CheckConstraint("tipo IN ('Funcional','Visual / Diseño','Carga / Rendimiento','Error de datos','Paciente / Agenda','Otro')", name="incidencias_tipo_ck"),
        CheckConstraint("estado IN ('NUEVA','LEIDA','RESUELTA')", name="incidencias_estado_ck"),
        CheckConstraint("char_length(trim(titulo)) BETWEEN 1 AND 120", name="incidencias_titulo_ck"),
        CheckConstraint("char_length(trim(descripcion)) BETWEEN 1 AND 600", name="incidencias_descripcion_ck"),
        Index("incidencias_fecha_idx", "fecha_creacion", "id_incidencia"),
    )
    id_incidencia: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_usuario: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), index=True)
    envio_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), unique=True)
    rol: Mapped[str] = mapped_column(String(12))
    tipo: Mapped[str] = mapped_column(String(30))
    titulo: Mapped[str] = mapped_column(String(120))
    descripcion: Mapped[str] = mapped_column(String(600))
    estado: Mapped[str] = mapped_column(String(12), default="NUEVA", server_default="NUEVA")
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

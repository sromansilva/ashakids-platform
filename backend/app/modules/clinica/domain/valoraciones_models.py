from datetime import datetime
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Valoracion(Base):
    __tablename__ = 'valoraciones_sesion'
    __table_args__ = (CheckConstraint('calificacion BETWEEN 1 AND 5', name='valoraciones_calificacion_ck'),)
    id_valoracion: Mapped[int] = mapped_column(primary_key=True)
    id_sesion: Mapped[int] = mapped_column(ForeignKey('sesiones.id_sesion'), unique=True)
    id_usuario: Mapped[int] = mapped_column(ForeignKey('usuarios.id_usuario'), index=True)
    calificacion: Mapped[int]
    comentario: Mapped[str | None] = mapped_column(String(1000))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

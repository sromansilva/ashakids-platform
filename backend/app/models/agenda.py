"""Disponibilidad semanal y excepciones; horas de inicio en America/Lima."""
from datetime import datetime
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class TurnoSemanal(Base):
    __tablename__ = "turnos_semanales"
    __table_args__ = (UniqueConstraint("id_terapeuta", "dia", "hora"),
                      CheckConstraint("dia BETWEEN 0 AND 6", name="turnos_semanales_dia_check"))
    id_turno: Mapped[int] = mapped_column(primary_key=True)
    id_terapeuta: Mapped[int] = mapped_column(ForeignKey("terapeutas.id_terapeuta"))
    dia: Mapped[int]
    hora: Mapped[int]


class BloqueoAgenda(Base):
    __tablename__ = "bloqueos_agenda"
    id_bloqueo: Mapped[int] = mapped_column(primary_key=True)
    id_terapeuta: Mapped[int] = mapped_column(ForeignKey("terapeutas.id_terapeuta"))
    inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    fin: Mapped[datetime] = mapped_column(DateTime(timezone=True))

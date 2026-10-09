"""Filtros aditivos: se aplican después de restringir los recursos por identidad."""
from typing import Annotated
from fastapi import Depends, Query
from pydantic import AwareDatetime
from app.models.clinica import Reserva


class FiltrosAgenda:
    def __init__(self, paciente: Annotated[int | None, Query(gt=0)] = None,
                 terapeuta: Annotated[int | None, Query(gt=0)] = None,
                 estado: str | None = None, desde: AwareDatetime | None = None,
                 hasta: AwareDatetime | None = None):
        self.paciente, self.terapeuta, self.estado = paciente, terapeuta, estado
        self.desde, self.hasta = desde, hasta

    def aplicar(self, stmt, estado_column):
        for value, column in [(self.paciente, Reserva.id_paciente),
                              (self.terapeuta, Reserva.id_terapeuta),
                              (self.estado, estado_column)]:
            if value is not None:
                stmt = stmt.where(column == value)
        if self.desde is not None:
            stmt = stmt.where(Reserva.fecha_hora_inicio >= self.desde)
        if self.hasta is not None:
            stmt = stmt.where(Reserva.fecha_hora_inicio <= self.hasta)
        return stmt


Agenda = Annotated[FiltrosAgenda, Depends()]

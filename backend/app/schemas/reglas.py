"""Reglas compartidas para establecer credenciales y escribir datos del paciente."""
from datetime import date
from typing import Annotated

from pydantic import AfterValidator, StringConstraints

Password = Annotated[str, StringConstraints(strip_whitespace=False, min_length=12, max_length=128)]
Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
Apellido = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]


def nacimiento_valido(value: date) -> date:
    if value > date.today():
        raise ValueError("La fecha de nacimiento no puede ser futura.")
    # No rechazar datos anteriores porque el paciente hoy ya sea mayor de edad.
    return value


def sexo_normalizado(value: str) -> str:
    aliases = {"m": "Masculino", "masculino": "Masculino", "f": "Femenino",
               "femenino": "Femenino", "otro": "Otro"}
    try:
        return aliases[value.strip().lower()]
    except KeyError:
        raise ValueError("Sexo inválido: M, F, OTRO, Masculino, Femenino u Otro.") from None


Nacimiento = Annotated[date, AfterValidator(nacimiento_valido)]
Sexo = Annotated[str, AfterValidator(sexo_normalizado)]

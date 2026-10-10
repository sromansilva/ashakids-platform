"""Alta administrativa de familia con contraseña inicial específica, sin DNI persistido."""
from pydantic import EmailStr, Field
from app.schemas.admin import InitialDni
from app.schemas.clinica import Entrada, PacienteDatos, PacienteSalida
from app.schemas.reglas import Nombre, Apellido
from app.schemas.admin import CuentaItemResponse


class FamiliaCrear(Entrada):
    nombres: Nombre
    apellidos: Apellido
    email: EmailStr = Field(max_length=150)
    dni: InitialDni
    parentesco: str | None = Field(default=None, max_length=30)
    telefono: str | None = Field(default=None, max_length=12)
    direccion: str | None = Field(default=None, max_length=200)
    hijos: list[PacienteDatos] = Field(min_length=1, max_length=20)


class FamiliaCreada(Entrada):
    cuenta: CuentaItemResponse
    hijos: list[PacienteSalida]
    message: str

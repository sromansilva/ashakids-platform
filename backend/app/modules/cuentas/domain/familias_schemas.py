"""Alta administrativa de familia con creación de contraseña mediante correo."""
from pydantic import EmailStr, Field
from app.modules.cuentas.domain.admin_schemas import InitialDni
from app.modules.clinica.domain.clinica_schemas import Entrada, PacienteDatos, PacienteSalida
from app.shared.domain.reglas import Nombre, Apellido
from app.modules.cuentas.domain.admin_schemas import CuentaItemResponse


class FamiliaCrear(Entrada):
    nombres: Nombre
    apellidos: Apellido
    email: EmailStr = Field(max_length=150)
    dni: InitialDni | None = None
    parentesco: str | None = Field(default=None, max_length=30)
    telefono: str | None = Field(default=None, max_length=12)
    direccion: str | None = Field(default=None, max_length=200)
    hijos: list[PacienteDatos] = Field(min_length=1, max_length=20)


class FamiliaCreada(Entrada):
    cuenta: CuentaItemResponse
    hijos: list[PacienteSalida]
    message: str
    correo_bienvenida: str | None = None

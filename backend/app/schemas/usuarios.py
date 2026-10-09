from typing import Literal
from pydantic import EmailStr, Field, model_validator
from app.schemas.clinica import Entrada, Salida
from app.schemas.reglas import Password


class UsuarioCrear(Entrada):
    nombres: str = Field(min_length=1, max_length=60)
    apellidos: str = Field(min_length=1, max_length=80)
    email: EmailStr = Field(max_length=150)
    codigo_usuario: str = Field(pattern=r"^[a-zA-Z0-9]{6}$")
    password: Password
    rol: Literal["PADRE", "TERAPEUTA", "ADMIN"]


class UsuarioEditar(Entrada):
    nombres: str | None = Field(default=None, min_length=1, max_length=60)
    apellidos: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailStr | None = Field(default=None, max_length=150)
    activo: bool | None = None
    password: Password | None = None

    @model_validator(mode="after")
    def sin_nulos(self):
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError("Los campos enviados no admiten null.")
        return self


class UsuarioSalida(Salida):
    id_usuario: int
    nombres: str
    apellidos: str
    codigo_usuario: str
    email: str
    activo: bool
    roles: list[str]
    id_tutor: int | None = None
    id_terapeuta: int | None = None

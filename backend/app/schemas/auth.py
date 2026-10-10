"""Esquemas Pydantic para el subsistema de autenticación y usuarios."""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.reglas import Password


class LoginRequest(BaseModel):
    """Payload para solicitud de inicio de sesión mediante código de usuario único (VARCHAR(6))."""
    codigo_usuario: str = Field(max_length=64)
    password: str = Field(max_length=128)


class UserResponse(BaseModel):
    """Información segura del usuario autenticado (nunca expone password_hash)."""
    id_usuario: int
    email: str
    nombres: str
    apellidos: str
    codigo_usuario: Optional[str] = None
    rol: str
    roles: List[str] = []
    activo: bool = True
    password_change_required: bool = False

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    """Respuesta tras login o verificación de sesión."""
    user: UserResponse
    message: str


class MessageResponse(BaseModel):
    """Respuesta genérica de éxito o confirmación."""
    message: str
    success: bool = True


class ActivationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    current_password: str = Field(min_length=1, max_length=128)
    new_password: Password

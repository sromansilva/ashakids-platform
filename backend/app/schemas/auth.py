"""Esquemas Pydantic para el subsistema de autenticación y usuarios."""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class LoginRequest(BaseModel):
    """Payload para solicitud de inicio de sesión."""
    email: str
    password: str


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

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    """Respuesta tras login o verificación de sesión."""
    user: UserResponse
    message: str


class MessageResponse(BaseModel):
    """Respuesta genérica de éxito o confirmación."""
    message: str
    success: bool = True

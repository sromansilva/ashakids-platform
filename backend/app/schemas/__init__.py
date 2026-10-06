"""Paquete de esquemas Pydantic."""

from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    UserResponse,
)
from app.schemas.perfiles import (
    AdminProfileResponse,
    AdministradorData,
    PadreProfileResponse,
    TerapeutaData,
    TerapeutaProfileResponse,
    TutorData,
)

__all__ = [
    "LoginRequest",
    "UserResponse",
    "AuthResponse",
    "MessageResponse",
    "TutorData",
    "PadreProfileResponse",
    "TerapeutaData",
    "TerapeutaProfileResponse",
    "AdministradorData",
    "AdminProfileResponse",
]

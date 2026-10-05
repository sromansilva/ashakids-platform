from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Directorio base del backend para resolver .env de manera determinista
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "ASHAKids API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Conexión a PostgreSQL en Supabase mediante SQLAlchemy 2.x
    DATABASE_URL: str = ""

    # Configuración de Sesión y Cookies HttpOnly
    SESSION_COOKIE_NAME: str = "ashakids_session"
    SESSION_EXPIRE_HOURS: int = 24

    # Orígenes CORS permitidos para comunicación con React + Vite
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Credenciales de infraestructura Supabase (si se requieren para servicios adicionales)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

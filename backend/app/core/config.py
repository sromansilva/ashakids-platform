from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Directorio base del backend para resolver .env de manera determinista
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "ASHAKids API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Credenciales de infraestructura Supabase / PostgreSQL
    # Cargadas automáticamente desde backend/.env o variables de entorno del sistema
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

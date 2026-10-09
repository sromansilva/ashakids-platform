from pathlib import Path
from typing import Annotated, List, Optional, Union
import urllib.parse
import json
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# Directorio base del backend para resolver .env de manera determinista
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Ashakids API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = Field(default=8000, ge=1, le=65535)
    ENVIRONMENT: str = "development"

    # Conexión directa a PostgreSQL mediante DATABASE_URL
    DATABASE_URL: str = ""
    DB_SSL_CA_FILE: Optional[str] = None
    DB_SSL_LEGACY_CA: bool = False
    DB_CONNECT_TIMEOUT: int = Field(default=10, ge=1, le=60)
    DB_COMMAND_TIMEOUT: int = Field(default=15, ge=1, le=120)
    DB_POOL_TIMEOUT: int = Field(default=10, ge=1, le=60)
    LOGIN_IP_LIMIT: int = Field(default=30, ge=1, le=1000)
    LOGIN_PAIR_LIMIT: int = Field(default=5, ge=1, le=100)
    LOGIN_WINDOW_SECONDS: int = Field(default=300, ge=1, le=3600)
    LOGIN_LIMITER_MAX_KEYS: int = Field(default=10000, ge=100, le=100000)
    # La implementación en memoria exige un solo proceso hasta disponer de gateway compartido.
    WEB_CONCURRENCY: int = Field(default=1, ge=1)

    # Parámetros individuales de PostgreSQL (Soporta mayúsculas y minúsculas)
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[int] = None
    DB_NAME: Optional[str] = None

    user: Optional[str] = None
    password: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None

    # Configuración de Sesión y Cookies HttpOnly
    SESSION_COOKIE_NAME: str = "ashakids_session"
    SESSION_EXPIRE_HOURS: int = Field(default=24, ge=1, le=168)

    # Orígenes CORS permitidos para comunicación con React + Vite
    CORS_ORIGINS: Annotated[List[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Vite selects the next free port when 5173 is already occupied.
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ]

    # Credenciales de infraestructura Supabase (si se requieren para servicios adicionales)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @field_validator("ENVIRONMENT")
    @classmethod
    def known_environment(cls, value):
        value = value.strip().lower()
        if value not in {"development", "test", "production"}:
            raise ValueError("ENVIRONMENT debe ser development, test o production.")
        return value

    @model_validator(mode="after")
    def production_guardrails(self):
        if self.DB_SSL_LEGACY_CA and not self.DB_SSL_CA_FILE:
            raise ValueError("La compatibilidad CA legado exige DB_SSL_CA_FILE explícita.")
        if any("*" in origin for origin in self.CORS_ORIGINS):
            raise ValueError("CORS con credenciales exige orígenes explícitos.")
        if self.is_production:
            for origin in self.CORS_ORIGINS:
                parsed = urllib.parse.urlsplit(origin)
                if (parsed.scheme != "https" or not parsed.hostname or parsed.username
                    or parsed.password or parsed.path or parsed.query or parsed.fragment):
                    raise ValueError("Producción exige orígenes HTTPS explícitos sin rutas.")
            if not self.CORS_ORIGINS or not self.effective_database_url:
                raise ValueError("Producción exige BD y al menos un origen HTTPS.")
            if self.WEB_CONCURRENCY != 1:
                raise ValueError("El limitador local de login exige WEB_CONCURRENCY=1.")
        return self

    @property
    def effective_database_url(self) -> str:
        """Determina la URL de base de datos activa para SQLAlchemy 2.x + asyncpg.
        
        Prioriza DATABASE_URL si está presente; de lo contrario ensambla a partir de
        host, port, database, user y password (codificando caracteres especiales).
        """
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url

        u = self.DB_USER or self.user
        p = self.DB_PASSWORD or self.password
        h = self.DB_HOST or self.host
        pt = self.DB_PORT or self.port or 5432
        db = self.DB_NAME or self.database

        if u and p and h and db:
            encoded_password = urllib.parse.quote_plus(p)
            return f"postgresql+asyncpg://{u}:{encoded_password}@{h}:{pt}/{db}"

        return ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, str):
            return json.loads(v)
        elif isinstance(v, (list, str)):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        # PORT es el puerto HTTP; port es un alias legado para PostgreSQL.
        case_sensitive=True,
    )


settings = Settings()

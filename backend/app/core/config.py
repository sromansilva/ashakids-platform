import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        PROJECT_NAME: str = "ASHAKids API"
        VERSION: str = "0.1.0"
        API_V1_PREFIX: str = "/api/v1"
        SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", "")
        SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY", "")

        class Config:
            env_file = ".env"
            extra = "ignore"

    settings = Settings()
except ImportError:
    class Settings:
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ASHAKids API")
        VERSION: str = "0.1.0"
        API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    settings = Settings()

"""Punto de entrada principal de la API de ASHAKids."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ASHAKids Backend REST API — Plataforma de telerehabilitación e intervención infantil.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configuración de CORS estricta (no usar origins=['*'] con allow_credentials=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Inclusión de routers de API v1
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Sistema"])
def read_root():
    """Ruta raíz de estado general del servicio."""
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["Sistema"])
def health_check():
    """Health check para orquestadores y monitoreo."""
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }

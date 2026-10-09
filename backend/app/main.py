"""Punto de entrada principal de la API de ASHAKids."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.padres import router as padres_router
from app.api.v1.terapeutas import router as terapeutas_router
from app.core.config import settings
from app.core import database
from app.api.v1 import citas, pacientes, sesiones, usuarios, mensajeria


@asynccontextmanager
async def lifespan(app):
    yield
    if database.async_engine is not None:
        await database.async_engine.dispose()

app = FastAPI(
    lifespan=lifespan,
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ASHAKids Backend REST API — Plataforma de telerehabilitación e intervención infantil.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


@app.middleware("http")
async def check_origin(request: Request, call_next):
    # CORS limita lectura; esta validación impide escrituras desde orígenes ajenos.
    origin = request.headers.get("origin")
    mutation = request.method in {"POST", "PUT", "PATCH", "DELETE"}
    cookie = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if mutation and settings.is_production and request.url.scheme != "https":
        return JSONResponse(status_code=403, content={"detail": "Se requiere HTTPS."})
    if mutation and ((origin and origin not in settings.CORS_ORIGINS) or (
        cookie and not origin and settings.ENVIRONMENT.lower() == "production"
    )):
        return JSONResponse(status_code=403, content={"detail": "Origen no autorizado."})
    response = await call_next(request)
    if request.url.path.startswith(settings.API_V1_PREFIX):
        response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

# Configuración de CORS estricta (no usar origins=['*'] con allow_credentials=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# Inclusión de routers de API v1
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(padres_router, prefix=settings.API_V1_PREFIX)
app.include_router(terapeutas_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
for domain in (usuarios, pacientes, citas, sesiones, mensajeria):
    app.include_router(domain.router, prefix=settings.API_V1_PREFIX)


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


@app.get("/health/ready", tags=["Sistema"])
async def readiness(db: AsyncSession = Depends(database.get_db, scope="function")):
    """Comprueba conectividad PostgreSQL; no certifica todos los contratos del esquema."""
    await db.execute(text("SELECT 1"))
    return {"status": "ready", "database": "reachable"}

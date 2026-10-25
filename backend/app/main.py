"""Punto de entrada principal de la API de ASHAKids."""

from contextlib import asynccontextmanager
import asyncio
from contextlib import suppress
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.cuentas.presentation.admin import router as admin_router
from app.modules.auth.presentation.router import router as auth_router
from app.modules.cuentas.presentation.padres import router as padres_router
from app.modules.cuentas.presentation.terapeutas import router as terapeutas_router
from app.core.config import settings
from app.core import database
from app.modules.agenda.presentation import citas
from app.modules.pacientes.presentation import router as pacientes
from app.modules.clinica.presentation import sesiones, valoraciones
from app.modules.cuentas.presentation import usuarios
from app.modules.comunicacion.presentation import mensajeria, notificaciones, newsletter, adjuntos, incidencias
from app.modules.mundo_asha.presentation import juegos, voz
from app.modules.comunicacion.application.adjuntos import LimiteAdjuntos
from app.modules.agenda.application.recordatorios import ejecutar as ejecutar_recordatorios


@asynccontextmanager
async def lifespan(app):
    worker = asyncio.create_task(ejecutar_recordatorios()) if settings.NOTIFICATION_REMINDERS_ENABLED else None
    try:
        yield
    finally:
        if worker:
            worker.cancel()
            with suppress(asyncio.CancelledError):
                await worker
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

SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; media-src 'self' blob:",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), geolocation=(self), microphone=(self)",
}


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
    response.headers.update(SECURITY_HEADERS)
    if settings.is_production and request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
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
app.add_middleware(LimiteAdjuntos)

# Inclusión de routers de API v1
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(padres_router, prefix=settings.API_V1_PREFIX)
app.include_router(terapeutas_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
for domain in (usuarios, pacientes, citas, sesiones, mensajeria, notificaciones, juegos, newsletter, adjuntos, incidencias, valoraciones, voz):
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

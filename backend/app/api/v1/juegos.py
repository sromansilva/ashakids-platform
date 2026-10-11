from fastapi import APIRouter
from app.api.contracts import DB, Identity
from app.schemas.juegos import AreaMundo, IntentoCrear
from app.services import juegos
from app.services.juegos_catalogo import catalogo

router = APIRouter(tags=["Juegos básicos"])


@router.get("/juegos/catalogo")
async def mundos():
    return catalogo()


@router.get("/pacientes/{key}/juegos")
async def progreso(key: int, db: DB, identity: Identity):
    return await juegos.resumen(db, identity, key)


@router.post("/pacientes/{key}/juegos/{world}/intentos")
async def intento(key: int, world: AreaMundo, data: IntentoCrear, db: DB, identity: Identity):
    return await juegos.registrar(db, identity, key, world, data)

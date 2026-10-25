from fastapi import APIRouter
from app.shared.presentation.contracts import DB, Identity
from app.modules.mundo_asha.domain.juegos_schemas import AreaMundo, IntentoCrear
from app.modules.mundo_asha.application import juegos
from app.modules.mundo_asha.application.juegos_catalogo import catalogo_publico

router = APIRouter(tags=["Juegos básicos"])


@router.get("/juegos/catalogo")
async def mundos():
    return catalogo_publico()


@router.get("/pacientes/{key}/juegos")
async def progreso(key: int, db: DB, identity: Identity):
    return await juegos.resumen(db, identity, key)


@router.post("/pacientes/{key}/juegos/{world}/intentos")
async def intento(key: int, world: AreaMundo, data: IntentoCrear, db: DB, identity: Identity):
    return await juegos.registrar(db, identity, key, world, data)

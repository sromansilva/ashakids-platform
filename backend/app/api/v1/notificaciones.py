from fastapi import APIRouter
from app.api.contracts import DB, Identity, Limit, Offset
from app.schemas.notificaciones import BandejaSalida, NotificacionSalida, PreferenciasDatos
from app.services import notificaciones as service

router = APIRouter(prefix='/notificaciones', tags=['Notificaciones'])


@router.get('/preferencias', response_model=PreferenciasDatos)
async def preferencias(db: DB, identity: Identity):
    return await service.preferencias(db, service.usuario_propio(identity))


@router.put('/preferencias', response_model=PreferenciasDatos)
async def guardar(data: PreferenciasDatos, db: DB, identity: Identity):
    return await service.guardar_preferencias(db, service.usuario_propio(identity), data)


@router.get('', response_model=BandejaSalida)
async def bandeja(db: DB, identity: Identity, limit: Limit = 20, offset: Offset = 0, solo_sin_leer: bool = False):
    return await service.bandeja(db, service.usuario_propio(identity), limit, offset, solo_sin_leer)


@router.post('/leidas', status_code=204)
async def leer_todas(db: DB, identity: Identity):
    await service.leer_todas(db, service.usuario_propio(identity))


@router.patch('/{key}/leida', response_model=NotificacionSalida)
async def leer(key: int, db: DB, identity: Identity):
    return await service.leer(db, service.usuario_propio(identity), key)

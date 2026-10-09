from typing import Annotated
from fastapi import APIRouter, Path, Query, Response
from sqlalchemy import select, func
from app.api.contracts import DB, Identity, Limit, Offset
from app.models.mensajeria import Conversacion, Mensaje
from app.schemas.mensajeria import (ContactoSalida, ConversacionCrear, ConversacionSalida,
                                    ConversacionesPagina, MensajeCrear, MensajeSalida, MensajesPagina)
from app.services import mensajeria as service

router = APIRouter(prefix='/conversaciones', tags=['Mensajería'])
Cursor = Annotated[int | None, Query(gt=0, le=2147483647)]
Key = Annotated[int, Path(gt=0, le=2147483647)]


@router.get('/contactos', response_model=list[ContactoSalida])
async def contactos(db: DB, identity: Identity, response: Response, limit: Limit = 20, offset: Offset = 0):
    stmt = service.contactos(identity)
    response.headers['X-Total-Count'] = str(await db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())))
    return (await db.execute(stmt.limit(limit).offset(offset))).all()


@router.get('', response_model=ConversacionesPagina)
async def listar(db: DB, identity: Identity, limit: Limit = 20, before_id: Cursor = None):
    stmt = service.visibles(identity)
    if before_id is not None:
        stmt = stmt.where(Conversacion.id_conversacion < before_id)
    rows = list((await db.scalars(stmt.order_by(Conversacion.id_conversacion.desc()).limit(limit + 1))).all())
    page = rows[:limit]
    return {'items': await service.presentar(db, page),
            'next_before_id': page[-1].id_conversacion if len(rows) > limit else None}


@router.post('', response_model=ConversacionSalida)
async def abrir(data: ConversacionCrear, db: DB, identity: Identity):
    # Abrir una pareja existente es idempotente; no archiva ni altera mensajes.
    return (await service.presentar(db, [await service.abrir(db, identity, data)]))[0]


@router.get('/{key}', response_model=ConversacionSalida)
async def detalle(key: Key, db: DB, identity: Identity):
    return (await service.presentar(db, [await service.visible(db, identity, key)]))[0]


@router.get('/{key}/mensajes', response_model=MensajesPagina)
async def mensajes(key: Key, db: DB, identity: Identity, limit: Limit = 30, before_id: Cursor = None):
    await service.visible(db, identity, key)
    stmt = select(Mensaje).where(Mensaje.id_conversacion == key)
    if before_id is not None:
        stmt = stmt.where(Mensaje.id_mensaje < before_id)
    rows = list((await db.scalars(stmt.order_by(Mensaje.id_mensaje.desc()).limit(limit + 1))).all())
    return {'items': rows[:limit], 'next_before_id': rows[limit-1].id_mensaje if len(rows) > limit else None}


@router.post('/{key}/mensajes', response_model=MensajeSalida, status_code=201)
async def enviar(key: Key, data: MensajeCrear, db: DB, identity: Identity):
    return await service.enviar(db, identity, key, data)

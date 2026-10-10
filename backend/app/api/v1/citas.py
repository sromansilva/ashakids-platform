from fastapi import APIRouter, Response, HTTPException
from sqlalchemy import select
from app.models.perfiles import Terapeuta
from app.services.acceso import roles_de, exigir_profesional
from app.api.filtros import Agenda
from app.services import presentacion

from app.api.contracts import DB, Identity, Limit, Offset
from app.models.clinica import Reserva
from app.schemas.clinica import CitaCrear, CitaEstado, CitaHorario, CitaSalida, CitaReunion
from app.services import citas as service

router = APIRouter(prefix="/citas", tags=["Citas"])


@router.get("", response_model=list[CitaSalida])
async def listar(db: DB, identity: Identity, response: Response, filtros: Agenda, limit: Limit = 20, offset: Offset = 0):
    stmt = service.citas_visibles(identity).order_by(Reserva.fecha_hora_inicio, Reserva.id_reserva)
    stmt = filtros.aplicar(stmt, Reserva.estado_reserva)
    return await presentacion.citas(db, await presentacion.pagina(db, stmt, response, limit, offset))


@router.post("", response_model=CitaSalida, status_code=201)
async def crear(data: CitaCrear, db: DB, identity: Identity):
    return (await presentacion.citas(db, [await service.crear_cita(db, identity, data)]))[0]


@router.get("/{key}", response_model=CitaSalida)
async def detalle(key: int, db: DB, identity: Identity):
    row = await service.cita_visible(db, identity, key, contexto=True)
    own = await db.scalar(select(Terapeuta.id_terapeuta).where(Terapeuta.id_terapeuta == row.id_terapeuta,
                                                            Terapeuta.id_usuario == identity[0].id_usuario))
    view = (await presentacion.citas(db, [row]))[0]
    return view.model_copy(update={'puede_editar': 'ADMIN' in roles_de(identity) or own is not None})


@router.put("/{key}", response_model=CitaSalida)
async def reprogramar(key: int, data: CitaHorario, db: DB, identity: Identity):
    return (await presentacion.citas(db, [await service.cambiar_cita(db, identity, key, data, horario=True)]))[0]


@router.patch("/{key}/estado", response_model=CitaSalida)
async def estado(key: int, data: CitaEstado, db: DB, identity: Identity):
    return (await presentacion.citas(db, [await service.cambiar_cita(db, identity, key, data)]))[0]


@router.put('/{key}/reunion', response_model=CitaSalida)
async def reunion(key: int, data: CitaReunion, db: DB, identity: Identity):
    row = await service.cita_visible(db, identity, key, lock=True)
    await exigir_profesional(db, identity, row.id_terapeuta)
    if row.modalidad != 'VIRTUAL' or row.estado_reserva == 'CANCELADA':
        raise HTTPException(409, 'La reunión requiere una cita virtual no cancelada.')
    row.zoom_join_url = data.zoom_join_url
    await db.flush()
    return (await presentacion.citas(db, [row]))[0]

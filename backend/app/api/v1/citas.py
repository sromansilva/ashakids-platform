from fastapi import APIRouter, Response
from app.api.filtros import Agenda
from app.services import presentacion

from app.api.contracts import DB, Identity, Limit, Offset
from app.models.clinica import Reserva
from app.schemas.clinica import CitaCrear, CitaEstado, CitaHorario, CitaSalida
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
    return (await presentacion.citas(db, [await service.cita_visible(db, identity, key)]))[0]


@router.put("/{key}", response_model=CitaSalida)
async def reprogramar(key: int, data: CitaHorario, db: DB, identity: Identity):
    return (await presentacion.citas(db, [await service.cambiar_cita(db, identity, key, data, horario=True)]))[0]


@router.patch("/{key}/estado", response_model=CitaSalida)
async def estado(key: int, data: CitaEstado, db: DB, identity: Identity):
    return (await presentacion.citas(db, [await service.cambiar_cita(db, identity, key, data)]))[0]

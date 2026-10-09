from fastapi import APIRouter, HTTPException, Response
from app.api.filtros import Agenda
from app.services import presentacion
from sqlalchemy import select

from app.api.contracts import DB, Identity, Limit, Offset
from app.models.clinica import ReporteSesion, Reserva, Sesion
from app.schemas.clinica import ReporteDatos, ReporteSalida, SesionCerrar, SesionCrear, SesionSalida
from app.services import sesiones as service
from app.services.citas import citas_visibles

router = APIRouter(prefix="/sesiones", tags=["Sesiones"])


@router.get("", response_model=list[SesionSalida])
async def listar(db: DB, identity: Identity, response: Response, filtros: Agenda,
                 limit: Limit = 20, offset: Offset = 0, con_reporte: bool | None = None):
    allowed = citas_visibles(identity).with_only_columns(Reserva.id_reserva)
    stmt = select(Sesion).join(Reserva).where(Sesion.id_reserva.in_(allowed)).order_by(Sesion.id_sesion)
    stmt = filtros.aplicar(stmt, Sesion.estado_sesion)
    if con_reporte is not None:
        exists = select(ReporteSesion.id_reporte_sesion).where(ReporteSesion.id_sesion == Sesion.id_sesion).exists()
        stmt = stmt.where(exists if con_reporte else ~exists)
    return await presentacion.sesiones(db, await presentacion.pagina(db, stmt, response, limit, offset))


@router.post("", response_model=SesionSalida, status_code=201)
async def crear(data: SesionCrear, db: DB, identity: Identity):
    return (await presentacion.sesiones(db, [await service.crear_sesion(db, identity, data)]))[0]


@router.get("/{key}", response_model=SesionSalida)
async def detalle(key: int, db: DB, identity: Identity):
    row, _ = await service.sesion_visible(db, identity, key)
    return (await presentacion.sesiones(db, [row]))[0]


@router.post("/{key}/iniciar", response_model=SesionSalida)
async def iniciar(key: int, db: DB, identity: Identity):
    return (await presentacion.sesiones(db, [await service.iniciar_sesion(db, identity, key)]))[0]


@router.post("/{key}/cerrar", response_model=SesionSalida)
async def cerrar(key: int, data: SesionCerrar, db: DB, identity: Identity):
    return (await presentacion.sesiones(db, [await service.cerrar_sesion(db, identity, key, data)]))[0]


@router.get("/{key}/reporte", response_model=ReporteSalida)
async def reporte(key: int, db: DB, identity: Identity):
    await service.sesion_visible(db, identity, key)
    row = await db.scalar(select(ReporteSesion).where(ReporteSesion.id_sesion == key))
    if row is None:
        raise HTTPException(404, "Reporte no registrado.")
    return row


@router.put("/{key}/reporte", response_model=ReporteSalida)
async def guardar_reporte(key: int, data: ReporteDatos, db: DB, identity: Identity):
    return await service.guardar_reporte(db, identity, key, data)

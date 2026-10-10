from fastapi import APIRouter, Response, HTTPException
from starlette.concurrency import run_in_threadpool
from app.api.filtros import Agenda
from app.services import presentacion
from sqlalchemy import select

from app.api.contracts import DB, Identity, Limit, Offset
from app.models.clinica import ReporteSesion, Reserva, Sesion
from app.schemas.clinica import ReporteDatos, ReporteSalida, SesionCerrar, SesionCrear, SesionSalida, PlanCrear, TratamientoSalida
from app.services import planes
from app.services.acceso import paciente_visible
from app.services import sesiones as service
from app.services.citas import citas_visibles
from app.services.report_pdf import build_report_pdf

router = APIRouter(prefix="/sesiones", tags=["Sesiones"])


@router.get("", response_model=list[SesionSalida])
async def listar(db: DB, identity: Identity, response: Response, filtros: Agenda,
                 limit: Limit = 20, offset: Offset = 0, con_reporte: bool | None = None, contexto: bool = False):
    allowed = citas_visibles(identity).with_only_columns(Reserva.id_reserva)
    if contexto:
        if filtros.paciente is None:
            raise HTTPException(422, "El historial requiere seleccionar un paciente.")
        await paciente_visible(db, identity, filtros.paciente)
        allowed = select(Reserva.id_reserva).where(Reserva.id_paciente == filtros.paciente)
    stmt = select(Sesion).join(Reserva).where(Sesion.id_reserva.in_(allowed)).order_by(Sesion.id_sesion)
    stmt = filtros.aplicar(stmt, Sesion.estado_sesion)
    if con_reporte is not None:
        exists = select(ReporteSesion.id_reporte_sesion).where(ReporteSesion.id_sesion == Sesion.id_sesion).exists()
        stmt = stmt.where(exists if con_reporte else ~exists)
    return await presentacion.sesiones(db, await presentacion.pagina(db, stmt, response, limit, offset), identity)


@router.post("", response_model=SesionSalida, status_code=201)
async def crear(data: SesionCrear, db: DB, identity: Identity):
    return (await presentacion.sesiones(db, [await service.crear_sesion(db, identity, data)], identity))[0]


@router.get("/{key}", response_model=SesionSalida)
async def detalle(key: int, db: DB, identity: Identity):
    row, _ = await service.sesion_visible(db, identity, key)
    return (await presentacion.sesiones(db, [row], identity))[0]


@router.post("/{key}/iniciar", response_model=SesionSalida)
async def iniciar(key: int, db: DB, identity: Identity):
    return (await presentacion.sesiones(db, [await service.iniciar_sesion(db, identity, key)], identity))[0]


@router.post("/{key}/cerrar", response_model=SesionSalida)
async def cerrar(key: int, data: SesionCerrar, db: DB, identity: Identity):
    return (await presentacion.sesiones(db, [await service.cerrar_sesion(db, identity, key, data)], identity))[0]


@router.get("/{key}/reporte", response_model=ReporteSalida)
async def reporte(key: int, db: DB, identity: Identity):
    return (await service.reporte_visible(db, identity, key))[2]


@router.get("/{key}/reporte/pdf", response_class=Response,
            responses={200: {"content": {"application/pdf": {}}}})
async def descargar_reporte(key: int, db: DB, identity: Identity):
    session, appointment, report = await service.reporte_visible(db, identity, key)
    appointment_view = (await presentacion.citas(db, [appointment]))[0]
    pdf = await run_in_threadpool(build_report_pdf, session, appointment_view, report)
    return Response(pdf, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="reporte-sesion-{session.id_sesion}.pdf"',
        "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    })


@router.put("/{key}/reporte", response_model=ReporteSalida)
async def guardar_reporte(key: int, data: ReporteDatos, db: DB, identity: Identity):
    return await service.guardar_reporte(db, identity, key, data)


@router.get("/{key}/plan", response_model=TratamientoSalida | None)
async def plan(key: int, db: DB, identity: Identity):
    row = await planes.leer(db, identity, key)
    return (await presentacion.tratamientos(db, [row]))[0] if row else None


@router.post("/{key}/plan", response_model=TratamientoSalida, status_code=201)
async def publicar_plan(key: int, data: PlanCrear, db: DB, identity: Identity):
    return (await presentacion.tratamientos(db, [await planes.publicar(db, identity, key, data)]))[0]

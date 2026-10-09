from fastapi import APIRouter, Response
from sqlalchemy import or_
from app.services import presentacion
from sqlalchemy import select
from app.api.contracts import DB, Identity, Limit, Offset
from app.models.clinica import Expediente, Tratamiento
from app.models.perfiles import Paciente, Terapeuta
from app.schemas.clinica import PacienteCrear, PacienteDatos, PacienteSalida, TratamientoCrear, TratamientoSalida
from app.services import pacientes as service
from app.services.acceso import es_familia, paciente_visible, pacientes_visibles, roles_de

router = APIRouter(tags=["Pacientes y tratamientos"])


@router.get("/pacientes", response_model=list[PacienteSalida])
async def listar(db: DB, identity: Identity, response: Response, limit: Limit = 20,
                 offset: Offset = 0, q: str | None = None, activo: bool | None = None):
    stmt = pacientes_visibles(identity).order_by(Paciente.id_paciente)
    if q:
        stmt = stmt.where(or_(Paciente.nombres_paciente.icontains(q, autoescape=True),
                             Paciente.apellidos_paciente.icontains(q, autoescape=True)))
    if activo is not None:
        stmt = stmt.where(Paciente.activo == activo)
    return await presentacion.pagina(db, stmt, response, limit, offset)


@router.post("/pacientes", response_model=PacienteSalida, status_code=201)
async def crear(data: PacienteCrear, db: DB, identity: Identity):
    return await service.crear_paciente(db, identity, data)


@router.get("/pacientes/{key}", response_model=PacienteSalida)
async def detalle(key: int, db: DB, identity: Identity):
    return await paciente_visible(db, identity, key)


@router.put("/pacientes/{key}", response_model=PacienteSalida)
async def editar(key: int, data: PacienteDatos, db: DB, identity: Identity):
    return await service.editar_paciente(db, identity, key, data)


@router.delete("/pacientes/{key}", response_model=PacienteSalida, summary="Desactivar sin borrar historial")
async def desactivar(key: int, db: DB, identity: Identity):
    return await service.editar_paciente(db, identity, key)


@router.get("/pacientes/{key}/tratamientos", response_model=list[TratamientoSalida])
async def tratamientos(key: int, db: DB, identity: Identity, response: Response, limit: Limit = 20, offset: Offset = 0):
    patient = await paciente_visible(db, identity, key)
    stmt = select(Tratamiento).join(Expediente).where(Expediente.id_paciente == key)
    if "ADMIN" not in roles_de(identity) and not await es_familia(db, identity, patient):
        stmt = stmt.join(Terapeuta).where(Terapeuta.id_usuario == identity[0].id_usuario)
    rows = await presentacion.pagina(db, stmt.order_by(Tratamiento.id_tratamiento), response, limit, offset)
    return await presentacion.tratamientos(db, rows)


@router.post("/tratamientos", response_model=TratamientoSalida, status_code=201)
async def asignar_tratamiento(data: TratamientoCrear, db: DB, identity: Identity):
    return (await presentacion.tratamientos(db, [await service.crear_tratamiento(db, identity, data)]))[0]

from fastapi import APIRouter, Response
from sqlalchemy import select
from app.api.contracts import DB, Identity, Limit, Offset
from app.models.auth import Usuario
from app.models.clinica import Reserva, Sesion
from app.models.valoraciones import Valoracion
from app.schemas.valoraciones import ValoracionCrear, ValoracionSalida, ValoracionListado
from app.services import valoraciones as service, presentacion
from app.services.acceso import exigir
from app.services.citas import citas_visibles

router = APIRouter(tags=['Valoraciones'])


@router.get('/sesiones/{key}/valoracion', response_model=ValoracionSalida | None)
async def leer(key: int, db: DB, identity: Identity):
    return await service.leer(db, identity, key)


@router.post('/sesiones/{key}/valoracion', response_model=ValoracionSalida, status_code=201)
async def crear(key: int, data: ValoracionCrear, db: DB, identity: Identity):
    return await service.crear(db, identity, key, data)


@router.get('/valoraciones', response_model=list[ValoracionListado])
async def listar(db: DB, identity: Identity, response: Response, limit: Limit = 20, offset: Offset = 0):
    exigir(identity, 'TERAPEUTA', 'ADMIN')
    await service.disponible(db)
    allowed = citas_visibles(identity).with_only_columns(Reserva.id_reserva)
    stmt = (select(Valoracion).join(Sesion, Valoracion.id_sesion == Sesion.id_sesion)
            .where(Sesion.id_reserva.in_(allowed)).order_by(Valoracion.fecha_creacion.desc(), Valoracion.id_valoracion.desc()))
    rows = await presentacion.pagina(db, stmt, response, limit, offset)
    if not rows:
        return []
    authors = {u.id_usuario: f'{u.nombres} {u.apellidos}' for u in (await db.scalars(
        select(Usuario).where(Usuario.id_usuario.in_({r.id_usuario for r in rows})))).all()}
    dates = dict((await db.execute(select(Sesion.id_sesion, Reserva.fecha_hora_inicio)
                 .join(Reserva, Sesion.id_reserva == Reserva.id_reserva)
                 .where(Sesion.id_sesion.in_({r.id_sesion for r in rows})))).all())
    return [ValoracionListado(**ValoracionSalida.model_validate(r).model_dump(),
            autor_nombre=authors[r.id_usuario], fecha_sesion=dates[r.id_sesion]) for r in rows]

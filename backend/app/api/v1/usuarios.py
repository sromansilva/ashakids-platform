from fastapi import APIRouter, Response
from sqlalchemy import select, or_
from app.models.auth import UsuarioRol, Rol
from app.services import presentacion
from app.api.contracts import DB, Identity, Limit, Offset
from app.models.auth import Usuario
from app.schemas.usuarios import UsuarioCrear, UsuarioEditar, UsuarioSalida
from app.services import usuarios as service
from app.services.acceso import exigir, obtener

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("", response_model=list[UsuarioSalida])
async def listar(db: DB, identity: Identity, response: Response, limit: Limit = 20,
                 offset: Offset = 0, q: str | None = None, rol: str | None = None,
                 activo: bool | None = None):
    exigir(identity, "ADMIN")
    stmt = select(Usuario).order_by(Usuario.id_usuario)
    if q:
        stmt = stmt.where(or_(*[col.icontains(q, autoescape=True) for col in
                              [Usuario.nombres, Usuario.apellidos, Usuario.email, Usuario.codigo_usuario]]))
    if rol:
        stmt = stmt.where(Usuario.id_usuario.in_(select(UsuarioRol.id_usuario).join(Rol).where(
            Rol.nombre_rol == rol, UsuarioRol.activo.is_(True))))
    if activo is not None:
        stmt = stmt.where(Usuario.activo == activo)
    return await presentacion.usuarios(db, await presentacion.pagina(db, stmt, response, limit, offset))


@router.post("", response_model=UsuarioSalida, status_code=201)
async def crear(data: UsuarioCrear, db: DB, identity: Identity):
    return await service.crear_usuario(db, identity, data)


@router.get("/{key}", response_model=UsuarioSalida)
async def detalle(key: int, db: DB, identity: Identity):
    exigir(identity, "ADMIN")
    return await service.representar(db, await obtener(db, Usuario, key))


@router.patch("/{key}", response_model=UsuarioSalida)
async def editar(key: int, data: UsuarioEditar, db: DB, identity: Identity):
    return await service.editar_usuario(db, identity, key, data)

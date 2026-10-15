"""Escritura autenticada y bandeja exclusiva ADMIN, sin ejemplos ni fallback."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, require_admin
from app.core.database import get_db
from app.models.auth import Usuario
from app.models.incidencias import Incidencia
from app.schemas.incidencias import IncidenciaCrear, IncidenciaEstado, IncidenciaSalida, IncidenciaAdmin, IncidenciasLista

router = APIRouter(tags=["Incidencias"])


@router.post("/incidencias", response_model=IncidenciaSalida, status_code=201)
async def crear_incidencia(req: IncidenciaCrear, identity: tuple = Depends(get_current_user),
                          db: AsyncSession = Depends(get_db, scope="function")):
    user, roles = identity
    allowed = [r.upper() for r in roles if r.upper() in {"PADRE", "TERAPEUTA"}]
    if not allowed:
        raise HTTPException(403, "Solo padres y terapeutas pueden reportar incidencias.")
    # UUID estable durante el reintento: no duplica un envío confirmado con respuesta perdida.
    await db.execute(insert(Incidencia).values(**req.model_dump(), id_usuario=user.id_usuario,
                     rol=allowed[0]).on_conflict_do_nothing(index_elements=[Incidencia.envio_id]))
    row = await db.scalar(select(Incidencia).where(Incidencia.envio_id == req.envio_id))
    if row.id_usuario != user.id_usuario or any(getattr(row, key) != value for key, value in req.model_dump().items()):
        raise HTTPException(409, "Este envío ya existe con otro contenido. Inicia un nuevo reporte.")
    result = IncidenciaSalida.model_validate(row)
    await db.commit()
    return result


@router.get("/admin/incidencias", response_model=IncidenciasLista)
async def listar_incidencias(_identity: tuple = Depends(require_admin),
                            offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
                            db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count()).select_from(Incidencia)) or 0
    rows = await db.execute(select(Incidencia, Usuario.nombres, Usuario.apellidos)
        .outerjoin(Usuario, Incidencia.id_usuario == Usuario.id_usuario)
        .order_by(Incidencia.fecha_creacion.desc(), Incidencia.id_incidencia.desc()).offset(offset).limit(limit))
    return IncidenciasLista(total=total, items=[IncidenciaAdmin(
        **IncidenciaSalida.model_validate(row).model_dump(), rol=row.rol,
        usuario=f"{nombre} {apellido}" if nombre else "Cuenta eliminada") for row, nombre, apellido in rows])


@router.patch("/admin/incidencias/{id_incidencia}", response_model=IncidenciaSalida)
async def actualizar_incidencia(id_incidencia: int, req: IncidenciaEstado,
                               _identity: tuple = Depends(require_admin),
                               db: AsyncSession = Depends(get_db, scope="function")):
    row = await db.scalar(select(Incidencia).where(Incidencia.id_incidencia == id_incidencia).with_for_update())
    if row is None:
        raise HTTPException(404, "Incidencia no encontrada.")
    if row.estado == "RESUELTA" and req.estado != "RESUELTA":
        raise HTTPException(409, "La incidencia ya está resuelta.")
    row.estado = req.estado
    result = IncidenciaSalida.model_validate(row)
    await db.commit()
    return result

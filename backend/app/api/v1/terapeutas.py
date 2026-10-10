"""Endpoints REST para el subsistema de Terapeutas / Especialistas Clínicos."""

from typing import List, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_terapeuta
from app.api.v1.auth import build_user_response
from app.core.database import get_db
from app.models.auth import Usuario
from app.models.perfiles import Terapeuta
from app.schemas.perfiles import TerapeutaData, TerapeutaProfileResponse
from datetime import date
from app.api.contracts import DB, Identity
from app.schemas.agenda import DisponibilidadDatos, TurnoSalida
from app.services import agenda
from app.schemas.clinica import Salida
from app.api.contracts import Limit, Offset
from fastapi import Response


class ProfesionalSalida(Salida):
    id_terapeuta: int
    nombres: str
    apellidos: str
    especialidad: str | None
    descripcion_profesional: str | None

router = APIRouter(prefix="/terapeutas", tags=["Terapeutas"])


@router.get("", response_model=list[ProfesionalSalida])
async def directorio(db: DB, identity: Identity, response: Response, limit: Limit = 20, offset: Offset = 0):
    stmt = select(Terapeuta.id_terapeuta, Usuario.nombres, Usuario.apellidos,
        Terapeuta.especialidad, Terapeuta.descripcion_profesional).join(Usuario).where(
        Usuario.activo.is_(True), Usuario.password_change_required.is_(False)).order_by(Terapeuta.id_terapeuta)
    # Proyección pública profesional: sin datos clínicos/contacto privado.
    response.headers["X-Total-Count"] = str(await db.scalar(select(func.count()).select_from(stmt.subquery())))
    return [dict(r._mapping) for r in (await db.execute(stmt.limit(limit).offset(offset))).all()]


@router.get("/{key}/disponibilidad", response_model=DisponibilidadDatos)
async def disponibilidad(key: int, db: DB, identity: Identity):
    return await agenda.disponibilidad(db, key)


@router.put("/{key}/disponibilidad", response_model=DisponibilidadDatos)
async def publicar(key: int, data: DisponibilidadDatos, db: DB, identity: Identity):
    return await agenda.guardar(db, identity, key, data)


@router.get("/{key}/turnos", response_model=list[TurnoSalida])
async def turnos(key: int, fecha: date, db: DB, identity: Identity):
    return await agenda.turnos_del_dia(db, key, fecha)


@router.get(
    "/me",
    response_model=TerapeutaProfileResponse,
    summary="Obtener perfil del terapeuta autenticado",
    description="Retorna la información del usuario autenticado y su perfil profesional. Requiere sesión activa y rol TERAPEUTA.",
)
async def get_terapeuta_me(
    current_data: Tuple[Usuario, List[str]] = Depends(require_terapeuta),
    db: AsyncSession = Depends(get_db, scope="function"),
):
    user, roles = current_data

    # Buscar perfil en tabla 'terapeutas'
    stmt = select(Terapeuta).where(Terapeuta.id_usuario == user.id_usuario)
    res = await db.execute(stmt)
    terapeuta = res.scalar_one_or_none()

    terapeuta_data = None
    if terapeuta:
        terapeuta_data = TerapeutaData(
            id_terapeuta=terapeuta.id_terapeuta,
            especialidad=terapeuta.especialidad,
            anios_experiencia=terapeuta.anios_experiencia,
            idiomas=terapeuta.idiomas,
            descripcion_profesional=terapeuta.descripcion_profesional,
        )

    return TerapeutaProfileResponse(
        user=build_user_response(user, roles),
        perfil_terapeuta=terapeuta_data,
    )

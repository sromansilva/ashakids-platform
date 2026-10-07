"""Endpoints REST para el subsistema de Terapeutas / Especialistas Clínicos."""

from typing import List, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_terapeuta
from app.api.v1.auth import build_user_response
from app.core.database import get_db
from app.models.auth import Usuario
from app.models.perfiles import Terapeuta
from app.schemas.perfiles import TerapeutaData, TerapeutaProfileResponse

router = APIRouter(prefix="/terapeutas", tags=["Terapeutas"])


@router.get(
    "/me",
    response_model=TerapeutaProfileResponse,
    summary="Obtener perfil del terapeuta autenticado",
    description="Retorna la información del usuario autenticado y su perfil profesional. Requiere sesión activa y rol TERAPEUTA.",
)
async def get_terapeuta_me(
    current_data: Tuple[Usuario, List[str]] = Depends(require_terapeuta),
    db: AsyncSession = Depends(get_db),
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

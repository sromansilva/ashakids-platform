"""Endpoints REST para el subsistema de Padres / Tutores."""

from typing import List, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_padre
from app.api.v1.auth import build_user_response
from app.core.database import get_db
from app.models.auth import Usuario
from app.models.perfiles import Tutor
from app.schemas.perfiles import PadreProfileResponse, TutorData

router = APIRouter(prefix="/padres", tags=["Padres"])


@router.get(
    "/me",
    response_model=PadreProfileResponse,
    summary="Obtener perfil del padre autenticado",
    description="Retorna la información del usuario autenticado y su perfil de tutor. Requiere sesión activa y rol PADRE.",
)
async def get_padre_me(
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db, scope="function"),
):
    user, roles = current_data

    # Buscar perfil en tabla 'tutores'
    stmt = select(Tutor).where(Tutor.id_usuario == user.id_usuario)
    res = await db.execute(stmt)
    tutor = res.scalar_one_or_none()

    tutor_data = None
    if tutor:
        tutor_data = TutorData(
            id_tutor=tutor.id_tutor,
            parentesco=tutor.parentesco,
            telefono=tutor.telefono,
            direccion=tutor.direccion,
        )

    return PadreProfileResponse(
        user=build_user_response(user, roles),
        perfil_tutor=tutor_data,
    )

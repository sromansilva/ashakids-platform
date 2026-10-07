"""Endpoints REST para el subsistema de Administración del Sistema."""

from typing import List, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.api.v1.auth import build_user_response
from app.core.database import get_db
from app.models.auth import Administrador, Usuario
from app.schemas.perfiles import AdminProfileResponse, AdministradorData

router = APIRouter(prefix="/admin", tags=["Administración"])


@router.get(
    "/me",
    response_model=AdminProfileResponse,
    summary="Obtener perfil del administrador autenticado",
    description="Retorna la información del usuario autenticado y su perfil de administración. Requiere sesión activa y rol ADMIN.",
)
async def get_admin_me(
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user, roles = current_data

    # Buscar perfil en tabla 'administradores'
    stmt = select(Administrador).where(Administrador.id_usuario == user.id_usuario)
    res = await db.execute(stmt)
    admin = res.scalar_one_or_none()

    admin_data = None
    if admin:
        admin_data = AdministradorData(
            id_administrador=admin.id_administrador,
            fecha_creacion=admin.fecha_creacion,
        )

    return AdminProfileResponse(
        user=build_user_response(user, roles),
        perfil_admin=admin_data,
    )

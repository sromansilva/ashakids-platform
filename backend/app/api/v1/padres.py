"""Endpoints REST para el subsistema de Padres / Tutores y Gestión de Hijos."""

from typing import List, Tuple
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_padre
from app.api.v1.auth import build_user_response
from app.core.database import get_db
from app.models.auth import Usuario
from app.models.perfiles import Tutor
from app.schemas.pacientes import (
    ActualizarHijoRequest,
    CrearHijoRequest,
    HijoItemResponse,
    HijoListResponse,
    OperacionHijoResponse,
)
from app.schemas.perfiles import PadreProfileResponse, TutorData
from app.services import pacientes_service

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


# ─── Gestión de Hijos (Pacientes) ─────────────────────────────────────────────


@router.get(
    "/hijos",
    response_model=HijoListResponse,
    summary="Listar hijos activos del tutor autenticado",
    description="Retorna únicamente los hijos activos vinculados a la cuenta de tutor del usuario autenticado.",
)
async def listar_hijos(
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_data
    items = await pacientes_service.listar_hijos_padre(db, user)
    return HijoListResponse(items=items, total=len(items))


@router.post(
    "/hijos",
    response_model=OperacionHijoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo hijo",
    description="Registra un nuevo paciente y su perfil formativo/gamificado 1:1 en una transacción atómica. Audita en AUDITORIA_CAMBIOS.",
)
async def crear_hijo(
    payload: CrearHijoRequest,
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_data
    res = await pacientes_service.crear_hijo_padre(db, payload, user)
    return OperacionHijoResponse(
        message=res["message"],
        paciente=res["paciente"],
    )


@router.get(
    "/hijos/{id_paciente}",
    response_model=HijoItemResponse,
    summary="Consultar detalle de un hijo autorizado",
    description="Obtiene los datos de un paciente verificando que pertenezca al tutor autenticado (anti-IDOR).",
)
async def obtener_hijo(
    id_paciente: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_data
    return await pacientes_service.obtener_hijo_padre(db, id_paciente, user)


@router.patch(
    "/hijos/{id_paciente}",
    response_model=OperacionHijoResponse,
    summary="Editar datos del hijo",
    description="Permite modificar nombres, apellidos, fecha de nacimiento, sexo y avatar del hijo autorizado. Audita UPDATE.",
)
async def actualizar_hijo(
    id_paciente: int,
    payload: ActualizarHijoRequest,
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_data
    res = await pacientes_service.actualizar_hijo_padre(db, id_paciente, payload, user)
    return OperacionHijoResponse(
        message=res["message"],
        paciente=res["paciente"],
    )


@router.patch(
    "/hijos/{id_paciente}/inactivar",
    response_model=OperacionHijoResponse,
    summary="Inactivar hijo lógicamente",
    description="Pasa el paciente a activo=False preservando su historial, perfil y sesiones. Audita UPDATE.",
)
async def inactivar_hijo(
    id_paciente: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_data
    res = await pacientes_service.inactivar_hijo_padre(db, id_paciente, user)
    return OperacionHijoResponse(
        message=res["message"],
        paciente=res["paciente"],
    )


@router.delete(
    "/hijos/{id_paciente}",
    response_model=OperacionHijoResponse,
    summary="Eliminar hijo físicamente (solo sin dependencias)",
    description="Elimina físicamente el paciente solo si no posee historial clínico, sesiones, reservas o actividades. Retorna 409 Conflict si hay dependencias.",
)
async def eliminar_hijo(
    id_paciente: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_padre),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_data
    res = await pacientes_service.eliminar_hijo_padre(db, id_paciente, user)
    return OperacionHijoResponse(
        message=res["message"],
        paciente=None,
    )

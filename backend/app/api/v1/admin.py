"""Endpoints REST para el subsistema de Administración del Sistema (/admin y /admin/cuentas)."""

from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.api.v1.auth import build_user_response
from app.core.database import get_db
from app.models.auth import Administrador, Usuario
from app.schemas.admin import (
    ActualizarCuentaRequest,
    CrearPadreRequest,
    CrearTerapeutaRequest,
    CuentaItemResponse,
    CuentaListResponse,
    OperacionCuentaResponse,
)
from app.schemas.pacientes import HijoListResponse, OperacionHijoResponse
from app.schemas.perfiles import AdminProfileResponse, AdministradorData
from app.services import pacientes_service
from app.schemas.familias import FamiliaCrear, FamiliaCreada
from app.services.familias import registrar_familia
from app.services.admin_service import (
    activar_cuenta,
    actualizar_cuenta,
    crear_padre,
    crear_terapeuta,
    eliminar_cuenta,
    listar_cuentas,
    obtener_cuenta,
    suspender_cuenta,
)

router = APIRouter(prefix="/admin", tags=["Administración"])


@router.post("/familias", response_model=FamiliaCreada, status_code=201,
             summary="Registrar padre e hijos")
async def post_familia(
    req: FamiliaCrear,
    identity: tuple = Depends(require_admin),
    db: AsyncSession = Depends(get_db, scope="function"),
):
    return await registrar_familia(db, identity, req)


@router.get(
    "/me",
    response_model=AdminProfileResponse,
    summary="Obtener perfil del administrador autenticado",
    description="Retorna la información del usuario autenticado y su perfil de administración. Requiere sesión activa y rol ADMIN.",
)
async def get_admin_me(
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db, scope="function"),
):
    user, roles = current_data

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


# ─── GESTIÓN DE CUENTAS (/admin/cuentas) ──────────────────────────────────────────


@router.get(
    "/cuentas",
    response_model=CuentaListResponse,
    summary="Listar cuentas de usuarios",
    description="Lista cuentas registradas en el sistema con filtros opcionales por rol, término de búsqueda y estado activo. Requiere rol ADMIN.",
)
async def get_cuentas(
    rol: Optional[str] = Query(None, description="Filtrar por rol: PADRE, TERAPEUTA, ADMIN"),
    search: Optional[str] = Query(None, description="Buscar por nombre, apellido, email o código"),
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    items = await listar_cuentas(db, rol=rol, search=search, activo=activo)
    return CuentaListResponse(items=items, total=len(items))


@router.get(
    "/cuentas/{id_usuario}",
    response_model=CuentaItemResponse,
    summary="Obtener detalle de cuenta",
    description="Obtiene información detallada de una cuenta específica con su perfil anidado. Requiere rol ADMIN.",
)
async def get_cuenta_por_id(
    id_usuario: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    cuenta = await obtener_cuenta(db, id_usuario)
    if not cuenta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )
    return cuenta


@router.post(
    "/cuentas/padres",
    response_model=OperacionCuentaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear cuenta de Padre/Tutor",
    description="Crea de forma transaccional el Usuario con rol PADRE, su perfil en TUTORES y registra la auditoría. Requiere rol ADMIN.",
)
async def post_crear_padre(
    req: CrearPadreRequest,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    nueva_cuenta = await crear_padre(db, req, actor)
    await db.commit()
    return OperacionCuentaResponse(
        message=f"Cuenta de Padre '{nueva_cuenta['codigo_usuario']}' creada exitosamente.",
        cuenta=nueva_cuenta,
    )


@router.post(
    "/cuentas/terapeutas",
    response_model=OperacionCuentaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear cuenta de Terapeuta",
    description="Crea de forma transaccional el Usuario con rol TERAPEUTA, su perfil en TERAPEUTAS y registra la auditoría. Requiere rol ADMIN.",
)
async def post_crear_terapeuta(
    req: CrearTerapeutaRequest,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    nueva_cuenta = await crear_terapeuta(db, req, actor)
    await db.commit()
    return OperacionCuentaResponse(
        message=f"Cuenta de Terapeuta '{nueva_cuenta['codigo_usuario']}' creada exitosamente.",
        cuenta=nueva_cuenta,
    )


@router.patch(
    "/cuentas/{id_usuario}",
    response_model=OperacionCuentaResponse,
    summary="Editar cuenta de usuario",
    description="Actualiza datos de usuario y perfil de tutor o terapeuta de forma transaccional con auditoría. Requiere rol ADMIN.",
)
async def patch_actualizar_cuenta(
    id_usuario: int,
    req: ActualizarCuentaRequest,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    cuenta_actualizada = await actualizar_cuenta(db, id_usuario, req, actor)
    await db.commit()
    return OperacionCuentaResponse(
        message="Cuenta actualizada correctamente.",
        cuenta=cuenta_actualizada,
    )


@router.patch(
    "/cuentas/{id_usuario}/suspender",
    response_model=OperacionCuentaResponse,
    summary="Suspender cuenta de usuario",
    description="Desactiva lógicamente la cuenta, revoca de inmediato todas las sesiones activas y registra la auditoría. Requiere rol ADMIN.",
)
async def patch_suspender_cuenta(
    id_usuario: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    res = await suspender_cuenta(db, id_usuario, actor)
    await db.commit()
    return OperacionCuentaResponse(
        message=res["message"],
        cuenta=res["cuenta"],
    )


@router.patch(
    "/cuentas/{id_usuario}/activar",
    response_model=OperacionCuentaResponse,
    summary="Activar cuenta de usuario",
    description="Reactiva la cuenta previamente suspendida y registra la auditoría. Requiere rol ADMIN.",
)
async def patch_activar_cuenta(
    id_usuario: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    res = await activar_cuenta(db, id_usuario, actor)
    await db.commit()
    return OperacionCuentaResponse(
        message=res["message"],
        cuenta=res["cuenta"],
    )


@router.delete(
    "/cuentas/{id_usuario}",
    response_model=OperacionCuentaResponse,
    summary="Eliminar cuenta de usuario",
    description="Elimina físicamente la cuenta únicamente si no posee historial clínico o dependencias. Responde 409 si existen datos asociados. Requiere rol ADMIN.",
)
async def delete_eliminar_cuenta(
    id_usuario: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    res = await eliminar_cuenta(db, id_usuario, actor)
    await db.commit()
    return OperacionCuentaResponse(
        message=res["message"],
        cuenta=None,
    )


# ─── Gestión Administrativa de Hijos (Pacientes) ──────────────────────────────


@router.get(
    "/cuentas/{id_usuario}/hijos",
    response_model=HijoListResponse,
    summary="Listar hijos de una cuenta de padre (activos e inactivos)",
    description="Permite a un administrador consultar todos los hijos asociados a una cuenta de tutor. Requiere rol ADMIN.",
)
async def get_admin_hijos_padre(
    id_usuario: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    items = await pacientes_service.listar_hijos_admin(db, id_usuario)
    return HijoListResponse(items=items, total=len(items))


@router.patch(
    "/pacientes/{id_paciente}/reactivar",
    response_model=OperacionHijoResponse,
    summary="Reactivar paciente infantil",
    description="Reactiva un paciente inactivo estableciendo activo=TRUE y registrando la auditoría administrativa. Requiere rol ADMIN.",
)
async def patch_reactivar_paciente_admin(
    id_paciente: int,
    current_data: Tuple[Usuario, List[str]] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    actor, _ = current_data
    res = await pacientes_service.reactivar_hijo_admin(db, id_paciente, actor)
    return OperacionHijoResponse(
        message=res["message"],
        paciente=res["paciente"],
    )


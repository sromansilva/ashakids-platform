"""Servicio de lógica de negocio y transaccionalidad para Pacientes (Hijos) y Perfiles."""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.auth import Usuario
from app.models.perfiles import Paciente, Perfil, Tutor
from app.schemas.pacientes import ActualizarHijoRequest, CrearHijoRequest
from app.services.admin_service import registrar_auditoria


from app.services.pacientes_presentacion import calcular_edad, serializar_perfil, serializar_paciente


async def obtener_tutor_por_usuario(db: AsyncSession, id_usuario: int) -> Tutor:
    """Obtiene el registro Tutor vinculado a un id_usuario autenticado."""
    stmt = select(Tutor).where(Tutor.id_usuario == id_usuario)
    res = await db.execute(stmt)
    tutor = res.scalar_one_or_none()
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de tutor no encontrado para este usuario. Verifique su rol.",
        )
    return tutor


async def listar_hijos_padre(
    db: AsyncSession, actor: Usuario
) -> List[Dict[str, Any]]:
    """Lista todos los hijos activos asociados al tutor autenticado."""
    tutor = await obtener_tutor_por_usuario(db, actor.id_usuario)

    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(
            Paciente.id_tutor == tutor.id_tutor,
            Paciente.activo == True,
        )
        .order_by(Paciente.fecha_registro.asc())
    )
    result = await db.execute(stmt)
    pacientes = result.scalars().all()
    return [serializar_paciente(p) for p in pacientes]


async def crear_hijo_padre(
    db: AsyncSession, req: CrearHijoRequest, actor: Usuario
) -> Dict[str, Any]:
    """Crea un paciente y su perfil inicial 1:1 en una única transacción atómica."""
    tutor = await obtener_tutor_por_usuario(db, actor.id_usuario)

    try:
        # 1. Crear registro Paciente
        paciente = Paciente(
            id_tutor=tutor.id_tutor,
            nombres_paciente=req.nombres_paciente,
            apellidos_paciente=req.apellidos_paciente,
            fecha_nacimiento=req.fecha_nacimiento,
            sexo=req.sexo,
            avatar_nombre=req.avatar_nombre,
            activo=True,
        )
        db.add(paciente)
        await db.flush()  # Genera id_paciente

        # 2. Crear registro Perfil 1:1 asociado
        perfil = Perfil(
            id_paciente=paciente.id_paciente,
            progreso=0.0,
            racha_dias=0,
            objetivos_totales=0,
            objetivos_completados=0,
            actividades_desarrolladas_total=0,
            sesiones_totales=0,
            experiencia=0,
            nivel=1,
        )
        db.add(perfil)
        await db.flush()
        paciente.perfil = perfil

        # 3. Auditoría INSERT
        await registrar_auditoria(
            db=db,
            id_usuario_actor=actor.id_usuario,
            nombre_tabla="pacientes",
            nombre_entidad=str(paciente.id_paciente),
            accion="INSERT",
            datos_anteriores=None,
            datos_nuevos={
                "id_paciente": paciente.id_paciente,
                "id_tutor": tutor.id_tutor,
                "nombres": paciente.nombres_paciente,
                "apellidos": paciente.apellidos_paciente,
                "fecha_nacimiento": str(paciente.fecha_nacimiento),
                "sexo": paciente.sexo,
                "avatar_nombre": paciente.avatar_nombre,
                "activo": True,
            },
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    return {
        "message": f"Hijo/a {paciente.nombres_paciente} registrado/a exitosamente.",
        "paciente": serializar_paciente(paciente),
    }


async def obtener_hijo_padre(
    db: AsyncSession, id_paciente: int, actor: Usuario
) -> Dict[str, Any]:
    """Consulta un hijo garantizando que pertenezca al tutor autenticado (anti-IDOR)."""
    tutor = await obtener_tutor_por_usuario(db, actor.id_usuario)

    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(
            Paciente.id_paciente == id_paciente,
            Paciente.id_tutor == tutor.id_tutor,
        )
    )
    result = await db.execute(stmt)
    paciente = result.scalar_one_or_none()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    return serializar_paciente(paciente)


async def actualizar_hijo_padre(
    db: AsyncSession,
    id_paciente: int,
    req: ActualizarHijoRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Actualiza datos personales y avatar del hijo autorizado."""
    tutor = await obtener_tutor_por_usuario(db, actor.id_usuario)

    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(
            Paciente.id_paciente == id_paciente,
            Paciente.id_tutor == tutor.id_tutor,
        )
    )
    result = await db.execute(stmt)
    paciente = result.scalar_one_or_none()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    datos_anteriores: Dict[str, Any] = {}
    datos_nuevos: Dict[str, Any] = {}

    if req.nombres_paciente is not None and req.nombres_paciente != paciente.nombres_paciente:
        datos_anteriores["nombres_paciente"] = paciente.nombres_paciente
        datos_nuevos["nombres_paciente"] = req.nombres_paciente
        paciente.nombres_paciente = req.nombres_paciente

    if req.apellidos_paciente is not None and req.apellidos_paciente != paciente.apellidos_paciente:
        datos_anteriores["apellidos_paciente"] = paciente.apellidos_paciente
        datos_nuevos["apellidos_paciente"] = req.apellidos_paciente
        paciente.apellidos_paciente = req.apellidos_paciente

    if req.fecha_nacimiento is not None and req.fecha_nacimiento != paciente.fecha_nacimiento:
        datos_anteriores["fecha_nacimiento"] = str(paciente.fecha_nacimiento)
        datos_nuevos["fecha_nacimiento"] = str(req.fecha_nacimiento)
        paciente.fecha_nacimiento = req.fecha_nacimiento

    if req.sexo is not None and req.sexo != paciente.sexo:
        datos_anteriores["sexo"] = paciente.sexo
        datos_nuevos["sexo"] = req.sexo
        paciente.sexo = req.sexo

    if req.avatar_nombre is not None and req.avatar_nombre != paciente.avatar_nombre:
        datos_anteriores["avatar_nombre"] = paciente.avatar_nombre
        datos_nuevos["avatar_nombre"] = req.avatar_nombre
        paciente.avatar_nombre = req.avatar_nombre

    if datos_nuevos:
        await registrar_auditoria(
            db=db,
            id_usuario_actor=actor.id_usuario,
            nombre_tabla="pacientes",
            nombre_entidad=str(paciente.id_paciente),
            accion="UPDATE",
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
        )
        await db.commit()

    return {
        "message": f"Datos de {paciente.nombres_paciente} actualizados correctamente.",
        "paciente": serializar_paciente(paciente),
    }


async def inactivar_hijo_padre(
    db: AsyncSession, id_paciente: int, actor: Usuario
) -> Dict[str, Any]:
    """Inactiva lógicamente al paciente (activo=False) preservando todo el historial."""
    tutor = await obtener_tutor_por_usuario(db, actor.id_usuario)

    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(
            Paciente.id_paciente == id_paciente,
            Paciente.id_tutor == tutor.id_tutor,
        )
    )
    result = await db.execute(stmt)
    paciente = result.scalar_one_or_none()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    if not paciente.activo:
        return {
            "message": f"{paciente.nombres_paciente} ya se encuentra inactivo/a.",
            "paciente": serializar_paciente(paciente),
        }

    paciente.activo = False

    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="pacientes",
        nombre_entidad=str(paciente.id_paciente),
        accion="UPDATE",
        datos_anteriores={"activo": True},
        datos_nuevos={"activo": False},
    )
    await db.commit()

    return {
        "message": f"Perfil de {paciente.nombres_paciente} inactivado correctamente. El historial se conserva.",
        "paciente": serializar_paciente(paciente),
    }


async def verificar_dependencias_paciente(
    db: AsyncSession, id_paciente: int
) -> Optional[str]:
    """Verifica si el paciente posee registros clínicos, reservas, actividades o logros que impidan el DELETE."""
    # 1. Expedientes clínicos
    exp_count = (
        await db.execute(
            text("SELECT count(*) FROM public.expedientes WHERE id_paciente = :id"),
            {"id": id_paciente},
        )
    ).scalar() or 0
    if exp_count > 0:
        return f"El paciente posee {exp_count} expediente(s) clínico(s) registrado(s). Inactive al paciente en su lugar."

    # 2. Reservas / Citas
    res_count = (
        await db.execute(
            text("SELECT count(*) FROM public.reservas WHERE id_paciente = :id"),
            {"id": id_paciente},
        )
    ).scalar() or 0
    if res_count > 0:
        return f"El paciente posee {res_count} reserva(s) médica(s) en agenda. Inactive al paciente en su lugar."

    # 3. Actividades
    act_count = (
        await db.execute(
            text("SELECT count(*) FROM public.actividades WHERE id_paciente = :id"),
            {"id": id_paciente},
        )
    ).scalar() or 0
    if act_count > 0:
        return f"El paciente posee {act_count} actividad(es) formativa(s) asignada(s). Inactive al paciente en su lugar."

    # 4. Resultados de nivel
    rn_count = (
        await db.execute(
            text("SELECT count(*) FROM public.resultados_nivel WHERE id_paciente = :id"),
            {"id": id_paciente},
        )
    ).scalar() or 0
    if rn_count > 0:
        return f"El paciente posee {rn_count} registro(s) de progreso lúdico. Inactive al paciente en su lugar."

    # 5. Evaluaciones IA
    eval_count = (
        await db.execute(
            text("SELECT count(*) FROM public.evaluaciones_ia WHERE id_paciente = :id"),
            {"id": id_paciente},
        )
    ).scalar() or 0
    if eval_count > 0:
        return f"El paciente posee {eval_count} evaluación(es) de IA registrada(s). Inactive al paciente en su lugar."

    # 6. Logros obtenidos en Perfil
    stmt_pf = select(Perfil).where(Perfil.id_paciente == id_paciente)
    res_pf = await db.execute(stmt_pf)
    perfil = res_pf.scalar_one_or_none()
    if perfil:
        logros_count = (
            await db.execute(
                text("SELECT count(*) FROM public.perfil_logros WHERE id_perfil = :id"),
                {"id": perfil.id_perfil},
            )
        ).scalar() or 0
        if logros_count > 0:
            return f"El paciente posee {logros_count} logro(s) o medalla(s) obtenida(s). Inactive al paciente en su lugar."
        # Si tiene avance o experiencia
        if (perfil.experiencia or 0) > 0 or (perfil.sesiones_totales or 0) > 0:
            return "El paciente posee avance o sesiones registradas en su perfil. Inactive al paciente en su lugar."

    return None


async def eliminar_hijo_padre(
    db: AsyncSession, id_paciente: int, actor: Usuario
) -> Dict[str, Any]:
    """Eliminación física únicamente si no existen dependencias clínicas ni historial formativo."""
    tutor = await obtener_tutor_por_usuario(db, actor.id_usuario)

    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(
            Paciente.id_paciente == id_paciente,
            Paciente.id_tutor == tutor.id_tutor,
        )
    )
    result = await db.execute(stmt)
    paciente = result.scalar_one_or_none()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    # Comprobar dependencias clínicas y de progreso
    motivo_bloqueo = await verificar_dependencias_paciente(db, id_paciente)
    if motivo_bloqueo:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=motivo_bloqueo,
        )

    try:
        # Registrar auditoría DELETE previa a la remoción
        snapshot_anterior = {
            "id_paciente": paciente.id_paciente,
            "id_tutor": paciente.id_tutor,
            "nombres": paciente.nombres_paciente,
            "apellidos": paciente.apellidos_paciente,
            "fecha_nacimiento": str(paciente.fecha_nacimiento),
            "avatar_nombre": paciente.avatar_nombre,
            "activo": paciente.activo,
        }
        await registrar_auditoria(
            db=db,
            id_usuario_actor=actor.id_usuario,
            nombre_tabla="pacientes",
            nombre_entidad=str(paciente.id_paciente),
            accion="DELETE",
            datos_anteriores=snapshot_anterior,
            datos_nuevos=None,
        )

        # Eliminar perfil y paciente
        if paciente.perfil:
            await db.delete(paciente.perfil)
        await db.delete(paciente)
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    return {
        "message": f"Registro de {paciente.nombres_paciente} eliminado permanentemente.",
        "paciente": None,
    }


# ─── Gestión Administrativa de Hijos ──────────────────────────────────────────


async def listar_hijos_admin(
    db: AsyncSession, id_usuario_padre: int
) -> List[Dict[str, Any]]:
    """Permite al administrador consultar TODOS los hijos de un padre (activos e inactivos)."""
    tutor = await obtener_tutor_por_usuario(db, id_usuario_padre)

    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(Paciente.id_tutor == tutor.id_tutor)
        .order_by(Paciente.activo.desc(), Paciente.fecha_registro.asc())
    )
    result = await db.execute(stmt)
    pacientes = result.scalars().all()
    return [serializar_paciente(p) for p in pacientes]


async def reactivar_hijo_admin(
    db: AsyncSession, id_paciente: int, actor_admin: Usuario
) -> Dict[str, Any]:
    """Reactivación de un paciente inactivo por parte de un administrador autorizado."""
    stmt = (
        select(Paciente)
        .options(selectinload(Paciente.perfil))
        .where(Paciente.id_paciente == id_paciente)
    )
    result = await db.execute(stmt)
    paciente = result.scalar_one_or_none()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    if paciente.activo:
        return {
            "message": f"El paciente {paciente.nombres_paciente} ya se encuentra activo.",
            "paciente": serializar_paciente(paciente),
        }

    paciente.activo = True

    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor_admin.id_usuario,
        nombre_tabla="pacientes",
        nombre_entidad=str(paciente.id_paciente),
        accion="UPDATE",
        datos_anteriores={"activo": False},
        datos_nuevos={"activo": True, "reactivado_por_admin": actor_admin.id_usuario},
    )
    await db.commit()

    return {
        "message": f"Paciente {paciente.nombres_paciente} reactivado/a exitosamente.",
        "paciente": serializar_paciente(paciente),
    }

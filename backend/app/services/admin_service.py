"""Servicio para la administración del sistema y gestión integral de cuentas (/admin/cuentas)."""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select, update, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import hash_password
from app.models.auditoria import AuditoriaCambios
from app.models.auth import Administrador, Rol, SesionAutenticacion, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor
from app.schemas.admin import (
    ActualizarCuentaRequest,
    CrearPadreRequest,
    CrearTerapeutaRequest,
)

SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "token",
    "token_hash",
    "raw_token",
    "cookie",
}


def sanitize_dict(data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Elimina contraseñas, hashes y tokens de los datos a auditar."""
    if not data:
        return None
    return {k: v for k, v in data.items() if k not in SENSITIVE_KEYS}


async def registrar_auditoria(
    db: AsyncSession,
    id_usuario_actor: Optional[int],
    nombre_tabla: str,
    nombre_entidad: str,
    accion: str,
    datos_anteriores: Optional[Dict[str, Any]] = None,
    datos_nuevos: Optional[Dict[str, Any]] = None,
) -> AuditoriaCambios:
    """Registra una operación en la tabla central 'auditoria_cambios' de forma transaccional."""
    auditoria = AuditoriaCambios(
        id_usuario_actor=id_usuario_actor,
        nombre_tabla=nombre_tabla,
        nombre_entidad=nombre_entidad,
        accion=accion,
        datos_anteriores=sanitize_dict(datos_anteriores),
        datos_nuevos=sanitize_dict(datos_nuevos),
    )
    db.add(auditoria)
    return auditoria


async def generar_codigo_usuario(db: AsyncSession, prefijo: str) -> str:
    """Genera un código correlativo único de exactamente 6 caracteres (ej. 'p00002', 't00002')."""
    if prefijo not in ("p", "t", "a"):
        raise ValueError("Prefijo inválido para código de usuario.")

    # Buscar todos los códigos existentes con el prefijo
    stmt = select(Usuario.codigo_usuario).where(Usuario.codigo_usuario.like(f"{prefijo}%"))
    result = await db.execute(stmt)
    codigos = result.scalars().all()

    max_num = 0
    pattern = re.compile(rf"^{prefijo}(\d{{5}})$")
    for cod in codigos:
        match = pattern.match(cod)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    siguiente = max_num + 1
    while True:
        candidato = f"{prefijo}{siguiente:05d}"
        # Verificar colisión
        chk_stmt = select(Usuario.id_usuario).where(Usuario.codigo_usuario == candidato)
        chk_res = await db.execute(chk_stmt)
        if chk_res.scalar_one_or_none() is None:
            return candidato
        siguiente += 1


async def contar_administradores_activos(db: AsyncSession) -> int:
    """Retorna la cantidad de administradores activos en el sistema."""
    stmt = (
        select(func.count(Usuario.id_usuario))
        .join(UsuarioRol, UsuarioRol.id_usuario == Usuario.id_usuario)
        .join(Rol, Rol.id_rol == UsuarioRol.id_rol)
        .where(
            Rol.nombre_rol == "ADMIN",
            Usuario.activo == True,
            UsuarioRol.activo == True,
        )
    )
    res = await db.execute(stmt)
    return res.scalar() or 0


async def _construir_cuenta_dict(
    user: Usuario,
    tutor: Optional[Tutor] = None,
    terapeuta: Optional[Terapeuta] = None,
    rol_override: Optional[str] = None,
) -> Dict[str, Any]:
    """Serializa un Usuario con su rol principal y perfil asociado."""
    if rol_override:
        main_role = rol_override.upper()
    else:
        roles = []
        if "roles_asignados" in user.__dict__:
            roles = [
                ur.rol.nombre_rol.upper()
                for ur in user.roles_asignados
                if ur.activo and "rol" in ur.__dict__ and ur.rol
            ]
        main_role = roles[0] if roles else "PADRE"

    tutor_dict = None
    if tutor:
        tutor_dict = {
            "id_tutor": tutor.id_tutor,
            "parentesco": tutor.parentesco,
            "telefono": tutor.telefono,
            "direccion": tutor.direccion,
        }

    terapeuta_dict = None
    if terapeuta:
        terapeuta_dict = {
            "id_terapeuta": terapeuta.id_terapeuta,
            "especialidad": terapeuta.especialidad,
            "anios_experiencia": terapeuta.anios_experiencia,
            "idiomas": terapeuta.idiomas,
            "descripcion_profesional": terapeuta.descripcion_profesional,
        }

    return {
        "id_usuario": user.id_usuario,
        "codigo_usuario": user.codigo_usuario,
        "email": user.email,
        "nombres": user.nombres,
        "apellidos": user.apellidos,
        "rol": main_role,
        "activo": user.activo,
        "fecha_creacion": user.fecha_creacion,
        "tutor": tutor_dict,
        "terapeuta": terapeuta_dict,
    }


async def listar_cuentas(
    db: AsyncSession,
    rol: Optional[str] = None,
    search: Optional[str] = None,
    activo: Optional[bool] = None,
) -> List[Dict[str, Any]]:
    """Lista las cuentas de usuario con roles y perfiles correspondientes."""
    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .order_by(Usuario.id_usuario.desc())
    )

    if activo is not None:
        stmt = stmt.where(Usuario.activo == activo)

    if search:
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            (func.lower(Usuario.nombres).like(term))
            | (func.lower(Usuario.apellidos).like(term))
            | (func.lower(Usuario.email).like(term))
            | (func.lower(Usuario.codigo_usuario).like(term))
        )

    res = await db.execute(stmt)
    usuarios = res.scalars().all()

    # Cargar perfiles de tutores y terapeutas
    user_ids = [u.id_usuario for u in usuarios]
    tutores_map: Dict[int, Tutor] = {}
    terapeutas_map: Dict[int, Terapeuta] = {}

    if user_ids:
        t_res = await db.execute(select(Tutor).where(Tutor.id_usuario.in_(user_ids)))
        for t in t_res.scalars().all():
            tutores_map[t.id_usuario] = t

        ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario.in_(user_ids)))
        for ter in ter_res.scalars().all():
            terapeutas_map[ter.id_usuario] = ter

    cuentas = []
    filtro_rol = rol.upper() if rol else None

    for u in usuarios:
        c_dict = await _construir_cuenta_dict(
            u,
            tutores_map.get(u.id_usuario),
            terapeutas_map.get(u.id_usuario),
        )
        if filtro_rol:
            if c_dict["rol"] != filtro_rol:
                continue
        cuentas.append(c_dict)

    return cuentas


async def obtener_cuenta(db: AsyncSession, id_usuario: int) -> Optional[Dict[str, Any]]:
    """Obtiene una cuenta individual por ID con su perfil detallado."""
    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        return None

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()

    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()

    return await _construir_cuenta_dict(user, tutor, terapeuta)


async def crear_padre(
    db: AsyncSession,
    req: CrearPadreRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Crea atómicamente un Padre/Tutor: Usuario + Rol PADRE + Tutor + Auditoría."""
    clean_email = req.email.strip().lower()

    # Validar unicidad de email
    stmt_dup = select(Usuario.id_usuario).where(Usuario.email == clean_email)
    if (await db.execute(stmt_dup)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El correo electrónico '{clean_email}' ya está registrado.",
        )

    codigo = await generar_codigo_usuario(db, "p")
    pwd_hash = hash_password(req.password)

    user = Usuario(
        nombres=req.nombres.strip(),
        apellidos=req.apellidos.strip(),
        codigo_usuario=codigo,
        email=clean_email,
        password_hash=pwd_hash,
        activo=True,
    )
    db.add(user)
    await db.flush()

    # Obtener rol PADRE
    stmt_rol = select(Rol).where(Rol.nombre_rol == "PADRE")
    rol = (await db.execute(stmt_rol)).scalar_one()

    # Obtener ID del admin actor
    stmt_admin = select(Administrador.id_administrador).where(Administrador.id_usuario == actor.id_usuario)
    admin_id = (await db.execute(stmt_admin)).scalar_one_or_none()

    ur = UsuarioRol(
        id_usuario=user.id_usuario,
        id_rol=rol.id_rol,
        asignado_por=admin_id,
        activo=True,
    )
    db.add(ur)

    tutor = Tutor(
        id_usuario=user.id_usuario,
        parentesco=req.parentesco.strip() if req.parentesco else None,
        telefono=req.telefono.strip() if req.telefono else None,
        direccion=req.direccion.strip() if req.direccion else None,
    )
    db.add(tutor)
    await db.flush()

    # Registrar auditoría INSERT
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="INSERT",
        datos_anteriores=None,
        datos_nuevos={
            "id_usuario": user.id_usuario,
            "codigo_usuario": user.codigo_usuario,
            "email": user.email,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "rol": "PADRE",
            "activo": True,
            "parentesco": tutor.parentesco,
            "telefono": tutor.telefono,
            "direccion": tutor.direccion,
        },
    )
    await db.flush()

    return await _construir_cuenta_dict(user, tutor, None, rol_override="PADRE")


async def crear_terapeuta(
    db: AsyncSession,
    req: CrearTerapeutaRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Crea atómicamente un Terapeuta: Usuario + Rol TERAPEUTA + Terapeuta + Auditoría."""
    clean_email = req.email.strip().lower()

    # Validar unicidad de email
    stmt_dup = select(Usuario.id_usuario).where(Usuario.email == clean_email)
    if (await db.execute(stmt_dup)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El correo electrónico '{clean_email}' ya está registrado.",
        )

    codigo = await generar_codigo_usuario(db, "t")
    pwd_hash = hash_password(req.password)

    user = Usuario(
        nombres=req.nombres.strip(),
        apellidos=req.apellidos.strip(),
        codigo_usuario=codigo,
        email=clean_email,
        password_hash=pwd_hash,
        activo=True,
    )
    db.add(user)
    await db.flush()

    # Obtener rol TERAPEUTA
    stmt_rol = select(Rol).where(Rol.nombre_rol == "TERAPEUTA")
    rol = (await db.execute(stmt_rol)).scalar_one()

    # Obtener ID del admin actor
    stmt_admin = select(Administrador.id_administrador).where(Administrador.id_usuario == actor.id_usuario)
    admin_id = (await db.execute(stmt_admin)).scalar_one_or_none()

    ur = UsuarioRol(
        id_usuario=user.id_usuario,
        id_rol=rol.id_rol,
        asignado_por=admin_id,
        activo=True,
    )
    db.add(ur)

    terapeuta = Terapeuta(
        id_usuario=user.id_usuario,
        especialidad=req.especialidad.strip() if req.especialidad else None,
        anios_experiencia=req.anios_experiencia,
        idiomas=req.idiomas.strip() if req.idiomas else None,
        descripcion_profesional=req.descripcion_profesional.strip() if req.descripcion_profesional else None,
    )
    db.add(terapeuta)
    await db.flush()

    # Registrar auditoría INSERT
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="INSERT",
        datos_anteriores=None,
        datos_nuevos={
            "id_usuario": user.id_usuario,
            "codigo_usuario": user.codigo_usuario,
            "email": user.email,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "rol": "TERAPEUTA",
            "activo": True,
            "especialidad": terapeuta.especialidad,
            "anios_experiencia": terapeuta.anios_experiencia,
            "idiomas": terapeuta.idiomas,
        },
    )
    await db.flush()

    return await _construir_cuenta_dict(user, None, terapeuta, rol_override="TERAPEUTA")


async def actualizar_cuenta(
    db: AsyncSession,
    id_usuario: int,
    req: ActualizarCuentaRequest,
    actor: Usuario,
) -> Dict[str, Any]:
    """Actualiza de forma transaccional los datos de usuario y perfil con auditoría."""
    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )

    datos_anteriores: Dict[str, Any] = {}
    datos_nuevos: Dict[str, Any] = {}

    # Validar y actualizar email si se envió
    if req.email:
        clean_email = req.email.strip().lower()
        if clean_email != user.email:
            stmt_dup = select(Usuario.id_usuario).where(
                Usuario.email == clean_email,
                Usuario.id_usuario != id_usuario,
            )
            if (await db.execute(stmt_dup)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El correo electrónico '{clean_email}' ya pertenece a otro usuario.",
                )
            datos_anteriores["email"] = user.email
            datos_nuevos["email"] = clean_email
            user.email = clean_email

    if req.nombres and req.nombres.strip() != user.nombres:
        datos_anteriores["nombres"] = user.nombres
        datos_nuevos["nombres"] = req.nombres.strip()
        user.nombres = req.nombres.strip()

    if req.apellidos and req.apellidos.strip() != user.apellidos:
        datos_anteriores["apellidos"] = user.apellidos
        datos_nuevos["apellidos"] = req.apellidos.strip()
        user.apellidos = req.apellidos.strip()

    roles = [
        ur.rol.nombre_rol.upper()
        for ur in user.roles_asignados
        if ur.activo and ur.rol
    ]

    # Actualizar o inicializar Tutor
    if "PADRE" in roles:
        t_stmt = select(Tutor).where(Tutor.id_usuario == id_usuario)
        tutor = (await db.execute(t_stmt)).scalar_one_or_none()
        if not tutor:
            tutor = Tutor(id_usuario=id_usuario)
            db.add(tutor)
            await db.flush()

        if req.parentesco is not None and req.parentesco.strip() != (tutor.parentesco or ""):
            datos_anteriores["parentesco"] = tutor.parentesco
            datos_nuevos["parentesco"] = req.parentesco.strip()
            tutor.parentesco = req.parentesco.strip()

        if req.telefono is not None and req.telefono.strip() != (tutor.telefono or ""):
            datos_anteriores["telefono"] = tutor.telefono
            datos_nuevos["telefono"] = req.telefono.strip()
            tutor.telefono = req.telefono.strip()

        if req.direccion is not None and req.direccion.strip() != (tutor.direccion or ""):
            datos_anteriores["direccion"] = tutor.direccion
            datos_nuevos["direccion"] = req.direccion.strip()
            tutor.direccion = req.direccion.strip()

    # Actualizar o inicializar Terapeuta
    if "TERAPEUTA" in roles:
        ter_stmt = select(Terapeuta).where(Terapeuta.id_usuario == id_usuario)
        terapeuta = (await db.execute(ter_stmt)).scalar_one_or_none()
        if not terapeuta:
            terapeuta = Terapeuta(id_usuario=id_usuario)
            db.add(terapeuta)
            await db.flush()

        if req.especialidad is not None and req.especialidad.strip() != (terapeuta.especialidad or ""):
            datos_anteriores["especialidad"] = terapeuta.especialidad
            datos_nuevos["especialidad"] = req.especialidad.strip()
            terapeuta.especialidad = req.especialidad.strip()

        if req.anios_experiencia is not None and req.anios_experiencia != terapeuta.anios_experiencia:
            datos_anteriores["anios_experiencia"] = terapeuta.anios_experiencia
            datos_nuevos["anios_experiencia"] = req.anios_experiencia
            terapeuta.anios_experiencia = req.anios_experiencia

        if req.idiomas is not None and req.idiomas.strip() != (terapeuta.idiomas or ""):
            datos_anteriores["idiomas"] = terapeuta.idiomas
            datos_nuevos["idiomas"] = req.idiomas.strip()
            terapeuta.idiomas = req.idiomas.strip()

        if req.descripcion_profesional is not None and req.descripcion_profesional.strip() != (terapeuta.descripcion_profesional or ""):
            datos_anteriores["descripcion_profesional"] = terapeuta.descripcion_profesional
            datos_nuevos["descripcion_profesional"] = req.descripcion_profesional.strip()
            terapeuta.descripcion_profesional = req.descripcion_profesional.strip()

    # Auditar solo si hubo modificaciones reales
    if datos_nuevos:
        await registrar_auditoria(
            db=db,
            id_usuario_actor=actor.id_usuario,
            nombre_tabla="usuarios",
            nombre_entidad=str(user.id_usuario),
            accion="UPDATE",
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
        )
        await db.flush()

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()
    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()
    return await _construir_cuenta_dict(user, tutor, terapeuta)


async def suspender_cuenta(
    db: AsyncSession,
    id_usuario: int,
    actor: Usuario,
) -> Dict[str, Any]:
    """Suspende lógicamente una cuenta, revoca sesiones activas e impide nuevos accesos."""
    if id_usuario == actor.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No puedes suspender tu propia cuenta de administrador.",
        )

    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )

    # Verificar si es ADMIN y si es el último activo
    roles = [
        ur.rol.nombre_rol.upper()
        for ur in user.roles_asignados
        if ur.activo and ur.rol
    ]
    if "ADMIN" in roles:
        activos = await contar_administradores_activos(db)
        if activos <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede suspender al único administrador activo del sistema.",
            )

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()
    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()

    if not user.activo:
        cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
        return {
            "message": "La cuenta ya se encuentra suspendida.",
            "cuenta": cuenta_actual,
        }

    # Desactivar usuario
    user.activo = False

    # Revocar sesiones activas en sesiones_autenticacion
    now = datetime.now(timezone.utc)
    stmt_rev = (
        update(SesionAutenticacion)
        .where(
            SesionAutenticacion.id_usuario == user.id_usuario,
            SesionAutenticacion.revocado == False,
        )
        .values(revocado=True, fecha_cierre=now)
    )
    rev_res = await db.execute(stmt_rev)
    revocadas = rev_res.rowcount

    # Auditoría UPDATE
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="UPDATE",
        datos_anteriores={"activo": True},
        datos_nuevos={"activo": False, "sesiones_revocadas": revocadas},
    )
    await db.flush()

    cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
    return {
        "message": f"Cuenta suspendida correctamente. Se revocaron {revocadas} sesión(es) activa(s).",
        "cuenta": cuenta_actual,
    }


async def activar_cuenta(
    db: AsyncSession,
    id_usuario: int,
    actor: Usuario,
) -> Dict[str, Any]:
    """Reactiva una cuenta previamente suspendida (las sesiones anteriores siguen revocadas)."""
    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )

    t_res = await db.execute(select(Tutor).where(Tutor.id_usuario == id_usuario))
    tutor = t_res.scalar_one_or_none()
    ter_res = await db.execute(select(Terapeuta).where(Terapeuta.id_usuario == id_usuario))
    terapeuta = ter_res.scalar_one_or_none()

    if user.activo:
        cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
        return {
            "message": "La cuenta ya se encuentra activa.",
            "cuenta": cuenta_actual,
        }

    user.activo = True

    # Auditoría UPDATE
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="UPDATE",
        datos_anteriores={"activo": False},
        datos_nuevos={"activo": True},
    )
    await db.flush()

    cuenta_actual = await _construir_cuenta_dict(user, tutor, terapeuta)
    return {
        "message": "Cuenta activada correctamente. El usuario ya puede iniciar sesión.",
        "cuenta": cuenta_actual,
    }


async def verificar_dependencias_cuenta(
    db: AsyncSession,
    user: Usuario,
) -> Optional[str]:
    """Verifica si la cuenta tiene relaciones clínicas o de historial que impiden el DELETE físico."""
    id_usr = user.id_usuario

    # 1. Verificar mensajes emitidos
    msg_count = (
        await db.execute(
            text("SELECT count(*) FROM public.mensajes WHERE id_usuario_emisor = :id"),
            {"id": id_usr},
        )
    ).scalar() or 0
    if msg_count > 0:
        return f"La cuenta posee {msg_count} mensaje(s) registrado(s) en conversaciones. No puede eliminarse; suspenda la cuenta en su lugar."

    # 2. Si es tutor, verificar pacientes y conversaciones
    tutor_res = await db.execute(
        select(Tutor.id_tutor).where(Tutor.id_usuario == id_usr)
    )
    id_tutor = tutor_res.scalar_one_or_none()
    if id_tutor:
        pacientes_count = (
            await db.execute(
                text("SELECT count(*) FROM public.pacientes WHERE id_tutor = :id"),
                {"id": id_tutor},
            )
        ).scalar() or 0
        if pacientes_count > 0:
            return f"La cuenta de tutor tiene {pacientes_count} paciente(s) infantil(es) asignado(s) con historial clínico. No puede eliminarse; suspenda la cuenta en su lugar."

        conv_count = (
            await db.execute(
                text("SELECT count(*) FROM public.conversaciones WHERE id_tutor = :id"),
                {"id": id_tutor},
            )
        ).scalar() or 0
        if conv_count > 0:
            return f"La cuenta de tutor tiene {conv_count} conversación(es) clínica(s) en su historial. No puede eliminarse; suspenda la cuenta en su lugar."

    # 3. Si es terapeuta, verificar tratamientos, reservas y conversaciones
    ter_res = await db.execute(
        select(Terapeuta.id_terapeuta).where(Terapeuta.id_usuario == id_usr)
    )
    id_terapeuta = ter_res.scalar_one_or_none()
    if id_terapeuta:
        trat_count = (
            await db.execute(
                text("SELECT count(*) FROM public.tratamientos WHERE id_terapeuta = :id"),
                {"id": id_terapeuta},
            )
        ).scalar() or 0
        if trat_count > 0:
            return f"El terapeuta tiene {trat_count} plan(es) de tratamiento asignado(s). No puede eliminarse; suspenda la cuenta en su lugar."

        res_count = (
            await db.execute(
                text("SELECT count(*) FROM public.reservas WHERE id_terapeuta = :id"),
                {"id": id_terapeuta},
            )
        ).scalar() or 0
        if res_count > 0:
            return f"El terapeuta tiene {res_count} reserva(s) terapéutica(s) en agenda. No puede eliminarse; suspenda la cuenta en su lugar."

        conv_t_count = (
            await db.execute(
                text("SELECT count(*) FROM public.conversaciones WHERE id_terapeuta = :id"),
                {"id": id_terapeuta},
            )
        ).scalar() or 0
        if conv_t_count > 0:
            return f"El terapeuta tiene {conv_t_count} conversación(es) activa(s) en el sistema. No puede eliminarse; suspenda la cuenta en su lugar."

    # 4. Verificar historial de auditoría como actor
    audit_count = (
        await db.execute(
            text(
                "SELECT count(*) FROM public.auditoria_cambios WHERE id_usuario_actor = :id"
            ),
            {"id": id_usr},
        )
    ).scalar() or 0
    if audit_count > 0:
        return (
            "La cuenta posee historial de auditoría como actor "
            f"({audit_count} evento(s)). "
            "Debe suspenderse en lugar de eliminarse para preservar "
            "la trazabilidad histórica."
        )

    return None


async def eliminar_cuenta(
    db: AsyncSession,
    id_usuario: int,
    actor: Usuario,
) -> Dict[str, Any]:
    """Elimina físicamente una cuenta si y solo si no posee dependencias clínicas/históricas."""
    if id_usuario == actor.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No puedes eliminar tu propia cuenta de administrador.",
        )

    stmt = (
        select(Usuario)
        .options(
            selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol)
        )
        .where(Usuario.id_usuario == id_usuario)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta de usuario no encontrada.",
        )

    roles = [
        ur.rol.nombre_rol.upper()
        for ur in user.roles_asignados
        if ur.activo and ur.rol
    ]
    if "ADMIN" in roles:
        activos = await contar_administradores_activos(db)
        if activos <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar al único administrador activo del sistema.",
            )

    # Verificar dependencias
    conflicto = await verificar_dependencias_cuenta(db, user)
    if conflicto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=conflicto,
        )

    # Registrar auditoría DELETE ANTES de la eliminación física
    await registrar_auditoria(
        db=db,
        id_usuario_actor=actor.id_usuario,
        nombre_tabla="usuarios",
        nombre_entidad=str(user.id_usuario),
        accion="DELETE",
        datos_anteriores={
            "id_usuario": user.id_usuario,
            "codigo_usuario": user.codigo_usuario,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "email": user.email,
            "activo": user.activo,
            "roles": roles,
        },
        datos_nuevos=None,
    )
    await db.flush()

    # Eliminación en base de datos
    await db.delete(user)
    await db.flush()

    return {
        "message": f"Cuenta de usuario '{user.codigo_usuario}' eliminada permanentemente.",
        "id_usuario": id_usuario,
    }

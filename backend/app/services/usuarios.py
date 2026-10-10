from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload
from starlette.concurrency import run_in_threadpool

from app.core.security import hash_password
from app.models.auth import Administrador, Rol, SesionAutenticacion, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor
from app.schemas.usuarios import UsuarioSalida
from app.services.acceso import exigir, obtener


def consulta_usuarios():
    return select(Usuario).options(selectinload(Usuario.roles_asignados).selectinload(UsuarioRol.rol))


async def representar(db, row):
    roles = (await db.scalars(select(Rol.nombre_rol).join(UsuarioRol).where(
        UsuarioRol.id_usuario == row.id_usuario, UsuarioRol.activo.is_(True)))).all()
    tutor = await db.scalar(select(Tutor.id_tutor).where(Tutor.id_usuario == row.id_usuario))
    therapist = await db.scalar(select(Terapeuta.id_terapeuta).where(Terapeuta.id_usuario == row.id_usuario))
    return UsuarioSalida(id_usuario=row.id_usuario, nombres=row.nombres, apellidos=row.apellidos,
                         codigo_usuario=row.codigo_usuario, email=row.email, activo=row.activo,
                         roles=sorted(roles), id_tutor=tutor, id_terapeuta=therapist)


async def email_disponible(db, email, excluded=None):
    stmt = select(Usuario.id_usuario).where(func.lower(Usuario.email) == email.lower())
    if excluded is not None:
        stmt = stmt.where(Usuario.id_usuario != excluded)
    if await db.scalar(stmt) is not None:
        raise HTTPException(409, "El correo ya está registrado.")


async def crear_usuario(db, identity, data):
    exigir(identity, "ADMIN")
    await email_disponible(db, str(data.email))
    role = await db.scalar(select(Rol).where(Rol.nombre_rol == data.rol))
    if role is None:
        raise HTTPException(409, "El rol no está configurado en la base de datos.")
    values = data.model_dump(exclude={"password", "rol"})
    values["email"] = str(data.email).lower()
    values["codigo_usuario"] = data.codigo_usuario.lower()
    row = Usuario(**values, password_hash=await run_in_threadpool(hash_password, data.password),
                  password_change_required=True)
    db.add(row)
    await db.flush()
    actor = await db.scalar(select(Administrador.id_administrador).where(
        Administrador.id_usuario == identity[0].id_usuario))
    db.add(UsuarioRol(id_usuario=row.id_usuario, id_rol=role.id_rol, asignado_por=actor))
    profile_model = {"PADRE": Tutor, "TERAPEUTA": Terapeuta, "ADMIN": Administrador}[data.rol]
    db.add(profile_model(id_usuario=row.id_usuario))
    await db.flush()
    return await representar(db, row)


async def editar_usuario(db, identity, key, data):
    is_admin = any(rol == "ADMIN" for rol in identity[1])
    is_self = key == identity[0].id_usuario
    if not is_admin and not is_self:
        raise HTTPException(403, "No tiene permisos para modificar este usuario.")
    row = await obtener(db, Usuario, key, lock=True)
    values = data.model_dump(exclude_unset=True)
    if not is_admin:
        if "activo" in values:
            raise HTTPException(403, "Solo los administradores pueden cambiar el estado de la cuenta.")
    elif values.get("activo") is False and key == identity[0].id_usuario:
        raise HTTPException(409, "No puede desactivar su propia cuenta administrativa.")
    if "email" in values:
        await email_disponible(db, str(values["email"]), key)
        values["email"] = str(values["email"]).lower()
    if "password" in values:
        row.password_hash = await run_in_threadpool(hash_password, values.pop("password"))
    for field, value in values.items():
        setattr(row, field, value)
    if data.password is not None or data.activo is False:
        await db.execute(update(SesionAutenticacion).where(
            SesionAutenticacion.id_usuario == key, SesionAutenticacion.revocado.is_(False)
        ).values(revocado=True, fecha_cierre=datetime.now(timezone.utc)))
    await db.flush()
    return await representar(db, row)

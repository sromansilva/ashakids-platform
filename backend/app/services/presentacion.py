"""Proyecciones públicas agrupadas. Solo recibe recursos ya autorizados."""
from sqlalchemy import select, func
from app.models.auth import Usuario, Rol, UsuarioRol
from app.models.perfiles import Paciente, Terapeuta, Tutor
from app.models.clinica import Expediente, Reserva, Sesion, ReporteSesion
from app.schemas.clinica import CitaSalida, SesionSalida, TratamientoSalida
from app.schemas.usuarios import UsuarioSalida
from app.services.acceso import roles_de


async def pagina(db, stmt, response, limit, offset):
    response.headers["X-Total-Count"] = str(await db.scalar(
        select(func.count()).select_from(stmt.order_by(None).subquery())))
    return (await db.scalars(stmt.limit(limit).offset(offset))).all()


async def nombres(db, pacientes, terapeutas):
    patients = (await db.execute(select(Paciente.id_paciente, Paciente.nombres_paciente,
        Paciente.apellidos_paciente).where(Paciente.id_paciente.in_(pacientes)))).all()
    therapists = (await db.execute(select(Terapeuta.id_terapeuta, Usuario.nombres,
        Usuario.apellidos).join(Usuario).where(Terapeuta.id_terapeuta.in_(terapeutas)))).all()
    return ({key: f"{first} {last}" for key, first, last in patients},
            {key: f"{first} {last}" for key, first, last in therapists})


async def citas(db, rows):
    if not rows:
        return []
    patients, therapists = await nombres(db, [r.id_paciente for r in rows],
                                        [r.id_terapeuta for r in rows])
    sessions = dict((await db.execute(select(Sesion.id_reserva, Sesion.id_sesion)
        .where(Sesion.id_reserva.in_([r.id_reserva for r in rows])))).all())
    return [CitaSalida.model_validate(r).model_copy(update={
        "paciente_nombre": patients.get(r.id_paciente),
        "terapeuta_nombre": therapists.get(r.id_terapeuta),
        "id_sesion": sessions.get(r.id_reserva)}) for r in rows]


async def tratamientos(db, rows):
    if not rows:
        return []
    expedientes = dict((await db.execute(select(Expediente.id_expediente, Expediente.id_paciente)
        .where(Expediente.id_expediente.in_([r.id_expediente for r in rows])))).all())
    patients, therapists = await nombres(db, list(expedientes.values()), [r.id_terapeuta for r in rows])
    return [TratamientoSalida.model_validate(r).model_copy(update={
        "id_paciente": expedientes[r.id_expediente],
        "paciente_nombre": patients.get(expedientes[r.id_expediente]),
        "terapeuta_nombre": therapists.get(r.id_terapeuta)}) for r in rows]


async def sesiones(db, rows, identity):
    if not rows:
        return []
    appointments = await citas(db, (await db.scalars(select(Reserva).where(
        Reserva.id_reserva.in_([r.id_reserva for r in rows])))).all())
    by_id = {r.id_reserva: r for r in appointments}
    reports = set((await db.scalars(select(ReporteSesion.id_sesion).where(
        ReporteSesion.id_sesion.in_([r.id_sesion for r in rows])))).all())
    own = set((await db.scalars(select(Terapeuta.id_terapeuta).where(
        Terapeuta.id_usuario == identity[0].id_usuario))).all())
    return [SesionSalida.model_validate(r).model_copy(update={
        "cita": by_id[r.id_reserva], "reporte_disponible": r.id_sesion in reports,
        "puede_editar": "ADMIN" in roles_de(identity) or by_id[r.id_reserva].id_terapeuta in own}) for r in rows]


async def usuarios(db, rows):
    keys = [r.id_usuario for r in rows]
    tutors = dict((await db.execute(select(Tutor.id_usuario, Tutor.id_tutor)
        .where(Tutor.id_usuario.in_(keys)))).all())
    therapists = dict((await db.execute(select(Terapeuta.id_usuario, Terapeuta.id_terapeuta)
        .where(Terapeuta.id_usuario.in_(keys)))).all())
    roles = {}
    for key, role in (await db.execute(select(UsuarioRol.id_usuario, Rol.nombre_rol).join(Rol)
            .where(UsuarioRol.id_usuario.in_(keys), UsuarioRol.activo.is_(True)))).all():
        roles.setdefault(key, []).append(role)
    return [UsuarioSalida.model_validate({**r.__dict__, "roles": sorted(roles.get(r.id_usuario, [])),
        "id_tutor": tutors.get(r.id_usuario), "id_terapeuta": therapists.get(r.id_usuario)}) for r in rows]

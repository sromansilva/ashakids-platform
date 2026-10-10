"""Chat familiar: permisos por participantes, envío por asignación activa."""
from fastapi import HTTPException
from sqlalchemy import and_, or_, select, func
from sqlalchemy.orm import aliased
from app.models.auth import Usuario
from app.models.clinica import Expediente, Tratamiento, Reserva, Sesion
from app.models.perfiles import Paciente, Tutor, Terapeuta
from app.models.mensajeria import Conversacion, Mensaje
from app.schemas.mensajeria import ConversacionSalida
from app.services.acceso import exigir, roles_de
from app.services.notificaciones import emitir


def participantes(identity):
    exigir(identity, 'PADRE', 'TERAPEUTA')
    roles = roles_de(identity)
    clauses = []
    if 'PADRE' in roles:
        clauses.append(Tutor.id_usuario == identity[0].id_usuario)
    if 'TERAPEUTA' in roles:
        clauses.append(Terapeuta.id_usuario == identity[0].id_usuario)
    return or_(*clauses)


def asignaciones():
    parent, professional = aliased(Usuario), aliased(Usuario)
    linked = select(Reserva.id_reserva).outerjoin(Sesion).where(
        Reserva.id_paciente == Paciente.id_paciente, Reserva.id_terapeuta == Terapeuta.id_terapeuta,
        or_(and_(Reserva.estado_reserva == 'CONFIRMADA', Reserva.fecha_hora_fin >= func.now()),
            Sesion.estado_sesion == 'EN_CURSO',
            and_(Sesion.estado_sesion == 'FINALIZADA', Sesion.asistencia == 'ASISTIO'))
    ).correlate(Paciente, Terapeuta).exists()
    return (select(Tutor.id_tutor, Terapeuta.id_terapeuta,
                   (parent.nombres + ' ' + parent.apellidos).label('tutor_nombre'),
                   (professional.nombres + ' ' + professional.apellidos).label('terapeuta_nombre'))
            .select_from(Tutor).join(Paciente, Paciente.id_tutor == Tutor.id_tutor)
            .outerjoin(Expediente, Expediente.id_paciente == Paciente.id_paciente)
            .outerjoin(Tratamiento, Tratamiento.id_expediente == Expediente.id_expediente)
            .join(Terapeuta, or_(linked, and_(Terapeuta.id_terapeuta == Tratamiento.id_terapeuta,
                Tratamiento.id_sesion_origen.is_(None), func.upper(Tratamiento.estado_tratamiento) == 'ACTIVO')))
            .join(parent, parent.id_usuario == Tutor.id_usuario)
            .join(professional, professional.id_usuario == Terapeuta.id_usuario)
            .where(Paciente.activo.is_(True), parent.activo.is_(True), professional.activo.is_(True)))


def contactos(identity):
    return asignaciones().where(participantes(identity)).distinct().order_by(Tutor.id_tutor, Terapeuta.id_terapeuta)


def visibles(identity):
    return (select(Conversacion).join(Tutor, Tutor.id_tutor == Conversacion.id_tutor)
            .join(Terapeuta, Terapeuta.id_terapeuta == Conversacion.id_terapeuta)
            .where(participantes(identity)))


async def visible(db, identity, key, *, lock=False):
    stmt = visibles(identity).where(Conversacion.id_conversacion == key)
    if lock:
        stmt = stmt.with_for_update(of=Conversacion).execution_options(populate_existing=True)
    row = await db.scalar(stmt)
    if row is None:
        raise HTTPException(404, 'Conversación no encontrada.')
    return row


async def presentar(db, rows):
    if not rows:
        return []
    ids = [row.id_conversacion for row in rows]
    parent, professional = aliased(Usuario), aliased(Usuario)
    active = (asignaciones().where(Tutor.id_tutor == Conversacion.id_tutor,
                                   Terapeuta.id_terapeuta == Conversacion.id_terapeuta)
              .correlate(Conversacion).exists())
    stmt = (select(Conversacion.id_conversacion, Conversacion.id_tutor, Conversacion.id_terapeuta,
                   Conversacion.estado, Conversacion.ultima_actividad,
                   Tutor.id_usuario.label('id_usuario_tutor'),
                   Terapeuta.id_usuario.label('id_usuario_terapeuta'),
                   (parent.nombres + ' ' + parent.apellidos).label('tutor_nombre'),
                   (professional.nombres + ' ' + professional.apellidos).label('terapeuta_nombre'),
                   and_(active, Conversacion.estado == 'ACTIVA', Conversacion.fecha_archivado.is_(None)).label('puede_enviar'))
            .join(Tutor, Tutor.id_tutor == Conversacion.id_tutor)
            .join(Terapeuta, Terapeuta.id_terapeuta == Conversacion.id_terapeuta)
            .join(parent, parent.id_usuario == Tutor.id_usuario)
            .join(professional, professional.id_usuario == Terapeuta.id_usuario)
            .where(Conversacion.id_conversacion.in_(ids)))
    views = {row.id_conversacion: ConversacionSalida.model_validate(row) for row in (await db.execute(stmt)).all()}
    return [views[row.id_conversacion] for row in rows]


async def abrir(db, identity, data):
    # Fila estable: evita duplicados entre solicitudes concurrentes de esta API.
    # El esquema existente no tiene UNIQUE(tutor,terapeuta); no modifica datos legacy.
    allowed = await db.scalar(contactos(identity).where(Tutor.id_tutor == data.id_tutor,
                                                       Terapeuta.id_terapeuta == data.id_terapeuta))
    if allowed is None:
        raise HTTPException(403, 'Solo puedes iniciar chats con una asignación activa de tu familia.')
    await db.scalar(select(Tutor).where(Tutor.id_tutor == data.id_tutor).with_for_update())
    existing = await db.scalar(select(Conversacion).where(Conversacion.id_tutor == data.id_tutor,
                                    Conversacion.id_terapeuta == data.id_terapeuta)
                               .order_by(Conversacion.id_conversacion).limit(1))
    if existing is not None:
        return existing
    # Volver a comprobar la asignación después de adquirir el bloqueo.
    if await db.scalar(contactos(identity).where(Tutor.id_tutor == data.id_tutor,
                                               Terapeuta.id_terapeuta == data.id_terapeuta)) is None:
        raise HTTPException(403, 'La asignación ya no está activa.')
    row = Conversacion(id_tutor=data.id_tutor, id_terapeuta=data.id_terapeuta, estado='ACTIVA')
    db.add(row)
    await db.flush()
    return row


async def enviar(db, identity, key, data):
    row = await visible(db, identity, key, lock=True)
    if row.estado != 'ACTIVA' or row.fecha_archivado is not None:
        raise HTTPException(409, 'La conversación está cerrada. Puedes consultar su historial.')
    active = await db.scalar(asignaciones().where(Tutor.id_tutor == row.id_tutor,
                                                 Terapeuta.id_terapeuta == row.id_terapeuta))
    if active is None:
        raise HTTPException(403, 'El envío requiere una asignación activa y participantes habilitados.')
    message = Mensaje(id_conversacion=key, id_usuario_emisor=identity[0].id_usuario,
                      texto_mensaje=data.texto_mensaje, leido=False)
    db.add(message)
    row.ultima_actividad = func.now()
    await db.flush()
    if 'PADRE' in roles_de(identity):
        target = await db.scalar(select(Terapeuta.id_usuario).where(Terapeuta.id_terapeuta == row.id_terapeuta))
        await emitir(db, target, 'MENSAJE', 'Nuevo mensaje de una familia',
                     f'{identity[0].nombres} {identity[0].apellidos} te envió un mensaje.',
                     f'MENSAJE:{message.id_mensaje}', conversacion=key)
    return message

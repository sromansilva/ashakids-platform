"""Notificaciones internas al profesional: eventos atómicos y recordatorios idempotentes."""
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert
from app.models.auth import Usuario
from app.models.clinica import Reserva, Sesion
from app.models.perfiles import Paciente, Terapeuta
from app.models.notificaciones import Notificacion, PreferenciasNotificacion
from app.schemas.notificaciones import PreferenciasDatos
from app.services.acceso import exigir

PREFERENCIA = {'NUEVA_CITA': 'nueva_cita', 'CANCELACION': 'cancelacion',
               'REPROGRAMACION': 'reprogramacion', 'RECORDATORIO': 'recordatorio', 'MENSAJE': 'mensajes'}
TITULO = {'NUEVA_CITA': 'Nueva cita confirmada', 'CANCELACION': 'Cita cancelada',
          'REPROGRAMACION': 'Cita reprogramada', 'RECORDATORIO': 'Tu próxima cita comienza pronto'}
LIMA = ZoneInfo('America/Lima')


def usuario_propio(identity):
    exigir(identity, 'TERAPEUTA')
    return identity[0].id_usuario


async def preferencias(db, user_id):
    row = await db.get(PreferenciasNotificacion, user_id)
    return PreferenciasDatos.model_validate({name: getattr(row, name) for name in PreferenciasDatos.model_fields}) if row else PreferenciasDatos()


async def guardar_preferencias(db, user_id, data):
    values = data.model_dump()
    await db.execute(insert(PreferenciasNotificacion).values(id_usuario=user_id, **values)
                     .on_conflict_do_update(index_elements=['id_usuario'], set_=values))
    return data


async def emitir(db, user_id, tipo, titulo, texto, clave, *, cita=None, conversacion=None):
    if not user_id or not await db.scalar(select(Usuario.id_usuario).where(
            Usuario.id_usuario == user_id, Usuario.activo.is_(True), Usuario.password_change_required.is_(False))):
        return
    config = await preferencias(db, user_id)
    if not getattr(config, PREFERENCIA[tipo]):
        return
    await db.execute(insert(Notificacion).values(id_usuario=user_id, tipo=tipo, titulo=titulo,
        texto=texto, clave_evento=clave, id_reserva=cita, id_conversacion=conversacion)
        .on_conflict_do_nothing(constraint='uq_notificacion_evento'))


async def avisar_cita(db, actor, cita, tipo, *, clave=None):
    target = await db.scalar(select(Terapeuta.id_usuario).where(Terapeuta.id_terapeuta == cita.id_terapeuta))
    patient = await db.get(Paciente, cita.id_paciente)
    when = cita.fecha_hora_inicio.astimezone(LIMA).strftime('%d/%m/%Y a las %H:%M')
    name = f'{patient.nombres_paciente} {patient.apellidos_paciente}'
    if tipo == 'RECORDATORIO':
        texto = f'Tienes una cita con {name} el {when}, modalidad {cita.modalidad.lower()}.'
    else:
        action = {'NUEVA_CITA': 'reservó', 'CANCELACION': 'canceló', 'REPROGRAMACION': 'reprogramó'}[tipo]
        texto = f'{actor.nombres} {actor.apellidos} {action} una cita para {name} el {when}, modalidad {cita.modalidad.lower()}.'
    await emitir(db, target, tipo, TITULO[tipo], texto, clave or f'{tipo}:{cita.id_reserva}:{uuid4()}', cita=cita.id_reserva)


async def bandeja(db, user_id, limit, offset, solo_sin_leer):
    own = Notificacion.id_usuario == user_id
    filtered = select(Notificacion).where(own)
    if solo_sin_leer:
        filtered = filtered.where(Notificacion.leida_en.is_(None))
    total = await db.scalar(select(func.count()).select_from(filtered.subquery()))
    unread = await db.scalar(select(func.count()).select_from(Notificacion).where(own, Notificacion.leida_en.is_(None)))
    items = (await db.scalars(filtered.order_by(Notificacion.fecha_creacion.desc(), Notificacion.id_notificacion.desc())
                              .limit(limit).offset(offset))).all()
    return {'items': items, 'total': total, 'sin_leer': unread}


async def leer(db, user_id, key):
    row = await db.scalar(select(Notificacion).where(Notificacion.id_usuario == user_id,
                          Notificacion.id_notificacion == key).with_for_update())
    if row is None:
        raise HTTPException(404, 'Notificación no encontrada.')
    if row.leida_en is None:
        row.leida_en = datetime.now(timezone.utc)
        await db.flush()
    return row


async def leer_todas(db, user_id):
    await db.execute(update(Notificacion).where(Notificacion.id_usuario == user_id, Notificacion.leida_en.is_(None))
                     .values(leida_en=datetime.now(timezone.utc)))


async def recordatorios(db, *, ahora=None):
    now = ahora or datetime.now(timezone.utc)
    existing_session = select(Sesion.id_sesion).where(Sesion.id_reserva == Reserva.id_reserva,
                         Sesion.estado_sesion.in_(['EN_CURSO', 'FINALIZADA'])).exists()
    rows = (await db.scalars(select(Reserva).where(Reserva.estado_reserva == 'CONFIRMADA',
        Reserva.fecha_hora_inicio > now, Reserva.fecha_hora_inicio <= now + timedelta(minutes=30),
        ~existing_session).with_for_update(skip_locked=True))).all()
    for cita in rows:
        await avisar_cita(db, None, cita, 'RECORDATORIO',
                         clave=f'RECORDATORIO:{cita.id_reserva}:{cita.fecha_hora_inicio.isoformat()}')

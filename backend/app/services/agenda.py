from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from sqlalchemy import delete, select
from app.models.agenda import BloqueoAgenda, TurnoSemanal
from app.models.auth import Usuario
from app.models.clinica import Reserva
from app.models.perfiles import Terapeuta
from app.services.acceso import exigir_profesional, obtener, perfil_activo

LIMA = ZoneInfo("America/Lima")


async def disponibilidad(db, therapist):
    profile = await perfil_activo(db, Terapeuta, therapist)
    user = await obtener(db, Usuario, profile.id_usuario)
    if user.password_change_required:
        raise HTTPException(409, "El terapeuta debe activar su cuenta antes de publicar horarios.")
    turns = (await db.scalars(select(TurnoSemanal).where(
        TurnoSemanal.id_terapeuta == therapist).order_by(TurnoSemanal.dia, TurnoSemanal.hora))).all()
    blocks = (await db.scalars(select(BloqueoAgenda).where(
        BloqueoAgenda.id_terapeuta == therapist).order_by(BloqueoAgenda.inicio))).all()
    return {"turnos": [{"dia": t.dia, "hora": t.hora} for t in turns],
            "bloqueos": [{"inicio": b.inicio, "fin": b.fin} for b in blocks]}


async def guardar(db, identity, therapist, data):
    await exigir_profesional(db, identity, therapist)
    # Mismo lock que las reservas: un cambio concurrente no invalida la comprobación.
    await obtener(db, Terapeuta, therapist, lock=True)
    await perfil_activo(db, Terapeuta, therapist)
    await db.execute(delete(TurnoSemanal).where(TurnoSemanal.id_terapeuta == therapist))
    await db.execute(delete(BloqueoAgenda).where(BloqueoAgenda.id_terapeuta == therapist))
    db.add_all([TurnoSemanal(id_terapeuta=therapist, **t.model_dump()) for t in data.turnos])
    db.add_all([BloqueoAgenda(id_terapeuta=therapist, **b.model_dump()) for b in data.bloqueos])
    await db.flush()
    return await disponibilidad(db, therapist)


async def validar_turno(db, therapist, start, end):
    local = start.astimezone(LIMA)
    await disponibilidad(db, therapist)
    if local.date() > datetime.now(LIMA).date() + timedelta(days=90):
        raise HTTPException(422, "Seleccione una fecha dentro de los próximos 90 días.")
    if local.minute or local.second or local.microsecond or end - start != timedelta(minutes=45):
        raise HTTPException(422, "Seleccione un turno de 45 minutos con inicio a la hora exacta.")
    turn = await db.scalar(select(TurnoSemanal.id_turno).where(
        TurnoSemanal.id_terapeuta == therapist, TurnoSemanal.dia == local.weekday(),
        TurnoSemanal.hora == local.hour))
    if turn is None:
        raise HTTPException(409, "El terapeuta no tiene disponibilidad en ese turno.")
    block = await db.scalar(select(BloqueoAgenda.id_bloqueo).where(
        BloqueoAgenda.id_terapeuta == therapist, BloqueoAgenda.inicio < end,
        BloqueoAgenda.fin > start).limit(1))
    if block is not None:
        raise HTTPException(409, "Ese turno está bloqueado por el terapeuta.")


async def turnos_del_dia(db, therapist, day):
    today = datetime.now(LIMA).date()
    if day < today or day > today + timedelta(days=90):
        raise HTTPException(422, "Seleccione una fecha entre hoy y los próximos 90 días.")
    config = await disponibilidad(db, therapist)
    start = datetime.combine(day, time(0), LIMA)
    end = start + timedelta(days=1)
    busy = (await db.scalars(select(Reserva).where(Reserva.id_terapeuta == therapist,
        Reserva.estado_reserva != "CANCELADA", Reserva.fecha_hora_inicio < end,
        Reserva.fecha_hora_fin > start))).all()
    enabled = {(t["dia"], t["hora"]) for t in config["turnos"]}
    result = []
    for hour in range(8, 18):
        begin = start.replace(hour=hour)
        finish = begin + timedelta(minutes=45)
        reason = None
        if begin <= datetime.now(timezone.utc):
            reason = "Horario pasado"
        elif (day.weekday(), hour) not in enabled:
            reason = "Fuera de disponibilidad"
        elif any(b["inicio"] < finish and b["fin"] > begin for b in config["bloqueos"]):
            reason = "Bloqueado"
        elif any(b.fecha_hora_inicio < finish and b.fecha_hora_fin > begin for b in busy):
            reason = "Ocupado"
        result.append({"inicio": begin, "fin": finish, "disponible": reason is None, "motivo": reason})
    return result

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select

from app.models.clinica import ReporteSesion, Sesion
from app.services.acceso import exigir_profesional, obtener
from app.services.citas import cita_visible


async def crear_sesion(db, identity, data):
    cita = await cita_visible(db, identity, data.id_reserva, lock=True)
    await exigir_profesional(db, identity, cita.id_terapeuta)
    if cita.estado_reserva != "CONFIRMADA":
        raise HTTPException(409, "Se requiere una cita confirmada.")
    if await db.scalar(select(Sesion.id_sesion).where(Sesion.id_reserva == cita.id_reserva)):
        raise HTTPException(409, "La cita ya tiene una sesión.")
    row = Sesion(id_reserva=cita.id_reserva, estado_sesion="PROGRAMADA")
    db.add(row)
    await db.flush()
    return row


async def sesion_visible(db, identity, key, *, escritura=False):
    row = await obtener(db, Sesion, key, lock=escritura)
    cita = await cita_visible(db, identity, row.id_reserva, contexto=not escritura)
    if escritura:
        await exigir_profesional(db, identity, cita.id_terapeuta)
    return row, cita


async def reporte_visible(db, identity, key):
    session, appointment = await sesion_visible(db, identity, key)
    report = await db.scalar(select(ReporteSesion).where(ReporteSesion.id_sesion == key))
    if report is None:
        raise HTTPException(404, "Reporte no registrado.")
    return session, appointment, report


async def iniciar_sesion(db, identity, key):
    row, cita = await sesion_visible(db, identity, key, escritura=True)
    if row.estado_sesion != "PROGRAMADA" or cita.estado_reserva != "CONFIRMADA":
        raise HTTPException(409, "Solo se puede iniciar una sesión programada y confirmada.")
    if cita.fecha_hora_inicio > datetime.now(timezone.utc):
        raise HTTPException(409, "La cita todavía no comienza.")
    row.estado_sesion = "EN_CURSO"
    row.fecha_hora_inicio_real = datetime.now(timezone.utc)
    await db.flush()
    return row


async def cerrar_sesion(db, identity, key, data):
    row, cita = await sesion_visible(db, identity, key, escritura=True)
    if data.asistencia == "ASISTIO" and row.estado_sesion != "EN_CURSO":
        raise HTTPException(409, "Primero debe iniciar la sesión.")
    if data.asistencia == "NO_ASISTIO" and row.estado_sesion != "PROGRAMADA":
        raise HTTPException(409, "Solo se registra inasistencia en una sesión programada.")
    if data.asistencia == "NO_ASISTIO" and cita.fecha_hora_fin > datetime.now(timezone.utc):
        raise HTTPException(409, "Espere al final del horario antes de registrar inasistencia.")
    row.estado_sesion = "FINALIZADA"
    row.asistencia = data.asistencia
    row.fecha_hora_fin_real = datetime.now(timezone.utc)
    cita.estado_reserva = "COMPLETADA"
    await db.flush()
    return row


async def guardar_reporte(db, identity, key, data):
    row, _ = await sesion_visible(db, identity, key, escritura=True)
    if row.estado_sesion not in {"EN_CURSO", "FINALIZADA"}:
        raise HTTPException(409, "La sesión aún no ha comenzado.")
    report = await db.scalar(select(ReporteSesion).where(ReporteSesion.id_sesion == key))
    if report is None:
        report = ReporteSesion(id_sesion=key)
        db.add(report)
    for field, value in data.model_dump().items():
        setattr(report, field, value)
    await db.flush()
    return report

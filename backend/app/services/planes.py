"""Versiones clínicas inmutables creadas por el profesional de la atención."""
from datetime import datetime
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from sqlalchemy import select
from app.models.clinica import Expediente, ReporteSesion, Tratamiento
from app.services.acceso import exigir, obtener
from app.models.perfiles import Paciente, Terapeuta
from app.services.sesiones import sesion_visible


async def leer(db, identity, key):
    await sesion_visible(db, identity, key)
    return await db.scalar(select(Tratamiento).where(Tratamiento.id_sesion_origen == key))


async def publicar(db, identity, key, data):
    exigir(identity, "TERAPEUTA")
    # Mantener el orden estable de bloqueos: paciente -> sesión.
    _, appointment = await sesion_visible(db, identity, key)
    author = await obtener(db, Terapeuta, appointment.id_terapeuta)
    if author.id_usuario != identity[0].id_usuario:
        raise HTTPException(403, "Solo el profesional de esta sesión puede publicar su plan.")
    patient = await obtener(db, Paciente, appointment.id_paciente, lock=True)
    session, appointment = await sesion_visible(db, identity, key, escritura=True)
    if not patient.activo:
        raise HTTPException(409, "Paciente inactivo.")
    if session.estado_sesion not in {"EN_CURSO", "FINALIZADA"} or session.asistencia == "NO_ASISTIO":
        raise HTTPException(409, "El plan requiere una atención iniciada, sin inasistencia.")
    report = await db.scalar(select(ReporteSesion).where(ReporteSesion.id_sesion == key))
    if not report or not any((report.observaciones_iniciales, report.objetivos_trabajados, report.proximos_pasos)):
        raise HTTPException(409, "Guarde primero el reporte de esta atención.")
    if await db.scalar(select(Tratamiento.id_tratamiento).where(Tratamiento.id_sesion_origen == key)):
        raise HTTPException(409, "Esta sesión ya publicó un plan. Conserve esta versión y revise el plan en otra atención.")
    record = await db.scalar(select(Expediente).where(Expediente.id_paciente == patient.id_paciente))
    if record is None:
        record = Expediente(id_paciente=patient.id_paciente)
        db.add(record)
        await db.flush()
    today = datetime.now(ZoneInfo("America/Lima")).date()
    active = (await db.scalars(select(Tratamiento).where(Tratamiento.id_expediente == record.id_expediente,
                                                       Tratamiento.estado_tratamiento == "ACTIVO"))).all()
    for previous in active:
        previous.estado_tratamiento = "FINALIZADO"
        previous.fecha_fin = today
    # Resolver el índice único antes de insertar la siguiente versión.
    await db.flush()
    row = Tratamiento(**data.model_dump(), id_sesion_origen=key, id_expediente=record.id_expediente,
                      id_terapeuta=appointment.id_terapeuta, estado_tratamiento="ACTIVO",
                      fecha_inicio=today.replace(day=1))
    db.add(row)
    await db.flush()
    return row

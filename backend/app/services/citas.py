from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import false, or_, select

from app.models.clinica import Expediente, ReporteSesion, Reserva, Sesion, Tratamiento
from app.models.perfiles import Paciente, Terapeuta, Tutor
from app.services.acceso import es_familia, exigir_profesional, obtener, paciente_visible, perfil_activo, roles_de
from app.services.agenda import validar_turno


def citas_visibles(identity):
    roles = roles_de(identity)
    if "ADMIN" in roles:
        return select(Reserva)
    user_id = identity[0].id_usuario
    clauses = []
    if "PADRE" in roles:
        family = select(Paciente.id_paciente).join(Tutor).where(Tutor.id_usuario == user_id)
        clauses.append(Reserva.id_paciente.in_(family))
    if "TERAPEUTA" in roles:
        therapist = select(Terapeuta.id_terapeuta).where(Terapeuta.id_usuario == user_id)
        clauses.append(Reserva.id_terapeuta.in_(therapist))
    return select(Reserva).where(or_(*clauses) if clauses else false())


async def cita_visible(db, identity, key, *, lock=False, contexto=False):
    if contexto:
        own = await db.scalar(citas_visibles(identity).where(Reserva.id_reserva == key))
        if own is not None:
            return own
        row = await obtener(db, Reserva, key)
        await paciente_visible(db, identity, row.id_paciente)
        return row
    stmt = citas_visibles(identity).where(Reserva.id_reserva == key)
    if lock:
        stmt = stmt.with_for_update().execution_options(populate_existing=True)
    row = await db.scalar(stmt)
    if row is None:
        raise HTTPException(404, "Recurso no encontrado.")
    return row


async def validar_horario(db, patient_id, therapist_id, data, excluded=None):
    if data.fecha_hora_inicio <= datetime.now(timezone.utc):
        raise HTTPException(422, "La cita debe comenzar en el futuro.")
    # Bloqueos de filas estables serializan reservas concurrentes, incluso sin citas previas.
    patient = await obtener(db, Paciente, patient_id, lock=True)
    await obtener(db, Terapeuta, therapist_id, lock=True)
    if not patient.activo:
        raise HTTPException(409, "Paciente inactivo.")
    await perfil_activo(db, Terapeuta, therapist_id)
    await validar_turno(db, therapist_id, data.fecha_hora_inicio, data.fecha_hora_fin)
    collision = select(Reserva.id_reserva).where(
        or_(Reserva.id_paciente == patient_id, Reserva.id_terapeuta == therapist_id),
        Reserva.estado_reserva != "CANCELADA",
        Reserva.fecha_hora_inicio < data.fecha_hora_fin,
        Reserva.fecha_hora_fin > data.fecha_hora_inicio,
    )
    if excluded is not None:
        collision = collision.where(Reserva.id_reserva != excluded)
    if await db.scalar(collision.limit(1)) is not None:
        raise HTTPException(409, "El paciente o terapeuta ya tiene una cita en ese horario.")


async def recorrido(db, identity, patient_id):
    await paciente_visible(db, identity, patient_id)
    completed = await db.scalar(select(Reserva.id_reserva).join(Sesion).join(ReporteSesion).where(
        Reserva.id_paciente == patient_id, Reserva.tipo_cita == "INTRODUCTORIA",
        Sesion.estado_sesion == "FINALIZADA", Sesion.asistencia == "ASISTIO",
        or_(ReporteSesion.observaciones_iniciales != "", ReporteSesion.objetivos_trabajados != "",
            ReporteSesion.proximos_pasos != "")).limit(1))
    pending = await db.scalar(select(Reserva.id_reserva).where(Reserva.id_paciente == patient_id,
        Reserva.tipo_cita == "INTRODUCTORIA", Reserva.estado_reserva.in_(["PENDIENTE", "CONFIRMADA"])).limit(1))
    plan = await db.scalar(select(Tratamiento.id_tratamiento).join(Expediente).where(
        Expediente.id_paciente == patient_id, Tratamiento.estado_tratamiento == "ACTIVO",
        Tratamiento.id_sesion_origen.is_not(None)).limit(1))
    return {"introduccion_atendida": completed is not None, "introduccion_pendiente": pending,
            "terapia_habilitada": completed is not None and plan is not None}


async def crear_cita(db, identity, data):
    patient_id, therapist_id = data.id_paciente, data.id_terapeuta
    if data.tipo_cita == "TERAPIA":
        treatment = await obtener(db, Tratamiento, data.id_tratamiento)
        record = await obtener(db, Expediente, treatment.id_expediente)
        await paciente_visible(db, identity, record.id_paciente)
        if patient_id is not None and patient_id != record.id_paciente:
            raise HTTPException(422, "El plan no pertenece a ese niño.")
        patient_id = record.id_paciente
        therapist_id = therapist_id or treatment.id_terapeuta
    patient = await paciente_visible(db, identity, patient_id)
    if not await es_familia(db, identity, patient):
        await exigir_profesional(db, identity, therapist_id)
    await validar_horario(db, patient_id, therapist_id, data)
    if data.tipo_cita == "TERAPIA":
        # El bloqueo del niño serializa con la publicación/reemplazo de su plan.
        treatment = await obtener(db, Tratamiento, data.id_tratamiento, lock=True)
        if treatment.estado_tratamiento.upper() != "ACTIVO" or treatment.id_sesion_origen is None:
            raise HTTPException(409, "Seleccione el plan profesional vigente del nuevo flujo.")
    state = await recorrido(db, identity, patient_id)
    if data.tipo_cita == "TERAPIA" and not state["terapia_habilitada"]:
        raise HTTPException(409, "Complete la introducción de este niño con asistencia, reporte y plan antes de reservar terapia.")
    if data.tipo_cita == "INTRODUCTORIA" and (state["introduccion_atendida"] or state["introduccion_pendiente"]):
        raise HTTPException(409, "Este niño ya tiene una introducción atendida o reservada.")
    row = Reserva(**data.model_dump(exclude={"id_paciente", "id_terapeuta"}),
                  id_paciente=patient_id, id_terapeuta=therapist_id, estado_reserva="CONFIRMADA")
    db.add(row)
    await db.flush()
    return row


async def cambiar_cita(db, identity, key, data, *, horario=False):
    row = await cita_visible(db, identity, key, lock=True)
    if row.estado_reserva not in {"PENDIENTE", "CONFIRMADA"}:
        raise HTTPException(409, "La cita ya está cerrada o tiene un estado no editable.")
    if await db.scalar(select(Sesion.id_sesion).where(Sesion.id_reserva == key)):
        raise HTTPException(409, "No se puede cambiar una cita con sesión registrada.")
    if horario:
        await validar_horario(db, row.id_paciente, row.id_terapeuta, data, key)
        for field, value in data.model_dump().items():
            setattr(row, field, value)
        row.estado_reserva = "CONFIRMADA"
    else:
        if data.estado_reserva == "CONFIRMADA":
            await exigir_profesional(db, identity, row.id_terapeuta)
            if row.fecha_hora_inicio <= datetime.now(timezone.utc):
                raise HTTPException(409, "No se puede confirmar una cita pasada.")
        row.estado_reserva = data.estado_reserva
    await db.flush()
    return row

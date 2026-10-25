"""Una opinión por sesión atendida; solo escribe su familia autorizada."""
from fastapi import HTTPException
from sqlalchemy import select, func
from app.modules.clinica.domain.clinica_models import Sesion
from app.modules.cuentas.domain.perfiles_models import Paciente
from app.modules.clinica.domain.valoraciones_models import Valoracion
from app.shared.application.acceso import es_familia, exigir, obtener
from app.modules.agenda.application.citas import cita_visible


async def disponible(db):
    # No DDL automático. Permite publicar la UI antes de adoptar la migración.
    if await db.scalar(select(func.to_regclass('public.valoraciones_sesion'))) is None:
        raise HTTPException(503, 'Valoraciones: próximamente.', headers={'X-ASHA-Feature': 'valoraciones-pendiente'})


async def contexto(db, identity, key, *, escritura=False):
    if escritura:
        exigir(identity, 'PADRE')
    session = await obtener(db, Sesion, key, lock=escritura)
    appointment = await cita_visible(db, identity, session.id_reserva)
    if escritura:
        patient = await obtener(db, Paciente, appointment.id_paciente)
        if not await es_familia(db, identity, patient):
            raise HTTPException(404, 'Recurso no encontrado.')
    return session


async def leer(db, identity, key):
    await contexto(db, identity, key)
    await disponible(db)
    return await db.scalar(select(Valoracion).where(Valoracion.id_sesion == key))


async def crear(db, identity, key, data):
    session = await contexto(db, identity, key, escritura=True)
    if session.estado_sesion != 'FINALIZADA' or session.asistencia != 'ASISTIO':
        raise HTTPException(409, 'Solo se pueden calificar sesiones finalizadas con asistencia.')
    await disponible(db)
    # Bloqueo de sesión serializa envíos concurrentes; UNIQUE es la última defensa.
    previous = await db.scalar(select(Valoracion).where(Valoracion.id_sesion == key))
    if previous:
        if previous.id_usuario == identity[0].id_usuario and previous.calificacion == data.calificacion and previous.comentario == data.comentario:
            return previous  # Reintento tras perder la respuesta: no duplica la opinión.
        raise HTTPException(409, 'Esta sesión ya tiene una valoración.')
    row = Valoracion(id_sesion=key, id_usuario=identity[0].id_usuario, **data.model_dump())
    db.add(row)
    await db.flush()
    return row

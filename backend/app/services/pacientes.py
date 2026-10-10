from fastapi import HTTPException
from sqlalchemy import select

from app.models.clinica import Expediente, Tratamiento
from app.models.perfiles import Paciente, Terapeuta, Tutor
from app.services.acceso import (
    exigir, es_familia, obtener, paciente_visible, perfil_activo, roles_de,
)


async def crear_paciente(db, identity, data):
    exigir(identity, "PADRE", "ADMIN")
    tutor_id = data.id_tutor
    if "ADMIN" not in roles_de(identity):
        tutor = await db.scalar(select(Tutor).where(Tutor.id_usuario == identity[0].id_usuario))
        if not tutor or tutor_id not in (None, tutor.id_tutor):
            raise HTTPException(403, "Solo puede registrar pacientes de su propia familia.")
        tutor_id = tutor.id_tutor
    if tutor_id is None:
        raise HTTPException(422, "Debe indicar id_tutor.")
    await perfil_activo(db, Tutor, tutor_id)
    row = Paciente(**data.model_dump(exclude={"id_tutor"}), id_tutor=tutor_id)
    db.add(row)
    await db.flush()
    return row


async def editar_paciente(db, identity, key, data=None):
    exigir(identity, "PADRE", "ADMIN")
    row = await paciente_visible(db, identity, key, lock=True)
    if "ADMIN" not in roles_de(identity) and not await es_familia(db, identity, row):
        raise HTTPException(403, "Solo puede modificar pacientes de su propia familia.")
    if data is None:
        row.activo = False
    else:
        for field, value in data.model_dump().items():
            setattr(row, field, value)
    await db.flush()
    return row


async def crear_tratamiento(db, identity, data):
    exigir(identity, "ADMIN")
    raise HTTPException(410, "El profesional define el plan desde una sesión atendida con reporte.")

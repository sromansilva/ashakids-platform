"""Autorización por recurso: el rol por sí solo no habilita datos de otra familia."""
from fastapi import HTTPException
from sqlalchemy import false, or_, select

from app.models.auth import Usuario
from app.models.clinica import Expediente, Tratamiento
from app.models.perfiles import Paciente, Terapeuta, Tutor


def roles_de(identity):
    return {role.upper() for role in identity[1]}


def exigir(identity, *roles):
    if not roles_de(identity).intersection(roles):
        raise HTTPException(403, "No tiene permiso para esta operación.")


async def obtener(db, model, key, *, lock=False):
    pk = model.__mapper__.primary_key[0]
    stmt = select(model).where(pk == key)
    if lock:
        stmt = stmt.with_for_update()
    row = await db.scalar(stmt)
    if row is None:
        raise HTTPException(404, "Recurso no encontrado.")
    return row


def pacientes_visibles(identity):
    user, _ = identity
    roles = roles_de(identity)
    if "ADMIN" in roles:
        return select(Paciente)
    clauses = []
    if "PADRE" in roles:
        clauses.append(Paciente.id_tutor.in_(select(Tutor.id_tutor).where(Tutor.id_usuario == user.id_usuario)))
    if "TERAPEUTA" in roles:
        assigned = (select(Expediente.id_paciente).join(Tratamiento)
                    .join(Terapeuta).where(Terapeuta.id_usuario == user.id_usuario))
        clauses.append(Paciente.id_paciente.in_(assigned))
    return select(Paciente).where(or_(*clauses) if clauses else false())


async def paciente_visible(db, identity, key, *, lock=False):
    stmt = pacientes_visibles(identity).where(Paciente.id_paciente == key)
    if lock:
        stmt = stmt.with_for_update()
    row = await db.scalar(stmt)
    if row is None:
        # No revelar si existe un paciente ajeno.
        raise HTTPException(404, "Recurso no encontrado.")
    return row


async def exigir_profesional(db, identity, id_terapeuta):
    exigir(identity, "ADMIN", "TERAPEUTA")
    if "ADMIN" not in roles_de(identity):
        therapist = await obtener(db, Terapeuta, id_terapeuta)
        if therapist.id_usuario != identity[0].id_usuario:
            raise HTTPException(403, "Solo el profesional asignado puede realizar esta operación.")


async def perfil_activo(db, model, key):
    profile = await obtener(db, model, key)
    user = await obtener(db, Usuario, profile.id_usuario)
    if not user.activo:
        raise HTTPException(409, "El usuario del perfil está inactivo.")
    return profile


async def es_familia(db, identity, patient):
    if "PADRE" not in roles_de(identity):
        return False
    return await db.scalar(select(Tutor.id_tutor).where(
        Tutor.id_tutor == patient.id_tutor, Tutor.id_usuario == identity[0].id_usuario)) is not None

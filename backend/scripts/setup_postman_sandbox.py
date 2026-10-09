"""Prepara identidades sintéticas para la colección local de Postman.

Solo permite PostgreSQL local y una base cuyo nombre empiece por
``ashakids_test_``. Nunca apunta a la configuración de Supabase.
"""
import asyncio
import os
from datetime import date, datetime, timedelta, timezone
from urllib.parse import urlparse

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.core.security import hash_password
from app.models.auth import Administrador, Rol, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor
from app.models.perfiles import Paciente
from app.models.clinica import Expediente, Reserva, Sesion, Tratamiento

PASSWORD = "Postman-Synthetic-Only-2026"
USERS = (("a90001", "ADMIN"), ("p90001", "PADRE"), ("t90001", "TERAPEUTA"))


def test_url() -> str:
    value = os.environ.get("ASHAKIDS_TEST_DATABASE_URL", "")
    parsed = urlparse(value.replace("postgresql+asyncpg://", "postgresql://", 1))
    if parsed.hostname not in {"127.0.0.1", "localhost"} or not parsed.path.lstrip("/").startswith("ashakids_test_"):
        raise RuntimeError("ASHAKIDS_TEST_DATABASE_URL debe apuntar a una BD local ashakids_test_*.")
    return value


async def main() -> None:
    engine = create_async_engine(test_url())
    factory = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with engine.begin() as connection:
            await connection.execute(text("TRUNCATE usuarios RESTART IDENTITY CASCADE"))
        async with factory.begin() as db:
            role_ids = {role.nombre_rol: role.id_rol for role in (await db.scalars(select(Rol))).all()}
            if set(role_ids) != {"ADMIN", "PADRE", "TERAPEUTA"}:
                raise RuntimeError("La base aislada no contiene los tres roles requeridos.")
            password_hash = hash_password(PASSWORD)
            for code, role_name in USERS:
                user = Usuario(nombres="Postman", apellidos="Sintético", codigo_usuario=code,
                               email=f"{code}@example.com", password_hash=password_hash)
                db.add(user)
                await db.flush()
                db.add(UsuarioRol(id_usuario=user.id_usuario, id_rol=role_ids[role_name]))
                db.add({"ADMIN": Administrador, "PADRE": Tutor, "TERAPEUTA": Terapeuta}[role_name](id_usuario=user.id_usuario))
            await db.flush()
            patient = Paciente(id_tutor=1, nombres_paciente="Fixture", apellidos_paciente="Postman",
                               fecha_nacimiento=date(2020, 1, 1), sexo="OTRO")
            db.add(patient)
            await db.flush()
            record = Expediente(id_paciente=patient.id_paciente)
            db.add(record)
            await db.flush()
            treatment = Tratamiento(id_expediente=record.id_expediente, id_terapeuta=1,
                                    nombre_tratamiento="Fixture Postman", estado_tratamiento="ACTIVO")
            db.add(treatment)
            await db.flush()
            now = datetime.now(timezone.utc)
            appointment = Reserva(id_paciente=patient.id_paciente, id_terapeuta=1,
                                  id_tratamiento=treatment.id_tratamiento,
                                  fecha_hora_inicio=now - timedelta(hours=2),
                                  fecha_hora_fin=now - timedelta(hours=1),
                                  modalidad="VIRTUAL", estado_reserva="CONFIRMADA")
            db.add(appointment)
            await db.flush()
            db.add(Sesion(id_reserva=appointment.id_reserva, estado_sesion="PROGRAMADA"))
        print("Sandbox de Postman listo: 3 identidades sintéticas.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

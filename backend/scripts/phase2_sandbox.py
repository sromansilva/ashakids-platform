"""Preparación y avance de reloj de fixtures SOLO en PostgreSQL local descartable.

Uso: ASHAKIDS_TEST_DATABASE_URL=... python -m scripts.phase2_sandbox prepare|due|inspect
La contraseña de estas identidades es pública y sintética; jamás ejecutar en una BD real.
"""
import argparse
import asyncio
import json
import os
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, text, update
from scripts.testing_database import disposable_database_urls
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.core.security import hash_password
from app.models.auth import Administrador, Rol, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor
from app.models.clinica import Reserva

PASSWORD = "Auditoria-Sintetica-2026!"
IDENTITIES = [("a90001", "ADMIN"), ("p90001", "PADRE"), ("p90002", "PADRE"),
              ("t90001", "TERAPEUTA"), ("t90002", "TERAPEUTA")]


def disposable_url():
    return disposable_database_urls()[0]


async def run(command):
    engine = create_async_engine(disposable_url())
    factory = async_sessionmaker(engine, expire_on_commit=False)
    try:
        if command == "prepare":
            cleanup_engine = create_async_engine(disposable_database_urls()[1])
            try:
                async with cleanup_engine.begin() as db:
                    await db.execute(text("TRUNCATE usuarios RESTART IDENTITY CASCADE"))
            finally:
                await cleanup_engine.dispose()
            async with factory.begin() as db:
                roles = {r.nombre_rol: r.id_rol for r in (await db.scalars(select(Rol))).all()}
                for code, role in IDENTITIES:
                    user = Usuario(nombres=role.title(), apellidos="Auditoria", codigo_usuario=code,
                                   email=f"{code}@example.com", password_hash=hash_password(PASSWORD))
                    db.add(user)
                    await db.flush()
                    db.add(UsuarioRol(id_usuario=user.id_usuario, id_rol=roles[role]))
                    db.add({"ADMIN": Administrador, "PADRE": Tutor, "TERAPEUTA": Terapeuta}[role](id_usuario=user.id_usuario))
            print("5 identidades ficticias listas; sin pacientes ni citas.")
        elif command == "due":
            now = datetime.now(timezone.utc)
            async with factory.begin() as db:
                result = await db.execute(update(Reserva).where(Reserva.estado_reserva == "CONFIRMADA").values(
                    fecha_hora_inicio=now - timedelta(minutes=5), fecha_hora_fin=now + timedelta(minutes=40)))
                print(f"Fixture temporal aplicada a {result.rowcount} citas confirmadas locales.")
        else:
            async with engine.connect() as db:
                tables = (await db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))).scalars().all()
                constraints = (await db.execute(text("SELECT conname, contype, conrelid::regclass::text AS tabla, pg_get_constraintdef(oid) AS regla FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY conname"))).mappings().all()
                counts = {}
                for table in ("usuarios", "pacientes", "tratamientos", "reservas", "sesiones", "reportes_sesion"):
                    counts[table] = await db.scalar(text(f"SELECT count(*) FROM public.{table}"))
                print(json.dumps({"postgresql": await db.scalar(text("SELECT version()")), "tables": tables,
                                  "constraints": [dict(r) for r in constraints], "counts": counts}, ensure_ascii=False, indent=2,
                                 default=lambda value: value.decode('utf-8') if isinstance(value, bytes) else str(value)))
    finally:
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["prepare", "due", "inspect"])
    asyncio.run(run(parser.parse_args().command))

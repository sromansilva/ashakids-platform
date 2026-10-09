"""Integración SQL real SOLO en una BD local descartable explícita, nunca .env."""
import os
import json
import re
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from scripts.testing_database import disposable_database_urls

from app.core import database
from app.core.security import hash_password
from app.main import app
from app.models.auth import Administrador, Rol, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor

TEST_PASSWORD = "Solo-Pruebas-Aisladas-2026"
API_EVIDENCE = set()


async def record_response(response):
    path = re.sub(r"/\d+(?=/|$)", "/{key}", response.request.url.path)
    API_EVIDENCE.add((response.request.method, path, response.status_code))


def pytest_sessionfinish(session, exitstatus):
    output = Path(__file__).resolve().parents[2] / "tmp" / "backend-api-evidence.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"exitstatus": exitstatus, "environment": "isolated-local-postgresql",
        "requests": [{"method": m, "path": p, "status": s} for m, p, s in sorted(API_EVIDENCE)]}, indent=2), encoding="utf-8")


@pytest_asyncio.fixture
async def clinical():
    url = os.getenv("ASHAKIDS_TEST_DATABASE_URL")
    if not url:
        pytest.skip("Defina ASHAKIDS_TEST_DATABASE_URL a PostgreSQL local descartable.")
    url, admin_url = disposable_database_urls()
    engine = create_async_engine(url)
    cleanup_engine = create_async_engine(admin_url)
    factory = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)
    previous = database.async_session_factory
    database.async_session_factory = factory
    clients = {}
    try:
        async with cleanup_engine.begin() as conn:
            await conn.execute(text("TRUNCATE usuarios RESTART IDENTITY CASCADE"))
        async with factory.begin() as db:
            roles = {r.nombre_rol: r.id_rol for r in (await db.scalars(select(Rol))).all()}
            hashed = hash_password(TEST_PASSWORD)
            for number, (code, role) in enumerate([
                ("a90001", "ADMIN"), ("p90001", "PADRE"), ("p90002", "PADRE"),
                ("t90001", "TERAPEUTA"), ("t90002", "TERAPEUTA"),
            ], 1):
                row = Usuario(nombres="Prueba", apellidos="Sintética", codigo_usuario=code,
                              email=f"{code}@example.com", password_hash=hashed)
                db.add(row)
                await db.flush()
                db.add(UsuarioRol(id_usuario=row.id_usuario, id_rol=roles[role]))
                model = {"ADMIN": Administrador, "PADRE": Tutor, "TERAPEUTA": Terapeuta}[role]
                db.add(model(id_usuario=row.id_usuario))
        for code in ("a90001", "p90001", "p90002", "t90001", "t90002"):
            client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test",
                                      event_hooks={"response": [record_response]})
            clients[code] = client
            response = await client.post("/api/v1/auth/login", json={
                "codigo_usuario": code, "password": TEST_PASSWORD})
            assert response.status_code == 200, response.text
        yield clients, factory
    finally:
        for client in clients.values():
            await client.aclose()
        database.async_session_factory = previous
        async with cleanup_engine.begin() as conn:
            await conn.execute(text("TRUNCATE usuarios RESTART IDENTITY CASCADE"))
        await cleanup_engine.dispose()
        await engine.dispose()

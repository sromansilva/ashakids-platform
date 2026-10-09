"""Seguridad y contratos sin conexiones ni fixtures de BD; dobles explícitos."""
import ssl
from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.exc import DBAPIError, IntegrityError, TimeoutError as PoolTimeoutError

from app.core import database
from app.core.config import Settings
from app.core.database_transport import engine_options
from app.core.login_limiter import LoginLimiter
from app.main import app
from app.schemas.admin import CrearPadreRequest, CrearTerapeutaRequest
from app.schemas.auth import LoginRequest
from app.schemas.clinica import PacienteDatos, PacienteSalida
from app.schemas.pacientes import CrearHijoRequest, ActualizarHijoRequest
from app.schemas.usuarios import UsuarioCrear, UsuarioEditar


def config(**kwargs):
    return Settings(_env_file=None, **kwargs)


def test_remote_tls_verifies_identity_and_upgrades_require():
    url, options = engine_options("postgresql://user:synthetic@db.example.invalid/db?ssl=require", config())
    ctx = options["connect_args"]["ssl"]
    assert ctx.verify_mode == ssl.CERT_REQUIRED and ctx.check_hostname
    assert "ssl" not in url.query
    assert options["connect_args"]["timeout"] == 10


@pytest.mark.parametrize("query", ["ssl=disable", "sslmode=prefer", "sslmode=verify-ca", "sslrootcert=other"])
def test_insecure_url_does_not_downgrade(query):
    with pytest.raises(ValueError):
        engine_options(f"postgresql://user:synthetic@remote.invalid/db?{query}", config())


def test_local_development_and_missing_ca():
    _, opts = engine_options("postgresql://u:p@localhost/db", config())
    assert opts["connect_args"]["ssl"] is False
    with pytest.raises(OSError):
        engine_options("postgresql://u:p@remote.invalid/db", config(DB_SSL_CA_FILE="missing-ca.crt"))


@pytest.mark.parametrize("overrides", [
    {"CORS_ORIGINS": ["*"]}, {"CORS_ORIGINS": ["http://localhost:5174"]},
    {"CORS_ORIGINS": ["https://*.example.invalid"]},
    {"CORS_ORIGINS": []}, {"ENVIRONMENT": "prod"}, {"WEB_CONCURRENCY": 2},
    {"CORS_ORIGINS": ["https://example.invalid/path"]}, {"DB_SSL_LEGACY_CA": True},
])
def test_invalid_production_rejected(overrides):
    values = dict(ENVIRONMENT="production", DATABASE_URL="postgresql://u:p@remote.invalid/db",
                  CORS_ORIGINS=["https://web.example.invalid"])
    values.update(overrides)
    with pytest.raises(ValueError):
        config(**values)


def test_valid_production_has_secure_cookie_policy():
    assert config(ENVIRONMENT="production", DATABASE_URL="postgresql://u:p@remote.invalid/db",
                  CORS_ORIGINS=["https://web.example.invalid"]).is_production


def test_limiter_recovers_without_cross_ip_account_lockout():
    now = [0]
    gate = LoginLimiter(config(LOGIN_PAIR_LIMIT=2, LOGIN_IP_LIMIT=3, LOGIN_WINDOW_SECONDS=10), lambda: now[0])
    gate.check("ip1", "p00001")
    gate.check("ip1", "p00001")
    with pytest.raises(HTTPException) as exc:
        gate.check("ip1", "p00001")
    assert exc.value.status_code == 429 and exc.value.headers["Retry-After"] == "10"
    gate.check("ip2", "p00001")
    now[0] = 9
    with pytest.raises(HTTPException) as exc:
        gate.check("ip1", "p00001")
    assert exc.value.headers["Retry-After"] == "1"
    now[0] = 10
    gate.check("ip1", "p00001")


def test_limiter_ip_budget_prevents_code_rotation():
    gate = LoginLimiter(config(LOGIN_IP_LIMIT=2), lambda: 0)
    gate.check("ip", "p00001")
    gate.check("ip", "p00002")
    with pytest.raises(HTTPException):
        gate.check("ip", "absent")


def test_limiter_capacity_fails_closed_and_recovers():
    now = [0]
    gate = LoginLimiter(config(LOGIN_LIMITER_MAX_KEYS=100, LOGIN_WINDOW_SECONDS=1), lambda: now[0])
    for n in range(50):
        gate.check(str(n), "unknown")
    with pytest.raises(HTTPException):
        gate.check("new", "unknown")
    assert len(gate.buckets) == 100
    now[0] = 1
    gate.check("new", "unknown")
    assert len(gate.buckets) == 2


@pytest.mark.parametrize("password,valid", [("short", False), ("x" * 11, False), ("x" * 12, True),
                                           ("x" * 128, True), ("x" * 129, False)])
def test_same_new_password_rules(password, valid):
    data = dict(nombres="AUDITORIA", apellidos="Sintetico", email="audit@example.com", password=password)
    for model, extra in ((CrearPadreRequest, {}), (CrearTerapeutaRequest, {}),
                         (UsuarioCrear, {"rol": "PADRE", "codigo_usuario": "p99999"})):
        if valid:
            assert model(**data, **extra).password == password
            assert UsuarioEditar(password=password).password == password
        else:
            with pytest.raises(ValidationError):
                model(**data, **extra)
            with pytest.raises(ValidationError):
                UsuarioEditar(password=password)
    assert LoginRequest(codigo_usuario="old", password="12345").password == "12345"


@pytest.mark.parametrize("sex,expected", [("M", "Masculino"), ("F", "Femenino"), ("OTRO", "Otro"),
                                          (" masculino ", "Masculino"), ("Femenino", "Femenino")])
def test_both_patient_families_normalize_sex(sex, expected):
    data = dict(nombres_paciente=" A ", apellidos_paciente=" B ", fecha_nacimiento="2000-01-01", sexo=sex)
    for model in (PacienteDatos, CrearHijoRequest):
        row = model(**data)
        assert row.sexo == expected and row.nombres_paciente == "A"
    assert ActualizarHijoRequest(sexo=sex).sexo == expected
    assert ActualizarHijoRequest(avatar_nombre="oso").model_dump(exclude_unset=True) == {"avatar_nombre": "oso"}


@pytest.mark.parametrize("invalid", [{"sexo": "invalido"}, {"nombres_paciente": " "},
                                      {"fecha_nacimiento": str(date.today() + timedelta(days=1))}])
def test_same_invalid_patient_rules(invalid):
    data = dict(nombres_paciente="A", apellidos_paciente="B", fecha_nacimiento="2000-01-01", sexo="F")
    data.update(invalid)
    for model in (PacienteDatos, CrearHijoRequest):
        with pytest.raises(ValidationError):
            model(**data)


def test_partial_null_rejected_and_old_output_preserved():
    with pytest.raises(ValidationError):
        ActualizarHijoRequest(sexo=None)
    assert ActualizarHijoRequest().model_fields_set == set()
    row = PacienteSalida(nombres_paciente="A", apellidos_paciente="B", fecha_nacimiento="2000-01-01",
                         sexo="M", id_paciente=1, id_tutor=1, activo=True, fecha_registro="2026-01-01T00:00:00Z")
    assert row.sexo == "M"


@pytest.mark.asyncio
@pytest.mark.parametrize("error,expected", [
    (IntegrityError("secret SQL", {}, Exception("secret")), 409),
    (DBAPIError("secret SQL", {}, SimpleNamespace(sqlstate="40P01")), 409),
    (DBAPIError("secret SQL", {}, Exception("connection secret")), 503),
    (PoolTimeoutError("pool secret"), 503), (OSError("connection secret"), 503),
])
async def test_commit_errors_are_safe_even_if_rollback_fails(monkeypatch, error, expected):
    session = AsyncMock()
    session.commit.side_effect = error
    session.rollback.side_effect = OSError("rollback secret")
    class Factory:
        def __call__(self): return self
        async def __aenter__(self): return session
        async def __aexit__(self, *args): return False
    monkeypatch.setattr(database, "async_session_factory", Factory())
    gen = database.get_db()
    assert await anext(gen) is session
    with pytest.raises(HTTPException) as exc:
        await anext(gen)
    assert exc.value.status_code == expected and "secret" not in exc.value.detail
    session.rollback.assert_awaited_once()


@pytest.mark.asyncio
async def test_http_login_limit_recovery_and_production_transport(monkeypatch):
    from app.core import login_limiter
    from app.api.v1 import auth
    now = [0]
    gate = LoginLimiter(config(LOGIN_PAIR_LIMIT=1, LOGIN_WINDOW_SECONDS=10), lambda: now[0])
    monkeypatch.setattr(login_limiter, "login_limiter", gate)
    monkeypatch.setattr(auth, "authenticate_user", AsyncMock(return_value=None))
    async def fake_db(): yield AsyncMock()
    app.dependency_overrides[database.get_db] = fake_db
    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://test") as client:
            payload = {"codigo_usuario": "absent", "password": "short"}
            assert (await client.post("/api/v1/auth/login", json=payload)).status_code == 401
            assert (await client.post("/api/v1/auth/login", json=payload)).status_code == 429
            assert auth.authenticate_user.await_count == 1
            now[0] = 10
            assert (await client.post("/api/v1/auth/login", json=payload)).status_code == 401
            monkeypatch.setattr(auth.settings, "ENVIRONMENT", "production")
            assert (await client.post("/api/v1/auth/login", json=payload)).status_code == 403
    finally:
        app.dependency_overrides.pop(database.get_db, None)


@pytest.mark.asyncio
async def test_production_cookie_and_origin_checks_use_https(monkeypatch):
    from app.core import login_limiter
    from app.api.v1 import auth
    monkeypatch.setattr(login_limiter, "login_limiter", LoginLimiter())
    monkeypatch.setattr(auth.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(auth.settings, "CORS_ORIGINS", ["https://web.example.invalid"])
    user=SimpleNamespace(id_usuario=1,email="audit@example.com",nombres="AUDITORIA",apellidos="Sintetico",
                         codigo_usuario="p99999",activo=True)
    monkeypatch.setattr(auth,"authenticate_user",AsyncMock(return_value=(user,["PADRE"])))
    monkeypatch.setattr(auth,"create_user_session",AsyncMock(return_value=("synthetic-token",None)))
    monkeypatch.setattr(auth,"revoke_session",AsyncMock(return_value=True))
    async def fake_db(): yield AsyncMock()
    app.dependency_overrides[database.get_db]=fake_db
    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app),base_url="https://api.example.invalid") as client:
            result=await client.post("/api/v1/auth/login",json={"codigo_usuario":"p99999","password":"short"})
            assert result.status_code==200
            cookie=result.headers["set-cookie"]
            assert "Secure" in cookie and "HttpOnly" in cookie and "SameSite=lax" in cookie
            assert (await client.post("/api/v1/auth/logout")).status_code==403
            assert (await client.post("/api/v1/auth/logout",headers={"Origin":"https://evil.example.invalid"})).status_code==403
            result=await client.post("/api/v1/auth/logout",headers={"Origin":"https://web.example.invalid"})
            assert result.status_code==200 and "Max-Age=0" in result.headers["set-cookie"]
            auth.revoke_session.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(database.get_db,None)

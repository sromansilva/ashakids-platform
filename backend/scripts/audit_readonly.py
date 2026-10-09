"""Inventario reproducible. Solo SELECT; nunca login ni creación de datos compartidos."""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

import httpx
from sqlalchemy import select, text
from app.core import database
from app.main import app
from app.models.clinica import Expediente, Tratamiento, Reserva, Sesion, ReporteSesion
from app.models.auth import Usuario, Rol, UsuarioRol, SesionAutenticacion, Administrador
from app.models.perfiles import Paciente, Tutor, Terapeuta, Perfil, Logro, PerfilLogro


async def audit():
    results = {"timestamp_utc": datetime.now(timezone.utc).isoformat(), "database_mode": "read-only"}
    paths = app.openapi()["paths"]
    results["operations"] = [{"method": method.upper(), "path": path}
                             for path, methods in paths.items() for method in methods]
    results["models"] = []
    try:
        async with database.async_engine.connect() as conn:
            await conn.execute(text("SET TRANSACTION READ ONLY"))
            results["postgresql_version"] = await conn.scalar(text("SHOW server_version"))
            rls = await conn.execute(text("SELECT c.relname, c.relrowsecurity FROM pg_class c "
                "JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'"))
            results["rls"] = [{"table": r[0], "enabled": r[1]} for r in rls]
            results["public_policy_count"] = await conn.scalar(text(
                "SELECT count(*) FROM pg_policies WHERE schemaname='public'"))
            results["runtime_bypasses_rls"] = await conn.scalar(text(
                "SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user"))
            for model in (Usuario, Rol, UsuarioRol, SesionAutenticacion, Administrador,
                          Paciente, Tutor, Terapeuta, Perfil, Logro, PerfilLogro,
                          Expediente, Tratamiento, Reserva, Sesion, ReporteSesion):
                # No extrae registros; verifica existencia de todas las columnas mapeadas.
                await conn.execute(select(model).limit(0))
                results["models"].append({"table": model.__tablename__, "select_limit_zero": "OK"})
            results["db_connectivity"] = "OK"
    except Exception as exc:
        results["db_connectivity"] = type(exc).__name__
    finally:
        if database.async_engine:
            await database.async_engine.dispose()
    results["live_http"] = []
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=10) as client:
        for path in ("/", "/health", "/health/ready", "/openapi.json", "/api/v1/auth/me"):
            try:
                response = await client.get(path)
                results["live_http"].append({"path": path, "status": response.status_code})
                if path == "/openapi.json" and response.status_code == 200:
                    results["live_paths_match"] = set(response.json()["paths"]) == set(paths)
            except httpx.HTTPError as exc:
                results["live_http"].append({"path": path, "error": type(exc).__name__})
    sizes = []
    for folder in ("app", "tests", "scripts"):
        for file in (ROOT / "backend" / folder).rglob("*.py"):
            sizes.append({"file": file.relative_to(ROOT).as_posix(),
                          "lines": len(file.read_text(encoding="utf-8-sig").splitlines())})
    results["python_files"] = sorted(sizes, key=lambda x: -x["lines"])
    output = ROOT / "tmp" / "backend-readonly-audit.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"db": results["db_connectivity"], "models": len(results["models"]),
                      "operations": len(results["operations"]), "http": results["live_http"]}))


if __name__ == "__main__":
    asyncio.run(audit())

"""Comprueba lecturas de fixtures locales sin modificar datos clínicos ni reiniciar tablas."""
import argparse
import asyncio
import json
from pathlib import Path
import httpx
from scripts.phase2_sandbox import PASSWORD
from tests.live_environment import isolated_live_api


async def run(output):
    cases = []
    snapshots = {}
    base = isolated_live_api()
    for code in ("a90001", "p90001", "p90002", "t90001", "t90002"):
        async with httpx.AsyncClient(base_url=base + "/", timeout=15) as client:
            async def call(method, path, expected=200, payload=None):
                if method != "GET" and path not in {"auth/login", "auth/logout"}:
                    raise RuntimeError("Solo se permiten lecturas y apertura/cierre de sesión de prueba.")
                response = await client.request(method, path, json=payload)
                assert response.status_code == expected, (code, method, path, response.status_code)
                cases.append({"identity": code, "method": method, "path": path, "status": response.status_code})
                return response.json()
            await call("POST", "auth/login", payload={"codigo_usuario": code, "password": PASSWORD})
            try:
                snapshot = {}
                for path in ("pacientes?activo=true&limit=100", "citas?limit=100", "sesiones?limit=100"):
                    rows = await call("GET", path)
                    assert len(rows) < 100, "Esta fixture no debe requerir otra página."
                    snapshot[path.split("?")[0]] = len(rows)
                    if path.startswith("pacientes"):
                        snapshot["patient_ids"] = [p["id_paciente"] for p in rows]
                    if path.startswith("sesiones") and code == "p90001":
                        report_id = next(s["id_sesion"] for s in rows if s["reporte_disponible"])
                        report = await call("GET", f"sesiones/{report_id}/reporte")
                        assert "AUDIT-2026-10-09-02" in report["observaciones_iniciales"]
                await call("GET", "usuarios?limit=100", 200 if code == "a90001" else 403)
                if code in {"p90002", "t90002"}:
                    await call("GET", "pacientes/1", 404)
                    await call("GET", "sesiones/1/reporte", 404)
                snapshots[code] = snapshot
            finally:
                await call("POST", "auth/logout")
    assert snapshots["p90001"]["patient_ids"] == [1, 2]
    assert snapshots["p90002"]["pacientes"] == 0
    assert snapshots["t90001"]["patient_ids"] == [1]
    assert snapshots["t90002"]["pacientes"] == 0
    # OpenAPI is read from the same local API, never from the shared backend.
    async with httpx.AsyncClient(timeout=15) as client:
        schema = await client.get(base.removesuffix("/api/v1") + "/openapi.json")
        assert schema.status_code == 200
        paths = schema.json()["paths"]
    absent = [path for path in paths if any(term in path.lower() for term in ("forgot", "reset-password", "verify-email", "consent", "learning", "mundos"))]
    assert absent == [], absent
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"audit": "2026-10-09-04", "environment": "local API8001 / PG17.6 6544 ashakids_test_compat17",
        "verified_responses": len(cases), "cases": cases, "snapshots": snapshots,
        "openapi": {"status": 200, "recovery_consent_learning_paths": absent},
        "limits": "Clinical rows untouched. Login/logout creates and revokes local auth sessions. Guards validate client configuration, not the database behind an arbitrary API."}, indent=2), encoding="utf-8")
    print(f"{len(cases)} respuestas y OpenAPI comprobados; sin escrituras clínicas.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    asyncio.run(run(parser.parse_args().output))

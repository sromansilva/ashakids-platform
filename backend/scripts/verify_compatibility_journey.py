"""Aceptación HTTP real sobre cinco fixtures locales; guarda evidencia sin cookies."""
import argparse
import asyncio
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import httpx
from scripts.phase2_sandbox import PASSWORD, run as sandbox
from tests.live_environment import isolated_live_api


async def run(output):
    base = isolated_live_api()
    cases = []
    clients = {}

    async def call(code, method, path, status, payload=None):
        response = await clients[code].request(method, path, json=payload)
        assert response.status_code == status, (code, method, path, response.status_code)
        cases.append({"identity": code, "method": method, "path": path,
                      "status": response.status_code, "expected": status})
        return response.json() if response.content else None

    try:
        for code in ("a90001", "p90001", "t90001", "p90002", "t90002"):
            clients[code] = httpx.AsyncClient(base_url=base + "/", timeout=15)
            await call(code, "POST", "auth/login", 200,
                       {"codigo_usuario": code, "password": PASSWORD})
        patient = await call("p90001", "POST", "pacientes", 201, {
            "nombres_paciente": "Paciente", "apellidos_paciente": "Compatibilidad",
            "fecha_nacimiento": "2020-01-01", "sexo": "Otro"})
        treatment = await call("a90001", "POST", "tratamientos", 201, {
            "id_paciente": patient["id_paciente"], "id_terapeuta": 1,
            "nombre_tratamiento": "Aceptación PostgreSQL 17.6"})
        start = datetime.now(timezone.utc) + timedelta(days=1)
        appointment = await call("p90001", "POST", "citas", 201, {
            "id_tratamiento": treatment["id_tratamiento"], "fecha_hora_inicio": start.isoformat(),
            "fecha_hora_fin": (start + timedelta(minutes=45)).isoformat(), "modalidad": "VIRTUAL"})
        aid = appointment["id_reserva"]
        await call("t90001", "PATCH", f"citas/{aid}/estado", 200, {"estado_reserva": "CONFIRMADA"})
        session = await call("t90001", "POST", "sesiones", 201, {"id_reserva": aid})
        sid = session["id_sesion"]
        await call("t90001", "POST", f"sesiones/{sid}/iniciar", 409)
        await sandbox("due")
        await call("t90001", "POST", f"sesiones/{sid}/iniciar", 200)
        marker = "AUDIT-2026-10-09-02"
        await call("t90001", "PUT", f"sesiones/{sid}/reporte", 200, {
            "observaciones_iniciales": marker + " - evidencia sintética de compatibilidad",
            "objetivos_trabajados": "Articulación y lectura sintéticas",
            "nivel_ayuda": "Reporte guardado en PostgreSQL 17.6",
            "proximos_pasos": "Ejemplo de seguimiento para auditoría"})
        await call("t90001", "POST", f"sesiones/{sid}/cerrar", 200, {"asistencia": "ASISTIO"})
        await call("p90001", "POST", "auth/logout", 200)
        await call("p90001", "POST", "auth/login", 200,
                   {"codigo_usuario": "p90001", "password": PASSWORD})
        for code in clients:
            own = code in {"a90001", "p90001", "t90001"}
            for path in (f"pacientes/{patient['id_paciente']}", f"citas/{aid}",
                         f"sesiones/{sid}", f"sesiones/{sid}/reporte"):
                body = await call(code, "GET", path, 200 if own else 404)
                if own and path.endswith("/reporte"):
                    assert marker in body["observaciones_iniciales"]
                if own and path == f"citas/{aid}":
                    assert body["estado_reserva"] == "COMPLETADA"
                if own and path == f"sesiones/{sid}":
                    assert body["estado_sesion"] == "FINALIZADA"
            if not own:
                for path in ("pacientes", "citas", "sesiones"):
                    assert await call(code, "GET", path, 200) == []
        await call("p90001", "PUT", f"sesiones/{sid}/reporte", 403, {})
        for code in clients:
            await call(code, "POST", "auth/logout", 200)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps({"audit": marker, "captured_utc": datetime.now(timezone.utc).isoformat(),
            "environment": "API loopback 8001 / PostgreSQL 17.6 loopback 6544 / ashakids_test_compat17",
            "verified_cases": len(cases), "cases": cases}, indent=2), encoding="utf-8")
        print(f"{len(cases)} respuestas HTTP verificadas; persistencia y acceso por recurso correctos.")
    finally:
        for client in clients.values():
            await client.aclose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    asyncio.run(run(parser.parse_args().output))

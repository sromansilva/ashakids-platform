"""Amplía fixtures locales existentes sin TRUNCATE: dos hijos con igual nombre y cita futura."""
import argparse
import asyncio
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import httpx
from scripts.phase2_sandbox import PASSWORD
from tests.live_environment import isolated_live_api


async def run(output):
    cases = []
    async with httpx.AsyncClient(base_url=isolated_live_api() + "/", timeout=15) as client:
        async def call(method, path, expected, payload=None):
            r = await client.request(method, path, json=payload)
            assert r.status_code == expected, (method, path, r.status_code)
            cases.append({"method": method, "path": path, "status": r.status_code})
            return r.json()
        await call("POST", "auth/login", 200, {"codigo_usuario": "p90001", "password": PASSWORD})
        try:
            patients = await call("GET", "pacientes", 200)
            first = next(p for p in patients if p["apellidos_paciente"] == "Compatibilidad")
            sibling = next((p for p in patients if p["apellidos_paciente"] == "Hermano"), None)
            if not sibling:
                sibling = await call("POST", "pacientes", 201, {"nombres_paciente": first["nombres_paciente"],
                    "apellidos_paciente": "Hermano", "fecha_nacimiento": "2021-01-01", "sexo": "Otro"})
            rows = await call("GET", "citas", 200)
            now = datetime.now(timezone.utc)
            future = next((a for a in rows if a["id_paciente"] == first["id_paciente"] and
                a["estado_reserva"] in {"PENDIENTE", "CONFIRMADA"} and datetime.fromisoformat(a["fecha_hora_inicio"]) > now), None)
            if not future:
                treatment = (await call("GET", f"pacientes/{first['id_paciente']}/tratamientos", 200))[0]
                start = now + timedelta(days=1)
                future = await call("POST", "citas", 201, {"id_tratamiento": treatment["id_tratamiento"],
                    "fecha_hora_inicio": start.isoformat(), "fecha_hora_fin": (start + timedelta(minutes=45)).isoformat(), "modalidad": "VIRTUAL"})
            output.parent.mkdir(parents=True, exist_ok=True)
        finally:
            await call("POST", "auth/logout", 200)
    output.write_text(json.dumps({"audit": "2026-10-09-03", "environment": "API8001 / PG17.6 local6544 ashakids_test_compat17",
        "fixture": "Synthetic sibling with same given name, no treatment/session/report; first patient retains report02 plus future appointment.",
        "patient_ids": [first["id_paciente"], sibling["id_paciente"]], "future_appointment_id": future["id_reserva"],
        "verified_responses": len(cases), "cases": cases}, indent=2), encoding="utf-8")
    print(f"Fixture local preparada; {len(cases)} respuestas verificadas. Sin reset ni datos compartidos.")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output", type=Path, required=True)
    asyncio.run(run(p.parse_args().output))

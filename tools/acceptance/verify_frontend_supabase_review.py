"""Read back explicitly authorized AUDITORIA UI records; never seeds/deletes clinical data.

Run from backend with PYTHONPATH=. and AUDIT_SYNTHETIC_PASSWORD set externally.
Only auth login/logout write session records. No credentials/tokens are exported.
"""
import asyncio
import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import httpx
from pypdf import PdfReader
from sqlalchemy import select, text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.models.auth import SesionAutenticacion, Usuario
from app.models.perfiles import Paciente
from app.models.clinica import Sesion, ReporteSesion
from app.services.auth_service import hash_session_token

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/evidence/audit-2026-10-09-12'


async def main():
    password = os.environ['AUDIT_SYNTHETIC_PASSWORD']
    base = 'http://127.0.0.1:5174/api/v1'
    cases, ids = [], {}
    engine = create_async_engine(settings.effective_database_url)
    assert 'supabase.co' in (make_url(settings.effective_database_url).host or ''), 'Expected Supabase destination'
    async def call(client, label, method, path, expected=200, **kwargs):
        response = await client.request(method, path, **kwargs)
        cases.append({'case': label, 'method': method, 'path': path, 'expected': expected, 'actual': response.status_code, 'passed': response.status_code == expected})
        assert response.status_code == expected, f'{label}: HTTP {response.status_code}'
        return response

    async with httpx.AsyncClient(base_url=base, headers={'Origin': 'http://127.0.0.1:5174'}, timeout=30) as parent, httpx.AsyncClient(base_url=base, headers={'Origin': 'http://127.0.0.1:5174'}, timeout=30) as therapist:
        for client, code, role, profile in [(parent, 'p91445', 'PADRE', '/padres/me'), (therapist, 't91446', 'TERAPEUTA', '/terapeutas/me')]:
            login = await call(client, f'{role} login', 'POST', '/auth/login', json={'codigo_usuario': code, 'password': password})
            assert login.json()['user']['rol'] == role
            ids[code] = login.json()['user']['id_usuario']
            token = client.cookies.get(settings.SESSION_COOKIE_NAME)
            async with engine.connect() as db:
                await db.execute(text('SET TRANSACTION READ ONLY'))
                active = await db.scalar(select(SesionAutenticacion.id_sesion_auth).where(SesionAutenticacion.token_hash == hash_session_token(token)))
                assert active, 'API session absent in configured Supabase database'
            await call(client, f'{role} identity', 'GET', '/auth/me')
            await call(client, f'{role} profile', 'GET', profile)
        patients = (await call(parent, 'Persisted family patient', 'GET', '/pacientes?activo=true')).json()
        assert len(patients) == 1 and patients[0]['id_paciente'] == 86 and patients[0]['sexo'] == 'Otro'
        ids['patient'] = 86
        await call(parent, 'Parent cannot read foreign patient', 'GET', '/pacientes/85', 404)
        await call(parent, 'Parent cannot administer users', 'GET', '/usuarios', 403)
        await call(therapist, 'Therapist cannot administer users', 'GET', '/usuarios', 403)
        assigned = (await call(therapist, 'Assigned patient only', 'GET', '/pacientes?activo=true')).json()
        assert [p['id_paciente'] for p in assigned] == [86]
        treatments = (await call(parent, 'Treatment persisted', 'GET', '/pacientes/86/tratamientos')).json()
        assert len(treatments) == 1 and treatments[0]['nombre_tratamiento'].startswith('AUDITORIA FRONTEND')
        ids['treatment'] = treatments[0]['id_tratamiento']
        appointments = (await call(parent, 'Family appointment persisted', 'GET', '/citas?id_paciente=86')).json()
        assert len(appointments) == 1 and appointments[0]['estado_reserva'] == 'COMPLETADA'
        appointment_id = appointments[0]['id_reserva']; ids['appointment'] = appointment_id
        await call(therapist, 'Assigned appointment', 'GET', f'/citas/{appointment_id}')
        sessions = (await call(parent, 'Session persisted', 'GET', '/sesiones?id_paciente=86')).json()
        assert len(sessions) == 1 and sessions[0]['estado_sesion'] == 'FINALIZADA' and sessions[0]['asistencia'] == 'ASISTIO'
        session_id = sessions[0]['id_sesion']; ids['session'] = session_id
        for client, role in [(parent, 'PADRE'), (therapist, 'TERAPEUTA')]:
            await call(client, f'{role} session', 'GET', f'/sesiones/{session_id}')
            report = (await call(client, f'{role} saved report', 'GET', f'/sesiones/{session_id}/reporte')).json()
            for field in ['observaciones_iniciales', 'objetivos_trabajados', 'nivel_ayuda', 'proximos_pasos']:
                assert report[field].startswith('AUDITORIA FRONTEND')
            pdf = await call(client, f'{role} PDF', 'GET', f'/sesiones/{session_id}/reporte/pdf')
            assert pdf.content.startswith(b'%PDF-')
            assert 'AUDITORIA FRONTEND' in ''.join(p.extract_text() for p in PdfReader(io.BytesIO(pdf.content)).pages)
        await call(parent, 'Parent foreign session', 'GET', '/sesiones/1', 404)
        await call(therapist, 'Therapist foreign session', 'GET', '/sesiones/1', 404)
        await call(parent, 'Parent admin profile denied', 'GET', '/admin/me', 403)
        async with engine.connect() as db:
            await db.execute(text('SET TRANSACTION READ ONLY'))
            patient = (await db.execute(select(Paciente.sexo, Paciente.nombres_paciente).where(Paciente.id_paciente == 86))).one()
            state = (await db.execute(select(Sesion.estado_sesion, Sesion.asistencia).where(Sesion.id_sesion == session_id))).one()
            saved = await db.scalar(select(ReporteSesion.observaciones_iniciales).where(ReporteSesion.id_sesion == session_id))
            assert patient[0] == 'Otro' and patient[1] == 'AUDITORIA FRONTEND'
            assert state == ('FINALIZADA', 'ASISTIO') and saved.startswith('AUDITORIA FRONTEND')
        for client, role in [(parent, 'PADRE'), (therapist, 'TERAPEUTA')]:
            await call(client, f'{role} logout', 'POST', '/auth/logout')
            await call(client, f'{role} revoked', 'GET', '/auth/me', 401)
    await engine.dispose()
    OUT.mkdir(parents=True, exist_ok=True)
    result = {'date_utc': datetime.now(timezone.utc).isoformat(), 'target': 'Vite same-origin proxy 5174 -> FastAPI 8000 -> Supabase', 'clinical_write_origin': 'Browser original forms, authorized synthetic AUDITORIA only', 'database_verification': 'READ ONLY, API session hash and patient/session/report matched', 'ids': ids, 'cases': cases, 'passed': len(cases), 'failed': 0}
    (OUT / 'live-readback.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'passed': len(cases), 'failed': 0, 'ids': ids}))


if __name__ == '__main__':
    asyncio.run(main())

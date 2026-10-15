"""Lecturas HTTP y comparación PDF en réplica local existente, sin reiniciar fixtures."""
import argparse
import asyncio
import hashlib
import json
from io import BytesIO
from pathlib import Path
import httpx
from pypdf import PdfReader
from tests.live_environment import isolated_live_api
from scripts.phase2_sandbox import PASSWORD


async def run(output):
    base = isolated_live_api()
    cases = []
    code = 'anonymous'
    output.mkdir(parents=True, exist_ok=True)
    async def record(client, method, path, status, **kwargs):
        assert method == 'GET' or path in {'auth/login', 'auth/logout'}
        response = await client.request(method, path, **kwargs)
        assert response.status_code == status, (path, response.status_code)
        cases.append({'identity':code, 'method': method, 'path': path, 'status': response.status_code})
        return response
    async with httpx.AsyncClient(base_url=base+'/', timeout=20) as client:
        await record(client, 'GET', 'sesiones/1/reporte/pdf', 401)
    sample = None
    for code in ['a90001', 'p90001', 't90001', 'p90002', 't90002']:
        async with httpx.AsyncClient(base_url=base+'/', timeout=20) as client:
            await record(client, 'POST', 'auth/login', 200, json={'codigo_usuario':code, 'password':PASSWORD})
            try:
                allowed = code in {'a90001', 'p90001', 't90001'}
                response = await record(client, 'GET', 'sesiones/1/reporte/pdf', 200 if allowed else 404)
                if allowed:
                    assert response.headers['content-type'] == 'application/pdf'
                    assert response.headers['cache-control'] == 'no-store'
                    assert response.headers['x-content-type-options'] == 'nosniff'
                    assert response.headers['content-disposition'] == 'attachment; filename="reporte-sesion-1.pdf"'
                    reader = PdfReader(BytesIO(response.content))
                    pdf_text = '\n'.join(page.extract_text() for page in reader.pages)
                    report = (await record(client, 'GET', 'sesiones/1/reporte', 200)).json()
                    session = (await record(client, 'GET', 'sesiones/1', 200)).json()
                    flat = ''.join(pdf_text.split())
                    for key in ['observaciones_iniciales','objetivos_trabajados','nivel_ayuda','proximos_pasos']:
                        assert ''.join((report[key] or 'No registrado').split()) in flat
                    for key in ['paciente_nombre','terapeuta_nombre']:
                        assert ''.join(session['cita'][key].split()) in flat
                    assert 'AUDIT-2026-10-09-02' in pdf_text
                    if code == 'p90001':
                        sample = response.content
                        (output/'reporte-sesion-sintetica.pdf').write_bytes(sample)
                        # Una segunda lectura demuestra que la descarga no elimina el reporte.
                        again = (await record(client, 'GET', 'sesiones/1/reporte', 200)).json()
                        assert again == report
                await record(client, 'GET', 'sesiones/999999/reporte/pdf', 404)
            finally:
                await record(client, 'POST', 'auth/logout', 200)
    async with httpx.AsyncClient(base_url=base+'/', timeout=20) as client:
        schema = await client.get(base.removesuffix('/api/v1')+'/openapi.json')
        assert schema.status_code == 200
        pdf_contract = schema.json()['paths']['/api/v1/sesiones/{key}/reporte/pdf']['get']['responses']['200']['content']
        assert 'application/pdf' in pdf_contract
    (output/'http-pdf.json').write_text(json.dumps({'audit':'2026-10-09-05','environment':'local API8001/PG17.6/6544 ashakids_test_compat17',
        'responses':len(cases),'cases':cases,'openapi_status':schema.status_code,
        'sample_sha256':hashlib.sha256(sample).hexdigest(),
        'limits':'Persisted clinical fixtures read only. Login/logout creates/revokes synthetic sessions. No TRUNCATE, DDL or Supabase.'}, indent=2), encoding='utf-8')
    print(f'{len(cases)} respuestas y OpenAPI aprobados; PDF coincide con reporte JSON.')


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    asyncio.run(run(parser.parse_args().output))

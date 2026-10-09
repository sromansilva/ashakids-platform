"""Verifica la fixture del recorrido UI por HTTP, únicamente en la API descartable."""
import asyncio
import json
import httpx
from scripts.phase2_sandbox import PASSWORD
from tests.live_environment import isolated_live_api


async def run():
    base = isolated_live_api()
    evidence = []
    for code in ('a90001', 'p90001', 't90001', 'p90002', 't90002'):
        async with httpx.AsyncClient(base_url=base + '/', timeout=10) as client:
            login = await client.post('auth/login', json={'codigo_usuario': code, 'password': PASSWORD})
            assert login.status_code == 200
            own = code in {'a90001', 'p90001', 't90001'}
            for resource in ('pacientes/1', 'citas/1', 'sesiones/1', 'sesiones/1/reporte'):
                result = await client.get(resource)
                expected = 200 if own else 404
                assert result.status_code == expected, (code, resource, result.status_code)
                evidence.append({'identity': code, 'method': 'GET', 'resource': resource,
                                 'status': result.status_code, 'expected': expected})
                if own and resource == 'sesiones/1/reporte':
                    assert 'AUDIT-2026-10-09-01' in result.json()['observaciones_iniciales']
                if own and resource == 'citas/1':
                    assert result.json()['estado_reserva'] == 'COMPLETADA'
                if own and resource == 'sesiones/1':
                    assert result.json()['estado_sesion'] == 'FINALIZADA'
            if not own:
                for resource in ('pacientes', 'citas', 'sesiones'):
                    result = await client.get(resource)
                    assert result.status_code == 200 and result.json() == []
                    evidence.append({'identity': code, 'method': 'GET', 'resource': resource,
                                     'status': 200, 'items': 0})
            if code == 'p90001':
                result = await client.put('sesiones/1/reporte', json={})
                assert result.status_code == 403
                evidence.append({'identity': code, 'method': 'PUT', 'resource': 'sesiones/1/reporte', 'status': 403})
            await client.post('auth/logout')
    print(json.dumps({'environment': '127.0.0.1:8001 / ashakids_test_phase2',
                      'verified_cases': len(evidence), 'cases': evidence}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    asyncio.run(run())

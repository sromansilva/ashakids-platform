"""Verifica mensajes SOLO en la réplica local existente, sin reset ni DDL."""
import argparse
import asyncio
import json
from pathlib import Path
from uuid import uuid4
import httpx
from tests.live_environment import isolated_live_api
from scripts.phase2_sandbox import PASSWORD


async def run(output):
    base = isolated_live_api()
    output.mkdir(parents=True, exist_ok=True)
    cases = []
    marker = 'AUDIT-2026-10-09-06-' + uuid4().hex[:8]
    clients = {}
    async def record(code, method, path, expected, **kwargs):
        result = await clients[code].request(method, path, **kwargs)
        assert result.status_code == expected, (code, method, path, result.status_code, result.text[:120])
        cases.append({'identity':code,'method':method,'path':path,'status':result.status_code})
        return result
    try:
        for code in ['anonymous','a90001','p90001','p90002','t90001','t90002']:
            clients[code] = httpx.AsyncClient(base_url=base+'/', timeout=30)
            if code != 'anonymous':
                await record(code,'POST','auth/login',200,json={'codigo_usuario':code,'password':PASSWORD})
        await record('anonymous','GET','conversaciones',401)
        await record('a90001','GET','conversaciones',403)
        contact = (await record('p90001','GET','conversaciones/contactos',200)).json()[0]
        professional_contacts = (await record('t90001','GET','conversaciones/contactos',200)).json()
        assert contact in professional_contacts
        for code in ['p90002','t90002']:
            assert (await record(code,'GET','conversaciones/contactos',200)).json() == []
        pair = {key:contact[key] for key in ['id_tutor','id_terapeuta']}
        # Dos aperturas concurrentes, clientes con cookies independientes.
        results = await asyncio.gather(record('p90001','POST','conversaciones',200,json=pair),
                                       record('t90001','POST','conversaciones',200,json=pair))
        conv = results[0].json(); key = conv['id_conversacion']
        assert results[1].json()['id_conversacion'] == key
        assert conv['puede_enviar'] is True
        for code in ['p90002','t90002']:
            await record(code,'POST','conversaciones',403,json=pair)
            for suffix in ['', '/mensajes']:
                await record(code,'GET',f'conversaciones/{key}{suffix}',404)
            await record(code,'POST',f'conversaciones/{key}/mensajes',404,json={'texto_mensaje':'No debe guardarse'})
        await record('a90001','GET',f'conversaciones/{key}/mensajes',403)
        await record('p90001','POST',f'conversaciones/{key}/mensajes',422,json={'texto_mensaje':'   '})
        await record('p90001','POST',f'conversaciones/{key}/mensajes',422,json={'texto_mensaje':'x'*4001})
        await record('p90001','POST',f'conversaciones/{key}/mensajes',422,json={'texto_mensaje':'hola\x00'})
        await record('p90001','POST',f'conversaciones/{key}/mensajes',422,json={'texto_mensaje':'Mensaje','id_usuario_emisor':conv['id_usuario_terapeuta']})
        await record('p90001','GET',f'conversaciones/{key}/mensajes?limit=101',422)
        await record('p90001','GET',f'conversaciones/{key}/mensajes?before_id=0',422)
        await record('p90001','GET',f'conversaciones/{key}/mensajes?before_id=2147483648',422)
        await record('p90001','GET','conversaciones/0/mensajes',422)
        await record('p90001','GET','conversaciones/2147483648/mensajes',422)
        parent_text = marker+' - Niño 🎈 <script>texto literal</script>\nSegunda línea'
        parent = (await record('p90001','POST',f'conversaciones/{key}/mensajes',201,json={'texto_mensaje':parent_text})).json()
        therapist = (await record('t90001','POST',f'conversaciones/{key}/mensajes',201,json={'texto_mensaje':marker+' - Respuesta profesional sintética'})).json()
        assert parent['id_usuario_emisor'] == conv['id_usuario_tutor']
        assert therapist['id_usuario_emisor'] == conv['id_usuario_terapeuta']
        # Escrituras limitadas al chat sintético; paginación con mensajes concurrentes.
        created = await asyncio.gather(*[record('p90001','POST',f'conversaciones/{key}/mensajes',201,
            json={'texto_mensaje':f'{marker} - Pagina sintética {i}'}) for i in range(5)])
        expected = {parent['id_mensaje'],therapist['id_mensaje']} | {r.json()['id_mensaje'] for r in created}
        ids=[]; cursor=None
        while True:
            suffix = f'?limit=2'+(f'&before_id={cursor}' if cursor is not None else '')
            data=(await record('t90001','GET',f'conversaciones/{key}/mensajes{suffix}',200)).json()
            ids.extend(row['id_mensaje'] for row in data['items'])
            if data['next_before_id'] is None:
                break
            assert cursor is None or data['next_before_id'] < cursor
            cursor=data['next_before_id']
            assert len(ids)<2000, 'Unexpected fixture volume; stop before expanding test scope.'
        assert len(ids)==len(set(ids)) and expected.issubset(ids)
        first = (await record('p90001','GET',f'conversaciones/{key}/mensajes',200)).json()
        saved = {row['id_mensaje']:row for row in first['items']}
        assert saved[parent['id_mensaje']]['texto_mensaje']==parent_text
        await record('p90001','POST','auth/logout',200)
        await record('p90001','POST','auth/login',200,json={'codigo_usuario':'p90001','password':PASSWORD})
        again = (await record('p90001','GET',f'conversaciones/{key}/mensajes',200)).json()
        assert again==first
        own_list=(await record('p90001','GET','conversaciones?limit=1',200)).json()
        assert key in [item['id_conversacion'] for item in own_list['items']]
        for code in ['p90002','t90002']:
            assert (await record(code,'GET','conversaciones',200)).json()['items']==[]
        await record('p90001','GET','conversaciones/999999/mensajes',404)
        schema=await clients['anonymous'].get(base.removesuffix('/api/v1')+'/openapi.json')
        assert schema.status_code==200 and '/api/v1/conversaciones/{key}/mensajes' in schema.json()['paths']
        summary={'audit':'AUDIT-2026-10-09-06','marker':marker,'environment':'API8001/web5174/PG17.6 local6544 ashakids_test_compat17',
            'conversation_id':key,'messages_created':len(expected),'pagination_rows_seen':len(ids),
            'no_duplicate_page_ids':True,'read_after_relogin_equal':True,'same_conversation_for_concurrent_open':True,
            'responses':len(cases),'cases':cases,'openapi_status':schema.status_code,
            'limits':'Synthetic messaging writes and authentication sessions only. No users/patients/treatments reset, DDL, Supabase, attachments or actual communications. Five auxiliary final logout calls are not included in the verified response count.'}
        # Guardar solo metadatos/códigos sintéticos, no cookies ni credenciales.
        (output/'http-messaging.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
        print(f"{len(cases)} respuestas + OpenAPI; {len(expected)} mensajes sintéticos persistentes, paginación y acceso ajeno verificados.")
    finally:
        for code,client in clients.items():
            if code != 'anonymous':
                await client.post('auth/logout')
            await client.aclose()


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    asyncio.run(run(parser.parse_args().output))

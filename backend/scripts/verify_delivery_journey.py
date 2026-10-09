"""Aceptación núcleo/PDF/chat SOLO en una BD nueva local ashakids_test_accept07*."""
import argparse
import asyncio
import hashlib
import json
import os
from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
from time import perf_counter
import httpx
from pypdf import PdfReader
from sqlalchemy import select, text, update
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.clinica import Reserva, Tratamiento
from app.models.mensajeria import Conversacion
from app.models.auth import SesionAutenticacion
from app.services.auth_service import hash_session_token
from scripts.phase2_sandbox import PASSWORD
from tests.live_environment import isolated_live_api


async def confirm_api_database(engine, cookies):
    """La sesión recién emitida debe existir en esta BD antes de escribir clínica."""
    tokens = list(cookies.values())
    if len(tokens) != 1:
        raise RuntimeError('No se recibió una única sesión verificable; se bloquea escritura clínica.')
    async with engine.connect() as db:
        found = await db.scalar(select(SesionAutenticacion.id_sesion_auth).where(
            SesionAutenticacion.token_hash==hash_session_token(tokens[0]),
            SesionAutenticacion.revocado.is_(False),
            SesionAutenticacion.fecha_expiracion > datetime.now(timezone.utc)))
    if found is None:
        raise RuntimeError('La API no emitió la sesión en esta BD; se bloquea escritura clínica.')


async def run(output, audit='AUDIT-2026-10-09-08', environment='Clon dev / API loopback8001 / PG18.4 local5433'):
    base = isolated_live_api()
    url = make_url(os.environ['ASHAKIDS_TEST_DATABASE_URL'])
    if not ((url.database or '').startswith('ashakids_test_accept07') or (url.database or '').startswith('ashakids_test_accept08')) or url.query:
        raise RuntimeError('Este guion exige una nueva BD local ashakids_test_accept07* o accept08*; no usar la demo.')
    engine = create_async_engine(url)
    output.mkdir(parents=True, exist_ok=True)
    cases, clients = [], {}
    result = {'audit':audit, 'database':url.database,
              'environment':environment, 'success':False}
    async def call(code, method, path, expected, **kwargs):
        started = perf_counter()
        response = await clients[code].request(method, path, **kwargs)
        observed = response.status_code
        cases.append({'identity':code,'method':method,'path':path,'expected':expected,
                      'status':observed,'elapsed_ms':round((perf_counter()-started)*1000,2)})
        assert observed == expected, (code,method,path,observed,expected)
        return response
    async def body(code, method, path, expected, payload=None):
        response = await call(code,method,path,expected,**({'json':payload} if payload is not None else {}))
        return response.json() if response.content else None
    try:
        async with engine.connect() as db:
            for table in ('pacientes','reservas','sesiones','reportes_sesion','conversaciones','mensajes'):
                assert await db.scalar(text(f'SELECT count(*) FROM {table}')) == 0, 'Requiere fixture clínica vacía.'
            assert await db.scalar(text('SELECT count(*) FROM usuarios')) == 5, 'Preparar cinco cuentas sintéticas.'
            provenance = (await db.execute(text('SELECT current_database() AS database, current_user AS role, '
                'rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname=current_user'))).mappings().one()
            result['sql_runtime'] = dict(provenance)
            assert not provenance['rolsuper'] and not provenance['rolcreatedb'] and not provenance['rolcreaterole']
        for code in ('anonymous','a90001','p90001','p90002','t90001','t90002','p90003'):
            clients[code] = httpx.AsyncClient(base_url=base+'/',timeout=25)
            if code not in {'anonymous','p90003'}:
                await body(code,'POST','auth/login',200,{'codigo_usuario':code,'password':PASSWORD})
        await confirm_api_database(engine, clients['a90001'].cookies)
        result['server_database_session_verified_before_clinical_writes'] = True
        host = base.removesuffix('/api/v1')
        await call('anonymous','GET',host+'/health',200)
        await call('anonymous','GET',host+'/health/ready',200)
        await body('anonymous','GET','pacientes',401)
        await body('anonymous','POST','auth/login',401,{'codigo_usuario':'p90001','password':'Incorrecta-Sintetica!'})
        users = await body('a90001','GET','usuarios?limit=100',200)
        professional = next(row for row in users if row['codigo_usuario']=='t90001')
        await body('p90001','GET','usuarios',403)
        account = await body('a90001','POST','usuarios',201,{'nombres':'Cuenta','apellidos':'Sintética',
            'email':'p90003@example.com','codigo_usuario':'p90003','password':PASSWORD,'rol':'PADRE'})
        await body('p90003','POST','auth/login',200,{'codigo_usuario':'p90003','password':PASSWORD})
        await body('a90001','PATCH',f"usuarios/{account['id_usuario']}",200,{'activo':False})
        await body('p90003','GET','auth/me',401)
        await body('p90003','POST','auth/login',401,{'codigo_usuario':'p90003','password':PASSWORD})
        await body('a90001','PATCH',f"usuarios/{account['id_usuario']}",200,{'activo':True})
        await body('p90003','POST','auth/login',200,{'codigo_usuario':'p90003','password':PASSWORD})
        patient = await body('p90001','POST','pacientes',201,{'nombres_paciente':'Paciente','apellidos_paciente':'Aceptación07',
            'fecha_nacimiento':'2020-01-01','sexo':'Otro'})
        pid = patient['id_paciente']
        treatment = await body('a90001','POST','tratamientos',201,{'id_paciente':pid,
            'id_terapeuta':professional['id_terapeuta'],'nombre_tratamiento':'Recorrido sintético07'})
        tid = treatment['id_tratamiento']
        await body('p90001','POST','tratamientos',403,{'id_paciente':pid,
            'id_terapeuta':professional['id_terapeuta'],'nombre_tratamiento':'No permitido'})
        start = datetime.now(timezone.utc)+timedelta(days=1)
        slot = {'id_tratamiento':tid,'fecha_hora_inicio':start.isoformat(),
                'fecha_hora_fin':(start+timedelta(minutes=45)).isoformat(),'modalidad':'VIRTUAL'}
        appointment = await body('p90001','POST','citas',201,slot)
        aid = appointment['id_reserva']
        await body('p90001','POST','citas',409,slot)
        await body('p90001','PATCH',f'citas/{aid}/estado',403,{'estado_reserva':'CONFIRMADA'})
        await body('t90001','PATCH',f'citas/{aid}/estado',200,{'estado_reserva':'CONFIRMADA'})
        session = await body('t90001','POST','sesiones',201,{'id_reserva':aid})
        sid = session['id_sesion']
        await body('t90001','POST','sesiones',409,{'id_reserva':aid})
        await body('t90001','POST',f'sesiones/{sid}/iniciar',409)
        # Fixture temporal exclusiva: una cita recién creada en la BD nueva, no reloj del sistema.
        now = datetime.now(timezone.utc)
        async with engine.begin() as db:
            changed = await db.execute(update(Reserva).where(Reserva.id_reserva==aid).values(
                fecha_hora_inicio=now-timedelta(minutes=5),fecha_hora_fin=now+timedelta(minutes=40)))
            assert changed.rowcount == 1
        await body('t90001','POST',f'sesiones/{sid}/iniciar',200)
        report = {'observaciones_iniciales':f'{audit}: niño, articulación y R. <texto literal>',
            'objetivos_trabajados':'Ejemplo sintético, sin evaluación clínica real.',
            'nivel_ayuda':'Dato de aceptación en PostgreSQL local.',
            'proximos_pasos':'Consultar reporte y conversar con profesional.'}
        saved = await body('t90001','PUT',f'sesiones/{sid}/reporte',200,report)
        await body('p90001','PUT',f'sesiones/{sid}/reporte',403,report)
        await body('t90001','POST',f'sesiones/{sid}/cerrar',200,{'asistencia':'ASISTIO'})
        for code in ('a90001','p90001','t90001','p90002','t90002'):
            own = code in {'a90001','p90001','t90001'}
            for path in (f'pacientes/{pid}',f'citas/{aid}',f'sesiones/{sid}',f'sesiones/{sid}/reporte'):
                data = await body(code,'GET',path,200 if own else 404)
                if own and path==f'citas/{aid}': assert data['estado_reserva']=='COMPLETADA'
                if own and path==f'sesiones/{sid}': assert data['estado_sesion']=='FINALIZADA'
                if own and path.endswith('/reporte'): assert data==saved
            pdf = await call(code,'GET',f'sesiones/{sid}/reporte/pdf',200 if own else 404)
            if own:
                assert pdf.headers['content-type']=='application/pdf' and pdf.headers['cache-control']=='no-store'
                assert pdf.headers['x-content-type-options']=='nosniff' and pdf.content.startswith(b'%PDF-')
                text_pdf = '\n'.join(page.extract_text() or '' for page in PdfReader(BytesIO(pdf.content)).pages)
                flat = ''.join(text_pdf.split())
                assert all(''.join(value.split()) in flat for value in report.values())
                assert 'PacienteAceptación07' in flat and audit in text_pdf
                if code=='p90001':
                    (output/'reporte-sesion-sintetica.pdf').write_bytes(pdf.content)
                    result['sample_pdf_sha256']=hashlib.sha256(pdf.content).hexdigest()
        contacts = await body('p90001','GET','conversaciones/contactos',200)
        assert len(contacts)==1
        pair = {key:contacts[0][key] for key in ('id_tutor','id_terapeuta')}
        convs = await asyncio.gather(body('p90001','POST','conversaciones',200,pair),body('t90001','POST','conversaciones',200,pair))
        cid = convs[0]['id_conversacion']; assert cid==convs[1]['id_conversacion']
        for code in ('p90002','t90002'):
            assert await body(code,'GET','conversaciones/contactos',200)==[]
            await body(code,'GET',f'conversaciones/{cid}/mensajes',404)
            await body(code,'POST',f'conversaciones/{cid}/mensajes',404,{'texto_mensaje':'Ajeno'})
        await body('a90001','GET',f'conversaciones/{cid}/mensajes',403)
        await call('p90001','POST',f'conversaciones/{cid}/mensajes',403,
            json={'texto_mensaje':'Origen ajeno'},headers={'Origin':'https://untrusted.example.invalid'})
        await body('p90001','POST',f'conversaciones/{cid}/mensajes',422,{'texto_mensaje':'   '})
        await body('p90001','POST',f'conversaciones/{cid}/mensajes',422,{'texto_mensaje':'Texto','id_usuario_emisor':999})
        for code,message in [('p90001','Consulta sintética sobre reporte07. 🎈'),('t90001','Respuesta sintética07, sin indicación clínica.')]:
            row = await body(code,'POST',f'conversaciones/{cid}/mensajes',201,{'texto_mensaje':message})
            assert row['texto_mensaje']==message and row['id_conversacion']==cid
        history = await body('p90001','GET',f'conversaciones/{cid}/mensajes',200)
        assert len(history['items'])==2
        first = await body('p90001','GET',f'conversaciones/{cid}/mensajes?limit=1',200)
        older = await body('p90001','GET',f"conversaciones/{cid}/mensajes?limit=1&before_id={first['next_before_id']}",200)
        assert first['items'][0]['id_mensaje']!=older['items'][0]['id_mensaje'] and older['next_before_id'] is None
        await body('p90001','POST','auth/logout',200)
        await body('p90001','GET',f'conversaciones/{cid}/mensajes',401)
        await body('p90001','POST','auth/login',200,{'codigo_usuario':'p90001','password':PASSWORD})
        assert await body('p90001','GET',f'conversaciones/{cid}/mensajes',200)==history
        assert await body('p90001','GET',f'sesiones/{sid}/reporte',200)==saved
        # Mutaciones de estado SOLO sobre el tratamiento/chat recién creado en esta fixture.
        async with engine.begin() as db:
            await db.execute(update(Tratamiento).where(Tratamiento.id_tratamiento==tid).values(estado_tratamiento='FINALIZADO'))
        readonly = await body('p90001','GET',f'conversaciones/{cid}',200)
        assert readonly['puede_enviar'] is False
        assert await body('p90001','GET',f'conversaciones/{cid}/mensajes',200)==history
        await body('p90001','POST',f'conversaciones/{cid}/mensajes',403,{'texto_mensaje':'Tratamiento finalizado'})
        async with engine.begin() as db:
            await db.execute(update(Tratamiento).where(Tratamiento.id_tratamiento==tid).values(estado_tratamiento='ACTIVO'))
            await db.execute(update(Conversacion).where(Conversacion.id_conversacion==cid).values(estado='ARCHIVADA',fecha_archivado=datetime.now(timezone.utc)))
        await body('t90001','POST',f'conversaciones/{cid}/mensajes',409,{'texto_mensaje':'Chat archivado'})
        assert await body('t90001','GET',f'conversaciones/{cid}/mensajes',200)==history
        await call('anonymous','GET',host+'/openapi.json',200)
        for code in clients:
            if code!='anonymous': await body(code,'POST','auth/logout',200)
        result.update(success=True,ids={'patient':pid,'treatment':tid,'appointment':aid,'session':sid,'conversation':cid},
            checks={'report_json_matches_pdf':True,'history_equal_after_relogin':True,'active_assignment_required_real_sql':True,
                    'archived_chat_rejects_real_sql':True,'foreign_resources_denied':True,'same_pair_concurrent_open':True})
    finally:
        result.update(captured_utc=datetime.now(timezone.utc).isoformat(),verified_responses=len(cases),cases=cases,
            limits='Synthetic isolated fixture: new clinical records and 2 messages; time/state SQL adjustments only on its new IDs. No shared Supabase, reset of demo, production, browser UI or independent human reproduction.')
        (output/'http-delivery-journey.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
        for client in clients.values(): await client.aclose()
        await engine.dispose()
    print(f'{len(cases)} respuestas verificadas; núcleo, PDF, mensajes y permisos persistentes.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--audit',type=str,default='AUDIT-2026-10-09-08')
    parser.add_argument('--environment',type=str,default='Clon dev / API loopback8001 / PG18.4 local5433')
    args = parser.parse_args()
    asyncio.run(run(args.output, audit=args.audit, environment=args.environment))

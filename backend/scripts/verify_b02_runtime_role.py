"""Verifica privilegios reales B02 sin DML clínico ni operaciones destructivas.

EXPLAIN sin ANALYZE comprueba denegaciones DML sin ejecutar esas operaciones.
CREATE SCHEMA usa un nombre AUDITORIA nuevo y savepoint siempre revertido.
TRUNCATE/setval/DDL sobre tablas compartidas nunca se ejecutan.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.core.database_transport import engine_options
from scripts.b02_role_inventory import ROLE, PERMISSIONS, SEQUENCES, identifier, rows

async def verify(private, output):
    credentials=json.loads(private.read_text(encoding='utf-8'))
    if credentials['role']!=ROLE: raise ValueError('Wrong role')
    url,options=engine_options(credentials['runtime_url'],settings)
    engine=create_async_engine(url,**options)
    result={'captured_utc':datetime.now(timezone.utc).isoformat(),'role':ROLE,'success':False}
    try:
        async with engine.connect() as db:
            if await db.scalar(text('SELECT current_user'))!=ROLE: raise ValueError('Role mismatch')
            result['role_attributes']=(await rows(db,"SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,rolinherit,rolcanlogin FROM pg_roles WHERE rolname=current_user"))[0]
            assert result['role_attributes']==dict.fromkeys(('rolsuper','rolcreatedb','rolcreaterole','rolreplication','rolbypassrls','rolinherit'),False)|{'rolcanlogin':True}
            result['memberships_as_member']=await rows(db,"SELECT pg_get_userbyid(roleid) AS role FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=current_user)")
            assert not result['memberships_as_member']
            result['owned_relations']=await db.scalar(text("SELECT count(*) FROM pg_class WHERE relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user)"))
            assert result['owned_relations']==0
            raw=await db.get_raw_connection()
            ssl=raw.driver_connection._transport.get_extra_info('ssl_object')
            context=options['connect_args']['ssl']
            result['tls']={'version':ssl.version(),'verify_mode':context.verify_mode.name,'check_hostname':context.check_hostname}
            result['database_privileges']=(await rows(db,"SELECT has_database_privilege(current_database(),'CONNECT') AS connect,has_database_privilege(current_database(),'CREATE') AS create,has_database_privilege(current_database(),'TEMP') AS temporary"))[0]
            assert result['database_privileges']['connect'] and not result['database_privileges']['create']
            result['public_schema']=(await rows(db,"SELECT has_schema_privilege('public','USAGE') AS usage,has_schema_privilege('public','CREATE') AS create"))[0]
            assert result['public_schema']=={'usage':True,'create':False}
            result['tables']=[]
            tables=await rows(db,"SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname")
            for table in tables:
                allowed=set(PERMISSIONS.get(table['relname'],'').split())
                actual={op:await db.scalar(text('SELECT has_table_privilege(:name,:op)'),
                       {'name':'public.'+table['relname'],'op':op})
                        for op in ('SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN')}
                assert {op for op,value in actual.items() if value}==allowed
                assert table['relrowsecurity']
                result['tables'].append(dict(table,privileges=actual))
                if 'SELECT' in allowed:
                    await db.exec_driver_sql(f"SELECT * FROM public.{identifier(table['relname'])} LIMIT 0")
            result['sequences']=[]
            for seq in await rows(db,SEQUENCES):
                usage=await db.scalar(text("SELECT has_sequence_privilege(:name,'USAGE')"),{'name':seq['sequence_name']})
                update=await db.scalar(text("SELECT has_sequence_privilege(:name,'UPDATE')"),{'name':seq['sequence_name']})
                select=await db.scalar(text("SELECT has_sequence_privilege(:name,'SELECT')"),{'name':seq['sequence_name']})
                assert usage==('INSERT' in PERMISSIONS.get(seq['table_name'],'').split())
                assert not update and not select
                result['sequences'].append(dict(seq,usage=usage,update=update,select=select))
            result['policies']=await rows(db,"SELECT tablename,policyname,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname='public' ORDER BY tablename,cmd")
            assert len(result['policies'])==sum(len(p.split()) for p in PERMISSIONS.values())
            for policy in result['policies']:
                assert policy['roles']==[ROLE] and policy['cmd'] in PERMISSIONS[policy['tablename']].split()
                if policy['cmd']!='INSERT': assert policy['qual']=='true'
                if policy['cmd'] in ('INSERT','UPDATE'): assert policy['with_check']=='true'
            result['callable_security_definer']=await rows(db,"SELECT n.nspname,p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.prosecdef AND n.nspname NOT LIKE 'pg_%' AND has_schema_privilege(n.oid,'USAGE') AND has_function_privilege(p.oid,'EXECUTE')")
            assert not result['callable_security_definer']
            await db.rollback()
            result['denial_probes']=[]
            for label,sql in (
                ('unapproved_table_select','SELECT * FROM public.mensaje_adjuntos LIMIT 0'),
                ('messages_update','EXPLAIN (FORMAT JSON) UPDATE public.mensajes SET id_mensaje=id_mensaje WHERE false'),
                ('messages_delete','EXPLAIN (FORMAT JSON) DELETE FROM public.mensajes WHERE false'),
                ('roles_insert','EXPLAIN (FORMAT JSON) INSERT INTO public.roles DEFAULT VALUES'),
                ('unapproved_sequence_usage',"SELECT currval('public.logros_id_logro_seq')"),
                ('create_schema','CREATE SCHEMA AUDITORIA_B02_DENIED')):
                transaction=await db.begin_nested()
                sqlstate=None
                try:
                    await db.exec_driver_sql(sql)
                except Exception as exc:
                    sqlstate=getattr(getattr(exc,'orig',exc),'sqlstate',None)
                finally:
                    await transaction.rollback()
                result['denial_probes'].append({'case':label,'expected':'42501','obtained':sqlstate})
                assert sqlstate=='42501'
            await db.rollback()
        result['success']=True
    except Exception as exc:
        result.update({'error_type':type(exc).__name__,'sqlstate':getattr(getattr(exc,'orig',exc),'sqlstate',None)})
    finally:
        await engine.dispose()
        output.parent.mkdir(parents=True,exist_ok=True)
        output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'success':result['success'],'tables':len(result.get('tables',[])),
        'policies':len(result.get('policies',[])),'denial_probes':result.get('denial_probes'),
        'error_type':result.get('error_type'),'sqlstate':result.get('sqlstate')}))
    return result['success']

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--private',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    raise SystemExit(0 if asyncio.run(verify(args.private,args.output)) else 1)

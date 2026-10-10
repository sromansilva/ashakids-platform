"""Corte17: ACL/TLS/catálogos en READ ONLY, sin probes DDL o DML.
Credenciales requeridas solo desde archivos privados ignorados.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import Settings
secret=json.loads(Path("tmp/render-runtime-private.json").read_text())
settings=Settings(_env_file=None,DATABASE_URL=secret["database_url"],ENVIRONMENT="production",CORS_ORIGINS=["https://ashakids.onrender.com"],DB_SSL_CA_FILE=secret["ca_file"],DB_SSL_LEGACY_CA=secret["legacy_ca"])
from app.core.database_transport import engine_options
from scripts.b02_role_inventory import ROLE, PERMISSIONS, SEQUENCES, identifier, rows

async def verify(private, output):
    credentials=json.loads(private.read_text(encoding='utf-8'))
    if credentials['role']!=ROLE: raise ValueError('Wrong role')
    url,options=engine_options(secret['database_url'],settings)
    engine=create_async_engine(url,**options)
    result={'captured_utc':datetime.now(timezone.utc).isoformat(),'role':ROLE,'success':False}
    try:
        async with engine.connect() as db:
            await db.execute(text('SET TRANSACTION READ ONLY'))
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
            result['schema_counts']={}
            for label,sql in {
              'public_tables':"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
              'visible_columns':"SELECT count(*) FROM information_schema.columns WHERE table_schema='public'",
              'foreign_keys':"SELECT count(*) FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace",
              'primary_keys':"SELECT count(*) FROM pg_constraint WHERE contype='p' AND connamespace='public'::regnamespace"
            }.items(): result['schema_counts'][label]=await db.scalar(text(sql))
            result['mode']='READ ONLY; no denial DDL/DML probes reexecuted'
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

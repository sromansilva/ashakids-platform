"""Aplicación B02 explícitamente autorizada. No DML ni permisos de roles existentes.

Guarda URLs y contraseña solo en tmp ignorado. Aborta si el rol ya existe.
No publica/verbaliza contraseñas, verificadores SCRAM, URL ni excepciones SQL.
"""
import argparse
import asyncio
import base64
from datetime import datetime, timezone
import hashlib
import hmac
import json
from pathlib import Path
import secrets

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import BACKEND_DIR, settings
from app.core.database_transport import engine_options
from scripts.b02_role_inventory import ROLE, PERMISSIONS, SEQUENCES, identifier, rows, preservation_snapshot

def scram_verifier(password):
    salt=secrets.token_bytes(16)
    iterations=32768
    salted=hashlib.pbkdf2_hmac('sha256',password.encode(),salt,iterations)
    client=hmac.digest(salted,b'Client Key','sha256')
    stored=hashlib.sha256(client).digest()
    server=hmac.digest(salted,b'Server Key','sha256')
    b64=lambda value: base64.b64encode(value).decode('ascii')
    return f'SCRAM-SHA-256${iterations}:{b64(salt)}${b64(stored)}:{b64(server)}'

async def apply(output, private):
    result={'captured_utc':datetime.now(timezone.utc).isoformat(), 'role':ROLE,
            'scope':'New role/explicit grants/role-only RLS; no clinical DML or old role changes',
            'success':False}
    original,options=engine_options(settings.effective_database_url,settings)
    engine=create_async_engine(original,**options)
    try:
        async with engine.begin() as db:
            await db.execute(text("SET LOCAL lock_timeout='5s'"))
            await db.execute(text("SET LOCAL statement_timeout='15s'"))
            if await db.scalar(text('SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=:name)'),{'name':ROLE}):
                raise ValueError('Existing role; never overwrite or adopt silently')
            tables=await rows(db,"SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'")
            names={t['relname'] for t in tables}
            if not set(PERMISSIONS)<=names or not all(t['relrowsecurity'] for t in tables):
                raise ValueError('Inventory/RLS mismatch')
            before=await preservation_snapshot(db)
            sequence_rows=await rows(db,SEQUENCES)
            password=secrets.token_urlsafe(48)
            user=ROLE
            if 'pooler.supabase.com' in original.host:
                if '.' not in original.username: raise ValueError('Missing pooler project suffix')
                user+='.'+original.username.split('.',1)[1]
            runtime=original.set(username=user,password=password)
            private.parent.mkdir(parents=True,exist_ok=True)
            private.write_text(json.dumps({'role':ROLE,'password':password,
                'previous_url':original.render_as_string(hide_password=False),
                'runtime_url':runtime.render_as_string(hide_password=False)},indent=2),encoding='utf-8')
            verifier=scram_verifier(password)
            # El SQL contiene solo un verificador SCRAM, nunca contraseña clara.
            await db.exec_driver_sql(f"CREATE ROLE {identifier(ROLE)} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT PASSWORD '{verifier}'")
            database_name=await db.scalar(text('SELECT current_database()'))
            await db.exec_driver_sql(f'GRANT CONNECT ON DATABASE {identifier(database_name)} TO {identifier(ROLE)}')
            await db.exec_driver_sql(f'GRANT USAGE ON SCHEMA public TO {identifier(ROLE)}')
            policies=[]
            for table, permissions in PERMISSIONS.items():
                target='public.'+identifier(table)
                await db.exec_driver_sql(f'GRANT {", ".join(permissions.split())} ON TABLE {target} TO {identifier(ROLE)}')
                for operation in permissions.split():
                    name=f'ashakids_runtime_{table}_{operation.lower()}'
                    clause=('WITH CHECK (true)' if operation=='INSERT' else
                            'USING (true) WITH CHECK (true)' if operation=='UPDATE' else 'USING (true)')
                    await db.exec_driver_sql(f'CREATE POLICY {identifier(name)} ON {target} FOR {operation} TO {identifier(ROLE)} {clause}')
                    policies.append({'table':table,'operation':operation,'name':name})
            sequences=[]
            for seq in sequence_rows:
                if 'INSERT' in PERMISSIONS.get(seq['table_name'],'').split():
                    schema,name=seq['sequence_name'].split('.',1)
                    await db.exec_driver_sql(f'GRANT USAGE ON SEQUENCE {identifier(schema)}.{identifier(name)} TO {identifier(ROLE)}')
                    sequences.append(seq)
            after=await preservation_snapshot(db)
            if before!=after: raise ValueError('Existing roles, memberships, owners, RLS or ACL changed')
            result.update({'tables':PERMISSIONS,'policies':policies,'sequences':sequences,
                'preservation_before':before,'preservation_after':after,
                'existing_roles_and_permissions_preserved':True})
        result['success']=True
        result['committed']=True
    except Exception as exc:
        result.update({'error_type':type(exc).__name__,
            'sqlstate':getattr(getattr(exc,'orig',exc),'sqlstate',None),'committed':False})
    finally:
        await engine.dispose()
        output.parent.mkdir(parents=True,exist_ok=True)
        output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'success':result['success'],'policies':len(result.get('policies',[])),
                      'sequences':len(result.get('sequences',[])),'error_type':result.get('error_type'),
                      'sqlstate':result.get('sqlstate')}))
    return result['success']

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--execute-authorized',action='store_true',required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--private',type=Path,default=BACKEND_DIR.parent/'tmp/b02-runtime-private.json')
    args=parser.parse_args()
    raise SystemExit(0 if asyncio.run(apply(args.output,args.private)) else 1)

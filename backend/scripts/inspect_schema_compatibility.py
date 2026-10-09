"""Inspección de metadatos PostgreSQL en READ ONLY; no exporta filas ni credenciales.

Uso: python -m scripts.inspect_schema_compatibility --target shared|local --output archivo.json
shared usa configuración habitual; local exige ASHAKIDS_TEST_DATABASE_URL loopback/ashakids_test_*.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import json
import os
from pathlib import Path

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, Numeric, String, Text, text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.core.database import Base
from app.models import auth, auditoria, clinica, mensajeria, perfiles  # Registrar modelos; sin consultas.

COLUMNS = """SELECT table_name,column_name,data_type,udt_name,is_nullable,
 character_maximum_length,numeric_precision,numeric_scale,column_default,is_identity
 FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position"""
TABLES = """SELECT c.relname AS table_name,c.relrowsecurity AS rls,c.relforcerowsecurity AS force_rls
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname"""
CONSTRAINTS = """SELECT conname,contype,conrelid::regclass::text AS table_name,
 pg_get_constraintdef(oid) AS definition FROM pg_constraint
 WHERE connamespace='public'::regnamespace ORDER BY conname"""
INDEXES = """SELECT tablename,indexname,indexdef FROM pg_indexes
 WHERE schemaname='public' ORDER BY tablename,indexname"""


def inspect_url(target):
    url = settings.effective_database_url if target == 'shared' else os.getenv('ASHAKIDS_TEST_DATABASE_URL', '')
    parsed = make_url(url)
    if target == 'local' and (parsed.host not in {'localhost', '127.0.0.1'} or
                              not (parsed.database or '').startswith('ashakids_test_')):
        raise ValueError('El destino local exige loopback y ashakids_test_*.')
    return url


def model_differences(columns):
    actual = {(c['table_name'], c['column_name']): c for c in columns}
    differences = []
    for table in Base.metadata.sorted_tables:
        for column in table.columns:
            key = f'{table.name}.{column.name}'
            found = actual.get((table.name, column.name))
            if not found:
                differences.append({'column': key, 'kind': 'missing'}); continue
            expected = None
            for kind, pg_type in [(Text, 'text'), (String, 'character varying'), (Boolean, 'boolean'),
                                  (DateTime, 'timestamp with time zone'), (Date, 'date'),
                                  (Integer, 'integer'), (Numeric, 'numeric'), (Float, 'double precision')]:
                if isinstance(column.type, kind):
                    expected = pg_type; break
            if expected and expected != found['data_type']:
                differences.append({'column': key, 'kind': 'type', 'model': expected, 'database': found['data_type']})
            if column.nullable != (found['is_nullable'] == 'YES'):
                differences.append({'column': key, 'kind': 'nullable', 'model': column.nullable,
                                    'database': found['is_nullable'] == 'YES'})
            length = getattr(column.type, 'length', None)
            if length is not None and length != found['character_maximum_length']:
                differences.append({'column': key, 'kind': 'length', 'model': length,
                                    'database': found['character_maximum_length']})
            if isinstance(column.type, Numeric) and not isinstance(column.type, Float):
                for field in ('precision', 'scale'):
                    value = getattr(column.type, field)
                    if value is not None and value != found['numeric_' + field]:
                        differences.append({'column': key, 'kind': field, 'model': value,
                                            'database': found['numeric_' + field]})
    return differences


async def inspect(target):
    engine = create_async_engine(inspect_url(target), echo=False, connect_args={'timeout': 15})
    try:
        async with engine.connect() as db:
            async with db.begin():
                await db.execute(text('SET TRANSACTION READ ONLY'))
                await db.execute(text("SET LOCAL statement_timeout='15000ms'"))
                result = {'target': target, 'captured_utc': datetime.now(timezone.utc).isoformat(),
                          'server_version': await db.scalar(text('SHOW server_version')),
                          'transaction_read_only': await db.scalar(text('SHOW transaction_read_only'))}
                for key, sql in [('tables', TABLES), ('columns', COLUMNS), ('constraints', CONSTRAINTS), ('indexes', INDEXES)]:
                    result[key] = [dict(r) for r in (await db.execute(text(sql))).mappings().all()]
                result['policies'] = [dict(r) for r in (await db.execute(text(
                    "SELECT tablename,policyname,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname"))).mappings().all()]
                result['runtime_role_flags'] = dict((await db.execute(text(
                    'SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user'))).mappings().one())
                result['connection_ssl'] = await db.scalar(text('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()'))
                result['model_tables'] = len(Base.metadata.tables)
                result['model_differences'] = model_differences(result['columns'])
                result['limits'] = 'Metadata only; does not certify row-level authorization, data values, defaults semantics or every API.'
                return result
    finally:
        await engine.dispose()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', choices=['shared', 'local'], required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        result = asyncio.run(inspect(args.target))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2,
                              default=lambda v: v.decode() if isinstance(v, bytes) else str(v))+'\n', encoding='utf-8')
        print(json.dumps({'target': args.target, 'version': result['server_version'],
                          'readonly': result['transaction_read_only'], 'tables': len(result['tables']),
                          'model_differences': len(result['model_differences'])}))
    except Exception as exc:
        print(json.dumps({'inspection': 'failed', 'error_type': type(exc).__name__}))
        raise SystemExit(1) from None

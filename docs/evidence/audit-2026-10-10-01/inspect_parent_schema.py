"""Metadata only, READ ONLY. No login, patient rows, credentials or DDL."""
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'backend'))
from sqlalchemy import text
from app.core import database
from app.main import app


async def inspect():
    result = {'captured_utc': datetime.now(timezone.utc).isoformat(),
              'scope': 'public schema metadata only; no data rows; no authentication'}
    try:
        async with database.async_engine.connect() as db:
            async with db.begin():
                await db.execute(text('SET TRANSACTION READ ONLY'))
                await db.execute(text("SET LOCAL statement_timeout='15000ms'"))
                result['read_only'] = await db.scalar(text('SHOW transaction_read_only'))
                result['version'] = await db.scalar(text('SHOW server_version'))
                queries = {
                    'catalog_tables': "SELECT c.relname AS table_name,has_table_privilege(c.oid,'SELECT') AS can_select FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname",
                    'tables': "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
                    'columns': "SELECT table_name,column_name,data_type,is_nullable FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position",
                    'foreign_keys': "SELECT c.relname AS table_name, k.conname, pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND k.contype='f' ORDER BY c.relname,k.conname",
                    'triggers': "SELECT c.relname AS table_name,t.tgname,pg_get_triggerdef(t.oid) AS definition FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal ORDER BY c.relname,t.tgname",
                }
                for key, sql in queries.items():
                    result[key] = [dict(row) for row in (await db.execute(text(sql))).mappings()]
                result['status'] = 'OK'
    except Exception as exc:
        result['status'] = type(exc).__name__
    finally:
        if database.async_engine:
            await database.async_engine.dispose()
    result['openapi_operations'] = [{'method': method.upper(), 'path': path}
                                   for path, methods in app.openapi()['paths'].items()
                                   for method in methods if method in {'get','post','put','patch','delete'}]
    output = Path(__file__).with_name('schema-readonly.json')
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'status': result['status'], 'read_only': result.get('read_only'),
                      'tables': len(result.get('tables', [])),
                      'triggers': result.get('triggers', []),
                      'operations': len(result['openapi_operations'])}, ensure_ascii=False))


if __name__ == '__main__':
    asyncio.run(inspect())

"""Metadatos y agregados de juegos en BD configurada; transacción READ ONLY, sin PII."""
import argparse
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.core.database_transport import engine_options

TABLES = ('actividades', 'objetivos', 'mundos', 'niveles', 'resultados_nivel', 'perfiles', 'perfil_logros', 'logros')

async def inspect():
    url, options = engine_options(settings.effective_database_url, settings)
    engine = create_async_engine(url, **options)
    try:
        async with engine.connect() as db:
            await db.execute(text('SET TRANSACTION READ ONLY'))
            await db.execute(text("SET LOCAL statement_timeout='15000ms'"))
            result = {'captured_utc': datetime.now(timezone.utc).isoformat(), 'transaction_read_only': await db.scalar(text('SHOW transaction_read_only')),
                'ssl': await db.scalar(text('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')), 'tables': []}
            for table in TABLES:
                privileges = {op: await db.scalar(text('SELECT has_table_privilege(current_user,:table,:op)'), {'table': 'public.' + table, 'op': op}) for op in ('SELECT','INSERT','UPDATE','DELETE')}
                await db.execute(text(f'SELECT * FROM public.{table} LIMIT 0'))
                result['tables'].append({'table': table, 'privileges': privileges, 'read': 'PASS'})
            result['medal_catalog'] = [dict(row) for row in (await db.execute(text("SELECT codigo_juego,count(*) AS medals FROM public.logros WHERE codigo_juego IS NOT NULL GROUP BY codigo_juego ORDER BY codigo_juego"))).mappings()]
            result['stored_attempts'] = [dict(row) for row in (await db.execute(text("SELECT a.codigo_juego,count(*) AS attempts,count(*) FILTER (WHERE r.puntaje=100) AS correct FROM public.resultados_nivel r JOIN public.niveles n USING(id_nivel) JOIN public.mundos m USING(id_mundo) JOIN public.actividades a USING(id_actividad) WHERE a.version_contenido='basica-1' GROUP BY a.codigo_juego ORDER BY a.codigo_juego"))).mappings()]
            await db.rollback()
            return result
    finally:
        await engine.dispose()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        result = asyncio.run(inspect())
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(result, ensure_ascii=False))
    except Exception as exc:
        print(json.dumps({'status': 'FAILED', 'error_type': type(exc).__name__}))
        raise SystemExit(1) from None

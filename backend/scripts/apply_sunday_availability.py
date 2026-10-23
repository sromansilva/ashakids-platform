"""Inspección por defecto; --apply adopta sólo la restricción dominical autorizada.

La configuración privada contiene previous_url del propietario; nunca se imprime.
Exige el mismo destino configurado, guarda metadatos de respaldo y conserva filas/ACL.
No publica turnos ni crea usuarios o reservas. No ejecuta migraciones al iniciar API.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.core.database_transport import engine_options

ROOT = Path(__file__).resolve().parents[2]
CONSTRAINT = 'turnos_semanales_dia_check'


class PostCommitVerificationError(RuntimeError):
    def __init__(self, result):
        self.result = result
        super().__init__('Committed; post-commit verification unavailable')


async def snapshot(conn):
    row = (await conn.execute(text("SELECT count(*) AS rows, md5(coalesce(string_agg(row_to_json(t)::text, ',' ORDER BY id_turno),'')) AS fingerprint FROM public.turnos_semanales t"))).mappings().one()
    table = (await conn.execute(text("SELECT relrowsecurity AS rls, relacl::text AS acl FROM pg_class WHERE oid='public.turnos_semanales'::regclass"))).mappings().one()
    constraints = (await conn.execute(text("SELECT conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='public.turnos_semanales'::regclass ORDER BY conname"))).mappings().all()
    policies = (await conn.execute(text("SELECT policyname, roles::text, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename='turnos_semanales' ORDER BY policyname"))).mappings().all()
    return {'data': dict(row), 'table': dict(table), 'constraints': [dict(r) for r in constraints], 'policies': [dict(r) for r in policies]}


async def run(args):
    result = {'captured_utc': datetime.now(timezone.utc).isoformat(), 'scope': 'weekday constraint only; no clinical DML', 'applied': False}
    runtime = settings.effective_database_url
    owner = runtime
    if args.apply:
        if not args.owner_config:
            raise ValueError('Owner configuration required')
        owner = json.loads(args.owner_config.read_text(encoding='utf-8'))['previous_url']
        a, b = make_url(runtime), make_url(owner)
        if (a.host, a.port, a.database) != (b.host, b.port, b.database):
            raise ValueError('Owner and runtime targets differ')
    url, options = engine_options(owner, settings)
    engine = create_async_engine(url, **options)
    try:
        async with engine.begin() as conn:
            if not args.apply:
                await conn.execute(text('SET TRANSACTION READ ONLY'))
            await conn.execute(text("SET LOCAL lock_timeout='5s'"))
            await conn.execute(text("SET LOCAL statement_timeout='15s'"))
            if args.apply:
                await conn.execute(text('LOCK TABLE public.turnos_semanales IN ACCESS EXCLUSIVE MODE'))
            before = await snapshot(conn)
            rule = next(c['definition'] for c in before['constraints'] if c['conname'] == CONSTRAINT)
            if rule.replace(' ', '') not in {'CHECK(((dia>=0)AND(dia<=5)))', 'CHECK(((dia>=0)AND(dia<=6)))'}:
                raise ValueError('Unexpected existing weekday rule')
            result['before'] = before
            if args.apply:
                args.backup.parent.mkdir(parents=True, exist_ok=True)
                # Conservar el respaldo inicial si el operador repite la adopción.
                if not args.backup.exists():
                    args.backup.write_text(json.dumps(before, indent=2), encoding='utf-8')
                migration = ROOT / 'backend/scripts/migrations/012_disponibilidad_domingo.sql'
                sql = '\n'.join(line for line in migration.read_text(encoding='utf-8').splitlines() if not line.startswith('--'))
                for statement in sql.split(';'):
                    statement = statement.strip()
                    if statement and statement not in {'BEGIN', 'COMMIT'}:
                        await conn.execute(text(statement))
                after = await snapshot(conn)
                for key in ('data', 'table', 'policies'):
                    if before[key] != after[key]:
                        raise ValueError('Preservation verification failed')
                other = lambda state: [c for c in state['constraints'] if c['conname'] != CONSTRAINT]
                if other(before) != other(after):
                    raise ValueError('Unrelated constraint changed')
                result['after'] = after
        if args.apply:
            # Releer después del COMMIT, no declarar adopción sólo dentro de la transacción.
            result['applied'] = True  # La transacción ya confirmó el DDL.
            try:
                async with engine.begin() as conn:
                    await conn.execute(text('SET TRANSACTION READ ONLY'))
                    result['persisted'] = await snapshot(conn)
                    result['post_commit_verified'] = result['persisted'] == result['after']
                    if not result['post_commit_verified']:
                        raise ValueError('Post-commit verification changed')
            except Exception:
                # Una lectura fallida o escrituras concurrentes no revierten un COMMIT.
                result['post_commit_verified'] = False
                raise PostCommitVerificationError(result) from None
    finally:
        await engine.dispose()
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--owner-config', type=Path)
    parser.add_argument('--backup', type=Path, default=ROOT / 'tmp/sunday-constraint-before-private.json')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        result = asyncio.run(run(args))
    except Exception as exc:
        result = exc.result if isinstance(exc, PostCommitVerificationError) else {'applied': False, 'scope': 'weekday constraint only'}
        result['error_type'] = type(exc).__name__
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps(result))
        raise SystemExit(1)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps({'applied': result['applied'], 'rows_preserved': result['before']['data']['rows'], 'output': str(args.output)}))

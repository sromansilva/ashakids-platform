from contextlib import asynccontextmanager
from unittest.mock import AsyncMock
import pytest
from scripts.verify_delivery_journey import confirm_api_database


class Engine:
    def __init__(self, result):
        self.connection = AsyncMock()
        self.connection.scalar.return_value = result

    @asynccontextmanager
    async def connect(self):
        yield self.connection


@pytest.mark.parametrize('cookies', [{}, {'a':'synthetic-a','b':'synthetic-b'}])
async def test_missing_or_ambiguous_session_stops_before_sql(cookies):
    engine = Engine(1)
    with pytest.raises(RuntimeError, match='única sesión'):
        await confirm_api_database(engine, cookies)
    engine.connection.scalar.assert_not_awaited()


async def test_session_in_another_database_blocks_clinical_writes():
    with pytest.raises(RuntimeError, match='API no emitió'):
        await confirm_api_database(Engine(None), {'cookie':'synthetic-token'})


async def test_active_session_matches_the_explicit_database():
    engine = Engine(12)
    await confirm_api_database(engine, {'cookie':'synthetic-token'})
    sql = str(engine.connection.scalar.call_args.args[0].compile(compile_kwargs={'literal_binds':True}))
    assert 'sesiones_autenticacion.token_hash =' in sql
    assert 'revocado IS false' in sql and 'fecha_expiracion >' in sql
    assert 'synthetic-token' not in sql

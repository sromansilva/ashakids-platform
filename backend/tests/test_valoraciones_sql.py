"""Ensayo de migración/API en PostgreSQL local descartable; jamás usa .env."""
import asyncio
import os
from datetime import date, datetime, timezone
from pathlib import Path
from types import SimpleNamespace
import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from scripts.testing_database import disposable_database_urls
from app.main import app
from app.api.deps import get_current_user
from app.core.database import Base, get_db
from app.models.auth import Usuario
from app.models.perfiles import Paciente, Terapeuta, Tutor
from app.models.clinica import Reserva, Sesion


@pytest_asyncio.fixture
async def review_db():
    if not os.environ.get('ASHAKIDS_TEST_DATABASE_URL'):
        pytest.skip('Requiere PostgreSQL local ashakids_test_* explícito.')
    url, _ = disposable_database_urls()
    engine = create_async_engine(url)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as connection:
        # Only creates missing local fixtures. Existing tables are never dropped.
        names = ['usuarios', 'tutores', 'terapeutas', 'pacientes', 'expedientes', 'tratamientos', 'reservas', 'sesiones']
        await connection.run_sync(lambda c: Base.metadata.create_all(c, tables=[Base.metadata.tables[n] for n in names]))
        assert await connection.scalar(text("SELECT to_regclass('public.valoraciones_sesion')")) is None, 'Use a new disposable database.'
        raw = await connection.get_raw_connection()
        sql = (Path(__file__).parents[1] / 'scripts/migrations/011_valoraciones_sesion.sql').read_text(encoding='utf-8')
        await raw.driver_connection.execute(sql.replace('BEGIN;', '', 1).rsplit('COMMIT;',1)[0])
    async with factory.begin() as db:
        users = [Usuario(nombres='Cuenta',apellidos='Sintética',codigo_usuario=f'p{i:05d}',email=f'review-{i}@example.invalid',password_hash='No-login-fixture') for i in range(1,5)]
        db.add_all(users); await db.flush()
        tutor = Tutor(id_usuario=users[0].id_usuario)
        other_tutor = Tutor(id_usuario=users[1].id_usuario)
        therapist = Terapeuta(id_usuario=users[2].id_usuario)
        other_therapist = Terapeuta(id_usuario=users[3].id_usuario)
        db.add_all([tutor,other_tutor,therapist,other_therapist]); await db.flush()
        patient = Paciente(id_tutor=tutor.id_tutor,nombres_paciente='Prueba',apellidos_paciente='Aislada',fecha_nacimiento=date(2018,1,1),sexo='Otro')
        db.add(patient); await db.flush()
        reservations = [Reserva(id_paciente=patient.id_paciente,id_terapeuta=t.id_terapeuta,fecha_hora_inicio=datetime(2020,1,6,13,tzinfo=timezone.utc),fecha_hora_fin=datetime(2020,1,6,14,tzinfo=timezone.utc),modalidad='PRESENCIAL',estado_reserva='COMPLETADA') for t in [therapist,other_therapist,therapist]]
        db.add_all(reservations);await db.flush()
        sessions = [Sesion(id_reserva=r.id_reserva,estado_sesion='FINALIZADA',asistencia='ASISTIO' if index!=2 else 'NO_ASISTIO') for index,r in enumerate(reservations)]
        db.add_all(sessions);await db.flush()
        ids = [s.id_sesion for s in sessions]
        identities = [(SimpleNamespace(id_usuario=u.id_usuario),['PADRE' if index<2 else 'TERAPEUTA']) for index,u in enumerate(users)]
    async def dependency():
        async with factory.begin() as db:
            yield db
    app.dependency_overrides[get_db] = dependency
    try:
        yield engine, ids, identities
    finally:
        app.dependency_overrides.pop(get_db,None)
        app.dependency_overrides.pop(get_current_user,None)
        await engine.dispose()


@pytest.mark.asyncio
async def test_review_api_sql_permissions_concurrency_and_migration(review_db):
    engine, ids, identities = review_db
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
        app.dependency_overrides[get_current_user] = lambda: identities[1]
        assert (await client.get(f'/api/v1/sesiones/{ids[0]}/valoracion')).status_code == 404
        assert (await client.post(f'/api/v1/sesiones/{ids[0]}/valoracion',json={'calificacion':5})).status_code == 404
        app.dependency_overrides[get_current_user] = lambda: identities[0]
        assert (await client.get(f'/api/v1/sesiones/{ids[0]}/valoracion')).json() is None
        assert (await client.get('/api/v1/valoraciones')).status_code == 403
        assert (await client.post(f'/api/v1/sesiones/{ids[2]}/valoracion',json={'calificacion':5})).status_code == 409
        body={'calificacion':4,'comentario':'Opinión sintética'}
        first,second=await asyncio.gather(*[client.post(f'/api/v1/sesiones/{ids[0]}/valoracion',json=body) for _ in range(2)])
        assert first.status_code == second.status_code == 201, (first.text,second.text)
        assert first.json()['id_valoracion'] == second.json()['id_valoracion']
        assert (await client.post(f'/api/v1/sesiones/{ids[0]}/valoracion',json={'calificacion':5})).status_code == 409
        assert (await client.post(f'/api/v1/sesiones/{ids[1]}/valoracion',json={'calificacion':5})).status_code == 201
        for index, session_id, rating in [(2,ids[0],4),(3,ids[1],5)]:
            app.dependency_overrides[get_current_user] = lambda index=index: identities[index]
            listed=await client.get('/api/v1/valoraciones?limit=1&offset=0')
            assert listed.status_code == 200 and listed.headers['X-Total-Count']=='1',listed.text
            assert listed.json()[0]['id_sesion']==session_id and listed.json()[0]['calificacion']==rating
            assert 'paciente_nombre' not in listed.json()[0]
            assert (await client.post(f'/api/v1/sesiones/{session_id}/valoracion',json={'calificacion':5})).status_code == 403
            assert (await client.get('/api/v1/valoraciones?limit=1&offset=1')).json()==[]
    async with engine.connect() as db:
        assert await db.scalar(text('SELECT count(*) FROM valoraciones_sesion')) == 2
        assert await db.scalar(text("SELECT relrowsecurity FROM pg_class WHERE oid='public.valoraciones_sesion'::regclass"))
        assert not await db.scalar(text("SELECT has_table_privilege('ashakids_runtime','public.valoraciones_sesion','UPDATE')"))
        assert not await db.scalar(text("SELECT has_table_privilege('ashakids_runtime','public.valoraciones_sesion','DELETE')"))
        assert await db.scalar(text("SELECT has_table_privilege('ashakids_runtime','public.valoraciones_sesion','INSERT')"))

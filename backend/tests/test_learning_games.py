"""Contrato/persistencia/idempotencia solo sobre fixture PostgreSQL descartable."""
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import asyncio
import pytest
from sqlalchemy import select, func, event
from app.modules.clinica.domain.clinica_models import Expediente, Tratamiento, Reserva, Sesion
from app.modules.cuentas.domain.perfiles_models import Paciente, Perfil, PerfilLogro
from app.modules.mundo_asha.domain.models import ResultadoNivel
from app.modules.mundo_asha.application.juegos_catalogo import MUNDOS, VERSION


@pytest.fixture(autouse=True)
def isolated_login_budget(monkeypatch):
    """Cada caso tiene su propio presupuesto de login, con límites reales."""
    from app.core import login_limiter
    monkeypatch.setattr(login_limiter, "login_limiter", login_limiter.LoginLimiter())


async def prepare(clinical):
    clients, factory = clinical
    async with factory.begin() as db:
        child = Paciente(id_tutor=1, nombres_paciente="Juego", apellidos_paciente="Sintético",
                         fecha_nacimiento=datetime(2020, 1, 1).date(), sexo="Otro")
        db.add(child); await db.flush()
        record = Expediente(id_paciente=child.id_paciente)
        db.add(record); await db.flush()
        now = datetime.now(timezone.utc)
        appointment = Reserva(id_paciente=child.id_paciente, id_terapeuta=1, tipo_cita="INTRODUCTORIA",
          fecha_hora_inicio=now-timedelta(hours=2), fecha_hora_fin=now-timedelta(hours=1),
          modalidad="PRESENCIAL", estado_reserva="COMPLETADA")
        db.add(appointment); await db.flush()
        session = Sesion(id_reserva=appointment.id_reserva, estado_sesion="FINALIZADA", asistencia="ASISTIO")
        db.add(session); await db.flush()
        db.add(Tratamiento(id_expediente=record.id_expediente, id_terapeuta=1, id_sesion_origen=session.id_sesion,
          area="LENGUAJE", mundos_asignados=list(MUNDOS), sesiones_recomendadas=4,
          estado_tratamiento="ACTIVO", nombre_tratamiento="Simulación sintética"))
    return clients, factory, child.id_paciente


def attempt(world, number, answers=None, key=None):
    return dict(clave_intento=str(key or uuid4()), version=VERSION, nivel=number,
                respuestas=answers or MUNDOS[world]["levels"][number-1]["answer"],
                duracion_segundos=12, ayudas_usadas=1)


@pytest.mark.asyncio
async def test_free_levels_five_medals_and_persistence(clinical):
    clients, factory, key = await prepare(clinical)
    parent = clients['p90001']; url = f'/api/v1/pacientes/{key}/juegos'
    catalog = (await parent.get('/api/v1/juegos/catalogo')).json()
    level_counts = {world['id']: len(world['levels']) for world in catalog}
    assert set(level_counts) == set(MUNDOS) and all(count >= 1 for count in level_counts.values())
    assert all('answer' not in l for w in catalog for l in w['levels'])
    # Completar primero el último nivel no debe exigir niveles previos.
    habla_last_level = level_counts['HABLA']
    response = await parent.post(url+'/HABLA/intentos', json=attempt('HABLA', habla_last_level))
    assert response.status_code == 200, response.text
    assert response.json()['resumen']['mundos'][0]['completados'] == [habla_last_level]
    assert response.json()['resumen']['medallas'] == []
    for code, count in level_counts.items():
        for n in [count, *range(1, count + 1)]:
            response = await parent.post(url+f'/{code}/intentos',json=attempt(code,n))
            assert response.status_code == 200, response.text
    saved = (await parent.get(url)).json()
    total_levels = sum(level_counts.values())
    expected_experience = total_levels * 100 + len(level_counts) * 100
    assert saved['experiencia'] == expected_experience
    assert saved['nivel'] == 1 + expected_experience // 200
    assert len(saved['medallas']) == len(level_counts)
    assert saved['intentos_totales'] == total_levels + len(level_counts) + 1
    again = (await parent.post(url+'/HABLA/intentos',json=attempt('HABLA',1))).json()
    assert again['experiencia_otorgada'] == 0 and again['resumen']['experiencia'] == expected_experience
    async with factory() as db:
        profile = await db.scalar(select(Perfil).where(Perfil.id_paciente==key))
        assert profile.experiencia == expected_experience and profile.nivel == 1 + expected_experience // 200
        assert profile.objetivos_completados == len(level_counts)
        assert profile.actividades_desarrolladas_total == total_levels
        assert await db.scalar(select(func.count()).select_from(PerfilLogro)) == len(level_counts)


@pytest.mark.asyncio
async def test_failed_attempt_idempotency_permissions_and_concurrency(clinical):
    clients, factory, key = await prepare(clinical)
    parent = clients['p90001']; url=f'/api/v1/pacientes/{key}/juegos'
    bad=attempt('LENGUAJE',1,['Perro'])
    first=await parent.post(url+'/LENGUAJE/intentos',json=bad)
    assert first.status_code == 200 and first.json()['correcto'] is False
    repeat=await parent.post(url+'/LENGUAJE/intentos',json=bad)
    assert repeat.json()['id_intento']==first.json()['id_intento'] and repeat.json()['repetido']
    assert repeat.json()['resumen']['intentos_totales']==1
    assert (await parent.post(url+'/LENGUAJE/intentos',json={**bad,'respuestas':['Gato']})).status_code==409
    assert (await clients['p90002'].get(url)).status_code==404
    assert (await clients['p90002'].post(url+'/HABLA/intentos',json=attempt('HABLA',1))).status_code==404
    assert (await clients['t90001'].post(url+'/HABLA/intentos',json=attempt('HABLA',1))).status_code==403
    assert (await parent.post(url+'/VOZ/intentos',json={**attempt('VOZ',1),'puntaje':100})).status_code==422
    assert (await parent.post(url+'/HABLA/intentos',json={**attempt('HABLA',1),'nivel':len(MUNDOS['HABLA']['levels'])+1})).status_code==422
    assert (await parent.post(url+'/VOZ/intentos',json={**attempt('VOZ',1),'nivel':6})).status_code==422
    responses=await asyncio.gather(*(parent.post(url+'/LENGUAJE/intentos',json=attempt('LENGUAJE',1)) for _ in range(2)))
    assert all(r.status_code==200 for r in responses), [r.text for r in responses]
    assert sum(r.json()['experiencia_otorgada'] for r in responses)==100
    assert (await parent.get(url)).json()['experiencia']==100
    async with factory() as db:
        records=(await db.scalars(select(ResultadoNivel))).all()
        assert len(records)==3 and sum(r.experiencia_otorgada for r in records)==100


@pytest.mark.asyncio
async def test_unassigned_world_is_denied(clinical):
    clients, factory, key=await prepare(clinical)
    async with factory.begin() as db:
        plan=await db.scalar(select(Tratamiento).where(Tratamiento.id_sesion_origen.is_not(None)))
        plan.mundos_asignados=['HABLA']
    response=await clients['p90001'].post(f'/api/v1/pacientes/{key}/juegos/VOZ/intentos',json=attempt('VOZ',1))
    assert response.status_code==403


@pytest.mark.asyncio
@pytest.mark.parametrize('world', list(MUNDOS))
async def test_world_completion_inserts_final_reward_without_updating_attempts(clinical, world):
    clients, factory, key = await prepare(clinical)
    engine = factory.kw['bind'].sync_engine
    statements = []
    def capture(_conn, _cursor, statement, _parameters, _context, _many):
        if statement.lstrip().upper().startswith('UPDATE RESULTADOS_NIVEL'):
            statements.append(statement)
    event.listen(engine, 'before_cursor_execute', capture)
    try:
        url = f'/api/v1/pacientes/{key}/juegos/{world}/intentos'
        total_levels = len(MUNDOS[world]['levels'])
        final_data = attempt(world, total_levels)
        for number in range(1, total_levels + 1):
            data = final_data if number == total_levels else attempt(world, number)
            response = await clients['p90001'].post(url, json=data)
            assert response.status_code == 200, response.text
            assert response.json()['experiencia_otorgada'] == (200 if number == total_levels else 100)
        repeat = await clients['p90001'].post(url, json=final_data)
        assert repeat.status_code == 200 and repeat.json()['repetido'] is True
        saved = repeat.json()['resumen']
        assert saved['experiencia'] == total_levels * 100 + 100 and len(saved['medallas']) == 1
        assert saved['intentos_totales'] == total_levels
        async with factory() as db:
            assert list(await db.scalars(select(ResultadoNivel.experiencia_otorgada).order_by(ResultadoNivel.id_resultado_nivel))) == [100] * (total_levels - 1) + [200]
            assert await db.scalar(select(func.count()).select_from(PerfilLogro)) == 1
        assert statements == []
    finally:
        event.remove(engine, 'before_cursor_execute', capture)

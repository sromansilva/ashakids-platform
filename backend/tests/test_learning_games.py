"""Contrato/persistencia/idempotencia solo sobre fixture PostgreSQL descartable."""
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import asyncio
import pytest
from sqlalchemy import select, func
from app.models.clinica import Expediente, Tratamiento, Reserva, Sesion
from app.models.perfiles import Paciente, Perfil, PerfilLogro
from app.models.juegos import ResultadoNivel
from app.services.juegos_catalogo import MUNDOS, VERSION


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
    assert len(catalog) == 5 and all(len(w['levels']) == 3 for w in catalog)
    assert all('answer' not in l for w in catalog for l in w['levels'])
    # Primero nivel 3: no completa niveles 1/2, ni exige requisitos previos.
    response = await parent.post(url+'/HABLA/intentos', json=attempt('HABLA',3))
    assert response.status_code == 200, response.text
    assert response.json()['resumen']['mundos'][0]['completados'] == [3]
    assert response.json()['resumen']['medallas'] == []
    for code in MUNDOS:
        for n in (3, 1, 2):
            response = await parent.post(url+f'/{code}/intentos',json=attempt(code,n))
            assert response.status_code == 200, response.text
    saved = (await parent.get(url)).json()
    assert saved['experiencia'] == 2000 and saved['nivel'] == 11
    assert len(saved['medallas']) == 5 and saved['intentos_totales'] == 16
    again = (await parent.post(url+'/HABLA/intentos',json=attempt('HABLA',1))).json()
    assert again['experiencia_otorgada'] == 0 and again['resumen']['experiencia'] == 2000
    async with factory() as db:
        profile = await db.scalar(select(Perfil).where(Perfil.id_paciente==key))
        assert profile.experiencia == 2000 and profile.nivel == 11
        assert profile.objetivos_completados == 5 and profile.actividades_desarrolladas_total == 15
        assert await db.scalar(select(func.count()).select_from(PerfilLogro)) == 5


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
    assert (await parent.post(url+'/VOZ/intentos',json={**attempt('VOZ',1),'nivel':4})).status_code==422
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

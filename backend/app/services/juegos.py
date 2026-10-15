"""Simulación persistente. Recompensas transaccionales e idempotencia por intento."""
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from sqlalchemy import select, func
from app.models.clinica import Expediente, Tratamiento
from app.models.perfiles import Perfil, PerfilLogro, Logro
from app.models.juegos import Actividad, Objetivo, Mundo, Nivel, ResultadoNivel
from app.services.acceso import exigir, es_familia, paciente_visible
from app.services.juegos_catalogo import MUNDOS, VERSION, XP_NIVEL, XP_MEDALLA, XP_POR_NIVEL_PERFIL, catalogo


async def asignados(db, patient):
    plan = await db.scalar(select(Tratamiento).join(Expediente).where(
        Expediente.id_paciente == patient.id_paciente, Tratamiento.estado_tratamiento == "ACTIVO",
        Tratamiento.id_sesion_origen.is_not(None)))
    return list(plan.mundos_asignados) if plan else []


def resultados_query(patient_id):
    return (select(ResultadoNivel, Nivel.orden, Actividad.codigo_juego)
            .join(Nivel, Nivel.id_nivel == ResultadoNivel.id_nivel)
            .join(Mundo, Mundo.id_mundo == Nivel.id_mundo)
            .join(Actividad, Actividad.id_actividad == Mundo.id_actividad)
            .where(ResultadoNivel.id_paciente == patient_id, Actividad.id_paciente == patient_id,
                   Actividad.version_contenido == VERSION))


async def resumen(db, identity, patient_id):
    patient = await paciente_visible(db, identity, patient_id)
    allowed = await asignados(db, patient)
    rows = (await db.execute(resultados_query(patient_id))).all()
    profile = await db.scalar(select(Perfil).where(Perfil.id_paciente == patient_id))
    medals = []
    if profile:
        medals = [dict(codigo=r.codigo_juego, nombre=r.nombre_logro, fecha=r.fecha_obtencion)
                  for r in (await db.execute(select(Logro.codigo_juego, Logro.nombre_logro,
                    PerfilLogro.fecha_obtencion).join(PerfilLogro).where(
                    PerfilLogro.id_perfil == profile.id_perfil, Logro.codigo_juego.is_not(None)))).all()]
    worlds = []
    for world in catalogo():
        own = [(r, n) for r, n, code in rows if code == world["id"]]
        completed = sorted({n for r, n in own if r.puntaje == 100})
        if world["id"] not in allowed:
            world["levels"] = []
        worlds.append(dict(**world, asignado=world["id"] in allowed, completados=completed,
                           intentos=len(own), medalla=any(m["codigo"] == world["id"] for m in medals)))
    return dict(id_paciente=patient_id, version=VERSION, experiencia=profile.experiencia if profile else 0,
                nivel=profile.nivel if profile else 1, mundos=worlds, medallas=medals,
                intentos_totales=len(rows), experiencia_siguiente_nivel=(profile.nivel if profile else 1) * XP_POR_NIVEL_PERFIL)


async def estructura(db, patient_id, code):
    content = MUNDOS[code]
    activity = await db.scalar(select(Actividad).where(Actividad.id_paciente == patient_id,
        Actividad.codigo_juego == code, Actividad.version_contenido == VERSION))
    if activity:
        world = await db.scalar(select(Mundo).where(Mundo.id_actividad == activity.id_actividad))
        return activity, world
    activity = Actividad(id_paciente=patient_id, codigo_juego=code, version_contenido=VERSION,
        nombre_actividad=content["name"], descripcion="SIMULACIÓN BÁSICA. " + content["description"],
        estado_actividad="EN_PROGRESO", fecha_asignacion=datetime.now(timezone.utc))
    db.add(activity)
    await db.flush()
    world = Mundo(id_actividad=activity.id_actividad, nombre_mundo=content["name"],
                  descripcion=content["description"], objetivo="Completar tres actividades de simulación.", activo=True)
    db.add(world)
    db.add(Objetivo(id_actividad=activity.id_actividad, titulo="Mundo " + code.title(),
        descripcion="Objetivo del juego básico; no acredita dominio clínico.",
        resultados_objetivo={"tipo": "SIMULACION", "completados": 0, "total": 3, "version": VERSION}))
    await db.flush()
    db.add_all([Nivel(id_mundo=world.id_mundo, nombre_nivel=level["title"], orden=i + 1,
                      objetivo=level["prompt"], activo=True) for i, level in enumerate(content["levels"])])
    await db.flush()
    return activity, world


async def registrar(db, identity, patient_id, code, data):
    exigir(identity, "PADRE")
    patient = await paciente_visible(db, identity, patient_id, lock=True)
    if not await es_familia(db, identity, patient):
        raise HTTPException(404, "Recurso no encontrado.")
    if not patient.activo or code not in await asignados(db, patient):
        raise HTTPException(403, "El mundo debe estar asignado en el plan activo del niño.")
    payload = dict(mundo=code, **data.model_dump(mode="json"))
    prior = await db.scalar(select(ResultadoNivel).where(ResultadoNivel.clave_intento == data.clave_intento))
    if prior:
        if prior.id_paciente != patient_id or prior.detalle_resultados.get("solicitud") != payload:
            raise HTTPException(409, "La clave de intento ya se usó para otro resultado.")
        return dict(id_intento=prior.id_resultado_nivel, correcto=prior.puntaje == 100,
                    experiencia_otorgada=prior.experiencia_otorgada, repetido=True,
                    resumen=await resumen(db, identity, patient_id))
    level_content = MUNDOS[code]["levels"][data.nivel - 1]
    if any(len(a) > 100 or a not in level_content["choices"] for a in data.respuestas):
        raise HTTPException(422, "Seleccione respuestas de esta actividad.")
    activity, world = await estructura(db, patient_id, code)
    level = await db.scalar(select(Nivel).where(Nivel.id_mundo == world.id_mundo, Nivel.orden == data.nivel))
    correct = data.respuestas == level_content["answer"]
    previous = (await db.scalars(select(ResultadoNivel).where(ResultadoNivel.id_paciente == patient_id,
                            ResultadoNivel.id_nivel == level.id_nivel))).all()
    award = XP_NIVEL if correct and not any(r.puntaje == 100 for r in previous) else 0
    profile = await db.scalar(select(Perfil).where(Perfil.id_paciente == patient_id))
    if profile is None:
        profile = Perfil(id_paciente=patient_id)
        db.add(profile)
        await db.flush()
    # Calcular el premio completo antes del INSERT: los intentos guardados son
    # inmutables y el rol runtime no tiene UPDATE sobre resultados_nivel.
    prior_rows = (await db.execute(resultados_query(patient_id))).all()
    completed = {n for r, n, key in prior_rows if key == code and r.puntaje == 100}
    if correct:
        completed.add(data.nivel)
    objective = await db.scalar(select(Objetivo).where(Objetivo.id_actividad == activity.id_actividad))
    objective.resultados_objetivo = {"tipo": "SIMULACION", "version": VERSION, "total": 3, "completados": len(completed)}
    if len(completed) == 3:
        activity.estado_actividad = "COMPLETADA"
        medal = await db.scalar(select(Logro).where(Logro.codigo_juego == code))
        if medal is None:
            raise HTTPException(503, "Catálogo de medallas pendiente de actualización.")
        earned = await db.scalar(select(PerfilLogro).where(PerfilLogro.id_perfil == profile.id_perfil,
                                                         PerfilLogro.id_logro == medal.id_logro))
        if earned is None:
            db.add(PerfilLogro(id_perfil=profile.id_perfil, id_logro=medal.id_logro))
            award += XP_MEDALLA
    attempt = ResultadoNivel(id_paciente=patient_id, id_nivel=level.id_nivel,
        numero_intento=max((r.numero_intento for r in previous), default=0) + 1,
        puntaje=100 if correct else 0, estrellas_obtenidas=3 if correct else 0,
        detalle_resultados={"tipo": "SIMULACION", "version": VERSION, "solicitud": payload,
                            "aciertos": sum(a == b for a, b in zip(data.respuestas, level_content["answer"])),
                            "respuestas_totales": len(level_content["answer"]), "validacion": "SERVIDOR"},
        fecha_realizacion=datetime.now(timezone.utc), clave_intento=data.clave_intento,
        experiencia_otorgada=award)
    db.add(attempt)
    await db.flush()
    all_rows = (await db.execute(resultados_query(patient_id))).all()
    profile.experiencia += award
    profile.nivel = 1 + profile.experiencia // XP_POR_NIVEL_PERFIL
    completed_pairs = {(key, n) for r, n, key in all_rows if r.puntaje == 100}
    profile.actividades_desarrolladas_total = len(completed_pairs)
    profile.objetivos_totales = len({key for _, _, key in all_rows})
    profile.objetivos_completados = sum(sum(1 for c, _ in completed_pairs if c == key) == 3
                                       for key in {c for _, _, c in all_rows})
    allowed = await asignados(db, patient)
    profile.progreso = round(100 * sum(key in allowed for key, _ in completed_pairs) / (3 * len(allowed)), 2) if allowed else 0
    dates = {r.fecha_realizacion.astimezone(ZoneInfo("America/Lima")).date() for r, _, _ in all_rows}
    day, streak = datetime.now(ZoneInfo("America/Lima")).date(), 0
    while day in dates:
        streak += 1
        day -= timedelta(days=1)
    profile.racha_dias = streak
    await db.flush()
    return dict(id_intento=attempt.id_resultado_nivel, correcto=correct, experiencia_otorgada=award,
                repetido=False, resumen=await resumen(db, identity, patient_id))

import { pool } from '../../core/database.js';
import { randomUUID } from 'node:crypto';
import { PHONEME_LABYRINTH_LEVELS, PHONEME_LABYRINTH_TARGETS } from './phoneme-labyrinth.js';
import { PHONEME_AWARENESS_LEVELS, PHONEME_AWARENESS_TARGETS } from './phoneme-awareness.js';
import { PHONEME_NAMING_LEVELS, PHONEME_NAMING_TARGETS } from './phoneme-naming.js';
export { PHONEME_LABYRINTH_TARGETS } from './phoneme-labyrinth.js';
export { PHONEME_NAMING_TARGETS } from './phoneme-naming.js';
export { PHONEME_AWARENESS_TARGETS } from './phoneme-awareness.js';

export const VERSION = 'basica-1';
const LUDIC_ACTIVITY_LEVEL = 999;
const LUDIC_ACTIVITY_CODES: Record<string, ReadonlySet<string>> = {
  HABLA: new Set(['sound:explore', 'sound:identify', 'sound:pairs2', 'sound:pairs3', 'sound:same', 'sound:sequence', 'sound:count', 'sound:memory', 'sound:missing', 'sound:order', 'sound:odd']),
  LENGUAJE: new Set(['word:treasure', 'word:memory', 'word:sort', 'word:story', 'word:opposites', 'word:syllables', 'word:count', 'word:positions', 'word:rhymes', 'word:sentence', 'word:naming']),
  FLUIDEZ: new Set(['fluency:beat', 'fluency:islands', 'fluency:turns', 'fluency:train', 'fluency:echo', 'fluency:chat', 'fluency:wordpath', 'fluency:story', 'fluency:listen', 'fluency:bridge', 'fluency:round']),
};

export const MUNDOS_CATALOGO: Record<string, any> = {
  HABLA: {
    name: 'Taller de los Sonidos',
    description: 'Habla y articulación: identifica palabras y sonidos en actividades básicas.',
    levels: [
      { number: 1, title: 'Escucha la palabra', prompt: 'Escucha: mesa. ¿Qué palabra oíste?', choices: ['Casa', 'Mesa', 'Sapo'], answer: ['Mesa'], sequence: false },
      { number: 2, title: 'Encuentra el sonido', prompt: 'Mesa empieza con eme. ¿Cuál también empieza con eme?', choices: ['Luna', 'Sol', 'Mano'], answer: ['Mano'], sequence: false },
      { number: 3, title: 'Una frase sonora', prompt: 'Ordena estas palabras: mi mamá me mima.', choices: ['Mima', 'Mi', 'Mamá', 'Me'], answer: ['Mi', 'Mamá', 'Me', 'Mima'], sequence: true },
      ...PHONEME_AWARENESS_LEVELS,
    ],
  },
  LENGUAJE: {
    name: 'La Isla de las Palabras',
    description: 'Comprensión y expresión: resuelve pistas y ordena una historia.',
    levels: [
      { number: 1, title: 'Una pista', prompt: 'Tiene cuatro patas, dice miau y le gusta dormir. ¿Qué animal es?', choices: ['Perro', 'Gato', 'Pez'], answer: ['Gato'], sequence: false },
      { number: 2, title: 'Comprende la historia', prompt: 'Ana lleva un paraguas porque llueve. ¿Para qué lo usa?', choices: ['Para comer', 'Para dormir', 'Para protegerse de la lluvia'], answer: ['Para protegerse de la lluvia'], sequence: false },
      { number: 3, title: 'Cuenta en orden', prompt: 'Primero despertamos, después desayunamos y luego salimos. Elige las acciones en ese orden.', choices: ['Salir', 'Despertar', 'Desayunar'], answer: ['Despertar', 'Desayunar', 'Salir'], sequence: true },
      ...PHONEME_NAMING_LEVELS,
      ...PHONEME_LABYRINTH_LEVELS,
    ],
  },
  FLUIDEZ: {
    name: 'Ritmo de las Palabras',
    description: 'Fluidez: reconoce pausas y turnos de conversación.',
    levels: [
      { number: 1, title: 'Escucha las pausas', prompt: 'Escucha: uno, pausa, dos, pausa, tres. ¿Cuántas pausas hay?', choices: ['Una', 'Dos', 'Tres'], answer: ['Dos'], sequence: false },
      { number: 2, title: 'Tu turno', prompt: 'Tu amiga está contando algo. ¿Qué puedes hacer para respetar su turno?', choices: ['Escuchar hasta que termine', 'Hablar encima', 'Interrumpir siempre'], answer: ['Escuchar hasta que termine'], sequence: false },
      { number: 3, title: 'Ordena la conversación', prompt: 'Ordena: escuchar, esperar el turno y responder.', choices: ['Responder', 'Escuchar', 'Esperar'], answer: ['Escuchar', 'Esperar', 'Responder'], sequence: true },
    ],
  },
  VOZ: {
    name: 'El Estudio de la Voz',
    description: 'Voz y habla: practica la pronunciación y entonación de frases con dificultad progresiva.',
    levels: [
      { number: 1, title: 'Frases breves', prompt: 'Pronuncia la frase en voz alta: «El perro corre».', choices: ['El perro corre'], answer: ['El perro corre'], sequence: false },
      { number: 2, title: 'Frases descriptivas', prompt: 'Pronuncia la frase en voz alta: «El gato duerme sobre la cama».', choices: ['El gato duerme sobre la cama'], answer: ['El gato duerme sobre la cama'], sequence: false },
      { number: 3, title: 'Oraciones de longitud media', prompt: 'Pronuncia la frase en voz alta: «El niño guarda sus juguetes después de jugar».', choices: ['El niño guarda sus juguetes después de jugar'], answer: ['El niño guarda sus juguetes después de jugar'], sequence: false },
      { number: 4, title: 'Oraciones más elaboradas', prompt: 'Pronuncia la frase en voz alta: «El perro corre hacia su casa porque empieza a llover».', choices: ['El perro corre hacia su casa porque empieza a llover'], answer: ['El perro corre hacia su casa porque empieza a llover'], sequence: false },
      { number: 5, title: 'Oraciones extensas', prompt: 'Pronuncia la frase en voz alta: «Cuando termina sus tareas, el niño ordena sus libros y prepara la mochila para el día siguiente».', choices: ['Cuando termina sus tareas, el niño ordena sus libros y prepara la mochila para el día siguiente'], answer: ['Cuando termina sus tareas, el niño ordena sus libros y prepara la mochila para el día siguiente'], sequence: false },
    ],
  },
  OROFACIAL: {
    name: 'Laboratorio de los Gestos',
    description: 'Motricidad orofacial: reconoce labios y lengua en preguntas ilustrativas.',
    levels: [
      { number: 1, title: 'Conoce los labios', prompt: '¿Qué parte de la cara se junta al decir eme?', choices: ['Los labios', 'Las cejas', 'Las orejas'], answer: ['Los labios'], sequence: false },
      { number: 2, title: 'Conoce la lengua', prompt: '¿Qué parte de la boca ayuda a formar distintos sonidos del habla?', choices: ['La lengua', 'La nariz', 'Las pestañas'], answer: ['La lengua'], sequence: false },
      { number: 3, title: 'Reconoce un gesto', prompt: 'Al decir pe, los labios se juntan y después se separan. ¿Qué parte participa?', choices: ['Las orejas', 'Los labios', 'Las cejas'], answer: ['Los labios'], sequence: false },
    ],
  },
};

export class JuegosService {
  getCatalogoPublico() {
    return Object.entries(MUNDOS_CATALOGO).map(([key, w]) => ({
      id: key,
      version: VERSION,
      name: w.name,
      description: w.description,
      levels: w.levels.map((lvl: any) => ({ number: lvl.number })),
    }));
  }

  private async ensurePatientWorlds(pacienteId: number, assignedWorlds: string[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      await client.query('SELECT pg_advisory_xact_lock(7423, $1::integer);', [pacienteId]);
      for (const code of assignedWorlds) {
        const catalog = MUNDOS_CATALOGO[code];
        if (!catalog) continue;
        let activity = await client.query(
          'SELECT id_actividad FROM actividades WHERE id_paciente = $1 AND codigo_juego = $2 ORDER BY id_actividad LIMIT 1;',
          [pacienteId, code],
        );
        if (!activity.rows[0]) {
          activity = await client.query(
            "INSERT INTO actividades (id_paciente, nombre_actividad, descripcion, estado_actividad, codigo_juego, version_contenido) VALUES ($1, $2, $3, 'ACTIVA', $4, $5) RETURNING id_actividad;",
            [pacienteId, catalog.name, catalog.description, code, VERSION],
          );
        }
        const activityId = Number(activity.rows[0].id_actividad);
        let world = await client.query('SELECT id_mundo FROM mundos WHERE id_actividad = $1 ORDER BY id_mundo LIMIT 1;', [activityId]);
        if (!world.rows[0]) {
          world = await client.query(
            'INSERT INTO mundos (id_actividad, nombre_mundo, descripcion, objetivo, activo) VALUES ($1, $2, $3, $4, true) RETURNING id_mundo;',
            [activityId, catalog.name, catalog.description, catalog.description],
          );
        }
        const worldId = Number(world.rows[0].id_mundo);
        for (const level of catalog.levels) {
          const exists = await client.query('SELECT 1 FROM niveles WHERE id_mundo = $1 AND orden = $2 LIMIT 1;', [worldId, level.number]);
          if (!exists.rows.length) {
            await client.query(
              'INSERT INTO niveles (id_mundo, nombre_nivel, orden, objetivo, activo) VALUES ($1, $2, $3, $4, true);',
              [worldId, level.title, level.number, level.prompt],
            );
          }
        }
        const practiceLevel = await client.query(
          'SELECT 1 FROM niveles WHERE id_mundo = $1 AND orden = $2 LIMIT 1;',
          [worldId, LUDIC_ACTIVITY_LEVEL],
        );
        if (!practiceLevel.rows.length) {
          await client.query(
            'INSERT INTO niveles (id_mundo, nombre_nivel, orden, objetivo, activo) VALUES ($1, $2, $3, $4, true);',
            [worldId, 'Registro de participación lúdica', LUDIC_ACTIVITY_LEVEL, 'Registro agregado de actividades adaptativas; no otorga XP ni progreso clínico.'],
          );
        }
      }
      await client.query('COMMIT;');
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
  }

  async getProgresoPaciente(pacienteId: number) {
    if (!Number.isInteger(pacienteId) || pacienteId <= 0) {
      throw Object.assign(new Error('El paciente indicado no es válido.'), { status: 400 });
    }
    const treatment = await pool.query(
      `SELECT area, mundos_asignados, fonemas_priorizados, frecuencia_semanal FROM tratamientos t
       JOIN expedientes e ON e.id_expediente = t.id_expediente
       WHERE e.id_paciente = $1 AND t.estado_tratamiento = 'ACTIVO'
       ORDER BY t.fecha_inicio DESC NULLS LAST, t.id_tratamiento DESC LIMIT 1;`,
      [pacienteId],
    );
    const activeTreatment = treatment.rows[0];
    const assignedWorlds = Array.isArray(activeTreatment?.mundos_asignados)
      ? activeTreatment.mundos_asignados.filter((code: unknown): code is string => typeof code === 'string' && Boolean(MUNDOS_CATALOGO[code]))
      : [];
    const supportedPhonemes = ['/rr/', '/r/', '/s/', '/pl/', '/tr/'];
    const prioritizedPhonemes = Array.isArray(activeTreatment?.fonemas_priorizados)
      ? activeTreatment.fonemas_priorizados.filter((phoneme: unknown): phoneme is string => typeof phoneme === 'string' && supportedPhonemes.includes(phoneme))
      : [];
    // Phoneme plans highlight listening awareness (HABLA) and target-word
    // practice (LENGUAJE); other plans highlight their therapist-selected area.
    const preferredWorlds = prioritizedPhonemes.length > 0
      ? ['HABLA', 'LENGUAJE'].filter((code) => assignedWorlds.includes(code))
      : [typeof activeTreatment?.area === 'string' && assignedWorlds.includes(activeTreatment.area)
        ? activeTreatment.area
        : assignedWorlds[0]].filter((code): code is string => Boolean(code));
    const recommendedWorlds = new Set(preferredWorlds);
    const weeklyFrequency = Number(activeTreatment?.frecuencia_semanal) || null;
    await this.ensurePatientWorlds(pacienteId, assignedWorlds);

    const results = await pool.query(
      `SELECT a.codigo_juego AS mundo, n.orden AS nivel, r.estrellas_obtenidas, r.puntaje,
              r.experiencia_otorgada, r.fecha_realizacion
       FROM resultados_nivel r
       JOIN niveles n ON n.id_nivel = r.id_nivel
       JOIN mundos m ON m.id_mundo = n.id_mundo
       JOIN actividades a ON a.id_actividad = m.id_actividad
       WHERE r.id_paciente = $1 AND a.id_paciente = $1
         AND n.orden <> $2
       ORDER BY r.fecha_realizacion ASC;`,
      [pacienteId, LUDIC_ACTIVITY_LEVEL],
    );
    const completions = new Map<string, Set<number>>();
    const attempts = new Map<string, number>();
    const medals = new Map<string, string>();
    let experience = 0;
    for (const row of results.rows) {
      const worldCode = String(row.mundo);
      const levelNumber = Number(row.nivel);
      attempts.set(worldCode, (attempts.get(worldCode) ?? 0) + 1);
      experience += Number(row.experiencia_otorgada ?? 0);
      if (Number(row.puntaje ?? 0) >= 100 || Number(row.estrellas_obtenidas ?? 0) >= 3) {
        const set = completions.get(worldCode) ?? new Set<number>();
        set.add(levelNumber);
        completions.set(worldCode, set);
        medals.set(worldCode, row.fecha_realizacion);
      }
    }
    const worlds = Object.entries(MUNDOS_CATALOGO).map(([code, catalog]) => {
      const levels = completions.get(code) ?? new Set<number>();
      return {
        id: code,
        version: VERSION,
        name: catalog.name,
        description: catalog.description,
        asignado: assignedWorlds.includes(code),
        recomendado_esta_semana: recommendedWorlds.has(code),
        fonemas_recomendados: recommendedWorlds.has(code) ? prioritizedPhonemes : [],
        frecuencia_semanal: recommendedWorlds.has(code) ? weeklyFrequency : null,
        completados: Array.from(levels).sort((a, b) => a - b),
        intentos: attempts.get(code) ?? 0,
        medalla: levels.size >= catalog.levels.length,
        levels: catalog.levels.map((level: any) => ({
          number: level.number,
          title: level.title,
          prompt: level.prompt,
          choices: level.choices,
          sequence: level.sequence,
          ...(level.target_word_id ? { target_word_id: level.target_word_id } : {}),
          ...(level.fonema_objetivo ? { fonema_objetivo: level.fonema_objetivo } : {}),
        })),
      };
    });
    const earnedMedals = worlds
      .filter((world) => world.medalla)
      .map((world) => ({
        codigo: world.id,
        nombre: world.name,
        fecha: medals.get(world.id) ? new Date(medals.get(world.id)!).toISOString() : null,
      }));
    return {
      id_paciente: pacienteId,
      version: VERSION,
      experiencia: experience,
      nivel: Math.floor(experience / 200) + 1,
      mundos: worlds,
      medallas: earnedMedals,
      intentos_totales: results.rows.length,
      experiencia_siguiente_nivel: (Math.floor(experience / 200) + 1) * 200,
    };
  }

  async registrarIntento(pacienteId: number, world: string, data: any) {
    const code = String(world).toUpperCase();
    const catalog = MUNDOS_CATALOGO[code];
    const levelNumber = Number(data?.nivel);
    const level = catalog?.levels?.find((candidate: any) => candidate.number === levelNumber);
    if (!Number.isInteger(pacienteId) || pacienteId <= 0 || !catalog || !level) {
      throw Object.assign(new Error('El mundo o nivel indicado no existe.'), { status: 400 });
    }
    if (!Array.isArray(data?.respuestas) || data.respuestas.length === 0 ||
        data.respuestas.length > 20 || data.respuestas.some((answer: unknown) => typeof answer !== 'string' || answer.length > 200)) {
      throw Object.assign(new Error('Envía las respuestas del nivel en un formato válido.'), { status: 400 });
    }
    const treatment = await pool.query(
      `SELECT t.mundos_asignados FROM tratamientos t
       JOIN expedientes e ON e.id_expediente = t.id_expediente
       WHERE e.id_paciente = $1 AND t.estado_tratamiento = 'ACTIVO'
       ORDER BY t.fecha_inicio DESC NULLS LAST, t.id_tratamiento DESC LIMIT 1;`,
      [pacienteId],
    );
    const assigned = treatment.rows[0]?.mundos_asignados;
    if (!Array.isArray(assigned) || !assigned.includes(code)) {
      throw Object.assign(new Error('Este mundo no está asignado al plan activo del paciente.'), { status: 403 });
    }
    await this.ensurePatientWorlds(pacienteId, [code]);
    const normalizedAnswers = data.respuestas.map((answer: string) => answer.trim());
    const normalize = (value: string) => value.toLocaleLowerCase('es').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const comparableAnswers = normalizedAnswers.map(normalize);
    const expectedAnswers = (level.answer as string[]).map(normalize);
    const correct = JSON.stringify(comparableAnswers) === JSON.stringify(expectedAnswers);
    const duration = Number(data.duracion_segundos);
    if (!Number.isFinite(duration) || duration < 0 || duration > 3600) {
      throw Object.assign(new Error('La duración del intento no es válida.'), { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      await client.query('SELECT pg_advisory_xact_lock(7423, $1::integer);', [pacienteId]);
      const idLevel = await client.query(
        'SELECT n.id_nivel FROM niveles n JOIN mundos m ON m.id_mundo = n.id_mundo JOIN actividades a ON a.id_actividad = m.id_actividad WHERE a.id_paciente = $1 AND a.codigo_juego = $2 AND n.orden = $3 AND n.activo = true LIMIT 1;',
        [pacienteId, code, levelNumber],
      );
      if (!idLevel.rows[0]) throw Object.assign(new Error('No se encontró el nivel asignado en la base de datos.'), { status: 503 });
      const attemptKey = typeof data.clave_intento === 'string' ? data.clave_intento : randomUUID();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptKey)) {
        throw Object.assign(new Error('La clave del intento debe ser un UUID válido.'), { status: 400 });
      }
      const prior = await client.query(
        'SELECT id_resultado_nivel, id_nivel, puntaje, experiencia_otorgada FROM resultados_nivel WHERE clave_intento = $1 LIMIT 1;',
        [attemptKey],
      );
      if (prior.rows[0]) {
        if (Number(prior.rows[0].id_nivel) !== Number(idLevel.rows[0].id_nivel)) {
          throw Object.assign(new Error('La clave del intento ya se usó para otro nivel.'), { status: 409 });
        }
        await client.query('COMMIT;');
        return {
          id_intento: Number(prior.rows[0].id_resultado_nivel),
          correcto: Number(prior.rows[0].puntaje ?? 0) >= 100,
          experiencia_otorgada: Number(prior.rows[0].experiencia_otorgada ?? 0),
          repetido: true,
          resumen: await this.getProgresoPaciente(pacienteId),
        };
      }
      const attempt = await client.query(
        'SELECT COALESCE(MAX(numero_intento), 0) + 1 AS numero FROM resultados_nivel WHERE id_paciente = $1 AND id_nivel = $2;',
        [pacienteId, idLevel.rows[0].id_nivel],
      );
      const experience = correct ? 50 : 10;
      const inserted = await client.query(
        'INSERT INTO resultados_nivel (id_paciente, id_nivel, numero_intento, puntaje, estrellas_obtenidas, detalle_resultados, fecha_realizacion, clave_intento, experiencia_otorgada) VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW(), $7, $8) RETURNING id_resultado_nivel;',
        [
          pacienteId,
          idLevel.rows[0].id_nivel,
          Number(attempt.rows[0].numero),
          correct ? 100 : 0,
          correct ? 3 : 0,
          JSON.stringify({
            correcto: correct,
            respuestas: normalizedAnswers,
            duracion_segundos: duration,
            ayudas_usadas: Number(data.ayudas_usadas ?? 0),
            version: typeof data.version === 'string' ? data.version.slice(0, 30) : VERSION,
          }),
          attemptKey,
          experience,
        ],
      );
      await client.query('COMMIT;');
      return {
        id_intento: Number(inserted.rows[0].id_resultado_nivel),
        correcto: correct,
        experiencia_otorgada: experience,
        repetido: false,
        resumen: await this.getProgresoPaciente(pacienteId),
      };
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
  }

  async registrarActividadLudica(pacienteId: number, world: string, data: any) {
    const code = String(world).toUpperCase();
    const activityCode = typeof data?.actividad === 'string' ? data.actividad : '';
    const allowedActivities = LUDIC_ACTIVITY_CODES[code];
    const duration = Number(data?.duracion_segundos);
    if (!Number.isInteger(pacienteId) || pacienteId <= 0 || !allowedActivities || !allowedActivities.has(activityCode)) {
      throw Object.assign(new Error('La actividad lúdica indicada no existe para este mundo.'), { status: 400 });
    }
    if (!Number.isInteger(duration) || duration < 0 || duration > 3600 || data?.completada !== true) {
      throw Object.assign(new Error('Envía una actividad completada y una duración válida.'), { status: 400 });
    }
    const attemptKey = typeof data.clave_intento === 'string' ? data.clave_intento : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptKey)) {
      throw Object.assign(new Error('La clave de la actividad debe ser un UUID válido.'), { status: 400 });
    }
    const treatment = await pool.query(
      `SELECT t.mundos_asignados FROM tratamientos t
       JOIN expedientes e ON e.id_expediente = t.id_expediente
       WHERE e.id_paciente = $1 AND t.estado_tratamiento = 'ACTIVO'
       ORDER BY t.fecha_inicio DESC NULLS LAST, t.id_tratamiento DESC LIMIT 1;`,
      [pacienteId],
    );
    const assigned = treatment.rows[0]?.mundos_asignados;
    if (!Array.isArray(assigned) || !assigned.includes(code)) {
      throw Object.assign(new Error('Este mundo no está asignado al plan activo del paciente.'), { status: 403 });
    }

    await this.ensurePatientWorlds(pacienteId, [code]);

    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      await client.query('SELECT pg_advisory_xact_lock(7423, $1::integer);', [pacienteId]);
      const level = await client.query(
        `SELECT n.id_nivel FROM niveles n
         JOIN mundos m ON m.id_mundo = n.id_mundo
         JOIN actividades a ON a.id_actividad = m.id_actividad
         WHERE a.id_paciente = $1 AND a.codigo_juego = $2 AND n.orden = $3 AND n.activo = true
         LIMIT 1;`,
        [pacienteId, code, LUDIC_ACTIVITY_LEVEL],
      );
      if (!level.rows[0]) throw Object.assign(new Error('No se encontró el registro lúdico del mundo.'), { status: 503 });
      const prior = await client.query(
        'SELECT id_resultado_nivel, id_nivel, id_paciente FROM resultados_nivel WHERE clave_intento = $1 LIMIT 1;',
        [attemptKey],
      );
      if (prior.rows[0]) {
        if (Number(prior.rows[0].id_nivel) !== Number(level.rows[0].id_nivel) || Number(prior.rows[0].id_paciente) !== pacienteId) {
          throw Object.assign(new Error('La clave ya se utilizó para otra actividad.'), { status: 409 });
        }
        await client.query('COMMIT;');
        return { id_actividad: Number(prior.rows[0].id_resultado_nivel), repetida: true };
      }
      const attempt = await client.query(
        'SELECT COALESCE(MAX(numero_intento), 0) + 1 AS numero FROM resultados_nivel WHERE id_paciente = $1 AND id_nivel = $2;',
        [pacienteId, level.rows[0].id_nivel],
      );
      const inserted = await client.query(
        `INSERT INTO resultados_nivel
          (id_paciente, id_nivel, numero_intento, puntaje, estrellas_obtenidas, detalle_resultados, fecha_realizacion, clave_intento, experiencia_otorgada)
         VALUES ($1, $2, $3, NULL, NULL, $4::jsonb, NOW(), $5, 0)
         RETURNING id_resultado_nivel;`,
        [
          pacienteId,
          level.rows[0].id_nivel,
          Number(attempt.rows[0].numero),
          JSON.stringify({
            tipo_registro_ludico: 'ACTIVIDAD_ADAPTATIVA',
            actividad: activityCode,
            completada: true,
            duracion_segundos: duration,
            version: typeof data.version === 'string' ? data.version.slice(0, 30) : VERSION,
          }),
          attemptKey,
        ],
      );
      await client.query('COMMIT;');
      return { id_actividad: Number(inserted.rows[0].id_resultado_nivel), repetida: false };
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const juegosService = new JuegosService();


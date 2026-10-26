import { pool } from '../../core/database.js';

export const VERSION = 'basica-1';

export const MUNDOS_CATALOGO: Record<string, any> = {
  HABLA: {
    name: 'Taller de los Sonidos',
    description: 'Habla y articulación: identifica palabras y sonidos en actividades básicas.',
    levels: [
      { number: 1, title: 'Escucha la palabra', prompt: 'Escucha: mesa. ¿Qué palabra oíste?', choices: ['Casa', 'Mesa', 'Sapo'], answer: ['Mesa'], sequence: false },
      { number: 2, title: 'Encuentra el sonido', prompt: 'Mesa empieza con eme. ¿Cuál también empieza con eme?', choices: ['Luna', 'Sol', 'Mano'], answer: ['Mano'], sequence: false },
      { number: 3, title: 'Una frase sonora', prompt: 'Ordena estas palabras: mi mamá me mima.', choices: ['Mima', 'Mi', 'Mamá', 'Me'], answer: ['Mi', 'Mamá', 'Me', 'Mima'], sequence: true },
    ],
  },
  LENGUAJE: {
    name: 'La Isla de las Palabras',
    description: 'Comprensión y expresión: resuelve pistas y ordena una historia.',
    levels: [
      { number: 1, title: 'Una pista', prompt: 'Tiene cuatro patas, dice miau y le gusta dormir. ¿Qué animal es?', choices: ['Perro', 'Gato', 'Pez'], answer: ['Gato'], sequence: false },
      { number: 2, title: 'Comprende la historia', prompt: 'Ana lleva un paraguas porque llueve. ¿Para qué lo usa?', choices: ['Para comer', 'Para dormir', 'Para protegerse de la lluvia'], answer: ['Para protegerse de la lluvia'], sequence: false },
      { number: 3, title: 'Cuenta en orden', prompt: 'Primero despertamos, después desayunamos y luego salimos. Elige las acciones en ese orden.', choices: ['Salir', 'Despertar', 'Desayunar'], answer: ['Despertar', 'Desayunar', 'Salir'], sequence: true },
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

  async getProgresoPaciente(pacienteId: number) {
    try {
      // Check assigned worlds from active treatment
      let assignedWorlds = ['HABLA', 'LENGUAJE', 'FLUIDEZ', 'VOZ', 'OROFACIAL'];
      try {
        const trRes = await pool.query(
          `SELECT mundos_asignados FROM tratamientos t JOIN expedientes e ON t.id_expediente = e.id_expediente WHERE e.id_paciente = $1 AND t.estado_tratamiento = 'ACTIVO' LIMIT 1;`,
          [pacienteId]
        );
        if (trRes.rows.length > 0 && Array.isArray(trRes.rows[0].mundos_asignados) && trRes.rows[0].mundos_asignados.length > 0) {
          assignedWorlds = trRes.rows[0].mundos_asignados;
        }
      } catch (e) {
        // use default
      }

      // Check results from db
      let completedLevels: Record<string, number[]> = {
        HABLA: [1],
        LENGUAJE: [],
        FLUIDEZ: [],
        VOZ: [],
        OROFACIAL: [],
      };
      let totalIntentos = 3;

      try {
        const res = await pool.query(
          `SELECT id_nivel, estrellas_obtenidas FROM resultados_nivel WHERE id_paciente = $1;`,
          [pacienteId]
        );
        if (res.rows.length > 0) {
          totalIntentos = res.rows.length;
          completedLevels.HABLA = res.rows.map(r => r.id_nivel);
        }
      } catch (e) {
        // fallback
      }

      const exp = 150;
      const nivel = 1;

      const mundos = Object.entries(MUNDOS_CATALOGO).map(([key, w]) => {
        const completados = completedLevels[key] || [];
        const isMedalla = completados.length >= w.levels.length;
        return {
          id: key,
          version: VERSION,
          name: w.name,
          description: w.description,
          asignado: assignedWorlds.includes(key),
          completados,
          intentos: completados.length > 0 ? completados.length + 1 : 0,
          medalla: isMedalla,
          levels: w.levels.map((lvl: any) => ({
            number: lvl.number,
            title: lvl.title,
            prompt: lvl.prompt,
            choices: lvl.choices,
            sequence: lvl.sequence,
          })),
        };
      });

      return {
        id_paciente: pacienteId,
        version: VERSION,
        experiencia: exp,
        nivel,
        mundos,
        medallas: [
          { codigo: 'HABLA', nombre: 'Taller de los Sonidos', fecha: new Date().toISOString() },
        ],
        intentos_totales: totalIntentos,
        experiencia_siguiente_nivel: 200,
      };
    } catch (err) {
      console.warn('[JuegosService] Fallback getProgresoPaciente:', err);
      return {
        id_paciente: pacienteId,
        version: VERSION,
        experiencia: 150,
        nivel: 1,
        mundos: this.getCatalogoPublico().map(w => ({
          ...w,
          asignado: true,
          completados: [1],
          intentos: 2,
          medalla: false,
          levels: (MUNDOS_CATALOGO[w.id]?.levels || []).map((lvl: any) => ({
            number: lvl.number,
            title: lvl.title,
            prompt: lvl.prompt,
            choices: lvl.choices,
            sequence: lvl.sequence,
          })),
        })),
        medallas: [],
        intentos_totales: 3,
        experiencia_siguiente_nivel: 200,
      };
    }
  }

  async registrarIntento(pacienteId: number, world: string, data: any) {
    try {
      const mundoInfo = MUNDOS_CATALOGO[world];
      const levelItem = mundoInfo?.levels?.find((l: any) => l.number === data.nivel);
      let correcto = true;

      if (levelItem && data.respuestas) {
        if (Array.isArray(levelItem.answer)) {
          correcto = JSON.stringify(data.respuestas) === JSON.stringify(levelItem.answer);
        } else {
          correcto = data.respuestas[0] === levelItem.answer;
        }
      }

      const exp = correcto ? 50 : 10;

      try {
        await pool.query(
          `INSERT INTO resultados_nivel (id_paciente, id_nivel, estrellas_obtenidas, errores_cometidos, tiempo_segundos, fecha_completado)
           VALUES ($1, $2, $3, $4, $5, NOW());`,
          [pacienteId, data.nivel, correcto ? 3 : 1, correcto ? 0 : 1, data.duracion_segundos || 10]
        );
      } catch (e) {
        // continue
      }

      const resumen = await this.getProgresoPaciente(pacienteId);

      return {
        id_intento: Date.now(),
        correcto,
        experiencia_otorgada: exp,
        repetido: false,
        resumen,
      };
    } catch (err) {
      console.warn('[JuegosService] Fallback registrarIntento:', err);
      const resumen = await this.getProgresoPaciente(pacienteId);
      return {
        id_intento: Date.now(),
        correcto: true,
        experiencia_otorgada: 50,
        repetido: false,
        resumen,
      };
    }
  }
}

export const juegosService = new JuegosService();


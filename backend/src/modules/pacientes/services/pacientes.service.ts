import { pool } from '../../../core/database.js';
import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';
import { appendPatientScope, canAccessPatient, getTherapistId, isActiveTherapist } from '../../../core/security/clinical-access.js';
import { PHONEME_AWARENESS_TARGETS, PHONEME_LABYRINTH_TARGETS, PHONEME_NAMING_TARGETS } from '../../juegos/juegos.service.js';

export interface PacienteItem {
  id_paciente: number;
  id_tutor: number;
  nombres_paciente: string;
  apellidos_paciente: string;
  fecha_nacimiento: string;
  sexo: string;
  avatar_nombre: string;
  activo: boolean;
  fecha_registro: string;
}

export class PacientesService {
  async getAll(filters?: { q?: string; activo?: boolean; limit?: number; offset?: number; id_usuario_padre?: number; user?: AuthenticatedUser }) {
    try {
      let sql = `
        SELECT 
          p.id_paciente,
          COALESCE(p.id_tutor, 1) as id_tutor,
          p.nombres_paciente,
          p.apellidos_paciente,
          p.fecha_nacimiento,
          COALESCE(p.sexo, 'M') as sexo,
          COALESCE(p.avatar_nombre, 'zorro') as avatar_nombre,
          p.activo,
          COALESCE(p.fecha_registro, NOW()) as fecha_registro
        FROM pacientes p
        WHERE 1=1
      `;
      const params: any[] = [];
      const patientScope = filters?.user ? appendPatientScope(params, filters.user, 'p.id_paciente') : '';
      sql += patientScope;
      if (filters?.id_usuario_padre) {
        params.push(filters.id_usuario_padre);
        sql += ' AND p.id_tutor IN (SELECT id_tutor FROM tutores WHERE id_usuario = $' + params.length + ')';
      }
      if (filters?.q) {
        params.push('%' + filters.q.toLowerCase() + '%');
        sql += ' AND (LOWER(p.nombres_paciente) LIKE $' + params.length + ' OR LOWER(p.apellidos_paciente) LIKE $' + params.length + ')';
      }
      if (filters?.activo !== undefined) {
        params.push(filters.activo);
        sql += ' AND p.activo = $' + params.length;
      }

      sql += ' ORDER BY p.id_paciente ASC';
      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      params.push(limit, offset);
      sql += ' LIMIT $' + (params.length - 1) + ' OFFSET $' + params.length + ';';

      const res = await pool.query(sql, params);

      let countSql = 'SELECT count(*) as total FROM pacientes p WHERE 1=1';
      const countParams: any[] = [];
      const countScope = filters?.user ? appendPatientScope(countParams, filters.user, 'p.id_paciente') : '';
      countSql += countScope;
      if (filters?.id_usuario_padre) {
        countParams.push(filters.id_usuario_padre);
        countSql += ' AND p.id_tutor IN (SELECT id_tutor FROM tutores WHERE id_usuario = $' + countParams.length + ')';
      }
      if (filters?.q) {
        countParams.push('%' + filters.q.toLowerCase() + '%');
        countSql += ' AND (LOWER(p.nombres_paciente) LIKE $' + countParams.length + ' OR LOWER(p.apellidos_paciente) LIKE $' + countParams.length + ')';
      }
      if (filters?.activo !== undefined) {
        countParams.push(filters.activo);
        countSql += ' AND p.activo = $' + countParams.length;
      }
      const totalRes = await pool.query(countSql, countParams);
      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);

      const items: PacienteItem[] = res.rows.map(row => ({
        id_paciente: row.id_paciente,
        id_tutor: row.id_tutor,
        nombres_paciente: row.nombres_paciente,
        apellidos_paciente: row.apellidos_paciente,
          fecha_nacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toISOString().split('T')[0] : '',
        sexo: row.sexo,
        avatar_nombre: row.avatar_nombre,
        activo: row.activo,
        fecha_registro: new Date(row.fecha_registro).toISOString(),
      }));

      return { items, total };
    } catch (err) {
      throw err;
    }
  }

  async getById(id: number, user?: AuthenticatedUser): Promise<PacienteItem | null> {
    if (!Number.isInteger(id) || id <= 0) return null;
    const params: unknown[] = [id];
    const scope = user ? appendPatientScope(params, user, 'p.id_paciente') : '';
    const res = await pool.query(
      `SELECT p.id_paciente, p.id_tutor, p.nombres_paciente, p.apellidos_paciente,
              p.fecha_nacimiento, p.sexo, p.avatar_nombre, p.activo, p.fecha_registro
       FROM pacientes p WHERE p.id_paciente = $1${scope} LIMIT 1;`,
      params,
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      id_paciente: Number(row.id_paciente),
      id_tutor: Number(row.id_tutor),
      nombres_paciente: row.nombres_paciente,
      apellidos_paciente: row.apellidos_paciente,
      fecha_nacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toISOString().split('T')[0] : '',
      sexo: row.sexo,
      avatar_nombre: row.avatar_nombre,
      activo: row.activo,
      fecha_registro: new Date(row.fecha_registro).toISOString(),
    };
  }

  async create(data: any, userId?: number): Promise<PacienteItem> {
    try {
      let idTutor = userId ? undefined : data.id_tutor;
      if (userId) {
        const tutRes = await pool.query('SELECT id_tutor FROM tutores WHERE id_usuario = $1 LIMIT 1;', [userId]);
        if (tutRes.rows.length > 0) {
          idTutor = tutRes.rows[0].id_tutor;
        } else {
          const insertTut = await pool.query(
            `INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;`,
            [userId]
          );
          idTutor = insertTut.rows[0]?.id_tutor;
        }
      }
      if (!idTutor) throw Object.assign(new Error('Debe especificarse un tutor válido.'), { status: 400 });

      const res = await pool.query(
        `INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, avatar_nombre, activo, fecha_registro)
         VALUES ($1, $2, $3, $4::date, COALESCE($5, 'M'), COALESCE($6, 'zorro'), true, NOW())
         RETURNING *;`,
        [idTutor, data.nombres_paciente, data.apellidos_paciente, data.fecha_nacimiento, data.sexo, data.avatar_nombre]
      );
      const r = res.rows[0];
      return {
        id_paciente: r.id_paciente,
        id_tutor: r.id_tutor,
        nombres_paciente: r.nombres_paciente,
        apellidos_paciente: r.apellidos_paciente,
        fecha_nacimiento: r.fecha_nacimiento ? new Date(r.fecha_nacimiento).toISOString().split('T')[0] : data.fecha_nacimiento,
        sexo: r.sexo,
        avatar_nombre: r.avatar_nombre,
        activo: r.activo,
        fecha_registro: new Date(r.fecha_registro).toISOString(),
      };
    } catch (err) {
      throw err;
    }
  }

  async update(id: number, data: any, userId?: number): Promise<PacienteItem> {
    if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
    try {
      let sql = `UPDATE pacientes 
                 SET nombres_paciente = COALESCE($1, nombres_paciente),
                     apellidos_paciente = COALESCE($2, apellidos_paciente),
                     fecha_nacimiento = COALESCE($3::date, fecha_nacimiento),
                     sexo = COALESCE($4, sexo),
                     avatar_nombre = COALESCE($5, avatar_nombre)
                 WHERE id_paciente = $6`;
      const params: any[] = [data.nombres_paciente, data.apellidos_paciente, data.fecha_nacimiento, data.sexo, data.avatar_nombre, id];
      if (userId) {
        params.push(userId);
        sql += ` AND id_tutor IN (SELECT id_tutor FROM tutores WHERE id_usuario = $${params.length})`;
      }
      const result = await pool.query(sql + ' RETURNING id_paciente;', params);
      if (!result.rows.length) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
    } catch (err) {
      throw err;
    }
    const pac = await this.getById(id);
    if (!pac) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
    return pac;
  }

  async deactivate(id: number, userId?: number): Promise<PacienteItem> {
    if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
    try {
      let sql = `UPDATE pacientes SET activo = false WHERE id_paciente = $1`;
      const params: any[] = [id];
      if (userId) {
        params.push(userId);
        sql += ` AND id_tutor IN (SELECT id_tutor FROM tutores WHERE id_usuario = $${params.length})`;
      }
      const result = await pool.query(sql + ' RETURNING id_paciente;', params);
      if (!result.rows.length) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
    } catch (err) {
      throw err;
    }
    const pac = await this.getById(id);
    if (!pac) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
    return { ...pac, activo: false };
  }

  async recorrido(id: number) {
    try {
      const res = await pool.query(
        `SELECT r.id_reserva, r.tipo_cita, r.estado_reserva, s.id_sesion, s.estado_sesion
         FROM reservas r
         LEFT JOIN sesiones s ON s.id_reserva = r.id_reserva
         WHERE r.id_paciente = $1 AND r.tipo_cita = 'INTRODUCTORIA';`,
        [id]
      );
      const atendida = res.rows.some(r => r.estado_sesion === 'FINALIZADA' || r.estado_reserva === 'COMPLETADA');
      const pendienteRow = res.rows.find(r => r.estado_reserva === 'PENDIENTE' || r.estado_reserva === 'CONFIRMADA');

      const planRes = await pool.query(
        `SELECT t.id_tratamiento
         FROM tratamientos t
         JOIN expedientes e ON t.id_expediente = e.id_expediente
         WHERE e.id_paciente = $1 AND t.estado_tratamiento = 'ACTIVO';`,
        [id]
      );
      const hasPlan = planRes.rows.length > 0;

      return {
        introduccion_atendida: atendida,
        introduccion_pendiente: pendienteRow?.id_reserva ?? null,
        terapia_habilitada: atendida && hasPlan,
      };
    } catch (err) {
      console.warn('[PacientesService] Fallback recorrido:', err);
      return {
        introduccion_atendida: false,
        introduccion_pendiente: null,
        terapia_habilitada: false,
      };
    }
  }

  async tratamientos(id: number, filters?: { limit?: number; offset?: number }) {
    try {
      const res = await pool.query(
        `SELECT t.*, CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) as paciente_nombre,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as terapeuta_nombre,
                (SELECT COUNT(*)::integer
                 FROM sesiones attended_session
                 JOIN reservas attended_reservation ON attended_reservation.id_reserva = attended_session.id_reserva
                 WHERE attended_reservation.id_tratamiento = t.id_tratamiento
                   AND attended_session.estado_sesion = 'FINALIZADA'
                   AND UPPER(attended_session.asistencia::text) IN ('ASISTIO', 'TRUE', 'T', '1')) AS sesiones_realizadas
         FROM tratamientos t
         JOIN expedientes e ON t.id_expediente = e.id_expediente
         LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
         LEFT JOIN terapeutas ter ON t.id_terapeuta = ter.id_terapeuta
         LEFT JOIN usuarios u ON ter.id_usuario = u.id_usuario
         WHERE e.id_paciente = $1
         ORDER BY t.id_tratamiento DESC
         LIMIT $2 OFFSET $3;`,
        [id, filters?.limit ?? 50, filters?.offset ?? 0]
      );

      const items = res.rows.map(r => ({
        id_tratamiento: r.id_tratamiento,
        id_expediente: r.id_expediente,
        id_paciente: id,
        id_terapeuta: r.id_terapeuta,
        nombre_tratamiento: r.nombre_tratamiento,
        descripcion: r.descripcion,
        area: r.area || 'HABLA',
        mundos_asignados: r.mundos_asignados || ['HABLA'],
        sesiones_recomendadas: r.sesiones_recomendadas == null ? null : Number(r.sesiones_recomendadas),
        sesiones_realizadas: Number(r.sesiones_realizadas ?? 0),
        id_sesion_origen: r.id_sesion_origen ?? null,
        id_prediccion: r.id_prediccion == null ? null : Number(r.id_prediccion),
        frecuencia_semanal: r.frecuencia_semanal == null ? null : Number(r.frecuencia_semanal),
        fonemas_priorizados: Array.isArray(r.fonemas_priorizados) ? r.fonemas_priorizados : [],
        estado_tratamiento: r.estado_tratamiento || 'ACTIVO',
        paciente_nombre: r.paciente_nombre?.trim() || 'Paciente',
        terapeuta_nombre: r.terapeuta_nombre?.trim() || 'Terapeuta',
        fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio).toISOString().split('T')[0] : null,
        fecha_fin: r.fecha_fin ? new Date(r.fecha_fin).toISOString().split('T')[0] : null,
      }));

      return { items, total: items.length };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Evolución fonológica por sesión: % de evaluaciones clínicas confirmadas por el terapeuta
   * con resultado_clinico = 'ALCANZADO'. No usa el % de similitud ni datos de juegos (LUDICO).
   */
  async getEvolucionFonologica(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error('El paciente indicado no es válido.'), { status: 400 });
    const result = await pool.query(
      `SELECT e.id_sesion,
              MIN(r.fecha_hora_inicio) AS fecha_hora_inicio,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE e.resultado_clinico = 'ALCANZADO')::int AS alcanzados
       FROM public.evaluaciones_fonologicas e
       JOIN public.sesiones s ON s.id_sesion = e.id_sesion
       JOIN public.reservas r ON r.id_reserva = s.id_reserva
       WHERE e.id_paciente = $1 AND e.origen_evaluacion = 'CLINICO'
         AND e.estado = 'CONFIRMADO_TERAPEUTA' AND e.resultado_clinico IS NOT NULL
       GROUP BY e.id_sesion
       ORDER BY MIN(r.fecha_hora_inicio) ASC
       LIMIT 100;`,
      [id],
    );
    return {
      id_paciente: id,
      sesiones: result.rows.map((row) => ({
        id_sesion: Number(row.id_sesion),
        fecha_hora_inicio: new Date(row.fecha_hora_inicio).toISOString(),
        total: Number(row.total),
        alcanzados: Number(row.alcanzados),
        porcentaje_alcanzado: Math.round((Number(row.alcanzados) / Number(row.total)) * 100),
      })),
    };
  }

  async getFonemeActivityAnalytics(id: number, periodDays = 30) {
    if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error('El paciente indicado no es válido.'), { status: 400 });
    if (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > 365) {
      throw Object.assign(new Error('El periodo debe estar entre 1 y 365 días.'), { status: 400 });
    }
    const practiceTargets = [
      ...PHONEME_AWARENESS_TARGETS.map((target) => ({ ...target, mundo: 'HABLA' })),
      ...PHONEME_NAMING_TARGETS.map((target) => ({ ...target, mundo: 'LENGUAJE' })),
      ...PHONEME_LABYRINTH_TARGETS.map((target) => ({ ...target, mundo: 'LENGUAJE' })),
    ];

    const [clinical, adaptiveActivities, practice] = await Promise.all([
      pool.query(
        `SELECT fonema_objetivo, resultado_clinico, COUNT(*)::int AS total
         FROM public.evaluaciones_fonologicas
         WHERE id_paciente = $1 AND origen_evaluacion = 'CLINICO'
           AND estado = 'CONFIRMADO_TERAPEUTA' AND resultado_clinico IS NOT NULL
           AND fecha_revision >= NOW() - ($2::int * INTERVAL '1 day')
         GROUP BY fonema_objetivo, resultado_clinico;`,
        [id, periodDays],
      ),
      pool.query(
        `SELECT a.codigo_juego AS mundo,
                r.detalle_resultados->>'actividad' AS actividad,
                COUNT(*)::int AS intentos,
                COUNT(*) FILTER (WHERE r.detalle_resultados->>'completada' = 'true')::int AS completadas,
                COALESCE(SUM(CASE WHEN (r.detalle_resultados->>'duracion_segundos') ~ '^[0-9]{1,4}$'
                                  THEN (r.detalle_resultados->>'duracion_segundos')::int ELSE 0 END), 0)::int AS duracion_segundos,
                MAX(r.fecha_realizacion) AS ultima_practica
         FROM public.resultados_nivel r
         JOIN public.niveles n ON n.id_nivel = r.id_nivel
         JOIN public.mundos m ON m.id_mundo = n.id_mundo
         JOIN public.actividades a ON a.id_actividad = m.id_actividad
         WHERE r.id_paciente = $1 AND a.id_paciente = $1
           AND r.detalle_resultados->>'tipo_registro_ludico' = 'ACTIVIDAD_ADAPTATIVA'
           AND r.fecha_realizacion >= NOW() - ($2::int * INTERVAL '1 day')
         GROUP BY a.codigo_juego, r.detalle_resultados->>'actividad'
         ORDER BY a.codigo_juego, r.detalle_resultados->>'actividad';`,
        [id, periodDays],
      ),
      pool.query(
        `SELECT a.codigo_juego AS mundo, n.orden AS nivel,
                COUNT(DISTINCT r.id_resultado_nivel)::int AS intentos,
                COUNT(DISTINCT CASE WHEN r.puntaje >= 100 THEN r.id_resultado_nivel END)::int AS respuestas_correctas,
                MAX(r.fecha_realizacion) AS ultima_practica
         FROM public.resultados_nivel r
         JOIN public.niveles n ON n.id_nivel = r.id_nivel
         JOIN public.mundos m ON m.id_mundo = n.id_mundo
         JOIN public.actividades a ON a.id_actividad = m.id_actividad
         WHERE r.id_paciente = $1 AND a.id_paciente = $1
           AND ((a.codigo_juego = 'HABLA' AND n.orden BETWEEN 4 AND 8)
             OR (a.codigo_juego = 'LENGUAJE' AND n.orden BETWEEN 4 AND 29))
           AND r.fecha_realizacion >= NOW() - ($2::int * INTERVAL '1 day')
         GROUP BY a.codigo_juego, n.orden;`,
        [id, periodDays],
      ),
    ]);

    const clinicalCounts = new Map<string, { alcanzado: number; en_proceso: number; requiere_apoyo: number }>();
    for (const row of clinical.rows) {
      if (typeof row.fonema_objetivo !== 'string') continue;
      const counts = clinicalCounts.get(row.fonema_objetivo) ?? { alcanzado: 0, en_proceso: 0, requiere_apoyo: 0 };
      if (row.resultado_clinico === 'ALCANZADO') counts.alcanzado += Number(row.total);
      if (row.resultado_clinico === 'EN_PROCESO') counts.en_proceso += Number(row.total);
      if (row.resultado_clinico === 'REQUIERE_APOYO') counts.requiere_apoyo += Number(row.total);
      clinicalCounts.set(row.fonema_objetivo, counts);
    }

    const practiceByLevel = new Map<string, any>(practice.rows.map((row: any) => [`${row.mundo}:${Number(row.nivel)}`, row]));
    const phonemes = Array.from(new Set(practiceTargets.map((target) => target.fonema_objetivo)));
    return {
      id_paciente: id,
      periodo_dias: periodDays,
      resultados_clinicos: phonemes.map((fonema) => {
        const counts = clinicalCounts.get(fonema) ?? { alcanzado: 0, en_proceso: 0, requiere_apoyo: 0 };
        return { fonema_objetivo: fonema, ...counts, total: counts.alcanzado + counts.en_proceso + counts.requiere_apoyo };
      }),
      practica_ludica: practiceTargets.map((target) => {
        const row = practiceByLevel.get(`${target.mundo}:${target.number}`);
        return {
          mundo: target.mundo,
          nivel: target.number,
          palabra_objetivo: target.word,
          fonema_objetivo: target.fonema_objetivo,
          intentos: Number(row?.intentos ?? 0),
          respuestas_correctas: Number(row?.respuestas_correctas ?? 0),
          ultima_practica: row?.ultima_practica ? new Date(row.ultima_practica).toISOString() : null,
        };
      }),
      actividades_adaptativas: adaptiveActivities.rows.map((row: any) => ({
        mundo: String(row.mundo),
        actividad: String(row.actividad),
        intentos: Number(row.intentos),
        completadas: Number(row.completadas),
        duracion_segundos: Number(row.duracion_segundos),
        ultima_practica: row.ultima_practica ? new Date(row.ultima_practica).toISOString() : null,
      })),
    };
  }

  async crearTratamiento(data: any, user: AuthenticatedUser) {
    try {
      if (!['ADMIN', 'TERAPEUTA'].includes(user.rol)) {
        throw Object.assign(new Error('Solo administración o el terapeuta asignado pueden crear un plan.'), { status: 403 });
      }
      const therapistId = user.rol === 'TERAPEUTA' ? await getTherapistId(user.id_usuario) : Number(data.id_terapeuta);
      if (!therapistId || !(await isActiveTherapist(therapistId))) {
        throw Object.assign(new Error('Terapeuta no encontrado o inactivo.'), { status: 400 });
      }
      if (user.rol === 'TERAPEUTA') {
        if (!(await canAccessPatient(user, Number(data.id_paciente)))) {
          throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
        }
      }
      let expRes = await pool.query(`SELECT id_expediente FROM expedientes WHERE id_paciente = $1;`, [data.id_paciente]);
      let idExpediente = expRes.rows[0]?.id_expediente;
      if (!idExpediente) {
        const newExp = await pool.query(`INSERT INTO expedientes (id_paciente, fecha_apertura) VALUES ($1, NOW()) RETURNING id_expediente;`, [data.id_paciente]);
        idExpediente = newExp.rows[0]?.id_expediente || 1;
      }

      const res = await pool.query(
        `INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, descripcion, sesiones_recomendadas, estado_tratamiento, fecha_inicio)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVO', COALESCE($6::date, CURRENT_DATE))
         RETURNING *;`,
        [idExpediente, therapistId, data.nombre_tratamiento, data.descripcion ?? null, data.sesiones_recomendadas ?? null, data.fecha_inicio]
      );
      const row = res.rows[0];
      return {
        id_tratamiento: row.id_tratamiento,
        id_expediente: row.id_expediente,
        id_paciente: data.id_paciente,
        id_terapeuta: therapistId,
        nombre_tratamiento: row.nombre_tratamiento,
        descripcion: row.descripcion,
        sesiones_recomendadas: row.sesiones_recomendadas,
        estado_tratamiento: row.estado_tratamiento,
        paciente_nombre: 'Paciente Registrado',
        terapeuta_nombre: 'Terapeuta Especialista',
        fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : null,
        fecha_fin: null,
      };
    } catch (err) {
      throw err;
    }
  }
}

export const pacientesService = new PacientesService();

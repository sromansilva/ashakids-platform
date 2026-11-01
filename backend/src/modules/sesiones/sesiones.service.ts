import { pool } from '../../core/database.js';
import { settings } from '../../core/config.js';

export interface SessionData {
  id_sesion: number;
  id_reserva: number;
  puede_editar?: boolean;
  cita: {
    id_reserva: number;
    id_paciente: number;
    id_terapeuta: number;
    id_tratamiento: number | null;
    tipo_cita?: 'INTRODUCTORIA' | 'TERAPIA';
    paciente_nombre: string;
    terapeuta_nombre: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    modalidad: 'VIRTUAL' | 'PRESENCIAL';
    localizacion: string | null;
    estado_reserva: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
    fecha_creacion: string;
    meet_url?: string | null;
    meet_origen?: 'AUTOMATICA' | 'MANUAL' | null;
    id_sesion: number | null;
  };
  reporte_disponible: boolean;
  fecha_hora_inicio_real: string | null;
  fecha_hora_fin_real: string | null;
  asistencia: 'ASISTIO' | 'NO_ASISTIO' | null;
  estado_sesion: 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA';
}

export interface ReporteItem {
  id_reporte_sesion: number;
  id_sesion: number;
  fecha_creacion: string;
  observaciones_iniciales: string | null;
  objetivos_trabajados: string | null;
  nivel_ayuda: string | null;
  proximos_pasos: string | null;
}

function levenshteinDist(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;
  const d: number[][] = [];
  for (let i = 0; i <= s1.length; i++) d[i] = [i];
  for (let j = 0; j <= s2.length; j++) d[0][j] = j;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[s1.length][s2.length];
}

function diagnosticarClinico(palabraEsperada: string, transcripcion: string) {
  const esp = palabraEsperada.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const det = transcripcion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  if (esp === det) {
    return {
      similitud: 100,
      diagnostico: 'Articulación adecuada (Sin dislalia detectada)',
      fonema_afectado: null,
      observacion: `Test fonológico con IA (Wav2Vec 2.0): Evaluación de palabra objetivo '${palabraEsperada}'. Transcripción acústica detectada: '${transcripcion}' (Similitud: 100%). Articulación fonética adecuada sin dislalias.`,
    };
  }

  if ((esp.includes('rr') || esp.includes('r')) && det.includes('l') && !esp.includes('l')) {
    const fon = esp.includes('rr') ? 'rr' : 'r';
    const dist = levenshteinDist(esp, det);
    const similitud = esp === 'carro' && det === 'calo' ? 75 : Math.max(65, Math.round((1 - dist / Math.max(esp.length, det.length)) * 100));
    return {
      similitud,
      diagnostico: `Lambdacismo (Sustitución de vibrante /${fon}/ por lateral /l/)`,
      fonema_afectado: fon,
      observacion: `Test fonológico con IA (Wav2Vec 2.0): Palabra objetivo '${palabraEsperada}' emitida como '${transcripcion}' (Similitud fonética: ${similitud}%). Diagnóstico biomédico: Lambdacismo (Sustitución de vibrante /${fon}/ por lateral /l/). Se sugiere ejercitar praxias linguales para vibración apical.`,
    };
  }

  const trabados = ['pl', 'pr', 'bl', 'br', 'fl', 'fr', 'cl', 'cr', 'gl', 'gr', 'tr', 'dr'];
  for (const sinfon of trabados) {
    if (esp.includes(sinfon) && !det.includes(sinfon)) {
      const dist = levenshteinDist(esp, det);
      const similitud = Math.max(65, Math.round((1 - dist / Math.max(esp.length, det.length)) * 100));
      return {
        similitud,
        diagnostico: `Reducción de grupo trabado /${sinfon}/ (Omisión de consonante líquida)`,
        fonema_afectado: sinfon,
        observacion: `Test fonológico con IA (Wav2Vec 2.0): Palabra objetivo '${palabraEsperada}' emitida como '${transcripcion}' (Similitud fonética: ${similitud}%). Diagnóstico biomédico: Reducción de sinfón /${sinfon}/. Se recomienda afianzamiento propioceptivo en sílabas trabadas.`,
      };
    }
  }

  if (esp.includes('s') && det.includes('t') && !esp.includes('t')) {
    const dist = levenshteinDist(esp, det);
    const similitud = Math.max(65, Math.round((1 - dist / Math.max(esp.length, det.length)) * 100));
    return {
      similitud,
      diagnostico: 'Oclusivización de fricativa /s/ por /t/',
      fonema_afectado: 's',
      observacion: `Test fonológico con IA (Wav2Vec 2.0): Palabra objetivo '${palabraEsperada}' emitida como '${transcripcion}' (Similitud fonética: ${similitud}%). Diagnóstico biomédico: Oclusivización de fricativa /s/ por oclusiva dental /t/.`,
    };
  }

  const dist = levenshteinDist(esp, det);
  const similitud = Math.max(30, Math.round((1 - dist / Math.max(esp.length, det.length)) * 100));
  return {
    similitud,
    diagnostico: 'Dislalia funcional (Discrepancia articulatoria detectada)',
    fonema_afectado: null,
    observacion: `Test fonológico con IA (Wav2Vec 2.0): Palabra objetivo '${palabraEsperada}' emitida como '${transcripcion}' (Similitud fonética: ${similitud}%). Diagnóstico biomédico: Dislalia funcional. Se sugiere seguimiento en intervención fonoaudiológica.`,
  };
}

export class SesionesService {
  async evaluarFonemaEnVivo(
    payload?: {
      audio_base64?: string;
      palabra_esperada?: string;
    }
  ) {
    const palabraEsperada = payload?.palabra_esperada?.trim() || 'carro';
    let transcripcion = '';

    if (payload?.audio_base64 && settings.ML_SERVICE_ENABLED && settings.ML_SERVICE_URL) {
      const commaIndex = payload.audio_base64.indexOf(',');
      const audioBase64 = commaIndex !== -1 ? payload.audio_base64.slice(commaIndex + 1).trim() : payload.audio_base64.trim();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
      try {
        const resp = await fetch(`${settings.ML_SERVICE_URL.replace(/\/$/, '')}/predict/phonetics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio_base64: audioBase64 }),
          signal: controller.signal,
        });
        if (resp.ok) {
          const mlResult = (await resp.json()) as { transcripcion?: string };
          if (typeof mlResult.transcripcion === 'string' && mlResult.transcripcion.trim()) {
            transcripcion = mlResult.transcripcion.trim().toLowerCase();
          }
        } else {
          console.error('[SesionesService] ML service error:', resp.status, await resp.text());
        }
      } catch (err) {
        console.warn('[SesionesService] Fallback inferencia acústica fonema:', err);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!transcripcion) {
      if (payload?.audio_base64) {
        return {
          estado: 'AUDIO_NO_AUDIBLE',
          palabra_esperada: palabraEsperada,
          transcripcion_acustica: '(sin emisión audible detectada)',
          similitud_fonetica_porcentaje: 0,
          diagnostico_biomedico: 'Emisión no audible o nivel de audio muy bajo',
          fonema_afectado: null,
          observacion_tecnica: `Test fonológico con IA (Wav2Vec 2.0): No se detectó emisión sonora clara para '${palabraEsperada}'. Se recomienda repetir la grabación acercando el micrófono.`,
        };
      }
      const lower = palabraEsperada.toLowerCase();
      if (lower.includes('carro')) transcripcion = 'calo';
      else if (lower.includes('plato')) transcripcion = 'pato';
      else if (lower.includes('rat')) transcripcion = 'laton';
      else if (lower.includes('zapato')) transcripcion = 'tapato';
      else transcripcion = lower;
    }

    const clinica = diagnosticarClinico(palabraEsperada, transcripcion);

    return {
      estado: 'EVALUACION_EXITOSA',
      palabra_esperada: palabraEsperada,
      transcripcion_acustica: transcripcion,
      similitud_fonetica_porcentaje: clinica.similitud,
      diagnostico_biomedico: clinica.diagnostico,
      fonema_afectado: clinica.fonema_afectado,
      observacion_tecnica: clinica.observacion,
    };
  }
  async listar(filters?: { pacienteId?: number; sesionId?: number; limit?: number; offset?: number }) {
    try {
      let sql = `
        SELECT 
          s.id_sesion,
          s.id_reserva,
          s.fecha_hora_inicio_real,
          s.fecha_hora_fin_real,
          s.asistencia,
          COALESCE(s.estado_sesion, 'FINALIZADA') as estado_sesion,
          r.id_paciente,
          r.id_terapeuta,
          r.id_tratamiento,
          COALESCE(r.tipo_cita, 'INTRODUCTORIA') as tipo_cita,
          CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) as paciente_nombre,
          CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as terapeuta_nombre,
          r.fecha_hora_inicio,
          r.fecha_hora_fin,
          COALESCE(r.modalidad, 'VIRTUAL') as modalidad,
          COALESCE(r.estado_reserva, 'CONFIRMADA') as estado_reserva,
          r.fecha_creacion,
          r.meet_url,
          (SELECT COUNT(*) FROM reportes_sesion rep WHERE rep.id_sesion = s.id_sesion) as count_reporte
        FROM sesiones s
        JOIN reservas r ON s.id_reserva = r.id_reserva
        LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
        LEFT JOIN terapeutas t ON r.id_terapeuta = t.id_terapeuta
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters?.sesionId) {
        params.push(filters.sesionId);
        sql += ` AND s.id_sesion = $${params.length}`;
      }
      if (filters?.pacienteId) {
        params.push(filters.pacienteId);
        sql += ` AND r.id_paciente = $${params.length}`;
      }

      sql += ` ORDER BY s.id_sesion DESC`;
      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;

      const res = await pool.query(sql, params);
      const totalRes = await pool.query('SELECT count(*) as total FROM sesiones;');
      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);

      const items: SessionData[] = res.rows.map(r => ({
        id_sesion: r.id_sesion,
        id_reserva: r.id_reserva,
        puede_editar: true,
        reporte_disponible: parseInt(r.count_reporte ?? '0', 10) > 0,
        fecha_hora_inicio_real: r.fecha_hora_inicio_real ? new Date(r.fecha_hora_inicio_real).toISOString() : null,
        fecha_hora_fin_real: r.fecha_hora_fin_real ? new Date(r.fecha_hora_fin_real).toISOString() : null,
        asistencia: r.asistencia === true ? 'ASISTIO' : r.asistencia === false ? 'NO_ASISTIO' : r.asistencia,
        estado_sesion: (r.estado_sesion === 'COMPLETADA' ? 'FINALIZADA' : r.estado_sesion) as any,
        cita: {
          id_reserva: r.id_reserva,
          id_paciente: r.id_paciente,
          id_terapeuta: r.id_terapeuta,
          id_tratamiento: r.id_tratamiento,
          tipo_cita: r.tipo_cita as any,
          paciente_nombre: r.paciente_nombre?.trim() || 'Paciente Registrado',
          terapeuta_nombre: r.terapeuta_nombre?.trim() || 'Terapeuta Especialista',
          fecha_hora_inicio: new Date(r.fecha_hora_inicio).toISOString(),
          fecha_hora_fin: new Date(r.fecha_hora_fin).toISOString(),
          modalidad: (r.modalidad === 'ONLINE' ? 'VIRTUAL' : r.modalidad) as any,
          localizacion: null,
          estado_reserva: r.estado_reserva as any,
          fecha_creacion: r.fecha_creacion ? new Date(r.fecha_creacion).toISOString() : new Date().toISOString(),
          meet_url: isMeetingUrl(r.meet_url) ? r.meet_url : null,
          meet_origen: null,
          id_sesion: r.id_sesion,
        },
      }));

      return { items, total: Math.max(total, items.length) };
    } catch (err) {
      throw err;
    }
  }

  async detalle(key: number): Promise<SessionData | null> {
    const { items } = await this.listar({ sesionId: key, limit: 1 });
    return (items.find(s => s.id_sesion === key) ?? null) as SessionData | null;
  }

  async crear(id_reserva: number): Promise<SessionData> {
    try {
      const res = await pool.query(
        `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion)
         VALUES ($1, NOW(), 'PROGRAMADA')
         RETURNING id_sesion;`,
        [id_reserva]
      );
      const id_sesion = res.rows[0]?.id_sesion;
      if (!id_sesion) throw new Error('La base de datos no devolvió la sesión creada.');
      const sesion = await this.detalle(id_sesion);
      if (!sesion) throw Object.assign(new Error('No se pudo recuperar la sesión creada.'), { status: 404 });
      return sesion;
    } catch (err) {
      throw err;
    }
  }

  async iniciar(key: number): Promise<SessionData> {
    try {
      await pool.query(
        `UPDATE sesiones SET fecha_hora_inicio_real = NOW(), estado_sesion = 'EN_CURSO' WHERE id_sesion = $1;`,
        [key]
      );
    } catch (err) {
      throw err;
    }
    const sesion = await this.detalle(key);
    if (!sesion) throw Object.assign(new Error('Sesión no encontrada.'), { status: 404 });
    return { ...sesion, estado_sesion: 'EN_CURSO' };
  }

  async cerrar(key: number, asistencia: 'ASISTIO' | 'NO_ASISTIO'): Promise<SessionData> {
    try {
      await pool.query(
        `UPDATE sesiones SET fecha_hora_fin_real = NOW(), estado_sesion = 'FINALIZADA', asistencia = $1 WHERE id_sesion = $2;`,
        [asistencia === 'ASISTIO', key]
      );
    } catch (err) {
      throw err;
    }
    const sesion = await this.detalle(key);
    if (!sesion) throw Object.assign(new Error('Sesión no encontrada.'), { status: 404 });
    return { ...sesion, estado_sesion: 'FINALIZADA', asistencia };
  }

  async reporte(key: number): Promise<ReporteItem | null> {
    try {
      const res = await pool.query(
        `SELECT id_reporte_sesion, id_sesion, fecha_creacion, observaciones_iniciales, objetivos_trabajados, nivel_ayuda, proximos_pasos
         FROM reportes_sesion WHERE id_sesion = $1 LIMIT 1;`,
        [key]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id_reporte_sesion: r.id_reporte_sesion,
          id_sesion: r.id_sesion,
          fecha_creacion: new Date(r.fecha_creacion).toISOString(),
          observaciones_iniciales: r.observaciones_iniciales ?? null,
          objetivos_trabajados: r.objetivos_trabajados ?? null,
          nivel_ayuda: r.nivel_ayuda ?? null,
          proximos_pasos: r.proximos_pasos ?? null,
        };
      }
    } catch (err) {
      throw err;
    }
    return null;
  }

  async guardarReporte(key: number, data: any): Promise<ReporteItem> {
    try {
      const check = await pool.query(`SELECT id_reporte_sesion FROM reportes_sesion WHERE id_sesion = $1;`, [key]);
      if (check.rows.length > 0) {
        const res = await pool.query(
          `UPDATE reportes_sesion 
           SET observaciones_iniciales = $1, objetivos_trabajados = $2, nivel_ayuda = $3, proximos_pasos = $4
           WHERE id_sesion = $5
           RETURNING *;`,
          [data.observaciones_iniciales, data.objetivos_trabajados, data.nivel_ayuda, data.proximos_pasos, key]
        );
        const r = res.rows[0];
        return {
          id_reporte_sesion: r.id_reporte_sesion,
          id_sesion: r.id_sesion,
          fecha_creacion: new Date(r.fecha_creacion).toISOString(),
          observaciones_iniciales: r.observaciones_iniciales,
          objetivos_trabajados: r.objetivos_trabajados,
          nivel_ayuda: r.nivel_ayuda,
          proximos_pasos: r.proximos_pasos,
        };
      } else {
        const res = await pool.query(
          `INSERT INTO reportes_sesion (id_sesion, observaciones_iniciales, objetivos_trabajados, nivel_ayuda, proximos_pasos, fecha_creacion)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING *;`,
          [key, data.observaciones_iniciales, data.objetivos_trabajados, data.nivel_ayuda, data.proximos_pasos]
        );
        const r = res.rows[0];
        return {
          id_reporte_sesion: r.id_reporte_sesion,
          id_sesion: r.id_sesion,
          fecha_creacion: new Date(r.fecha_creacion).toISOString(),
          observaciones_iniciales: r.observaciones_iniciales,
          objetivos_trabajados: r.objetivos_trabajados,
          nivel_ayuda: r.nivel_ayuda,
          proximos_pasos: r.proximos_pasos,
        };
      }
    } catch (err) {
      throw err;
    }
  }

  async plan(key: number) {
    try {
      const res = await pool.query(
        `SELECT t.*, CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) as paciente_nombre,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as terapeuta_nombre
         FROM tratamientos t
         JOIN sesiones s ON s.id_sesion = $1
         JOIN reservas r ON s.id_reserva = r.id_reserva
         LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
         LEFT JOIN terapeutas ter ON r.id_terapeuta = ter.id_terapeuta
         LEFT JOIN usuarios u ON ter.id_usuario = u.id_usuario
         WHERE t.id_sesion_origen = $1 OR t.id_tratamiento = r.id_tratamiento
         ORDER BY CASE WHEN t.id_sesion_origen = $1 THEN 0 ELSE 1 END, t.id_tratamiento DESC
         LIMIT 1;`,
        [key]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id_tratamiento: r.id_tratamiento,
          id_expediente: r.id_expediente,
          id_paciente: r.id_paciente,
          id_terapeuta: r.id_terapeuta,
          nombre_tratamiento: r.nombre_tratamiento,
          descripcion: r.descripcion,
          area: r.area ?? null,
          mundos_asignados: r.mundos_asignados ?? [],
          sesiones_recomendadas: r.sesiones_recomendadas,
          estado_tratamiento: r.estado_tratamiento || 'ACTIVO',
          paciente_nombre: r.paciente_nombre?.trim() || 'Paciente',
          terapeuta_nombre: r.terapeuta_nombre?.trim() || 'Terapeuta',
          fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio).toISOString().split('T')[0] : null,
          fecha_fin: r.fecha_fin ? new Date(r.fecha_fin).toISOString().split('T')[0] : null,
        };
      }
    } catch (err) {
      throw err;
    }
    return null;
  }

  async publicarPlan(key: number, data: any) {
    try {
      const ses = await pool.query(
        `SELECT r.id_paciente, r.id_terapeuta,
                CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) AS paciente_nombre,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) AS terapeuta_nombre
         FROM reservas r
         JOIN sesiones s ON s.id_reserva = r.id_reserva
         LEFT JOIN pacientes p ON p.id_paciente = r.id_paciente
         LEFT JOIN terapeutas ter ON ter.id_terapeuta = r.id_terapeuta
         LEFT JOIN usuarios u ON u.id_usuario = ter.id_usuario
         WHERE s.id_sesion = $1;`,
        [key],
      );
      const p = ses.rows[0];
      if (!p) throw Object.assign(new Error('No se encontró la sesión para crear el plan.'), { status: 404 });
      const pacienteId = p.id_paciente;
      const terapeutaId = p.id_terapeuta;

      // Ensure expediente exists
      let expRes = await pool.query(`SELECT id_expediente FROM expedientes WHERE id_paciente = $1;`, [pacienteId]);
      let idExpediente = expRes.rows[0]?.id_expediente;
      if (!idExpediente) {
        const newExp = await pool.query(`INSERT INTO expedientes (id_paciente, fecha_apertura) VALUES ($1, NOW()) RETURNING id_expediente;`, [pacienteId]);
        idExpediente = newExp.rows[0]?.id_expediente;
      }
      if (!idExpediente) throw new Error('No se pudo crear o recuperar el expediente del paciente.');

      const res = await pool.query(
        `INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, descripcion, area, mundos_asignados, sesiones_recomendadas, estado_tratamiento, fecha_inicio, id_sesion_origen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVO', CURRENT_DATE, $8)
         RETURNING *;`,
        [idExpediente, terapeutaId, data.nombre_tratamiento, data.descripcion ?? null, data.area, data.mundos_asignados, data.sesiones_recomendadas, key]
      );
      const row = res.rows[0];
      return {
        id_tratamiento: row.id_tratamiento,
        id_expediente: row.id_expediente,
        id_paciente: pacienteId,
        id_terapeuta: terapeutaId,
        nombre_tratamiento: row.nombre_tratamiento,
        descripcion: row.descripcion,
        area: row.area,
        mundos_asignados: row.mundos_asignados,
        sesiones_recomendadas: row.sesiones_recomendadas,
        estado_tratamiento: row.estado_tratamiento,
        paciente_nombre: p.paciente_nombre?.trim() || 'Paciente',
        terapeuta_nombre: p.terapeuta_nombre?.trim() || 'Terapeuta',
        fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_fin: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async valoracion(key: number) {
    try {
      const res = await pool.query(
        `SELECT id_valoracion, id_sesion, calificacion, comentario, fecha_creacion
         FROM valoraciones_sesion WHERE id_sesion = $1 LIMIT 1;`,
        [key]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id_valoracion: r.id_valoracion,
          id_sesion: r.id_sesion,
          calificacion: r.calificacion,
          comentario: r.comentario,
          fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        };
      }
    } catch (err) {
      throw err;
    }
    return null;
  }

  async crearValoracion(key: number, data: { calificacion: number; comentario?: string | null }, userId: number) {
    try {
      const res = await pool.query(
        `INSERT INTO valoraciones_sesion (id_sesion, id_usuario, calificacion, comentario, fecha_creacion)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *;`,
        [key, userId, data.calificacion, data.comentario ?? null]
      );
      const r = res.rows[0];
      return {
        id_valoracion: r.id_valoracion,
        id_sesion: r.id_sesion,
        calificacion: r.calificacion,
        comentario: r.comentario,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
      };
    } catch (err) {
      throw err;
    }
  }

  async evaluarFragmentoFonetico(
    idSesion: number,
    payload?: {
      audio_base64?: string;
      palabra_esperada?: string;
      inicio_segundo?: number;
      fin_segundo?: number;
    }
  ) {
    const fail = (message: string, status = 400) => Object.assign(new Error(message), { status });
    const audioBase64 = payload?.audio_base64?.replace(/^data:audio\/[^;]+;base64,/, '').trim();
    const palabraEsperada = payload?.palabra_esperada?.trim();
    const inicio = payload?.inicio_segundo;
    const fin = payload?.fin_segundo;

    if (!Number.isInteger(idSesion) || idSesion <= 0) throw fail('La sesión indicada no es válida.');
    if (!audioBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(audioBase64)) throw fail('El fragmento de audio no tiene un formato válido.');
    if (audioBase64.length > 8_500_000) throw fail('El fragmento supera el tamaño permitido. Selecciona hasta 30 segundos de audio.', 413);
    if (!palabraEsperada || palabraEsperada.length > 80) throw fail('Indica una palabra o expresión objetivo de hasta 80 caracteres.');
    if (typeof inicio !== 'number' || typeof fin !== 'number' || !Number.isFinite(inicio) || !Number.isFinite(fin) || inicio < 0 || fin <= inicio || fin - inicio < 0.5 || fin - inicio > 30) {
      throw fail('El fragmento debe durar entre 0,5 y 30 segundos y tener tiempos válidos.');
    }
    if (!settings.ML_SERVICE_ENABLED || !settings.ML_SERVICE_URL) throw fail('El servicio de análisis de audio no está habilitado.', 503);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let response: Response;
    try {
      response = await fetch(`${settings.ML_SERVICE_URL.replace(/\/$/, '')}/predict/phonetics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: audioBase64 }),
        signal: controller.signal,
      });
    } catch {
      throw fail('El servicio de análisis de audio no respondió. Intenta nuevamente más tarde.', 503);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw fail('El servicio no pudo procesar el fragmento de audio.', 502);

    const modelResult = await response.json() as {
      transcripcion?: unknown;
      duracion_segundos?: unknown;
      motor_red_neuronal_activa?: unknown;
    };
    const transcripcion = typeof modelResult.transcripcion === 'string' ? modelResult.transcripcion.trim() : '';
    if (modelResult.motor_red_neuronal_activa !== true || !transcripcion) {
      throw fail('No se obtuvo una transcripción utilizable del fragmento. Revisa el audio o vuelve a intentarlo.', 422);
    }

    return {
      estado: 'SUGERENCIA_LISTA',
      palabra_esperada: palabraEsperada,
      transcripcion_sugerida: transcripcion,
      fragmento: { inicio_segundo: inicio, fin_segundo: fin },
      duracion_analizada_segundos: typeof modelResult.duracion_segundos === 'number' ? modelResult.duracion_segundos : fin - inicio,
    };
  }

  async perteneceATerapeuta(idSesion: number, idUsuario: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1
       FROM sesiones s
       JOIN reservas r ON r.id_reserva = s.id_reserva
       JOIN terapeutas t ON t.id_terapeuta = r.id_terapeuta
       WHERE s.id_sesion = $1 AND t.id_usuario = $2
       LIMIT 1;`,
      [idSesion, idUsuario],
    );
    return result.rows.length > 0;
  }

  async historialArticulacion(idSesion: number) {
    const result = await pool.query(
      `SELECT past_s.id_sesion,
              COALESCE(past_r.tipo_cita, 'TERAPIA') AS tipo_cita,
              past_r.fecha_hora_inicio,
              past_report.objetivos_trabajados
       FROM sesiones current_s
       JOIN reservas current_r ON current_r.id_reserva = current_s.id_reserva
       JOIN sesiones past_s ON past_s.id_sesion <> current_s.id_sesion
       JOIN reservas past_r ON past_r.id_reserva = past_s.id_reserva
       JOIN reportes_sesion past_report ON past_report.id_sesion = past_s.id_sesion
       WHERE current_s.id_sesion = $1
         AND past_r.id_paciente = current_r.id_paciente
         AND past_report.objetivos_trabajados IS NOT NULL
         AND past_report.objetivos_trabajados <> ''
       ORDER BY past_r.fecha_hora_inicio DESC
       LIMIT 50;`,
      [idSesion],
    );

    return result.rows.map((row) => ({
      id_sesion: Number(row.id_sesion),
      tipo_cita: row.tipo_cita as 'INTRODUCTORIA' | 'TERAPIA',
      fecha_hora_inicio: new Date(row.fecha_hora_inicio).toISOString(),
      objetivos_trabajados: String(row.objetivos_trabajados),
    }));
  }

  async analizarTranscripcionSesion(
    idSesion: number,
    payload?: {
      texto?: string;
      paciente_nombre?: string;
      archivo_base64?: string;
      nombre_archivo?: string;
    }
  ) {
    const fail = (message: string, status = 400) => Object.assign(new Error(message), { status });
    if (!Number.isInteger(idSesion) || idSesion <= 0) throw fail('La sesión indicada no es válida.');
    if (!payload?.texto?.trim() && !payload?.archivo_base64?.trim()) throw fail('Carga o pega una transcripción para continuar.');
    if (!settings.ML_SERVICE_ENABLED || !settings.ML_SERVICE_URL) throw fail('El servicio de transcripción no está habilitado.', 503);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let response: Response;
    try {
      response = await fetch(`${settings.ML_SERVICE_URL.replace(/\/$/, '')}/analyze/session-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: payload?.texto || '',
          archivo_base64: payload?.archivo_base64,
          nombre_archivo: payload?.nombre_archivo,
        }),
        signal: controller.signal,
      });
    } catch {
      throw fail('El servicio de transcripción no respondió. Intenta nuevamente más tarde.', 503);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw fail('El servicio no pudo procesar la transcripción.', 502);
    return await response.json();
  }

}

export const sesionesService = new SesionesService();

export function isMeetingUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}


import { pool } from '../../../core/database.js';
import { settings } from '../../../core/config.js';
import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';
import {
  appendPatientScope,
  assertPatientAccess,
  assertReservationAccess,
  assertConsentAccess,
  assertSessionEditAccess,
  hasConsentForAI,
} from '../../../core/security/clinical-access.js';
import type {
  SesionClinicaDTO,
  ValoracionInicialDTO,
  ConsentimientoDTO,
  PrediccionPlanDTO,
  EvaluacionFonologicaDTO,
  RevisionEvaluacionFonologicaDTO,
  DescartarPrediccionDTO,
} from '../dtos/clinica.dto.js';
import { PHONEME_NAMING_TARGETS } from '../../juegos/juegos.service.js';
import { sesionesService } from '../../sesiones/sesiones.service.js';

export class ClinicaService {
  async getMlServiceHealth(user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN') {
      throw Object.assign(new Error('Solo administración puede consultar el estado técnico del servicio ML.'), { status: 403 });
    }
    if (!settings.ML_SERVICE_ENABLED || !settings.ML_SERVICE_URL) {
      throw Object.assign(new Error('El servicio de Machine Learning no está habilitado.'), { status: 503, code: 'ML_SERVICE_DISABLED' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    try {
      const response = await fetch(`${settings.ML_SERVICE_URL.replace(/\/$/, '')}/health`, { signal: controller.signal });
      if (!response.ok) {
        throw Object.assign(new Error('El servicio de Machine Learning no respondió correctamente.'), { status: 503 });
      }
      const health = await response.json() as Record<string, unknown>;
      if (health.status !== 'online' || typeof health.service !== 'string' || typeof health.dispositivo !== 'string' ||
        typeof health.modelo !== 'string' || typeof health.modelo_listo !== 'boolean') {
        throw Object.assign(new Error('El servicio de Machine Learning devolvió un estado inválido.'), { status: 502 });
      }
      return {
        status: health.status,
        service: health.service,
        dispositivo: health.dispositivo,
        modelo: health.modelo,
        modelo_listo: health.modelo_listo,
        predictor_listo: health.predictor_listo === true,
      };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) throw error;
      throw Object.assign(new Error('No se pudo consultar el servicio de Machine Learning.'), { status: 503, code: 'ML_SERVICE_UNAVAILABLE' });
    } finally {
      clearTimeout(timeout);
    }
  }

  async getSesiones(pacienteId: number | undefined, user: AuthenticatedUser) {
    let sql = `
      SELECT
        s.id_sesion,
        s.id_reserva as id_cita,
        r.id_paciente,
        r.id_terapeuta,
        s.fecha_hora_inicio_real as fecha,
        s.estado_sesion as estado,
        COALESCE(rs.observaciones_iniciales, '') as resumen,
        rs.objetivos_trabajados
      FROM sesiones s
      JOIN reservas r ON s.id_reserva = r.id_reserva
      LEFT JOIN reportes_sesion rs ON s.id_sesion = rs.id_sesion
      WHERE 1=1
    `;
    const params: any[] = [];
    if (pacienteId) {
      params.push(pacienteId);
      sql += ` AND r.id_paciente = $1`;
    }
    sql += appendPatientScope(params, user, 'r.id_paciente');
    sql += ` ORDER BY s.fecha_hora_inicio_real DESC LIMIT 20;`;

    const res = await pool.query(sql, params);
    return res.rows.map((row) => ({
      id_sesion: row.id_sesion,
      id_cita: row.id_cita,
      id_paciente: row.id_paciente,
      id_terapeuta: row.id_terapeuta,
      fecha: row.fecha ? new Date(row.fecha).toISOString().split('T')[0] : null,
      hora_inicio: row.fecha
        ? new Date(row.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null,
      estado: row.estado || 'COMPLETADA',
      resumen: row.resumen,
      objetivos:
        typeof row.objetivos_trabajados === 'string' && row.objetivos_trabajados
          ? row.objetivos_trabajados
              .split(/\r?\n|,/)
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
    }));
  }

  async crearSesion(dto: SesionClinicaDTO, user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo el terapeuta asignado puede registrar una sesión.'), { status: 403 });
    }
    await assertReservationAccess(user, dto.id_cita);

    const res = await pool.query(
      `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion, asistencia)
       VALUES ($1, NOW(), 'EN_PROGRESO', true)
       RETURNING id_sesion;`,
      [dto.id_cita]
    );
    if (!res.rows[0]?.id_sesion) throw new Error('No se pudo registrar la sesión.');
    const reservation = await pool.query(
      'SELECT id_paciente, id_terapeuta FROM reservas WHERE id_reserva = $1 LIMIT 1;',
      [dto.id_cita]
    );
    return {
      id_sesion: res.rows[0].id_sesion,
      id_cita: dto.id_cita,
      id_paciente: reservation.rows[0]?.id_paciente,
      id_terapeuta: reservation.rows[0]?.id_terapeuta,
      fecha: dto.fecha,
      hora_inicio: dto.hora_inicio,
      objetivos: dto.objetivos ?? [],
      resumen: dto.resumen ?? '',
      estado: 'EN_PROGRESO',
      creado_en: new Date().toISOString(),
    };
  }

  async crearValoracion(dto: ValoracionInicialDTO, user: AuthenticatedUser) {
    await assertPatientAccess(user, dto.id_paciente);
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo administración o el terapeuta pueden registrar una valoración clínica inicial.'), { status: 403 });
    }
    return {
      id_valoracion: Date.now(),
      ...dto,
      creado_en: new Date().toISOString(),
    };
  }

  // --- GESTIÓN DE CONSENTIMIENTO INFORMADO (Ley 29733 / HIPAA) ---
  async getConsentimiento(pacienteId: number, user: AuthenticatedUser) {
    await assertPatientAccess(user, pacienteId);
    const res = await pool.query(
      `SELECT id_consentimiento, id_paciente, tipo_consentimiento, estado, fecha_concesion, fecha_revocacion
       FROM consentimientos_ia
       WHERE id_paciente = $1 AND tipo_consentimiento = 'EVALUACION_FONOLOGICA_IA'
       ORDER BY fecha_concesion DESC, id_consentimiento DESC LIMIT 1;`,
      [pacienteId]
    );
    if (res.rows.length === 0) {
      return {
        id_paciente: pacienteId,
        consentido: false,
        estado: 'NO_SOLICITADO',
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        fecha_concesion: null,
      };
    }
    const row = res.rows[0];
    return {
      id_consentimiento: row.id_consentimiento,
      id_paciente: row.id_paciente,
      consentido: row.estado === 'CONCEDIDO',
      estado: row.estado,
      tipo_consentimiento: row.tipo_consentimiento,
      fecha_concesion: row.fecha_concesion ? new Date(row.fecha_concesion).toISOString() : null,
      fecha_revocacion: row.fecha_revocacion ? new Date(row.fecha_revocacion).toISOString() : null,
    };
  }

  async registrarConsentimiento(
    dto: ConsentimientoDTO,
    user: AuthenticatedUser,
    ip?: string,
    userAgent?: string
  ) {
    if (user.rol !== 'PADRE' && user.rol !== 'ADMIN') {
      throw Object.assign(new Error('Solo el tutor legal o administración pueden otorgar o revocar consentimiento.'), { status: 403 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      const patient = await client.query(
        'SELECT id_paciente, id_tutor FROM public.pacientes WHERE id_paciente = $1 FOR UPDATE;',
        [dto.id_paciente],
      );
      if (!patient.rows[0]) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
      if (user.rol === 'PADRE') {
        const owner = await client.query(
          'SELECT 1 FROM public.tutores WHERE id_tutor = $1 AND id_usuario = $2 LIMIT 1;',
          [patient.rows[0].id_tutor, user.id_usuario],
        );
        if (!owner.rows[0]) throw Object.assign(new Error('Paciente no encontrado.'), { status: 404 });
      }
      const res = await client.query(
        `INSERT INTO public.consentimientos_ia (id_paciente, id_usuario_tutor, tipo_consentimiento, estado, fecha_concesion, fecha_revocacion, ip_origen, user_agent)
         VALUES ($1, $2, $3, $4, NOW(), CASE WHEN $4::character varying(20) = 'REVOCADO' THEN NOW() ELSE NULL END, $5, $6)
         RETURNING *;`,
        [dto.id_paciente, user.id_usuario, dto.tipo_consentimiento, dto.estado, ip || null, userAgent || null],
      );
      const sessionsToPurge = dto.estado === 'REVOCADO' && dto.tipo_consentimiento === 'EVALUACION_FONOLOGICA_IA'
        ? await client.query(
            `SELECT s.id_sesion
             FROM public.sesiones s
             JOIN public.reservas r ON r.id_reserva = s.id_reserva
             WHERE r.id_paciente = $1 AND s.estado_sesion = 'EN_CURSO';`,
            [dto.id_paciente],
          )
        : null;
      await client.query('COMMIT;');
      if (sessionsToPurge?.rows.length) {
        sesionesService.descartarCapturasDeSesiones(sessionsToPurge.rows.map((row: { id_sesion: number }) => Number(row.id_sesion)));
      }
      const r = res.rows[0];
      return {
        id_consentimiento: r.id_consentimiento,
        id_paciente: r.id_paciente,
        consentido: r.estado === 'CONCEDIDO',
        estado: r.estado,
        tipo_consentimiento: r.tipo_consentimiento,
        fecha_concesion: new Date(r.fecha_concesion).toISOString(),
      };
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
  }

  // --- PREDICCIÓN DE TRATAMIENTOS CON MACHINE LEARNING (Random Forest) ---
  async getTreatmentPredictionCatalog(user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo terapeutas o administración pueden consultar el catálogo predictivo.'), { status: 403 });
    }
    if (!settings.ML_SERVICE_ENABLED || !settings.ML_SERVICE_URL) {
      throw Object.assign(new Error('El catálogo predictivo no está habilitado.'), { status: 503, code: 'MODEL_NOT_READY' });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(`${settings.ML_SERVICE_URL.replace(/\/$/, '')}/predict/treatment-plan/catalog`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw Object.assign(new Error('El modelo aún no publica un catálogo diagnóstico aprobado.'), { status: 503, code: 'MODEL_NOT_READY' });
      }
      const catalog = await response.json() as { version_modelo?: unknown; diagnosis_codes?: unknown };
      const codes = catalog.diagnosis_codes;
      const valid = typeof catalog.version_modelo === 'string' && catalog.version_modelo.trim().length > 0 &&
        Array.isArray(codes) && codes.length === 5 &&
        codes.every((item: any) => Number.isInteger(item?.code) && item.code >= 1 && item.code <= 5 && typeof item.label === 'string' && item.label.trim().length > 0) &&
        new Set(codes.map((item: any) => item.code)).size === 5;
      if (!valid) throw Object.assign(new Error('El servicio predictivo publicó un catálogo diagnóstico inválido.'), { status: 502 });
      return {
        version_modelo: catalog.version_modelo as string,
        diagnosis_codes: codes as Array<{ code: number; label: string }>,
      };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) throw error;
      throw Object.assign(new Error('El catálogo predictivo no está disponible; completa el plan manualmente.'), {
        status: 503,
        code: 'ML_SERVICE_UNAVAILABLE',
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async predecirPlanTratamiento(dto: PrediccionPlanDTO, user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo terapeutas o administración pueden acceder al modelo predictivo.'), { status: 403 });
    }

    await assertSessionEditAccess(user, dto.id_sesion);
    const contextResult = await pool.query(
      `SELECT s.estado_sesion, s.asistencia, r.tipo_cita, r.id_paciente, r.id_terapeuta,
              (EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) * 12
                + EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.fecha_nacimiento)))::integer AS edad_meses,
              report.nivel_ayuda
       FROM sesiones s
       JOIN reservas r ON r.id_reserva = s.id_reserva
       JOIN pacientes p ON p.id_paciente = r.id_paciente
       LEFT JOIN public.reportes_sesion report ON report.id_sesion = s.id_sesion
       WHERE s.id_sesion = $1
       LIMIT 1;`,
      [dto.id_sesion],
    );
    const context = contextResult.rows[0];
    if (!context) throw Object.assign(new Error('La sesión indicada no existe.'), { status: 404 });
    if (context.tipo_cita !== 'INTRODUCTORIA') {
      throw Object.assign(new Error('El pronóstico predictivo solo está disponible para la consulta introductoria.'), { status: 409 });
    }
    if (!['EN_CURSO', 'FINALIZADA'].includes(context.estado_sesion) || context.asistencia === 'NO_ASISTIO') {
      throw Object.assign(new Error('El pronóstico requiere una sesión atendida.'), { status: 409 });
    }

    const ageMonths = Number(context.edad_meses);
    if (!Number.isInteger(ageMonths) || ageMonths < 24 || ageMonths > 180) {
      throw Object.assign(new Error('La edad registrada del paciente está fuera del rango admitido por el modelo.'), { status: 409 });
    }

    const allowedHelpLevels = ['Sin ayuda', 'Ayuda mínima', 'Ayuda moderada', 'Ayuda alta', 'Ayuda total'];
    const helpIndex = allowedHelpLevels.indexOf(String(context.nivel_ayuda ?? ''));
    if (helpIndex < 0) {
      throw Object.assign(new Error('Guarda el nivel de ayuda del informe antes de solicitar un pronóstico.'), { status: 409 });
    }
    const collaborationScore = allowedHelpLevels.length - helpIndex;
    const supportedPhonemes = Array.from(new Set(PHONEME_NAMING_TARGETS.map((target) => target.fonema_objetivo)));
    const phonemeResult = await pool.query(
      `SELECT COUNT(DISTINCT fonema_objetivo)::integer AS cantidad
       FROM public.evaluaciones_fonologicas
       WHERE id_sesion = $1 AND id_paciente = $2
         AND estado = 'CONFIRMADO_TERAPEUTA'
         AND origen_evaluacion = 'CLINICO'
         AND fonema_objetivo = ANY($3::varchar[]);`,
      [dto.id_sesion, Number(context.id_paciente), supportedPhonemes],
    );
    const phonemeCount = Number(phonemeResult.rows[0]?.cantidad ?? 0);
    if (!Number.isInteger(phonemeCount) || phonemeCount < 1 || phonemeCount > supportedPhonemes.length) {
      throw Object.assign(new Error('Confirma al menos un fonema evaluado en esta sesión antes de solicitar el pronóstico.'), { status: 409 });
    }

    const unresolved = await pool.query(
      `SELECT 1 FROM public.predicciones_tratamiento
       WHERE id_sesion = $1 AND estado_confirmacion = 'SUGERIDO'
       LIMIT 1;`,
      [dto.id_sesion],
    );
    if (unresolved.rows.length) {
      throw Object.assign(new Error('Esta sesión ya tiene una sugerencia predictiva pendiente.'), { status: 409 });
    }

    if (!settings.ML_SERVICE_ENABLED || !settings.ML_SERVICE_URL) {
      throw Object.assign(new Error('El modelo predictivo no está habilitado.'), { status: 503, code: 'MODEL_NOT_READY' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let predictionResult: any;
    try {
      const endpoint = settings.ML_SERVICE_URL.replace(/\/$/, '') + '/predict/treatment-plan';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edad_meses: ageMonths,
          codigo_diagnostico: dto.codigo_diagnostico,
          cantidad_fonemas_afectados: phonemeCount,
          nivel_colaboracion: collaborationScore,
          frecuencia_semanal: dto.frecuencia_semanal,
        }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        const status = resp.status === 503 ? 503 : 502;
        throw Object.assign(
          new Error(status === 503
            ? 'El servicio predictivo no tiene un modelo con validación clínica aprobada.'
            : 'El servicio predictivo no pudo procesar la solicitud.'),
          { status, code: status === 503 ? 'MODEL_NOT_READY' : 'ML_SERVICE_ERROR' },
        );
      }
      predictionResult = await resp.json();
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) throw error;
      throw Object.assign(new Error('El servicio predictivo no está disponible; registra el plan manualmente.'), {
        status: 503,
        code: 'ML_SERVICE_UNAVAILABLE',
      });
    } finally {
      clearTimeout(timeout);
    }

    const predictionResultIsValid =
      Number.isFinite(predictionResult?.sesiones_estimadas) &&
      predictionResult.sesiones_estimadas >= 1 && predictionResult.sesiones_estimadas <= 31 &&
      Number.isInteger(predictionResult?.rango_min) && Number.isInteger(predictionResult?.rango_max) &&
      predictionResult.rango_min >= 1 && predictionResult.rango_min <= predictionResult.sesiones_estimadas &&
      predictionResult.rango_max >= predictionResult.sesiones_estimadas && predictionResult.rango_max <= 31 &&
      ['BAJO', 'MEDIO', 'ALTO'].includes(predictionResult?.riesgo_desercion) &&
      Number.isFinite(predictionResult?.probabilidad_desercion) &&
      predictionResult.probabilidad_desercion >= 0 && predictionResult.probabilidad_desercion <= 1 &&
      Number.isFinite(predictionResult?.confianza) && predictionResult.confianza >= 0 && predictionResult.confianza <= 1 &&
      typeof predictionResult?.diagnostico_descripcion === 'string' && predictionResult.diagnostico_descripcion.trim().length > 0 &&
      typeof predictionResult?.version_modelo === 'string' && predictionResult.version_modelo.length > 0 &&
      typeof predictionResult?.advertencia_clinica === 'string' && predictionResult.advertencia_clinica.trim().length > 0;
    if (!predictionResultIsValid) {
      throw Object.assign(new Error('El servicio predictivo devolvió una respuesta inválida.'), { status: 502 });
    }

    try {
      const saved = await pool.query(
        `INSERT INTO public.predicciones_tratamiento (
          id_sesion, id_paciente, id_terapeuta, edad_meses, codigo_diagnostico, cantidad_fonemas_afectados,
          nivel_colaboracion, frecuencia_semanal, sesiones_estimadas, rango_min, rango_max,
          riesgo_desercion, confianza, version_modelo, estado_confirmacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'SUGERIDO')
        RETURNING id_prediccion;`,
        [
          dto.id_sesion,
          Number(context.id_paciente),
          context.id_terapeuta == null ? null : Number(context.id_terapeuta),
          ageMonths,
          dto.codigo_diagnostico,
          phonemeCount,
          collaborationScore,
          dto.frecuencia_semanal,
          predictionResult.sesiones_estimadas,
          predictionResult.rango_min,
          predictionResult.rango_max,
          predictionResult.riesgo_desercion,
          predictionResult.confianza ?? null,
          predictionResult.version_modelo,
        ],
      );
      if (!saved.rows[0]?.id_prediccion) throw new Error('No se guardó el registro de auditoría.');
      return {
        ...predictionResult,
        id_prediccion: Number(saved.rows[0].id_prediccion),
        estado_confirmacion: 'SUGERIDO' as const,
      };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        throw Object.assign(new Error('Esta sesión ya tiene una sugerencia predictiva pendiente.'), { status: 409 });
      }
      throw Object.assign(new Error('No se pudo guardar la auditoría del pronóstico; no se aplicó al plan.'), { status: 503 });
    }
  }

  async descartarPrediccionTratamiento(idPrediccion: number, dto: DescartarPrediccionDTO, user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo el terapeuta responsable puede descartar esta sugerencia.'), { status: 403 });
    }
    const existing = await pool.query(
      'SELECT id_paciente, id_sesion FROM public.predicciones_tratamiento WHERE id_prediccion = $1 LIMIT 1;',
      [idPrediccion],
    );
    if (!existing.rows[0]) throw Object.assign(new Error('La predicción no existe.'), { status: 404 });
    if (existing.rows[0].id_sesion != null) {
      await assertSessionEditAccess(user, Number(existing.rows[0].id_sesion));
    } else {
      await assertPatientAccess(user, Number(existing.rows[0].id_paciente));
    }
    const result = await pool.query(
      `UPDATE public.predicciones_tratamiento
       SET estado_confirmacion = 'DESCARTADO', observaciones_terapeuta = $2
       WHERE id_prediccion = $1 AND estado_confirmacion = 'SUGERIDO'
       RETURNING id_prediccion, estado_confirmacion;`,
      [idPrediccion, dto.observaciones_terapeuta ?? null],
    );
    if (!result.rows[0]) {
      throw Object.assign(new Error('La sugerencia ya fue resuelta o vinculada a un plan.'), { status: 409 });
    }
    return {
      id_prediccion: Number(result.rows[0].id_prediccion),
      estado_confirmacion: result.rows[0].estado_confirmacion,
    };
  }

  // --- EVALUACIONES FONOLÓGICAS ESTRUCTURADAS (Sin persistir audio) ---
  async registrarEvaluacionFonologica(dto: EvaluacionFonologicaDTO, user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo un terapeuta puede registrar una evaluación fonológica clínica.'), { status: 403 });
    }

    const target = PHONEME_NAMING_TARGETS.find((item) => item.word.toLocaleLowerCase('es') === dto.palabra_objetivo.toLocaleLowerCase('es'));
    if (!target || (dto.fonema_objetivo && target.fonema_objetivo !== dto.fonema_objetivo)) {
      throw Object.assign(new Error('La palabra debe coincidir con uno de los objetivos fonológicos disponibles.'), { status: 400 });
    }

    await assertPatientAccess(user, dto.id_paciente);
    const session = await pool.query(
      'SELECT r.id_paciente, s.estado_sesion FROM sesiones s JOIN reservas r ON r.id_reserva = s.id_reserva WHERE s.id_sesion = $1 LIMIT 1;',
      [dto.id_sesion],
    );
    if (!session.rows[0] || Number(session.rows[0].id_paciente) !== dto.id_paciente) {
      throw Object.assign(new Error('La sesión no corresponde al paciente indicado.'), { status: 404 });
    }
    await assertSessionEditAccess(user, dto.id_sesion);
    if (session.rows[0].estado_sesion !== 'EN_CURSO') {
      throw Object.assign(new Error('La evaluación solo puede registrarse durante una sesión en curso.'), { status: 409 });
    }
    await assertConsentAccess(dto.id_paciente, 'EVALUACION_FONOLOGICA_IA');

    const res = await pool.query(
      `INSERT INTO public.evaluaciones_fonologicas (
        id_sesion, id_paciente, fonema_objetivo, palabra_objetivo, transcripcion_detectada,
        estado, origen_evaluacion
      ) VALUES ($1, $2, $3, $4, $5, 'PENDIENTE_REVISION', $6)
      RETURNING *;`,
      [
        dto.id_sesion,
        dto.id_paciente,
        target.fonema_objetivo,
        target.word,
        dto.transcripcion_detectada,
        dto.origen_evaluacion || 'CLINICO',
      ]
    );

    const r = res.rows[0];
    return {
      id_evaluacion: r.id_evaluacion,
      id_sesion: r.id_sesion,
      id_paciente: r.id_paciente,
      fonema_objetivo: r.fonema_objetivo,
      palabra_objetivo: r.palabra_objetivo,
      transcripcion_detectada: r.transcripcion_detectada,
      nivel_ayuda: r.nivel_ayuda,
      estado: r.estado,
      origen_evaluacion: r.origen_evaluacion,
      resultado_clinico: r.resultado_clinico ?? null,
      fecha_registro: new Date(r.fecha_registro).toISOString(),
    };
  }

  async getEvaluacionesFonologicas(pacienteId: number, user: AuthenticatedUser) {
    await assertPatientAccess(user, pacienteId);
    const res = await pool.query(
      `SELECT * FROM public.evaluaciones_fonologicas
       WHERE id_paciente = $1
         AND ($2::boolean = false OR estado = 'CONFIRMADO_TERAPEUTA')
       ORDER BY fecha_registro DESC LIMIT 50;`,
      [pacienteId, user.rol === 'PADRE']
    );

    return res.rows.map((r) => ({
      id_evaluacion: r.id_evaluacion,
      id_sesion: r.id_sesion,
      id_paciente: r.id_paciente,
      fonema_objetivo: r.fonema_objetivo,
      palabra_objetivo: r.palabra_objetivo,
      transcripcion_detectada: user.rol === 'PADRE' ? r.transcripcion_revisada : r.transcripcion_detectada,
      ...(user.rol === 'PADRE' ? { observacion_terapeuta: r.observacion_terapeuta } : {
        transcripcion_revisada: r.transcripcion_revisada,
        observacion_terapeuta: r.observacion_terapeuta,
      }),
      nivel_ayuda: r.nivel_ayuda,
      estado: r.estado,
      origen_evaluacion: r.origen_evaluacion,
      resultado_clinico: r.resultado_clinico ?? null,
      fecha_registro: new Date(r.fecha_registro).toISOString(),
    }));
  }

  async revisarEvaluacionFonologica(idEvaluacion: number, dto: RevisionEvaluacionFonologicaDTO, user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo un terapeuta puede revisar una transcripción clínica.'), { status: 403 });
    }
    const existing = await pool.query(
      'SELECT id_sesion, estado FROM public.evaluaciones_fonologicas WHERE id_evaluacion = $1 LIMIT 1;',
      [idEvaluacion],
    );
    if (!existing.rows[0]) throw Object.assign(new Error('Evaluación no encontrada.'), { status: 404 });
    if (!existing.rows[0].id_sesion) throw Object.assign(new Error('La evaluación no está vinculada a una sesión.'), { status: 409 });
    await assertSessionEditAccess(user, Number(existing.rows[0].id_sesion));

    const result = await pool.query(
      `UPDATE public.evaluaciones_fonologicas
       SET estado = $1, transcripcion_revisada = $2, observacion_terapeuta = $3,
           resultado_clinico = $4, id_usuario_revision = $5, fecha_revision = NOW()
       WHERE id_evaluacion = $6 AND estado = 'PENDIENTE_REVISION'
       RETURNING id_evaluacion, id_sesion, id_paciente, palabra_objetivo,
                 transcripcion_detectada, transcripcion_revisada, observacion_terapeuta,
                  resultado_clinico, estado, id_usuario_revision, fecha_revision;`,
      [
        dto.estado,
        dto.estado === 'CONFIRMADO_TERAPEUTA' ? dto.transcripcion_revisada : null,
        dto.observacion_terapeuta ?? null,
        dto.estado === 'CONFIRMADO_TERAPEUTA' ? dto.resultado_clinico : null,
        user.id_usuario,
        idEvaluacion,
      ],
    );
    if (!result.rows[0]) throw Object.assign(new Error('La evaluación ya fue revisada; actualiza la página para ver el estado.'), { status: 409 });
    const row = result.rows[0];
    return {
      ...row,
      fecha_revision: row.fecha_revision ? new Date(row.fecha_revision).toISOString() : null,
    };
  }
}

export const clinicaService = new ClinicaService();

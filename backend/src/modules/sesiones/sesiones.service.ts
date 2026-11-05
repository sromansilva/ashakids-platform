import { pool } from '../../core/database.js';
import { PHONEME_NAMING_TARGETS } from '../juegos/juegos.service.js';
import { settings } from '../../core/config.js';
import type { AuthenticatedUser } from '../../core/middleware/auth.middleware.js';
import { appendPatientScope, assertReservationAccess, assertSessionEditAccess, assertConsentAccess } from '../../core/security/clinical-access.js';
import { FamilyPhoneticCaptureStore, PhoneticCaptureStore, pcm16MonoWav } from './phonetic-capture.js';
import { isAttendedOrActiveSession, normalizeAttendance } from './attendance.js';
import { calcularIndicadoresFoneticos, ETIQUETA_INDICADOR_APOYO } from '../clinica/services/phoneticIndicators.js';
import { registrarVariablesModeloTratamiento } from '../clinica/services/tratamientoCohorte.js';
import { isGoogleMeetUrl as isMeetingUrl } from '../../core/security/google-meet-url.js';
import { emitNotificationEvent, type CriticalNotificationType } from '../notificaciones/notification-events.js';
import { analyzeWavSignal, VOICE_SIGNAL_MESSAGE } from './voice-signal.js';

/** Minutos antes de la hora programada desde los que el terapeuta puede iniciar la sesión. */
export const SESSION_EARLY_START_MINUTES = 5;

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
  estado_reporte: 'BORRADOR' | 'FIRMADO';
  id_usuario_firma: number | null;
  fecha_firma: string | null;
  firmado_por: string | null;
}

export class SesionesService {
  private readonly phoneticCaptureStore = new PhoneticCaptureStore();
  private readonly familyPhoneticCaptureStore = new FamilyPhoneticCaptureStore();
  private readonly activePhoneticInferences = new Map<number, Set<AbortController>>();

  private registerPhoneticInference(sessionId: number, controller: AbortController) {
    const active = this.activePhoneticInferences.get(sessionId) ?? new Set<AbortController>();
    active.add(controller);
    this.activePhoneticInferences.set(sessionId, active);
  }

  private releasePhoneticInference(sessionId: number, controller: AbortController) {
    const active = this.activePhoneticInferences.get(sessionId);
    if (!active) return;
    active.delete(controller);
    if (active.size === 0) this.activePhoneticInferences.delete(sessionId);
  }

  private async assertActivePhoneticSession(idSesion: number) {
    const result = await pool.query(
      'SELECT s.estado_sesion, r.id_paciente FROM sesiones s JOIN reservas r ON r.id_reserva = s.id_reserva WHERE s.id_sesion = $1 LIMIT 1;',
      [idSesion],
    );
    if (!result.rows[0]) throw Object.assign(new Error('Sesión no encontrada.'), { status: 404 });
    if (result.rows[0].estado_sesion !== 'EN_CURSO') {
      throw Object.assign(new Error('La evaluación fonológica solo está disponible durante una sesión en curso.'), { status: 409 });
    }
    await assertConsentAccess(Number(result.rows[0].id_paciente));
  }

  async iniciarCapturaFonologica(
    idSesion: number,
    user: AuthenticatedUser,
    payload: { captura_id: string; palabra_objetivo: string; fonema_objetivo: string },
  ) {
    const target = PHONEME_NAMING_TARGETS.find((item) => item.word.toLocaleLowerCase('es') === payload.palabra_objetivo.trim().toLocaleLowerCase('es'));
    if (!target || target.fonema_objetivo !== payload.fonema_objetivo) {
      throw Object.assign(new Error('Selecciona una palabra y un fonema de los objetivos clínicos disponibles.'), { status: 400 });
    }
    await this.assertActivePhoneticSession(idSesion);
    return this.phoneticCaptureStore.create({
      id_sesion: idSesion,
      id_usuario: user.id_usuario,
      captura_id: payload.captura_id,
      palabra_objetivo: target.word,
      fonema_objetivo: target.fonema_objetivo,
    });
  }

  async guardarPaqueteFonologico(
    idSesion: number,
    user: AuthenticatedUser,
    capturaId: string,
    numeroPaquete: number,
    audioPcm: Buffer,
  ) {
    try {
      await this.assertActivePhoneticSession(idSesion);
      return this.phoneticCaptureStore.append(idSesion, user.id_usuario, capturaId, numeroPaquete, audioPcm);
    } catch (error) {
      this.phoneticCaptureStore.discard(idSesion, user.id_usuario, capturaId);
      throw error;
    }
  }

  async finalizarCapturaFonologica(idSesion: number, user: AuthenticatedUser, capturaId: string) {
    let completed: ReturnType<PhoneticCaptureStore['take']> | null = null;
    let wav: Buffer | null = null;
    try {
      await this.assertActivePhoneticSession(idSesion);
      completed = this.phoneticCaptureStore.take(idSesion, user.id_usuario, capturaId);
      wav = pcm16MonoWav(completed.pcm);
      completed.pcm.fill(0);
      return await this.evaluarFonemaEnVivo(idSesion, {
        audio_bytes: wav,
        palabra_objetivo: completed.palabra_objetivo,
        fonema_objetivo: completed.fonema_objetivo,
      });
    } catch (error) {
      this.phoneticCaptureStore.discard(idSesion, user.id_usuario, capturaId);
      throw error;
    } finally {
      completed?.pcm.fill(0);
      wav?.fill(0);
    }
  }

  descartarCapturaFonologica(idSesion: number, user: AuthenticatedUser, capturaId: string) {
    return this.phoneticCaptureStore.discard(idSesion, user.id_usuario, capturaId);
  }

  async solicitarCapturaFamiliar(
    idSesion: number,
    user: AuthenticatedUser,
    payload: { captura_id: string; palabra_objetivo: string; fonema_objetivo: string },
  ) {
    const target = PHONEME_NAMING_TARGETS.find((item) => item.word.toLocaleLowerCase('es') === payload.palabra_objetivo.trim().toLocaleLowerCase('es'));
    if (!target || target.fonema_objetivo !== payload.fonema_objetivo) {
      throw Object.assign(new Error('Selecciona una palabra y un fonema de los objetivos clínicos disponibles.'), { status: 400 });
    }
    await this.assertActivePhoneticSession(idSesion);
    const capture = this.familyPhoneticCaptureStore.create({
      id_sesion: idSesion,
      id_usuario: user.id_usuario,
      captura_id: payload.captura_id,
      palabra_objetivo: target.word,
      fonema_objetivo: target.fonema_objetivo,
    });
    await this.notificarFamiliaDeSesion(idSesion, 'MUESTRA_SOLICITADA', {
      title: 'Tu terapeuta pidió una muestra de voz',
      text: `Graba una palabra breve (${target.word}) desde este dispositivo. Entra a la cita y toca «Grabar ahora».`,
      eventKey: `muestra_solicitada:${idSesion}:${payload.captura_id}`,
    });
    return capture;
  }

  /**
   * Avisa a la familia del paciente de la sesión con un aviso crítico (no depende de las
   * preferencias). Un fallo de notificación nunca debe impedir la acción clínica.
   */
  private async notificarFamiliaDeSesion(
    idSesion: number,
    type: CriticalNotificationType,
    notice: { title: string; text: string; eventKey: string },
  ): Promise<void> {
    try {
      const family = await pool.query(
        `SELECT r.id_reserva, tutor.id_usuario AS parent_user_id
         FROM sesiones s
         JOIN reservas r ON r.id_reserva = s.id_reserva
         JOIN pacientes p ON p.id_paciente = r.id_paciente
         JOIN tutores tutor ON tutor.id_tutor = p.id_tutor
         WHERE s.id_sesion = $1;`,
        [idSesion],
      );
      for (const row of family.rows) {
        await emitNotificationEvent(pool, {
          userId: Number(row.parent_user_id),
          preference: null,
          type,
          title: notice.title,
          text: notice.text,
          reservationId: Number(row.id_reserva),
          eventKey: notice.eventKey,
        });
      }
    } catch (error) {
      console.warn(`[SesionesService] No se pudo avisar a la familia (${type}):`, error);
    }
  }

  async obtenerCapturaFamiliarPendiente(idSesion: number, familyUserId: number) {
    await this.assertActivePhoneticSession(idSesion);
    return this.familyPhoneticCaptureStore.pending(idSesion, familyUserId);
  }

  async iniciarCapturaFamiliar(idSesion: number, familyUserId: number, captureId: string) {
    await this.assertActivePhoneticSession(idSesion);
    return this.familyPhoneticCaptureStore.claim(idSesion, familyUserId, captureId);
  }

  async guardarPaqueteCapturaFamiliar(idSesion: number, familyUserId: number, captureId: string, packetNumber: number, audioPcm: Buffer) {
    try {
      await this.assertActivePhoneticSession(idSesion);
      return this.familyPhoneticCaptureStore.append(idSesion, familyUserId, captureId, packetNumber, audioPcm);
    } catch (error) {
      try {
        this.familyPhoneticCaptureStore.discard(idSesion, captureId, familyUserId);
      } catch {
        // A request from another family account must not erase its in-memory audio.
      }
      throw error;
    }
  }

  async finalizarCapturaFamiliar(idSesion: number, familyUserId: number, captureId: string) {
    let completed: ReturnType<FamilyPhoneticCaptureStore['take']> | null = null;
    let wav: Buffer | null = null;
    try {
      await this.assertActivePhoneticSession(idSesion);
      completed = this.familyPhoneticCaptureStore.take(idSesion, familyUserId, captureId);
      wav = pcm16MonoWav(completed.pcm);
      completed.pcm.fill(0);
      const result = await this.evaluarFonemaEnVivo(idSesion, {
        audio_bytes: wav,
        palabra_objetivo: completed.palabra_objetivo,
        fonema_objetivo: completed.fonema_objetivo,
      });
      this.familyPhoneticCaptureStore.complete(idSesion, captureId, { ...result, estado: 'PENDIENTE_REVISION' });
      // La familia ya atendió el pedido: el aviso deja de mostrarse como pendiente.
      await pool.query(
        `UPDATE public.notificaciones SET leida_en = NOW()
         WHERE id_usuario = $1 AND tipo = 'MUESTRA_SOLICITADA' AND leida_en IS NULL
           AND id_reserva = (SELECT id_reserva FROM public.sesiones WHERE id_sesion = $2);`,
        [familyUserId, idSesion],
      ).catch((error: unknown) => {
        console.warn('[Sesiones] No se pudo marcar como atendido el aviso de muestra:', error instanceof Error ? error.message : String(error));
      });
      return { estado: 'ENVIADA' as const, aviso: 'La muestra fue enviada al terapeuta para revisión.' };
    } catch (error) {
      // Señal sin voz: la solicitud sigue vigente para que la familia repita la muestra.
      if ((error as { code?: string }).code === 'SENAL_INSUFICIENTE' &&
          this.familyPhoneticCaptureStore.reopen(idSesion, captureId, familyUserId)) {
        throw error;
      }
      try {
        this.familyPhoneticCaptureStore.discard(idSesion, captureId, familyUserId);
      } catch {
        // Preserve the capture owner's data when a different account submits this request.
      }
      throw error;
    } finally {
      completed?.pcm.fill(0);
      wav?.fill(0);
    }
  }

  descartarCapturaFamiliar(idSesion: number, captureId: string, familyUserId?: number) {
    return this.familyPhoneticCaptureStore.discard(idSesion, captureId, familyUserId);
  }

  descartarCapturasDeSesiones(sessionIds: number[]) {
    const results = sessionIds.map((sessionId) => {
      if (!Number.isInteger(sessionId) || sessionId <= 0) return 0;
      for (const controller of this.activePhoneticInferences.get(sessionId) ?? []) controller.abort();
      this.activePhoneticInferences.delete(sessionId);
      return this.phoneticCaptureStore.discardSession(sessionId) + this.familyPhoneticCaptureStore.discardSession(sessionId);
    });
    return results.reduce((total, value) => total + value, 0);
  }

  async obtenerResultadoCapturaFamiliar(idSesion: number, captureId: string) {
    await this.assertActivePhoneticSession(idSesion);
    return this.familyPhoneticCaptureStore.result(idSesion, captureId);
  }

  async evaluarFonemaEnVivo(
    idSesion: number,
    payload?: {
      audio_base64?: string;
      audio_bytes?: Buffer;
      palabra_esperada?: string;
      palabra_objetivo?: string;
      fonema_objetivo?: string;
    }
  ) {
    const fail = (message: string, status = 400) => Object.assign(new Error(message), { status });
    const palabraEsperada = (payload?.palabra_objetivo ?? payload?.palabra_esperada)?.trim();
    let audioBase64 = payload?.audio_base64?.replace(/^data:audio\/[^;]+;base64,/, '').trim() ?? '';
    let audioBytes: Buffer | null = null;
    let uploadBytes: Uint8Array | null = null;
    let formData: FormData | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (!Number.isInteger(idSesion) || idSesion <= 0) throw fail('La sesión indicada no es válida.');
    const controller = new AbortController();
    this.registerPhoneticInference(idSesion, controller);
    try {
      if (!palabraEsperada || palabraEsperada.length > 80) throw fail('Selecciona una palabra objetivo válida.');
      const target = PHONEME_NAMING_TARGETS.find((item) => item.word.toLocaleLowerCase('es') === palabraEsperada.toLocaleLowerCase('es'));
      if (!target || (payload?.fonema_objetivo && target.fonema_objetivo !== payload.fonema_objetivo)) {
        throw fail('Selecciona una palabra y un fonema de los objetivos clínicos disponibles.');
      }
      if (!payload?.audio_bytes && (!audioBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(audioBase64))) {
        throw fail('Graba un fragmento de audio válido.');
      }
      if (audioBase64.length > 684_000) throw fail('El fragmento supera el tamaño permitido.', 413);

      const session = await pool.query(
        'SELECT s.estado_sesion, r.id_paciente FROM sesiones s JOIN reservas r ON r.id_reserva = s.id_reserva WHERE s.id_sesion = $1 LIMIT 1;',
        [idSesion],
      );
      if (!session.rows[0]) throw fail('Sesión no encontrada.', 404);
      if (session.rows[0].estado_sesion !== 'EN_CURSO') throw fail('La evaluación fonológica solo está disponible durante una sesión en curso.', 409);
      await assertConsentAccess(Number(session.rows[0].id_paciente));
      if (!settings.ML_SERVICE_ENABLED || !settings.ML_SERVICE_URL) throw fail('El servicio de transcripción no está habilitado.', 503);

      audioBytes = payload?.audio_bytes ? Buffer.from(payload.audio_bytes) : Buffer.from(audioBase64, 'base64');
      if (!audioBytes.length) throw fail('Graba un fragmento de audio válido.');
      if (audioBytes.length > 512_000) throw fail('El fragmento supera el tamaño permitido.', 413);
      // Sin voz audible no se consulta al modelo ni se crea ninguna evaluación; el audio no se guarda.
      if (!analyzeWavSignal(audioBytes).suficiente) {
        throw Object.assign(fail(VOICE_SIGNAL_MESSAGE, 422), { code: 'SENAL_INSUFICIENTE' });
      }
      uploadBytes = Uint8Array.from(audioBytes);
      formData = new FormData();
      formData.append('file', new Blob([uploadBytes], { type: 'audio/wav' }), 'session-audio.wav');
      formData.append('palabra_objetivo', palabraEsperada);
      formData.append('fonema_objetivo', target.fonema_objetivo);

      timeout = setTimeout(() => controller.abort(), 60_000);
      let response: Response;
      try {
        response = await fetch(settings.ML_SERVICE_URL.replace(/\/$/, '') + '/predict/phonetics', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
      } catch {
        throw fail('El servicio de transcripción no respondió. Intenta nuevamente más tarde.', 503);
      }
      if (!response.ok) throw fail('El modelo de transcripción no pudo procesar el audio.', response.status === 503 ? 503 : 502);

      const modelResult = await response.json() as { transcripcion?: unknown; duracion_segundos?: unknown; motor_red_neuronal_activa?: unknown };
      const transcription = typeof modelResult.transcripcion === 'string' ? modelResult.transcripcion.trim() : '';
      const duration = typeof modelResult.duracion_segundos === 'number' ? modelResult.duracion_segundos : NaN;
      if (modelResult.motor_red_neuronal_activa === true && !transcription) {
        throw Object.assign(fail(VOICE_SIGNAL_MESSAGE, 422), { code: 'SENAL_INSUFICIENTE' });
      }
      if (modelResult.motor_red_neuronal_activa !== true || transcription.length > 500 || duration < 2 || duration > 3) {
        throw fail('No se obtuvo una muestra válida de 2 a 3 segundos para revisar. Graba nuevamente.', 422);
      }

      // Indicadores de apoyo calculados solo en el servidor a partir del texto; sin validación clínica.
      const indicadores = calcularIndicadoresFoneticos({
        palabra_objetivo: target.word,
        fonema_objetivo: target.fonema_objetivo,
        transcripcion: transcription,
      });

      // Serialize persistence with consent updates and session closure. This
      // prevents a concurrent revocation from passing between the last check
      // and the transcript insert.
      const client = await pool.connect();
      let saved: { rows: Array<{ id_evaluacion: number }> };
      try {
        await client.query('BEGIN;');
        const patient = await client.query(
          `SELECT p.id_paciente
           FROM public.pacientes p
           JOIN public.reservas r ON r.id_paciente = p.id_paciente
           JOIN public.sesiones s ON s.id_reserva = r.id_reserva
           WHERE s.id_sesion = $1
           FOR UPDATE OF p;`,
          [idSesion],
        );
        if (!patient.rows[0]) throw fail('Sesión no encontrada.', 404);
        const patientId = Number(patient.rows[0].id_paciente);

        const currentSession = await client.query(
          'SELECT estado_sesion FROM public.sesiones WHERE id_sesion = $1 FOR UPDATE;',
          [idSesion],
        );
        if (currentSession.rows[0]?.estado_sesion !== 'EN_CURSO') {
          throw fail('La sesión se cerró mientras se procesaba la muestra; no se guardó la transcripción.', 409);
        }

        const consent = await client.query(
          `SELECT estado FROM public.consentimientos_ia
           WHERE id_paciente = $1 AND tipo_consentimiento = 'EVALUACION_FONOLOGICA_IA'
           ORDER BY fecha_concesion DESC, id_consentimiento DESC LIMIT 1;`,
          [patientId],
        );
        if (consent.rows[0]?.estado !== 'CONCEDIDO') {
          throw Object.assign(new Error('CONSENT_REQUIRED: El consentimiento fue revocado durante el análisis; no se guardó la transcripción.'), {
            status: 403,
            code: 'CONSENT_REQUIRED',
          });
        }

        saved = await client.query(
          "INSERT INTO public.evaluaciones_fonologicas (id_sesion, id_paciente, fonema_objetivo, palabra_objetivo, transcripcion_detectada, estado, origen_evaluacion, similitud_porcentaje, tipo_error_sugerido, diagnostico_sugerido, intentos) VALUES ($1, $2, $3, $4, $5, 'PENDIENTE_REVISION', 'CLINICO', $6, $7, $8, 1) RETURNING id_evaluacion;",
          [
            idSesion, patientId, target.fonema_objetivo, target.word, transcription,
            indicadores.similitud_texto_porcentaje, indicadores.tipo_error_sugerido, indicadores.hipotesis_sugerida,
          ],
        );
        await client.query('COMMIT;');
      } catch (error) {
        await client.query('ROLLBACK;');
        throw error;
      } finally {
        client.release();
      }
      return {
        id_evaluacion: Number(saved.rows[0].id_evaluacion),
        estado: 'PENDIENTE_REVISION',
        palabra_esperada: target.word,
        transcripcion_tentativa: transcription,
        duracion_segundos: duration,
        indicadores_apoyo: { ...indicadores, etiqueta: ETIQUETA_INDICADOR_APOYO },
        aviso: 'Transcripción automática preliminar. Los indicadores de apoyo se calculan solo desde el texto, no miden acústica ni establecen un diagnóstico; requieren revisión y confirmación del terapeuta.',
      };
    } finally {
      if (timeout) clearTimeout(timeout);
      this.releasePhoneticInference(idSesion, controller);
      formData?.delete('file');
      uploadBytes?.fill(0);
      audioBytes?.fill(0);
      payload?.audio_bytes?.fill(0);
      audioBase64 = '';
      if (payload?.audio_base64 !== undefined) payload.audio_base64 = undefined;
    }
  }
  async listar(filters: { pacienteId?: number; sesionId?: number; limit?: number; offset?: number }, user: AuthenticatedUser) {
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
          t.id_usuario as id_terapeuta_user_id,
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

      sql += appendPatientScope(params, user, 'r.id_paciente');
      const countParams = [...params];
      const countSql = `SELECT COUNT(DISTINCT s.id_sesion) AS total ${sql.slice(sql.indexOf('FROM sesiones s'))};`;

      sql += ` ORDER BY s.id_sesion DESC`;
      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;

      const res = await pool.query(sql, params);
      const totalRes = await pool.query(countSql, countParams);
      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);

      const items: SessionData[] = res.rows.map(r => ({
        id_sesion: r.id_sesion,
        id_reserva: r.id_reserva,
        puede_editar: user.rol === 'ADMIN' || (user.rol === 'TERAPEUTA' && Number(r.id_terapeuta_user_id) === user.id_usuario),
        reporte_disponible: parseInt(r.count_reporte ?? '0', 10) > 0,
        fecha_hora_inicio_real: r.fecha_hora_inicio_real ? new Date(r.fecha_hora_inicio_real).toISOString() : null,
        fecha_hora_fin_real: r.fecha_hora_fin_real ? new Date(r.fecha_hora_fin_real).toISOString() : null,
        asistencia: normalizeAttendance(r.asistencia),
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
          // La familia solo ve el enlace cuando el terapeuta ya inició la sesión.
          meet_url: isMeetingUrl(r.meet_url) && (user.rol !== 'PADRE' || r.estado_sesion === 'EN_CURSO') ? r.meet_url : null,
          meet_origen: null,
          id_sesion: r.id_sesion,
        },
      }));

      return { items, total: Math.max(total, items.length) };
    } catch (err) {
      throw err;
    }
  }

  async detalle(key: number, user: AuthenticatedUser): Promise<SessionData | null> {
    const { items } = await this.listar({ sesionId: key, limit: 1 }, user);
    return (items.find(s => s.id_sesion === key) ?? null) as SessionData | null;
  }

  async crear(id_reserva: number, user: AuthenticatedUser): Promise<SessionData> {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo el terapeuta asignado puede crear una sesión.'), { status: 403 });
    }
    await assertReservationAccess(user, id_reserva);
    try {
      const res = await pool.query(
        `INSERT INTO sesiones (id_reserva, estado_sesion)
         SELECT $1, 'PROGRAMADA'
         WHERE EXISTS (
           SELECT 1 FROM reservas
           WHERE id_reserva = $1 AND estado_reserva = 'CONFIRMADA'
         )
           AND NOT EXISTS (SELECT 1 FROM sesiones WHERE id_reserva = $1)
         RETURNING id_sesion;`,
        [id_reserva]
      );
      const id_sesion = res.rows[0]?.id_sesion;
      if (!id_sesion) throw Object.assign(new Error('La cita debe estar confirmada y no tener una sesión registrada.'), { status: 409 });
      const sesion = await this.detalle(id_sesion, user);
      if (!sesion) throw Object.assign(new Error('No se pudo recuperar la sesión creada.'), { status: 404 });
      return sesion;
    } catch (err) {
      throw err;
    }
  }

  async iniciar(key: number, user: AuthenticatedUser, options: { modoPrueba?: boolean } = {}): Promise<SessionData> {
    const modoPrueba = options.modoPrueba === true;
    if (modoPrueba && !settings.SESSION_TEST_MODE_ENABLED) {
      throw Object.assign(new Error('El modo prueba de sesiones no está habilitado en este entorno.'), { status: 403 });
    }
    await assertSessionEditAccess(user, key);
    const current = await pool.query(
      `SELECT s.estado_sesion, s.id_reserva, r.estado_reserva, r.fecha_hora_inicio, r.fecha_hora_fin,
              NOW() >= r.fecha_hora_inicio - ($2::int * INTERVAL '1 minute') AS ya_es_hora,
              NOW() >= r.fecha_hora_fin AS ya_termino
       FROM sesiones s JOIN reservas r ON r.id_reserva = s.id_reserva
       WHERE s.id_sesion = $1;`,
      [key, SESSION_EARLY_START_MINUTES],
    );
    const row = current.rows[0];
    if (!row) throw Object.assign(new Error('Sesión no encontrada.'), { status: 404 });
    if (row.estado_reserva !== 'CONFIRMADA') {
      throw Object.assign(new Error('La cita debe estar confirmada para iniciar la sesión.'), { status: 409 });
    }
    if (row.estado_sesion !== 'PROGRAMADA') {
      throw Object.assign(new Error('La sesión ya fue iniciada o cerrada.'), { status: 409 });
    }
    if (!modoPrueba) {
      if (row.ya_termino) {
        throw Object.assign(new Error('La cita ya terminó: no se puede iniciar la sesión fuera de su horario.'), { status: 409 });
      }
      if (!row.ya_es_hora) {
        const enabledAt = new Date(new Date(row.fecha_hora_inicio).getTime() - SESSION_EARLY_START_MINUTES * 60000);
        const label = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(enabledAt);
        throw Object.assign(new Error(`Aún no es la hora: la sesión puede iniciarse desde las ${label}.`), { status: 409 });
      }
    }
    const result = await pool.query(
      `UPDATE sesiones s
       SET fecha_hora_inicio_real = NOW(), estado_sesion = 'EN_CURSO'
       FROM reservas r
       WHERE s.id_sesion = $1
         AND r.id_reserva = s.id_reserva
         AND s.estado_sesion = 'PROGRAMADA'
         AND r.estado_reserva = 'CONFIRMADA'
         AND ($3::boolean OR (NOW() >= r.fecha_hora_inicio - ($2::int * INTERVAL '1 minute') AND NOW() < r.fecha_hora_fin))
       RETURNING s.id_sesion;`,
      [key, SESSION_EARLY_START_MINUTES, modoPrueba],
    );
    if (!result.rows[0]) {
      throw Object.assign(new Error('La sesión no pudo iniciarse: cambió el estado o el horario de la cita.'), { status: 409 });
    }
    if (modoPrueba) {
      // No existe un helper de auditoría reutilizable; queda registro en el log del servidor.
      console.warn(`[SesionesService] MODO PRUEBA: sesión ${key} iniciada fuera de horario por el usuario ${user.id_usuario} (${user.rol}).`);
    }
    await this.notificarInicioAFamilia(Number(row.id_reserva));
    const sesion = await this.detalle(key, user);
    if (!sesion) throw Object.assign(new Error('Sesión no encontrada.'), { status: 404 });
    return { ...sesion, estado_sesion: 'EN_CURSO' };
  }

  private async notificarInicioAFamilia(idReserva: number): Promise<void> {
    try {
      const family = await pool.query(
        `SELECT family.id_usuario AS parent_user_id
         FROM reservas r
         JOIN pacientes p ON p.id_paciente = r.id_paciente
         JOIN tutores family ON family.id_tutor = p.id_tutor
         WHERE r.id_reserva = $1 AND r.modalidad IN ('VIRTUAL', 'ONLINE');`,
        [idReserva],
      );
      for (const participant of family.rows) {
        await emitNotificationEvent(pool, {
          userId: Number(participant.parent_user_id),
          // Crítico: sin acceso a la reunión la familia no puede asistir, aunque haya apagado recordatorios.
          preference: null,
          type: 'SESION_INICIADA',
          title: 'Tu terapeuta inició la reunión',
          text: 'Ya puedes entrar a la reunión desde AshaKids.',
          reservationId: idReserva,
          eventKey: `sesion_iniciada:${idReserva}`,
        });
      }
    } catch (error) {
      console.warn('[SesionesService] La sesión inició, pero no se pudo notificar a la familia:', error);
    }
  }

  async cerrar(key: number, asistencia: 'ASISTIO' | 'NO_ASISTIO', user: AuthenticatedUser): Promise<SessionData> {
    await assertSessionEditAccess(user, key);
    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      const result = await client.query(
        `UPDATE sesiones SET fecha_hora_fin_real = NOW(), estado_sesion = 'FINALIZADA', asistencia = $1
         WHERE id_sesion = $2 AND estado_sesion = 'EN_CURSO'
         RETURNING id_reserva;`,
        [asistencia, key]
      );
      if (!result.rows[0]) {
        throw Object.assign(new Error('Solo se puede cerrar una sesión que esté en curso.'), { status: 409 });
      }
      await client.query(
        "UPDATE reservas SET estado_reserva = 'COMPLETADA' WHERE id_reserva = $1 AND estado_reserva = 'CONFIRMADA';",
        [result.rows[0].id_reserva],
      );
      await client.query('COMMIT;');
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
    this.descartarCapturasDeSesiones([key]);
    const sesion = await this.detalle(key, user);
    if (!sesion) throw Object.assign(new Error('Sesión no encontrada.'), { status: 404 });
    return { ...sesion, estado_sesion: 'FINALIZADA', asistencia };
  }

  async reporte(key: number): Promise<ReporteItem | null> {
    try {
      const res = await pool.query(
        `SELECT rep.id_reporte_sesion, rep.id_sesion, rep.fecha_creacion,
                rep.observaciones_iniciales, rep.objetivos_trabajados, rep.nivel_ayuda, rep.proximos_pasos,
                rep.estado_reporte, rep.id_usuario_firma, rep.fecha_firma,
                NULLIF(BTRIM(COALESCE(firma.nombres, '') || ' ' || COALESCE(firma.apellidos, '')), '') AS firmado_por
         FROM reportes_sesion rep
         LEFT JOIN usuarios firma ON firma.id_usuario = rep.id_usuario_firma
         WHERE rep.id_sesion = $1 LIMIT 1;`,
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
          estado_reporte: r.estado_reporte,
          id_usuario_firma: r.id_usuario_firma ?? null,
          fecha_firma: r.fecha_firma ? new Date(r.fecha_firma).toISOString() : null,
          firmado_por: r.firmado_por ?? null,
        };
      }
    } catch (err) {
      throw err;
    }
    return null;
  }

  async guardarReporte(key: number, data: any, user: AuthenticatedUser): Promise<ReporteItem> {
    await assertSessionEditAccess(user, key);
    const allowedHelpLevels = ['Sin ayuda', 'Ayuda mínima', 'Ayuda moderada', 'Ayuda alta', 'Ayuda total'];
    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      const existingResult = await client.query(
        `SELECT estado_reporte, nivel_ayuda
         FROM reportes_sesion
         WHERE id_sesion = $1
         FOR UPDATE;`,
        [key],
      );
      const existing = existingResult.rows[0];
      if (existing?.estado_reporte === 'FIRMADO') {
        throw Object.assign(new Error('El reporte ya está firmado y no se puede modificar.'), { status: 409 });
      }

      const level = data.nivel_ayuda;
      const isBlank = level === null || level === '';
      const isAllowed = isBlank || allowedHelpLevels.includes(level);
      const isUnchangedLegacy = Boolean(existing && level === existing.nivel_ayuda);
      if (!isAllowed && !isUnchangedLegacy) {
        throw Object.assign(new Error('Selecciona uno de los cinco niveles de ayuda disponibles.'), { status: 400 });
      }

      const res = await client.query(
        `INSERT INTO reportes_sesion
           (id_sesion, observaciones_iniciales, objetivos_trabajados, nivel_ayuda, proximos_pasos, fecha_creacion, estado_reporte)
         VALUES ($1, $2, $3, $4, $5, NOW(), 'BORRADOR')
         ON CONFLICT (id_sesion) DO UPDATE
           SET observaciones_iniciales = EXCLUDED.observaciones_iniciales,
               objetivos_trabajados = EXCLUDED.objetivos_trabajados,
               nivel_ayuda = EXCLUDED.nivel_ayuda,
               proximos_pasos = EXCLUDED.proximos_pasos
         WHERE reportes_sesion.estado_reporte = 'BORRADOR'
           AND (
             EXCLUDED.nivel_ayuda IS NULL
             OR BTRIM(EXCLUDED.nivel_ayuda) = ''
             OR EXCLUDED.nivel_ayuda = ANY($6::text[])
             OR EXCLUDED.nivel_ayuda = reportes_sesion.nivel_ayuda
           )
         RETURNING *;`,
        [key, data.observaciones_iniciales, data.objetivos_trabajados, level, data.proximos_pasos, allowedHelpLevels],
      );
      const r = res.rows[0];
      if (!r) throw Object.assign(new Error('El reporte ya está firmado o el nivel de ayuda dejó de ser válido.'), { status: 409 });
      await client.query('COMMIT;');
      return {
        id_reporte_sesion: r.id_reporte_sesion,
        id_sesion: r.id_sesion,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        observaciones_iniciales: r.observaciones_iniciales,
        objetivos_trabajados: r.objetivos_trabajados,
        nivel_ayuda: r.nivel_ayuda,
        proximos_pasos: r.proximos_pasos,
        estado_reporte: r.estado_reporte,
        id_usuario_firma: r.id_usuario_firma ?? null,
        fecha_firma: r.fecha_firma ? new Date(r.fecha_firma).toISOString() : null,
        firmado_por: null,
      };
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
  }

  async firmarReporte(key: number, user: AuthenticatedUser): Promise<ReporteItem> {
    await assertSessionEditAccess(user, key);
    const result = await pool.query(
      `UPDATE reportes_sesion
       SET estado_reporte = 'FIRMADO', id_usuario_firma = $2, fecha_firma = NOW()
       WHERE id_sesion = $1 AND estado_reporte = 'BORRADOR'
         AND NULLIF(BTRIM(observaciones_iniciales), '') IS NOT NULL
         AND NULLIF(BTRIM(objetivos_trabajados), '') IS NOT NULL
         AND nivel_ayuda = ANY(ARRAY['Sin ayuda', 'Ayuda mínima', 'Ayuda moderada', 'Ayuda alta', 'Ayuda total']::text[])
         AND NULLIF(BTRIM(proximos_pasos), '') IS NOT NULL
       RETURNING *;`,
      [key, user.id_usuario],
    );
    if (!result.rows[0]) {
      const existing = await this.reporte(key);
      if (!existing) throw Object.assign(new Error('Guarda el reporte antes de firmarlo.'), { status: 404 });
      if (existing.estado_reporte === 'FIRMADO') throw Object.assign(new Error('El reporte ya está firmado.'), { status: 409 });
      throw Object.assign(new Error('Completa los cuatro campos del reporte antes de firmarlo.'), { status: 400 });
    }
    const row = result.rows[0];
    await this.notificarFamiliaDeSesion(key, 'REPORTE_PUBLICADO', {
      title: 'Tu terapeuta publicó el reporte de la sesión',
      text: 'Ya puedes leer el reporte y descargarlo desde la cita.',
      eventKey: `reporte_publicado:${key}`,
    });
    return {
      id_reporte_sesion: row.id_reporte_sesion,
      id_sesion: row.id_sesion,
      fecha_creacion: new Date(row.fecha_creacion).toISOString(),
      observaciones_iniciales: row.observaciones_iniciales,
      objetivos_trabajados: row.objetivos_trabajados,
      nivel_ayuda: row.nivel_ayuda,
      proximos_pasos: row.proximos_pasos,
      estado_reporte: row.estado_reporte,
      id_usuario_firma: row.id_usuario_firma,
      fecha_firma: new Date(row.fecha_firma).toISOString(),
      firmado_por: (user.nombres + ' ' + user.apellidos).trim(),
    };
  }

  async plan(key: number, user?: AuthenticatedUser) {
    try {
      const res = await pool.query(
        `SELECT t.*, CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) as paciente_nombre,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as terapeuta_nombre,
                prediction.sesiones_estimadas AS sesiones_modelo_estimadas,
                prediction.rango_min AS modelo_rango_min,
                prediction.rango_max AS modelo_rango_max,
                prediction.riesgo_desercion AS riesgo_desercion_modelo,
                prediction.probabilidad_desercion AS probabilidad_desercion_modelo,
                prediction.confianza AS confianza_modelo,
                prediction.estado_confirmacion AS estado_prediccion,
                (SELECT COUNT(*)::integer
                 FROM sesiones attended_session
                 JOIN reservas attended_reservation ON attended_reservation.id_reserva = attended_session.id_reserva
                 WHERE attended_reservation.id_tratamiento = t.id_tratamiento
                   AND attended_session.estado_sesion = 'FINALIZADA'
                   AND attended_session.asistencia IN ('ASISTIO', 'TRUE', 'T', '1')) AS sesiones_realizadas
         FROM tratamientos t
         JOIN sesiones s ON s.id_sesion = $1
         JOIN reservas r ON s.id_reserva = r.id_reserva
         LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
         LEFT JOIN terapeutas ter ON r.id_terapeuta = ter.id_terapeuta
         LEFT JOIN usuarios u ON ter.id_usuario = u.id_usuario
         LEFT JOIN public.predicciones_tratamiento prediction ON prediction.id_prediccion = t.id_prediccion
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
          id_prediccion: r.id_prediccion == null ? null : Number(r.id_prediccion),
          nombre_tratamiento: r.nombre_tratamiento,
          descripcion: r.descripcion,
          area: r.area ?? null,
          mundos_asignados: r.mundos_asignados ?? [],
          frecuencia_semanal: r.frecuencia_semanal == null ? null : Number(r.frecuencia_semanal),
          fonemas_priorizados: Array.isArray(r.fonemas_priorizados) ? r.fonemas_priorizados : [],
          sesiones_realizadas: Number(r.sesiones_realizadas ?? 0),
          ...(user?.rol === 'TERAPEUTA' || user?.rol === 'ADMIN' ? {
            sesiones_modelo_estimadas: r.sesiones_modelo_estimadas == null ? null : Number(r.sesiones_modelo_estimadas),
            modelo_rango_min: r.modelo_rango_min == null ? null : Number(r.modelo_rango_min),
            modelo_rango_max: r.modelo_rango_max == null ? null : Number(r.modelo_rango_max),
            riesgo_desercion_modelo: r.riesgo_desercion_modelo ?? null,
            probabilidad_desercion_modelo: r.probabilidad_desercion_modelo == null ? null : Number(r.probabilidad_desercion_modelo),
            confianza_modelo: r.confianza_modelo == null ? null : Number(r.confianza_modelo),
            estado_prediccion: r.estado_prediccion ?? null,
          } : {}),
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

  async publicarPlan(key: number, data: any, user: AuthenticatedUser) {
    await assertSessionEditAccess(user, key);
    if (Array.isArray(data.fonemas_priorizados) && data.fonemas_priorizados.length > 0 &&
        (!data.mundos_asignados?.includes('HABLA') || !data.mundos_asignados?.includes('LENGUAJE'))) {
      throw Object.assign(
        new Error('Asigna el Taller de los Sonidos (Isla Mágica) y La Isla de las Palabras para activar la práctica dirigida a fonemas.'),
        { status: 400 },
      );
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      const ses = await client.query(
        `SELECT s.estado_sesion, s.asistencia, r.id_paciente, r.id_terapeuta,
                CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) AS paciente_nombre,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) AS terapeuta_nombre
         FROM reservas r
         JOIN sesiones s ON s.id_reserva = r.id_reserva
         LEFT JOIN pacientes p ON p.id_paciente = r.id_paciente
         LEFT JOIN terapeutas ter ON ter.id_terapeuta = r.id_terapeuta
         LEFT JOIN usuarios u ON u.id_usuario = ter.id_usuario
         WHERE s.id_sesion = $1
         FOR UPDATE OF s;`,
        [key],
      );
      const p = ses.rows[0];
      if (!p) throw Object.assign(new Error('No se encontró la sesión para crear el plan.'), { status: 404 });
      if (!isAttendedOrActiveSession(p.estado_sesion, p.asistencia)) {
        throw Object.assign(new Error('Solo se puede publicar un plan para una sesión atendida.'), { status: 409 });
      }
      const report = await client.query(
        `SELECT observaciones_iniciales, objetivos_trabajados, proximos_pasos
         FROM reportes_sesion WHERE id_sesion = $1 FOR UPDATE;`,
        [key],
      );
      const reportRow = report.rows[0];
      if (!reportRow || ![
        reportRow.observaciones_iniciales,
        reportRow.objetivos_trabajados,
        reportRow.proximos_pasos,
      ].some((value) => typeof value === 'string' && value.trim())) {
        throw Object.assign(new Error('Guarda observaciones, objetivos o próximos pasos en el informe antes de publicar el plan.'), { status: 409 });
      }
      const existingPlan = await client.query(
        'SELECT 1 FROM tratamientos WHERE id_sesion_origen = $1 LIMIT 1 FOR UPDATE;',
        [key],
      );
      if (existingPlan.rows.length) {
        throw Object.assign(new Error('Esta sesión ya tiene un plan asociado.'), { status: 409 });
      }

      let prediction: any = null;
      if (data.id_prediccion !== undefined) {
        const predictionResult = await client.query(
          `SELECT id_prediccion, id_sesion, id_paciente, id_terapeuta, sesiones_estimadas, estado_confirmacion
           FROM public.predicciones_tratamiento
           WHERE id_prediccion = $1
           FOR UPDATE;`,
          [data.id_prediccion],
        );
        prediction = predictionResult.rows[0];
        if (!prediction || Number(prediction.id_sesion) !== key || Number(prediction.id_paciente) !== Number(p.id_paciente)) {
          throw Object.assign(new Error('La predicción no corresponde a esta sesión y paciente.'), { status: 409 });
        }
        if (prediction.id_terapeuta != null && Number(prediction.id_terapeuta) !== Number(p.id_terapeuta)) {
          throw Object.assign(new Error('La predicción pertenece a otro terapeuta.'), { status: 403 });
        }
        if (prediction.estado_confirmacion !== 'SUGERIDO') {
          throw Object.assign(new Error('La sugerencia ya fue resuelta.'), { status: 409 });
        }
        const suggestedSessions = Math.round(Number(prediction.sesiones_estimadas));
        if (data.decision_prediccion === 'CONFIRMADO_CLINICO' && data.sesiones_recomendadas !== suggestedSessions) {
          throw Object.assign(new Error('El plan confirmado debe conservar la cantidad sugerida por el modelo.'), { status: 400 });
        }
        if (data.decision_prediccion === 'MODIFICADO_MANUAL' && data.sesiones_recomendadas === suggestedSessions) {
          throw Object.assign(new Error('Selecciona “confirmado” si mantienes la cantidad sugerida.'), { status: 400 });
        }
        if (data.decision_prediccion === 'MODIFICADO_MANUAL' && !data.observaciones_prediccion?.trim()) {
          throw Object.assign(new Error('Explica el ajuste manual de la predicción.'), { status: 400 });
        }
      }
      const pacienteId = p.id_paciente;
      const terapeutaId = p.id_terapeuta;

      // Serialize plan publication per patient so concurrent sessions cannot
      // create two active treatment plans for the same clinical record.
      const patientLock = await client.query(
        'SELECT id_paciente FROM pacientes WHERE id_paciente = $1 FOR UPDATE;',
        [pacienteId],
      );
      if (!patientLock.rows[0]) throw Object.assign(new Error('No se encontró el paciente del plan.'), { status: 404 });

      // Ensure expediente exists.
      let expRes = await client.query(`SELECT id_expediente FROM expedientes WHERE id_paciente = $1 FOR UPDATE;`, [pacienteId]);
      let idExpediente = expRes.rows[0]?.id_expediente;
      if (!idExpediente) {
        const newExp = await client.query(`INSERT INTO expedientes (id_paciente, fecha_apertura) VALUES ($1, NOW()) RETURNING id_expediente;`, [pacienteId]);
        idExpediente = newExp.rows[0]?.id_expediente;
      }
      if (!idExpediente) throw new Error('No se pudo crear o recuperar el expediente del paciente.');

      const activePlan = await client.query(
        `SELECT id_tratamiento FROM tratamientos
         WHERE id_expediente = $1 AND estado_tratamiento = 'ACTIVO' AND id_sesion_origen IS NOT NULL
         ORDER BY fecha_inicio DESC NULLS LAST, id_tratamiento DESC
         LIMIT 1 FOR UPDATE;`,
        [idExpediente],
      );
      if (activePlan.rows[0]) {
        throw Object.assign(
          new Error('El paciente ya tiene un plan activo. Finaliza o actualiza ese plan antes de publicar otro.'),
          { status: 409 },
        );
      }

      const res = await client.query(
        `INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, descripcion, area, mundos_asignados, sesiones_recomendadas, estado_tratamiento, fecha_inicio, id_sesion_origen, id_prediccion, frecuencia_semanal, fonemas_priorizados)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'ACTIVO', CURRENT_DATE, $8, $9, $10, $11::jsonb)
         RETURNING *;`,
        [idExpediente, terapeutaId, data.nombre_tratamiento, data.descripcion ?? null, data.area, JSON.stringify(data.mundos_asignados), data.sesiones_recomendadas, key, data.id_prediccion ?? null, data.frecuencia_semanal, JSON.stringify(data.fonemas_priorizados)]
      );
      const row = res.rows[0];
      await registrarVariablesModeloTratamiento(client, {
        idTratamiento: Number(row.id_tratamiento),
        codigoDiagnostico: data.codigo_diagnostico,
      });
      if (prediction) {
        const confirmation = data.decision_prediccion;
        await client.query(
          `UPDATE public.predicciones_tratamiento
           SET estado_confirmacion = $2::character varying(30),
               sesiones_confirmadas = CASE WHEN $2::character varying(30) = 'DESCARTADO' THEN NULL ELSE $3::integer END,
               observaciones_terapeuta = $4
           WHERE id_prediccion = $1 AND estado_confirmacion = 'SUGERIDO';`,
          [data.id_prediccion, confirmation, data.sesiones_recomendadas, data.observaciones_prediccion ?? null],
        );
      }
      await client.query('COMMIT;');
      return {
        id_tratamiento: row.id_tratamiento,
        id_expediente: row.id_expediente,
        id_paciente: pacienteId,
        id_terapeuta: terapeutaId,
        id_sesion_origen: key,
        nombre_tratamiento: row.nombre_tratamiento,
        descripcion: row.descripcion,
        area: row.area,
        id_prediccion: row.id_prediccion == null ? null : Number(row.id_prediccion),
        mundos_asignados: row.mundos_asignados,
        frecuencia_semanal: Number(row.frecuencia_semanal),
        fonemas_priorizados: Array.isArray(row.fonemas_priorizados) ? row.fonemas_priorizados : [],
        sesiones_recomendadas: row.sesiones_recomendadas,
        estado_tratamiento: row.estado_tratamiento,
        paciente_nombre: p.paciente_nombre?.trim() || 'Paciente',
        terapeuta_nombre: p.terapeuta_nombre?.trim() || 'Terapeuta',
        fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_fin: null,
      };
    } catch (err) {
      await client.query('ROLLBACK;').catch(() => undefined);
      throw err;
    } finally {
      client.release();
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
              past_report.observaciones_iniciales,
              past_report.objetivos_trabajados
       FROM sesiones current_s
       JOIN reservas current_r ON current_r.id_reserva = current_s.id_reserva
       JOIN sesiones past_s ON past_s.id_sesion <> current_s.id_sesion
       JOIN reservas past_r ON past_r.id_reserva = past_s.id_reserva
       JOIN reportes_sesion past_report ON past_report.id_sesion = past_s.id_sesion
       WHERE current_s.id_sesion = $1
         AND past_r.id_paciente = current_r.id_paciente
         AND (NULLIF(BTRIM(past_report.observaciones_iniciales), '') IS NOT NULL
               OR NULLIF(BTRIM(past_report.objetivos_trabajados), '') IS NOT NULL)
       ORDER BY past_r.fecha_hora_inicio DESC
       LIMIT 50;`,
      [idSesion],
    );

    return result.rows.map((row) => ({
      id_sesion: Number(row.id_sesion),
      tipo_cita: row.tipo_cita as 'INTRODUCTORIA' | 'TERAPIA',
      fecha_hora_inicio: new Date(row.fecha_hora_inicio).toISOString(),
      observaciones_iniciales: row.observaciones_iniciales == null ? null : String(row.observaciones_iniciales),
      objetivos_trabajados: row.objetivos_trabajados == null ? null : String(row.objetivos_trabajados),
    }));
  }

}

export const sesionesService = new SesionesService();

export { isMeetingUrl };


import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { PoolClient } from 'pg';
import { analyzeWavSignal, VOICE_SIGNAL_MESSAGE } from '../../backend/src/modules/sesiones/voice-signal.ts';
import { pcm16MonoWav, FamilyPhoneticCaptureStore } from '../../backend/src/modules/sesiones/phonetic-capture.ts';
import { presentarInformeParaFamilia, contenidoInformeParaRol, quitarIndicadoresDelInforme } from '../../backend/src/modules/clinica/services/phoneticIndicators.ts';
import { emitNotificationEvent } from '../../backend/src/modules/notificaciones/notification-events.ts';

const { app } = await import('../../backend/dist/app.js');
const { pool } = await import('../../backend/dist/core/database.js');
const { settings } = await import('../../backend/dist/core/config.js');
const { buildCalendarEventPayload } = await import('../../backend/dist/infrastructure/calendar/google-calendar.service.js');
const { sesionesService } = await import('../../backend/dist/modules/sesiones/sesiones.service.js');
const { migrateClinicaSchema } = await import('../../backend/dist/modules/clinica/clinica.migration.js');
const { migrateNotificacionesSchema } = await import('../../backend/dist/modules/notificaciones/notificaciones.migration.js');

const MEET = 'https://meet.google.com/abc-defg-hij';
const technicalReport = [
  'Se observó buena disposición.',
  '',
  '[Resultado de articulación: análisis clínico]',
  'Objetivo de articulación: Observación del objetivo /rr/',
  'Palabra esperada: carro',
  'Transcripción tentativa del modelo: caro',
  'Resultado revisado por terapeuta: Necesita apoyo con la vibrante. Transcripción revisada: "caro". Resultado del objetivo en esta muestra: en proceso.',
  'Fuente de audio revisada: Micrófono de este dispositivo durante la sesión',
  'Fragmento: 0.00–2.82 s',
  'Indicador de apoyo · sin validación clínica: 75 %',
  '[/Resultado de articulación]',
].join('\n');

function wav(samples: number, amplitude: number, sampleRate = 16000) {
  const pcm = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index += 1) {
    pcm.writeInt16LE(Math.round(Math.sin(index / 8) * amplitude * 32767), index * 2);
  }
  return pcm16MonoWav(pcm, sampleRate);
}

describe('señal de voz del servidor', () => {
  it('rechaza silencio y acepta voz audible con el criterio del medidor', () => {
    const silence = analyzeWavSignal(wav(40_000, 0.0005));
    assert.equal(silence.evaluable, true);
    assert.equal(silence.suficiente, false);
    assert.ok(silence.max_db < 42);
    const voice = analyzeWavSignal(wav(40_000, 0.4));
    assert.equal(voice.suficiente, true);
    assert.match(VOICE_SIGNAL_MESSAGE, /No se escuchó voz con claridad/);
  });

  it('no opina si el WAV no es PCM de 16 bits legible', () => {
    assert.deepEqual(analyzeWavSignal(Buffer.from('no es un wav')), { evaluable: false, max_db: 30, suficiente: true });
  });

  it('la solicitud familiar puede reabrirse para repetir la muestra y limpia el audio', () => {
    const store = new FamilyPhoneticCaptureStore();
    const id = '6d6c6f10-1f0e-4a5c-9f1f-0a4d7a7c9e11';
    store.create({ id_sesion: 4, id_usuario: 1, captura_id: id, palabra_objetivo: 'carro', fonema_objetivo: '/rr/' });
    store.claim(4, 9, id);
    for (let index = 0; index < 8; index += 1) store.append(4, 9, id, index, Buffer.alloc(8_000));
    store.take(4, 9, id);
    assert.equal(store.reopen(4, id, 10), false, 'otra cuenta familiar no puede reabrirla');
    assert.equal(store.reopen(4, id, 9), true);
    assert.equal(store.pending(4, 9)?.estado, 'SOLICITADA');
    store.discardSession(4);
  });
});

describe('reporte legible para la familia', () => {
  it('quita marcadores, fuente, fragmento e indicadores y deja un resumen claro', () => {
    const view = presentarInformeParaFamilia(technicalReport);
    assert.match(view, /Se observó buena disposición\./);
    assert.match(view, /Palabra practicada: Carro\. Resultado: en proceso\. Observación: Necesita apoyo con la vibrante\./);
    for (const forbidden of ['[Resultado', 'Fuente de audio', 'Fragmento', 'Indicador de apoyo', 'Transcripción', 'caro', '0.00']) {
      assert.ok(!view.includes(forbidden), `no debe contener ${forbidden}`);
    }
  });

  it('contenidoInformeParaRol sigue filtrando: la familia solo ve informes firmados y presentados', () => {
    const borrador = { observaciones: technicalReport, objetivos: 'Trabajar /r/', estado: 'BORRADOR' };
    assert.deepEqual(contenidoInformeParaRol(borrador, 'PADRE'), { observaciones: '', objetivos: null });
    assert.equal(contenidoInformeParaRol(borrador, 'TERAPEUTA').observaciones, technicalReport);
    const firmado = contenidoInformeParaRol({ ...borrador, estado: 'FIRMADO' }, 'PADRE');
    assert.equal(firmado.observaciones, presentarInformeParaFamilia(technicalReport));
    assert.ok(!firmado.observaciones.includes('Indicador de apoyo'));
  });

  it('sigue ocultando la etiqueta anterior de los informes ya guardados', () => {
    const legacy = 'Palabra esperada: carro\nSimilitud de texto (indicador de apoyo, sin validación clínica): 75 %';
    assert.equal(quitarIndicadoresDelInforme(legacy), 'Palabra esperada: carro');
  });
});

describe('avisos críticos y calendario', () => {
  it('los avisos críticos no consultan preferencias y los demás tipos las siguen exigiendo', async () => {
    const calls: string[] = [];
    const client = { query: async (sql: string) => { calls.push(sql); return { rows: [], rowCount: 0 }; } } as unknown as Pick<PoolClient, 'query'>;
    await emitNotificationEvent(client, {
      userId: 5, preference: null, type: 'MUESTRA_SOLICITADA', title: 't', text: 'x', reservationId: 8, eventKey: 'k',
    });
    assert.doesNotMatch(calls[0], /preferencias_notificacion/);
    await assert.rejects(emitNotificationEvent(client, {
      userId: 5, preference: 'recordatorio', type: 'SESION_INICIADA', title: 't', text: 'x', reservationId: 8, eventKey: 'k',
    }));
    await assert.rejects(emitNotificationEvent(client, {
      userId: 5, preference: null, type: 'RECORDATORIO', title: 't', text: 'x', reservationId: 8, eventKey: 'k',
    }));
  });

  it('el evento de Calendar no invita a la familia ni solicita conferencia', () => {
    const payload = buildCalendarEventPayload({ topic: 'Cita', startTime: '2026-11-10T15:00:00.000Z', meetUrl: MEET }) as Record<string, unknown>;
    assert.equal('attendees' in payload, false);
    assert.equal('conferenceData' in payload, false);
  });
});

const localDatabaseHost = ['127.0.0.1', 'localhost', '::1'].includes(settings.DB_HOST.toLowerCase());
const isolatedDatabase = /(?:_test|_e2e)$/i.test(settings.DB_NAME);
const canRunDatabaseTests = process.env.ENVIRONMENT === 'test' && localDatabaseHost && isolatedDatabase;

const fx = { users: [] as number[], therapistUser: 0, therapistId: 0, parentUser: 0, tutorId: 0, patientId: 0, reservationId: 0, sessionId: 0 };
let server: Server;
let baseUrl = '';
let mlServer: Server;
let mlTranscription = '';
const previousMl = { enabled: settings.ML_SERVICE_ENABLED, url: settings.ML_SERVICE_URL };

function auth(role: 'TERAPEUTA' | 'PADRE', userId: number): Record<string, string> {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: userId, email: `handoff-${userId}@ashakids.test`, nombres: 'Handoff', apellidos: 'Test', rol: role, roles: [role],
  })).toString('base64');
  return { authorization: `Bearer ${payload}`, 'content-type': 'application/json' };
}

async function user(prefix: string, roleId: number): Promise<number> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const r = await pool.query(
    `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
     VALUES ($1, 'Test', $2, $3, 'test-only', true) RETURNING id_usuario;`,
    [prefix, `h${suffix.slice(-5)}`, `${prefix.toLowerCase()}-${suffix}@ashakids.test`],
  );
  const id = Number(r.rows[0].id_usuario);
  await pool.query('INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, $2, true);', [id, roleId]);
  fx.users.push(id);
  return id;
}

const inbox = async () => {
  const res = await fetch(`${baseUrl}/api/v1/notificaciones`, { headers: auth('PADRE', fx.parentUser) });
  const body = await res.json() as { items: Array<{ tipo: string; id_reserva: number; meet_url: string | null }> };
  return body.items.filter((item) => item.id_reserva === fx.reservationId);
};

describe('traspasos terapeuta-familia con base aislada', {
  skip: !canRunDatabaseTests && 'Requiere ENVIRONMENT=test, PostgreSQL local y una base cuyo nombre termine en _test o _e2e.',
}, () => {
  before(async () => {
    await migrateClinicaSchema();
    await migrateNotificacionesSchema();
    await migrateNotificacionesSchema(); // idempotente
    server = await new Promise<Server>((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
    const addr = server.address();
    if (addr && typeof addr === 'object') baseUrl = `http://127.0.0.1:${addr.port}`;
    mlServer = await new Promise<Server>((resolve) => {
      const s = createServer((req, res) => {
        req.resume();
        req.on('end', () => {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ transcripcion: mlTranscription, duracion_segundos: 2.5, motor_red_neuronal_activa: true }));
        });
      }).listen(0, '127.0.0.1', () => resolve(s));
    });
    const mlAddr = mlServer.address();
    if (mlAddr && typeof mlAddr === 'object') {
      settings.ML_SERVICE_ENABLED = true;
      settings.ML_SERVICE_URL = `http://127.0.0.1:${mlAddr.port}`;
    }
    fx.therapistUser = await user('HandoffTerapeuta', 2);
    fx.parentUser = await user('HandoffPadre', 3);
    fx.therapistId = Number((await pool.query("INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Prueba') RETURNING id_terapeuta;", [fx.therapistUser])).rows[0].id_terapeuta);
    fx.tutorId = Number((await pool.query("INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;", [fx.parentUser])).rows[0].id_tutor);
    fx.patientId = Number((await pool.query(
      "INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo) VALUES ($1, 'Handoff', 'Niño', '2020-01-01', 'M', true) RETURNING id_paciente;",
      [fx.tutorId])).rows[0].id_paciente);
    fx.reservationId = Number((await pool.query(
      `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, meet_url)
       VALUES ($1, $2, NOW() - interval '10 minutes', NOW() + interval '30 minutes', 'VIRTUAL', 'INTRODUCTORIA', 'CONFIRMADA', $3) RETURNING id_reserva;`,
      [fx.patientId, fx.therapistId, MEET])).rows[0].id_reserva);
    fx.sessionId = Number((await pool.query("INSERT INTO sesiones (id_reserva, estado_sesion) VALUES ($1, 'PROGRAMADA') RETURNING id_sesion;", [fx.reservationId])).rows[0].id_sesion);
    await pool.query("INSERT INTO consentimientos_ia (id_paciente, id_usuario_tutor, tipo_consentimiento, estado) VALUES ($1, $2, 'EVALUACION_FONOLOGICA_IA', 'CONCEDIDO');", [fx.patientId, fx.parentUser]);
    // La familia desactivó todos los recordatorios: los avisos críticos deben llegar igual.
    await pool.query(
      `INSERT INTO preferencias_notificacion (id_usuario, nueva_cita, cancelacion, reprogramacion, recordatorio, mensajes)
       VALUES ($1, true, true, true, false, true) ON CONFLICT (id_usuario) DO UPDATE SET recordatorio = false;`,
      [fx.parentUser],
    );
  });

  after(async () => {
    settings.ML_SERVICE_ENABLED = previousMl.enabled;
    settings.ML_SERVICE_URL = previousMl.url;
    sesionesService.descartarCapturasDeSesiones([fx.sessionId]);
    await pool.query('DELETE FROM notificaciones WHERE id_reserva = $1;', [fx.reservationId]);
    await pool.query('DELETE FROM evaluaciones_fonologicas WHERE id_sesion = $1;', [fx.sessionId]);
    await pool.query('DELETE FROM reportes_sesion WHERE id_sesion = $1;', [fx.sessionId]);
    await pool.query('DELETE FROM sesiones WHERE id_sesion = $1;', [fx.sessionId]);
    await pool.query('DELETE FROM reservas WHERE id_reserva = $1;', [fx.reservationId]);
    await pool.query('DELETE FROM consentimientos_ia WHERE id_paciente = $1;', [fx.patientId]);
    await pool.query('DELETE FROM pacientes WHERE id_paciente = $1;', [fx.patientId]);
    await pool.query('DELETE FROM preferencias_notificacion WHERE id_usuario = $1;', [fx.parentUser]);
    await pool.query('DELETE FROM tutores WHERE id_tutor = $1;', [fx.tutorId]);
    await pool.query('DELETE FROM terapeutas WHERE id_terapeuta = $1;', [fx.therapistId]);
    await pool.query('DELETE FROM usuario_roles WHERE id_usuario = ANY($1::int[]);', [fx.users]);
    await pool.query('DELETE FROM usuarios WHERE id_usuario = ANY($1::int[]);', [fx.users]);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await new Promise<void>((resolve) => mlServer.close(() => resolve()));
    await pool.end();
  });

  const therapist = (path: string, init: RequestInit = {}) =>
    fetch(`${baseUrl}/api/v1${path}`, { ...init, headers: { ...auth('TERAPEUTA', fx.therapistUser), ...(init.headers as object | undefined) } });

  it('el aviso de reunión iniciada llega aunque se apagaron los recordatorios', async () => {
    assert.equal((await therapist(`/sesiones/${fx.sessionId}/iniciar`, { method: 'POST' })).status, 200);
    const item = (await inbox()).find((entry) => entry.tipo === 'SESION_INICIADA');
    assert.ok(item, 'debe existir SESION_INICIADA');
    assert.equal(item.meet_url, MEET);
  });

  it('pedir una muestra crea el aviso MUESTRA_SOLICITADA con la cita', async () => {
    const res = await therapist(`/sesiones/${fx.sessionId}/evaluacion-fonema/capturas-familia`, {
      method: 'POST',
      body: JSON.stringify({ captura_id: '0b9f6e0a-6b7c-4c64-8a76-3f0a2f0f1a11', palabra_objetivo: 'carro', fonema_objetivo: '/rr/' }),
    });
    assert.equal(res.status, 201);
    const item = (await inbox()).find((entry) => entry.tipo === 'MUESTRA_SOLICITADA');
    assert.ok(item);
    assert.equal(item.id_reserva, fx.reservationId);
  });

  it('una muestra sin voz se rechaza sin crear evaluación ni llamar a la transcripción', async () => {
    mlTranscription = 'caro';
    await assert.rejects(
      sesionesService.evaluarFonemaEnVivo(fx.sessionId, { audio_bytes: wav(40_000, 0.0005), palabra_objetivo: 'carro', fonema_objetivo: '/rr/' }),
      (error: { status?: number; message?: string; code?: string }) => error.status === 422 && error.message === VOICE_SIGNAL_MESSAGE && error.code === 'SENAL_INSUFICIENTE',
    );
    const rows = await pool.query('SELECT 1 FROM evaluaciones_fonologicas WHERE id_sesion = $1;', [fx.sessionId]);
    assert.equal(rows.rowCount, 0);
  });

  it('una transcripción vacía pide repetir y no crea evaluación', async () => {
    mlTranscription = '';
    await assert.rejects(
      sesionesService.evaluarFonemaEnVivo(fx.sessionId, { audio_bytes: wav(40_000, 0.4), palabra_objetivo: 'carro', fonema_objetivo: '/rr/' }),
      (error: { status?: number; message?: string }) => error.status === 422 && error.message === VOICE_SIGNAL_MESSAGE,
    );
    assert.equal((await pool.query('SELECT 1 FROM evaluaciones_fonologicas WHERE id_sesion = $1;', [fx.sessionId])).rowCount, 0);
  });

  it('las pendientes sobreviven y la lista del terapeuta recalcula indicadores; la familia no las recibe', async () => {
    mlTranscription = 'caro';
    const first = await sesionesService.evaluarFonemaEnVivo(fx.sessionId, { audio_bytes: wav(40_000, 0.4), palabra_objetivo: 'carro', fonema_objetivo: '/rr/' });
    await sesionesService.evaluarFonemaEnVivo(fx.sessionId, { audio_bytes: wav(40_000, 0.4), palabra_objetivo: 'carro', fonema_objetivo: '/rr/' });
    // Un valor guardado distinto no debe prevalecer: se recalcula en el servidor.
    await pool.query("UPDATE evaluaciones_fonologicas SET diagnostico_sugerido = 'valor manipulado', similitud_porcentaje = 1 WHERE id_evaluacion = $1;", [first.id_evaluacion]);
    const res = await therapist(`/clinica/evaluaciones-fonologicas/${fx.patientId}`);
    assert.equal(res.status, 200);
    const rows = await res.json() as Array<{ id_evaluacion: number; estado: string; transcripcion_detectada: string; hipotesis_sugerida: string | null; similitud_texto_porcentaje: number }>;
    const pending = rows.filter((row) => row.estado === 'PENDIENTE_REVISION');
    assert.equal(pending.length, 2);
    const recalculated = pending.find((row) => row.id_evaluacion === first.id_evaluacion)!;
    assert.equal(recalculated.transcripcion_detectada, 'caro');
    assert.equal(recalculated.hipotesis_sugerida, 'Posible rotacismo');
    assert.notEqual(recalculated.similitud_texto_porcentaje, 1);
    const family = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas/${fx.patientId}`, { headers: auth('PADRE', fx.parentUser) });
    assert.deepEqual(await family.json(), []);
  });

  it('firmar el reporte avisa a la familia y su reporte/PDF se ven legibles', async () => {
    const save = await therapist(`/sesiones/${fx.sessionId}/reporte`, {
      method: 'PUT',
      body: JSON.stringify({ observaciones_iniciales: technicalReport, objetivos_trabajados: 'Trabajar /rr/', nivel_ayuda: 'Ayuda moderada', proximos_pasos: 'Practicar en casa' }),
    });
    assert.equal(save.status, 200, await save.clone().text());
    const sign = await therapist(`/sesiones/${fx.sessionId}/reporte/firmar`, { method: 'POST' });
    assert.equal(sign.status, 200, await sign.clone().text());
    const item = (await inbox()).find((entry) => entry.tipo === 'REPORTE_PUBLICADO');
    assert.ok(item);
    const stored = await pool.query('SELECT observaciones_iniciales FROM reportes_sesion WHERE id_sesion = $1;', [fx.sessionId]);
    assert.equal(stored.rows[0].observaciones_iniciales, technicalReport, 'lo guardado no cambia');

    const familyReport = await fetch(`${baseUrl}/api/v1/sesiones/${fx.sessionId}/reporte`, { headers: auth('PADRE', fx.parentUser) });
    const body = await familyReport.json() as { observaciones_iniciales: string };
    assert.match(body.observaciones_iniciales, /Palabra practicada: Carro\./);
    assert.ok(!body.observaciones_iniciales.includes('Fragmento'));
    const therapistReport = await (await therapist(`/sesiones/${fx.sessionId}/reporte`)).json() as { observaciones_iniciales: string };
    assert.equal(therapistReport.observaciones_iniciales, technicalReport);

    const pdf = await fetch(`${baseUrl}/api/v1/sesiones/${fx.sessionId}/reporte/pdf`, { headers: auth('PADRE', fx.parentUser) });
    assert.equal(pdf.status, 200);
    const text = Buffer.from(await pdf.arrayBuffer()).toString('latin1');
    assert.match(text, /Palabra practicada: Carro/);
    assert.ok(!text.includes('Fragmento') && !text.includes('Fuente de audio'));
  });
});

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { app } from '../../backend/dist/app.js';
import { pool } from '../../backend/dist/core/database.js';
import { settings } from '../../backend/dist/core/config.js';
import { migrateClinicaSchema } from '../../backend/dist/modules/clinica/clinica.migration.js';
import type { Server } from 'node:http';

let server: Server;
let baseUrl = '';

const fixture = {
  therapistUserId: 0,
  therapistId: 0,
  parentUserId: 0,
  parentId: 0,
  patientId: 0,
  expedienteId: 0,
  treatmentId: 0,
  reservationId: 0,
  sessionId: 0,
};

function devAuth(role: 'ADMIN' | 'TERAPEUTA' | 'PADRE', userId: number): string {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: userId,
    email: `e2e-${role.toLowerCase()}-${userId}@ashakids.test`,
    nombres: 'E2E',
    apellidos: 'Tester',
    rol: role,
    roles: [role],
  })).toString('base64');
  return `Bearer ${payload}`;
}

const isolatedTestDatabase = /(?:_test|_e2e)$/i.test(settings.DB_NAME);
const localDatabaseHost = ['127.0.0.1', 'localhost', '::1'].includes(settings.DB_HOST.toLowerCase());
const runDatabaseE2E = process.env.ASHAKIDS_RUN_DB_E2E === '1' && settings.ENVIRONMENT === 'test' && localDatabaseHost && isolatedTestDatabase;

async function insertTestUser(prefix: string): Promise<number> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const result = await pool.query<{ id_usuario: number }>(
    `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
     VALUES ($1, 'Test', $2, $3, 'test-only', true) RETURNING id_usuario;`,
    [prefix, `t${suffix.slice(-5)}`, `${prefix.toLowerCase()}-${suffix}@ashakids.test`],
  );
  return Number(result.rows[0].id_usuario);
}

describe('ASHAkids E2E: Flujo Integral de Automatización Fonológica y ML Predictivo', { skip: !runDatabaseE2E && 'Requiere ASHAKIDS_RUN_DB_E2E=1, ENVIRONMENT=test, PostgreSQL local y una base cuyo nombre termine en _test o _e2e.' }, () => {
  before(async () => {
    try {
      await migrateClinicaSchema();
      // Bootstrap HTTP server on ephemeral port
      await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
          const address = server.address();
          if (address && typeof address === 'object') {
            baseUrl = `http://127.0.0.1:${address.port}`;
          }
          resolve();
        });
      });

      // 1. Therapist
      fixture.therapistUserId = await insertTestUser('TerapeutaE2E');
      await pool.query('INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, 2, true);', [fixture.therapistUserId]);
      const thRes = await pool.query<{ id_terapeuta: number }>(
        "INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Habla y Voz') RETURNING id_terapeuta;",
        [fixture.therapistUserId]
      );
      fixture.therapistId = Number(thRes.rows[0].id_terapeuta);

      // 2. Parent
      fixture.parentUserId = await insertTestUser('PadreE2E');
      await pool.query('INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, 3, true);', [fixture.parentUserId]);
      const prRes = await pool.query<{ id_tutor: number }>(
        "INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;",
        [fixture.parentUserId]
      );
      fixture.parentId = Number(prRes.rows[0].id_tutor);

      // 3. Patient
      const ptRes = await pool.query<{ id_paciente: number }>(
        "INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo) VALUES ($1, 'Mateo', 'E2E', '2021-05-10', 'M', true) RETURNING id_paciente;",
        [fixture.parentId]
      );
      fixture.patientId = Number(ptRes.rows[0].id_paciente);

      // 4. Expediente
      const expRes = await pool.query<{ id_expediente: number }>(
        "INSERT INTO expedientes (id_paciente, fecha_apertura) VALUES ($1, NOW()) RETURNING id_expediente;",
        [fixture.patientId]
      );
      fixture.expedienteId = Number(expRes.rows[0].id_expediente);

      // 5. Active Treatment to satisfy fk_reservas_tratamiento
      const trRes = await pool.query<{ id_tratamiento: number }>(
        "INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, estado_tratamiento, fecha_inicio, area, mundos_asignados) VALUES ($1, $2, 'Tratamiento Inicial', 'ACTIVO', CURRENT_DATE, 'HABLA', '[\"HABLA\"]'::jsonb) RETURNING id_tratamiento;",
        [fixture.expedienteId, fixture.therapistId]
      );
      fixture.treatmentId = Number(trRes.rows[0].id_tratamiento);

      // 6. Reservation and Session
      const resRow = await pool.query<{ id_reserva: number }>(
        `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, meet_url)
         VALUES ($1, $2, NOW(), NOW() + INTERVAL '40 minutes', 'ONLINE', 'INTRODUCTORIA', 'CONFIRMADA', 'https://meet.google.com/e2e-asha-test')
         RETURNING id_reserva;`,
        [fixture.patientId, fixture.therapistId]
      );
      fixture.reservationId = Number(resRow.rows[0].id_reserva);

      const sessRow = await pool.query<{ id_sesion: number }>(
        `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion, asistencia)
         VALUES ($1, NOW(), 'EN_CURSO', 'ASISTIO')
         RETURNING id_sesion;`,
        [fixture.reservationId]
      );
      fixture.sessionId = Number(sessRow.rows[0].id_sesion);
    } catch (err) {
      console.error("BEFORE ERROR DETAIL:", err);
      throw err;
    }
  });

  after(async () => {
    // Clean up test data
    try {
      if (fixture.patientId) {
        await pool.query(`DELETE FROM consentimientos_ia WHERE id_paciente = $1`, [fixture.patientId]);
        await pool.query(`DELETE FROM evaluaciones_fonologicas WHERE id_paciente = $1`, [fixture.patientId]);
        await pool.query(`DELETE FROM predicciones_tratamiento WHERE id_paciente = $1`, [fixture.patientId]);
      }
      if (fixture.sessionId) {
        // A plan created by the flow points back to the session and must be
        // removed before the session itself to satisfy its foreign key.
        await pool.query(`DELETE FROM tratamientos WHERE id_sesion_origen = $1`, [fixture.sessionId]);
        await pool.query(`DELETE FROM valoraciones_sesion WHERE id_sesion = $1`, [fixture.sessionId]);
        await pool.query(`DELETE FROM sesiones WHERE id_sesion = $1`, [fixture.sessionId]);
      }
      if (fixture.reservationId) {
        await pool.query(`DELETE FROM reservas WHERE id_reserva = $1`, [fixture.reservationId]);
      }
      if (fixture.treatmentId) {
        await pool.query(`DELETE FROM tratamientos WHERE id_tratamiento = $1`, [fixture.treatmentId]);
      }
      if (fixture.expedienteId) {
        await pool.query(`DELETE FROM expedientes WHERE id_expediente = $1`, [fixture.expedienteId]);
      }
      if (fixture.patientId) {
        await pool.query(`DELETE FROM pacientes WHERE id_paciente = $1`, [fixture.patientId]);
      }
      if (fixture.parentId) {
        await pool.query(`DELETE FROM tutores WHERE id_tutor = $1`, [fixture.parentId]);
      }
      if (fixture.parentUserId) {
        await pool.query(`DELETE FROM usuario_roles WHERE id_usuario = $1`, [fixture.parentUserId]);
        await pool.query(`DELETE FROM usuarios WHERE id_usuario = $1`, [fixture.parentUserId]);
      }
      if (fixture.therapistId) {
        await pool.query(`DELETE FROM terapeutas WHERE id_terapeuta = $1`, [fixture.therapistId]);
      }
      if (fixture.therapistUserId) {
        await pool.query(`DELETE FROM usuario_roles WHERE id_usuario = $1`, [fixture.therapistUserId]);
        await pool.query(`DELETE FROM usuarios WHERE id_usuario = $1`, [fixture.therapistUserId]);
      }
    } finally {
      try {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve()));
          // Node's fetch client keeps HTTP sockets alive. Close them so the
          // integration test process can finish deterministically after cleanup.
          server.closeAllConnections();
        });
      } finally {
        await pool.end();
      }
    }
  });

  it('Paso 1: Consentimiento expreso del tutor para uso de IA', async () => {
    // 1. Inicialmente no hay consentimiento
    const checkRes = await fetch(`${baseUrl}/api/v1/clinica/consentimientos/${fixture.patientId}`, {
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(checkRes.status, 200);
    const initialCheck = await checkRes.json() as { consentido: boolean };
    assert.equal(initialCheck.consentido, false);

    // 2. Padre otorga consentimiento expreso
    const grantRes = await fetch(`${baseUrl}/api/v1/clinica/consentimientos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: devAuth('PADRE', fixture.parentUserId),
      },
      body: JSON.stringify({
        id_paciente: fixture.patientId,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        estado: 'CONCEDIDO',
      }),
    });
    assert.equal(grantRes.status, 201);
    const grantData = await grantRes.json() as { consentido: boolean; estado: string };
    assert.equal(grantData.consentido, true);
    assert.equal(grantData.estado, 'CONCEDIDO');

    // 3. Terapeuta verifica que el menor cuenta con consentimiento activo
    const therapistCheck = await fetch(`${baseUrl}/api/v1/clinica/consentimientos/${fixture.patientId}`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    assert.equal(therapistCheck.status, 200);
    const therapistCheckData = await therapistCheck.json() as { consentido: boolean };
    assert.equal(therapistCheckData.consentido, true);
  });

  it('La revocación detiene y elimina una captura familiar temporal en curso', async () => {
    const captureId = randomUUID();
    const createCapture = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({ captura_id: captureId, palabra_objetivo: 'Carro', fonema_objetivo: '/rr/' }),
    });
    assert.equal(createCapture.status, 201);

    const claim = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/${captureId}/iniciar`, {
      method: 'POST',
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(claim.status, 200);

    const packet = new FormData();
    packet.append('audio', new Blob([new Uint8Array(8_000)], { type: 'application/octet-stream' }), 'paquete.pcm');
    packet.append('numero_paquete', '0');
    const upload = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/${captureId}/paquetes`, {
      method: 'POST',
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: packet,
    });
    assert.equal(upload.status, 200);

    const revoke = await fetch(`${baseUrl}/api/v1/clinica/consentimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify({
        id_paciente: fixture.patientId,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        estado: 'REVOCADO',
      }),
    });
    assert.equal(revoke.status, 201);

    const regrant = await fetch(`${baseUrl}/api/v1/clinica/consentimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify({
        id_paciente: fixture.patientId,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        estado: 'CONCEDIDO',
      }),
    });
    assert.equal(regrant.status, 201);

    const pending = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/pendiente`, {
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(pending.status, 200);
    assert.equal(await pending.json(), null, 'revocation should erase the pending in-memory capture');
  });

  it('Paso 2: Captura familiar sintética, contrato ML y revisión clínica humana', async () => {
    const captureId = randomUUID();
    const therapistAuth = devAuth('TERAPEUTA', fixture.therapistUserId);
    const parentAuth = devAuth('PADRE', fixture.parentUserId);
    const mlBaseUrl = 'http://ml-e2e.synthetic';
    const previousMlEnabled = settings.ML_SERVICE_ENABLED;
    const previousMlUrl = settings.ML_SERVICE_URL;
    const nativeFetch = globalThis.fetch.bind(globalThis);
    let mlRequestValidated = false;

    const request = await nativeFetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: therapistAuth },
      body: JSON.stringify({ captura_id: captureId, palabra_objetivo: 'Carro', fonema_objetivo: '/rr/' }),
    });
    assert.equal(request.status, 201);

    const pending = await nativeFetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/pendiente`, {
      headers: { Authorization: parentAuth },
    });
    assert.equal(pending.status, 200);
    assert.equal((await pending.json() as { estado: string }).estado, 'SOLICITADA');

    const claim = await nativeFetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/${captureId}/iniciar`, {
      method: 'POST',
      headers: { Authorization: parentAuth },
    });
    assert.equal(claim.status, 200);

    // 32,000 zero-valued PCM samples are synthetic test data (2 s at 16 kHz).
    for (let packetNumber = 0; packetNumber < 8; packetNumber += 1) {
      const packet = new FormData();
      packet.append('audio', new Blob([new Uint8Array(8_000)], { type: 'application/octet-stream' }), 'paquete-sintetico.pcm');
      packet.append('numero_paquete', String(packetNumber));
      const upload = await nativeFetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/${captureId}/paquetes`, {
        method: 'POST',
        headers: { Authorization: parentAuth },
        body: packet,
      });
      assert.equal(upload.status, 200);
    }

    settings.ML_SERVICE_ENABLED = true;
    settings.ML_SERVICE_URL = mlBaseUrl;
    globalThis.fetch = async (input, init) => {
      if (String(input) === `${mlBaseUrl}/predict/phonetics`) {
        const formData = init?.body as FormData;
        assert.ok(formData instanceof FormData, 'the backend must send multipart WAV audio');
        assert.equal(formData.get('palabra_objetivo'), 'Carro');
        assert.equal(formData.get('fonema_objetivo'), '/rr/');
        const audio = formData.get('file');
        assert.ok(audio instanceof Blob);
        assert.equal(audio.type, 'audio/wav');
        const wav = Buffer.from(await audio.arrayBuffer());
        assert.equal(wav.subarray(0, 4).toString('ascii'), 'RIFF');
        assert.equal(wav.readUInt32LE(24), 16_000);
        assert.equal(wav.readUInt32LE(40), 64_000);
        mlRequestValidated = true;
        return new Response(JSON.stringify({
          transcripcion: 'carro',
          duracion_segundos: 2,
          motor_red_neuronal_activa: true,
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return nativeFetch(input, init);
    };

    let evalData: { id_evaluacion: number; fonema_objetivo: string; estado: string };
    try {
      const finalize = await nativeFetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/${captureId}/finalizar`, {
        method: 'POST',
        headers: { Authorization: parentAuth },
      });
      assert.equal(finalize.status, 200);
      assert.equal((await finalize.json() as { estado: string }).estado, 'ENVIADA');
      assert.equal(mlRequestValidated, true, 'the capture must reach the synthetic ML contract');

      const result = await nativeFetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/evaluacion-fonema/capturas-familia/${captureId}/resultado`, {
        headers: { Authorization: therapistAuth },
      });
      assert.equal(result.status, 200);
      const captureResult = await result.json() as {
        estado: string;
        resultado?: { id_evaluacion: number; transcripcion_tentativa: string; estado: string };
      };
      assert.equal(captureResult.estado, 'COMPLETADA');
      assert.ok(captureResult.resultado);
      assert.equal(captureResult.resultado.estado, 'PENDIENTE_REVISION');
      assert.equal(captureResult.resultado.transcripcion_tentativa, 'carro');

      evalData = {
        id_evaluacion: captureResult.resultado.id_evaluacion,
        fonema_objetivo: '/rr/',
        estado: captureResult.resultado.estado,
      };
    } finally {
      globalThis.fetch = nativeFetch;
      settings.ML_SERVICE_ENABLED = previousMlEnabled;
      settings.ML_SERVICE_URL = previousMlUrl;
    }

    assert.ok(evalData.id_evaluacion > 0);
    assert.equal(evalData.fonema_objetivo, '/rr/');
    assert.equal(evalData.estado, 'PENDIENTE_REVISION');

    const reviewRes = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas/${evalData.id_evaluacion}/revision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({
        estado: 'CONFIRMADO_TERAPEUTA',
        transcripcion_revisada: 'carro',
        observacion_terapeuta: 'Registro sintético de integración para verificar la revisión humana.',
        resultado_clinico: 'ALCANZADO',
      }),
    });
    assert.equal(reviewRes.status, 200);

    // Consultar historial de evaluaciones del paciente
    const listRes = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas/${fixture.patientId}`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json() as Array<{ fonema_objetivo: string; palabra_objetivo: string; estado: string; transcripcion_revisada: string | null }>;
    assert.ok(listData.length >= 1);
    assert.equal(listData[0].fonema_objetivo, '/rr/');
    assert.equal(listData[0].palabra_objetivo, 'Carro');
    assert.equal(listData[0].estado, 'CONFIRMADO_TERAPEUTA');
    assert.equal(listData[0].transcripcion_revisada, 'carro');

    const reportRes = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/reporte`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({
        observaciones_iniciales: 'Evaluación de integración sintética.',
        objetivos_trabajados: 'Se revisó una muestra fonológica.',
        nivel_ayuda: 'Ayuda mínima',
        proximos_pasos: 'Continuar el plan con revisión del terapeuta.',
      }),
    });
    assert.equal(reportRes.status, 200);

    const signed = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/reporte/firmar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({}),
    });
    assert.equal(signed.status, 200);
    assert.equal((await signed.json() as { estado_reporte: string }).estado_reporte, 'FIRMADO');

    const parentReport = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/reporte`, {
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(parentReport.status, 200);
    assert.equal((await parentReport.json() as { estado_reporte: string }).estado_reporte, 'FIRMADO');

    const parentPdf = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/reporte/pdf`, {
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(parentPdf.status, 200);
    assert.match(parentPdf.headers.get('content-type') ?? '', /application\/pdf/i);
    assert.equal(Buffer.from(await parentPdf.arrayBuffer()).subarray(0, 5).toString('ascii'), '%PDF-');
  });

  it('Paso 3 y 4: El predictor solo responde con un artefacto clínicamente aprobado', async () => {
    const predictorRequest = {
      id_sesion: fixture.sessionId,
      codigo_diagnostico: 1,
      frecuencia_semanal: 2,
    };
    const achievedOnly = await fetch(`${baseUrl}/api/v1/clinica/tratamientos/predecir-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify(predictorRequest),
    });
    assert.equal(achievedOnly.status, 409, 'ALCANZADO no debe contar como fonema afectado para el predictor');

    const secondEvaluation = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({
        id_sesion: fixture.sessionId,
        id_paciente: fixture.patientId,
        fonema_objetivo: '/s/',
        palabra_objetivo: 'sol',
        transcripcion_detectada: 'sol',
        origen_evaluacion: 'CLINICO',
      }),
    });
    assert.equal(secondEvaluation.status, 201);
    const secondEvaluationData = await secondEvaluation.json() as { id_evaluacion: number };
    const secondReview = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas/${secondEvaluationData.id_evaluacion}/revision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({ estado: 'CONFIRMADO_TERAPEUTA', transcripcion_revisada: 'sol', observacion_terapeuta: 'Resultado de revisión sintética para integración.', resultado_clinico: 'REQUIERE_APOYO' }),
    });
    assert.equal(secondReview.status, 200);

    const catalogRes = await fetch(`${baseUrl}/api/v1/clinica/tratamientos/predictor-catalog`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    if (catalogRes.status === 503) {
      const unavailablePrediction = await fetch(`${baseUrl}/api/v1/clinica/tratamientos/predecir-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
        body: JSON.stringify({
          id_sesion: fixture.sessionId,
          codigo_diagnostico: 1,
          frecuencia_semanal: 2,
        }),
      });
      const unavailableData = await unavailablePrediction.json() as { error?: string };
      assert.equal(unavailablePrediction.status, 503, unavailableData.error);
      return;
    }
    assert.equal(catalogRes.status, 200);
    const catalog = await catalogRes.json() as { version_modelo: string; diagnosis_codes: Array<{ code: number; label: string }> };
    assert.ok(catalog.version_modelo.length > 0);
    assert.equal(catalog.diagnosis_codes.length, 5);

    const predRes = await fetch(`${baseUrl}/api/v1/clinica/tratamientos/predecir-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: devAuth('TERAPEUTA', fixture.therapistUserId),
      },
      body: JSON.stringify({
        id_sesion: fixture.sessionId,
        codigo_diagnostico: catalog.diagnosis_codes[0].code,
        frecuencia_semanal: 2,
      }),
    });
    assert.equal(predRes.status, 200);
    const pred = await predRes.json() as {
      sesiones_estimadas: number;
      rango_min: number;
      rango_max: number;
      riesgo_desercion: string;
      confianza: number;
      probabilidad_desercion: number;
      advertencia_clinica: string;
    };

    // Validaciones del modelo estadístico
    assert.ok(pred.sesiones_estimadas >= 1 && pred.sesiones_estimadas <= 31);
    assert.ok(pred.rango_min <= pred.sesiones_estimadas);
    assert.ok(pred.rango_max >= pred.sesiones_estimadas);
    assert.ok(['BAJO', 'MEDIO', 'ALTO'].includes(pred.riesgo_desercion));
    assert.ok(pred.confianza >= 0 && pred.confianza <= 1);
    assert.ok(pred.probabilidad_desercion >= 0 && pred.probabilidad_desercion <= 1);
    assert.ok(pred.advertencia_clinica.length > 10);
  });

  it('Registra participación lúdica idempotente sin otorgar XP ni cambiar resultados clínicos', async () => {
    const activityKey = randomUUID();
    const requestBody = {
      clave_intento: activityKey,
      version: 'adaptive-1',
      actividad: 'sound:explore',
      duracion_segundos: 47,
      completada: true,
    };
    const endpoint = `${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos/HABLA/actividades`;
    const first = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify(requestBody),
    });
    assert.equal(first.status, 200);
    const firstData = await first.json() as { id_actividad: number; repetida: boolean };
    assert.ok(firstData.id_actividad > 0);
    assert.equal(firstData.repetida, false);

    const repeated = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify(requestBody),
    });
    assert.equal(repeated.status, 200);
    const repeatedData = await repeated.json() as { id_actividad: number; repetida: boolean };
    assert.equal(repeatedData.id_actividad, firstData.id_actividad);
    assert.equal(repeatedData.repetida, true);

    const progressResponse = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos`, {
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(progressResponse.status, 200);
    const progress = await progressResponse.json() as {
      experiencia: number;
      intentos_totales: number;
      mundos: Array<{ id: string; completados: number[]; medalla: boolean; intentos: number }>;
    };
    const speechWorld = progress.mundos.find((world) => world.id === 'HABLA');
    assert.equal(progress.experiencia, 0);
    assert.equal(progress.intentos_totales, 0, 'adaptive participation is not a scored level attempt');
    assert.equal(speechWorld?.intentos, 0);
    assert.deepEqual(speechWorld?.completados, []);
    assert.equal(speechWorld?.medalla, false);

    const analyticsResponse = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/analiticas/fonemas`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    assert.equal(analyticsResponse.status, 200);
    const analytics = await analyticsResponse.json() as { actividades_adaptativas: Array<{ mundo: string; actividad: string; intentos: number; completadas: number; duracion_segundos: number }> };
    const activity = analytics.actividades_adaptativas.find((item) => item.mundo === 'HABLA' && item.actividad === 'sound:explore');
    assert.ok(activity);
    assert.equal(activity.intentos, 1);
    assert.equal(activity.completadas, 1);
    assert.equal(activity.duracion_segundos, 47);
  });

  it('Paso 5 y 6: Una sugerencia predictiva no cambia el tratamiento sin decisión del terapeuta', async () => {
    const trRes = await pool.query<{
      sesiones_recomendadas: number;
      mundos_asignados: string[];
      estado_tratamiento: string;
    }>(
      `SELECT sesiones_recomendadas, mundos_asignados, estado_tratamiento
       FROM tratamientos WHERE id_tratamiento = $1`,
      [fixture.treatmentId]
    );
    const treatment = trRes.rows[0];
    assert.equal(treatment.estado_tratamiento, 'ACTIVO');
    assert.equal(treatment.sesiones_recomendadas, null);

    // La asignación previa se conserva hasta que el terapeuta publique un plan.
    const mundos = typeof treatment.mundos_asignados === 'string'
      ? JSON.parse(treatment.mundos_asignados)
      : treatment.mundos_asignados;
    assert.deepEqual(mundos, ['HABLA']);
  });

  it('publica un plan manual y enlaza su foco con el Laberinto y la analítica lúdica', async () => {
    const pendingPrediction = await pool.query<{ id_prediccion: number }>(
      `SELECT id_prediccion FROM predicciones_tratamiento
       WHERE id_sesion = $1 AND estado_confirmacion = 'SUGERIDO'
       ORDER BY id_prediccion DESC LIMIT 1`,
      [fixture.sessionId],
    );
    const predictionDecision = pendingPrediction.rows[0]
      ? { id_prediccion: Number(pendingPrediction.rows[0].id_prediccion), decision_prediccion: 'DESCARTADO' }
      : {};
    const planData = {
      nombre_tratamiento: 'Plan manual de integración',
      descripcion: '[LÍNEA BASE CONFIRMADA]\nRegistro sintético revisado.\n\n[OBJETIVOS DEL PLAN]\nPracticar /rr/, /r/, /s/, /pl/ y /tr/.\n\n[ACTIVIDADES DEL PLAN]\nJuegos de Isla Mágica, La Isla de las Palabras y el Laberinto de Trabalenguas.',
      area: 'HABLA',
      mundos_asignados: ['HABLA', 'LENGUAJE'],
      sesiones_recomendadas: 8,
      frecuencia_semanal: 2,
      fonemas_priorizados: ['/rr/', '/r/', '/s/', '/pl/', '/tr/'],
      ...predictionDecision,
    };
    const missingIsland = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({ ...planData, mundos_asignados: ['LENGUAJE'] }),
    });
    assert.equal(missingIsland.status, 400, 'un plan fonológico debe asignar tanto Isla Mágica como el mundo de palabras');
    const response = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify(planData),
    });
    assert.equal(response.status, 201);
    const plan = await response.json() as { id_tratamiento: number; id_sesion_origen: number; mundos_asignados: string[] };
    assert.ok(plan.id_tratamiento > 0);
    assert.equal(plan.id_sesion_origen, fixture.sessionId);
    assert.deepEqual(plan.mundos_asignados, ['HABLA', 'LENGUAJE']);

    const savedPlan = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/plan`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    assert.equal(savedPlan.status, 200);
    const savedPlanData = await savedPlan.json() as { id_tratamiento: number; sesiones_realizadas: number; estado_prediccion?: string };
    assert.equal(savedPlanData.id_tratamiento, plan.id_tratamiento);
    assert.equal(savedPlanData.sesiones_realizadas, 0);
    if (predictionDecision.id_prediccion) assert.equal(savedPlanData.estado_prediccion, 'DESCARTADO');

    const familyProgressResponse = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos`, {
      headers: { Authorization: devAuth('PADRE', fixture.parentUserId) },
    });
    assert.equal(familyProgressResponse.status, 200);
    const familyProgress = await familyProgressResponse.json() as {
      mundos: Array<{
        id: string;
        asignado: boolean;
        recomendado_esta_semana: boolean;
        fonemas_recomendados: string[];
        levels: Array<{ number: number; fonema_objetivo?: string; choices: string[] }>;
      }>;
    };
    assert.equal(familyProgress.mundos.length, 5, 'el plan se presenta dentro del catálogo de cinco mundos');
    assert.deepEqual(new Set(familyProgress.mundos.filter((world) => world.asignado).map((world) => world.id)), new Set(['HABLA', 'LENGUAJE']));
    const languageWorld = familyProgress.mundos.find((world) => world.id === 'LENGUAJE');
    assert.equal(languageWorld?.asignado, true);
    assert.equal(languageWorld?.recomendado_esta_semana, true);
    assert.deepEqual(languageWorld?.fonemas_recomendados, ['/rr/', '/r/', '/s/', '/pl/', '/tr/']);
    const speechWorld = familyProgress.mundos.find((world) => world.id === 'HABLA');
    assert.equal(speechWorld?.asignado, true);
    assert.equal(speechWorld?.recomendado_esta_semana, true);
    assert.deepEqual(speechWorld?.fonemas_recomendados, ['/rr/', '/r/', '/s/', '/pl/', '/tr/']);
    const recommendedIslandLevel = speechWorld?.levels.find((level) => level.number === 5);
    assert.equal(recommendedIslandLevel?.fonema_objetivo, '/r/');
    const recommendedLabyrinthLevel = languageWorld?.levels.find((level) => level.number === 18);
    assert.equal(recommendedLabyrinthLevel?.fonema_objetivo, '/r/');
    assert.deepEqual(recommendedLabyrinthLevel?.choices, ['Caracol', 'Mariposa', 'Gato']);
    const recommendedClusterLevel = languageWorld?.levels.find((level) => level.number === 27);
    assert.equal(recommendedClusterLevel?.fonema_objetivo, '/tr/');
    assert.deepEqual(recommendedClusterLevel?.choices, ['Tren', 'Barco', 'Avión']);

    const labyrinthAttempt = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos/LENGUAJE/intentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify({
        clave_intento: randomUUID(),
        version: 'basica-1',
        nivel: 18,
        respuestas: ['Caracol'],
        duracion_segundos: 29,
        ayudas_usadas: 0,
      }),
    });
    assert.equal(labyrinthAttempt.status, 200);
    const labyrinthAttemptData = await labyrinthAttempt.json() as {
      correcto: boolean;
      resumen: { mundos: Array<{ id: string; completados: number[] }> };
    };
    assert.equal(labyrinthAttemptData.correcto, true);
    assert.ok(labyrinthAttemptData.resumen.mundos.find((world) => world.id === 'LENGUAJE')?.completados.includes(18));

    const clusterLabyrinthAttempt = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos/LENGUAJE/intentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify({
        clave_intento: randomUUID(),
        version: 'basica-1',
        nivel: 27,
        respuestas: ['Tren'],
        duracion_segundos: 24,
        ayudas_usadas: 0,
      }),
    });
    assert.equal(clusterLabyrinthAttempt.status, 200);
    const clusterLabyrinthData = await clusterLabyrinthAttempt.json() as {
      correcto: boolean;
      resumen: { mundos: Array<{ id: string; completados: number[] }> };
    };
    assert.equal(clusterLabyrinthData.correcto, true);
    assert.ok(clusterLabyrinthData.resumen.mundos.find((world) => world.id === 'LENGUAJE')?.completados.includes(27));

    const islandAttempt = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos/HABLA/intentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify({
        clave_intento: randomUUID(),
        version: 'basica-1',
        nivel: 5,
        respuestas: ['Caracol'],
        duracion_segundos: 21,
        ayudas_usadas: 0,
      }),
    });
    assert.equal(islandAttempt.status, 200);
    const islandAttemptData = await islandAttempt.json() as {
      correcto: boolean;
      resumen: { mundos: Array<{ id: string; completados: number[] }> };
    };
    assert.equal(islandAttemptData.correcto, true);
    assert.ok(islandAttemptData.resumen.mundos.find((world) => world.id === 'HABLA')?.completados.includes(5));

    const activity = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/juegos/LENGUAJE/actividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('PADRE', fixture.parentUserId) },
      body: JSON.stringify({
        clave_intento: randomUUID(),
        version: 'adaptive-1',
        actividad: 'word:memory',
        duracion_segundos: 32,
        completada: true,
      }),
    });
    assert.equal(activity.status, 200);

    const analyticsResponse = await fetch(`${baseUrl}/api/v1/pacientes/${fixture.patientId}/analiticas/fonemas`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    assert.equal(analyticsResponse.status, 200);
    const analytics = await analyticsResponse.json() as {
      actividades_adaptativas: Array<{ mundo: string; actividad: string; completadas: number; duracion_segundos: number }>;
      practica_ludica: Array<{ mundo: string; nivel: number; fonema_objetivo: string; intentos: number; respuestas_correctas: number }>;
    };
    const languageActivity = analytics.actividades_adaptativas.find((item) => item.mundo === 'LENGUAJE' && item.actividad === 'word:memory');
    assert.ok(languageActivity);
    assert.equal(languageActivity.completadas, 1);
    assert.equal(languageActivity.duracion_segundos, 32);
    const islandPractice = analytics.practica_ludica.find((item) => item.mundo === 'HABLA' && item.nivel === 5);
    assert.deepEqual(islandPractice && {
      mundo: islandPractice.mundo,
      nivel: islandPractice.nivel,
      fonema_objetivo: islandPractice.fonema_objetivo,
      intentos: islandPractice.intentos,
      respuestas_correctas: islandPractice.respuestas_correctas,
    }, { mundo: 'HABLA', nivel: 5, fonema_objetivo: '/r/', intentos: 1, respuestas_correctas: 1 });
    const labyrinthPractice = analytics.practica_ludica.find((item) => item.mundo === 'LENGUAJE' && item.nivel === 18);
    assert.deepEqual(labyrinthPractice && {
      mundo: labyrinthPractice.mundo,
      nivel: labyrinthPractice.nivel,
      fonema_objetivo: labyrinthPractice.fonema_objetivo,
      intentos: labyrinthPractice.intentos,
      respuestas_correctas: labyrinthPractice.respuestas_correctas,
    }, { mundo: 'LENGUAJE', nivel: 18, fonema_objetivo: '/r/', intentos: 1, respuestas_correctas: 1 });
    const clusterLabyrinthPractice = analytics.practica_ludica.find((item) => item.mundo === 'LENGUAJE' && item.nivel === 27);
    assert.deepEqual(clusterLabyrinthPractice && {
      mundo: clusterLabyrinthPractice.mundo,
      nivel: clusterLabyrinthPractice.nivel,
      fonema_objetivo: clusterLabyrinthPractice.fonema_objetivo,
      intentos: clusterLabyrinthPractice.intentos,
      respuestas_correctas: clusterLabyrinthPractice.respuestas_correctas,
    }, { mundo: 'LENGUAJE', nivel: 27, fonema_objetivo: '/tr/', intentos: 1, respuestas_correctas: 1 });
  });

  it('persists attendance in the API contract and blocks prediction for a no-show', async () => {
    const closeResponse = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({ asistencia: 'ASISTIO' }),
    });
    assert.equal(closeResponse.status, 200);
    const closed = await closeResponse.json() as { estado_sesion: string; asistencia: string };
    assert.equal(closed.estado_sesion, 'FINALIZADA');
    assert.equal(closed.asistencia, 'ASISTIO');

    const persisted = await pool.query<{ estado_sesion: string; asistencia: string; estado_reserva: string }>(
      `SELECT s.estado_sesion, s.asistencia, r.estado_reserva
       FROM sesiones s JOIN reservas r ON r.id_reserva = s.id_reserva
       WHERE s.id_sesion = $1`,
      [fixture.sessionId],
    );
    assert.equal(persisted.rows[0]?.estado_sesion, 'FINALIZADA');
    assert.equal(persisted.rows[0]?.asistencia, 'ASISTIO');
    assert.equal(persisted.rows[0]?.estado_reserva, 'COMPLETADA');

    const refreshed = await fetch(`${baseUrl}/api/v1/sesiones/${fixture.sessionId}`, {
      headers: { Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
    });
    assert.equal(refreshed.status, 200);
    assert.equal((await refreshed.json() as { asistencia: string }).asistencia, 'ASISTIO');

    await pool.query("UPDATE sesiones SET asistencia = 'NO_ASISTIO' WHERE id_sesion = $1", [fixture.sessionId]);
    const noShowPrediction = await fetch(`${baseUrl}/api/v1/clinica/tratamientos/predecir-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: devAuth('TERAPEUTA', fixture.therapistUserId) },
      body: JSON.stringify({ id_sesion: fixture.sessionId, codigo_diagnostico: 1, frecuencia_semanal: 2 }),
    });
    assert.equal(noShowPrediction.status, 409);
    const noShowData = await noShowPrediction.json() as { error?: string };
    assert.equal(noShowData.error, 'El pronóstico requiere una sesión atendida.');
  });
});

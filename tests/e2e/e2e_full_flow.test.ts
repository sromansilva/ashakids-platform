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
const runDatabaseE2E = process.env.ASHAKIDS_RUN_DB_E2E === '1' && settings.ENVIRONMENT === 'test' && isolatedTestDatabase;

async function insertTestUser(prefix: string): Promise<number> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const result = await pool.query<{ id_usuario: number }>(
    `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
     VALUES ($1, 'Test', $2, $3, 'test-only', true) RETURNING id_usuario;`,
    [prefix, `t${suffix.slice(-5)}`, `${prefix.toLowerCase()}-${suffix}@ashakids.test`],
  );
  return Number(result.rows[0].id_usuario);
}

describe('ASHAkids E2E: Flujo Integral de Automatización Fonológica y ML Predictivo', { skip: !runDatabaseE2E && 'Requiere ASHAKIDS_RUN_DB_E2E=1, ENVIRONMENT=test y una base cuyo nombre termine en _test o _e2e.' }, () => {
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
    if (fixture.patientId) {
      await pool.query(`DELETE FROM consentimientos_ia WHERE id_paciente = $1`, [fixture.patientId]);
      await pool.query(`DELETE FROM evaluaciones_fonologicas WHERE id_paciente = $1`, [fixture.patientId]);
      await pool.query(`DELETE FROM predicciones_tratamiento WHERE id_paciente = $1`, [fixture.patientId]);
    }
    if (fixture.sessionId) {
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

    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await pool.end();
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

  it('Paso 2: Registro de transcripción y revisión clínica sin simular medición acústica', async () => {
    const evalRes = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: devAuth('TERAPEUTA', fixture.therapistUserId),
      },
      body: JSON.stringify({
        id_sesion: fixture.sessionId,
        id_paciente: fixture.patientId,
        fonema_objetivo: '/rr/',
        palabra_objetivo: 'carro',
        transcripcion_detectada: 'carro',
        origen_evaluacion: 'CLINICO',
      }),
    });
    assert.equal(evalRes.status, 201);
    const evalData = await evalRes.json() as { id_evaluacion: number; fonema_objetivo: string; estado: string };
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
  });

  it('Paso 3 y 4: El predictor solo responde con un artefacto clínicamente aprobado', async () => {
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
});

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../backend/dist/app.js';
import { pool } from '../../backend/dist/core/database.js';
import type { Server } from 'node:http';

let server: Server;
let baseUrl = '';
const accessFixture: {
  therapistUserId?: number;
  therapistId?: number;
  otherParentUserId?: number;
  otherTutorId?: number;
  sharedPatientId?: number;
  cancelledOnlyPatientId?: number;
  unrelatedPatientId?: number;
  reservationIds: number[];
  sessionIds: number[];
} = { reservationIds: [], sessionIds: [] };

function devAuth(role: 'ADMIN' | 'TERAPEUTA' | 'PADRE', userId: number): string {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: userId,
    email: `api-test-${userId}@ashakids.test`,
    nombres: 'API',
    apellidos: 'Test',
    rol: role,
    roles: [role],
  })).toString('base64');
  return `Bearer ${payload}`;
}

async function insertTestUser(prefix: string): Promise<number> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const result = await pool.query(
    `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
     VALUES ($1, 'Test', $2, $3, 'test-only', true) RETURNING id_usuario;`,
    [prefix, `t${suffix.slice(-5)}`, `${prefix.toLowerCase()}-${suffix}@ashakids.test`],
  );
  return Number(result.rows[0].id_usuario);
}

async function insertTestPatient(tutorId: number, name: string): Promise<number> {
  const result = await pool.query(
    `INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo)
     VALUES ($1, $2, 'Prueba', '2020-01-01', 'M', true) RETURNING id_paciente;`,
    [tutorId, name],
  );
  return Number(result.rows[0].id_paciente);
}

async function insertTestReservation(patientId: number, therapistId: number, state: string): Promise<number> {
  const result = await pool.query(
    `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva)
     VALUES ($1, $2, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 40 minutes', 'ONLINE', 'INTRODUCTORIA', $3)
     RETURNING id_reserva;`,
    [patientId, therapistId, state],
  );
  const id = Number(result.rows[0].id_reserva);
  accessFixture.reservationIds.push(id);
  return id;
}

async function insertTestSession(reservationId: number): Promise<number> {
  const result = await pool.query(
    `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion)
     VALUES ($1, NOW(), 'FINALIZADA') RETURNING id_sesion;`,
    [reservationId],
  );
  const id = Number(result.rows[0].id_sesion);
  accessFixture.sessionIds.push(id);
  return id;
}

async function createClinicalAccessFixture(): Promise<void> {
  accessFixture.therapistUserId = await insertTestUser('Aislamiento terapeuta');
  await pool.query(
    `INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, 2, true);`,
    [accessFixture.therapistUserId],
  );
  const therapist = await pool.query(
    `INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Prueba') RETURNING id_terapeuta;`,
    [accessFixture.therapistUserId],
  );
  accessFixture.therapistId = Number(therapist.rows[0].id_terapeuta);

  accessFixture.otherParentUserId = await insertTestUser('Tutor ajeno');
  await pool.query(
    `INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, 3, true);`,
    [accessFixture.otherParentUserId],
  );
  const tutor = await pool.query(
    `INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;`,
    [accessFixture.otherParentUserId],
  );
  accessFixture.otherTutorId = Number(tutor.rows[0].id_tutor);

  accessFixture.sharedPatientId = await insertTestPatient(1, 'Paciente compartido');
  accessFixture.cancelledOnlyPatientId = await insertTestPatient(1, 'Paciente cancelado');
  accessFixture.unrelatedPatientId = await insertTestPatient(accessFixture.otherTutorId, 'Paciente ajeno');

  const oldTherapistCancelledReservation = await insertTestReservation(
    accessFixture.sharedPatientId,
    1,
    'CANCELADA',
  );
  await insertTestSession(oldTherapistCancelledReservation);
  const sharedTherapistReservation = await insertTestReservation(
    accessFixture.sharedPatientId,
    accessFixture.therapistId,
    'CONFIRMADA',
  );
  await insertTestSession(sharedTherapistReservation);
  await insertTestReservation(accessFixture.cancelledOnlyPatientId, accessFixture.therapistId, 'CANCELADA');
  await insertTestReservation(accessFixture.unrelatedPatientId, 1, 'CONFIRMADA');
}

async function cleanupClinicalAccessFixture(): Promise<void> {
  if (accessFixture.sessionIds.length) {
    await pool.query('DELETE FROM sesiones WHERE id_sesion = ANY($1::int[]);', [accessFixture.sessionIds]);
  }
  if (accessFixture.reservationIds.length) {
    await pool.query('DELETE FROM reservas WHERE id_reserva = ANY($1::int[]);', [accessFixture.reservationIds]);
  }
  const patientIds = [accessFixture.sharedPatientId, accessFixture.cancelledOnlyPatientId, accessFixture.unrelatedPatientId]
    .filter((id): id is number => typeof id === 'number');
  if (patientIds.length) await pool.query('DELETE FROM pacientes WHERE id_paciente = ANY($1::int[]);', [patientIds]);
  if (accessFixture.otherTutorId) await pool.query('DELETE FROM tutores WHERE id_tutor = $1;', [accessFixture.otherTutorId]);
  if (accessFixture.therapistUserId) await pool.query('DELETE FROM usuarios WHERE id_usuario = $1;', [accessFixture.therapistUserId]);
  if (accessFixture.otherParentUserId) await pool.query('DELETE FROM usuarios WHERE id_usuario = $1;', [accessFixture.otherParentUserId]);
}

function startServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

describe('ASHAKids Modular TypeScript Backend Tests', () => {
  before(async () => {
    await startServer();
    await createClinicalAccessFixture();
  });

  after(async () => {
    await cleanupClinicalAccessFixture();
    await stopServer();
    await pool.end();
  });

  it('1. Health Check & Root System Info', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok(data.timestamp);

    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const rootData = await rootRes.json();
    assert.equal(rootData.status, 'ok');
  });

  it('2. Auth Module: Validates DTO and logs in with proper role and user code', async () => {
    // Missing identifier validation failure
    const badRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '123' }),
    });
    assert.equal(badRes.status, 400);

    // Valid login as admin with user code
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_usuario: 'a00001', password: '12345' }),
    });
    assert.equal(loginRes.status, 200);
    const body = await loginRes.json();
    assert.ok(body.token);
    assert.ok(body.user);
    assert.equal(body.user.rol, 'ADMIN');
    assert.equal(body.user.codigo_usuario, 'a00001');
  });

  it('3. Admin Module: Requires ADMIN role and lists accounts', async () => {
    // Without token should fail 401
    const unauthRes = await fetch(`${baseUrl}/api/v1/admin/cuentas`);
    assert.equal(unauthRes.status, 401);

    // With mock admin header
    const authRes = await fetch(`${baseUrl}/api/v1/admin/cuentas`, {
      headers: { 'x-mock-role': 'ADMIN' },
    });
    assert.equal(authRes.status, 200);
    const data = await authRes.json();
    assert.ok(Array.isArray(data.items));
    assert.ok(data.total >= 1);
  });

  it('4. Role Protection: PADRE cannot access ADMIN module', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/cuentas`, {
      headers: { 'x-mock-role': 'PADRE' },
    });
    assert.equal(res.status, 403);
  });

  it('5. Terapeuta Module: Manages availability and clinical reports', async () => {
    const res = await fetch(`${baseUrl}/api/v1/terapeutas/disponibilidad`, {
      headers: { 'x-mock-role': 'TERAPEUTA' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.slots));
  });

  it('6. Padre Module: Lists children and handles registration DTO', async () => {
    const res = await fetch(`${baseUrl}/api/v1/padres/hijos`, {
      headers: { 'x-mock-role': 'PADRE' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  it('7. Agenda Module: Rejects a parent booking for a child they do not own', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agenda/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mock-role': 'PADRE',
      },
      body: JSON.stringify({
        id_paciente: 1,
        id_terapeuta: 2,
        fecha: '2026-10-30',
        hora_inicio: '11:00',
        motivo: 'Evaluación fonológica',
      }),
    });
    assert.equal(res.status, 404);
  });

  it('8. Mundo Asha Module: Returns worlds catalog and validates voice recognition input', async () => {
    const mundosRes = await fetch(`${baseUrl}/api/v1/mundo-asha/mundos`);
    assert.equal(mundosRes.status, 200);
    const mundos = await mundosRes.json();
    assert.ok(mundos.length >= 3);

    const vozRes = await fetch(`${baseUrl}/api/v1/mundo-asha/voz/reconocimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: 'short',
        palabra_objetivo: 'pelota',
      }),
    });
    assert.equal(vozRes.status, 400);
  });

  it('9. Backward Compatibility: Keeps clinical and communication aliases mounted', async () => {
    for (const path of ['/api/v1/clinica/sesiones', '/api/v1/comunicacion/mensajes']) {
      const res = await fetch(`${baseUrl}${path}`);
      assert.equal(res.status, 401, `${path} must reach its authenticated router`);
    }
  });

  it('9a. Clinical APIs require an authenticated session', async () => {
    for (const path of [
      '/api/v1/pacientes',
      '/api/v1/citas',
      '/api/v1/sesiones',
      '/api/v1/tratamientos',
      '/api/v1/valoraciones',
      '/api/v1/agenda/citas',
      '/api/v1/clinica/sesiones',
    ]) {
      const res = await fetch(`${baseUrl}${path}`);
      assert.equal(res.status, 401, `${path} must reject unauthenticated access`);
    }
  });

  it('9b. Patients, appointments and clinical history are scoped to the authenticated relationship', async () => {
    const therapistId = accessFixture.therapistUserId!;
    const sharedPatientId = accessFixture.sharedPatientId!;
    const cancelledPatientId = accessFixture.cancelledOnlyPatientId!;
    const unrelatedPatientId = accessFixture.unrelatedPatientId!;
    const sessionId = accessFixture.sessionIds[0];
    const ownSessionId = accessFixture.sessionIds[1];
    const ownReservationId = accessFixture.reservationIds[1];
    const oldReservationId = accessFixture.reservationIds[0];

    const therapistPatients = await fetch(`${baseUrl}/api/v1/pacientes`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(therapistPatients.status, 200);
    const therapistPatientItems = await therapistPatients.json() as Array<{ id_paciente: number }>;
    assert.deepEqual(therapistPatientItems.map((item) => item.id_paciente), [sharedPatientId]);

    const cancelledOnly = await fetch(`${baseUrl}/api/v1/pacientes/${cancelledPatientId}`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(cancelledOnly.status, 404);

    const oldTherapistPatients = await fetch(`${baseUrl}/api/v1/pacientes`, {
      headers: { authorization: devAuth('TERAPEUTA', 2) },
    });
    assert.equal(oldTherapistPatients.status, 200);
    const oldTherapistItems = await oldTherapistPatients.json() as Array<{ id_paciente: number }>;
    assert.ok(oldTherapistItems.some((item) => item.id_paciente === sharedPatientId));
    assert.ok(!oldTherapistItems.some((item) => item.id_paciente === cancelledPatientId));

    const therapistAppointments = await fetch(`${baseUrl}/api/v1/citas`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(therapistAppointments.status, 200);
    const therapistAppointmentItems = await therapistAppointments.json() as Array<{ id_reserva: number }>;
    assert.deepEqual(new Set(therapistAppointmentItems.map((item) => item.id_reserva)), new Set([ownReservationId, accessFixture.reservationIds[2]]));
    assert.ok(!therapistAppointmentItems.some((item) => item.id_reserva === oldReservationId));

    const legacyAgenda = await fetch(`${baseUrl}/api/v1/agenda/citas`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(legacyAgenda.status, 200);
    const legacyAgendaItems = await legacyAgenda.json() as Array<{ id_cita: number }>;
    assert.deepEqual(new Set(legacyAgendaItems.map((item) => item.id_cita)), new Set([ownReservationId, accessFixture.reservationIds[2]]));

    const sharedHistory = await fetch(`${baseUrl}/api/v1/sesiones`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(sharedHistory.status, 200);
    const sessionItems = await sharedHistory.json() as Array<{ id_sesion: number; puede_editar?: boolean }>;
    assert.equal(sessionItems.find((item) => item.id_sesion === sessionId)?.puede_editar, false);
    assert.equal(sessionItems.find((item) => item.id_sesion === ownSessionId)?.puede_editar, true);

    const readSharedSession = await fetch(`${baseUrl}/api/v1/sesiones/${sessionId}`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(readSharedSession.status, 200);
    const readSharedSessionAsParent = await fetch(`${baseUrl}/api/v1/sesiones/${sessionId}`, {
      headers: { authorization: devAuth('PADRE', 3) },
    });
    assert.equal(readSharedSessionAsParent.status, 200);
    const retainedOwnHistory = await fetch(`${baseUrl}/api/v1/sesiones/${sessionId}`, {
      headers: { authorization: devAuth('TERAPEUTA', 2) },
    });
    assert.equal(retainedOwnHistory.status, 200);
    const retainedTherapistCanEditReport = await fetch(`${baseUrl}/api/v1/sesiones/${sessionId}/reporte`, {
      method: 'PUT',
      headers: { authorization: devAuth('TERAPEUTA', 2), 'Content-Type': 'application/json' },
      body: JSON.stringify({ observaciones_iniciales: 'Historial propio conservado' }),
    });
    assert.equal(retainedTherapistCanEditReport.status, 200);
    const readUnrelatedSession = await fetch(`${baseUrl}/api/v1/sesiones/${sessionId}`, {
      headers: { authorization: devAuth('TERAPEUTA', 1) },
    });
    assert.equal(readUnrelatedSession.status, 404);

    const legacyClinicalForeignPatient = await fetch(`${baseUrl}/api/v1/clinica/sesiones?pacienteId=${unrelatedPatientId}`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(legacyClinicalForeignPatient.status, 200);
    assert.deepEqual(await legacyClinicalForeignPatient.json(), []);
    const editOtherTherapistReport = await fetch(`${baseUrl}/api/v1/sesiones/${sessionId}/reporte`, {
      method: 'PUT',
      headers: { authorization: devAuth('TERAPEUTA', therapistId), 'Content-Type': 'application/json' },
      body: JSON.stringify({ observaciones_iniciales: 'No autorizado' }),
    });
    assert.equal(editOtherTherapistReport.status, 404);
    const editOwnSessionReport = await fetch(`${baseUrl}/api/v1/sesiones/${ownSessionId}/reporte`, {
      method: 'PUT',
      headers: { authorization: devAuth('TERAPEUTA', therapistId), 'Content-Type': 'application/json' },
      body: JSON.stringify({ observaciones_iniciales: 'Reporte del terapeuta asignado' }),
    });
    assert.equal(editOwnSessionReport.status, 200);

    const parentOwnChild = await fetch(`${baseUrl}/api/v1/pacientes/${sharedPatientId}`, {
      headers: { authorization: devAuth('PADRE', 3) },
    });
    assert.equal(parentOwnChild.status, 200);
    const therapistCannotEditBasicPatientData = await fetch(`${baseUrl}/api/v1/pacientes/${sharedPatientId}`, {
      method: 'PUT',
      headers: { authorization: devAuth('TERAPEUTA', therapistId), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombres_paciente: 'Cambio no permitido' }),
    });
    assert.equal(therapistCannotEditBasicPatientData.status, 403);
    const parentForeignChild = await fetch(`${baseUrl}/api/v1/pacientes/${unrelatedPatientId}`, {
      headers: { authorization: devAuth('PADRE', 3) },
    });
    assert.equal(parentForeignChild.status, 404);

    const parentAppointments = await fetch(`${baseUrl}/api/v1/citas`, {
      headers: { authorization: devAuth('PADRE', 3) },
    });
    assert.equal(parentAppointments.status, 200);
    const parentAppointmentItems = await parentAppointments.json() as Array<{ id_reserva: number; id_paciente: number }>;
    assert.ok(parentAppointmentItems.some((item) => item.id_reserva === ownReservationId));
    assert.ok(!parentAppointmentItems.some((item) => item.id_paciente === unrelatedPatientId));
    const parentForeignAppointment = await fetch(`${baseUrl}/api/v1/citas/${accessFixture.reservationIds[3]}`, {
      headers: { authorization: devAuth('PADRE', 3) },
    });
    assert.equal(parentForeignAppointment.status, 404);
    const therapistForeignAppointment = await fetch(`${baseUrl}/api/v1/citas/${accessFixture.reservationIds[3]}`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(therapistForeignAppointment.status, 404);

    const foreignBooking = await fetch(`${baseUrl}/api/v1/citas`, {
      method: 'POST',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_paciente: unrelatedPatientId,
        id_terapeuta: accessFixture.therapistId,
        fecha_hora_inicio: new Date(Date.now() + 86_400_000).toISOString(),
        tipo_cita: 'INTRODUCTORIA',
      }),
    });
    assert.equal(foreignBooking.status, 404);
    const inactiveTherapistBooking = await fetch(`${baseUrl}/api/v1/citas`, {
      method: 'POST',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_paciente: sharedPatientId,
        id_terapeuta: 999999,
        fecha_hora_inicio: new Date(Date.now() + 86_400_000).toISOString(),
        tipo_cita: 'INTRODUCTORIA',
      }),
    });
    assert.equal(inactiveTherapistBooking.status, 400);
    const parentCannotCreateTreatment = await fetch(`${baseUrl}/api/v1/tratamientos`, {
      method: 'POST',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_paciente: sharedPatientId }),
    });
    assert.equal(parentCannotCreateTreatment.status, 403);
    const unassignedTherapistCannotCreateTreatment = await fetch(`${baseUrl}/api/v1/tratamientos`, {
      method: 'POST',
      headers: { authorization: devAuth('TERAPEUTA', therapistId), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_paciente: unrelatedPatientId, id_terapeuta: accessFixture.therapistId, nombre_tratamiento: 'No autorizado' }),
    });
    assert.equal(unassignedTherapistCannotCreateTreatment.status, 404);

    const adminForeignPatient = await fetch(`${baseUrl}/api/v1/pacientes/${unrelatedPatientId}`, {
      headers: { authorization: devAuth('ADMIN', 1) },
    });
    assert.equal(adminForeignPatient.status, 200);
    const adminAppointments = await fetch(`${baseUrl}/api/v1/citas`, {
      headers: { authorization: devAuth('ADMIN', 1) },
    });
    assert.equal(adminAppointments.status, 200);
    const adminAppointmentItems = await adminAppointments.json() as Array<{ id_reserva: number }>;
    for (const reservationId of accessFixture.reservationIds) {
      assert.ok(adminAppointmentItems.some((item) => item.id_reserva === reservationId));
    }

    const editOtherTherapistAppointment = await fetch(`${baseUrl}/api/v1/citas/${oldReservationId}/estado`, {
      method: 'PATCH',
      headers: { authorization: devAuth('TERAPEUTA', therapistId), 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_reserva: 'CANCELADA' }),
    });
    assert.equal(editOtherTherapistAppointment.status, 404);

    const parentManagesOwnAppointment = await fetch(`${baseUrl}/api/v1/citas/${ownReservationId}/estado`, {
      method: 'PATCH',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_reserva: 'CANCELADA' }),
    });
    assert.equal(parentManagesOwnAppointment.status, 200);
    const legacyParentManagesOwnAppointment = await fetch(`${baseUrl}/api/v1/agenda/citas/${ownReservationId}/estado`, {
      method: 'PATCH',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'CANCELADA', motivo_cambio: 'Prueba de acceso familiar' }),
    });
    assert.equal(legacyParentManagesOwnAppointment.status, 200);
    const legacyChange = await legacyParentManagesOwnAppointment.json() as { id_cita: number; estado: string };
    assert.equal(legacyChange.id_cita, ownReservationId);
    assert.equal(legacyChange.estado, 'CANCELADA');
  });

  it('10. 404 Not Found for unmapped routes', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ruta-inexistente`);
    assert.equal(res.status, 404);
  });
});

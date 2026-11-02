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
  parentActionPatientId?: number;
  reservationIds: number[];
  sessionIds: number[];
} = { reservationIds: [], sessionIds: [] };

const messagingFixture = {
  therapistAUserId: 0,
  therapistAId: 0,
  therapistBUserId: 0,
  therapistBId: 0,
  parentAUserId: 0,
  parentAId: 0,
  parentBUserId: 0,
  parentBId: 0,
  unrelatedParentUserId: 0,
  unrelatedParentId: 0,
  sharedPatientId: 0,
  parentBPatientId: 0,
  cancelledOnlyPatientId: 0,
  historyPatientId: 0,
  historyReservationId: 0,
  historySessionId: 0,
  conversationIds: [] as number[],
};

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

async function insertMessagingRoleAndUser(roleId: number, prefix: string): Promise<number> {
  const userId = await insertTestUser(prefix);
  await pool.query(
    'INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, $2, true);',
    [userId, roleId],
  );
  return userId;
}

async function insertMessagingTherapist(prefix: string): Promise<{ userId: number; therapistId: number }> {
  const userId = await insertMessagingRoleAndUser(2, prefix);
  const result = await pool.query(
    "INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Prueba mensajes') RETURNING id_terapeuta;",
    [userId],
  );
  return { userId, therapistId: Number(result.rows[0].id_terapeuta) };
}

async function insertMessagingParent(prefix: string): Promise<{ userId: number; tutorId: number }> {
  const userId = await insertMessagingRoleAndUser(3, prefix);
  const result = await pool.query(
    "INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;",
    [userId],
  );
  return { userId, tutorId: Number(result.rows[0].id_tutor) };
}

async function insertActiveTestTreatment(patientId: number, therapistId: number): Promise<void> {
  const expediente = await pool.query(
    'INSERT INTO expedientes (id_paciente, fecha_apertura) VALUES ($1, NOW()) ' +
      'ON CONFLICT (id_paciente) DO UPDATE SET fecha_actualizacion = NOW() RETURNING id_expediente;',
    [patientId],
  );
  await pool.query(
    "INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, estado_tratamiento, fecha_inicio) VALUES ($1, $2, 'Plan de prueba', 'ACTIVO', CURRENT_DATE);",
    [expediente.rows[0].id_expediente, therapistId],
  );
}

async function insertCancelledTestReservation(patientId: number, therapistId: number): Promise<number> {
  const result = await pool.query(
    "INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva) VALUES ($1, $2, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 40 minutes', 'ONLINE', 'INTRODUCTORIA', 'CANCELADA') RETURNING id_reserva;",
    [patientId, therapistId],
  );
  return Number(result.rows[0].id_reserva);
}

async function createMessagingFixture(): Promise<void> {
  const therapistA = await insertMessagingTherapist('Mensajes terapeuta A');
  messagingFixture.therapistAUserId = therapistA.userId;
  messagingFixture.therapistAId = therapistA.therapistId;
  const therapistB = await insertMessagingTherapist('Mensajes terapeuta B');
  messagingFixture.therapistBUserId = therapistB.userId;
  messagingFixture.therapistBId = therapistB.therapistId;

  const parentA = await insertMessagingParent('Mensajes familia A');
  messagingFixture.parentAUserId = parentA.userId;
  messagingFixture.parentAId = parentA.tutorId;
  const parentB = await insertMessagingParent('Mensajes familia B');
  messagingFixture.parentBUserId = parentB.userId;
  messagingFixture.parentBId = parentB.tutorId;
  const unrelatedParent = await insertMessagingParent('Mensajes familia ajena');
  messagingFixture.unrelatedParentUserId = unrelatedParent.userId;
  messagingFixture.unrelatedParentId = unrelatedParent.tutorId;

  messagingFixture.sharedPatientId = await insertTestPatient(parentA.tutorId, 'Niño compartido mensajes');
  messagingFixture.parentBPatientId = await insertTestPatient(parentB.tutorId, 'Niño familia B mensajes');
  messagingFixture.cancelledOnlyPatientId = await insertTestPatient(unrelatedParent.tutorId, 'Niño cita cancelada mensajes');
  messagingFixture.historyPatientId = await insertTestPatient(parentB.tutorId, 'Niño historial mensajes');
  await insertActiveTestTreatment(messagingFixture.sharedPatientId, therapistA.therapistId);
  await insertActiveTestTreatment(messagingFixture.sharedPatientId, therapistB.therapistId);
  await insertActiveTestTreatment(messagingFixture.parentBPatientId, therapistB.therapistId);

  const cancelledOnlyReservationId = await insertCancelledTestReservation(
    messagingFixture.cancelledOnlyPatientId,
    therapistA.therapistId,
  );
  messagingFixture.historyReservationId = await insertCancelledTestReservation(
    messagingFixture.historyPatientId,
    therapistA.therapistId,
  );
  messagingFixture.historySessionId = await insertTestSession(messagingFixture.historyReservationId);

  const historyConversation = await pool.query(
    "INSERT INTO conversaciones (id_tutor, id_terapeuta, estado) VALUES ($1, $2, 'ACTIVA') RETURNING id_conversacion;",
    [parentB.tutorId, therapistA.therapistId],
  );
  const historyConversationId = Number(historyConversation.rows[0].id_conversacion);
  messagingFixture.conversationIds.push(historyConversationId);
  await pool.query(
    "INSERT INTO mensajes (id_conversacion, id_usuario_emisor, texto_mensaje, fecha_envio, leido) VALUES ($1, $2, 'Historial de sesión', NOW(), false);",
    [historyConversationId, therapistA.userId],
  );
  const cancelledConversation = await pool.query(
    "INSERT INTO conversaciones (id_tutor, id_terapeuta, estado) VALUES ($1, $2, 'ACTIVA') RETURNING id_conversacion;",
    [unrelatedParent.tutorId, therapistA.therapistId],
  );
  const cancelledConversationId = Number(cancelledConversation.rows[0].id_conversacion);
  messagingFixture.conversationIds.push(cancelledConversationId);
  await pool.query(
    "INSERT INTO mensajes (id_conversacion, id_usuario_emisor, texto_mensaje, fecha_envio, leido) VALUES ($1, $2, 'No debe mostrarse', NOW(), false);",
    [cancelledConversationId, therapistA.userId],
  );
  void cancelledOnlyReservationId;
}

async function cleanupMessagingFixture(): Promise<void> {
  const tutorIds = [messagingFixture.parentAId, messagingFixture.parentBId, messagingFixture.unrelatedParentId].filter(Boolean);
  const therapistIds = [messagingFixture.therapistAId, messagingFixture.therapistBId].filter(Boolean);
  const patientIds = [
    messagingFixture.sharedPatientId,
    messagingFixture.parentBPatientId,
    messagingFixture.cancelledOnlyPatientId,
    messagingFixture.historyPatientId,
  ].filter(Boolean);
  if (tutorIds.length && therapistIds.length) {
    await pool.query(
      'DELETE FROM mensajes m USING conversaciones c WHERE m.id_conversacion = c.id_conversacion AND (c.id_tutor = ANY($1::int[]) OR c.id_terapeuta = ANY($2::int[]));',
      [tutorIds, therapistIds],
    );
    await pool.query(
      'DELETE FROM conversaciones WHERE id_tutor = ANY($1::int[]) OR id_terapeuta = ANY($2::int[]);',
      [tutorIds, therapistIds],
    );
  }
  if (messagingFixture.historySessionId) {
    await pool.query('DELETE FROM sesiones WHERE id_sesion = $1;', [messagingFixture.historySessionId]);
  }
  const reservationIds = [messagingFixture.historyReservationId].filter(Boolean);
  if (patientIds.length) {
    await pool.query(
      'DELETE FROM reservas WHERE id_paciente = ANY($1::int[]) AND id_reserva <> ALL($2::int[]);',
      [patientIds, reservationIds.length ? reservationIds : [0]],
    );
  }
  if (reservationIds.length) await pool.query('DELETE FROM reservas WHERE id_reserva = ANY($1::int[]);', [reservationIds]);
  if (patientIds.length) {
    await pool.query(
      'DELETE FROM tratamientos WHERE id_expediente IN (SELECT id_expediente FROM expedientes WHERE id_paciente = ANY($1::int[]));',
      [patientIds],
    );
    await pool.query('DELETE FROM expedientes WHERE id_paciente = ANY($1::int[]);', [patientIds]);
    await pool.query('DELETE FROM pacientes WHERE id_paciente = ANY($1::int[]);', [patientIds]);
  }
  if (tutorIds.length) await pool.query('DELETE FROM tutores WHERE id_tutor = ANY($1::int[]);', [tutorIds]);
  if (therapistIds.length) await pool.query('DELETE FROM terapeutas WHERE id_terapeuta = ANY($1::int[]);', [therapistIds]);
  const userIds = [
    messagingFixture.therapistAUserId,
    messagingFixture.therapistBUserId,
    messagingFixture.parentAUserId,
    messagingFixture.parentBUserId,
    messagingFixture.unrelatedParentUserId,
  ].filter(Boolean);
  if (userIds.length) {
    await pool.query('DELETE FROM usuario_roles WHERE id_usuario = ANY($1::int[]);', [userIds]);
    await pool.query('DELETE FROM usuarios WHERE id_usuario = ANY($1::int[]);', [userIds]);
  }
  messagingFixture.conversationIds = [];
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
  accessFixture.parentActionPatientId = await insertTestPatient(1, 'Paciente para gestión familiar');

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
  await insertTestReservation(accessFixture.parentActionPatientId, accessFixture.therapistId, 'CONFIRMADA');
}

async function cleanupClinicalAccessFixture(): Promise<void> {
  if (accessFixture.sessionIds.length) {
    await pool.query('DELETE FROM sesiones WHERE id_sesion = ANY($1::int[]);', [accessFixture.sessionIds]);
  }
  if (accessFixture.reservationIds.length) {
    await pool.query('DELETE FROM reservas WHERE id_reserva = ANY($1::int[]);', [accessFixture.reservationIds]);
  }
  const patientIds = [accessFixture.sharedPatientId, accessFixture.cancelledOnlyPatientId, accessFixture.unrelatedPatientId, accessFixture.parentActionPatientId]
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
    await createMessagingFixture();
  });

  after(async () => {
    await cleanupMessagingFixture();
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
    assert.equal(vozRes.status, 401, 'voice recognition must require an authenticated family account');
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
    assert.deepEqual(
      new Set(therapistPatientItems.map((item) => item.id_paciente)),
      new Set([sharedPatientId, accessFixture.parentActionPatientId]),
    );

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
    assert.deepEqual(new Set(therapistAppointmentItems.map((item) => item.id_reserva)), new Set([ownReservationId, accessFixture.reservationIds[2], accessFixture.reservationIds[4]]));
    assert.ok(!therapistAppointmentItems.some((item) => item.id_reserva === oldReservationId));

    const legacyAgenda = await fetch(`${baseUrl}/api/v1/agenda/citas`, {
      headers: { authorization: devAuth('TERAPEUTA', therapistId) },
    });
    assert.equal(legacyAgenda.status, 200);
    const legacyAgendaItems = await legacyAgenda.json() as Array<{ id_cita: number }>;
    assert.deepEqual(
      new Set(legacyAgendaItems.map((item) => item.id_cita)),
      new Set([ownReservationId, accessFixture.reservationIds[2], accessFixture.reservationIds[4]]),
    );

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
      body: JSON.stringify({
        observaciones_iniciales: 'Historial propio conservado',
        objetivos_trabajados: null,
        nivel_ayuda: null,
        proximos_pasos: null,
      }),
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
      body: JSON.stringify({
        observaciones_iniciales: 'Reporte del terapeuta asignado',
        objetivos_trabajados: null,
        nivel_ayuda: null,
        proximos_pasos: null,
      }),
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

    const parentActionReservationId = accessFixture.reservationIds[4];
    const parentManagesOwnAppointment = await fetch(`${baseUrl}/api/v1/citas/${parentActionReservationId}/estado`, {
      method: 'PATCH',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_reserva: 'CANCELADA' }),
    });
    assert.equal(parentManagesOwnAppointment.status, 200);
    const legacyParentManagesOwnAppointment = await fetch(`${baseUrl}/api/v1/agenda/citas/${parentActionReservationId}/estado`, {
      method: 'PATCH',
      headers: { authorization: devAuth('PADRE', 3), 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'CANCELADA', motivo_cambio: 'Prueba de acceso familiar' }),
    });
    assert.equal(legacyParentManagesOwnAppointment.status, 200);
    const legacyChange = await legacyParentManagesOwnAppointment.json() as { id_cita: number; estado: string };
    assert.equal(legacyChange.id_cita, parentActionReservationId);
    assert.equal(legacyChange.estado, 'CANCELADA');
  });

  it('9c. Messages are isolated by authenticated family and therapist', async () => {
    const authRequest = (
      path: string,
      role: 'ADMIN' | 'TERAPEUTA' | 'PADRE',
      userId: number,
      options: RequestInit = {},
    ) => {
      const headers = new Headers(options.headers);
      headers.set('Authorization', devAuth(role, userId));
      return fetch(baseUrl + path, { ...options, headers });
    };
    const jsonOptions = (method: string, body: unknown): RequestInit => ({
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const noSessionContacts = await fetch(baseUrl + '/api/v1/conversaciones/contactos');
    const noSessionList = await fetch(baseUrl + '/api/v1/conversaciones');
    const noSessionLegacy = await fetch(baseUrl + '/api/v1/comunicacion/mensajes');
    assert.equal(noSessionContacts.status, 401);
    assert.equal(noSessionList.status, 401);
    assert.equal(noSessionLegacy.status, 401);
    const adminContacts = await authRequest('/api/v1/conversaciones/contactos', 'ADMIN', 1);
    assert.equal(adminContacts.status, 403);

    const therapistAContacts = await authRequest(
      '/api/v1/conversaciones/contactos',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    const therapistBContacts = await authRequest(
      '/api/v1/conversaciones/contactos',
      'TERAPEUTA',
      messagingFixture.therapistBUserId,
    );
    assert.equal(therapistAContacts.status, 200);
    assert.equal(therapistBContacts.status, 200);
    const contactsA = await therapistAContacts.json() as Array<{ id_tutor: number }>;
    const contactsB = await therapistBContacts.json() as Array<{ id_tutor: number }>;
    assert.deepEqual(contactsA.map((item) => item.id_tutor), [messagingFixture.parentAId]);
    assert.deepEqual(
      contactsB.map((item) => item.id_tutor).sort((a, b) => a - b),
      [messagingFixture.parentAId, messagingFixture.parentBId].sort((a, b) => a - b),
    );

    const openConversation = async (
      tutorId: number,
      therapistId: number,
      therapistUserId: number,
    ): Promise<{ id_conversacion: number; id_tutor: number; id_terapeuta: number }> => {
      const response = await authRequest(
        '/api/v1/conversaciones',
        'TERAPEUTA',
        therapistUserId,
        jsonOptions('POST', { id_tutor: tutorId, id_terapeuta: therapistId }),
      );
      assert.equal(response.status, 201);
      const item = await response.json() as { id_conversacion: number; id_tutor: number; id_terapeuta: number };
      messagingFixture.conversationIds.push(item.id_conversacion);
      return item;
    };
    const conversationA = await openConversation(
      messagingFixture.parentAId,
      messagingFixture.therapistAId,
      messagingFixture.therapistAUserId,
    );
    const conversationBSharedFamily = await openConversation(
      messagingFixture.parentAId,
      messagingFixture.therapistBId,
      messagingFixture.therapistBUserId,
    );
    const conversationBOnlyFamily = await openConversation(
      messagingFixture.parentBId,
      messagingFixture.therapistBId,
      messagingFixture.therapistBUserId,
    );
    assert.notEqual(conversationA.id_conversacion, conversationBSharedFamily.id_conversacion);

    const therapistAListResponse = await authRequest(
      '/api/v1/conversaciones',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    const therapistBListResponse = await authRequest(
      '/api/v1/conversaciones',
      'TERAPEUTA',
      messagingFixture.therapistBUserId,
    );
    const therapistAList = await therapistAListResponse.json() as {
      items: Array<{ id_conversacion: number; id_tutor: number; id_terapeuta: number; puede_enviar: boolean }>;
    };
    const therapistBList = await therapistBListResponse.json() as {
      items: Array<{ id_conversacion: number; id_tutor: number; id_terapeuta: number; puede_enviar: boolean }>;
    };
    assert.ok(therapistAList.items.every((item) => item.id_terapeuta === messagingFixture.therapistAId));
    assert.ok(therapistAList.items.some((item) => item.id_conversacion === conversationA.id_conversacion));
    assert.ok(!therapistAList.items.some((item) => item.id_tutor === messagingFixture.unrelatedParentId));
    assert.ok(therapistBList.items.some((item) => item.id_conversacion === conversationBSharedFamily.id_conversacion));
    assert.ok(therapistBList.items.some((item) => item.id_conversacion === conversationBOnlyFamily.id_conversacion));

    const parentAListResponse = await authRequest(
      '/api/v1/conversaciones',
      'PADRE',
      messagingFixture.parentAUserId,
    );
    const parentBListResponse = await authRequest(
      '/api/v1/conversaciones',
      'PADRE',
      messagingFixture.parentBUserId,
    );
    const parentAList = await parentAListResponse.json() as {
      items: Array<{ id_conversacion: number; id_tutor: number }>;
    };
    const parentBList = await parentBListResponse.json() as {
      items: Array<{ id_conversacion: number; id_tutor: number }>;
    };
    assert.ok(parentAList.items.every((item) => item.id_tutor === messagingFixture.parentAId));
    assert.ok(parentAList.items.some((item) => item.id_conversacion === conversationA.id_conversacion));
    assert.ok(parentAList.items.some((item) => item.id_conversacion === conversationBSharedFamily.id_conversacion));
    assert.ok(!parentAList.items.some((item) => item.id_conversacion === conversationBOnlyFamily.id_conversacion));
    assert.ok(parentBList.items.every((item) => item.id_tutor === messagingFixture.parentBId));
    assert.ok(parentBList.items.some((item) => item.id_conversacion === conversationBOnlyFamily.id_conversacion));

    const historicalItem = therapistAList.items.find((item) => item.id_tutor === messagingFixture.parentBId);
    assert.ok(historicalItem);
    assert.equal(historicalItem.puede_enviar, false);
    const historicalMessages = await authRequest(
      '/api/v1/conversaciones/' + historicalItem.id_conversacion + '/mensajes',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    const historicalPage = await historicalMessages.json() as { items: Array<{ texto_mensaje: string }> };
    assert.ok(historicalPage.items.some((item) => item.texto_mensaje === 'Historial de sesión'));
    const historicalSend = await authRequest(
      '/api/v1/conversaciones/' + historicalItem.id_conversacion + '/mensajes',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
      jsonOptions('POST', { texto_mensaje: 'No debe enviarse' }),
    );
    assert.equal(historicalSend.status, 403);

    const sendMessage = async (
      conversationId: number,
      therapistUserId: number,
      text: string,
    ) => {
      const response = await authRequest(
        '/api/v1/conversaciones/' + conversationId + '/mensajes',
        'TERAPEUTA',
        therapistUserId,
        jsonOptions('POST', { texto_mensaje: text }),
      );
      assert.equal(response.status, 201);
      return response.json() as Promise<{ id_usuario_emisor: number; texto_mensaje: string }>;
    };
    const sentA = await sendMessage(
      conversationA.id_conversacion,
      messagingFixture.therapistAUserId,
      'Mensaje privado del terapeuta A',
    );
    const sentB = await sendMessage(
      conversationBSharedFamily.id_conversacion,
      messagingFixture.therapistBUserId,
      'Mensaje privado del terapeuta B',
    );
    assert.equal(sentA.id_usuario_emisor, messagingFixture.therapistAUserId);
    assert.equal(sentB.id_usuario_emisor, messagingFixture.therapistBUserId);

    const makeAttachmentForm = () => {
      const form = new FormData();
      form.append('archivo', new Blob(['nota privada'], { type: 'text/plain' }), 'nota.txt');
      form.append('texto_mensaje', 'Archivo protegido');
      form.append('clave_envio', '5c5842ba-d821-4f1a-82d1-0ec90918ca21');
      return form;
    };
    const attachmentPath = '/api/v1/conversaciones/' + conversationA.id_conversacion + '/mensajes/adjunto';
    const attachmentResponse = await authRequest(
      attachmentPath,
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
      { method: 'POST', body: makeAttachmentForm() },
    );
    assert.equal(attachmentResponse.status, 201);
    const attachedMessage = await attachmentResponse.json() as {
      id_mensaje: number;
      id_conversacion: number;
      adjuntos: Array<{ id_adjunto: number; tamano_bytes: number }>;
    };
    assert.equal(attachedMessage.id_conversacion, conversationA.id_conversacion);
    assert.equal(attachedMessage.adjuntos.length, 1);
    assert.equal(attachedMessage.adjuntos[0].tamano_bytes, Buffer.byteLength('nota privada'));
    const retriedAttachment = await authRequest(
      attachmentPath,
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
      { method: 'POST', body: makeAttachmentForm() },
    );
    const retriedMessage = await retriedAttachment.json() as { id_mensaje: number };
    assert.equal(retriedAttachment.status, 201);
    assert.equal(retriedMessage.id_mensaje, attachedMessage.id_mensaje);
    const downloadedAttachment = await authRequest(
      '/api/v1/conversaciones/' + conversationA.id_conversacion + '/adjuntos/' + attachedMessage.adjuntos[0].id_adjunto,
      'PADRE',
      messagingFixture.parentAUserId,
    );
    assert.equal(downloadedAttachment.status, 200);
    assert.equal(await downloadedAttachment.text(), 'nota privada');
    const foreignAttachment = await authRequest(
      '/api/v1/conversaciones/' + conversationA.id_conversacion + '/adjuntos/' + attachedMessage.adjuntos[0].id_adjunto,
      'TERAPEUTA',
      messagingFixture.therapistBUserId,
    );
    assert.equal(foreignAttachment.status, 404);

    const messagesAResponse = await authRequest(
      '/api/v1/conversaciones/' + conversationA.id_conversacion + '/mensajes',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    const messagesBResponse = await authRequest(
      '/api/v1/conversaciones/' + conversationBSharedFamily.id_conversacion + '/mensajes',
      'TERAPEUTA',
      messagingFixture.therapistBUserId,
    );
    const messagesA = await messagesAResponse.json() as { items: Array<{ texto_mensaje: string }> };
    const messagesB = await messagesBResponse.json() as { items: Array<{ texto_mensaje: string }> };
    assert.ok(messagesA.items.some((item) => item.texto_mensaje === 'Mensaje privado del terapeuta A'));
    assert.ok(!messagesA.items.some((item) => item.texto_mensaje === 'Mensaje privado del terapeuta B'));
    assert.ok(messagesB.items.some((item) => item.texto_mensaje === 'Mensaje privado del terapeuta B'));
    assert.ok(!messagesB.items.some((item) => item.texto_mensaje === 'Mensaje privado del terapeuta A'));

    const unauthorizedDetail = await authRequest(
      '/api/v1/conversaciones/' + conversationBOnlyFamily.id_conversacion,
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    const unauthorizedRead = await authRequest(
      '/api/v1/conversaciones/' + conversationBOnlyFamily.id_conversacion + '/mensajes',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    const unauthorizedSend = await authRequest(
      '/api/v1/conversaciones/' + conversationBOnlyFamily.id_conversacion + '/mensajes',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
      jsonOptions('POST', { texto_mensaje: 'Mensaje ajeno' }),
    );
    assert.equal(unauthorizedDetail.status, 404);
    assert.equal(unauthorizedRead.status, 404);
    assert.equal(unauthorizedSend.status, 404);
    const parentCannotOpenAnotherFamily = await authRequest(
      '/api/v1/conversaciones/' + conversationA.id_conversacion,
      'PADRE',
      messagingFixture.parentBUserId,
    );
    assert.equal(parentCannotOpenAnotherFamily.status, 404);
    const unrelatedParentList = await authRequest(
      '/api/v1/conversaciones',
      'PADRE',
      messagingFixture.unrelatedParentUserId,
    );
    const unrelatedPage = await unrelatedParentList.json() as { items: Array<{ id_tutor: number }> };
    assert.ok(!unrelatedPage.items.some((item) => item.id_tutor === messagingFixture.unrelatedParentId));
    const forgedPair = await authRequest(
      '/api/v1/conversaciones',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
      jsonOptions('POST', {
        id_tutor: messagingFixture.parentBId,
        id_terapeuta: messagingFixture.therapistBId,
      }),
    );
    assert.equal(forgedPair.status, 404);

    const legacyRead = await authRequest(
      '/api/v1/comunicacion/mensajes?con=' + messagingFixture.therapistAUserId,
      'PADRE',
      messagingFixture.parentAUserId,
    );
    const legacyItems = await legacyRead.json() as Array<{ id_conversacion: number; contenido: string | null }>;
    assert.ok(legacyItems.some((item) => item.id_conversacion === conversationA.id_conversacion));
    assert.ok(!legacyItems.some((item) => item.id_conversacion === conversationBSharedFamily.id_conversacion));
    const legacySend = await authRequest(
      '/api/v1/comunicacion/mensajes',
      'PADRE',
      messagingFixture.parentAUserId,
      jsonOptions('POST', {
        destinatario_id: messagingFixture.therapistAUserId,
        contenido: 'Mensaje del adaptador persistido',
      }),
    );
    assert.equal(legacySend.status, 201);
    const legacySaved = await legacySend.json() as { id_conversacion: number; contenido: string };
    assert.equal(legacySaved.id_conversacion, conversationA.id_conversacion);
    assert.equal(legacySaved.contenido, 'Mensaje del adaptador persistido');
  });

  it('9d. Clinical AI Consent and ML Prediction contracts', async () => {
    const authRequest = (
      path: string,
      role: 'ADMIN' | 'TERAPEUTA' | 'PADRE',
      userId: number,
      options: RequestInit = {},
    ) => {
      const headers = new Headers(options.headers);
      headers.set('Authorization', devAuth(role, userId));
      return fetch(baseUrl + path, { ...options, headers });
    };
    const jsonOptions = (method: string, body: unknown): RequestInit => ({
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const predictionCatalog = await authRequest(
      '/api/v1/clinica/tratamientos/predictor-catalog',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    let diagnosisCode = 1;
    if (predictionCatalog.status === 200) {
      const catalog = await predictionCatalog.json() as { diagnosis_codes: { code: number; label: string }[] };
      assert.equal(catalog.diagnosis_codes.length, 5);
      assert.ok(catalog.diagnosis_codes.every((item) => item.label.trim().length > 0));
      diagnosisCode = catalog.diagnosis_codes[0].code;
    } else {
      assert.equal(predictionCatalog.status, 503, 'the model catalog must fail closed until approved');
    }
    const planPred = await authRequest(
      '/api/v1/clinica/tratamientos/predecir-plan',
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
      jsonOptions('POST', {
        id_sesion: messagingFixture.historySessionId,
        codigo_diagnostico: diagnosisCode,
        frecuencia_semanal: 2,
      }),
    );
    assert.equal(planPred.status, 409, 'a prediction must require a saved clinical help level for its session');
    const unavailable = await planPred.json() as { error?: string };
    assert.ok(unavailable.error?.toLowerCase().includes('nivel de ayuda'));

    const consentCheckInitial = await authRequest(
      '/api/v1/clinica/consentimientos/' + messagingFixture.sharedPatientId,
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    assert.equal(consentCheckInitial.status, 200);

    const grantConsent = await authRequest(
      '/api/v1/clinica/consentimientos',
      'PADRE',
      messagingFixture.parentAUserId,
      jsonOptions('POST', {
        id_paciente: messagingFixture.sharedPatientId,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        estado: 'CONCEDIDO',
      }),
    );
    assert.equal(grantConsent.status, 201);
    const grantedData = await grantConsent.json() as { consentido: boolean; estado: string };
    assert.equal(grantedData.consentido, true);
    assert.equal(grantedData.estado, 'CONCEDIDO');

    const unrelatedConsent = await authRequest(
      '/api/v1/clinica/consentimientos',
      'PADRE',
      messagingFixture.parentAUserId,
      jsonOptions('POST', {
        id_paciente: messagingFixture.sharedPatientId,
        tipo_consentimiento: 'CONSENTIMIENTO_CAMPANA',
        estado: 'REVOCADO',
      }),
    );
    assert.equal(unrelatedConsent.status, 201);

    const consentCheckAfter = await authRequest(
      '/api/v1/clinica/consentimientos/' + messagingFixture.sharedPatientId,
      'TERAPEUTA',
      messagingFixture.therapistAUserId,
    );
    assert.equal(consentCheckAfter.status, 200);
    const afterData = await consentCheckAfter.json() as { consentido: boolean; estado: string };
    assert.equal(afterData.consentido, true);
    assert.equal(afterData.estado, 'CONCEDIDO');
  });

  it('10. 404 Not Found for unmapped routes', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ruta-inexistente`);
    assert.equal(res.status, 404);
  });
});

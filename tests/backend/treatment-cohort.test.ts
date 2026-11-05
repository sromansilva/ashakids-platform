import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import {
  DIAGNOSTICOS_PRELIMINARES,
  ETIQUETA_DIAGNOSTICO_PRELIMINAR,
  catalogoCoincideConInstitucional,
  colaboracionDesdeNivelAyuda,
  esCodigoDiagnosticoPreliminar,
} from '../../backend/src/modules/clinica/dtos/diagnosticoPreliminar.ts';
import { cierreTratamientoSchema, codigoDiagnosticoSchema, prediccionPlanSchema } from '../../backend/src/modules/clinica/dtos/clinica.dto.ts';

describe('Catalogo diagnostico preliminar e insumos del plan (sin base de datos)', () => {
  it('el catalogo institucional tiene los cuatro codigos 0 a 3', () => {
    assert.deepEqual(DIAGNOSTICOS_PRELIMINARES.map((item) => item.code), [0, 1, 2, 3]);
    assert.deepEqual(
      DIAGNOSTICOS_PRELIMINARES.map((item) => item.label),
      ['Dislalia funcional', 'Retraso simple del habla', 'Trastorno del lenguaje (TEL)', 'Deglución atípica'],
    );
    assert.equal(ETIQUETA_DIAGNOSTICO_PRELIMINAR, 'Código diagnóstico preliminar asignado por el terapeuta');
  });

  it('el esquema acepta solo codigos del catalogo y el pronostico usa el mismo rango', () => {
    for (const code of [0, 1, 2, 3]) {
      assert.equal(codigoDiagnosticoSchema.safeParse(code).success, true);
      assert.equal(esCodigoDiagnosticoPreliminar(code), true);
    }
    for (const code of [-1, 4, 5, 1.5, '1', null]) {
      assert.equal(codigoDiagnosticoSchema.safeParse(code).success, false);
      assert.equal(esCodigoDiagnosticoPreliminar(code), false);
    }
    assert.equal(prediccionPlanSchema.safeParse({ id_sesion: 1, codigo_diagnostico: 0, frecuencia_semanal: 2 }).success, true);
    assert.equal(prediccionPlanSchema.safeParse({ id_sesion: 1, codigo_diagnostico: 5, frecuencia_semanal: 2 }).success, false);
  });

  it('el catalogo del modelo debe coincidir exactamente con el institucional', () => {
    const same = DIAGNOSTICOS_PRELIMINARES.map((item) => ({ code: item.code, label: item.label }));
    assert.equal(catalogoCoincideConInstitucional(same), true);
    assert.equal(catalogoCoincideConInstitucional(same.slice(1)), false);
    assert.equal(catalogoCoincideConInstitucional(same.map((item) => (item.code === 2 ? { ...item, label: 'Otro' } : item))), false);
    assert.equal(catalogoCoincideConInstitucional([1, 2, 3, 4, 5].map((code) => ({ code, label: `x${code}` }))), false);
  });

  it('la colaboracion invierte el nivel de ayuda (1 ayuda total a 5 autonomo)', () => {
    assert.equal(colaboracionDesdeNivelAyuda('Sin ayuda'), 5);
    assert.equal(colaboracionDesdeNivelAyuda('Ayuda alta'), 2);
    assert.equal(colaboracionDesdeNivelAyuda('Ayuda total'), 1);
    assert.equal(colaboracionDesdeNivelAyuda(null), null);
    assert.equal(colaboracionDesdeNivelAyuda('inventado'), null);
  });

  it('el cierre solo admite ALTA o ABANDONO; un plan cerrado no se reactiva por la API', () => {
    assert.equal(cierreTratamientoSchema.safeParse({ desenlace: 'ALTA' }).success, true);
    assert.equal(cierreTratamientoSchema.safeParse({ desenlace: 'ABANDONO', observacion: 'Se mudó' }).success, true);
    assert.equal(cierreTratamientoSchema.safeParse({ desenlace: 'ACTIVO' }).success, false);
    assert.equal(cierreTratamientoSchema.safeParse({ desenlace: 'ALTA', estado_tratamiento: 'ACTIVO' }).success, false);
  });
});

const { app } = await import('../../backend/dist/app.js');
const { pool } = await import('../../backend/dist/core/database.js');
const { settings } = await import('../../backend/dist/core/config.js');
const { migrateClinicaSchema } = await import('../../backend/dist/modules/clinica/clinica.migration.js');
const { migrateNotificacionesSchema } = await import('../../backend/dist/modules/notificaciones/notificaciones.migration.js');
const { registrarVariablesModeloTratamiento } = await import('../../backend/dist/modules/clinica/services/tratamientoCohorte.js');
const exporter = await import('../../scripts/export_treatment_cohort.mjs');

const localDatabaseHost = ['127.0.0.1', 'localhost', '::1'].includes(settings.DB_HOST.toLowerCase());
const isolatedDatabase = /(?:_test|_e2e)$/i.test(settings.DB_NAME);
const canRunDatabaseTests = process.env.ENVIRONMENT === 'test' && localDatabaseHost && isolatedDatabase;

let server: Server;
let baseUrl = '';
const fx = {
  users: [] as number[], therapistUser: 0, therapistId: 0, otherTherapistUser: 0, otherTherapistId: 0, parentUser: 0, tutorId: 0,
  patients: [] as number[], reservations: [] as number[], sessions: [] as number[], treatments: [] as number[],
};
const plans: Record<string, { patientId: number; sessionId: number; treatmentId: number }> = {};

function auth(role: 'ADMIN' | 'TERAPEUTA' | 'PADRE', userId: number): Record<string, string> {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: userId, email: `cohort-${userId}@ashakids.test`, nombres: 'Cohorte', apellidos: 'Test', rol: role, roles: [role],
  })).toString('base64');
  return { authorization: `Bearer ${payload}`, 'content-type': 'application/json' };
}

async function user(prefix: string, roleId: number): Promise<number> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const r = await pool.query(
    `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
     VALUES ($1, 'Test', $2, $3, 'test-only', true) RETURNING id_usuario;`,
    [prefix, `c${suffix.slice(-5)}`, `${prefix.toLowerCase()}-${suffix}@ashakids.test`],
  );
  const id = Number(r.rows[0].id_usuario);
  await pool.query('INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, $2, true);', [id, roleId]);
  fx.users.push(id);
  return id;
}

interface PlanSpec {
  key: string;
  ageMonths: number;
  startedDaysAgo: number;
  help: string;
  freq: number;
  attended: number;
  therapistId?: number;
  evaluations: Array<{ fonema: string; estado: string; resultado: string | null; origen?: string }>;
}

/** Crea un paciente con una introductoria atendida, evaluaciones y un plan ACTIVO ya capturado por la funcion del servidor. */
async function createPlan(spec: PlanSpec, code: number): Promise<void> {
  const therapistId = spec.therapistId ?? fx.therapistId;
  const patientId = Number((await pool.query(
    `INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo)
     VALUES ($1, 'Cohorte', $2, (CURRENT_DATE - ($3::int * INTERVAL '1 month'))::date, 'M', true) RETURNING id_paciente;`,
    [fx.tutorId, spec.key, spec.ageMonths])).rows[0].id_paciente);
  fx.patients.push(patientId);
  const reservationId = Number((await pool.query(
    `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva)
     VALUES ($1, $2, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '40 minutes', 'PRESENCIAL', 'INTRODUCTORIA', 'COMPLETADA') RETURNING id_reserva;`,
    [patientId, therapistId])).rows[0].id_reserva);
  fx.reservations.push(reservationId);
  const sessionId = Number((await pool.query(
    `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion, asistencia)
     VALUES ($1, NOW() - INTERVAL '2 months', 'FINALIZADA', 'ASISTIO') RETURNING id_sesion;`, [reservationId])).rows[0].id_sesion);
  fx.sessions.push(sessionId);
  await pool.query('INSERT INTO reportes_sesion (id_sesion, observaciones_iniciales, nivel_ayuda) VALUES ($1, $2, $3);', [sessionId, 'Observaciones sintéticas', spec.help]);
  for (const evaluation of spec.evaluations) {
    await pool.query(
      `INSERT INTO evaluaciones_fonologicas (id_sesion, id_paciente, fonema_objetivo, palabra_objetivo, transcripcion_detectada, estado, resultado_clinico, origen_evaluacion)
       VALUES ($1, $2, $3, 'palabra', 'palabra', $4, $5, $6);`,
      [sessionId, patientId, evaluation.fonema, evaluation.estado, evaluation.resultado, evaluation.origen ?? 'CLINICO'],
    );
  }
  const expedienteId = Number((await pool.query(
    'INSERT INTO expedientes (id_paciente, fecha_apertura) VALUES ($1, NOW()) ON CONFLICT (id_paciente) DO UPDATE SET fecha_actualizacion = NOW() RETURNING id_expediente;',
    [patientId])).rows[0].id_expediente);

  const client = await pool.connect();
  let treatmentId = 0;
  try {
    await client.query('BEGIN;');
    treatmentId = Number((await client.query(
      `INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, area, mundos_asignados, sesiones_recomendadas, estado_tratamiento, fecha_inicio, id_sesion_origen, frecuencia_semanal)
       VALUES ($1, $2, $3, 'HABLA', '["HABLA"]'::jsonb, 12, 'ACTIVO', CURRENT_DATE - $4::int, $5, $6) RETURNING id_tratamiento;`,
      [expedienteId, therapistId, `Plan ${spec.key}`, spec.startedDaysAgo, sessionId, spec.freq])).rows[0].id_tratamiento);
    await registrarVariablesModeloTratamiento(client, { idTratamiento: treatmentId, codigoDiagnostico: code });
    await client.query('COMMIT;');
  } catch (error) {
    await client.query('ROLLBACK;');
    throw error;
  } finally {
    client.release();
  }
  fx.treatments.push(treatmentId);
  for (let i = 0; i < spec.attended + 1; i += 1) {
    const reservation = Number((await pool.query(
      `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, id_tratamiento)
       VALUES ($1, $2, NOW() - ($3::int * INTERVAL '1 day'), NOW() - ($3::int * INTERVAL '1 day') + INTERVAL '40 minutes', 'PRESENCIAL', 'TERAPIA', 'COMPLETADA', $4) RETURNING id_reserva;`,
      [patientId, therapistId, 50 - i, treatmentId])).rows[0].id_reserva);
    fx.reservations.push(reservation);
    // La ultima sesion es una inasistencia: no debe contar.
    const attendedSession = i < spec.attended;
    const created = await pool.query(
      `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion, asistencia) VALUES ($1, NOW(), 'FINALIZADA', $2) RETURNING id_sesion;`,
      [reservation, attendedSession ? 'ASISTIO' : 'NO_ASISTIO'],
    );
    fx.sessions.push(Number(created.rows[0].id_sesion));
  }
  plans[spec.key] = { patientId, sessionId, treatmentId };
}

const variablesOf = async (key: string) => (await pool.query(
  'SELECT * FROM public.tratamiento_variables_modelo WHERE id_tratamiento = $1;', [plans[key].treatmentId])).rows[0];
const close = (key: string, role: 'ADMIN' | 'TERAPEUTA' | 'PADRE', userId: number, body: unknown) => fetch(
  `${baseUrl}/api/v1/clinica/tratamientos/${plans[key].treatmentId}/desenlace`,
  { method: 'PATCH', headers: auth(role, userId), body: JSON.stringify(body) },
);

describe('Captura por plan, desenlace y exportador de cohorte', {
  skip: !canRunDatabaseTests && 'Requiere ENVIRONMENT=test, PostgreSQL local y una base cuyo nombre termine en _test o _e2e.',
}, () => {
  before(async () => {
    await migrateNotificacionesSchema();
    await migrateClinicaSchema();
    await migrateClinicaSchema(); // idempotente
    fx.therapistUser = await user('CohorteTer', 2);
    fx.therapistId = Number((await pool.query("INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Prueba cohorte') RETURNING id_terapeuta;", [fx.therapistUser])).rows[0].id_terapeuta);
    fx.otherTherapistUser = await user('CohorteOtro', 2);
    fx.otherTherapistId = Number((await pool.query("INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Prueba cohorte') RETURNING id_terapeuta;", [fx.otherTherapistUser])).rows[0].id_terapeuta);
    fx.parentUser = await user('CohortePadre', 3);
    fx.tutorId = Number((await pool.query("INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;", [fx.parentUser])).rows[0].id_tutor);

    // Edades distintas (en meses) identifican cada fila exportada sin necesitar identificadores.
    await createPlan({
      key: 'alta', ageMonths: 61, startedDaysAgo: 40, help: 'Ayuda alta', freq: 2, attended: 7,
      evaluations: [
        { fonema: '/r/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'REQUIERE_APOYO' },
        { fonema: '/s/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'EN_PROCESO' },
        { fonema: '/s/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'REQUIERE_APOYO' },
        { fonema: '/rr/', estado: 'PENDIENTE_REVISION', resultado: null },
        { fonema: '/pl/', estado: 'DESCARTADO', resultado: null },
        { fonema: '/tr/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'ALCANZADO' },
        { fonema: '/rr/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'EN_PROCESO', origen: 'LUDICO' },
      ],
    }, 2);
    await createPlan({
      key: 'abandono', ageMonths: 73, startedDaysAgo: 5, help: 'Sin ayuda', freq: 1, attended: 3,
      evaluations: [{ fonema: '/pl/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'EN_PROCESO' }],
    }, 0);
    await createPlan({
      key: 'activo', ageMonths: 85, startedDaysAgo: 20, help: 'Ayuda total', freq: 3, attended: 4,
      evaluations: [{ fonema: '/r/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'EN_PROCESO' }],
    }, 3);
    await createPlan({
      key: 'sinsesiones', ageMonths: 97, startedDaysAgo: 30, help: 'Ayuda moderada', freq: 2, attended: 0,
      evaluations: [{ fonema: '/r/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'EN_PROCESO' }],
    }, 1);
    await createPlan({
      key: 'sinfonemas', ageMonths: 109, startedDaysAgo: 30, help: 'Ayuda mínima', freq: 2, attended: 5,
      evaluations: [{ fonema: '/r/', estado: 'PENDIENTE_REVISION', resultado: null }],
    }, 1);
    await createPlan({
      key: 'ajeno', ageMonths: 121, startedDaysAgo: 30, help: 'Ayuda mínima', freq: 2, attended: 2, therapistId: fx.otherTherapistId,
      evaluations: [{ fonema: '/s/', estado: 'CONFIRMADO_TERAPEUTA', resultado: 'EN_PROCESO' }],
    }, 1);

    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  after(async () => {
    // Orden por dependencias: sesiones de terapia -> citas del plan -> planes -> sesiones y citas de origen.
    await pool.query('DELETE FROM sesiones WHERE id_reserva IN (SELECT id_reserva FROM reservas WHERE id_tratamiento = ANY($1::int[]));', [fx.treatments]);
    await pool.query('DELETE FROM reservas WHERE id_tratamiento = ANY($1::int[]);', [fx.treatments]);
    await pool.query('DELETE FROM tratamientos WHERE id_tratamiento = ANY($1::int[]);', [fx.treatments]);
    await pool.query('DELETE FROM sesiones WHERE id_sesion = ANY($1::int[]);', [fx.sessions]);
    await pool.query('DELETE FROM reservas WHERE id_reserva = ANY($1::int[]);', [fx.reservations]);
    await pool.query('DELETE FROM expedientes WHERE id_paciente = ANY($1::int[]);', [fx.patients]);
    await pool.query('DELETE FROM pacientes WHERE id_paciente = ANY($1::int[]);', [fx.patients]);
    await pool.query('DELETE FROM tutores WHERE id_tutor = $1;', [fx.tutorId]);
    await pool.query('DELETE FROM terapeutas WHERE id_terapeuta = ANY($1::int[]);', [[fx.therapistId, fx.otherTherapistId]]);
    await pool.query('DELETE FROM usuario_roles WHERE id_usuario = ANY($1::int[]);', [fx.users]);
    await pool.query('DELETE FROM usuarios WHERE id_usuario = ANY($1::int[]);', [fx.users]);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  });

  it('captura variables del servidor: solo evaluaciones clinicas confirmadas y aun no alcanzadas cuentan como fonemas afectados', async () => {
    const row = await variablesOf('alta');
    assert.equal(row.codigo_diagnostico, 2);
    assert.equal(row.cantidad_fonemas_afectados, 2); // /r/ y /s/; pendiente, descartada, alcanzada y ludica no cuentan
    assert.equal(row.nivel_colaboracion, 2); // "Ayuda alta" invertida
    assert.equal(row.frecuencia_semanal, 2);
    assert.equal(row.edad_meses, 61 - 2); // la sesion de origen fue hace 60 dias (2 meses antes)
    assert.equal(row.fecha_desenlace, null);
    assert.equal((await variablesOf('abandono')).cantidad_fonemas_afectados, 1);
    assert.equal((await variablesOf('abandono')).nivel_colaboracion, 5);
    assert.equal((await variablesOf('sinfonemas')).cantidad_fonemas_afectados, 0);
  });

  it('rechaza un codigo fuera del catalogo y un pronostico con otro codigo', async () => {
    const client = await pool.connect();
    try {
      await assert.rejects(
        registrarVariablesModeloTratamiento(client, { idTratamiento: plans.alta.treatmentId, codigoDiagnostico: 7 }),
        (error: { status?: number }) => error.status === 400,
      );
    } finally {
      client.release();
    }
  });

  it('el catalogo diagnostico esta siempre disponible para terapeuta y admin, y no para la familia', async () => {
    const res = await fetch(`${baseUrl}/api/v1/clinica/diagnosticos-preliminares`, { headers: auth('TERAPEUTA', fx.therapistUser) });
    assert.equal(res.status, 200);
    const body = await res.json() as { etiqueta: string; codigos: Array<{ code: number; label: string }> };
    assert.equal(body.etiqueta, ETIQUETA_DIAGNOSTICO_PRELIMINAR);
    assert.deepEqual(body.codigos, DIAGNOSTICOS_PRELIMINARES.map((item) => ({ ...item })));
    assert.equal((await fetch(`${baseUrl}/api/v1/clinica/diagnosticos-preliminares`, { headers: auth('ADMIN', 1) })).status, 200);
    assert.equal((await fetch(`${baseUrl}/api/v1/clinica/diagnosticos-preliminares`, { headers: auth('PADRE', fx.parentUser) })).status, 403);
  });

  it('el estado del pronostico responde 200 sin modelo aprobado (estado esperado, no un error)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/clinica/tratamientos/pronostico-estado`, { headers: auth('TERAPEUTA', fx.therapistUser) });
    assert.equal(res.status, 200);
    const body = await res.json() as { disponible: boolean; version_modelo: string | null };
    assert.equal(typeof body.disponible, 'boolean');
    if (!body.disponible) assert.equal(body.version_modelo, null);
    assert.equal((await fetch(`${baseUrl}/api/v1/clinica/tratamientos/pronostico-estado`, { headers: auth('PADRE', fx.parentUser) })).status, 403);
  });

  it('el desenlace exige permisos: familia y terapeuta ajeno no pueden cerrar el plan', async () => {
    assert.equal((await close('abandono', 'PADRE', fx.parentUser, { desenlace: 'ALTA' })).status, 403);
    assert.equal((await close('abandono', 'TERAPEUTA', fx.otherTherapistUser, { desenlace: 'ALTA' })).status, 403);
    assert.equal((await close('abandono', 'TERAPEUTA', fx.therapistUser, { desenlace: 'ACTIVO' })).status, 400);
    assert.equal((await close('abandono', 'TERAPEUTA', fx.therapistUser, { desenlace: 'ALTA', extra: true })).status, 400);
    const stillActive = await pool.query('SELECT estado_tratamiento FROM tratamientos WHERE id_tratamiento = $1;', [plans.abandono.treatmentId]);
    assert.equal(stillActive.rows[0].estado_tratamiento, 'ACTIVO');
  });

  it('el terapeuta del plan registra ALTA o ABANDONO; un plan cerrado no vuelve a ACTIVO ni se cierra dos veces', async () => {
    const alta = await close('alta', 'TERAPEUTA', fx.therapistUser, { desenlace: 'ALTA', observacion: 'Objetivos alcanzados' });
    assert.equal(alta.status, 200);
    const body = await alta.json() as { estado_tratamiento: string; fecha_fin: string | null; citas_futuras_pendientes: number };
    assert.equal(body.estado_tratamiento, 'ALTA');
    assert.ok(body.fecha_fin);
    assert.equal(body.citas_futuras_pendientes, 0);
    const row = await pool.query('SELECT estado_tratamiento, observaciones_cierre, fecha_fin FROM tratamientos WHERE id_tratamiento = $1;', [plans.alta.treatmentId]);
    assert.equal(row.rows[0].estado_tratamiento, 'ALTA');
    assert.equal(row.rows[0].observaciones_cierre, 'Objetivos alcanzados');
    assert.ok((await variablesOf('alta')).fecha_desenlace);

    assert.equal((await close('alta', 'TERAPEUTA', fx.therapistUser, { desenlace: 'ABANDONO' })).status, 409);
    await assert.rejects(
      pool.query("UPDATE tratamientos SET estado_tratamiento = 'ACTIVO' WHERE id_tratamiento = $1;", [plans.alta.treatmentId]),
      /no puede reabrirse/,
    );
    assert.equal((await close('abandono', 'ADMIN', 1, { desenlace: 'ABANDONO' })).status, 200);
    assert.equal((await close('ajeno', 'TERAPEUTA', fx.otherTherapistUser, { desenlace: 'ALTA' })).status, 200);
    assert.equal((await close('sinsesiones', 'TERAPEUTA', fx.therapistUser, { desenlace: 'ALTA' })).status, 200);
    assert.equal((await close('sinfonemas', 'TERAPEUTA', fx.therapistUser, { desenlace: 'ABANDONO' })).status, 200);
  });

  it('un plan cerrado ya no admite citas nuevas ni aparece como plan activo', async () => {
    const active = await pool.query(
      "SELECT 1 FROM tratamientos WHERE id_tratamiento = ANY($1::int[]) AND estado_tratamiento = 'ACTIVO';",
      [[plans.alta.treatmentId, plans.abandono.treatmentId]],
    );
    assert.equal(active.rowCount, 0);
    const activePlan = await pool.query("SELECT 1 FROM tratamientos WHERE id_tratamiento = $1 AND estado_tratamiento = 'ACTIVO';", [plans.activo.treatmentId]);
    assert.equal(activePlan.rowCount, 1);
  });

  it('el exportador lee los nuevos datos, separa por fecha, omite filas invalidas y no lleva identificadores', async () => {
    const client = await pool.connect();
    let cohort: { train: string[]; validation: string[]; omitted: number };
    try {
      await client.query('BEGIN TRANSACTION READ ONLY');
      cohort = await exporter.collectCohort(client, new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10));
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    // alta: edad 59, diag 2, 2 fonemas, colab 2, freq 2, 7 sesiones con asistencia, abandono 0; inicio hace 40 dias -> entrenamiento.
    assert.ok(cohort.train.includes('59,2,2,2,2,7,0'), cohort.train.join(' | '));
    // abandono: inicio hace 5 dias -> validacion; edad 71, diag 0, 1 fonema, colab 5, freq 1, 3 sesiones, abandono 1.
    assert.ok(cohort.validation.includes('71,0,1,5,1,3,1'), cohort.validation.join(' | '));
    const all = [...cohort.train, ...cohort.validation];
    assert.ok(!all.some((line) => line.startsWith('83,')), 'un plan ACTIVO no es un desenlace');
    assert.ok(!all.some((line) => line.startsWith('95,')), 'sin sesiones con asistencia se omite');
    assert.ok(!all.some((line) => line.startsWith('107,')), 'sin fonemas confirmados se omite');
    assert.ok(cohort.omitted >= 2);
    for (const line of all) assert.match(line, /^\d+(,\d+){6}$/);
  });

  it('el comando exporta CSV solo con las siete columnas del entrenador y sin mapa de desenlace', () => {
    const outDir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ashakids-cohort-')), 'salida');
    try {
      const result = spawnSync(process.execPath, [
        path.resolve(process.cwd(), '..', 'scripts', 'export_treatment_cohort.mjs'),
        '--split-date', new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10),
        '--output-dir', outDir, '--min-rows', '2',
      ], {
        cwd: path.resolve(process.cwd(), '..'),
        encoding: 'utf8',
        env: {
          PATH: process.env.PATH ?? '', SystemRoot: process.env.SystemRoot ?? '',
          ASHAKIDS_ENV_FILE: path.join(os.tmpdir(), 'no-existe.env'),
          DB_HOST: settings.DB_HOST, DB_PORT: String(settings.DB_PORT), DB_NAME: settings.DB_NAME,
          DB_USER: settings.DB_USER, DB_PASSWORD: settings.DB_PASSWORD, DB_SSL_ENABLED: 'false',
        },
      });
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
      for (const file of ['train.csv', 'validation.csv']) {
        const [header, ...rows] = fs.readFileSync(path.join(outDir, file), 'utf8').trim().split(/\r?\n/);
        assert.equal(header, 'edad_meses,codigo_diagnostico,cantidad_fonemas_afectados,nivel_colaboracion,frecuencia_semanal,sesiones_hasta_alta,abandono');
        assert.ok(rows.length > 0);
        for (const row of rows) assert.match(row, /^\d+(,\d+){6}$/);
      }
    } finally {
      fs.rmSync(path.dirname(outDir), { recursive: true, force: true });
    }
  });
});

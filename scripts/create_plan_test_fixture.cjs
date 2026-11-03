#!/usr/bin/env node

// Test-only helper for creating a fully specified plan fixture. Clinical plans
// in real use must be created through the authenticated session-plan API.
const { Pool } = require('../backend/node_modules/pg');

const AREAS = new Set(['FLUIDEZ', 'HABLA', 'LENGUAJE', 'VOZ', 'OROFACIAL']);
const PHONEMES = new Set(['/rr/', '/r/', '/s/', '/pl/', '/tr/']);
const USAGE = [
  'Uso seguro (solo base local de prueba):',
  'ENVIRONMENT=test DATABASE_URL=postgres://.../ashakids_test node scripts/create_plan_test_fixture.cjs',
  '  --patient-id <id> --therapist-id <id> --name <nombre>',
  '  --sessions <1-31> --frequency <1-3> --area <FLUIDEZ|HABLA|LENGUAJE|VOZ|OROFACIAL>',
  '  --worlds <lista separada por comas> [--phonemes <lista separada por comas>]',
  '  [--description <texto>] --confirm',
].join('\n');

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith('--') || key === '--confirm') {
      if (key === '--confirm') result.confirm = true;
      else throw new Error(`Argumento no reconocido: ${key}`);
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Falta el valor de ${key}.`);
    result[key.slice(2)] = value;
    index += 1;
  }
  return result;
}

function requiredText(args, key, maxLength) {
  const value = String(args[key] ?? '').trim();
  if (!value || value.length > maxLength) throw new Error(`--${key} es obligatorio y admite hasta ${maxLength} caracteres.`);
  return value;
}

function requiredInteger(args, key, minimum, maximum) {
  const value = Number(args[key]);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`--${key} debe ser un entero entre ${minimum} y ${maximum}.`);
  }
  return value;
}

function csv(args, key) {
  return String(args[key] ?? '').split(',').map((value) => value.trim()).filter(Boolean);
}

function validateDatabase() {
  if (process.env.ENVIRONMENT !== 'test') {
    throw new Error('Este script solo puede ejecutarse con ENVIRONMENT=test.');
  }
  if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL para una base local de prueba.');

  const url = new URL(process.env.DATABASE_URL);
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname) || !/(?:_test|_e2e)$/i.test(databaseName)) {
    throw new Error('Se rechazó la conexión: debe apuntar a localhost y a una base cuyo nombre termine en _test o _e2e.');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.confirm) throw new Error('La escritura requiere --confirm. No se modificó la base de datos.');
  validateDatabase();

  const patientId = requiredInteger(args, 'patient-id', 1, 2_147_483_647);
  const therapistId = requiredInteger(args, 'therapist-id', 1, 2_147_483_647);
  const sessions = requiredInteger(args, 'sessions', 1, 31);
  const frequency = requiredInteger(args, 'frequency', 1, 3);
  const name = requiredText(args, 'name', 100);
  const description = args.description == null ? null : requiredText(args, 'description', 90_000);
  const area = requiredText(args, 'area', 32).toUpperCase();
  const worlds = csv(args, 'worlds').map((world) => world.toUpperCase());
  const phonemes = csv(args, 'phonemes');

  if (!AREAS.has(area)) throw new Error('--area no pertenece al catálogo clínico permitido.');
  if (worlds.length < 1 || worlds.length > 5 || worlds.some((world) => !AREAS.has(world)) || new Set(worlds).size !== worlds.length) {
    throw new Error('--worlds debe incluir de 1 a 5 mundos permitidos y sin duplicados.');
  }
  if (phonemes.length > 5 || phonemes.some((phoneme) => !PHONEMES.has(phoneme)) || new Set(phonemes).size !== phonemes.length) {
    throw new Error('--phonemes debe incluir hasta 5 fonemas permitidos y sin duplicados.');
  }
  if (['HABLA', 'VOZ'].includes(area) && phonemes.length === 0) {
    throw new Error('Los planes de HABLA o VOZ requieren fonemas priorizados revisados por el terapeuta.');
  }
  if (phonemes.length > 0 && !worlds.includes('LENGUAJE')) {
    throw new Error('Incluye LENGUAJE en --worlds para habilitar la práctica de fonemas.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const patient = await client.query(
      'SELECT id_paciente FROM pacientes WHERE id_paciente = $1 AND activo = TRUE FOR UPDATE;',
      [patientId],
    );
    if (patient.rowCount !== 1) throw new Error('No se encontró un paciente activo con ese ID.');

    const expediente = await client.query(
      'SELECT id_expediente FROM expedientes WHERE id_paciente = $1 ORDER BY id_expediente DESC LIMIT 1 FOR UPDATE;',
      [patientId],
    );
    if (expediente.rowCount !== 1) throw new Error('El paciente no tiene expediente clínico.');

    const therapist = await client.query(
      'SELECT id_terapeuta FROM terapeutas WHERE id_terapeuta = $1;',
      [therapistId],
    );
    if (therapist.rowCount !== 1) throw new Error('No se encontró un terapeuta con ese ID.');

    const activePlan = await client.query(
      "SELECT id_tratamiento FROM tratamientos WHERE id_expediente = $1 AND estado_tratamiento = 'ACTIVO' LIMIT 1;",
      [expediente.rows[0].id_expediente],
    );
    if (activePlan.rowCount > 0) throw new Error('El paciente ya tiene un plan activo.');

    const created = await client.query(
      `INSERT INTO tratamientos
         (id_expediente, id_terapeuta, nombre_tratamiento, descripcion, area,
          mundos_asignados, sesiones_recomendadas, frecuencia_semanal,
          fonemas_priorizados, estado_tratamiento, fecha_inicio)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9::jsonb, 'ACTIVO', CURRENT_DATE)
       RETURNING id_tratamiento;`,
      [
        expediente.rows[0].id_expediente,
        therapistId,
        name,
        description,
        area,
        JSON.stringify(worlds),
        sessions,
        frequency,
        JSON.stringify(phonemes),
      ],
    );
    await client.query('COMMIT');
    console.log(`Plan de prueba creado (id_tratamiento=${created.rows[0].id_tratamiento}).`);
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client?.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`${error.message}\n\n${USAGE}`);
  process.exitCode = 1;
});

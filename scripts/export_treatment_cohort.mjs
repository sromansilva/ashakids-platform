#!/usr/bin/env node
/**
 * Exportación anonimizada (SOLO LECTURA) de la cohorte para entrenar el pronóstico.
 *
 * - Abre UNA transacción READ ONLY; nunca escribe en la base.
 * - Emite CSV sin identificadores: edad_meses, codigo_diagnostico,
 *   cantidad_fonemas_afectados, nivel_colaboracion, frecuencia_semanal,
 *   sesiones_hasta_alta, abandono.
 * - Solo tratamientos con desenlace registrado por el terapeuta (ALTA o ABANDONO).
 *
 * Fuentes (backend/src/modules/clinica/clinica.migration.ts):
 *   variables           <- public.tratamiento_variables_modelo, que el servidor calcula al
 *                          publicar el plan (edad, código diagnóstico preliminar del terapeuta,
 *                          fonemas afectados confirmados, colaboración derivada del nivel de
 *                          ayuda y frecuencia semanal). No depende de que exista un modelo.
 *   desenlace           <- tratamientos.estado_tratamiento ('ALTA' o 'ABANDONO'), fijado con
 *                          PATCH /api/v1/clinica/tratamientos/:id/desenlace.
 *   sesiones_hasta_alta <- sesiones FINALIZADA con asistencia de las reservas del tratamiento.
 *                          En filas de abandono es un conteo truncado (el entrenador solo usa
 *                          filas de alta para el regresor de sesiones).
 *
 * Un expediente (id_expediente, usado solo internamente y nunca exportado) aporta UNA fila:
 * su primer tratamiento con desenlace; su cohorte se asigna por la fecha de inicio de ese
 * tratamiento, para no filtrar un paciente entre cohortes. Se omiten las filas con variables
 * fuera de rango (las del entrenador) o con sesiones fuera de 1 a 31.
 *
 * NOTA: esto solo exporta lo que ya se haya registrado. Hay que acumular una cohorte REAL
 * (planes publicados con su código diagnóstico y cerrados con su desenlace) antes de que el
 * resultado sirva para entrenar; con pocos casos el script termina con error (--min-rows).
 * Exportar no aprueba ni habilita ningún modelo: el pronóstico sigue apagado (503) hasta que un
 * humano firme un manifiesto.
 *
 * Uso:
 *   node scripts/export_treatment_cohort.mjs --split-date 2026-06-01 --output-dir cohorte-out [--min-rows 300]
 *
 *   --split-date: tratamientos con fecha_inicio anterior -> train.csv; el resto ->
 *   validation.csv (cohorte temporal independiente).
 *
 * Conexión: variables DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD, todas
 * obligatorias y sin valores por defecto (ASHAKIDS_ENV_FILE, backend.env en
 * %LOCALAPPDATA%/AshaKids o .env las pueden aportar). Con DB_SSL_ENABLED=true se
 * verifica el certificado; DB_SSL_CA_FILE opcional apunta a una CA propia.
 * No se imprime ningún dato personal.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const require = createRequire(path.join(process.cwd(), 'backend', 'package.json'));
const FEATURES = ['edad_meses', 'codigo_diagnostico', 'cantidad_fonemas_afectados', 'nivel_colaboracion', 'frecuencia_semanal'];
const CSV_HEADER = [...FEATURES, 'sesiones_hasta_alta', 'abandono'];
const OUTCOMES = ['ALTA', 'ABANDONO'];

class ExportError extends Error {}

function fail(message) {
  throw new ExportError(message);
}

function loadEnv() {
  const dotenv = require('dotenv');
  if (process.env.ASHAKIDS_ENV_FILE) {
    dotenv.config({ path: process.env.ASHAKIDS_ENV_FILE });
  } else {
    if (process.env.LOCALAPPDATA) dotenv.config({ path: path.join(process.env.LOCALAPPDATA, 'AshaKids', 'backend.env') });
    dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });
    dotenv.config();
  }
}

export function dbConfig(env = process.env) {
  const missing = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter((k) => !env[k] || !String(env[k]).trim());
  if (missing.length) fail(`Faltan variables de conexión obligatorias: ${missing.join(', ')}. No se conecta.`);
  const port = parseInt(env.DB_PORT, 10);
  if (!Number.isInteger(port) || port < 1) fail('DB_PORT no es válido.');
  let ssl = false;
  if (env.DB_SSL_ENABLED === 'true') {
    ssl = { rejectUnauthorized: true };
    if (env.DB_SSL_CA_FILE) {
      try {
        ssl.ca = fs.readFileSync(env.DB_SSL_CA_FILE, 'utf8');
      } catch (err) {
        fail(`DB_SSL_CA_FILE ilegible: ${err.message}`);
      }
    }
  }
  return { host: env.DB_HOST, port, database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD, ssl };
}

async function assertSchema(client) {
  const required = {
    tratamientos: ['id_tratamiento', 'id_expediente', 'estado_tratamiento', 'fecha_inicio'],
    tratamiento_variables_modelo: ['id_tratamiento', ...FEATURES],
    reservas: ['id_reserva', 'id_tratamiento'],
    sesiones: ['id_sesion', 'id_reserva', 'estado_sesion', 'asistencia'],
  };
  const { rows } = await client.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [Object.keys(required)],
  );
  const present = new Set(rows.map((r) => `${r.table_name}.${r.column_name}`));
  const missing = Object.entries(required).flatMap(([t, cols]) => cols.filter((c) => !present.has(`${t}.${c}`)).map((c) => `${t}.${c}`));
  if (missing.length) fail(`Faltan campos necesarios en el esquema: ${missing.join(', ')}. No se exporta nada.`);
}

function csvLine(values) {
  return values.map((v) => String(v)).join(',');
}

/** Rangos aceptados por el entrenador (ml-service/train_predictive_model.py). */
function inRange(row) {
  const within = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
  return within(row.edad_meses, 24, 180) && within(row.codigo_diagnostico, 0, 3) &&
    within(row.cantidad_fonemas_afectados, 1, 5) && within(row.nivel_colaboracion, 1, 5) &&
    within(row.frecuencia_semanal, 1, 3) && within(row.sesiones_hasta_alta, 1, 31);
}

/**
 * Lee la cohorte con un cliente pg ya dentro de una transacción de solo lectura.
 * Devuelve las líneas CSV de entrenamiento y validación y cuántas filas se omitieron.
 */
export async function collectCohort(client, splitDate) {
  // Sin identificadores en el SELECT: solo variables del modelo, desenlace y la fecha de corte (no se exporta).
  // id_expediente solo se usa para quedarse con una fila por expediente; no se selecciona hacia el CSV.
  const { rows } = await client.query(
    `SELECT DISTINCT ON (t.id_expediente)
            v.edad_meses, v.codigo_diagnostico, v.cantidad_fonemas_afectados, v.nivel_colaboracion,
            v.frecuencia_semanal,
            t.estado_tratamiento,
            t.fecha_inicio >= $2::date AS es_validacion,
            (SELECT COUNT(*)::int
               FROM public.reservas r
               JOIN public.sesiones s ON s.id_reserva = r.id_reserva
              WHERE r.id_tratamiento = t.id_tratamiento
                AND s.estado_sesion = 'FINALIZADA'
                AND UPPER(s.asistencia::text) IN ('ASISTIO', 'TRUE', 'T', '1')) AS sesiones_hasta_alta
       FROM public.tratamientos t
       JOIN public.tratamiento_variables_modelo v ON v.id_tratamiento = t.id_tratamiento
      WHERE t.estado_tratamiento = ANY($1::text[])
        AND t.fecha_inicio IS NOT NULL
      ORDER BY t.id_expediente, t.fecha_inicio, t.id_tratamiento`,
    [OUTCOMES, splitDate],
  );
  const train = [];
  const validation = [];
  let omitted = 0;
  for (const r of rows) {
    if (!inRange(r)) {
      omitted += 1;
      continue;
    }
    const abandono = r.estado_tratamiento === 'ABANDONO' ? 1 : 0;
    const line = csvLine([
      r.edad_meses, r.codigo_diagnostico, r.cantidad_fonemas_afectados, r.nivel_colaboracion,
      r.frecuencia_semanal, r.sesiones_hasta_alta, abandono,
    ]);
    (r.es_validacion ? validation : train).push(line);
  }
  return { train, validation, omitted };
}

async function main() {
  const { values } = parseArgs({
    options: {
      'split-date': { type: 'string' },
      'output-dir': { type: 'string' },
      'min-rows': { type: 'string', default: '300' },
    },
  });
  if (!values['output-dir']) fail('Falta --output-dir.');
  if (!values['split-date'] || !/^\d{4}-\d{2}-\d{2}$/.test(values['split-date'])) fail('--split-date es obligatorio (YYYY-MM-DD) para obtener una cohorte de validación independiente.');
  const minRows = parseInt(values['min-rows'], 10);
  if (!Number.isInteger(minRows) || minRows < 1) fail('--min-rows debe ser un entero positivo.');
  const outDir = path.resolve(values['output-dir']);
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) fail(`${outDir} ya contiene archivos; usa un directorio nuevo.`);

  loadEnv();
  const config = dbConfig();
  const { Client } = require('pg');
  const client = new Client(config);
  await client.connect();
  let cohort;
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    await assertSchema(client);
    cohort = await collectCohort(client, values['split-date']);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
  const { train: trainRows, validation: validationRows, omitted } = cohort;

  if (trainRows.length + validationRows.length < minRows) {
    fail(
      `Solo hay ${trainRows.length + validationRows.length} expedientes con desenlace registrado y variables válidas ` +
      `(${omitted} omitidos por rangos); el mínimo es ${minRows}. No se exporta nada. ` +
      'Hay que acumular una cohorte real: planes publicados con su código diagnóstico y cerrados con alta o abandono.',
    );
  }
  if (!trainRows.length || !validationRows.length) fail('La fecha de corte deja una cohorte vacía. No se exporta nada.');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'train.csv'), [csvLine(CSV_HEADER), ...trainRows].join(os.EOL) + os.EOL, 'utf8');
  fs.writeFileSync(path.join(outDir, 'validation.csv'), [csvLine(CSV_HEADER), ...validationRows].join(os.EOL) + os.EOL, 'utf8');
  console.log(`Exportado: train=${trainRows.length} filas, validation=${validationRows.length} filas, omitidas=${omitted} en ${outDir}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((err) => {
  console.error(`ERROR: ${err instanceof ExportError ? err.message : err.message || err}`);
  process.exit(2);
});

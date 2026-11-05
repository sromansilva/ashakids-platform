#!/usr/bin/env node
/**
 * Exportación anonimizada (SOLO LECTURA) de la cohorte para entrenar el pronóstico.
 *
 * - Abre UNA transacción READ ONLY; nunca escribe en la base.
 * - Emite CSV sin identificadores: edad_meses, codigo_diagnostico,
 *   cantidad_fonemas_afectados, nivel_colaboracion, frecuencia_semanal,
 *   sesiones_hasta_alta, abandono.
 * - Solo pacientes con desenlace terminado (alta o abandono).
 *
 * Mapeo (de backend/src/modules/clinica/clinica.migration.ts):
 *   features  <- public.predicciones_tratamiento enlazada por tratamientos.id_prediccion,
 *                solo con estado_confirmacion CONFIRMADO_CLINICO o MODIFICADO_MANUAL.
 *   sesiones_hasta_alta <- sesiones FINALIZADA de reservas con id_tratamiento = tratamiento.
 *   desenlace <- tratamientos.estado_tratamiento (alta o abandono).
 *
 * DEPENDENCIA CIRCULAR: predicciones_tratamiento solo se llena DESPUES de que un
 * modelo aprobado responde (en clinica.service.ts el INSERT va tras el fetch al
 * servicio ML). Sin un modelo aprobado la tabla queda vacía y esta exportación da
 * 0 filas para siempre. Para obtener una cohorte, la aplicación debe registrar el
 * código diagnóstico y el desenlace (alta o abandono) de forma independiente del
 * modelo; esa decisión de producto aún no está implementada. Las fuentes de
 * variables de abajo reflejan el esquema actual y deberán revisarse entonces.
 *
 * Un expediente (id_expediente, usado solo internamente y nunca exportado) aporta
 * UNA fila: su primer tratamiento con desenlace terminado; su cohorte se asigna
 * por la fecha de ese tratamiento, para no filtrar un paciente entre cohortes.
 *
 * LIMITACION CONOCIDA: el esquema versionado en el repositorio no define un
 * desenlace de alta ni de abandono. El código solo usa estado_tratamiento =
 * 'ACTIVO' y no hay CHECK ni enum que declare los demás valores. Por eso el
 * script NO asume nombres de estado: exige un archivo --outcome-map con el
 * mapeo explícito que apruebe un responsable clínico, y verifica en la base que
 * esos valores existan. Sin ese mapeo, o si faltan tablas/columnas, termina con
 * error y no exporta nada.
 *
 * Uso:
 *   node scripts/export_treatment_cohort.mjs --outcome-map mapa.json \
 *     --split-date 2026-06-01 --output-dir cohorte-out [--min-rows 300]
 *
 *   mapa.json: {"alta": ["<valor estado_tratamiento>"], "abandono": ["<valor>"]}
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

function readOutcomeMap(file) {
  if (!file) {
    fail(
      'Falta --outcome-map. El esquema del repositorio no define un desenlace de alta ni de abandono ' +
      '(tratamientos.estado_tratamiento solo se usa con el valor ACTIVO y no hay enum ni CHECK que declare ' +
      'otros estados), así que el script no puede inferirlo. Un responsable clínico debe aportar un JSON ' +
      '{"alta": [...], "abandono": [...]} con los valores reales de estado_tratamiento, o el sistema debe ' +
      'registrar el desenlace de forma explícita antes de exportar.',
    );
  }
  let map;
  try {
    map = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    fail(`--outcome-map ilegible: ${err.message}`);
  }
  const valid = (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string' && x.trim());
  if (!map || !valid(map.alta) || !valid(map.abandono)) fail('--outcome-map debe tener "alta" y "abandono" como listas de textos no vacías.');
  const overlap = map.alta.filter((v) => map.abandono.includes(v));
  if (overlap.length) fail(`Estados presentes en alta y abandono a la vez: ${overlap.join(', ')}.`);
  if ([...map.alta, ...map.abandono].some((v) => v.trim().toUpperCase() === 'ACTIVO')) fail('ACTIVO no es un desenlace terminado.');
  return { alta: map.alta, abandono: map.abandono };
}

async function assertSchema(client) {
  const required = {
    tratamientos: ['id_tratamiento', 'id_expediente', 'estado_tratamiento', 'fecha_inicio', 'id_prediccion'],
    predicciones_tratamiento: [...FEATURES, 'id_prediccion', 'estado_confirmacion'],
    reservas: ['id_reserva', 'id_tratamiento'],
    sesiones: ['id_sesion', 'id_reserva', 'estado_sesion'],
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

async function main() {
  const { values } = parseArgs({
    options: {
      'outcome-map': { type: 'string' },
      'split-date': { type: 'string' },
      'output-dir': { type: 'string' },
      'min-rows': { type: 'string', default: '300' },
    },
  });
  if (!values['output-dir']) fail('Falta --output-dir.');
  if (!values['split-date'] || !/^\d{4}-\d{2}-\d{2}$/.test(values['split-date'])) fail('--split-date es obligatorio (YYYY-MM-DD) para obtener una cohorte de validación independiente.');
  const minRows = parseInt(values['min-rows'], 10);
  if (!Number.isInteger(minRows) || minRows < 1) fail('--min-rows debe ser un entero positivo.');
  const outcomes = readOutcomeMap(values['outcome-map']);
  const outDir = path.resolve(values['output-dir']);
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) fail(`${outDir} ya contiene archivos; usa un directorio nuevo.`);

  loadEnv();
  const config = dbConfig();
  const { Client } = require('pg');
  const client = new Client(config);
  await client.connect();
  let trainRows = [];
  let validationRows = [];
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    await assertSchema(client);

    const mapped = [...outcomes.alta, ...outcomes.abandono];
    const states = await client.query(
      'SELECT DISTINCT estado_tratamiento FROM public.tratamientos WHERE estado_tratamiento IS NOT NULL',
    );
    const existing = new Set(states.rows.map((r) => r.estado_tratamiento));
    const absent = mapped.filter((v) => !existing.has(v));
    if (absent.length) {
      fail(
        `Los estados del mapa no existen en tratamientos.estado_tratamiento: ${absent.join(', ')}. ` +
        `Valores presentes: ${[...existing].join(', ') || '(ninguno)'}.`,
      );
    }

    // Sin identificadores en el SELECT: solo variables del modelo, desenlace y la fecha de corte (no se exporta).
    // id_expediente solo se usa para quedarse con una fila por expediente; no se selecciona hacia el CSV.
    const { rows } = await client.query(
      `SELECT DISTINCT ON (t.id_expediente)
              p.edad_meses, p.codigo_diagnostico, p.cantidad_fonemas_afectados, p.nivel_colaboracion,
              p.frecuencia_semanal,
              t.estado_tratamiento,
              t.fecha_inicio >= $2::date AS es_validacion,
              (SELECT COUNT(*)::int
                 FROM public.reservas r
                 JOIN public.sesiones s ON s.id_reserva = r.id_reserva
                WHERE r.id_tratamiento = t.id_tratamiento AND s.estado_sesion = 'FINALIZADA') AS sesiones_hasta_alta
         FROM public.tratamientos t
         JOIN public.predicciones_tratamiento p ON p.id_prediccion = t.id_prediccion
        WHERE p.estado_confirmacion IN ('CONFIRMADO_CLINICO', 'MODIFICADO_MANUAL')
          AND t.estado_tratamiento = ANY($1::text[])
          AND t.fecha_inicio IS NOT NULL
        ORDER BY t.id_expediente, t.fecha_inicio, t.id_tratamiento`,
      [mapped, values['split-date']],
    );

    for (const r of rows) {
      const abandono = outcomes.abandono.includes(r.estado_tratamiento) ? 1 : 0;
      const line = csvLine([
        r.edad_meses, r.codigo_diagnostico, r.cantidad_fonemas_afectados, r.nivel_colaboracion,
        r.frecuencia_semanal, r.sesiones_hasta_alta, abandono,
      ]);
      // Una alta sin sesiones finalizadas, o más de 31, no es un desenlace confiable.
      if (r.sesiones_hasta_alta < 1 || r.sesiones_hasta_alta > 31) continue;
      (r.es_validacion ? validationRows : trainRows).push(line);
    }
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }

  if (trainRows.length + validationRows.length < minRows) {
    fail(
      `Solo hay ${trainRows.length + validationRows.length} expedientes con desenlace terminado y pronóstico confirmado; ` +
      `el mínimo es ${minRows}. No se exporta nada. Nota: predicciones_tratamiento solo se llena tras la respuesta de un modelo ` +
      'aprobado, así que sin modelo siempre habrá 0 filas; la aplicación debe registrar código diagnóstico y desenlace ' +
      '(alta o abandono) de forma independiente del modelo para formar una cohorte.',
    );
  }
  if (!trainRows.length || !validationRows.length) fail('La fecha de corte deja una cohorte vacía. No se exporta nada.');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'train.csv'), [csvLine(CSV_HEADER), ...trainRows].join(os.EOL) + os.EOL, 'utf8');
  fs.writeFileSync(path.join(outDir, 'validation.csv'), [csvLine(CSV_HEADER), ...validationRows].join(os.EOL) + os.EOL, 'utf8');
  console.log(`Exportado: train=${trainRows.length} filas, validation=${validationRows.length} filas en ${outDir}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((err) => {
  console.error(`ERROR: ${err instanceof ExportError ? err.message : err.message || err}`);
  process.exit(2);
});

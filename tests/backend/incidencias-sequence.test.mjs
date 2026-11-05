import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryApp } from './support-test-helpers.mjs';
const { migrateIncidencias } = await import('../../backend/dist/modules/incidencias/incidencias.migration.js');
const { seedIncidencias } = await import('../../backend/dist/modules/incidencias/incidencias.seed.js');

test('demo initialization preserves ticket numbering and existing incidents when repeated', { timeout: 30000 }, async (t) => {
  const { db } = await memoryApp(t, { migrations: [migrateIncidencias] });
  await db.query(`INSERT INTO incidencias(ticket, tipo, solicitud, solicitante, rol_solicitante, prioridad)
    VALUES ('INC-10050', 'Funcional', 'Incidencia existente que se debe conservar', 'Prueba', 'PADRE', 2)`);
  await seedIncidencias();
  const create = async () => (await db.query(`INSERT INTO incidencias(tipo, solicitud, solicitante, rol_solicitante, prioridad)
    VALUES ('Funcional', 'Nueva incidencia de prueba', 'Prueba', 'PADRE', 2) RETURNING ticket`)).rows[0].ticket;
  assert.equal(await create(), 'INC-10051');
  await seedIncidencias();
  assert.equal(await create(), 'INC-10052');
  const existing = (await db.query("SELECT solicitud FROM incidencias WHERE ticket = 'INC-10050'")).rows[0];
  assert.equal(existing.solicitud, 'Incidencia existente que se debe conservar');
});

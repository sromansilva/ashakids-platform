import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryApp } from './support-test-helpers.mjs';
const { migrateIncidencias } = await import('../../backend/dist/modules/incidencias/incidencias.migration.js');

test('state migration preserves incident content, timestamps and notes and enforces exactly three states', { timeout: 30000 }, async (t) => {
  const { db, users } = await memoryApp(t, { migrations: [migrateIncidencias] });
  // Simulate rows created by previous releases in an isolated PostgreSQL instance.
  await db.exec('ALTER TABLE incidencias DROP CONSTRAINT incidencias_estado_ck');
  const legacy = [
    ['RECIBIDA', 'RECIBIDA'], ['NUEVA', 'RECIBIDA'], ['ABIERTA', 'RECIBIDA'],
    ['LEIDA', 'EN ATENCIÓN'], ['LEÍDA', 'EN ATENCIÓN'], ['EN PROCESO', 'EN ATENCIÓN'],
    ['EN_PROCESO', 'EN ATENCIÓN'], ['EN_REVISION', 'EN ATENCIÓN'], ['EN ATENCIÓN', 'EN ATENCIÓN'],
    ['ATENDIDA', 'RESUELTA'], ['SOLUCIONADA', 'RESUELTA'], ['RESUELTA', 'RESUELTA'],
  ];
  const expected = [];
  for (const [previous, next] of legacy) {
    const result = await db.query(`INSERT INTO incidencias(tipo, solicitud, solicitante, rol_solicitante, prioridad, estado)
      VALUES ('Funcional', $1, 'Prueba', 'PADRE', 2, $2) RETURNING id_incidencia`, [`Contenido original: ${previous}`, previous]);
    expected.push({ id_incidencia: result.rows[0].id_incidencia, estado: next });
  }
  await db.query(`INSERT INTO incidencia_notas(id_incidencia, id_autor, contenido, interna)
    VALUES ($1, $2, 'Nota que se debe conservar', true)`, [expected[0].id_incidencia, users.ADMIN.id_usuario]);
  const snapshot = async () => (await db.query('SELECT id_incidencia, solicitud, fecha_creacion, fecha_actualizacion FROM incidencias ORDER BY id_incidencia')).rows;
  const original = await snapshot();
  await migrateIncidencias();
  await migrateIncidencias();
  assert.deepEqual((await db.query('SELECT id_incidencia, estado FROM incidencias ORDER BY id_incidencia')).rows, expected);
  assert.deepEqual(await snapshot(), original);
  assert.equal((await db.query('SELECT contenido FROM incidencia_notas')).rows[0].contenido, 'Nota que se debe conservar');
  for (const invalid of ['LEIDA', 'EN PROCESO', 'SOLUCIONADA', 'ATENDIDA', 'NUEVA']) {
    await assert.rejects(db.query('UPDATE incidencias SET estado=$1 WHERE id_incidencia=$2', [invalid, expected[0].id_incidencia]), { code: '23514' });
  }
});

test('admin and therapist incident APIs share the three-state workflow and reject obsolete inputs', { timeout: 30000 }, async (t) => {
  const { db, users, call } = await memoryApp(t, { migrations: [migrateIncidencias] });
  const therapist = (await db.query('SELECT id_terapeuta FROM terapeutas WHERE id_usuario=$1', [users.TERAPEUTA.id_usuario])).rows[0];
  for (const role of ['ADMIN', 'TERAPEUTA']) {
    const created = await call('/incidencias', { method: 'POST', cookie: users.PADRE.cookie, body: role === 'ADMIN'
      ? { tipo: 'Cuentas y Permisos', descripcion: 'Consulta sobre permisos de la cuenta.' }
      : { tipo: 'Seguimiento Terapéutico', descripcion: 'Consulta de seguimiento.', id_terapeuta: therapist.id_terapeuta } });
    assert.equal(created.status, 201);
    const id = created.data.id_incidencia;
    const path = role === 'ADMIN' ? `/admin/incidencias/${id}` : `/incidencias/${id}/estado`;
    for (const estado of ['RECIBIDA', 'EN ATENCIÓN', 'RESUELTA']) {
      const response = await call(path, { method: 'PATCH', cookie: users[role].cookie, body: { estado } });
      assert.equal(response.status, 200);
      assert.equal(response.data.estado, estado);
    }
    for (const estado of ['LEIDA', 'LEÍDA', 'EN PROCESO', 'SOLUCIONADA', 'ATENDIDA', 'ABIERTA', null]) {
      assert.equal((await call(path, { method: 'PATCH', cookie: users[role].cookie, body: { estado } })).status, 400);
    }
    assert.equal((await call(`/incidencias/${id}`, { cookie: users.PADRE.cookie })).data.estado, 'RESUELTA');
  }
});

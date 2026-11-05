import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { memoryApp, createResetToken } from './support-test-helpers.mjs';
const { migrateIncidencias } = await import('../../backend/dist/modules/incidencias/incidencias.migration.js');

test('Soporte Técnico: migration, account activation, real login, ticket workflow and isolation', { timeout: 90000 }, async (t) => {
  const { db, users, password, call, login } = await memoryApp(t, { migrations: [migrateIncidencias] });
  let support;
  await t.test('only administration creates an independent support account; activation sets its own password', async () => {
    for (const role of ['PADRE', 'TERAPEUTA']) {
      assert.equal((await call('/admin/cuentas/soporte', { method: 'POST', cookie: users[role].cookie, body: {} })).status, 403);
    }
    const response = await call('/admin/cuentas/soporte', { method: 'POST', cookie: users.ADMIN.cookie, body: {
      nombres: 'Agente', apellidos: 'Técnico', email: 'soporte@example.invalid',
    } });
    assert.equal(response.status, 201, JSON.stringify(response.data));
    support = response.data.cuenta;
    assert.equal(support.rol, 'SOPORTE_TECNICO');
    assert.match(support.codigo_usuario, /^s\d{5}$/);
    const row = (await db.query('SELECT password_hash, password_change_required FROM usuarios WHERE id_usuario = $1', [support.id_usuario])).rows[0];
    assert.equal(row.password_change_required, true);
    const token = createResetToken(support.id_usuario, support.codigo_usuario, row.password_hash);
    assert.equal((await call('/auth/create-password', { method: 'POST', body: { token, new_password: password } })).status, 200);
    assert.equal((await login(support.codigo_usuario, 'incorrecta')).status, 401);
    assert.equal((await login(support.codigo_usuario, '12345')).status, 401);
    const signedIn = await login(support.codigo_usuario);
    assert.equal(signedIn.status, 200);
    assert.equal(signedIn.data.user.rol, 'SOPORTE_TECNICO');
    support.cookie = signedIn.cookie;
    assert.equal((await call('/auth/me', { cookie: support.cookie })).data.rol, 'SOPORTE_TECNICO');
    assert.equal((await db.query('SELECT count(*)::int AS n FROM terapeutas WHERE id_usuario = $1', [support.id_usuario])).rows[0].n, 0);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM tutores WHERE id_usuario = $1', [support.id_usuario])).rows[0].n, 0);
  });
  await t.test('support receives 403 across admin, clinical, account and legacy APIs; current roles keep their profiles', async () => {
    for (const path of ['/admin/cuentas', '/admin/me', '/usuarios', '/pacientes', '/clinica/sesiones', '/tratamientos', '/comunicacion/notificaciones', '/incidencias/recibidas/admin']) {
      assert.equal((await call(path, { cookie: support.cookie })).status, 403, path);
    }
    for (const [role, path] of [['ADMIN', '/admin/me'], ['PADRE', '/padres/me'], ['TERAPEUTA', '/terapeutas/me']]) {
      assert.equal((await call(path, { cookie: users[role].cookie })).status, 200, role);
      assert.equal((await call('/soporte/incidencias', { cookie: users[role].cookie })).status, 403, role);
    }
    assert.equal((await call('/soporte/incidencias')).status, 401);
  });
  let ticket;
  await t.test('creates, persists, lists, filters and retrieves only technical incidents with a minimal projection', async () => {
    const response = await call('/soporte/incidencias', { method: 'POST', cookie: support.cookie, body: { tipo: 'Funcional', descripcion: 'Error al abrir la pantalla de ayuda.' } });
    assert.equal(response.status, 201, JSON.stringify(response.data));
    ticket = response.data;
    assert.equal(ticket.estado, 'RECIBIDA');
    assert.equal(ticket.rol_solicitante, 'SOPORTE_TECNICO');
    for (const key of ['solicitante', 'email', 'id_usuario', 'id_paciente', 'id_terapeuta', 'envio_id']) assert.equal(key in ticket, false, key);
    const stored = (await db.query('SELECT area_destino FROM incidencias WHERE id_incidencia = $1', [ticket.id_incidencia])).rows[0];
    assert.equal(stored.area_destino, 'SOPORTE_TECNICO');
    assert.equal((await call(`/soporte/incidencias?search=${ticket.ticket}&prioridad=2&estado=RECIBIDA`, { cookie: support.cookie })).data.total, 1);
    assert.equal((await call('/soporte/incidencias?prioridad=1', { cookie: support.cookie })).data.total, 0);
    assert.equal((await call('/soporte/incidencias?limit=-1', { cookie: support.cookie })).status, 400);
    assert.equal((await call(`/soporte/incidencias/${ticket.id_incidencia}`, { cookie: support.cookie })).data.ticket, ticket.ticket);
    for (const area of ['ADMINISTRACION', 'TERAPEUTA']) {
      const other = (await db.query(`INSERT INTO incidencias(tipo, solicitud, solicitante, rol_solicitante, prioridad, area_destino)
        VALUES ('Otro', 'Datos privados fuera de soporte', 'Persona privada', 'PADRE', 2, $1) RETURNING id_incidencia`, [area])).rows[0];
      for (const [path, method, body] of [[`/${other.id_incidencia}`, 'GET'], [`/${other.id_incidencia}/estado`, 'PATCH', { estado: 'RESUELTA' }], [`/${other.id_incidencia}/notas`, 'POST', { contenido: 'Intento', interna: false }]]) {
        assert.equal((await call('/soporte/incidencias' + path, { cookie: support.cookie, method, body })).status, 404);
      }
    }
    assert.equal((await call('/soporte/incidencias', { cookie: support.cookie })).data.total, 1);
  });
  await t.test('submission retries are idempotent and cannot overwrite another account ticket', async () => {
    const envio_id = randomUUID();
    const body = { tipo: 'Funcional', descripcion: 'Error de ayuda al abrir la pantalla.', envio_id };
    const first = await call('/soporte/incidencias', { method: 'POST', cookie: support.cookie, body });
    const retried = await call('/soporte/incidencias', { method: 'POST', cookie: support.cookie, body });
    assert.equal(first.status, 201);
    assert.equal(retried.data.id_incidencia, first.data.id_incidencia);
    const forbidden = await call('/incidencias', { method: 'POST', cookie: users.PADRE.cookie, body: { ...body, descripcion: 'Intento ajeno de sobrescritura' } });
    assert.equal(forbidden.status, 409);
    assert.equal((await call(`/soporte/incidencias/${first.data.id_incidencia}`, { cookie: support.cookie })).data.descripcion, body.descripcion);
  });
  await t.test('resolved incidents remain visible through canonical filters', async () => {
    await db.query("UPDATE incidencias SET estado = 'RESUELTA' WHERE id_incidencia = $1", [ticket.id_incidencia]);
    const response = await call(`/soporte/incidencias?estado=RESUELTA&search=${ticket.ticket}`, { cookie: support.cookie });
    assert.equal(response.data.total, 1);
    assert.equal(response.data.items[0].estado, 'RESUELTA');
  });
  await t.test('records replies and private notes, resolves a ticket, and hides internal notes from the requester', async () => {
    // The same technical workflow also receives an incident submitted by a family.
    const submitted = await call('/incidencias', { method: 'POST', cookie: users.PADRE.cookie, body: { tipo: 'Funcional', descripcion: 'No carga la pantalla de inicio.' } });
    assert.equal(submitted.status, 201);
    const id = submitted.data.id_incidencia;
    for (const interna of [false, true]) {
      const response = await call(`/soporte/incidencias/${id}/notas`, { method: 'POST', cookie: support.cookie, body: { contenido: interna ? 'Nota privada del diagnóstico técnico' : 'Se corrigió la pantalla. Prueba nuevamente.', interna } });
      assert.equal(response.status, 201);
    }
    assert.equal((await call(`/soporte/incidencias/${id}/notas`, { cookie: support.cookie })).data.items.length, 2);
    const publicNotes = (await call(`/incidencias/${id}/notas`, { cookie: users.PADRE.cookie })).data.items;
    assert.equal(publicNotes.length, 1);
    assert.equal(publicNotes[0].interna, false);
    assert.equal('id_autor' in publicNotes[0], false);
    for (const estado of ['RECIBIDA', 'EN ATENCIÓN', 'RESUELTA']) {
      const response = await call(`/soporte/incidencias/${id}/estado`, { method: 'PATCH', cookie: support.cookie, body: { estado } });
      assert.equal(response.status, 200);
      assert.equal(response.data.estado, estado);
    }
    assert.equal((await call(`/incidencias/${id}`, { cookie: users.PADRE.cookie })).data.estado, 'RESUELTA');
    assert.equal((await call(`/soporte/incidencias/${id}/estado`, { method: 'PATCH', cookie: support.cookie, body: { estado: 'INVALIDO' } })).status, 400);
    for (const estado of ['LEIDA', 'LEÍDA', 'EN PROCESO', 'SOLUCIONADA', 'ATENDIDA']) {
      assert.equal((await call(`/soporte/incidencias/${id}/estado`, { method: 'PATCH', cookie: support.cookie, body: { estado } })).status, 400);
    }
    assert.equal((await call(`/soporte/incidencias/${id}/notas`, { method: 'POST', cookie: support.cookie, body: { contenido: ' ', interna: false } })).status, 400);
  });
  await t.test('inactive support accounts and revoked sessions are denied', async () => {
    await db.query('UPDATE usuarios SET activo = false WHERE id_usuario = $1', [support.id_usuario]);
    assert.equal((await login(support.codigo_usuario)).status, 403);
    assert.equal((await call('/soporte/incidencias', { cookie: support.cookie })).status, 401);
    await db.query('UPDATE usuarios SET activo = true WHERE id_usuario = $1', [support.id_usuario]);
    assert.equal((await call('/auth/logout', { method: 'POST', cookie: support.cookie })).status, 200);
    assert.equal((await call('/soporte/incidencias', { cookie: support.cookie })).status, 401);
  });
});

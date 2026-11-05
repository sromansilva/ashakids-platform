import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryApp, createResetToken } from './support-test-helpers.mjs';

test('Support account authentication and least privilege', { timeout: 90000 }, async (t) => {
  const { db, users, password, call, login } = await memoryApp(t);
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
  await t.test('support cannot access administration, clinical or legacy modules, including mixed-role accounts', async () => {
    for (const path of ['/admin/cuentas', '/admin/me', '/usuarios', '/pacientes', '/clinica/sesiones', '/tratamientos', '/comunicacion/notificaciones', '/incidencias/recibidas/admin']) {
      assert.equal((await call(path, { cookie: support.cookie })).status, 403, path);
    }
    for (const [role, path] of [['ADMIN', '/admin/me'], ['PADRE', '/padres/me'], ['TERAPEUTA', '/terapeutas/me']]) {
      assert.equal((await call(path, { cookie: users[role].cookie })).status, 200, role);
    }
    await db.query("INSERT INTO usuario_roles(id_usuario, id_rol, activo) VALUES ($1, 1, true)", [support.id_usuario]);
    assert.equal((await call('/admin/cuentas', { cookie: support.cookie })).status, 403);
    assert.equal((await login(support.codigo_usuario)).data.user.rol, 'SOPORTE_TECNICO');
    await db.query('DELETE FROM usuario_roles WHERE id_usuario = $1 AND id_rol = 1', [support.id_usuario]);
  });
  await t.test('inactive support accounts and revoked sessions are denied', async () => {
    await db.query('UPDATE usuarios SET activo = false WHERE id_usuario = $1', [support.id_usuario]);
    assert.equal((await login(support.codigo_usuario)).status, 403);
    assert.equal((await call('/auth/me', { cookie: support.cookie })).status, 401);
    await db.query('UPDATE usuarios SET activo = true WHERE id_usuario = $1', [support.id_usuario]);
    assert.equal((await call('/auth/logout', { method: 'POST', cookie: support.cookie })).status, 200);
    assert.equal((await call('/auth/me', { cookie: support.cookie })).status, 401);
  });
  await t.test('support has no shared development password, and a database outage never invents a login', async () => {
    const { settings } = await import('../../backend/dist/core/config.js');
    const { pool } = await import('../../backend/dist/core/database.js');
    settings.ENVIRONMENT = 'development';
    try {
      assert.equal((await login(support.codigo_usuario, '12345')).status, 401);
      const stub = t.mock.method(pool, 'query', async () => { throw new Error('Simulated database outage'); });
      try {
        const response = await login(support.codigo_usuario);
        assert.equal(response.status, 500);
        assert.equal(response.cookie, undefined);
        assert.equal(response.data.user, undefined);
      } finally { stub.mock.restore(); }
    } finally { settings.ENVIRONMENT = 'production'; }
  });
});

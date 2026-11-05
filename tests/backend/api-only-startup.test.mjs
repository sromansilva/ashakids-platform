import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

process.env.ENVIRONMENT = 'development';
process.env.DEVELOPMENT_READ_ONLY = 'false';
process.env.DEVELOPMENT_SKIP_BOOTSTRAP = 'true';
process.env.GMAIL_ENABLED = 'false';
process.env.PORT = '0';
process.env.HOST = '127.0.0.1';
const { pool } = await import('../../backend/dist/core/database.js');
const { app } = await import('../../backend/dist/app.js');
const { appointmentReminderScheduler } = await import('../../backend/dist/modules/notificaciones/recordatorios.scheduler.js');

test('API-only startup serves HTTP without running migrations, demo seeds or reminder jobs', { timeout: 10000 }, async (t) => {
  const query = t.mock.method(pool, 'query', async (sql) => {
    assert.match(sql, /^SELECT 1;?$/);
    return { rows: [{ connected: 1 }] };
  });
  const connect = t.mock.method(pool, 'connect', async () => { throw new Error('Bootstrap must not acquire a migration connection'); });
  const reminders = t.mock.method(appointmentReminderScheduler, 'start');
  const listen = app.listen.bind(app);
  let server;
  let resolveStarted;
  const started = new Promise((resolve) => { resolveStarted = resolve; });
  t.mock.method(app, 'listen', (...args) => {
    server = listen(...args);
    resolveStarted();
    return server;
  });
  const previousHandlers = new Set(process.listeners('SIGTERM'));
  t.after(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    for (const handler of process.listeners('SIGTERM')) if (!previousHandlers.has(handler)) process.removeListener('SIGTERM', handler);
    await pool.end();
  });
  await import('../../backend/dist/index.js');
  await started;
  if (!server.listening) await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + '/health/ready')).status, 200);
  // A business-level rejection proves writes reach the route instead of the read-only gate.
  assert.equal((await fetch(base + '/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  assert.equal(connect.mock.calls.length, 0);
  assert.equal(reminders.mock.calls.length, 0);
  assert.equal(query.mock.calls.length, 2);
});

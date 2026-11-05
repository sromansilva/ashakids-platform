import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

process.env.ENVIRONMENT = 'test';
process.env.DEVELOPMENT_READ_ONLY = 'true';
const { pool } = await import('../../backend/dist/core/database.js');
const { createApp } = await import('../../backend/dist/app.js');

test('read-only development protects both the database connection and HTTP writes', async (t) => {
  assert.equal(pool.options.options, '-c default_transaction_read_only=on');
  const query = t.mock.method(pool, 'query', async (sql) => {
    assert.equal(sql, 'SELECT 1;');
    return { rows: [{ connected: 1 }] };
  });
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + '/health/ready')).status, 200);
  for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
    const response = await fetch(base + '/api/v1/admin/cuentas/soporte', { method, headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 503, method);
  }
  assert.equal(query.mock.calls.length, 1);
});

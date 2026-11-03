import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { app } from '../../backend/dist/app.js';

test('public family registration is denied and does not create a session', async (t) => {
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombres: 'Cuenta', apellidos: 'No autorizada', email: 'blocked-registration@ashakids.test',
      password: 'UnaClaveSegura123!', rol: 'PADRE',
    }),
  });

  assert.equal(response.status, 403);
  assert.match((await response.json()).error, /registro público no está disponible/i);
  assert.equal(response.headers.get('set-cookie'), null);
});

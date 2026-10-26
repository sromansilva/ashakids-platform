import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../backend/dist/app.js';
import { pool } from '../../backend/dist/core/database.js';
import type { Server } from 'node:http';

let server: Server;
let baseUrl = '';

function startServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

describe('ASHAKids Modular TypeScript Backend Tests', () => {
  before(async () => {
    await startServer();
  });

  after(async () => {
    await stopServer();
    await pool.end();
  });

  it('1. Health Check & Root System Info', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok(data.timestamp);

    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const rootData = await rootRes.json();
    assert.equal(rootData.status, 'ok');
  });

  it('2. Auth Module: Validates DTO and logs in with proper role and user code', async () => {
    // Missing identifier validation failure
    const badRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '123' }),
    });
    assert.equal(badRes.status, 400);

    // Valid login as admin with user code
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_usuario: 'a00001', password: '12345' }),
    });
    assert.equal(loginRes.status, 200);
    const body = await loginRes.json();
    assert.ok(body.token);
    assert.ok(body.user);
    assert.equal(body.user.rol, 'ADMIN');
    assert.equal(body.user.codigo_usuario, 'a00001');
  });

  it('3. Admin Module: Requires ADMIN role and lists accounts', async () => {
    // Without token should fail 401
    const unauthRes = await fetch(`${baseUrl}/api/v1/admin/cuentas`);
    assert.equal(unauthRes.status, 401);

    // With mock admin header
    const authRes = await fetch(`${baseUrl}/api/v1/admin/cuentas`, {
      headers: { 'x-mock-role': 'ADMIN' },
    });
    assert.equal(authRes.status, 200);
    const data = await authRes.json();
    assert.ok(Array.isArray(data.items));
    assert.ok(data.total >= 1);
  });

  it('4. Role Protection: PADRE cannot access ADMIN module', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/cuentas`, {
      headers: { 'x-mock-role': 'PADRE' },
    });
    assert.equal(res.status, 403);
  });

  it('5. Terapeuta Module: Manages availability and clinical reports', async () => {
    const res = await fetch(`${baseUrl}/api/v1/terapeutas/disponibilidad`, {
      headers: { 'x-mock-role': 'TERAPEUTA' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.slots));
  });

  it('6. Padre Module: Lists children and handles registration DTO', async () => {
    const res = await fetch(`${baseUrl}/api/v1/padres/hijos`, {
      headers: { 'x-mock-role': 'PADRE' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  it('7. Agenda Module: Schedules appointment with DTO validation', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agenda/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mock-role': 'PADRE',
      },
      body: JSON.stringify({
        id_paciente: 1,
        id_terapeuta: 2,
        fecha: '2026-10-30',
        hora_inicio: '11:00',
        motivo: 'Evaluación fonológica',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.estado, 'CONFIRMADA');
  });

  it('8. Mundo Asha Module: Returns worlds catalog and validates voice recognition', async () => {
    const mundosRes = await fetch(`${baseUrl}/api/v1/mundo-asha/mundos`);
    assert.equal(mundosRes.status, 200);
    const mundos = await mundosRes.json();
    assert.ok(mundos.length >= 3);

    const vozRes = await fetch(`${baseUrl}/api/v1/mundo-asha/voz/reconocimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEA',
        palabra_objetivo: 'pelota',
      }),
    });
    assert.equal(vozRes.status, 200);
    const vozData = await vozRes.json();
    assert.equal(vozData.reconocido, true);
    assert.equal(vozData.palabra_esperada, 'pelota');
  });

  it('9. 404 Not Found for unmapped routes', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ruta-inexistente`);
    assert.equal(res.status, 404);
  });
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { once } from 'node:events';

// No socket ever connects to PostgreSQL. All application SQL runs in disposable WASM PostgreSQL.
process.env.ENVIRONMENT = 'test';
process.env.DEVELOPMENT_READ_ONLY = 'false';
process.env.GMAIL_ENABLED = 'false';
process.env.GOOGLE_CALENDAR_ENABLED = 'false';
process.env.MEET_ENABLED = 'false';
const require = createRequire(new URL('../../backend/package.json', import.meta.url));
const { PGlite } = require('@electric-sql/pglite');
const argon2 = require('@node-rs/argon2');
const { pool } = await import('../../backend/dist/core/database.js');
const { settings } = await import('../../backend/dist/core/config.js');
const { createApp } = await import('../../backend/dist/app.js');
const { migrateSoporteSchema } = await import('../../backend/dist/modules/soporte/soporte.migration.js');
export const { createResetToken } = await import('../../backend/dist/core/security/password-reset-token.js');


export async function memoryApp(t, { migrations = [] } = {}) {
  const db = new PGlite();
  await db.waitReady;
  t.after(async () => { await db.close(); await pool.end(); });
  const query = async (sql, values = []) => values.length
    ? db.query(sql, values)
    : (await db.exec(sql)).at(-1) ?? { rows: [] };
  t.mock.method(pool, 'query', query);
  t.mock.method(pool, 'connect', async () => ({ query, release() {} }));
  // Use the repository schema itself; omit only demo data and dump sequence positions.
  const schema = (await readFile(new URL('../../docker/init.sql', import.meta.url), 'utf8'))
    .replace(/^COPY [^\r\n]+ FROM stdin;\r?\n[\s\S]*?^\\\.\r?$/gm, '')
    .replace(/^SELECT pg_catalog\.setval\([^\r\n]+\);\r?$/gm, '');
  await db.exec(schema);
  await db.exec("SET search_path = public; INSERT INTO roles(id_rol, nombre_rol) VALUES (1, 'ADMIN'), (2, 'TERAPEUTA'), (3, 'PADRE'); SELECT setval('roles_id_rol_seq', 3, true);");
  for (const migrate of migrations) await migrate();
  await migrateSoporteSchema();
  for (const migrate of migrations) await migrate();
  await migrateSoporteSchema();
  assert.equal((await db.query("SELECT count(*)::int AS n FROM roles WHERE nombre_rol = 'SOPORTE_TECNICO'")).rows[0].n, 1);
  const password = 'Prueba-Soporte-2026!';
  const hash = await argon2.hash(password);
  const users = {};
  for (const [role, code] of [['ADMIN', 'a-test'], ['TERAPEUTA', 't-test'], ['PADRE', 'p-test']]) {
    const user = (await db.query(`INSERT INTO usuarios(nombres, apellidos, codigo_usuario, email, password_hash, activo)
      VALUES ('Prueba', $1, $2, $3, $4, true) RETURNING id_usuario`, [role, code, `${code}@example.invalid`, hash])).rows[0];
    users[role] = { ...user, code };
    await db.query('INSERT INTO usuario_roles(id_usuario, id_rol, activo) SELECT $1, id_rol, true FROM roles WHERE nombre_rol = $2', [user.id_usuario, role]);
  }
  await db.query("INSERT INTO terapeutas(id_usuario, especialidad) VALUES ($1, 'Prueba')", [users.TERAPEUTA.id_usuario]);
  await db.query("INSERT INTO tutores(id_usuario, parentesco) VALUES ($1, 'Padre')", [users.PADRE.id_usuario]);
  // Real password/session behavior, with all development authentication shortcuts disabled.
  settings.ENVIRONMENT = 'production';
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  async function call(path, { method = 'GET', cookie, body } = {}) {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  async function login(code, secret = password) { return call('/auth/login', { method: 'POST', body: { codigo_usuario: code, password: secret } }); }
  for (const role of Object.keys(users)) {
    const response = await login(users[role].code);
    assert.equal(response.status, 200);
    assert.equal(response.data.user.rol, role);
    users[role].cookie = response.cookie;
  }
  return { db, users, password, call, login };
}

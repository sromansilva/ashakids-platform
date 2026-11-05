import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import type { Server } from 'node:http';

const { app } = await import('../../backend/dist/app.js');
const { pool } = await import('../../backend/dist/core/database.js');
const { settings } = await import('../../backend/dist/core/config.js');
const { migrateClinicaSchema } = await import('../../backend/dist/modules/clinica/clinica.migration.js');
const { migrateNotificacionesSchema } = await import('../../backend/dist/modules/notificaciones/notificaciones.migration.js');

const localDatabaseHost = ['127.0.0.1', 'localhost', '::1'].includes(settings.DB_HOST.toLowerCase());
const isolatedDatabase = /(?:_test|_e2e)$/i.test(settings.DB_NAME);
const canRunDatabaseTests = process.env.ENVIRONMENT === 'test' && localDatabaseHost && isolatedDatabase;
const MEET = 'https://meet.google.com/abc-defg-hij';

let server: Server;
let baseUrl = '';
const fx = {
  users: [] as number[], therapistUser: 0, therapistId: 0, parentUser: 0, tutorId: 0, patients: [] as number[],
  reservations: {} as Record<string, number>, sessions: {} as Record<string, number>,
};

function auth(role: 'TERAPEUTA' | 'PADRE', userId: number): Record<string, string> {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: userId, email: `gate-${userId}@ashakids.test`, nombres: 'Gate', apellidos: 'Test', rol: role, roles: [role],
  })).toString('base64');
  return { authorization: `Bearer ${payload}`, 'content-type': 'application/json' };
}

async function user(prefix: string, roleId: number): Promise<number> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const r = await pool.query(
    `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
     VALUES ($1, 'Test', $2, $3, 'test-only', true) RETURNING id_usuario;`,
    [prefix, `g${suffix.slice(-5)}`, `${prefix.toLowerCase()}-${suffix}@ashakids.test`],
  );
  const id = Number(r.rows[0].id_usuario);
  await pool.query('INSERT INTO usuario_roles (id_usuario, id_rol, activo) VALUES ($1, $2, true);', [id, roleId]);
  fx.users.push(id);
  return id;
}

async function reservation(key: string, startOffset: string, endOffset: string): Promise<void> {
  // Una cita introductoria pendiente por paciente: cada escenario usa su propio paciente.
  const patientId = Number((await pool.query(
    "INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo) VALUES ($1, 'Gate', $2, '2020-01-01', 'M', true) RETURNING id_paciente;",
    [fx.tutorId, key])).rows[0].id_paciente);
  fx.patients.push(patientId);
  const r = await pool.query(
    `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, meet_url)
     VALUES ($1, $2, NOW() + $3::interval, NOW() + $4::interval, 'VIRTUAL', 'INTRODUCTORIA', 'CONFIRMADA', $5) RETURNING id_reserva;`,
    [patientId, fx.therapistId, startOffset, endOffset, MEET],
  );
  fx.reservations[key] = Number(r.rows[0].id_reserva);
  const s = await pool.query("INSERT INTO sesiones (id_reserva, estado_sesion) VALUES ($1, 'PROGRAMADA') RETURNING id_sesion;", [fx.reservations[key]]);
  fx.sessions[key] = Number(s.rows[0].id_sesion);
}

const start = (key: string, body?: unknown) => fetch(`${baseUrl}/api/v1/sesiones/${fx.sessions[key]}/iniciar`, {
  method: 'POST', headers: auth('TERAPEUTA', fx.therapistUser), body: body === undefined ? undefined : JSON.stringify(body),
});
const cita = async (key: string, role: 'TERAPEUTA' | 'PADRE') => {
  const res = await fetch(`${baseUrl}/api/v1/citas/${fx.reservations[key]}`, { headers: auth(role, role === 'PADRE' ? fx.parentUser : fx.therapistUser) });
  assert.equal(res.status, 200);
  return res.json() as Promise<Record<string, unknown>>;
};

describe('Puerta de Meet, horario estricto y modo prueba', {
  skip: !canRunDatabaseTests && 'Requiere ENVIRONMENT=test, PostgreSQL local y una base cuyo nombre termine en _test o _e2e.',
}, () => {
  before(async () => {
    await migrateClinicaSchema();
    await migrateNotificacionesSchema();
    server = await new Promise<Server>((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
    const addr = server.address();
    if (addr && typeof addr === 'object') baseUrl = `http://127.0.0.1:${addr.port}`;
    fx.therapistUser = await user('GateTerapeuta', 2);
    fx.parentUser = await user('GatePadre', 3);
    fx.therapistId = Number((await pool.query("INSERT INTO terapeutas (id_usuario, especialidad) VALUES ($1, 'Prueba') RETURNING id_terapeuta;", [fx.therapistUser])).rows[0].id_terapeuta);
    fx.tutorId = Number((await pool.query("INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, 'PADRE') RETURNING id_tutor;", [fx.parentUser])).rows[0].id_tutor);
    await reservation('ahora', '-10 minutes', '30 minutes');
    await reservation('futura', '3 hours', '3 hours 40 minutes');
    await reservation('pasada', '-3 hours', '-2 hours 20 minutes');
    await reservation('prueba', '4 hours', '4 hours 40 minutes');
  });

  after(async () => {
    const reservations = Object.values(fx.reservations);
    await pool.query('DELETE FROM notificaciones WHERE id_reserva = ANY($1::int[]);', [reservations]);
    await pool.query('DELETE FROM sesiones WHERE id_reserva = ANY($1::int[]);', [reservations]);
    await pool.query('DELETE FROM reservas WHERE id_reserva = ANY($1::int[]);', [reservations]);
    await pool.query('DELETE FROM pacientes WHERE id_paciente = ANY($1::int[]);', [fx.patients]);
    await pool.query('DELETE FROM tutores WHERE id_tutor = $1;', [fx.tutorId]);
    await pool.query('DELETE FROM terapeutas WHERE id_terapeuta = $1;', [fx.therapistId]);
    await pool.query('DELETE FROM usuario_roles WHERE id_usuario = ANY($1::int[]);', [fx.users]);
    await pool.query('DELETE FROM usuarios WHERE id_usuario = ANY($1::int[]);', [fx.users]);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  });

  it('la familia no recibe el enlace antes de iniciar, y el terapeuta si', async () => {
    settings.SESSION_TEST_MODE_ENABLED = false;
    const family = await cita('ahora', 'PADRE');
    assert.equal(family.meet_url, null);
    assert.equal(family.meet_origen, null);
    assert.equal(family.reunion_disponible, false);
    assert.equal(family.estado_sesion, 'PROGRAMADA');
    assert.equal(family.modo_prueba_disponible, false);
    const therapist = await cita('ahora', 'TERAPEUTA');
    assert.equal(therapist.meet_url, MEET);
    assert.equal(therapist.reunion_disponible, true);
  });

  it('la familia recibe el enlace y una notificacion cuando la sesion esta en curso', async () => {
    const res = await start('ahora');
    assert.equal(res.status, 200);
    const family = await cita('ahora', 'PADRE');
    assert.equal(family.meet_url, MEET);
    assert.equal(family.reunion_disponible, true);
    assert.equal(family.estado_sesion, 'EN_CURSO');
    const inbox = await fetch(`${baseUrl}/api/v1/notificaciones`, { headers: auth('PADRE', fx.parentUser) });
    const body = await inbox.json() as { items: Array<{ titulo: string; id_reserva: number; meet_url: string | null }> };
    const item = body.items.find((n) => n.id_reserva === fx.reservations.ahora);
    assert.ok(item, 'debe existir la notificacion de inicio');
    assert.equal(item.titulo, 'Tu terapeuta inició la reunión');
    assert.equal(item.meet_url, MEET);
  });

  it('iniciar antes de la hora o despues de terminar responde 409 con mensajes distintos', async () => {
    const early = await start('futura');
    assert.equal(early.status, 409);
    assert.match(JSON.stringify(await early.json()), /Aún no es la hora/);
    const late = await start('pasada');
    assert.equal(late.status, 409);
    assert.match(JSON.stringify(await late.json()), /ya terminó/);
  });

  it('modo_prueba responde 403 si la variable esta apagada', async () => {
    settings.SESSION_TEST_MODE_ENABLED = false;
    const res = await start('prueba', { modo_prueba: true });
    assert.equal(res.status, 403);
    const rows = await pool.query('SELECT estado_sesion FROM sesiones WHERE id_sesion = $1;', [fx.sessions.prueba]);
    assert.equal(rows.rows[0].estado_sesion, 'PROGRAMADA');
  });

  it('modo_prueba omite solo el horario cuando la variable esta activa', async () => {
    settings.SESSION_TEST_MODE_ENABLED = true;
    try {
      assert.equal((await cita('prueba', 'TERAPEUTA')).modo_prueba_disponible, true);
      assert.equal((await cita('prueba', 'PADRE')).modo_prueba_disponible, false);
      // Sin modo_prueba el horario sigue siendo estricto.
      assert.equal((await start('prueba')).status, 409);
      // La cita cancelada sigue bloqueando incluso en modo prueba.
      await pool.query("UPDATE reservas SET estado_reserva = 'CANCELADA' WHERE id_reserva = $1;", [fx.reservations.prueba]);
      assert.equal((await start('prueba', { modo_prueba: true })).status, 409);
      await pool.query("UPDATE reservas SET estado_reserva = 'CONFIRMADA' WHERE id_reserva = $1;", [fx.reservations.prueba]);
      const ok = await start('prueba', { modo_prueba: true });
      assert.equal(ok.status, 200);
      assert.equal(((await ok.json()) as { estado_sesion: string }).estado_sesion, 'EN_CURSO');
    } finally {
      settings.SESSION_TEST_MODE_ENABLED = false;
    }
  });

  it('la configuracion rechaza SESSION_TEST_MODE_ENABLED en produccion', () => {
    const configUrl = new URL('../../backend/dist/core/config.js', import.meta.url).href;
    const run = (flag: string) => spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(configUrl)});`], {
      env: {
        PATH: process.env.PATH ?? '', ASHAKIDS_ENV_FILE: path.join(process.cwd(), 'does-not-exist.env'), ENVIRONMENT: 'production',
        DB_HOST: 'db.example.com', DB_NAME: 'ashakids', DB_USER: 'app_user', DB_PASSWORD: 'x'.repeat(24),
        CORS_ORIGINS: 'https://ashakids.life', SESSION_TEST_MODE_ENABLED: flag,
      },
      encoding: 'utf8',
    });
    const blocked = run('true');
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /SESSION_TEST_MODE_ENABLED/);
    const allowed = run('false');
    assert.equal(allowed.status, 0, allowed.stderr);
  });
});

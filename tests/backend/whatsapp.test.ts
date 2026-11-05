import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import type { Server } from 'node:http';

// `settings` se lee al importar: las variables se fijan ANTES de los imports dinámicos.
process.env.WHATSAPP_ENABLED = 'true';
process.env.WHATSAPP_ACCESS_TOKEN = 'token-de-prueba';
process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789';
process.env.WHATSAPP_APP_SECRET = 'secreto-de-prueba';
process.env.WHATSAPP_VERIFY_TOKEN = 'verify-de-prueba';

const { settings } = await import('../../backend/dist/core/config.js');
const bot = await import('../../backend/dist/modules/whatsapp/whatsapp.bot.js');
const { WhatsAppService } = await import('../../backend/dist/infrastructure/whatsapp/whatsapp.service.js');
const { app } = await import('../../backend/dist/app.js');
const { pool } = await import('../../backend/dist/core/database.js');
const { verifyMetaSignature } = await import('../../backend/dist/modules/whatsapp/whatsapp.routes.js');

// El pool se cierra una sola vez, al terminar todas las suites del archivo.
after(async () => { await pool.end(); });

const NOW = new Date('2026-11-05T12:00:00.000Z');
type Step = ReturnType<typeof bot.processMessage>;

function run(state: string, data: Record<string, string>, text: string | null, extra: { last?: Date | null } = {}): Step {
  return bot.processMessage({ state, data, text, now: NOW, lastMessageAt: extra.last ?? null });
}

describe('Máquina de estados del chatbot (pura, sin BD)', () => {
  it('camino feliz hasta crear la solicitud', () => {
    let s = run('INICIO', {}, 'hola');
    assert.equal(s.state, 'CONSENTIMIENTO');
    assert.match(s.reply, /privacidad/i);
    s = run(s.state, s.data, 'sí');
    assert.equal(s.state, 'NOMBRES');
    assert.ok(s.data.consentimiento_en);
    s = run(s.state, s.data, '  Ana   María ');
    assert.equal(s.state, 'APELLIDOS');
    assert.equal(s.data.nombres, 'Ana María');
    s = run(s.state, s.data, 'Pérez Gómez');
    s = run(s.state, s.data, '12345678');
    assert.equal(s.state, 'CORREO');
    s = run(s.state, s.data, 'Ana.Perez@Gmail.COM');
    assert.equal(s.state, 'CONFIRMAR');
    assert.equal(s.data.email, 'ana.perez@gmail.com');
    assert.match(s.reply, /12345678/);
    assert.equal(s.crearSolicitud, false);
    s = run(s.state, s.data, 'SI');
    assert.equal(s.crearSolicitud, true);
    assert.equal(s.state, 'FINALIZADA');
    assert.deepEqual(s.data, {});
    assert.equal(s.solicitud?.dni, '12345678');
    assert.equal(s.solicitud?.email, 'ana.perez@gmail.com');
    assert.match(s.reply, /revisión/);
  });

  it('rechaza datos inválidos sin avanzar y con reintento amable', () => {
    assert.equal(run('NOMBRES', {}, 'x'.repeat(61)).state, 'NOMBRES');
    assert.equal(run('APELLIDOS', {}, 'x'.repeat(81)).state, 'APELLIDOS');
    for (const dni of ['1234567', '123456789', 'abcdefgh', '1234-5678']) {
      const s = run('DNI', {}, dni);
      assert.equal(s.state, 'DNI', dni);
      assert.match(s.reply, /8 números/);
    }
    for (const mail of ['sin-arroba', 'a@b', `${'a'.repeat(150)}@correo.com`]) {
      assert.equal(run('CORREO', {}, mail).state, 'CORREO', mail);
    }
    assert.equal(run('CONSENTIMIENTO', {}, 'quizás').state, 'CONSENTIMIENTO');
    assert.equal(run('CONFIRMAR', { nombres: 'A', apellidos: 'B', dni: '12345678', email: 'a@b.co' }, 'tal vez').crearSolicitud, false);
  });

  it('CANCELAR borra el borrador en cualquier paso', () => {
    for (const state of ['CONSENTIMIENTO', 'NOMBRES', 'APELLIDOS', 'DNI', 'CORREO', 'CONFIRMAR']) {
      const s = run(state, { nombres: 'Ana', dni: '12345678' }, ' cancelar. ');
      assert.equal(s.state, 'INICIO', state);
      assert.deepEqual(s.data, {});
      assert.match(s.reply, /cancel/i);
    }
  });

  it('CORREGIR vuelve a nombres y descarta los datos', () => {
    const s = run('CONFIRMAR', { consentimiento_en: NOW.toISOString(), nombres: 'Ana', apellidos: 'P', dni: '12345678', email: 'a@b.co' }, 'corregir');
    assert.equal(s.state, 'NOMBRES');
    assert.deepEqual(s.data, { consentimiento_en: NOW.toISOString() });
    assert.equal(s.crearSolicitud, false);
  });

  it('mensajes no textuales piden texto sin cambiar de estado ni datos', () => {
    const data = { consentimiento_en: NOW.toISOString(), nombres: 'Ana' };
    const s = run('APELLIDOS', data, null);
    assert.equal(s.state, 'APELLIDOS');
    assert.deepEqual(s.data, data);
    assert.match(s.reply, /texto/);
  });

  it('reinicia tras más de 24 h de inactividad', () => {
    const old = new Date(NOW.getTime() - 25 * 3600 * 1000);
    const s = run('DNI', { nombres: 'Ana', apellidos: 'P' }, '12345678', { last: old });
    assert.equal(s.state, 'CONSENTIMIENTO');
    assert.deepEqual(s.data, {});
    const recent = new Date(NOW.getTime() - 23 * 3600 * 1000);
    assert.equal(run('DNI', { nombres: 'Ana', apellidos: 'P' }, '12345678', { last: recent }).state, 'CORREO');
  });

  it('enmascara el correo', () => {
    assert.equal(bot.maskEmail('maria@gmail.com'), 'ma***@gmail.com');
    assert.equal(bot.maskEmail('ab@x.org'), 'a***@x.org');
    assert.equal(bot.maskEmail('MARIA@Gmail.com'), 'ma***@gmail.com');
  });
});

describe('Firma de Meta', () => {
  const body = Buffer.from('{"object":"whatsapp_business_account"}');
  const sign = (b: Buffer, secret = 'secreto-de-prueba') => `sha256=${createHmac('sha256', secret).update(b).digest('hex')}`;

  it('acepta la válida y rechaza ausente, mal formada, ajena o sin secreto', () => {
    assert.equal(verifyMetaSignature(body, sign(body), 'secreto-de-prueba'), true);
    assert.equal(verifyMetaSignature(body, undefined, 'secreto-de-prueba'), false);
    assert.equal(verifyMetaSignature(body, 'sha256=abc', 'secreto-de-prueba'), false);
    assert.equal(verifyMetaSignature(body, sign(body, 'otro'), 'secreto-de-prueba'), false);
    assert.equal(verifyMetaSignature(body, sign(body), ''), false);
  });
});

describe('Webhook HTTP', () => {
  let server: Server;
  let base = '';
  const url = (query = '') => `${base}${settings.API_V1_PREFIX}/whatsapp/webhook${query}`;
  const sign = (b: string) => `sha256=${createHmac('sha256', settings.WHATSAPP_APP_SECRET).update(b).digest('hex')}`;
  // Solo `statuses`: no toca la BD ni genera respuestas.
  const statusOnly = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ value: { statuses: [{ id: 'x', status: 'read' }] } }] }] });

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') base = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });
  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const post = (body: string, headers: Record<string, string> = {}) =>
    fetch(url(), { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body });

  it('POST con firma válida responde 200', async () => {
    assert.equal((await post(statusOnly, { 'X-Hub-Signature-256': sign(statusOnly) })).status, 200);
  });

  it('POST con firma inválida o ausente responde 401', async () => {
    assert.equal((await post(statusOnly, { 'X-Hub-Signature-256': sign('otro cuerpo') })).status, 401);
    assert.equal((await post(statusOnly)).status, 401);
  });

  it('POST sin secreto configurado falla cerrado', async () => {
    const secret = settings.WHATSAPP_APP_SECRET;
    settings.WHATSAPP_APP_SECRET = '';
    try {
      const header = `sha256=${createHmac('sha256', '').update(statusOnly).digest('hex')}`;
      assert.equal((await post(statusOnly, { 'X-Hub-Signature-256': header })).status, 401);
    } finally {
      settings.WHATSAPP_APP_SECRET = secret;
    }
  });

  it('GET de verificación: correcto devuelve el challenge en texto plano', async () => {
    const res = await fetch(url('?hub.mode=subscribe&hub.verify_token=verify-de-prueba&hub.challenge=abc123'));
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /text\/plain/);
    assert.equal(await res.text(), 'abc123');
  });

  it('GET de verificación: token incorrecto, modo incorrecto o ausente responde 403', async () => {
    assert.equal((await fetch(url('?hub.mode=subscribe&hub.verify_token=mal&hub.challenge=abc'))).status, 403);
    assert.equal((await fetch(url('?hub.mode=otro&hub.verify_token=verify-de-prueba&hub.challenge=abc'))).status, 403);
    assert.equal((await fetch(url())).status, 403);
  });

  it('con WHATSAPP_ENABLED=false responde 404 tanto en GET como en POST', async () => {
    settings.WHATSAPP_ENABLED = false;
    try {
      assert.equal((await fetch(url('?hub.mode=subscribe&hub.verify_token=verify-de-prueba&hub.challenge=abc'))).status, 404);
      assert.equal((await post(statusOnly, { 'X-Hub-Signature-256': sign(statusOnly) })).status, 404);
    } finally {
      settings.WHATSAPP_ENABLED = true;
    }
  });
});

describe('WhatsAppService (fetch simulado)', () => {
  const realFetch = globalThis.fetch;
  const restore = () => { globalThis.fetch = realFetch; };

  it('sendText llama a Graph con Bearer y devuelve ENVIADO', async () => {
    let called: { url: string; init: RequestInit } | null = null;
    globalThis.fetch = (async (u: string, init: RequestInit) => {
      called = { url: String(u), init };
      return new Response(JSON.stringify({ messages: [{ id: 'wamid.1' }] }), { status: 200 });
    }) as typeof fetch;
    try {
      const r = await WhatsAppService.sendText('51999999999', 'hola');
      assert.equal(r.status, 'ENVIADO');
      assert.equal(called!.url, `https://graph.facebook.com/${settings.WHATSAPP_API_VERSION}/123456789/messages`);
      assert.equal((called!.init.headers as Record<string, string>).Authorization, 'Bearer token-de-prueba');
      assert.equal(JSON.parse(String(called!.init.body)).text.body, 'hola');
    } finally { restore(); }
  });

  it('sendTemplate envía plantilla con parámetros', async () => {
    let body: any;
    globalThis.fetch = (async (_u: string, init: RequestInit) => {
      body = JSON.parse(String(init.body));
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    try {
      const r = await WhatsAppService.sendTemplate('51999999999', 'activacion', 'es', ['Ana', 'an***@x.com']);
      assert.equal(r.status, 'ENVIADO');
      assert.equal(body.template.name, 'activacion');
      assert.equal(body.template.components[0].parameters[1].text, 'an***@x.com');
    } finally { restore(); }
  });

  it('no lanza ante HTTP de error ni ante fallo de red', async () => {
    globalThis.fetch = (async () => new Response('{}', { status: 500 })) as typeof fetch;
    try {
      assert.equal((await WhatsAppService.sendText('51999999999', 'x')).status, 'ERROR');
      globalThis.fetch = (async () => { throw new Error('red caída'); }) as typeof fetch;
      assert.equal((await WhatsAppService.sendText('51999999999', 'x')).status, 'ERROR');
    } finally { restore(); }
  });

  it('devuelve NO_CONFIGURADO sin llamar a Meta cuando está deshabilitado', async () => {
    let calls = 0;
    globalThis.fetch = (async () => { calls++; return new Response('{}'); }) as typeof fetch;
    settings.WHATSAPP_ENABLED = false;
    try {
      assert.equal((await WhatsAppService.sendText('51999999999', 'x')).status, 'NO_CONFIGURADO');
      assert.equal(calls, 0);
    } finally { settings.WHATSAPP_ENABLED = true; restore(); }
  });
});

describe('Rutas de admin de solicitudes', () => {
  it('rechazan peticiones sin sesión: el DNI nunca sale sin autenticación', async () => {
    const server: Server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    try {
      const { port } = server.address() as { port: number };
      const base = `http://127.0.0.1:${port}/api/v1/admin/solicitudes-acceso`;
      assert.equal((await fetch(base)).status, 401);
      assert.equal((await fetch(`${base}/1/aprobar`, { method: 'POST' })).status, 401);
      assert.equal((await fetch(`${base}/1/rechazar`, { method: 'POST' })).status, 401);
    } finally {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

// Requieren PostgreSQL aislado: se omiten salvo que se declare explícitamente una base de prueba.
const isolatedDb =
  process.env.ASHAKIDS_RUN_DB_E2E === '1' &&
  settings.ENVIRONMENT === 'test' &&
  ['localhost', '127.0.0.1', '::1'].includes(settings.DB_HOST) &&
  /_(test|e2e)$/.test(settings.DB_NAME);
const skipDb = isolatedDb ? false : 'requiere ASHAKIDS_RUN_DB_E2E=1, ENVIRONMENT=test, DB local y DB_NAME terminado en _test o _e2e';

describe('Aprobación de solicitudes (BD aislada)', { skip: skipDb }, () => {
  const realFetch = globalThis.fetch;
  const createdEmails: string[] = [];
  const insertedIds: number[] = [];

  async function insertSolicitud(email: string) {
    const phone = `519${Math.floor(10000000 + Math.random() * 89999999)}`;
    const r = await pool.query(
      `INSERT INTO public.solicitudes_acceso_familia (telefono, nombres, apellidos, dni, email, consentimiento_en)
       VALUES ($1, 'Prueba', 'Whatsapp', '12345678', $2, now()) RETURNING id_solicitud;`,
      [phone, email],
    );
    insertedIds.push(r.rows[0].id_solicitud);
    createdEmails.push(email);
    return Number(r.rows[0].id_solicitud);
  }

  after(async () => {
    globalThis.fetch = realFetch;
    await pool.query(`DELETE FROM public.solicitudes_acceso_familia WHERE id_solicitud = ANY($1::int[]);`, [insertedIds]).catch(() => undefined);
    for (const email of createdEmails) {
      const u = await pool.query(`SELECT id_usuario FROM public.usuarios WHERE email = $1;`, [email]).catch(() => null);
      const id = u?.rows[0]?.id_usuario;
      if (!id) continue;
      await pool.query(`DELETE FROM public.tutores WHERE id_usuario = $1;`, [id]).catch(() => undefined);
      await pool.query(`DELETE FROM public.usuario_roles WHERE id_usuario = $1;`, [id]).catch(() => undefined);
      await pool.query(`DELETE FROM public.usuarios WHERE id_usuario = $1;`, [id]).catch(() => undefined);
    }
  });

  it('doble aprobación simultánea: una pasa y la otra recibe 409; sin correo enviado no hay aviso', async () => {
    const { migrateWhatsApp } = await import('../../backend/dist/modules/whatsapp/whatsapp.migration.js');
    const { aprobarSolicitud } = await import('../../backend/dist/modules/whatsapp/solicitudes.service.js');
    await migrateWhatsApp();
    let metaCalls = 0;
    globalThis.fetch = (async (u: string, init?: RequestInit) => {
      if (String(u).includes('graph.facebook.com')) { metaCalls++; return new Response('{}', { status: 200 }); }
      return realFetch(u, init);
    }) as typeof fetch;

    const id = await insertSolicitud(`whatsapp.${Date.now()}@ashakids.test`);
    const results = await Promise.allSettled([aprobarSolicitud(id, null as unknown as number), aprobarSolicitud(id, null as unknown as number)]);
    const ok = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    assert.equal(ok.length, 1);
    assert.equal(failed.length, 1);
    assert.equal((failed[0].reason as { status?: number }).status, 409);

    const approved = (ok[0] as PromiseFulfilledResult<any>).value;
    assert.equal(approved.solicitud.estado, 'APROBADA');
    if (approved.correo_bienvenida !== 'ENVIADO') {
      assert.equal(approved.aviso_whatsapp, 'OMITIDO');
      assert.equal(metaCalls, 0);
      assert.match(approved.message, /NO salió/);
    }
  });

  it('correo duplicado: responde 409 y la solicitud vuelve a PENDIENTE', async () => {
    const { aprobarSolicitud } = await import('../../backend/dist/modules/whatsapp/solicitudes.service.js');
    const email = `whatsapp.dup.${Date.now()}@ashakids.test`;
    await aprobarSolicitud(await insertSolicitud(email), null as unknown as number);
    const second = await insertSolicitud(email);
    await assert.rejects(aprobarSolicitud(second, null as unknown as number), (err: { status?: number; message: string }) => {
      assert.equal(err.status, 409);
      assert.match(err.message, /Ya existe una cuenta/);
      return true;
    });
    const row = await pool.query(`SELECT estado FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [second]);
    assert.equal(row.rows[0].estado, 'PENDIENTE');
  });

  it('conversación completa: crea una sola solicitud, deduplica y CANCELAR la borra', async () => {
    const { applyIncomingMessage } = await import('../../backend/dist/modules/whatsapp/whatsapp.conversation.js');
    const phone = `519${Math.floor(10000000 + Math.random() * 89999999)}`;
    const prefix = `wamid.${phone}`;
    let n = 0;
    const say = (text: string | null) => applyIncomingMessage({ wamid: `${prefix}.${n++}`, from: phone, text });
    const count = async () => Number((await pool.query(
      `SELECT count(*) FROM public.solicitudes_acceso_familia WHERE telefono = $1;`, [phone])).rows[0].count);

    try {
      assert.equal(await say('quiero entrar'), bot.MSG.bienvenida);
      assert.equal(await say('si'), bot.MSG.pedirNombres);
      await say('Ana María');
      await say('Pérez Soto');
      assert.equal(await say('123'), bot.MSG.dniInvalido);
      await say('12345678');
      assert.match(String(await say('Ana@Correo.com')), /ana@correo\.com/);
      assert.equal(await count(), 0, 'el bot no guarda solicitud antes de confirmar');
      assert.equal(await say('SI'), bot.MSG.finalizada);
      assert.equal(await count(), 1);

      const stored = await pool.query(`SELECT estado, dni, email FROM public.solicitudes_acceso_familia WHERE telefono = $1;`, [phone]);
      assert.deepEqual(stored.rows[0], { estado: 'PENDIENTE', dni: '12345678', email: 'ana@correo.com' });
      const draft = await pool.query(`SELECT datos FROM public.whatsapp_conversaciones WHERE telefono = $1;`, [phone]);
      assert.deepEqual(draft.rows[0].datos, {}, 'el borrador se limpia al enviar');
      const users = await pool.query(`SELECT 1 FROM public.usuarios WHERE email = 'ana@correo.com';`);
      assert.equal(users.rowCount, 0, 'el bot nunca crea cuentas');

      // Reintento de Meta del mismo wamid: se ignora.
      assert.equal(await applyIncomingMessage({ wamid: `${prefix}.0`, from: phone, text: 'hola' }), null);
      assert.equal(await say('hola'), bot.MSG.enRevision);
      assert.equal(await count(), 1);

      assert.equal(await say('cancelar'), bot.MSG.cancelado);
      assert.equal(await count(), 0, 'CANCELAR borra la solicitud pendiente');
    } finally {
      await pool.query(`DELETE FROM public.solicitudes_acceso_familia WHERE telefono = $1;`, [phone]);
      await pool.query(`DELETE FROM public.whatsapp_conversaciones WHERE telefono = $1;`, [phone]);
      await pool.query(`DELETE FROM public.whatsapp_mensajes_procesados WHERE wamid LIKE $1;`, [`${prefix}.%`]);
    }
  });

  it('la purga borra borradores abandonados y conserva los recientes', async () => {
    const { purgeStaleData } = await import('../../backend/dist/modules/whatsapp/whatsapp.conversation.js');
    const base = Math.floor(10000000 + Math.random() * 89999998);
    const [stale, fresh] = [`519${base}`, `519${base + 1}`];
    const draft = JSON.stringify({ dni: '12345678' });
    try {
      await pool.query(
        `INSERT INTO public.whatsapp_conversaciones (telefono, estado, datos, ultimo_mensaje_en) VALUES
          ($1, 'CORREO', $3::jsonb, now() - interval '25 hours'), ($2, 'CORREO', $3::jsonb, now());`,
        [stale, fresh, draft],
      );
      await purgeStaleData();
      const rows = await pool.query(`SELECT telefono, estado, datos FROM public.whatsapp_conversaciones WHERE telefono = ANY($1::text[]);`, [[stale, fresh]]);
      const byPhone = new Map(rows.rows.map((r) => [r.telefono, r]));
      assert.deepEqual(byPhone.get(stale).datos, {});
      assert.equal(byPhone.get(stale).estado, 'INICIO');
      assert.deepEqual(byPhone.get(fresh).datos, { dni: '12345678' });
    } finally {
      await pool.query(`DELETE FROM public.whatsapp_conversaciones WHERE telefono = ANY($1::text[]);`, [[stale, fresh]]);
    }
  });
});

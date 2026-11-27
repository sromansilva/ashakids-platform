import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

const { settings } = await import('../../backend/dist/core/config.js');
const bot = await import('../../backend/dist/modules/whatsapp/whatsapp.bot.js');
const { maskEmail } = await import('../../backend/dist/core/security/masking.js');
const { app } = await import('../../backend/dist/app.js');
const { pool } = await import('../../backend/dist/core/database.js');
const { WhatsAppRetentionScheduler } = await import('../../backend/dist/modules/whatsapp/whatsapp.scheduler.js');
const { errorHandler } = await import('../../backend/dist/core/middleware/error.middleware.js');

after(async () => {
  await pool.end();
});

describe('V192 - Privacidad y Enmascaramiento de Logs (sin BD)', () => {
  it('enmascara correos electrónicos sin exponer identificadores completos', () => {
    assert.equal(maskEmail('maria@gmail.com'), 'ma***@gmail.com');
    assert.equal(maskEmail('ab@x.org'), 'a***@x.org');
    assert.equal(maskEmail('a@x.org'), 'a***@x.org');
    assert.equal(maskEmail('JUAN.PEREZ@EXAMPLE.COM'), 'ju***@example.com');
    assert.equal(maskEmail(''), '***');
    assert.equal(maskEmail('sin-arroba'), '***');
  });

  it('el aviso de privacidad del bot incluye el plazo de retención real de config', () => {
    assert.match(bot.MSG.bienvenida, /si tu solicitud se rechaza, borramos tus datos a los \d+ días/);
    assert.match(bot.MSG.bienvenida, new RegExp(`${settings.WHATSAPP_RETENTION_DAYS} días`));
  });

  it('los mensajes de CANCELAR son transparentes según el estado', () => {
    assert.match(bot.MSG.noCancelableEnRevision, /ya está en revisión.*no puede cancelarse/i);
    assert.doesNotMatch(bot.MSG.noCancelableEnRevision, /borr/i);
    assert.match(bot.MSG.noCancelableAprobada, /ya fue aprobada.*cuenta.*activa/i);
    assert.match(bot.MSG.noCancelableAprobada, /baja/i);
    assert.doesNotMatch(bot.MSG.noCancelableAprobada, /borré/i);
  });

  it('el scheduler de retención gestiona arranque, parada y llamadas en vuelo sin solapamiento', async () => {
    const scheduler = new WhatsAppRetentionScheduler();
    assert.equal(scheduler.runOnce(), scheduler.runOnce());
    scheduler.start();
    await scheduler.stop();
  });

  it('los errores 500 ocultan el mensaje técnico salvo en development', () => {
    const originalEnv = settings.ENVIRONMENT;
    try {
      const err = new Error('database connection secret string failure');
      let status = 0;
      let body: any = null;
      const res: any = {
        status(code: number) {
          status = code;
          return this;
        },
        json(payload: any) {
          body = payload;
          return this;
        },
      };

      // En entorno de prueba o producción: mensaje debe ser undefined
      settings.ENVIRONMENT = 'production';
      errorHandler(err, {} as any, res, () => {});
      assert.equal(status, 500);
      assert.equal(body.error, 'Error interno del servidor.');
      assert.equal(body.mensaje, undefined);

      // En development: mensaje debe mostrarse para facilitar depuración local
      settings.ENVIRONMENT = 'development';
      errorHandler(err, {} as any, res, () => {});
      assert.equal(status, 500);
      assert.equal(body.mensaje, 'database connection secret string failure');
    } finally {
      settings.ENVIRONMENT = originalEnv;
    }
  });
});

describe('V192 - Protección CSRF y Health Check en HTTP (sin BD)', () => {
  let server: Server;
  let baseUrl = '';

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('POST en /api/v1 con Origin no permitido es rechazado con 403', async () => {
    const res = await fetch(`${baseUrl}${settings.API_V1_PREFIX}/auth/logout`, {
      method: 'POST',
      headers: {
        Origin: 'https://malicious-site.example',
        'Content-Type': 'application/json',
      },
    });
    assert.equal(res.status, 403);
    const json = (await res.json()) as { error?: string; detail?: string };
    assert.equal(json.detail, 'Origen no permitido.');
    assert.equal(json.error, 'Origen no permitido.');
  });

  it('POST en /api/v1 con Referer no permitido es rechazado con 403', async () => {
    const res = await fetch(`${baseUrl}${settings.API_V1_PREFIX}/auth/logout`, {
      method: 'POST',
      headers: {
        Referer: 'https://malicious-site.example/attack-page',
        'Content-Type': 'application/json',
      },
    });
    assert.equal(res.status, 403);
  });

  it('POST en /api/v1 con Origin permitido en CORS_ORIGINS pasa el filtro CSRF', async () => {
    const allowedOrigin = settings.CORS_ORIGINS[0] || 'http://localhost:5173';
    const res = await fetch(`${baseUrl}${settings.API_V1_PREFIX}/auth/logout`, {
      method: 'POST',
      headers: {
        Origin: allowedOrigin,
        'Content-Type': 'application/json',
      },
    });
    // Debe superar el filtro CSRF (no devolver 403). Puede responder 200 o el resultado de logout
    assert.notEqual(res.status, 403);
  });

  it('peticiones modificadoras sin Origin ni Referer se permiten', async () => {
    const res = await fetch(`${baseUrl}${settings.API_V1_PREFIX}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    assert.notEqual(res.status, 403);
  });

  it('el webhook de WhatsApp queda excluido de la verificación CSRF', async () => {
    const res = await fetch(`${baseUrl}${settings.API_V1_PREFIX}/whatsapp/webhook`, {
      method: 'POST',
      headers: {
        Origin: 'https://graph.facebook.com',
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    // No debe ser 403 de CSRF (devolverá 401 por firma HMAC ausente o 404 si WHATSAPP_ENABLED=false)
    assert.notEqual(res.status, 403);
  });

  it('las peticiones GET no se ven afectadas por el filtro CSRF', async () => {
    const res = await fetch(`${baseUrl}${settings.API_V1_PREFIX}/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://some-other-site.example',
      },
    });
    assert.equal(res.status, 200);
  });
});

// Suite con PostgreSQL aislado
const isolatedDb =
  process.env.ASHAKIDS_RUN_DB_E2E === '1' &&
  settings.ENVIRONMENT === 'test' &&
  ['localhost', '127.0.0.1', '::1'].includes(settings.DB_HOST) &&
  /_(test|e2e)$/.test(settings.DB_NAME);
const skipDb = isolatedDb ? false : 'requiere ASHAKIDS_RUN_DB_E2E=1, ENVIRONMENT=test, DB local y DB_NAME terminado en _test o _e2e';

describe('V192 - Purga y Manejo de CANCELAR (BD aislada)', { skip: skipDb }, () => {
  let applyIncomingMessage: (msg: any, now?: Date) => Promise<string | null>;
  let purgeStaleData: (retentionDays?: number) => Promise<void>;
  let migrateWhatsApp: () => Promise<void>;

  before(async () => {
    const conv = await import('../../backend/dist/modules/whatsapp/whatsapp.conversation.js');
    applyIncomingMessage = conv.applyIncomingMessage;
    purgeStaleData = conv.purgeStaleData;
    const mig = await import('../../backend/dist/modules/whatsapp/whatsapp.migration.js');
    migrateWhatsApp = mig.migrateWhatsApp;
    await migrateWhatsApp();
  });

  it('CANCELAR borra la solicitud si estaba en estado RECHAZADA', async () => {
    const phone = `519${Math.floor(10000000 + Math.random() * 89999999)}`;
    const r = await pool.query(
      `INSERT INTO public.solicitudes_acceso_familia
        (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, revisado_en)
       VALUES ($1, 'Juan', 'Pérez', '87654321', 'juan@test.com', 'RECHAZADA', now() - interval '2 days', now() - interval '1 day')
       RETURNING id_solicitud;`,
      [phone],
    );
    const id = r.rows[0].id_solicitud;

    try {
      const reply = await applyIncomingMessage({
        wamid: `wamid.test.rechazada.${Date.now()}`,
        from: phone,
        text: 'CANCELAR',
      });
      assert.equal(reply, bot.MSG.cancelado);

      const check = await pool.query(`SELECT 1 FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
      assert.equal(check.rowCount, 0, 'La solicitud rechazada debió ser eliminada de la BD');
    } finally {
      await pool.query(`DELETE FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
      await pool.query(`DELETE FROM public.whatsapp_conversaciones WHERE telefono = $1;`, [phone]);
    }
  });

  it('CANCELAR en estado PROCESANDO no borra nada y responde que está en revisión', async () => {
    const phone = `519${Math.floor(10000000 + Math.random() * 89999999)}`;
    const r = await pool.query(
      `INSERT INTO public.solicitudes_acceso_familia
        (telefono, nombres, apellidos, dni, email, estado, consentimiento_en)
       VALUES ($1, 'Rosa', 'Flores', '76543210', 'rosa@test.com', 'PROCESANDO', now())
       RETURNING id_solicitud;`,
      [phone],
    );
    const id = r.rows[0].id_solicitud;

    try {
      const reply = await applyIncomingMessage({
        wamid: `wamid.test.procesando.${Date.now()}`,
        from: phone,
        text: 'CANCELAR',
      });
      assert.equal(reply, bot.MSG.noCancelableEnRevision);

      const check = await pool.query(`SELECT estado FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
      assert.equal(check.rowCount, 1, 'La solicitud en proceso NO debe borrarse');
      assert.equal(check.rows[0].estado, 'PROCESANDO');
    } finally {
      await pool.query(`DELETE FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
      await pool.query(`DELETE FROM public.whatsapp_conversaciones WHERE telefono = $1;`, [phone]);
    }
  });

  it('CANCELAR en estado APROBADA no borra y explica cómo pedir la baja', async () => {
    const phone = `519${Math.floor(10000000 + Math.random() * 89999999)}`;
    const r = await pool.query(
      `INSERT INTO public.solicitudes_acceso_familia
        (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, revisado_en)
       VALUES ($1, 'Carlos', 'Gómez', '65432109', 'carlos@test.com', 'APROBADA', now(), now())
       RETURNING id_solicitud;`,
      [phone],
    );
    const id = r.rows[0].id_solicitud;

    try {
      const reply = await applyIncomingMessage({
        wamid: `wamid.test.aprobada.${Date.now()}`,
        from: phone,
        text: 'CANCELAR',
      });
      assert.equal(reply, bot.MSG.noCancelableAprobada);

      const check = await pool.query(`SELECT estado FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
      assert.equal(check.rowCount, 1, 'La solicitud aprobada NO debe borrarse');
      assert.equal(check.rows[0].estado, 'APROBADA');
    } finally {
      await pool.query(`DELETE FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
      await pool.query(`DELETE FROM public.whatsapp_conversaciones WHERE telefono = $1;`, [phone]);
    }
  });

  it('la purga programada borra rechazadas antiguas y anonimiza aprobadas antiguas', async () => {
    const basePhone = Math.floor(10000000 + Math.random() * 89999990);
    const pOldRechazada = `519${basePhone}`;
    const pRecentRechazada = `519${basePhone + 1}`;
    const pOldAprobada = `519${basePhone + 2}`;
    const pRecentAprobada = `519${basePhone + 3}`;

    const inserted: number[] = [];

    try {
      // 1. Rechazada antigua (> 30 días)
      const r1 = await pool.query(
        `INSERT INTO public.solicitudes_acceso_familia
          (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, revisado_en)
         VALUES ($1, 'Test1', 'Old', '11111111', 't1@test.com', 'RECHAZADA', now() - interval '40 days', now() - interval '35 days')
         RETURNING id_solicitud;`,
        [pOldRechazada],
      );
      inserted.push(r1.rows[0].id_solicitud);

      // 2. Rechazada reciente (< 30 días)
      const r2 = await pool.query(
        `INSERT INTO public.solicitudes_acceso_familia
          (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, revisado_en)
         VALUES ($1, 'Test2', 'Recent', '22222222', 't2@test.com', 'RECHAZADA', now() - interval '10 days', now() - interval '5 days')
         RETURNING id_solicitud;`,
        [pRecentRechazada],
      );
      inserted.push(r2.rows[0].id_solicitud);

      // 3. Aprobada antigua (> 30 días)
      const r3 = await pool.query(
        `INSERT INTO public.solicitudes_acceso_familia
          (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, revisado_en)
         VALUES ($1, 'Test3', 'OldApp', '33333333', 't3@test.com', 'APROBADA', now() - interval '40 days', now() - interval '35 days')
         RETURNING id_solicitud;`,
        [pOldAprobada],
      );
      inserted.push(r3.rows[0].id_solicitud);

      // 4. Aprobada reciente (< 30 días)
      const r4 = await pool.query(
        `INSERT INTO public.solicitudes_acceso_familia
          (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, revisado_en)
         VALUES ($1, 'Test4', 'RecentApp', '44444444', 't4@test.com', 'APROBADA', now() - interval '10 days', now() - interval '5 days')
         RETURNING id_solicitud;`,
        [pRecentAprobada],
      );
      inserted.push(r4.rows[0].id_solicitud);

      // Ejecutamos la purga con 30 días
      await purgeStaleData(30);

      // Verificaciones:
      // r1 (rechazada antigua): DEBE haber sido borrada
      const check1 = await pool.query(`SELECT 1 FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [r1.rows[0].id_solicitud]);
      assert.equal(check1.rowCount, 0, 'La solicitud rechazada vencida debió ser borrada');

      // r2 (rechazada reciente): DEBE conservarse
      const check2 = await pool.query(`SELECT 1 FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [r2.rows[0].id_solicitud]);
      assert.equal(check2.rowCount, 1, 'La solicitud rechazada reciente debe conservarse');

      // r3 (aprobada antigua): DEBE anonimizarse (dni=null, telefono=null)
      const check3 = await pool.query(`SELECT dni, telefono, estado FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [r3.rows[0].id_solicitud]);
      assert.equal(check3.rowCount, 1);
      assert.equal(check3.rows[0].dni, null, 'El DNI de la aprobada vencida debió ser anonimizado a NULL');
      assert.equal(check3.rows[0].telefono, null, 'El teléfono de la aprobada vencida debió ser anonimizado a NULL');
      assert.equal(check3.rows[0].estado, 'APROBADA');

      // r4 (aprobada reciente): NO debe anonimizarse todavía
      const check4 = await pool.query(`SELECT dni, telefono FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [r4.rows[0].id_solicitud]);
      assert.equal(check4.rowCount, 1);
      assert.equal(check4.rows[0].dni, '44444444');
      assert.equal(check4.rows[0].telefono, pRecentAprobada);
    } finally {
      await pool.query(`DELETE FROM public.solicitudes_acceso_familia WHERE id_solicitud = ANY($1::int[]);`, [inserted]).catch(() => undefined);
    }
  });
});

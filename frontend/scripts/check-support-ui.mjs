import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Browser fixtures intercept every API request. This check never writes to the configured backend.
const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:5174';
const output = fileURLToPath(new URL('../../tmp/support-ui/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const user = { id_usuario: 4, codigo_usuario: 's00004', nombres: 'Agente', apellidos: 'Prueba', email: 'soporte@example.invalid', rol: 'SOPORTE_TECNICO', roles: ['SOPORTE_TECNICO'], activo: true };
    let signedIn = false;
    let adminRequests = 0;
    const tickets = [];
    const notes = [];
    await page.route('**/api/v1/**', async (route) => {
      const req = route.request();
      const path = new URL(req.url()).pathname.replace('/api/v1', '');
      const body = req.method() === 'GET' ? undefined : req.postDataJSON();
      const respond = (json, status = 200) => route.fulfill({ status, json });
      if (path === '/auth/me') return respond(signedIn ? user : { error: 'Sin sesión' }, signedIn ? 200 : 401);
      if (path === '/auth/login') {
        expect(body.codigo_usuario).toBe(user.codigo_usuario);
        signedIn = true; return respond({ user, message: 'ok' });
      }
      if (path.startsWith('/admin')) { adminRequests++; return respond({ error: 'Prohibido' }, 403); }
      if (path === '/soporte/incidencias' && req.method() === 'POST') {
        const ticket = { ...body, id_incidencia: 7, ticket: 'INC-00007', estado: 'RECIBIDA', prioridad: 2, rol_solicitante: 'SOPORTE_TECNICO', fecha_creacion: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() };
        tickets.push(ticket); return respond(ticket, 201);
      }
      if (path === '/soporte/incidencias') return respond({ items: tickets, total: tickets.length });
      if (path.endsWith('/notas') && req.method() === 'POST') {
        const note = { ...body, id_nota: notes.length + 1, fecha_creacion: new Date().toISOString(), autor: 'Respuesta de soporte' };
        notes.push(note); return respond(note, 201);
      }
      if (path.endsWith('/notas')) return respond({ items: notes });
      if (path.endsWith('/estado')) { tickets[0].estado = body.estado; return respond(tickets[0]); }
      if (path === '/soporte/incidencias/7') return respond(tickets[0]);
      return respond({ error: `API no prevista en fixture: ${path}` }, 404);
    });
    await page.goto(`${base}/login`);
    await page.getByLabel('Código de usuario').fill('s00004');
    await page.getByLabel('Contraseña', { exact: true }).fill('solo-prueba-sin-credenciales-reales');
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await expect(page).toHaveURL(`${base}/soporte`);
    await expect(page.getByRole('heading', { name: 'Incidencias técnicas', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Nueva incidencia', exact: true }).click();
    await page.getByLabel('Título', { exact: true }).fill('Fallo de ayuda');
    await page.getByLabel('Descripción breve').fill('No carga la pantalla de ayuda.');
    await page.getByRole('button', { name: 'Registrar incidencia', exact: true }).click();
    await expect(page).toHaveURL(`${base}/soporte/incidencias/7`);
    await page.getByLabel('Mensaje', { exact: true }).fill('Se corrigió la pantalla.');
    await page.getByRole('button', { name: 'Enviar respuesta', exact: true }).click();
    await expect(page.getByText('Se corrigió la pantalla.', { exact: true })).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByLabel('Mensaje', { exact: true }).fill('Nota de seguimiento técnico.');
    await page.getByRole('button', { name: 'Guardar nota interna', exact: true }).click();
    await expect(page.getByText('Nota de seguimiento técnico.', { exact: true })).toBeVisible();
    await page.getByLabel('Estado', { exact: true }).selectOption('RESUELTA');
    await expect(page.getByLabel('Estado', { exact: true })).toHaveValue('RESUELTA');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `${output}/support-${viewport.width}.png`, fullPage: true });
    await page.goto(`${base}/admin/cuentas`);
    await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible();
    expect(adminRequests).toBe(0);
    expect(errors).toEqual([]);
    console.log(`PASS support browser flow, direct admin denial and responsive layout: ${viewport.width}px`);
    await context.close();
  }
  // The authorized account management flow uses a native, keyboard-accessible dialog.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const user = { id_usuario: 1, codigo_usuario: 'a00001', nombres: 'Admin', apellidos: 'Prueba', email: 'admin@example.invalid', rol: 'ADMIN', roles: ['ADMIN'], activo: true };
  const accounts = [];
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    if (path === '/auth/me') return route.fulfill({ json: user });
    if (path === '/admin/cuentas/soporte') {
      const account = { ...route.request().postDataJSON(), id_usuario: 4, codigo_usuario: 's00004', rol: 'SOPORTE_TECNICO', activo: true, fecha_creacion: new Date().toISOString() };
      accounts.push(account);
      return route.fulfill({ status: 201, json: { cuenta: account, message: 'Cuenta de soporte técnico creada con éxito', correo_bienvenida: 'NO_CONFIGURADO' } });
    }
    return route.fulfill({ json: { items: accounts, total: accounts.length } });
  });
  await page.goto(`${base}/admin/cuentas`);
  await page.getByRole('button', { name: 'Soporte Técnico', exact: true }).click();
  await page.getByRole('button', { name: 'Nueva cuenta', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Nombres', { exact: true }).fill('Agente');
  await dialog.getByLabel('Apellidos', { exact: true }).fill('Prueba');
  await dialog.getByLabel('Correo electrónico', { exact: true }).fill('soporte@example.invalid');
  await dialog.getByRole('button', { name: 'Crear cuenta de soporte', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('s00004', { exact: true })).toBeVisible();
  console.log('PASS admin support account creation in browser (API fixture; no production writes)');
} finally { await browser.close(); }

// Visual QA with synthetic data; every API request is intercepted, never sent to FastAPI.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'docs/evidence/admin-visual-v67';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const errors = [], requests = [], layouts = [];
  try {
    const page = await browser.newPage();
    let role = 'ADMIN', incidentError = false;
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/api/v1/**', async route => {
      const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
      requests.push({ method: route.request().method(), path });
      let body = path.startsWith('/admin/') ? { items: [], total: 0 } : [], status = 200;
      if (path === '/auth/me') body = { id_usuario: 0, codigo_usuario: 'fixture', nombres: 'Prueba', apellidos: 'Aislada', email: 'test@example.invalid', rol: role, roles: [role], activo: true };
      if (path === '/admin/incidencias') {
        if (incidentError) { status = 503; body = { detail: 'Error sintético de verificación.' }; }
        else body = { items: [{ id_incidencia: 0, tipo: 'Visual / Diseño', titulo: 'Reporte de prueba aislada', descripcion: 'Descripción sintética, sin datos personales.', estado: 'NUEVA', usuario: 'Cuenta de prueba', rol: 'PADRE', fecha_creacion: '2026-10-11T12:00:00Z' }], total: 1 };
      }
      if (path === '/admin/auditoria') body = { items: [{ id_auditoria: 0, accion: 'UPDATE', actor: 'Prueba aislada', nombre_tabla: 'usuarios', nombre_entidad: 'Fixture', fecha_evento: '2026-10-11T12:00:00Z' }], total: 1 };
      await route.fulfill({ status, contentType: 'application/json', headers: { 'X-Total-Count': '0' }, body: JSON.stringify(body) });
    });
    const routes = ['dashboard','cuentas','operacion','contenido','ml','auditoria','config','pacientes','citas','sesiones','reportes','usuarios'];
    for (const route of routes) {
      await page.setViewportSize({ width: 1536, height: 1024 });
      await page.goto(`http://127.0.0.1:5176/admin/${route}`);
      await page.locator('.asha-admin').waitFor();
      if (route === 'dashboard') await page.locator('.operational-stats').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      const layout = await page.evaluate(() => ({ width: innerWidth, overflow: document.getElementById('root').scrollWidth > innerWidth, font: getComputedStyle(document.querySelector('.asha-admin')).fontFamily, text: document.querySelector('.admin-content').innerText, brokenImages: [...document.querySelectorAll('.asha-admin img')].filter(e => !e.complete || !e.naturalWidth).map(e => e.src) }));
      assert.equal(layout.overflow, false, route);
      assert.ok(layout.font.includes('Nunito'));
      assert.deepEqual(layout.brokenImages, [], route);
      layouts.push({ route, ...layout });
      await page.screenshot({ path: `${out}/${route}-1536.png` });
      if (route === 'dashboard') {
        assert.equal(await page.locator('.admin-welcome-art img').count(), 1);
        assert.equal(await page.locator('.operational-stats dd').allTextContents().then(a => a.join(',')), '0,0,0,0');
        await page.getByRole('button', { name: 'Registrar familias y cuentas', exact: true }).click();
        await page.waitForURL('**/admin/cuentas');
      }
      if (route === 'cuentas') {
        await page.getByRole('button', { name: 'Nueva cuenta', exact: true }).click();
        await page.locator('[role=dialog]').waitFor();
        await page.screenshot({ path: `${out}/cuentas-dialog-1536.png` });
        await page.keyboard.press('Escape');
      }
      if (route === 'operacion') {
        await page.getByRole('button', { name: /Reporte de prueba aislada/ }).click();
        await page.getByRole('button', { name: 'Confirmar lectura', exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: /Reporte de prueba aislada/ }).getAttribute('aria-expanded'), 'true');
        await page.screenshot({ path: `${out}/incidencia-expandida-1536.png` });
      }
    }
    incidentError = true;
    await page.goto('http://127.0.0.1:5176/admin/operacion');
    await page.getByRole('alert').filter({ hasText: 'Error sintético' }).waitFor();
    await page.getByRole('button', { name: 'Reintentar' }).waitFor();
    incidentError = false;
    for (const width of [1024,390]) {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto('http://127.0.0.1:5176/admin/dashboard');
      await page.locator('.operational-stats').waitFor();
      const overflow = await page.evaluate(() => document.getElementById('root').scrollWidth > innerWidth);
      assert.equal(overflow, false);
      await page.screenshot({ path: `${out}/dashboard-${width}.png` });
      layouts.push({ route: 'dashboard', width, overflow });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const transition = await page.locator('.operational-actions button').first().evaluate(e => getComputedStyle(e).transitionDuration);
    assert.equal(transition, '0s');
    role = 'TERAPEUTA';
    await page.goto('http://127.0.0.1:5176/terapeuta');
    await page.locator('.asha-professional').waitFor();
    assert.equal(await page.locator('.admin-welcome-art,.asha-admin').count(), 0);
    assert.deepEqual(errors, []);
    assert.equal(requests.filter(r => r.method !== 'GET').length, 0);
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify({ scope: 'Synthetic API interception only; no live authentication or database changes', layouts, requests, errors, reducedMotion: transition, therapistIsolation: true }, null, 2));
    console.log('PASS: 12 admin routes, account dialog, incident disclosure/error, action destination, 1536/1024/390 widths, Nunito, assets, reduced motion and therapist isolation. No API writes.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

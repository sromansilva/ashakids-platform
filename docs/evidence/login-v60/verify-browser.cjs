const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'docs/evidence/login-v60';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    const errors = [], requests = [], layouts = [];
    let release, pending = false;
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/api/v1/**', async route => {
      if (route.request().url().endsWith('/auth/login')) {
        requests.push(route.request().postDataJSON());
        if (pending) await new Promise(resolve => { release = resolve; });
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'Acceso de prueba rechazado.' }) });
      }
      return route.fulfill({ status: 401, contentType: 'application/json', body: '{"detail":"Not authenticated"}' });
    });
    for (const width of [320,375,768,1024,1536]) {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto('http://127.0.0.1:5176/login');
      await page.locator('.login-form-panel').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({ width: innerWidth,
        overflow: document.getElementById('root').scrollWidth > innerWidth,
        smallButtons: [...document.querySelectorAll('.asha-login button')].filter(e => e.getClientRects().length && e.getBoundingClientRect().height < 44).map(e => e.textContent),
        font: getComputedStyle(document.querySelector('.asha-login')).fontFamily,
        h1: document.querySelectorAll('h1').length,
        inputHeights: [...document.querySelectorAll('.login-input-wrap input')].map(e => e.getBoundingClientRect().height),
        submitShadow: getComputedStyle(document.querySelector('.login-submit')).boxShadow
      }));
      assert.equal(layout.overflow, false);
      assert.equal(layout.h1, 1);
      assert.deepEqual(layout.smallButtons, []);
      assert.ok(layout.font.includes('Nunito'));
      assert.ok(layout.inputHeights.every(h => h >= 48));
      layouts.push(layout);
      if (width === 1536) {
        const baseline = JSON.parse(fs.readFileSync(`${out}/baseline.json`));
        assert.equal(await page.locator('.asha-login').innerText(), baseline.texts);
        assert.equal(await page.locator('.login-word').evaluate(e => e.outerHTML), baseline.art);
      }
      await page.evaluate(() => { for (const e of [document.documentElement,document.body,document.getElementById('root')]) { e.style.height = 'auto'; e.style.overflow = 'visible'; } });
      await page.screenshot({ path: `${out}/login-${width}.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Por favor ingresa' }).waitFor();
    assert.equal(requests.length, 0);
    await page.getByRole('button', { name: /Padre \/ Familia/ }).click();
    assert.equal(await page.getByLabel('Código de usuario').inputValue(), 'p00001');
    assert.equal(await page.getByLabel('Contraseña', { exact: true }).inputValue(), '');
    assert.equal(requests.length, 0);
    await page.getByLabel('Contraseña', { exact: true }).fill('SyntheticOnly');
    await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click();
    assert.equal(await page.getByLabel('Contraseña', { exact: true }).getAttribute('type'), 'text');
    await page.getByRole('button', { name: 'Ocultar contraseña', exact: true }).click();
    await page.getByLabel('Recordarme').check();
    pending = true;
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await page.getByRole('button', { name: 'Iniciando sesión…', exact: true }).waitFor();
    assert.equal(await page.getByLabel('Código de usuario').isDisabled(), true);
    await page.screenshot({ path: `${out}/login-loading.png` });
    await page.waitForFunction(() => document.querySelector('.login-submit').disabled);
    while (!release) await page.waitForTimeout(50);
    release();
    await page.getByRole('alert').filter({ hasText: 'Acceso de prueba rechazado' }).waitFor();
    assert.equal(await page.getByLabel('Código de usuario').isDisabled(), false);
    assert.equal(requests.length, 1);
    assert.deepEqual(Object.keys(requests[0]).sort(), ['codigo_usuario','password']);
    await page.screenshot({ path: `${out}/login-error.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.login-submit').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    await page.getByLabel('Código de usuario').focus();
    assert.notEqual(await page.getByLabel('Código de usuario').evaluate(e => getComputedStyle(e).outlineStyle), 'none');
    await page.getByRole('button', { name: '¿Olvidaste tu contraseña?', exact: true }).click();
    await page.waitForURL('**/forgot-password');
    await page.goto('http://127.0.0.1:5176/login');
    await page.locator('.asha-login').waitFor();
    await page.getByRole('button', { name: 'Volver al inicio', exact: true }).click();
    await page.waitForURL('http://127.0.0.1:5176/');
    assert.deepEqual(errors, []);
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify({ layouts, errors, contentAndArtworkPreserved: true, states: ['required fields','development prefill only','password visibility','remember checkbox','pending disabled','rejected login and retry enabled','keyboard focus','reduced motion','forgot password route','home route'], scope: 'Synthetic rejected login only; no real authentication, database, sessions or emails.' }, null, 2));
    console.log({ widths: layouts.map(l => l.width), errors, contentAndArtworkPreserved: true });
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

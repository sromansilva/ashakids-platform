const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'docs/evidence/landing-v59';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const layouts = [];
    for (const width of [320,375,768,1024,1536]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://127.0.0.1:5176/');
      await page.locator('.mundo-card').nth(4).waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.querySelectorAll('.asha-landing img')) { image.loading = 'eager'; await image.decode(); }
      });
      assert.equal(await page.locator('#landing-specialists').getByRole('button', { name: /Ver todos/ }).count(), 0);
      assert.equal(await page.locator('.asha-landing [href="/especialistas"],.asha-landing [href="/public/especialistas"]').count(), 0);
      await page.getByRole('link', { name: 'Explorar terapeutas', exact: true }).click();
      assert.equal(new URL(page.url()).pathname, '/');
      assert.equal(new URL(page.url()).hash, '#landing-specialists');
      await page.getByRole('button', { name: 'Terapeutas Conecta y da seguimiento', exact: true }).click();
      assert.equal(new URL(page.url()).pathname, '/');
      assert.equal(new URL(page.url()).hash, '#landing-specialists');
      await page.locator('.landing-footer').getByRole('link', { name: 'Especialistas', exact: true }).click();
      assert.equal(new URL(page.url()).pathname, '/');
      assert.equal(new URL(page.url()).hash, '#landing-specialists');
      const layout = await page.evaluate(() => {
        const footer = document.querySelector('.landing-footer');
        const logo = footer.querySelector('img');
        return { width: innerWidth, overflow: document.getElementById('root').scrollWidth > innerWidth,
          logo: { loaded: logo.naturalWidth > 0, src: logo.currentSrc, width: logo.getBoundingClientRect().width },
          footerBackground: getComputedStyle(footer).backgroundColor,
          smallControls: [...footer.querySelectorAll('button,a')].filter(e => e.getBoundingClientRect().height < 44).map(e => e.textContent),
          footerLinks: [...footer.querySelectorAll('button,a')].map(e => e.textContent) };
      });
      assert.equal(layout.overflow, false);
      assert.equal(layout.logo.loaded, true);
      assert.deepEqual(layout.smallControls, []);
      layouts.push(layout);
      await page.evaluate(() => {
        for (const e of [document.documentElement,document.body,document.getElementById('root')]) { e.style.height = 'auto'; e.style.overflow = 'visible'; }
      });
      const style = await page.addStyleTag({ content: '.asha-landing > nav,.landing-assistant-dock,.landing-skip {visibility:hidden!important}' });
      await page.locator('.landing-footer').screenshot({ path: `${out}/footer-${width}.png` });
      if (width === 1536) await page.locator('#landing-specialists').screenshot({ path: `${out}/therapists-desktop.png` });
      await style.evaluate(e => e.remove());
    }
    const favicon = await page.locator('head link[rel="icon"]').getAttribute('href');
    const response = await page.request.get(`http://127.0.0.1:5176${favicon}`);
    assert.equal(response.status(), 200);
    assert.ok(response.headers()['content-type'].includes('image/png'));
    assert.deepEqual(await response.body(), fs.readFileSync('frontend/src/assets/ashakids-logo-final-transparent-1.png'));
    await page.goto('http://127.0.0.1:5176/');
    await page.locator('#landing-specialists').getByRole('button', { name: 'Agendar', exact: true }).first().click();
    await page.locator('#login-user-code').waitFor();
    assert.equal(new URL(page.url()).pathname, '/login');
    await page.goto('http://127.0.0.1:5176/especialistas');
    await page.locator('footer').waitFor();
    assert.equal(await page.locator('.landing-footer').count(), 0, 'Other public footers keep the previous variant');
    assert.deepEqual(errors, []);
    const result = { layouts, favicon, faviconMatchesOfficialLogo: true, navigation: 'Therapist browsing stays in landing; Agendar still opens login', otherFooterUnchanged: true, errors, scope: 'Chrome viewport emulation with real local public catalog. No login or writes.' };
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(result, null, 2));
    console.log(result);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

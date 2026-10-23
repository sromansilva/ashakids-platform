// Public UI only. API requests are intercepted; no session or database writes.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = 'docs/evidence/landing-v51';
const baseURL = process.env.LANDING_PREVIEW_URL || 'http://127.0.0.1:5176';
const words = text => text.replace(/ASHAKids/g, 'AshaKids').trim().split(/\s+/).sort();
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/v1/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await page.goto(baseURL);
    await page.locator('h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const baseline = JSON.parse(fs.readFileSync(`${out}/baseline.json`, 'utf8'));
    const current = await page.evaluate(() => ({
      text: document.querySelector('.asha-landing').innerText,
      buttons: [...document.querySelectorAll('.asha-landing button')].map(x => x.textContent.trim()),
      links: [...document.querySelectorAll('a')].map(x => ({ text: x.textContent, label: x.getAttribute('aria-label'), href: x.getAttribute('href') })),
    }));
    assert.deepEqual(words(current.text), words(baseline.text), 'All visible content must be preserved (ordering can change).');
    assert.deepEqual([...current.buttons].sort(), [...baseline.buttons].sort(), 'All button labels must be preserved.');
    assert.deepEqual(current.links, baseline.links, 'Anchor destinations must be preserved.');
    assert.equal(await page.getByRole('button', { name: 'Abrir asistente ASHI' }).count(), 0);
    assert.equal(await page.getByRole('link', { name: /WhatsApp/ }).count(), 0);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Saltar al contenido');
    const focus = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    assert.equal(focus, 'solid');
    await page.keyboard.press('Enter');
    await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
    const viewports = [];
    for (const [width, height, name] of [[1440,1000,'desktop'],[390,844,'mobile'],[320,844,'small-mobile'],[768,1024,'tablet'],[1024,900,'small-desktop'],[1920,1080,'wide-desktop']]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => { window.scrollTo(0, 0); document.getElementById('root').scrollTo(0,0); });
      const layout = await page.evaluate(() => {
        const containers = [document.documentElement,document.body,document.getElementById('root')];
        const old = containers.map(x => x.style.overflowX);
        containers.forEach(x => x.style.overflowX = 'visible');
        const overflow = containers.some(x => x.scrollWidth > innerWidth);
        containers.forEach((x,i) => x.style.overflowX = old[i]);
        return {
          overflow,
          smallButtons: [...document.querySelectorAll('.asha-landing button')].filter(x => x.getClientRects().length && x.getBoundingClientRect().height < 43.9).map(x => x.textContent.trim()),
          font: getComputedStyle(document.querySelector('h1')).fontFamily,
          nunitoLoaded: document.fonts.check('900 36px Nunito'),
          cta: { background: getComputedStyle(document.querySelector('.landing-primary')).backgroundImage, shadow: getComputedStyle(document.querySelector('.landing-primary')).boxShadow },
        };
      });
      assert.equal(layout.overflow, false, `No horizontal overflow at ${width}`);
      assert.deepEqual(layout.smallButtons, [], `Touch targets at ${width}`);
      assert.ok(layout.nunitoLoaded, 'Nunito must finish loading');
      viewports.push({ width, height, ...layout });
      if (['desktop','mobile','small-mobile','tablet'].includes(name)) {
        await page.screenshot({ path: `${out}/${name}-viewport.png` });
        // The existing app scrolls #root. Expand that container only for full-page capture.
        const styles = await page.evaluate(() => ['html','body','#root'].map(selector => {
          const x = document.querySelector(selector); const style = x.getAttribute('style');
          x.style.height = 'auto'; x.style.overflow = 'visible'; return { selector, style };
        }));
        await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
        await page.evaluate(saved => saved.forEach(({selector,style}) => {
          const x = document.querySelector(selector); if (style === null) x.removeAttribute('style'); else x.setAttribute('style',style);
        }),styles);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const faqs = page.locator('.landing-faq-item button');
    const answers = [];
    for (let i = 0; i < await faqs.count(); i++) {
      await faqs.nth(i).click();
      assert.equal(await faqs.nth(i).getAttribute('aria-expanded'), 'true');
      const answer = page.locator(`#${await faqs.nth(i).getAttribute('aria-controls')}`);
      answers.push(await answer.innerText());
      await faqs.nth(i).press('Enter');
      assert.equal(await faqs.nth(i).getAttribute('aria-expanded'), 'false');
      assert.equal(await answer.count(), 0);
    }
    await page.getByRole('textbox', { name: 'Newsletter semanal · Gratis' }).fill('prueba@example.invalid');
    const requests = [];
    const record = request => requests.push(request.url());
    page.on('request', record);
    await page.getByRole('button', { name: 'Suscribirme gratis' }).click();
    page.off('request', record);
    assert.deepEqual(requests, [], 'Visual newsletter retains its existing no-op behavior.');
    const destinations = [];
    const controls = ['.landing-primary','.landing-service-copy button','.landing-heading-row button','.landing-therapist-info button:not(:disabled)', '> nav > div button:not(.landing-brand)', '> footer button'];
    for (const selector of controls) {
      await page.goto(baseURL); await page.locator('h1').waitFor();
      const count = await page.locator(`.asha-landing ${selector}`).count();
      for (let i = 0; i < count; i++) {
        await page.goto(baseURL); await page.locator('h1').waitFor();
        const button = page.locator(`.asha-landing ${selector}`).nth(i);
        const name = await button.textContent(); await button.click();
        await page.waitForFunction(() => location.pathname !== '/');
        destinations.push({ name: name.trim(), path: new URL(page.url()).pathname });
      }
    }
    await page.goto(baseURL); await page.locator('h1').waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [selector,name] of [['.landing-team','mobile-team'],['.landing-faq','mobile-faq'],['.landing-newsletter','mobile-newsletter']]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/${name}.png`, animations: 'disabled' });
    }
    await page.evaluate(() => document.getElementById('root').scrollTo(0,0));
    await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
    await page.waitForFunction(() => Math.abs(document.querySelector('aside').getBoundingClientRect().left) < 1);
    await page.screenshot({ path: `${out}/mobile-menu.png`, animations: 'disabled' });
    await page.locator('aside').getByRole('button', { name: 'Mundo ASHA' }).click();
    await page.waitForURL('**/mundo-asha');
    assert.equal(await page.locator('aside').count(), 0, 'Navigation closes mobile menu.');
    await page.goto(baseURL); await page.locator('h1').waitFor();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const motion = await page.locator('.landing-primary').evaluate(x => ({ transition: getComputedStyle(x).transitionDuration, animation: getComputedStyle(x).animationName }));
    assert.equal(motion.transition, '0s'); assert.equal(motion.animation, 'none');
    assert.deepEqual(errors, [], 'No browser runtime errors');
    const result = { baseSHA: '5dd572cb37a679d5e8674a0cf1910426d925a1f9', api: 'intercepted:401; no database or session writes', content: 'same visible word and button-label multisets; exact anchor destinations; sections redistributed', viewports, faqs: answers, destinations, focus, reducedMotion: motion, browserErrors: errors };
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

// Synthetic family fixture. API and audio events stay local; no patient or microphone data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../../frontend/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'docs/evidence/sounds-v108';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5174';
const errors = [], layouts = [], requests = [], spoken = [];
const children = [
  { id_paciente: 901, nombres_paciente: 'Ana', apellidos_paciente: 'Demo', fecha_nacimiento: '2022-10-19', activo: true },
  { id_paciente: 902, nombres_paciente: 'Leo', apellidos_paciente: 'Demo', fecha_nacimiento: '2018-10-19', activo: true },
  { id_paciente: 903, nombres_paciente: 'Sol', apellidos_paciente: 'Demo', fecha_nacimiento: '2020-10-19', activo: true },
];
const ids = ['HABLA', 'LENGUAJE', 'FLUIDEZ', 'VOZ', 'OROFACIAL'];
const names = ['Taller de los Sonidos', 'La Isla de las Palabras', 'Ritmo de las Palabras', 'El Estudio de la Voz', 'Laboratorio de los Gestos'];
const challengeTitles = ['¿Suenan igual?', 'El tren de sonidos', 'Uno, dos… ¡a escuchar!', 'Parejas que se escuchan', 'El sonido que falta', 'Primero y al final', 'El intruso del coro'];
async function layout(page, label) {
  const decodeErrors = await page.locator('.sound-world img').evaluateAll(images => Promise.all(images.map(img => img.decode()
    .then(() => null).catch(error => ({ src: img.src, error: error.message, naturalWidth: img.naturalWidth })) )));
  const brokenImages = decodeErrors.filter(Boolean);
  assert.deepEqual(brokenImages, [], `Image decode failed in ${label}`);
  const data = await page.evaluate(label => ({ label, width: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    broken: [...document.querySelectorAll('.sound-world img')].filter(img => !img.naturalWidth).map(img => img.src),
    fallback: [...document.querySelectorAll('.sound-world .sound-image-error')].map(image => image.textContent),
    small: [...document.querySelectorAll('.sound-world button')].filter(button => button.checkVisibility() && button.getBoundingClientRect().height < 44).map(button => button.textContent.trim()),
  }), label);
  layouts.push(data); assert.equal(data.overflow, false, JSON.stringify(data)); assert.deepEqual(data.broken, []); assert.deepEqual(data.fallback, []); assert.deepEqual(data.small, []);
}
async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 1000 } });
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    await page.clock.setFixedTime(new Date('2026-10-19T15:00:00Z'));
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      Math.random = () => .999;
      window.__soundEvents = [];
      window.speechSynthesis.speak = () => { throw new Error('Unexpected native voice'); };
      HTMLMediaElement.prototype.play = function() {
        window.__soundEvents.push(this.src);
        const media = this;
        setTimeout(() => { media.dispatchEvent(new Event('playing')); media.dispatchEvent(new Event('ended')); }, 25);
        return Promise.resolve();
      };
    });
    await page.route('**/api/v1/**', async route => {
      const req = route.request(), path = new URL(req.url()).pathname;
      requests.push({ method: req.method(), path });
      const worlds = ids.map((id, index) => ({ id, name: names[index], version: 'basica-1', description: 'Fixture sintético', asignado: true, completados: [], intentos: 0, medalla: false,
        levels: [{ number: 1, title: 'Anterior', prompt: 'Encuentra al gato.', choices: ['Gato', 'Perro'], sequence: false }] }));
      const data = path.endsWith('/pacientes') ? children : path.endsWith('/juegos') ? { id_paciente: Number(path.match(/pacientes\/(\d+)/)?.[1] || 901), version: 'basica-1', experiencia: 0, nivel: 1, medallas: [], intentos_totales: 0, experiencia_siguiente_nivel: 200, mundos: worlds } : [];
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'X-Total-Count': String(children.length) }, body: JSON.stringify(data) });
    });
    await page.goto(`${base}/tests/world-map-harness.html?verify=1`); await page.waitForLoadState('networkidle');
    const click = name => page.getByRole('button', { name, exact: true }).click();
    await click('Abrir Taller de los Sonidos');
    assert.ok(await page.getByText('Una selección para tus 4 años', { exact: false }).count());
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 9);
    assert.equal(await page.getByRole('heading', { level: 3 }).count(), 9);
    for (const width of [1366, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 }); await layout(page, `menu-4-${width}`);
      if ([1366, 390].includes(width)) await page.screenshot({ path: `${out}/menu-${width}.png`, fullPage: true });
      if (width === 390) await page.locator('.sound-world .word-menu').screenshot({ path: `${out}/menu-cards-390.png` });
    }
    await click('Escuchar voz de ASHA'); await page.waitForTimeout(40);
    assert.ok((await page.evaluate(() => window.__soundEvents.at(-1))).includes('/sounds/voice/v108/'));
    assert.equal(await page.evaluate(() => window.speechSynthesis.speaking), false);

    await page.getByText('Para la familia', { exact: true }).click(); await click('Explorar los 11 juegos en familia');
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 11);
    await click('Volver a mis nueve juegos'); assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 9);
    await page.getByLabel('Hijo o hija').selectOption('902'); await click('Abrir Taller de los Sonidos');
    assert.ok(await page.getByText('Una selección para tus 8 años', { exact: false }).count());
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 9);
    await page.getByLabel('Hijo o hija').selectOption('903'); await click('Abrir Taller de los Sonidos');
    assert.ok(await page.getByText('Una selección para tus 6 años', { exact: false }).count());
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 9);

    await page.getByLabel('Hijo o hija').selectOption('901'); await click('Abrir Taller de los Sonidos');
    await page.getByRole('button', { name: /^Jugar ¿Suenan igual\?/ }).click();
    await click('Escuchar cómo jugar'); await page.waitForTimeout(40);
    assert.ok((await page.evaluate(() => window.__soundEvents.at(-1))).includes('/sounds/voice/v108/'));
    await page.setViewportSize({ width: 390, height: 1000 }); await layout(page, 'mission-390');
    await page.screenshot({ path: `${out}/mission-390.png`, fullPage: true });
    await click('¡Vamos a jugar!');
    await page.setViewportSize({ width: 390, height: 1000 }); await layout(page, 'same-round-390');
    await page.screenshot({ path: `${out}/same-round-390.png`, fullPage: true });
    for (let round = 0; round < 3; round++) {
      await click('Escuchar la ronda');
      await page.getByRole('button', { name: 'Suenan iguales', exact: true }).waitFor();
      await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent.includes('Escuchar la ronda'))?.disabled);
      await click('Suenan diferentes'); assert.equal(await page.getByRole('button', { name: 'Continuar', exact: true }).count(), 0);
      await click('Suenan iguales'); await click(round === 2 ? 'Terminar juego' : 'Continuar');
    }
    await page.getByRole('region', { name: 'Actividad completada' }).waitFor(); await click('Elegir otro juego');
    assert.ok(await page.getByText('Jugado en esta visita', { exact: true }).count());
    await page.getByRole('button', { name: /^Un poquito más/ }).click();
    await page.getByText('Para la familia', { exact: true }).click(); await click('Explorar los 11 juegos en familia');
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 11);

    for (const title of challengeTitles) {
      await page.getByRole('button', { name: `Jugar ${title}`, exact: true }).click();
      await click('¡Vamos a jugar!');
      for (const width of [1366, 390, 320]) { await page.setViewportSize({ width, height: 1000 }); await layout(page, `${title}-${width}`); }
      if (title === 'Parejas que se escuchan') {
        await page.setViewportSize({ width: 390, height: 1000 }); await layout(page, 'memory-390');
        await page.screenshot({ path: `${out}/memory-390.png`, fullPage: true });
      }
      await click('Volver a los juegos');
    }

    const decoded = await page.evaluate(async () => {
      const manifestResponse = await fetch('/sounds/voice/v108/manifest.json');
      if (!manifestResponse.ok) throw new Error('Narration manifest unavailable');
      const manifest = await manifestResponse.json(), queue = Object.values(manifest.entries), results = [];
      const context = new AudioContext();
      async function worker() { while (queue.length) {
        const file = queue.shift(), response = await fetch(`/sounds/voice/v108/${file}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${file}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        let peak = 0; for (const sample of buffer.getChannelData(0)) peak = Math.max(peak, Math.abs(sample));
        results.push({ file, duration: buffer.duration, peak });
      } }
      await Promise.all([worker(), worker(), worker(), worker()]); await context.close(); return results;
    });
    assert.equal(decoded.length, 33); for (const clip of decoded) assert.ok(clip.duration > .1 && clip.peak > .001 && clip.peak <= 1, clip.file);
    assert.deepEqual(errors, []);
    assert.deepEqual(requests.filter(request => request.method !== 'GET'), []);
    const result = { cases: ['age 4, 6 and 8 select nine games', 'family catalogue opens all eleven', 'seven new challenges share mission and game styling', 'same-sound game rejects incorrect response and completes three rounds', 'Camila v108 narration preview and mission use static audio', 'all 33 narration MP3 decode with non-silent samples', 'mobile/tablet/desktop layout and menu artwork'], layouts, narration: decoded, errors, requests, mediaEvents: spoken.length,
      limits: 'Synthetic family/API fixture. Audio events simulated during UI flow; 33 real public MP3 decoded. No real account, microphone, child data, learning outcome or clinical validation.' };
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(result, null, 2));
    console.log(`PASS: ${result.cases.length} browser cases; ${layouts.length} responsive checks; ${decoded.length} narration MP3 decoded; zero JS errors or API writes`);
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });

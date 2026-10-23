const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../../frontend/node_modules/@playwright/test');
const fs = require('node:fs'), assert = require('node:assert/strict');
const out = 'docs/evidence/voice-v106', base = process.env.PREVIEW_URL || 'http://127.0.0.1:5174';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const errors = [], layouts = [], requests = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
    await page.clock.setFixedTime(new Date('2026-10-19T15:00:00Z'));
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__narration = []; window.__robotic = 0;
      window.speechSynthesis.speak = () => { window.__robotic++; };
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function() { window.__narration.push(this.src); return play.call(this); };
    });
    await page.route('**/api/v1/**', async route => {
      const request = route.request(), path = new URL(request.url()).pathname;
      requests.push({ method: request.method(), path });
      const data = path.endsWith('/pacientes') ? [{ id_paciente: 901, nombres_paciente: 'Ana', apellidos_paciente: 'Demo', fecha_nacimiento: '2022-10-19', activo: true }] : path.endsWith('/juegos') ? {
        id_paciente: 901, version: 'basica-1', experiencia: 0, nivel: 1, medallas: [], intentos_totales: 0, experiencia_siguiente_nivel: 200,
        mundos: [{ id: 'LENGUAJE', name: 'La Isla de las Palabras', version: 'basica-1', description: 'Fixture', asignado: true, completados: [], intentos: 0, medalla: false, levels: [] }],
      } : [];
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'X-Total-Count': '1' }, body: JSON.stringify(data) });
    });
    await page.goto(`${base}/tests/world-map-harness.html?verify=1`); await page.waitForLoadState('networkidle');
    const click = name => page.getByRole('button', { name, exact: true }).click();
    await click('Abrir La Isla de las Palabras');
    await click('Escuchar voz de ASHA');
    assert.ok(await page.evaluate(() => window.__narration.at(-1).includes('/words/voice/v106/')));
    for (const width of [1366, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const result = await page.evaluate(() => ({ width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth }));
      layouts.push(result); assert.equal(result.overflow, false);
      if (width === 390) await page.screenshot({ path: `${out}/preview-390.png`, fullPage: true });
    }
    await click('Jugar Nombra el dibujo'); await click('Escuchar cómo jugar'); await click('¡Vamos a jugar!'); await click('Escuchar la palabra');
    assert.equal(await page.evaluate(() => window.__robotic), 0);
    await click('Volver a los juegos');
    const decoded = await page.evaluate(async () => {
      const manifest = await (await fetch('/words/voice/v106/manifest.json')).json();
      const context = new AudioContext(); const results = [], queue = Object.values(manifest.entries);
      async function worker() { while (queue.length) {
        const file = queue.shift(); const response = await fetch(`/words/voice/v106/${file}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${file}`);
        const audio = await context.decodeAudioData(await response.arrayBuffer());
        let peak = 0; for (const sample of audio.getChannelData(0)) peak = Math.max(peak, Math.abs(sample));
        results.push({ file, duration: audio.duration, sampleRate: audio.sampleRate, peak });
      } }
      await Promise.all([worker(), worker(), worker(), worker()]); await context.close(); return results;
    });
    for (const clip of decoded) { assert.ok(clip.duration > .1, clip.file); assert.ok(clip.peak > .001 && clip.peak <= 1, clip.file); }
    await page.route('**/words/voice/v106/*.mp3', route => route.abort());
    await click('Escuchar voz de ASHA'); await page.getByText(/No se pudo escuchar/).waitFor();
    assert.deepEqual(errors, []); assert.deepEqual(requests.filter(request => request.method !== 'GET'), []);
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify({ decoded, layouts, errors, requests, cases: ['preview and word audio real', 'zero native speech calls', 'all MP3 decoded/non-silent', 'missing audio recoverable', 'responsive preview'] }, null, 2));
    console.log(`PASS: ${decoded.length} real MP3 decoded; ${layouts.length} layouts; zero native speech/API writes/JS errors`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

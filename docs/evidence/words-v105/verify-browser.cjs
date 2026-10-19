// Synthetic API and fake microphone only. No operational account, child or audio.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../../frontend/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'docs/evidence/words-v105';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5174';
const errors = [], layouts = [], requests = [], cases = [];
const children = [
  { id_paciente: 901, nombres_paciente: 'Ana', apellidos_paciente: 'Demo', fecha_nacimiento: '2022-10-19', activo: true },
  { id_paciente: 902, nombres_paciente: 'Leo', apellidos_paciente: 'Demo', fecha_nacimiento: '2018-10-19', activo: true },
  { id_paciente: 903, nombres_paciente: 'Sol', apellidos_paciente: 'Demo', fecha_nacimiento: '2020-10-19', activo: true },
];
const world = { id: 'LENGUAJE', name: 'La Isla de las Palabras', version: 'basica-1', description: 'Fixture', asignado: true, completados: [], intentos: 0, medalla: false,
  levels: [{ number: 1, title: 'Anterior', prompt: 'Elige gato', choices: ['Gato', 'Perro'], sequence: false }] };
async function layout(page, label) {
  await page.locator('.word-world img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  const data = await page.evaluate(label => ({ label, width: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    broken: [...document.querySelectorAll('.word-world img')].filter(img => !img.naturalWidth).map(img => img.src),
    small: [...document.querySelectorAll('.word-world button')].filter(btn => btn.checkVisibility() && btn.getBoundingClientRect().height < 44).map(btn => btn.textContent),
  }), label);
  layouts.push(data); assert.equal(data.overflow, false, JSON.stringify(data)); assert.deepEqual(data.broken, []); assert.deepEqual(data.small, []);
}
async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 1000 }, permissions: ['microphone'] });
    const page = await context.newPage(); page.setDefaultTimeout(30000);
    await page.clock.setFixedTime(new Date('2026-10-19T15:00:00Z'));
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      Math.random = () => .999;
      window.speechSynthesis.speak = () => {};
      window.__tracks = [];
      const native = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async options => { const stream = await native(options); window.__tracks.push(...stream.getTracks()); return stream; };
    });
    let mismatch = true;
    await page.route('**/api/v1/**', async route => {
      const req = route.request(), path = new URL(req.url()).pathname;
      requests.push({ method: req.method(), path });
      let data = [];
      if (path.endsWith('/pacientes')) data = children;
      if (path.endsWith('/juegos')) data = { id_paciente: Number(path.match(/pacientes\/(\d+)/)?.[1] || 901), version: 'basica-1', experiencia: 0, nivel: 1, medallas: [], intentos_totales: 0, experiencia_siguiente_nivel: 200, mundos: [world] };
      if (path.endsWith('/voz/transcribir')) {
        const form = req.postDataBuffer().toString('latin1');
        assert.ok(form.includes('name="audio"'));
        for (const field of ['id_paciente', 'nivel', 'clave_intento']) assert.ok(!form.includes(`name="${field}"`));
        const expected = form.match(/name="frase_esperada"\r\n\r\n([^\r]+)/)[1];
        data = { estado: 'OK', transcripcion: mismatch ? 'otra palabra' : expected, comparacion: { es_coincidente: !mismatch, frase_esperada: expected, frase_obtenida: expected, porcentaje_coincidencia: mismatch ? 0 : 100, desglose: [], aviso: 'Fixture textual' } };
        mismatch = false;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'X-Total-Count': String(children.length) }, body: JSON.stringify(data) });
    });
    await page.goto(`${base}/tests/world-map-harness.html?verify=1`); await page.waitForLoadState('networkidle');
    const click = name => page.getByRole('button', { name, exact: true }).click();
    const open = async () => { await click('Jugar Nombra el dibujo'); await click('¡Vamos a jugar!'); };
    await click('Abrir La Isla de las Palabras');
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 8);
    assert.ok(await page.getByText('Una selección para tus 4 años', { exact: false }).count());
    for (const width of [1366, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 }); await layout(page, `menu-4-${width}`);
      if ([1366, 390].includes(width)) await page.screenshot({ path: `${out}/menu-${width}.png`, fullPage: true });
    }
    cases.push('eight games for age 4; desktop/tablet/mobile');
    await page.setViewportSize({ width: 390, height: 1000 }); await click('Jugar Nombra el dibujo'); await layout(page, 'mission-390');
    await click('¡Vamos a jugar!'); await layout(page, 'naming-390');
    await page.screenshot({ path: `${out}/naming-390.png`, fullPage: true });
    await click('Pulsar para hablar'); await page.getByRole('button', { name: 'Terminar grabación', exact: true }).waitFor();
    await page.screenshot({ path: `${out}/recording-390.png`, fullPage: true });
    await page.waitForTimeout(1300); await click('Terminar grabación'); await page.getByText('«otra palabra»', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Continuar', exact: true }).count(), 0);
    await page.locator('audio').evaluate(async audio => { await audio.play(); audio.pause(); });
    cases.push('real MediaRecorder fake stream, playback and mismatch does not complete');
    for (let i = 0; i < 3; i++) {
      await click(i === 0 ? 'Grabar otra vez' : 'Pulsar para hablar');
      await page.getByRole('button', { name: 'Terminar grabación', exact: true }).waitFor();
      await page.waitForTimeout(1300); await click('Terminar grabación');
      await page.getByRole('button', { name: '¡Ya dije la palabra!', exact: true }).waitFor();
      await layout(page, `result-${i}-390`);
      if (i === 0) {
        await page.screenshot({ path: `${out}/recognized-390.png`, fullPage: true });
        for (const width of [320, 768, 1366]) {
          await page.setViewportSize({ width, height: 1000 }); await layout(page, `result-${width}`);
        }
        await page.setViewportSize({ width: 390, height: 1000 });
      }
      await click('¡Ya dije la palabra!'); await click(i === 2 ? 'Terminar juego' : 'Continuar');
    }
    await page.getByRole('region', { name: 'Juego completado' }).waitFor();
    cases.push('three rounds completed, no patient/level/attempt fields in multipart');
    await click('Elegir otro juego'); await open();
    await click('Pulsar para hablar'); await page.getByRole('button', { name: 'Terminar grabación', exact: true }).waitFor();
    await page.getByLabel('Hijo o hija').selectOption('902');
    await click('Abrir La Isla de las Palabras');
    assert.ok(await page.getByText('Una selección para tus 8 años', { exact: false }).count());
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 8);
    assert.equal(await page.getByRole('button', { name: 'Jugar La merienda de la isla', exact: true }).count(), 0);
    assert.ok(await page.getByRole('button', { name: 'Jugar El tren de las frases', exact: true }).count());
    assert.ok(await page.evaluate(() => window.__tracks.every(track => track.readyState === 'ended')));
    assert.ok(await page.getByText('0/8 aventuras', { exact: true }).count());
    cases.push('child switch stops microphone, clears visit and changes age selection');
    await page.getByLabel('Hijo o hija').selectOption('903'); await click('Abrir La Isla de las Palabras');
    assert.ok(await page.getByText('Una selección para tus 6 años', { exact: false }).count());
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 8);
    await page.getByText('Para la familia', { exact: true }).click(); await click('Explorar los 11 juegos en familia');
    assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 11);
    await click('Volver a mis ocho juegos'); assert.equal(await page.getByRole('button', { name: /^Jugar / }).count(), 8);
    cases.push('age 6 selection and family catalogue toggle');
    await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('denied', 'NotAllowedError'); }; });
    await open(); await click('Pulsar para hablar'); await page.getByText(/El micrófono no tiene permiso/).waitFor();
    await layout(page, 'denied-390'); await page.screenshot({ path: `${out}/permission-390.png`, fullPage: true });
    for (const word of ['Gato', 'Casa', 'Pelota']) {
      await click('Seguir con imágenes'); await click(word); await click(word === 'Pelota' ? 'Terminar juego' : 'Continuar');
    }
    await page.getByRole('region', { name: 'Juego completado' }).waitFor();
    cases.push('denied permission; all three image rounds complete');
    await click('Elegir otro juego');
    await page.getByRole('button', { name: /^Un poquito más/ }).click();
    await click('Jugar Nombra el dibujo');
    await page.getByRole('button', { name: '¡Vamos a jugar!', exact: true }).focus();
    await page.keyboard.press('Enter');
    for (const word of ['Mariposa', 'Zanahoria', 'Caracol']) {
      await click('Seguir con imágenes'); await click(word); await click(word === 'Caracol' ? 'Terminar juego' : 'Continuar');
    }
    await page.getByRole('region', { name: 'Juego completado' }).waitFor();
    cases.push('challenge vocabulary, keyboard start and three image rounds');
    assert.deepEqual(errors, []);
    assert.deepEqual(requests.filter(req => req.method !== 'GET' && !req.path.endsWith('/voz/transcribir')), []);
    fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify({ cases, layouts, errors, requests, limits: 'Synthetic API. Fake microphone. No real recognition, clinical accuracy or remote deployment certified.' }, null, 2));
    console.log(`PASS ${cases.length} browser cases; ${layouts.length} layouts; zero JS errors or persistent API writes`);
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });

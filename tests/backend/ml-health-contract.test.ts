import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clinicaService } from '../../backend/dist/modules/clinica/services/clinica.service.js';

const validHealth = {
  status: 'online',
  service: 'AshaKids Phonetic Speech & Treatment AI',
  dispositivo: 'cpu',
  modelo: 'jonatasgrosman/wav2vec2-large-xlsr-53-spanish',
  modelo_listo: true,
  predictor_listo: false,
};

async function withHealthResponse(payload: Record<string, unknown>, callback: () => Promise<void>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
  try {
    await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('ML health exposes the pinned revision and stays compatible with an older service', async (t) => {
  await t.test('returns the revision to an administrator', async () => {
    const revision = '96d7e9b4e4a78af515a3c6d3cee7c0826045d276';
    await withHealthResponse({ ...validHealth, modelo_revision: revision }, async () => {
      const result = await clinicaService.getMlServiceHealth({ rol: 'ADMIN' } as never);
      assert.equal(result.modelo_revision, revision);
      assert.equal(result.modelo_listo, true);
    });
  });

  await t.test('normalizes a missing revision from an older service', async () => {
    await withHealthResponse(validHealth, async () => {
      const result = await clinicaService.getMlServiceHealth({ rol: 'ADMIN' } as never);
      assert.equal(result.modelo_revision, '');
    });
  });

  await t.test('keeps technical health restricted to admins', async () => {
    await assert.rejects(
      clinicaService.getMlServiceHealth({ rol: 'TERAPEUTA' } as never),
      (error: unknown) => typeof error === 'object' && error !== null && 'status' in error && error.status === 403,
    );
  });
});

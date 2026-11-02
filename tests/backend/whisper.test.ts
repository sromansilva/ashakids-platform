import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { settings } from '../../backend/dist/core/config.js';
import { TranscriptionUnavailableError, WhisperService } from '../../backend/dist/modules/mundo_asha/services/whisper.service.js';

describe('Whisper transcription service', () => {
  it('uses a returned transcript without inventing a pronunciation score', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnabled = settings.ML_SERVICE_ENABLED;
    let requestPath = '';
    let requestBody: FormData | null = null;
    settings.ML_SERVICE_ENABLED = true;
    globalThis.fetch = async (input, init) => {
      requestPath = new URL(String(input)).pathname;
      requestBody = init?.body instanceof FormData ? init.body : null;
      return new Response(JSON.stringify({ transcripcion: ' pelota ' }), { status: 200 });
    };

    try {
      const service = new WhisperService();
      const result = await service.evaluarPronunciacion('UklGRiQAAABXQVZFZm10IBAAAAABAAEA', 'pelota');
      assert.equal(result.transcripcion, 'pelota');
      assert.equal(result.palabra_esperada, 'pelota');
      assert.equal(result.requiere_revision, true);
      assert.match(result.mensaje, /no evalúa|debe revisarla/i);
      assert.equal(requestPath, '/predict/file');
      assert.ok(requestBody?.get('file') instanceof Blob);
      assert.equal('reconocido' in result, false);
      assert.equal('similitud' in result, false);
      assert.equal('diagnostico_clinico' in result, false);
    } finally {
      globalThis.fetch = originalFetch;
      settings.ML_SERVICE_ENABLED = originalEnabled;
    }
  });

  it('keeps audio on the local Wav2Vec service when transcription is unavailable', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnabled = settings.ML_SERVICE_ENABLED;
    const requestHosts: string[] = [];
    settings.ML_SERVICE_ENABLED = true;
    globalThis.fetch = async (input) => {
      requestHosts.push(new URL(String(input)).host);
      return new Response('unavailable', { status: 503 });
    };

    try {
      const service = new WhisperService();
      await assert.rejects(
        service.evaluarPronunciacion('UklGRiQAAABXQVZFZm10IBAAAAABAAEA', 'manzana'),
        TranscriptionUnavailableError,
      );
      assert.deepEqual(requestHosts, ['127.0.0.1:8001']);
    } finally {
      globalThis.fetch = originalFetch;
      settings.ML_SERVICE_ENABLED = originalEnabled;
    }
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { settings } from '../../backend/dist/core/config.js';
import { TranscriptionUnavailableError, WhisperService } from '../../backend/dist/modules/mundo_asha/services/whisper.service.js';

describe('Whisper transcription service', () => {
  it('uses a returned transcript without inventing a pronunciation score', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnabled = settings.ML_SERVICE_ENABLED;
    settings.ML_SERVICE_ENABLED = true;
    globalThis.fetch = async (input, init) => {
      assert.equal(new URL(String(input)).pathname, '/predict/phonetics');
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(Object.keys(body), ['audio_base64']);
      return new Response(JSON.stringify({ transcripcion: ' pelota ' }), { status: 200 });
    };

    try {
      const service = new WhisperService();
      const result = await service.evaluarPronunciacion('UklGRiQAAABXQVZFZm10IBAAAAABAAEA', 'pelota');
      assert.equal(result.transcripcion, 'pelota');
      assert.equal(result.palabra_esperada, 'pelota');
      assert.equal(result.requiere_revision, true);
      assert.match(result.mensaje, /no evalúa|debe revisarla/i);
      assert.equal('reconocido' in result, false);
      assert.equal('similitud' in result, false);
      assert.equal('diagnostico_clinico' in result, false);
    } finally {
      globalThis.fetch = originalFetch;
      settings.ML_SERVICE_ENABLED = originalEnabled;
    }
  });

  it('does not substitute the expected word when transcription providers fail', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnabled = settings.ML_SERVICE_ENABLED;
    const originalKey = settings.OPENAI_API_KEY;
    settings.ML_SERVICE_ENABLED = true;
    settings.OPENAI_API_KEY = '';
    globalThis.fetch = async () => new Response('unavailable', { status: 503 });

    try {
      const service = new WhisperService();
      await assert.rejects(
        service.evaluarPronunciacion('UklGRiQAAABXQVZFZm10IBAAAAABAAEA', 'manzana'),
        TranscriptionUnavailableError,
      );
    } finally {
      globalThis.fetch = originalFetch;
      settings.ML_SERVICE_ENABLED = originalEnabled;
      settings.OPENAI_API_KEY = originalKey;
    }
  });
});

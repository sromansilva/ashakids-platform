import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { settings } from '../../backend/dist/core/config.js';
import { TranscriptionUnavailableError, SpeechTranscriptionService } from '../../backend/dist/modules/mundo_asha/services/speech-transcription.service.js';

describe('Wav2Vec transcription service', () => {
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
      const service = new SpeechTranscriptionService();
      const result = await service.transcribirAudio('UklGRiQAAABXQVZFZm10IBAAAAABAAEA', 'audio/wav');
      assert.deepEqual(result, { texto: 'pelota', motor: 'wav2vec2-transcription' });
      assert.equal(requestPath, '/predict/file');
      assert.ok(requestBody?.get('file') instanceof Blob);
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
      const service = new SpeechTranscriptionService();
      await assert.rejects(
        service.transcribirAudio('UklGRiQAAABXQVZFZm10IBAAAAABAAEA', 'audio/wav'),
        TranscriptionUnavailableError,
      );
      assert.deepEqual(requestHosts, ['127.0.0.1:8001']);
    } finally {
      globalThis.fetch = originalFetch;
      settings.ML_SERVICE_ENABLED = originalEnabled;
    }
  });
});

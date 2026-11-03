import { settings } from '../../../core/config.js';

export type SpeechTranscriptionEngine = 'wav2vec2-transcription';

export interface SpeechTranscription {
  texto: string;
  motor: SpeechTranscriptionEngine;
}

export class TranscriptionUnavailableError extends Error {
  constructor(message = 'El servicio de transcripción no está disponible.') {
    super(message);
    this.name = 'TranscriptionUnavailableError';
  }
}

export class SpeechTranscriptionService {
  async transcribirAudio(audio: Buffer | string, mimeType = 'audio/wav'): Promise<SpeechTranscription> {
    const ownsBuffer = !Buffer.isBuffer(audio);
    let audioBuffer: Buffer;
    if (Buffer.isBuffer(audio)) {
      audioBuffer = audio;
    } else {
      const rawBase64 = audio.replace(/^data:audio\/[^;]+;base64,/, '');
      if (!rawBase64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(rawBase64)) {
        throw new Error('El audio no tiene un formato base64 válido.');
      }
      audioBuffer = Buffer.from(rawBase64, 'base64');
    }
    if (!audioBuffer.length) throw new Error('El audio está vacío.');
    try {
      const audioBlob = new Blob([audioBuffer], { type: mimeType });

      if (settings.ML_SERVICE_ENABLED && settings.ML_SERVICE_URL) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, mimeType.includes('wav') ? 'audio.wav' : 'audio.webm');
          const response = await fetch(new URL('/predict/file', settings.ML_SERVICE_URL), {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });

          if (response.ok) {
            const data = (await response.json()) as { transcripcion?: unknown };
            if (typeof data.transcripcion === 'string' && data.transcripcion.trim()) {
              return { texto: data.transcripcion.trim(), motor: 'wav2vec2-transcription' };
            }
          }
        } catch {
          // Keep the sample on the configured local Wav2Vec service only.
        } finally {
          clearTimeout(timeout);
        }
      }

      throw new TranscriptionUnavailableError();
    } finally {
      if (ownsBuffer) audioBuffer.fill(0);
    }
  }
}

export const speechTranscriptionService = new SpeechTranscriptionService();

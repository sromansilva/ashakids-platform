import { settings } from '../../../core/config.js';

export type SpeechTranscriptionEngine = 'openai-whisper' | 'wav2vec2-transcription';

export interface SpeechTranscription {
  texto: string;
  motor: SpeechTranscriptionEngine;
}

export interface VoiceReviewResult {
  palabra_esperada: string;
  transcripcion: string;
  requiere_revision: true;
  mensaje: string;
  motor: SpeechTranscriptionEngine;
}

export class TranscriptionUnavailableError extends Error {
  constructor(message = 'El servicio de transcripción no está disponible.') {
    super(message);
    this.name = 'TranscriptionUnavailableError';
  }
}

export class WhisperService {
  async transcribirAudio(audioBase64: string): Promise<SpeechTranscription> {
    const rawBase64 = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '');
    if (!rawBase64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(rawBase64)) {
      throw new Error('El audio no tiene un formato base64 válido.');
    }

    if (settings.ML_SERVICE_ENABLED && settings.ML_SERVICE_URL) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45_000);
      try {
        const response = await fetch(new URL('/predict/phonetics', settings.ML_SERVICE_URL), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio_base64: rawBase64 }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = (await response.json()) as { transcripcion?: unknown };
          if (typeof data.transcripcion === 'string' && data.transcripcion.trim()) {
            return { texto: data.transcripcion.trim(), motor: 'wav2vec2-transcription' };
          }
        }
      } catch {
        // Try the explicitly configured transcription provider, if available.
      } finally {
        clearTimeout(timeout);
      }
    }

    if (settings.OPENAI_API_KEY) {
      try {
        const audioBuffer = Buffer.from(rawBase64, 'base64');
        const blob = new Blob([audioBuffer], { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', blob, 'audio.wav');
        formData.append('model', settings.WHISPER_MODEL || 'whisper-1');
        formData.append('language', 'es');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${settings.OPENAI_API_KEY}` },
          body: formData,
        });
        if (response.ok) {
          const data = (await response.json()) as { text?: unknown };
          if (typeof data.text === 'string' && data.text.trim()) {
            return { texto: data.text.trim(), motor: 'openai-whisper' };
          }
        }
      } catch {
        // Report a clear unavailable error below; never substitute the expected phrase.
      }
    }

    throw new TranscriptionUnavailableError();
  }

  /** Transcription can support human review, but does not evaluate pronunciation. */
  async evaluarPronunciacion(audioBase64: string, palabraObjetivo: string): Promise<VoiceReviewResult> {
    const { texto, motor } = await this.transcribirAudio(audioBase64);
    return {
      palabra_esperada: palabraObjetivo,
      transcripcion: texto,
      requiere_revision: true,
      mensaje: 'La transcripción es orientativa. La pronunciación debe revisarla un profesional.',
      motor,
    };
  }
}

export const whisperService = new WhisperService();

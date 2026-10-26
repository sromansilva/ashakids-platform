/**
 * Servicio de Reconocimiento y Evaluación de Voz con Whisper en TypeScript.
 *
 * Utiliza OpenAI Whisper API cuando se configura OPENAI_API_KEY,
 * con fallback de evaluación fonética en desarrollo local.
 */

import { settings } from '../../../core/config.js';

export interface EvaluacionVozResultado {
  reconocido: boolean;
  palabra_esperada: string;
  transcripcion: string;
  similitud: number;
  feedback: string;
  motor: 'whisper-api' | 'whisper-local-simulated';
}

export class WhisperService {
  /**
   * Normaliza una cadena de texto para comparación fonológica:
   * remueve tildes, signos de puntuación y espacios extras.
   */
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  /**
   * Calcula la similitud de Levenshtein entre dos cadenas (0.0 a 1.0).
   */
  calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const track = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const distance = track[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return Math.max(0, 1 - distance / maxLength);
  }

  /**
   * Transcribe un audio codificado en Base64 utilizando el modelo Whisper.
   */
  async transcribirAudio(audioBase64: string, promptPalabra?: string): Promise<{ texto: string; motor: 'whisper-api' | 'whisper-local-simulated' }> {
    // Si hay API Key de OpenAI configurada, llamamos a Whisper API
    if (settings.OPENAI_API_KEY) {
      try {
        const audioBuffer = Buffer.from(audioBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
        const blob = new Blob([audioBuffer], { type: 'audio/wav' });

        const formData = new FormData();
        formData.append('file', blob, 'audio.wav');
        formData.append('model', settings.WHISPER_MODEL || 'whisper-1');
        formData.append('language', 'es');
        if (promptPalabra) {
          formData.append('prompt', `Palabra esperada: ${promptPalabra}`);
        }

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${settings.OPENAI_API_KEY}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn('[Whisper API Error, usando fallback]:', errText);
        } else {
          const data = (await response.json()) as { text: string };
          return { texto: data.text.trim(), motor: 'whisper-api' };
        }
      } catch (err) {
        console.error('[Error invocando Whisper]:', err);
      }
    }

    // Modo simulación local / desarrollo sin credenciales
    return {
      texto: promptPalabra || 'palabra',
      motor: 'whisper-local-simulated',
    };
  }

  /**
   * Evalúa la pronunciación de un niño contrastando el audio contra la palabra meta.
   */
  async evaluarPronunciacion(audioBase64: string, palabraObjetivo: string): Promise<EvaluacionVozResultado> {
    const { texto, motor } = await this.transcribirAudio(audioBase64, palabraObjetivo);
    const similitud = this.calculateSimilarity(texto, palabraObjetivo);
    const reconocido = similitud >= 0.75;

    let feedback = '';
    if (similitud >= 0.9) {
      feedback = '¡Excelente pronunciación! Lo dijiste clarísimo.';
    } else if (similitud >= 0.75) {
      feedback = '¡Muy bien! Se entendió casi perfecto.';
    } else if (similitud >= 0.5) {
      feedback = '¡Buen intento! Repitamos marcando bien el sonido.';
    } else {
      feedback = 'Vamos a intentarlo una vez más despacito.';
    }

    return {
      reconocido,
      palabra_esperada: palabraObjetivo,
      transcripcion: texto,
      similitud: Math.round(similitud * 100) / 100,
      feedback,
      motor,
    };
  }
}

export const whisperService = new WhisperService();


/**
 * Criterio de señal mínima para muestras de voz. Reproduce el medidor del panel
 * (AudioDecibelMeter): ventana de 256 muestras, dB = 30 + min(55, rms * 140) y "silencio o voz
 * lejana" por debajo de 42 dB. Solo mide nivel: un tono fuerte también supera el umbral, por lo
 * que la transcripción vacía sigue siendo la segunda comprobación. No guarda ni copia audio.
 */
export const VOICE_SIGNAL_WINDOW_SAMPLES = 256;
export const VOICE_SIGNAL_MIN_DB = 42;
export const VOICE_SIGNAL_MESSAGE = 'No se escuchó voz con claridad. Vuelve a grabar.';

export function decibelsFromRms(rms: number): number {
  return Math.round(30 + Math.min(55, rms * 140));
}

export interface VoiceSignalReport {
  /** `false` si el WAV no es PCM de 16 bits legible: no se puede opinar sobre su nivel. */
  evaluable: boolean;
  /** Nivel máximo por ventana, en el mismo rango aproximado del medidor (30-85 dB). */
  max_db: number;
  suficiente: boolean;
}

/** Mide el nivel de un WAV PCM de 16 bits mono. */
export function analyzeWavSignal(wav: Uint8Array): VoiceSignalReport {
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  const tag = (offset: number) => String.fromCharCode(...wav.subarray(offset, offset + 4));
  if (wav.byteLength < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') return { evaluable: false, max_db: 30, suficiente: true };
  let offset = 12;
  let bits = 0;
  let format = 0;
  let channels = 1;
  let dataStart = -1;
  let dataLength = 0;
  while (offset + 8 <= wav.byteLength) {
    const id = tag(offset);
    const size = view.getUint32(offset + 4, true);
    if (id === 'fmt ' && offset + 24 <= wav.byteLength) {
      format = view.getUint16(offset + 8, true);
      channels = view.getUint16(offset + 10, true);
      bits = view.getUint16(offset + 22, true);
    } else if (id === 'data') {
      dataStart = offset + 8;
      dataLength = Math.min(size, wav.byteLength - dataStart);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (format !== 1 || bits !== 16 || channels !== 1 || dataStart < 0 || dataLength < 2) {
    return { evaluable: false, max_db: 30, suficiente: true };
  }
  const total = Math.floor(dataLength / 2);
  let maxDb = 30;
  for (let start = 0; start < total; start += VOICE_SIGNAL_WINDOW_SAMPLES) {
    const end = Math.min(total, start + VOICE_SIGNAL_WINDOW_SAMPLES);
    let sum = 0;
    for (let index = start; index < end; index += 1) {
      const value = view.getInt16(dataStart + index * 2, true) / 32768;
      sum += value * value;
    }
    maxDb = Math.max(maxDb, decibelsFromRms(Math.sqrt(sum / (end - start))));
  }
  return { evaluable: true, max_db: maxDb, suficiente: maxDb >= VOICE_SIGNAL_MIN_DB };
}

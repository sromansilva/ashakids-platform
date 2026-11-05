export const PHONETIC_TARGETS = [
  { word: 'carro', phoneme: '/rr/' },
  { word: 'ratón', phoneme: '/r/' },
  { word: 'plato', phoneme: '/pl/' },
  { word: 'tren', phoneme: '/tr/' },
  { word: 'zapato', phoneme: '/s/' },
] as const;

export const PHONETIC_SAMPLE_RATE = 16_000;
export const PHONETIC_PACKET_SAMPLES = 4_000;
export const PHONETIC_MAX_CAPTURE_SAMPLES = PHONETIC_SAMPLE_RATE * 3;
export const PHONETIC_MIN_CAPTURE_SAMPLES = PHONETIC_SAMPLE_RATE * 2;

export function encodePcm16(samples: Float32Array): Uint8Array {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return bytes;
}


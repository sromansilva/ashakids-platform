/**
 * Criterio de señal mínima de voz, compartido con el medidor de nivel (AudioDecibelMeter):
 * dB aproximados = 30 + min(55, rms * 140); por debajo de 42 dB se considera «silencio o voz
 * lejana». El servidor aplica el mismo criterio al WAV recibido (voice-signal.ts del backend).
 */
export const VOICE_MIN_DB = 42;
export const VOICE_WINDOW_SAMPLES = 256;
export const NO_VOICE_MESSAGE = 'No se escuchó voz con claridad. Vuelve a grabar.';

export const decibelsFromRms = (rms: number): number => Math.round(30 + Math.min(55, rms * 140));

/** Acumula el nivel máximo por ventana de 256 muestras sin conservar el audio. */
export class VoiceLevelTracker {
  private maxDb = 30;
  private sum = 0;
  private count = 0;

  push(samples: Float32Array): void {
    for (let index = 0; index < samples.length; index += 1) {
      this.sum += samples[index] * samples[index];
      this.count += 1;
      if (this.count === VOICE_WINDOW_SAMPLES) this.flush();
    }
  }

  private flush(): void {
    if (this.count === 0) return;
    this.maxDb = Math.max(this.maxDb, decibelsFromRms(Math.sqrt(this.sum / this.count)));
    this.sum = 0;
    this.count = 0;
  }

  get peakDb(): number {
    this.flush();
    return this.maxDb;
  }

  get hasVoice(): boolean {
    return this.peakDb >= VOICE_MIN_DB;
  }

  reset(): void {
    this.maxDb = 30;
    this.sum = 0;
    this.count = 0;
  }
}

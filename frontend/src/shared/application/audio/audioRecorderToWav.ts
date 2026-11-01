/**
 * Utilidad de conversión de audio grabada en navegador a formato WAV PCM 16kHz Mono.
 * Garantiza compatibilidad 100% directa con el microservicio de Deep Learning (Wav2Vec 2.0 / SoundFile).
 */

export async function convertBlobTo16kHzWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();

  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const targetSampleRate = 16000;

    // Crear buffer remuestreado a 16kHz
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * targetSampleRate), targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const monoChannel = renderedBuffer.getChannelData(0);

    const wavArrayBuffer = encodeWavPcm16(monoChannel, targetSampleRate);
    return new Blob([wavArrayBuffer], { type: 'audio/wav' });
  } finally {
    try {
      await audioCtx.close();
    } catch {
      /* noop */
    }
  }
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF chunk descriptor */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  /* FMT sub-chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // 16 for PCM
  view.setUint16(20, 1, true); // Linear quantization (PCM)
  view.setUint16(22, 1, true); // Mono (1 channel)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate: sampleRate * numChannels * bitsPerSample / 8
  view.setUint16(32, 2, true); // Block align: numChannels * bitsPerSample / 8
  view.setUint16(34, 16, true); // Bits per sample

  /* DATA sub-chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Escribir muestras a 16-bit PCM (clipping -1.0 a 1.0)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}


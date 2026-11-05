export const PHONETIC_PACKET_SAMPLES = 4_000;
export const PHONETIC_SAMPLE_RATE = 16_000;
export const PHONETIC_MIN_SAMPLES = 32_000;
export const PHONETIC_MAX_SAMPLES = 48_000;
export const PHONETIC_MAX_PACKETS = 12;
export const PHONETIC_CAPTURE_TTL_MS = 30_000;

export interface PhoneticCaptureMetadata {
  id_sesion: number;
  id_usuario: number;
  captura_id: string;
  palabra_objetivo: string;
  fonema_objetivo: string;
}

interface StoredCapture extends PhoneticCaptureMetadata {
  next_packet: number;
  total_samples: number;
  packets: Buffer[];
  expires: ReturnType<typeof setTimeout>;
}

export interface CompletedPhoneticCapture extends PhoneticCaptureMetadata {
  pcm: Buffer;
  total_samples: number;
}

export interface FamilyCaptureResult {
  id_evaluacion: number;
  estado: 'PENDIENTE_REVISION';
  palabra_esperada: string;
  transcripcion_tentativa: string;
  duracion_segundos: number | null;
  aviso: string;
}

export interface FamilyCaptureMetadata extends PhoneticCaptureMetadata {
  estado: 'SOLICITADA' | 'EN_CAPTURA' | 'PROCESANDO' | 'COMPLETADA';
  id_usuario_familia: number | null;
  resultado?: FamilyCaptureResult;
}

interface StoredFamilyCapture extends PhoneticCaptureMetadata {
  estado: FamilyCaptureMetadata['estado'];
  id_usuario_familia: number | null;
  next_packet: number;
  total_samples: number;
  packets: Buffer[];
  resultado?: FamilyCaptureResult;
  expires: ReturnType<typeof setTimeout>;
}

const FAMILY_REQUEST_TTL_MS = 5 * 60_000;
const FAMILY_RESULT_TTL_MS = 30 * 60_000;

function captureError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export class PhoneticCaptureStore {
  private readonly captures = new Map<string, StoredCapture>();

  private key(sessionId: number, userId: number, captureId: string) {
    return `${sessionId}:${userId}:${captureId}`;
  }

  private clearEntry(key: string) {
    const capture = this.captures.get(key);
    if (!capture) return;
    clearTimeout(capture.expires);
    for (const packet of capture.packets) packet.fill(0);
    capture.packets = [];
    capture.total_samples = 0;
    this.captures.delete(key);
  }

  private refreshExpiry(key: string, capture: StoredCapture) {
    clearTimeout(capture.expires);
    capture.expires = setTimeout(() => this.clearEntry(key), PHONETIC_CAPTURE_TTL_MS);
    capture.expires.unref?.();
  }

  create(metadata: PhoneticCaptureMetadata) {
    const { id_sesion, id_usuario, captura_id, palabra_objetivo, fonema_objetivo } = metadata;
    if (!Number.isInteger(id_sesion) || id_sesion <= 0 || !Number.isInteger(id_usuario) || id_usuario <= 0 || !isUuid(captura_id)) {
      throw captureError('La sesión o el identificador de captura no son válidos.', 400);
    }
    const key = this.key(id_sesion, id_usuario, captura_id);
    if (this.captures.has(key)) throw captureError('La captura ya está activa.', 409);
    if ([...this.captures.values()].some((capture) => capture.id_sesion === id_sesion && capture.id_usuario === id_usuario)) {
      throw captureError('Ya existe una captura activa para esta sesión.', 409);
    }
    const capture: StoredCapture = {
      ...metadata,
      next_packet: 0,
      total_samples: 0,
      packets: [],
      expires: setTimeout(() => this.clearEntry(key), PHONETIC_CAPTURE_TTL_MS),
    };
    capture.expires.unref?.();
    this.captures.set(key, capture);
    return { captura_id, paquetes_recibidos: 0 };
  }

  append(sessionId: number, userId: number, captureId: string, packetNumber: number, rawPcm: Buffer) {
    const key = this.key(sessionId, userId, captureId);
    const capture = this.captures.get(key);
    if (!capture) throw captureError('La captura expiró o ya fue cerrada.', 404);
    if (!Number.isInteger(packetNumber) || packetNumber !== capture.next_packet) {
      throw captureError('Los paquetes llegaron fuera de secuencia.', 409);
    }
    if (packetNumber >= PHONETIC_MAX_PACKETS || !rawPcm.length || rawPcm.length > PHONETIC_PACKET_SAMPLES * 2 || rawPcm.length % 2 !== 0) {
      this.clearEntry(key);
      throw captureError('El paquete PCM no tiene un tamaño válido.', 413);
    }
    const samples = rawPcm.length / 2;
    if (capture.total_samples + samples > PHONETIC_MAX_SAMPLES) {
      this.clearEntry(key);
      throw captureError('La captura excede el máximo de 3 segundos.', 413);
    }
    capture.packets.push(Buffer.from(rawPcm));
    capture.total_samples += samples;
    capture.next_packet += 1;
    this.refreshExpiry(key, capture);
    return { captura_id: captureId, paquetes_recibidos: capture.next_packet };
  }

  take(sessionId: number, userId: number, captureId: string): CompletedPhoneticCapture {
    const key = this.key(sessionId, userId, captureId);
    const capture = this.captures.get(key);
    if (!capture) throw captureError('La captura expiró o ya fue cerrada.', 404);
    if (capture.total_samples < PHONETIC_MIN_SAMPLES || capture.total_samples > PHONETIC_MAX_SAMPLES) {
      this.clearEntry(key);
      throw captureError('La muestra debe durar entre 2 y 3 segundos.', 422);
    }
    const completed = {
      id_sesion: capture.id_sesion,
      id_usuario: capture.id_usuario,
      captura_id: capture.captura_id,
      palabra_objetivo: capture.palabra_objetivo,
      fonema_objetivo: capture.fonema_objetivo,
      pcm: Buffer.concat(capture.packets),
      total_samples: capture.total_samples,
    };
    this.clearEntry(key);
    return completed;
  }

  discard(sessionId: number, userId: number, captureId: string) {
    this.clearEntry(this.key(sessionId, userId, captureId));
    return { captura_id: captureId, descartada: true };
  }

  discardSession(sessionId: number) {
    let discarded = 0;
    for (const [key, capture] of this.captures) {
      if (capture.id_sesion !== sessionId) continue;
      this.clearEntry(key);
      discarded += 1;
    }
    return discarded;
  }
}

/** Short lived handoff: therapist chooses the word; the family device records it. */
export class FamilyPhoneticCaptureStore {
  private readonly captures = new Map<string, StoredFamilyCapture>();

  private key(sessionId: number, captureId: string) {
    return `${sessionId}:${captureId}`;
  }

  private clearEntry(key: string) {
    const capture = this.captures.get(key);
    if (!capture) return;
    clearTimeout(capture.expires);
    for (const packet of capture.packets) packet.fill(0);
    capture.packets = [];
    capture.total_samples = 0;
    if (capture.resultado) capture.resultado = undefined;
    this.captures.delete(key);
  }

  private refreshExpiry(key: string, capture: StoredFamilyCapture, duration = FAMILY_REQUEST_TTL_MS) {
    clearTimeout(capture.expires);
    capture.expires = setTimeout(() => this.clearEntry(key), duration);
    capture.expires.unref?.();
  }

  create(metadata: PhoneticCaptureMetadata) {
    if (!Number.isInteger(metadata.id_sesion) || metadata.id_sesion <= 0 ||
        !Number.isInteger(metadata.id_usuario) || metadata.id_usuario <= 0 || !isUuid(metadata.captura_id)) {
      throw captureError('La sesión o el identificador de captura no son válidos.', 400);
    }
    const key = this.key(metadata.id_sesion, metadata.captura_id);
    if (this.captures.has(key) || [...this.captures.values()].some((capture) => capture.id_sesion === metadata.id_sesion && capture.estado !== 'COMPLETADA')) {
      throw captureError('Ya existe una solicitud de muestra activa para esta sesión.', 409);
    }
    const capture: StoredFamilyCapture = {
      ...metadata,
      estado: 'SOLICITADA',
      id_usuario_familia: null,
      next_packet: 0,
      total_samples: 0,
      packets: [],
      expires: setTimeout(() => this.clearEntry(key), FAMILY_REQUEST_TTL_MS),
    };
    capture.expires.unref?.();
    this.captures.set(key, capture);
    return this.publicMetadata(capture);
  }

  private publicMetadata(capture: StoredFamilyCapture): FamilyCaptureMetadata {
    return {
      id_sesion: capture.id_sesion,
      id_usuario: capture.id_usuario,
      captura_id: capture.captura_id,
      palabra_objetivo: capture.palabra_objetivo,
      fonema_objetivo: capture.fonema_objetivo,
      estado: capture.estado,
      id_usuario_familia: capture.id_usuario_familia,
      ...(capture.resultado ? { resultado: { ...capture.resultado } } : {}),
    };
  }

  pending(sessionId: number, familyUserId: number) {
    const capture = [...this.captures.values()].find((item) => item.id_sesion === sessionId && item.estado !== 'COMPLETADA');
    if (!capture) return null;
    if (capture.estado === 'EN_CAPTURA' && capture.id_usuario_familia !== familyUserId) {
      return { estado: 'OCUPADA' as const };
    }
    return this.publicMetadata(capture);
  }

  claim(sessionId: number, familyUserId: number, captureId: string) {
    const capture = this.captures.get(this.key(sessionId, captureId));
    if (!capture) throw captureError('La solicitud expiró o fue cancelada.', 404);
    if (capture.estado === 'EN_CAPTURA' && capture.id_usuario_familia === familyUserId) return this.publicMetadata(capture);
    if (capture.estado !== 'SOLICITADA') throw captureError('La muestra ya está en uso o fue enviada.', 409);
    capture.estado = 'EN_CAPTURA';
    capture.id_usuario_familia = familyUserId;
    this.refreshExpiry(this.key(sessionId, captureId), capture);
    return this.publicMetadata(capture);
  }

  append(sessionId: number, familyUserId: number, captureId: string, packetNumber: number, rawPcm: Buffer) {
    const key = this.key(sessionId, captureId);
    const capture = this.captures.get(key);
    if (!capture || capture.estado !== 'EN_CAPTURA' || capture.id_usuario_familia !== familyUserId) {
      throw captureError('La solicitud no está activa en esta cuenta familiar.', 404);
    }
    if (!Number.isInteger(packetNumber) || packetNumber !== capture.next_packet) throw captureError('Los paquetes llegaron fuera de secuencia.', 409);
    if (packetNumber >= PHONETIC_MAX_PACKETS || !rawPcm.length || rawPcm.length > PHONETIC_PACKET_SAMPLES * 2 || rawPcm.length % 2 !== 0) {
      this.clearEntry(key);
      throw captureError('El paquete PCM no tiene un tamaño válido.', 413);
    }
    const samples = rawPcm.length / 2;
    if (capture.total_samples + samples > PHONETIC_MAX_SAMPLES) {
      this.clearEntry(key);
      throw captureError('La captura excede el máximo de 3 segundos.', 413);
    }
    capture.packets.push(Buffer.from(rawPcm));
    capture.total_samples += samples;
    capture.next_packet += 1;
    this.refreshExpiry(key, capture);
    return { captura_id: captureId, paquetes_recibidos: capture.next_packet };
  }

  take(sessionId: number, familyUserId: number, captureId: string): CompletedPhoneticCapture {
    const key = this.key(sessionId, captureId);
    const capture = this.captures.get(key);
    if (!capture || capture.estado !== 'EN_CAPTURA' || capture.id_usuario_familia !== familyUserId) {
      throw captureError('La muestra expiró o no pertenece a esta cuenta familiar.', 404);
    }
    if (capture.total_samples < PHONETIC_MIN_SAMPLES || capture.total_samples > PHONETIC_MAX_SAMPLES) {
      this.clearEntry(key);
      throw captureError('La muestra debe durar entre 2 y 3 segundos.', 422);
    }
    const completed: CompletedPhoneticCapture = {
      id_sesion: capture.id_sesion,
      id_usuario: capture.id_usuario,
      captura_id: capture.captura_id,
      palabra_objetivo: capture.palabra_objetivo,
      fonema_objetivo: capture.fonema_objetivo,
      pcm: Buffer.concat(capture.packets),
      total_samples: capture.total_samples,
    };
    for (const packet of capture.packets) packet.fill(0);
    capture.packets = [];
    capture.total_samples = 0;
    capture.estado = 'PROCESANDO';
    this.refreshExpiry(key, capture);
    return completed;
  }

  /** Devuelve una captura en proceso a «solicitada» para que la familia pueda repetir la muestra. */
  reopen(sessionId: number, captureId: string, familyUserId: number) {
    const key = this.key(sessionId, captureId);
    const capture = this.captures.get(key);
    if (!capture || capture.estado !== 'PROCESANDO' || capture.id_usuario_familia !== familyUserId) return false;
    for (const packet of capture.packets) packet.fill(0);
    capture.packets = [];
    capture.total_samples = 0;
    capture.next_packet = 0;
    capture.estado = 'SOLICITADA';
    capture.id_usuario_familia = null;
    this.refreshExpiry(key, capture);
    return true;
  }

  complete(sessionId: number, captureId: string, result: FamilyCaptureResult) {
    const key = this.key(sessionId, captureId);
    const capture = this.captures.get(key);
    if (!capture || capture.estado !== 'PROCESANDO') return;
    capture.estado = 'COMPLETADA';
    capture.resultado = { ...result };
    this.refreshExpiry(key, capture, FAMILY_RESULT_TTL_MS);
  }

  result(sessionId: number, captureId: string) {
    const capture = this.captures.get(this.key(sessionId, captureId));
    if (!capture) throw captureError('La solicitud expiró o fue cancelada.', 404);
    return this.publicMetadata(capture);
  }

  discard(sessionId: number, captureId: string, familyUserId?: number) {
    const key = this.key(sessionId, captureId);
    const capture = this.captures.get(key);
    if (familyUserId !== undefined && capture && capture.id_usuario_familia !== null && capture.id_usuario_familia !== familyUserId) {
      throw captureError('La solicitud no pertenece a esta cuenta familiar.', 404);
    }
    this.clearEntry(key);
    return { captura_id: captureId, descartada: true };
  }

  discardSession(sessionId: number) {
    let discarded = 0;
    for (const [key, capture] of this.captures) {
      if (capture.id_sesion !== sessionId) continue;
      this.clearEntry(key);
      discarded += 1;
    }
    return discarded;
  }
}

export function pcm16MonoWav(pcm: Buffer, sampleRate = PHONETIC_SAMPLE_RATE) {
  if (!pcm.length || pcm.length % 2 !== 0) throw captureError('La muestra PCM no es válida.', 422);
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + pcm.length, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(pcm.length, 40);
  pcm.copy(wav, 44);
  return wav;
}

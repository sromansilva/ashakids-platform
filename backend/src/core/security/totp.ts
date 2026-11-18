import crypto from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Codifica un buffer binario a una cadena Base32 compatible con RFC 4648 (sin padding).
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]!;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodifica una cadena Base32 a un Buffer de bytes.
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]!);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Genera un secreto criptográfico aleatorio en formato Base32 (20 bytes = 160 bits, estándar RFC 6238).
 */
export function generateTotpSecret(byteLength = 20): string {
  const randomBytes = crypto.randomBytes(byteLength);
  return base32Encode(randomBytes);
}

/**
 * Genera el código de 6 dígitos para un instante de tiempo según RFC 6238 (HMAC-SHA1).
 */
export function generateTotpCode(
  secretBase32: string,
  timeStepSec = 30,
  windowOffset = 0,
  digits = 6
): string {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / timeStepSec) + windowOffset;

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;

  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  const modulo = 10 ** digits;

  return (binary % modulo).toString().padStart(digits, '0');
}

/**
 * Verifica si el código de 6 dígitos ingresado por el usuario es válido,
 * tolerando ±1 ventana de tiempo (±30 segundos) por desincronización de reloj.
 */
export function verifyTotpCode(
  secretBase32: string,
  token: string,
  window = 1,
  timeStepSec = 30
): boolean {
  const normalized = (token || '').trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;

  for (let offset = -window; offset <= window; offset++) {
    const candidate = generateTotpCode(secretBase32, timeStepSec, offset, 6);
    if (crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(normalized))) {
      return true;
    }
  }

  return false;
}

/**
 * Genera la URI universal `otpauth://` para que la lean Google Authenticator y Microsoft Authenticator.
 */
export function generateTotpUri(label: string, issuer: string, secretBase32: string): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedLabel = encodeURIComponent(label);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

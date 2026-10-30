import crypto from 'node:crypto';
import { settings } from '../config.js';

function getResetSecret(): string {
  return (
    (settings.DB_PASSWORD || '') +
    (settings.SESSION_COOKIE_NAME || 'ashakids') +
    'ashakids_password_reset_salt_2026'
  );
}

export interface ResetTokenPayload {
  id_usuario: number;
  codigo_usuario: string;
  exp: number; // timestamp in ms
  pwdFingerprint: string; // fingerprint of user's current password_hash
}

/**
 * Genera un token firmado HMAC-SHA256 para restablecer o crear contraseña.
 * Incluye un fingerprint del hash actual para invalidar el token automáticamente
 * en cuanto la contraseña sea actualizada (one-time use).
 */
export function createResetToken(
  userId: number,
  codigoUsuario: string,
  currentPasswordHash: string,
  expiresInHours: number = 2
): string {
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
  const pwdFingerprint = crypto
    .createHash('sha256')
    .update(currentPasswordHash || 'dummy')
    .digest('hex')
    .slice(0, 16);

  const payload: ResetTokenPayload = {
    id_usuario: userId,
    codigo_usuario: codigoUsuario,
    exp,
    pwdFingerprint,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getResetSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifica y valida el token de restablecimiento de contraseña.
 */
export function verifyResetToken(
  token: string,
  currentPasswordHash: string
): { valid: boolean; payload?: ResetTokenPayload; error?: string } {
  try {
    const parts = (token || '').trim().split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Formato de token de recuperación inválido.' };
    }

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', getResetSecret())
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'El enlace de recuperación ha sido alterado o no es válido.' };
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as ResetTokenPayload;

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'El enlace de recuperación ha expirado. Solicita uno nuevo.' };
    }

    const currentFingerprint = crypto
      .createHash('sha256')
      .update(currentPasswordHash || 'dummy')
      .digest('hex')
      .slice(0, 16);

    if (payload.pwdFingerprint !== currentFingerprint) {
      return { valid: false, error: 'Este enlace ya fue utilizado. Solicita uno nuevo si necesitas cambiar tu contraseña.' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'No se pudo validar el enlace de recuperación.' };
  }
}

/**
 * Decodifica de forma segura el payload del token sin validar la firma,
 * para poder identificar al usuario y consultar su hash actual en la BD.
 */
export function decodeResetTokenPayload(token: string): ResetTokenPayload | null {
  try {
    const parts = (token || '').trim().split('.');
    if (parts.length !== 2) return null;
    return JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf8')
    ) as ResetTokenPayload;
  } catch {
    return null;
  }
}


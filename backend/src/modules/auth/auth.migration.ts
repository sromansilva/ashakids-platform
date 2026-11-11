import { pool } from '../../core/database.js';

/**
 * Migración idempotente para la seguridad de autenticación:
 * Agrega control de intentos fallidos y bloqueo temporal a la tabla usuarios.
 */
export async function migrateAuthSecurity(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');
    await client.query(`
      ALTER TABLE public.usuarios
      ADD COLUMN IF NOT EXISTS intentos_fallidos integer DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS bloqueado_hasta timestamp with time zone,
      ADD COLUMN IF NOT EXISTS totp_secret character varying(64),
      ADD COLUMN IF NOT EXISTS totp_activado boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS totp_temp_secret character varying(64);
    `);
    await client.query('COMMIT;');
  } catch (err) {
    await client.query('ROLLBACK;').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

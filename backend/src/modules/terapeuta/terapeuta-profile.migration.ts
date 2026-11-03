import { pool } from '../../core/database.js';

/** Adds the optional contact and profile-photo fields to existing installations. */
export async function migrateTerapeutaProfile(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');
    await client.query(`
      ALTER TABLE public.terapeutas
        ADD COLUMN IF NOT EXISTS telefono character varying(20),
        ADD COLUMN IF NOT EXISTS cedula_profesional character varying(40),
        ADD COLUMN IF NOT EXISTS foto_perfil bytea,
        ADD COLUMN IF NOT EXISTS foto_perfil_mime character varying(30);
    `);
    await client.query('COMMIT;');
    console.log('[Migration] Therapist profile fields are ready.');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('[Migration] Therapist profile migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

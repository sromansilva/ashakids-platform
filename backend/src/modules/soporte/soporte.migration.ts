import { pool } from '../../core/database.js';

/** Idempotent, transactional migration following the existing bootstrap convention. */
export async function migrateSoporteSchema() {
  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT 1 FROM public.roles WHERE nombre_rol = 'SOPORTE_TECNICO' LIMIT 1;"
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return;
    }
    await client.query('BEGIN');
    await client.query(`
      INSERT INTO public.roles (nombre_rol, descripcion) VALUES ('SOPORTE_TECNICO', 'Atención de incidencias técnicas')
      ON CONFLICT (nombre_rol) DO NOTHING;
    `);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}


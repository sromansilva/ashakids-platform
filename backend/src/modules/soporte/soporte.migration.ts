import { pool } from '../../core/database.js';

/** Idempotent, transactional migration following the existing bootstrap convention. */
export async function migrateSoporteSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`ALTER TABLE public.roles ALTER COLUMN nombre_rol TYPE varchar(30);
      INSERT INTO public.roles (nombre_rol, descripcion) VALUES ('SOPORTE_TECNICO', 'Atención de incidencias técnicas')
      ON CONFLICT (nombre_rol) DO NOTHING;`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

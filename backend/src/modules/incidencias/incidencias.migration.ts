import { pool } from '../../core/database.js';

export async function migrateIncidencias() {
  console.log('[Migration] Starting incidencias schema migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');

    // 1. Add columns if not exist
    await client.query(`
      ALTER TABLE public.incidencias 
      ADD COLUMN IF NOT EXISTS id_terapeuta integer,
      ADD COLUMN IF NOT EXISTS area_destino character varying(50) DEFAULT 'ADMINISTRACION' NOT NULL,
      ADD COLUMN IF NOT EXISTS fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
      ADD COLUMN IF NOT EXISTS es_prueba boolean DEFAULT false NOT NULL;
    `);

    // 2. Add FK for id_terapeuta if not exist
    const fkCheck = await client.query(`
      SELECT conname FROM pg_constraint WHERE conname = 'incidencias_id_terapeuta_fkey';
    `);
    if (fkCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE public.incidencias
        ADD CONSTRAINT incidencias_id_terapeuta_fkey 
        FOREIGN KEY (id_terapeuta) REFERENCES public.terapeutas(id_terapeuta)
        ON UPDATE CASCADE ON DELETE SET NULL;
      `);
    }

    // 3. Drop restrictive tipo constraint
    await client.query(`
      ALTER TABLE public.incidencias DROP CONSTRAINT IF EXISTS incidencias_tipo_ck;
    `);

    // 4. Update rol constraint to allow 'ADMIN'
    await client.query(`
      ALTER TABLE public.incidencias DROP CONSTRAINT IF EXISTS incidencias_rol_ck;
      ALTER TABLE public.incidencias ADD CONSTRAINT incidencias_rol_ck 
      CHECK (rol_solicitante::text = ANY (ARRAY['PADRE'::text, 'TERAPEUTA'::text, 'ADMIN'::text]));
    `);

    // 5. Update estado constraint to allow all required states
    await client.query(`
      ALTER TABLE public.incidencias DROP CONSTRAINT IF EXISTS incidencias_estado_ck;
      ALTER TABLE public.incidencias ADD CONSTRAINT incidencias_estado_ck 
      CHECK (estado::text = ANY (ARRAY[
        'RECIBIDA'::text, 'LEIDA'::text, 'LEÍDA'::text, 
        'EN PROCESO'::text, 'EN_PROCESO'::text, 
        'ATENDIDA'::text, 'SOLUCIONADA'::text, 
        'NUEVA'::text, 'RESUELTA'::text, 'ABIERTA'::text
      ]));
    `);

    // 6. Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidencias_area_destino ON public.incidencias (area_destino);
      CREATE INDEX IF NOT EXISTS idx_incidencias_id_terapeuta ON public.incidencias (id_terapeuta);
    `);

    await client.query('COMMIT;');
    console.log('[Migration] incidencias schema migration successfully applied!');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('[Migration] Failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  migrateIncidencias().then(() => pool.end());
}

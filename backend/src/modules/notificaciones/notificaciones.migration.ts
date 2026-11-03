import { pool } from '../../core/database.js';

export async function migrateNotificacionesSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');
    await client.query('SELECT pg_advisory_xact_lock(8612, 2);');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notificacion_email_outbox (
        id_usuario integer NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
        id_reserva integer NOT NULL REFERENCES public.reservas(id_reserva) ON DELETE CASCADE,
        fecha_hora_inicio timestamp with time zone NOT NULL,
        clave_evento character varying(160) NOT NULL,
        estado character varying(16) NOT NULL DEFAULT 'PENDIENTE'
          CHECK (estado IN ('PENDIENTE', 'ENVIANDO', 'ENVIADO', 'FALLO', 'OMITIDO')),
        intentos smallint NOT NULL DEFAULT 0 CHECK (intentos BETWEEN 0 AND 10),
        siguiente_intento timestamp with time zone NOT NULL DEFAULT now(),
        lease_hasta timestamp with time zone,
        ultimo_error text,
        fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
        fecha_actualizacion timestamp with time zone NOT NULL DEFAULT now(),
        PRIMARY KEY (id_usuario, clave_evento)
      );
      ALTER TABLE public.notificacion_email_outbox
        ADD COLUMN IF NOT EXISTS fecha_hora_inicio timestamp with time zone NOT NULL DEFAULT now();
      CREATE INDEX IF NOT EXISTS notificacion_email_outbox_pendiente_idx
        ON public.notificacion_email_outbox (siguiente_intento, fecha_creacion)
        WHERE estado IN ('PENDIENTE', 'FALLO', 'ENVIANDO');
      ALTER TABLE public.notificacion_email_outbox ENABLE ROW LEVEL SECURITY;
    `);
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'notificacion_email_outbox'
            AND policyname = 'ashakids_runtime_notification_email_outbox'
        ) THEN
          CREATE POLICY ashakids_runtime_notification_email_outbox
            ON public.notificacion_email_outbox FOR ALL TO ashakids_runtime
            USING (true) WITH CHECK (true);
        END IF;
      END $$;
    `);
    await client.query('GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacion_email_outbox TO ashakids_runtime;');
    await client.query('COMMIT;');
  } catch (error) {
    await client.query('ROLLBACK;');
    throw error;
  } finally {
    client.release();
  }
}

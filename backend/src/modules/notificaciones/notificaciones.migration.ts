import { pool } from '../../core/database.js';
import { migrateWhatsApp } from '../whatsapp/whatsapp.migration.js';

export async function migrateNotificacionesSchema() {
  // La FK id_solicitud depende de solicitudes_acceso_familia. Esta migración también se invoca
  // sola (pruebas y scripts), así que asegura su dependencia; migrateWhatsApp es idempotente.
  await migrateWhatsApp();
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
    // Amplía (de forma idempotente) los tipos permitidos con los avisos críticos del flujo clínico.
    await client.query(`
      ALTER TABLE public.notificaciones ADD COLUMN IF NOT EXISTS id_solicitud integer;
      ALTER TABLE public.notificaciones ALTER COLUMN id_reserva DROP NOT NULL;
      ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_id_solicitud_fkey;
      ALTER TABLE public.notificaciones ADD CONSTRAINT notificaciones_id_solicitud_fkey
        FOREIGN KEY (id_solicitud) REFERENCES public.solicitudes_acceso_familia(id_solicitud) ON DELETE CASCADE;
      ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS ck_notificacion_recurso;
      ALTER TABLE public.notificaciones ADD CONSTRAINT ck_notificacion_recurso CHECK (
        (tipo = 'MENSAJE' AND id_conversacion IS NOT NULL AND id_reserva IS NULL AND id_solicitud IS NULL)
        OR (tipo = 'SOLICITUD_ACCESO' AND id_solicitud IS NOT NULL AND id_reserva IS NULL AND id_conversacion IS NULL)
        OR (tipo NOT IN ('MENSAJE', 'SOLICITUD_ACCESO') AND id_reserva IS NOT NULL AND id_conversacion IS NULL AND id_solicitud IS NULL)
      );
      ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
      ALTER TABLE public.notificaciones ADD CONSTRAINT notificaciones_tipo_check CHECK (
        tipo::text = ANY (ARRAY['NUEVA_CITA', 'CANCELACION', 'REPROGRAMACION', 'RECORDATORIO', 'MENSAJE',
                                'SESION_INICIADA', 'MUESTRA_SOLICITADA', 'REPORTE_PUBLICADO', 'SOLICITUD_ACCESO']::text[])
      );
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

import { pool } from '../../core/database.js';

async function addConstraintIfMissing(client: { query: (sql: string, values?: unknown[]) => Promise<{ rowCount: number | null }> }, table: string, name: string, definition: string) {
  const existing = await client.query(
    'SELECT 1 FROM pg_constraint WHERE conname = $1 AND conrelid = $2::regclass LIMIT 1;',
    [name, `public.${table}`],
  );
  if (existing.rowCount) return;
  await client.query(`ALTER TABLE public.${table} ADD CONSTRAINT ${name} ${definition};`);
}

export async function migrateClinicaSchema() {
  console.log('[Migration] Starting clinical persistence & AI consent schema migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');
    await client.query('SELECT pg_advisory_xact_lock(8612, 1);');

    await client.query(`
      ALTER TABLE public.reservas
        ADD COLUMN IF NOT EXISTS google_calendar_event_id text;
    `);
    await client.query(`
      ALTER TABLE public.reportes_sesion
        ADD COLUMN IF NOT EXISTS estado_reporte character varying(20) DEFAULT 'BORRADOR' NOT NULL,
        ADD COLUMN IF NOT EXISTS id_usuario_firma integer REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS fecha_firma timestamp with time zone;
    `);
    await addConstraintIfMissing(client, 'reportes_sesion', 'reportes_sesion_estado_reporte_check',
      "CHECK (estado_reporte IN ('BORRADOR', 'FIRMADO'))");

    // 1. Tabla de Consentimientos Informados para IA (Ley 29733 / HIPAA)
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.consentimientos_ia (
        id_consentimiento serial PRIMARY KEY,
        id_paciente integer NOT NULL REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE,
        id_usuario_tutor integer NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
        tipo_consentimiento character varying(50) DEFAULT 'EVALUACION_FONOLOGICA_IA' NOT NULL,
        estado character varying(20) DEFAULT 'CONCEDIDO' NOT NULL CHECK (estado IN ('CONCEDIDO', 'REVOCADO')),
        fecha_concesion timestamp with time zone DEFAULT now() NOT NULL,
        fecha_revocacion timestamp with time zone,
        ip_origen character varying(45),
        user_agent text,
        metadata jsonb DEFAULT '{}'::jsonb
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_consentimientos_paciente ON public.consentimientos_ia (id_paciente);
      CREATE INDEX IF NOT EXISTS idx_consentimientos_tutor ON public.consentimientos_ia (id_usuario_tutor);
    `);

    // 2. Transcripciones fonológicas temporales; audio y puntuaciones acústicas no se guardan.
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.evaluaciones_fonologicas (
        id_evaluacion serial PRIMARY KEY,
        id_sesion integer REFERENCES public.sesiones(id_sesion) ON DELETE CASCADE,
        id_paciente integer NOT NULL REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE,
        fonema_objetivo character varying(20),
        palabra_objetivo character varying(100),
        transcripcion_detectada text,
        similitud_porcentaje numeric(5,2), -- Legacy compatibility; current API never writes or returns this value.
        diagnostico_sugerido text, -- Legacy compatibility; current API never writes or returns this value.
        nivel_ayuda integer CHECK (nivel_ayuda BETWEEN 1 AND 5),
        estado character varying(30) DEFAULT 'PENDIENTE_REVISION' NOT NULL CHECK (estado IN ('PENDIENTE_REVISION', 'CONFIRMADO_TERAPEUTA', 'DESCARTADO')),
        origen_evaluacion character varying(20) DEFAULT 'CLINICO' NOT NULL CHECK (origen_evaluacion IN ('CLINICO', 'LUDICO')),
        transcripcion_revisada text,
        observacion_terapeuta text,
        resultado_clinico character varying(24),
        id_usuario_revision integer REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL,
        fecha_revision timestamp with time zone,
        fecha_registro timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    await client.query(`
      ALTER TABLE public.evaluaciones_fonologicas
        ADD COLUMN IF NOT EXISTS transcripcion_revisada text,
        ADD COLUMN IF NOT EXISTS observacion_terapeuta text,
        ADD COLUMN IF NOT EXISTS resultado_clinico character varying(24),
        ADD COLUMN IF NOT EXISTS id_usuario_revision integer REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS fecha_revision timestamp with time zone;
    `);

    await addConstraintIfMissing(client, 'evaluaciones_fonologicas', 'evaluaciones_fonologicas_resultado_clinico_check',
      "CHECK (resultado_clinico IS NULL OR resultado_clinico IN ('ALCANZADO', 'EN_PROCESO', 'REQUIERE_APOYO'))");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_evaluaciones_sesion ON public.evaluaciones_fonologicas (id_sesion);
      CREATE INDEX IF NOT EXISTS idx_evaluaciones_paciente ON public.evaluaciones_fonologicas (id_paciente);
      CREATE INDEX IF NOT EXISTS idx_evaluaciones_origen ON public.evaluaciones_fonologicas (origen_evaluacion);
    `);

    // 3. Tabla de Predicciones de Plan Terapéutico (Random Forest Supervisado)
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.predicciones_tratamiento (
        id_prediccion serial PRIMARY KEY,
        id_sesion integer,
        id_paciente integer NOT NULL REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE,
        id_terapeuta integer REFERENCES public.terapeutas(id_terapeuta) ON DELETE SET NULL,
        edad_meses integer NOT NULL,
        codigo_diagnostico integer NOT NULL,
        cantidad_fonemas_afectados integer NOT NULL,
        nivel_colaboracion integer NOT NULL,
        frecuencia_semanal integer NOT NULL,
        sesiones_estimadas numeric(4,1) NOT NULL,
        rango_min integer NOT NULL,
        rango_max integer NOT NULL,
        riesgo_desercion character varying(20) NOT NULL CHECK (riesgo_desercion IN ('BAJO', 'MEDIO', 'ALTO')),
        confianza numeric(5,4),
        version_modelo character varying(100) DEFAULT 'UNVALIDATED' NOT NULL,
        estado_confirmacion character varying(30) DEFAULT 'SUGERIDO' NOT NULL CHECK (estado_confirmacion IN ('SUGERIDO', 'CONFIRMADO_CLINICO', 'MODIFICADO_MANUAL', 'DESCARTADO')),
        sesiones_confirmadas integer,
        observaciones_terapeuta text,
        fecha_creacion timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    await client.query(`
      ALTER TABLE public.predicciones_tratamiento
        ADD COLUMN IF NOT EXISTS id_sesion integer;
    `);
    await addConstraintIfMissing(client, 'predicciones_tratamiento', 'predicciones_tratamiento_id_sesion_fkey',
      'FOREIGN KEY (id_sesion) REFERENCES public.sesiones(id_sesion) ON DELETE SET NULL');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_predicciones_paciente ON public.predicciones_tratamiento (id_paciente);
      CREATE INDEX IF NOT EXISTS idx_predicciones_terapeuta ON public.predicciones_tratamiento (id_terapeuta);
      CREATE INDEX IF NOT EXISTS idx_predicciones_sesion ON public.predicciones_tratamiento (id_sesion);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_predicciones_sesion_sugerida_unica
        ON public.predicciones_tratamiento (id_sesion)
        WHERE id_sesion IS NOT NULL AND estado_confirmacion = 'SUGERIDO';
    `);

    await client.query(`
      ALTER TABLE public.predicciones_tratamiento
        ALTER COLUMN confianza DROP NOT NULL,
        ALTER COLUMN confianza TYPE numeric(5,4),
        ALTER COLUMN version_modelo TYPE character varying(100);
    `);

    await client.query(`
      ALTER TABLE public.tratamientos
        ADD COLUMN IF NOT EXISTS id_prediccion integer,
        ADD COLUMN IF NOT EXISTS frecuencia_semanal smallint,
        ADD COLUMN IF NOT EXISTS fonemas_priorizados jsonb DEFAULT '[]'::jsonb NOT NULL;
    `);
    await addConstraintIfMissing(client, 'tratamientos', 'tratamientos_frecuencia_semanal_check',
      'CHECK (frecuencia_semanal IS NULL OR frecuencia_semanal BETWEEN 1 AND 3)');
    await addConstraintIfMissing(client, 'tratamientos', 'tratamientos_fonemas_priorizados_check',
      "CHECK (jsonb_typeof(fonemas_priorizados) = 'array')");
    await addConstraintIfMissing(client, 'tratamientos', 'tratamientos_id_prediccion_fkey',
      'FOREIGN KEY (id_prediccion) REFERENCES public.predicciones_tratamiento(id_prediccion) ON DELETE SET NULL');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tratamientos_prediccion_unica
      ON public.tratamientos (id_prediccion)
      WHERE id_prediccion IS NOT NULL;
    `);

    // 4. Flexibilizar tratamientos para permitir estimación ML sin forzar valor estático por defecto
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tratamientos' AND column_name = 'sesiones_recomendadas'
        ) THEN
          ALTER TABLE public.tratamientos ALTER COLUMN sesiones_recomendadas DROP DEFAULT;
        END IF;
      END $$;
    `);

    await client.query('COMMIT;');
    console.log('[Migration] Clinical persistence & AI consent schema successfully applied.');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('[Migration] Failed to migrate clinical schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

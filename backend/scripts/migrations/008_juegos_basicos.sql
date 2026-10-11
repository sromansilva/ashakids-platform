-- Adopción explícita con respaldo. No crea usuarios ni datos clínicos.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.actividades ADD COLUMN codigo_juego VARCHAR(40), ADD COLUMN version_contenido VARCHAR(30);
CREATE UNIQUE INDEX uq_actividad_juego_version ON public.actividades(id_paciente,codigo_juego,version_contenido)
  WHERE codigo_juego IS NOT NULL;
ALTER TABLE public.logros ADD COLUMN codigo_juego VARCHAR(40) UNIQUE;
ALTER TABLE public.resultados_nivel ADD COLUMN clave_intento UUID UNIQUE,
  ADD COLUMN experiencia_otorgada INTEGER NOT NULL DEFAULT 0 CHECK (experiencia_otorgada >= 0);
CREATE INDEX idx_resultados_paciente_fecha ON public.resultados_nivel(id_paciente,fecha_realizacion);
ALTER TABLE public.tratamientos DROP CONSTRAINT ck_plan_profesional;
ALTER TABLE public.tratamientos ADD CONSTRAINT ck_plan_profesional CHECK (id_sesion_origen IS NULL OR (
  area IS NOT NULL AND area IN ('FLUIDEZ','HABLA','LENGUAJE','VOZ','OROFACIAL') AND
  sesiones_recomendadas IS NOT NULL AND sesiones_recomendadas BETWEEN 1 AND 31 AND
  jsonb_typeof(mundos_asignados) = 'array' AND jsonb_array_length(mundos_asignados) BETWEEN 1 AND 5 AND
  mundos_asignados <@ '["FLUIDEZ","HABLA","LENGUAJE","VOZ","OROFACIAL"]'::jsonb));
INSERT INTO public.logros(codigo_juego,nombre_logro,experiencia_logro,requisito_logro,icono_logro) VALUES
  ('HABLA','Medalla del Taller de los Sonidos',100,'Completar los tres niveles básicos del mundo HABLA.','medalla'),
  ('LENGUAJE','Medalla de La Isla de las Palabras',100,'Completar los tres niveles básicos del mundo LENGUAJE.','medalla'),
  ('FLUIDEZ','Medalla de Ritmo de las Palabras',100,'Completar los tres niveles básicos del mundo FLUIDEZ.','medalla'),
  ('VOZ','Medalla de El Estudio de la Voz',100,'Completar los tres niveles básicos del mundo VOZ.','medalla'),
  ('OROFACIAL','Medalla del Laboratorio de los Gestos',100,'Completar los tres niveles básicos del mundo OROFACIAL.','medalla');
-- Solo añade las operaciones del módulo al rol privado existente; conserva otros permisos.
DO $$
DECLARE tbl text; op text; seq text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ashakids_runtime') THEN
    FOREACH tbl IN ARRAY ARRAY['actividades','objetivos','mundos','niveles','resultados_nivel','perfiles','perfil_logros','logros'] LOOP
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',tbl);
      FOREACH op IN ARRAY CASE
        WHEN tbl='logros' THEN ARRAY['SELECT']
        WHEN tbl IN ('actividades','objetivos','perfiles') THEN ARRAY['SELECT','INSERT','UPDATE']
        ELSE ARRAY['SELECT','INSERT'] END LOOP
        EXECUTE format('GRANT %s ON public.%I TO ashakids_runtime',op,tbl);
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl
          AND policyname='juegos_'||lower(op)) THEN
          EXECUTE format('CREATE POLICY %I ON public.%I FOR %s TO ashakids_runtime %s',
            'juegos_'||lower(op),tbl,op,CASE WHEN op='INSERT' THEN 'WITH CHECK (true)'
              WHEN op='UPDATE' THEN 'USING (true) WITH CHECK (true)' ELSE 'USING (true)' END);
        END IF;
      END LOOP;
      IF tbl <> 'logros' THEN
        SELECT pg_get_serial_sequence('public.'||tbl, CASE tbl
          WHEN 'actividades' THEN 'id_actividad' WHEN 'objetivos' THEN 'id_objetivo'
          WHEN 'mundos' THEN 'id_mundo' WHEN 'niveles' THEN 'id_nivel'
          WHEN 'resultados_nivel' THEN 'id_resultado_nivel' WHEN 'perfiles' THEN 'id_perfil'
          ELSE 'id_perfil_logro' END) INTO seq;
        IF seq IS NOT NULL THEN EXECUTE format('GRANT USAGE ON SEQUENCE %s TO ashakids_runtime',seq); END IF;
      END IF;
    END LOOP;
  END IF;
END $$;
COMMIT;
-- Reversión conservadora: conservar intentos/medallas; no eliminar columnas ni premios.

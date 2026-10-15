-- Ampliación de los datos externos de Zoom.
-- Ejecutar únicamente en una base aislada/staging con respaldo previo.
-- Antes de ejecutar: pg_dump --format=custom --table=public.reservas <DATABASE_URL> > reservas-before-007.dump
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $$
BEGIN
  IF to_regclass('public.reservas') IS NULL THEN
    RAISE EXCEPTION 'No existe public.reservas; revisar el esquema antes de adoptar 007';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservas'
      AND column_name IN ('zoom_meeting_id', 'zoom_join_url')
    GROUP BY table_schema, table_name
    HAVING count(*) = 2
  ) THEN
    RAISE EXCEPTION 'Faltan las columnas Zoom esperadas en public.reservas';
  END IF;
END $$;
ALTER TABLE public.reservas
  ALTER COLUMN zoom_meeting_id TYPE VARCHAR(64),
  ALTER COLUMN zoom_join_url TYPE VARCHAR(2048);
DO $$
BEGIN
  IF (SELECT character_maximum_length FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reservas' AND column_name = 'zoom_meeting_id') <> 64
    OR (SELECT character_maximum_length FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reservas' AND column_name = 'zoom_join_url') <> 2048 THEN
    RAISE EXCEPTION '007 no verificó las longitudes esperadas';
  END IF;
END $$;
COMMIT;
-- Después de ejecutar: pg_restore --list reservas-before-007.dump y una consulta
-- information_schema.columns deben conservarse como evidencia del respaldo/verificación.

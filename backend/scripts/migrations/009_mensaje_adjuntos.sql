-- Adjuntos pequeños persistentes; preserva metadatos anteriores y permisos privados.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.mensaje_adjuntos ADD COLUMN contenido BYTEA,
 ADD COLUMN clave_envio UUID UNIQUE, ADD COLUMN sha256 VARCHAR(64);
ALTER TABLE public.mensaje_adjuntos ADD CONSTRAINT ck_adjunto_contenido CHECK (
 contenido IS NULL OR (octet_length(contenido) BETWEEN 1 AND 10485760
 AND octet_length(contenido) = tamano_bytes AND clave_envio IS NOT NULL AND sha256 IS NOT NULL AND length(sha256)=64));
ALTER TABLE public.mensaje_adjuntos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mensaje_adjuntos FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
  REVOKE ALL ON public.mensaje_adjuntos FROM anon;
 END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
  REVOKE ALL ON public.mensaje_adjuntos FROM authenticated;
 END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ashakids_runtime') THEN
  GRANT SELECT, INSERT ON public.mensaje_adjuntos TO ashakids_runtime;
  GRANT USAGE ON SEQUENCE public.mensaje_adjuntos_id_adjunto_seq TO ashakids_runtime;
  CREATE POLICY adjuntos_select ON public.mensaje_adjuntos FOR SELECT TO ashakids_runtime USING (true);
  CREATE POLICY adjuntos_insert ON public.mensaje_adjuntos FOR INSERT TO ashakids_runtime WITH CHECK (true);
 END IF;
END $$;
COMMIT;

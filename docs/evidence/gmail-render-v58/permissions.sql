-- Evidencia del ajuste ejecutado por el propietario con respaldo previo.
-- No reaplicar si runtime_select/insert/update ya existen; comprobar catalogos primero.
BEGIN;

SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
ALTER TABLE public.suscripciones_boletin ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.suscripciones_boletin FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE public.suscripciones_boletin_id_suscripcion_seq FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.suscripciones_boletin TO ashakids_runtime;
GRANT USAGE ON SEQUENCE public.suscripciones_boletin_id_suscripcion_seq TO ashakids_runtime;
CREATE POLICY runtime_select ON public.suscripciones_boletin FOR SELECT TO ashakids_runtime USING (true);
CREATE POLICY runtime_insert ON public.suscripciones_boletin FOR INSERT TO ashakids_runtime WITH CHECK (true);
CREATE POLICY runtime_update ON public.suscripciones_boletin FOR UPDATE TO ashakids_runtime USING (true) WITH CHECK (true);
COMMIT;

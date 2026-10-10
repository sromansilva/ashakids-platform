-- Adopción explícita después de 002–005, con respaldo y por el propietario.
-- FastAPI conserva autorización por usuario/paciente. Sin Supabase Auth ni roles nuevos.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ashakids_runtime'
    AND NOT rolsuper AND NOT rolcreaterole AND NOT rolcreatedb AND NOT rolbypassrls) THEN
    RAISE EXCEPTION 'Se requiere el rol runtime restringido existente';
  END IF;
END $$;

-- Retirar defaults solo de las cuatro tablas nuevas; los objetos previos no cambian.
REVOKE ALL ON public.turnos_semanales, public.bloqueos_agenda,
  public.preferencias_notificacion, public.notificaciones
  FROM PUBLIC, anon, authenticated, service_role, ashakids_runtime;
REVOKE ALL ON SEQUENCE public.turnos_semanales_id_turno_seq,
  public.bloqueos_agenda_id_bloqueo_seq, public.notificaciones_id_notificacion_seq
  FROM PUBLIC, anon, authenticated, service_role, ashakids_runtime;

GRANT SELECT, INSERT, DELETE ON public.turnos_semanales, public.bloqueos_agenda
  TO ashakids_runtime;
GRANT SELECT, INSERT, UPDATE ON public.preferencias_notificacion, public.notificaciones
  TO ashakids_runtime;
GRANT USAGE ON SEQUENCE public.turnos_semanales_id_turno_seq,
  public.bloqueos_agenda_id_bloqueo_seq, public.notificaciones_id_notificacion_seq
  TO ashakids_runtime;

-- Mismo límite B02: rol privado de API, operaciones mínimas y alcance en FastAPI.
CREATE POLICY runtime_select ON public.turnos_semanales FOR SELECT TO ashakids_runtime USING (true);
CREATE POLICY runtime_insert ON public.turnos_semanales FOR INSERT TO ashakids_runtime WITH CHECK (true);
CREATE POLICY runtime_delete ON public.turnos_semanales FOR DELETE TO ashakids_runtime USING (true);
CREATE POLICY runtime_select ON public.bloqueos_agenda FOR SELECT TO ashakids_runtime USING (true);
CREATE POLICY runtime_insert ON public.bloqueos_agenda FOR INSERT TO ashakids_runtime WITH CHECK (true);
CREATE POLICY runtime_delete ON public.bloqueos_agenda FOR DELETE TO ashakids_runtime USING (true);
CREATE POLICY runtime_select ON public.preferencias_notificacion FOR SELECT TO ashakids_runtime USING (true);
CREATE POLICY runtime_insert ON public.preferencias_notificacion FOR INSERT TO ashakids_runtime WITH CHECK (true);
CREATE POLICY runtime_update ON public.preferencias_notificacion FOR UPDATE TO ashakids_runtime USING (true) WITH CHECK (true);
CREATE POLICY runtime_select ON public.notificaciones FOR SELECT TO ashakids_runtime USING (true);
CREATE POLICY runtime_insert ON public.notificaciones FOR INSERT TO ashakids_runtime WITH CHECK (true);
CREATE POLICY runtime_update ON public.notificaciones FOR UPDATE TO ashakids_runtime USING (true) WITH CHECK (true);
COMMIT;
-- Reversión conservadora: volver al código compatible, conservar esquema/datos nuevos.
-- No eliminar tablas, avisos, preferencias ni planes para revertir una versión de UI.

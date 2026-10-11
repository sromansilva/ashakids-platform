-- Ampliar días permitidos; cada profesional debe publicar sus propios turnos.
-- No modifica filas, permisos, bloqueos, horas ni reservas. Adopción explícita.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '15s';
ALTER TABLE public.turnos_semanales DROP CONSTRAINT IF EXISTS turnos_semanales_dia_check;
ALTER TABLE public.turnos_semanales ADD CONSTRAINT turnos_semanales_dia_check CHECK (dia BETWEEN 0 AND 6);
COMMIT;

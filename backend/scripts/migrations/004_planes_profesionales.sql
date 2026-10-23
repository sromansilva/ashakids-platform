-- Ejecutar explícitamente después de 003, con respaldo. No arranque automático.
-- Mantiene los planes V26 sin inventar sesiones de origen. Sin nuevos grants/policies.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.tratamientos
  ADD COLUMN id_sesion_origen INTEGER REFERENCES public.sesiones(id_sesion),
  ADD COLUMN area VARCHAR(20),
  ADD COLUMN mundos_asignados JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT uq_plan_sesion_origen UNIQUE (id_sesion_origen),
  ADD CONSTRAINT ck_plan_profesional CHECK (id_sesion_origen IS NULL OR (
    area IS NOT NULL AND area IN ('FLUIDEZ','HABLA','LENGUAJE') AND
    sesiones_recomendadas IS NOT NULL AND sesiones_recomendadas BETWEEN 1 AND 31 AND
    jsonb_typeof(mundos_asignados) = 'array' AND jsonb_array_length(mundos_asignados) BETWEEN 1 AND 3 AND
    mundos_asignados <@ '["FLUIDEZ","HABLA","LENGUAJE"]'::jsonb));
CREATE UNIQUE INDEX uq_plan_profesional_activo ON public.tratamientos(id_expediente)
  WHERE estado_tratamiento = 'ACTIVO' AND id_sesion_origen IS NOT NULL;
COMMIT;
-- Reversión conservadora: revertir código compatible, conservar columnas/datos/versiones.
-- No borrar ni transformar planes publicados; eliminación requiere exportación y revisión.

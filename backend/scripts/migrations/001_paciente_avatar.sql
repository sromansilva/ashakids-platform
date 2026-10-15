-- V01: alinear el esquema base con Paciente.avatar_nombre.
-- Ejecutar explícitamente sobre un entorno autorizado; no se ejecuta al arrancar API.
-- Preserva filas existentes y suple zorro cuando falta la columna.
BEGIN;
ALTER TABLE public.pacientes
    ADD COLUMN IF NOT EXISTS avatar_nombre VARCHAR(20) NOT NULL DEFAULT 'zorro';
COMMIT;

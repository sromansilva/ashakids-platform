-- Aplicación explícita por propietario. No ejecutar sobre BD compartida sin aprobación.
-- Precondición: no existen códigos que difieran solo en mayúsculas/minúsculas.
-- Conserva cuentas, IDs, hash de contraseña y permisos; cuentas previas quedan activadas.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.usuarios ADD COLUMN password_change_required BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX usuarios_codigo_casefold_uq ON public.usuarios (upper(codigo_usuario));
COMMIT;
-- Reversión antes de adoptar cuentas nuevas: DROP INDEX public.usuarios_codigo_casefold_uq;
-- ALTER TABLE public.usuarios DROP COLUMN password_change_required;
-- No revertir con cuentas pendientes: se perdería su bloqueo de activación.

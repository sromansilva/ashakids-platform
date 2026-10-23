# Disponibilidad de domingo

11/10/2026. Repositorio: https://github.com/sromansilva/ashakids-platform . Rama feat/piero-dev, base bd8c17d79eb81b098535179f021e3b0adbfdfd11 más este cambio.

## Comportamiento

El profesional puede publicar lunes a domingo (dia 0–6), horas 08:00–17:00 exactas, hasta 70 combinaciones únicas. Publicación explícita. No se generan turnos, usuarios ni citas automáticamente. Bloqueos, ocupación, fechas futuras, máximo 90 días y permisos se conservan.

## Adopción verificada

Migración backend/scripts/migrations/012_disponibilidad_domingo.sql. Se amplió exclusivamente CHECK turnos_semanales_dia_check de 0–5 a 0–6 en la BD configurada. Sin DML clínico. Conteo/huella de 60 filas, ACL/RLS/políticas y demás restricciones iguales antes/después/tras COMMIT. Evidencia docs/evidence/audit-2026-10-11-01/sunday-adoption.json. Contrato local 8000 ya muestra máximo 6 y 70 turnos. Un push no certifica actualización del runtime remoto.

## Otra base

Inspección por defecto, desde backend: python -m scripts.apply_sunday_availability --output ../tmp/sunday-inspection.json; transacción READ ONLY.

Aplicación explícita: añadir --apply --owner-config RUTA_PRIVADA --backup RESPALDO_PRIVADO --output INFORME. JSON privado contiene previous_url del propietario; no versionarlo. Script exige mismo host/puerto/base del runtime y CHECK previo conocido. lock_timeout 5s y statement_timeout 15s; revisar conflictos y reintentar, no ignorarlos. No ejecutar DDL al iniciar FastAPI.

Respaldo inicial conservado al repetir. applied=true indica COMMIT; post_commit_verified=false indica relectura no confirmada/snapshot concurrente, no rollback. La adopción de este corte sí confirmó coincidencia tras COMMIT.

## Reversión

Antes de restaurar CHECK 0–5, comprobar que no haya turnos dia 6. Si existen, PostgreSQL rechaza la restricción anterior; no borrarlos automáticamente. Acordar reversión con profesionales y preservar citas. Este corte no insertó turnos reales.

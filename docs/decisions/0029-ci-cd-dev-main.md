# ADR0029 — Separar integración de producción

Fecha: 2026-10-23. Estado: adoptado; promoción pendiente.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base: `dev` en `0684b21505a637713c4f582b5ae2df5bb7e7418e`.

## Contexto

El servicio Render seguía `dev` y el CI anterior no bloqueaba releases. `main` y `dev`
tenían historias divergentes, y el esquema incluye migraciones que no deben ejecutarse
por sorpresa contra la base de producción.

## Decisión

- `dev` integra cambios; `main` representa producción. Ambas ramas requieren PR y los
  checks `frontend`, `backend` y `container`; `main` requiere una aprobación de otra
  persona para el último push. Administradores cumplen las reglas; no se permite force-push
  ni borrado.
- El CI backend crea una PostgreSQL descartable y no recibe secretos de producción.
  La revisión de seguridad de GitGuardian es adicional y no se omite por ser histórica.
- Durante la transición, `render.yaml` mantiene `branch: dev` con `autoDeployTrigger: off`.
  Después de promover el release, sincronizar el servicio existente a `branch: main` y
  `autoDeployTrigger: checksPass`, y verificar el SHA y endpoints de salud.
- Las migraciones se validan fuera de producción, requieren respaldo y se aplican de forma
  explícita; no se ejecutan durante el inicio del contenedor.

## Consecuencias y pendientes

El PR #112 está abierto y no debe fusionarse hasta que pasen sus checks y haya aprobación
independiente. GitGuardian reportó hallazgos de secretos en la historia del release candidate.
Revisar su validez sin copiar valores antes de autorizar. La
sesión del panel Render requiere autenticación y su pausa real todavía no está confirmada.
La revisión de migraciones queda limitada al esquema versionado; no se aplicó DDL a la BD
compartida ni a producción.

# Contexto actual de ASHAKids

Actualizado: 2026-10-07. Base de implementación: commit `5ed6a43` (fase 5). Esta documentación describe el estado comprobado; actualizarla junto a cambios importantes.

## Producto y estado
Plataforma de apoyo para terapia de lenguaje infantil, con áreas de familias, terapeutas y administración. Frontend React/TypeScript separado de una API FastAPI y PostgreSQL en Supabase. Autenticación propia, con sesiones y permisos por rol.

Las fases registradas en Git incluyen reorganización del frontend, modularización por dominio y navegación URL con React Router. Consultar los reportes de fases existentes en `docs/` para antecedentes.

## Verificación más reciente
- 25 pruebas de routing del frontend y compilación de producción correctas.
- 35 pruebas unitarias del backend (modelos, seguridad y API) y 5 de integración contra PostgreSQL correctas.
- Conectividad PostgreSQL y presencia de columnas de modelos comprobadas sin cambios de esquema.
- Endpoints de salud, documentación, rechazo de credenciales inválidas y CORS comprobados.
- Login de desarrollo de padre, persistencia tras recarga y logout comprobados en navegador sin errores de consola durante ese recorrido.

Estas comprobaciones no demuestran cobertura completa de pantallas o funcionalidad clínica. Varias vistas muestran datos ilustrativos; comprobar conexión real antes de declarar una funcionalidad terminada.

## Pendientes conocidos
- Bundle frontend superior a 500 kB y advertencias de APIs obsoletas en dependencias.
- Suite de integración con advertencias de conexiones sin cerrar: revisar inicialización/disposición del motor y el aislamiento de event loops.
- Ampliar validación funcional de pantallas y determinar qué vistas requieren integración real.
- Revisar esta integración de Graphify mediante PR antes de llevarla a `main`.

## Incorporación al equipo
1. Seguir `README.md` para ejecutar frontend y backend; configurar credenciales por un canal autorizado, nunca en Git o documentación.
2. Leer `docs/architecture.md` y las decisiones de `docs/decisions/`.
3. Ejecutar `python tools/knowledge/manage.py setup` y consultar el mapa según `AGENTS.md`.
4. Trabajar en una rama de funcionalidad, actualizar contexto y mapa después de cambios importantes y entregar mediante PR.

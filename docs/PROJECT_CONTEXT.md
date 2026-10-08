# Contexto actual de ASHAKids

Actualizado: 2026-10-08. Base de implementación: Tarea 1 frontend (modularización, rutas declarativas y limpieza de dependencias) integrada en la rama dev. Esta documentación describe el estado comprobado; actualizarla junto a cambios importantes.

## Producto y estado
Plataforma de apoyo para terapia de lenguaje infantil, con áreas de familias, terapeutas y administración. Frontend React/TypeScript separado de una API FastAPI y PostgreSQL en Supabase. Autenticación propia, con sesiones y permisos por rol.

Las fases registradas en Git incluyen reorganización del frontend, modularización por dominio y navegación URL con React Router. Consultar los reportes de fases existentes en `docs/` para antecedentes.

## Verificación más reciente
- Tarea 1: 25 pruebas originales de routing y 120 pruebas Vitest correctas; tipos y build correctos.
- 278 archivos de código, estilos, configuración y pruebas revisados; máximo 495 líneas. Cero imports locales rotos, cruces internos entre roles o marcadores de conflicto detectados.
- 96 destinos renderizados en navegador con fixture aislada por rol, sin errores de consola en ese recorrido; navegación pública, recarga y protección sin sesión comprobadas en la aplicación real.
- Entrada JS de producción: 259,81 kB (82,81 kB gzip), frente a 1.020,69 kB anteriores. Carga de pantallas diferida; cero vulnerabilidades reportadas por npm audit.
- Los resultados previos del backend (35 pruebas unitarias, 5 de integración y login padre) son históricos: NO se repitieron en Tarea 1. En la revisión actual localhost:8000/health no respondió en 4 segundos.

Estas comprobaciones no demuestran cobertura completa de pantallas o funcionalidad clínica. Varias vistas muestran datos ilustrativos; comprobar conexión real antes de declarar una funcionalidad terminada.

## Pendientes conocidos
- Validar autenticación real por los tres roles con backend disponible, cookies, CORS y configuración del hosting; la fixture de UI no demuestra conectividad real.
- Operaciones clínicas, registros, pagos, mensajería y métricas siguen usando datos simulados donde no hay integración comprobada.
- QA profunda de juegos (voz, canvas, cámara), formularios y cada tamaño físico móvil; el barrido de rutas valida montaje, no todos los estados interactivos.
- Suite de integración con advertencias de conexiones sin cerrar: revisar inicialización/disposición del motor y el aislamiento de event loops.
- Ampliar validación funcional de pantallas y determinar qué vistas requieren integración real.
- Revisar esta integración de Graphify mediante PR antes de llevarla a `main`.

Informe de Tarea 1: `docs/tarea-1-frontend-informe.md`. Inventario de eliminaciones: `docs/frontend-cleanup-inventory.md`. Backend intacto. Cambios integrados y publicados en rama `dev`.

## Incorporación al equipo
1. Seguir `README.md` para ejecutar frontend y backend; configurar credenciales por un canal autorizado, nunca en Git o documentación.
2. Leer `docs/architecture.md` y las decisiones de `docs/decisions/`.
3. Ejecutar `python tools/knowledge/manage.py setup` y consultar el mapa según `AGENTS.md`.
4. Trabajar en una rama de funcionalidad, actualizar contexto y mapa después de cambios importantes y entregar mediante PR.

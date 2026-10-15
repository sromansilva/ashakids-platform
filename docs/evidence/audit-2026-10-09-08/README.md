# AUDIT-2026-10-09-08 — Núcleo, PDF y mensajes en entorno independiente (HailQueso)

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: dev.
Base previa: dev/b3f84bd828c2002c7f80466410251d9df155550c (V13_Integracion_Aceptacion_Nucleo / PR #107 integrado).
Entorno evaluado: clon independiente en máquina de HailQueso, Node v22.15.0 / npm 10.9.2, Python 3.13.7, PostgreSQL 18.4 local en puerto 5433.

## Contenido de la evidencia

- `runtime-and-reproduction.json`: registro técnico del entorno de ejecución, versiones, puertos, bases de datos y resultados verificados.
- `backend-tests.xml` y `backend-tests.txt`: suite completa de regresión pytest en BD local descartable `ashakids_test_regress08`. 119 pruebas aprobadas, 25 omitidas (suites heredadas deshabilitadas), 19 advertencias. 0 fallos.
- `frontend-tests.xml`: 232 pruebas unitarias y de componentes aprobadas en Vitest (12 suites).
- `routing-tests.txt`: 25 pruebas declarativas de enrutamiento y guardias aprobadas.
- `typecheck.txt`: TypeScript `tsc --noEmit` sin errores.
- `frontend-check.txt`: 318 archivos analizados, máximo 495 líneas por archivo, fronteras de rol y cliente central HTTP validados.
- `build.txt`: compilación de producción con Vite exitosa (bundle principal 292.83 kB / gzip 92.55 kB).
- `knowledge-check.txt`: verificación exitosa del mapa de conocimiento Graphify (1880 nodos AST, code-only, sin credenciales).
- `http-delivery-journey.json`: ejecución de `backend/scripts/verify_delivery_journey.py` sobre `ashakids_test_accept07_hq`. 92 respuestas HTTP verificadas (ADMIN, PADRE, TERAPEUTA, gestión de usuarios, asignaciones, citas, sesiones, reportes, PDF y mensajería con paginación de cursor, aperturas concurrentes y persistencia tras relogin).
- `reporte-sesion-sintetica.pdf`: PDF generado por la API durante el recorrido HTTP, cotejado contra los 4 campos del reporte guardado y validado en estructura binaria (`%PDF-`).
- `pdf-qa.json`: validación de metadatos, páginas, SHA-256 y texto del PDF exportado.
- `schema-local.json`: inspección de metadatos de la BD de aceptación (26 tablas, 178 columnas, 221 restricciones, 71 índices, conteos posteriores a la prueba).
- `browser-limitation.json`: registro de intento de ejecución en navegador real en `http://127.0.0.1:5174/login` vía `browser_subagent` y documentación del fallo del gestor de Playwright (HTTP 404 de descarga de driver en CDN).
- `attempts.json`: registro de incidencias resueltas durante la preparación (idempotencia de esquema, dependencias dev, flags de CLI).
- `sanitized-secret-check.json`: verificación de sanitización de credenciales y ausencia de datos clínicos reales.
- `manifest.json`: hashes SHA-256 de integridad de todos los archivos de evidencia.

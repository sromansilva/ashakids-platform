# Evidencia AUDIT-2026-10-09-04

Implementación: `9a6b06160c5210ec05bd3273ef516bba6989560d` (`V01_Fase3`).
Documentación y auditorías históricas consolidadas: `V02_AuditoriaFase3`.
Destino: `dev` mediante PR desde `feat/piero-dev`; consultar Git para publicación/CI.

## Alcance y resultados

- `frontend-tests.xml`: 198 componentes aprobados (33 casos nuevos); datos de componentes
  son mocks. `frontend-tests-before-fix.xml` conserva 187 aprobados y 8 fallidos iniciales.
- `routing-tests.txt`: 25 rutas aprobadas. Tipos, estructura y compilación correctos.
- `http-reads.json`: 35 respuestas HTTP, más OpenAPI 200, sobre API local 8001 y
  PostgreSQL 17.6, puerto 6544, BD `ashakids_test_compat17`. Cinco identidades sintéticas.
  Lecturas clínicas y autorización; login/logout crean y revocan sesiones de desarrollo.
  Sin altas clínicas, DDL, TRUNCATE ni acceso Supabase en este corte.
- Navegador web5174: roles, hermanos, recarga, familia vacía y móvil 390 px.
  Capturas muestran la porción visible con scroll, no toda la plataforma.
- PDF de 10 páginas renderizado e inspeccionado; ver `pdf-qa.json`.
- Progreso educativo: función pura con intentos sintéticos; no API ni persistencia.
  Mundos/24 niveles son propuestas, no nuevos juegos ni protocolo clínico validado.

## Reproducción

Desde `frontend`: `npm run test:components`, `npm run test:routing`,
`npm run typecheck`, `npm run check:frontend`, `npm run build`.
Desde `backend`, con entorno Python 3.13 y el mismo destino descartable configurado:
`python -m scripts.phase3_verify_reads --output ../tmp/phase04/http-reads-repeat.json`.
Este guion rechaza destinos que no sean la réplica local indicada. No ejecutar
`prepare` ni la suite de integración sobre la demo que se desea conservar: reinician fixtures.
Otro clon necesita crear su propia réplica según la documentación del corte 02.

No se volvió a ejecutar la suite backend completa. Resultados de 01/02/03 son históricos;
sus manifiestos conservan hashes de cada corte, aunque archivos maestros evolucionaron.

## Errores y límites

Ver `attempts.json` y `browser-observations.json`. Se corrigieron etiquetas de login,
props/tipos de modal, selector de prueba y solapamiento móvil. Build inicialmente bloqueado
por sandbox se repitió con autorización local. La incidencia histórica de API compartida
del corte 01 permanece abierta; estas lecturas no la cierran. No se eligió hosting.

`sanitized-secret-check.json` cubre coincidencias con valores secretos configurados y
JWT literales, incluyendo texto extraído de PDFs; no equivale a pentest.
`manifest.json` registra SHA-256 de fuentes/evidencias del corte, sin incluirse a sí mismo.

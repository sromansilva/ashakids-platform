# AUDIT-2026-10-09-05 - Evidencia de reportes PDF

Código: a8df56fc912db76a01092b60caa1efa220dcd85b, V05_Reportes_Exportacion_PDF.
Base dev/add1d4f; documentación V06_Auditoria_Reportes_PDF. Publicación: consultar PR/historial
de V07_Integracion_Reportes_PDF. Repo https://github.com/sromansilva/ashakids-platform .

Entorno real local: API8001/web5174/PG17.6 local6544 ashakids_test_compat17; .venv313 Python3.13.7.
ReportLab4.5.1/tzdata2026.5/pypdf6.19.0. Fixtures02/03 conservadas; login/logout crea/revoca
sesiones sintéticas. Sin filas clínicas nuevas/reset/DDL/Supabase.

- backend-unit-tests.xml: 11 finales correctas, sin BD. backend-before-dependency.xml conserva
  intento7 correctas/4 fallos tzdata ausente y2 advertencias de caché.
- frontend-tests.xml: 216 finales correctas/11 archivos; 18 nuevas. frontend-tests-before-fix.xml:
  208 correctas/8 fallos por Blob.text en jsdom y espera de ruta; corregidos. Otra ejecución
  detectó claves React duplicadas entre editor/descarga; corregidas y suite repetida sin warning.
- routing-tests.txt: 25; routing-sandbox-block.txt: EPERM inicial, repetición autorizada correcta.
- typecheck.txt/frontend-check.txt/build.txt: salidas finales correctas; build no certifica toda UI.
- http-pdf.json: 28 respuestas + OpenAPI200; PDF cotejado con JSON/nombres y lectura repetida
  igual. Script backend/scripts/verify_report_pdf.py; guardas locales obligatorias.
- reporte-sesion-sintetica.pdf: muestra final recibida vía API, datos clínicos sintéticos heredados;
  un nuevo PDF, no un reporte clínico creado nuevamente. Render final inspeccionado1 página.
- browser-download.json: archivo físico descargado y texto coincide con muestra; no igualdad
  binaria porque el navegador precedió el último ajuste de fuente/paginación. Ejemplo largo4 páginas.
- Capturas: escritorio1366x900 y móvil390x844 previas al último margen del texto; controles
  flotantes cubrían parte de la nota móvil. Código añadió margen; confirmación visual final
  bloqueada por preferencia guardada del navegador, incluso tras nueva autorización del usuario.
- design-detector.json: [] en su ejecución sobre dos componentes cambiados antes del margen;
  análisis automático complementario, no auditoría completa de accesibilidad.
- knowledge-check.txt: mapa actual; refresh AST local tuvo fallback secuencial Windows y12
  archivos sin símbolos. Mapa ignorado, no credenciales ni runtime extra.
- attempts.json/browser-observations.json/pdf-qa.json/sanitized-secret-check.json/manifest.json:
  intentos, alcance, QA y hashes del corte; no cifras históricas contadas como nuevas.

Reproducción: preparar entorno aislado compatible en otro clon mediante flujo de cortes01/02,
sin resetear esta demo. Activar .venv313; pytest tests/test_report_pdf.py -q -p no:cacheprovider;
frontend npm run test:components, test:routing, typecheck, check:frontend, build. HTTP requiere
ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS=1, URL de BD local igual en DATABASE_URL y
ASHAKIDS_TEST_DATABASE_URL, ASHAKIDS_TEST_API_URL=http://127.0.0.1:8001/api/v1.
No ejecutar suite de integración completa sobre estos datos persistentes de demostración.

Limitaciones: ninguna prueba de carga/despliegue ni suite backend completa nueva; PDF sin
firma/versionado inmutable, ciertos caracteres devuelven422, mensuales pendientes. Mensajes
es siguiente módulo. Incidencia01 y reproducción por otro integrante permanecen pendientes.

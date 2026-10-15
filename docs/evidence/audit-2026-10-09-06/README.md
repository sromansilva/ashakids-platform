# AUDIT-2026-10-09-06 — Evidencia de mensajería

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: dev.
Base1398e706121fea153fe9f7481d24983d9e49911a (PR105 integrado).
Código7fddd59d6cc6ec594c666c9c80ba184a88c9a91d, V08_Mensajes_Familia_Terapeuta.
Documentación V09_Auditoria_Mensajeria; publicación concreta dev en PR/V10/historial.

## Entorno y alcance

.venv313 Python3.13.7; FastAPI0.143.0, SQLAlchemy2.1.4, asyncpg0.32.0.
API8001/web5174/PG17.6 local6544 ashakids_test_compat17. Sin dependencias nuevas.
Replica02 y clínica sintética02/03 conservadas; dos corridas crean14 mensajes (7 cada una),
conversación1. Login/logout modifica sesiones sintéticas. Sin usuarios/clínica nueva, reset,
DDL, Supabase ni pruebas sobre API8000/web5173. Modelo físico02 es antecedente histórico.

## Archivos

- backend-unit-tests.xml:36 finales correctas/0 fallos/omisiones/advertencias;25 mensajes y11
  regresión PDF. No DB real en unidad. Guardas de pytest impiden integrar BD compartida.
- frontend-first.xml:229 correctas/1 fallo de230; expectativa demo desactualizada. Corregida
  y230 correctas; dos pruebas nuevas de POST inválido agregadas dan232 finales en12 archivos.
- frontend-tests.xml:232 finales correctas,16 nuevas mensajes. Fetch simulado/jsdom,
  no evidencia de interacción real entre navegadores.
- routing-tests.txt:25 finales correctas; typecheck.txt/frontend-check.txt/build.txt correctos.
 318 fuentes/máximo495 líneas; índice292.85kB/gzip92.55kB no es benchmark de carga.
- http-messaging-first.json:47 verificadas+OpenAPI,7 mensajes nuevos. http-messaging.json:
  53 verificadas+OpenAPI,otros7, paginación14 sin IDs repetidos y lectura tras relogin igual.
  Dos aperturas simultáneas devuelven misma pareja;5 envíos concurrentes persisten.
  5 logout auxiliares de cleanup no se incluyen ni se afirman como casos verificados.
- design-detector.json:sin hallazgos, ejecutado una vez para tres componentes modificados;
  no sustituye revisión visual ni certifica accesibilidad completa.
- knowledge-check.txt:mapa actual; AST local/no-label, fallback Windows. Grafo regenerable
  ignorado; sin credenciales/datos clínicos; no certifica que llamadas HTTP funcionen.
- attempts.json:iteraciones y límites; browser-limitation.json:antecedente de preferencia
  denegada, sin nueva llamada/screenshot en06 ni evasión por otro origen/herramienta.
- pdf-qa.json:verificación de PDF de auditoría; sanitized-secret-check.json:revisión dirigida
  de secretos sin imprimir valores; manifest.json:SHA256 de evidencia y entregables asociados.

## Repetición acotada

Desde backend, usar .venv313: pytest tests/test_mensajeria.py tests/test_report_pdf.py -q
-p no:cacheprovider --junitxml=../docs/evidence/<nuevo-corte>/backend-unit-tests.xml.
Desde frontend: npm run test:components, test:routing, typecheck, check:frontend, build.
Desde raíz: python tools/knowledge/manage.py refresh y check usando wrapper/entorno configurado.

Guion real: desde backend ejecutar python -m scripts.verify_messaging --output
../docs/evidence/<nuevo-corte>, con ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS=1,
ASHAKIDS_TEST_API_URL=http://127.0.0.1:8001/api/v1 y DATABASE_URL igual a
ASHAKIDS_TEST_DATABASE_URL, ambas de la BD local ashakids_test_compat17 en6544.
Configurar conexiones en entorno ignorado, sin copiar URL/secretos a evidencias.
Repetir añade7 mensajes y sesiones; no sobrescribir este corte ni ejecutar prepare/TRUNCATE.
Para otro clon, seguir preparación del entorno01/02 sin resetear esta demo existente.

Aceptación visual desktop/móvil, recaptura PDF05, segundo clon, incidencia01 y aceptación
conjunta siguen pendientes. Chat sin asignación/archivado se prueba con mocks para evitar
modificar tratamientos de demo. Sin carga/pentest/despliegue ni certificación de toda la web.

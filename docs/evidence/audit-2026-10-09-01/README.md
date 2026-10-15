# Evidencia AUDIT-2026-10-09-01

[Informe](../../audits/auditoria-2026-10-09-01.md) y [PDF](../../../output/pdf/Auditoria_Fase2_AshaKids_2026-10-09-01.pdf).
HEAD 82f868fd4a1b7e7d40a636651c13d9add472c71f + cambios locales identificados en manifest.json.

## Resultados

Backend: 72 aprobadas/25 omitidas/19 advertencias. Frontend: 153 componentes/25 rutas aprobadas,
typecheck/check/build correctos. HTTP posterior: 27 casos. Regresión final guardas: 7 aprobadas,
20 omitidas, 1 aviso de permisos de caché pytest; son repeticiones, no cobertura adicional.
XML before-fix y cold-load conserva fallos anteriores; no son los resultados finales.
Primera ejecución heredada tocó API habitual compartida: ver legacy-target-incident.json
y sección 06 del informe; no hay reversión ni certificación del estado de esa base.

## Reproducir en PowerShell

Usar una **BD local descartable** nueva y los requisitos de README. Nunca usar el .env compartido
como destino de estas pruebas. El entorno local de este corte se conserva en tmp/phase2-postgres,
puerto 6543. Una instalación distinta puede usar su PostgreSQL local y la misma convención.
Importar backend/scripts/db_creation.sql corregido mediante psql antes de la suite.

Desde backend:

```powershell
$env:ASHAKIDS_TEST_DATABASE_URL='postgresql+asyncpg://postgres@127.0.0.1:6543/ashakids_test_phase2'
$env:DATABASE_URL=$env:ASHAKIDS_TEST_DATABASE_URL
.\.venv313\Scripts\python.exe -m pytest -q --junitxml='../docs/evidence/audit-2026-10-09-01/backend-tests.xml'
# pytest trunca fixtures. Preparar demostración DESPUÉS de la suite:
.\.venv313\Scripts\python.exe -m scripts.phase2_sandbox prepare
$env:CORS_ORIGINS='["http://127.0.0.1:5174"]'
$env:SESSION_COOKIE_NAME='ashakids_audit_session'
.\.venv313\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Desde otra terminal, frontend:

```powershell
$env:VITE_API_BASE_URL='http://127.0.0.1:8001/api/v1'
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Abrir http://127.0.0.1:5174/login. Códigos: a90001, p90001, p90002, t90001, t90002.
Clave pública exclusivamente ficticia: Auditoria-Sintetica-2026! (constante del script).
ADMIN /admin/pacientes crea paciente para p90001 y asigna tratamiento a t90001.
PADRE /padre/agenda solicita cita futura. TERAPEUTA /terapeuta/agenda acepta.
En terminal backend, con env descartable: `python -m scripts.phase2_sandbox due` usando
el Python de .venv313. Ese comando ajusta las citas confirmadas locales, no el reloj.
TERAPEUTA selecciona Día -> Ver detalle -> Registrar sesión -> Iniciar sesión clínica ->
guardar cuatro campos de reporte, incluyendo marcador AUDIT-2026-10-09-01 -> Finalizar.
PADRE entra de nuevo y consulta /padre/reportes; abrir sesión y recargar.

Después del guion anterior, desde backend:

```powershell
$env:ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS='1'
$env:ASHAKIDS_TEST_API_URL='http://127.0.0.1:8001/api/v1'
.\.venv313\Scripts\python.exe -m scripts.phase2_verify_http
.\.venv313\Scripts\python.exe -m scripts.phase2_sandbox inspect
```

phase2_verify_http comprueba los IDs 1 del guion y el marcador; usar prepare antes del guion
para que sea reproducible. No ejecuta altas de pacientes ni edita reportes permitidos.
Sí crea/cierra sesiones de autenticación ficticias y ensaya una escritura denegada a PADRE.
Las suites heredadas usan otras fixtures y no deben activarse para este guion.

Frontend: `npm run test:routing`, `npm run test:components`, `npm run typecheck`,
`npm run check:frontend`, `npm run build`. Esas pruebas de componentes usan mocks HTTP.
Desde raíz: `python tools/knowledge/manage.py refresh` y `check` tras cambios.

## Archivos

- backend-tests.xml: suite final; backend-api-evidence.json: resultados HTTP ASGI deduplicados.
- frontend-tests.xml: componentes finales; routing-tests.txt y frontend-*.txt: controles.
- http-persistence-permissions.json: 27 casos contra servidor HTTP real aislado.
- database-model.json: tablas/restricciones/conteos; fresh-schema.txt: importación en otra BD vacía.
- ui-http-log.txt: solo método/ruta/status de API 8001, sin cookies/cuerpos ni credenciales.
- 01-06*.png: capturas ficticias; ui-report-reload.txt: contenido visible tras recarga.
- manifest.json: hashes del código, documentación, PDF y evidencia del corte (sin .env).

## Parar la instalación local de este corte

Los procesos iniciados en la auditoría tienen PID API 34448 y UI 19800; comprobar que el PID
sigue correspondiendo al proceso y a su comando antes de detenerlo, pues Windows los reutiliza.
No detener servicios habituales. Cluster dedicado:

```powershell
& './tmp/phase2-postgres/pgsql/bin/pg_ctl.exe' -D './tmp/phase2-postgres/data' stop -m fast
```

Este directorio está ignorado por Git. No copiarlo a la entrega. El PDF y fuentes/evidencias
sí deben compartirse en el commit del equipo, junto a las correcciones de código.

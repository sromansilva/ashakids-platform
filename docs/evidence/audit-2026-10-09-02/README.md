# Evidencias AUDIT-2026-10-09-02

Rama piero-dev, HEAD 82f868fd4a1b7e7d40a636651c13d9add472c71f con cambios sin commit/push.
Repositorio https://github.com/sromansilva/ashakids-platform . Fecha: 09 octubre 2026 Lima.

## Alcance y resultados

Supabase: solo lectura de metadatos y existencia de dos IDs sintéticos de incidencia previa.
PG17.6; 26 tablas, 178 columnas, 92 restricciones, 71 índices. Sin datos clínicos, sin
escrituras ni DDL compartidos. RLS habilitada en 26 tablas, cero políticas; runtime BYPASSRLS.
IDs 44/45 no existen ahora; no determina/restaura todo el impacto histórico de auditoría 01.

Exportación schema-only sin propietarios/permisos/comentarios; estructura pública replicada
en PostgreSQL 17.6 local 6544, ashakids_test_compat17. Modelo: 6 diferencias en 4 campos
corregidas; 0 diferencias de columnas modeladas después. Las 9 tablas extra no certifican APIs.

79 pruebas aprobadas, 25 omitidas, 19 advertencias; 48 respuestas HTTP verificadas; familia
consulta reporte sintético y recarga en frontend 5174/API8001. Persistencia SQL final: 5
usuarios, 1 paciente/tratamiento/reserva/sesión/reporte. No es una prueba de despliegue.

## Archivos

- shared-schema-readonly.json: lectura inicial con concesiones anon e incidencia sintética.
- shared-before-model-fix.json / shared-after-model-fix.json: comparación ORM en solo lectura.
- local17-after-model-fix.json / schema-comparison.json: versión y metadatos de réplica.
- shared-public-schema.sql / schema-export-provenance.json: exportación de estructura, hash.
- backend-dependencies.txt: versiones realmente instaladas, no una promesa de lock Linux.
- backend-tests.xml: suite final. backend-tests-before-fixture-fix.xml: 25 errores iniciales
  de propietario de secuencia, además de 47 pass/25skip/19warnings. No sumar ambas ejecuciones.
- backend-api-evidence.json: métodos/rutas/estados agregados de la suite final en proceso.
- real-http-journey.json: 48 respuestas HTTP reales, roles sintéticos, sin cookies/payloads.
- local-final-inspection.json: restricciones/conteos sintéticos posteriores al recorrido.
- family-report-reload.png: consulta familiar tras login/recarga; no todo el recorrido UI.
- attempts.json: fallos previos y correcciones del guion; no defectos ocultos de la API.
- knowledge-check.txt / runtime-provenance.json / manifest.json: mapa, runtime y hashes.

## Reproducción

Usar una BD **local descartable**, con PostgreSQL 17.6 y esquema público exportado. No usar
una BD con historial que se quiera conservar: pytest y prepare hacen TRUNCATE CASCADE.
El propietario restaura el SQL sobre esquema public vacío. Crear roles ADMIN/PADRE/TERAPEUTA
en tabla roles; son datos de preparación, no vienen en la exportación schema-only.

Rol sintético de aplicación: NOSUPERUSER BYPASSRLS, sin CREATEDB/CREATEROLE. Conceder USAGE
en esquema, SELECT/INSERT/UPDATE/DELETE en tablas y USAGE/SELECT/UPDATE en secuencias locales.
La conexión propietaria se usa solo para limpieza; no asignarla al runtime de la API.

En PowerShell, desde backend (las siguientes URL son únicamente locales sin secretos):

```powershell
$env:ASHAKIDS_TEST_DATABASE_URL='postgresql+asyncpg://ashakids_audit_runtime@127.0.0.1:6544/ashakids_test_compat17'
$env:ASHAKIDS_TEST_ADMIN_DATABASE_URL='postgresql+asyncpg://postgres@127.0.0.1:6544/ashakids_test_compat17'
$env:DATABASE_URL=$env:ASHAKIDS_TEST_DATABASE_URL
./.venv313/Scripts/python.exe -m pytest -q -p no:cacheprovider --tb=short --junitxml='../tmp/reproduction-tests.xml'
./.venv313/Scripts/python.exe -m scripts.phase2_sandbox prepare
```

Reemplazar el puerto/BD solo por otro destino local ashakids_test_* si se reproduce en otro
equipo. No sobrescribir las evidencias de este corte. Guardas exigen ambas URL en mismo destino
y sin query params. El valor ADMIN no se usa para operaciones de la app.

Ejecutar uvicorn en otra terminal con DATABASE_URL del runtime, CORS_ORIGINS para 5174 y
SESSION_COOKIE_NAME=ashakids_audit_session. Frontend aislado debe tener
VITE_API_BASE_URL=http://127.0.0.1:8001/api/v1. Mantener la API habitual 8000 separada.

```powershell
$env:ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS='1'
$env:ASHAKIDS_TEST_API_URL='http://127.0.0.1:8001/api/v1'
./.venv313/Scripts/python.exe -m scripts.verify_compatibility_journey --output ../tmp/reproduction-http.json
./.venv313/Scripts/python.exe -m scripts.phase2_sandbox inspect
```

Guion presupone fixture nueva (IDs de tutor/terapeuta 1), preparada con prepare; solo úsese
contra el uvicorn cuya configuración de BD se haya comprobado. Las guardas de URL del cliente
no inspeccionan a distancia la configuración interna de un proceso servidor arbitrario.
Contraseña de las cinco identidades públicas de prueba: Auditoria-Sintetica-2026!.
No repetir pytest después del recorrido si se pretende conservar esa demostración.

Inspección compartida de solo lectura (configuración privada local, nunca pegarla en evidencia):
`python -m scripts.inspect_schema_compatibility --target shared --output ../tmp/shared-readonly.json`.
Retirar overrides DATABASE_URL locales antes de usar shared; el comando toma la configuración
efectiva del backend. --target shared es una etiqueta, no descubre automáticamente el host.

## Límites

Infraestructura, TLS y permisos difieren: runtime compartido tiene CREATEDB/CREATEROLE;
réplica no. SSL compartido observado, loopback sin TLS. No se verificó cadena de certificado,
host Linux, dominios externos, Data API anon, carga ni todos los módulos. Pruebas frontend
de la auditoría 01 son históricas. Fase3 siguiente; hosting informativo después de estabilidad.
Manifest identifica evidencia y fuentes del corte; el mapa Graphify no se versiona.

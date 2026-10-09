# Configuración de seguridad del backend

Repositorio: https://github.com/sromansilva/ashakids-platform . Corte13, 2026-10-09.

## Desarrollo con Supabase real

Conservar DATABASE_URL y puertoHTTP8000 en backend/.env privado. No cambiar frontend a8001 ni sustituir el destino por una base local. Configurar DB_SSL_CA_FILE con la ruta absoluta de la CA descargada del panel oficial de Supabase. En este equipo se usa el certificado aportado prod-ca-2021.crt fuera del repositorio. No versionar .env, contraseñas, tokens, claves privadas ni guiones con credenciales.

Supabase Root2021 requiere DB_SSL_LEGACY_CA=true en Python3.13 porque carece de keyUsage (error TLS92 observado). La opción está desactivada por defecto y exige CA explícita. Solo tolera el formato legado; conserva CERT_REQUIRED, validación de cadena/vigencia y nombre del servidor. Sin CA correcta la API falla de forma segura y readiness devuelve503. No agregar ssl=disable, CERT_NONE ni desactivar hostname para resolver errores. Sustituir CA y retirar la excepción cuando el proveedor entregue una cadena compatible.

Después de configurar, ejecutar desde backend: `.venv313/Scripts/python.exe -m scripts.verify_backend_readonly --output ../tmp/database-readonly.json`. Verifica TLS válido, rechazo sin trust store, metadatos y SELECT LIMIT0; no crea sesiones ni datos. Para arrancar: `.venv313/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. Si ya existe una instancia del proyecto con --reload, usarla; no iniciar otra sobre el mismo puerto.

## Producción todavía pendiente

ENVIRONMENT=production, CORS_ORIGINS con origen HTTPS final sin rutas/fragmentos/comodines y DATABASE_URL del runtime separado. TLS del cliente sigue obligatorio. Publicar web y API bajo el mismo sitio mediante proxyHTTPS para la cookie SameSite=Lax. La aplicación rechaza escrituras recibidas por HTTP; configurar correctamente el proxy ASGI para que reconozca HTTPS únicamente desde IPs confiables. No usar --forwarded-allow-ips='*' ni exponer directamente un listener detrás del proxy. Probar Set-Cookie Secure/HttpOnly/SameSite=Lax, origen inválido403, acceso sin sesión401, logout/revocación/expiración y recarga de SPA en el dominio final.

WEB_CONCURRENCY=1 y un solo proceso de aplicación hasta disponer de protección compartida. Valores por defecto de login:30 solicitudes por IP y5 por IP/código cada300segundos. Las rechazadas no prolongan el bloqueo. Retry-After indica recuperación; otras IPs no bloquean globalmente una cuenta. LOGIN_LIMITER_MAX_KEYS=10000 limita memoria y rechaza solicitudes nuevas si se llena hasta que expiren entradas. Un reinicio borra el presupuesto; no es un limitador distribuido. WEB_CONCURRENCY no detecta workers fijados por CLI ni réplicas de hosting. Ajustar límites solo con observación y pruebas acotadas; no lanzar fuerza bruta sobre Supabase.

DB_CONNECT_TIMEOUT=10s, DB_COMMAND_TIMEOUT=15s, DB_POOL_TIMEOUT=10s. Un conflicto de datos/deadlock/serialización falla409, entrada inválida422, origen/rol403, sesión inválida401 y indisponibilidad503. No reintentar automáticamente escrituras: una respuesta perdida puede requerir cotejar la persistencia. Reportes concurrentes se serializan por sesión y usan último escritor completo; no hay control optimista por versión. Chat sin UNIQUE de pareja/idempotencia solo protege escritores que respetan los bloqueos de esta API.

Antes de publicar: responsable coordina rotación de credenciales existentes, confirma backups/restauración, evalúa privilegios y aprueba B02. No suspender cuentas ni revocar permisos por seguir esta guía. Una publicación Git no es un hosting de producción.

## Pruebas autorizadas y continuidad

Selección segura sin BD: `.venv313/Scripts/python.exe -m pytest --noconftest -p no:cacheprovider tests/test_backend_hardening.py tests/test_auth_api.py tests/test_auth_security.py tests/test_config_isolation.py tests/test_mensajeria.py tests/test_report_pdf.py tests/test_models.py -q`. No ejecutar la suite clínica ni configurar ASHAKIDS_TEST_DATABASE_URL sobre Supabase: conftest.py contiene TRUNCATE.

Recorrido de escritura explícito: `python -m scripts.verify_hardening_journey --execute-authorized --output ../tmp/journey.json`. Requiere autorización humana nueva conforme a AGENTS.md, credenciales ADMIN de bootstrap privadas ASHAKIDS_AUDIT_ADMIN_CODE/PASSWORD y API8000 actualizada. Crea cohorte AUDITORIA nueva, comprueba sesión en BD configurada antes de clínica, prueba roles/estados/concurrencia con sesiones distintas y conserva datos. No DDL/TRUNCATE/borrado físico ni modificación de cuentas clínicas anteriores. Credenciales generadas quedan solo en tmp/AUDITORIA13_*private.json ignorado; nunca publicarlas. Cada ejecución agrega datos sintéticos que deben excluirse de métricas clínicas. No ejecutar para comprobar meramente health/readiness.

El responsable conserva los IDs publicados por corte. No borrar datos anteriores para repetir una prueba. Los DELETE físicos no se prueban con la autorización vigente; su existencia en OpenAPI no demuestra ni impide su funcionamiento.

Referencias: [Python SSL](https://docs.python.org/3.13/library/ssl.html), [Supabase conexión](https://supabase.com/docs/guides/database/connecting-to-postgres), [Uvicorn proxy headers](https://www.uvicorn.org/settings/#http).

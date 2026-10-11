# QA de ASHAKids

Suite reproducible para validar el frontend y la API en un orden fijo. Los reportes se generan en `qa/reports/` y no se versionan.

## Orden de ejecución

### 1. Smoke de API

Levanta el backend en un entorno local o aislado y ejecuta:

```powershell
pwsh -File .\qa\api\smoke.ps1 -BaseUrl http://127.0.0.1:8000
```

Comprueba `/health`, `/health/ready` (incluye conexión PostgreSQL) y `/openapi.json`. Si la base no está disponible, el fallo queda explícito; no se crea ni modifica ningún registro.

También existe una colección de solo lectura para Postman CLI:

```powershell
postman collection run .\qa\api\ASHAKids-QA-Smoke.postman_collection.json `
  --env-var "base_url=http://127.0.0.1:8000"
```

### 2. Playwright E2E

Desde `frontend/` instala el navegador una sola vez y ejecuta el smoke público:

```powershell
npx playwright install chromium
$env:E2E_BASE_URL = "http://127.0.0.1:5174"
$env:E2E_START_SERVER = "true"
npm run qa:e2e
```

La prueba de login está condicionada a `E2E_TEST_CODE` y `E2E_TEST_PASSWORD`. Usa únicamente una cuenta aislada de QA y define `E2E_EXPECTED_PATH` según el rol.

### 3. Lighthouse

Con el frontend levantado:

```powershell
$env:LIGHTHOUSE_URL = "http://127.0.0.1:5174/"
npm --prefix .\frontend run qa:lighthouse
```

El JSON queda en `qa/reports/lighthouse/lighthouse-report.json`.

### 4. Accesibilidad con axe

```powershell
npm --prefix .\frontend run qa:a11y
```

Se bloquean violaciones críticas en `/` y `/login`; el detalle completo se adjunta al reporte HTML de Playwright.

### 5. Rendimiento con k6

El script solo consulta `/health`, usa una carga mínima y está bloqueado por defecto para evitar tráfico accidental:

```powershell
$env:K6_ALLOW_LOAD_TEST = "true"
$env:K6_BASE_URL = "http://127.0.0.1:8000"
$env:K6_VUS = "1"
k6 run .\qa\load\k6-smoke.js
```

Para un entorno remoto se debe confirmar antes el host, VUs y duración. Render exige además `K6_ALLOW_PRODUCTION=true`.

### 6. OWASP ZAP baseline

Requiere Docker y autorización del objetivo:

```powershell
$env:ALLOW_SECURITY_SCAN = "true"
$env:QA_TARGET_URL = "http://127.0.0.1:5174"
pwsh -File .\qa\security\zap-baseline.ps1
```

El script bloquea por defecto escaneos sobre `*.onrender.com`; no uses la excepción de producción sin confirmar la ventana y el objetivo.

## Backend aislado

Las pruebas de integración existentes usan `ASHAKIDS_TEST_DATABASE_URL` y crean una base desechable. No apuntes esa variable al `.env`, a Supabase compartido ni a producción. Ejecuta pytest solo cuando tengas una URL de base aislada:

```powershell
$env:ASHAKIDS_TEST_DATABASE_URL = "postgresql+asyncpg://..."
python -m pytest backend/tests -q
```

## CI

El pipeline debe ejecutar primero typecheck/build/unit tests, después los smoke de API y, por último, E2E/axe con secretos de QA. Las pruebas de carga y ZAP deben ser jobs manuales o de entorno controlado, nunca un paso automático contra producción.

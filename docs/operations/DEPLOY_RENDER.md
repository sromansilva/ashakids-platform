# Despliegue de demostración AshaKids en Render

Fecha: 2026-10-09. Repositorio: https://github.com/sromansilva/ashakids-platform .
Preparación en piero-dev desde V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b.
Publicación funcional HTTPS pendiente; esta guía no certifica un despliegue.

## Elección

Render Web Service gratis sirve React compilado y FastAPI bajo una URL HTTPS.
PostgreSQL continúa en Supabase con ashakids_runtime. No crear Render Postgres ni
migrar datos. Vercel es una alternativa para React con proxy hacia la API: dos servicios.
Railway Hobby parte de US$5/mes con consumo incluido y extras si lo supera.
Render Free se suspende tras15min inactivo y tarda aproximadamente un minuto en despertar.
Consultar cuotas actuales; no agregar tarjeta ni activar Starter para esta demostración.

Fuentes: [Render Free](https://render.com/docs/free),
[Railway](https://docs.railway.com/pricing/understanding-your-bill),
[Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Crear y vincular la cuenta

1. Abrir https://dashboard.render.com/register e iniciar con GitHub.
2. Permitir acceso a sromansilva/ashakids-platform. Si no aparece el repositorio,
   solicitar al propietario acceso a la aplicación Render; no cambiar su visibilidad.
3. New -> Web Service -> repositorio -> rama dev.
4. Runtime Docker, Root Directory vacío, Dockerfile ./Dockerfile, contexto raíz.
5. Elegir Free, una instancia, Auto Deploy Off, Health Check Path /health/ready.
   No configurar Build/Start Command Python: el Dockerfile hace ambas etapas.
6. Elegir región cercana a la BD o público antes de crear el servicio. Verificarla
   en el panel Supabase; no deducirla del host directo.

Alternativa: New -> Blueprint desde dev utiliza render.yaml. No crear ambos y duplicar
servicios. Blueprint pide DATABASE_URL/DB_SSL_CA_FILE; si basta confianza pública del
sistema, omitir DB_SSL_CA_FILE usando el formulario manual de Web Service.

## Variables del servicio

| Variable | Valor/uso |
| --- | --- |
| ENVIRONMENT | production |
| WEB_CONCURRENCY | 1; una instancia, sin autoscaling |
| DATABASE_URL | URI privada del pooler de sesión usando ashakids_runtime |
| CORS_ORIGINS | Opcional: origen(s) HTTPS final(es), sin rutas/comodines |
| PUBLIC_ORIGIN | Opcional: origen HTTPS del dominio propio |
| FORWARDED_ALLOW_IPS | Inicial127.0.0.1,::1; después ingreso confirmado de Render |
| DB_SSL_CA_FILE | Omitir para CA pública del sistema, o /etc/secrets/prod-ca.crt |
| DB_SSL_LEGACY_CA | false; true solo con CA2021 explícita que lo requiera |

PORT viene de Render. Arranque usa RENDER_EXTERNAL_URL para CORS sin override.
FRONTEND_DIST_PATH y /api/v1 están configurados en la imagen. No subir .env completo:
ADMIN de auditoría, propietario, SUPABASE_KEY y claves privadas no son necesarios.
Cookie: Secure/HttpOnly/SameSite=Lax. No agregar Supabase Auth ni acceso SQL desde React.

### PostgreSQL y TLS

Supabase -> Connect -> Session pooler,5432: copiar host exacto y project-ref.
Usar usuario ashakids_runtime.[project-ref] y la contraseña runtime ya creada.
Formato ilustrativo (placeholders, nunca una credencial real):

```text
postgresql+asyncpg://ashakids_runtime.PROJECT_REF:PASSWORD_URL_ENCODED@POOLER_HOST:5432/postgres
```

No usar contraseña postgres ni anon/service-role key. La conexión directa suele ser
IPv6; Render requiere la alternativa IPv4. No adivinar aws-0/aws-1/región ni cambiar
.env local. Si falla el rol personalizado, comprobar pooler y detener adopción hasta
probarlo; no conceder pertenencias ni modificar otras identidades para resolverlo.
No usar pooler transacciones6543 sin revisar compatibilidad de asyncpg/prepared statements.

Si falta CA: descargar la del destino oficial, cargar Environment -> Secret Files ->
prod-ca.crt y DB_SSL_CA_FILE=/etc/secrets/prod-ca.crt. No desactivar TLS/hostname.

### Proxy HTTPS

Primer deploy permite GET/health y HTML. Proxy sin confiar: escrituras HTTP internas403;
login aún no aceptado. Revisar logs de GET /health para identificar el peer y confirmar
con Render IPs/rangos del ingreso; configurar FORWARDED_ALLOW_IPS y redesplegar.
No usar '*', redes /0, IPs de salida ni deducir una subred completa de una IP.
Si cambia el peer, repetir verificación. Listener accesible solo detrás del ingreso.
Este punto permanece pendiente hasta verificar transporte y cliente en el hosting real.

## Aceptación en URL final

1. Registrar servicio/región/URL/SHA RENDER_GIT_COMMIT y cotejar dev.
2. GET /health y /health/ready200; / HTML; recargar /login y pantalla profunda;
   assets/API inexistentes404. Revisar logs/build sin copiar credenciales.
3. Confirmar READ ONLY rol ashakids_runtime y TLS verificado en la conexión del hosting.
4. Registros AUDITORIA nuevos: login, recarga, /auth/me; verificar Secure/HttpOnly/Lax,
   origen externo403 y sin sesión401. Probar reserva/sesión/reporte/mensaje y logout.
5. Conservar IDs/evidencia sanitizada. No modificar cuentas/historial ni cohortes previas;
   no ejecutar DELETE físicos, pytest/conftest o phase2_sandbox sobre Supabase (TRUNCATE).
6. Abrir URL unos minutos antes de la demo para despertar. No programar pings para
   intentar eliminar las restricciones gratuitas.

Datos persistentes en Supabase; disco efímero sin adjuntos duraderos nuevos. Arranque
sin DDL/semillas. Git/push no certifica aceptación HTTPS, backups ni capacidad de carga.

## Verificación local de preparación

Frontend: npm run typecheck y npm run build. Backend sin BD:

```text
.venv313/Scripts/python.exe -m pytest --noconftest -p no:cacheprovider tests/test_frontend_hosting.py tests/test_backend_hardening.py tests/test_auth_api.py tests/test_auth_security.py tests/test_config_isolation.py tests/test_mensajeria.py tests/test_report_pdf.py tests/test_models.py -q
```

138 aprobadas,19 advertencias de Starlette/httpx/cookies; tipos/build aprobados, aviso
Node DEP0205. Sandbox bloqueó temporales pytest y esbuild; repetidos con acceso autorizado.
4 fallos de rutas Windows/dotfile se corrigieron antes del resultado final. Smoke ASGI
con el dist real y origen HTTPS sintético:11 respuestas esperadas, sin consultas BD ni
sesiones de login. Graphify refresh/check vigente. Docker no instalado: construcción
Linux pendiente. No nueva suite de componentes ni E2E hosting.

Auto Deploy Off; reversión desde Render al deploy previo cuando exista. No revertir datos,
roles o .env por fallos de imagen. Primera publicación no tiene deploy anterior aún.

Fuentes: [Docker](https://render.com/docs/docker), [Blueprint](https://render.com/docs/blueprint-spec),
[Secret Files](https://render.com/docs/configure-environment-variables),
[Entorno Render](https://render.com/docs/environment-variables),
[Supabase IPv4](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP),
[Uvicorn](https://uvicorn.dev/settings/#http).

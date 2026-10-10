## Confirmación de despliegue y acceso — V45 / 2026-10-10

Render V44/1fc19b36598cf96cbc89d36a85fb9ca6c062eda3 confirmado Live, deploy
dep-db57tms9v7es738s1aa0, Auto-Deploy48.2s. dev/codex/2do-intento sincronizados.
12 respuestas ADMIN HTTPS repetidas después de ese despliegue, correctas; cookie
segura y revocación verificadas. No se ampliaron lógica, datos ni UI en este cierre.
El usuario confirmó crear un padre desde ADMIN e ingresar correctamente en Render;
esto es confirmación humana, no una nueva creación ni prueba automatizada del agente.
Se aclaró el supuesto pendiente de alta terapeuta: ya existe en Cuentas → pestaña
Terapeutas → Nueva cuenta. Formulario vacío abierto en producción, código automático,
DNI inicial y cambio obligatorio; fuente confirma POST/admin/cuentas/terapeutas.
No se envió ese formulario ni se creó una cuenta para probar. Queda verificar su alta,
activación e ingreso con credenciales vigentes; no afirmar que falta implementar el alta.
Imagen recortada al diálogo para excluir datos privados del listado: therapist-create-form.png.
Fuentes verificadas: AdminCuentas.tsx/handleCrear, AdminCuentasCrearModal.tsx,
adminService.ts y backend/app/services/admin_cuentas_creacion.py/crear_terapeuta.
V45 solo documenta aceptación, ubicación de la función y evidencia final de V44.
Siguiente: alta/activación terapeuta por ADMIN, publicar horarios y probar el recorrido
con cuentas autorizadas; después pulir inconsistencias visuales y responsive diferido.

## Estado operativo actual — 2026-10-10 / V44

Fuente API/UI comprobada: V43/4d2f0725566021824d1b8c20bba6dd8c241e21a0.
Servicio ashakids, URL https://ashakids.onrender.com, rama dev. Auto-Deploy activo
observado en el panel; la receta Off inferior describe la preparación histórica.
El cierre V44 se publica en dev/codex/2do-intento; consultar Git y live para SHA final.

### Error503 del login y resolución

El código V42 estaba live y readiness200, pero el esquema compartido carecía de002–005.
La consulta de usuarios incluía password_change_required ausente; el manejador DBAPI
devolvía el mensaje genérico de BD temporalmente no disponible. No era una prueba de
contraseña incorrecta ni de falta de conectividad. Readiness solo ejecuta SELECT1.

Se respaldó public con pg_dump custom134561bytes y se verificó hash/listado pg_restore.
Backup/datos/credenciales privados en tmp/flow-adoption-v44/, ignorados; manifiesto
sanitizado versionado, nunca publicar el dump. No se ensayó restauración compartida.
Preflight: propietario válido, cero códigos duplicados por casefold, rol runtime restringido.
002–006 aplicadas en transacción explícita con lock_timeout5s, statement_timeout30s
y bloqueo asesor. Filas/ACL anteriores preservadas. No repetir estos archivos en este destino.

006 concede SID a turnos/bloqueos, SIU a preferencias/avisos y USAGE a tres secuencias.
RLS habilitada y12 políticas para runtime, sin permisos de acceso externo en tablas nuevas.
Los contratos de permisos se reflejan en b02_role_inventory.py; ADR0018 explica el límite.
Cada clon obtiene las credenciales runtime por el canal autorizado; nunca usar owner en API.

23 modelos SELECT LIMIT0 y cero diferencias de metadatos observadas; TLS1.3.
HTTPS ADMIN login/lectura/logout verificados,12 respuestas esperadas, cookie segura y
panel cargado. Tutor/terapeuta requieren confirmar sus credenciales actuales: no se
modificaron contraseñas para pruebas. No se realizó un recorrido clínico productivo.
Cada profesional debe publicar disponibilidad; las tablas nuevas no inventan horarios.
Planes anteriores conservan origenNULL; no fabricar introducciones o mundos asignados.

NOTIFICATION_REMINDERS_ENABLED=true se guardó después de migrar y se verificó en panel,
con despliegue V43live44.8s. No hay reconstrucción de eventos anteriores ni garantía
de recordatorios mientras Render Free duerme. No se envió correo/SMS/push.
Evidencias y advertencias en docs/evidence/deploy-v44/. Pruebas backend157PASS/75skip/
19avisos; las integraciones omitidas no se ejecutaron en Supabase. Mapa2219/106 vigente.
Antes de futuros despliegues, revisar migraciones/grants y SELECT LIMIT0 con runtime:
un build exitoso o health200 no certifica compatibilidad de esquema.
Revertir código conservando datos nuevos; restauración/borrado requieren operación separada.

---

# Despliegue de demostración AshaKids en Render

Fecha: 2026-10-09. Repositorio: https://github.com/sromansilva/ashakids-platform .
Preparación en piero-dev desde V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b.
Publicado y aceptado el2026-10-09: https://ashakids.onrender.com. Imagen dev/V24/62905fc0480fffd21fb6b2d969592700608d64bb. Ver corte15 para evidencia nueva.

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
| FORWARDED_ALLOW_IPS | 127.0.0.1,::1; login/escrituras reales aceptados con este valor |
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

En el despliegue actual,127.0.0.1,::1 bastó para reconocer HTTPS y aceptar login/escrituras.
No ampliar por observar una IP privada en logs ni deducir redes enteras; no usar '*',
redes /0 ni IPs de salida. Si cambia el ingreso y aparecen403 de transporte, verificar
de nuevo el peer/arquitectura con Render antes de modificar confianza.

### Configuración efectiva y SCRAM

Servicio ashakids/srv-db4penqjnfac7382hjhg, Free Virginia, Auto Deploy Off.
CA oficial Supabase2021 en prod-ca.crt; DB_SSL_CA_FILE=/etc/secrets/prod-ca.crt y
DB_SSL_LEGACY_CA=true por formato keyUsage antiguo; CERT_REQUIRED/hostname intactos.
Pooler sesión5432 oficial aws-1-us-east-1.pooler.supabase.com; usuario del rol runtime
con sufijo de proyecto. No copiar aquí la URI completa ni enviar .env/ADMIN/owner.

Supavisor2.9.10 rechazaba el verificador32768 anunciando4096. Tras autorización,
solo ashakids_runtime se recalculó a4096 con la misma contraseña aleatoria. Permisos,
RLS y roles anteriores iguales. No MD5 ni TLS inseguro. ADR0012 detalla el menor coste
offline y seguimiento; verificar compatibilidad antes de subir iteraciones nuevamente.
La conexión directa local no fue modificada; su DNS no era accesible en esta red.

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
Linux verificado posteriormente en Render (build57.9s, Live). Esta regresión de V24 es evidencia heredada; el corte15 añade101 respuestas HTTPS,8 smoke y lectura SQL, sin nueva suite de componentes ni E2E visual exhaustivo.

Auto Deploy Off; reversión desde Render al deploy previo cuando exista. No revertir datos,
roles o .env por fallos de imagen. Primera publicación no tiene deploy anterior aún.

Fuentes: [Docker](https://render.com/docs/docker), [Blueprint](https://render.com/docs/blueprint-spec),
[Secret Files](https://render.com/docs/configure-environment-variables),
[Entorno Render](https://render.com/docs/environment-variables),
[Supabase IPv4](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP),
[Uvicorn](https://uvicorn.dev/settings/#http).

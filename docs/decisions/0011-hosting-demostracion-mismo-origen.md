# ADR 0011 - Hosting de demostración bajo un mismo origen

Fecha: 2026-10-09. Estado: preparación aceptada; publicación HTTPS pendiente.
Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: piero-dev.
Base revisada: V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b.

## Contexto

El responsable solicitó sincronizar dev y comenzar el despliegue. Eligió una
demostración gratuita y todavía necesita crear/vincular Render con GitHub.
React usa /api/v1 y cookies propias HttpOnly, SameSite=Lax. FastAPI exige HTTPS
y orígenes explícitos en producción. Supabase ya utiliza ashakids_runtime.

## Decisión

Preparar un Web Service Docker gratuito en Render desde dev, con compilación React
en Node22 y ejecución FastAPI en Python3.13. app.hosted sirve solamente el dist;
conserva API, health y documentación. app.main mantiene el desarrollo local.
No hay migraciones ni semillas al arrancar. React -> HTTP/JSON -> FastAPI ->
SQLAlchemy/PostgreSQL permanece. Un origen conserva cookies sin proxy entre dos hostings.
Render.yaml declara Free y despliegues manuales; no provisiona otra BD ni recursos pagos.

Un worker y una instancia por el limitador de login en memoria. El arranque exige
producción, origen HTTPS y proxies explícitos; rechaza '*' y redes /0. El ingreso real
de Render aún no se conoce: solo loopback es confiable inicialmente. Las escrituras
HTTP internas quedan rechazadas hasta configurar proxies confirmados por el proveedor.
No inventar subredes a partir de una dirección ni usar rangos de salida del servicio.

## Consecuencias

Render Free suspende el servicio tras15min sin tráfico; despertar tarda aproximadamente
un minuto. Sirve para demostración, con cuotas de construcción/transferencia. La región
se elige antes de crear el servicio según el proyecto Supabase y público esperado.
Railway sería una alternativa con facturación por consumo; Vercel puede servir React
posteriormente si se configura el mismo origen mediante proxy/dominio.

Configurar pooler de sesión5432 para IPv4 en Render, usuario ashakids_runtime.[project-ref]
y host exacto del panel. Comprobar conexión, rol y TLS en ese destino; no reutilizar por
suposición el host directo IPv6 o el pooler de transacciones6543. Conservar verificación
de cadena/hostname. La CA del destino puede diferir y se carga por archivo privado.
No cambiar .env local por preparar hosting ni añadir secretos a la imagen/Git.

Docker no está instalado en este equipo: construcción/arranque Linux pendientes en
Render. No se declara URL pública, aceptación HTTPS ni recuperación de backup.

## Referencias consultadas el 2026-10-09

- [Render Free](https://render.com/docs/free).
- [Docker](https://render.com/docs/docker) y [Blueprint](https://render.com/docs/blueprint-spec).
- [Entorno Render](https://render.com/docs/environment-variables).
- [Supabase IPv4/IPv6](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP).
- [Proxy Uvicorn](https://uvicorn.dev/settings/#http).

## Verificación posterior - 2026-10-09, corte15

Publicado https://ashakids.onrender.com, Free Virginia desde dev/V24/62905fc.
Build Linux57.9s, Live,8 smoke y101 respuestas HTTPS con nueva cohorte aprobados.
Loopback bastó sin ampliar FORWARDED_ALLOW_IPS. Pooler con runtime/TLS verificado,
CA2021 y ajuste SCRAM autorizado en ADR0012. Recuperación/carga siguen no ensayadas.

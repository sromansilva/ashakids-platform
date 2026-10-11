# Cierre operativo de configuración Gmail y boletín


## V58 — cierre operativo Gmail/boletín en Render / 2026-10-10

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama dev; código desplegado
d579a40ca28038f53c78e8bffdab63123c6e6eb3 (V53_Activar_autodeploy_Render_Gmail).
Deploy manual dep-db5h1tqd0e5s73fem3bg confirmado Live,51.4s. Servicio independiente:
no existe Blueprint ASHAKids asociado para sincronizar; rama dev, Auto-Deploy On Commit
y health check /health/ready verificados en el servicio existente, sin crear otro recurso.
Ocho variables Gmail/origen guardadas y comprobadas con valores solicitados, únicamente
en Render; secretos excluidos de archivos/Git/evidencia. DATABASE_URL, DB_SSL_CA_FILE
y DB_SSL_LEGACY_CA no editadas. El nombre del remitente quedó ASHAKids.

La misma BD/rol de Render tenía public.suscripciones_boletin con 11 columnas y RLS activo,
pero runtime sin SELECT/INSERT/UPDATE ni USAGE de secuencia y sin políticas: consulta
real falló42501. No se reaplicó009 ni se ejecutaron migraciones destructivas. Respaldo
custom/public179627bytes verificado con pg_restore--list y SHA256 antes del ajuste.
Se otorgaron únicamente SELECT/INSERT/UPDATE y USAGE a ashakids_runtime y tres políticas
por operación TO ese rol; DELETE sigue denegado y RLS activo. anon/authenticated/service_role
sin acceso; filas del boletín conservadas por fingerprint antes/después. SQL operativo
reproducible y metadatos sanitizados en docs/evidence/gmail-render-v58/. No nueva decisión
de arquitectura: se mantiene el rol técnico B02 y la autorización en FastAPI.

Verificación nueva: lectura runtime LIMIT0, grants/políticas/secuencia y HTTPS tras deploy:
/health200 healthy; /health/ready200 ready/database reachable. No altas, suscripciones
ni correos de prueba creados/enviados. El usuario hará manualmente boletín, recepción,
confirmación/baja y bienvenida ADMIN; OAuth/entrega real no certificados por configuración
o readiness. No auditoría académica nueva ni PDF. Primer query Graphify usó --budget
no admitido por wrapper, corregido a query con presupuesto predeterminado1500.
Cambios locales previos de adjuntos conservados fuera de este corte. Cierre documental
publicado con [skip render] para conservar el SHA d579a40 desplegado; el salto V58 continúa
la secuencia V57 existente, sin renumerar el V53 posterior.
Siguiente: prueba manual en landing/ADMIN; si falla, distinguir NO_CONFIGURADO/PENDIENTE
y503BD de401/403Gmail. Revisar logs sanitizados sin compartir OAuth ni enlaces privados.

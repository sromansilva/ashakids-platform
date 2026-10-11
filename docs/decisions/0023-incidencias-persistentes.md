# ADR0023 — Incidencias persistentes de usuarios

Estado: implementada en el corte V59.

El formulario previo solo cambiaba estado React y la bandeja ADMIN mostraba ejemplos
fijos. Se adopta una tabla específica `incidencias`, separada de clínica y auditoría.
PADRE y TERAPEUTA envían tipo, título (120 caracteres) y descripción (600) mediante
FastAPI. Actor y rol se derivan de la sesión; no los decide el navegador.

Un UUID estable permite reintentar una respuesta perdida sin duplicar el reporte,
incluidos envíos concurrentes. UUID con actor o contenido distinto devuelve409.
La bandeja ADMIN pagina20 registros y permite marcar LEIDA/RESUELTA en transacción;
una incidencia resuelta no vuelve a LEIDA. Sin borrado ni estados optimistas en UI.

Migración010 explícita, FK nullable a usuarios con SET NULL para conservar reportes,
índice de autor y orden temporal estable. RLS y grants SELECT/INSERT/UPDATE solo al
rol técnico existente; sin DELETE ni acceso anon/authenticated/service_role. FastAPI
mantiene permisos por identidad, sin Supabase Auth ni acceso directo del frontend.

La BD compartida se adoptó con respaldo privado verificado y conservación de filas
previas. Pruebas HTTP/SQL exclusivamente en PostgreSQL local aislado. No se insertaron
incidencias ni cuentas de prueba en la base compartida. Futuros avisos o respuestas al
reportante quedan fuera de este cambio.

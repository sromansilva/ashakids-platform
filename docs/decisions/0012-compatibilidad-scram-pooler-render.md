# ADR0012 - Compatibilidad SCRAM del pooler para Render

Fecha:2026-10-09 America/Lima. Estado:aceptado y aplicado con autorización expresa.
Repositorio:https://github.com/sromansilva/ashakids-platform .
Base funcional dev/V24:62905fc0480fffd21fb6b2d969592700608d64bb; trabajo piero-dev.

## Contexto

El pooler oficial de sesión5432 en Virginia permite IPv4. El rol nuevo ashakids_runtime
tenía un verificador SCRAM de32768 iteraciones; contraseña y claves derivadas verificadas
localmente, LOGIN activo y sin caducidad. Supavisor2.9.10 anunció4096 y rechazó login.
Su código oficial y el de2.9.13 usan4096 al emitir el reto; no respetan el valor del
verificador. No se cambió el pooler ni la configuración de otros roles.

## Decisión y autorización

El responsable autorizó recalcular únicamente el verificador de ashakids_runtime
con4096, conservando la contraseña aleatoria de64 caracteres y todos sus permisos;
también autorizó guardar la credencial en Render y publicar el plan gratuito.
ALTER ROLE PASSWORD afectó solo ese rol nuevo. Snapshots antes/después idénticos
para atributos, membresías, propietarios, ACL y políticas. No DML clínico ni MD5.
El guion apply_b02_runtime_role.py usa4096 para futuras altas con este pooler.

Conexión real posterior:runtime, TLS1.3 CERT_REQUIRED y hostname verificado, CA oficial
Supabase2021 con compatibilidad de formato explícita. Render usa Secret File prod-ca.crt
y variables privadas, nunca propietario PostgreSQL o claves de Supabase Auth.
Loopback127.0.0.1,::1 permaneció como FORWARDED_ALLOW_IPS; login/escrituras HTTPS reales
funcionaron y origen ajeno fue rechazado. No se ampliaron rangos del proxy.

## Consecuencias y seguimiento

La derivación cuesta ocho veces menos que32768 ante ataques offline si se filtrara
el verificador. La contraseña aleatoria, SCRAM, TLS y B02 se mantienen; esta excepción
no rebaja hashes de usuarios de la aplicación ni cambia funciones del ADMIN.
Volver a un coste mayor cuando el pooler soporte iteraciones del catálogo, después
de probar conexión/rollout. No restaurar el hash antiguo mientras el pooler siga igual.
Tras el cambio hubo un rechazo transitorio; el intento posterior autenticó sin nuevos
cambios. Guardar el respaldo solo privado, no adjuntar hash/sal/contraseña a informes.

## Evidencia y fuentes

[Corte15](../audits/auditoria-2026-10-09-15.md), [huellas](../evidence/audit-2026-10-09-15/scram-preservation.json).
[Supavisor2.9.10 server.ex](https://github.com/supabase/supavisor/blob/v2.9.10/lib/supavisor/protocol/server.ex).
[Supavisor2.9.13 client_handler.ex](https://github.com/supabase/supavisor/blob/v2.9.13/lib/supavisor/client_handler.ex).

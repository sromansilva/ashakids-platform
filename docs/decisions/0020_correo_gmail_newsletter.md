# ADR0020 — Gmail para bienvenida y suscripción de boletín

## Estado

Aceptado para V50, pendiente de configuración de credenciales y adopción de la migración
en un entorno aislado.

## Decisión

ASHAKids enviará correos transaccionales con Gmail API usando OAuth server-side y solo el
alcance `gmail.send`. La cuenta técnica, client secret y refresh token se configuran en
`backend/.env` local o en Environment de Render; nunca se versionan ni llegan al frontend.
Las cuentas se confirman primero en PostgreSQL y el resultado de correo se comunica como
`ENVIADO`, `PENDIENTE` o `NO_CONFIGURADO`, sin revertir un alta válida.

El boletín se modela en `suscripciones_boletin` con doble confirmación, token de baja y
hashes de token. Se mantiene un límite básico por IP en memoria. La primera fase no incluye
campañas, editor, programación ni historial administrativo; Gmail solo es apropiado para
bajo volumen.

## Consecuencias

- Un fallo temporal de Gmail no elimina cuentas y requiere reintento operativo.
- Los tokens crudos solo viajan en el enlace y no se guardan en la BD.
- La migración `009_newsletter_subscriptions.sql` debe respaldarse y probarse fuera de la
  base compartida antes de conceder permisos al rol runtime.
- OAuth en estado de pruebas puede emitir refresh tokens de corta duración; producción debe
  publicar el consentimiento y restringir el cliente.


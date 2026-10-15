# ADR0022 — Crear contraseña desde el correo de alta

Fecha: 2026-10-10 (America/Lima). Estado: aceptada por solicitud del usuario.

## Contexto

El alta anterior usaba el DNI como contraseña inicial y enviaba esa contraseña por correo.
La solicitud actual requiere un botón que abra la creación de contraseña, sin ingresar primero.
Se conserva React → HTTP/JSON → FastAPI → PostgreSQL y autenticación propia.

## Decisión

Las cuatro altas administrativas guardan Argon2id de un secreto aleatorio no comunicado y
`password_change_required=true`. Login rechaza toda cuenta pendiente, incluidas anteriores.
Los campos antiguos password/dni se aceptan opcionalmente por compatibilidad, pero no se usan
para generar la contraseña; el frontend ya no los pide ni envía en el alta.

Gmail envía texto y HTML con código y botón a `/crear-contrasena#token=...`.
El token incluye ID y vencimiento de 24 horas. HMAC-SHA256 usa como clave el hash privado de
contraseña y vincula propósito y correo actual; no contiene ese hash, DNI ni contraseña.
El hash Argon2 incluye sal aleatoria y nunca se expone en contratos públicos. Se evita una
nueva clave global y una tabla de tokens. Cambiar correo/hash invalida los enlaces anteriores.

`POST /auth/create-password` valida forma, firma, expiración y estado activo/pendiente con
SELECT FOR UPDATE antes de guardar Argon2id de una contraseña de 12–128 caracteres. Se
revocan sesiones y se desmarca el pendiente en la misma transacción. Una segunda solicitud
debe observar el estado/hash nuevo y rechazarse. No se inicia sesión automáticamente.
El consumo solo ocurre por POST, nunca al abrir el correo; los escáneres de enlaces no activan.

`POST /auth/resend-activation` recibe código, limita solicitudes por IP/código y responde
sin confirmar existencia. Solo envía para activos pendientes. Un reenvío no invalida enlaces
previos aún vigentes; completar cualquiera invalida todos. Gmail se llama después del commit,
sin mantener bloqueos durante OAuth/envío. El límite actual es local por proceso.

El token viaja en fragmento, no en query HTTP; el formulario lo retira de la barra del navegador
y lo conserva solo en memoria. Recargar requiere reabrir el enlace. El endpoint anterior
`/auth/activate` responde 410 para una sesión válida, sin cambiar contraseñas por DNI.

## Consecuencias y límites

No requiere migración ni nuevos privilegios. Las cuentas activadas conservan sus credenciales.
Sin Gmail configurado o si falla el envío la cuenta queda pendiente y ADMIN ve NO_CONFIGURADO
o PENDIENTE. Reintentar desde el formulario cuando el servicio vuelva a funcionar.
No añade recuperación por correo para cuentas ya activadas ni envío masivo a cuentas antiguas.
La posesión del enlace permite crear la contraseña: debe mantenerse privado.

Verificación de este corte: pruebas unitarias y UI; integración SQL/concurrencia preparada,
omitida por falta de ASHAKIDS_TEST_DATABASE_URL local. No afirmar recepción real de Gmail ni
concurrencia SQL comprobada a partir de mocks. Configuración Gmail guardada en Render tras autorización expresa; recepción pendiente.

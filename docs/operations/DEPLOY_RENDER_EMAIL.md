# Gmail y boletín en Render

Configura estos valores en **Environment** del servicio, nunca en `render.yaml` ni en el
frontend. Los campos `sync: false` del Blueprint solo declaran que Render debe pedirlos.

```env
GMAIL_ENABLED=true
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_SENDER_EMAIL=cuenta-tecnica@dominio
GMAIL_SENDER_NAME=ASHAKids
GMAIL_API_BASE_URL=https://gmail.googleapis.com/gmail/v1
PUBLIC_ORIGIN=https://ashakids.onrender.com
```

En Google Cloud crea un cliente OAuth para aplicación web/servidor, habilita Gmail API y
autoriza únicamente `https://www.googleapis.com/auth/gmail.send`. Publica el consentimiento
OAuth antes de obtener el refresh token; el estado **Testing** puede caducarlo en siete días.
Concede acceso a la cuenta técnica, obtiene el código de autorización una sola vez y guarda
el refresh token directamente en Render. Nunca lo pegues en el repositorio, tickets, logs o
respuestas HTTP.

Antes de activar en producción, aplicar `backend/scripts/migrations/009_newsletter_subscriptions.sql`
en una base aislada con respaldo y comprobar columnas, índices y permisos del rol runtime.
Luego redeploya, crea una cuenta de prueba y verifica el estado `correo_bienvenida` sin
mostrar la contraseña. Para el boletín confirma y usa el enlace de baja desde un buzón de
prueba. Si Gmail queda deshabilitado, las altas conservan la cuenta con estado
`NO_CONFIGURADO` y el boletín muestra que el servicio aún no está configurado.


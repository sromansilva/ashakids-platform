# ADR0017 — Notificaciones internas y preferencias profesionales

Fecha: 2026-10-10. Estado: implementado y ensayado localmente en codex/2do-intento.
Base: V36/583de51b241735538f0ade472cdb8b216cf2eb09. Adopción compartida pendiente.

## Decisión

Conservar React → HTTP/JSON → FastAPI → SQLAlchemy/PostgreSQL y autenticación propia.
Migración005, posterior a004, agrega `notificaciones` y `preferencias_notificacion`.
El destinatario se obtiene de la identidad autenticada; solo TERAPEUTA accede a esta
primera bandeja y configuración. No se recibe id_usuario del cliente.

Reserva confirmada, cancelación, cambio efectivo de horario/modalidad y mensaje de una
familia autorizada generan aviso en la misma transacción del evento. Un fallo de escritura
revierte también el evento. El mensaje no copia su contenido privado a la notificación.
La clave única por destinatario/evento evita duplicados. Leer un aviso es idempotente.

Cinco preferencias booleanas predeterminadas a true se guardan en servidor. Desactivar
una categoría suprime avisos futuros, conserva el historial y permite seguir reservando
o enviando mensajes. No hay reconstrucción de eventos anteriores a esta migración.

La UI consulta cada30s, ofrece paginación, filtro sin leer, lectura individual/todas,
errores y reintento. Conserva Nunito/violeta y controles móviles fuera de los flotantes.
Los avisos aparecen en ASHAKids; esta decisión no incluye correo, SMS ni push del navegador.

## Recordatorios y operación

Un proceso opcional de la API revisa cada60s las citas CONFIRMADA dentro de los próximos
30min, sin sesión EN_CURSO/FINALIZADA. Usa bloqueo SKIP LOCKED y clave por cita/fecha
para evitar duplicados concurrentes. Solo funciona mientras la API está ejecutándose;
no garantiza entrega si estuvo detenida durante toda la ventana. Sesión PROGRAMADA
no impide el recordatorio. Cancelar o reprogramar no elimina avisos históricos.

`NOTIFICATION_REMINDERS_ENABLED=false` por defecto. Activar explícitamente después de
adoptar005 y revisar permisos del entorno. No hay DDL en el arranque. RLS se habilita
sin grants públicos ni Supabase Auth; los permisos runtime requieren revisión específica.
Los grants/políticas locales permisivos del rol de ensayo no certifican el ACL compartido.
Reversión conservadora: detener el proceso, volver al código anterior y conservar tablas.

## Verificación y límites

Seis casos SQL nuevos cubren aislamiento, preferencias estrictas, eventos/rollback,
mensajes y recordatorios concurrentes. Tres casos UI cubren errores y persistencia.
La reserva y supresión se verificaron por HTTP sintético; la preferencia, recarga y lectura
se comprobaron en navegador. El proceso local generó un recordatorio real. Evidencias en
docs/evidence/notifications-v37/. Sin migración en Supabase ni integración en dev/piero-dev.

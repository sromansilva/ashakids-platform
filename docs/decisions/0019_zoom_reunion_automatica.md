# ADR 0019: creación automática de reuniones Zoom

## Estado

Aceptada para implementación gradual; desactivada por defecto hasta configurar una cuenta técnica.

## Decisión

Las citas virtuales podrán crear su reunión mediante Zoom Server-to-Server OAuth desde FastAPI. Las
credenciales permanecen en el backend y el frontend recibe únicamente el enlace de participante.
Una cita virtual no se confirma si Zoom está habilitado y la creación falla. El enlace manual se
conserva como recuperación restringida para ADMIN/TERAPEUTA.

## Consecuencias

- El flujo local continúa funcionando en modo manual con `ZOOM_ENABLED=false`.
- La base conserva el `zoom_meeting_id` y `zoom_join_url`; la migración 007 amplía sus longitudes.
- La integración requiere una cuenta técnica Zoom, permisos OAuth y pruebas aisladas antes de Render.
- No se persiste ni se expone el `start_url` del anfitrión.

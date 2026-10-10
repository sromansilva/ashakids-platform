# Evidencia de implementación V34 — agenda e introducción

Repositorio: https://github.com/sromansilva/ashakids-platform .
Fecha: 2026-10-10, America/Lima. Rama: codex/2do-intento.
Base auditada como avance de implementación: V33 / 45ee5abdeba6589b43eb67e79492e8493ab6a635.
No es una auditoría técnica nueva ni un informe académico; no reutiliza cifras V33.

Pruebas nuevas: backend 196 passed,25 skipped,19 warnings (48.13s). Cinco casos en
test_new_agenda: introducción sin plan y dos hermanos; publicación persistida y permisos;
turno exacto/bloqueado/ocupado; dos familias compitiendo; asistencia/reporte/plan y permisos
de familia. Tras endurecer activación del profesional y horizonte, repetición pertinente:
5 passed (4.69s); comprobación final de agenda/autorización:17 passed (16.91s). Regresiones previas específicas:26 passed (25.94s).

Frontend:267 componentes/14 archivos y25 rutas aprobados, tipos, check326 archivos/max498
y build. Se adaptaron dos expectativas antiguas al directorio libre y al resumen de reserva;
se reforzó el caso del reporte para comprobar que solo envía los cuatro campos editables.
Primera ejecución frontend: dos fallos de expectativas V26 y un aviso de configuración actualizado después; ninguna cifra se oculta.

DB automática: ashakids_test_flujo_v34_20261010,127.0.0.1:6544, rol ashakids_flujo_v33
sin superusuario/createdb/createrole/bypass RLS. Nueva restauración del esquema histórico
sin filas reales, migraciones002/003 y políticas permisivas solo locales de prueba.
QA persistente separado: ashakids_test_flujo_qa_20261010, mismo cluster local; API8002,
Vite5175. No se modificó .env ni Supabase. Los puertos habituales se conservaron.

Incidencias resueltas: el bootstrap histórico deja search_path vacío; primer INSERT de
roles falló y se corrigió calificando public.roles. Primer comando npm test:types no existe;
se usó typecheck. Una repetición de pytest reinició los datos sintéticos de QA V34; se creó
la BD QA separada para no repetir ese acoplamiento. No se tocaron datos compartidos.

Las capturas corresponden exclusivamente a identidades/niños sintéticos locales.
La aceptación completa de plan, segundo terapeuta, PDF e historial y juegos sigue pendiente.

Verificación visual real: terapeuta publica disponibilidad; familia reserva dos
introducciones independientes sin plan; segundo horario muestra09:00 ocupado; familia
reprograma Ana de09:00 a11:00 y conserva CONFIRMADA. Desktop1280x720 y móvil390x844.
Se corrigió la capa del diálogo para que los botones flotantes no tapen turnos.
Detalle familiar usa localización/estado/sesión del servidor; no presenta una sede
fija ilustrativa ni una descarga de notas como si fuera el reporte clínico.
Capturas:resumen-introduccion.png, introduccion-confirmada.png, reprogramacion-movil.png.
turnos-movil.png corresponde a la primera inspección, antes del ajuste de superposición.
backend-requests.json registra la repetición final pertinente; no es un inventario de
cobertura de todas las rutas ni todas las pantallas.

Publicación: primer commit rechazado por identidad Git ausente; el push posterior
no publicó cambios (Everything up-to-date). Se usa la identidad noreply ya registrada
en V33 mediante opciones de ese comando, sin cambiar configuración global.

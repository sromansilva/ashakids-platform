# Continuidad V42

Portal familiar web actualizado, lógica intacta. Usar último SHA remoto de dev/codex/2do-intento.
Siguiente: terapeuta web UI y diagnóstico Render/BD; responsive diferido. Evidencia family-v42.

# Punto de continuidad del equipo

V40_Rediseno_Login_UI y V41_Rediseno_Admin_UI extienden la misma marca: lógica intacta.
Panel de pruebas solo DEV, ausente del build productivo. Cada cierre se publica en dev
y codex/2do-intento. Evidencia docs/evidence/login-v40/ y admin-v41/.
Continuar desde el último SHA remoto de dev: ahora priorizar web de escritorio, padre/tutor
y terapeuta en commits separados; responsive puede esperar. Revisar el error de conexión BD
en Render después de inspeccionar configuración y migraciones; un push no confirma el despliegue.

Equipo: **dev incorpora todo V33–V38**, desde la base V32/ebb8632 hasta V38/fbffd46.
V39_Actualizacion_Documentacion_Equipo registra esta adopción; hagan fetch y usen el último
SHA publicado de dev. codex/2do-intento se sincroniza con el mismo cierre.
Los commits originales se conservan, sin conflictos ni force-push.

Incluye registro/activación familiar, agenda e introducción por niño, planes e historial,
paneles, enlace externo, mundos demo, notificaciones/preferencias y el rediseño de landing.
Asesor es una persona con acceso ADMIN; juegos con progreso demo en la pestaña.
La regla de anticipación semanal fue excluida. Avatar/calificación y conexiones educativas
no se declaran implementados por el cambio visual. Newsletter conserva envío pendiente.

La integración es de código/documentación: Supabase y hosting no se modificaron.
Migraciones002–005 siguen ensayadas únicamente en PostgreSQL local; revisar adopción antes
de apuntar una API al esquema compartido. No ejecutar fixtures destructivas en BD compartida.
Evidencia heredada por corte en docs/evidence/; no se realizó otra auditoría/prueba funcional.

Leer PROJECT_CONTEXT.md, IMPLEMENTATION_PROGRESS.md, FLUJO_MAESTRO_ACTUALIZADO.md y DESIGN.md.
Siguiente: cada rol se rediseña por separado, un commit por rol. feat/piero-dev conserva V32.

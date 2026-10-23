# Base actual V46 — flujo y documentación

Leer DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md, GUIA_FLUJO_ESTADO_Y_PENDIENTES.md y
REGISTRO_INCONSISTENCIAS_Y_CRITERIOS.md (12 fichas abiertas, con fuentes y aceptación), más
AGENTS/contexto/progreso. Base funcional6204803/V45; la documentación nueva se publica
como V46 en dev/codex/2do-intento; verificar SHA real en Git. PDFs en output/pdf.
Usuario ya creó padre/terapeuta, publicó/consultó disponibilidad, reservó y vio enlace Zoom
en Render. Siguiente: registrar/iniciar sesión, reporte, plan y cierreASISTIO, lectura familiar
y segunda terapia. Zoom no mueve estados automáticamente. Plan nuevo conserva historial
pero reemplaza mundos activos; no planes simultáneos/diagnóstico múltiple normalizado.
No rehacer alta terapeuta ni migraciones adoptadas. No pagos/anticipación semanal.
PIN4/WSP/ZoomAPI son backlog separado; prioridad UXweb, conservar contratos y autoría.

# Confirmación V45

V44 ya está Live en Render y ambas ramas sincronizadas. Usuario confirmó alta/acceso PADRE.
Alta terapeuta YA existe: Cuentas → pestaña Terapeutas → Nueva cuenta. DNI inicial,
código generado y cambio obligatorio de contraseña. El agente abrió el formulario sin enviar.
Queda verificar alta/activación/ingreso terapeuta; no implementar un formulario duplicado.
Disponibilidad debe publicarse desde Configuración. V45 es documentación, sin lógica nueva.

# Continuidad V44

Flujo V33–V37 y diseño V38–V43 desplegados; BD compartida actualizada002–006 con respaldo.
El error503 del login era el esquema antiguo; ADMIN ya ingresa y carga registros reales.
Usar último SHA remoto dev/codex/2do-intento; comprobar live en Render.
Tutor/terapeuta: confirmar sus credenciales actuales; no usar las contraseñas del sandbox.
Publicar disponibilidad actual desde Configuración para habilitar reservas; no se fabricaron
horarios ni datos clínicos. Recordatorios activados, sujetos a instancia Free en ejecución.
Leer ADR0018 y docs/evidence/deploy-v44; no repetir migraciones, fixtures o restauraciones
sobre esta BD. Responsive y detalles visuales quedan para siguientes cortes.

# Continuidad V43

Terapeuta web cerrado; usar último SHA de dev/codex/2do-intento. Responsive diferido.
Siguiente: resolver esquema compartido antiguo mediante respaldo y adopción002–005;
V42 está live pero el login falla por columnas ausentes, aunque readiness da200.

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

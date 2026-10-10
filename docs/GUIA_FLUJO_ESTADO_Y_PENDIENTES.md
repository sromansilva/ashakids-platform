# ASHAKids — guía del flujo actual y base del equipo

**V46 · 10/10/2026 · America/Lima.** Base examinada: `codex/2do-intento`, V45 `62048038b70d2411234fb681284e327cf142d1b7`, integrada en `dev`. Repositorio: https://github.com/sromansilva/ashakids-platform . Web: https://ashakids.onrender.com . Documento operativo; el detalle de tablas, relaciones, API y requisitos del Avance 2 está en [la documentación maestra](DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md).

La prioridad actual es web de escritorio. Esta fase documenta; no modifica lógica, UI, tablas ni credenciales. Las sugerencias de UX/integraciones son backlog. El usuario confirmó en Render altas de padre/terapeuta, disponibilidad, reserva y enlace Zoom visible. Lo posterior se explica desde código actual y pruebas locales anteriores; aún no se confirma como recorrido humano completo en Render.

## 1. Punto exacto en el que se encuentra el equipo

Ya no falta el formulario para crear terapeuta: está en **ADMIN → Cuentas → pestaña Terapeutas → Nueva cuenta**. Asesor tiene rol ADMIN. Las cuentas nuevas se activan cambiando el DNI inicial por contraseña propia. Las migraciones del flujo fueron adoptadas en la BD compartida en V44; no volver a aplicarlas a ciegas ni fabricar planes/horarios para datos anteriores.

El usuario llegó a: **cita confirmada + enlace Zoom guardado y visible**. El siguiente paso funcional está en **TERAPEUTA → Agenda → detalle de la cita → Sesión y reporte clínico**. Abrir Zoom y terminar una llamada no cambia estado clínico en ASHAKids.

La acción sugerida para continuar el recorrido real es registrar sesión, iniciarla cuando corresponda, guardar reporte/plan y finalizar con asistencia. Luego la familia consulta su recorrido, reporte y mundos, y reserva terapia. No es necesario esperar un evento de Zoom: no existe integración de eventos.

## 2. Flujo paso a paso completo

### Paso 1 — Alta institucional y entrega de acceso

ADMIN entra en Cuentas y registra padre con sus hijos o terapeuta con su perfil. El backend crea usuario, rol, perfil y auditoría de alta; la familia se guarda en una transacción. Código generado correlativo de seis caracteres con prefijo P/T/A; login acepta su normalización de mayúsculas. El niño tiene registro de paciente dependiente del tutor, no cuenta propia.

ADMIN entrega el código y credencial inicial por el canal acordado. Hoy esa entrega es manual. WhatsApp visible en el sitio es un enlace externo de contacto; no crea cuentas ni envía automáticamente acceso. No copiar DNI/contraseñas a capturas o documentación.

### Paso 2 — Activación de padre y terapeuta

Cada adulto inicia sesión con su código y contraseña inicial institucional (DNI de ocho dígitos). Se exige cambiarla a una **contraseña de 12 a 128 caracteres**, distinta de la inicial; no son doce dígitos obligatorios. La activación valida la inicial, revoca sesiones anteriores y crea la siguiente sesión. Hasta activar, los guards/backend impiden operar en módulos de negocio.

Si una cuenta ya estaba creada antes de este flujo, revisar su estado real: no suponer que debe activarse ni resetearla. Un terapeuta inactivo o sin activar no aparece como opción operativa en el directorio nuevo.

### Paso 3 — Selección y mantenimiento del niño

La familia selecciona al niño sobre el que trabaja. Mi Camino/seguimiento/agenda/reportes/mundos deben corresponder a ese id; un hermano no hereda su introducción, plan o demo. PADRE puede consultar/editar hijos propios según contratos; bajas lógicas preservan historial y eliminaciones físicas tienen restricciones.

La introducción se controla **por niño**, no por familia ni por terapeuta. El perfil activo y tutor determinan permisos. Un paciente inactivo no puede reservar/publicar plan.

### Paso 4 — Publicar disponibilidad profesional

TERAPEUTA abre Configuración → Disponibilidad (o Agenda → Horarios), selecciona turnos y bloqueos y **publica**. Cambiar casillas sin publicar es un borrador. Tablas reales: `turnos_semanales` y `bloqueos_agenda`; no existe una tabla llamada disponibilidad_semanal.

Turnos actuales: lunes–sábado (`dia` 0–5), inicio a horas exactas 08:00–17:00, atención de 45 minutos. Bloqueos son intervalos de fecha/hora. Reserva dentro de hoy/próximos 90 días, siempre futura. Zona operativa America/Lima. El calendario puede mostrar domingo, pero no habilita un turno dominical nuevo.

PUT reemplaza toda la configuración de ese terapeuta y serializa con reservas mediante bloqueo de fila. La configuración se aplica inmediatamente para nuevos turnos: **no hay requisito de una semana de anticipación**. Las citas ya confirmadas no se cancelan ni reprograman al retirar disponibilidad; deben manejarse explícitamente. Este punto requiere mejor explicación en UX.

### Paso 5 — Familia elige profesional y reserva introducción

PADRE selecciona al niño, consulta Especialistas/agenda, elige terapeuta activado y fecha/turno disponible. Si el niño aún no tiene introducción atendida, reserva **INTRODUCTORIA**, sin plan previo. El servidor confirma la reserva al guardarla; ya no necesita una segunda aprobación del terapeuta. Solo pendientes heredadas del flujo anterior requieren confirmación explícita.

Se comprueban disponibilidad, bloqueos, futuro, actividad y colisiones tanto del niño como del profesional. Duplicar una introducción pendiente/confirmada o reservar una segunda introducción ya atendida da conflicto. En caso de cancelación sin atención, el niño puede reservar de nuevo según estado; inasistencia no equivale a introducción atendida.

### Paso 6 — Notificación profesional y enlace de atención

La cita genera una notificación interna para el terapeuta si su preferencia nueva_cita está activa. El texto incluye actor, niño, fecha/hora Lima y modalidad; cancelación/reprogramación/mensajes tienen eventos propios. Configuración → Notificaciones guarda cinco preferencias en servidor. Campana/bandeja conserva leídas/no leídas. Las preferencias afectan avisos futuros, no borran los anteriores.

Para cita virtual, el profesional abre detalle y guarda una URL HTTPS de Zoom. Se permite zoom.us/subdominios y se rechazan credenciales embebidas/puertos extraños. PADRE ve el enlace de la misma cita autorizada. No hay OAuth, creación automática de reunión, grabación, verificación de existencia ni webhook de fin. La API admite ADMIN autorizado para gestionar enlace, pero el uso normal del flujo es del terapeuta.

Las rutas /session y sus pantallas de llamada son prototipos; la atención real se opera desde Agenda/SessionActions. No confundir “entrar en demostración” con crear una sesión clínica.

### Paso 7 — Registrar e iniciar sesión clínica

En detalle de la cita, **Registrar sesión** crea `sesiones` con estado PROGRAMADA; requiere cita CONFIRMADA y no admite una segunda sesión para la misma reserva. Puede registrarse antes del horario; eso bloquea cancelación/reprogramación por las rutas actuales, incluso si aún no se inició. Conviene crearla cuando vaya a atenderse y explicarlo en UX.

Cuando llega la hora programada, **Iniciar sesión clínica** cambia a EN_CURSO y registra hora real. El botón y el backend bloquean iniciar antes de la hora. Entrar/salir de Zoom no activa este botón ni cambia la sesión. Si no refresca la vista tras una mutación, usar Actualizar estado/recargar y comprobar respuesta; no asumir éxito por el clic.

### Paso 8 — Guardar reporte durante o después de la atención

Con sesión EN_CURSO o FINALIZADA, el profesional autorizado guarda Observaciones iniciales, Objetivos trabajados, Nivel de ayuda y Próximos pasos. Se puede abrir desde el detalle de Agenda o desde Reportes. Se guarda en `reportes_sesion`; la familia consulta el reporte autorizado y puede descargar PDF. Un reporte existente es actualizable por su profesional según permisos; no es una firma irreversible.

**No hay que esperar a que termine Zoom** ni cerrar primero la sesión para guardar. El reporte está disponible al guardarse, sin estado adicional de borrador/publicación; no hay envío automático por correo ni firma digital (sus botones están deshabilitados). Si se redacta información provisional, considerar que la familia puede consultarla.

Para habilitar plan/recorrido, guardar al menos un texto no vacío en Observaciones iniciales, Objetivos trabajados o Próximos pasos. Llenar solo Nivel de ayuda no cumple esa condición. Es mejor completar los cuatro campos de manera útil, pero el contrato no los exige todos.

### Paso 9 — Definir plan y recomendaciones familiares

En el mismo detalle de Agenda aparece **Plan de trabajo → Definir plan mensual** tras guardar reporte. TERAPEUTA autor elige nombre, área principal FLUIDEZ/HABLA/LENGUAJE, 1–3 mundos, 1–31 sesiones recomendadas y recomendaciones familiares. **Publicar plan** crea una versión ACTIVA con autor, expediente y sesión de origen. El reporte de una atención posterior puede conservar el plan vigente: publicar un plan en cada sesión no es obligatorio.

Puede publicarse estando EN_CURSO o FINALIZADA si no hay NO_ASISTIO. Se permite una versión por sesión; un cambio posterior se documenta en otra atención, sin editar el plan ya publicado. El texto de Próximos pasos y la descripción del plan orientan a la familia sobre la siguiente terapia; no existe una orden automática con fecha, profesional fijo, número de sesiones compradas o recordatorio de tratamiento mensual.

### Paso 10 — Cerrar atención con asistencia o inasistencia

Si se atendió: **Finalizar sesión → Confirmar cierre** marca ASISTIO, FINALIZADA, hora real de fin y reserva COMPLETADA. Requiere EN_CURSO. No impone que hayan transcurrido los 45 minutos ni exige que Zoom haya terminado; es una decisión manual del profesional. Cerrar sin reporte/plan es posible, pero no habilita terapia futura si faltan esas piezas.

Si no acudió: desde PROGRAMADA usar **Registrar inasistencia** solo después del fin programado, confirmar NO_ASISTIO; sesión FINALIZADA y cita COMPLETADA. No iniciar para luego marcar inasistencia: el contrato exige PROGRAMADA para ese cierre. La UI no ofrece reporte/plan en NO_ASISTIO.

Existe una diferencia a revisar: `guardar_reporte` backend comprueba EN_CURSO/FINALIZADA pero no bloquea explícitamente NO_ASISTIO; UI sí lo bloquea y plan/recorrido también lo excluyen. Esto es un pendiente de consistencia, no una función cerrada de “reporte de inasistencia”. No se cambia en esta documentación.

### Paso 11 — Familia ve resultado y acceso a mundos

PADRE actualiza Mi Camino/Seguimiento y Reportes para el mismo niño. La siguiente reserva de TERAPIA se habilita solo si hay **introducción FINALIZADA + ASISTIO + reporte con contenido válido + plan profesional ACTIVO**. Un plan administrativo antiguo sin sesión_origen no basta.

Mundo ASHA lee **el plan ACTIVO** y ofrece sus mundos. Su componente no exige por sí mismo cierre de la introducción; si se publicó durante EN_CURSO, puede mostrarlos antes de cerrar. Esa diferencia frente al gating de reservas debe explicarse o unificarse por una futura decisión de producto, no ocultarse en el documento.

Los mundos actuales tienen tres niveles por área, respuestas/reintentos y desbloqueo demostrativo. Guardan avance por cuenta/niño/mundo en sessionStorage de **esta pestaña**, conservado en recarga/reingreso de la misma pestaña; no sincroniza dispositivos ni guarda registros educativos SQL. No mide pronunciación/mejoría, no consume sesiones ni condiciona reservas.

### Paso 12 — Nueva terapia con el mismo u otro profesional

Una vez habilitado el recorrido, la familia reserva TERAPIA referenciando el plan profesional vigente del niño y el terapeuta elegido. Puede ser otro profesional; no se cambia automáticamente el autor del plan. El profesional nuevo recibe su reserva y puede consultar contexto/historial del niño autorizado, con atenciones ajenas en lectura. Cada sesión nueva repite registrar → iniciar → reporte → cerrar; puede conservar el plan anterior o publicar otro.

Mientras **no publica otro plan**, permanecen los mundos del plan inicial. Si publica uno nuevo, el anterior se FINALIZA y conserva historia/autor/descripcion; Mundo ASHA cambia a los mundos nuevos. Hoy **no hay garantía de biblioteca acumulativa del material de todos los planes previos** ni varios planes activos por niño. Decidir esa regla antes de prometerla a familias o modificar el formulario.

“Varios trastornos”: hoy hay una área principal y varios mundos, más textos clínicos. No existe diagnóstico múltiple estructurado ni plan independiente simultáneo por trastorno. Es una ampliación de dominio/BD, no solo UX.

## 3. Estados, condiciones y preguntas frecuentes del recorrido

| Recurso | Estado / transición | Condición que decide el backend |
| --- | --- | --- |
| Cuenta | password_change_required=true → false | Activación con inicial válida y nueva contraseña |
| Reserva nueva | → CONFIRMADA | Turno futuro, libre, disponible; introducción/plan según tipo |
| Reserva editable | PENDIENTE/CONFIRMADA → cancelar/reprogramar | Sin sesión registrada; no closed |
| Sesión | Sin sesión → PROGRAMADA | Cita CONFIRMADA, una sesión por reserva |
| Sesión | PROGRAMADA → EN_CURSO | Ha llegado la hora de inicio |
| Sesión atendida | EN_CURSO → FINALIZADA / ASISTIO | Confirmación profesional; no evento Zoom |
| Sesión sin atención | PROGRAMADA → FINALIZADA / NO_ASISTIO | Ha pasado el fin programado |
| Reporte | Sin reporte → guardado / actualizable | Sesión iniciada o finalizada, permiso de escritura; diferencia NO_ASISTIO señalada |
| Plan | Sin versión de esa sesión → ACTIVO | Autor TERAPEUTA, reporte válido, no inasistencia; finaliza plan previo |
| Recorrido | terapia_habilitada=true | Introducción finalizada atendida + reporte válido + plan activo profesional |
| Mundos | Selección activa | Mundos del plan ACTIVO; progreso solo demo local |

Si no aparece el botón para reporte: comprobar id_sesion, EN_CURSO/FINALIZADA, permiso propio, asistencia y error de consulta. Si no aparece Definir plan mensual: comprobar reporte guardado, rol TERAPEUTA, autor y que esa sesión no publicara ya versión. Si no habilita la reserva: consultar `/pacientes/{key}/recorrido`, verificar niño correcto y las tres piezas, no completar juegos para intentar desbloquear.

No existe vencimiento automático del plan al siguiente mes ni obligación de publicar mensual. Sesiones recomendadas es una orientación (1–31), no cupo ni compra. No hay tratamiento automático por completar Zoom.

## 4. Inventario actual: completo, parcial y por implementar

**100% significa implementación del alcance estrecho descrito**, según código y evidencia referida; no aceptación de todo el producto ni todos los casos en Render. Parcial no recibe un porcentaje preciso si no hay checklist acordada; el maestro ofrece una fórmula para el informe. 0% se refiere a la función ausente, aunque haya una maqueta o tabla. UI renovada no equivale a todas las acciones persistidas.

| Sección/función | Estado | Funcionamiento presente | Evidencia / límite |
| --- | --- | --- | --- |
| Landing/login diseño web | 100% del rediseño acordado | Marca, glass/luz, foco, formularios de acceso | V38/V40; pulido fino/móvil completo pendientes |
| Login/logout/sesión | 100% núcleo | Cookie propia, hash y revocación | V44 HTTP ADMIN; acceso de roles confirmado por usuario |
| Activación inicial | 100% contrato | DNI → contraseña propia, rotación | V33 local; usuario confirma acceso, sin nueva traza individual de activación |
| ADMIN alta PADRE/TERAPEUTA/familia | 100% operación | Cuentas, perfil, rol y niños | Código y recorrido humano actual |
| ADMIN mantenimiento/consultas núcleo | 100% del CRUD delimitado | Usuarios/pacientes/citas/sesiones; bajas condicionadas | Evidencia cortes anteriores; no significa todos los paneles ADMIN |
| ADMIN contenido/ML/moderación/config/indicadores ilustrativos | Parcial/prototipo | UI y simulaciones; algunos listados core reutilizados | routeCapabilities/servicios; no catálogo educativo publicado ni ML real |
| PADRE selección/hijos/recorrido | 100% núcleo | Datos reales por niño, agenda e historia | V33–V36 y usuario actual hasta reserva |
| PADRE reserva/reprogramación/cancelación | 100% reglas actuales | Introducción/terapia, validación y estados | V34–V36 local; no cambia cita con sesión registrada |
| TERAPEUTA disponibilidad/bloqueos | 100% configuración actual | Publicación persistente inmediata | V34 + humano actual; UX reemplazo/impacto por pulir |
| Zoom enlace compartido | 100% enlace manual | URL guardada y visible a familia | V36 + humano actual; no comprobación de llamada real |
| Zoom API/creación/webhook | 0% | Ninguna integración automática | Por implementar en fase propia |
| Sesión clínica/asistencia | 100% transiciones actuales | Inicio/cierre manual | V36 local; tramo humano Render pendiente |
| Reporte clínico/PDF | 100% núcleo | Cuatro textos, consulta y descarga | V35–V36; no firma/correo; diferencia NO_ASISTIO |
| Plan profesional/versionado | 100% alcance actual | Autor, área, mundos y recomendación; historial | V35–V36; único activo y única versión por atención |
| Varios planes activos/múltiples diagnósticos | 0% de esa ampliación | Textos y mundos múltiples no equivalen | Decidir producto/modelo primero |
| Chat PADRE/TERAPEUTA | 100% texto autorizado | Persistencia/paginación/contexto | Cortes mensajes; adjuntos, push y WSP no incluidos |
| Bandeja/preferencias TERAPEUTA | 100% avisos internos | Nueva cita, cancelación, reprogramación, mensaje, recordatorio | V37 local; no reconstruye eventos anteriores |
| Recordatorios continuos en hosting | Parcial | Worker/flag habilitado, ventana 30min | Free puede dormir; no scheduler externo garantizado |
| Mundo ASHA asignación/jugador | Parcial | Plan real + tres niveles demo por área | V36; avance pestaña, sin medición clínica |
| Progreso educativo servidor, IA, objetivos/actividades conectados | 0% del circuito persistente | Tablas heredadas/prototipos separados | No escribir esa progresión desde demos |
| Avatar/calificación TERAPEUTA | Parcial/pendiente | Foto local demo; métricas clínicas contadas desde registros | No columnas avatar/calificacion_promedio; sin sistema de reseñas real |
| Sesiones/pacientes atendidos en panel | 100% del conteo actual | Consultas/cálculos, sin columnas redundantes | No sumar juegos o mock como sesiones clínicas |
| Perfil terapeuta: consulta/solicitar edición | Parcial | Consulta real; solicitud solo aviso local | No solicitud enviada realmente al administrador |
| Contraseña en configuración | Parcial por consistencia | PATCH propio existe, revoca sesiones; UI profesional dice mínimo8, API exige12 | Activación sí verifica inicial; PATCH propio no recibe contraseña actual |
| Recuperación autoservicio/MFA/firma digital | 0% | Ayuda/contacto o controles demo/deshabilitados | No correo/OTP/firma real |
| Incidencias/valoraciones/notas y objetivos ilustrativos | Prototipo/parcial | UI local; historial clínico real separado | No asumir persistencia por botón de éxito |
| Consentimiento/privacidad legal | Parcial | Avisos/prototipos y separación de demo | No certificación de cumplimiento/retención aprobada |
| Pagos | Fuera del alcance | Simulación heredada rotulada | No implementar ni exigir para reservar |
| Render/BD flujo nuevo | 100% adopción y acceso básico | Código, migraciones, runtime/HTTPS | V44–V45 + catálogo actual; falta aceptación humana tramo final |
| Recuperación de backup/carga/móvil integral | Pendiente | Backup listado y ensayos parciales anteriores | No restauración, SLA o carga sostenida certificados |

## 5. Pendientes concretos y cambios de UX propuestos

Registro para estandarizar: [REGISTRO_INCONSISTENCIAS_Y_CRITERIOS.md](REGISTRO_INCONSISTENCIAS_Y_CRITERIOS.md).
Doce fichas detallan UI/API, fuentes/lineas, prioridades, decisiones y aceptación: contraseñas,
éxitos locales de perfil/2FA/baja, NO_ASISTIO, contenido de reporte, avisos del jugador,
borradores de horarios y significado de plan mensual/acceso. Siguen abiertas en V46.

La tabla define trabajo futuro, no autoriza implementarlo en esta fase documental. Cada cambio debe conservar invariantes, tener criterio de aceptación y cerrar con commit VNN/push a dev. No mezclar credenciales/esquema con una fase “solo diseño”.

| Prioridad / tarea | Qué se observa hoy | Tipo e impacto | Criterio para cerrar |
| --- | --- | --- | --- |
| P0 aceptación posterior a Zoom | Usuario aún no terminó ese tramo | Verificación funcional autorizada, no cambio de diseño | Cierre ASISTIO + reporte + plan + familia + reserva otro profesional; evidencia sanitaria/ficticia |
| P1 orientación en cita | Enlace, registro, inicio, reporte y plan conviven; no wizard claro | UX sobre los mismos estados/contratos | Acción siguiente visible y explicación “Zoom no cierra la sesión”; conserva inicio temporal y authorización |
| P1 guardado de reporte/plan | Reporte visible durante atención, una versión de plan por sesión | UX; cambiar publicación de reporte sería lógica | Indicar visibilidad familiar, guardado confirmado y efecto de reemplazo antes de publicar |
| P1 coherencia credencial | Activación mínimo12; config terapeuta anuncia/valida8 y PATCH no verifica actual | UI + contrato/seguridad si se exige reautenticación | Un mismo requisito visible; rechazos claros, sin falsa validación de contraseña actual |
| P1 disponibilidad | PUT reemplaza todos los turnos/bloqueos; citas existentes no cambian | Puede ser UX si se conserva contrato; versionado/anticipación sería negocio/BD | Borrador/publicado, resumen de cambios e impacto; cero cancelaciones implícitas; no regla de una semana |
| P1 estados tras guardar | Algunas vistas necesitan refrescar; botones pueden depender de cache | UX/cache y pruebas | Reporte guardado habilita plan y cierre actualiza recorrido sin doble envío |
| P1 solicitudes perfil | “Solicitud enviada al administrador” hoy solo estado local | Honestidad UX; persistir requiere API/backend | Mensaje identifica demostración o hay solicitud realmente persistida consultable |
| P2 PIN de cuatro dígitos | No existe; contraseña definitiva12–128 | Autenticación/seguridad, posiblemente modelo y recuperación | Decisión técnica específica, política de intentos, recuperación, sesiones, pruebas; no reducir min_length a4 como parche visual |
| P2 WhatsApp automático | Contacto wa.me manual | Integración backend/proveedor, plantillas y consentimiento | Define mensajes/destinatarios/eventos; credenciales privadas, idempotencia/errores; sin enviar datos clínicos por defecto |
| P2 Zoom automático | URL manual sin vínculo de eventos | Backend/proveedor, OAuth y posiblemente schema | Creación/edición/cancelación y webhook autenticado/reintentos; cierre clínico mantiene control profesional |
| P2 material histórico | Nuevo plan sustituye mundos activos | Regla de producto/acceso, posible BD/API | Definir si biblioteca acumula/revoca/reasigna; no alterar historial/autores |
| P2 varios trastornos | Una área + mundos/textos | Dominio clínico/BD/API | Definir diagnóstico versus objetivo/mundo y planes simultáneos antes de crear relaciones |
| P2 educación persistente | sessionStorage y tablas heredadas | Modelo/API y experiencia | Avance por niño/versión, autorización y evaluación verificable; sin usar volumen de micrófono como éxito clínico |
| P3 móvil/pulido visual | Desktop renovado; consistencia final pendiente | UI/UX | Revisión por rol, formularios/errores/teclado; usuario indicó que responsive puede esperar |

Las mejoras que pueden mantenerse sin cambiar reglas son textos, orden de pasos, ayudas, confirmaciones, etiquetas, validación coherente con el contrato, estados de guardado y navegación. El PIN, automatización, diagnóstico múltiple, biblioteca acumulativa o vencimiento/versionado de disponibilidad sí afectan seguridad, negocio o datos. Deben documentarse y comprobarse como tales.

## 6. Casos de aceptación pendientes para el equipo

| Caso | Preparación | Resultado esperado actual | Estado de aceptación Render |
| --- | --- | --- | --- |
| Registrar sesión | Cita virtual confirmada existente | PROGRAMADA y enlace conservado | Por confirmar por usuario |
| Inicio temporal | Antes/después del horario | Antes bloqueado; después EN_CURSO | Código/SQL local heredado; pendiente humano |
| Guardar reporte | Sesión iniciada propia, texto ficticio/consentido | Reporte persistido, PDF y familia en lectura | Pendiente humano |
| Publicar primer plan | Reporte con contenido válido | ACTIVO, autor y mundos correctos | Pendiente humano |
| Cerrar asistencia | EN_CURSO propia | FINALIZADA/ASISTIO; cita COMPLETADA | Pendiente humano |
| Recorrido habilitado | Mismo niño, introducción atendida+reporte+plan | Puede reservar TERAPIA | Pendiente humano |
| Otro terapeuta | Plan vigente, profesional/turno libre | Reserva con nuevo profesional; plan conserva autor | Pendiente humano |
| Contexto de colega | Nuevo profesional vinculado al niño | Lee anterior, no puede editar sesión ajena | Local V35–V36; pendiente humano |
| Conservar plan | Atención posterior sin publicar plan | Mundo ASHA conserva selección inicial | Pendiente humano |
| Reemplazar plan | Nueva atención con nuevo plan | Anterior FINALIZADO; nueva selección de mundos | Local heredado; pendiente humano |
| Hermano | Otro niño del mismo tutor | Recorrido/plan/demo independientes | Local V36; pendiente humano |
| Inasistencia | PROGRAMADA con fin ya pasado | NO_ASISTIO, no habilita introducción atendida | Local; no fabricar en producción |

No ejecutar estos casos creando datos reales solo para documentar. Para evidencia automatizada usar base descartable y cuentas ficticias; para el recorrido real el usuario opera sus cuentas autorizadas. No cambiar reloj del hosting ni fecha de citas reales para evitar esperar el horario. Si se obtiene una traza nueva, anotarla por separado sin reetiquetar evidencia local como Render.

## 7. Mapa de archivos para trabajar sin rehacer el flujo

| Trabajo | Frontend | Backend / datos |
| --- | --- | --- |
| Acceso/activación | pages/auth, auth/AuthContext, app/RouteAccess | api/v1/auth, schemas/reglas, services/activacion/auth_service |
| Cuentas/familia | pages/admin/AdminCuentas y modales; adminService | api/v1/admin, services/familias/admin_cuentas_creacion |
| Horarios | components/common/AvailabilityEditor; TerapeutaConfig | api/v1/terapeutas, services/agenda, models/agenda |
| Reserva/recorrido | pages/padre/Padre agenda/directorio; clinicalService | api/v1/citas/pacientes, services/citas/acceso |
| Atención/Zoom | components/common/SessionActions/VirtualMeeting; TerapeutaAgenda | api/v1/citas/sesiones, schemas/clinica |
| Reporte/plan | ClinicalReportEditor/SessionPlan; reports/ReportWorkspace | services/sesiones/planes/report_pdf, models/clinica |
| Familia/mundos | familyTracking; Sessions/MundoAshaHome/DemoWorldPlayer; demoWorlds | Tratamientos/recorrido: API real; progresión educativa: no servicio actual |
| Chat/notificaciones | messagingService/notificationsService y componentes comunes | services/mensajeria/notificaciones/recordatorios; models correspondientes |
| Roles/capacidad/demo | app/routeCapabilities, routes/paths, routeManifest/AppRouter | api/deps, services/acceso; autorización final aquí |

Modelo físico y 69 endpoints: consultar el maestro, no asumir que los mocks o tablas educativas representan un contrato listo. Antes de ampliar relaciones, leer architecture y ADR0013–0018. Si cambia la arquitectura, añadir ADR de la decisión nueva; no inventar una decisión pasada.

## 8. Invariantes y relevo para agentes/desarrolladores

Leer AGENTS.md, PROJECT_CONTEXT, este documento, maestro y último IMPLEMENTATION_PROGRESS. Verificar `git status`, rama/SHA y referencias remotas; base común dev. Esta documentación pertenece a V46; confirmar SHA publicado mediante Git, no confiar solo en una conversación.

Invariantes: React → HTTP/JSON → FastAPI → SQLAlchemy/PostgreSQL; sin frontend SQL ni Supabase Auth. Asesor ADMIN. No pagos reales. No anticipación semanal. Una introducción por niño según estado, una sesión por cita, una versión de plan por atención y un plan activo del expediente. El colega lee contexto autorizado, no reescribe atenciones ajenas. Los juegos siguen demo hasta una fase de persistencia explícita.

No crear usuarios ni modificar tablas compartidas para pruebas sin petición explícita. No ejecutar fixtures sobre QA persistente; no editar `.env`, mostrar secretos o usar fuerza Git. No inventar horarios para terapeutas ni migrar planes viejos a profesionales colocando una sesión_origen artificial. Las migraciones002–006 ya fueron adoptadas: leer preflight/catálogo y usar un nuevo corte para una decisión nueva.

Consultar Graphify con símbolos concretos y presupuesto corto; confirmar leyendo código. `python tools/knowledge/manage.py check`; si cambia fuente, refresh/check. Run tests acordes al cambio y declarar entorno/omitidas/avisos. Una build no certifica todas las pantallas.

Al cerrar una mejora coherente: revisar diff/secretos/evidencia/refs/conflictos, actualizar contexto/guía/progreso, continuar VNN_Accion_Modulos desde Git con descripción breve, publicar rama de trabajo y dev sin force-push y verificar sincronización. Si una extensión se difiere, no declararla finalizada para crear commit.

Prompt de continuación sugerido:

> Continúa ASHAKids desde dev/V46, verificando el SHA real. Lee AGENTS.md, DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md y GUIA_FLUJO_ESTADO_Y_PENDIENTES.md. El usuario ya probó alta de padre/terapeuta, disponibilidad, reserva y enlace Zoom en Render. Prioriza aceptar y orientar registrar/iniciar sesión, guardar reporte, publicar plan y cerrar ASISTIO, lectura familiar y nueva reserva con otro profesional. Usa datos ficticios en base aislada para tests; no crees clínica compartida ni cambies credenciales. Conserva estados, autoría, único plan activo, demo educativa, ausencia de pagos/anticipación semanal. Las propuestas PIN/WSP/Zoom/múltiples diagnósticos son backlog separado, no ajustes estéticos. Cada mejora terminada lleva commit VNN y publicación verificada en dev.

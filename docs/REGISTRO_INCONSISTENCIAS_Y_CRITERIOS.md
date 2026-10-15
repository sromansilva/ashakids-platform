# ASHAKids — inconsistencias y criterios por unificar

**V46 · 10/10/2026.** Base `62048038b70d2411234fb681284e327cf142d1b7` (V45), codex/2do-intento/dev. Repositorio https://github.com/sromansilva/ashakids-platform . Complemento del [maestro](DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md) y [guía](GUIA_FLUJO_ESTADO_Y_PENDIENTES.md).

El usuario solicita documentar contradicciones para estandarizar su criterio con la app real. **Todas siguen abiertas: no se corrigieron aquí.** Fuentes y líneas corresponden al SHA base. La confirmación es por lectura de código; las pruebas de aceptación abajo son propuestas, **no casos nuevos ejecutados en Render**. No usar contraseñas, DNI ni clínica reales para reproducirlas.

“Inconsistencia” significa contradicción de capas/mensajes; “criterio pendiente” significa una regla existente que necesita decisión de producto, no un fallo automático. P1 afecta confianza/uso del flujo; P2 afecta coherencia. Los IDs se conservan cuando se cierre una ficha con decisión, evidencia y SHA. Este registro focalizado no certifica todos los formularios ni seguridad integral.

## 1. Índice de trabajo

| ID | Tema | Tipo / prioridad | Estado |
| --- | --- | --- | --- |
| INC-01 | UI contraseña8 / API12–128 | Validación / P1 | Confirmada, abierta |
| INC-02 | Contraseña actual no enviada/verificada en cambio propio | Control / P1 | Confirmada, abierta |
| INC-03 | Solicitud perfil “enviada” sin HTTP | Éxito ficticio / P1 | Confirmada, abierta |
| INC-04 | 2FA “activado/correo enviado” sin servicio | Seguridad demo / P1 | Aviso global demo; resultado particular abierto |
| INC-05 | Solicitud eliminación “recibida” sin registro | Éxito ficticio / P1 | Confirmada, abierta |
| INC-06 | Reporte NO_ASISTIO: UI bloquea / API no excluye | Regla clínica / P1 | Confirmada, abierta |
| INC-07 | Reporte vacío permite botón plan / API lo rechaza | Validación/orientación / P1 | Confirmada, abierta |
| INC-08 | Alias recompensas niega avance por niño local | Capacidad/alias / P2 | Confirmada, abierta |
| INC-09 | Bloqueos en borrador descritos como publicados | Estado/UX / P2 | Confirmada, abierta |
| CRI-10 | Inicial DNI8 en UI / contrato administrativo más amplio | Criterio / P2 | Decisión pendiente |
| CRI-11 | Mundos antes de cierre / terapia posterior después | Criterio / P1 | Decisión pendiente |
| CRI-12 | Plan “mensual” sin vencimiento automático | Criterio / P2 | Decisión pendiente |

## 2. Fichas con comportamiento, fuentes y aceptación

### INC-01 — Longitud de contraseña definitiva

**Usuario ve:** Configuración → Seguridad del terapeuta anuncia “Mínimo 8 caracteres” y valida longitud>=8. **Contrato real:** Password exige12–128 caracteres en activación y cambio propio. Una entrada8–11 puede pasar cliente y fallar422; esos inputs profesionales tampoco declaran max128. Son caracteres, no doce dígitos obligatorios.

**Fuentes:** frontend/src/pages/terapeuta/TerapeutaConfig.tsx L295/L335/L342; backend/app/schemas/reglas.py L7; schemas/usuarios.py L16; schemas/auth.py L41. **Impacto:** rechazo tardío y criterios distintos por formulario.

**Estándar propuesto para la regla vigente:** texto/atributos/validadores12–128 compartidos. No rebajar API a8 para acomodar el placeholder. PIN4 es una decisión de autenticación separada. **Aceptación propuesta:**8/11 rechazan coherentemente;12/128 admitidos por validación;129 rechazado con detalle; activación/config coinciden. No ejecutado en V46.

### INC-02 — Campo contraseña actual sin verificación real

**Usuario ve:** actual/nueva/confirmación; cliente solo comprueba actual no vacía. **Envío:** PATCH propio manda `{password: pwNueva}`, sin actual. **API:** UsuarioEditar no tiene current_password; editar_usuario verifica sesión y propiedad/ADMIN, cambia hash y revoca sesiones, sin verificar actual. Activación sí verifica inicial: son contratos diferentes.

**Fuentes:** TerapeutaConfig.tsx L334–342; services/clinicalService.ts usersService.edit; backend/app/schemas/usuarios.py L16; services/usuarios.py L60–82; services/activacion.py. **Impacto:** el campo aparenta reautenticación inexistente; la autorización por sesión propia sí funciona.

**Decisión necesaria:** exigir reautenticación en cambio propio o describir otra política real; separar restablecimiento ADMIN. Exigir actual cambia contrato/backend/seguridad. **Aceptación:** actual incorrecta se rechaza si política exige; cambio ajeno403; nueva cumple regla; revocación y reingreso orientados. No quitar controles por un cambio estético.

### INC-03 — Solicitud de edición de perfil

**Mensaje:** “Solicitud enviada al administrador”. **Realidad:** setSecurityNotice/timer local, sin HTTP ni registro de petición. La lectura inicial del perfil sí viene del servidor; editar esos campos no guarda perfil.

**Fuente:** TerapeutaConfig.tsx L81–95/L255. **Impacto:** el usuario espera una gestión que ADMIN no recibió. El aviso global dice solicitudes demo, pero este resultado promete envío.

**Estándar propuesto:** acción sin backend muestra “Demostración; no se ha enviado”; una solicitud real necesita id/estado, persistencia y consulta ADMIN. **Aceptación:** no afirmar guardado/envío sin respuesta del servidor; recarga y fallo mantienen información honesta. Implementación de solicitudes será una fase propia.

### INC-04 — “2FA activado” simulado

**Mensaje:** modal promete confirmación por correo; confirmar dice “2FA activado. Confirmación enviada…”. **Realidad:** setTwoFaEnabled local y aviso, sin OTP, proveedor o envío. Aviso global de routeCapabilities sí identifica 2FA como demo.

**Fuentes:** TerapeutaConfig.tsx L135; app/routeCapabilities.ts excepción terapeuta/config. **Impacto:** falsa expectativa de protección. **Estándar propuesto:** demo rotulada en el propio modal/resultado o control deshabilitado; no mostrar un segundo factor efectivo inexistente.

**Aceptación:** no prometer correo ni protección sin backend comprobado; recarga/login no se presenta como MFA. MFA requiere fase de seguridad específica, actualmente0% de integración.

### INC-05 — Solicitud de eliminación no registrada

**Mensaje:** eliminar acceso irreversible y luego “Solicitud de eliminación recibida. Te contactaremos…”. **Realidad:** cierre del modal y aviso local; no baja, revocación ni solicitud persistida. El modal además menciona revisar pagos, fuera del alcance vigente.

**Fuente:** TerapeutaConfig.tsx L136. No confundir con rutas ADMIN de eliminación condicionada que sí tienen servicios. **Impacto:** cree haber iniciado un proceso que nadie recibió.

**Estándar propuesto:** separar baja real, solicitud real y demo; promesa de contacto solo con trazabilidad. **Aceptación:** alcance explícito y sin éxito ficticio; si se implementa, id/estado y conservación de historial/permisos. No eliminar cuentas reales para pruebas documentales.

### INC-06 — Reporte en inasistencia

**UI:** SessionActions/ReportWorkspace bloquean editar si asistencia=NO_ASISTIO. **API:** guardar_reporte solo exige EN_CURSO/FINALIZADA, no comprueba NO_ASISTIO. Una inasistencia queda FINALIZADA y no está excluida por esa condición; plan y recorrido sí la excluyen.

**Fuentes:** backend/app/services/sesiones.py L68–83; planes.py L28; citas.py L71; components/common/SessionActions.tsx canEdit; pages/terapeuta/reports/ReportWorkspace.tsx canEdit. **Impacto:** política clínica distinta según canal.

**Criterio por acordar:** misma regla de escritura en servidor y UI; si se desea motivo de inasistencia, definir dato específico en vez de un reporte de atención improvisado. **Aceptación:** PUT/PDF/lectura responden a política elegida; NO_ASISTIO no habilita plan/terapia. No se ejecutó PUT real aquí.

### INC-07 — Reporte vacío frente al plan

**UI:** ClinicalReportEditor admite todo vacío; SessionPlan.canPublish usa reporte_disponible (existencia). **API:** publicar exige algún contenido en observaciones_iniciales/objetivos_trabajados/proximos_pasos; nivel_ayuda solo no vale. Puede aparecer el botón y recibir409 “Guarde primero el reporte” aunque ya se guardó uno vacío.

**Fuentes:** ClinicalReportEditor.tsx L12–35; SessionPlan.tsx L16/L22; backend/app/services/planes.py L30–32; schemas/clinica.py ReporteDatos. **Impacto:** no entiende qué falta.

**Estándar propuesto:** explicar contenido mínimo antes de plan; acordar si reporte vacío sigue siendo borrador/registro. No imponer los cuatro campos obligatorios por decisión estética. **Aceptación:** vacío/solo nivel_ayuda orientan específicamente; contenido válido habilita; rechazo conserva borrador.

### INC-08 — Aviso contradictorio en alias recompensas

**Ruta:** /padre/recompensas monta MundoAshaHome, que guarda demo por cuenta/niño/mundo en sessionStorage. **Aviso global:** dice que resultados “no guardan avance por hijo”; el componente informa avance por niño en la pestaña. Ninguno guarda en servidor.

**Fuentes:** app/AppRouter.tsx L53; app/routeCapabilities.ts L14–15; pages/padre/Sessions/MundoAshaHome.tsx L29; services/demoWorlds.ts. **Estándar propuesto:** aliases del mismo jugador comparten aviso actual, manteniendo advertencias de los juegos antiguos de distinto mecanismo.

**Aceptación:** /mundo-asha y alias describen demo local por niño/pestaña, sin servidor/medición clínica. No retirar rotulado demo ni declarar resultados SQL.

### INC-09 — Bloqueos borrador versus publicados

**Mensaje:** “No hay bloqueos publicados” cuando form.bloqueos vacío. **Realidad:** quitar el último cambia un borrador dirty=true antes de PUT; el servidor aún conserva su bloqueo. “Cambios pendientes de publicar” aparece también, pero las dos frases describen estados distintos sin aclararlos.

**Fuente:** AvailabilityEditor.tsx L13/L30–31/L39–40. **Impacto:** parece libre antes de publicar. **Estándar propuesto:** “en esta edición” frente a última publicación confirmada.

**Aceptación:** quitar/agregar sin publicar no se presenta aplicado; error conserva borrador y última configuración; éxito actualiza publicado. Las reservas se conservan y no aparece una regla de anticipación semanal.

### CRI-10 — Credencial inicial en contratos administrativos

**UI:** DNI8 pattern/min/max8. **/admin/cuentas/padres y terapeutas:** InitialDni o Password12–128. **/admin/familias:** campo dni limitado a8. En las rutas administrativas nuevas queda password_change_required=true. Es un contrato más amplio que el formulario, no fallo probado del alta humana por DNI.

**Fuentes:** AdminCuentasCrearModal.tsx L138–156; backend/app/schemas/admin.py L14/L23/L50; schemas/familias.py L13; services/admin_cuentas_creacion.py.

**Decisión:** siempre DNI8 o permitir inicial segura por ADMIN como compatibilidad. No resetear cuentas antiguas por unificación. **Aceptación:** texto/rutas documentan misma intención y excepciones; activación/entrega/revocación comprobadas con criterio acordado.

### CRI-11 — Puerta de acceso a mundos y terapia

Plan se publica EN_CURSO; MundoAshaHome comprueba ACTIVO/origen/mundos sin exigir intro cerrada; próxima reserva exige FINALIZADA/ASISTIO + reporte válido + plan. Es posible jugar antes de habilitar nueva terapia. **Fuentes:** planes.py L28; MundoAshaHome.tsx L24–25; citas.py L67–80/L103.

**Decisión:** práctica desde publicación, o práctica/nueva terapia después del cierre. No es un bug por sí sola; comunicar y validar la regla elegida. **Aceptación:** EN_CURSO/FINALIZADA/NO_ASISTIO del mismo niño tienen puertas coherentes, sin depender de fin Zoom ni completar juegos.

### CRI-12 — Significado de plan mensual

UI dice “Definir plan mensual”, “sesiones recomendadas este mes”. Servicio fecha_inicio=primer día del mes de publicación, ACTIVO hasta reemplazo; no caducidad/reinicio/cuota/compra automática. Nueva versión finaliza anterior y preserva historia.

**Fuentes:** SessionPlan.tsx L22/L26; backend/app/services/planes.py L42–50. **Decisión:** “plan vigente” con mes de referencia o nueva regla de revisión/caducidad. **Aceptación:** familia entiende vigencia/siguiente acción al cambiar de mes; sin cancelaciones implícitas/pagos ni garantía de biblioteca acumulativa inexistente.

## 3. Hoja de estándares y cierre

| Tema | Regla real que cambios actuales deben respetar | Decisión nueva pendiente |
| --- | --- | --- |
| Credencial definitiva | 12–128 caracteres | PIN4 es autenticación/seguridad, no parche de diseño |
| Inicial | FormularioDNI8; contratos administrativos ampliados | Unificar intención/compatibilidad |
| Éxito | Persistencia/envío confirmado por servidor | Demos no afirman correo, solicitudes ni protección real |
| Reporte | Cuatro textos; contenido mínimo para plan | NO_ASISTIO y posible borrador/publicación |
| Plan | Uno activo por expediente, una versión por atención, autor preservado | Caducidad/diagnósticos/material histórico |
| Disponibilidad | Borrador/publicación inmediata, conserva citas | Cambiar UX sin requisito de una semana |
| Mundo ASHA | Asignación real; avance demo local | Puerta de acceso y progreso servidor |
| Zoom | Enlace externo/estados manuales | API/eventos, conservando decisión profesional |

Por cada ID anotar decisión aprobada por equipo, responsable, archivos, SHA, casos/resultados reales, advertencias y aceptación del usuario. Solo entonces marcar **resuelta**; mantener los casos no ejecutados pendientes. Incorporar este registro en futuras tareas de UX/formularios para no inventar un estándar por pantalla. Foto/notas/objetivos/actividades/incidencias/valoraciones/ML/pagos conservan su condición demo de la guía; tener un botón no acredita backend.

# Reporte de Flujo Actual — Plataforma ASHAKids

> **Rama de referencia:** `feat/nlavadom` (sincronizada con `origin/main` en `4547681` + mejoras recientes en curso)  
> **Última actualización:** 27 de noviembre de 2026

---

## 1. Visión General y Arquitectura

**ASHAKids** es una plataforma integral de telerehabilitación e intervención clínica/educativa infantil especializada en habla, lenguaje, fluidez, voz y motricidad orofacial.

El monorepo se divide en tres componentes principales:

1. **Frontend (`frontend/`)**: SPA en React 18 + TypeScript + Vite + Tailwind CSS con enrutamiento protegido por rol (`AppRouter`, `RouteAccess`, `RoleRoute`) y cliente HTTP centralizado (`apiClient`).
2. **Backend (`backend/`)**: API REST en Node.js + TypeScript + Express + PostgreSQL (`pg`), organizada en módulos de dominio (`admin`, `auth`, `citas`, `clinica`, `conversaciones`, `educacion`, `incidencias`, `juegos`, `notificaciones`, `pacientes`, `padre`, `sesiones`, `soporte`, `terapeuta`, `tratamientos`, `usuarios`, `whatsapp`, entre otros).
3. **Microservicio de Machine Learning (`ml-service/`)**: Servicio Python independiente (FastAPI/Uvicorn) con dos capacidades diferenciadas:
   - **Transcripción fonológica tentativa** mediante **Wav2Vec 2.0** (procesamiento temporal de audio en memoria).
   - **Motor predictivo de tratamientos** (regresión de sesiones recomendadas y clasificación calibrada de riesgo de abandono, sujeto a aprobación humana explícita mediante manifiesto).

---

## 2. Flujo Funcional Actual de Extremo a Extremo

### 2.1. Portal Público y Acceso a la Plataforma
- **Home (`/`)**: Presenta la propuesta de valor, pasos de inicio, vista previa de **Mundo ASHA** (con «5 mundos de práctica» y «3 niveles a más por mundo»), **carrusel dinámico de terapeutas certificados** conectado a PostgreSQL (`GET /api/v1/terapeutas`), preguntas frecuentes (indicando sesiones de **40 minutos**), terapias especializadas y suscripción a boletín.
- **Páginas públicas vigentes** (todas unificadas visualmente con el diseño del Home mediante `PublicPageShell`):
  - `/ashi` (ASHI Intelligence — vista demostrativa)
  - `/sobre-nosotros` (con redirección desde `/nosotros`)
  - `/recursos` (guías, artículos e infografías con vista previa en modal)
  - `/ayuda` (Centro de Ayuda sin referencias públicas a precios ni pagos)
  - `/contacto` (solicitud de cuenta vía WhatsApp)
- **Alta cerrada y controlada**:
  - El registro público está cerrado (`POST /api/v1/auth/register`).
  - Las familias solicitan acceso vía WhatsApp (`/api/v1/whatsapp/webhook`), lo que crea una solicitud en estado `PENDIENTE`, o contactando a administración.
  - Solo un usuario **`ADMIN`** puede aprobar la solicitud (`/admin/solicitudes`) o crear cuentas manualmente (`/admin/cuentas`), generando un enlace temporal de activación para que el usuario cree su contraseña (`/crear-contrasena`).

### 2.2. Autenticación y Seguridad de Sesión
- Inicio de sesión (`/login`) con `codigo_usuario` (o correo) y contraseña verificada con **Argon2**.
- **Autenticación en dos pasos (2FA / TOTP)**: Configurable por el usuario con código QR compatible con Google/Microsoft Authenticator.
- **Protección contra fuerza bruta**: Conteo de intentos fallidos y bloqueo temporal automático (`intentos_fallidos`, `bloqueado_hasta`).
- **Control de sesión e inactividad**: Sesiones persistidas con hash en `sesiones_autenticacion`, TTL configurable y cierre automático por inactividad (`InactivitySessionGuard`).

### 2.3. Ciclo Clínico Completo
1. **Agendamiento**: El tutor (`PADRE`) selecciona a uno de sus hijos activos y reserva una cita con un terapeuta disponible (turnos de lunes a viernes, 08:00–17:00, sesiones de **40 minutos**).
2. **Confirmación y Calendar/Meet**: Al confirmarse la cita virtual, el sistema conserva el evento en Google Calendar y, cuando `MEET_ENABLED` está activo, genera el enlace de Google Meet (o permite enlace manual validado de `meet.google.com`).
3. **Ejecución de la sesión**: El terapeuta inicia la sesión dentro de la ventana permitida y trabaja en su **Espacio Profesional** (`/terapeuta/sesion`), registrando asistencia, capturas fonológicas opcionales y borrador del reporte.
4. **Reporte y Firma**: El terapeuta completa observaciones iniciales, objetivos trabajados, **Nivel de autosuficiencia** (1 a 5 estrellas) y próximos pasos. El borrador se autoguarda tras 20 s de inactividad. Al firmar y publicar (`FIRMADO`), el reporte se vuelve inmutable y visible para la familia.
5. **Plan de continuidad y Mundo ASHA**: A partir de la sesión introductoria o de seguimiento, el terapeuta publica un plan terapéutico (asignando código diagnóstico preliminar y mundos de práctica en Mundo ASHA) y, al cerrar el tratamiento, registra el desenlace (`ALTA` o `ABANDONO`).

---

## 3. Funcionalidad de los 4 Roles

### 3.1. `ADMIN` (Administración)
- **Rutas principales**: `/admin`, `/admin/cuentas`, `/admin/solicitudes`, `/admin/pacientes`, `/admin/citas`, `/admin/sesiones`, `/admin/operacion`, `/admin/contenido`, `/admin/ml`, `/admin/auditoria`, `/admin/config`.
- **Capacidades**:
  - **Gestión integral de cuentas** (`/admin/cuentas`): Alta de familias (padre + hijos), terapeutas y cuentas de soporte técnico; edición, suspensión, reactivación, eliminación controlada y reenvío de enlaces de activación.
  - **Solicitudes de baja**: Botón **«Solicitudes de baja»** junto al buscador en `/admin/cuentas` que lista las solicitudes de desactivación enviadas por padres (mostrando padre solicitante, código/correo, fecha de solicitud, estado de la cuenta y acceso directo para revisar o suspender la cuenta).
  - **Solicitudes de acceso WhatsApp** (`/admin/solicitudes`): Revisión, aprobación (creación de cuenta familiar) o rechazo de solicitudes recogidas por el chatbot.
  - **Operación e incidencias** (`/admin/operacion`): Atención de incidencias administrativas y escaladas desde Soporte Técnico, redirección entre áreas, revocación de estado y trazabilidad.
  - **Supervisión clínica y auditoría**: Consulta global de citas, sesiones, pacientes, estado de ML (`/admin/ml`) y bitácora de auditoría (`/admin/auditoria`).

### 3.2. `TERAPEUTA` (Especialistas)
- **Rutas principales**: `/terapeuta`, `/terapeuta/sesion`, `/terapeuta/agenda`, `/terapeuta/pacientes`, `/terapeuta/reportes`, `/terapeuta/mensajes`, `/terapeuta/analiticas`, `/terapeuta/datos-actividad`, `/terapeuta/incidencias`, `/terapeuta/config`.
- **Capacidades**:
  - **Panel operativo** (`/terapeuta`): KPIs de pacientes atendidos, citas de hoy y reportes pendientes, con paleta combinada morado–naranja.
  - **Espacio Profesional** (`/terapeuta/sesion`): Vista dedicada en el sidebar que muestra la sesión activa en curso (control de sesión, enlace a Meet, widget fonológico y editor de reporte) o, si no hay reunión activa, la guía rápida y citas del día.
  - **Agenda clínica** (`/terapeuta/agenda`): Vista diaria y semanal (08:00–17:00), gestión de disponibilidad semanal, confirmación/inicio de reuniones y modo prueba (en entornos no productivos).
  - **Expedientes y planes** (`/terapeuta/pacientes`): Historial clínico, reportes firmados, planes de tratamiento, asignación de mundos en Mundo ASHA y cierre con desenlace clínico.
  - **Reportes clínicos** (`/terapeuta/reportes`): Distribución de pantalla completa con lista de «Sesiones por redactar», lista de «Reportes guardados» con scroll interno y editor «Reporte de sesión #X» a altura completa con plantillas guiadas, **Nivel de autosuficiencia** (1–5 estrellas) y descarga en PDF.
  - **Comunicación e incidencias**: Mensajería con familias (`/terapeuta/mensajes`), reporte de incidencias filtradas por rol (`/terapeuta/incidencias`) y gestión de perfil/foto/2FA (`/terapeuta/config`).

### 3.3. `PADRE` (Familias y Pacientes)
- **Rutas principales**: `/padre/welcome`, `/padre?section=world|journey|family`, `/padre/agenda`, `/padre/psicologos`, `/padre/reportes`, `/padre/mensajes`, `/padre/incidencias`, `/padre/config`, `/mundo-asha/*`.
- **Capacidades**:
  - **Navegación familiar**: Barra superior (`FamilyTopNav`) con selector de hijo activo e indicador flotante deslizante entre **Mi Mundo**, **Mi Camino ASHA** y **Para mi familia**, más pantalla de bienvenida (`/padre/welcome`) con tarjetas interactivas animadas.
  - **Mi Mundo y Mundo ASHA**: Acceso a los 5 mundos educativos interactivos asignados por el terapeuta (actividades de práctica lúdica con intentos, experiencia y medallas; no miden progreso clínico).
  - **Mi Camino ASHA y Seguimiento**: Secciones **Resumen**, **Planes**, **Sesiones** y **Reportes** con diseño estructurado en tarjetas lavanda, iconos Lucide y botones en naranja secundario, incluyendo el card **«Último reporte de sesión»** con acceso a los informes firmados.
  - **Agenda y comunicación**: Reserva/reprogramación de citas (`/padre/agenda`), ingreso a Meet cuando el terapeuta inicia la sesión, mensajería (`/padre/mensajes`) e incidencias (`/padre/incidencias`).
  - **Configuración familiar** (`/padre/config`): Consulta de datos de cuenta (con guía de contacto vía incidencias), gestión de hijos, preferencias de notificaciones, consentimiento de reconocimiento de voz por hijo, cambio de contraseña, 2FA y **«Solicitar desactivación de la cuenta»** (con validación de contraseña y 2FA, enviada a administración para revisión).

### 3.4. `SOPORTE_TECNICO` (Soporte Técnico)
- **Rutas principales**: `/soporte`, `/soporte/incidencias`, `/soporte/incidencias/:id`, `/soporte/config`.
- **Capacidades**:
  - Cuenta independiente creada exclusivamente por Administración (`/api/v1/admin/cuentas/soporte`), sin acceso a módulos clínicos, expedientes, pagos ni gestión de cuentas.
  - Bandeja exclusiva (`/api/v1/soporte/incidencias`) ordenada por fecha para atender incidencias técnicas, responder al solicitante, registrar **notas internas** (invisibles para el solicitante), resolver incidencias o **escalar incidencias de permisos a Administración**.
  - Gestión propia de contraseña y 2FA en `/soporte/config`.

---

## 4. Funcionalidad de Reuniones y Sesiones Clínicas

| Regla / Mecanismo | Comportamiento actual |
| --- | --- |
| **Generación de enlace Meet** | Al reservar una cita virtual, `MeetService` crea la reunión en Google Meet si `MEET_ENABLED` y OAuth están configurados; de lo contrario, el terapeuta puede registrar un enlace manual validado de `meet.google.com`. |
| **Puerta de la reunión (Meeting Gate)** | El servidor bloquea el envío de `meet_url` al rol `PADRE` en respuestas, correos y notificaciones hasta que el terapeuta inicie la sesión (`estado_sesion = EN_CURSO`). La familia nunca es invitada directamente al evento de Calendar. |
| **Ventana horaria estricta** | `POST /api/v1/sesiones/:key/iniciar` solo se acepta desde **5 minutos antes** del inicio programado hasta la hora de fin de la cita. |
| **Modo prueba** | Controlado por `SESSION_TEST_MODE_ENABLED` (bloqueado en `ENVIRONMENT=production`), habilita «Iniciar ahora (modo prueba)» omitiendo únicamente la ventana horaria, manteniendo intactos permisos y estados. |
| **Redirección en la misma pestaña** | Al iniciar o preparar una reunión como terapeuta (`SessionLaunchControls` y `NotificationCenter`), el navegador redirige directamente a `/terapeuta/sesion` **en la misma pestaña** en lugar de abrir una pestaña extra para el panel clínico. Solo el enlace externo de Google Meet se abre en nueva pestaña. |
| **Trabajo en paralelo y audio** | ASHAKids nunca captura pistas remotas de Meet. El widget clínico captura muestras breves desde el micrófono local del terapeuta (o mediante solicitud explícita al micrófono local del dispositivo familiar) únicamente tras comprobar el consentimiento vigente del niño y con acción explícita del adulto. |
| **Autoguardado del reporte** | El editor clínico (`ClinicalReportEditor`) ejecuta autoguardado con *debounce* de **20 segundos** (`REPORT_AUTOSAVE_DELAY_MS = 20_000`). Cada edición reinicia el temporizador para evitar peticiones excesivas mientras el terapeuta redacta. |

---

## 5. Funcionalidad de Machine Learning (ML / IA)

El microservicio `ml-service/` opera de forma desacoplada con dos líneas funcionales estrictamente gobernadas:

### 5.1. Transcripción Fonológica Tentativa (Wav2Vec 2.0)
- **Modelo**: `jonatasgrosman/wav2vec2-large-xlsr-53-spanish` (revisión fijada `96d7e9b4e4a78af515a3c6d3cee7c0826045d276`, ejecutado localmente en `ml-service/wav2vec_engine.py`, sin subir audio a terceros).
- **Privacidad de audio**: Las muestras se procesan temporalmente en memoria (`audio_memory.py`) y **no se almacenan como archivos permanentes**. Requiere consentimiento vigente del tutor.
- **Indicadores de apoyo (`phoneticIndicators.ts`)**: El backend calcula a partir de la transcripción tentativa:
  - `similitud_texto_porcentaje`
  - `tipo_error_sugerido`
  - `hipotesis_sugerida`
- **Límites clínicos obligatorios**:
  - Se muestran al terapeuta bajo la etiqueta *«Indicador de apoyo · sin validación clínica»*.
  - No miden acústica, no detectan distorsiones, no califican pronunciación ni emiten diagnósticos.
  - Nunca se aceptan desde el cliente ni se exponen al rol `PADRE`.
  - Solo evaluaciones revisadas y confirmadas por el terapeuta pueden incorporarse a las observaciones del reporte; `hipotesis_sugerida` nunca se pega al informe.

### 5.2. Pronóstico de Tratamientos (Sesiones y Riesgo de Abandono)
- **Arquitectura del predictor (`treatment_predictor.py`)**:
  - Regresor `RandomForestRegressor` para estimar sesiones recomendadas.
  - Clasificador calibrado (`CalibratedClassifierCV` sobre `RandomForestClassifier`) para riesgo de abandono.
- **Variables capturadas sin depender del modelo**:
  - Cada plan publicado persiste sus 5 variables en `tratamiento_variables_modelo` (incluyendo `nivel_colaboracion` en escala 1–5 derivada del informe y `codigo_diagnostico_preliminar` del catálogo institucional de 4 códigos: `0: Dislalia funcional`, `1: Retraso simple del habla`, `2: Trastorno del lenguaje (TEL)`, `3: Deglución atípica`).
  - Al cerrar un tratamiento, el terapeuta registra el desenlace real (`ALTA` o `ABANDONO`) mediante `PATCH /api/v1/clinica/tratamientos/:id/desenlace`.
- **Gobernanza y estado de encendido**:
  - El pronóstico permanece **apagado por defecto** (HTTP `503` en el predictor y `disponible: false` en `GET /api/v1/clinica/tratamientos/pronostico-estado`) hasta que exista una cohorte real exportada (`scripts/export_treatment_cohort.mjs`), entrenada (`train_predictive_model.py`) y **aprobada manualmente por un revisor humano** en `ml-artifacts/treatment-manifest.json` con `status: APPROVED_FOR_CLINICAL_ASSISTANCE` y verificación de hashes SHA-256.

---

## 6. Resumen de Cambios Recientes en la Rama `feat/nlavadom`

### 6.1. Commits recientes integrados (`V173` – `V187`)
- **Seguridad y sesiones (`V173`, `V174`)**: Timeout por inactividad, bloqueo por intentos fallidos, TTL de sesión, implementación de **2FA TOTP** y corrección de eliminación/duplicados de cuentas.
- **Incidencias y Soporte Técnico (`V175`, `V177` – `V187`)**: Trazabilidad y revocación de estado de incidencias, enrutamiento y filtrado de categorías/variedades por rol (`PADRE`, `TERAPEUTA`, `SOPORTE_TECNICO`), escalamiento de permisos desde Soporte a Administración, ordenamiento cronológico de bandeja de soporte y configuración de perfil de soporte (`/soporte/config`).
- **Espacio Profesional de Terapeuta (`V176`)**: Incorporación de `/terapeuta/sesion` en el sidebar del terapeuta para centralizar la atención de la sesión activa.

### 6.2. Nuevos cambios implementados en la iteración actual (`feat/nlavadom`)
1. **Limpieza y unificación del Portal Público**:
   - Eliminación de páginas y rutas obsoletas (`/especialistas`, `/especialidades`, `/historias`, `/trabaja`, `/planes`).
   - Reorganización del footer (**Plataforma**: Especialistas, Mundo ASHA, ASHI Intelligence; **Empresa**: Sobre Nosotros, Recursos; **Soporte**: Centro de Ayuda, Contacto) y resaltado activo (*scroll-spy*) en el navbar del Home.
   - Unificación visual de `/ashi`, `/sobre-nosotros`, `/recursos`, `/ayuda` y `/contacto` con el diseño del Home (`PublicPageShell`).
   - Eliminación de preguntas sobre pagos/cobros en `/ayuda`, corrección del logo clickeable en `/login`, actualización de textos del Home («3 niveles a más por mundo» y sesiones de **40 minutos**).
   - **Carrusel dinámico de terapeutas en el Home** conectado a `GET /api/v1/terapeutas`, con avance de 3 en 3 tarjetas y modal de detalle profesional sin datos sensibles.
2. **Mejoras en el Portal Familiar (`PADRE`) y Administración (`ADMIN`)**:
   - Indicador flotante deslizante (280 ms) en `FamilyTopNav` para `Mi Mundo`, `Mi Camino ASHA` y `Para mi familia`.
   - Animación simétrica (`scale(1.03)`, 200 ms `ease-out`) en las tarjetas de `/padre/welcome`.
   - Reemplazo de «Eliminar cuenta» por **«Solicitar desactivación de la cuenta»** en `/padre/config?tab=seguridad` con confirmación por contraseña + 2FA (`POST /api/v1/padres/solicitud-baja`) sin desactivación inmediata.
   - Nuevo apartado **«Solicitudes de baja»** en `/admin/cuentas` (`GET /api/v1/admin/solicitudes-baja`) para que Administración consulte solicitantes y fechas.
   - Actualización del aviso de modificación de datos en `/padre/config?tab=cuenta` indicando el flujo por incidencias.
   - Rediseño visual sin emojis (iconos Lucide, sub-tarjetas lavanda y botones en naranja secundario) en **Último reporte de sesión**, **Resumen**, **Planes**, **Sesiones** y **Reportes**.
3. **Mejoras en el Portal de Terapeuta (`TERAPEUTA`)**:
   - Combinación de paleta **morado y naranja** en el dashboard, espacio profesional, reportes y controles de sesión.
   - Ajuste de altura de ventana en `/terapeuta/reportes`: «Reporte de sesión #X» a altura completa y «Reportes guardados» con desplazamiento vertical interno.
   - Cambio de **«Nivel de ayuda»** a **«Nivel de autosuficiencia»** con escala invertida de 1 a 5 estrellas (1 = bastante apoyo, 5 = autónomo sin ayuda) en `/terapeuta/reportes` y `/terapeuta/sesion`.
   - Redirección directa en la **misma pestaña** a `/terapeuta/sesion` al iniciar o preparar una reunión.
   - Optimización del **autoguardado** de reportes a **20 segundos** de inactividad (*debounce*).

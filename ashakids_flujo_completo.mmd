flowchart TD

%% =========================================================================
%% ASHAKIDS - FLUJO COMPLETO DEL SISTEMA
%% Basado en el Plan de Automatización, Evaluación Fonológica y Seguimiento 2026
%% =========================================================================

%% -------------------------------------------------------------------------
%% 1. ACCESO, SOLICITUD Y ALTA DE FAMILIA POR WHATSAPP Y ADMIN
%% -------------------------------------------------------------------------
    L_START([Inicio: Visita a ASHAKids]) --> L_HOME["Landing Page pública<br/>ashakids.com"]
    L_HOME --> L_ACTIONS{"¿Qué desea hacer el visitante?"}

    L_ACTIONS --> L_INFO["Consultar información pública<br/>(Cómo funciona, Especialistas, 5 Mundos, FAQ)"]
    L_ACTIONS --> L_WAPP["Solicitar acceso familiar<br/>(Botón directo de WhatsApp)"]
    L_ACTIONS --> L_ASHI["Conversar con Ashi<br/>(Asistente virtual de orientación)"]
    L_ACTIONS --> L_LOGIN_BTN["Iniciar sesión<br/>(Usuarios con cuenta)"]

    L_INFO --> L_HOME
    L_ASHI --> L_HOME

    %% Flujo WhatsApp Bot (Meta Cloud API)
    L_WAPP --> W_WEBHOOK["Chatbot WhatsApp Meta Cloud API<br/>(POST /api/v1/whatsapp/webhook)"]
    W_WEBHOOK --> W_CHECK_PREV{"¿Tiene solicitud previa?"}
    W_CHECK_PREV -- "Abierta o Aprobada" --> W_INFORM["Informa estado actual de la solicitud"]
    W_INFORM --> L_HOME
    W_CHECK_PREV -- "Nueva solicitud" --> W_PRIVACY["Aviso de privacidad y consentimiento<br/>(Uso de datos solo para alta)"]
    W_PRIVACY --> W_CONSENT{"¿Acepta consentimiento?<br/>(Responde SI / CANCELAR)"}
    W_CONSENT -- "CANCELAR" --> W_CANCELLED["Cancela trámite y borra datos registrados"]
    W_CANCELLED --> L_HOME
    W_CONSENT -- "Responde SI" --> W_ASK_DATA["Pide datos: Nombres, Apellidos,<br/>DNI (8 dígitos) y Correo"]
    W_ASK_DATA --> W_CONFIRM{"Resumen de datos:<br/>¿Confirmar o Corregir?"}
    W_CONFIRM -- "CORREGIR" --> W_ASK_DATA
    W_CONFIRM -- "Escribe CANCELAR" --> W_CANCELLED
    W_CONFIRM -- "Responde SI" --> W_CREATE_SOL["Crea solicitud de acceso PENDIENTE<br/>(solicitudes_acceso_familia)"]

    %% Notificación a Administradores y Verificación
    W_CREATE_SOL --> W_NOTIF_ADMIN["Notificación en plataforma a cada ADMIN activo<br/>(«Nueva solicitud de acceso») + Contador en Sidebar"]
    W_NOTIF_ADMIN --> A_SOL_INBOX["Admin accede a Solicitudes de acceso<br/>(/admin/solicitudes)"]
    A_SOL_INBOX --> A_DNI_ACTION{"¿Verificar DNI con RENIEC?"}
    A_DNI_ACTION -- "Consultar Decolecta" --> A_DNI_VERIF["Verificación RENIEC vía Decolecta<br/>(COINCIDE / NO_COINCIDE / NO_ENCONTRADO - solo apoyo)"]
    A_DNI_VERIF --> A_SOL_DECISION{"Decisión del Administrador"}
    A_DNI_ACTION -- "Decisión directa" --> A_SOL_DECISION

    %% Rechazo de Solicitud
    A_SOL_DECISION -- "Rechazar" --> A_RECHAZAR["Registro de motivo obligatorio (10 a 300 caracteres)<br/>Estado RECHAZADA"]
    A_RECHAZAR --> A_WAPP_REJECT["Aviso del motivo a la familia: siempre por correo<br/>y por WhatsApp si está dentro de la ventana de 24 h"]

    %% Aprobación y Creación de Cuenta PADRE
    A_SOL_DECISION -- "Aprobar" --> A_APROBAR["Creación de cuenta PADRE<br/>(adminService.crearPadre)"]
    A_APROBAR --> A_MAIL_CHECK{"¿Correo de bienvenida enviado?"}
    A_MAIL_CHECK -- "Fallo en envío" --> A_RESEND["Botón: «Reenviar activación»<br/>(Solo por correo electrónico)"]
    A_RESEND --> A_MAIL_CHECK
    A_MAIL_CHECK -- "Enviado con éxito" --> A_EMAIL_SENT["Envío automático de correo con enlace de activación<br/>(Vigencia: 2 horas)"]
    A_EMAIL_SENT --> A_WAPP_APPROVE["Aviso por WhatsApp a la familia<br/>(Texto si < 24 h, o plantilla aprobada)"]
    A_EMAIL_SENT --> L_PARENT_ACTIVATE["Padre recibe correo y abre enlace de activación"]
    L_PARENT_ACTIVATE --> L_PARENT_SETPASS["Establecer contraseña segura<br/>(/crear-contrasena)"]
    L_PARENT_SETPASS --> L_LOGIN_BTN

    %% Proceso de Autenticación, Seguridad y Bloqueo
    L_LOGIN_BTN --> L_LOGIN_FORM["Formulario de inicio de sesión<br/>(/login)"]
    L_LOGIN_FORM --> L_LOCK_CHECK{"¿Cuenta bloqueada temporalmente?"}
    L_LOCK_CHECK -- "Sí (10 intentos fallidos)" --> L_LOCK_WAIT["Bloqueo temporal por 5 minutos<br/>(HTTP 429 Too Many Requests)"]
    L_LOCK_WAIT --> L_LOGIN_FORM
    L_LOCK_CHECK -- "No" --> L_AUTH_CHECK{"¿Credenciales válidas?"}
    L_AUTH_CHECK -- "No" --> L_AUTH_ERR["Incremento de intentos fallidos<br/>(Muestra intentos restantes)"]
    L_AUTH_ERR --> L_LOGIN_FORM
    L_AUTH_CHECK -- "Sí" --> L_2FA_CHECK{"¿Tiene 2FA TOTP activado?"}
    L_2FA_CHECK -- "Sí" --> L_2FA_FORM["Desafío 2FA: Solicitar código TOTP de 6 dígitos<br/>(Ticket provisional de 5 min)"]
    L_2FA_FORM --> L_2FA_VALID{"¿Código TOTP válido?"}
    L_2FA_VALID -- "No" --> L_AUTH_ERR
    L_2FA_VALID -- "Sí" --> L_CREATE_SESSION
    L_2FA_CHECK -- "No" --> L_CREATE_SESSION["Emisión de sesión segura con cookie httpOnly<br/>(Vigencia: 3 horas o cierre por inactividad)"]
    L_CREATE_SESSION --> L_ROLE_CHECK{"Identificar rol del usuario"}

    L_ROLE_CHECK -- "PADRE" --> P_ENTRY([Acceso al Centro Familiar])
    L_ROLE_CHECK -- "TERAPEUTA" --> T_ENTRY([Acceso al Panel Profesional])
    L_ROLE_CHECK -- "ADMIN" --> A_ENTRY([Acceso al Panel de Administración])
    L_ROLE_CHECK -- "SOPORTE_TECNICO" --> S_ENTRY([Acceso al Portal de Soporte Técnico])


%% -------------------------------------------------------------------------
%% 2. EL FLUJO CENTRAL DE AUTOMATIZACIÓN E INTERVENCIÓN (Eje Nuclear 2026)
%% Evaluación inicial → Pruebas fonológicas → Reporte clínico →
%% Plan personalizado → Juegos asignados → Seguimiento → Actualización
%% -------------------------------------------------------------------------
    subgraph FLUJO_CENTRAL ["EJE CENTRAL: Automatización, Evaluación Fonológica y Seguimiento Terapéutico"]
        FC_START([Inicio del Recorrido del Niño]) --> FC_1

        subgraph FC_STEP1 ["Paso 1: Programación de Sesión Introductoria de Evaluación"]
            FC_1["Padre registra nuevo hijo en la plataforma<br/>(Perfil independiente por niño)"]
            FC_1 --> FC_1_CONSENT["Padre autoriza muestras de voz<br/>(Consentimiento informado en /padre/consentimiento)"]
            FC_1_CONSENT --> FC_1B["Aviso obligatorio: El primer paso es una sesión introductoria"]
            FC_1B --> FC_2["Padre consulta directorio de terapeutas y su disponibilidad"]
            FC_2 --> FC_3["Padre selecciona profesional y reserva fecha/hora de 40 min<br/>(Modal BookingDialog)"]
            FC_3 --> FC_4["Sistema valida no solapamiento y confirma reserva automáticamente"]
        end

        subgraph FC_STEP2 ["Paso 2: Notificaciones y Apertura de Google Meet"]
            FC_4 --> FC_5["T-10 min: Notificación anticipada en plataforma al terapeuta"]
            FC_5 --> FC_6["T-5 min hasta fin de cita: Se habilita botón «Iniciar reunión» para el terapeuta"]
            FC_6 --> FC_7["Terapeuta pulsa «Iniciar reunión»<br/>(POST /sesiones/:key/iniciar → estado_sesion = EN_CURSO)"]
            FC_7 --> FC_7A["1. Se abre videollamada en Google Meet (terapeuta)"]
            FC_7 --> FC_7B["2. Se abre en paralelo el «Panel de sesión y pruebas fonológicas»"]
            FC_7 --> FC_7C["3. Servidor expone meet_url a la familia solo tras iniciar sesión (EN_CURSO)"]
            FC_7A --> FC_8["Terapeuta y familia se conectan a Google Meet"]
            FC_7C --> FC_8
        end

        subgraph FC_STEP3 ["Paso 3: Panel de Sesión y Pruebas Fonológicas en Tiempo Real"]
            FC_8 --> FC_9["Sesión en curso (40 minutos de atención terapéutica)"]
            FC_7B --> FC_9
            FC_9 --> FC_10["Panel muestra datos: niño, terapeuta, tiempo restante y acceso Meet"]
            FC_10 --> FC_11["Terapeuta identifica dificultades y selecciona fonemas/palabras soportados (/rr/, /r/, /s/, /pl/, /tr/)"]
            FC_11 --> FC_AUDIO_SRC{"Origen de la muestra de audio<br/>(Consentimiento vigente, nunca captura pista de Meet)"}
            FC_AUDIO_SRC -- "Micrófono local terapeuta" --> FC_13A["Captura local desde micrófono del terapeuta"]
            FC_AUDIO_SRC -- "Dispositivo familiar" --> FC_12["Solicitud sincronizada al dispositivo familiar"]
            FC_12 --> FC_13["Adulto inicia explícitamente la captura desde su portal"]
            FC_13A --> FC_14["Envío de muestra corta de audio en memoria al backend"]
            FC_13 --> FC_14
            FC_14 --> FC_15["Modelo Wav2Vec 2.0 genera transcripción tentativa"]
            FC_15 --> FC_16["Servidor calcula indicadores de apoyo:<br/>Similitud de texto, tipo de error sugerido e hipótesis<br/>(«Indicador de apoyo · sin validación clínica» - no llegan a la familia)"]
            FC_16 --> FC_16_CONFIRM["Terapeuta confirma o descarta resultados en su panel<br/>(Solo evaluaciones confirmadas van al informe; hipótesis se excluye)"]
            FC_16_CONFIRM --> FC_17["Terapeuta visualiza resultados validados en su panel"]
            FC_9 --> FC_18["Terapeuta registra notas clínicas en vivo (guardado automático)"]
            FC_16_CONFIRM --> FC_19["Almacenamiento estructurado automático vinculado a id_sesion y paciente"]
            FC_18 --> FC_19
        end

        subgraph FC_STEP4 ["Paso 4: Finalización de Sesión y Reporte Clínico"]
            FC_19 --> FC_20["Terapeuta confirma «Finalizar sesión» en la plataforma"]
            FC_20 --> FC_21["Se activa la opción «Elaborar reporte clínico»"]
            FC_21 --> FC_22["Precarga automática de datos administrativos, pruebas fonológicas validadas y notas"]
            FC_22 --> FC_23["Terapeuta complementa: objetivos trabajados y nivel de ayuda (1 a 5)"]
            FC_23 --> FC_24["Terapeuta añade recomendaciones, conclusiones y próximos pasos"]
            FC_24 --> FC_25["Guardado como borrador, visualización previa, descarga PDF y firma digital"]
            FC_25 --> FC_26["Reporte clínico validado y firmado queda disponible en el expediente"]
        end

        subgraph FC_STEP5 ["Paso 5: Generación del Plan Terapéutico Personalizado"]
            FC_26 --> FC_27{"¿Es la primera sesión introductoria?"}
            FC_27 -- "Sí" --> FC_28["Elaboración manual del plan terapéutico por el especialista<br/>(Asistencia de IA: desactivada hasta aprobación de modelo con manifiesto)"]
            FC_28 --> FC_29["Plan define: objetivos terapéuticos, fonemas prioritarios y frecuencia"]
            FC_29 --> FC_30["Terapeuta revisa, ajusta y aprueba formalmente el plan terapéutico"]
            FC_27 -- "No (Sesión regular)" --> FC_31["Revisión de avance del plan terapéutico existente"]
            FC_31 --> FC_30
        end

        subgraph FC_STEP6 ["Paso 6: Conexión con los 5 Mundos y Asignación de Juegos"]
            FC_30 --> FC_32["Sistema vincula objetivos clínicos con catálogo de actividades de los 5 Mundos"]
            FC_32 --> FC_33["Asignación de juegos personalizados según fonemas y habilidades a reforzar"]
            FC_33 --> FC_34["Niño visualiza actividades recomendadas destacadas en «Mi mundo»"]
            FC_33 --> FC_35["Padre consulta juegos asignados, completados y objetivos asociados"]
            FC_34 --> FC_36["Niño juega en los mundos: Habla, Lenguaje, Fluidez, Voz u Orofacial"]
            FC_36 --> FC_37["Registro automático de métricas de juego:<br/>Intentos, aciertos/errores, tiempo, dificultad y objetivo"]
        end

        subgraph FC_STEP7 ["Paso 7: Seguimiento Integral y Actualización del Tratamiento"]
            FC_37 --> FC_38["Consolidación en módulo de progreso terapéutico"]
            FC_26 --> FC_38
            FC_38 --> FC_39["Visualización diferenciada:<br/>1. Evolución fonológica clínica vs 2. Desempeño y práctica en juegos"]
            FC_39 --> FC_40["Padre consulta evolución comprensible de su hijo"]
            FC_39 --> FC_41["Terapeuta analiza métricas combinadas para ajustar tratamiento"]
            FC_41 --> FC_42["Programación de siguiente sesión de terapia regular (40 min)"]
            FC_42 --> FC_5
        end
    end


%% -------------------------------------------------------------------------
%% 3. FLUJO DEL ROL PADRE (Portal Familiar y Experiencia del Niño)
%% -------------------------------------------------------------------------
    subgraph PORTAL_PADRE ["Portal del Padre y Entorno Infantil"]
        P_ENTRY --> P_ONBOARDING["Tarjeta en Centro Familiar: «Tus primeros pasos en ASHA»<br/>(Guía progresiva de bienvenida)"]

        subgraph P_ONBOARDING_STEPS ["Primeros Pasos en ASHA"]
            P_ONBOARDING --> P_OB_1["Paso 1: Registra a tu hijo o hija<br/>(Perfil independiente por niño)"]
            P_OB_1 --> FC_1
            P_OB_1 --> P_OB_2["Paso 2: Autoriza las muestras de voz<br/>(/padre/consentimiento)"]
            P_OB_2 --> FC_1_CONSENT
            P_OB_2 --> P_OB_3["Paso 3: Reserva la sesión introductoria<br/>(Modal BookingDialog de 40 min)"]
            P_OB_3 --> FC_3
        end

        P_OB_3 --> P_NAV["Cabecera Familiar: Selector de hijo activo + 3 Secciones"]
        P_ENTRY --> P_NAV

        P_NAV --> P_SEC_MUNDO["1. Mi mundo<br/>(/padre?section=world)"]
        P_NAV --> P_SEC_CAMINO["2. Mi camino ASHA<br/>(/padre?section=journey)"]
        P_NAV --> P_SEC_FAMILIA["3. Para mi familia<br/>(/padre?section=family)"]

        subgraph P_MUNDO_DETALLE ["Sección: Mi mundo (Entorno lúdico del niño)"]
            P_SEC_MUNDO --> P_M_LIST["Cuadrícula 3D de los 5 Mundos Ashakids"]
            P_M_LIST --> P_M_SEL{"Seleccionar Mundo"}
            P_M_SEL --> P_M_HABLA["Mundo Habla (Pronunciación y articulación)"]
            P_M_SEL --> P_M_LENGUAJE["Mundo Lenguaje (Vocabulario y comprensión)"]
            P_M_SEL --> P_M_FLUIDEZ["Mundo Fluidez (Ritmo y habla continua)"]
            P_M_SEL --> P_M_VOZ["Mundo Voz (Tono y modulación)"]
            P_M_SEL --> P_M_OROFACIAL["Mundo Orofacial (Praxias y musculatura)"]
            P_M_HABLA --> P_M_GAMES["Acceso a juegos: recomendados por el plan + exploración libre"]
            P_M_LENGUAJE --> P_M_GAMES
            P_M_FLUIDEZ --> P_M_GAMES
            P_M_VOZ --> P_M_GAMES
            P_M_OROFACIAL --> P_M_GAMES
            P_M_GAMES --> P_M_PLAY["Ejecutar juego o actividad interactiva"]
            P_M_PLAY --> P_M_DATA["Envío de métricas al registro de actividad"]
            P_M_DATA --> FC_37
        end

        subgraph P_CAMINO_DETALLE ["Sección: Mi camino ASHA"]
            P_SEC_CAMINO --> P_C_ROADMAP["Mapa de ruta del paciente: 5 hitos asistenciales"]
            P_C_ROADMAP --> P_C_H1["Hito 1: Perfil del hijo<br/>(Perfil registrado)"]
            P_C_H1 --> P_C_H2["Hito 2: Introducción<br/>(Introducción finalizada con asistencia)"]
            P_C_H2 --> P_C_H3["Hito 3: Reporte<br/>(Disponible para la familia)"]
            P_C_H3 --> P_C_H4["Hito 4: Plan profesional<br/>(Plan publicado desde una atención)"]
            P_C_H4 --> P_C_H5["Hito 5: Terapia<br/>(Sesión de terapia reservada)"]
        end

        subgraph P_FAMILIA_DETALLE ["Sección: Para mi familia (Gestión y Seguimiento)"]
            P_F_MENU{"Menú lateral familiar"}

            %% Centro Familiar
            P_F_MENU --> P_F_RESUMEN["Centro familiar: Resumen de citas, estado clínico y accesos rápidos"]

            %% Agenda Familiar
            P_F_MENU --> P_F_AGENDA["Agenda y Citas"]
            P_F_AGENDA --> P_FA_1["Consultar calendario de sesiones programadas"]
            P_FA_1 --> P_FA_RESERVAR["Pulsar «+ Reservar cita»"]
            P_FA_RESERVAR --> P_FA_FORM["Modal de Reserva (BookingDialog):<br/>Hijo, Profesional, Modalidad, Fecha y Hora"]
            P_FA_FORM --> FC_3
            P_FA_1 --> P_FA_MEET{"¿El terapeuta ya inició la sesión?<br/>(estado_sesion = EN_CURSO)"}
            P_FA_MEET -- "Sí" --> P_FA_JOIN["Habilitación de enlace directo a Google Meet"]
            P_FA_JOIN --> FC_8
            P_FA_MEET -- "No" --> P_FA_WAIT["Espera activa: El servidor no expone meet_url hasta el inicio"]

            %% Sesión en vivo desde dispositivo familiar
            P_F_MENU --> P_F_LIVE["Atención en vivo: Interfaz sincronizada de evaluación"]
            P_F_LIVE --> FC_12

            %% Reportes y Valoraciones
            P_F_MENU --> P_F_REPORTES["Reportes y Evolución"]
            P_F_REPORTES --> P_FR_LIST["Historial de reportes clínicos elaborados por terapeutas"]
            P_FR_LIST --> P_FR_VIEW["Consultar reporte estructurado: fonemas evaluados, nivel de ayuda y notas"]
            P_FR_VIEW --> P_FR_PDF["Descargar reporte oficial en PDF"]
            P_FR_VIEW --> P_FR_VAL{"¿Desea calificar la atención?"}
            P_FR_VAL -- "Sí" --> P_FR_SENDVAL["Enviar valoración y comentarios de la sesión"]
            P_FR_SENDVAL --> P_FR_LIST

            %% Progreso Terapéutico
            P_F_MENU --> P_F_PROGRESO["Seguimiento del Progreso"]
            P_F_PROGRESO --> P_FP_GRAF["Gráficos clínicos de evolución fonológica y cumplimiento de objetivos"]
            P_FP_GRAF --> P_FP_ACT["Resumen de actividades lúdicas completadas en los 5 mundos"]

            %% Gestión de Familia y Privacidad
            P_F_MENU --> P_F_CONFIG["Gestionar Familia"]
            P_F_CONFIG --> P_FC_KIDS["Mis Hijos: Agregar hijo, editar datos, asignar avatar"]
            P_FC_KIDS --> FC_1
            P_F_CONFIG --> P_FC_CONSENT["Privacidad y Consentimientos:<br/>Autorización explícita para pruebas fonológicas con IA (/padre/consentimiento)"]
            P_FC_CONSENT --> FC_1_CONSENT
            P_F_CONFIG --> P_FC_PASS["Seguridad: Cambio de contraseña y gestión 2FA"]

            %% Comunicación e Incidencias
            P_F_MENU --> P_F_MSG["Mensajería con terapeutas asignados"]
            P_F_MENU --> P_F_INC["Centro de Incidencias y Soporte"]
            P_F_INC --> P_FI_NEW["Reportar incidencia:<br/>Técnica, permisos o información"]
            P_FI_NEW --> INC_ROUTER
            P_FI_NEW --> P_FI_TRACK["Consultar estado de tickets: RECIBIDA, EN ATENCIÓN o RESUELTA"]
        end

        P_NAV --> P_LOGOUT["Cerrar sesión"]
        P_LOGOUT --> L_LOGIN_FORM
    end


%% -------------------------------------------------------------------------
%% 4. FLUJO DEL ROL TERAPEUTA (Espacio Profesional Clínico)
%% -------------------------------------------------------------------------
    subgraph PORTAL_TERAPEUTA ["Portal del Terapeuta (Espacio Profesional)"]
        T_ENTRY --> T_DASH["Dashboard Operativo del Terapeuta"]

        T_DASH --> T_MENU{"Navegación principal"}

        %% Inicio / Dashboard
        T_MENU --> T_SEC_INICIO["Inicio: KPIs clínicos, sesión en curso y próximas citas"]
        T_SEC_INICIO --> T_NOTIF["Notificaciones anticipadas de citas (T-10 min)"]
        T_NOTIF --> FC_5

        %% Agenda y Disponibilidad
        T_MENU --> T_SEC_AGENDA["Agenda Clínica"]
        T_SEC_AGENDA --> T_AG_CAL["Calendario semanal/diario de atenciones"]
        T_AG_CAL --> T_AG_START{"¿Sesión lista para iniciar?<br/>(T-5 min hasta fin de cita)"}
        T_AG_START -- "Sí" --> T_AG_LAUNCH["Pulsar «Iniciar reunión»<br/>(estado_sesion = EN_CURSO)"]
        T_AG_LAUNCH --> FC_7
        T_AG_START -- "No" --> T_AG_CAL

        %% Panel de Sesión Activa (Wav2Vec 2.0 y Notas)
        T_MENU --> T_SEC_LIVE["Panel de Sesión Activa (Paralelo a Google Meet)"]
        T_SEC_LIVE --> FC_10
        T_SEC_LIVE --> FC_11
        T_SEC_LIVE --> FC_18
        T_SEC_LIVE --> FC_20

        %% Pacientes y Expedientes
        T_MENU --> T_SEC_PACIENTES["Pacientes y Expedientes"]
        T_PAC_LIST["Listado de pacientes asignados"]
        T_SEC_PACIENTES --> T_PAC_LIST
        T_PAC_LIST --> T_PAC_EXP["Apertura de Expediente Clínico"]
        T_PAC_EXP --> T_PAC_HIST["Historial de citas, grabaciones temporales y resultados fonológicos"]
        T_PAC_EXP --> T_PAC_REPS["Historial de reportes clínicos generados"]
        T_PAC_EXP --> T_PAC_PLAN["Consulta del plan terapéutico vigente"]

        %% Reportes Clínicos
        T_MENU --> T_SEC_REPORTES["Reportes Clínicos"]
        T_SEC_REPORTES --> T_REP_PEND["Bandeja de sesiones finalizadas pendientes de reporte"]
        T_REP_PEND --> T_REP_EDIT["Editor clínico estructurado con precarga automática"]
        T_REP_EDIT --> FC_22
        T_REP_EDIT --> T_REP_SIGN["Firmar reporte, generar PDF y enviar a la familia"]
        T_REP_SIGN --> FC_26

        %% Planes Terapéuticos
        T_MENU --> T_SEC_PLANES["Planes Terapéuticos"]
        T_SEC_PLANES --> T_PLAN_CREATE["Elaboración de plan terapéutico (Manual; IA desactivada)"]
        T_PLAN_CREATE --> FC_28
        T_SEC_PLANES --> T_PLAN_MANAGE["Gestión y ajuste periódico de objetivos terapéuticos"]
        T_PLAN_MANAGE --> FC_32

        %% Analíticas y Actividad
        T_MENU --> T_SEC_ANALITICAS["Analíticas y Datos de Actividad"]
        T_SEC_ANALITICAS --> T_AN_CLIN["Métricas de efectividad fonológica por paciente y periodo"]
        T_SEC_ANALITICAS --> T_AN_GAMES["Seguimiento de participación lúdica en los 5 Mundos (tabla y barras)"]

        %% Comunicación, Configuración e Incidencias
        T_MENU --> T_SEC_MSG["Mensajería clínica con familias"]
        T_MENU --> T_SEC_VAL["Valoraciones recibidas de los padres"]
        T_MENU --> T_SEC_CONFIG["Configuración: Perfil profesional y turnos semanales (disponibilidad)"]
        T_SEC_CONFIG --> FC_2
        T_MENU --> T_SEC_INC["Incidencias operativas y soporte"]
        T_SEC_INC --> INC_ROUTER

        T_DASH --> T_LOGOUT["Cerrar sesión"]
        T_LOGOUT --> L_LOGIN_FORM
    end


%% -------------------------------------------------------------------------
%% 5. ENRUTAMIENTO CENTRALIZADO DE INCIDENCIAS
%% -------------------------------------------------------------------------
    subgraph ENRUTAMIENTO_INCIDENCIAS ["Enrutamiento Central de Incidencias"]
        INC_ROUTER{"Clasificación según tipo y rol"}
        INC_ROUTER -- "Problemas técnicos / plataforma" --> S_INBOX
        INC_ROUTER -- "Cuentas, permisos o seguridad" --> A_INBOX_INC
        INC_ROUTER -- "Información clínica / cita" --> T_INC_INBOX["Atención por el terapeuta asignado"]
    end


%% -------------------------------------------------------------------------
%% 6. FLUJO DEL ROL ADMIN (Panel de Administración)
%% -------------------------------------------------------------------------
    subgraph PORTAL_ADMIN ["Portal de Administración (/admin)"]
        A_ENTRY --> A_DASH_HOME["Dashboard General de Administración<br/>(/admin/dashboard)"]

        A_DASH_HOME --> A_MENU{"Menú de administración (Sidebar)"}

        %% Solicitudes de Acceso
        A_MENU --> A_MENU_SOL["Solicitudes de acceso<br/>(/admin/solicitudes)"]
        A_MENU_SOL --> A_SOL_INBOX

        %% Cuentas
        A_MENU --> A_MENU_CUENTAS["Cuentas (/admin/cuentas)"]
        A_MENU_CUENTAS --> A_CUENTAS_MGT["Gestión integral de usuarios:<br/>Familias (tutores), terapeutas y soporte técnico"]

        %% Pacientes
        A_MENU --> A_MENU_PACIENTES["Pacientes (/admin/pacientes)"]
        A_MENU_PACIENTES --> A_PACIENTES_MGT["Supervisión de expedientes y menores registrados"]

        %% Citas y Sesiones
        A_MENU --> A_MENU_CITAS["Citas y Sesiones (/admin/citas y /admin/sesiones)"]
        A_MENU_CITAS --> A_CITAS_MGT["Supervisión de agenda global y monitoreo de sesiones"]

        %% Incidencias
        A_MENU --> A_MENU_INC["Incidencias (/admin/operacion)"]
        A_MENU_INC --> A_INBOX_INC["Bandeja de incidencias administrativas:<br/>Cuentas, permisos y seguridad"]
        A_INBOX_INC --> A_INC_ACTION["Gestión de permisos, reasignación o resolución"]

        %% Auditoría y Seguridad
        A_MENU --> A_MENU_AUDIT["Auditoría y seguridad (/admin/auditoria)"]
        A_MENU_AUDIT --> A_AUDIT_LOGS["Registro inmutable de eventos, autenticaciones y acciones críticas"]

        %% Configuración
        A_MENU --> A_MENU_CONFIG["Configuración (/admin/config)"]
        A_MENU_CONFIG --> A_CONFIG_SYSTEM["Parámetros del sistema, integraciones y políticas"]

        A_DASH_HOME --> A_LOGOUT["Cerrar sesión"]
        A_LOGOUT --> L_LOGIN_FORM
    end


%% -------------------------------------------------------------------------
%% 7. FLUJO DEL ROL SOPORTE TÉCNICO (Portal de Soporte)
%% -------------------------------------------------------------------------
    subgraph PORTAL_SOPORTE ["Portal de Soporte Técnico (/soporte)"]
        S_ENTRY --> S_INBOX["Bandeja de Incidencias Técnicas<br/>(/soporte/incidencias)"]

        S_INBOX --> S_FILTROS["Filtro por estado unificado:<br/>RECIBIDA, EN ATENCIÓN, RESUELTA"]
        S_FILTROS --> S_TICKET["Detalle de incidencia técnica<br/>(/soporte/incidencias/:id)"]

        S_TICKET --> S_ACTIONS{"Acciones de soporte técnico"}

        S_ACTIONS --> S_REPLY["Responder al solicitante<br/>(Respuesta pública visible para padre o terapeuta)"]
        S_ACTIONS --> S_INTERNAL_NOTES["Registrar nota interna de diagnóstico<br/>(Uso exclusivo del equipo técnico, no llega al solicitante)"]
        S_ACTIONS --> S_RESOLVE["Resolver incidencia técnica<br/>(Cambio de estado a RESUELTA)"]
        S_ACTIONS --> S_ESCALATE["Escalar a Administración:<br/>Crea una solicitud a administración (no transfiere el ticket)"]
        S_ESCALATE --> A_MENU_SOL

        S_TICKET --> S_RESTRICTION["Límites de acceso estrictos:<br/>Sin acceso a cuentas, pagos, citas ni información clínica"]

        S_INBOX --> S_LOGOUT["Cerrar sesión"]
        S_LOGOUT --> L_LOGIN_FORM
    end


%% -------------------------------------------------------------------------
%% 8. ESTILOS Y DEFINICIÓN DE CLASES
%% -------------------------------------------------------------------------
    classDef entry fill:#E8F7EE,stroke:#10B981,color:#064E3B,stroke-width:2px;
    classDef core fill:#F3E8FF,stroke:#6B46FE,color:#1C1135,stroke-width:2px;
    classDef meet fill:#E0F2FE,stroke:#0284C7,color:#0C4A6E,stroke-width:2px;
    classDef ai fill:#FEF3C7,stroke:#D97706,color:#78350F,stroke-width:2px;
    classDef clinical fill:#EDE9FE,stroke:#8B5CF6,color:#2E1065,stroke-width:1.5px;
    classDef games fill:#DCFCE7,stroke:#16A34A,color:#14532D,stroke-width:1.5px;
    classDef decision fill:#FFF7ED,stroke:#EA580C,color:#7C2D12,stroke-width:1.5px;
    classDef portalPadre fill:#FAF5FF,stroke:#C084FC,color:#3B0764,stroke-width:1px;
    classDef portalTerapeuta fill:#F0FDF4,stroke:#4ADE80,color:#14532D,stroke-width:1px;
    classDef admin fill:#FFFBEB,stroke:#F59E0B,color:#78350F,stroke-width:1.5px;
    classDef soporte fill:#F1F5F9,stroke:#64748B,color:#0F172A,stroke-width:1.5px;

    %% Asignación de estilos a nodos clave
    class L_START,P_ENTRY,T_ENTRY,A_ENTRY,S_ENTRY,FC_START entry;
    class L_ACTIONS,W_CHECK_PREV,W_CONSENT,W_CONFIRM,A_DNI_ACTION,A_SOL_DECISION,A_MAIL_CHECK,L_LOCK_CHECK,L_AUTH_CHECK,L_2FA_CHECK,L_2FA_VALID,L_ROLE_CHECK,FC_AUDIO_SRC,FC_27,P_M_SEL,P_F_MENU,P_FA_MEET,P_FR_VAL,T_MENU,T_AG_START,INC_ROUTER,A_MENU,S_ACTIONS decision;
    class FC_1,FC_1_CONSENT,FC_1B,FC_2,FC_3,FC_4,FC_5,FC_6,FC_7,FC_20,FC_21,FC_26,FC_30,FC_38,FC_39,FC_41,FC_42,P_ONBOARDING,P_OB_1,P_OB_2,P_OB_3 core;
    class FC_7A,FC_7C,FC_8,P_FA_JOIN meet;
    class FC_7B,FC_10,FC_11,FC_12,FC_13,FC_13A,FC_14,FC_15,FC_16,FC_16_CONFIRM,FC_17,FC_28,FC_32 ai;
    class FC_18,FC_19,FC_22,FC_23,FC_24,FC_25,FC_29,FC_31,T_SEC_LIVE,T_REP_EDIT,T_REP_SIGN clinical;
    class FC_33,FC_34,FC_35,FC_36,FC_37,P_M_HABLA,P_M_LENGUAJE,P_M_FLUIDEZ,P_M_VOZ,P_M_OROFACIAL,P_M_GAMES,P_M_PLAY,P_M_DATA games;
    class W_WEBHOOK,W_INFORM,W_PRIVACY,W_CANCELLED,W_ASK_DATA,W_CREATE_SOL,W_NOTIF_ADMIN,A_SOL_INBOX,A_DNI_VERIF,A_RECHAZAR,A_WAPP_REJECT,A_APROBAR,A_RESEND,A_EMAIL_SENT,A_WAPP_APPROVE,A_DASH_HOME,A_MENU_SOL,A_MENU_CUENTAS,A_CUENTAS_MGT,A_MENU_PACIENTES,A_PACIENTES_MGT,A_MENU_CITAS,A_CITAS_MGT,A_MENU_INC,A_INBOX_INC,A_INC_ACTION,A_MENU_AUDIT,A_AUDIT_LOGS,A_MENU_CONFIG,A_CONFIG_SYSTEM admin;
    class S_INBOX,S_FILTROS,S_TICKET,S_REPLY,S_INTERNAL_NOTES,S_RESOLVE,S_ESCALATE,S_RESTRICTION soporte;

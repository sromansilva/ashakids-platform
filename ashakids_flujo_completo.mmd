flowchart TD

%% =========================================================================
%% ASHAKIDS - FLUJO COMPLETO DEL SISTEMA
%% Basado en el Plan de Automatización, Evaluación Fonológica y Seguimiento 2026
%% =========================================================================

%% -------------------------------------------------------------------------
%% 1. ACCESO, SOLICITUD Y ALTA DE FAMILIA (Apartado 1 del Plan)
%% -------------------------------------------------------------------------
    L_START([Inicio: Visita a ASHAKids]) --> L_HOME["Landing Page pública<br/>ashakids.com"]
    L_HOME --> L_ACTIONS{"¿Qué desea hacer el visitante?"}

    L_ACTIONS --> L_INFO["Consultar información pública<br/>(Cómo funciona, Especialistas, 5 Mundos, FAQ)"]
    L_ACTIONS --> L_WAPP["Solicitar información e inscripción<br/>(Botón directo de WhatsApp)"]
    L_ACTIONS --> L_ASHI["Conversar con Ashi<br/>(Asistente virtual de orientación)"]
    L_ACTIONS --> L_LOGIN_BTN["Iniciar sesión<br/>(Usuarios ya registrados)"]

    L_INFO --> L_HOME
    L_ASHI --> L_HOME

    %% Flujo WhatsApp y Alta por Administrador (Cierre de registro público)
    L_WAPP --> L_WAPP_CONV["Contacto con equipo de admisiones ASHAKids"]
    L_WAPP_CONV --> L_ADMIN_CREATE["Administrador crea cuenta familiar en la plataforma<br/>(POST /api/v1/admin/cuentas/padres)"]
    L_ADMIN_CREATE --> L_EMAIL_INVITE["Envío automático de correo con enlace seguro de activación"]
    L_EMAIL_INVITE --> L_PARENT_EMAIL["Padre recibe correo y abre enlace de activación"]
    L_PARENT_EMAIL --> L_PARENT_SETPASS["Establecer contraseña segura y activar cuenta"]
    L_PARENT_SETPASS --> L_LOGIN_BTN

    %% Proceso de Autenticación
    L_LOGIN_BTN --> L_LOGIN_FORM["Formulario de inicio de sesión<br/>(/login)"]
    L_LOGIN_FORM --> L_AUTH_CHECK{"¿Credenciales válidas?"}
    L_AUTH_CHECK -- "No" --> L_AUTH_ERR["Mostrar error de autenticación"]
    L_AUTH_ERR --> L_LOGIN_FORM
    L_AUTH_CHECK -- "Sí" --> L_ROLE_CHECK{"Identificar rol del usuario"}

    L_ROLE_CHECK -- "PADRE" --> P_ENTRY([Acceso al Centro Familiar])
    L_ROLE_CHECK -- "TERAPEUTA" --> T_ENTRY([Acceso al Panel Profesional])


%% -------------------------------------------------------------------------
%% 2. EL FLUJO CENTRAL DE AUTOMATIZACIÓN E INTERVENCIÓN (Eje Nuclear 2026)
%% Evaluación inicial → Pruebas fonológicas → Reporte clínico →
%% Plan personalizado → Juegos asignados → Seguimiento → Actualización
%% -------------------------------------------------------------------------
    subgraph FLUJO_CENTRAL ["EJE CENTRAL: Automatización, Evaluación Fonológica y Seguimiento Terapéutico"]
        FC_START([Inicio del Recorrido del Niño]) --> FC_1

        subgraph FC_STEP1 ["Paso 1: Programación de Sesión Introductoria de Evaluación"]
            FC_1["Padre registra nuevo hijo en la plataforma<br/>(Perfil independiente por niño)"]
            FC_1 --> FC_1B["Aviso obligatorio: El primer paso es una sesión introductoria"]
            FC_1B --> FC_2["Padre consulta directorio de terapeutas y su disponibilidad"]
            FC_2 --> FC_3["Padre selecciona profesional y reserva fecha/hora de 40 min"]
            FC_3 --> FC_4["Sistema valida no solapamiento y confirma reserva automáticamente"]
        end

        subgraph FC_STEP2 ["Paso 2: Notificaciones y Apertura de Google Meet"]
            FC_4 --> FC_5["T-10 min: Notificación anticipada en plataforma al terapeuta"]
            FC_5 --> FC_6["T-5 min: Se habilita botón «Iniciar reunión» para el terapeuta"]
            FC_6 --> FC_7["Terapeuta pulsa «Iniciar reunión»"]
            FC_7 --> FC_7A["1. Se abre videollamada en Google Meet"]
            FC_7 --> FC_7B["2. Se abre en paralelo el «Panel de sesión y pruebas fonológicas»"]
            FC_7 --> FC_7C["3. Notificación automática por correo y plataforma al padre con enlace Meet"]
            FC_7A --> FC_8["Terapeuta y familia se conectan a Google Meet"]
            FC_7C --> FC_8
        end

        subgraph FC_STEP3 ["Paso 3: Panel de Sesión y Pruebas Fonológicas en Tiempo Real"]
            FC_8 --> FC_9["Sesión en curso (40 minutos de atención terapéutica)"]
            FC_7B --> FC_9
            FC_9 --> FC_10["Panel muestra datos: niño, terapeuta, tiempo restante y acceso Meet"]
            FC_10 --> FC_11["Terapeuta identifica dificultades y selecciona fonemas/palabras (/r/, /s/, /g/, etc.)"]
            FC_11 --> FC_12["Activación de captura sincronizada en dispositivo familiar"]
            FC_12 --> FC_13["Padre ayuda al menor con el micrófono local<br/>(Captura breve con consentimiento previo, sin grabar Meet)"]
            FC_13 --> FC_14["Envío de muestra corta de audio al backend Python"]
            FC_14 --> FC_15["Modelo Wav2Vec 2.0 procesa la pronunciación del niño"]
            FC_15 --> FC_16["Cálculo de indicadores fonéticos de apoyo:<br/>Similitud fonética, diferencias detectadas e intentos"]
            FC_16 --> FC_17["Terapeuta visualiza resultados en tiempo real en su panel"]
            FC_9 --> FC_18["Terapeuta registra notas clínicas en vivo (guardado automático)"]
            FC_16 --> FC_19["Almacenamiento estructurado automático vinculado a id_sesion y paciente"]
            FC_18 --> FC_19
        end

        subgraph FC_STEP4 ["Paso 4: Finalización de Sesión y Reporte Clínico"]
            FC_19 --> FC_20["Terapeuta confirma «Finalizar sesión» en la plataforma"]
            FC_20 --> FC_21["Se activa la opción «Elaborar reporte clínico»"]
            FC_21 --> FC_22["Precarga automática de datos administrativos, pruebas fonológicas y notas"]
            FC_22 --> FC_23["Terapeuta complementa: objetivos trabajados y nivel de ayuda (1 a 5)"]
            FC_23 --> FC_24["Terapeuta añade recomendaciones, conclusiones y próximos pasos"]
            FC_24 --> FC_25["Guardado como borrador, visualización previa, descarga PDF y firma digital"]
            FC_25 --> FC_26["Reporte clínico validado y firmado queda disponible en el expediente"]
        end

        subgraph FC_STEP5 ["Paso 5: Generación del Plan Terapéutico Personalizado"]
            FC_26 --> FC_27{"¿Es la primera sesión introductoria?"}
            FC_27 -- "Sí" --> FC_28["Generación asistida por IA de propuesta de plan basada en el reporte"]
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
        P_ENTRY --> P_NAV["Cabecera Familiar: Selector de hijo activo + 3 Secciones"]
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
            P_SEC_CAMINO --> P_C_ROADMAP["Mapa de ruta del paciente"]
            P_C_ROADMAP --> P_C_INTRO["Hito 1: Sesión introductoria de evaluación"]
            P_C_INTRO --> P_C_PLAN["Hito 2: Plan terapéutico activo y objetivos"]
            P_C_PLAN --> P_C_SESSIONS["Hito 3: Sesiones periódicas completadas"]
            P_C_SESSIONS --> P_C_BADGES["Hito 4: Logros, estrellas e insignias ganadas"]
        end

        subgraph P_FAMILIA_DETALLE ["Sección: Para mi familia (Gestión y Seguimiento)"]
            P_SEC_FAMILIA --> P_F_MENU{"Menú lateral familiar"}

            %% Centro Familiar
            P_F_MENU --> P_F_RESUMEN["Centro familiar: Resumen de citas, estado clínico y accesos rápidos"]

            %% Agenda Familiar
            P_F_MENU --> P_F_AGENDA["Agenda y Citas"]
            P_F_AGENDA --> P_FA_1["Consultar calendario de sesiones programadas"]
            P_FA_1 --> P_FA_RESERVAR["Pulsar «+ Reservar cita»"]
            P_FA_RESERVAR --> P_FA_FORM["Modal de Reserva (BookingDialog):<br/>Hijo, Profesional (Directorio completo), Modalidad, Fecha y Hora"]
            P_FA_FORM --> FC_3
            P_FA_1 --> P_FA_MEET{"¿Faltan 5 minutos o menos para la sesión?"}
            P_FA_MEET -- "Sí" --> P_FA_JOIN["Habilitación de enlace directo a Google Meet"]
            P_FA_JOIN --> FC_8
            P_FA_MEET -- "No" --> P_FA_WAIT["Indicador de cuenta regresiva y detalles de preparación"]

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
            P_F_CONFIG --> P_FC_CONSENT["Privacidad y Consentimientos:<br/>Autorización explícita para pruebas fonológicas con IA"]
            P_FC_CONSENT --> FC_13
            P_F_CONFIG --> P_FC_PASS["Seguridad: Cambio de contraseña"]

            %% Comunicación e Incidencias
            P_F_MENU --> P_F_MSG["Mensajería con terapeutas asignados"]
            P_F_MENU --> P_F_INC["Centro de Incidencias y Soporte"]
            P_F_INC --> P_FI_NEW["Reportar incidencia técnica o clínica"]
            P_FI_NEW --> P_FI_TRACK["Consultar estado: Enviada, En revisión o Solucionada"]
        end

        P_NAV --> P_LOGOUT["Cerrar sesión"]
        P_LOGOUT --> L_HOME
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
        T_AG_CAL --> T_AG_START{"¿Sesión lista para iniciar (T-5 min)?"}
        T_AG_START -- "Sí" --> T_AG_LAUNCH["Pulsar «Iniciar reunión»"]
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
        T_SEC_PACIENTES --> T_PAC_LIST["Listado de pacientes asignados"]
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
        T_SEC_PLANES --> T_PLAN_CREATE["Elaboración de plan terapéutico (Asistido por IA tras intro)"]
        T_PLAN_CREATE --> FC_28
        T_SEC_PLANES --> T_PLAN_MANAGE["Gestión y ajuste periódico de objetivos terapéuticos"]
        T_PLAN_MANAGE --> FC_32

        %% Analíticas y Actividad
        T_MENU --> T_SEC_ANALITICAS["Analíticas y Datos de Actividad"]
        T_SEC_ANALITICAS --> T_AN_CLIN["Métricas de efectividad fonológica por paciente y periodo"]
        T_SEC_ANALITICAS --> T_AN_GAMES["Seguimiento de participación lúdica en los 5 Mundos (gráfico donut)"]

        %% Comunicación, Configuración e Incidencias
        T_MENU --> T_SEC_MSG["Mensajería clínica con familias"]
        T_MENU --> T_SEC_VAL["Valoraciones recibidas de los padres"]
        T_MENU --> T_SEC_CONFIG["Configuración: Perfil profesional y turnos semanales (disponibilidad)"]
        T_SEC_CONFIG --> FC_2
        T_MENU --> T_SEC_INC["Incidencias operativas y soporte"]

        T_DASH --> T_LOGOUT["Cerrar sesión"]
        T_LOGOUT --> L_HOME
    end


%% -------------------------------------------------------------------------
%% 5. ESTILOS Y DEFINICIÓN DE CLASES
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

    %% Asignación de estilos a nodos clave
    class L_START,P_ENTRY,T_ENTRY,FC_START entry;
    class L_ACTIONS,L_AUTH_CHECK,L_ROLE_CHECK,FC_27,P_M_SEL,P_F_MENU,P_FA_MEET,P_FR_VAL,T_MENU,T_AG_START decision;
    class FC_1,FC_1B,FC_2,FC_3,FC_4,FC_5,FC_6,FC_7,FC_20,FC_21,FC_26,FC_30,FC_38,FC_39,FC_41,FC_42 core;
    class FC_7A,FC_7C,FC_8,P_FA_JOIN meet;
    class FC_7B,FC_10,FC_11,FC_12,FC_13,FC_14,FC_15,FC_16,FC_17,FC_28,FC_32 ai;
    class FC_18,FC_19,FC_22,FC_23,FC_24,FC_25,FC_29,FC_31,T_SEC_LIVE,T_REP_EDIT,T_REP_SIGN clinical;
    class FC_33,FC_34,FC_35,FC_36,FC_37,P_M_HABLA,P_M_LENGUAJE,P_M_FLUIDEZ,P_M_VOZ,P_M_OROFACIAL,P_M_GAMES,P_M_PLAY,P_M_DATA games;

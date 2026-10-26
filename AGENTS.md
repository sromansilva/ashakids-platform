# Guía de Arquitectura y Reglas para Agentes (agents.md)

Este documento define las directrices arquitectónicas, los flujos operativos y las reglas de verificación obligatorias para que tanto agentes de IA como el equipo de desarrollo mantengan la coherencia, calidad e integridad de la plataforma **Ashakids**.

---

## 1. Visión General del Sistema

**Ashakids** es una plataforma integral de telerehabilitación e intervención clínica/educativa infantil para habla, lenguaje, fluidez, voz y motricidad orofacial.

El sistema opera con tres roles principales:
- **`ADMIN` (Administración)**: Gestión de cuentas familiares y terapeutas, supervisión clínica, soporte, analíticas globales y auditoría.
- **`TERAPEUTA` (Especialistas)**: Agenda clínica, atención presencial o vía Zoom, expedientes, generación de reportes clínicos estructurados, analíticas y seguimiento de actividad educativa.
- **`PADRE` (Familias y Pacientes)**: Centro familiar (*Mi mundo*, *Mi camino ASHA*, *Para mi familia*), selector de hijos activos, agendamiento de citas, reportes de evolución, pagos y juegos educativos del Mundo ASHA.

---

## 2. Estructura del Monorepo

El repositorio se organiza estrictamente en dos capas desacopladas:

```text
ashakids-platform/
├── backend/                  # API REST en TypeScript + Express + Drizzle ORM
│   └── src/
│       ├── core/             # Configuración (Zod env), conexión a PostgreSQL, middleware de cookies
│       ├── infrastructure/   # Integraciones externas: Zoom OAuth/API, Mailer/Gmail, Reconocimiento de Voz Whisper
│       └── modules/          # Módulos de dominio (agenda, auth, clinica, comunicacion, cuentas, mundo_asha, pacientes)
├── frontend/                 # SPA en React 18 + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── core/             # Router (AppRouter, lazyPages), Layouts (DashLayout, Sidebar, FamilySidebar), Cliente HTTP
│       ├── modules/          # Vistas y casos de uso por dominio (admin, auth, clinica, padre, terapeuta, public, etc.)
│       └── shared/           # Componentes comunes (BookingDialog, IncidentForm, MessagesCenter, NotificationCenter), tokens de marca
├── tests/                    # Pruebas automatizadas (backend/ y frontend/)
└── scripts/                  # Scripts de mantenimiento y utilidades
```

---

## 3. Reglas Críticas para Agentes y Desarrolladores

Cualquier cambio propuesto o realizado en el código debe respetar estas reglas:

### Regla 1: Integridad de Contratos de API y Servicios Externos
- **Zoom Service** (`backend/src/infrastructure/zoom/zoom.service.ts`):
  - No modificar la firma de `createMeeting` ni eliminar los fallbacks cuando las credenciales no estén configuradas. El backend debe seguir funcionando en modo desarrollo sin lanzar excepciones no controladas.
- **Servicios de Correo / Gmail**:
  - Las variables y firmas en `backend/src/core/config.ts` y auth deben mantenerse backward-compatible.
- **Base de Datos y PostgreSQL**:
  - Respetar la integridad referencial. Si se prueba la reserva de citas para un paciente (ej. `id_paciente: 3`), verificar que existan su `expediente` y su `tratamiento` activo para evitar violaciones de clave foránea (`fk_reservas_paciente`, `fk_reservas_tratamiento`).

### Regla 2: Fidelidad de Diseño UI (Sistema ASHA)
- Seguir la paleta y componentes de diseño oficiales:
  - **Color Primario / Acento**: Violeta `#6B46FE` (hover: `#5833EA`, fondos suaves: `#EDE9FE` / `#F8F7FC`).
  - **Texto Principal**: `#1C1135`.
  - **Texto Secundario**: `#615274` o `#9E95B7`.
  - **Bordes**: `#E8E5F4`.
  - **Contenedores**: Esquinas redondeadas `rounded-3xl` o `rounded-2xl` con sombras suaves `shadow-sm`.
- **Diseño Responsivo**: Todas las vistas deben funcionar de forma fluida en Mobile (<640px), Tablet (640px-1024px) y Desktop (>1024px).
- **Consistencia de Ilustraciones 3D**: Usar las ilustraciones de Ashi ubicadas en `frontend/public/illustrations/` (`ashi-hero-v1.png`, `ashi-folder.png`, `ashi-tablet.png`, etc.).

### Regla 3: Flujo de Versionado, Commits y Git
- **Nomenclatura Oficial Obligatoria para Commits y Pull Requests**:
  Todos los commits y títulos de Pull Requests deben seguir estrictamente el patrón oficial con prefijo de versión y guiones bajos:
  `V<Número>_<Descripción_Camel_Case_O_Con_Guiones_Bajos>`
  - Ejemplos de referencia estándar en el repositorio:
    - `V06_Auditoria_Reportes_PDF`
    - `V17_Entrega_Academica_Rubrica_Hosting`
    - `V130_Documentar_CI_CD_Ramas_y_Release`
    - `V131_Actualizar_Contexto_CI_CD`
    - `V132_Arquitectura_Modular_TypeScript_Vistas_Completas`
- **Flujo de Ramas**:
  - El desarrollo se integra vía PRs desde ramas temáticas (`feat/<nombre>`) hacia `dev`.
  - Las promociones a producción se gestionan mediante Pull Requests desde `dev` hacia `main`.
- **Nunca ejecutar commits automáticos** sin la confirmación explícita del usuario.
- Mantener limpios los archivos temporales. Archivos grandes (`*.rar`, `*.zip`, carpetas de mockups como `mockups_extracted/`) deben permanecer en `.gitignore`.
- Verificar siempre con `git status` antes y después de hacer cambios.

### Regla 4: Batería de Pruebas Obligatoria
Antes de dar por terminada cualquier tarea o entrega, se deben ejecutar y aprobar satisfactoriamente las siguientes tres comprobaciones:

```bash
# 1. Pruebas de integración del backend (12/12 passing)
npm --prefix backend run test

# 2. Pruebas de enrutamiento y guardias de seguridad del frontend (25/25 passing)
npm --prefix frontend run test:routing

# 3. Compilación de producción en TypeScript y Vite (0 errores)
npm --prefix frontend run build
```

---

## 4. Arquitectura de las Vistas por Rol

### A. Rol PADRE (Centro Familiar)
- **Rutas clave**: `/padre/welcome`, `/padre/camino`, `/padre/agenda`, `/padre/psicologos`, `/padre/reportes`, `/padre/config`.
- **Layout**: Utiliza `FamilySidebar.tsx` (con selector de niño activo en la cabecera) y `FamilyTopNav.tsx` (con las tres pastillas: *Mi mundo*, *Mi camino ASHA*, *Para mi familia*).
- **Componentes clave**:
  - `BookingDialog.tsx`: Modal para agendar citas. Debe tolerar pacientes con o sin plan previo (`id_tratamiento: null`).
  - `FamilyWorlds.tsx`: Cuadrícula 3D de los 5 mundos educativos (3 arriba, 2 abajo centrados).

### B. Rol TERAPEUTA
- **Rutas clave**: `/terapeuta`, `/terapeuta/agenda`, `/terapeuta/pacientes`, `/terapeuta/reportes`, `/terapeuta/analiticas`, `/terapeuta/datos-actividad`, `/terapeuta/config`, `/terapeuta/incidencias`.
- **Layout**: Utiliza la barra lateral `Sidebar.tsx` y el encabezado unificado en `DashLayout.tsx` con la píldora desplegable de notificaciones (`NotificationCenter.tsx`) y tarjeta de usuario.
- **Componentes clave**:
  - `OperationalDashboard.tsx`: Panel principal con 3 KPIs, accesos rápidos y estado de sesión en curso / próximas citas.
  - `TerapeutaPacientes.tsx`: Fila de paciente interactiva y estado de expediente con Ashi y carpeta clínica.
  - `TerapeutaAgenda.tsx`: Agenda semanal (08:00 a 17:00) con selector Día/Semana.
  - `TerapeutaReportes.tsx` + `ClinicalReportEditor.tsx`: Editor clínico estructurado con observaciones, objetivos, nivel de ayuda 1–5 y generación de reportes descargables.
  - `TerapeutaDatosActividad.tsx`: Seguimiento demostrativo de participación lúdica por mundo con gráfico donut.

### C. Rol ADMIN
- **Rutas clave**: `/admin`, `/admin/cuentas`, `/admin/citas`, `/admin/sesiones`, `/admin/auditoria`, `/admin/config`.
- **Layout**: Utiliza `Sidebar.tsx` con accesos operativos y cabecera de administración.
- **Componentes clave**:
  - `AdminCuentas.tsx`: Gestión integral de tutores y terapeutas, validación de contraseñas y activación.

---

## 5. Procedimiento para Implementar Nuevas Funcionalidades

Cuando un agente o desarrollador deba implementar una nueva pantalla o modificar un servicio:
1. **Inspeccionar contratos existentes**: Revisar el cliente API en `frontend/src/core/api/client.ts` y los servicios en `modules/<dominio>/infrastructure/`.
2. **Revisar mockups de referencia**: Verificar la estructura visual requerida antes de codificar estilos.
3. **No romper estilos globales**: Evitar reglas invasivas en archivos `.css` globales; priorizar clases utilitarias de Tailwind CSS.
4. **Verificar tipado estricto**: No utilizar `any` injustificado; definir interfaces en `domain/` o `types/`.
5. **Ejecutar la suite completa de pruebas** (`test`, `test:routing` y `build`).

<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions take precedence.

## Context

### Terminology:

- Say "project" instead of "account" — a project contains an AWS account and settings for sharing with other collaborators
- Say "team member" instead of "IAM user" — users are invited by email, not created or federated in IAM
- Say "AWS Settings" when referring to management tasks at [settings.aws.com](https://settings.aws.com/) (project management, billing, team members, spend limits). Users view their actual AWS resources in the AWS Management Console.
- Say "selected Region" when referring to the user's Region — not "home Region"
- The user has a managed IAM experience. This includes a managed service control policies (SCP) and resource control policies (RCP) that govern the use of AWS. They will still need to use IAM to create policies to let services work with each other. If there are questions about the SCPs or RCPs, go to the documentation at https://docs.aws.amazon.com/accounts/latest/reference/scps-and-rcps-for-projects.html

### Constraints:

- All projects share a single AWS Region determined by the user's contact address. Resources cannot be created in other Regions
- When developing:
  - MUST create all Regional resources in the project's assigned Region
  - You CAN create AWS WAF and Cloudwatch Logs resources in us-east-1 when there are global resources (like a global WAF instance) that require a connection to dependencies in us-east-1. You should not use these for any other reason, because resources in the selected Region will provide lower cost (due to no cross-Region traffic), increased availability (due to no cross-Region traffic), and easier manageability (due to not needing to look in another Region). When you need to do an inventory of resources, you need to look in both the selected Region and us-east-1 for Cloudwatch Logs or WAF resources.
  - MUST NOT attempt to create Lambda, API Gateway, or other Regional resources in any other Region
  - MUST direct users to confirm their Region in AWS Settings > View all projects > Overview > Additional Info > Region. If the user cannot confirm their Region, check in ~/.aws/config
  - MUST NOT use Lambda@Edge — excluded from both Lambda and CloudFront
  - MUST NOT use CloudFormation StackSets — no multi-account or multi-Region deployments
  - MUST NOT attempt cross-Region actions — no cross-Region replication for DynamoDB/S3/RDS, no multi-Region KMS keys
  - MUST NOT use Route 53 cross-Region routing — geolocation, latency-based, and failover routing policies are not available
  - CloudFront is a global service and its actions ARE allowed in `us-east-1`. A user can create a CloudFront distribution pointing to their project-region Lambda function URL or API Gateway. However, Lambda and API Gateway themselves MUST NOT be created in `us-east-1` — they must be in the project Region.
  - Reduced availability in `eu-north-1` specifically: Amazon Rekognition, Amazon Textract, Amazon Personalize, AWS App Runner are not available in that Region.
- IAM permissions for human access are managed by AWS. Don't assign roles to team members unless absolutely necessary
- The user may have a spend limit if they are on the paid plan. The limit that pauses their project if it's exceeded. If resources suddenly become inaccessible, ask if they have a spend limit configured. Only project owners can modify a spend limit.
- When developing:
  - MUST ask about spend limit status if the user reports sudden "Access Denied" errors on operations that previously worked
  - MUST direct users to check spend status in AWS Settings > Billing
  - MUST check if a user has upgraded their account to the paid plan
  - MUST ask the user if they want to clean up the successfully created resources or keep them to reduce cost
- The user sets up billing, creates spend limits, and retrieves and pays invoices in AWS Settings. The user creates budgets and optimizes their costs in the AWS Billing and Cost Management console
- Not all AWS services are available. If a service isn't working, do the following:
  1. Run the command `aws freetier get-account-plan-state`
  2. If accountPlanType": "FREE", check the [Free Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-free-tier) next,
  3. If accountPlanType": "PAID", check the [Paid Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-paid-plan).
  4. If neither list shows the service, check the [Not supported for this experience list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#unsupported-services). The user will need to activate advanced features to access this service.
- Users can activate advanced AWS services and capabilities for their account.
- Before starting a task, check whether a relevant AWS skill is available. Load the skill with retrieve_skill and prefer its guidance over general knowledge.

### Help level

- help_level: HIGH (user preference). Apply the HIGH constraints below; do not ask again unless the user requests a change.

You CAN update this rule file to save a user's help_level.

Constraints for each level:

**LOW:**

- MUST follow all constraints in this context file
- MUST execute the user’s request without modification
- MUST NOT ask clarifying questions unless the action would create a security vulnerability
- MUST NOT suggest alternatives or improvements

**MEDIUM:**

- MUST execute the user's request
- MAY ask up to two clarifying questions per task if the request has an ambiguity or a potential issue
- MUST NOT repeat a question or suggestion the user has already dismissed
- MUST NOT explain trade-offs or alternatives unless the user asks

**HIGH:**

- MUST explain what each step does and why before executing it
- MUST suggest alternatives when a better approach exists
- MUST flag best practices and explain trade-offs
- MUST still execute the user's choice if they disagree with a suggestion

<!-- END AWS Agent Toolkit rules -->

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

### Regla 3: Flujo de Versionado y Git
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


# Arquitectura de ASHAKids

## Flujo de datos
React/TypeScript + Vite (`frontend/`) -> HTTP/JSON -> FastAPI (`backend/`) -> SQLAlchemy asíncrono + asyncpg -> PostgreSQL gestionado en Supabase.

La API controla autenticación propia y autorización. Supabase aporta infraestructura PostgreSQL; no se usa Supabase Auth. Las credenciales permanecen en `backend/.env`, excluido de Git.

## Responsabilidades
- `frontend/src/pages/`: vistas públicas y áreas por rol (padre, terapeuta, administrador).
- `frontend/src/app/`: composición de rutas declarativas, carga diferida, providers, layouts y límites de errores.
- `frontend/src/components/`, `hooks/`, `theme/`: UI compartida y comportamiento visual.
- `frontend/src/types/` y `mocks/`: contratos comunes y datos ilustrativos. Los mocks no equivalen a persistencia.
- `frontend/src/routes/paths.ts`: adaptador temporal entre identificadores de vista y URL. No selecciona ni renderiza pantallas.
- `frontend/src/auth/AuthContext.tsx`: estado de sesión; `services/` y `api/client.ts`: comunicación HTTP con la API.
- `backend/app/main.py`: aplicación FastAPI y registro de routers.
- `backend/app/api/`: endpoints y dependencias de permisos.
- `backend/app/services/`: lógica de negocio y autenticación.
- `backend/app/models/`: modelos persistentes; `schemas/`: contratos de entrada y salida.
- `backend/app/core/`: configuración, seguridad y conexión a datos.

El login usa código de usuario y contraseña, verifica Argon2id y crea una sesión persistida. La cookie es HttpOnly. Los endpoints validan los roles PADRE, TERAPEUTA y ADMIN.

## Herramientas de conocimiento
`tools/knowledge/` y `.agents/skills/graphify/` apoyan al equipo. Su entorno aislado `.venv-graphify/` y salidas `graphify-out/` son locales y regenerables. No se importan desde frontend o backend. El grafo describe estructura de código; no valida comportamiento ni sustituye pruebas o decisiones documentadas.

## Frontend modular — Tarea 1

`App.tsx` únicamente exporta la composición del router. `AppProviders` monta BrowserRouter y AuthProvider; `AppRouter` declara los destinos; `RouteAccess` protege según sesión y rol; `PageFrame` selecciona el layout. `lazyPages` importa archivos de pantalla directamente, sin barrels que carguen roles completos.

Los módulos de padre, terapeuta y administrador no importan detalles internos de otros roles. La coordinación de demostración vive en `app/hooks/useDemoWorkflow`, sin fingir llamadas al servidor. Pantallas pesadas separan estado, secciones y datos por responsabilidad.

Todas las llamadas HTTP pasan por `api/client.ts`, con cookies incluidas y errores normalizados. Configurar `VITE_API_BASE_URL` con la base completa, por ejemplo `https://api.example.invalid/api/v1`. `VITE_API_URL` sigue admitida como compatibilidad. En producción, sin variable, se usa `/api/v1`; requiere proxy del despliegue. Nunca se ponen secretos en variables VITE.

Para la integración local con datos descartables, se puede crear `frontend/.env.local` con
`VITE_API_BASE_URL=http://localhost:8001/api/v1`, reiniciar Vite y seleccionar en Postman el entorno
que apunta a `http://localhost:8001`. Ambos clientes compartirán la instancia de FastAPI y PostgreSQL
local; no se debe cambiar esta configuración para apuntar una colección de escritura a Supabase.

La sesión se verifica con el servidor al arrancar, incluido el acceso directo o recarga de una URL. Un 401 fuera del login invalida la sesión local. El formulario de login conserva su propio estado de envío para no desmontarse ni perder errores. No existe login simulado en la aplicación de producción.

`npm run check:frontend` verifica máximo 500 líneas físicas, imports locales, límites entre roles, fetch centralizado, destinos/manifest y marcadores de conflicto. `npm test` conserva las pruebas de routing y añade Vitest/Testing Library; `npm run typecheck` y `npm run build` completan los controles.

`tests/browser-harness.html` es una entrada aislada de desarrollo con identidades ficticias y MemoryRouter. No solicita cookies, no crea usuarios, no conecta al backend y no se incluye en el build normal. Nunca desplegar el servidor Vite de desarrollo como producción.

El hosting debe devolver index.html para rutas de SPA sin interceptar `/api/v1` ni assets. Para alcance verificado, eliminaciones y limitaciones consultar `docs/tarea-1-frontend-informe.md` y ADR 0002.

## Backend persistente - Tarea 2 (2026-10-08)

Se extienden las capas existentes sin reescribir autenticación: `api/v1/{usuarios,pacientes,citas,sesiones}`
declara HTTP; `schemas/` valida contratos; `services/` decide permisos, transiciones y operaciones;
`models/clinica.py` mapea las tablas PostgreSQL existentes. `api/contracts.py` comparte dependencias.

`/citas` es el nombre público para la tabla `reservas`. No existe una segunda tabla de citas.
Un tratamiento relaciona expediente/paciente con terapeuta; únicamente ADMIN asigna esta relación,
porque concede acceso a datos de una familia. La apertura administrativa de expediente no inventa
diagnóstico. Los padres ven su familia y los terapeutas los pacientes asignados; cada cita/sesión
restringe además el profesional específico. Usuarios se administran solo con ADMIN.

Las peticiones usan una transacción con commit antes de responder (Depends scope=function).
Conflictos de integridad devuelven 409 y caídas de conexión 503 con mensajes sin SQL/credenciales.
Bloqueos de paciente/terapeuta serializan reservas solapadas por esta API; la BD conserva UNIQUE
para una sesión por reserva. Escritores externos deben respetar las mismas reglas: no hay todavía
restricción PostgreSQL de exclusión temporal ni sistema de migraciones incremental.

Las bajas de pacientes son lógicas. Cambiar contraseña o desactivar usuarios revoca sesiones.
Las cookies son HttpOnly y Secure en producción; escrituras desde Origin no permitido se rechazan.
En producción una escritura con cookie requiere Origin permitido. Desplegar web y API en el mismo
sitio HTTPS para SameSite=Lax; clientes no navegador pueden usar Bearer con token propio.

Pruebas: `backend/requirements-dev.txt`, `pytest.ini`, fixtures de PostgreSQL local descartable
con guardas por host/nombre de BD. No usar `.env` de Supabase para ejecutar pruebas de escritura.
La suite heredada compartida requiere `ASHAKIDS_ALLOW_SHARED_DB_TESTS=1` y autorización explícita.
Estados operativos, límites y decisiones: ADR 0003 e informe de auditoría.

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

La sesión se verifica con el servidor al arrancar, incluido el acceso directo o recarga de una URL. Un 401 fuera del login invalida la sesión local. El formulario de login conserva su propio estado de envío para no desmontarse ni perder errores. No existe login simulado en la aplicación de producción.

`npm run check:frontend` verifica máximo 500 líneas físicas, imports locales, límites entre roles, fetch centralizado, destinos/manifest y marcadores de conflicto. `npm test` conserva las pruebas de routing y añade Vitest/Testing Library; `npm run typecheck` y `npm run build` completan los controles.

`tests/browser-harness.html` es una entrada aislada de desarrollo con identidades ficticias y MemoryRouter. No solicita cookies, no crea usuarios, no conecta al backend y no se incluye en el build normal. Nunca desplegar el servidor Vite de desarrollo como producción.

El hosting debe devolver index.html para rutas de SPA sin interceptar `/api/v1` ni assets. Para alcance verificado, eliminaciones y limitaciones consultar `docs/tarea-1-frontend-informe.md` y ADR 0002.

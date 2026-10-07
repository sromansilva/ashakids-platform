# Arquitectura de ASHAKids

## Flujo de datos
React/TypeScript + Vite (`frontend/`) -> HTTP/JSON -> FastAPI (`backend/`) -> SQLAlchemy asíncrono + asyncpg -> PostgreSQL gestionado en Supabase.

La API controla autenticación propia y autorización. Supabase aporta infraestructura PostgreSQL; no se usa Supabase Auth. Las credenciales permanecen en `backend/.env`, excluido de Git.

## Responsabilidades
- `frontend/src/pages/`: vistas públicas y áreas por rol (padre, terapeuta, administrador).
- `frontend/src/components/`, `hooks/`, `theme/`: UI compartida y comportamiento visual.
- `frontend/src/routes/paths.ts`: traducción entre URLs y vistas; `routes/`: protección y navegación.
- `frontend/src/auth/AuthContext.tsx`: estado de sesión; `services/` y `api/client.ts`: comunicación HTTP con la API.
- `backend/app/main.py`: aplicación FastAPI y registro de routers.
- `backend/app/api/`: endpoints y dependencias de permisos.
- `backend/app/services/`: lógica de negocio y autenticación.
- `backend/app/models/`: modelos persistentes; `schemas/`: contratos de entrada y salida.
- `backend/app/core/`: configuración, seguridad y conexión a datos.

El login usa código de usuario y contraseña, verifica Argon2id y crea una sesión persistida. La cookie es HttpOnly. Los endpoints validan los roles PADRE, TERAPEUTA y ADMIN.

## Herramientas de conocimiento
`tools/knowledge/` y `.agents/skills/graphify/` apoyan al equipo. Su entorno aislado `.venv-graphify/` y salidas `graphify-out/` son locales y regenerables. No se importan desde frontend o backend. El grafo describe estructura de código; no valida comportamiento ni sustituye pruebas o decisiones documentadas.

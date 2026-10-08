# ADR 0002: frontend modular con rutas declarativas y carga diferida

Fecha: 2026-10-08. Estado: implementada e integrada en la rama dev.

## Contexto

La Tarea 1 requiere preservar las pantallas y sus flujos simulados, retirar código sin consumidores y limitar los archivos fuente a 500 líneas. App.tsx contenía 7.233 líneas y mezclaba navegación, layouts, datos y pantallas.

## Decisión

Mantener el monorepo y no modificar el backend. Organizar el frontend en app, pages por rol, components, hooks, types, mocks, services, api y theme.

React Router declara cada destino. App.tsx compone, RouteAccess verifica sesión/rol y PageFrame decide el layout. Los alias se conservan; las URL desconocidas muestran 404. El adaptador View/URL continúa temporalmente para botones existentes, pero no decide el contenido.

Cada pantalla se importa mediante React.lazy desde su archivo, con Suspense y límite de errores. Las vistas grandes separan hooks de estado, componentes locales y datos comunes por responsabilidad.

Autenticación real por cookie HttpOnly, cliente HTTP único y ninguna sesión ficticia en producción. Los accesos rápidos solo rellenan identificadores en desarrollo, sin contraseña embebida. Operaciones no integradas siguen explícitamente simuladas.

## Consecuencias

- Menor entrada JS inicial, aunque el total de chunks no necesariamente disminuye.
- Más archivos, organizados por dominio: el conteo de líneas no sustituye pruebas funcionales.
- Prohibido importar internos de un rol desde otro; app coordina las interfaces compartidas.
- Servicios pendientes se conservan aunque todavía no tengan consumidor de pantalla.
- Despliegue SPA requiere fallback a index.html y configuración correcta de API/cookies.
- Fixtures de UI no prueban permisos del servidor ni persistencia real.

## Verificación

Ver informe de Tarea 1 y scripts check:frontend, typecheck, test y build. El análisis Graphify es AST local y complementa, pero no sustituye, compilación, pruebas y QA en navegador.

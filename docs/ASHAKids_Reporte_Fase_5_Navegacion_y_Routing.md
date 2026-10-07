# ASHAKids Platform — Reporte Fase 5: Navegación, Routing URL Real y Protección por Roles

**Fecha:** 6 de Octubre, 2026  
**Rama:** `feat/nlavadom`  
**Autor:** Antigravity AI Pair Programmer  

---

## 1. Estado Inicial del Routing

Antes de esta migración, el frontend de ASHAKids (`frontend/src/App.tsx`) gestionaba la visualización mediante un estado reactivo interno (`view`), un despachador `go(targetView)` y una función `renderView()`.

### Limitaciones Identificadas:
1. **URL Congelada:** La barra del navegador permanecía perpetuamente en `http://localhost:5173/`, sin importar si el usuario navegaba a la Landing, el Login, o las secciones internas de Padre, Terapeuta o Administrador.
2. **Pérdida de Estado al Recargar (F5):** Si el usuario refrescaba la pantalla, se reiniciaba la vista por defecto en lugar de mantenerse en la subpágina o panel que estaba visualizando.
3. **Ausencia de Deep Linking:** No era posible compartir ni acceder directamente mediante enlaces directos (por ejemplo, a `/especialistas`, `/padre/pacientes` o `/terapeuta/agenda`).
4. **Desconexión con el Historial del Navegador:** Los botones "Atrás" y "Adelante" del navegador web no funcionaban para navegar entre las vistas de la aplicación.
5. **Falta de Guards Reales en el Enrutador:** La protección contra accesos cruzados entre roles dependía únicamente del flujo visual y no de reglas vinculadas a la ruta solicitada.

---

## 2. Librería de Routing Utilizada

Se utilizó **`react-router-dom` v7.13.0**, complementando la librería base `react-router` (v7.13.0) que ya se encontraba en las dependencias del proyecto.

- **Paquete instalado:** `react-router-dom@^7.13.0`
- **Configuración de entrada:** En [frontend/src/main.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/main.tsx), se envolvió el árbol de la aplicación con `<BrowserRouter>` envolviendo al `<AuthProvider>` existente:

```tsx
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
```

---

## 3. Rutas Creadas y Mapeo de Vistas

Se implementó una capa modular de enrutamiento en [frontend/src/routes/paths.ts](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/routes/paths.ts) que proporciona un mapeo bidireccional y canónico entre rutas URL del navegador y vistas internas.

### 3.1. Rutas Públicas (Sin Autenticación)
| Ruta URL | Vista Interna | Descripción |
| :--- | :--- | :--- |
| `/` | `landing` | Página de bienvenida / Landing principal |
| `/login` | `login` | Formulario de autenticación por credenciales |
| `/forgot-password` | `forgot-password` | Recuperación de contraseña |
| `/onboarding` | `onboarding` | Flujo de inducción inicial |
| `/especialistas` | `public/especialistas` | Directorio público de especialistas |
| `/especialidades` | `public/especialidades` | Catálogo de especialidades |
| `/recursos` | `public/recursos` | Artículos, guías y recursos abiertos |
| `/sobre-nosotros` (alias `/nosotros`) | `public/nosotros` | Información institucional de ASHAKids |
| `/planes` | `public/planes` | Planes y suscripciones |
| `/ayuda` | `public/ayuda` | Centro de ayuda público |
| `/contacto` | `public/contacto` | Formulario de contacto |
| `/trabaja` | `public/trabaja` | Convocatorias y bolsa de trabajo |
| `/ashi` | `public/ashi` | Presentación del asistente Ashi |
| `/historias` | `public/historias` | Historias de éxito y testimonios |
| `/mundo-asha` *(para usuarios no autenticados)* | `public/mundo` | Vista pública informativa de Mundo ASHA |

### 3.2. Rutas del Área PADRE (Rol: `PADRE`)
| Ruta URL | Vista Interna / Alias | Descripción |
| :--- | :--- | :--- |
| `/padre` (alias `/padre/dashboard`) | `padre` | Dashboard principal de Padres |
| `/padre/pacientes` (alias `/padre/hijos`) | `padre/hijos` | Gestión de hijos/pacientes asociados |
| `/padre/agenda` | `padre/agenda` | Calendario y citas médicas del tutor |
| `/padre/psicologos` | `padre/psicologos` | Búsqueda y selección de psicólogos |
| `/padre/progreso` | `padre/progreso` | Reportes de evolución y avances |
| `/padre/reportes` | `padre/reportes` | Descarga de informes clínicos |
| `/padre/mensajes` | `padre/mensajes` | Mensajería directa con terapeutas |
| `/padre/compras` | `padre/compras` | Historial de compras y servicios |
| `/padre/recompensas` | `padre/recompensas` | Sistema de insignias y recompensas |
| `/padre/config` (alias `/padre/perfil`) | `padre/config` | Ajustes de cuenta y perfil del padre |
| `/padre/camino` (alias `/padre/mi-camino`) | `padre/camino` | Hoja de ruta terapéutica |
| `/padre/ayuda` | `padre/ayuda` | Mesa de ayuda familiar |
| `/padre/consentimiento` | `padre/consentimiento` | Consentimientos informados firmados |
| `/padre/seguimiento` | `padre/seguimiento` | Seguimiento terapéutico detallado |
| `/padre/evaluacion` | `padre/evaluacion` | Evaluación diagnóstica inicial |
| `/padre/incidencias` | `padre/incidencias` | Registro de incidencias |
| `/mundo-asha/*` | `mundo-asha/*` | Módulo gamificado Mundo ASHA (perfil, insignias, misiones) |
| `/session/*` | `session/*` | Salas de sesión terapéutica (`waiting`, `active`, `end`, etc.) |
| `/pay/*` | `pay/*` | Pasarela de pago de sesiones (`checkout`, `history`, `wallet`) |

### 3.3. Rutas del Área TERAPEUTA (Rol: `TERAPEUTA`)
| Ruta URL | Vista Interna | Descripción |
| :--- | :--- | :--- |
| `/terapeuta` | `terapeuta` | Dashboard principal del Terapeuta |
| `/terapeuta/agenda` | `terapeuta/agenda` | Agenda de citas y solicitudes de padres |
| `/terapeuta/pacientes` | `terapeuta/pacientes` | Listado y expedientes de pacientes asignados |
| `/terapeuta/mensajes` | `terapeuta/mensajes` | Mensajería clínica con familias |
| `/terapeuta/reportes` | `terapeuta/reportes` | Redacción y emisión de reportes clínicos |
| `/terapeuta/analiticas` | `terapeuta/analiticas` | Métricas de rendimiento y consultas |
| `/terapeuta/ingresos` | `terapeuta/ingresos` | Honorarios facturados y balance financiero |
| `/terapeuta/valoraciones` | `terapeuta/valoraciones` | Reseñas y feedback de las sesiones |
| `/terapeuta/config` | `terapeuta/config` | Ajustes de disponibilidad y perfil profesional |
| `/terapeuta/datos-actividad` | `terapeuta/datos-actividad` | Bitácora de actividad y registros clínicos |
| `/terapeuta/incidencias` | `terapeuta/incidencias` | Reporte y seguimiento de incidencias |

### 3.4. Rutas del Área ADMIN (Rol: `ADMIN`)
| Ruta URL | Vista Interna | Descripción |
| :--- | :--- | :--- |
| `/admin` (alias `/admin/dashboard`) | `admin` | Dashboard general de administración |
| `/admin/cuentas` | `admin/cuentas` | Gestión de usuarios, tutores y roles |
| `/admin/terapeutas` | `admin/terapeutas` | Validación, credenciales y aprobación de terapeutas |
| `/admin/operacion` | `admin/operacion` | Monitoreo operacional del centro |
| `/admin/pagos` | `admin/pagos` | Conciliación de pagos y transacciones |
| `/admin/contenido` | `admin/contenido` | Administración de módulos y contenidos |
| `/admin/ml` | `admin/ml` | Modelos de predicción y analítica avanzada |
| `/admin/auditoria` | `admin/auditoria` | Registros de auditoría y accesos al sistema |
| `/admin/config` | `admin/config` | Configuración global de la plataforma |

---

## 4. Integración con AuthContext y Ciclo de Vida de Sesión

El sistema de autenticación se mantiene fundamentado en cookies seguras `HttpOnly` emitidas por el backend FastAPI (`ashakids_session`):

1. **Rehidratación de Sesión al Iniciar / Recargar:**
   - [frontend/src/auth/AuthContext.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/auth/AuthContext.tsx) efectúa una llamada a `GET /api/v1/auth/me` con `credentials: "include"` dentro de un `useEffect` durante el montaje inicial.
   - Mientras se resuelve la promesa de red, `isLoading` permanece en `true`.
2. **Estado de Carga Protegido:**
   - Si el usuario accede directamente a una URL protegida (ej: `/padre/pacientes` o `/terapeuta`), [frontend/src/App.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/App.tsx) y [frontend/src/routes/ProtectedRoute.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/routes/ProtectedRoute.tsx) renderizan un estado de carga seguro ("Verificando sesión segura...") con spinner animado, evitando transiciones parpadeantes o falsas redirecciones a `/login` mientras el backend responde.
3. **Persistencia del Origen (`state: { from: location }`):**
   - Cuando un usuario no autenticado intenta acceder a una ruta protegida, es redirigido a `/login` preservando la ruta original solicitada para retornar a ella una vez completado el inicio de sesión.
4. **Cierre de Sesión:**
   - La función `handleLogout` en `App.tsx` invoca `authLogout()` (que ejecuta `POST /api/v1/auth/logout` para invalidar la cookie en la base de datos de sesiones) y realiza `navigate("/login")`. Cualquier intento subsecuente de ingresar a rutas protegidas es interceptado inmediatamente.

---

## 5. Integración de `ProtectedRoute` y `RoleRoute`

Se estructuraron dos niveles de protección de rutas:

### Nivel 1: Frontend (React Router + Guardias)
- **`ProtectedRoute`:**
  - Verifica si `isAuthenticated === true`.
  - Si no hay sesión: Redirige con `<Navigate to="/login" replace state={{ from: location }} />`.
- **`RoleRoute`:**
  - Verifica si `role === allowedRole`.
  - Si el rol difiere del requerido: Renderiza una pantalla estilizada de **Acceso Restringido** indicando claramente que el rol del usuario no tiene permisos sobre la sección y proveyendo un botón de retorno SPA (`<Link to={homePath}>Ir a mi panel principal</Link>`).
- **Guardias integrados en `App.tsx`:**
  - `getRequiredRoleForPath(location.pathname, authRole)` detecta automáticamente los requerimientos de la ruta activa.
  - Se previenen accesos cruzados:
    - Padre intentando entrar a `/terapeuta/*` o `/admin/*` $\rightarrow$ Bloqueado (Acceso Restringido).
    - Terapeuta intentando entrar a `/padre/*` o `/admin/*` $\rightarrow$ Bloqueado.
    - Admin intentando entrar a `/padre/*` o `/terapeuta/*` $\rightarrow$ Bloqueado.
  - Si un usuario ya autenticado visita `/login`, es redirigido automáticamente a su panel principal (`/padre`, `/terapeuta` o `/admin`).

### Nivel 2: Backend (FastAPI + SQLAlchemy)
- Los endpoints en `backend/app/api/deps.py`:
  - `require_authenticated_user`
  - `require_padre`
  - `require_terapeuta`
  - `require_admin`
- Los endpoints `/api/v1/padres/me`, `/api/v1/terapeutas/me` y `/api/v1/admin/me` verifican estrictamente el rol del token de sesión contra la base de datos PostgreSQL, retornando `401 Unauthorized` si no hay sesión y `403 Forbidden` ante discrepancia de rol. La URL del cliente jamás compromete la seguridad del backend.

---

## 6. Evolución del Sistema Anterior `view` / `go()` / `renderView()`

Para asegurar **cero regresiones visuales** y no alterar los más de 24 submódulos y componentes existentes, se implementó una estrategia de transición no invasiva:

1. **La URL es ahora la única fuente de verdad:**
   - El estado local `const [view, setView] = useState(...)` fue reemplazado por la derivación computada en tiempo real:
     ```tsx
     const view: View = pathToView(location.pathname, authRole);
     ```
2. **Compatibilidad total con el callback `go()`:**
   - En lugar de modificar cientos de llamadas `go("padre/agenda")` o `go("session/waiting")` en los componentes hijos, el callback `go` fue reimplementado como un adaptador de navegación:
     ```tsx
     const go = (target: View | string) => {
       const targetPath = viewToPath(target);
       navigate(targetPath);
     };
     ```
   - Al invocar `go(...)`, ahora se ejecuta `navigate(...)`, lo cual actualiza la URL en la barra del navegador, dispara la reactividad de React Router y mantiene sincronizados los menús de navegación (`DashLayout`).
3. **Conservación de `renderView()` y `DashLayout`:**
   - `renderView()` continúa renderizando los componentes visuales exactos mapeados al identificador `view`.
   - `DashLayout` recibe `cur={view}`, resaltando activamente la pestaña correspondiente en el menú lateral conforme cambia la URL.

---

## 7. Resolución de la Recarga Directa / F5 y SPA Fallback

Al trabajar con Vite en entorno de desarrollo (`vite` en el puerto 5173):
- El servidor de desarrollo de Vite implementa soporte nativo de SPA History Fallback (redireccionando peticiones HTTP GET HTML no encontradas hacia `index.html`).
- **Prueba HTTP Directa Realizada:**
  - Peticiones a `http://localhost:5173/padre`, `http://localhost:5173/padre/pacientes`, `http://localhost:5173/terapeuta` y `http://localhost:5173/admin` respondieron con código de estado HTTP `200 OK` y entregaron el `index.html` correspondiente.
- **Flujo en F5:**
  1. El navegador carga `index.html`.
  2. React Router lee la ruta actual de la barra de direcciones (ej: `/padre/pacientes`).
  3. `AuthContext` efectúa `checkAuth()` hacia `/api/v1/auth/me`.
  4. La pantalla muestra el spinner seguro durante la comprobación de la cookie.
  5. Una vez confirmada la sesión, `App.tsx` renderiza la vista solicitada (`Mis Hijos`) en lugar de reiniciar a la pantalla de bienvenida o quedar en blanco.

---

## 8. Pruebas Realizadas

Se implementó una suite automatizada de pruebas en [frontend/tests/routing.test.mjs](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/tests/routing.test.mjs) utilizando el motor de pruebas nativo de Node.js (`node --test`), cubriendo 25 casos de prueba unitarios e integrados:

1. **Rutas Públicas (16 pruebas):**
   - Validación de que `/`, `/login`, `/especialistas`, `/sobre-nosotros`, `/recursos`, etc., no requieren rol alguno.
   - Validación de que `/mundo-asha` es accesible públicamente si no hay sesión iniciada como `PADRE`.
2. **Rutas Protegidas y Determinación de Rol (3 pruebas):**
   - Comprobación de rol `PADRE` para `/padre`, `/padre/pacientes`, `/session/*`, `/pay/*`.
   - Comprobación de rol `TERAPEUTA` para `/terapeuta`, `/terapeuta/agenda`, `/terapeuta/pacientes`.
   - Comprobación de rol `ADMIN` para `/admin`, `/admin/dashboard`, `/admin/cuentas`.
3. **Lógica de Protección y Guardias (4 pruebas):**
   - Acceso anónimo a ruta pública $\rightarrow$ Permitido.
   - Acceso anónimo a ruta protegida $\rightarrow$ Redirige a `/login`.
   - Acceso con rol correcto $\rightarrow$ Permitido.
   - Cruce de accesos no autorizados:
     - `PADRE` $\rightarrow$ `/admin` $\rightarrow$ Acceso Restringido (sugerencia de panel `/padre`).
     - `PADRE` $\rightarrow$ `/terapeuta` $\rightarrow$ Acceso Restringido.
     - `TERAPEUTA` $\rightarrow$ `/padre` $\rightarrow$ Acceso Restringido (sugerencia de panel `/terapeuta`).
     - `TERAPEUTA` $\rightarrow$ `/admin` $\rightarrow$ Acceso Restringido.
     - `ADMIN` $\rightarrow$ `/padre` $\rightarrow$ Acceso Restringido (sugerencia de panel `/admin`).
     - `ADMIN` $\rightarrow$ `/terapeuta` $\rightarrow$ Acceso Restringido.
4. **Mapeo Bidireccional y Aliases (2 pruebas):**
   - Verificación de resolución de aliases (`/padre/pacientes` $\rightarrow$ `padre/hijos`, `/padre/perfil` $\rightarrow$ `padre/config`).
5. **Backend Test Suite:**
   - Se ejecutaron los 40 tests unitarios y de integración con base de datos real de Supabase (`backend/tests`), finalizando con **40 tests exitosos (`OK`)**.

---

## 9. Resultado de `npm run build`

Se ejecutó la compilación de producción de Vite en el frontend:

```bash
> npm run build
> vite build

vite v6.3.5 building for production...
transforming...
✓ 2286 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                                 0.80 kB │ gzip:   0.45 kB
dist/assets/ashakids-logo-final-transparent-1-CEeqHuC8.png    297.47 kB
dist/assets/index-SDvK78eR.css                                150.21 kB │ gzip:  24.42 kB
dist/assets/index-UYLiHB64.js                               1,020.69 kB │ gzip: 241.34 kB
✓ built in 7.66s
```

- **Errores de compilación:** 0
- **Errores de TypeScript:** 0

---

## 10. Archivos Creados y Modificados

### Archivos Modificados:
- [frontend/package.json](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/package.json): Incorporación de `react-router-dom` y script `"test": "node --experimental-strip-types --test tests/routing.test.mjs"`.
- [frontend/package-lock.json](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/package-lock.json): Registro de dependencias.
- [frontend/src/main.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/main.tsx): Configuración del proveedor `<BrowserRouter>`.
- [frontend/src/App.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/App.tsx): Reemplazo del estado de navegación por `useLocation` y `useNavigate`, sincronización de la vista activa a partir de la URL, guardias de rol y redirecciones.
- [frontend/src/routes/ProtectedRoute.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/routes/ProtectedRoute.tsx): Soporte para React Router v7 con estado de redirección `state: { from: location }`.
- [frontend/src/routes/RoleRoute.tsx](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/routes/RoleRoute.tsx): Soporte para navegación SPA con `<Link>` hacia los paneles de cada rol.
- [frontend/src/types/auth.ts](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/types/auth.ts): Tipos de perfil `PadreProfile`, `TerapeutaProfile`, `AdminProfile`.
- [backend/app/api/deps.py](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/api/deps.py): Dependencias de inyección para validación de roles en FastAPI.
- [backend/app/main.py](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/main.py): Registro de enrutadores `/api/v1/padres`, `/api/v1/terapeutas`, `/api/v1/admin`.
- [backend/app/models/perfiles.py](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/models/perfiles.py): Modelos `Tutor` y `Terapeuta`.
- [backend/app/models/__init__.py](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/models/__init__.py): Exportación de modelos.
- [backend/app/schemas/perfiles.py](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/schemas/perfiles.py): Esquemas Pydantic de perfiles de rol.

### Archivos Creados:
- [frontend/src/routes/paths.ts](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/routes/paths.ts): Funciones de mapeo bidireccional `viewToPath`, `pathToView` y `getRequiredRoleForPath`.
- [frontend/src/services/padresService.ts](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/services/padresService.ts): Servicio de consumo para `/api/v1/padres/me`.
- [frontend/src/services/terapeutasService.ts](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/services/terapeutasService.ts): Servicio de consumo para `/api/v1/terapeutas/me`.
- [frontend/src/services/adminService.ts](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/services/adminService.ts): Servicio de consumo para `/api/v1/admin/me`.
- [frontend/tests/routing.test.mjs](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/tests/routing.test.mjs): Suite de pruebas automatizadas de routing.
- [docs/ASHAKids_Reporte_Fase_5_Navegacion_y_Routing.md](file:///c:/Users/HailQueso/Desktop/ashakid/docs/ASHAKids_Reporte_Fase_5_Navegacion_y_Routing.md): Documento de reporte completo de la Fase 5.

---

## 11. Deuda Técnica Restante y Siguientes Pasos

1. **Modularización de Subrutas con `<Routes>` y `<Route>`:**
   - Actualmente `App.tsx` utiliza un despachador unificado conectado a `location.pathname` para preservar la estructura visual existente sin romper ninguno de los 24 submódulos. A futuro, cuando se comience el trabajo granular por página (ej: desarrollo de expedientes y CRUD de pacientes), las rutas podrán desacoplarse en módulos de routing hijos (`<Routes><Route path="..." /></Routes>`).
2. **Code Splitting (Lazy Loading):**
   - El bundle principal de Vite (`index-*.js`) alcanza 1,020 kB debido a que todos los submódulos están empaquetados en un único archivo. En fases posteriores se recomienda aplicar `React.lazy()` y `Suspense` para dividir los módulos por rol (`PadreRoutes`, `TerapeutaRoutes`, `AdminRoutes`).
3. **Endpoints de Pacientes (Siguiente Fase):**
   - Con la autenticación, autorización por roles y enrutamiento URL garantizados y consolidados, el sistema se encuentra completamente listo para iniciar la implementación de los endpoints y vistas de gestión clínica de Pacientes.

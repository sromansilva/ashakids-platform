# ASHAKids Platform — Reporte Técnico: Reorganización Estructural del Frontend
**Fecha:** Octubre 2026  
**Rama de trabajo:** `feat/nlavadom`  
**Objetivo:** Desacoplar integralmente el frontend de la estructura heredada de Figma Make y reorganizar `frontend/src` por dominios.

---

## 1. Resumen Ejecutivo

Se completó la reorganización de la estructura de `frontend/src` para eliminar la dependencia conceptual de las carpetas generadas por Figma Make (`app/`, `app/components/ui/`, `app/views/`, `styles/`, `imports/`). 

### Principios Respetados:
- **Cero cambios funcionales:** Ninguna pantalla ni interacción fue alterada.
- **Cero cambios visuales:** La interfaz y tokens visuales se conservaron al 100%.
- **Autenticación intacta:** La autenticación con FastAPI + Supabase PostgreSQL mediante cookies HttpOnly sigue operando sin modificaciones.
- **Sin nuevas dependencias:** Se mantuvieron estrictamente las dependencias existentes del proyecto.
- **Build de producción exitoso:** `vite build` transformó 2,244 módulos en 10.86s con cero errores.

---

## 2. Estructura Final de `frontend/src/`

```
frontend/src/
├── api/             # Cliente HTTP centralizado (apiClient)
├── assets/          # Logos e imágenes estáticas (.png, .mp3)
├── auth/            # Infraestructura de autenticación (AuthContext)
├── components/      # Componentes reutilizables y UI primitives (ui/)
│   ├── ui/          # Primitivas shadcn/Radix (button, card, dialog, etc.)
│   ├── shared.tsx   # Biblioteca de componentes compartidos de AshaKids
│   └── ImageWithFallback.tsx
├── hooks/           # Hooks personalizados reutilizables (useAuth, use-mobile)
├── lib/             # Utilidades genéricas (utils.ts -> cn)
├── pages/
│   ├── admin/       # Dashboard y módulos del Administrador (Admin.tsx, DashboardPage.tsx)
│   ├── auth/        # Login y flujos de registro/onboarding (Auth.tsx, LoginPage.tsx)
│   ├── padre/       # Centro Familiar, Mi Camino ASHA, pagos y sesiones
│   ├── public/      # Páginas públicas sin autenticación (AboutUs, Specialists, etc.)
│   └── terapeuta/   # Dashboard y submódulos clínicos del Terapeuta (Terapeuta.tsx)
├── routes/          # Guards de protección (ProtectedRoute, RoleRoute)
├── services/        # Servicios de acceso a recursos (authService)
├── theme/           # Estilos globales y tokens CSS (fonts, tailwind, theme, globals)
├── types/           # Tipos TypeScript compartidos (auth.ts)
├── App.tsx          # Componente raíz orquestador de vistas
├── Index.css        # Entrada principal de estilos globales
├── main.tsx         # Punto de entrada de React 18
└── vite-env.d.ts    # Tipos de entorno de Vite
```

---

## 3. Mapa de Auditoría y Migración

| Archivo actual | Nueva ubicación | Motivo | Riesgo |
|---|---|---|---|
| `src/app/App.tsx` | `src/App.tsx` | Raíz de la aplicación según arquitectura requerida | Bajo |
| `src/styles/index.css` | `src/Index.css` | Hoja de estilos principal en la raíz de `src/` | Bajo |
| `src/styles/*.css` | `src/theme/*.css` | Estilos globales, tipografías y tema en `theme/` | Bajo |
| `src/app/components/ui/utils.ts` | `src/lib/utils.ts` | Función utilitaria `cn` (`clsx` + `tailwind-merge`) | Bajo |
| `src/app/components/ui/use-mobile.ts` | `src/hooks/use-mobile.ts` | Custom hook de detección responsive `useIsMobile()` | Bajo |
| `src/app/components/figma/ImageWithFallback.tsx` | `src/components/ImageWithFallback.tsx` | Componente reutilizable visual con fallback | Bajo |
| `src/app/shared.tsx` | `src/components/shared.tsx` | Componentes transversales (`Btn`, `Crd`, `Bdg`, `Ashi`, etc.) | Medio |
| `src/app/components/ui/*.tsx` (43 archivos) | `src/components/ui/*.tsx` | Primitivas UI reutilizables (Radix / Tailwind) | Bajo |
| `src/app/views/Admin.tsx` | `src/pages/admin/Admin.tsx` | Pantallas y módulos exclusivos del rol Admin | Medio |
| `src/pages/admin/DashboardPage.tsx` | `src/pages/admin/DashboardPage.tsx` | Actualización de imports a `@/components/shared` y `./Admin` | Bajo |
| `src/app/views/Terapeuta.tsx` | `src/pages/terapeuta/Terapeuta.tsx` | Pantallas clínicas exclusivas del rol Terapeuta | Medio |
| `src/pages/terapeuta/DashboardPage.tsx` | `src/pages/terapeuta/DashboardPage.tsx` | Actualización de imports a `@/components/shared` y `./Terapeuta` | Bajo |
| `src/app/views/Padre.tsx` | `src/pages/padre/Padre.tsx` | Vistas exclusivas del padre: agenda, terapeutas, mensajes | Medio |
| `src/app/views/AshaPay.tsx` | `src/pages/padre/AshaPay.tsx` | Flujo de checkout y compra de paquetes de terapia | Bajo |
| `src/app/views/EvalInicial.tsx` | `src/pages/padre/EvalInicial.tsx` | Evaluación inicial del niño y familia | Bajo |
| `src/app/views/Sessions.tsx` | `src/pages/padre/Sessions.tsx` | Mundo ASHA Home y sintetizador de voz infantil | Medio |
| `src/app/views/SessionsGames.tsx` | `src/pages/padre/SessionsGames.tsx` | Juegos y actividades infantiles (Cuentos, Laberinto, etc.) | Medio |
| `src/app/views/SessionsMeeting.tsx` | `src/pages/padre/SessionsMeeting.tsx` | Salas de sesión virtual de teleterapia (ASHA Session) | Medio |
| `src/app/MundoAsha.tsx` | `src/pages/padre/MundoAsha.tsx` | Módulo interactivo gamificado del niño | Bajo |
| `src/app/AshaSession.tsx` | `src/pages/padre/AshaSession.tsx` | Salas de sesión previas conservadas por política | Bajo |
| `src/app/views/Public.tsx` | `src/pages/public/Public.tsx` | Catálogo de especialistas, información y contacto público | Medio |
| `src/pages/public/*.tsx` (4 páginas) | `src/pages/public/*.tsx` | Actualización de imports a `@/components/shared` y `./Public` | Bajo |
| `src/app/views/Auth.tsx` | `src/pages/auth/Auth.tsx` | Pantallas de registro, verificación y onboarding | Bajo |
| `src/pages/auth/LoginPage.tsx` | `src/pages/auth/LoginPage.tsx` | Actualización de import a `@/components/shared` | Bajo |
| `src/imports/*.png, *.mp3` | `src/assets/*` | Recursos estáticos multimedia requeridos | Bajo |
| `src/imports/*.md, pasted_text/*.md` | `docs/specs/*` | Especificaciones de prompts movidas fuera de `src/` | Bajo |

---

## 4. Carpetas Eliminadas

Las siguientes carpetas quedaron totalmente vacías tras la migración y fueron eliminadas:
- `frontend/src/app/` (y todas sus subcarpetas `components/`, `views/`, `figma/`, `ui/`)
- `frontend/src/styles/`
- `frontend/src/imports/`

---

## 5. Validaciones Ejecutadas y Resultados

1. **Build de producción:**
   - Comando: `npm run build`
   - Resultado: Exitoso (código de salida 0)
   - Tiempo de build: 10.86 segundos
   - Módulos transformados: 2,244
   - Chunks generados: `dist/index.html`, `dist/assets/index-Bv5_HKKM.css`, `dist/assets/index-CYI63J4y.js`, assets de imágenes.
2. **Búsqueda de dependencias residuales:**
   - Verificación de cadenas `app/`: 0 coincidencias en archivos fuente.
   - Verificación de cadenas `imports/`: 0 coincidencias en archivos fuente.
   - Verificación de cadenas `styles/`: 0 coincidencias en archivos fuente.
   - Verificación de imports `shared`: Todos redirigidos a `@/components/shared`.
3. **Flujo de autenticación:**
   - `authService.ts` mantiene llamadas a `/auth/login`, `/auth/logout`, `/auth/me`.
   - `AuthContext.tsx` y `RoleRoute.tsx` conservan su lógica de estado y navegación sin cambios.
   - La sincronización de sesión en `App.tsx` basada en `user.rol` permanece intacta.

---

## 6. Riesgos y Deuda Técnica Detectada

1. **Modularización interna de vistas:**
   Archivos como `Admin.tsx` (2,446 líneas), `Terapeuta.tsx` (2,960 líneas) y `SessionsGames.tsx` (3,134 líneas) aún agrupan múltiples submódulos dentro del mismo archivo. En una siguiente fase se recomienda dividirlos en archivos individuales dentro de su correspondiente subdirectorio (ej. `pages/admin/cuentas.tsx`, `pages/terapeuta/agenda.tsx`).
2. **Code-Splitting y tamaño de chunks:**
   Vite reporta advertencia por chunk principal > 500 kB. En futuras mejoras se recomienda implementar `React.lazy()` para cargar las páginas de cada rol bajo demanda según la sesión del usuario.

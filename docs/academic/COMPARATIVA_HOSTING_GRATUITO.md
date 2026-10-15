# ASHAKids — Análisis Comparativo y Selección de Hosting Gratuito (F7-02)

**Fecha de evaluación:** 2026-10-09  
**Objetivo:** Evaluar y recomendar la mejor arquitectura de despliegue gratuito para la plataforma ASHAKids (React + FastAPI + PostgreSQL/Supabase), asegurando estabilidad para la demostración académica y respetando las restricciones de cookies de sesión HttpOnly.

---

## 1. Contexto y Requisitos Técnicos de Despliegue

Para que la plataforma funcione en producción con la misma fiabilidad que en el entorno local verificado, el hosting debe cumplir los siguientes requisitos arquitectónicos:

1. **Frontend (SPA en React 19 / Vite):**
   - Servidor estático con reescritura de rutas (*URL rewriting* o fallback `/*` $\rightarrow$ `/index.html`) para evitar errores 404 al recargar rutas protegidas como `/admin`, `/padre` o `/terapeuta`.
2. **Backend (API REST en FastAPI / Python 3.13):**
   - Soporte para Python 3.10+, compilación de dependencias nativas (C/wheel para `asyncpg`), y ejecución continua mediante servidor ASGI Uvicorn escuchando en la variable de entorno `$PORT`.
3. **Base de Datos (PostgreSQL en Supabase):**
   - Conexión saliente segura vía SSL/TLS (`sslmode=require`) hacia Supabase. Compatibilidad del driver `asyncpg` con el pooler de Supabase (puerto 6543 en Transaction mode o puerto 5432 para conexión directa por IPv4/IPv6).
4. **Transporte de Sesión (Cookies HttpOnly `SameSite=lax`):**
   - **Desafío crítico:** Si el frontend reside en un dominio (ej. `ashakids.vercel.app`) y el backend en otro dominio diferente (ej. `ashakids-api.onrender.com`), los navegadores los consideran sitios diferentes (*Cross-Site*). En este escenario, las cookies con `SameSite=lax` son bloqueadas en peticiones fetch. Por tanto, la solución requiere:
     - **Opción A (Recomendada):** Configurar un Proxy Inverso / Rewrite en el hosting del frontend (por ejemplo, `vercel.json` con regla de reescritura que redirija `/api/:path*` transparentemente hacia la API), convirtiendo las llamadas en Same-Origin.
     - **Opción B:** Utilizar cookies con `SameSite=None; Secure`, lo que exige HTTPS estricto y configuración CORS minuciosa.

---

## 2. Comparativa de Alternativas Evaluadas

Se analizaron 3 opciones viables bajo sus condiciones oficiales vigentes:

| Criterio | Opción 1: Vercel (Front) + Render (API) | Opción 2: Railway (Fullstack) | Opción 3: Render (Front + API) |
| :--- | :--- | :--- | :--- |
| **Arquitectura** | Frontend en CDN global (Vercel) + Backend en contenedor (Render). | Frontend y Backend como servicios independientes en Railway. | Static Site (Front) + Web Service (Back) dentro de Render. |
| **Coste efectivo** | **$0 / mes permanente.** Vercel Hobby es gratuito sin caducidad. Render Free Web Service es gratuito. | **Crédito inicial limitado.** Ofrece $5 de crédito de prueba único; requiere tarjeta de crédito para mantener el plan Hobby tras agotar el crédito. | **$0 / mes permanente.** Tanto Static Site como Free Web Service son gratuitos. |
| **Tarjeta de crédito** | **No requerida** para la capa gratuita en ninguno de los dos servicios. | **Requerida** para evitar la suspensión tras el crédito de prueba inicial. | **No requerida** para la capa gratuita. |
| **Arranque en frío (Cold Start)** | Frontend: **0 ms** (Edge CDN). Backend: **50-60 s** tras 15 minutos de inactividad en Render Free. | **0 ms** (los servicios no se suspenden mientras haya crédito activo). | Frontend: **0 ms** (CDN). Backend: **50-60 s** tras 15 min de inactividad. |
| **Límites de recursos Backend** | 512 MB RAM, 0.1 CPU, 750 horas de ejecución al mes (cubre 1 servicio 24/7). | 512 MB - 8 GB RAM escalable según crédito consumido. | 512 MB RAM, 0.1 CPU, 750 horas de ejecución al mes. |
| **Manejo de Cookies (Same-Origin)** | **Excelente.** Vercel permite `rewrites` nativos en `vercel.json` para enrutar `/api/:path*` al backend, manteniendo **Same-Origin absoluto**. | Exige dominio común o `SameSite=None; Secure` con orígenes cruzados. | Render Static Sites tiene soporte limitado de proxy inverso; puede requerir `SameSite=None; Secure`. |
| **Conexión a Supabase** | Conexión directa o vía Transaction Pooler (puerto 6543) con SSL compatible en asyncpg. | Conexión fluida con SSL. | Conexión directa o vía pooler con SSL compatible. |
| **Facilidad para sustentación** | **Muy alta.** Despliegue en 2 clics desde GitHub en Vercel y Render. | Alta, pero condicionada a saldo de prueba y tarjeta. | Alta, todo en un único panel de control. |

---

## 3. Recomendación Técnica Fundamentada

### Opción Recomendada: **Vercel (Frontend) + Render (Backend) + Supabase (PostgreSQL)**

**Justificación técnica:**
1. **Coste $0 Real y Seguro:** No requiere tarjeta de crédito, eliminando el riesgo de cargos inesperados tras la presentación académica.
2. **Solución Definitiva al Bucle de Cookies:** Mediante un simple archivo `vercel.json` en la raíz del frontend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://ashakids-api.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   Todas las solicitudes desde el navegador a `/api/v1/...` son gestionadas por el CDN de Vercel como un proxy inverso hacia Render. El navegador interpreta que la API está en el **mismo origen que la web**, preservando las cookies HttpOnly con `SameSite=lax` sin ningún bloqueo en Brave, Chrome, Safari o Firefox.
3. **Mitigación del Cold Start en Sustentación:** La única limitación del Free Tier de Render es la suspensión tras 15 minutos de inactividad (tarda ~50 segundos en despertar la primera vez). Esto se mitiga fácilmente haciendo una petición ping a `https://ashakids-api.onrender.com/health` 5 minutos antes de la defensa oral.

---

## 4. Guía Rápida de Despliegue para el Equipo (F7-03)

Si el usuario decide ejecutar el despliegue en la nube, los pasos reproducibles son:

### Paso 1: Desplegar Backend en Render
1. Iniciar sesión en [Render.com](https://render.com/) con GitHub.
2. Crear un **New Web Service** apuntando al repositorio `ashakids-platform`.
3. Configurar:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     - `DATABASE_URL`: `postgresql+asyncpg://[usuario]:[password]@[host-supabase]:6543/postgres?ssl=require`
     - `ENVIRONMENT`: `production`
     - `SECRET_KEY`: `[clave-secreta-aleatoria-64-caracteres]`
     - `CORS_ORIGINS`: `["https://[tu-proyecto].vercel.app"]`
4. Copiar la URL generada (ej. `https://ashakids-api.onrender.com`).

### Paso 2: Desplegar Frontend en Vercel
1. Iniciar sesión en [Vercel.com](https://vercel.com/) con GitHub.
2. Importar el proyecto seleccionando el directorio raíz `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`, Output Directory: `dist`.
5. Crear archivo `frontend/vercel.json` con la regla de rewrite apuntando a la URL de Render copiada en el Paso 1.
6. Desplegar. La aplicación queda accesible con HTTPS automático y cookies plenamente funcionales.

<div align="center">

# 🌟 Plataforma Educativa Ashakids
### Telerehabilitación Pediátrica, Acompañamiento Clínico y Aprendizaje Lúdico

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  La <b>Plataforma Educativa Ashakids</b> conecta a familias con especialistas en fonoaudiología y terapia del lenguaje infantil a través de sesiones virtuales (Zoom) o presenciales, expedientes clínicos estructurados y un entorno de aprendizaje gamificado de 5 mundos educativos interactivos guiados por <b>Ashi</b>.
</p>

[✨ Características](#-características-principales) •
[🏛️ Arquitectura](#-arquitectura-modular-por-capas) •
[🚀 Inicio Rápido](#-puesta-en-marcha-rápida) •
[🧪 Pruebas](#-batería-de-pruebas-y-calidad) •
[☁️ Despliegue](#-despliegue-en-producción-aws-ec2)

---

</div>

## 🎯 Portales y Experiencia de Usuario

La **Plataforma Educativa Ashakids** implementa un control de acceso basado en roles con flujos dedicados para cada actor:

| 👨‍👩‍👧 Portal Familiar (`PADRE`) | 🩺 Portal Clínico (`TERAPEUTA`) | 🛡️ Portal de Gestión (`ADMIN`) |
| :--- | :--- | :--- |
| • **Centro Familiar**: Gestión multi-hijo con selector activo.<br>• **Camino ASHA**: Seguimiento visual del plan y etapas terapéuticas.<br>• **Agendamiento**: Reserva de consulta introductoria y citas Zoom/Presencial.<br>• **Mundo ASHA**: 5 mundos lúdicos con reconocimiento fonético de voz.<br>• **Reportes de Evolución**: Descarga en PDF con observaciones estructuradas. | • **Dashboard Clínico**: Métricas de pacientes, próximas citas y alertas.<br>• **Agenda Interactiva**: Turnos semanales, bloqueos y gestión de disponibilidad.<br>• **Expediente del Paciente**: Historial médico, notas de sesión y evolución.<br>• **Editor Clínico Asistido**: Objetivos, niveles de ayuda (1–5) y plantillas.<br>• **Seguimiento Lúdico**: Analítica de participación en mundos de juego. | • **Control de Cuentas**: Gestión de tutores y terapeutas, activación y reseteo.<br>• **Auditoría en Tiempo Real**: Bitácora cronológica con trazabilidad.<br>• **Supervisión Operativa**: Resumen financiero, soporte y conciliación.<br>• **Bandeja de Incidencias**: Atención de reportes de familias y terapeutas.<br>• **Gobierno del Sistema**: Parámetros globales y salud de servicios. |

---

## 🏛️ Arquitectura Modular por Capas

El repositorio está organizado como un **monorepo desacoplado** de alta cohesión y bajo acoplamiento:

```text
ashakids-platform/
├── backend/                  # API REST en TypeScript + Express + Drizzle ORM
│   └── src/
│       ├── core/             # Configuración Zod, conexión a PostgreSQL, middlewares, seguridad
│       ├── infrastructure/   # Integraciones externas (Gmail API OAuth2, Zoom API, Reconocimiento Whisper)
│       └── modules/          # 20 Módulos de dominio (auth, admin, agenda, clinica, mundo_asha, etc.)
│           ├── routes/       # Definición declarativa de endpoints REST (/api/v1/...)
│           └── services/     # Lógica de negocio, reglas de dominio y persistencia segura con fallbacks
├── frontend/                 # SPA en React 18 + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── core/             # Enrutador (AppRouter, routeManifest), cliente HTTP, guardias y layouts
│       ├── shared/           # Tokens de diseño, componentes reutilizables, modales y avatares
│       └── modules/          # Vistas y casos de uso por dominio (admin, auth, clinica, padre, terapeuta, etc.)
├── docker/                   # Scripts de inicialización PostgreSQL (init.sql, 20-create-app-user.sql)
├── deploy/                   # Configuraciones de servidor de producción (Caddyfile, EC2, CI/CD)
├── scripts/                  # Utilidades de mantenimiento, regeneración de PDFs y despliegue
└── tests/                    # Suites completas de pruebas (backend, frontend y e2e)
```

---

## 🚀 Puesta en Marcha Rápida

### Prerrequisitos
- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** y **Docker Compose** (para PostgreSQL)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/sromansilva/ashakids-platform.git
cd ashakids-platform
```

### 2. Levantar la Base de Datos con Docker
```bash
docker compose up -d postgres
```
> Esto iniciará un contenedor PostgreSQL 18 en `localhost:5432` ejecutando automáticamente el esquema inicial y datos de demostración en `docker/init.sql`.

### 3. Configurar e Iniciar el Backend
```bash
# Navegar a la carpeta backend e instalar dependencias
cd backend
npm install

# Iniciar en modo desarrollo con recarga en caliente
npm run dev
```
> El backend estará disponible en **`http://localhost:8000`** (con endpoints base en `/api/v1` y healthcheck en `/api/v1/health`).

### 4. Iniciar el Frontend
En una nueva terminal:
```bash
# Navegar a la carpeta frontend e instalar dependencias
cd frontend
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```
> La aplicación web abrirá en **`http://localhost:5173`**.

---

## 🔑 Credenciales de Demostración

La base de datos viene precargada con usuarios de prueba para validar cada flujo:

| Rol | Código de Usuario / Email | Contraseña | Portal |
| :--- | :--- | :--- | :--- |
| **Administrador** | `a00001` / `admin@ashakids.com` | `12345` | `/admin` |
| **Terapeuta** | `t00001` / `terapeuta@ashakids.com` | `12345` | `/terapeuta` |
| **Familia / Tutor** | `p00001` / `padre@ashakids.com` | `12345` | `/padre` |

---

## 🧪 Batería de Pruebas y Calidad de Código

El proyecto cuenta con un sistema estricto de pruebas automatizadas que debe pasar al 100% antes de cada integración:

```bash
# 1. Pruebas de integración del Backend (17/17 passing)
npm --prefix backend run test

# 2. Pruebas de rutas públicas y guardias por rol (27/27 passing)
npm --prefix frontend run test:routing

# 3. Pruebas unitarias y de componentes frontend (433/433 passing)
npm --prefix frontend run test:components

# 4. Verificación estricta de límites arquitectónicos e importaciones
npm --prefix frontend run check:frontend

# 5. Compilación de producción (0 errores TypeScript / Vite)
npm --prefix frontend run build
npm --prefix backend run build
```

---

## 🎨 Sistema de Diseño Visual (Tokens ASHA)

La plataforma utiliza una guía visual diseñada para transmitir calma, confianza médica y calidez infantil:

- **Color Primario / Acento**: Violeta `#6B46FE` (Hover: `#5833EA`, Fondos suaves: `#EDE9FE`, `#F8F7FC`).
- **Texto Principal**: `#1C1135` (Alto contraste y legibilidad óptima).
- **Texto Secundario**: `#615274` y `#9E95B7`.
- **Bordes y Delimitadores**: `#E8E5F4`.
- **Contenedores**: Esquinas redondeadas `rounded-3xl` o `rounded-2xl` con sombras difuminadas (`shadow-sm`).
- **Tipografía**: `Nunito` con pesos 600, 700 y 900.

---

## ☁️ Despliegue en Producción (AWS EC2)

La plataforma está preparada para desplegarse en instancias **AWS EC2** con contenedores Docker y proxy inverso **Caddy** con certificados SSL/TLS automáticos:

- **Guía de Despliegue**: [`deploy/EC2.md`](file:///c:/Users/sergi/OneDrive/Escritorio/ashakids-platform/deploy/EC2.md)
- **Flujo CI/CD y Ramas**: [`deploy/CI_CD.md`](file:///c:/Users/sergi/OneDrive/Escritorio/ashakids-platform/deploy/CI_CD.md)
- **Variables de Entorno para EC2**: [`deploy/ec2.env.example`](file:///c:/Users/sergi/OneDrive/Escritorio/ashakids-platform/deploy/ec2.env.example)

Para actualizar una instancia en vivo:
```bash
./scripts/deploy-ec2-update.sh
```

---

## 📜 Licencia y Contacto

Desarrollado para la **Plataforma Educativa Ashakids**. Todos los derechos reservados.
Para soporte técnico o dudas sobre la arquitectura, consulta la documentación en [`docs/`](file:///c:/Users/sergi/OneDrive/Escritorio/ashakids-platform/docs/) o contacta con el equipo de ingeniería.

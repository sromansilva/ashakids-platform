# ASHAKids Platform

Plataforma de telerehabilitación e intervención infantil organizada únicamente en **`frontend/`** y **`backend/`**, cada uno estructurado bajo una **Arquitectura Modular por Capas** alineada al flujo operativo completo de la plataforma.

---

## Estructura General

```text
ashakids-platform/
├── backend/                  # API REST en Python + FastAPI + SQLAlchemy
│   └── app/
│       ├── main.py
│       ├── core/             # Configuración, base de datos, seguridad, limitadores
│       ├── shared/           # Dependencias, contratos, filtros y reglas transversales por capa
│       └── modules/          # Módulos de dominio (presentation, application, domain, infrastructure)
└── frontend/                 # SPA en React 18 + TypeScript + Vite + Tailwind CSS
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── core/             # Cliente HTTP, router, providers, layouts, configuración
        ├── shared/           # Componentes comunes, hooks transversales, tipos y tema por capa
        └── modules/          # Módulos por dominio/rol (presentation, application, domain, infrastructure)
```

---

## 1. Backend (`backend/app/`) — Arquitectura Modular por Capas

Cada módulo en `backend/app/modules/<modulo>/` separa sus responsabilidades en hasta 4 capas:
- **`presentation/`**: Routers FastAPI (`/api/v1/...`), validación de entrada HTTP y respuestas.
- **`application/`**: Casos de uso, servicios de negocio y orquestación del flujo clínico/operativo.
- **`domain/`**: Modelos SQLAlchemy y esquemas/contratos Pydantic del dominio.
- **`infrastructure/`**: Adaptadores externos (Gmail SMTP/OAuth, Zoom, generación de PDF con ReportLab, reconocimiento de voz).

### Módulos del Backend según el Flujo de la Plataforma
1. **`modules/auth/`**: Inicio/cierre de sesión con cookie `HttpOnly` y activación de cuenta por correo.
2. **`modules/cuentas/`**: Alta de familias (con hijo inicial) y terapeutas por el administrador/asesor, perfiles y auditoría.
3. **`modules/pacientes/`**: Gestión familiar de hijos, selección de niño activo y expedientes clínicos.
4. **`modules/agenda/`**: Disponibilidad de terapeutas, reserva de consulta introductoria obligatoria y citas posteriores (presencial o Zoom).
5. **`modules/clinica/`**: Atención de sesiones, registro de asistencia, reportes clínicos de 4 campos + descarga PDF, planes de trabajo y valoraciones (1–5 estrellas).
6. **`modules/mundo_asha/`**: 5 mundos educativos con niveles, progreso XP, medallas y práctica de pronunciación/voz.
7. **`modules/comunicacion/`**: Mensajería autorizada tutor-terapeuta con adjuntos, notificaciones, incidencias y newsletter.

---

## 2. Frontend (`frontend/src/`) — Arquitectura Modular por Capas

Cada módulo en `frontend/src/modules/<modulo>/` está organizado por capas:
- **`presentation/`**: Vistas (`pages`) y componentes visuales específicos del módulo.
- **`application/`**: Contextos, hooks de estado y casos de uso del módulo.
- **`domain/`**: Contratos TypeScript y modelos del módulo.
- **`infrastructure/`**: Servicios de integración con la API que consumen exclusivamente `src/core/api/client.ts`.

### Módulos del Frontend
1. **`modules/auth/`**: Login, activación de cuenta por correo, onboarding y sesión activa.
2. **`modules/public/`**: Sitio público, catálogo de especialistas, recursos e información institucional.
3. **`modules/padre/`**: Centro Familiar, selección de niño, reserva de citas, seguimiento del plan, reportes PDF y Mundo ASHA.
4. **`modules/terapeuta/`**: Panel clínico, disponibilidad, pacientes, cierre de sesiones, reportes, planes de trabajo y reseñas.
5. **`modules/admin/`**: Gestión de cuentas familiares/terapeutas, bandeja de incidencias, auditoría y operación.
6. **`modules/pacientes/`**: Contratos y servicios de expedientes infantiles.
7. **`modules/clinica/`**: Contratos y servicios de citas, sesiones, reportes y planes clínicos.
8. **`modules/mundo_asha/`**: Catálogo de los 5 mundos educativos, progreso de juegos y servicio de voz.
9. **`modules/comunicacion/`**: Servicios de mensajería con adjuntos, notificaciones e incidencias.

---

## Ejecución en Local

### Backend (`http://localhost:8000`)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (`http://localhost:5173`)
```powershell
cd frontend
npm install
npm run dev
```

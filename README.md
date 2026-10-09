# ASHAKids Platform

Plataforma de telerehabilitación e intervención infantil.

## Arquitectura

La plataforma sigue una arquitectura desacoplada donde el frontend nunca se conecta directamente a la base de datos:

```
React + TypeScript + Vite (Frontend)
          │
          │ HTTP / JSON
          ▼
   Python + FastAPI (Backend)
          │
          │ PostgreSQL
          ▼
 Supabase / PostgreSQL (Database)
```

### Componentes

- **Frontend (`frontend/`)**: React 18, TypeScript, Vite, React Router y Tailwind CSS; UI modular propia por rol.
- **Backend (`backend/`)**: Python, FastAPI, Uvicorn, Pydantic. Responsable de la lógica de negocio, autenticación propia, autorización, operaciones clínicas y acceso a datos.
- **Database**: Supabase como infraestructura de PostgreSQL gestionado. La base de datos es la fuente de verdad. ASHAKids utiliza **autenticación propia** (sin Supabase Auth).

---

## Ejecución del proyecto

### 1. Frontend

El frontend se gestiona con `npm`.

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev

# Compilar para producción
npm run build
```

### 2. Backend

El backend requiere Python 3.10+ (verificado con Python 3.13).

```bash
# Navegar al directorio del backend
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# En Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# En Linux / macOS:
# source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (copiar ejemplo)
cp .env.example .env

# Iniciar servidor FastAPI (http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

#### Comprobación de salud del Backend

Una vez iniciado el backend, verificar en:

- Health check: `http://localhost:8000/health`
- Documentación OpenAPI interactiva: `http://localhost:8000/docs`
## Conocimiento compartido para el equipo

Guía progresiva: [contexto maestro](docs/PROJECT_CONTEXT.md),
[plan por fases](docs/IMPLEMENTATION_PLAN.md) y [avance/relevos](docs/IMPLEMENTATION_PROGRESS.md).
Pagos: solo maqueta existente; sin desarrollo ni commits nuevos de pagos, según el profesor.
Registrar el estado en Git al cambiar de integrante o asistente.
Entrega: 2026-10-09 18:00 Lima. Ver [lista de entrega](docs/DELIVERY_CHECKLIST.md) y
[protocolo de auditorías](docs/audits/README.md).


Leer [contexto actual](docs/PROJECT_CONTEXT.md), [arquitectura](docs/architecture.md) y [flujo Graphify](docs/knowledge-workflow.md). La skill está en `.agents/skills/graphify/`; las instrucciones para agentes están en `AGENTS.md`.

```sh
python tools/knowledge/manage.py setup
python tools/knowledge/manage.py query "authenticate_user"
python tools/knowledge/manage.py refresh
```

El entorno y mapa son regenerables y no se versionan. Graphify es tooling de desarrollo separado del frontend y backend.

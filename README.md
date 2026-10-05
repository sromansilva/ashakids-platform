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

- **Frontend (`frontend/`)**: React 18, TypeScript, Vite, Tailwind CSS / shadcn/ui.
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
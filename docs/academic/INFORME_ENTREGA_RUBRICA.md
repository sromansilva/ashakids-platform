# ASHAKids — Informe de Entrega y Evidencia para Evaluación Académica

**Repositorio oficial:** [https://github.com/sromansilva/ashakids-platform](https://github.com/sromansilva/ashakids-platform)  
**Rama:** `dev`  
**Fecha de corte:** 2026-10-09  
**Plazo de entrega:** 2026-10-09 a las 18:00 (America/Lima)

---

## 1. Identificación del Proyecto y Repositorio

- **Organización del repositorio:** Monorepo desacoplado con separación estricta de responsabilidades entre cliente (`frontend/`), servicio de dominio (`backend/`), base de datos relacional (`PostgreSQL`) y especificaciones/evidencias (`docs/`).
- **Historial de versiones y commits:** Estructura continua basada en la convención `VNN_Accion_Modulos` requerida por la cátedra:
  - `V01_Auditoria_Modulos_Front` a `V03_Auditoria_Actividades_Mensajes_Reportes`: Auditorías y ajustes de interfaz iniciales.
  - `V04_Alineacion_Paneles_Nucleo`: Integración y coherencia de datos reales en paneles.
  - `V05_Fase3_Nucleo_Experiencia`: Eliminación de métricas ficticias en Centro Familiar y Mi Camino ASHA.
  - `V06_Auditoria_Fase3`: Evidencia formal y reporte técnico de Fase 3.
  - `V07_Integracion_Reportes_PDF`: Exportación binaria de reportes clínicos autorizados en PDF.
  - `V08_Mensajes_Familia_Terapeuta`: Backend y contratos de mensajería privada bidireccional.
  - `V09_Auditoria_Mensajeria`: Auditoría técnica de mensajería con cursor y persistencia.
  - `V10_Integracion_Mensajeria`: Integración de mensajería con frontend.
  - `V11_Verificacion_Nucleo_Reportes_Mensajes`: Guion y verificación del núcleo conjunto.
  - `V12_Auditoria_Nucleo_Integrado`: Documentación y reporte técnico consolidado.
  - `V13_Integracion_Aceptacion_Nucleo`: Integración en `dev` del núcleo completo.
  - `V14_Aceptacion_Nucleo_Reportes_Mensajes`: Auditoría 08 y reproducción independiente en PostgreSQL 18.4 local.
  - `V15_Configuracion_Proxy_Autenticacion_Cookies`: Configuración de proxy inverso Same-Origin en Vite para compatibilidad con Brave Shields y cookies `SameSite=lax`.
  - `V16_Cierre_Extensiones_Fase6`: Formalización de decisiones y alcance de extensiones (ADR 0008).
  - `V17_Entrega_Academica_Rubrica_Hosting`: Consolidación del paquete de entrega académica y análisis de hosting.

---

## 2. Criterio: Arquitectura Implementada y Desarrollo Backend

### 2.1. Arquitectura del Sistema
La plataforma implementa una arquitectura cliente-servidor desacoplada de 3 capas físicas, orientada a microservicios REST con tipado estricto y transporte seguro de credenciales:

```
┌────────────────────────────────────────────────────────────────┐
│                   Cliente Web (Frontend)                       │
│    React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS           │
│    Rutas por rol, componentes desacoplados, cliente HTTP       │
└───────────────────────────────┬────────────────────────────────┘
                                │ Peticiones HTTP/REST (JSON)
                                │ Cookies HttpOnly (SameSite=lax)
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                Servidor de Aplicación (Backend)                │
│    FastAPI 0.115 + Python 3.13 + Pydantic v2 + Uvicorn         │
│    - Endpoints modulares (/api/v1/auth, /usuarios, etc.)       │
│    - Dependencias de seguridad (RBAC, sesión activa)           │
│    - Capa de servicios y lógica de dominio clínico             │
│    - SQLAlchemy 2.0 (ORM Asíncrono con AsyncSession)           │
└───────────────────────────────┬────────────────────────────────┘
                                │ Protocolo PostgreSQL asíncrono
                                │ Driver asyncpg con SSL
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                    Base de Datos Relacional                    │
│    PostgreSQL 17.6 / 18.4 (Instancia Local / Supabase)         │
│    - 26 tablas en esquema public                               │
│    - Restricciones de integridad referencial (FK, PK, Check)   │
│    - Transacciones ACID y persistencia de sesiones             │
└────────────────────────────────────────────────────────────────┘
```

### 2.2. Tecnologías Utilizadas
- **Lenguaje Backend:** Python 3.13 (aprovechando mejoras de rendimiento y tipado estático `typing`).
- **Framework Web:** FastAPI 0.115.x sobre servidor ASGI Uvicorn 0.34.x.
- **Validación y Serialización:** Pydantic v2 (esquemas fuertemente tipados con validadores custom).
- **Acceso a Datos:** SQLAlchemy 2.0 en modo totalmente asíncrono (`AsyncSession`, `select`, `update`).
- **Driver de BD:** `asyncpg` 0.30.x (driver nativo de alto rendimiento en C para PostgreSQL).
- **Generación Documental:** ReportLab 4.4.x para renderizado binario de PDFs vectoriales (`%PDF-`).
- **Pruebas Automatizadas:** Pytest 8.x + pytest-asyncio 0.25.x + httpx 0.28.x.

### 2.3. Estructura Modular del Backend
El código del servidor está organizado siguiendo el principio de separación de responsabilidades:

```
backend/app/
├── api/
│   ├── deps.py               # Inyección de dependencias (DB, token, usuario autenticado, roles)
│   └── v1/                   # Routers versionados de la API REST
│       ├── auth.py           # Login, logout y estado de sesión (/auth/login, /auth/me)
│       ├── citas.py          # Gestión y ciclo de vida de reservas de citas
│       ├── mensajeria.py     # Mensajes privados, conversaciones y contactos asignados
│       ├── pacientes.py      # CRUD de expedientes infantiles y tratamientos
│       ├── report_pdf.py     # Descarga de informe clínico estructurado en formato PDF
│       ├── sesiones.py       # Ejecución, cierre y 4 campos de reporte clínico
│       ├── tratamientos.py   # Asignación de tratamientos entre paciente y terapeuta
│       └── usuarios.py       # Administración de cuentas, activación/suspensión y roles
├── core/
│   ├── config.py             # Configuración centralizada vía Pydantic Settings y .env
│   ├── database.py           # Motor asíncrono (create_async_engine) y sesión (async_sessionmaker)
│   └── security.py           # Funciones criptográficas (hash bcrypt, generación de tokens)
├── models/                   # Definición de entidades ORM SQLAlchemy (26 tablas)
├── schemas/                  # Contratos Pydantic v2 de entrada y salida (DTOs)
└── services/                 # Lógica de negocio y consultas especializadas de dominio
```

### 2.4. Contratos de la API REST y Documentación OpenAPI
Todos los endpoints están documentados automáticamente mediante la especificación OpenAPI 3.0 interactiva:
- Documentación Swagger UI: `/docs`
- Documentación ReDoc: `/redoc`
- Esquema JSON canónico: `/api/v1/openapi.json`

---

## 3. Criterio: Integración con Base de Datos

### 3.1. Modelo Físico Implementado
La base de datos relacional PostgreSQL contiene **26 tablas públicas**, **178 columnas**, **221 restricciones** y **71 índices**, garantizando integridad referencial estricta:

```
┌──────────────────┐         1:1         ┌────────────────────────┐
│     usuarios     ├────────────────────►│    sesiones_usuario    │
│  (id_usuario PK) │                     │ (id_sesion_usuario PK) │
└────────┬─────────┘                     └────────────────────────┘
         │ 1:1
         ├───────────────────────────────┐
         ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│      tutores     │            │    terapeutas    │
│   (id_tutor PK)  │            │ (id_terapeuta PK)│
└────────┬─────────┘            └────────┬─────────┘
         │ 1:N                           │
         ▼                               │
┌──────────────────┐                     │
│    pacientes     │                     │
│  (id_paciente PK)│                     │
└────────┬─────────┘                     │
         │ 1:N                           │
         ▼                               │
┌──────────────────┐                     │
│   tratamientos   │◄────────────────────┘ (1:N)
│ (id_tratamiento) │  Asignación terapéutica
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│  reservas_citas  │ (Agenda clínica, modalidad presencial/virtual)
│  (id_reserva PK) │
└────────┬─────────┘
         │ 1:1
         ▼
┌──────────────────┐
│     sesiones     │ (Ciclo de atención: PROGRAMADA -> EN_CURSO -> FINALIZADA)
│  (id_sesion PK)  │
└────────┬─────────┘
         │ 1:1
         ▼
┌──────────────────┐
│ reportes_sesion  │ (observaciones_iniciales, objetivos_trabajados,
│ (id_reporte PK)  │  nivel_ayuda, proximos_pasos)
└──────────────────┘

┌──────────────────┐   1:N   ┌──────────────────┐
│  conversaciones  ├────────►│     mensajes     │
│(id_conversacion) │         │  (id_mensaje PK) │
│ [tutor+terapeuta]│         │  (texto_mensaje) │
└──────────────────┘         └──────────────────┘
```

### 3.2. Operaciones y Transacciones CRUD Verificadas
1. **Creación de usuario y autenticación:** Registro con contraseña protegida por algoritmo seguro (bcrypt), emisión de token opaco aleatorio con entropía criptográfica almacenado con hash y expiración en `sesiones_usuario`.
2. **Asignación Clínica:** Registro atómico en `tratamientos` asociando un paciente con su terapeuta titular.
3. **Agenda y Citas:** Reservas creadas en `reservas_citas` con validación de zona horaria (America/Lima) y modalidad (`PRESENCIAL` o `VIRTUAL`).
4. **Ciclo de Sesión y Reporte Clínico:**
   - La cita pasa a `sesiones` en estado `EN_CURSO`.
   - Al finalizar, el terapeuta registra en `reportes_sesion` los 4 campos clínicos oficiales: `observaciones_iniciales`, `objetivos_trabajados`, `nivel_ayuda` y `proximos_pasos`.
5. **Generación de Reporte PDF Binario:** El endpoint `GET /api/v1/sesiones/{id}/reporte/pdf` consulta los campos persistidos y genera dinámicamente un documento binario `%PDF-` con cabeceras `Content-Type: application/pdf` y `Content-Disposition: attachment`.
6. **Mensajería Privada:** Inserciones en `mensajes` con validación de participantes activos y paginación bidireccional por cursor (`next_before_id`).

### 3.3. Persistencia Real vs Mock
- Se verificó que todas las mutaciones persisten efectivamente en disco. Tras reiniciar el servidor FastAPI o cerrar e iniciar sesión con otro usuario, las reservas, reportes de sesión, asignaciones y mensajes continúan presentes de forma intacta.
- No existen tablas temporales ni arreglos en memoria para el almacenamiento de datos clínicos.

---

## 4. Criterio: Seguridad y Validación del Sistema

### 4.1. Mecanismos de Autenticación y Gestión de Sesiones
- **Cookies HttpOnly:** La sesión se transporta exclusivamente mediante cookies `HttpOnly; SameSite=lax; Path=/`, protegiendo el token contra ataques de inyección de scripts (XSS).
- **Invalidación en Base de Datos:** El logout (`POST /api/v1/auth/logout`) no es meramente visual; marca de inmediato la sesión como inactiva/revocada en la tabla `sesiones_usuario` e instruye al navegador a purgar la cookie (`Max-Age=0`).
- **Aislamiento Same-Origin en Frontend:** En el entorno local, se configuró un proxy inverso en Vite (`vite.config.ts`) que mapea `/api` a `http://127.0.0.1:8001`, garantizando que todas las solicitudes sean Same-Origin y evitando bloqueos de terceros en navegadores estrictos como Brave.

### 4.2. Control de Acceso Basado en Roles (RBAC)
El sistema implementa 3 roles semánticos con barreras estrictas a nivel de backend y frontend:

| Rol | Permisos Autorizados | Restricciones de Seguridad |
| :--- | :--- | :--- |
| **ADMIN** | Gestión total de usuarios, asignación de tratamientos, supervisión de citas, configuración global. | No puede leer mensajes privados entre familias y terapeutas sin ser participante. |
| **TERAPEUTA** | Ver citas propias, iniciar y cerrar sesiones, editar los 4 campos del reporte clínico, mensajería con familias asignadas. | No puede ver pacientes ni citas de otros terapeutas; no puede modificar roles de usuarios. |
| **PADRE** | Consultar expediente de sus propios hijos, reservar citas dentro de tratamientos autorizados, ver reportes y descargar PDF, mensajería con el terapeuta asignado. | No puede alterar estados de cita unilateralmente; no puede editar reportes clínicos (solo lectura); no accede a datos de otras familias. |

### 4.3. Validación de Entrada y Mitigación de Errores
- **Pydantic v2:** Valida tipos, longitudes mínimas y máximas, y formatos de fecha ISO-8601 en todas las entradas del cuerpo de peticiones JSON.
- **Manejo Centralizado de Excepciones:** Errores de validación devuelven `422 Unprocessable Entity` con mensajes normalizados en español. Intentos de acceso sin autenticación devuelven `401 Unauthorized`. Accesos cruzados a recursos ajenos devuelven `403 Forbidden` o `404 Not Found`.

### 4.4. Resultados de Pruebas Automatizadas

#### A. Pruebas Unitarias y de Integración Backend (Pytest)
Ejecutadas sobre base de datos PostgreSQL aislada de regresión (`ashakids_test_regress08`):
- **Total de pruebas ejecutadas:** 119 pruebas pasadas con éxito.
- **Fallos:** 0 fallos.
- **Omitidas:** 25 pruebas (suites heredadas deshabilitadas intencionalmente para evitar acoplamientos).
- **Advertencias:** 19 advertencias menores (deprecaciones de librerías de terceros).

#### B. Pruebas de Componentes Frontend (Vitest)
Ejecutadas con React Testing Library en entorno simulado:
- **Total de pruebas ejecutadas:** 232 pruebas pasadas con éxito.
- **Suites:** 12 archivos de prueba (mensajería, reportes PDF, coherencia de acceso, pantallas de los 3 roles).
- **Fallos:** 0 fallos.

#### C. Pruebas de Enrutamiento y Guardias (Node Test Runner)
- **Total de pruebas:** 25 pruebas pasadas (rutas públicas, rutas protegidas por rol, redirecciones de acceso denegado).
- **Fallos:** 0 fallos.

#### D. Verificación del Recorrido Integral HTTP (`verify_delivery_journey.py`)
- **Total de respuestas HTTP verificadas:** 92 casos consecutivos superados sobre `ashakids_test_accept07_hq` en PostgreSQL 18.4 local:
  - Creación, suspensión y reactivación de usuarios (ADMIN).
  - Creación de paciente y asignación de tratamiento terapéutico.
  - Creación de reserva de cita y confirmación.
  - Inicio de sesión clínica, cierre y guardado de los 4 campos del reporte.
  - Descarga y verificación de la estructura binaria del PDF (`%PDF-`).
  - Envío y recepción de mensajes privados con paginación por cursor.
  - Verificación de persistencia tras logout y nuevo login.

---

## 5. Resumen de Calidad y Cierre

| Criterio Evaluado | Estado | Evidencia Principal |
| :--- | :---: | :--- |
| **Repositorio y Commits** | **CUMPLIDO** | Monorepo limpio, commits con versiones `V01` a `V17` en rama `dev`. |
| **Arquitectura Backend** | **CUMPLIDO** | FastAPI + SQLAlchemy 2.0 async + Uvicorn; contratos OpenAPI documentados. |
| **Integración con BD** | **CUMPLIDO** | PostgreSQL con 26 tablas, integridad referencial y persistencia comprobada. |
| **Seguridad y Roles** | **CUMPLIDO** | Cookies HttpOnly SameSite=lax, RBAC con 3 roles y rechazo de accesos ajenos. |
| **Pruebas Funcionales** | **CUMPLIDO** | 376 pruebas automatizadas aprobadas (119 pytest + 232 vitest + 25 routing) + 92 casos HTTP. |

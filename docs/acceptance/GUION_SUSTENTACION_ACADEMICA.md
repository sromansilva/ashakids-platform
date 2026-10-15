# ASHAKids — Guion de Sustentación Académica y Demostración en Vivo

**Duración recomendada:** 8 a 10 minutos  
**Público objetivo:** Cátedra evaluadora y profesor del curso  
**Objetivo:** Demostrar el cumplimiento de los 3 criterios de la rúbrica (Arquitectura Backend, Integración con Base de Datos y Seguridad/Validación con Pruebas) mediante un recorrido en vivo por los tres roles de la plataforma, evidenciando persistencia real, descarga de reportes PDF y mensajería privada.

---

## 1. Preparación del Entorno (Antes de la Exposición)

1. **Asegurar servicios activos:**
   - Backend FastAPI en ejecución: `http://127.0.0.1:8001/` (o puerto configurado).
   - Frontend Vite en ejecución: `http://127.0.0.1:5174/` (o puerto configurado).
   - Base de datos PostgreSQL activa con datos de demostración sintéticos.
2. **Credenciales sintéticas de acceso:**
   - Contraseña común para todos los roles: `Auditoria-Sintetica-2026!`
   - **Administrador:** Código `a90001`
   - **Terapeuta:** Código `t90001`
   - **Padre de familia:** Código `p90001`
3. **Pestañas recomendadas en el navegador:**
   - Pestaña 1: `http://127.0.0.1:5174/login` (Plataforma ASHAKids).
   - Pestaña 2: `http://127.0.0.1:8001/docs` (Documentación Swagger interactiva de FastAPI).
   - Pestaña 3: Repositorio GitHub en la rama `dev`.

---

## 2. Estructura y Cronograma de la Sustentación

### Minuto 0:00 – 1:30 | Introducción y Arquitectura (Criterio 2)
- **Qué decir:**
  > "Buenas tardes, profesor. Presentamos ASHAKids, una plataforma de telerehabilitación e intervención infantil diseñada bajo una arquitectura desacoplada de 3 capas. El frontend está construido con React 19, TypeScript y Vite; el backend con FastAPI en Python 3.13 con SQLAlchemy asíncrono; y la capa de datos sobre PostgreSQL con 26 tablas relacionales normalizadas. No utilizamos servicios de autenticación de terceros como Supabase Auth: toda la seguridad, sesiones y lógica clínica están gobernadas por nuestra propia API REST con contratos OpenAPI."
- **Qué mostrar:**
  - Mostrar brevemente la pestaña de Swagger (`/docs`), destacando los routers modulares versionados (`/api/v1/auth`, `/citas`, `/sesiones`, `/mensajeria`, `/reportes`).

---

### Minuto 1:30 – 3:30 | Rol 1: Administrador (`a90001`) (Criterio 3 y 4)
- **Qué hacer:**
  1. En `http://127.0.0.1:5174/login`, ingresar:
     - Usuario: `a90001`
     - Contraseña: `Auditoria-Sintetica-2026!`
  2. Hacer clic en **Iniciar Sesión**. La aplicación redirige al panel `/admin`.
- **Qué decir:**
  > "Iniciamos sesión como Administrador. La autenticación emitió una cookie HttpOnly con SameSite=lax almacenada en PostgreSQL. Como administrador, tenemos la gobernanza del sistema: podemos auditar usuarios, suspender o reactivar cuentas, y realizar la asignación de tratamientos clínicos que conecta a los terapeutas con los pacientes."
- **Puntos clave a mostrar:**
  - Navegar a **Usuarios** (`/admin/usuarios`): Mostrar la lista real de cuentas y estados activos/inactivos.
  - Navegar a **Pacientes / Tratamientos** (`/admin/pacientes`): Mostrar que el paciente infantil está asignado al terapeuta `t90001`.
  - Cerrar sesión con el botón **Cerrar Sesión** en la barra lateral.
  > "Al cerrar sesión, la API no solo borra la cookie en el navegador, sino que revoca inmediatamente el token en la tabla `sesiones_usuario` de PostgreSQL."

---

### Minuto 3:30 – 6:00 | Rol 2: Terapeuta (`t90001`) (Criterio 2 y 3)
- **Qué hacer:**
  1. En `/login`, ingresar:
     - Usuario: `t90001`
     - Contraseña: `Auditoria-Sintetica-2026!`
  2. Entrar al panel `/terapeuta`.
- **Qué decir:**
  > "Ahora ingresamos con el rol TERAPEUTA. Observemos que el sistema aplica un estricto control de acceso basado en roles (RBAC): el terapeuta no puede acceder a las pantallas del administrador ni ver expedientes de pacientes que no tiene asignados."
- **Puntos clave a mostrar:**
  1. **Agenda y Sesiones:** Mostrar la cita clínica del paciente asignado.
  2. **Reporte Clínico en 4 Campos:** Abrir el detalle de la sesión clínica. Mostrar que el terapeuta puede registrar y guardar los 4 campos estructurados normados por el sistema:
     - *Observaciones iniciales*
     - *Objetivos trabajados*
     - *Nivel de ayuda requerido*
     - *Próximos pasos*
     Guardar el reporte y mostrar la confirmación del servidor.
  3. **Mensajería Interna:** Ir a `/terapeuta/mensajes`. Abrir la conversación con la familia asignada y enviar un mensaje breve (ej. *"Buenas tardes, el reporte de la sesión de hoy ya se encuentra disponible para su revisión."*).
  4. Cerrar sesión.

---

### Minuto 6:00 – 8:00 | Rol 3: Familia / Tutor (`p90001`) (Criterio 2, 3 y 4)
- **Qué hacer:**
  1. En `/login`, ingresar:
     - Usuario: `p90001`
     - Contraseña: `Auditoria-Sintetica-2026!`
  2. Entrar al portal de familia `/padre`.
- **Qué decir:**
  > "Ingresamos como PADRE de familia. Aquí la familia visualiza el progreso de su hijo, consulta sus citas y puede comunicarse directamente con el terapeuta asignado."
- **Puntos clave a mostrar:**
  1. **Consulta de Reportes:** Ir a **Reportes** (`/padre/reportes`). Mostrar que los 4 campos ingresados por el terapeuta aparecen disponibles en modo lectura (la familia no tiene permisos para mutar datos clínicos).
  2. **Descarga de Reporte PDF Binario:** Hacer clic en el botón de **Descargar Reporte PDF**.
     - Abrir el archivo descargado en el navegador o visor.
     - Mostrar la estructura profesional del documento: cabecera con logotipo de ASHAKids, datos del paciente, terapeuta responsable, fecha, y los 4 campos estructurados.
     > "Este documento es generado dinámicamente en el backend mediante ReportLab como un flujo binario vectorial con cabecera application/pdf."
  3. **Mensajería Privada:** Ir a `/padre/mensajes`. Mostrar que el mensaje enviado hace instantes por el terapeuta aparece en el hilo de conversación, y responder brevemente.
  4. Cerrar sesión.

---

### Minuto 8:00 – 9:30 | Demostración de Persistencia Real y Seguridad
- **Qué hacer:**
  1. En la pantalla de login, intentar ingresar credenciales inválidas (ej. `admin` y clave `1234`).
     - Mostrar el mensaje de error de la API: *"Credenciales incorrectas o cuenta inactiva."*
  2. Ingresar nuevamente con `p90001` y la contraseña correcta.
  3. Presionar **Ctrl + F5** (recarga forzada del navegador) en la sección de mensajes o reportes.
- **Qué decir:**
  > "Demostramos la persistencia real: tras forzar una recarga completa del navegador, la sesión se mantiene gracias a la verificación de la cookie HttpOnly en /auth/me, y los mensajes y reportes continúan intactos en PostgreSQL. No hay datos volátiles en memoria ni mocks."

---

### Minuto 9:30 – 10:00 | Resumen de Calidad y Cierre
- **Qué decir:**
  > "Para garantizar la robustez del sistema, contamos con 376 pruebas automatizadas aprobadas y 0 fallos:
  > - 119 pruebas unitarias y de integración en el backend con Pytest.
  > - 232 pruebas de componentes en el frontend con Vitest.
  > - 25 pruebas de enrutamiento y guardias de seguridad.
  > - Un recorrido de entrega integral de 92 casos HTTP ejecutado sobre una base de datos nueva.
  > Con esto demostramos cumplimiento cabal de la arquitectura backend, la integración relacional con PostgreSQL y la seguridad con pruebas automatizadas. Quedamos atentos a sus preguntas."

# ASHAKids — Reporte de Fase: Validación de Autenticación + CRUD Administrativo de Cuentas

**Fecha:** 07 de Octubre de 2026  
**Rama:** `feat/nlavadom`  
**Autor:** Antigravity / Pair Programming  
**Repositorio:** `sromansilva/ashakids-platform`

---

## 1. Resumen Ejecutivo

En esta fase se auditó y validó de extremo a extremo el sistema de autenticación de ASHAKids sobre la base de datos real en Supabase (PostgreSQL), y se implementó de forma completa, transaccional y auditada la **Gestión de Cuentas Administrativas** en `/admin/cuentas`.

Se cumplieron estrictamente todas las reglas arquitectónicas:
1. **React + Vite → FastAPI → PostgreSQL (Supabase)**: El frontend consume únicamente la API REST de FastAPI y nunca se conecta de forma directa a la base de datos ni a Supabase Auth.
2. **Tokens opacos con hash SHA-256**: Persistidos en la tabla `sesiones_autenticacion`, con transporte mediante cookie HttpOnly `ashakids_session` y sin exposición de tokens crudos en respuestas JSON.
3. **Contraseñas Argon2id**: Verificadas y hasheadas exclusivamente en el backend.
4. **CRUD Administrativo**: Listar, consultar, crear Padre/Tutor, crear Terapeuta, editar, suspender (con modal de confirmación), activar (con modal de confirmación) y eliminar con comprobación de dependencias clínicas (HTTP 409) y modal de confirmación.
5. **Auditoría centralizada**: Cada operación administrativa (`INSERT`, `UPDATE`, `DELETE`) queda registrada en la tabla existente `public.auditoria_cambios` vinculando al administrador actor autenticado (`id_usuario_actor`) sin registrar jamás secretos ni contraseñas.

---

## 2. Archivos Creados y Modificados

### Backend
* [**`backend/app/models/auditoria.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/models/auditoria.py) *(Nuevo)*: Modelo SQLAlchemy 2.x para la tabla `public.auditoria_cambios`.
* [**`backend/app/models/__init__.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/models/__init__.py) *(Modificado)*: Exportación del modelo `AuditoriaCambios`.
* [**`backend/app/schemas/admin.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/schemas/admin.py) *(Nuevo)*: Esquemas Pydantic `CrearPadreRequest`, `CrearTerapeutaRequest`, `ActualizarCuentaRequest`, `CuentaItemResponse`, `CuentaListResponse`, `OperacionCuentaResponse`.
* [**`backend/app/schemas/__init__.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/schemas/__init__.py) *(Modificado)*: Exportación de esquemas administrativos.
* [**`backend/app/services/admin_service.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/services/admin_service.py) *(Nuevo)*: Lógica de negocio transaccional: generador de códigos correlativos de 6 caracteres (`pXXXXX`, `tXXXXX`), funciones de listado con filtros, creación atómica, edición, suspensión lógica con revocación masiva de sesiones, activación, detección de relaciones clínicas antes de DELETE y sanitización de datos de auditoría.
* [**`backend/app/api/v1/admin.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/app/api/v1/admin.py) *(Modificado)*: Endpoints REST protegidos mediante dependencia `require_admin`.
* [**`backend/tests/test_admin_crud.py`**](file:///c:/Users/HailQueso/Desktop/ashakid/backend/tests/test_admin_crud.py) *(Nuevo)*: Suite automatizada de pruebas end-to-end con 6 casos exhaustivos.

### Frontend
* [**`frontend/src/types/auth.ts`**](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/types/auth.ts) *(Modificado)*: Interfaces TypeScript para cuentas, respuestas y payloads.
* [**`frontend/src/services/adminService.ts`**](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/services/adminService.ts) *(Modificado)*: Métodos `getCuentas`, `getCuenta`, `crearPadre`, `crearTerapeuta`, `actualizarCuenta`, `suspenderCuenta`, `activarCuenta`, `eliminarCuenta`.
* [**`frontend/src/pages/admin/AdminCuentas.tsx`**](file:///c:/Users/HailQueso/Desktop/ashakid/frontend/src/pages/admin/AdminCuentas.tsx) *(Modificado)*: Conexión con FastAPI reemplazando el mock en memoria, soporte para edición, suspensión con modal de confirmación, reactivación con modal de confirmación, eliminación con confirmación y manejo de errores 409.

### Herramientas y Colecciones
* [**`postman/ASHAKids_Collection.json`**](file:///c:/Users/HailQueso/Desktop/ashakid/postman/ASHAKids_Collection.json) *(Nuevo)*: Colección oficial de Postman con todas las operaciones, casos 200, 201, 401, 403, 404, 409 y 422.

---

## 3. Endpoints Implementados

| Método | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/me` | `ADMIN` | Consulta del perfil propio de administración. |
| `GET` | `/api/v1/admin/cuentas` | `ADMIN` | Listado de cuentas con filtros (`rol`, `search`, `activo`). |
| `GET` | `/api/v1/admin/cuentas/{id_usuario}` | `ADMIN` | Detalle completo de una cuenta y su perfil. |
| `POST` | `/api/v1/admin/cuentas/padres` | `ADMIN` | Creación atómica de Padre/Tutor (`pXXXXX`) y auditoría `INSERT`. |
| `POST` | `/api/v1/admin/cuentas/terapeutas` | `ADMIN` | Creación atómica de Terapeuta (`tXXXXX`) y auditoría `INSERT`. |
| `PATCH` | `/api/v1/admin/cuentas/{id_usuario}` | `ADMIN` | Edición de datos personales y perfil con auditoría `UPDATE`. |
| `PATCH` | `/api/v1/admin/cuentas/{id_usuario}/suspender` | `ADMIN` | Desactivación lógica (`activo=false`), revocación inmediata de sesiones activas y auditoría `UPDATE`. |
| `PATCH` | `/api/v1/admin/cuentas/{id_usuario}/activar` | `ADMIN` | Reactivación (`activo=true`) y auditoría `UPDATE`. |
| `DELETE` | `/api/v1/admin/cuentas/{id_usuario}` | `ADMIN` | Eliminación física si no hay dependencias. Retorna `409 Conflict` si existen datos clínicos relacionados. |

---

## 4. Detalle de Funcionamiento

### A. Editar Cuenta
* Acción visible en la fila de cada cuenta y en el modal de detalle.
* Permite modificar nombres, apellidos, correo y datos de perfil (`parentesco`, `telefono`, `direccion` en padres; `especialidad`, `anios_experiencia`, `idiomas`, `descripcion_profesional` en terapeutas).
* Si el correo es modificado, el backend verifica que no exista colisión con otro usuario (`HTTP 409`).
* La contraseña **no se expone ni se edita** en este formulario para preservar la seguridad de las credenciales.
* Registra en `auditoria_cambios` la acción `UPDATE` con un snapshot comparativo de los campos que cambiaron.

### B. Suspender Cuenta
* Solicita **confirmación explícita mediante un modal** antes de ejecutar la acción.
* Pasa `usuarios.activo = false`.
* Ejecuta un update transaccional en `sesiones_autenticacion`:
  ```sql
  UPDATE sesiones_autenticacion
  SET revocado = true, fecha_cierre = NOW()
  WHERE id_usuario = :id_usuario AND revocado = false;
  ```
* El usuario suspendido queda invalidado de inmediato en todas las llamadas posteriores (`HTTP 401`) e imposibilitado de iniciar nuevas sesiones.
* Registra en `auditoria_cambios`: `accion = 'UPDATE'`, `datos_anteriores = {'activo': true}`, `datos_nuevos = {'activo': false, 'sesiones_revocadas': N}`.

### C. Activar Cuenta
* Muestra dinámicamente el botón **"Activar"** cuando una cuenta está en estado suspendido.
* Solicita **confirmación mediante modal** para reactivar.
* Pasa `usuarios.activo = true`.
* **Seguridad:** Las sesiones antiguas previamente revocadas **no se reactivan**; el usuario debe autenticarse nuevamente con sus credenciales para generar una nueva sesión limpia.
* Registra en `auditoria_cambios`: `accion = 'UPDATE'`, `datos_anteriores = {'activo': false}`, `datos_nuevos = {'activo': true}`.

### D. Eliminar Cuenta (DELETE Físico Seguro)
* Requiere confirmación explícita en un modal de alerta destructiva.
* **Inspección de Dependencias:**
  1. Si es tutor: comprueba si tiene registros en `pacientes` o `conversaciones`.
  2. Si es terapeuta: comprueba si tiene registros en `tratamientos`, `reservas` o `conversaciones`.
  3. Comprueba si el usuario tiene `mensajes` emitidos en el sistema.
  * **Si existen dependencias:** Aborta la operación y responde `HTTP 409 Conflict` con un mensaje claro recomendando la suspensión en su lugar.
  * **Si NO existen dependencias:** Registra primero el evento en `auditoria_cambios` (`accion = 'DELETE'`, con los datos completos previos del usuario) y luego ejecuta el borrado físico en PostgreSQL.

### E. Protección de la Cuenta Administradora
* El backend valida que el administrador autenticado no pueda suspenderse ni eliminarse a sí mismo (`id_usuario == actor.id_usuario` → `HTTP 409 Conflict`).
* Valida que no se pueda suspender ni eliminar al último administrador activo del sistema, previniendo el bloqueo operativo de la plataforma.

### F. Generación de Códigos de Usuario (6 Caracteres)
* Estrategia: `p` + correlativo a 5 dígitos (`p00001`, `p00002`, ...) para Padres; `t` + correlativo a 5 dígitos (`t00001`, `t00002`, ...) para Terapeutas.
* Realiza una consulta sobre la base de datos real con verificación en bucle contra colisiones para garantizar unicidad y longitud exacta de 6 caracteres.

---

## 5. Auditoría (`AUDITORIA_CAMBIOS`)

Estructura de la tabla utilizada:
* `id_auditoria`: Clave primaria autoincremental.
* `id_usuario_actor`: ID del administrador que ejecutó la acción (obtenido estrictamente de la sesión autenticada en el servidor, nunca desde el frontend).
* `nombre_tabla`: `"usuarios"`.
* `nombre_entidad`: ID del usuario afectado.
* `accion`: `"INSERT"`, `"UPDATE"` o `"DELETE"`.
* `datos_anteriores`: JSONB con el estado previo (sanitizado).
* `datos_nuevos`: JSONB con el estado posterior (sanitizado).
* `fecha_evento`: Timestamp con zona horaria (`NOW()`).

**Filtro de seguridad:** La función `sanitize_dict` remueve preventivamente cualquier clave como `password`, `password_hash`, `token`, `token_hash`, `raw_token` o `cookie` antes de persistir la auditoría.

---

## 6. Resultados de Validación y Pruebas

1. **Pruebas Automatizadas Backend (`test_admin_crud.py`):**
   * `test_01_sin_sesion_retorna_401` → **OK**
   * `test_02_padre_y_terapeuta_reciben_403` → **OK**
   * `test_03_admin_lista_cuentas_sin_exponer_secretos` → **OK**
   * `test_04_ciclo_completo_padre_crud_y_auditoria` → **OK**
   * `test_05_crear_terapeuta_y_eliminar` → **OK**
   * `test_06_proteccion_propia_cuenta_admin` → **OK**
   * **Resultado:** 6 de 6 pruebas exitosas (100% verde) contra la base de datos real de Supabase.

2. **Compilación de Producción Frontend (`npm run build`):**
   * `vite build` finalizado en 10.71s sin errores de TypeScript ni de bundler.
   * `npm run test` (pruebas de rutas del frontend) finalizadas con 25 de 25 pruebas en verde.

3. **Colección de Postman:**
   * Archivo generado en [`postman/ASHAKids_Collection.json`](file:///c:/Users/HailQueso/Desktop/ashakid/postman/ASHAKids_Collection.json) con todas las solicitudes documentadas y parametrizadas.

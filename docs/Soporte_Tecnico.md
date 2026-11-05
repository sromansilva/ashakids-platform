# Soporte Técnico

## Alcance y permisos

`SOPORTE_TECNICO` es un cuarto rol independiente. Usa la autenticación por contraseña y la cookie de sesión existente. Tras iniciar sesión entra en `/soporte`; su módulo no reutiliza pantallas de Administración.

Puede listar y filtrar incidencias técnicas por texto, estado y prioridad, navegar por páginas, consultar el detalle, registrar incidencias, responder, agregar notas internas y actualizar el estado hasta solucionarlas. Los estados son `RECIBIDA`, `LEÍDA`, `EN PROCESO` y `SOLUCIONADA`; se normalizan los nombres heredados al leerlos. La clasificación y la prioridad reutilizan el flujo de incidencias existente.

Solo ve registros con `area_destino = SOPORTE_TECNICO`. La API proyecta ticket, tipo, descripción, rol solicitante, prioridad, estado y fechas. No devuelve datos de contacto, identificadores de pacientes, terapeutas, expedientes o datos de cuenta del solicitante. El texto de una incidencia puede contener información escrita por quien la reporta: la interfaz pide no incluir datos clínicos, contraseñas ni información personal innecesaria.

Las respuestas son visibles en el detalle de la incidencia del solicitante, usando los permisos existentes. Las notas internas solo se consultan desde el módulo de soporte. El autor de cada nota se conserva mediante una clave foránea para trazabilidad, sin exponer su identificador en el hilo.

El backend deniega con `403` el acceso de soporte a Administración, cuentas, módulos clínicos y APIs heredadas. El frontend bloquea las URLs de los otros roles. Una asignación accidental de soporte junto a otro rol conserva las restricciones de soporte. Los roles `ADMIN`, `TERAPEUTA` y `PADRE` mantienen sus paneles y perfiles.

## Crear una cuenta de prueba

Hazlo en una base aislada de desarrollo o pruebas con el código de esta rama y sus migraciones aplicadas; no uses la base de producción para fixtures.

1. Inicia sesión como administrador.
2. Abre `/admin/cuentas`, selecciona **Soporte Técnico** y pulsa **Nueva cuenta**.
3. Introduce nombres, apellidos y un correo de pruebas controlado por el equipo.
4. Se genera un código `sNNNNN`. El flujo existente envía un enlace de activación válido durante dos horas; la persona define su propia contraseña.
5. Inicia sesión con ese código. El destino es `/soporte`.

La creación también está disponible en `POST /api/v1/admin/cuentas/soporte`, con JSON `{ "nombres": "Agente", "apellidos": "Prueba", "email": "soporte@example.invalid" }` y sesión administrativa. No acepta asignar privilegios adicionales ni crea perfiles de tutor o terapeuta. La gestión de suspensión y activación reutiliza Administración; una cuenta suspendida pierde el acceso con sus sesiones existentes.

Si Gmail no está configurado, la cuenta se conserva pendiente y Administración ve que el correo no se envió. No se entrega una contraseña compartida ni se muestra un token en la API. Configura el envío para completar la activación. Las pruebas en memoria simulan el correo y prueban el endpoint real de activación, sin enviar mensajes.

## Persistencia y API

- `backend/src/modules/soporte/soporte.migration.ts` amplía `roles.nombre_rol` e incorpora el cuarto rol sin duplicarlo.
- La migración existente de incidencias amplía `rol_solicitante` y crea `incidencia_notas` con claves foráneas e índice. Ambas migraciones son transaccionales e idempotentes.
- El bootstrap aplica las migraciones antes de aceptar solicitudes en el modo habitual. En modo de solo lectura no aplica ninguna.
- No se ejecutaron migraciones en la base desplegada durante esta implementación.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET / POST | `/api/v1/soporte/incidencias` | Listar con filtros / registrar |
| GET | `/api/v1/soporte/incidencias/:id` | Consultar incidencia técnica |
| PATCH | `/api/v1/soporte/incidencias/:id/estado` | Actualizar `{ estado }` |
| GET / POST | `/api/v1/soporte/incidencias/:id/notas` | Consultar / guardar `{ contenido, interna }` |
| GET | `/api/v1/incidencias/:id/notas` | Respuestas públicas para participantes autorizados |

El registro admite `envio_id` UUID para reintentos idempotentes. Un identificador de envío ajeno no permite sobrescribir ni obtener la incidencia de otra cuenta. Los errores de persistencia del módulo de soporte se propagan; no se confirman tickets ficticios.

## Windows y base desplegada de producción

El archivo local `backend/.env` permanece fuera de Git. Mantén **`DEVELOPMENT_READ_ONLY=true`** mientras apunte a producción. Este modo configura `default_transaction_read_only=on` en cada conexión PostgreSQL, omite migraciones, semillas y recordatorios y rechaza las escrituras HTTP con `503`, incluido el login, que necesita persistir una sesión. Por eso no se puede crear ni probar una cuenta nueva contra esa conexión de producción en este modo.

Desde PowerShell, usa `npm.cmd` si la política de ejecución bloquea `npm.ps1`:

```powershell
# Terminal 1, desde la raíz. Selecciona explícitamente el archivo del repositorio.
$env:ASHAKIDS_ENV_FILE = (Resolve-Path backend/.env).Path
npm.cmd run dev:backend

# Terminal 2, desde la raíz.
npm.cmd run dev:frontend

# Lectura: comprobaciones de salud.
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
Invoke-RestMethod http://127.0.0.1:8000/health/ready
```

Frontend: `http://127.0.0.1:5174`. Backend: `http://127.0.0.1:8000`. No hace falta iniciar contenedores locales para esta configuración. ML queda fuera de esta entrega por indicación del usuario.

### Pruebas locales con escrituras autorizadas en producción

Solo si el responsable autoriza expresamente guardar datos reales, configura el `.env` local con:

```dotenv
DEVELOPMENT_READ_ONLY=false
DEVELOPMENT_SKIP_BOOTSTRAP=true
```

Reinicia el backend con `npm.cmd run dev:backend`. El login y las acciones del panel quedarán habilitados contra la base configurada. Las incidencias, respuestas y cambios de estado serán reales y persistentes. `DEVELOPMENT_SKIP_BOOTSTRAP=true` comprueba la conexión, pero evita ejecutar migraciones, semillas de demostración y recordatorios automáticos. El esquema debe estar preparado antes; las migraciones no se aplican con esta opción. No publiques el `.env` ni contraseñas.

En el arranque habitual, las migraciones se ejecutan secuencialmente para evitar bloqueos entre cambios sobre las mismas tablas. La inicialización de demostración conserva la numeración más alta de tickets existente y nunca reinicia el contador a 30.

## Pruebas seguras y reproducibles

```powershell
npm.cmd --prefix backend run test:auth-soporte
npm.cmd --prefix backend run test:soporte
npm.cmd --prefix backend run test:startup
npm.cmd --prefix frontend run test:routing
npm.cmd --prefix frontend run test:components
npm.cmd --prefix frontend run check:frontend
npm.cmd run typecheck
npm.cmd run build

# Con Vite activo. Usa Edge en Windows; PLAYWRIGHT_CHANNEL permite otro navegador instalado.
npm.cmd --prefix frontend run qa:soporte
```

Las pruebas HTTP de soporte usan PostgreSQL en memoria (`@electric-sql/pglite`), cargan el esquema real del repositorio sin datos de demostración y prueban consultas y migraciones reales. Interceptan el pool antes de cualquier conexión: no usan la base desplegada. Cubren activación, Argon2, sesiones, 403 administrativos y clínicos, roles actuales, cuentas suspendidas, revocación, persistencia, filtros, notas internas, resolución e idempotencia. La protección de solo lectura tiene su propia prueba.

La prueba de navegador intercepta todas las APIs con fixtures, verifica login y el flujo principal en 1440, 768 y 390 px, bloqueo directo de Administración y alta administrativa de soporte. No representa una validación del correo real ni del despliegue. Sus capturas quedan en `tmp/support-ui/`, fuera de Git.

Las suites históricas de integración y E2E con PostgreSQL externo siguen requiriendo una base local aislada explícita. No deben ejecutarse contra producción. La validación del nuevo rol en PostgreSQL servidor y el envío real de activación corresponden a un entorno de pruebas antes de publicar.

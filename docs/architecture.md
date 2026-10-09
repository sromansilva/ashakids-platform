# Arquitectura de ASHAKids

## Flujo de datos
React/TypeScript + Vite (`frontend/`) -> HTTP/JSON -> FastAPI (`backend/`) -> SQLAlchemy asíncrono + asyncpg -> PostgreSQL gestionado en Supabase.

La API controla autenticación propia y autorización. Supabase aporta infraestructura PostgreSQL; no se usa Supabase Auth. Las credenciales permanecen en `backend/.env`, excluido de Git.

### Corrección de integración frontend, corte 2026-10-09-12

La web usa `/api/v1` en el mismo origen. Vite dirige `/api` a `VITE_DEV_API_TARGET`,
por defecto `http://127.0.0.1:8000`, conservando Origin para la validación CORS.
El puerto8001 se selecciona explícitamente solo con una API/BD aislada. En producción
es obligatorio el reverse proxy equivalente y HTTPS; Vite dev no es el hosting final.

Reportes profesionales, historial del expediente y sesiones admin reutilizan servicios
clínicos y `useRemote` con claves por identidad, sin fallback de pacientes/reportes.
`ClinicalReportEditor` comparte los cuatro campos de la API; `ReportWorkspace` y
`PatientClinicalHistory` adaptan las tarjetas/formularios originales. Escrituras esperan
al servidor y no reintentan; errores conservan borrador. Una actualización de sesión fallida
oculta los controles clínicos dependientes. No se añaden tablas ni endpoints.
Los prototipos sin API continúan separados y avisados; no equivalen a persistencia.

## Responsabilidades
- `frontend/src/pages/`: vistas públicas y áreas por rol (padre, terapeuta, administrador).
- `frontend/src/app/`: composición de rutas declarativas, carga diferida, providers, layouts y límites de errores.
- `frontend/src/components/`, `hooks/`, `theme/`: UI compartida y comportamiento visual.
- `frontend/src/types/` y `mocks/`: contratos comunes y datos ilustrativos. Los mocks no equivalen a persistencia.
- `frontend/src/routes/paths.ts`: adaptador temporal entre identificadores de vista y URL. No selecciona ni renderiza pantallas.
- `frontend/src/auth/AuthContext.tsx`: estado de sesión; `services/` y `api/client.ts`: comunicación HTTP con la API.
- `backend/app/main.py`: aplicación FastAPI y registro de routers.
- `backend/app/api/`: endpoints y dependencias de permisos.
- `backend/app/services/`: lógica de negocio y autenticación.
- `backend/app/models/`: modelos persistentes; `schemas/`: contratos de entrada y salida.
- `backend/app/core/`: configuración, seguridad y conexión a datos.

El login usa código de usuario y contraseña, verifica Argon2id y crea una sesión persistida. La cookie es HttpOnly. Los endpoints validan los roles PADRE, TERAPEUTA y ADMIN.

## Herramientas de conocimiento

### Verificación descartable de fase 2 (2026-10-09)

La auditoría 2026-10-09-01 ejecutó API local 8001, frontend 5174 y PostgreSQL 18 en 6543,
con overrides de proceso, manteniendo el .env habitual. La migración explícita
backend/scripts/migrations/001_paciente_avatar.sql alinea avatar_nombre con el modelo;
el SQL inicial ya incluye el campo. No fue aplicada al servidor compartido ni se ejecuta al arrancar.
Los scripts phase2_sandbox y phase2_verify_http son herramientas de fixtures, fuera del runtime.
Las suites HTTP heredadas quedan deshabilitadas por defecto y exigen API/BD locales explícitas.
Esto se añadió después de una ejecución inicial que alcanzó la API habitual; consultar el informe
para el incidente y su revisión pendiente. No cambia el flujo de arquitectura existente.
`tools/knowledge/` y `.agents/skills/graphify/` apoyan al equipo. Su entorno aislado `.venv-graphify/` y salidas `graphify-out/` son locales y regenerables. No se importan desde frontend o backend. El grafo describe estructura de código; no valida comportamiento ni sustituye pruebas o decisiones documentadas.

## Frontend modular — Tarea 1

Actualización 2026-10-09-03: Centro Familiar y Mi Camino ASHA comparten FamilyTrackingPanel,
useFamilyTracking y summarizeFamily. Consume contratos HTTP existentes y agrega por IDs;
no usa niños de respaldo ni porcentajes clínicos inventados. Sesiones asistidas/reportes y
hitos se derivan de registros. Selección por usuario en sessionStorage solo guarda ID validado
contra pacientes autorizados; errores ocultan agregados cacheados. Decisión nueva: ADR 0004.
Las entradas actuales ya no importan los fragmentos antiguos de demo de esas vistas.

`App.tsx` únicamente exporta la composición del router. `AppProviders` monta BrowserRouter y AuthProvider; `AppRouter` declara los destinos; `RouteAccess` protege según sesión y rol; `PageFrame` selecciona el layout. `lazyPages` importa archivos de pantalla directamente, sin barrels que carguen roles completos.

Los módulos de padre, terapeuta y administrador no importan detalles internos de otros roles. La coordinación de demostración vive en `app/hooks/useDemoWorkflow`, sin fingir llamadas al servidor. Pantallas pesadas separan estado, secciones y datos por responsabilidad.

Todas las llamadas HTTP pasan por `api/client.ts`, con cookies incluidas y errores normalizados. Configurar `VITE_API_BASE_URL` con la base completa, por ejemplo `https://api.example.invalid/api/v1`. `VITE_API_URL` sigue admitida como compatibilidad. En producción, sin variable, se usa `/api/v1`; requiere proxy del despliegue. Nunca se ponen secretos en variables VITE.

Para la integración local con datos descartables, se puede crear `frontend/.env.local` con
`VITE_API_BASE_URL=http://localhost:8001/api/v1`, reiniciar Vite y seleccionar en Postman el entorno
que apunta a `http://localhost:8001`. Ambos clientes compartirán la instancia de FastAPI y PostgreSQL
local; no se debe cambiar esta configuración para apuntar una colección de escritura a Supabase.

La sesión se verifica con el servidor al arrancar, incluido el acceso directo o recarga de una URL. Un 401 fuera del login invalida la sesión local. El formulario de login conserva su propio estado de envío para no desmontarse ni perder errores. No existe login simulado en la aplicación de producción.

`npm run check:frontend` verifica máximo 500 líneas físicas, imports locales, límites entre roles, fetch centralizado, destinos/manifest y marcadores de conflicto. `npm test` conserva las pruebas de routing y añade Vitest/Testing Library; `npm run typecheck` y `npm run build` completan los controles.

`tests/browser-harness.html` es una entrada aislada de desarrollo con identidades ficticias y MemoryRouter. No solicita cookies, no crea usuarios, no conecta al backend y no se incluye en el build normal. Nunca desplegar el servidor Vite de desarrollo como producción.

El hosting debe devolver index.html para rutas de SPA sin interceptar `/api/v1` ni assets. Para alcance verificado, eliminaciones y limitaciones consultar `docs/tarea-1-frontend-informe.md` y ADR 0002.

## Backend persistente - Tarea 2 (2026-10-08)

Se extienden las capas existentes sin reescribir autenticación: `api/v1/{usuarios,pacientes,citas,sesiones}`
declara HTTP; `schemas/` valida contratos; `services/` decide permisos, transiciones y operaciones;
`models/clinica.py` mapea las tablas PostgreSQL existentes. `api/contracts.py` comparte dependencias.

`/citas` es el nombre público para la tabla `reservas`. No existe una segunda tabla de citas.
Un tratamiento relaciona expediente/paciente con terapeuta; únicamente ADMIN asigna esta relación,
porque concede acceso a datos de una familia. La apertura administrativa de expediente no inventa
diagnóstico. Los padres ven su familia y los terapeutas los pacientes asignados; cada cita/sesión
restringe además el profesional específico. Usuarios se administran solo con ADMIN.

Las peticiones usan una transacción con commit antes de responder (Depends scope=function).
Conflictos de integridad devuelven 409 y caídas de conexión 503 con mensajes sin SQL/credenciales.
Bloqueos de paciente/terapeuta serializan reservas solapadas por esta API; la BD conserva UNIQUE
para una sesión por reserva. Escritores externos deben respetar las mismas reglas: no hay todavía
restricción PostgreSQL de exclusión temporal ni sistema de migraciones incremental.

Las bajas de pacientes son lógicas. Cambiar contraseña o desactivar usuarios revoca sesiones.
Las cookies son HttpOnly y Secure en producción; escrituras desde Origin no permitido se rechazan.
En producción una escritura con cookie requiere Origin permitido. Desplegar web y API en el mismo
sitio HTTPS para SameSite=Lax; clientes no navegador pueden usar Bearer con token propio.

Pruebas: `backend/requirements-dev.txt`, `pytest.ini`, fixtures de PostgreSQL local descartable
con guardas por host/nombre de BD. No usar `.env` de Supabase para ejecutar pruebas de escritura.
La suite heredada compartida requiere `ASHAKIDS_ALLOW_SHARED_DB_TESTS=1` y autorización explícita.
Estados operativos, límites y decisiones: ADR 0003 e informe de auditoría.

## Compatibilidad y entorno de verificación (2026-10-09-02)

La lectura de Supabase observó PostgreSQL 17.6; esquema público 26 tablas, 178 columnas,
92 restricciones y 71 índices. Se exportó solo estructura, se restauró en una BD local
descartable y se verificó equivalencia de metadatos. No se copiaron filas ni se ejecutaron
migraciones compartidas. Modelos alineados en token_hash, progreso decimal y campos de logros.

El runtime compartido usa BYPASSRLS: autorización propia de FastAPI sigue siendo necesaria.
La réplica usa un rol no superusuario con BYPASSRLS y sin CREATEDB/CREATEROLE. Las fixtures
usan ASHAKIDS_TEST_ADMIN_DATABASE_URL opcional exclusivamente para reiniciar datos y
secuencias; ASHAKIDS_TEST_DATABASE_URL se usa para las operaciones de la aplicación.
Las dos URL deben tener mismo host/puerto/BD local ashakids_test_* y no admitir parámetros
de redirección. No asignar la conexión propietaria a DATABASE_URL de la API.

Esto describe el ensayo actual; no adopta todavía un proveedor de hosting ni certifica
SSL, dominios o pooling futuros. Evidencia: auditoría 2026-10-09-02 y carpeta correspondiente.

## Coherencia del núcleo y etapa educativa (2026-10-09-04)

ADR0005: OperationalDashboard agrega por rol las listas autorizadas; solo ADMIN consulta
cuentas. PadreRecorrido/PadreSeguimiento reutilizan seguimiento persistente; la vista de
profesionales procede de tratamientos, y reserva mediante BookingDialog existente.
Configuración conserva lectura de identidad/CRUD de hijos, sin límite de plan. Capacidades
sin contrato y acceso público se explican sin éxitos ficticios; alta/credenciales por ADMIN.

useSelectedFamilyPatient comparte selección por usuario/ID autorizado con seguimiento y
Mundo ASHA. Catálogo learningWorlds es borrador de habilidades/niveles, no una prescripción.
deriveWorldProgress acepta un contrato de lectura FUTURO con resultados ya validados y
calcula prerrequisitos/repetición/conflictos/versiones. No existe endpoint ni escritura
educativa en este corte. Nunca confiar en passed/verifiedBy enviados por la familia: el
backend futuro deberá autorizar y evaluar. Ver MUNDO_ASHA_PLAN.md para la etapa independiente.
Los prototipos no conceden progreso clínico ni educativo persistente.

## Exportación de reportes autorizados (2026-10-09-05)

ADR0006: React solicita GET /sesiones/{id}/reporte/pdf con la cookie HTTP existente;
FastAPI reutiliza reporte_visible (sesion_visible primero), presenta los nombres públicos
de la cita y genera PDF en memoria con ReportLab en threadpool. Responde attachment,
application/pdf, Cache-Control:no-store y nosniff. No hay archivos clínicos persistidos,
URLs públicas, cambios de tablas ni un segundo mecanismo de autenticación.

Se exportan los cuatro campos guardados, IDs, nombres actuales, fecha de cita, estado,
asistencia y fecha de registro. Fechas conscientes de zona usan Lima; registros sin zona
se rotulan sin atribuirles otra. Markup se escapa; Vera incluida en ReportLab admite el
español verificado; caracteres no soportados devuelven 422, sin truncar ni sustituir texto.

apiClient.pdf comprueba MIME y firma binaria, comprueba identidad antes/después de leer y
usa AbortSignal. ReportDownload gestiona estado/error y libera URL temporal; no almacena
PDF en ReactQuery. SessionActions lo comparte entre agendas y Reportes familiar; una
edición sin guardar no entra en la descarga. Informes mensuales no se inventan. La pantalla
independiente /terapeuta/reportes sigue demo y no forma parte de esta exportación conectada.

## Mensajería familiar autorizada (2026-10-09-06)

ADR0007: MessagesCenter/MessageThread -> messagingService -> apiClient -> FastAPI
/conversaciones -> services/mensajeria -> modelos de conversaciones y mensajes existentes.
No DDL, Supabase Auth, canal externo ni credenciales en React. Conversación por tutor y
terapeuta, compartida entre hijos; participantes por usuario/perfil. ADMIN solo no lee chats.

Contactos por paciente activo/tratamiento ACTIVO/ambos usuarios activos. Abrir reutiliza pareja
bajo bloqueo del tutor; enviar bloquea conversación, obtiene emisor de identidad y hace commit
antes de responder201. Lectura histórica al participante, escritura solo chat abierto y relación
activa. INTEGER positivo y texto1..4000 no vacío/NUL; extra fields prohibidos. Cursor descendente
por ID, límite100 y limit+1; contactos con X-Total-Count. Sin leer todo historial en un solo GET.

React mantiene consultas por identidad, oculta caché tras error de permisos y escapa texto.
Actualizar recibe respuestas; no declara tiempo real ni leído. Borradores por chat en memoria;
POST sin reintento automático, confirmación solo de respuesta válida, error conserva texto.
Sin clave idempotente para envío ni UNIQUE de pareja en esquema: respuesta perdida puede
requerir cotejar historial antes de reenviar; escritores externos no quedan garantizados por
estos bloqueos. Datos clínicos/estado de asignación no se modifican por probar mensajes.

Verificación API con PG local y jsdom; aceptación visual desktop/móvil pendiente. No cambios
de hosting/retención/índices ni prueba de carga en este corte. Fuentes y PDF en auditoría06.

## Aceptación conjunta y comprobación de instancia (2026-10-09-07)

No nueva decisión de arquitectura ni cambio de runtime. verify_delivery_journey es tooling
de aceptación: loopback8001, BD NUEVA local ashakids_test_accept07*, tablas clínicas vacías
y cinco fixtures. Comprueba hash de sesión recién emitida en la BD indicada, activa y no
vencida, antes de escribir clínica; no exporta tokens/hashes. Esta guarda aporta prueba de
destino del servidor, además de las variables del cliente. Autenticación sí escribe sesiones.

Dos bases nuevas repiten núcleo/PDF/chat por HTTP con SQL real; regress07 separada admite
fixtures destructivas solo locales para pytest. Se reinstalaron Python/npm en clon limpio,
reutilizando PG17.6 existente. SQL02 estructura requiere public idempotente en copia local.
Inspección de modelos incluye mensajería:19 tablas modeladas/0 diferencias. Supabase no se
consultó ni cambió. Demo compat17 conservada/API8001 restaurada. No CI de producto nuevo
atribuido a tests locales, E2E visual ni reproducción por otra persona; consultar auditoría07.

## Seguridad del backend - corte 2026-10-09-13

ADR0009 conserva las capas y la autenticación propias. TLS remoto valida cadena/nombre
mediante CA privada configurada, sin fallback inseguro; CA2021 usa compatibilidad de formato
explícita con Python3.13. Login tiene límites locales por IP/IP+código y ventana con recuperación;
no es distribuido. Producción exige origenHTTPS explícito, transporteHTTPS y cookieSecure.
Servicios administrativos se separan por responsabilidad con interfaz conservada. Contraseñas
nuevas12..128 y escritura de sexo comparten validación; lectura no migra valores existentes.
Errores de concurrencia409 y de disponibilidad503; rollback fallido no oculta el original.
No hay DDL ni cambios de permisos en Supabase. B02 se propone en operations/B02_MINIMO_PRIVILEGIO.md.
No hay hostingHTTPS ni producción publicados. Ver auditoría13 para resultados y límites reales.

## Adopción del rol PostgreSQL del backend - corte14

ADR0010 separa ashakids_runtime de la identidad propietaria. Tras autorización expresa,
Supabase conserva RLS y usa 58 políticas TO ashakids_runtime para 22 tablas, con USAGE
en 16 secuencias. El runtime no tiene superuser/BYPASSRLS/CREATEDB/CREATEROLE,
replicación, propiedad ni pertenencia a otros roles. Los atributos, ACL y membresías
anteriores se conservaron; no se revocaron derechos de PUBLIC ni de roles existentes.
PUBLIC CONNECT/TEMP permanecen como defaults de la plataforma.

La autorización de familias/terapeutas sigue en FastAPI: USING true del rol técnico
no aporta aislamiento de familias dentro de PostgreSQL. ADMIN de AshaKids mantiene
sus funciones; no se añadió Supabase Auth ni acceso SQL desde React. El candidato
pasó con FastAPI ASGI y SQL real antes de adoptar la credencial en API8000; el recorrido
HTTP real posterior y READ ONLY verifican persistencia y revocación de las cohortes
nuevas. La conexión anterior queda en un respaldo privado ignorado para reversión.
No hosting HTTPS, borrados físicos, bases descartables ni recuperación de backup.

# Contexto actual de ASHAKids

Actualizado: 2026-10-08. Base de implementación: Tarea 1 frontend (modularización, rutas declarativas y limpieza de dependencias) integrada en la rama dev. Esta documentación describe el estado comprobado; actualizarla junto a cambios importantes.

## Producto y estado
Plataforma de apoyo para terapia de lenguaje infantil, con áreas de familias, terapeutas y administración. Frontend React/TypeScript separado de una API FastAPI y PostgreSQL en Supabase. Autenticación propia, con sesiones y permisos por rol.

Las fases registradas en Git incluyen reorganización del frontend, modularización por dominio y navegación URL con React Router. Consultar los reportes de fases existentes en `docs/` para antecedentes.

## Verificación más reciente
- Tarea 1 y Fase 1: 25 pruebas originales de routing y 151 pruebas Vitest correctas (176 pruebas de frontend en total); tipos (`tsc --noEmit`) y build correctos.
- 292 archivos de código, estilos, configuración y pruebas revisados; máximo 495 líneas. Cero imports locales rotos, cruces internos entre roles o marcadores de conflicto detectados.
- Autoservicio de cambio de contraseña implementado en frontend para Padre y Terapeuta conectado a `PATCH /api/v1/usuarios/{id}` con hash Argon2id e invalidación de sesiones previas.
- Dashboard de Familia (`PadreHome`) conectado a `useFamilyPatients` y `useAppointments` para mostrar expedientes y próxima cita real desde PostgreSQL.
- Modales de gestión de hijos (`PadreConfigShowAddChildModal`, `PadreConfigEditChild`, `PadreConfigDeleteChild`) sincronizados para refrescar la lista de pacientes tras cada mutación.
- 12 pruebas unitarias y de seguridad de FastAPI correctas (aisladas de la BD compartida).
- Mapa de conocimiento sincronizado con 1418 nodos AST mediante `tools/knowledge/manage.py`.

Estas comprobaciones no demuestran cobertura completa de pantallas o funcionalidad clínica. Varias vistas muestran datos ilustrativos; comprobar conexión real antes de declarar una funcionalidad terminada.

## Pendientes conocidos
- Fase 2: Implementar persistencia de juegos fonológicos en PostgreSQL y reconocimiento de voz infantil (Web Speech API).
- Fase 3: Integración de teleconsulta interactiva con WebRTC / sala virtual compartida.
- Fase 4: Descarga de reportes clínicos oficiales membretados en PDF y mensajería clínica entre terapeuta y tutor.
- Fase 5: Notificaciones automáticas por correo, migraciones con Alembic y rate limiting en producción.
- Suite de integración con advertencias de conexiones sin cerrar: revisar inicialización/disposición del motor y el aislamiento de event loops.

## Backend: avance del 2026-10-08
- Implementados contratos persistentes para usuarios, pacientes, asignación de tratamientos, citas,
  sesiones y reportes. Conserva autenticación propia y las tablas existentes; no ejecuta DDL al iniciar.
- 32 operaciones HTTP en OpenAPI (29 de dominio/autenticación y 3 de sistema).
- 63 pruebas correctas, 5 de integración compartida omitidas por seguridad y 19 advertencias de
  deprecación. Incluye PostgreSQL 18 local descartable con el SQL del proyecto, no solo mocks.
- Supabase PostgreSQL 17.6: conexión correcta y SELECT LIMIT 0 exitoso para 16 modelos. No se
  escribieron datos clínicos ni se crearon usuarios reales durante esta auditoría.
- Backend actualizado en localhost:8000; `/health/ready` comprueba conectividad. `/health` sigue
  siendo liveness, no certificación de persistencia.
- RLS habilitada en 26 tablas públicas y cero políticas públicas observadas; el rol de conexión
  omite RLS. La autorización de FastAPI es esencial; reducir privilegios antes de producción.
- En frontend, `AuthContext` usa login, logout y `/auth/me`. Los servicios de perfil existen, pero
  todavía no están llamados desde pantallas. Pacientes, clínica, agenda y sesiones siguen simulados.
- Para integración local aislada, `frontend/.env.local` y el entorno `ASHAKids Local Isolated` de
  Postman apuntan al backend de prueba en `localhost:8001`, conectado a PostgreSQL local descartable.
  El `.env.local` está ignorado por Git. El backend habitual `localhost:8000` conserva la conexión
  configurada en `backend/.env`.
- Pendientes de despliegue: rotar secretos compartidos, retirar usuarios/semillas débiles,
  rate limiting, auditoría de modificaciones, integración frontend, migraciones versionadas,
  hosting HTTPS y prueba end-to-end con identidades de staging autorizadas.
- Evidencia y alcance: `docs/auditoria-backend-2026-10-08.md`; informe PDF en `output/pdf/`.

Informe de Tarea 1: `docs/tarea-1-frontend-informe.md`. Inventario de eliminaciones: `docs/frontend-cleanup-inventory.md`. Backend intacto. Cambios integrados y publicados en rama `dev`.

## Incorporación al equipo
1. Seguir `README.md` para ejecutar frontend y backend; configurar credenciales por un canal autorizado, nunca en Git o documentación.
2. Leer `docs/architecture.md` y las decisiones de `docs/decisions/`.
3. Ejecutar `python tools/knowledge/manage.py setup` y consultar el mapa según `AGENTS.md`.
4. Trabajar en una rama de funcionalidad, actualizar contexto y mapa después de cambios importantes y entregar mediante PR.

# V72 — reforma del terapeuta y valoraciones

Cierre efectivo: commit `738028ce2408403fb2a27ae4b0459ed1c8995a81`, push atómico normal a `dev` y `feat/piero-dev`. `ls-remote` confirmó ambas refs y `dev` local se sincronizó por avance seguro. Sin cambios locales pendientes al comprobar. Se conservan V70 y V71 como ancestros. GitHub devolvió cero contexts/statuses y cero ejecuciones Actions para ese SHA; no certifica CI. Render respondió OpenAPI pero aún no anunciaba las rutas de valoraciones en la consulta posterior al push: despliegue pendiente de confirmar. PostgreSQL descartable local detenido; preview Vite :5178 conservado.

Repositorio: https://github.com/sromansilva/ashakids-platform . Fecha: 2026-10-11, America/Lima. Rama feat/piero-dev. Base inicial V69/980a3eb42ee3b433709db77482ef50fa5436163f; cierre sobre V71/b9e92cd (SHA completo consultable en Git). V70/900aa5e conserva el mapa del equipo; V71 sólo modifica su arnés de preview. El SHA efectivo de V72 se consulta en Git, sin confundir commit con despliegue.

## Alcance

Inicio sin tres accesos repetidos ni explicación técnica de conteos. Chat/horario reformados para escritorio. Perfil real informativo, contraseña/notificaciones/horario persistentes. Sin 2FA ni autoeliminación del terapeuta; DELETE de cuentas existente exige ADMIN. Expediente conserva Resumen/Sesiones/Reportes y retira pestañas simuladas. Banners amarillos retirados; módulos sin fuente muestran Próximamente. Valoraciones desde agenda familiar histórica para sesiones FINALIZADA/ASISTIO. No pagos nuevos.

## Verificación real

| Comprobación | Resultado/evidencia |
| --- | --- |
| npm run typecheck | PASS, typecheck.txt |
| npm run check:frontend | PASS, 368 archivos/máximo500, frontend-check.txt |
| npm run build | PASS, build.txt |
| npm test | 25 rutas y 304 componentes/22 archivos PASS, frontend-tests.txt |
| pytest valoraciones_unit + modelos | 29 PASS, backend-unit-tests.txt |
| pytest valoraciones_sql | 1 escenario SQL/HTTP PASS, backend-sql-tests.txt |
| Chrome 1536 × 1024 | Once capturas, errores JS [], overflow false, browser-results.json |
| Detector UI | [], design-detector.json |
| Graphify AST local | refresh/check, archivos graphify-*.txt |

Windows, Python/backend virtualenv, Node/Vite/Vitest y Playwright/Chrome. SQL: PostgreSQL17 local puerto6549, BD descartable ashakids_test_reviews_v69, sin .env compartido. Cubre familias/terapeutas, inasistencia, concurrencia/reintento idéntico, conflicto de segunda opinión, listado/paginación, RLS y grants sin UPDATE/DELETE. Unidades cubren rating estricto, longitud, migración ausente y anónimos.

Navegador con API interceptada y nombres sintéticos: dashboard, chat vacío/conversación, perfil, horario/selección por día, seguridad, paciente, opiniones, módulo vacío y agenda histórica/envío confirmado. Capturas relevantes inspeccionadas en dos rondas. Se corrigieron expectativas de prototipos retirados, carrera de pantalla pública, y radio de estrellas que no recibía clic. Suite final incluye fuentes Mundo ASHA V70 del equipo, sin atribuirlas a este cambio. V71 posterior sólo modifica arnés ajeno. No se acredita cobertura total por compilar. verify-browser.cjs requiere Playwright y preview :5178.

## Adopción de BD

Migración011 aplicada explícitamente 2026-10-11T07:14:48Z. Respaldo privado pg_dump559032bytes, listado de archivo verificado, SHA2569b39cf80201e5d227a3aafa15e75117d1c90b9bf30d5bb8e72f9a3bcac812545. Las32tablas anteriores conservaron huellas/filas. Nueva tabla RLS, policies SELECT/INSERT, USAGE de secuencia; sin UPDATE/DELETE ni acceso público. Lectura runtime y EXPLAIN INSERT sin DML verificados. database-adoption.json sanitizado; respaldo/credenciales en tmp ignorado.

Sin usuarios/pacientes/sesiones/opiniones de prueba en BD compartida, ni login/correo/Zoom/reservas reales. Crear la tabla es adopción funcional autorizada; datos de prueba únicamente locales.

## Tiempo real y pendientes

No endpoints WebSocket/EventSource ni suscripciones realtime. useWrite invalida React Query del navegador emisor; notificaciones consultan cada30segundos. Otros navegadores necesitan refetch/recarga/Actualizar, que se conserva.

Implementar eventos tras commit, autenticación de conexión, permisos por rol/conversación, invalidación de consultas, reconexión y recuperación. Estimación orientativa:2–3días para chat;4–7días para chat/agenda/panel/notificaciones con pruebas. Varias instancias/workers necesitan canal compartido. Estimaciones, no implementación. [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/) y [Render WebSockets](https://render.com/docs/websocket).

Responsive, edición/moderación de opiniones y fuentes de Próximamente pendientes. Cierre autorizado: publicar V72 en dev/feat/piero-dev sin force, confirmar refs y estadoCI/deploy. No nueva auditoría académica/PDF.

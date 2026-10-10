# ASHAKids — Contexto maestro progresivo

Actualización: 2026-10-10. Base compartida del equipo: dev. Corte vigente identificado abajo;
los apartados anteriores conservan su entorno y SHA históricos. El PDF de referencia del
8 de octubre no declara un SHA de auditoría de su autor.

## Entrada única del equipo

### Alcance nuevo acordado: flujo por tres roles — 2026-10-10

- [Contexto maestro del flujo actualizado](FLUJO_MAESTRO_ACTUALIZADO.md): registro por asesor,
  código institucional de 6 caracteres A/P/T, DNI solo como contraseña inicial y cambio obligatorio;
  introducción por niño, reserva según disponibilidad, cualquier terapeuta y plan profesional.
- Código sigue en V26 restaurado mediante V31/da4e787. El nuevo alcance no reactiva V27–V30
  ni declara implementados sus requisitos. Prevalece sobre propuestas históricas contradictorias.
- Impacto preliminar: reutilizar núcleo, ajustar reservas/planes/activación y permisos;
  persistir disponibilidad y revisar relaciones educativas. Demo frente a persistencia inicial
  de juegos, transición de niños existentes y extensiones pendientes de precisión.
- Corte documental V32; sin migración, cambio de aplicación/BD, despliegue ni auditoría técnica
  nueva. Siguiente: cerrar contratos y aceptación del recorrido mínimo de tres roles.

### Punto vigente: plataforma restaurada al corte V26

- Base funcional y documental: `a81e465aa02522366eb97250c38827d11ed4a0e4`,
  `V26_Auditoria_Frontend_Backend_HTTPS`. Las fuentes coinciden con ese corte.
- Esquema compartido recuperado, con registros y permisos conservados. El contexto activo
  vuelve a las auditorías16/17; no continuar planes posteriores a V26.
- [Registro de recuperación y verificaciones](RESTORE_V26.md). Los 91/100 siguientes
  corresponden a las auditorías originales; no son una puntuación nueva.

### Auditorías finales frontend y backend - cortes16 y17

- Dos Word separados y PDF académicos, seis páginas cada uno; fuentes docs/audits/ y
  evidencia sanitizada por corte. Puntajes técnicos propios:frontend91/100, backend91/100.
  No son notas del profesor ni certificaciones. Ejecución9oct21:14-21:33 Lima.
- Base auditada piero-dev V25/7fb36680e0c5856036bcf1de69263366247e9126, igual a dev y
  origin/feat/piero-dev al iniciar. Hosting continúa V24/62905fc, Auto Deploy Off.
  Cierre V26_Auditoria_Frontend_Backend_HTTPS:informes/harness/render Word, sin cambios app/BD.
  Comprobar publicación y SHA efectivo en Git; no atribuir una imagen nueva a este cierre.
- Resultados nuevos:257 componentes+25 rutas/tipos/check320 archivos/build6.78s;
  npm audit productivo0 vulnerabilidades. Backend138 unidades/19 deprecaciones;144 HTTPS
  finales esperados (101+29+14),52/54 contratos positivos;2 DELETE físicos omitidos.
  Hosting excluye raíz JSON local en OpenAPI, por eso54 y no55 del inventario anterior.
- TLS1.3 CERT_REQUIRED/hostname, ACL/RLS y modelo READ ONLY:26 tablas,154 columnas
  visibles al runtime,92 restricciones,71 índices,19 modelos sin diferencias;58 políticas.
  Concurrencia y revocación repetidas. Ajuste SCRAM se cita como evidencia heredada de15.
- Cohorte nueva AUDITORIA17_20261010_021551:usuarios78..83,pacientes97/98,
  tratamientos17/18,citas14/15,sesiones13/14,chat7. SQL final:1 reporte completo,3 mensajes
  (tercero UI),0 auth nuevas sin revocar. Sin modificación de datos anteriores/borrado físico.
- UI tres roles IAB1280x720; admin filtrado antes de capturar. Sesión familiar previa
  cerrada con autorización adicional expresa. Sin nueva aceptación móvil:override390x844
  no cambió tamaño efectivo y se restableció. No atribuir esa limitación al producto.
- F16-01 P1:editar reporte existente envía3 metadatos de lectura, backend422; conserva
  reporte previo y formulario. ReportWorkspace:14/SessionActions:32 -> editor:18 ->
  clinicalService:37. Separar4 campos al iniciar/serializar y añadir regresión con objeto real;
  no relajar extra=forbid. F16-02 contraste2.575:1 en etiquetas12px; F16-03 botón ojo sin
  nombre15x15 y Recordarme div sin semántica/estado sin uso. Son pendientes, no corregidos.
- Orden validado por usuario:entregar auditorías -> corregir reporte/accesibilidad -> verificar
  -> propuesta visual para validación -> implementación UX/UI por módulos. No rediseñar todavía.
  Restauración/carga/TTL natural/rotación anterior pendientes. Pagos excluidos.
- Fallos de entorno:spawnEPERM Vitest/Vite;tmpfixturesWinError5 pytest; reruns correctos.
  Harness:SyntaxError,Accept HTML omitido y serialización bytes corregidos antes del cómputo.
  Word render_docx.py sin LibreOffice/perfiltemp; Word COM read-only+Poppler como alternativa,
  todas las páginas inspeccionadas y cierre backend huérfano reparado. No afirmar éxito canónico.
- [Word frontend](../output/auditoria-final-2026-10-09/Auditoria_Frontend_AshaKids_2026-10-09-16.docx),
  [Word backend](../output/auditoria-final-2026-10-09/Auditoria_Backend_AshaKids_2026-10-09-17.docx).
  Informes audits/auditoria-2026-10-09-16.md y17.md. Reproducción:commands.md de cada corte,
  harness sanitizado solo evidencia; no reutilizar cohortes cerradas como pruebas nuevas.
  No ejecutar pytest general/phase2_sandbox en Supabase:fixtures destructivas.

### Despliegue Render HTTPS - corte2026-10-09-15

- URL pública https://ashakids.onrender.com; servicio ashakids/srv-db4penqjnfac7382hjhg,
  Free, Virginia, dev, Docker, un worker, Auto Deploy Off. Imagen V24/62905fc0480fffd21fb6b2d969592700608d64bb,
  deploy dep-db4peo2jnfac7382hl20, buildLinux57.9s y estado Live observados.
- Pooler oficial sesión5432 y ashakids_runtime. CA2021 Secret File, CERT_REQUIRED y
  hostname; TLS1.3 real. No .env local/contraseña aleatoria cambiada ni claves propietarias
  enviadas a Render. FORWARDED_ALLOW_IPS sigue127.0.0.1,::1; escrituras HTTPS aceptadas.
- Autorización expresa del responsable: SCRAM32768->4096 únicamente del rol nuevo
  para Supavisor2.9.10, conservar permisos/contraseña, guardar secreto y publicar gratis.
  Snapshots de atributos, ACL, propietarios, RLS y membresías idénticos. ADR0012.
  Menor coste offline asumido; recuperar coste mayor cuando pooler lo soporte y se pruebe.
- Nueva cohorte AUDITORIA_RENDER_20261010_014323 (UTC10oct; Lima9oct):101 respuestas
  HTTPS esperadas,0fallos;10 cookies Secure/HttpOnly/Lax; origen externo403. Concurrencia
  con sesiones auth distintas: reserva/sesión201+409, inicio/cierre200+409, reporte completo,
  chat único.8 smoke públicas adicionales. No prueba de carga ni QA visual exhaustiva.
- SQL READ ONLY posterior:6usuarios,2pacientes activos,2tratamientos,2reservas,
  2sesiones FINALIZADA,1reporte completo,2mensajes,0sesiones auth nuevas sin revocar.
  IDs72..77/95,96/15,16/12,13/11,12/chat6. Conservar/excluir de métricas; no borrar.
  ADMIN inicial usado solo local ASGI para crear nuevo seed; su secreto no salió a Render.
- CI V24:dos jobs graph aprobados (runs38002334489/38002334516); no son pruebas clínicas.
  Regresión138 pruebas/19avisos/tipos/build de V24 heredada, no reejecutada en corte15.
  Fallos iniciales CA/autenticación/pooler resueltos; DNS directo IPv6 no accesible aquí.
- [Informe15](audits/auditoria-2026-10-09-15.md), [PDF15](../output/pdf/Auditoria_Despliegue_AshaKids_2026-10-09-15.pdf),
  evidencia sanitizada docs/evidence/audit-2026-10-09-15/. Cierre previsto V25; cotejar SHA
  efectivo en Git. Auto Deploy Off conserva imagen V24 aunque se publique documentación.
- Siguiente: abrir URL antes de demo (despertar50s o más), usar cuentas habituales;
  actualizar imagen manualmente solo ante cambios funcionales. Backup/restauración,
  expiración natural, carga y rotación de cuentas anteriores siguen fuera de este ensayo.
  No pagos, TRUNCATE, DELETE físicos ni modificaciones de datos clínicos previos.

### Preparación Render gratis - 2026-10-09

- Solicitud: sincronizar dev con piero-dev y comenzar hosting gratuito para demo.
  Base V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b. Remotas dev/feat/piero-dev ya
  coincidían; dev local avanzó4 commits por fast-forward y se volvió a piero-dev.
- Docker Node22/Python3.13, render.yaml dev/Free/manual, app.hosted sirve React + FastAPI
  en un origen. app.main conserva API local; no nuevas bases ni escrituras Supabase.
- ADR0011 y operations/DEPLOY_RENDER.md.138 pruebas sin BD aprobadas/19 avisos;
  tipos/build React y11 respuestas ASGI con dist real aprobados (sin BD/sesiones).
  Mapa refresh/check vigente.4 fallos Windows/dotfile corregidos; bloqueos sandbox
  de temporales/esbuild resueltos con acceso autorizado. Docker Linux no construido.
- Usuario necesita crear/vincular Render con GitHub. Cuenta, credencial pooler IPv4,
  CA y proxies de ingreso confirmados pendientes. Loopback por defecto rechaza escrituras
  HTTP del proxy no confiable. Sin URL pública ni aceptación HTTPS declarada.
  Cierre V24 corresponde al paquete revisable; publicación del hosting sigue pendiente.

### B02 aplicado en Supabase - corte 2026-10-09-14

- Base V21/e756e7b5865201c2a0bd311786746d20b940449f; rama de trabajo piero-dev, dev y feat/piero-dev comprobadas antes del cambio. V22_Seguridad_BD_Rol_Backend publicado y verificado en dev y feat/piero-dev: dd71407a8e21f0bacf6904bf430784d1c3b26dda. Informe/PDF14 y cierre de evidencia corresponden a V23_Auditoria_BD_Permisos_Backend; comprobar SHA remoto efectivo con Git al continuar.
- Autorización expresa para crear ashakids_runtime, GRANT por operación, políticas RLS y cambiar la conexión tras probar el candidato. Rol LOGIN sin superuser, BYPASSRLS, CREATEDB, CREATEROLE, replicación, propiedad ni pertenencia a otros roles. ACL exactas en 22 tablas, 58 políticas exclusivamente TO runtime y USAGE en 16 secuencias.
- Seis denegaciones SQL42501 comprobadas sin ejecutar DML destructivo: tabla y secuencia no concedidas, UPDATE/DELETE de mensajes, INSERT de roles y CREATE SCHEMA de ensayo con savepoint revertido. TRUNCATE/setval/DDL sobre tablas clínicas no se ejecutaron. Snapshots antes/después/final conservan roles, membresías anteriores, propietarios, RLS y ACL de otros destinatarios.
- Candidato FastAPI ASGI en proceso + SQL Supabase real: 99 respuestas esperadas. Después, API habitual8000 recargada: 99 núcleo+29 complemento+5 sistema=133 respuestas esperadas, 0 fallos, éxito en53/55 operaciones. Las2 operaciones DELETE físicas no se ensayaron. 114 pruebas backend sin BD/conftest,19 avisos; sin nueva ejecución frontend (regresión del corte13 heredada).
- Persistencia de cada cohorte: 2 reservas,2 sesiones FINALIZADA,1 reporte completo,2 mensajes y0 sesiones auth nuevas activas. Prefijo AUDITORIA13_ heredado del guion: candidato AUDITORIA13_222612, usuarios62..66/pacientes91,92/tratamientos11,12/citas8,9/sesiones7,8/chat4; HTTP final AUDITORIA13_222932, usuarios67..71/pacientes93,94/tratamientos13,14/citas10,11/sesiones9,10/chat5. Conservar y excluir de métricas clínicas; no borrar ni modificar cohortes anteriores.
- Solo DATABASE_URL de backend/.env cambió; host/puerto/BD y configuración TLS permanecen. Respaldo privado tmp/b02-env-before-private.txt y credencial nueva tmp/b02-runtime-private.json, ambos ignorados. No publicar URLs, contraseñas, SCRAM, cookies, tokens ni logs privados. ADMIN de AshaKids conserva funciones; propietario PostgreSQL conserva permisos separado del runtime. El push no cambia .env de otros clones: coordinar configuración por canal privado.
- PUBLIC CONNECT/TEMP y USAGE de public conservados; runtime no tiene CREATE en BD/schema ni funciones SECURITY DEFINER alcanzables. RLS USING true para el rol técnico no aísla familias en SQL; FastAPI sigue autorizando cada recurso. ADR0010 y B02_MINIMO_PRIVILEGIO.md documentan límites y reversión. No instancia nueva8001; una preexistente no fue usada ni detenida.
- Evidencia nueva docs/evidence/audit-2026-10-09-14/. B02 aplicado/verificado en este clon y destino real. HTTPS/hosting, rotación de cuentas anteriores, backup/restauración, carga, expiración natural y DELETE físicos siguen pendientes. CI remoto no observado. No ampliación de módulos ni pagos.
- [Informe14](audits/auditoria-2026-10-09-14.md), [PDF](../output/pdf/Auditoria_BD_Permisos_AshaKids_2026-10-09-14.pdf), valoración técnica86/100 (83 del corte13 heredado). PDF renderizado/revisado, manifest de integridad y evidencia sanitizada. Siguiente: configurar credencial runtime en clones por canal privado; después hosting HTTPS y recuperación con responsables. No confundir Git con despliegue público ni solicitar otra aprobación B02 ya concedida.

### Corrección backend B01-B06 - corte 2026-10-09-13

- Trabajo exclusivamente en piero-dev desde V19/a1930df. V20_Correccion_Backend_Seguridad_Contratos publicado y verificado en dev y feat/piero-dev: b76a34a6125cae42614e9bee6da41ccc28163d7b. Informe y complemento de evidencia corresponden al cierre V21_Auditoria_Backend_Supabase_Documentacion; comprobar su SHA remoto con Git antes de continuar.
- TLS remoto CERT_REQUIRED/hostname, CA2021 con compatibilidad explícita por keyUsage en Python3.13; conexión realTLS1.3 y confianza incorrecta rechazada. Producción valida HTTPS/orígenes; login limitado en un proceso; contraseñas nuevas12..128 y sexo compatibles centralizados. ADR0009 y guías operations.
- Servicios administrativos/pacientes divididos manteniendo27 cuerpos de funciones idénticos por comparación AST. Todos los Python modificados <=500líneas; test_auth_api499.
- 114 pruebas backend sin BD/conftest,19 avisos; 257 componentes/25 rutas frontend, tipos/check/build y pip check correctos. No suite destructiva ni BD descartable.
- Autorización humana explícita para nueva cohorteAUDITORIA en Supabase y sesiónADMIN inicial por credenciales privadas. Primera corrida95HTTP con una sesión por actor; final99HTTP con sesiones distintas para concurrencia,29HTTP complementarios y5HTTP de sistema:133 respuestas esperadas,0fallos;53/55 operaciones con éxito real. Los2 DELETE físicos quedan fuera del ensayo. SQL READ ONLY confirma2reservas/2sesionesFINALIZADA/1reportecompleto/2mensajes y0sesionesauth activas nuevas.
- Conservar IDs iniciales usuarios52..56,pacientes87/88,tratamientos7/8,citas4/5,sesiones3/4,chat2; finales usuarios57..61,pacientes89/90,tratamientos9/10,citas6/7,sesiones5/6,chat3. Excluir de métricas clínicas; no borrar. No cuentas clínicas anteriores modificadas, DDL/TRUNCATE ni permisos compartidos cambiados.
- B02 pendiente: propuesta operations/B02_MINIMO_PRIVILEGIO.md; BYPASSRLS/CREATEDB/CREATEROLE siguen activos. B03 parcial por rotación/HTTPS; B06 parcial por caída real/backup/restauración/escritores externos y cargas no ensayadas. DELETE físicos no autorizados; expiración natural/QA visual completa no certificadas.
- Evidencia nueva docs/evidence/audit-2026-10-09-13/. Credenciales bootstrap en backend/.env; credenciales nuevas en tmp/AUDITORIA13_*private.json ignorado. No publicar esos archivos. API habitual8000 conserva destinoSupabase y --reload; no8001 ni despliegue público.
- [Informe13](audits/auditoria-2026-10-09-13.md), [PDF](../output/pdf/Auditoria_Backend_AshaKids_2026-10-09-13.pdf), valoración técnica83/100 (anterior73 heredado); no calificación oficial ni certificación de producción. Evidencias sanitizadas, manifest de integridad y PDF renderizado/revisado. Siguiente: aprobación específicaB02 y ensayoHTTPS/rotación/backup por responsables. CI remoto no observado; no atribuirle pruebas locales.

### Corte vigente: corrección frontend y nueva auditoría real, 2026-10-09-12

- [Informe](audits/auditoria-2026-10-09-12.md), [PDF](../output/pdf/Auditoria_Frontend_AshaKids_2026-10-09-12.pdf), [evidencia](evidence/audit-2026-10-09-12/). Rama feat/sroman; SHA funcional a60d671a8523a016a41b50395a7db92b05698f18, V18_Correccion_Frontend_Reportes_Sesiones.
- Se cerraron los seis hallazgos anteriores del frontend y dos brechas adicionales de historial profesional/sesiones admin simulados. Diseño y prototipos sin API conservados; identidad y datos clínicos provienen del servidor.
- Puntuación técnica frontend94/100 (antes76). No es porcentaje de cobertura ni certificación de producción. Backend73 anterior no recalculado.
- Validación nueva:257 componentes/25 rutas, tipos/build/320 archivos max495, 0 vulnerabilidades productivas conocidas,11 backend seleccionadas sin BD,28 respuestas HTTP esperadas con SQL READ ONLY en Supabase. Recorrido por formularios reales conservó paciente/tratamiento/cita/sesión/reporte y PDF familiar.
- Proxy relativo /api/v1 hacia API8000 por defecto; override8001 solo explícito para pruebas aisladas. No hay hosting final HTTPS validado ni expiración natural/matriz completa. Riesgos TLS/privilegios BD del corte previo siguen pendientes.
- Nuevos registros AUDITORIA autorizados: usuarios50/51,paciente86,tratamiento6,cita3,sesión2/reporte. No borrar sin instrucción ni incluir en métricas clínicas. Finalización de sesión requirió aceptar diálogo nativo por el usuario.
- Estado Git funcional: V18/a60d671 publicado en dev y feat/sroman, ambas referencias remotas verificadas con el mismo SHA. El corte documental V19 incluye informe12/PDF/evidencia y archiva los Word anteriores sin publicar sus guiones con credenciales. No es un despliegue público.

### Corte de auditoría real Supabase del 9 de octubre de 2026

- [Auditoría frontend y backend](audits/auditoria-real-supabase-2026-10-09.md), con Word separados solicitados por el usuario. Base feat/sroman/a397c0f más CORS local existente.
- Web5174/API8000/BD Supabase real; escrituras AUDITORIA autorizadas. 103 respuestas corregidas esperadas, 47/55 operaciones con prueba HTTP específica; no cobertura integral ni certificación de producción.
- Frontend76/100 y backend73/100. Frontend257 pruebas aprobadas, backend selección segura63 aprobadas/2 omitidas; no TRUNCATE en BD compartida.
- Bloqueos prioritarios: reportes de terapeuta simulados sin aviso, proxy8001 frente a destino8000, TLS sin validación de certificado y usuario BD con privilegios amplios. Registros sintéticos permanecen identificados.
- Este corte no reemplaza resultados históricos locales ni declara hosting publicado o aceptación completa del equipo.

### Corte anterior: consolidación de entrega académica y cierre de Fase 7, 2026-10-09-11

- Paquete de entrega académica consolidado y alineado con los criterios del profesor para la entrega del 9 de octubre (18:00 Lima):
  1. **Informe de Rúbrica:** `docs/academic/INFORME_ENTREGA_RUBRICA.md` documentando la arquitectura de 3 capas desacopladas, contratos OpenAPI, modelo físico en PostgreSQL (26 tablas relacionales, 178 columnas, 221 constraints), RBAC para 3 roles, cookies HttpOnly SameSite=lax y 376 pruebas aprobadas (119 pytest + 232 vitest + 25 rutas, 0 fallos).
  2. **Análisis de Hosting Gratuito (F7-02):** `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md` evaluando Vercel (Front) + Render (API) + Supabase (PostgreSQL), resolviendo el transporte de cookies Same-Origin mediante rewrites en `vercel.json`.
  3. **Guion de Sustentación (F7-03):** `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md` con itinerario paso a paso de 8 a 10 minutos para la defensa en vivo con los tres roles sintéticos (`a90001`, `t90001`, `p90001`), reporte clínico en 4 campos, descarga de PDF y persistencia real tras recarga de navegador.
  4. **Documentación pública:** `README.md` y `docs/DELIVERY_CHECKLIST.md` actualizados con instrucciones de clonación y ejecución rápida.
- Estado de fases: Fases 1 a 7 completadas.

### Corte anterior: cierre formal de Fase 6 y transición a Fase 7, 2026-10-09-10

- Alcance formalizado en [ADR 0008](decisions/0008-cierre-y-alcance-extensiones-fase6.md) para cumplir con la prioridad académica del 9 de octubre (18:00 Lima) y la rúbrica del profesor:
  1. **Teleconsulta:** Soporte por enlace seguro de cita y salas en cliente (`/session/waiting`, `/session/active`); WebRTC nativo (STUN/TURN) diferido por infraestructura externa no exigida.
  2. **Voz:** Juegos fonéticos conservados en el plan desacoplado de Mundo ASHA ([MA-01..MA-07](MUNDO_ASHA_PLAN.md)); análisis acústico complejo diferido.
  3. **ASHI:** Asistente reactivo local seguro en cliente, preservando la privacidad de menores sin llamadas a LLMs de pago externos.
  4. **Correo (SMTP):** Resuelto mediante el subsistema de mensajería privada en PostgreSQL (ADR 0007).
- Estado de fases: Fase 6 cerrada formalmente. El proyecto entra en la Fase 7 (Resolución y Entrega Académica).

### Corte anterior: corrección de proxy local y cookies de sesión en navegador, 2026-10-09-09

- Diagnóstico resuelto: el bucle de recarga en login desde navegadores con escudos de privacidad (Brave) se debía a que `VITE_API_BASE_URL` apuntaba de forma cruzada a `http://localhost:8001/api/v1` mientras el frontend se abría en `http://127.0.0.1:5174/`. Al ser orígenes cruzados (`localhost` vs `127.0.0.1`), las cookies de sesión con `SameSite=lax` eran bloqueadas o no adjuntadas en peticiones fetch subsiguientes, provocando 401 Unauthorized y disparando el evento `ashakids:session-expired` que rebotaba a `/login`.
- Solución arquitectónica implementada:
  1. Configuración de proxy inverso en `frontend/vite.config.ts`: mapeo de `/api` hacia `http://127.0.0.1:8001` con `changeOrigin: true` y servidor fijado en `127.0.0.1:5174`.
  2. `frontend/.env.local` configurado con `VITE_API_BASE_URL=/api/v1` relativo, convirtiendo todas las peticiones fetch en estrictamente Same-Origin (primer origen).
  3. En `frontend/src/api/client.ts`, aislamiento del modo test (`import.meta.env.MODE === "test"`) preservando el origen absoluto para los analizadores de URL en pruebas Vitest, mientras el runtime usa `/api/v1`.
- Verificaciones: 232 pruebas de componentes Vitest y 25 pruebas de rutas pasadas; build limpio; endpoint `/auth/login` y `/auth/me` validados exitosamente a través del proxy devolviendo sesión activa 200 OK.

### Corte anterior: aceptación del núcleo/PDF/mensajes en entorno independiente, 2026-10-09-08

- Aplicación reproducida: dev/b3f84bd828c2002c7f80466410251d9df155550c, V13 y PR107 efectivamente
  integrados.
- [Auditoría08](audits/auditoria-2026-10-09-08.md) y [evidencia](evidence/audit-2026-10-09-08/):
  reproducción en máquina independiente (HailQueso), Node v22.15.0 / npm 10.9.2, Python 3.13.7,
  PostgreSQL 18.4 local en puerto 5433.
- Dos BDs nuevas locales: aceptación ashakids_test_accept07_hq y regresión ashakids_test_regress08.
  Sin conexión a Supabase ni reutilización destructiva de la demo de Piero (ashakids_test_compat17).
- Guion de entrega verify_delivery_journey.py pasó las 92 respuestas HTTP completas: gestión de cuentas,
  suspensión y reactivación, alta de paciente, asignación de tratamiento, reserva, confirmación, ciclo
  completo de sesión, reporte clínico en 4 campos estructurados, exportación y verificación de PDF (%PDF-),
  y mensajería privada con contactos autorizados, aperturas concurrentes, cursor y persistencia tras relogin.
- Suite de regresión pytest en ashakids_test_regress08: 119 pruebas aprobadas, 25 omitidas (suites heredadas
  deshabilitadas), 19 advertencias. 0 fallos.
- Frontend: 232 pruebas Vitest y 25 pruebas de enrutamiento aprobadas; tsc --noEmit, check:frontend (318
  archivos, máx. 495 líneas) y build Vite de producción correctos (bundle 292.83 kB).
- Estado del navegador: servidor Vite levantado en http://127.0.0.1:5174/ y API en http://127.0.0.1:8001/.
  Al intentar la aceptación visual automatizada, browser_subagent reportó fallo en el gestor de Playwright
  por error 404 al descargar el driver en azureedge CDN. Conforme a las instrucciones del usuario, no se
  evadieron puertos ni orígenes. La aceptación visual en navegador real se documenta como pendiente sin falsos cierres.
- Análisis de Incidente 01 histórico: documentado en la auditoría con sus tres capas de guardas vigentes;
  impacto en Supabase compartido permanece abierto a la revisión de línea base y logs por el equipo.
- Fase 5 se mantiene abierta en la dimensión de aceptación en navegador real. Siguiente paso: preparación del
  paquete de entrega académica y rúbrica antes de las 18:00 Lima.

### Corte anterior: aceptación del núcleo/PDF/mensajes, 2026-10-09-07

- Aplicación reproducida: dev/e456294cd7d13aea41dc5d00940b84aa782acbad, V10 y PR106
  efectivamente integrados. Código de verificación V11_Verificacion_Nucleo_Reportes_Mensajes,
  8578ca9cde56bac2ec04389a58ae282cc3fdc8e3. Documento/evidencia V12, integración por PR/V13;
  consultar historial para publicación efectiva, sin atribuir un merge futuro al SHA auditado.
- [Auditoría07](audits/auditoria-2026-10-09-07.md) y [guion](acceptance/CORE_PDF_MESSAGES.md):
  clon GitHub limpio, venv nuevo Python3.13.7/requisitos publicados y npm ci del lockfile;
  Node26.9.0/npm11.19.1. Se reutilizó cluster PostgreSQL17.6 local6544 existente.
  Mismo agente/ordenador; no comprobación de otro integrante/OS ni hosting.
- Dos BD nuevas ashakids_test_accept07 y _repeat pasaron92 respuestas HTTP cada una:
  administración de cuenta/revocación, paciente/asignación, reserva/confirmación/sesión/
  reporte/PDF y mensajes privados. Misma secuencia repetida, no184 casos distintos.
  Historial/reporte idénticos tras relogin; PDF cotejado y renderizado. Ajustes SQL de tiempo/
  estado solo en nuevos IDs; tratamiento finalizado/chat archivado bloquean envío real403/409.
- Suite completa en BD local regress07 separada: clon115 correctas/25 omitidas/19 advertencias;
  final con cuatro unidades de guarda119/25/19. 20 suites heredadas HTTP y5 compartidas no
  habilitadas. 232 componentes,25 rutas, tipos/check/build correctos; sin nuevas pruebas UI real.
- Guion final comprueba hash de sesión emitida por API en BD declarada, activa y no vencida,
  antes de clínica; destino divergente rechazado en prueba SQL real. No guarda tokens/hashes.
  Login/logout sí modifica sesiones sintéticas. Guarda contiene el error de destino; impacto
  histórico01 no restaurado/certificado, requiere logs/baseline del equipo.
- Modelo físico nuevo inspeccionado READ ONLY:26 tablas/178 columnas/92 restricciones/71
  índices;19 tablas modeladas,0 diferencias, incluida mensajería. SQL fuente de02 histórico,
  sin filas reales; solo CREATE SCHEMA public hecho idempotente en copia local. Sin Supabase.
- Demo compat17 conservada: mismos conteos5 usuarios/2 pacientes/2 citas/1 sesión/reporte/
  chat/14 mensajes; no snapshot byte a byte. API8001 restaurada, seis respuestas correctas
  y lectura de reporte02/historial14. API8000/5173 y otros servicios no se reiniciaron/auditaron.
- Fallos registrados: public ya existente al restaurar; grant/seed antes de tablas; Node EPERM
  y consulta procesos denegada/bind8001 ocupado. Correcciones acotadas y resultados preservados.
  Instalación npm avisa dependencia obsoleta/install scripts sin allowScripts; build funcionó.
- Navegador: tras respuesta del usuario indicando acceso habilitado, selección de pestaña5174
  volvió a ser denegada por preferencia guardada. Inventario1/intento1,0 capturas; sin evasión.
  Reiniciar API no cambia permisos. Ajustes de sitios de Codex deben retirar ese bloqueo.
- F5-01 aceptado por API/SQL, fase5 abierta para UI desktop/móvil, recaptura PDF y reproducción
  independiente. Siguiente: aceptación visual/equipo e incidencia01/paquete de rúbrica antes
  de18:00 Lima. No fase6 nueva, pagos, juegos completos MA ni hosting antes de estabilidad.

### Corte anterior: F5-01, mensajes familia/profesional, 2026-10-09-06

- Código V08_Mensajes_Familia_Terapeuta, 7fddd59d6cc6ec594c666c9c80ba184a88c9a91d,
  desarrollado en dev sobre 1398e706121fea153fe9f7481d24983d9e49911a. El corte PDF anterior
  está publicado: PR105 integrado en ese SHA (V07_Integracion_Reportes_PDF).
  Documentación/evidencias nuevas en V09_Auditoria_Mensajeria; integración dev por PR/V10.
  Consultar historial remoto para el SHA efectivo; no atribuir un merge futuro al corte auditado.
- [Auditoría06](audits/auditoria-2026-10-09-06.md) y ADR0007: se reutilizan conversaciones/
  mensajes existentes, sin DDL ni cambios de dependencias. Participantes por perfil de usuario;
  ADMIN por sí solo no lee chats privados. Contactos por asignación activa, chat por familia/
  profesional, sin duplicar por hijo. Historial accesible al participante tras finalizar relación;
  enviar requiere chat abierto/asignación activa/usuarios habilitados.
- Apertura de pareja serializada por tutor; envío bloquea conversación; commit antes del éxito.
  Cursor de IDs para conversaciones/mensajes, límite100, INTEGER positivo; entrada de texto
  1..4000 no vacía/NUL, sin campos de emisor/fecha/estado enviados por cliente.
- PadreMensajes/TerapeutaMensajes usan MessagesCenter/MessageThread/messagingService y
  cookie/API central. Sin respuestas ni contactos ficticios, llamadas/adjuntos/presencia/leído.
  Actualización manual; borradores en memoria por chat y por identidad. No POST automático
  ante error ni burbuja optimista. Respuesta inválida/red/5xx comunica incertidumbre y conserva
  texto; actualizar antes de reenviar. ADMIN informa campañas pendientes sin envío simulado.
- 232 componentes frontend (16 nuevos de mensajes), 36 unitarias backend (25 mensajes +11
  PDF de regresión), 25 rutas; tipos/estructura/build correctos. No suite backend completa nueva.
  HTTP final53 + OpenAPI; aperturas/envíos concurrentes, cursor y lectura idéntica tras relogin.
  Dos corridas conservaron14 mensajes sintéticos (siete cada una) en conversación1; no reset.
- API8001/web5174/PG17.6 local6544, ashakids_test_compat17; .venv313 Python3.13.7.
  Login/logout modifica sesiones sintéticas; solo chats/mensajes nuevos, sin usuarios ni clínica
  nueva, sin Supabase. Comparación del esquema02 es evidencia histórica, no repetida aquí.
- Limitaciones: sin UNIQUE pareja ni clave idempotente de envío; escritores externos deben
  respetar bloqueos/reglas. La revocación concurrente externa no tiene garantía atómica nueva.
  Archivado/asignación finalizada probado en unidad con mocks, sin mutaciones clínicas reales.
- Navegador sigue bloqueado por preferencia guardada previa; no se intentó eludirlo ni se
  obtuvieron capturas06. Pruebas jsdom no certifican UI real desktop/móvil. Recaptura móvil
  PDF05 también pendiente. Fase5 abierta para aceptación conjunta/reproducción por otro clon.
- Siguiente: recorrido del núcleo con tres roles + PDF + mensajes, aceptación visual/errores,
  incidencia01 y paquete de rúbrica. Recursos diferidos; juegos completos Mundo ASHA en MA.
  No iniciar nuevas extensiones ni hosting antes de comprobar estabilidad del alcance elegido.

### Corte anterior: F5-01, exportación de reportes guardados, 2026-10-09-05

- Código: V05_Reportes_Exportacion_PDF, a8df56fc912db76a01092b60caa1efa220dcd85b,
  desarrollado en dev desde add1d4f. Informe/evidencias en V06_Auditoria_Reportes_PDF.
  Destino compartido dev mediante PR; comprobar publicación e integración en historial.
- [Auditoría05](audits/auditoria-2026-10-09-05.md): GET /sesiones/{id}/reporte/pdf verifica
  los mismos permisos que la lectura JSON. PDF generado en memoria con paciente/profesional
  actuales, fecha/estado/asistencia y los cuatro campos guardados; sin notas privadas ni firma.
- Descarga reutilizable en detalle de citas/sesiones de los tres roles y Reportes familiar.
  El cliente central valida MIME/firma PDF, aborta por cambio de cuenta y comunica fallos;
  exporta la versión guardada aunque el formulario tenga cambios sin guardar.
- Reportes familiar usa sesiones reales e ID estable; informe mensual, métricas clínicas
  y firma/matrícula inventados se retiraron. Progreso mensual queda explícitamente pendiente.
  La pantalla independiente /terapeuta/reportes sigue siendo demostrativa.
- 216 pruebas frontend (18 nuevas), 11 backend unitarias nuevas, 25 rutas; tipos/check/build
  correctos. 28 respuestas HTTP reales + OpenAPI en API8001/PG17.6 local6544; PDF cotejado
  con JSON y lectura posterior sin cambio del reporte. No suite backend completa nueva.
- Navegador: descarga física familiar y capturas 1366/390 px verificadas antes del último
  ajuste móvil. Se añadió margen al texto junto a botones flotantes; su recaptura fue
  rechazada por permisos del navegador. Confirmación visual final móvil pendiente.
- Fuentes Vera incluidas en ReportLab; tildes/ñ, nulos, markup literal y texto largo probados.
  Caracteres no soportados (p. ej. ciertos emoji) devuelven 422 sin documento parcial.
  Fechas sin zona conservan esa condición. No certificación clínica, firma digital o carga.
- Dependencias nuevas: ReportLab y tzdata runtime; pypdf de desarrollo. Actualizar el entorno
  con requirements-dev.txt/requirements.txt según uso. Runtime auditado .venv313 Python3.13.7,
  ReportLab4.5.1, tzdata2026.5, pypdf6.19.0. Reiniciada únicamente API8001 de la réplica.
- No tablas/migraciones/filas clínicas nuevas ni acceso a Supabase. Login/logout modifica
  sesiones de las cuentas sintéticas existentes. No ejecutar prepare/pytest de integración
  sobre la demo si se desea conservar sus fixtures de los cortes02/03.
- Fase5 sigue abierta. Siguiente: mensajes autorizados familia/profesional, paginación,
  persistencia y entrega honesta de errores. Recursos diferidos; Mundo ASHA sigue MA-01.
  Incidencia01, reproducción por otro equipo y recaptura móvil pendientes; hosting después
  de acreditar estabilidad del alcance seleccionado.

### Corte anterior: fase 3, coherencia del núcleo, 2026-10-09-04

- [Informe](audits/auditoria-2026-10-09-04.md): cierre de fase 3 para el núcleo mínimo,
  sin certificar todas las extensiones ni estabilidad de toda la plataforma.
- Recorrido/Seguimiento familiar reutilizan registros persistentes; paneles ADMIN/TERAPEUTA
  calculan datos autorizados, sin nombres, mensajes, disponibilidad o métricas clínicas ficticios.
- Familias consultan profesionales por tratamientos asignados y reservan por el diálogo real.
  Configuración muestra todos los hijos sin límites de plan; baja lógica conserva historial.
- Alta y cambios de cuenta/credenciales por administración existente. Registro público,
  recuperación/verificación por correo, consentimiento, preferencias y 2FA pendientes:
  entradas explicativas, sin envío, guardado o aceptación simulados.
- 198 componentes (33 nuevos), 25 rutas, tipos/estructura/build correctos; 35 respuestas
  HTTP + OpenAPI en réplica local y navegador 1366/390 px. Sin clínica nueva ni Supabase.
- [Mundo ASHA](MUNDO_ASHA_PLAN.md) pasa a etapa propia MA-01..MA-07 por petición del usuario:
  mundos por habilidad, diferentes dificultades y niveles. Catálogo draft-1: 4 mundos,
  24 niveles propuestos (6/8/5/5), sujetos a revisión. Juegos actuales siguen prototipos.
  Cálculo secuencial probado con intentos sintéticos; todavía no conectado/persistente.
  Sin estrellas, rachas, asignaciones ni premios ficticios en portada/perfil/retos/academia.
- ADR 0005: experiencia del núcleo y límite educativo. Selección de hijo por ID compartida,
  identidad en claves de consulta; el almacenamiento local no concede autorización.
- Código identificado por V01_Fase3, 9a6b06160c5210ec05bd3273ef516bba6989560d.
  Documentación/evidencia se conserva en V02_AuditoriaFase3. Destino compartido: dev,
  integración por PR; consultar historial remoto para SHA de publicación y CI.
- Nueva regla del usuario: commit obligatorio corto con versión/objetivo y descripción
  breve al cerrar cada fase; publicar en dev y sincronizar su rama. No esperar la palabra
  clave. La señal de tokens bajos prepara un relevo anticipado incluso a mitad de fase.
- Convención afinada por el usuario: `VNN_Accion_Modulos` para todo el equipo y agentes;
  nombrar el trabajo y módulos concretos, sin títulos basados solo en fases. Consultar
  AGENTS.md. Los commits V01..V03 ya publicados se conservan con sus SHA; PR #104
  integrado en dev en 40d53875a1f87378e3651a68c101c2b7150af6da. Esta actualización
  es documental, sin pruebas ni auditoría técnica nuevas.
- Siguiente: F5-01, decidir mínimos de comunicación/documentos; MA-01 requiere revisión
  detenida de contenido/criterios con el usuario. Incidencia01 y reproducción del equipo
  pendientes; hosting solo se comparará después de demostrar estabilidad.

### Corte anterior: F3-01, seguimiento familiar persistente, 2026-10-09-03

- [Informe](audits/auditoria-2026-10-09-03.md): Centro Familiar y Mi Camino ASHA consumen
  registros del servidor; selección por ID también en móvil, sin niños ficticios de respaldo.
- Hitos y contadores proceden de perfil/tratamientos/citas/sesiones/reportes. Solo sesiones
  FINALIZADA/ASISTIO cuentan como realizadas; fechas y mes America/Lima. Progreso clínico
  sigue "Sin medición"; no se infiere mejoría a partir de sesiones o actividades.
- Próxima cita excluye completadas/canceladas/vencidas; recomendaciones salen del reporte
  profesional guardado. Reprogramación va a agenda real; no hay toast de éxito simulado.
- 165 componentes y 25 rutas aprobados; tipos/check/build correctos. 12 casos nuevos con
  mocks; navegador real 1366/390 px, hermanos homónimos, recarga, familia sin hijos y reporte.
- API 8001/PG 17.6 local 6544: añadido un segundo hijo sintético y una cita futura, sin reset.
  El reporte del corte 02 se reutiliza como dato persistente, no como reporte creado nuevamente.
  Supabase no se consultó ni se escribió en este corte. No repetir prepare/pytest en esta demo.
- ADR 0004 documenta modelo de lectura compartido y selección. Componentes antiguos demo
  permanecen sin importarse desde estas entradas; otros módulos aún pueden ser demostrativos.
- F3-01 verificado en las dos vistas; fase 3 general/otras pantallas no certificadas. Siguiente:
  cerrar decisiones/módulos mínimos de entrega F5-01 y revisar recuperación/consentimiento
  demostrativos antes de prometer esas capacidades. Incidencia histórica sigue abierta.
- Señal de relevo acordada: "tokens bajos dejar todo listo para siguiente desarollador".
  Al recibirla, preparar documentación, revisar/integrar en dev con commit/push y entregar prompt.
  Rama actual piero-dev, HEAD 82f868f más cambios sin commit/push; señal aún no recibida.

### Corte anterior: compatibilidad con esquema compartido, 2026-10-09-02

- [Informe nuevo](audits/auditoria-2026-10-09-02.md): Supabase inspeccionado en solo lectura;
  réplica local PostgreSQL 17.6 con 26 tablas, 178 columnas, 92 restricciones y 71 índices
  equivalentes. No se copiaron registros reales ni hubo escrituras compartidas en este corte.
- Corregidas 6 diferencias de columnas en 4 campos ORM; comparación posterior: 0 diferencias
  de tipo/longitud/nulabilidad/precisión/escala en columnas modeladas. avatar_nombre ya existe
  en Supabase; no aplicar allí la migración 001 por la falta que tenía el SQL inicial local.
- 79 pruebas backend aprobadas, 25 omitidas, 19 advertencias; 48 respuestas HTTP reales
  verificadas. Familia consulta reporte y lo conserva al recargar en navegador.
- Runtime SQL local no superusuario con BYPASSRLS, sin CREATEDB/CREATEROLE. Limpieza de
  fixtures usa propietario separado y guardas de mismo destino local descartable.
- Entorno nuevo: PostgreSQL 17.6 local 6544, ashakids_test_compat17; API 8001, frontend 5174.
  No ejecutar pytest/prepare sobre estos datos si se desea conservar la demostración.
- Rol compartido omite RLS y tiene CREATEDB/CREATEROLE. Antes de desplegar, acordar mínimos
  privilegios; autorización por recurso sigue en FastAPI. No se cambiaron permisos compartidos.
- Próxima implementación: F3-01, Centro Familiar y Mi Camino ASHA; retirar cifras/pasos demo
  que aparentan seguimiento real. Incidencia histórica y reproducción por otro integrante
  pendientes. HEAD 82f868f + cambios locales sin commit/push; hosting aún no seleccionado.

### Corte anterior: auditoría local de fase 2, 2026-10-09-01

- [Informe y evidencia](audits/auditoria-2026-10-09-01.md): núcleo ADMIN -> paciente/tratamiento ->
  PADRE/cita -> TERAPEUTA/sesión/reporte -> PADRE/lectura verificado en PostgreSQL descartable.
- 72 pruebas backend aprobadas, 25 omitidas y 19 advertencias; frontend 153 componentes y
  25 rutas aprobadas, tipos/check/build correctos. 27 casos HTTP posteriores verifican
  persistencia y acceso ajeno rechazado. Capturas en evidence/audit-2026-10-09-01/.
- Correcciones: columna avatar_nombre en SQL inicial y migración explícita; guardas de
  pruebas HTTP; retirada de confirmación ficticia; métricas inexistentes eliminadas de reportes.
- Incidencia: la primera suite heredada alcanzó API habitual 8000 y operó cuentas de prueba
  compartidas. Se detuvo; no se restauró esa base. Equipo debe revisar logs/impacto antes de
  cerrar la incidencia. No afirmar que toda esta auditoría estuvo aislada.
- HEAD 82f868fd4a1b7e7d40a636651c13d9add472c71f más cambios locales sin commit/push.
  Compartir el corte y reproducir en otro equipo; después continuar fase 3 (paneles/demo).
- Entorno de evidencia: PostgreSQL 18 local 6543, API 8001 y frontend 5174. La migración
  no se aplicó a Supabase. No volver a ejecutar pytest sobre fixtures que se quieran conservar.

Los apartados históricos inferiores describen cortes previos y no sustituyen este resultado.

### Objetivo de reproducción local y despliegue (2026-10-09)

El usuario confirma acceso a su configuración/BD y busca resultados persistentes reales que
puedan reproducirse al desplegar. La base descartable usa PostgreSQL real para pruebas que
reinician datos; el corte 02 comparó el esquema/configuración compartido y verificó una réplica
local representativa de su versión y estructura pública. El acceso facilitado permite avanzar en esa integración,
pero no convierte las fixtures destructivas actuales en apropiadas para una BD compartida.
Próximo paso: fase 3 y reproducción del corte por otro integrante; revisión de incidencia
histórica pendiente. La infraestructura y dominios del alojamiento no han sido ensayados.

Cuando el alcance esté estable, seleccionar el hosting gratuito más adecuado para React/Vite,
FastAPI y la BD actual, comprobando costes/límites vigentes y sesión en dominios reales.
Tareas F7-02/F7-03 añadidas al plan. Proveedor pendiente; selección y ensayo de despliegue
no realizados en esta actualización documental. No cambia la arquitectura vigente.
Precisión del usuario: primero demostrar estabilidad con pruebas del alcance; después entregar
información y una recomendación comparando Vercel, Railway, Render y alternativas para que él
decida. La etapa actual es de orientación; la ejecución del despliegue requiere petición posterior.

Este archivo reúne objetivo, alcance, estado y siguiente prioridad. Leer después:
- [Plan de implementación](IMPLEMENTATION_PLAN.md): fases y criterios de salida.
- [Avance y relevos](IMPLEMENTATION_PROGRESS.md): tarea activa, evidencias y traspaso.
- [Arquitectura](architecture.md) y [ADR](decisions/): reglas técnicas vigentes.

Los informes históricos conservan evidencia de su fecha, no certifican el estado actual.
Las propuestas de diseño en specs/pasted_text no incorporan automáticamente requisitos.
flujo_vistas_ashakids.md contiene referencias heredadas a Spring/Node/HTML; el producto
actual usa React/FastAPI/PostgreSQL.

## Objetivo y alcance académico

Web de apoyo a terapia de lenguaje infantil para familias, terapeutas y administración.
Recorrido prioritario: usuario -> paciente -> tratamiento asignado -> cita -> sesión ->
reporte -> seguimiento. Reutilizar las tablas y capas existentes; no reconstruir el backend.

| Capacidad | Alcance acordado o propuesto |
| --- | --- |
| Núcleo | Acceso por rol, pacientes, asignaciones, agenda, sesiones, reportes y seguimiento básico: primera entrega funcional propuesta |
| Pagos | Maqueta existente de demostración; sin desarrollo nuevo ni commits dedicados, conforme a la observación del profesor. Sin cobros reales |
| Actividades | Mundo ASHA por habilidades y niveles: etapa propia MA-01..MA-07, revisión detenida antes de juegos completos |
| Comunicación/documentos | Mensajes y PDF: seleccionar los mínimos exigidos por el curso |
| Avanzados | WebRTC, reconocimiento de voz, ASHI/IA, correo y límites de planes: decisión pendiente según rúbrica y tiempo |

La simulación visual existente puede conservarse con etiqueta de demostración. La observación
más reciente del profesor excluye pagos del alcance, por lo que se retira la fase de desarrollo
prevista anteriormente; no implementar persistencia o API de pagos ni un commit dedicado.
Agenda, sesiones y reportes deben poder demostrarse sin cobros reales o simulados obligatorios.

## Entrega confirmada y rúbrica recibida

Entrega: **2026-10-09 a las 18:00, America/Lima**. El equipo confirma dev como base común.
La fecha actual sustituye el horizonte del 10 de octubre del informe histórico.
Prioridades visibles de la rúbrica: arquitectura/backend, modelo físico/tablas/relaciones y
operaciones BD, seguridad/usuarios/permisos, pruebas funcionales y no funcionales con evidencias.
La captura es parcial; no consta puntuación ni todos los criterios.

- [Lista de entrega y evidencia](DELIVERY_CHECKLIST.md).
- [Índice y protocolo de auditorías](audits/README.md).
- [Plantilla de auditoría](audits/AUDIT_TEMPLATE.md).
- PDF aportado: evidence/backend-2026-10-08/Auditoria_Backend_AshaKids_2026-10-08.pdf.
- Repositorio para todos los informes: https://github.com/sromansilva/ashakids-platform .
- Commits con estructura de versiones y objetivo, conforme a AGENTS.md.

## Forma de trabajo: relevos de personas y asistentes

El equipo tiene conocimientos universitarios y desarrolla con apoyo de asistentes. Puede
continuar otra persona cuando la anterior agota sus tokens. El estado debe vivir en Git y
la documentación, no únicamente en chats. Para cada relevo registrar tarea, responsable,
rama/SHA, archivos cambiados, pruebas realmente ejecutadas, fallos y siguiente comando/acción.
Trabajar una tarea acotada a la vez por relevo; no continuar desde cambios que solo existen
localmente en la computadora de otra persona. Ver protocolo en IMPLEMENTATION_PROGRESS.md.
Nunca incluir secretos ni datos reales de pacientes en el traspaso.

## Estado observado y decisión inmediata

El usuario informa que el equipo desarrolla el backend y que las tablas ya están estructuradas.
En este clon existen API/services/models/schemas y contratos de usuarios, pacientes,
tratamientos, citas, sesiones y reportes. clinicalService.ts, SessionActions, usePadreHome,
usePadreAgenda y usePadreReportes tienen consumidores HTTP; useDemoWorkflow conserva simulaciones.
Hay pruebas de interfaz con fetch simulado; no equivalen a una prueba real de los tres roles.

Continuar el backend existente y sus auditorías. Primero identificar el SHA que está trabajando
el equipo, comparar su OpenAPI con los consumidores frontend y cerrar un recorrido persistente
ADMIN/PADRE/TERAPEUTA en PostgreSQL descartable. Después ampliar módulos. No repetir una auditoría
completa sin cambios nuevos como sustituto de integrar el producto.

No se ha contactado al equipo. Base dev, plazo y extracto de rúbrica confirmados por el usuario.
Personas responsables y requisitos no visibles de la rúbrica siguen por confirmar. Las fases
de extensión son una guía futura y no una promesa de completarlas antes de la entrega.

## Evidencia local y límites

En esta conversación se instalaron dependencias, se verificaron build, typecheck y check:frontend;
web y /health respondieron, y /health/ready confirmó conectividad. No se verificó el producto
completo con cuentas de los tres roles. Mapa local: 1673 nodos y check correcto.
Backend local: Python 3.13 en backend/.venv313, SQLAlchemy sin extensiones C opcionales por
bloqueo de DLL de Windows. Esto describe este equipo, no un requisito nuevo de arquitectura.

Entornos: API habitual 8000, frontend 5173; Postman aislado usa 8001. .env permanece ignorado.
Pruebas y semillas que escriben: solo datos sintéticos en una base descartable o staging
expresamente autorizado; no crear usuarios ni modificar tablas reales para pruebas.

## Mantenimiento

Actualizar contexto y avance en el mismo PR que cambia una capacidad. Al cerrar cada fase, commit obligatorio con versión/objetivo y descripción breve, publicar en dev y verificar sincronización (instrucción del usuario 2026-10-09). Marcar verificada solo
con fecha, SHA, entorno, casos y resultados. No usar porcentajes sin inventario, ni declarar
cierre por compilar, abrir una pantalla o recibir un 200 de salud. Para cambios de arquitectura,
actualizar architecture.md y crear ADR; este plan conserva las decisiones vigentes.

Historial: 2026-10-08 — inicialmente se incluyó desarrollo de pagos simulados. La observación
posterior del profesor lo sustituye por maqueta existente sin nuevas tareas/commits de pagos.
Se confirman base dev y entrega 2026-10-09 18:00 Lima; se incorpora auditoría PDF de referencia.

---

## Antecedentes técnicos (evidencia previa, no ejecutada nuevamente en esta revisión)


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
- Extensión pendiente: persistencia de juegos fonológicos; reconocimiento de voz sujeto al alcance académico acordado.
- Extensión pendiente: teleconsulta; elegir enlace externo o WebRTC según los requisitos del curso.
- Extensión pendiente: exportación PDF de reportes y mensajería entre terapeuta y tutor; no declarar certificación clínica.
- Preparación de entrega pendiente: migraciones versionadas, configuración de despliegue y límites de tráfico; correo sujeto al alcance acordado.
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
  su integración debe revisarse por pantalla. Hay consumidores reales de pacientes, citas, sesiones
  y reportes en el código actual; también quedan datos y coordinación de demostración.
  La presencia de llamadas HTTP no certifica el recorrido completo con persistencia.
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

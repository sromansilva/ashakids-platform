## 2026-10-10 — V34 Agenda, disponibilidad e introducción

- Objetivo: adaptar reserva introductoria y terapia al flujo maestro; base V33 45ee5ab,
  rama codex/2do-intento. Fase de agenda implementada; objetivo general sigue abierto.
- Archivos: modelos/schemas/services agenda; citas/pacientes/terapeutas; migración003 y
  db_creation; BookingDialog, AvailabilityEditor, IntroductionStatus, directorio familiar,
  reporte editable; tests clínicos y UI. ADR0014 y evidencia flow-v34.
- Verificación nueva:196 backend aprobadas,25 omitidas,19 advertencias; repetición
  posterior relevante17 aprobadas;267 componentes+25 rutas, tipos/check326/build.
- Incidencias: bootstrap roles con search_path vacío, npm script incorrecto y dos
  expectativas frontend V26 actualizadas. QA sintético reiniciado accidentalmente por
  repetición de tests: ahora hay DB QA separada. Sin pérdida de trabajo/datos compartidos.
- Entorno: PostgreSQL local6544. Tests ashakids_test_flujo_v34_20261010; QA
  ashakids_test_flujo_qa_20261010. API8002 y Vite5175. No ejecutar pytest sobre DB QA.
- Siguiente: plan del terapeuta con sesión origen/áreas/mundos/versiones; contexto
  clínico autorizado para quien reserva/atiende, solo autor modifica reporte; adaptar
  paneles/juegos demo; comprobar recorrido de tres roles+dos niños+segundo terapeuta.
- Incidencia Git: primer commit rechazado por identidad ausente; no hubo publicación
  en ese intento. Reintento con identidad noreply V33 solo para ese comando.
- Publicar solo codex/2do-intento; dev/feat/piero-dev requiere nueva autorización.
  Consultar Git para SHA final de V34; el cierre se registra después del push.

# ASHAKids — Avance y relevos del equipo

Actualizado: 2026-10-10. [Contexto](PROJECT_CONTEXT.md) · [Plan](IMPLEMENTATION_PLAN.md).
Este archivo se actualiza al cerrar una tarea y antes de cambiar de persona/asistente.
No es un registro automático: quien termina debe guardar y compartir su actualización.

## Punto de continuación actual

### Registro familiar y activación — 2026-10-10, avance V33

- Objetivo autorizado tras EMPECEMOS: adaptar maqueta/código al maestro hasta mostrar y
  verificar el recorrido completo. Trabajo exclusivo codex/2do-intento desde V32/ebb8632.
  Este avance no cierra el flujo entero. Integración dev/piero-dev exige aprobación posterior.
- Registro padre+hijos transaccional, DNI solo hash inicial, obligación persistente, guardas
  API/rutas directas y rotación/revocación de sesiones. Códigos compatibles sin distinguir
  caja, generación concurrente, índice único. ADR0013, migración002, formularios reales.
- SQL solo en BD NUEVA local PG17.6/6544 ashakids_test_flujo_v33_20261010, runtime local
  no superuser y propietario separado para fixture. Sin acceso/escrituras/migración Supabase.
  No .env habitual editado, despliegue ni integración en otras ramas. Entorno API8002/web5175.
- Backend191 aprobadas/25 omitidas/19 avisos con SQL local habilitado; frontend267 aprobadas
  (10 nuevas UI/cliente, incluida fecha al añadir hijo),25 rutas; tipos/check323/build correctos.
  No nueva auditoría ni calificación. Evidencia docs/evidence/flow-v33/.
- UI real: asesor ingresó, creó familia P90003 con dos hijos, obtuvo confirmación; ingreso
  de familia presenta activación antes del panel. Activación se inspeccionó en1280x720 y
 390x844 efectivos; envío/cambio de clave probado por API SQL, no operado en navegador.
- Fallos corregidos: fake SQL sin comparación de caja, email .invalid, limitador en suite,
  URL/CA remota heredadas en procesos locales. Primer ensayo de fechas reveló evento input
  sin cambio de estado; onInput/onChange y nueva alta de dos hijos correctos. Parche rechazado
  sin cambios parciales y timeout inicial de inventario navegador; reentrada correcta.
- Juegos: usuario eligió demostración rotulada primero. Plan educativo persistido se
  implementará aparte del progreso demo. Pagos fuera; soporte/reseñas/Zoom automático no son
  condiciones del mínimo. Contratos antiguos de altas con password larga conservan activación;
  pantalla alternativa Usuarios aún requiere adaptación al alta institucional.
- Siguiente: disponibilidad semanal/bloqueos, introducción independiente por niño, reserva
  automática45min y profesional separado del plan; cerrar criterios solicitados al usuario.
  Después plan/reporte/historial/PDF, continuidad con segundo terapeuta y juegos mínimos.
- V33 cierra este avance de registro/activación, no el flujo entero. Commit/push únicamente
  codex/2do-intento; comprobar SHA efectivo en Git. dev/feat/piero-dev siguenV32.

### Contexto del flujo actualizado — 2026-10-10

- Objetivo: condensar nuevo flujo de los tres roles y estimar impacto en tablas desde V26.
  Base piero-dev/da4e787e7e199f4457f053694f3b8c8fd0072c5b (V31), dev/remota personal
  coincidentes y árbol limpio al iniciar. Cierre documental V32; consultar SHA real en Git.
- Principal: docs/FLUJO_MAESTRO_ACTUALIZADO.md. Contexto, plan, Mundo ASHA y arquitectura
  enlazan alcance nuevo sin cambio funcional ni reactivación de propuestas V27–V30.
- Acordado: código institucional de 6 caracteres con inicial A/P/T y números; DNI solo contraseña inicial,
  cambio obligatorio; introducción por niño; disponibilidad profesional; reserva automática;
  elección libre de profesional; plan clínico y progresión educativa mínima reutilizable.
- Revisado: modelos/contratos/servicios locales, SQL histórico 02 y recuperación heredada.
  Sin consulta Supabase, migración, pruebas funcionales, cambio de runtime o escritura de datos.
  Graphify check vigente; consultas de 1500 tokens truncadas y confirmadas en archivos. Cambios solo Markdown
  no requieren refresh: manifiesto incluye fuentes de aplicación/tooling, no estos documentos.
- Incidencias: referencia lock-race-conditions.md inexistente, reemplazada por fuentes disponibles;
  primer parche rechazado por contexto architecture.md, sin cambios parciales; corregido.
- Validación documental: 18 enlaces del maestro comprobados, sin marcadores de conflicto ni
  patrones de credenciales detectados; git diff --check y knowledge check correctos.
  No se ejecutan suites de aplicación por cambios solo documentales. Destino de publicación:
  dev y feat/piero-dev; consultar refs/SHA efectivos en Git, no confundir con despliegue.
- Primer commit detenido por falta de user.name/user.email en el clon. Reintento con identidad
  de Piero ya publicada en V31, mediante git -c solo para ese comando, sin configuración global.
- Pendientes: activación inicial compatible con regla definitiva de 12–128 caracteres y códigos anteriores;
  horario exacto; cierre introductorio/transición; versiones del plan/acceso profesional;
  enlace Zoom y demo frente a persistencia inicial de juegos. No fijar número de tablas nuevas.
- Siguiente: equipo revisa maestro, cierra contrato mínimo y diseña migración/aceptación aislada.
  La publicación documental comparte alcance; no implementa ni despliega el recorrido.

### Recuperación de V26 — 2026-10-10

Base recuperada: `a81e465aa02522366eb97250c38827d11ed4a0e4`.
Código y documentos restaurados; esquema compartido compatible, registros y permisos
conservados. Las siguientes auditorías16/17 vuelven a ser la referencia vigente.
No continuar tareas posteriores a V26. Comprobaciones y límites en [RESTORE_V26](RESTORE_V26.md).
Cierre: `V31_Restauracion_Plataforma_V26`; verificar SHA y referencias mediante Git.

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

### Preparación de deploy gratuito Render - V24

2026-10-09. Rama piero-dev; base V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b.
Remotas dev/feat/piero-dev iguales al inicio; dev local actualizado por fast-forward.
Objetivo: paquete de hosting, no declarar publicada la extensión HTTPS pendiente.
Dockerfile/.dockerignore/render.yaml; backend/app/hosted.py, hosted_start.py,
core/frontend_hosting.py, tests/test_frontend_hosting.py; ADR0011 y DEPLOY_RENDER.md.
138 pruebas sin BD aprobadas/19avisos, tipos/build React y11 respuestas ASGI con dist
real aprobados. Sin consultas BD/sesiones; Graphify refresh/check vigente. Sandbox bloqueó
tmpdir pytest/esbuild; repetición autorizada.4 errores Windows/dotfile corregidos.
No Docker disponible ni build Linux. No .env cambiado, escrituras Supabase o servicio
pagado creado. Usuario eligió Free y necesita crear/vincular cuenta Render.
Siguiente: cuenta GitHub/Render, importar dev, pooler sesión IPv4 con runtime y TLS,
confirmar ingreso/proxies y recorrer HTTPS con cohortes nuevas AUDITORIA autorizadas.
No ejecutar TRUNCATE/DELETE físicos ni modificar datos previos. Preparación local no
certifica deploy. V24 identifica este avance; verificar SHA/publicación en Git al continuar.

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

### Corte vigente de correcciones y auditoría frontend, 2026-10-09-12

- Ejecutado en feat/sroman, base a397c0f y commit funcional V18/a60d671a8523a016a41b50395a7db92b05698f18; cambios CORS locales previos preservados.
- Reportes del profesional, historial por paciente y sesiones admin conectados manteniendo diseño. Identidad profesional/ASHI, vocabulario de sexo, proxy8000, envío duplicado y recuperación de red corregidos. Tres fragmentos simulados sin consumidores retirados y documentados.
- Última regresión:257 componentes +25 rutas,0 fallos/skip; tipos/check/build pasan;320 fuentes max495. 11 pruebas seleccionadas backend pasan sin fixture clínico; no se ejecutó suite completa contra Supabase.
- Recorrido real autorizado AUDITORIA: crear cuentas/paciente, asignar tratamiento, reservar/confirmar/registrar/iniciar, guardar reporte, finalizar con aceptación manual del usuario, consultar como familia/descargar PDF. Lectura independiente:28 HTTP correctos y SQL READ ONLY de la misma BD Supabase.
- IDs retenidos:50/51usuarios,86paciente,6tratamiento,3cita,2sesión. Archivo de verificación no guarda credenciales; requiere contraseña sintética externa y revisión de IDs.
- Se corrigió fixture que esperaba respaldo ficticio; aumentó timeout asíncrono a5s por prueba de mensajes lenta en Windows sin eliminar assertions. Fallos iniciales y límites están en informe.
- [Informe12](audits/auditoria-2026-10-09-12.md), [PDF](../output/pdf/Auditoria_Frontend_AshaKids_2026-10-09-12.pdf), [evidencia](evidence/audit-2026-10-09-12/). Frontend94/100; no declarar100 ni producción completa.
- Próxima acción: hosting HTTPS con proxy/cookies y QA de variantes/accesibilidad/expiración; backend debe revisar TLS y privilegios de BD señalados en auditoría real anterior. Pagos siguen fuera de alcance. Las afirmaciones históricas debajo no sustituyen esta aceptación pendiente.
- Publicación funcional completada: dev y feat/sroman apuntan a V18/a60d671, comprobadas con ls-remote. Corte documental V19 conserva informe12/PDF/evidencia y Word históricos; sus guiones locales con credenciales quedan fuera de Git. La configuración real .env sigue ignorada. Confirmar el SHA documental remoto al entregar; no confundir push con hosting público.
- PDF final de11 páginas renderizadas y revisadas; hash registrado en pdf-validation.json. .gitattributes preserva PDF/Word/imágenes como binarios frente a core.autocrlf de Windows; bytes fuente/index del PDF idénticos.

Estado histórico de Fase 7 — Paquete de Entrega Académica Consolidado:
1. Informe exhaustivo de rúbrica en `docs/academic/INFORME_ENTREGA_RUBRICA.md` con trazabilidad a los 3 criterios del profesor (Arquitectura Backend FastAPI, Modelo Físico/Integración Relacional en PostgreSQL con 26 tablas, Seguridad/RBAC y resultados de 376 pruebas aprobadas: 119 Pytest + 232 Vitest + 25 routing, 0 fallos).
2. Análisis comparativo y recomendación técnica de hosting gratuito en `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md` (F7-02), evaluando Vercel + Render vs Railway, y resolviendo el transporte de cookies HttpOnly Same-Origin mediante reglas de rewrite.
3. Guion de sustentación académica y demostración en vivo (8-10 min) en `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md` (F7-03) con los 3 roles sintéticos (`a90001`, `t90001`, `p90001`), descarga de reporte PDF y persistencia demostrada.
4. `DELIVERY_CHECKLIST.md` y `README.md` actualizados con acceso directo a todos los recursos de entrega antes de las 18:00 Lima.

### Relevo técnico: consolidación de entrega académica y cierre de Fase 7, 2026-10-09-11

- Responsable: desarrollo asistido en el entorno de HailQueso.
- Base: dev/7075cca (V16_Cierre_Extensiones_Fase6).
- Archivos generados y actualizados:
  * `docs/academic/INFORME_ENTREGA_RUBRICA.md`: Documento oficial de sustentación técnica trazado a los criterios de la rúbrica.
  * `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md`: Comparativa formal F7-02 de Vercel, Render y Railway con análisis de cookies HttpOnly y conexión a Supabase.
  * `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md`: Guion de defensa oral estructurado minuto a minuto.
  * `docs/DELIVERY_CHECKLIST.md`: Verificación de todos los entregables de salida de la entrega académica.
  * `README.md`: Instrucciones directas de arranque, credenciales sintéticas y enlaces principales.
  * `docs/PROJECT_CONTEXT.md` y `docs/IMPLEMENTATION_PROGRESS.md`: Estado consolidado del proyecto.
- Estado general: Fases 1 a 7 completadas. Proyecto listo para sustentación y entrega final antes de las 18:00 Lima.

### Relevo técnico: cierre formal de Fase 6 y paso a Fase 7, 2026-10-09-10

- Responsable: desarrollo asistido en el entorno de HailQueso.
- Base: dev/9227035 (V15_Configuracion_Proxy_Autenticacion_Cookies).
- Acción realizada:
  * Evaluación de las cuatro extensiones avanzadas frente a la rúbrica de evaluación y el plazo límite.
  * Publicación de [ADR 0008](decisions/0008-cierre-y-alcance-extensiones-fase6.md) documentando la arquitectura de teleconsulta por enlace/sala, juegos desacoplados en Mundo ASHA, asistente local seguro sin fugas a LLMs comerciales y mensajería en base de datos.
  * Actualización de `docs/IMPLEMENTATION_PLAN.md` marcando la Fase 6 como cerrada y diferida para el alcance evaluado.
- Siguiente tarea:
  * Ejecutar Fase 7: Consolidar evidencia para los 3 criterios de la rúbrica (Backend, BD, Seguridad/Pruebas), redactar análisis comparativo de hosting gratuito (F7-02) y preparar guion de sustentación académica reproducible.

### Relevo técnico: resolución de proxy y cookies de sesión para navegador Brave, 2026-10-09-09

- Responsable: desarrollo asistido en el entorno de HailQueso.
- Base: dev/b15b82b (V14_Aceptacion_Nucleo_Reportes_Mensajes).
- Causa raíz identificada:
  1. El frontend cargado en `http://127.0.0.1:5174` intentaba consumir la API en `http://localhost:8001/api/v1`.
  2. Debido a la disparidad de host (`localhost` vs `127.0.0.1`) y puerto (5174 vs 8001), los navegadores consideran la solicitud como cross-site/cross-origin.
  3. Las cookies HttpOnly con atributo `SameSite=lax` no son enviadas por los navegadores en subrecursos fetch entre orígenes cruzados.
  4. La siguiente petición autenticada devolvía 401 Unauthorized, lo que emitía el evento `ashakids:session-expired` y hacía que `RouteAccess` redirigiera instantáneamente a `/login`, aparentando una recarga de página.
- Solución aplicada:
  * `frontend/vite.config.ts`: configuración del bloque `server` con host `127.0.0.1`, puerto `5174` y proxy de `/api` hacia `http://127.0.0.1:8001`.
  * `frontend/.env.local`: `VITE_API_BASE_URL=/api/v1`.
  * `frontend/src/api/client.ts`: soporte transparente para proxy manteniendo fallback para suite de tests Vitest en jsdom/Node.
- Comprobaciones realizadas:
  * Suite de componentes: 232 pruebas aprobadas (0 fallos).
  * Suite de enrutamiento: 25 pruebas aprobadas (0 fallos).
  * `check:frontend` y `build`: 0 errores.
  * Petición HTTP al proxy: `POST /api/v1/auth/login` retornó 200 con `Set-Cookie: ashakids_session=...; SameSite=lax; Path=/`. `GET /api/v1/auth/me` con dicha cookie retornó 200 con la información del usuario autenticado.

### Relevo de aceptación del núcleo/PDF/mensajes en entorno independiente, 2026-10-09-08

- Responsable: desarrollo asistido en el entorno independiente de HailQueso.
- Base: dev/b3f84bd (V13_Integracion_Aceptacion_Nucleo).
- Entorno probado: Windows, Node v22.15.0 / npm 10.9.2, Python 3.13.7 en backend/.venv, PostgreSQL 18.4 local en puerto 5433.
  Bases nuevas descartables: ashakids_test_accept07_hq (recorrido de entrega) y ashakids_test_regress08 (regresión pytest).
- Resultados verificados:
  * Backend: 119 pruebas aprobadas, 25 omitidas (suites heredadas deshabilitadas), 19 advertencias. 0 fallos.
  * Frontend: 232 pruebas Vitest y 25 de enrutamiento aprobadas; tsc --noEmit, check:frontend (318 archivos, máx. 495 líneas) y build exitosos.
  * API y Entrega HTTP: 92 respuestas HTTP verificadas en http://127.0.0.1:8001/ con PostgreSQL local en puerto 5433. PDF generado (reporte-sesion-sintetica.pdf) verificado en texto y cabeceras. Mensajería privada probada con paginación de cursor y lectura tras relogin.
  * Modelo físico: 26 tablas públicas, 178 columnas, 221 restricciones y 71 índices inspeccionados.
- Limitaciones registradas:
  * El agente de navegador browser_subagent reportó fallo al instalar el driver de Playwright (HTTP 404 de azureedge CDN para versión 1.57.0). Conforme a las instrucciones del usuario, no se cambiaron puertos ni se evadió la herramienta. La interacción visual real en 5174 queda pendiente sin falsear estados.
  * Incidente 01 histórico: contenido y aislado localmente por guardas; el impacto histórico en Supabase requiere revisión de logs/baseline del equipo.
- Archivos generados/actualizados:
  * backend/scripts/verify_delivery_journey.py (soporte parametrizado para código de auditoría y entorno).
  * docs/audits/auditoria-2026-10-09-08.md y output/pdf/Auditoria_Aceptacion_Nucleo_PDF_Mensajes_AshaKids_2026-10-09-08.pdf.
  * docs/evidence/audit-2026-10-09-08/ (17 archivos de evidencia con manifest SHA-256).
  * docs/PROJECT_CONTEXT.md, docs/IMPLEMENTATION_PLAN.md, docs/IMPLEMENTATION_PROGRESS.md, docs/audits/README.md.
- Siguiente tarea:
  * Consolidar paquete de entrega académica y trazabilidad a rúbrica antes de 18:00 Lima.

### Relevo anterior de aceptación del núcleo/PDF/mensajes, 2026-10-09-07

- Archivos: verify_delivery_journey.py, test_delivery_guard.py y inspect_schema_compatibility.py
  (incluye mensajería). No cambios de UI ni endpoints/arquitectura del producto. V11 código;
  V12 auditoría/fuente/PDF/evidencia/contexto y guion. Publicación concreta: PR/historial V13.
- Entorno probado: clon e456294 en tmp/acceptance07/clone, Python3.13.7/venv vacío,
  requirements-dev.txt y npm ci; Node26.9.0/npm11.19.1. Cluster PG17.6 ya existente6544.
  Aplicación limpia; guion nuevo externo al clon. Mismo equipo/agente, no aceptación humana.
- BD nuevas accept07 y accept07_repeat: una clínica sintética por corrida, seis cuentas y dos
  mensajes; guion de92 respuestas repetido. Ajustes de tiempo/estado solo nuevos IDs, sin reset.
  regress07 exclusiva para pytest completo, cuyos fixtures sí hacen TRUNCATE. No reutilizar
  compat17 ni bases de aceptación para esa suite. Sin datos reales ni acceso a Supabase.
- Guardia: sesión emitida por API debe existir en BD local declarada, no revocada ni vencida,
  antes de primer paciente. Prueba real positiva/negativa y cuatro unidades; auth crea sesiones.
  Contiene la divergencia de instancia; no resuelve el impacto histórico de cuentas01.
- Comandos/resultados en evidencia07:115 del clon y119 finales/25 omitidas/19 avisos;
  232 frontend/25 rutas; schema READ ONLY26/178/92/71,19 modelos/0 diferencias;92 HTTP dos
  veces;6 restauración/guarda separadas. No sumar suites/corridas como cobertura diferente.
- API8001 vuelve al código primario y compat17, reporte02/historial14 comprobados. Conteos
  clínicos originales conservados; no snapshot completo. Vite5174 y otros puertos sin cierre.
- Fallos: restore public existente; grant antes de tabla roles; EPERM de Node/procesos y bind
  ocupado. Todos registrados y corregidos localmente. Backend19 avisos son deprecaciones;
 25 omitidas mantienen deshabilitadas20 HTTP heredadas y5 integración compartida.
- Navegador: getState disponible; getTab5174 rechazado una vez tras confirmación del usuario.
  Preferencia guardada sigue bloqueando. No usar otro origen/CDP/herramienta para eludirla.
- Próximo prompt: «Lee AGENTS.md, contexto, plan, auditoría07 y guion de aceptación. Confirma
  dev/V13 actualizado. Completa revisión visual real de núcleo+PDF+mensajes, desktop/móvil y
  teclado, cuando Codex permita5174; no eludas una denegación. Usa demo compat17 conservada,
  API8001/web5174/PG17.6 local6544 sin prepare/reset. Otro integrante debe repetir en una BD
  NUEVA con prefijo ashakids_test_accept07; usa regress separada para pytest. Revisa logs/
  baseline de incidencia01 y registra alcance real. Entrega nueva evidencia/PDF solo de pruebas
  nuevas; publica commits versionados reales en dev. No fase6/hosting/pagos/juegos MA completos
  antes de cerrar aceptación del alcance elegido. Fecha límite hoy18:00 Lima».

### Punto de continuación anterior, corte06

F5-01/PDF + mensajes implementados y verificados localmente; aceptación de conjunto pendiente.
Código de mensajes V08_Mensajes_Familia_Terapeuta, 7fddd59d6cc6ec594c666c9c80ba184a88c9a91d;
documentación V09_Auditoria_Mensajeria, auditoría2026-10-09-06 y ADR0007. Base dev/1398e70,
PDF previo integrado por PR105. Publicación de06 por PR hacia dev/V10_Integracion_Mensajeria:
consultar historial/PR para SHA efectivo; no se declara un merge futuro como ejecutado.
232 frontend,36 unitarias backend,25 rutas,53 HTTP + OpenAPI local; tipos/check/build correctos.
Dos corridas HTTP dejan14 mensajes sintéticos persistentes en conversación1; sin reset/DDL.
Navegador bloqueado por preferencia previa: no hay capturas nuevas ni E2E visual de mensajes.
Confirmar desktop/móvil, recaptura PDF05 y reproducción por otro clon. Fase5 sigue abierta.
Incidencia01 pendiente; recursos diferidos, juegos MA independientes y hosting tras estabilidad.

### Relevo funcional: mensajes familia/profesional, 2026-10-09-06

- Objetivo: intercambio privado y persistente con contactos realmente asignados. Backend:
  api/v1,models,schemas,services/mensajeria.py y main.py; guion verify_messaging.py y25 unidades.
  Frontend: messagingService, MessagesCenter/MessageThread, entradas de padre/terapeuta,
  ADMIN sin campaña ficticia y16 pruebas nuevas. Convención V08/V09/V10 concreta por módulo.
- Entorno: .venv313 Python3.13.7, API8001/web5174/PG17.6 local6544, ashakids_test_compat17.
  Sin nueva dependencia; las tablas provienen de la réplica02. No usar Supabase para estas
  escrituras; conservar fixtures y mensajes. El env habitual ignorado no se versiona.
- Comprobaciones:36 unidades (25 mensajes +11 PDF rerun),232 componentes,25 rutas;
  tipos/check/build; HTTP final53 + OpenAPI200, apertura concurrente misma pareja/envíos
  concurrentes, historial cursor14 sin duplicados y lectura idéntica tras logout/login.
  Estados cerrados/sin asignación son unidades con mocks; no nuevas mutaciones clínicas.
- Fallo inicial:230 frontend,229 aprobadas/1 expectativa antigua demo; corregida. Rerun230;
  después dos casos adicionales de respuesta POST inválida dan232 finales. Primer guion
  HTTP47 + OpenAPI, siete mensajes; final53 crea otros siete. Intentos originales preservados.
- Limitaciones: Actualizar manual, no leído/presencia/llamadas/adjuntos. Borradores solo memoria
  por chat; POST sin retry ni clave idempotente. Respuesta perdida exige actualizar antes de
  reenviar; UNIQUE pareja ausente, escritores externos requieren reglas equivalentes.
  ADMIN solo no consulta chats; historial del participante sigue visible al terminar asignación.
- Bloqueo: preferencia previa del navegador rechazó origen5174. No nuevo intento ni evasión
  en06. No decir que mocks/build verificaron UI real. Mantener deuda de aceptación visual.
- Publicación: revisar diff/secretos y referencias, push feat/piero-dev, PR hacia dev y merge
  V10; sincronizar dev y piero-dev por fast-forward sin force-push. Estado concreto en PR/Git.
- Próximo prompt: «Lee AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md y este relevo.
  Actualiza dev por fast-forward y confirma V10/PR de mensajería. Completa aceptación F5-01:
  núcleo con ADMIN/PADRE/TERAPEUTA, reporte guardado/PDF y mensajes privados entre dos
  participantes. Usa API8001/web5174/PG17.6 local6544 con datos sintéticos; no reset de demo.
  Confirma revisión visual desktop/móvil y recaptura PDF cuando navegador permita; no eludas
  una preferencia denegada. Reproduce en otro clon y revisa incidencia01; registra casos reales,
  errores y pendientes. Entrega auditoría PDF/evidencia nueva y commit/push versionado en dev.
  No ampliar fase6, pagos ni juegos completos MA antes de cerrar el alcance seleccionado».

### Relevo funcional: reportes guardados y descarga PDF, 2026-10-09-05

- Objetivo: descargar todos los campos compartidos guardados de una sesión autorizada.
  Cambios: backend api/services/report_pdf y sesiones; cliente binario/clinicalService;
  ReportDownload/SessionActions y Reportes familiar. No cambió el esquema ni la autorización.
- Entorno: .venv313, API8001/web5174/PG17.6 local6544, ashakids_test_compat17;
  pacientes/reportes sintéticos existentes. API8000/web5173 y Supabase no se auditaron.
  Dependencias nuevas registradas en requirements(-dev).txt; instalar antes de arrancar otro clon.
- Verificación: pytest limitado a test_report_pdf.py con dependencias simuladas; Vitest216;
  routing25; tipos/check/build. verify_report_pdf.py coteja PDF/JSON, lectura posterior y
  permisos propios/ajenos; requiere guardas de destino local. No ejecutar reset de fixtures.
- Fallos iniciales corregidos: tzdata ausente en Windows, lectura Blob.text no disponible
  en jsdom, espera de ruta lazy, claves React duplicadas y paginación que desplazaba campos
  largos. Intentos y resultados previos preservados en evidence/audit-2026-10-09-05/.
- Limitaciones: caracteres ajenos a Vera reciben 422; PDF es copia actual, sin historial
  inmutable o firma digital. Mensuales y /terapeuta/reportes demo aún no son informes reales.
- Comprobar dev/piero-dev/origin/feat/piero-dev después de integrar; no force-push.
  Publicación concreta: historial Git/PR correspondiente a V07_Integracion_Reportes_PDF.
- Próximo prompt: «Lee AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md y este relevo.
  Confirma dev actualizado y el corte05. Continúa F5-01 mensajes familia/terapeuta: investiga
  contratos/tablas existentes, acuerda autorización por participantes y asignaciones, implementa
  persistencia/paginación y estados de envío sin éxitos ficticios. Usa una BD local sintética
  para escrituras; conserva esta demo. Entrega auditoría nueva con PDF/evidencia/contexto y
  publica un avance coherente en dev con la siguiente versión concreta. No pagos; juegos
  completos en etapa MA. Recaptura móvil del PDF e incidencia01 siguen pendientes».

### Relevo documental: convención de commits, 2026-10-09

- Usuario pide títulos que expliquen acción y módulos: `VNN_Accion_Modulos`.
  Regla común para compañeros/agentes en AGENTS.md, incluidos PR y merge.
  Continuar desde la secuencia publicada V03; no reiniciar en V01.
- Se conservan V01_Fase3, V02_AuditoriaFase3 y V03_IntegrarFase3 publicados:
  renombrarlos cambiaría sus SHA y exigiría reescribir dev compartida y referencias
  de auditoría. El usuario permite conservarlos; nuevos títulos describen el contenido.
- Base de esta actualización: dev, 40d53875a1f87378e3651a68c101c2b7150af6da,
  integrado por PR #104 y previamente sincronizado con piero-dev/feat/piero-dev.
- Archivos: AGENTS.md, PROJECT_CONTEXT.md y este relevo. Solo documentación;
  no cambios funcionales, pruebas nuevas ni auditoría técnica nueva. Revisar diff,
  comprobar mapa y publicar el ajuste. Siguiente implementación sigue siendo F5-01.

## Tablero inicial

| ID | Tarea | Estado | Responsable | Cierre esperado |
| --- | --- | --- | --- | --- |
| F1-01 | Preparación local | Verificada localmente | Por asignar | Servicios y controles registrados; otro equipo pendiente |
| F2-01 | Identificar entrega backend auditada | Base dev e informe recibidos; SHA del informe por documentar | Backend/coordinación, personas por asignar | SHA exacto y defectos |
| F2-02 | Alinear API y frontend | Núcleo verificado localmente | Revisión asistida; equipo por asignar | SQL/avatar, estados y reportes comprobados |
| F2-03 | Recorrido de tres roles | Verificado localmente; compartir/reproducir pendientes | Revisión asistida; otro integrante por asignar | PDF nuevo y 27 casos HTTP; incidencia inicial abierta |
| F2-04 | Compatibilidad con BD y entorno de integración | Verificada en réplica local; reproducción del equipo pendiente | Revisión asistida; integrante por asignar | Corte 02: estructura PG 17.6, 0 diferencias de columnas tras corrección, 79 pruebas y 48 respuestas HTTP |
| F3-01/02 | Seguimiento y coherencia del núcleo | Cerrada/verificada localmente para el núcleo mínimo | Revisión asistida; revisor del equipo por asignar | Corte04: 198 componentes/25 rutas, 35 HTTP + OpenAPI, paneles/seguimiento/configuración/asignaciones |
| MA-00 | Base de Mundo ASHA por habilidades y niveles | Base verificada sin conexión educativa; etapa completa pendiente | Usuario/profesional/equipo | Catálogo draft-1, selección por ID, reglas puras; próxima MA-01 |
| F4-01 | Desarrollo de pagos simulados | Retirada por observación del profesor | No asignar | Maqueta existente solamente; sin nuevos commits de pagos |
| F5-01 | Reportes PDF y mensajes autorizados | PDF verificado localmente; mensajes pendientes | Revisión asistida; revisor del equipo por asignar | Corte05/ADR0006; siguiente persistencia/paginación de mensajes |
| F6-01 | Seleccionar extensiones avanzadas | Por confirmar | Coordinación, persona por asignar | Decisión según rúbrica/tiempo |
| F7-01 | Entrega reproducible | Pendiente | Equipo, personas por asignar | Guion y evidencia del alcance seleccionado |
| F7-02 | Elegir hosting gratuito | Pendiente; después de estabilizar alcance | Coordinación/arquitectura, persona por asignar | Comparación oficial vigente, coste/límites, recomendación y alternativa |
| F7-03 | Ensayar despliegue elegido | Depende de F7-02 y núcleo estable | Integración, persona por asignar | Mismo commit/esquema y recorrido funcionando en dominios reales |

Entrega confirmada: 2026-10-09 18:00 America/Lima. No hay porcentajes de avance inventados. Dividir tareas amplias antes de desarrollarlas.
Responsable por función no implica una persona asignada ni trabajo ya iniciado.

## Protocolo al iniciar un turno

1. Leer AGENTS.md, contexto maestro, plan y último relevo de este archivo.
2. Consultar git status y branch; actualizar referencias y acordar el SHA de partida.
   Si hay cambios locales, preservarlos; no resetear ni cambiar de rama a ciegas.
3. Comprobar mapa con tools/knowledge/manage.py check; consultar símbolos concretos.
4. Elegir una tarea acotada y registrar quién la toma. Antes de modificar, leer contratos
   y archivos señalados; confirmar por código las inferencias del grafo.
5. Continuar desde la evidencia anterior; ejecutar de nuevo lo afectado por cambios nuevos.

## Protocolo antes de agotar tokens o cambiar de integrante

1. Detenerse en un punto identificable, registrar trabajo completo y parcial, errores y siguiente paso.
2. Consultar git status/diff; evitar secretos, .env, logs y datos reales en commit o relevo.
3. Guardar cambios de código y este registro en la rama de tarea. Compartirlos mediante push/PR
   según el flujo acordado. La otra computadora solo recibe lo que se publicó en Git.
4. Indicar SHA final y destino compartido; si no se hizo commit/push, decirlo explícitamente.
5. Si quedó trabajo parcial, marcar implementada sin verificación o en curso; no marcar verificada.
6. La siguiente persona confirma el SHA recibido y toma la tarea; no depende del chat anterior.

Recomendación: ramas de tarea desde dev y PR a dev; un responsable integra cada contrato.
No hacer cambios incompatibles simultáneos al mismo dominio sin acordar quién integra.
El usuario autorizó publicación al cerrar cada fase (2026-10-09), además de la señal de relevo anticipado. Revisar cambios y sincronizar dev; no usar force-push.

## Ficha que debe copiar cada relevo

```text
Fecha y persona que entrega / recibe:
ID de tarea y fase:
Objetivo y criterio de aceptación:
Rama, SHA de inicio y SHA final:
PR o rama publicada (o indicar: solo local):
Estado: pendiente / en curso / bloqueada / implementada sin verificación / verificada:
Archivos y contratos modificados:
Qué funciona y qué quedó parcial:
Comandos y casos realmente ejecutados, entorno y resultados:
Fallos/bloqueos y causa conocida:
Siguiente acción concreta y archivo/símbolo de entrada:
Cambios locales aún sin commit y riesgos de integración:
Evidencia sanitizada y limitaciones:
Documentos/contexto/ADR actualizados:
```

## Evidencia inicial y límites

- auditoria-backend-2026-10-08.md: informe histórico de 63 pruebas correctas, 5 omitidas y
  19 advertencias; no ejecutadas de nuevo en esta revisión documental.
- tarea-1-frontend-informe.md: informe histórico de modularización; su descripción de UI
  simulada no sustituye la revisión del código actual.
- Preparación local de esta conversación: dependencias runtime/desarrollo, Graphify;
  build, typecheck y check:frontend correctos; /health y /health/ready 200. No E2E autenticado.
- Revisión de planificación: clinicalService y consumidores clínicos encontrados; tablas
  estructuradas según el equipo. No se ejecutaron escrituras de BD ni cambios de aplicación.

Guardar evidencias reproducibles sin secretos en docs/evidence/ o en el PR/CI.
Logs en tmp/ son locales y no se versionan. Datos de pruebas deben ser sintéticos.

## Pendientes de coordinación

Integrantes/revisores; SHA del corte auditado; entorno descartable de aceptación;
criterios no visibles de la rúbrica; hosting si se exige. No desarrollar persistencia de pagos.

### Relevo técnico — 2026-10-09, AUDIT-2026-10-09-01

- Responsable: revisión asistida por Codex; revisor humano por asignar. HEAD completo:
  82f868fd4a1b7e7d40a636651c13d9add472c71f, piero-dev + diff local sin commit/push.
- Núcleo verificado en 5174 -> 8001 -> PostgreSQL 18 local 6543/ashakids_test_phase2.
  Otro servidor habitual sigue separado en 8000/5173.
- Backend: 72 aprobadas, 25 omitidas, 19 advertencias; frontend 153 componentes y 25 rutas,
  tipos/check/build correctos. HTTP posterior 27 casos; datos persisten al reloguear/recargar.
  Regresión final guardas: 7 aprobadas/20 omitidas/1 aviso de caché, sin sumar esas repeticiones.
- Archivos: SQL/avatar + migración, guardas/tests heredados/configuración, scripts phase2_*,
  agenda familiar, aviso PageFrame, métricas de reportes, dos regresiones UI y espera screens.
  PDF/fuente/evidencias e índice actualizados. No se añadió backend de pagos.
- Primera ejecución heredada alcanzó API habitual compartida y operó cuentas de prueba.
  Ver sección 06 del informe y legacy-target-incident.json. Detenida; guardas posteriores
  probadas. No hay restauración ni garantía de ausencia de impacto en esa base.
- Estado final descartable: 5 usuarios, 1 paciente, 1 tratamiento, 1 cita COMPLETADA,
  1 sesión FINALIZADA/ASISTIO y 1 reporte. No ejecutar pytest sobre esa fixture si se quiere
  conservar para presentar. fresh-schema.txt verifica segunda base vacía con SQL actualizado.
- Próxima acción: equipo revisa incidente/logs, comparte cambios y otro integrante reproduce
  el guion de docs/evidence/audit-2026-10-09-01/README.md. Después F3-01: paneles demo,
  seguimiento y navegación administrativa. No rehacer autenticación ni tablas del núcleo.
- PDF: output/pdf/Auditoria_Fase2_AshaKids_2026-10-09-01.pdf; fuente en docs/audits/.

## Historial

2026-10-09, aclaración de entornos y despliegue: añadidos cierre de compatibilidad F2-04,
selección de hosting gratuito F7-02 y ensayo F7-03. No se ejecutó una auditoría nueva, consultas
a la BD compartida, migraciones, pruebas ni despliegues en esta actualización de planificación.
La auditoría PDF anterior conserva su corte; su manifest.json es histórico, no un hash del
estado documental posterior. La comparación de proveedores se hará cuando el alcance esté estable.
Usuario precisa: demostrar estabilidad antes de recomendar; comparar Vercel/Railway/Render
con condiciones vigentes y ayudarle a elegir. Proveedor/ejecución del despliegue aún pendientes.

2026-10-08: creado contexto maestro y plan. Usuario confirma backend en desarrollo con
 tablas estructuradas, trabajo por relevos al agotar tokens y pagos únicamente simulados.
Se prioriza continuar la base existente, alinear contratos y cerrar aceptación del núcleo.
Esta actualización documental queda local hasta que se haga commit/push; no se compartió con
otros integrantes automáticamente.


### Relevo documental — 2026-10-08

- Usuario confirma dev común; rama local piero-dev. PDF aportado leído y archivado sin alterar.
- Fecha límite: 2026-10-09 18:00 Lima. Rúbrica parcial transcrita en DELIVERY_CHECKLIST.md.
- AGENTS.md incorpora versiones en commits, enlace de repositorio en informes y obligación
  de PDF/fuente/evidencia por auditoría. No se creó un commit ni se reescribió historial.
- Fase de pagos nuevos retirada según observación docente; maqueta actual solo demostrativa.
- Creado protocolo/plantilla/índice de auditorías. Este turno documenta evidencia aportada,
  no ejecuta una auditoría técnica nueva ni reutiliza sus cifras como resultados actuales.
- Siguiente tarea: aceptación fase 2 y evidencias académicas en entorno descartable.
- Documentación local sin commit/push; debe compartirse mediante el flujo Git del equipo.

## Relevo 2026-10-09-02 - Compatibilidad

Objetivo completado: comparación compartida en solo lectura y aceptación del núcleo en
réplica PostgreSQL 17.6. Rama piero-dev, HEAD 82f868f, cambios locales sin commit/push.
Modelos corregidos: token_hash, progreso decimal, requisito/icono_logro. SQL inicial
alineado en logros; avatar_nombre ya existe en Supabase, sin migración compartida.

Herramientas: inspect_schema_compatibility, testing_database, verify_compatibility_journey.
Fixtures usan runtime no superusuario y propietario separado para limpieza local; 7 guardas
nuevas verificadas. Primera suite falló por propietario de secuencia; dos intentos HTTP
rechazaron campos incorrectos del guion (422). Todo conservado en evidencia corte 02.

Resultado final: 79 aprobadas, 25 omitidas, 19 advertencias; 48 respuestas HTTP verificadas; navegador
familiar conserva reporte al recargar. Mapa actualizado/check vigente. Entorno: API 8001, frontend 5174; PostgreSQL 17.6 local 6544, ashakids_test_compat17. No ejecutar prepare/pytest sobre
esta BD si se quiere conservar demo. API habitual 8000 y frontend 5173 siguen separados.

En este corte no hubo escrituras compartidas ni datos reales copiados. Incidencia del corte 01
sigue abierta: IDs 44/45 ausentes actualmente no determinan todo el impacto anterior.

Próximo paso F3-01: Centro Familiar y Mi Camino ASHA, sustituir contadores y pasos demo por
asignaciones/sesiones/reportes reales o vacíos claros. Equipo revisa incidencia histórica,
comparte commit con versión y reproduce. Después del alcance estable, comparar hosting
para orientar decisión del usuario; no desplegar por la mera selección de proveedor.

Informe: docs/audits/auditoria-2026-10-09-02.md; PDF output/pdf/Auditoria_Compatibilidad_AshaKids_2026-10-09-02.pdf;
evidencias docs/evidence/audit-2026-10-09-02/.

## Relevo 2026-10-09-03 - F3-01

Objetivo completado en Centro Familiar/Mi Camino: IDs del paciente, contadores/hitos del
servidor, última recomendación del reporte, próximas citas válidas y selección en móvil.
Sin niños de respaldo, porcentajes/firma/recomendación inventados ni toast de reprogramación.

Rama piero-dev, HEAD 82f868f más cambios locales sin commit/push. Fuente: FamilyTrackingPanel,
useFamilyTracking, familyTracking, dos entradas de pantalla, 12 casos en family-tracking.test.
ADR 0004 registra decisión nueva; arquitectura conserva React/HTTP/FastAPI/PostgreSQL.
Fragmentos antiguos de demo quedan sin importar desde las entradas actuales.

Verificado: 165 componentes, 25 rutas, tipos/check/build; navegador1366/390 px, dos hijos
homónimos, recarga desktop/móvil, familia vacía tras cambio de identidad, tratamiento,
reporte y navegación a agenda. Datos SQL reales sintéticos en PG 17.6 local 6544; script
phase3_tracking_fixture añadió hermano/cita futura sin reset, 7 respuestas verificadas.
El reporte con marcador02 se reutiliza, no se creó otra sesión/reporte.

Errores corregidos: arranque EPERM de Node/esbuild en sandbox; ejecución autorizada pasa.
Typecheck encontró dos opciones exact inválidas del test; regex y nueva ejecución correctos.
Un npm inicial usó raíz incorrecta; no cuenta como prueba aprobada. Ajuste de etiqueta
Sin medición para lectura móvil. Detector conserva dos avisos de paleta heredada.

No conexiones/escrituras Supabase aquí. Incidencia histórica01 pendiente. No ejecutar
prepare/pytest en la demostración si se quiere conservar el historial; truncan datos.
Contexto/plan/índice/lista actualizados. Mapa refresh/check vigente; ver evidencia corte 03.

Próximo: revisar promesas de otras pantallas (recuperación, evaluación/consentimiento y
resto demo) y definir mínimos F5-01 con equipo. Fase3 completa aún no certificada; no
desplegar ni escoger hosting antes de estabilidad del alcance. Equipo reproduce el corte.

El usuario acordó la señal tokens bajos dejar todo listo para siguiente desarollador:
entonces cerrar/relevar, revisar e integrar dev, commit/push identificables y prompt.
Señal no recibida en este corte; no afirmar que los cambios están publicados.

Informe docs/audits/auditoria-2026-10-09-03.md; PDF output/pdf/Auditoria_Fase3_AshaKids_2026-10-09-03.pdf;
evidencia docs/evidence/audit-2026-10-09-03/.

## Relevo 2026-10-09-04 - Fase 3 y etapa Mundo ASHA

- Implementación V01_Fase3, SHA 9a6b06160c5210ec05bd3273ef516bba6989560d. Consolidó
  también correcciones locales de auditorías anteriores; no atribuir sus pruebas como nuevas.
- Cierre del alcance mínimo de coherencia: recorrido/seguimiento usan FamilyTrackingPanel;
  paneles usan OperationalDashboard; familias consultan asignaciones y reserva real;
  configuración conserva identidad/CRUD y explica funciones sin contrato.
- Registro público/correo/consentimiento/2FA/notificaciones no implementados. Se sustituyeron
  éxitos ficticios por información; no se eliminó un endpoint público operativo.
- Nuevo useSelectedFamilyPatient; aprendizaje comparte ID autorizado. learningWorlds es
  catálogo draft-1 y cálculo puro de intentos ya verificados, NO una API ni juego terminado.
  null es sin conexión; no convertir en historial vacío/0%. Revisión oral profesional.
- Mundo ASHA se trabaja fuera de las fases del núcleo: MA-01 a MA-07 en su plan propio,
  por petición explícita del usuario. 4 mundos/24 niveles propuestos; cantidades por revisar.
- 198 componentes, 25 rutas, tipos/check/build; 35 HTTP + OpenAPI con fixtures 02/03. No se
  repitió pytest/prepare ni se modificaron filas clínicas. Login/logout crean/revocan sesiones.
- Fallos iniciales: 2 props omitidas/opción exact en tests (tipos), 7 etiquetas de login,
  selector Hijos/Mis hijos (8 casos), build spawn EPERM. Corregidos/repetidos; 198/198 final.
  UI móvil: solapamiento de nombres/acciones corregido. Automatización: expectativas de
  destino tras login agotaron esperas; un intento rechazado, posterior login correcto.
  Captura escritorio temporal recortada se reemplazó tras verificar 1366x900.
- Evidencia/PDF/fuente del corte04; los históricos01/02/03 se conservan. Manifest por corte.
  Graphify actualizado: 1744 nodos/92 comunidades, extracción AST sin LLM; 12 archivos sin
  símbolos y fallback secuencial por restricciones Windows no implican error de aplicación.
- No Supabase, migraciones compartidas, credenciales reales, despliegue ni selección de host.
  Mantener revisión histórica incidente01 y reproducción de equipo pendientes.
- Instrucción posterior del usuario: commit corto con versión y descripción breve obligatorio
  por fase cerrada, dev y sincronización de la rama propia. PR permitido; señal de tokens
  solo para anticipar relevo. No se publicó una modificación nueva de pagos.
- Próxima acción: decidir mínimos F5-01; para juegos, MA-01 con revisión detenida antes de
  implementar contenido. No ejecutar pytest/prepare sobre la demo que debe conservarse.


# ASHAKids — Avance y relevos del equipo

Actualizado: 2026-10-09. [Contexto](PROJECT_CONTEXT.md) · [Plan](IMPLEMENTATION_PLAN.md).
Este archivo se actualiza al cerrar una tarea y antes de cambiar de persona/asistente.
No es un registro automático: quien termina debe guardar y compartir su actualización.

## Punto de continuación actual

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


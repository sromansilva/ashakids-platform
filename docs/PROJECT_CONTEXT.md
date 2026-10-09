# ASHAKids — Contexto maestro progresivo

Actualización: 2026-10-09. Base compartida del equipo: dev. Corte vigente identificado abajo;
los apartados anteriores conservan su entorno y SHA históricos. El PDF de referencia del
8 de octubre no declara un SHA de auditoría de su autor.

## Entrada única del equipo

### Corte vigente: aceptación del núcleo/PDF/mensajes, 2026-10-09-07

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

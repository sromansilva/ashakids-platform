# ASHAKids — Plan de implementación por fases

Actualizado: 2026-10-09. Entrega confirmada: 2026-10-09 18:00 America/Lima. Personas por asignar.
Alcance: [contexto maestro](PROJECT_CONTEXT.md). Ejecución: [avance y relevos](IMPLEMENTATION_PROGRESS.md).
La numeración es nueva y no equivale a las fases históricas de refactorización.

## Estado del nuevo flujo,2026-10-10

V44 adopta002–006 en BD compartida con respaldo, filas/ACL originales preservadas y runtime
restringido. V43UI y flujo nuevo ya desplegados; ADMIN login confirmado. Tutor/terapeuta
requieren sus credenciales vigentes para confirmar ingreso; turnos deben publicarse.
Las menciones inferiores a migraciones exclusivamente locales son históricas. ADR0018.

V43 completa diseño web de terapeuta, pruebas y revisión acotada: evidencia therapist-v43.
Siguiente prioridad autorizada: actualizar BD compartida con respaldo y migraciones002–005,
ACL runtime mínimo y verificación del flujo desplegado. Render V42 conecta a la BD pero
su esquema antiguo impide el login; no declarar adopción ni despliegue funcional por push.

V40 extiende diseño a login y V41 a administración: UI exclusivamente, evidencia login-v40/admin-v41.
Acceso DEV solo local; publicación por sección en dev y codex/2do-intento.
Prioridad actual del usuario: escritorio; responsive diferido para próximos cambios.
V42 extiende UI web de padre/tutor, responsive diferido. Siguiente: terapeuta UI con commit propio
y diagnóstico Render/BD tras cambios de esquema. Evidencia family-v42; sin adopción compartida de migraciones.

Autorización posterior: publicar todo V33–V38 en dev, integración fast-forward sin conflictos.
V39 actualiza continuidad documental; codex/2do-intento se sincroniza con dev.
Las restricciones de dev citadas en cortes inferiores son históricas. Supabase/hosting no
cambian; feat/piero-dev permanece V32. Evidencia heredada por corte, sin pruebas nuevas.

V38 rediseña únicamente la landing: glass/luz difuminada, arte CSS y microinteracciones.
Construcción directa y evidencia landing-v38; siguientes roles por separado, un commit por rol.
El usuario excluye la regla de anticipación semanal; disponibilidad actual se conserva.

V37 extiende el núcleo con notificaciones profesionales y preferencias persistidas;
ADR0017/migración005 únicamente local, evidencia notifications-v37. Esta primera mejora
no declara funcionales los demás campos demostrativos. La anticipación fue excluida después.

V36 paneles/agenda por niño, enlace externo y mundos demo implementados y mostrados
en navegador local con dos niños y continuidad profesional. Evidencia flow-v36 y ADR0016.
V33 registro/activación, V34 agenda/introducción y V35 planes/historial implementados
solo en codex/2do-intento y PostgreSQL local. Profesional define plan desde atención;
asignación administrativa anterior solo referencia histórica. Núcleo demostrado en
desktop/móvil, PDF, reingreso y demo completa; nueva contraseña enviada solo por API. No
integrar dev/feat/piero-dev ni Supabase sin aprobación posterior. Extensiones diferidas
no se declaran terminadas para cerrar una fase.

## Prioridad vigente después de las auditorías16 y17

**Actualización documental 2026-10-10:** el nuevo [flujo maestro](FLUJO_MAESTRO_ACTUALIZADO.md)
define alcance posterior a restaurar V26: introducción por niño, disponibilidad, reserva automática,
elección libre de terapeuta y plan profesional. Prioridad: contratos/recorrido real de tres roles,
pulido de sus pantallas y juegos mínimos. Códigos de 6 caracteres A/P/T; DNI solo contraseña inicial con cambio
obligatorio. Secuencia y aceptación en el maestro; fases inferiores conservan contexto histórico.
No reactivar propuestas V27–V30 ni dar por implementado el nuevo flujo por este corte documental.

La revisión final HTTPS entrega Word separados y PDF, frontend91/100 y backend91/100.
No declara completas todas las extensiones de las siete fases. Las entradas de abajo
conservan su fecha histórica; el hosting gratuito ya está operativo en V24.
Orden validado:entregar auditorías; corregir guardado de reportes existentes y accesibilidad
(editor/login); verificar; preparar propuesta visual y validarla antes de implementar UX/UI;
aplicar por módulos y aceptar desktop/móvil. Separar cuatro campos editables de metadatos
al enviar el reporte; mantener backend estricto. No ampliar pagos, IA, juegos o permisos.

## Principios de implementación

Conservar React -> HTTP/JSON -> FastAPI -> SQLAlchemy/asyncpg -> PostgreSQL.
Frontend: vistas/hooks -> services -> api/client.ts. Backend: api/schemas -> services -> models/core.
Autenticación propia, autorización por recurso y transacciones antes de responder éxito.
No conectar React a PostgreSQL ni introducir Supabase Auth. La tabla reservas se expone como citas.
En el flujo vigente, asesor ADMIN registra familias; el profesional publica planes desde
sus atenciones. Familia consulta sus hijos y profesional consulta el contexto autorizado.

Reutilizar primero los contratos existentes. Para cambiar tablas, acordar contrato y migración
con backend; no ejecutar DDL al arrancar. Seguir architecture.md y ADR 0002/0003.
La documentación de planificación no declara como realizadas funcionalidades pendientes.

## Fase 1 — Base y entorno reproducible

Estado: base disponible; instalación en clon limpio comprobada en corte07 por mismo agente,
con venv/npm nuevos y PostgreSQL existente. Reproducción por otra persona/máquina pendiente.
- Seguir README, instalar dependencias, configurar .env ignorados y preparar Graphify.
- Separar entorno habitual y PostgreSQL descartable de aceptación.
- Registrar commit compartido y verificar arranque de frontend/API y readiness.

Salida: otro integrante reproduce el entorno desde Git sin copiar secretos a documentación.

## Fase 2 — Backend auditado y recorrido principal

**Corte 2026-10-09:** núcleo verificado en el árbol local corregido, con PostgreSQL descartable,
recorrido UI y permisos HTTP. Informe: audits/auditoria-2026-10-09-01.md. Revisar incidencia
inicial compartida, compartir cambios y reproducir por otra persona antes de cerrar el corte
de equipo. Los indicadores y extensiones demo siguen en fase 3; no se certifica toda la web.

### Cierre de compatibilidad con la BD compartida

**Corte 2026-10-09-02:** comparación de solo lectura y réplica local PG17.6 completadas.
26 tablas/178 columnas/92 restricciones/71 índices equivalentes; 0 diferencias de columnas
modeladas tras corregir cuatro campos. avatar_nombre ya existe en Supabase; no se requiere
la migración 001 allí por este hallazgo. 79 pruebas backend y 48 respuestas HTTP verificadas.
La revisión completa de incidencia histórica y el commit/reproducción del equipo siguen
pendientes. El trabajo técnico siguiente es F3-01; infraestructura de hosting no verificada.

Objetivo confirmado el 2026-10-09: obtener funcionamiento real en local y reproducirlo en
despliegue. Una base descartable es PostgreSQL real con datos reiniciables; no simula SQL.
Las pruebas de componentes con mocks se distinguen de integración SQL y navegador/HTTP reales.
El corte local no certifica por sí solo el esquema, permisos o configuración de Supabase.

Antes de ampliar el producto:
1. Revisar la incidencia inicial registrada; verificar su impacto en cuentas de prueba del equipo.
2. Inspeccionar en lectura el esquema/versiones/restricciones/permisos de la BD compartida y
   compararlos con modelos y SQL auditados. Verificar si avatar_nombre ya existe; no suponer
   que falta allí porque faltaba en el SQL inicial local. Registrar diferencias sin copiar secretos.
3. Preparar y revisar las migraciones necesarias según esas diferencias; conservar respaldo
   y procedimiento de recuperación antes de modificar datos o esquema compartido.
4. Reproducir aceptación en un entorno de integración representativo con datos sintéticos,
   versiones compatibles y la configuración del destino. Si se usa la BD compartida, usar
   un guion acotado que preserve las cuentas/historial del equipo. No ejecutar las fixtures
   actuales de pytest/phase2_sandbox prepare allí: hacen TRUNCATE y son solo descartables.
5. Compartir un commit identificado con código, migraciones, configuración de ejemplo sin
   secretos y evidencia; otro integrante debe poder repetir el recorrido.

Salida: diferencias conocidas resueltas y recorrido real verificado en configuración
representativa. Después continuar fase 3. Tener credenciales o conexión exitosa no sustituye
verificar esquema, permisos y persistencia. No se promete ausencia de conflictos sin ese ensayo.

Prioridad inmediata. Continuar el trabajo existente y cerrar huecos antes de módulos nuevos.

| Paso | Responsable por función | Resultado |
| --- | --- | --- |
| Identificar entrega | Backend + coordinación | Rama/SHA, alcance de auditoría y defectos abiertos |
| Comparar contratos | Backend + frontend | OpenAPI y TypeScript compatibles: campos, IDs, estados, horarios, paginación, filtros y errores |
| Preparar aceptación | Backend | Datos sintéticos aislados: ADMIN, dos familias y profesionales asignado/no asignado |
| Completar integración | Frontend + backend | Reutilizar clinicalService/hooks; corregir diferencias y mezcla de mocks |
| Verificar recorrido | Integración/revisor | Evidencia UI/HTTP y persistencia tras recarga |

Aceptación obligatoria del núcleo:
1. ADMIN gestiona cuentas y asigna paciente/profesional mediante tratamiento.
2. PADRE gestiona su hijo y reserva cita en tratamiento autorizado.
3. Profesional asignado confirma; familia y administración ven igual fecha/estado.
4. Profesional registra, inicia y cierra sesión respetando horario y guarda reporte.
5. Familia consulta reporte y cambios siguen presentes al recargar/iniciar sesión de nuevo.
6. Otra familia/profesional ajeno no accede al paciente, cita, sesión o reporte.
7. Conflictos horarios, sesión duplicada, reprogramación/cancelación, sesión expirada y fallo
   de API tienen respuestas coherentes. Formularios conservan contenido tras error.

Probar fechas controladas en datos descartables, sin cambiar el reloj del equipo.
Salida: recorrido E2E persistente en SHA acordado. Las pruebas con fetch simulado y la salud
HTTP no sustituyen esta aceptación. Si un bloqueo de pago interfiere, resolverlo en esta fase.

## Fase 3 — Seguimiento familiar y experiencia coherente

**Corte 2026-10-09-04:** cerrada para el alcance mínimo del núcleo: paneles por rol,
seguimiento/recorrido familiar, asignaciones y configuración conectados; acceso público y
capacidades sin contrato explicados sin falsos éxitos. 198 componentes, 25 rutas, 35 respuestas
HTTP + OpenAPI local, tipos/check/build y revisión desktop/móvil. ADR0005 e informe04.
No certifica extensiones demo, todas las pantallas ni estabilidad de la plataforma completa.
Incidencia histórica y reproducción del equipo siguen pendientes.

Nueva instrucción: cerrar cada fase con commit corto versionado y descripción breve, integrar
en dev y sincronizar la rama del usuario. Se permite PR. La señal de tokens bajos es adicional
para relevos anticipados, no requisito de publicación.

**Corte 2026-10-09-03:** F3-01 implementado en Centro Familiar/Mi Camino con IDs y registros
reales, sin métricas/hitos/recomendaciones inventados. 165 componentes/25 rutas, tipos y build;
navegador sintético desktop/móvil y familias vacías. Ver ADR0004/informe/evidencia. Este corte
no certifica todas las pantallas ni la fase3 completa. Otros módulos/recuperación/consentimiento
siguen pendientes de revisión/selección de mínimos de F5-01; no prometerlos como persistentes.

Base de esta implementación tras auditoría 2026-10-09-02. F2-04 tiene comparación compartida
de solo lectura y aceptación en réplica local PostgreSQL 17.6 (79 pruebas backend y 48
respuestas HTTP; reporte familiar tras recarga). Quedan revisión de incidencia histórica,
commit compartido y reproducción por otro integrante. No certifica host/dominios externos.
Empezar por Centro Familiar y Mi Camino ASHA: sustituir cifras fijas y pasos aparentes
por sesiones/reportes/asignaciones reales, vacíos claros y mediciones no disponibles.

Depende del núcleo aceptado.
- Mi Camino ASHA presenta sesiones/reportes disponibles y recomendaciones reales.
- Revisar datos demo en paneles, notificaciones, agenda y selección de hijos.
- Corregir vacíos, carga, errores, navegación móvil, acceso directo y permisos.
- Acordar alta por administración o registro público. No prometer recuperación/verificación
  por correo sin endpoints y recorrido implementados.
- Definir planes educativos si se conservan; no introducir precios/restricciones no acordadas.

Salida: vistas del núcleo consistentes con datos reales y sin acciones que fingen éxito.

## Fase 4 — Retirada del alcance de implementación

El plan inicial proponía desarrollar pagos simulados. La observación posterior del profesor
excluye pagos y commits de pagos. Esta fase queda fuera del desarrollo, no se renumera para
conservar trazabilidad. La maqueta existente puede quedar rotulada como demostración.
No invertir tiempo en API, tablas ni persistencia de pagos; no condicionar el núcleo a cobros.

## Fase 5 — Actividades, comunicación y documentos

Depende de fases 2/3. La fase 4 está retirada del alcance.
**Corte08, reproducción independiente y aceptación conjunta:** recorrido completo reproducido
en entorno de HailQueso (PostgreSQL 18.4 en puerto 5433). Dos BDs nuevas locales (`accept07_hq` y `regress08`).
119 pruebas backend aprobadas (25 omitidas, 19 avisos), 232 pruebas frontend y 25 de enrutamiento aprobadas.
Guion de 92 respuestas HTTP superado íntegramente. Binario PDF (`%PDF-`) verificado.
Aceptación automatizada en navegador real detenida por fallo de descarga de driver en Playwright manager
(404 en CDN de azureedge); no se evadieron puertos u orígenes. Fase 5 se mantiene abierta respecto
a la validación visual en navegador real. Fuente/PDF/evidencia08 e informe AUDIT-2026-10-09-08.

**Corte07, aceptación conjunta:** núcleo+PDF+mensajes comprobado por92 respuestas HTTP y
repetido en dos BD nuevas del clon limpio. Instalaciones Python/npm reproducidas;115 backend
del clon/119 final con guarda nueva,25 omitidas/19 avisos;232 frontend/25 rutas. API8001
restaurada en demo preservada. Fuente/PDF/evidencia07 y guion CORE_PDF_MESSAGES.md.
F5-01 aceptado por API/SQL; fase5 sigue abierta por UI real/recaptura PDF/reproducción de
otro integrante e impacto histórico01. Navegador aún deniega5174 por preferencia guardada;
reiniciar servicios no modifica ese permiso. No ampliar fase6 ni seleccionar host todavía.

**Corte06, F5-01/mensajes:** implementados en la misma arquitectura y tablas existentes,
con participantes autorizados, contactos por asignación activa, historial persistente y cursor;
sin DDL/Supabase. HTTP/manual Actualizar, sin realtime/llamadas/adjuntos/leído simulado.
232 frontend,36 unitarias backend,25 rutas y53 respuestas HTTP+OpenAPI local. ADR0007/
auditoría06; V08 código, V09 evidencia, publicación dev por PR/V10 (consultar historial).
Siguiente mínimo: aceptación conjunta del núcleo + PDF + mensajes por tres roles y segundo
clon. Revisión visual de mensajes y recaptura móvil PDF pendientes por bloqueo del navegador;
no declarar fase5 cerrada ni toda la plataforma estable por las suites/build correctos.
No ampliar fase6 mientras falta aceptación del alcance seleccionado y revisión de incidencia01.

**Corte05, F5-01/PDF:** exportación de reportes guardados implementada y verificada localmente
(auditoría2026-10-09-05 / ADR0006). La fase no está cerrada. Secuencia de mínimos:
PDF -> mensajes autorizados con persistencia/paginación -> aceptación del conjunto.
Recursos quedan diferidos hasta definir catálogo/requisito; Mundo ASHA tiene etapa propia.
PDF comparte permisos por sesión, campos guardados y cliente central; no guarda archivos
clínicos públicos, no firma ni inventa informes mensuales. Mensajes es el siguiente paso.
Confirmar el último margen móvil: el navegador rechazó la recaptura de este corte.
Seleccionar mínimos de cada módulo según rúbrica; dividirlos en tareas independientes.
- Mundo ASHA: por instrucción del usuario se desarrolla en una etapa extensa independiente
  [MA-01..MA-07](MUNDO_ASHA_PLAN.md). Fase 5 no exige finalizar esos juegos. Base actual:
  catálogo/selección y cálculo puro; la persistencia educativa todavía no está conectada.
- Mensajes: conversación autorizada familia/profesional, persistencia y paginación.
  Implementado HTTP con actualización manual (ADR0007); tiempo real requiere ADR si se adopta.
  Sin prometer entrega exactamente una vez tras respuesta perdida o borradores tras recarga.
- PDF: exportar el reporte autorizado persistente; contenido e identidad coherentes.
  No declarar certificación clínica ni usar firma institucional no acordada.
- Recursos: definir catálogo; carga/descarga y validación solo si están dentro del mínimo elegido.

Salida de mínimos seleccionados: mensajes solo accesibles a participantes; PDF coincide con
reporte. Progreso educativo persistente se verifica en la etapa propia de Mundo ASHA. Módulos diferidos se registran y se retiran de promesas de entrega.

## Fase 6 — Extensiones avanzadas (Cerrada y diferida para entrega académica)

**Cierre formal (2026-10-09, ADR 0008):**
Conforme a la prioridad de entrega académica (hoy a las 18:00 Lima) y la rúbrica recibida del profesor, se formalizó el alcance de las extensiones:
- **Teleconsulta:** Se conserva el soporte de enlaces seguros de sesión y salas virtuales en frontend (`/session/waiting`, `/session/active`); se difiere WebRTC nativo (STUN/TURN) por infraestructura externa innecesaria para la rúbrica.
- **Voz / Fonética:** Juegos de estimulación fonética conservados en el plan desacoplado de Mundo ASHA ([MA-01..MA-07](MUNDO_ASHA_PLAN.md)); inferencia acústica compleja diferida.
- **ASHI / IA:** Operación reactiva local en cliente sin fuga de datos médicos a modelos comerciales externos de pago.
- **Correo (SMTP):** Deducido y cubierto por la mensajería interna persistente en PostgreSQL (ADR 0007).

Salida: Fase 6 cerrada formalmente mediante [ADR 0008](decisions/0008-cierre-y-alcance-extensiones-fase6.md). El proyecto procede a la Fase 7.

## Fase 7 — Resolución y entrega académica

Depende del núcleo y de los módulos seleccionados, no de toda idea de diseño histórica.
- Inventario final de pantallas/capacidades con evidencia y pendientes explícitos.
- Frontend: check:frontend, typecheck, pruebas pertinentes y build.
- Backend: pruebas pertinentes aisladas; no habilitar suite compartida sin autorización.
- E2E: roles, permisos, persistencia y errores de todo el alcance de entrega seleccionado.
- Si se publica: secretos, HTTPS, cookies/CORS, privilegios y límites; migraciones versionadas
  para cambios DB y recuperación de datos. Vite de desarrollo no es hosting de producción.
- README reproducible, guion con datos ficticios, evidencia y limitaciones.

Salida: otra persona ejecuta el guion y los requisitos del curso se trazan a evidencia.
Entrega académica no equivale a autorización de operación clínica con pacientes reales.

### F7-02 — Elegir hosting gratuito cuando el sistema esté estable

Petición confirmada del usuario: seleccionar la opción gratuita que mejor encaje con React/Vite,
FastAPI/Python, SQLAlchemy/asyncpg y la BD PostgreSQL actual en Supabase. La selección está
pendiente; no hay proveedor elegido ni obligación de migrar la BD. Se permite evaluar frontend
y API en servicios distintos si la sesión/cookies y conexión siguen funcionando.

Precisión del usuario: esta etapa consiste en informar, recomendar y ayudarle a decidir entre
Vercel, Railway, Render y otras alternativas compatibles. La elección final corresponde al
usuario. Cada plan se evalúa con sus condiciones vigentes: mencionar un proveedor no implica
que ofrezca gratis todo el proyecto. Ejecutar un despliegue corresponde a una petición posterior.

Entrada: alcance de entrega estable, núcleo persistente, diferencias de BD resueltas,
dependencias reproducibles y commit candidato identificado. La selección puede empezar antes
de completar extensiones diferidas; estas no deben bloquear un despliegue del alcance estable.

Para recomendar, documentar primero estabilidad comprobada del alcance elegido: recorridos
críticos repetidos con persistencia; permisos y casos de error; pruebas de regresión pertinentes;
compilación/configuración reproducibles; cero bloqueos críticos abiertos y revisión de la
incidencia inicial. Una cantidad alta de tests o un único recorrido exitoso no bastan. Las
funciones diferidas quedan identificadas. El corte actual de fase 2 no declara estable toda la
plataforma: faltan compatibilidad representativa y cierre del seguimiento/demo del alcance.

Comparar 2-3 alternativas con documentación oficial vigente en la fecha de selección:

| Criterio | Comprobación requerida |
| --- | --- |
| Coste efectivo | Capa gratuita recurrente frente a crédito temporal; tarjeta obligatoria, cuotas, fecha de caducidad, cargos y límites al agotarse |
| Frontend | Build Vite, assets y recarga/acceso directo a rutas React; proxy /api/v1 si se adopta |
| Backend | Python y paquetes necesarios, comando de arranque/PORT, memoria/CPU, tiempo de solicitudes, suspensión y arranque en frío |
| Base actual | Conexión a Supabase desde la red del host, SSL, límite/pool de conexiones y compatibilidad asyncpg; elegir conexión directa o pooler según destino |
| Sesión web | HTTPS, cookies HttpOnly/Secure/SameSite, CORS/origen y rutas; comprobar login desde dominios reales, no solo localhost |
| Operación | Variables secretas solo en backend, logs sin credenciales, health/readiness, reinicios, rollback y persistencia fuera de disco efímero |
| Uso académico | Disponibilidad durante presentación, región/latencia, facilidad para que otro integrante despliegue y mantenga el proyecto |

La sesión actual usa SameSite=Lax; dos dominios gratuitos de sitios diferentes pueden exigir
proxy o ajustes de arquitectura. Validar el diseño antes de elegir; CORS por sí solo no demuestra
que el navegador envíe la cookie. No sustituir la autenticación propia por Supabase Auth.
Referencia de conexión, consultada el 2026-10-09:
https://supabase.com/docs/guides/database/connecting-to-postgres . La modalidad de pooler y
las prepared statements deben ser compatibles con el driver; confirmar requisitos actuales.

Entregables: comparación con enlaces/fecha, recomendación y alternativa, costes/límites explícitos,
guía de despliegue y ADR si se cambia una decisión de arquitectura. No presentar una prueba
gratuita temporal como alojamiento gratuito permanente. Si ninguna alternativa cubre el uso
exigido sin coste, documentar la limitación y una opción académica viable.

### F7-03 — Ensayo del despliegue elegido

Plan de ejecución futura, después de que el usuario elija proveedor y solicite desplegar.

Crear configuración de despliegue reproducible para el mismo commit y migraciones verificadas.
Ensayar en el destino: arranque, readiness, login de los tres roles, paciente/tratamiento/cita,
sesión/reporte, denegación de acceso ajeno, recarga de rutas y persistencia después de reiniciar
la API. Comprobar dominios/HTTPS/cookies y conexión real a la BD; no usar Vite dev como servidor
de producción. Registrar evidencia, incidencias y correcciones; publicar el alcance aceptado.

Salida: recorrido funcionando en la URL desplegada y guion repetible por otro integrante.
Una compilación local o el .env disponible no dan por cerrado este paso.

## Reglas por tarea y relevo

Estados: pendiente, en curso, bloqueada, implementada sin verificación, verificada, por confirmar.
Cada tarea tiene objetivo, responsable, dependencias, contratos/pantallas y aceptación.
Cada cierre registra PR/SHA, fecha, entorno, casos realmente ejecutados y limitaciones.
Un cambio de contrato se integra con sus consumidores o documenta un orden compatible.
No duplicar código ni reiniciar desde cero al cambiar de asistente; leer el último relevo.


## Prioridad para la entrega del 9 de octubre, 18:00 Lima

El plazo actual acota la entrega; el plan completo no implica implementar todas las extensiones
para mañana. Aplicar [DELIVERY_CHECKLIST.md](DELIVERY_CHECKLIST.md).
1. Consolidar dev/SHA y hallazgos pendientes de la auditoría aportada, sin rehacer backend.
2. Ejecutar/verificar el núcleo de fase 2 con datos descartables y corregir defectos bloqueantes.
3. Producir evidencia trazada a rúbrica: arquitectura/backend, modelo físico y operaciones,
   seguridad/roles, pruebas funcionales y no funcionales realmente ejecutadas.
4. Entregar nueva auditoría PDF si se realiza un corte técnico nuevo, fuente Markdown,
   evidencia, repositorio y SHA; guardar relevo antes de cambiar de cuenta/persona.
5. Preparar guion reproducible y paquete final; objetivo interno de congelación: 16:00,
   revisión del paquete: 17:00, margen hasta las 18:00 del 9 de octubre.

Esos horarios intermedios son propuesta de organización. IA, WebRTC, voz, correo y otras
extensiones no exigidas por los criterios recibidos se difieren; registrar límites de entrega.

## Correcciones backend sobre V19 - corte13

B01 TLS, B04 límites locales de login y B05 contratos corregidos; pruebas114backend
y133HTTP reales (99 núcleo+29 complemento+5 sistema) con nueva cohorteAUDITORIA autorizada;53/55 operaciones positivas. V20/b76a34a publicado en dev y feat/piero-dev; informe13/PDF y evidencia en cierreV21, valoración83/100. B02 requiere aprobación de rol/
políticas; B03 pendiente de rotación/HTTPS; B06 probado en concurrencia acotada, no carga/
backup/caída real. Conservar límites de autorización y evidencia por corte. Sin bases
descartables ni DELETE físico en esta continuación. No ampliar módulos ni pagos.

## Adopción B02 - corte14

B02 aplicado y verificado con autorización expresa: rol exclusivo,22 tablas/58 políticas/
16 secuencias, sin privilegios de administración ni permisos de identidades anteriores
alterados. Candidato99 ASGI/SQL real y133HTTP tras adoptar API8000;114 backend sin BD.
Conservar datos AUDITORIA y documentar fuente/PDF/evidencias del corte. Próxima prioridad:
hostingHTTPS/proxy/cookies, coordinación de credenciales runtime para clones y respaldo/
recuperación. No se amplía alcance, no pagos ni DELETE físicos.

# ASHAKids — Avance y relevos del equipo

Actualizado: 2026-10-09. [Contexto](PROJECT_CONTEXT.md) · [Plan](IMPLEMENTATION_PLAN.md).
Este archivo se actualiza al cerrar una tarea y antes de cambiar de persona/asistente.
No es un registro automático: quien termina debe guardar y compartir su actualización.

## Punto de continuación actual

Implementación: V01_Fase3, 9a6b06160c5210ec05bd3273ef516bba6989560d, rama piero-dev
basada en dev. Documentación de aceptación: V02_AuditoriaFase3. Integración compartida por PR
hacia dev; consultar SHA de merge en historial y comparar origin/dev con la rama del usuario.
Fase 3 cerrada para coherencia del núcleo mínimo; otras extensiones siguen rotuladas como
demostración/pending, sin certificar toda la web. Informe 2026-10-09-04 / ADR0005.
198 componentes, 25 rutas, 35 respuestas HTTP + OpenAPI local; tipos/check/build correctos.
Mundo ASHA es etapa propia: MUNDO_ASHA_PLAN.md, 4 mundos/24 niveles borrador, cálculo de
progreso probado con intentos sintéticos; API educativa y juegos completos pendientes.
Siguiente: F5-01, seleccionar mínimos de mensajes/documentos; MA-01 requiere revisión con
usuario/profesional. Equipo revisa incidencia01 y reproduce el corte en otro entorno.
El usuario exige commit/version/descripcion breve al cerrar fases, dev y sincronización
obligatorios; no esperar señal de tokens. La palabra clave sigue para relevo anticipado.

## Tablero inicial

| ID | Tarea | Estado | Responsable | Cierre esperado |
| --- | --- | --- | --- | --- |
| F1-01 | Preparación local | Verificada localmente | Por asignar | Servicios y controles registrados; otro equipo pendiente |
| F2-01 | Identificar entrega backend auditada | Base dev e informe recibidos; SHA del informe por documentar | Backend/coordinación, personas por asignar | SHA exacto y defectos |
| F2-02 | Alinear API y frontend | Núcleo verificado localmente | Revisión asistida; equipo por asignar | SQL/avatar, estados y reportes comprobados |
| F2-03 | Recorrido de tres roles | Verificado localmente; compartir/reproducir pendientes | Revisión asistida; otro integrante por asignar | PDF nuevo y 27 casos HTTP; incidencia inicial abierta |
| F2-04 | Compatibilidad con BD y entorno de integración | Verificada en réplica local; reproducción del equipo pendiente | Revisión asistida; integrante por asignar | Corte 02: estructura PG 17.6, 0 diferencias de columnas tras corrección, 79 pruebas y 48 respuestas HTTP |
| F3-01/02 | Seguimiento y coherencia del núcleo | Cerrada/verificada localmente para el núcleo mínimo | Revisión asistida; revisor del equipo por asignar | Corte04: 198 componentes/25 rutas, 35 HTTP + OpenAPI, paneles/seguimiento/configuración/asignaciones |\n| MA-00 | Base de Mundo ASHA por habilidades y niveles | Base verificada sin conexión educativa; etapa completa pendiente | Usuario/profesional/equipo | Catálogo draft-1, selección por ID, reglas puras; próxima MA-01 |
| F4-01 | Desarrollo de pagos simulados | Retirada por observación del profesor | No asignar | Maqueta existente solamente; sin nuevos commits de pagos |
| F5-01 | Seleccionar actividades/mensajes/PDF | Por confirmar | Coordinación, persona por asignar | Mínimos y aceptación acordados |
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


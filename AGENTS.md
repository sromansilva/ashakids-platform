# ASHAKids: instrucciones compartidas para agentes

## Cierre obligatorio de fases (instrucción del usuario, 2026-10-09)
- Al finalizar cada fase, crear un commit con versión y objetivo corto, más una descripción
  breve; revisar la secuencia existente. Integrar/publicar en dev y verificar la sincronización
  de la rama del usuario. Se permite usar PR para hacer la integración revisable.
- Esta autorización es independiente de la señal de tokens bajos. La señal sigue sirviendo
  para preparar un relevo anticipado, incluso si la fase no terminó. No esperar la señal
  para publicar una fase cerrada. No usar force-push ni ocultar errores de permisos/CI.
- Antes de publicar revisar diff, secretos, evidencia, referencias remotas y conflictos.
  No marcar como completa una extensión diferida solo para crear un commit.

## Señal de relevo acordada por el usuario
- Si el usuario escribe "tokens bajos dejar todo listo para siguiente desarollador",
  priorizar el relevo antes de ampliar funciones: guardar avances, pendientes, errores,
  comandos/resultados y siguiente tarea en contexto/progreso, incluso a mitad de una fase.
- La señal autoriza revisar e integrar ese avance en dev y hacer commit/push identificables.
  Comprobar rama/SHA, diff, secretos y referencias remotas; preservar trabajo existente,
  continuar la secuencia de versiones vigente y resolver conflictos sin force-push.
- Entregar estado real del commit/push y un prompt de continuación con tarea, archivos,
  entorno y límites. Si algo impide integrar/publicar, registrar el bloqueo y el avance local.
- No esperar al agotamiento total ni prometer un push que no ocurrió. Mantener documentación
  de cada corte; publicar también al cerrar fases según la instrucción anterior.

## Antes de modificar el proyecto
- Leer `docs/PROJECT_CONTEXT.md`; consultar `docs/architecture.md` si afecta la estructura.
- Usar `python tools/knowledge/manage.py check`. Si falta el entorno, ejecutar `setup`; si el mapa está obsoleto, ejecutar `refresh`.
- Para investigar relaciones, usar la skill `.agents/skills/graphify/SKILL.md` y el entorno `.venv-graphify`. En este proyecto los comandos de `tools/knowledge/manage.py` sustituyen la instalación global y los ejemplos bash del proveedor.
- Consultar símbolos concretos: `python tools/knowledge/manage.py query "authenticate_user create_user_session"`. El presupuesto inicial es 1500 tokens. No cargar todo `graph.json` o todo el informe en una conversación.
- Confirmar los hallazgos leyendo los archivos y líneas relevantes. Las relaciones inferidas no garantizan llamadas reales ni conexiones HTTP entre lenguajes. Si la consulta no encuentra resultados, buscar en código.

## Arquitectura y límites
- Frontend React -> HTTP/JSON -> FastAPI -> SQLAlchemy/PostgreSQL. No conectar el frontend directamente a PostgreSQL ni implementar autenticación con Supabase Auth.
- Graphify es una herramienta de desarrollo; no añadirlo al runtime, dependencias de frontend o `backend/requirements.txt`.
- Usar análisis AST local (`--code-only`) y etiquetas sin LLM (`--no-label`) por defecto. No analizar credenciales, archivos de pacientes, logs ni datos reales; respetar `.graphifyignore`.
- No crear usuarios ni modificar tablas reales para pruebas sin una petición explícita. Las pruebas de integración existentes crean sesiones de desarrollo; ejecutarlas solo cuando corresponde y reportar advertencias.

## Al terminar cambios importantes
- Actualizar `docs/PROJECT_CONTEXT.md` cuando cambien funciones, pendientes o limitaciones.
- Actualizar `docs/architecture.md` y crear un ADR en `docs/decisions/` cuando cambie una decisión de arquitectura; no inventar decisiones pasadas.
- Ejecutar `python tools/knowledge/manage.py refresh` después de modificar fuentes y `check` antes de entregar. El mapa generado no se versiona: cada clon lo genera con la misma configuración.
- Ejecutar las pruebas pertinentes, reportando fallos, advertencias y alcance realmente verificado. No afirmar cobertura de todas las pantallas por una compilación exitosa.


## Entrega académica y continuidad del equipo
- Fecha límite confirmada: 2026-10-09 a las 18:00, America/Lima. Priorizar el núcleo
  funcional y la evidencia de la rúbrica antes de ampliar módulos.
- Base compartida confirmada por el usuario: dev. Este clon puede estar en piero-dev;
  comprobar rama/SHA y cambios locales antes de integrar, preservando trabajo existente.
- Leer docs/IMPLEMENTATION_PLAN.md y el último relevo de docs/IMPLEMENTATION_PROGRESS.md.
  Registrar objetivo, rama/SHA, archivos, comprobaciones reales, errores y siguiente acción.
  Si no hubo commit/push, indicarlo: otro equipo no recibe los cambios solo por actualizar el chat.

## Commits e informe: observación del profesor
- Convención compartida para los commits del usuario, compañeros y agentes:
  `VNN_Accion_Modulos`, con título corto que identifique el trabajo realmente realizado.
  Referencias del usuario: `V01_Auditoria_Modulos_Front`, `V02_Revision_UX/UI`,
  `V03_Auditoria_Actividades_Mensajes_Reportes`. Los números son ejemplos: antes de
  crear un commit, revisar git log y continuar la secuencia publicada sin reiniciarla.
- Nombrar la acción y los módulos afectados (por ejemplo, Seguimiento, Paneles,
  Autenticacion, Mensajes o Reportes). Evitar títulos genéricos como `V01_Fase3`,
  `V02_AuditoriaFase3` o `V03_IntegrarFase3`: el profesor debe entender el contenido
  sin conocer las fases internas. Aplicar también a títulos de PR y commits de merge.
- Añadir una descripción breve con los cambios concretos. No usar "Auditoria" o
  "Revision_UX/UI" si ese trabajo no se realizó; no atribuir módulos sin cambios.
  Usar un commit por avance coherente y revisable. No renumerar ni reescribir commits
  publicados en dev; conservar sus SHA para los clones y evidencias del equipo.
- Para documentación usar títulos habituales del desarrollo, como
  `VNN_Actualizacion_Documentacion_Equipo` o `VNN_Documentacion_Arquitectura`.
  Describir el contenido real del cambio, sin referencias a instrucciones del chat
  ni atribuir cambios funcionales a una actualización documental.
- El profesor excluye pagos del alcance: no implementar pasarelas, cobros, suscripciones
  ni facturación reales, ni abrir nuevas tareas o commits dedicados a pagos simulados.
  La simulación visual ya existente puede conservarse rotulada como demostración;
  no convertirla en requisito de reserva, sesión o reporte. La instrucción actual
  reemplaza la tarea de implementación de pagos que aparecía en el plan inicial.
- Incluir el enlace del repositorio en cada informe académico o de auditoría:
  https://github.com/sromansilva/ashakids-platform . Añadir rama y SHA auditado;
  no confundir versiones en mensajes de commit con la versión de la API.
- La rúbrica recibida exige evidencias de arquitectura/backend, modelo físico y
  relaciones/operaciones de BD, seguridad/usuarios/permisos y pruebas funcionales
  y no funcionales. Consultar docs/DELIVERY_CHECKLIST.md. La imagen es parcial:
  no inferir criterios o puntuaciones que no estén visibles.

## Entregable obligatorio por auditoría
- Seguir docs/audits/README.md y docs/audits/AUDIT_TEMPLATE.md. Cada auditoría nueva
  entrega PDF con estructura y presentación equivalente al PDF de referencia:
  docs/evidence/backend-2026-10-08/Auditoria_Backend_AshaKids_2026-10-08.pdf .
- Guardar fuente editable Markdown en docs/audits/, PDF en output/pdf/ y evidencias
  sanitizadas en docs/evidence/. Registrar fecha, ID/version de corte, rama/SHA,
  entorno, alcance, comandos/casos y resultados, fallos, advertencias y omisiones.
- Actualizar índice de auditorías, contexto y relevo en el mismo conjunto de cambios.
  Conservar informes anteriores. Nunca reutilizar cifras de una auditoría previa
  como si se hubieran obtenido nuevamente; marcar explícitamente evidencia heredada.
- Usar la skill PDF para generar y renderizar, inspeccionar las páginas y corregir
  problemas de formato antes de entregar el enlace al PDF. Sin secretos o datos reales.
- Una revisión documental o incorporación de evidencia previa no es una auditoría
  técnica nueva: registrarla como tal, sin declarar pruebas nuevas ni inventar resultados.

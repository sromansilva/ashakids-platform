# ASHAKids — Contexto maestro del flujo actualizado

Fecha: 2026-10-10, America/Lima. Versión de flujo: 1.
Cierre documental: `V32_Actualizacion_Documentacion_Equipo`; consultar SHA efectivo en Git.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base examinada: `piero-dev`, `da4e787e7e199f4457f053694f3b8c8fd0072c5b`,
V31_Restauracion_Plataforma_V26. Contenido funcional recuperado de V26:
`a81e465aa02522366eb97250c38827d11ed4a0e4`.

## Uso del documento

Implementación posterior al corte documental original: V33–V36 muestran el núcleo local;
V37 conecta notificaciones/preferencias del profesional. ADR0017 y migración005 solo local.
V38 cambia solo UI/UX de landing, sin alterar este recorrido. El usuario excluye la regla
de anticipación para cambiar horario semanal; se mantiene disponibilidad/bloqueos actuales.
Consultar PROJECT_CONTEXT y IMPLEMENTATION_PROGRESS para evidencia y límites actuales.

Este es el alcance nuevo acordado después de la recuperación. No reactiva propuestas de
V27–V30. Prevalece sobre descripciones históricas de flujo que lo contradigan; informes y
resultados históricos conservan su fecha y alcance.

**Acordado** significa requisito del producto; **propuesto**, opción técnica por revisar;
**pendiente**, precisión sin cerrar. Ninguno significa implementado. Este corte es documental:
no cambia aplicación, esquema, datos, permisos ni despliegue; no es una auditoría técnica nueva.
Se conserva React → HTTP/JSON → FastAPI → SQLAlchemy/PostgreSQL en Supabase, autenticación
propia y autorización por recurso. No se incorpora Supabase Auth.

## Recorrido principal acordado

Asesor registra padre e hijos → padre cambia contraseña inicial → selecciona un niño → reserva
su consulta introductoria → terapeuta atiende y registra reporte/plan → padre consulta el plan
y reserva sesiones → profesional atiende y registra reportes → familia consulta historial/PDF
y el niño practica en los mundos asignados.

La consulta introductoria es obligatoria **por cada niño**. Tener un hermano atendido no habilita
las sesiones posteriores del otro. El asesor registra y orienta; el profesional decide el plan.
No se crea un tratamiento ficticio para permitir reservar la introducción.

El padre elige **cualquier terapeuta activo y disponible**, tanto para introducción como para
sesiones posteriores. El autor del plan no limita esa elección. Reseñas, disponibilidad y precio
informativo pueden orientar la decisión. Contratación y pagos quedan fuera de la web: sin
pasarelas, cobros, facturación ni desarrollo de pagos simulados.

## Registro, credenciales y rol Administrador / asesor

Aclaración del usuario,2026-10-10: el asesor es una persona con acceso **ADMIN**.
Usa el rol administrador existente para el registro y la orientación de este flujo;
no se introduce un rol técnico adicional.

1. Atiende a la familia en el establecimiento o por sus canales de atención.
2. Registra al padre y uno o varios hijos a su cargo. Cantidad de hijos organiza el formulario;
   corresponde a los niños registrados, sin contador manual separado.
3. Recoge identificación/contacto del adulto y datos de cada niño: nombres, apellidos, nacimiento
   y sexo. Edad se calcula desde nacimiento. Depurar campos obligatorios del adulto antes de desarrollar.
4. Entrega código institucional y contraseña inicial, informando del cambio obligatorio.
5. Orienta la reserva introductoria por niño; no diagnostica ni prescribe tratamiento.
6. Gestiona cuentas y recibe incidencias. La propuesta del compañero contempla aprobar/rechazar
   solicitudes de cambio de datos profesionales; distinguir campos editables directamente de
   los sujetos a revisión. Estas extensiones se priorizan después del recorrido principal.

**Credenciales aclaradas por el usuario:** código institucional de seis caracteres, con inicial
del rol y números; formato propuesto `A00001` (ADMIN), `P00001` (PADRE/TUTOR), `T00001` (TERAPEUTA).
Son ejemplos de formato, no cuentas creadas. El DNI **no es el nombre de usuario**; se utiliza
solo como contraseña inicial y se reemplaza obligatoriamente en el primer ingreso.

V26 ya guarda códigos VARCHAR(6) y genera prefijos por rol. Antes de implementar: acordar
mayúsculas/compatibilidad con códigos anteriores, generación única concurrente y conservación
de IDs/cuentas. Para nuevas cuentas, persistir la obligación de cambiar contraseña y restringir
en la API el acceso a operaciones de negocio hasta completarlo, incluyendo rutas directas.
Un DNI de ocho dígitos no cumple la regla vigente de contraseña nueva de 12–128 caracteres:
su uso inicial necesita un contrato de activación específico, sin relajar la contraseña definitiva.
Guardar únicamente hash; tras cambio, la contraseña inicial deja de autenticar y se actualiza
la sesión según las reglas de revocación. Ninguna credencial real se publica en documentación.

## Rol Padre / tutor

1. Ingresa, cambia contraseña inicial y accede al Centro Familiar.
2. Selecciona hijo por ID. Seguimiento, citas, reportes y juegos muestran información de ese niño.
3. Si aún no realizó introducción, ve una tarjeta clara para reservar esa consulta.
4. Elige terapeuta, modalidad, día y horario habilitado; revisa resumen y confirma.
5. La cita queda confirmada inmediatamente, sin esperar aceptación del profesional.
6. Asiste a la consulta; modalidad virtual contempla Zoom como servicio externo.
7. Consulta reporte/PDF y plan: área de trabajo, sesiones recomendadas y mundos asignados.
8. Reserva próximas sesiones con cualquier profesional disponible. Historial/recomendaciones
   siguen disponibles al recargar y reingresar; no todos los reportes cambian el plan.
9. Gestiona cuenta/hijos y comunicación con profesionales autorizados. Soporte puede redirigir
   a WhatsApp; buzón de incidencias contempla categoría, descripción y fotografías.
10. Puede valorar una sesión atendida con 1–5 estrellas y comentario.

No debe completar todos los juegos para reservar terapia. Progreso educativo y valoración clínica
se presentan por separado; contar sesiones realizadas no demuestra mejoría del lenguaje.

## Reserva y disponibilidad

| Regla acordada | Comportamiento esperado |
| --- | --- |
| Duración | 45 minutos; la familia no introduce hora de fin. |
| Turnos | Inicio cada hora dentro de la jornada habilitada. |
| Disponibilidad | El terapeuta configura horas libres; reservas, ausencias y bloqueos impiden reservar. |
| Calendario | Horas/días ocupados o fuera de jornada deshabilitados, con explicación. |
| Confirmación | Resumen para el padre y confirmación inmediata al guardar, sin aprobación manual. |
| Colisiones | API vuelve a validar al confirmar; dos familias no pueden obtener el mismo turno. |
| Plan | Introducción sin tratamiento previo; terapia vinculada al plan del niño, terapeuta elegido por separado. |
| Modalidad | Virtual/presencial; localización se muestra para presencial. Acordar sedes y responsable de mantenerlas. |
| Reprogramación | Valida nuevamente disponibilidad y no vuelve a esperar aprobación manual. |

**Pendiente:** confirmar jornada descrita como 08:00–18:00, últimos inicios 17:00; el texto
original decía “5 am”. Precisar días, feriados, pausas y uso de los 15 minutos entre turnos.
Zona de presentación: America/Lima. El horario general no sustituye disponibilidad profesional.

Reserva y sesión son registros distintos. Mostrar cita confirmada aunque todavía no tenga sesión
clínica creada. Propuesta: crear sesión PROGRAMADA con la reserva en una transacción, manteniendo
una sesión por reserva, para evitar otro paso manual. Es opción técnica por validar. Cancelación,
reprogramación e inasistencia deben dejar estados coherentes y no duplicar introducciones.

## Rol Terapeuta

1. Configura disponibilidad que se refleja en el calendario familiar.
2. Ve agenda, próximas citas confirmadas y sesión en curso. “Citas de hoy” cuenta pendientes de
   comenzar hoy; cita de 14:00 no cuenta a las 14:10. La sesión en curso se muestra aparte.
3. Ve detalle del niño/cita y acceso a reunión. Un botón visual no demuestra conexión Zoom:
   acordar enlace externo real o demostración antes de aceptar la asistencia virtual. No se
   presupone integración automática con la API de Zoom.
4. Realiza introducción, redacta reporte y define plan mensual: área, sesiones y uno/varios mundos.
5. Registra inicio, cierre y asistencia. Cada atención tiene reporte; puede conservar o actualizar
   el plan. Un reporte puede limitarse al resumen, sin nueva asignación de juegos/sesiones.
6. Ve pacientes atendidos, historial/reportes y el niño de su próxima cita autorizada. “Mis pacientes”
   puede listar quienes ya atendió; no debe impedir preparar una primera consulta.
7. Consulta analíticas propias, mensajes, reseñas y resultados educativos cuando estén conectados.
   Propuesta: “globales” significa su historial completo. Confirmar el agregado deseado y
   sus permisos antes de implementar, sin acceso indiscriminado a niños ajenos.

El profesional que atiende necesita contexto clínico autorizado para continuidad. Elección libre
no concede acceso a todos los pacientes a todos los terapeutas. Definir vínculo por cita/atención,
vigencia de lectura y autoría de modificaciones. Cada reporte conserva el profesional de su sesión.

## Pantallas y simplificaciones

| Área | Resultado esperado |
| --- | --- |
| Centro Familiar / Mi Camino | Selección de niño, introducción pendiente, próxima cita, último reporte y seguimiento coherente. |
| Agenda familiar | Terapeuta separado del plan, disponibilidad y fin calculado; sin campos imposibles de completar. |
| Directorio | Profesionales activos, detalle, disponibilidad y reseñas; no limitar a tratamientos asignados. Precio informativo si se decide mostrarlo. |
| Reportes familiares | Vista previa/PDF por sesión, actuales/anteriores filtrables por fecha; filtros no equivalen a evaluación mensual nueva. |
| Panel profesional | Retirar “Pacientes asignados activos”; renombrar “Citas de hoy” y “Reportes”; próximas citas y sesión en curso. |
| Pacientes / agenda profesional | Tarjetas/detalle sin “Nuevo paciente”; navegación de meses funcional. |
| Reportes profesionales | Lista real con filtro por paciente. |
| Analíticas profesionales | Sesiones por mes/año, sin “Horas trabajadas”; objetivos alcanzados/en progreso cuando existan datos conectados. |
| Valoraciones | Estrellas, comentario y fecha; sin “Recomendación”/“Puntualidad”; filtro por fecha, sin identidades clínicas públicas por defecto. |
| Datos educativos | Niño, mundo, nivel, fecha, duración, errores y resultado; filtros. Sin “Asignadas”/“Exploración libre” si no aportan al mínimo. |
| Configuración / soporte | Edición según permisos, incidencias y revisión administrativa de cambios profesionales al implementarse. |

Texto padre–terapeuta tiene base reutilizable. Chat con ADMIN, imágenes/audio y notificaciones
son extensiones distintas; no declararlas operativas por tener tablas o pantallas. No crear
una tabla de preferencias por pantalla sin definir qué notificaciones se entregan.

## Mundo ASHA: primera entrega reducida

Áreas acordadas: fluidez y ritmo; habla (articulación y producción física); lenguaje
(comprensión y expresión). Son categorías para actividades/objetivos definidos por terapeuta.
Uno o varios mundos pueden asignarse al mismo niño.

Primera entrega: reutilizar interacciones existentes para demostrar jugar, completar nivel,
desbloquear el siguiente, repetir y llegar al final de un mundo. No exige ahora un catálogo
clínico completo ni reconocimiento automático de pronunciación. Cuentos, canciones, adivinanzas,
trabalenguas y juegos pueden ser tipos de contenido de esas áreas; no sustituyen las tres
categorías acordadas como si fueran cinco mundos definitivos.

**Decisión posterior,2026-10-10:** el usuario eligió demostración rotulada primero. La entrega
mínima usa progreso educativo de demostración y no alimenta analítica clínica; persistencia
servidor del progreso se difiere. El resto de las precisiones de niveles/criterios sigue abierto.

Antecedente de la precisión:
La petición inicial incluye progreso guardado por niño; la aclaración posterior acepta simular
la progresión, pero entonces no precisó persistencia de esa entrega. En esa fecha estaba pendiente demo explícita o
persistencia servidor acotada. Demo se rotula y no alimenta analítica clínica. Persistencia real
conserva progreso al recargar/reingresar y aísla niños/cuentas. Almacenamiento local no demuestra
continuidad entre dispositivos. Cantidad de niveles, criterios de finalización, rachas/insignias
y repetición pendientes. No fingir evaluación clínica de pronunciación a partir del juego.
Cuatro mundos/24 niveles del plan histórico son antecedentes, no el catálogo aprobado aquí.

## Impacto estimado en tablas

Evolución **moderada del núcleo y mayor en educación/extensiones**, sin reconstruir todas las
tablas. La dificultad principal cambia relaciones, permisos y estados. Estimación sobre código
y esquema histórico; no nueva inspección de BD ni porcentaje medido de trabajo.

| Entidad / área | V26 en fuentes | Cambio propuesto, sin migración |
| --- | --- | --- |
| usuarios / tutores / pacientes | Usuario con código de 6 caracteres, padre con múltiples niños. | Conservar código de 6 caracteres, prefijos A/P/T y cuentas existentes; cambio obligatorio inicial y depurar datos del adulto. No duplicar edad/conteo hijos. |
| expedientes / tratamientos | Plan de expediente ligado a terapeuta, creado solo por ADMIN. | Profesional autorizado crea/actualiza plan después de introducción; conservar autor sin limitar terapeuta de cada cita. |
| reservas | Paciente/terapeuta propios, tratamiento obligatorio; PENDIENTE y confirmación profesional. | Tipo INTRODUCTORIA/TERAPIA, introducción sin tratamiento y profesional independiente; confirmación automática, turnos/duración/disponibilidad. |
| sesiones / reportes_sesion | Una sesión por reserva, un reporte por sesión con cuatro textos. | Reutilizar; trazar consulta origen del plan y conservar historial de sus cambios en reportes/PDF. Retirar fin del formulario no implica borrarlo de BD. |
| disponibilidad | Sin jornada/ausencias en esquema histórico examinado. | Persistir horario semanal y excepciones/bloqueos vinculados al terapeuta; diseño y número de tablas pendientes. |
| mundos / niveles / resultados_nivel | Existen en SQL; sin modelos/endpoints educativos conectados en V26. | Reutilizar lo compatible, revisar asignaciones/resultados antes de conectar progresión; no crear otra vez esas tablas. |
| actividades / objetivos / perfiles / logros | Actividades pertenece a niño; mundos depende de actividad. Perfil tiene contadores. | Revisar catálogo común frente a asignación individual; posible vínculo niño–mundo/plan y adaptación de relaciones. Contadores derivados o consistentes. |
| conversaciones / mensajes / mensaje_adjuntos | Texto padre–terapeuta por relación de tratamiento; adjuntos en SQL. | Autorizar contactos según nueva atención; chat ADMIN/adjuntos requieren contrato. Tabla no equivale a carga/descarga operativa. |
| valoraciones / incidencias / solicitudes | No aparecen en inventario SQL histórico de 26 tablas. | Nuevas entidades o mecanismo de soporte si se incluyen; reseña por sesión atendida, incidencias con autor/estado/evidencias y solicitudes revisables. |

No fijar número de tablas nuevas sin cerrar disponibilidad, asignación educativa, versiones de
plan y soporte. No añadir contadores de sesiones/pacientes a terapeutas por inercia: derivar
sesiones y pacientes distintos; evaluar contadores persistidos solo si hay necesidad medida.

Introducción obligatoria: comprobar atención válida por niño, no reserva cancelada/inasistencia.
Propuesta: sesión INTRODUCTORIA FINALIZADA/ASISTIO y cierre clínico acordado. Precisar si requiere
reporte/plan guardado. Pacientes V26 necesitan transición explícita, sin inventar introducciones.

Migraciones futuras conservarán IDs/datos/permisos, revisarán índices/restricciones y se ensayarán
con respaldo/reversión en PostgreSQL descartable. Integridad entre filas no depende de CHECK
que consulte otras tablas; elegir restricciones y transacciones adecuadas según
[documentación PostgreSQL](https://www.postgresql.org/docs/17/ddl-constraints.html).
Este archivo no autoriza migraciones ni pruebas de escritura en BD compartida.

## Prioridad propuesta y aceptación

| Orden | Trabajo | Evidencia mínima al implementar |
| --- | --- | --- |
| 1 | Cerrar contratos/permisos | Registro, activación, introducción por niño, disponibilidad y plan sin contradicciones. |
| 2 | Recorrido real de tres roles | Asesor registra dos niños; introducción independiente para cada uno; familia reserva; profesional guarda plan/reporte; PDF e historial conservados al reingresar. |
| 3 | Profesional intercambiable y errores | Segundo terapeuta atiende con contexto autorizado; horas ocupadas/bloqueadas rechazadas; concurrencia sin doble reserva; familia/profesional ajenos sin acceso. |
| 4 | Pulido y juegos mínimos | Calendario/resumen/vacíos/errores desktop/móvil; progreso demo o persistido según decisión explícita. |
| 5 | Extensiones elegidas | Reseñas, incidencias, solicitudes, chat ADMIN, adjuntos y analíticas según prioridad del equipo. |

Pendientes: contrato de activación y códigos anteriores; campos del adulto; jornada/días;
cierre introductorio/transición de pacientes existentes; número de planes activos/versiones
mensuales y vigencia del acceso profesional; enlace Zoom; persistencia inicial de juegos y
extensiones. Son precisiones técnicas, no motivo para reiniciar toda la interfaz.

## Fuentes y comprobaciones documentales

- Modelos: [auth](../backend/app/models/auth.py), [perfiles](../backend/app/models/perfiles.py),
  [clinica](../backend/app/models/clinica.py), [mensajeria](../backend/app/models/mensajeria.py).
- Contratos: [clinica](../backend/app/schemas/clinica.py), [reglas](../backend/app/schemas/reglas.py),
  [admin](../backend/app/schemas/admin.py). Flujo: [citas](../backend/app/services/citas.py),
  [pacientes](../backend/app/services/pacientes.py), [acceso](../backend/app/services/acceso.py),
  [BookingDialog](../frontend/src/components/common/BookingDialog.tsx).
- [SQL histórico 02](evidence/audit-2026-10-09-02/shared-public-schema.sql),
  [recuperación](RESTORE_V26.md) y [evidencia heredada](evidence/restore-v26/schema-rollback.json).
  Las 26 tablas son evidencia heredada, no conteo ejecutado nuevamente en Supabase.
- Planteamiento del usuario y documento de su compañero condensados aquí; adjunto local no
  publicado. Rutas/tablas propuestas no prueban existencia de endpoints o funciones.
- Git limpio/base/remotas dev y feat/piero-dev iguales al inicio; Graphify check vigente,
  consultas limitadas a 1500 tokens y confirmadas en código. Sin pruebas clínicas, SQL o despliegue nuevos.
- Incidencias de investigación: referencia lock-race-conditions.md inexistente, reemplazada por
  schema-constraints/lock-deadlock-prevention. Primer parche documental rechazado por contexto
  de architecture.md; no aplicó cambios parciales y se corrigió. Sin fallo de aplicación.

Siguiente: equipo revisa precisiones, acuerda contrato mínimo y diseña migración/aceptación antes
de implementar. Publicar este archivo no implementa el recorrido. Consultar [contexto](PROJECT_CONTEXT.md),
[relevo](IMPLEMENTATION_PROGRESS.md) y [arquitectura vigente](architecture.md).

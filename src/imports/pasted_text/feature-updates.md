Cambios:

Sección Padres. El "plan Exploracion" quedara completamente eliminado, ahora es un unico plan, al registrarse un padre, debe de ser redirigido a la sección padres de plan Familia, el nuevo plan por defecto y unico. Eliminar el subtitulo de plan debajo del nombre de cada usuario. Eliminar también los indicadores de "Plan Familia" en Padres/Centro Familiar debajo del saludo de buenos dias.

Sección Padres/Terapeutas. Al agendar una sesión con un terapeuta y recibir el mensaje de "¡Solicitud enviada!" sale un mensaje de habilitar el pago en el card, este mensaje debe ser eliminado.

Sección Terapeuta/Inicio. añadir un botón de notificaciones desplegable que informe al terapeuta por nuevas citas enviadas por los padres. Al hacer click en alguna, redirigir al terapeuta a Terapeuta/Agenda. El card "Solicitudes de cita" debe de estar siempre visible, en caso de no tener mas citas pendientes de confirmación, mostrar un mensaje de "Solicitudes al dia", este mismo card debe Tener campos de entrada de filtro por Fecha de inicio y fin, un filtro que mostrara las solicitudes por confirmar en una fecha determinada.

Sección Terapeuta/Agenda. Al ver el calendario se muestran las reuniones con los pacientes, pero al hacerles click no ocurre nada. Al clickear, se debera de mostrar/desplazar un modal con botónes "Ir a reunión" el cual te redirigirá a esta sección espcifica. También estara el botón "Cancelar" el cual al presionar te mostrará otro modal para poder escribir un motivo de cancelación junto a botones de confirmar y cancelar. Si se confirma la cancelación el paciente debe desaparecer del calendario en esa fecha, caso contrario mantener.

Sección Terapeuta/Agenda. Las solicitudes de cita deben tener un botón extra aparte de "Rechazar" y "Aceptar", sera "Mas información", al presionarlo se redirigira al terapeuta a Terapeuta/Mensajes. al chat del padre del niño.

Sección Admin/Pagos. Esta sección debe de ser eliminada.

Sección Terapeuta/Finalizar sesion. Al finalizar una sección, Hay 2 botones, ver resumen de sesión y volver al inicio. Ahora solo habra un botón llamado "Completar formulario de sesión" en el cual el terapeuta completaría un formulario dividido en pasos:

Confirmar asistencia, modalidad y duración.
Seleccionar los objetivos trabajados.
Registrar el desempeño observado en cada objetivo.
Registrar las actividades realizadas durante la sesión.
Escribir la nota de sesión.
Asignar actividades para Mundo ASHA o para casa.
Indicar recomendaciones y siguiente paso.
Guardar como borrador o finalizar el registro.
De esta manera:
Sesiones recibe el registro de la sesión.
Objetivos recibe nuevas mediciones.
Actividades recibe lo realizado y lo asignado.
Notas recibe la nota correspondiente.
Historial muestra todos esos cambios cronológicamente.
Resumen actualiza las barras y la última nota.
Reportes utiliza la información acumulada.

Complementar formulario con el próximo cambio asignado a continuación:

Sección Terapeuta/Pacientes. Al abrir el expediente del paciente Se pueden acceder a todas las opciones que puede utilizar el terapeuta para trabajar, sin embargo aun cuentan sin funcionalidad real.
Funciónn de cada subsección:
| Subsección  | Función recomendada                                        |
| ----------- | ---------------------------------------------------------- |
| Resumen     | Mostrar la situación actual del paciente                   |
| Historial   | Línea de tiempo de toda la evolución                       |
| Sesiones    | Registro detallado de cada atención                        |
| Objetivos   | Plan terapéutico y mediciones de progreso                  |
| Actividades | Actividades asignadas, realizadas y sus resultados         |
| Reportes    | Documentos periódicos elaborados con información acumulada |
| Notas       | Observaciones clínicas privadas o compartidas              |

1. Resumen

Puede mantenerse prácticamente como está:

Barras de avance por área.
Objetivos activos.
Próxima sesión.
Actividades pendientes.
Última nota compartida.
Tendencia reciente.

Sin embargo, la “última nota” debe indicar si es:

Una nota clínica privada.
Un resumen visible para el representante.
Una observación general.

Esto evitará mostrar accidentalmente información interna del terapeuta a los padres.

2. Historial

Actualmente se confunde con Sesiones. Mi recomendación es renombrarlo como “Evolución” o “Línea de tiempo”.

No mostraría únicamente sesiones, sino todos los eventos importantes del expediente:

Sesión completada.
Objetivo creado.
Progreso actualizado.
Objetivo alcanzado.
Actividad asignada.
Juego completado en Mundo ASHA.
Nota agregada.
Reporte publicado.
Sesión cancelada o ausencia registrada.

Ejemplo:

28 de julio de 2026 — Sesión completada
Se trabajó el fonema /r/ mediante trabalenguas.
Desempeño registrado: 70 % con apoyo moderado.
[Ver sesión]

30 de julio de 2026 — Actividad completada
Juego “La ruta de la R” en Mundo ASHA.
8 de 10 respuestas correctas.
[Ver resultado]

Esta sección se llenaría automáticamente; no necesitaría un botón para agregar contenido manual.

3. Sesiones

La lista que tienes es correcta, pero cada elemento debería poder abrirse.

Vista resumida:

28 Jul 2026 · 45 min
Virtual · Trabalenguas /r/
Completada · Terapeuta: María Torres

Al abrirla:

Fecha y duración.
Modalidad.
Asistencia.
Objetivos trabajados.
Actividades utilizadas.
Resultados observados.
Nivel de ayuda requerido.
Nota de sesión.
Recomendaciones.
Actividades asignadas.
Próxima acción.

Podrías utilizar una nota estructurada inspirada en SOAP —subjetivo, objetivo, valoración y plan—, aunque ASHA señala que no existe un único formato obligatorio para todos los contextos. Para el MVP puede presentarse con nombres más sencillos:

Observaciones iniciales.
Trabajo realizado.
Resultados.
Próximos pasos.
4. Objetivos

Sí debe permitir agregar y editar objetivos, pero no conviene eliminarlos definitivamente cuando ya tienen mediciones.

Las acciones deberían ser:

Agregar objetivo.
Editar objetivo.
Pausar objetivo.
Marcar como alcanzado.
Archivar objetivo.
Eliminar, solamente si se creó por error y todavía no tiene registros.

Cada objetivo debería contener:

Área terapéutica.
Descripción.
Prioridad.
Estado.
Fecha de inicio.
Línea base.
Criterio de logro.
Resultado actual.
Nivel de apoyo.
Actividades relacionadas.
Historial de mediciones.

En tu ejemplo, “Alta” no debería depender del porcentaje. Es mejor separar:

Prioridad: alta.
Estado: en progreso.
Desempeño actual: 80 %.
Criterio para alcanzarlo: 80 % con apoyo mínimo durante tres sesiones consecutivas.

Por ejemplo:

Pronunciar correctamente el fonema /r/ vibrante en palabras
Prioridad: Alta · Estado: En progreso
Desempeño actual: 80 % con apoyo mínimo
Criterio de logro: 80 % o más en tres sesiones consecutivas

Aunque alcance 80 % una vez, el objetivo puede continuar “En progreso” hasta demostrar consistencia.

Cómo calcular el porcentaje

No recomiendo que cada actividad sume automáticamente 10 % o 15 %. Eso produciría situaciones incorrectas: un niño podría llegar a 100 % solamente por completar actividades, aunque todavía necesite mucho apoyo.

Hay que separar dos tipos de puntuación:

Recompensa del juego: estrellas, monedas o experiencia.
Medición terapéutica: desempeño, precisión, independencia o frecuencia.

El terapeuta podría registrar:

Cantidad de intentos.
Respuestas correctas.
Porcentaje de precisión.
Nivel de ayuda: total, moderada, mínima o independiente.
Observación cualitativa.

Ejemplo:

10 intentos · 8 correctos · 80 % de precisión · apoyo mínimo.

ASHA recomienda que el progreso hacia los objetivos incluya datos objetivos, comparaciones con sesiones anteriores y el nivel de asistencia ofrecido.

Las barras pueden conservarse, pero deberían decir claramente si representan:

Desempeño actual, o
Avance hacia el criterio de logro.
5. Actividades

Esta sección debería dividirse en dos pestañas:

Asignadas

Actividades que el niño debe realizar:

Nombre.
Objetivo relacionado.
Tipo: Mundo ASHA, ejercicio en casa o material externo.
Fecha de asignación.
Frecuencia recomendada.
Fecha límite opcional.
Estado: pendiente, iniciada o completada.

Botón: “Asignar actividad”.

Historial de actividades

Resultados de actividades ya realizadas:

Fecha.
Actividad.
Objetivo trabajado.
Origen: sesión, casa o Mundo ASHA.
Intentos.
Resultado.
Nivel de ayuda.
Duración.
Observaciones.

Los juegos de Mundo ASHA deberían registrarse automáticamente. Para ejercicios realizados fuera de la plataforma puede existir “Registrar actividad manual”.

El botón genérico “Agregar entrada” convendría reemplazarlo por esos dos botones, porque representan acciones diferentes.

6. Reportes

Tu segunda idea es la más adecuada: el sistema completa automáticamente los datos objetivos y el terapeuta añade interpretación y recomendaciones.

Flujo:

Pulsar “Generar reporte”.
Elegir periodo.
Seleccionar el tipo de reporte.
El sistema incorpora automáticamente:
Cantidad de sesiones.
Asistencia.
Objetivos trabajados.
Evolución de mediciones.
Actividades completadas.
Resultados de Mundo ASHA.
El terapeuta escribe:
Valoración profesional.
Logros principales.
Dificultades observadas.
Recomendaciones.
Próximos objetivos.
Revisar vista previa.
Guardar como borrador.
Publicar para el representante.

Tipos iniciales:

Reporte de progreso: resume un periodo.
Reporte de cierre: cuando finaliza el proceso.
Reporte personalizado: intervalo seleccionado por el terapeuta.

No generaría un reporte completo después de cada sesión. Después de cada sesión corresponde una nota de sesión; el reporte reúne varias notas y mediciones. Esta distinción coincide con la documentación descrita por ASHA.

7. Notas

No dejaría únicamente título, texto y “Publicar”. Añadiría:

Título opcional.
Fecha y hora automáticas.
Contenido.
Tipo de nota.
Sesión relacionada, si corresponde.
Objetivo relacionado, si corresponde.
Visibilidad.

Tipos sugeridos:

Nota de sesión.
Observación general.
Comunicación con la familia.
Incidencia.
Recordatorio profesional.

Visibilidad:

Privada: solo terapeuta y personal autorizado.
Compartida: visible para el representante.

Los botones serían:

Guardar nota privada.
Compartir con representante.

“Publicar” por sí solo podría ser confuso, porque parecería que todas las notas son visibles para la familia.
Modificar y completar el flujo de las secciones “Terapeuta / Expediente del paciente” y “Padres / Mi camino ASHA”, manteniendo el diseño visual, navegación, responsive y componentes existentes del proyecto ASHAKids.

No modificar el navbar general ni el footer. Conservar el estilo actual: encabezado morado degradado, pestañas superiores, fondo claro, cards blancos con bordes lilas suaves, esquinas redondeadas, iconos amigables y barras de progreso en colores turquesa y naranja.

El objetivo es conectar la información registrada por el terapeuta al finalizar una sesión con la información que el padre puede consultar dentro de “Mi camino ASHA”.

## 1. Modificar el formulario “Finalizar sesión” del terapeuta

Dentro de la sección Terapeuta / Pacientes, al abrir el expediente de un paciente y finalizar una sesión, mostrar un formulario por pasos o secciones.

El formulario debe contener:

### Datos generales

* Fecha de la sesión.
* Hora.
* Duración.
* Estado de asistencia: asistió, ausencia justificada o ausencia no justificada.
* Tema principal trabajado.

### Objetivos trabajados

Permitir seleccionar uno o varios objetivos activos del paciente.

Por cada objetivo seleccionado, mostrar:

* Nombre del objetivo.
* Cantidad de intentos.
* Cantidad de respuestas correctas.
* Porcentaje de desempeño calculado.
* Nivel de ayuda: ayuda total, ayuda moderada, ayuda mínima o independiente.
* Observación breve.
* Opción para confirmar si el objetivo continúa en progreso, fue pausado o fue alcanzado.

No aumentar el porcentaje del objetivo simplemente por completar una actividad. El avance terapéutico debe depender del desempeño registrado y de la validación del terapeuta.

### Actividades realizadas

Reemplazar el botón genérico “Agregar entrada” por una sección llamada “Actividades trabajadas”.

Permitir seleccionar múltiples actividades desde un catálogo agrupado por categorías:

* Cuentos:

  * El osito viajero.
  * El León y el Ratón.
* Canciones:

  * La canción del arcoíris.
* Adivinanzas:

  * ¿Qué animal soy?
* Trabalenguas:

  * Trabalenguas nivel 2.
* Juegos:

  * Voz aventura.

Cada actividad debe aparecer como una opción seleccionable mediante checkbox o card seleccionable, mostrando icono, categoría y nombre.

Al seleccionar una actividad, permitir registrar:

* Estado: completada, parcialmente completada o asignada.
* Contexto: realizada durante la sesión o asignada para casa/Mundo ASHA.
* Objetivo terapéutico relacionado.
* Cantidad de intentos.
* Resultado obtenido.
* Nivel de ayuda requerido.
* Observación opcional.

Cuando una actividad se marque como “realizada durante la sesión”, debe aparecer automáticamente como completada en el historial de actividades del padre.

Cuando se marque como “asignada para casa/Mundo ASHA”, debe aparecer como pendiente en la sección Actividades del padre y del niño.

No utilizar los puntos o recompensas de los juegos para calcular directamente el progreso clínico. Las estrellas, monedas o logros pertenecen a la gamificación; el progreso terapéutico se registra por separado.

### Nota de sesión

Agregar:

* Resumen de lo trabajado.
* Avances observados.
* Dificultades encontradas.
* Recomendaciones para la familia.
* Próximos pasos.
* Nota privada del terapeuta.
* Opción “Compartir resumen con el representante”.

Diferenciar visualmente la nota privada del resumen compartido.

### Acciones finales

Agregar los botones:

* “Guardar como borrador”.
* “Finalizar registro de sesión”.
* “Cancelar”.

Antes de finalizar, mostrar una confirmación indicando que la información actualizará el expediente, los objetivos, las actividades y la vista del representante.

## 2. Actualizar automáticamente el expediente

Cuando el terapeuta finalice el registro:

* Agregar la sesión a “Sesiones”.
* Agregar un evento a la línea de tiempo o historial.
* Actualizar las mediciones de los objetivos trabajados.
* Registrar las actividades completadas.
* Mostrar las actividades asignadas como pendientes.
* Crear la nota de sesión.
* Actualizar el resumen general del paciente.
* Dejar los datos disponibles para futuros reportes.

## 3. Modificar “Padres / Mi camino ASHA”

Mantener las pestañas actuales:

* Resumen.
* Objetivos.
* Actividades.
* Sesiones.
* Logros.
* Comentarios o Notas. (Nuevo nombre)
* Bienestar.

Agregar una nueva pestaña llamada:

* Reportes.

Mantener la navegación superior con el mismo estilo morado actual y resaltar la pestaña activa mediante un fondo blanco redondeado.

## 4. Agregar un selector general de período

Debajo de las pestañas y antes del contenido principal, agregar un card compacto llamado “Período de consulta”.

Debe incluir dos modos:

* Estado actual.
* Ver historial.

“Estado actual” será la opción seleccionada por defecto.

Cuando se seleccione “Ver historial”, mostrar:

* Últimos 30 días.
* Últimos 3 meses.
* Rango personalizado.
* Campo “Desde”.
* Campo “Hasta”.
* Botón “Aplicar”.
* Botón “Limpiar filtros”.

Mostrar un texto como:

“Mostrando información del 1 de julio al 31 de agosto de 2026”.

El período seleccionado debe conservarse al cambiar entre Objetivos, Actividades, Sesiones, Notas y Reportes.

No ocultar toda la interfaz cuando no existan resultados. Mostrar un estado vacío amigable:

“No encontramos información en este período. Prueba seleccionando otras fechas”.

## 5. Comportamiento de la pestaña Objetivos

### Estado actual

Mostrar los objetivos activos mediante cards verticales similares al diseño existente.

Cada card debe contener:

* Nombre del objetivo.
* Estado.
* Prioridad.
* Terapeuta responsable.
* Fecha meta.
* Desempeño actual.
* Barra de progreso.
* Recomendación para casa.

Utilizar como datos de ejemplo:

Objetivo 1:

* Pronunciación de la R.
* Estado: en progreso.
* Prioridad: alta.
* Terapeuta: Dra. Ana Ruiz.
* Meta: agosto de 2026.
* Desempeño actual: 78 %.
* Recomendación: practicar 10 minutos al día con cuentos.

Objetivo 2:

* Comprensión verbal.
* Estado: en progreso.
* Prioridad: alta.
* Meta: septiembre de 2026.
* Desempeño actual: 65 %.
* Recomendación: utilizar tarjetas de imágenes.

Objetivo 3:

* Vocabulario expresivo.
* Estado: completado.
* Prioridad: media.
* Meta: junio de 2026.
* Resultado alcanzado: 90 %.
* Recomendación: mantener con lectura diaria.

### Historial

Cuando se seleccione un período pasado, no mostrar solamente el porcentaje actual.

Cada objetivo debe mostrar:

* Progreso al inicio del período.
* Progreso al final del período.
* Diferencia obtenida.
* Cantidad de sesiones en las que fue trabajado.
* Última observación compartida por el terapeuta.

Ejemplo:

“Pronunciación de la R: aumentó de 60 % a 78 % durante el período. Fue trabajada en cuatro sesiones”.

Agregar una pequeña gráfica de evolución o una barra comparativa.

## 6. Comportamiento de la pestaña Actividades

Dentro de Actividades, agregar dos pestañas secundarias:

* Pendientes.
* Historial.

### Pendientes

Mostrar actividades asignadas por el terapeuta que todavía debe realizar el niño.

Cada card debe contener:

* Categoría.
* Nombre.
* Objetivo relacionado.
* Terapeuta que la asignó.
* Fecha de asignación.
* Frecuencia recomendada.
* Estado.
* Botón “Ir a la actividad” cuando corresponda a Mundo ASHA.

### Historial

Mostrar actividades completadas durante sesiones, en casa o dentro de Mundo ASHA.

Agregar filtros por categoría:

* Todas.
* Cuentos.
* Canciones.
* Adivinanzas.
* Trabalenguas.
* Juegos.

Cada registro debe mostrar:

* Fecha de realización.
* Categoría.
* Nombre de la actividad.
* Origen: sesión, casa o Mundo ASHA.
* Objetivo relacionado.
* Estado: completada o parcial.
* Resultado.
* Observación compartida por el terapeuta.

Utilizar como datos de demostración las actividades:

* El osito viajero.
* La canción del arcoíris.
* ¿Qué animal soy?
* Trabalenguas nivel 2.
* El León y el Ratón.
* Voz aventura.

Cuando el filtro general esté en modo “Historial”, mostrar solamente las actividades realizadas dentro del rango seleccionado.

## 7. Comportamiento de la pestaña Sesiones

Mostrar una lista cronológica de sesiones.

Cada sesión debe mostrarse inicialmente como un card compacto con:

* Fecha.
* Duración.
* Modalidad.
* Tema trabajado.
* Estado.
* Terapeuta.

Ejemplo:

“28 Jul 2026 · 45 min
Virtual · Trabalenguas /r/
Completada · Dra. Ana Ruiz”.

Al hacer clic, expandir el card y mostrar:

* Objetivos trabajados.
* Actividades realizadas.
* Avances observados.
* Recomendaciones.
* Resumen compartido por el terapeuta.

Permitir cerrar nuevamente el card.

Aplicar el selector general de período a esta lista.

## 8. Crear la pestaña Reportes para el representante

El representante solamente puede ver reportes publicados. Nunca debe visualizar borradores ni notas privadas del terapeuta.

Mostrar primero un card destacado llamado “Último reporte”, con:

* Nombre del paciente.
* Tipo de reporte.
* Período evaluado.
* Fecha de publicación.
* Terapeuta responsable.
* Resumen breve.
* Botón “Ver reporte completo”.
* Botón “Descargar PDF”, únicamente como acción visual del prototipo.

Debajo, mostrar “Reportes anteriores” como una lista de cards.

Cada reporte debe incluir:

* Título.
* Período.
* Fecha de publicación.
* Terapeuta.
* Estado: publicado.
* Botón “Ver”.

Al abrir un reporte, mostrar una vista completa con:

* Datos del paciente.
* Período evaluado.
* Cantidad de sesiones realizadas.
* Asistencia.
* Objetivos trabajados.
* Evolución de cada objetivo.
* Actividades completadas.
* Logros principales.
* Dificultades observadas.
* Recomendaciones para la familia.
* Próximos pasos.
* Nombre del terapeuta y fecha de publicación.

Agregar un aviso visible:

“Este reporte resume el seguimiento registrado por el terapeuta y no constituye un diagnóstico independiente”.

Aplicar el selector general de período a la lista de reportes.

## 9. Notas y comentarios para el representante

La pestaña Comentarios o Notas debe mostrar únicamente información marcada como compartida por el terapeuta.

Cada card debe contener:

* Título o tipo de nota.
* Fecha.
* Terapeuta.
* Sesión relacionada.
* Contenido.
* Etiqueta “Compartida con la familia”.

No mostrar notas privadas, borradores ni información administrativa.

## 10. Estados e interacciones del prototipo

Crear estados visuales para:

* Cargando.
* Sin información.
* Error.
* Borrador.
* Pendiente.
* Completado.
* Parcialmente completado.
* Publicado.

Todas las pestañas, filtros, cards expandibles, selectores de período, modales y botones deben tener interacción navegable en el prototipo.

Mantener datos de ejemplo suficientes para demostrar:

* Estado actual.
* Consulta histórica.
* Actividades pendientes y completadas.
* Sesiones pasadas.
* Objetivos con evolución.
* Un reporte publicado.
* Una nota compartida.
* Estados vacíos al seleccionar un período sin información.

No reemplazar las funcionalidades existentes que ya están completas. Integrar estos cambios sobre la interfaz actual y conservar consistencia visual entre la vista del terapeuta y la vista del representante.
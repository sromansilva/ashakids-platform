Modificar y completar la subsección “Actividades” ubicada en:

Terapeuta → Pacientes → Expediente del paciente → Actividades.

Trabajar sobre la interfaz actual sin reconstruir la página completa. Mantener el encabezado del paciente, las pestañas principales, el botón “Sesión”, el botón flotante de chat y el estilo visual existente.

El objetivo es permitir que el terapeuta consulte los resultados que obtiene el niño después de completar o repetir actividades en Mundo ASHA.

La información mostrada debe coincidir exactamente con:

* La actividad asignada por el terapeuta.
* La actividad realizada por el niño.
* La pantalla final de resultados de Mundo ASHA.
* Los registros visibles para el padre.
* Las estrellas entregadas.
* El número de intentos.
* La duración.
* Las respuestas correctas y los errores.

No calcular ni modificar automáticamente el progreso clínico del paciente a partir de estos resultados. Los datos de Mundo ASHA son información complementaria que el terapeuta interpreta posteriormente.

# 1. Mantener la estructura general del expediente

Conservar las pestañas principales:

* Resumen.
* Evolución.
* Sesiones.
* Objetivos.
* Actividades.
* Reportes.
* Notas.

Mantener “Actividades” como pestaña activa con fondo morado redondeado.

En la parte superior debe permanecer la información del paciente:

* Nombre.
* Edad.
* Representante.
* Condición o motivo de atención.
* Estado.
* Total de sesiones.
* Progreso actual.
* Próxima sesión.

No modificar las demás subsecciones del expediente.

# 2. Reorganizar la subsección Actividades

Actualmente existen las opciones:

* Asignadas.
* Historial.

Mantener “Asignadas” y cambiar “Historial” por:

“Resultados”.

El selector principal quedará así:

* Asignadas.
* Resultados.

## Asignadas

Mantener la funcionalidad y los cards actuales de actividades asignadas.

Cada actividad asignada debe mostrar:

* Nombre exacto.
* Objetivo relacionado.
* Lugar de realización: sesión o casa/Mundo ASHA.
* Frecuencia.
* Fecha de asignación.
* Estado: pendiente, iniciada o completada.
* Mundo al que pertenece, cuando corresponda.
* Terapeuta que la asignó.

Mantener el botón:

“+ Asignar actividad”.

Este botón solo debe aparecer dentro de “Asignadas”.

## Resultados

Esta vista permitirá que el terapeuta consulte lo que el niño realizó.

Dentro de “Resultados”, agregar un segundo selector segmentado con:

* Actividades de sesión.
* Actividades de casa.

Usar tabs pequeñas o chips. No utilizar checkboxes.

# 3. Actividades de sesión

“Actividades de sesión” debe mostrar las actividades que el terapeuta registró manualmente mediante el formulario “Finalizar sesión”.

Estos registros no provienen automáticamente de Mundo ASHA.

Cada card debe mostrar inicialmente:

* Nombre de la actividad.
* Categoría.
* Fecha de la sesión.
* Duración de la sesión.
* Objetivo trabajado.
* Resultado registrado.
* Estado.
* Terapeuta responsable.
* Icono para expandir.

Ejemplo:

“Trabalenguas nivel 2
Laberinto de Trabalenguas · 28 Jul 2026
Objetivo: Pronunciación del fonema /r/
Resultado: 80 % · Apoyo mínimo”.

Al pulsar el card, expandirlo verticalmente y mostrar:

* Sesión relacionada.
* Modalidad de la sesión.
* Cantidad de intentos.
* Respuestas o ejercicios correctos.
* Errores.
* Porcentaje de desempeño.
* Nivel de ayuda.
* Observación del terapeuta.
* Recomendación.
* Objetivo relacionado.
* Estado del objetivo después de la sesión.

El terapeuta puede consultar estos datos, pero no debe editarlos desde esta vista. Para modificarlos tendría que abrir el registro de la sesión correspondiente.

Agregar un enlace:

“Ver sesión relacionada”.

# 4. Actividades de casa

“Actividades de casa” debe mostrar automáticamente los resultados registrados cuando el niño completa o repite una actividad dentro de Mundo ASHA.

Esta vista es de consulta. No agregar un botón para crear manualmente los resultados.

Agregar un texto descriptivo:

“Estos resultados se registran automáticamente cuando el niño realiza actividades en Mundo ASHA. Sirven como información complementaria para el seguimiento terapéutico”.

Agregar un aviso visual:

“Las estrellas, los aciertos y la duración reflejan participación dentro de Mundo ASHA. No actualizan automáticamente el progreso clínico del paciente”.

# 5. Filtros de resultados

Encima de la lista de resultados, agregar un card compacto de filtros.

Debe contener:

* Selector de fecha inicial.
* Selector de fecha final.
* Botón “Aplicar”.
* Botón “Limpiar”.
* Filtro por actividad.
* Filtro por categoría o mundo.
* Filtro por tipo de intento.
* Campo para buscar por nombre.

Agregar accesos rápidos:

* Hoy.
* Últimos 7 días.
* Últimos 30 días.
* Rango personalizado.

El filtro “Tipo de intento” debe contener:

* Todos.
* Primera finalización.
* Repeticiones.

El filtro por mundo debe contener:

* Todos los mundos.
* Bosque de los Cuentos.
* Montaña Musical.
* Valle de Adivinanzas.
* Laberinto de Trabalenguas.
* Laboratorio de Juegos.

Los filtros deben aplicarse tanto a Actividades de sesión como a Actividades de casa, respetando el origen de cada registro.

Mostrar encima de la lista:

“Mostrando resultados del 28 de julio al 31 de julio de 2026”.

Ordenar los registros desde el más reciente hasta el más antiguo.

# 6. Cards desplegables de Actividades de casa

Cada actividad completada debe aparecer como un card desplegable independiente.

Si el niño realiza la misma actividad varias veces, mostrar un card por cada intento finalizado.

No combinar ni reemplazar las repeticiones.

En el encabezado compacto del card mostrar:

* Icono de la actividad.
* Nombre exacto.
* Mundo.
* Fecha y hora.
* Resultado resumido.
* Duración.
* Tipo: primera finalización o repetición.
* Estrellas obtenidas.
* Icono para expandir.

Ejemplo de primera finalización:

“El osito viajero
Bosque de los Cuentos
30 Jul 2026 · 18:20
3 de 3 correctas · 01:32 min
Primera finalización · +15 estrellas”.

Ejemplo de repetición:

“El osito viajero
Bosque de los Cuentos
31 Jul 2026 · 17:45
2 de 3 correctas · 01:45 min
Repetición · +0 estrellas”.

Utilizar colores de estado:

* Verde para primera finalización completada.
* Morado o azul para repetición.
* Dorado para estrellas.
* Rojo suave únicamente para representar errores, sin convertir el card en una alerta negativa.

Al pulsar el card, expandirlo verticalmente. Al volver a pulsarlo, contraerlo.

Permitir abrir más de un card, pero mantener una jerarquía visual ordenada.

# 7. Información expandida de cada resultado

Dentro del card desplegado mostrar las siguientes secciones:

## Información general

* Nombre de la actividad.
* Categoría.
* Mundo.
* Objetivo terapéutico relacionado.
* Fecha en que fue asignada.
* Fecha y hora de realización.
* Lugar: casa/Mundo ASHA.
* Terapeuta que la asignó.
* Estado: completada.

## Participación

* Escenas, niveles o etapas completadas.
* Respuestas correctas.
* Respuestas incorrectas.
* Duración total.
* Número general del intento.
* Modo de entrada: selección, audio o micrófono.
* Resultado del intento.
* Mejor resultado registrado.

Mostrar únicamente las métricas correspondientes a la actividad. Por ejemplo, no mostrar “Modo de entrada: micrófono” en un cuento que utiliza selección de respuestas.

## Recompensa

Mostrar:

* Estrellas máximas disponibles.
* Estrellas obtenidas en este intento.
* Total acumulado del niño después de la actividad.
* Tipo de recompensa.

En la primera finalización:

“+15 estrellas · Primera recompensa obtenida”.

En una repetición:

“+0 estrellas · Recompensa obtenida anteriormente”.

No sumar estrellas nuevamente por repetir la misma asignación.

Si el terapeuta creó una nueva asignación de la misma actividad, tratarla como una asignación distinta y permitir una nueva recompensa en su primera finalización.

## Retroalimentación mostrada al niño

Mostrar exactamente el mismo mensaje que recibió el niño al terminar la actividad.

Ejemplo para El osito viajero:

“¡Excelente explorador! Comprendiste muy bien la historia y encontraste las respuestas correctas”.

Agregar la etiqueta:

“Mensaje mostrado al niño”.

## Datos de seguimiento

Mostrar:

* Primera vez completada.
* Último intento.
* Cantidad total de intentos de esta asignación.
* Mejor resultado.
* Último resultado.
* Mejora o diferencia respecto al intento anterior.

Ejemplo:

“Mejor resultado: 100 %
Último resultado: 67 %
Diferencia respecto al intento anterior: −33 %”.

Presentar esta comparación como dato informativo y no como evaluación clínica.

# 8. Catálogo y correspondencia de nombres

Los nombres deben coincidir exactamente con el catálogo utilizado por el terapeuta, Mundo ASHA y la vista del padre.

Utilizar:

## Bosque de los Cuentos

* El osito viajero.
* El León y el Ratón.

## Montaña Musical

* La canción del arcoíris.

## Valle de Adivinanzas

* ¿Qué animal soy?

## Laberinto de Trabalenguas

* Trabalenguas nivel 2.

## Laboratorio de Juegos

* Voz aventura.

No utilizar nombres anteriores que no pertenecen al catálogo oficial, como:

* El bosque mágico.
* La ruta de la R.
* Trabalenguas con /r/.

Reemplazar esos nombres cuando aparezcan como datos de demostración.

# 9. Resumen superior de resultados

Dentro de “Actividades de casa”, encima de los filtros, agregar tres cards pequeños de resumen:

* Actividades completadas.
* Tiempo total de práctica.
* Intentos registrados.

Ejemplo para el período seleccionado:

* 4 actividades completadas.
* 18 minutos de práctica.
* 7 intentos registrados.

Agregar un cuarto card opcional:

* Estrellas obtenidas: 42.

Estos valores deben cambiar simuladamente cuando se modifica el período.

No mostrar un “porcentaje de progreso clínico” dentro de estos indicadores.

# 10. Estados vacíos y errores

Agregar estados visuales para:

## Sin resultados

“No hay actividades completadas en este período”.

“Prueba seleccionando otras fechas o revisa las actividades que todavía están asignadas”.

Botón:

“Ver actividades asignadas”.

## Sin actividades de sesión

“No se registraron actividades durante las sesiones de este período”.

## Cargando

Mostrar skeletons con la misma forma de los cards.

## Error

“No pudimos cargar los resultados de Mundo ASHA”.

Botón:

“Intentar nuevamente”.

# 11. Flujo de datos simulado

Representar visualmente la siguiente relación:

1. El terapeuta asigna una actividad.
2. La actividad aparece en Mundo ASHA.
3. El niño inicia la actividad.
4. El sistema crea un intento.
5. El niño completa la actividad.
6. Mundo ASHA calcula aciertos, errores, duración y estrellas.
7. El resultado aparece en la pantalla final del niño.
8. El mismo resultado aparece en Actividades de casa del terapeuta.
9. El padre puede consultar el mismo registro.
10. El resultado queda disponible para futuros reportes.
11. El progreso terapéutico no cambia hasta que el terapeuta lo evalúa.

Todos los valores deben provenir del mismo objeto de resultado simulado. No crear valores diferentes para el niño, el padre y el terapeuta.

# 12. Datos demostrativos obligatorios

Utilizar los siguientes datos para comprobar la correspondencia entre pantallas:

## Primera finalización

* Paciente: Mateo Gómez.
* Actividad: El osito viajero.
* Mundo: Bosque de los Cuentos.
* Objetivo relacionado: Pronunciación de la R.
* Terapeuta: Dra. Ana Ruiz.
* Fecha de asignación: 28 Jul 2026.
* Fecha de realización: 30 Jul 2026.
* Hora: 18:20.
* Escenas completadas: 3 de 3.
* Respuestas correctas: 3.
* Errores: 0.
* Duración: 92 segundos.
* Duración mostrada: 01:32 min.
* Número de intento: 1.
* Tipo: primera finalización.
* Estrellas obtenidas: +15.
* Estrellas acumuladas después de completar: 62.
* Mejor resultado: 100 %.
* Último resultado: 100 %.
* Retroalimentación: “¡Excelente explorador! Comprendiste muy bien la historia y encontraste las respuestas correctas”.

## Repetición

* Paciente: Mateo Gómez.
* Actividad: El osito viajero.
* Mundo: Bosque de los Cuentos.
* Fecha de realización: 31 Jul 2026.
* Hora: 17:45.
* Escenas completadas: 3 de 3.
* Respuestas correctas: 2.
* Errores: 1.
* Duración: 105 segundos.
* Duración mostrada: 01:45 min.
* Número de intento: 2.
* Tipo: repetición.
* Estrellas obtenidas: +0.
* Estrellas acumuladas: 62.
* Mejor resultado: 100 %.
* Último resultado: 67 %.
* Retroalimentación: “¡Muy buen recorrido por el bosque! Recuerda algunos detalles de la historia y vuelve a intentarlo cuando quieras”.

Mostrar ambas realizaciones como cards independientes.

# 13. Consistencia de fechas y formatos

Utilizar el mismo formato en toda la plataforma:

* Fecha corta: 30 Jul 2026.
* Fecha y hora: 30 Jul 2026 · 18:20.
* Duración: 01:32 min.
* Porcentaje: 100 %.
* Estrellas: +15 estrellas.

No mostrar “0:02 min” si el valor real almacenado son 92 segundos. Convertir correctamente segundos a minutos y segundos.

No mezclar fechas, resultados o recompensas entre intentos.

# 14. Permisos y edición

El terapeuta debe poder consultar únicamente los resultados de pacientes con una vinculación activa.

Los resultados automáticos de Mundo ASHA son de solo lectura.

No permitir que el terapeuta:

* Cambie respuestas correctas.
* Cambie errores.
* Modifique la duración.
* Modifique las estrellas obtenidas.
* Elimine intentos.
* Convierta manualmente el resultado en progreso clínico.

El terapeuta sí puede:

* Consultar los detalles.
* Filtrar resultados.
* Abrir la sesión relacionada en actividades de sesión.
* Utilizar los datos como referencia al registrar una próxima sesión.
* Incluir información seleccionada en un reporte posterior.

# 15. Interacciones del prototipo

Hacer funcionales:

* Selector Asignadas/Resultados.
* Selector Actividades de sesión/Actividades de casa.
* Filtros de fecha.
* Filtros de mundo y actividad.
* Filtro de primera finalización o repetición.
* Cards desplegables.
* Botones para expandir y contraer.
* Enlace a sesión relacionada.
* Botón para limpiar filtros.
* Estados vacíos.
* Estado de carga.
* Estado de error.
* Cambio simulado de indicadores según el período.

Mantener suficientes datos ficticios para demostrar varias actividades, fechas y repeticiones.

# 16. Responsive y accesibilidad

En escritorio:

* Mostrar filtros en una fila ordenada.
* Mostrar los indicadores superiores en una cuadrícula.
* Utilizar cards de ancho completo.

En móvil:

* Colocar los filtros verticalmente.
* Convertir los selectores en controles táctiles grandes.
* Mantener visibles nombre, fecha, resultado y tipo de intento en el card cerrado.
* Mostrar el contenido expandido en una sola columna.
* Evitar desplazamiento horizontal.

Agregar:

* Estados de foco visibles.
* Contraste adecuado.
* Etiquetas comprensibles.
* Botones accesibles por teclado.
* Iconos acompañados de texto.
* Áreas táctiles suficientemente grandes.

No eliminar funcionalidades existentes que ya estén completas. Integrar esta consulta de resultados sobre la sección Actividades actual y mantener coherencia visual con las vistas del niño y del representante.
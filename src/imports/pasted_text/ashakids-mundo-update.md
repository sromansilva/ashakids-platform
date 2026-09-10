Modificar y completar la sección infantil “Mundo ASHA” del proyecto ASHAKids. Trabajar sobre la interfaz actual sin reconstruirla desde cero.

Mantener el estilo visual existente:

* Fondo claro con tonos celestes y verdes.
* Cards blancos con bordes lilas suaves.
* Esquinas redondeadas.
* Tipografía grande y amigable para niños.
* Ilustraciones coloridas.
* Botones grandes y fácilmente reconocibles.
* Contador superior de estrellas, nivel y días de actividad.
* Mapa ilustrado con rutas punteadas entre los mundos.
* Diseño responsive para escritorio, tableta y móvil.

No modificar el navbar general, el footer, el chatbot ni otras secciones de la plataforma.

El objetivo es completar el siguiente flujo:

1. El niño consulta las actividades asignadas por su terapeuta.
2. Accede al mundo correspondiente.
3. Selecciona una actividad, cuento, canción, adivinanza, trabalenguas o juego.
4. Realiza la actividad.
5. El sistema registra intentos, duración y resultados.
6. El niño recibe retroalimentación positiva y estrellas.
7. La actividad queda marcada como completada.
8. Si la repite, se registra el nuevo intento, pero no recibe estrellas nuevamente.

# 1. Cambiar “Misiones de hoy” por “Actividades de hoy”

En la pantalla principal de Mundo ASHA, cambiar el título del card “Misiones de hoy” por:

“Actividades de hoy”.

Cambiar el enlace “Ver retos” por:

“Ver todas”.

Estas actividades deben representar aquellas que el terapeuta asignó al niño durante una sesión o al finalizarla.

Debajo del título, agregar un selector segmentado con dos opciones:

* Para casa.
* Realizadas en sesión.

No utilizar checkboxes para este selector. Utilizar tabs pequeñas, chips o botones segmentados.

## Para casa

Mostrar las actividades que el terapeuta asignó para que el niño las complete desde Mundo ASHA.

Cada card debe contener:

* Icono de la categoría.
* Nombre exacto de la actividad.
* Mundo al que pertenece.
* Terapeuta que la asignó.
* Fecha de asignación.
* Recompensa máxima.
* Estado.
* Acción principal.

Estados posibles:

* Pendiente: botón “Comenzar”.
* En curso: botón “Continuar”.
* Completada: check verde y botón “Volver a jugar”.

Al pulsar “Comenzar” o “Continuar”, abrir la pantalla de bienvenida del mundo correspondiente y destacar la actividad asignada.

## Realizadas en sesión

Mostrar las actividades que el terapeuta registró como realizadas durante una sesión.

Cada card debe mostrar:

* Check de actividad registrada.
* Nombre.
* Categoría.
* Fecha de la sesión.
* Terapeuta.
* Resultado resumido.
* Objetivo relacionado.

Estas actividades son informativas. No deben aparecer como pendientes ni exigir que el niño vuelva a realizarlas.

Agregar un estado vacío amigable para ambas opciones:

“No tienes actividades pendientes. ¡Disfruta explorando el mapa mientras esperas una nueva aventura!”.

# 2. Actualizar el Mapa del Mundo

Actualizar el indicador superior de “7 mundos” a:

“8 mundos”.

Mantener los siete mundos actuales y agregar un octavo mundo funcional llamado:

“Laberinto de Trabalenguas”.

Representar Laberinto de Trabalenguas mediante:

* Un icono infantil de laberinto, boca hablando o camino enredado.
* Colores violetas, azules o rosados.
* Un nodo circular consistente con los demás mundos.
* Una nueva conexión punteada dentro del mapa.
* El nombre visible “Laberinto de Trabalenguas”.

Distribuir los ocho mundos de manera equilibrada sin superponer nombres, estrellas, nodos o rutas.

Los mundos quedarán organizados así:

## Mundos funcionales

1. Bosque de los Cuentos.
2. Montaña Musical.
3. Valle de Adivinanzas.
4. Laberinto de Trabalenguas.
5. Laboratorio de Juegos.

## Mundos experimentales

6. Isla Creativa.
7. Academia ASHA.
8. Camino de los Retos.

# 3. Agregar pantallas de bienvenida y selección

Al pulsar un mundo funcional, no iniciar directamente la actividad.

Primero mostrar una pantalla de bienvenida temática con:

* Botón para volver al mapa.
* Nombre del mundo.
* Ilustración o personaje temático.
* Descripción breve y amigable.
* Texto “Elige tu próxima aventura”.
* Lista de actividades, cuentos, canciones, capítulos o niveles disponibles.
* Distinción visible para las actividades asignadas por el terapeuta.

Cada actividad debe representarse mediante un card con:

* Ilustración.
* Nombre exacto.
* Descripción breve.
* Nivel o dificultad.
* Recompensa máxima.
* Estado.
* Botón de acción.

Estados de los cards:

* Disponible.
* Asignada por tu terapeuta.
* En curso.
* Completada.
* Bloqueada, solo si realmente existe una condición de desbloqueo.

Una actividad completada debe mostrar:

* Check verde.
* Fecha de primera finalización.
* Mejor resultado.
* Botón “Volver a jugar”.

Si un mundo tiene por ahora una sola actividad, mostrar igualmente la pantalla de bienvenida y selección con un card. No iniciar automáticamente la única actividad.

# 4. Utilizar el catálogo oficial de actividades

Los nombres mostrados en Mundo ASHA deben coincidir exactamente con los nombres que utiliza el terapeuta al asignar actividades.

## Bosque de los Cuentos

Mostrar dos cuentos:

* El osito viajero.
* El León y el Ratón.

Eliminar, reemplazar o renombrar cualquier cuento genérico anterior, como “El bosque mágico”, si no forma parte del catálogo oficial.

Mecánica de los cuentos:

* Dividir el cuento en escenas o versos.
* Mostrar ilustración y texto breve.
* Después de cada fragmento, presentar una pregunta de comprensión.
* Mostrar tres respuestas posibles.
* Permitir seleccionar una respuesta.
* Indicar de forma amable si la respuesta fue correcta o si debe intentarlo otra vez.
* Contabilizar respuestas correctas, errores y duración.
* Mostrar el avance, por ejemplo: “Escena 2 de 3”.

## Montaña Musical

Mostrar:

* La canción del arcoíris.

Mecánica:

* Pantalla de reproducción de audio.
* Controles grandes para reproducir, pausar y volver a escuchar.
* Preguntas relacionadas con lo escuchado.
* Tres opciones de respuesta.
* Registro de respuestas correctas, errores, repeticiones del audio y duración.

## Valle de Adivinanzas

Mostrar:

* ¿Qué animal soy?

Mecánica:

* Presentar una pista mediante texto, ilustración o audio.
* Mostrar tres posibles respuestas.
* Permitir seleccionar una.
* Dar retroalimentación inmediata y positiva.
* Registrar aciertos, errores, intentos y duración.

## Laberinto de Trabalenguas

Mostrar:

* Trabalenguas nivel 2.

Crear una identidad visual relacionada con recorrer un laberinto mediante palabras y sonidos.

Mecánica:

* Mostrar una bienvenida temática.
* Presentar el trabalenguas por fragmentos o etapas.
* Permitir escuchar un audio de referencia.
* Permitir avanzar por cada fragmento.
* Si la función de micrófono ya existe, conservarla como modo de participación.
* Mostrar claramente cuándo el micrófono está activo.
* Permitir repetir el audio y volver a intentar.
* Registrar intentos, duración, etapas completadas y modo de entrada.
* No presentar el resultado como diagnóstico ni como evaluación clínica automática.

## Laboratorio de Juegos

Mostrar:

* Voz aventura.

Mantener la mecánica actual del juego, pero reemplazar nombres genéricos por el nombre oficial.

Registrar:

* Nivel o escenas completadas.
* Intentos.
* Duración.
* Resultado.
* Modo de entrada.
* Errores o aciertos cuando corresponda.

# 5. Mundos en construcción

En los siguientes mundos agregar una etiqueta visible encima de su nombre:

“En construcción”.

Aplicarla a:

* Isla Creativa.
* Academia ASHA.
* Camino de los Retos.

La etiqueta debe verse también sobre el nodo del mapa, sin ocultar el nombre del mundo.

Al pulsar cualquiera de estos mundos, mostrar un modal o pantalla temática con:

“¡Próximamente!”

“Estamos preparando nuevas aventuras para ti. Muy pronto podrás explorar este mundo”.

Agregar un botón:

“Volver al mapa”.

No agregar actividades falsas, recompensas disponibles ni botones de inicio dentro de estos tres mundos.

# 6. Registrar la actividad realizada

Al comenzar una actividad, crear un intento asociado al niño y a la asignación correspondiente.

Registrar visualmente mediante datos simulados:

* Nombre de la actividad.
* Mundo.
* Fecha y hora de inicio.
* Fecha y hora de finalización.
* Duración total.
* Cantidad de veces que inició la actividad.
* Respuestas correctas.
* Respuestas incorrectas.
* Etapas o escenas completadas.
* Resultado obtenido.
* Modo de entrada: selección, audio o micrófono.
* Estrellas obtenidas.
* Primera finalización o repetición.
* Objetivo terapéutico relacionado.
* Terapeuta que asignó la actividad.

Diferenciar:

* Intento de actividad: cada vez que el niño entra y la realiza.
* Asignación: tarea creada por el terapeuta.
* Primera finalización: primera vez que completa esa asignación.
* Repetición: intento posterior sobre una asignación ya completada.

Guardar el mejor resultado y mostrar también el resultado del último intento.

Si el niño intenta abandonar una actividad iniciada, mostrar una confirmación:

“¿Quieres salir de la actividad? Guardaremos tu avance para que puedas continuar después”.

Botones:

* “Seguir jugando”.
* “Salir y guardar”.

# 7. Sistema de estrellas

Mantener el contador de estrellas en la parte superior del perfil.

Las estrellas representan participación y motivación, no progreso clínico.

Mostrar permanentemente el aviso:

“Mundo ASHA es un complemento educativo y recreativo. Las estrellas e insignias miden participación, no progreso clínico. Los objetivos terapéuticos los interpreta el terapeuta”.

## Recompensa máxima por actividad

Utilizar estos valores iniciales:

* El osito viajero: máximo 15 estrellas.
* El León y el Ratón: máximo 15 estrellas.
* La canción del arcoíris: máximo 12 estrellas.
* ¿Qué animal soy?: máximo 10 estrellas.
* Trabalenguas nivel 2: máximo 20 estrellas.
* Voz aventura: máximo 20 estrellas.

## Cálculo para la primera finalización

Otorgar estrellas solamente la primera vez que se completa una asignación.

Utilizar una lógica amigable que siempre reconozca la participación:

* Desempeño entre 90 % y 100 %: entregar el máximo de estrellas.
* Desempeño entre 70 % y 89 %: entregar aproximadamente el 75 % de la recompensa máxima.
* Desempeño menor de 70 %: entregar aproximadamente el 50 % de la recompensa máxima.
* Nunca entregar cero estrellas en la primera finalización si el niño completó toda la actividad.

Redondear las estrellas a un número entero.

Mostrar una pequeña animación de estrellas viajando hacia el contador superior.

Actualizar inmediatamente el total del perfil.

# 8. Repetición de actividades

Cuando el niño vuelva a realizar una actividad ya completada:

* Registrar un nuevo intento.
* Registrar duración y resultado.
* Actualizar el mejor resultado si lo supera.
* No sumar nuevamente la recompensa.
* Mostrar “+0 estrellas”.
* Mostrar el texto:

“Ya recibiste la recompensa de esta actividad. ¡Esta práctica cuenta para superar tu mejor resultado!”.

Esta limitación debe aplicarse a la asignación completada, no permanentemente al nombre de la actividad.

Si semanas después el terapeuta vuelve a asignar la misma actividad como una nueva tarea, la nueva asignación podrá entregar estrellas nuevamente cuando se complete por primera vez.

# 9. Pantalla final de resultados

Modificar la pantalla “¡Actividad completada!” para incluir:

## Encabezado

* Mensaje “¡Actividad completada!”.
* Nombre de la actividad.
* Nombre del mundo.
* Ilustración o personaje celebrando.

## Resumen de participación

Mostrar cards con:

* Respuestas o etapas completadas.
* Respuestas correctas.
* Errores.
* Duración total.
* Número de intentos.
* Modo de entrada.
* Resultado del último intento.
* Mejor resultado.

No mostrar métricas que no correspondan a la actividad. Por ejemplo, no mostrar “Modo de entrada: micrófono” en una actividad que utiliza únicamente selección de respuestas.

## Recompensa

En la primera finalización mostrar de forma destacada:

“¡Ganaste +15 estrellas!”.

Incluir animación, estrellas, confeti moderado y actualización del contador.

En una repetición mostrar:

“+0 estrellas”.

“Recompensa obtenida anteriormente. Tu nuevo resultado sí quedó registrado”.

## Retroalimentación

Mostrar un mensaje diferente según el mundo y el desempeño.

### Bosque de los Cuentos

Desempeño alto:

“¡Excelente explorador! Comprendiste muy bien la historia y encontraste las respuestas correctas”.

Desempeño medio:

“¡Muy buen recorrido por el bosque! Recuerda algunos detalles de la historia y vuelve a intentarlo cuando quieras”.

Desempeño inicial:

“¡Buen intento! Cada cuento te ayuda a descubrir nuevas palabras. Puedes volver a leerlo con calma”.

### Montaña Musical

Desempeño alto:

“¡Tienes un oído increíble! Escuchaste con mucha atención la canción”.

Desempeño medio:

“¡Muy buen ritmo! Vuelve a escuchar algunas partes y descubrirás nuevos sonidos”.

Desempeño inicial:

“¡La música también se aprende practicando! Escucha nuevamente la canción cuando quieras”.

### Valle de Adivinanzas

Desempeño alto:

“¡Gran detective! Descubriste las respuestas escondidas en las pistas”.

Desempeño medio:

“¡Estuviste muy cerca! Observa las pistas y vuelve a intentarlo”.

Desempeño inicial:

“¡Buen intento, detective! Cada pista te ayudará a encontrar la respuesta”.

### Laberinto de Trabalenguas

Desempeño alto:

“¡Encontraste la salida del laberinto! Completaste el trabalenguas con gran esfuerzo”.

Desempeño medio:

“¡Ya casi llegas a la salida! Repite lentamente cada fragmento y sigue avanzando”.

Desempeño inicial:

“¡Buen intento! Los trabalenguas se dominan paso a paso. Puedes escucharlo y practicar nuevamente”.

### Laboratorio de Juegos

Desempeño alto:

“¡Experimento completado! Superaste esta aventura con un excelente resultado”.

Desempeño medio:

“¡Buen trabajo en el laboratorio! Sigue practicando para mejorar tu resultado”.

Desempeño inicial:

“¡Cada intento cuenta! Vuelve al laboratorio cuando estés listo para otra prueba”.

Mantener el aviso:

“Este resumen refleja tu participación, no un resultado clínico. El análisis del avance corresponde únicamente al terapeuta”.

## Acciones finales

Agregar:

* “Volver a jugar”.
* “Elegir otra actividad”.
* “Volver al mundo”.
* “Volver al mapa”.

# 10. Estados visuales después de completar

Al completar por primera vez:

* Marcar la actividad con check verde.
* Cambiar su estado a “Completada”.
* Guardar la fecha de primera finalización.
* Mostrar las estrellas obtenidas.
* Cambiar el botón “Comenzar” por “Volver a jugar”.
* Mover la asignación desde pendientes hacia completadas.
* Actualizar “Actividades de hoy”.
* Actualizar el total de estrellas.
* Actualizar la vista disponible para el padre.
* Dejar el resultado disponible para el terapeuta.

No modificar automáticamente el porcentaje de los objetivos terapéuticos. El terapeuta utilizará estos resultados como información complementaria y decidirá si corresponde actualizar el objetivo.

# 11. Escenario demostrativo obligatorio

Configurar un flujo interactivo de ejemplo con estos datos iniciales:

* Niño: Mateo.
* Estrellas actuales: 47.
* Nivel: 3.
* Días de actividad: 7.
* Actividad asignada: El osito viajero.
* Categoría: Cuento.
* Mundo: Bosque de los Cuentos.
* Estado inicial: pendiente.
* Recompensa máxima: 15 estrellas.
* Objetivo relacionado: Pronunciación de la R.
* Terapeuta: Dra. Ana Ruiz.

Primer recorrido:

1. Mateo abre “Actividades de hoy”.
2. Selecciona “Para casa”.
3. Pulsa “Comenzar” en “El osito viajero”.
4. Se abre la bienvenida del Bosque de los Cuentos.
5. “El osito viajero” aparece destacado como “Asignada por tu terapeuta”.
6. Mateo inicia el cuento.
7. Completa tres escenas.
8. Obtiene tres respuestas correctas de tres.
9. Tiempo total: 92 segundos.
10. El resultado muestra desempeño alto.
11. Recibe +15 estrellas.
12. El contador cambia de 47 a 62.
13. La actividad recibe un check verde.
14. El botón cambia a “Volver a jugar”.

Segundo recorrido:

1. Mateo vuelve a abrir “El osito viajero”.
2. Realiza nuevamente la actividad.
3. El sistema registra el nuevo intento y duración.
4. La pantalla final muestra “+0 estrellas”.
5. El total permanece en 62.
6. Mostrar “Recompensa obtenida anteriormente”.
7. Actualizar el mejor resultado solamente si corresponde.

# 12. Interacciones y responsive

Hacer funcionales dentro del prototipo:

* Selector “Para casa / Realizadas en sesión”.
* Cards de Actividades de hoy.
* Nodos del mapa.
* Nuevo Laberinto de Trabalenguas.
* Pantallas de bienvenida.
* Selección de actividades.
* Actividades existentes.
* Resultados.
* Repetición.
* Actualización simulada de estrellas.
* Checks de completado.
* Modal de mundos en construcción.
* Botones para volver.
* Estados vacíos.
* Estados pendientes, en curso y completados.

En móvil:

* Mostrar Actividades de hoy en una lista vertical.
* Mantener botones grandes.
* Evitar textos pequeños.
* Permitir desplazamiento horizontal únicamente si es necesario.
* Adaptar el mapa sin cortar mundos o nombres.
* Mantener visible el acceso para volver al mapa.

No eliminar mecánicas que ya funcionen. Reutilizar la lógica, contenido y componentes actuales, corrigiendo nombres y agregando las pantallas intermedias necesarias.
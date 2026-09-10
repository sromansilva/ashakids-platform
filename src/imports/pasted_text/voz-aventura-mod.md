Modificar únicamente el minijuego “Voz Aventura”, ubicado en:

Padres → Mundo ASHA → Laboratorio de Juegos → Voz Aventura.

No modificar el mapa de Mundo ASHA, los demás mundos, el catálogo de actividades, el sistema general de estrellas ni otras secciones de la plataforma.

Mantener la pantalla de selección superior con:

* Voz Aventura.
* Misterio Espacial.

“Voz Aventura” debe permanecer seleccionado y funcional.

“Misterio Espacial” debe mantenerse visible, pero con una etiqueta:

“En desarrollo”.

Al pulsar Misterio Espacial, mostrar únicamente un aviso de próxima disponibilidad. No desarrollar ni modificar ese juego.

# 1. Reimaginar Voz Aventura

Reemplazar el minijuego actual por un juego de desplazamiento lateral infinito controlado mediante la voz.

La mecánica debe recordar a una nave que asciende mientras recibe una señal y desciende cuando deja de recibirla, pero utilizar identidad visual propia de ASHAKids. No copiar personajes, escenarios, sonidos ni recursos visuales de otros videojuegos.

El niño controla un personaje volador de ASHAKids mediante el micrófono:

* Mientras el sistema detecta que el niño está hablando, el personaje asciende.
* Cuando el niño guarda silencio, el personaje desciende.
* El desplazamiento horizontal es automático.
* El escenario se mueve continuamente de derecha a izquierda.
* El recorrido es infinito.
* La partida termina únicamente por una colisión lateral válida con un tubo.
* La única métrica principal será el tiempo de supervivencia en segundos.

No agregar monedas, enemigos, disparos, vidas, puntaje por tubos, distancia, niveles ni otra métrica competitiva.

# 2. Pantalla inicial

Mantener el card principal del juego, pero mejorar su contenido.

Mostrar:

* Título: “Voz Aventura”.
* Subtítulo: “¡Usa tu voz para volar!”.
* Personaje infantil de ASHAKids.
* Instrucción principal: “Habla para subir y guarda silencio para bajar”.
* Botón principal: “Preparar micrófono”.
* Indicador del mejor tiempo registrado.
* Aviso de privacidad relacionado con el micrófono.

Reemplazar cualquier texto como “Habla fuerte para subir” por:

“Habla para subir”.

No incentivar al niño a gritar. La detección debe responder a una voz moderada.

Mostrar el aviso:

“El micrófono se utiliza únicamente mientras juegas. No se guarda ni se reproduce tu voz”.

# 3. Preparación del micrófono

Al pulsar “Preparar micrófono”:

1. Solicitar permiso para utilizar el micrófono.
2. Mostrar un estado de espera mientras se concede el permiso.
3. Realizar una calibración breve del ruido ambiental.
4. Mostrar un medidor visual de voz.
5. Pedir al niño que diga una palabra o mantenga un sonido durante unos segundos.
6. Confirmar cuando la voz se detecte correctamente.
7. Habilitar el botón “Comenzar aventura”.

Estados necesarios:

* Solicitando permiso.
* Micrófono permitido.
* Micrófono bloqueado.
* No se encontró micrófono.
* Calibrando sonido.
* Voz detectada.
* Entorno demasiado ruidoso.

Si el permiso es rechazado, mostrar:

“Necesitamos permiso para escuchar cuándo hablas y controlar el personaje”.

Agregar los botones:

* “Intentar nuevamente”.
* “Volver al Laboratorio de Juegos”.

No iniciar la partida si el micrófono no está disponible.

# 4. Detección de voz

Si el prototipo admite funcionalidad web real, utilizar la entrada del micrófono mediante Web Audio API.

La detección debe basarse en el nivel de audio, no en reconocer palabras específicas.

Aplicar:

* Umbral adaptado al ruido ambiental.
* Suavizado de la señal para evitar movimientos bruscos.
* Una pequeña tolerancia para que respiraciones o ruidos breves no produzcan saltos.
* Histéresis entre activación y desactivación para evitar vibración alrededor del umbral.

Comportamiento:

* Voz detectada de manera continua: aplicar movimiento ascendente suave.
* Silencio: aplicar movimiento descendente suave.
* La intensidad de la voz puede modificar ligeramente la fuerza de ascenso, pero no exigir gritos.
* El personaje no debe saltar instantáneamente de posición.
* El cambio entre ascenso y descenso debe sentirse fluido y controlable.

Mostrar durante la partida un medidor pequeño con:

* “Voz detectada”.
* “Silencio”.
* Nivel visual del micrófono.

No guardar archivos de audio. Solo procesar temporalmente la intensidad de entrada.

# 5. Inicio de la partida

Después de la calibración, mostrar una cuenta regresiva:

* 3.
* 2.
* 1.
* “¡Habla para volar!”.

Al terminar la cuenta regresiva:

* Iniciar el cronómetro en `0 s`.
* Comenzar el desplazamiento del escenario.
* Activar el control mediante el micrófono.
* Generar los obstáculos progresivamente.
* Mantener al personaje en una posición horizontal aproximadamente fija.
* Permitir únicamente desplazamiento vertical del personaje.

# 6. Movimiento del personaje

El personaje debe desplazarse siguiendo estas reglas:

## Mientras el niño habla

* El personaje asciende de manera continua.
* El ascenso debe ser diagonal y suave.
* No realizar saltos individuales por cada sonido.
* Mantener una velocidad máxima de ascenso para conservar el control.

## Mientras el niño guarda silencio

* El personaje desciende de manera continua.
* El descenso debe ser diagonal y suave.
* Aplicar una velocidad máxima de descenso.
* No simular una caída excesivamente rápida.

## Transiciones

* Aplicar aceleración y desaceleración suaves.
* Inclinar ligeramente al personaje hacia arriba durante el ascenso.
* Inclinarlo ligeramente hacia abajo durante el descenso.
* Volver gradualmente a una posición neutra cuando cambie la señal.

Utilizar una hitbox ligeramente más pequeña que la ilustración para que las colisiones se sientan justas.

# 7. Techo y suelo del escenario

El techo y el suelo general de la pantalla no deben matar al jugador.

Si el personaje alcanza el techo:

* Limitar su posición al borde superior seguro.
* Detener temporalmente el movimiento ascendente.
* Mantener la partida activa.
* Permitir que vuelva a descender cuando el niño deje de hablar.

Si el personaje alcanza el suelo:

* Limitar su posición al borde inferior seguro.
* Detener temporalmente el movimiento descendente.
* Mantener la partida activa.
* Permitir que vuelva a ascender cuando el niño hable.

No finalizar la partida, reiniciar ni descontar puntos por tocar los bordes generales.

Agregar una reacción visual suave, como una pequeña compresión, brillo o rebote corto, sin convertir el borde en un obstáculo peligroso.

# 8. Obstáculos

Utilizar tubos verticales que aparezcan desde el techo y desde el suelo, dejando espacios por los que el personaje pueda pasar.

Los tubos se desplazan automáticamente de derecha a izquierda.

Generar un recorrido infinito mediante obstáculos repetidos con variaciones controladas en:

* Posición vertical.
* Separación.
* Altura.
* Distancia entre pares de tubos.

Mantener siempre un espacio posible de atravesar.

No generar:

* Espacios imposibles.
* Dos obstáculos superpuestos.
* Cambios repentinos sin tiempo de reacción.
* Tubos demasiado cercanos al inicio de la partida.
* Obstáculos fuera del área visible.

Durante los primeros segundos, utilizar separaciones amplias para que el niño comprenda el control.

La velocidad horizontal puede mantenerse constante. Si se incrementa con el tiempo, el aumento debe ser mínimo y gradual.

# 9. Reglas exactas de colisión

La partida debe terminar solamente cuando el personaje golpee lateralmente un tubo.

Una colisión mortal ocurre cuando:

* El personaje entra en contacto con la cara vertical izquierda o derecha de un tubo.
* El solapamiento comienza principalmente sobre el eje horizontal.
* La dirección de entrada corresponde a un impacto lateral.

No deben ser mortales:

* El techo general de la pantalla.
* El suelo general de la pantalla.
* La superficie superior horizontal de un tubo.
* La superficie inferior horizontal de un tubo.
* Rozar una esquina sin penetración lateral clara.
* Tocar un tubo desde arriba.
* Tocar un tubo desde abajo.

Cuando el personaje toque la parte superior o inferior horizontal de un tubo:

* No finalizar la partida.
* Resolver la colisión colocando suavemente al personaje fuera del tubo.
* Permitir que se deslice momentáneamente por la superficie.
* Continuar el cronómetro.
* Mantener el control por voz.

Implementar la detección de colisión considerando la normal o dirección de entrada:

* Normal horizontal: colisión mortal.
* Normal vertical: colisión no mortal.

No utilizar una única colisión rectangular que mate al jugador desde cualquier dirección.

# 10. Interfaz durante la partida

Mantener la interfaz limpia y con poca información.

Mostrar únicamente:

* Cronómetro de supervivencia.
* Mejor tiempo.
* Indicador del micrófono.
* Estado “Voz detectada” o “Silencio”.
* Botón de pausa.
* Botón para activar o desactivar sonidos del juego.

El cronómetro debe mostrarse en segundos:

* `0 s`.
* `1 s`.
* `15 s`.
* `62 s`.

No utilizar puntos como métrica principal.

Eliminar o reemplazar cualquier indicador como “0 puntos” por:

“Tiempo: 0 s”.

El cronómetro comienza al iniciar el movimiento y se detiene exactamente en la colisión mortal.

# 11. Pausa

Al pulsar “Pausa”:

* Detener el cronómetro.
* Detener el desplazamiento de obstáculos.
* Detener el movimiento del personaje.
* Suspender temporalmente el análisis del micrófono.
* Mostrar un overlay.

El overlay debe incluir:

* “Juego en pausa”.
* Tiempo actual.
* “Continuar”.
* “Reiniciar”.
* “Salir del juego”.

Antes de reiniciar o salir, mostrar confirmación.

# 12. Fin de la partida

Cuando exista una colisión lateral válida:

1. Detener el desplazamiento.
2. Detener el cronómetro.
3. Detener el movimiento.
4. Mostrar una animación breve y amable.
5. Evitar efectos violentos.
6. Abrir la pantalla de resultados.

No utilizar textos como “Moriste” o “Perdiste”.

Mostrar:

“¡Buen intento!”.

“Tu aventura duró 42 segundos”.

# 13. Pantalla de resultados

La única métrica principal debe ser:

“Tiempo de supervivencia”.

Mostrar:

* Tiempo sobrevivido en segundos.
* Mejor tiempo personal.
* Diferencia respecto al mejor tiempo.
* Número de intento.
* Indicación de nuevo récord cuando corresponda.
* Retroalimentación positiva.
* Estrellas entregadas por el sistema general, si corresponde a la primera finalización de la asignación.

Ejemplo:

“Tiempo de supervivencia: 42 s”.

“Mejor tiempo: 42 s”.

“¡Nuevo récord!”.

Retroalimentación sugerida según el tiempo:

## Menos de 10 segundos

“¡Buen comienzo! Prueba hablar suavemente para subir y guardar silencio para bajar”.

## Entre 10 y 29 segundos

“¡Muy bien! Ya estás aprendiendo a controlar tu voz durante la aventura”.

## Entre 30 y 59 segundos

“¡Excelente control! Tu voz llevó al personaje muy lejos”.

## 60 segundos o más

“¡Increíble aventura! Mantuviste un gran control de tu voz durante todo el recorrido”.

Agregar los botones:

* “Jugar de nuevo”.
* “Volver al Laboratorio”.
* “Volver al mapa”.

# 14. Registro del intento

Al finalizar una partida, registrar mediante datos simulados o estado local:

* Niño.
* Actividad: Voz aventura.
* Mundo: Laboratorio de Juegos.
* Fecha.
* Hora de inicio.
* Hora de finalización.
* Duración de la partida.
* Tiempo de supervivencia en segundos.
* Número de intento.
* Mejor tiempo anterior.
* Mejor tiempo actual.
* Si logró un nuevo récord.
* Si fue primera finalización o repetición.
* Estrellas obtenidas según el sistema general.

No registrar:

* Archivos de voz.
* Grabaciones.
* Transcripciones.
* Palabras pronunciadas.
* Diagnósticos.
* Porcentaje clínico.
* Cantidad de tubos como métrica principal.

Este resultado debe quedar disponible para la vista del padre y para:

Terapeuta → Pacientes → Expediente → Actividades → Resultados → Actividades de casa.

# 15. Relación con las recompensas existentes

No rediseñar el sistema general de estrellas.

Aplicar las reglas ya definidas:

* La primera finalización de una asignación de Voz aventura puede entregar la recompensa correspondiente.
* Repetir la misma asignación registra otro tiempo, pero entrega `+0 estrellas`.
* Una repetición puede establecer un nuevo mejor tiempo.
* Si el terapeuta crea una nueva asignación de Voz aventura, esa nueva asignación puede entregar estrellas nuevamente.
* Las estrellas miden participación y no progreso clínico.

En una repetición mostrar:

“+0 estrellas”.

“Ya recibiste la recompensa de esta actividad. Tu nuevo tiempo sí quedó registrado”.

# 16. Diseño visual del escenario

Crear un escenario infantil, limpio y coherente con Mundo ASHA.

Utilizar:

* Cielo con degradado celeste.
* Nubes suaves.
* Colinas o elementos decorativos en segundo plano.
* Tubos con colores amigables y bordes redondeados.
* Personaje volador expresivo.
* Partículas suaves al ascender.
* Pequeña estela visual mientras se detecta la voz.
* Movimiento de fondo con efecto parallax ligero.

Evitar:

* Colores demasiado oscuros.
* Destellos intensos.
* Animaciones agresivas.
* Exceso de partículas.
* Elementos que dificulten distinguir los obstáculos.
* Imitar visualmente otros videojuegos.

Los tubos deben contrastar claramente con el fondo.

# 17. Sonido y accesibilidad

Agregar sonidos suaves para:

* Inicio.
* Cuenta regresiva.
* Nuevo récord.
* Colisión.
* Resultado.

Permitir desactivar los sonidos sin afectar la entrada del micrófono.

No reproducir la voz del niño.

Incluir:

* Botones grandes.
* Etiquetas visibles.
* Estados de foco.
* Contraste adecuado.
* Instrucciones mediante texto e iconos.
* Alternativa visual para saber cuándo la voz está siendo detectada.
* Aviso claro cuando el micrófono está activo.

# 18. Responsive

En escritorio:

* Mostrar el juego dentro del card principal.
* Mantener una proporción horizontal amplia.
* Ubicar cronómetro y medidor sin bloquear el área de juego.

En tableta:

* Adaptar el escenario al ancho disponible.
* Mantener el personaje, tubos y separaciones legibles.

En móvil:

* Utilizar orientación horizontal para jugar cuando sea posible.
* Si el dispositivo está en vertical, mostrar:

“Gira tu dispositivo para disfrutar mejor de Voz Aventura”.

* Mantener botones y textos accesibles.
* No cortar el escenario ni las superficies de los tubos.

# 19. Datos demostrativos

Configurar un escenario de prueba con:

* Niño: Mateo.
* Actividad: Voz aventura.
* Mundo: Laboratorio de Juegos.
* Mejor tiempo inicial: 28 segundos.
* Intento actual: 3.
* Tiempo obtenido: 42 segundos.
* Resultado: nuevo récord.
* Recompensa: dependerá del estado de la asignación existente.

Al finalizar, mostrar:

“¡Buen intento!”.

“Tu aventura duró 42 segundos”.

“¡Nuevo récord! Superaste tu mejor tiempo por 14 segundos”.

Registrar 42 segundos como nuevo mejor tiempo.

# 20. Criterios obligatorios de funcionamiento

La modificación se considera correcta solamente si:

* El personaje asciende mientras detecta voz.
* El personaje desciende durante el silencio.
* El movimiento es continuo y suave.
* El techo general no mata al personaje.
* El suelo general no mata al personaje.
* Las superficies horizontales de los tubos no matan.
* Únicamente las caras verticales de los tubos terminan la partida.
* El recorrido continúa indefinidamente.
* Los obstáculos se generan de manera posible y justa.
* El cronómetro registra segundos de supervivencia.
* El tiempo se detiene al ocurrir una colisión lateral.
* Los intentos posteriores pueden actualizar el récord.
* No se almacenan grabaciones.
* El resultado queda disponible para el terapeuta.
* Misterio Espacial permanece en desarrollo.
* Ninguna otra sección de ASHAKids es modificada.
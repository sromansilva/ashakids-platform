# Isla de las Palabras: acompañar el juego desde los 4 años

Fecha: 2026-10-18. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama dev, base d35ee0cede509c6a53881b93c704c9685f765b93 (V103).

## Criterio de diseño

El usuario pide más lógica, calidez y juego educativo para niños desde los 4 años.
Se mantienen diez actividades independientes y una colección durante la visita.
Cada actividad presenta una meta y tres pasos antes de empezar. No hay reloj,
pérdida de vidas, castigo ni bloqueo por edad. La elección «Primeros pasos» ofrece
menos opciones e imágenes/voz; «Un poquito más» amplía las piezas y alternativas.
Las etiquetas ayudan a la familia; la modalidad inicial no exige lectura autónoma.

Se consultan las guías primarias de [literacidad preescolar de Head Start](https://headstart.gov/school-readiness/article/literacy-preschool?redirect=eclkc)
y [apoyos visuales](https://headstart.gov/children-disabilities/article/visual-supports).
La primera sitúa rimas y segmentación de palabras habladas en la progresión de 36 a
60 meses; la segunda describe cómo las imágenes apoyan la comprensión de consignas.
Estas referencias orientan decisiones de producto; no validan clínicamente el juego
ni prueban resultados de aprendizaje. El español, ejemplos y mecánicas son originales.

## Lógica por actividad

| Juego | Primeros pasos | Un poquito más | Apoyo y sentido del éxito |
| --- | --- | --- | --- |
| Tesoro | Tres pistas, dos opciones | Tres opciones de un banco de ocho pistas | Pista semántica y colección visual de los tesoros acertados |
| Memoria | Dos parejas, mirar antes de ocultar | Cuatro parejas | Volver a mirar sin perder parejas; desaciertos visibles hasta reintentar |
| Cestas | Un dibujo por turno, cuatro dibujos y dos familias | Seis dibujos y tres familias, incluidos transportes | Cesta con ejemplo visual, explicación de familia y alternativa al arrastre |
| Historia | Una historia ilustrada de tres pasos | Tres historias: flor, dormir y merienda | Corregir último paso y escuchar la secuencia correcta |
| Opuestos | Una relación por ronda, dos opciones | Tres opciones | Comparación visual de tamaño/día-noche/altura y explicación concreta |
| Sílabas | Contar palmadas por trocitos hablados | Construir con fichas que se escuchan | Sílabas separadas en pista; no se requiere escribir |
| Merienda | Una fruta por amigo, cantidades 2/3/4 | Cantidades 3/4/5 | Platos visibles y mensajes sobre lo que falta o sobra |
| Posiciones | Dentro/fuera/encima/debajo | Añade izquierda/derecha | Ejemplo visual cuando se pide ayuda; reubicar sin castigo |
| Rimas | Dos opciones, escuchar y confirmar | Tres opciones | Cuatro parejas del banco: gato/zapato, sol/caracol, flor/tambor, manzana/banana |
| Frases | Tres vagones ilustrados, quién/acción/complemento | Un distractor adicional | Voz de cada pieza, corregir último vagón y narrar al acertar |

Los conjuntos de vocabulario, memoria, historias y otras rondas se mezclan por
partida. Una repetición puede coincidir por azar; no se promete un catálogo infinito.
El modo inicial de merienda aumenta de dos a cuatro para que se vea el conteo.
Las pistas se pueden pedir en cualquier momento y aparecen tras dos desaciertos
en los juegos por rondas; nunca completan una tarea por sí solas.

## Identidad visual y energía

Nunito, lavanda #DFD0FB, turquesa #C6EDDB, amarillo #FFE8AB, coral #FFCFC3 y tinta
#302347. Diez portadas nuevas de juguete 3D relacionadas con la acción; ilustraciones
existentes dentro de partidas más caracol y tambor para rimas. Una sola actividad en
pantalla; respuesta breve al acertar/tocar, palmadas visibles y concha de recuerdo al
final. Sin música automática, destellos continuos ni movimiento si se solicita reducido.
Las conchas y marcas describen sólo esta visita; no son XP, medallas ni progreso clínico.

Voz opcional de SpeechSynthesis por acción, con cancelación al cambiar/salir/ocultar.
No grabación ni reconocimiento de voz. Si no hay voz, se conservan imágenes/texto y
se indica a la familia que acompañe. La pronunciación real depende del navegador y
requiere escucha humana en los dispositivos de destino.

## Verificación y límites

Evidencia nueva en [words-v104](../evidence/words-v104/verification.md): pruebas de
lógica, ambos modos, móvil, teclado, arrastre, toque, recuperación y despliegue.
No pruebas de eficacia con niños ni garantía de aprendizaje por completar un juego.
La revisión de contenido por el profesional/familia sigue siendo útil para cada niño.

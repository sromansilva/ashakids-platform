# Isla de las Palabras: juego acompañado desde los 4 años — 2026-10-18

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama dev.
Base de trabajo: d35ee0cede509c6a53881b93c704c9685f765b93 (V103).
Cierre previsto: V104_Mejorar_Juegos_Palabras_Preescolar; SHA definitivo consultable en Git.
Verificación funcional/visual de implementación; no es una auditoría académica nueva.

## Alcance y lógica

Diez actividades independientes revisadas, con bienvenida de meta/tres pasos,
modos Primeros pasos/Un poquito más, voz opcional, ayudas y feedback concreto.
En el modo inicial, sílabas mediante palmadas, memoria de dos parejas con vistazo,
cestas de un dibujo por turno, secuencias ilustradas, opuestos de uno en uno,
merienda con un plato por amigo, posiciones con modelo, rimas de selección y
confirmación, y frases con pictogramas. El segundo modo amplía opciones/piezas.
Las ayudas nunca completan una tarea por sí solas. Corregir no consume vidas ni
reinicia lo ya logrado; los puzzles permiten quitar la última pieza/paso/vagón.

Se amplían bancos de vocabulario, memoria, historias, posiciones, rimas y frases;
se mezclan por partida. Una repetición puede coincidir por azar. Diez portadas nuevas
relacionadas con la actividad y dos imágenes de vocabulario (caracol/tambor).
Doce llamadas ImageGen independientes; originales PNG y prompts exactos conservados.
WebP RGBA locales, 328164 bytes de portadas y 38298 de vocabulario: 366462 bytes nuevos.
Paridad binaria de los doce recursos con dist: cero diferencias. Assets.json registra hashes.

Se conserva el límite de práctica de ADR0025: colección de esta visita, sin XP,
medallas o intentos nuevos en API. La actividad previa basica-1 y permisos siguen
intactos en Para la familia. Sin dependencias nuevas, backend, BD ni cuentas reales.
Criterios pedagógicos y fuentes primarias: [diseño preescolar](../../design/isla-palabras-prescolar.md).

## Entorno y resultados nuevos del 18 de octubre

Windows, Node/React/Vite del proyecto; Chrome headless real en harness local
127.0.0.1:5175. Familia sintética, todas las llamadas API interceptadas antes de red.
SpeechSynthesis instrumentado para comprobar solicitudes de texto; no se afirma
síntesis audible ni pronunciación correcta en dispositivos finales.

- Tipos: sin errores. Estructura: 411 archivos, máximo 495 líneas; imports/fronteras/HTTP aprobados.
- Vitest: 23 casos focalizados nuevos/revisados, aprobados en 9.55 s. Cada juego se
  completa en ambos modos; se comprueban reintentos, secuencia inválida, correspondencia
  uno a uno, ayudas, vistazo de memoria, repetición, fallback y voz no disponible.
- Suite completa: 360 pruebas de componentes en 31 archivos y 25 rutas aprobadas.
  Componentes: 108.26 s. No se reutilizan cifras V101/V103 como ejecuciones nuevas.
- Build de producción aprobado; módulos/tiempo exactos en build.txt.
- Navegador: 20 partidas completas (10 × 2 modos), repetición y foco. 126 layouts
  entre menú/bienvenida/partida: modo inicial en 320/390/768/1366, segundo en 390/1366.
  Cero errores JS, imágenes rotas, overflow horizontal o botones visibles menores de
  44 px. Se comprueba contención de las ilustraciones de portada.
- Teclado Enter/Espacio y foco en la consigna tras avanzar; clasificación con arrastre
  nativo. Partida de merienda completa con toque real en contexto móvil.
- Fallback real de red en portada y ausencia de voz: juego sigue accesible y permite
  avanzar visualmente. Movimiento reducido comprobado; no escrituras API.
- Posiciones adicionales: dos partidas/6 layouts móviles para encima/debajo/fuera y
  derecha/debajo/izquierda, con modelos y finalización. Evidencia separada en
  browser-spatial-results.json; no se cuentan como juegos distintos de los diez.
- Graphify refresh/check aprobados: 2867 nodos, 129 comunidades. Aviso de 22 archivos
  sin símbolos extraíbles, sin fallo de runtime. El mapa generado no se versiona.

Capturas de menús, bienvenida, diez juegos/éxitos, ambos modos, móviles y variantes.
Inspección visual de portadas, merienda, historia, frases y zonas espaciales.

## Incidencias resueltas y límites

Un comando de Vitest ejecutado desde la raíz no cargó la configuración/alias del
frontend. Se corrigió ejecutándolo desde frontend; no es un fallo de la aplicación.
El primer conjunto focalizado obtuvo 15 aprobados y 8 fallos de harness: faltaba
SpeechSynthesisUtterance en JSDom y las consultas de status encontraban también el
aviso de voz. Se modeló la voz en el test y se hizo específica la consulta del caso
sin voz. La ejecución final de 23 casos y la suite completa pasan.
Un intento de edición con ruta relativa en cwd frontend no encontró el archivo y
no cambió fuentes; se aplicó después con ruta absoluta antes de la compilación final.
El primer recorrido navegador usaba un selector note global que coincidía con la
nota familiar; se acotó a la pista del juego y se repitió todo el recorrido.
La captura de galería desde un panel con scroll cortaba la última tarjeta; se volvió
a capturar con viewport más alto, sin modificar las fuentes para la captura.

No se cubren todas las permutaciones aleatorias ni todas las pantallas del producto.
No prueba con niños, auditoría completa de accesibilidad, validación clínica ni prueba
de eficacia pedagógica. La modalidad inicial ofrece imágenes/voz; ante voz no disponible
se recomienda acompañamiento familiar. Sílabas con fichas y frases requieren ayuda
cuando el niño aún no reconoce las etiquetas. Los criterios son decisiones de diseño
orientadas por las guías enlazadas, no una certificación para una edad concreta.

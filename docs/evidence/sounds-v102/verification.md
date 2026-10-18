# Taller de los Sonidos por actividades — 2026-10-18

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama dev.
Base de trabajo antes de cambios: fb2dbb9bbf2dea71b29f026bff4244f908b121c0 (V101).
Cierre previsto: V102_Ordenar_Taller_Sonidos; SHA definitivo consultable en Git.
Verificación funcional de una implementación, no auditoría académica nueva.

## Cambio

Cuatro tarjetas independientes, con el hero de la landing y una sola actividad por
pantalla. Asociación de dos y tres parejas se elige y reinicia por separado. Logro
reemplaza al tablero, sin «Siguiente nivel» ni encadenamiento de dificultades. El
regreso restaura el foco, cancela audio y permite elegir cualquier juego. Cabecera
interior más sencilla. Mapa: «4 juegos · práctica libre». Arte SVG y MP3 existentes,
sin nuevas imágenes/dependencias. Persistencia basica-1 intacta en Para la familia;
práctica nueva sin XP ni medallas, conforme ADR0025.

## Verificación nueva

Windows, Node/React/Vite, Chrome headless real; harness de desarrollo 127.0.0.1:5175.
API interceptada con familia sintética; ningún paciente/usuario real creado ni BD
escrita. Los cuatro MP3 locales se reproducen completos para validar mecánicas; no
se afirma evaluación humana del volumen, timbre ni aprendizaje clínico.

- 15 casos focalizados de sonidos y mundos aprobados: finalización, repetición,
  juegos independientes, cantidad conservada al repetir, foco, fallos/audio, permisos.
- Cinco recorridos Chrome, 20 layouts: menú y cuatro juegos a 320/390/768/1366 px,
  sin overflow horizontal, imágenes rotas o controles visibles menores de 44 px.
- Cuatro juegos completados, celebración sin tablero, repetición en dos/tres parejas,
  teclado Enter, arrastre nativo de ratón, partida de dos parejas completa por toque.
- Silencio, fallo real de red MP3 y recuperación; cancelación al salir, sin audios
  superpuestos y movimiento reducido. Cero errores JS y cero escrituras API.

Logs de tipos, estructura, compilación, suite completa y Graphify se adjuntan al
cierre. Las capturas se inspeccionaron en escritorio y móvil. No amplía la cobertura
de todas las pantallas, ni sustituye una revisión profesional del contenido.

Resultados de cierre: tipos sin errores, estructura 410 archivos aprobada, build
1952 módulos (14.51 s), 25 pruebas de rutas y 349 pruebas de componentes en 31
archivos aprobadas (80.72 s). Resultados nuevos del 18 de octubre; no se reutilizan
cifras de V100/V101 como si se hubieran ejecutado nuevamente. Las advertencias de
Graphify de archivos sin símbolos extraíbles son diagnósticos de la herramienta.

Graphify refresh/check aprobados: 2843 nodos, 152 comunidades; 22 archivos sin
símbolos extraíbles. El mapa generado permanece local y no se versiona.

# V108 — juegos por edad y Taller de los Sonidos

Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama de cierre: `dev`; base: `503296d1866a8aeafc36782e5b8a7081a843b009` (V107).
Fecha: 2026-10-19. Implementación, no auditoría académica ni informe clínico.

## Alcance

Isla y Taller comparten nueve actividades iniciales por edad desde los cuatro años:
franjas editoriales 4–5, 6–7 y 8+. Cada mundo tiene once actividades en este corte;
el catálogo familiar da acceso a las once. El Taller conserva sus cuatro juegos y
suma comparar, ordenar, contar, memoria auditiva, sonido ausente, primero/al final e
intruso sonoro. Se usan tres rondas, dos modos, pistas, ilustraciones transparentes
y la narradora estática es-PE-CamilaNeural que ya usa la Isla, a velocidad y volumen
-8%. El taller ofrece 33 clips únicos (1,283,472 bytes) y siete nuevas imágenes
WebP 384 × 384 (217,428 bytes). La edad sólo orienta el contenido; no altera permisos.

## Comprobaciones nuevas

`npm test`: 25 pruebas de rutas y 384 de componentes, 409 PASS en 35 archivos.
`npm run typecheck`, `npm run check:frontend` (431 archivos, máximo495 líneas) y
`npm run build` (1967 módulos) PASS. Node 22 muestra la advertencia experimental ya
conocida de `--experimental-strip-types` en las pruebas de rutas.

Chrome con fecha fija y perfiles familiares ficticios; la API completa se interceptó
antes de red. `verify-browser.cjs` recorre selección de 9 juegos a los 4/6/8 años,
catálogo familiar de 11, preview/instrucciones, juego comparativo con respuestas
erróneas y tres rondas correctas, y los siete nuevos tableros. 28 disposiciones en
320/390/768/1366 px: sin desborde horizontal, imágenes faltantes ni objetivos menores
de44 px. Los 33 MP3 reales se descargaron y decodificaron con señal no silenciosa.
Cero errores JavaScript y cero escrituras API. Los eventos de reproducción de UI
fueron simulados; las comprobaciones no prueban el timbre percibido por una familia.

Capturas sanitizadas: `menu-390.png`, `menu-cards-390.png`, `mission-390.png`,
`same-round-390.png`, `memory-390.png`. Detalle de layouts y audios en
`browser-results.json`; originales, descripciones y SHA-256 de imágenes en
`art-assets.json`/`art-source/`; textos, tamaños y SHA-256 de voz en `clips.json`.
Créditos en `frontend/public/sounds/games/CREDITS.md` y
`frontend/public/sounds/voice/CREDITS.md`.

Graphify: extracción local AST sin LLM, refrescada al cierre; aviso de22archivos sin
símbolos. No se leyeron datos reales, no se iniciaron sesiones, no se usó un micrófono
real y no se modificó BD/API/permisos. Ninguna prueba demuestra aprendizaje, precisión
fonética, desarrollo infantil ni aceptación humana de la voz. Once juegos por mundo
es este avance; la meta aproximada de30 por mundo sigue pendiente.

## Publicación

Push normal a `dev` autorizado por el usuario. Esta evidencia registra la versión
local y sus pruebas; el despliegue público de Render se documentará sólo después de
comparar manifiesto, chunk compilado, MP3, WebP y health con el contenido publicado.

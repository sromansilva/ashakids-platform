# La Isla de las Palabras — ilustraciones

Fecha: 2026-10-16. Proyecto: https://github.com/sromansilva/ashakids-platform .

24 ilustraciones originales generadas con la herramienta integrada ImageGen para
esta colección. Atlas de 1536 × 1024, RGBA; animales, frutas y objetos con acabado
de juguete semitridimensional, reflejos y sombras suaves. No se usaron imágenes
de pacientes ni de otras personas, personajes de terceros o credenciales.

Se extrajeron los 24 objetos completos según sus regiones alfa, con margen y un
lienzo transparente común de 288 × 288; exportación WebP calidad92. No hay descargas
de proveedores externos durante el juego. Total de los24WebP:376156bytes.

Original, prompt exacto y coordenadas de extracción:
- docs/evidence/words-v101/generated-atlas.png
- docs/evidence/words-v101/image-prompt.md
- docs/evidence/words-v101/asset-crops.json

El árbol/isla y el fondo reutilizan las ilustraciones ASHAKids existentes del inicio:
world-lenguaje-v54 y asha-map-v70, con su procedencia previamente documentada.

Contenido centralizado en WordGames/wordContent.ts. Las instrucciones habladas
utilizan SpeechSynthesis del navegador, activado sólo por interacción. Su disponibilidad
y pronunciación dependen del dispositivo; el texto y los controles visuales siguen
disponibles. No se graba voz ni se envía audio a ASHAKids en estos juegos.

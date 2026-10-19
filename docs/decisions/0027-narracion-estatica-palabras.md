# ADR0027 — Narración natural estática en la Isla de las Palabras

Fecha: 2026-10-19. Estado: adoptado.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama dev, base 823d544a1b43c6bb572bad4f218c9175bf8c556a (V105).

## Contexto

El usuario encuentra intimidante la voz predeterminada del navegador y solicita
una voz cálida apropiada para acompañar a niños. Cambiar rate/pitch de Web Speech
no controla el timbre ni garantiza una voz española disponible en cada equipo.

## Decisión

La Isla reproduce un banco estático de 230 MP3 con voz sintética natural en español
de Perú, Camila, velocidad -8%, volumen -8% y tono sin modificación. Se generan
previamente usando sólo textos públicos del catálogo. No se clona una persona ni
se presenta la narradora como una niña. Palabras, instrucciones, pistas, frases,
historias y sus variantes quedan indexadas por texto normalizado.

Un reproductor por instancia sustituye la síntesis del sistema en WordParts;
detiene/libera audio al cambiar de indicación, iniciar micrófono, salir, cambiar
niño u ocultar página. Errores y frases futuras sin recurso mantienen alternativa
visual y aviso recuperable; no vuelven a una voz robótica. Botón de muestra en menú.

Los archivos se sirven desde el mismo origen, sin TTS externo durante el juego.
edge-tts es una herramienta de autoría local, fuera de runtime, requirements y
Docker. No se incorpora código de esa biblioteca al frontend. El servicio de
reconocimiento del micrófono y su limpieza/persistencia no cambian.

## Consecuencias

5,554,512 bytes de audio más índice/manifiesto. No exige voces instaladas en el
dispositivo ni claves de TTS en producción. El proveedor puede cambiar la generación
futura; hashes preservados identifican exactamente los recursos entregados.
Nuevas instrucciones requieren generar su audio y actualizar el índice. El generador
falla si faltan audios y no publica un índice parcial.

Este corte cambia sólo la voz de la Isla, no la narración histórica de otros mundos.
El timbre cálido es una intención editorial pendiente de aceptación humana; probar
MP3 no certifica comodidad subjetiva, pronunciación de sílabas ni eficacia clínica.
El catálogo sigue en once juegos con ocho inicialmente según edad, no treinta.

## Fuentes de implementación

Herramienta de autoría y parámetros: https://github.com/rany2/edge-tts .
Créditos en frontend/public/words/voice/CREDITS.md; textos/hashes en evidencia V106.

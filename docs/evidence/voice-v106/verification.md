# Voz natural de la Isla — V106 / 2026-10-19

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama dev.
Base:823d544a1b43c6bb572bad4f218c9175bf8c556a/V105.
Cierre: V106_Suavizar_Narracion_Palabras. Verificación de implementación, no una
auditoría académica nueva. Evidencia generada de nuevo para este cambio.

## Alcance

230 audios MP3,5,554,512bytes, voz sintética natural español de Perú Camila,
velocidad-8%,volumen-8%,sin alterar el tono. Textos/hashes/tamaños en clips.json.
Se cubren palabras, metas, instrucciones, pistas, historias, frases y variantes
de los once juegos actuales de Palabras. Muestra accesible desde el menú.
No son treinta juegos: se mantiene el catálogo11 y selección inicial8 por edad.

WordParts usa reproductor por instancia; cancelación al navegar, ocultar página,
cambiar indicación o abrir micrófono. Audio faltante/error muestra aviso y conserva
imágenes/texto. No voz del sistema como fallback ni llamadas TTS externas durante
el juego. La grabación/transcripción y otros mundos conservan su implementación.
Sin BD, permisos, cuentas reales, nuevos endpoints ni dependencias runtime.

## Comprobaciones

Chrome real:230 MP3 servidos por Vite decodificados con Web Audio, duración>0.1s,
pico de señal>0.001 y<=1; muestra, instrucciones y palabra reproducidas mediante
HTMLAudioElement, cero llamadas a speechSynthesis.speak. Error de recurso inducido
recuperable; tres layouts320/390/1366 sin overflow. Cero errores JS y cero escrituras
API; datos de familia ficticios interceptados. browser-results.json/browser.txt.
Captura preview-390 revisada para presentación. No aceptación auditiva humana.

Pruebas nuevas del reproductor: selección de archivo, cobertura de vocabulario/
metas/pasos, limpieza al reemplazar/cancelar, error recuperable, error tardío y
texto sin grabación. Suites de juegos existentes se ejecutan con el nuevo audio.
Resultados de tipos, estructura, suites, build y mapa se guardan en archivos .txt.

Resultado final:389componentes/34archivos y25rutas PASS; tipos/estructura420 PASS,
build PASS. Mapa2907nodos/137comunidades, refresh/check PASS. Avisos: Node strip-types
experimental y22archivos Graphify sin símbolos. Sin pruebas de BD/usuarios reales.

## Reproducción de assets

Herramienta local edge-tts7.3.1 instalada sólo en .venv-graphify para autoría.
Desde raíz: node tools/audio/prepare_word_voice.cjs y después
.venv-graphify/Scripts/python.exe tools/audio/generate_word_voice.py.
Para un entorno de autoría nuevo: pip install edge-tts==7.3.1 en entorno aislado.
No añadir a backend/requirements.txt. No hay datos de niños en los textos.
Fuente de parámetros: https://github.com/rany2/edge-tts . Créditos junto a los MP3.

## Límites y publicación

Intención de timbre cálido/pausado pendiente de aceptación humana; las pruebas
verifican transporte/decodificación/flujo, no comodidad subjetiva ni exactitud
fonética. El banco no añade juegos ni cubre voces de otros mundos. Instrucciones
nuevas requieren nuevo recurso; el texto sigue disponible si falta audio.

Publicación verificada: V106/3686f64330f5a0bd79cc0234d835cdcd0af26f21 subido a dev,
con HEAD/origin/dev/SHA remoto iguales. Render servido el19deoctubre08:56America/Lima:
health200, manifiesto230entradas equivalente, chunk compilado world-map-D2Wfugpy.js
y tres MP3 (muestra, gato e instrucción) con SHA256 exactos. render-live.json conserva
UTC, rutas, tamaños y hashes. Se verifica contenido desplegado, no un SHA consultado
mediante API privilegiada Render. No cuentas/sesiones/datos clínicos usados.

El verificador inicial comparaba bytes JSON WindowsCRLF/LinuxLF y seguía esperando
aunque el despliegue ya estaba disponible. Se corrigió a comparación JSON canónica;
los MP3 y JS siguen con comparación binaria exacta. Ejecución corregida aprobada.
Este cierre documental/verificador se publica como V107_Verificar_Despliegue_Palabras,
sin cambiar la aplicación V106 ni repetir sus suites como si fueran resultados nuevos.

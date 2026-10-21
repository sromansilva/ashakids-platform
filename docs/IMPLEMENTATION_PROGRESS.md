## V113 — verificación de publicación de ilustraciones de Sonidos / 2026-10-19

Seguimiento documental de V112, sin cambio funcional. Rama `dev`; build verificada del
commit V112 `0ec870a9c455e939467e906f446132bf3b2159e9`. Repositorio:
https://github.com/sromansilva/ashakids-platform . Commit documental:
`V113_Verificar_Publicacion_Animales_Sonidos`.

Render `https://ashakids.onrender.com`: índice y health HTTP 200; las referencias de
entrada coinciden con la build local. Los bundles principal JS/CSS y de Sonidos JS/CSS,
más los cuatro WebP V112, coinciden byte a byte por SHA-256. Evidencia en
[`render-live.json`](evidence/sounds-v112/render-live.json). Verifica contenido estático
público, no consulta un SHA privilegiado de despliegue. V112 se empujó sin force y GitHub
confirmó `1c92646..0ec870a`; `HEAD` y `origin/dev` locales coinciden. La consulta
`ls-remote` de confirmación no completó por falta de conexión a GitHub tras el push.

## V112 — igualar modelo de animales en Taller de Sonidos / 2026-10-19

Objetivo: dar a los dibujos de animales de las partidas el mismo acabado 3D suave que
las ilustraciones de las tarjetas del Taller. Rama `dev`; base V111
`1c92646cd1d9b8a3e9fe2e338e59adb04f0a936b`. Repositorio:
https://github.com/sromansilva/ashakids-platform . Commit previsto:
`V112_Unificar_Ilustraciones_Animales_Sonidos`.

Vaca, gato, perro y pollito cambian desde los SVG anteriores a WebP transparentes
384 × 384 con un modelo compartido. `AnimalPicture` mantiene la composición cuadrada;
los nueve juegos que reutilizan el catálogo central muestran el nuevo arte sin alterar
audio, reglas, progreso ni resultados. Se conservan los SVG previos. Nuevos archivos:
`tools/audio/package_sound_animals.py`, cuatro fuentes PNG y prompts/hashes bajo
`docs/evidence/sounds-v112/`, cuatro WebP versionados, `soundContent.ts`, `SoundParts.tsx`
y créditos; también se actualizan contexto y relevo. Sin cambio de arquitectura, API,
BD, permisos o dependencias de runtime.

Comprobaciones locales: 28/28 pruebas de Sonidos; typecheck PASS; `check:frontend`
432 archivos / máximo 495 líneas PASS; build de 1968 módulos PASS; Graphify check
2942 nodos PASS. En harness de demostración local, 4/4 imágenes cargadas en explorar,
2/2 en identificación, proporción completa y cuadrícula de dos columnas a 390 px.
Fixture sintético; no API operativa ni guardado de intentos. Error inicial EPERM del
directorio temporal de Vitest evitado al asignar el temporal a una carpeta del proyecto;
la ejecución repetida aprobó. `.gitignore` modificado antes de esta fase permanece fuera.

V112 `0ec870a9c455e939467e906f446132bf3b2159e9` se publicó por fast-forward en `dev`.
GitHub confirmó `1c92646..0ec870a`; `HEAD` y `origin/dev` local quedaron alineados.
Render verificado en la fase V113 con los recursos y límites indicados arriba. El cambio
local preexistente `.gitignore` sigue fuera del commit.

## V111 — verificación de publicación del Taller de los Sonidos / 2026-10-19

Seguimiento de despliegue de V110; sin cambios de interfaz, lógica ni pruebas de juego.
Rama `dev`, base V110 `3c059680f981976edeb8d2eaa9fc5c17bb2ef6f9`.
Repositorio: https://github.com/sromansilva/ashakids-platform . Commit documental:
`V111_Verificar_Publicacion_Taller_Sonidos`.

Verificación nueva el 2026-10-20 02:14 UTC (2026-10-19 21:14 America/Lima):
`HEAD`, `origin/dev` y `git ls-remote` coincidían con V110; Render devolvió HTTP 200
para index y health, y los bundles principal JS/CSS y `world-map` JS/CSS coincidieron
byte por byte (SHA-256) con el build V110 local. Rutas, tamaños, SHA y límites en
[`render-live.json`](evidence/sounds-v110/render-live.json). Es comprobación del
contenido público; no lee el SHA interno de despliegue mediante una API de Render.
No se usaron cuentas, cookies, datos infantiles o flujos clínicos. No se repiten aquí
las pruebas funcionales ya registradas en V110.

## V110 — unificación visual del Taller de los Sonidos / 2026-10-19

Objetivo: ordenar en 3×3 los nueve juegos y unificar sus pantallas conservando reglas,
sonidos, controles y progreso. Rama `dev`; base V109 `da4a9ef3da886019f356de9cdd6d3a45dd0b22ba`.
Repositorio: https://github.com/sromansilva/ashakids-platform . Commit de cierre:
`V110_Unificar_Interfaz_Taller_Sonidos`.

Cambios limitados a `frontend/src/pages/padre/Sessions/SoundGames/`: `SoundWorld.tsx`
reserva alturas iguales y muestra la marca de juego visitado; `sound-ui.css` centraliza
tokens y controles del mundo, cuadrícula 3 columnas sobre 1100 px / 2 debajo, ilustración
completa con `contain`, diseño móvil y movimiento reducido; `SoundParts.tsx` agrega
feedback reutilizable con icono y texto; `SoundActivities.tsx`, `SoundChallenges.tsx`
y `SoundMemory.tsx` presentan estados visibles de selección, reintento y acierto.
No cambian la Isla de las Palabras, backend, API, BD, audio ni asignaciones.

Verificación: `npm test` 409/409 en 35 archivos; pruebas específicas de sonido 28/28;
`npm run typecheck`, `npm run check:frontend` (432 archivos, máximo 495 líneas),
`npm run build` (1968 módulos) y Graphify `refresh/check` (2942 nodos, 147 comunidades)
PASS. En el harness sintético, los nueve juegos abren en 390×844, sus ilustraciones
cargan y sus botones miden al menos 48 px; el menú no desborda a 320/360/390/768/900/
1024/1280/1440 px. Los estados erróneo y correcto se comprobaron en identificación.
Primera ejecución de `npm test` bloqueada por `EPERM` al renombrar la caché temporal
del sandbox; la repetición con permisos ampliados pasó. Node mostró la advertencia
experimental existente de `--experimental-strip-types` en pruebas de rutas.

Vista local: `http://127.0.0.1:5175/tests/world-map-harness.html`; puerto 5174 ya estaba
ocupado. Usa fixture de demostración y no guarda intentos. Sin pruebas contra cuentas,
API, datos infantiles ni flujos clínicos. Revisión previa: `HEAD`, `origin/dev` y
`ls-remote origin/dev` coincidían en la base V109; `git diff --check` y la búsqueda de
patrones de credenciales no encontraron problemas. La modificación local preexistente
de `.gitignore` quedó fuera del conjunto. Cerrar con commit V110, push fast-forward y
comparación de SHA. V110 `3c059680f981976edeb8d2eaa9fc5c17bb2ef6f9` se publicó por
fast-forward; `HEAD`, `origin/dev` y la referencia remota quedaron sincronizados.
Render health/index HTTP 200; los bundles del sitio y de Sonidos coincidieron con el
build local. Evidencia en [sounds-v110/render-live.json](evidence/sounds-v110/render-live.json).

## V108 — nueve juegos por edad y ampliación de Sonidos / 2026-10-19

Objetivo solicitado: mostrar nueve juegos por edad en Palabras y Sonidos; llevar el
Taller a un estilo ilustrado coherente con la Isla y añadir retos con voz cálida.
Rama `dev`, base V107 `503296d1866a8aeafc36782e5b8a7081a843b009`.
Cierre funcional: `V108_Ampliar_Juegos_Sonidos_Por_Edad`. Repositorio:
https://github.com/sromansilva/ashakids-platform .

Ambos mundos muestran nueve actividades editoriales para 4–5/6–7/8+, con once por
mundo en total y catálogo familiar de once. HABLA suma siete retos a sus cuatro
actividades y comparte 33 MP3 estáticos es-PE-CamilaNeural de la Isla. Siete nuevas
ilustraciones WebP con PNGs de origen, metadatos y hashes. Audio cancelable, tres
rondas, modos y pistas. Sin cambio BD/API/asignaciones, sin escritura de XP y sin
evaluación clínica. La meta de aproximadamente30juegos por mundo sigue pendiente.
Decisión [ADR0028](decisions/0028-juegos-por-edad-y-taller-de-sonidos.md).

Comprobación: `npm test` 409 PASS (25 rutas +384 componentes); typecheck, check:frontend
(431archivos/máximo495líneas), build1967módulos y Graphify `refresh/check` (2940nodos,
131comunidades) PASS. Node muestra la advertencia experimental de `--experimental-strip-types`.
Chrome sintético: siete recorridos;28layouts320/390/768/1366,sinoverflow, fallback de
imagen ni objetivo menor de44px;33 MP3 decodificados con señal; cero errores JS o
escrituras API. Narración de UI y eventos de animales simulados; perfiles/fechas
ficticios, sin micrófono real. Capturas, comandos, tamaños, hashes y límites en
[evidencia sounds-v108](evidence/sounds-v108/verification.md).

V108 `11d9c388df0053179e454df2815bdfc240061484` está publicado en `dev`; `HEAD`,
`origin/dev` y `ls-remote` coinciden. Render verificado el 2026-10-19 20:50:22 UTC:
health HTTP 200 y 46 recursos públicos (chunk compilado, manifiesto, 33 voces,
siete ilustraciones y cuatro audios animales) responden 200 y coinciden por SHA-256
o JSON canónico. Evidencia en `docs/evidence/sounds-v108/render-live.json`. Confirma
contenido servido, no consulta privilegiada al SHA interno de Render.

## V109 — verificación pública del Taller de los Sonidos / 2026-10-19

Seguimiento documental de V108; sin cambios funcionales ni pruebas nuevas de juego.
Repositorio: https://github.com/sromansilva/ashakids-platform . Rama `dev`.
V108 `11d9c388df0053179e454df2815bdfc240061484` publicado y sincronizado entre
`HEAD`, `origin/dev` y la referencia remota. Render health HTTP 200 y 46/46 recursos
estáticos equivalentes, incluidos chunk, manifiesto, 33 MP3, siete WebP y cuatro
audios animales. Rutas, bytes, SHA-256 y hora UTC en
[`render-live.json`](evidence/sounds-v108/render-live.json). No se accedió a una
cuenta de Render, datos infantiles ni flujos clínicos. Suite y pruebas de navegador
corresponden a V108; no se declaran ejecutadas de nuevo en este corte.

Commit de cierre de esta evidencia: `V109_Verificar_Publicacion_Sonidos`.
Se conservó fuera del conjunto el cambio local preexistente de `.gitignore`.

## V107 — comprobación efectiva de Render / 2026-10-19

Rama dev, base3686f64330f5a0bd79cc0234d835cdcd0af26f21/V106. Objetivo:
registrar publicación real de la voz sin atribuir cambios funcionales al cierre.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Cierre: V107_Verificar_Despliegue_Palabras.

Push V106 realizado y HEAD/origin/dev/ls-remote coincidentes. Verificación nueva
Render19deoctubre08:56America/Lima: health200; manifiesto230entradas equivalente;
chunk compilado del juego y tres audios (muestra/gato/instrucción) con SHA256exactos.
No usuarios/sesiones/lecturas clínicas. Rutas/tamaños/hashes/UTC en render-live.json.
Confirma contenido público V106; no es lectura del SHA de despliegue en panel/API.

Archivos de este cierre:tools/audio/verify_render_voice.py, evidencia de publicación,
verification.md/contexto/relevo. El despliegue ya estaba disponible cuando el primer
verificador seguía esperando por CRLFWindows/LFLinux del JSON; se corrigió comparación
canónica de JSON conservando bytesexactos para JS/MP3. Script corregido PASS.
Las389pruebas/25rutas y build corresponden a V106, no se declaran repetidas aquí.
checkdelmapa actual; herramientas/documentación no forman parte de su corpus.

Publicar este cierre también en dev y verificar referencia remota. .gitignore previo
fuera del conjunto. Siguiente: aceptación humana del tono y micrófono en dispositivos;
seguir ampliando catálogo11hacia30por mundo sin declarar terminadas extensiones.

## V106 — voz natural y publicación de Palabras / 2026-10-19

Objetivo: atender el pedido de voz cálida y consistente para la Isla, y publicar
en Render. Rama dev; base823d544a1b43c6bb572bad4f218c9175bf8c556a/V105;
cierre V106_Suavizar_Narracion_Palabras. Repositorio:
https://github.com/sromansilva/ashakids-platform . No auditoría académica nueva.

Archivos: WordGames/wordNarrator, wordVoiceIndex, WordParts, WordWorld y CSS;
230MP3/manifiesto/créditos en public/words/voice; herramientas tools/audio de
preparación/generación/verificación pública Render; tests y evidencia voice-v106;
arquitectura/ADR0027. Se sustituye Web Speech sólo en la Isla por audios de narradora
natural peruana Camila con velocidad/volumen moderados y sin alterar pitch.
Se detienen al navegar, ocultar o activar micrófono. Muestra en menú, error recuperable,
sin fallback robótico. No cambios BD/endpoints/permisos/reconocimiento ni nuevos
juegos. El catálogo11/selección8 se conserva; treinta por mundo sigue pendiente.

Verificación nueva:389componentes/34archivos y25rutas aprobados; tipos y estructura420
aprobados. Chrome230MP3 reales decodificados con señal/duración, muestra/palabra/
instrucciones reproducidas, error inducido recuperable y3layouts320/390/1366 sin
overflow; cero llamadas de síntesis/escrituras API/errores JS. Captura móvil revisada.
Graphify refresh/check PASS,2907nodos/137comunidades; aviso22archivos sin símbolos.
Logs de build/suites y hashes en evidencia. Sin pruebas con personas/datos reales.

Entorno: edge-tts7.3.1 sólo instalado en .venv-graphify como herramienta de autoría;
no requirements/package-lock/Docker nuevos. 230audios5,554,512bytes, textos públicos
sin información de niños. Node conserva aviso strip-types. Generación inicial
ajustó seis textos de pistas espaciales para coincidir exactamente con el juego;
clips previos de preparación retirados antes del commit. Sin fallos finales de tests.

Publicación: push dev activa integración existente; tools/audio/verify_render_voice.py
compara manifiesto, chunk compilado y tres audios públicos más health para verificar
el despliegue real. No login/datos clínicos en ese verificador. .gitignore previo
preservado fuera del commit. Siguiente: confirmar ese resultado tras push y escuchar
con usuario/dispositivos; no certificar comodidad subjetiva sólo por decodificar MP3.

## V105 — selección por edad y Nombra el dibujo / 2026-10-19

Objetivo: iniciar selección de ocho juegos por edad y respuesta oral en LENGUAJE.
Rama dev; base 0aa0360d556981a72ce494ebc0856db7e958798c/V104; cierre
V105_Personalizar_Palabras_Edad_Microfono. Repositorio:
https://github.com/sromansilva/ashakids-platform . No es auditoría académica nueva.

Archivos: WordGames/wordSelection, NamingGame, useWordRecorder, WordWorld,
WordParts, wordContent y CSS; MundoAshaHome/DemoWorldPlayer/WorldMap; señal de
cancelación en api/client y voiceService; pruebas/fixture sintéticos; ADR0026,
arquitectura y diseño/evidencia words-v105. Catálogo once, menú ocho, modos manuales
de ayuda y catálogo familiar. No cambios BD, backend, permisos, persistencia ni
dependencias declaradas. Se conserva basica-1. Micrófono por acción, reproducción,
10s/5MB, respuesta45s, cancelación y limpieza; coincidencia textual o alternativa
de imágenes, sin calificación fonética/XP/medallas.

Comprobaciones nuevas:383componentes/33archivos y25rutas PASS; typecheck,
check:frontend416 y build1956 PASS. Backend16PASS/2deseleccionadas con -k 'not endpoint',
incluye Whisper real sobre tono sintético sin DB/autenticación real. Chrome7casos y
13layouts PASS con captura/reproducción reales sobre dispositivo falso y ASR/API
simulados; edades4/6/8, cambio de niño, permisos, tres rondas en ambos modos, teclado.
Tipos, estructura, rutas/componentes y build registrados en evidencia. Graphify
refresh/check PASS:2897nodos/126comunidades. Imágenes menu1366/result390 inspeccionadas.

Entorno local: instalado faster-whisper1.2.1 en backend/.venv y caché del modelo base
CPU/int8; importación/carga e inferencia sintética reales aprobadas. No .env editado,
cuentas ni datos compartidos. Avisos: Node strip-types experimental,22archivos de
Graphify sin símbolos, caché HF sin symlinks y descarga pública sin token. Preparación:
exact no permitido en Testing Library corregido; Playwright del runtime por variable
PLAYWRIGHT_MODULE al faltar el paquete en node_modules. No bloqueos finales de código.

Siguiente: probar voz humana/latencia y validar selección con profesional; luego
ampliar catálogo hacia treinta por mundo y definir personalización/persistencia si se
solicitan. No afirmar completadas esas extensiones. No Render/ASR remoto certificado.
Se preserva .gitignore local previo fuera del conjunto; antes de publicación revisar
diff/secretos/refs y al cierre confirmar SHA remoto de dev sin force-push.

## V104 — Isla con lógica de juego para preescolar / 2026-10-18

Diez juegos revisados para acompañar a niños desde los 4 años: bienvenida con meta,
pasos ilustrados, modos Primeros pasos/Un poquito más, pistas y mensajes concretos.
Sílabas iniciales por palmadas sin lectura, memoria con vistazo y 2/4 parejas, cestas
con un dibujo por turno, tres historias, comparación de opuestos por ronda, merienda
uno a uno, modelo espacial, rimas con escucha/confirmación y frases con pictogramas.
Bancos mezclados por partida y colección de la visita; éxito con recuerdo visual.
Diez portadas ImageGen propias, caracol/tambor nuevos y estética de ASHA conservada.

Trabajo en dev, base d35ee0cede509c6a53881b93c704c9685f765b93. Archivos WordGames,
nuevo StoryGame, pruebas de palabras, arte/créditos y docs/design/isla-palabras-prescolar.md.
Sin cambios de BD/API/permisos, dependencias ni premios persistentes (ADR0025).
Repositorio: https://github.com/sromansilva/ashakids-platform .

Verificación nueva: 23 casos focalizados, suite completa de 360 componentes y 25
rutas aprobados, tipos, estructura 411 archivos y build. Recorridos navegador de
los diez juegos en ambos modos aprobados: 20 partidas, 126 layouts y dos variantes
espaciales adicionales con 6 layouts; cero errores JS/escrituras API. Graphify:
2867 nodos y 129 comunidades, check actual. Resultados en
[evidencia V104](evidence/words-v104/verification.md). No datos reales ni pruebas BD.
No se certifica eficacia pedagógica/terapéutica ni síntesis audible en dispositivos.
Commit previsto V104_Mejorar_Juegos_Palabras_Preescolar,
publicación en dev y comprobación de Render al cierre, autorizadas por el usuario.
.gitignore local previo fuera del commit. Siguiente: aceptación visual y escucha
humana en los dispositivos de las familias; persistencia de práctica sigue diferida.

## V103 — ilustraciones por juego en el Taller / 2026-10-18

Se reemplazan las imágenes de animales de las cuatro tarjetas iniciales por arte
específico: panel sonoro, auriculares/lupa, tablero de dos piezas y tablero de tres.
Cuatro ilustraciones ImageGen independientes, transparentes, con acabado 3D y colores
coherentes con la Isla. WebP de 384 × 384, 124488 bytes totales. Las tarjetas toman
las superficies, bordes y sombras de la Isla; se conserva el menú de cuatro juegos
separados y su navegación. Los animales y MP3 dentro de las partidas no cambian.

Trabajo en dev, base 3935f5609f208e88847503c3fac8d52902d8b6e6 (V102). Archivos:
SoundWorld, SoundParts (imagen de tarjeta con fallback), soundContent, CSS,
public/sounds/games y créditos. Originales/prompts/evidencia en sounds-v103.
Sin cambios de arquitectura, dependencias, API, BD, permisos o persistencia.
Repositorio: https://github.com/sromansilva/ashakids-platform .

Verificación nueva: tipos y estructura frontend aprobados, 15 casos focalizados
aprobados; build de 1952 módulos y Chrome (seis recorridos, 20 layouts, cero errores
JS/escrituras API) aprobados. Graphify actualizado: 2844 nodos y 131 comunidades.
Resultados finales en
[evidencia](evidence/sounds-v103/verification.md). La revisión visual detectó imágenes
que desbordaban verticalmente sus tarjetas: altura explícita 200/125 px corregida y
comprobación de contención añadida al verificador. No pruebas con datos reales.
Commit previsto V103_Ilustrar_Tarjetas_Sonidos; dev y Render se comprueban al cierre.
.gitignore previo excluido. Siguiente: aceptación visual de las tarjetas nuevas.

## V102 — Taller de los Sonidos por actividades / 2026-10-18

El taller se organiza como la Isla: menú ilustrado y una sola actividad al entrar.
Cuatro entradas libres: Toca y descubre, ¿Quién está sonando?, Mis primeras dos
parejas y El reto de tres parejas. Las dificultades de asociación son independientes;
repetir conserva la cantidad elegida. Al completar, el logro reemplaza al tablero y
permite repetir o elegir otro juego, sin encadenar niveles. El mapa indica cuatro
juegos de práctica libre. Hero de la landing, cuatro tarjetas de colores y cabecera
sobria durante el juego, controles de audio y regreso con restauración de foco.

Trabajo en dev, base fb2dbb9bbf2dea71b29f026bff4244f908b121c0 (V101). Cambios en
SoundWorld, SoundActivities, SoundParts, soundContent, CSS, WorldMap y pruebas de
sonidos/mundos. Sin arte nuevo, dependencias, BD, endpoints ni cambios de premios;
las actividades guardadas siguen en «Para la familia» según ADR0025.
Repositorio: https://github.com/sromansilva/ashakids-platform .

Verificación nueva: 15 casos focalizados aprobados y Chrome real con cinco recorridos,
20 layouts (menú y cuatro juegos en 320/390/768/1366), cuatro actividades completadas,
reinicio independiente, toque/arrastre/teclado, audio MP3 real, fallos recuperables y
cero errores JS/escrituras API. Regresión completa aprobada: 349 componentes, 25 rutas, tipos sin errores, estructura
410 archivos y build de 1952 módulos. El mapa se registra al cierre en
[evidencia V102](evidence/sounds-v102/verification.md). No pruebas con datos reales.
Commit previsto V102_Ordenar_Taller_Sonidos; publicación en dev y comprobación Render
al cierre. El .gitignore local previo se conserva fuera del commit.
Siguiente: aceptación del orden visual y uso familiar de las cuatro actividades.

## Cierre V101 — colección de diez juegos de palabras / 2026-10-18

Objetivo del usuario: aplicar el acabado de ASHA a LENGUAJE con diez juegos educativos
distintos e imágenes de calidad como el inicio. Rama dev; base 7bb67e130251113a9eb81055353ed4c8c44cfdcc.
Repositorio: https://github.com/sromansilva/ashakids-platform .

Archivos: Sessions/WordGames(content/partes/menú/tres archivos de mecánicas/CSS),
DemoWorldPlayer, nota MundoAshaHome, etiqueta de 10 juegos en WorldMap,24WebP/CREDITS,
12 pruebas nuevas y actualización de 2 entradas de family-center. Contexto/arquitectura/
diseño y evidencia nueva en docs/evidence/words-v101. Fuente de arte/prompt/recortes
conservados; ImageGen integrado, sin APIkey/CLI ni dependencias nuevas. No backend/BD.

Funcional: vocabulario 3 rondas, memoria 3 parejas, clasificación 6 objetos, historia 3 pasos,
opuestos 3 parejas, sílabas 3 palabras, cantidades 2/3/4, posiciones 3 rondas, rimas 3 rondas,
frases 3 rondas. Menú/repetición/foco, feedback/reintentos sin castigo, toque y arrastre.
Práctica durante la visita; no POST educativo ni XP nuevos. Catálogo anterior y
asignación/paciente siguen en API. La voz usa SpeechSynthesis opcional con fallback;
limpieza al salir/ocultar, sin grabación ni reconocimiento de voz.

Verificación nueva:44 layouts y 10 finalizaciones/repeticiones Chrome real, errores JS 0,
escrituras API 0. Teclado y contexto táctil; clasificación con arrastre nativo.12 casos
Vitest nuevos cubren cada juego, errores/cambio/reinicio y limpieza. Suite/tipos/check/
build/mapa finales en evidencia. No login/datos clínicos reales ni pruebas BD.
Incidencias: límites de recorte del atlas ajustados por regiones alfa; expectativa
antigua de nivel directo en family-center actualizada; verificador de botones ocultos
corregido para medir controles visibles. No ampliar cobertura por imágenes/compilación.

Cierre V101_Implementar_Juegos_Palabras destinado a dev y despliegue existente en
Render; comprobar SHA/refs/recursos al entregar. `.gitignore` previo excluido.
Siguiente: revisión humana de contenidos e instrucciones habladas por edad/dispositivo;
persistencia de esta colección requiere un contrato versionado en etapa posterior.


Implementación y evidencia inicial obtenidas el 16 de octubre. Revalidación y cierre
el 18 de octubre, con alcance confirmado únicamente en los diez juegos de la Isla.
Revalidación aprobada: 347 componentes, 25 rutas, tipos, estructura 410 archivos,
build 1952 módulos y diez recorridos/44 layouts en Chrome. Graphify actualizado: 2843
nodos y 144 comunidades; aviso de 22 archivos sin símbolos. Sin pruebas BD reales.

## Cierre V100 — diseño de juegos de sonidos / 2026-10-16

Objetivo: acabado semitridimensional SVG y mayor creatividad, conservando la
estructura y navegación de ASHA. Trabajo en `dev` por instrucción del usuario,
base e54c48084085c9a58e0324d3bf1deb3378bb5837/V99. Repositorio:
https://github.com/sromansilva/ashakids-platform .

Archivos: cuatro SVG de animales refinados, garden.svg original, sound-world.css,
créditos y documentación de diseño/contexto/evidencia. Sin cambios de TSX/lógica,
BD/API, audios, permisos ni dependencias. La referencia orienta volumen/materiales/
composición; se conservan las mecánicas de los tres niveles de V99.

Comprobaciones nuevas y alcance en docs/evidence/sounds-v100/verification.md:
tipos, estructura, build, las 13 regresiones de sonidos/actividades anteriores y
recorrido Chrome con API sintética/audio real, incluidos arrastre, teclado, toque,
errores y tamaños de 320/390/768/1366px. Validación XML/referencias de cinco SVG.
No usuarios ni datos reales, cambios clínicos, migraciones o pruebas de BD.
Graphify refresh/check al cierre. No reutilizar cifras V99 como ejecución nueva.

Cierre V100_Redisenar_Juegos_Sonidos destinado a dev; comprobar SHA/push y recursos
en Render al entregar. El cambio local previo de .gitignore queda excluido.
Siguiente: aceptación visual; práctica nueva sigue sin XP/persistencia (ADR0025).

## Cierre V99 — juegos de sonidos / 2026-10-16

Objetivo: implementar los tres niveles de animales solicitados dentro de HABLA en
Mundo ASHA. Rama `amparitomaxi`; base inicial250defc/V68, sincronizada por fast-forward
con devf93f88957e2cf4d342f5004ce0489484783d96af antes de editar. `.gitignore` previo
preservado mediante stash específico/pop sin conflictos y excluido del cierre.
Repositorio: https://github.com/sromansilva/ashakids-platform .

Archivos: `SoundGames/{SoundWorld,SoundActivities,SoundParts,useSoundAudio,soundContent}`
y CSS, cuatro SVG/cuatro MP3/CREDITS, integración en DemoWorldPlayer y aclaración en
MundoAshaHome, seis pruebas nuevas y ajuste de entrada a pruebas del flujo anterior.
ADR0025 y documentación de arquitectura/diseño/contexto. No dependencias runtime nuevas;
imageio-ffmpeg instalado sólo en entorno local backend como herramienta de preparación
de audio, no en requirements ni en producción. Fuentes descargadas a tmp ignorado.

Verificación final tras incorporar devV98:335PASS/30archivos y rutas25PASS. Pasada
focalizada previa13PASS. Tipos/check402archivos/build1945módulos aprobados; Graphify
refresh/check2779nodos/127comunidades. Aviso Type Stripping experimental de Node y
22fuentes sin símbolos AST, sin fallo. Chrome real con APIs
interceptadas: seis recorridos/diezlayouts, cuatro archivos decodificados con señal,
cancelación/errores/mute/repetición, cinco rondas, asociación por ratón nativo y toque,
foco al entrar/volver y movimiento reducido. Capturas y resultados sanitizados en
`docs/evidence/sounds-v97/`. No login real, usuarios/pacientes nuevos, escrituras BD,
SMTP ni prueba de integración clínica; no se ejecuta pytest destructivo.

Incidencias: al iniciar la preparación, Python por defecto no servía a Graphify; se
usó `.venv-graphify`. Descarga inicial del gato429, recuperada desde la misma fuente
licenciada; se conservaron los cuatro recursos. Un comando npm inicial se lanzó en
la raíz sin package.json: se corrigió al directorio frontend. El nombre accesible del
botón de escucha y el retorno de foco fueron corregidos. Arrastre del verificador
requería mantener ambos extremos visibles sin scroll suave; ratón nativo confirmado.
Los fallos intermedios no representan el resultado final de las comprobaciones.
Integración concurrente: dev4cdd97bdf7b9bb4f65584de34ae0f1e8ec0b2230 incorpora V97/V98
del equipo. Al reaplicar el avance hubo dos conflictos de documentación: resueltos
conservando entradas de ambas partes. DemoWorldPlayer combina automáticamente VOZ
y HABLA; módulo VoiceSpeechGame intacto. Se repitieron suite/build/tipos/Chrome/mapa
sobre esa base. El ID de evidencia sounds-v97 se conserva; commit de entrega esV99.

Límite explícito: nueva práctica sólo en memoria; `basica-1` y su progreso guardado
continúan en «Para la familia». No presentar como persistida ni otorgar resultados
clínicos. La imagen mencionada no venía adjunta; dirección aplicada desde el texto y
el diseño existente. Siguiente: aceptación humana de apariencia/audio; persistencia
nueva requiere una extensión versionada y autorizada. Cierre V99 destinado a dev y
amparitomaxi con push normal; verificar SHA/refs/CI reales antes de informar entrega.

## Cierre V98 — Reconocimiento de voz local con Whisper en El Estudio de la Voz / 2026-10-16

Objetivo: incorporar reconocimiento de voz automático (ASR) para el mundo «El Estudio de la Voz» (`VOZ`) usando faster-whisper en local y comparación textual para gamificación de habla infantil.
Rama feat/nlavadom sobre base dev sincronizada.
Archivos modificados/creados:
- Backend: `app/api/v1/voz.py`, `app/schemas/voz.py`, `app/services/reconocimiento_voz.py`, `app/services/comparador_texto.py`, `app/core/config.py`, `app/main.py`, `app/schemas/juegos.py`, `app/services/juegos.py`, `app/services/juegos_catalogo.py`, `requirements.txt`, `tests/test_reconocimiento_voz.py`, `tests/test_clinical_api.py`, `tests/test_public_worlds_unit.py`.
- Frontend: `src/pages/padre/Sessions/VoiceSpeechGame.tsx`, `src/services/voiceService.ts`, `src/pages/padre/Sessions/DemoWorldPlayer.tsx`, `tests/voice-speech-game.test.tsx`.
Verificación realizada:
- Pytest backend: 239 passed (18 de voz y regresiones de catálogo público) en pytest local.
- Vitest frontend: 25 rutas pasadas + 6 tests de componente `voice-speech-game.test.tsx` pasados.
- Build frontend: `npm run build` completado exitosamente sin errores de TypeScript.
- Knowledge Map: `python tools/knowledge/manage.py refresh` y `check` aprobados (2755 nodos).
Integración: commit bajo convención `V98_Reconocimiento_Voz_Juegos` e integración a dev y origin.

## Cierre V96 — guardado de juegos y validación BD / 2026-10-11

Objetivo: resolver el error mostrado al completar HABLA3 y verificar cinco mundos/15niveles. Rama feat/piero-dev, inicio6558a0776dd41302d3435819f3644fa9f1ff33f8/V93. Fetch detectó V94 del equipo7b647aa3f0ca1c5a106edc537ac466411ec1c84c, incorporado por fast-forward sin conflictos; conservar título/SHA. Repositorio:https://github.com/sromansilva/ashakids-platform . Cierre V96_Corregir_Guardado_Juegos; push normal autorizado a dev/feat/piero-dev y refs/CI verificados al entregar. No confundir commit con despliegue.

Causa: UPDATE experiencia_otorgada tras INSERT al otorgar medalla, incompatible con permiso SELECT/INSERT de resultados_nivel. Reproducción previa1FAIL/2PASS,HTTP503/SQL42501. Cambio en backend/app/services/juegos.py calcula premio definitivo antes de INSERT; mantiene transacción, autorización, bloqueo y UUID. Sin migración ni GRANT. Nuevas5 regresiones parametrizadas en backend/tests/test_learning_games.py comprueban premio100/100/200, SQLpersistido, medalla única, UUIDrepetido y ausencia de UPDATE. Fixture del módulo reinicia el limitador por caso sin desactivar límites productivos. Nuevo backend/scripts/verify_games_readonly.py consulta metadatos/agregados sin PII en transacción READ ONLY.

Comprobaciones nuevas: pytest tests/test_learning_games.py8PASS/7,96s en PostgreSQL17.6 local6545 y rol ashakids_runtime sin UPDATE de intentos. Limpieza con propietario solo en ashakids_test_games_v94 loopback. Vitest demo-worlds/family-center16PASS/2archivos con API simulada. Chrome1274x950 real React5188→API8002→PG6545:15 niveles200/0erroresJS; recarga confirma2000XP/nivel11/15intentos/5medallas; SELECT independiente confirma3correctos/400XP por mundo y noUPDATEprivilege. Build después de incorporar V94 PASS/1937módulos; NodeDEP0205 existente. Graphifyrefresh AST/noLLM:mapa AST actualizado y check al cierre; diff--check. Capturas6 y JSON/logs sanitizados en docs/evidence/audit-2026-10-11-02/. Informe editable docs/audits/auditoria-2026-10-11-02.md y PDF correspondiente con8secciones/renderQA. Índice/contexto actualizados.

Compartida: conexiónTLS y transacción READ ONLY;8tablas legibles,5medallas de catálogo, UPDATEintentosfalse. Solo metadatos/agregados;0cuentas/pacientes/sesiones auth/escrituras reales. Comparador33tablas/22modelos y diferencia de adjuntos tamano_bytes integer/bigint, ajena al fallo. Aviso cicloFK existente. No certifica todos los modelos/columnas/datos. No audio audible, carga, móviles, impacto clínico ni despliegue remoto. Juegos siguen simulaciones básicas.

Incidencias de preparación resueltas: suite ampliada5PASS/3ERROR por429login acumulado; aislar presupuesto porcaso. Comando intermedio escribió ASHAKIDS_TEST_DATABASE_ADMIN_URL en lugar de ASHAKIDS_TEST_ADMIN_DATABASE_URL, causando8errores TRUNCATE local; corregido sin ampliar permisos. Búsquedas exploratorias de rutas inexistentes corregidas. La última suite tiene0fallos/0omitidas. Servidor del usuario8000/5174 conservado;8000 usa --reload. Servicios propios8002/5188 y cluster6545 se detienen al finalizar; seedlocal descartable sin datos compartidos.

Siguiente acción: con backendV96 desplegado, reintentar HABLA3 en sesión familiar autorizada y comprobar la medalla pendiente; intentos previos intactos, no necesita migración. Verificar SHA de runtime remoto; CI Knowledge map solo certifica mapa. La auditoría incluye instrucciones para repetir SQL aislado; no reutilizar cifras antiguas como pruebas nuevas.

También se incorporó V95 de cabeceras del equipo,32df0e8b8459e8a5f78f1d7f311a029e4f58756e, por fast-forward sin conflictos; es la base final de V96. Se repitieron8 pruebas API/SQL después de esa integración, sin repetir navegador ni build de frontend.

## Cierre V93 — formulario guiado de reportes / 2026-10-11

Objetivo: agilizar la redacción del reporte con plantillas y cinco intensidades de ayuda seleccionables. Rama `feat/piero-dev`, inicio `92a5ecebe2486c4d9e2406d79d3c04ad1fc61ded`/V92; dev y rama del usuario sincronizadas al inicio. Al cerrar, fetch detectó `b1f2e2e03fe6170e6b0293120590b30a81b08e00` (`V82 Preparar suite de QA automatizada`) del equipo en dev. Se incorporó por fast-forward sin conflictos ni pérdida del trabajo local; es la base de V93 y se conserva su título/SHA sin renumerarlo. Esa suite QA nueva no se ejecutó ni se certifica aquí; no afecta las fuentes runtime modificadas. Repositorio: https://github.com/sromansilva/ashakids-platform . Commit de cierre previsto `V93_Guiar_Formulario_Reportes`; integración/publicación normal autorizada en dev/feat/piero-dev y verificación de refs al cerrar.

Archivos: ClinicalReportEditor.tsx, nuevos ReportHelpLevel.tsx y reportFormGuidance.ts, integración de nombre desde ReportWorkspace.tsx/SessionActions.tsx, nuevo tests/guided-report.test.tsx y contexto/relevo. Plantillas insertadas solo al solicitarlo en campos vacíos, con nombre real de la sesión y selección del primer marcador; notas existentes intactas. Validación de marcadores específicos evita guardar plantillas sin completar; otros textos entre corchetes siguen permitidos. Nivel ayuda: cinco radios Sin ayuda/Mínima/Moderada/Alta/Total, explicación y teclado nativo. Mantiene el texto histórico si no se selecciona otro; no infiere intensidad, hallazgos ni resultados. Campos narrativos de cuatro filas iniciales, editables/redimensionables. Describe recursos y mundo acordado sin modificar la asignación del plan.

Verificación:63PASS en guided-report/frontend-remediation/integration-ui/professional-plan. Comprueba nombre, inserción voluntaria, campos vacíos sin autoguardado, guardado bloqueado con marcadores, foco/error, payload completo, cinco selecciones exclusivas y conservación de texto histórico. Suites previas mantienen permisos, inasistencias, error409, doble envío y vista previa. Typecheck, check:frontend392 tras integrar QA (388 antes), build1937 módulos, detector[] y diff--check PASS; Graphify refresh/check AST local al cerrar. Chrome aislado con datos ficticios1274/375px: plantillas y niveles visibles, sin overflow horizontal, clic en etiquetas y flecha derecha seleccionan el nivel esperado; intento incompleto produjo0 escrituras HTTP. Capturas locales ignoradas `tmp/report-v93-desktop.png` y `mobile.png`; fixture retirado y servidor propio detenido.

Incidencias resueltas: primera prueba nueva usó un matcher asimétrico no soportado por toHaveValue; corregida para comprobar el valor real. Automatización visual intentó pulsar el input oculto y después buscar un texto exacto que incluía numeración; corregida para pulsar su etiqueta visible. Comandos exploratorios apuntaron a una ruta inexistente y un glob incompatible con Windows; rutas concretas confirmadas. Sin errores funcionales pendientes detectados; aviso Node DEP0205 existente. No nuevas sesiones auth, pacientes, reservas ni escrituras a BD real; sin prueba clínica completa, proveedor externo, nuevo PDF ni aceptación del despliegue. Sin arquitectura/API/esquema nuevos, ni obligación de reescribir reportes históricos.

Publicación anterior verificada V92: `92a5ecebe2486c4d9e2406d79d3c04ad1fc61ded`, push atómico y mismas refs dev/feat/piero-dev; CI Knowledge map aprobado en [dev](https://github.com/sromansilva/ashakids-platform/actions/runs/38148380309) y [feat/piero-dev](https://github.com/sromansilva/ashakids-platform/actions/runs/38148380603). Evidencia heredada del cierre V92, no ejecución de V93. Siguiente acción: revisar el formulario en el despliegue y continuar aceptación operacional con cohorte autorizada; la asignación de mundos sigue en el plan profesional.

## Cierre V92 — ubicación automática en reservas / 2026-10-11

Objetivo: retirar la localización manual de la reserva familiar y completar la información según modalidad. Rama `feat/piero-dev`, base `f34dfee`/V91; `origin/dev` y `origin/feat/piero-dev` en esa base tras fetch. Repositorio: https://github.com/sromansilva/ashakids-platform . Commit de cierre previsto `V92_Autocompletar_Ubicacion_Reservas`; publicación autorizada en ambas ramas mediante avance normal, sin reescribir historia. Consultar su SHA final y sincronización en Git.

Archivos: BookingDialog.tsx, tests/family-center.test.tsx y estos documentos de continuidad. Presencial usa `Jr. Ricardo Treneman 252, Chorrillos 15064`; Virtual usa `La reunión será mediante Zoom.`. Información de solo lectura con anuncio accesible al cambiar modalidad, resumen y payload derivados del mismo valor. El componente compartido también aplica esta selección al reprogramar. No cambios de arquitectura, API, esquema, enlaces Zoom ni reservas históricas; no escrituras a BD real.

Verificación: `node node_modules/vitest/vitest.mjs run tests/family-center.test.tsx tests/integration-ui.test.tsx`:42PASS, incluye cuatro combinaciones intro/terapia y presencial/virtual, cambio de modalidad, ausencia de textbox manual, resumen y payload. Typecheck, check:frontend385, build1935 módulos, detector[] y diff--check PASS. Graphify refresh/check al cierre, AST local sin LLM. Revisión visual del componente con HTTP interceptado y perfiles ficticios en Chrome1274/375px, ambas modalidades sin overflow horizontal. Capturas locales ignoradas `tmp/booking-v92-*.png`; fixture temporal retirado. No sesión auténtica, reserva real, ensayo del proveedor Zoom ni certificación de despliegue remoto.

Incidencias: servidor visual inicial no arrancó porque5176 estaba ocupado; verificación ejecutada en5187 y servidor propio detenido. Lectura inicial AuthContext.ts no encontró archivo; implementación usa AuthContext.tsx. Aviso existente DEP0205 al compilar; sin fallos de pruebas. Siguiente acción: comprobar la reserva en el despliegue con cohorte autorizada y continuar la aceptación operacional pendiente; no crear pacientes/reservas reales para pruebas sin autorización explícita.

## Publicación verificada V90 / cierre documental V91 — 2026-10-11

Commit funcional y auditoría publicados: 9a928604e07bb8eef1206a14b60a50581d6bd13e, V90_Habilitar_Domingos_Agenda_Recorrido_Web. Push atómico a dev y feat/piero-dev; git ls-remote devolvió ese mismo SHA para ambas ramas. Árbol limpio tras publicación. Repositorio: https://github.com/sromansilva/ashakids-platform .

CI Knowledge map V90 aprobado en [dev](https://github.com/sromansilva/ashakids-platform/actions/runs/38146649063) y [feat/piero-dev](https://github.com/sromansilva/ashakids-platform/actions/runs/38146649012). Este CI comprueba el mapa, no Zoom/correo ni el recorrido clínico completo. PDF de auditoría renderizado e inspeccionado: siete páginas, sin recortes ni encabezados huérfanos; evidencia pdf-qa.json. Pruebas/evidencia/limitaciones se describen en el corte V90 inferior y en el informe; no son ejecuciones nuevas de este cierre documental.

V91 registra el SHA y publicación efectiva, sin cambiar aplicación, BD ni pruebas. Se integra/publica también en dev/feat/piero-dev, conservando V90. Siguiente tarea: aceptación operativa con el guion web en cohorte autorizada, sin reutilizar contraseñas DNI; priorizar REC01/REC02/REC06. Disponibilidad del domingo exige selección/publicación del terapeuta. No se confirma despliegue HTTP remoto.

## Cierre V90 — recorrido web y disponibilidad dominical / 2026-10-11

Revisión sobre feat/piero-dev, base bd8c17d79eb81b098535179f021e3b0adbfdfd11/V89. Repositorio: https://github.com/sromansilva/ashakids-platform . Corte [2026-10-11-01](audits/auditoria-2026-10-11-01.md), [guion de exposición](acceptance/GUION_RECORRIDO_BASE_WEB.md) y [operación dominical](operations/DISPONIBILIDAD_DOMINGO.md). Prioridad escritorio; sin estudio responsive.

Domingo opcional en Disponibilidad: UI siete días, contrato dia0–6/máximo70 únicos, ORM/SQL y migración012. CHECK compartido adoptado explícitamente;60 filas/huella/ACL/RLS/políticas/otras restricciones conservadas tras COMMIT. No DML clínico, usuarios ni sesiones auth nuevas. OpenAPI local confirma máximo6/70; runtime remoto no certificado. Publicación de turnos sigue a cargo del profesional, sin saltar futuro/bloqueos/ocupación.

Auditoría nueva:33 tablas/241 columnas/137 restricciones/44FK;32 modelos cargados, diferencias de tipo adjuntos y longitudes mundos/objetivos pendientes. REC01–REC09 documentan alta familiar con hijo obligatorio vs alta tutor solicitada, correo de activación vigente, formulario del hijo de tutor, borradores, cierre clínico, distintas habilitaciones, acceso infantil a XP/insignias, selects y documentación. No se implementan esas extensiones por esta revisión.

Verificación nueva:319 componentes/27 archivos,25 rutas, tipos/check385/build1935 PASS; backend221PASS/82SKIP/19 avisos. pypdf6.20 instalado según requirements-dev; test de protección público histórico corregido con lista exacta y seis casos adicionales, sin cambiar API. API GET raíz/health/readiness/OpenAPI200 y auth/me401;16 SELECT LIMIT0 aprobados. UI disponibilidad revisada en fixture sintético escritorio1274px, publicación dia6 sin BD. No aceptación real completa, correo/Zoom operativo ni carga. Avisos existentes de Node/Starlette/cookies y ciclo de metadatos.

Commit del conjunto: V90_Habilitar_Domingos_Agenda_Recorrido_Web, se publica en dev/feat/piero-dev al cerrar. La confirmación de SHA/push y CI se registra en el siguiente cierre documental; no confundir este estado de trabajo con despliegue remoto. Siguiente acción: ejecutar el guion con cohorte autorizada y decidir REC01/02/06 antes de ampliar UI.

## Cierre V88 — Centro Familiar, administración y login / 2026-10-11

Objetivo: cerrar las observaciones de diseño acumuladas y conservar los flujos operativos. Rama de trabajo `feat/piero-dev`, base auditada `bf868da` (V87); integración solicitada en `dev` y sincronización de ambas ramas. Repositorio: https://github.com/sromansilva/ashakids-platform . El SHA de este cierre se identifica por el commit `V88_Mejorar_Centro_Familiar_Admin_Login`; no confundirlo con la versión de la API. Los apartados locales inferiores son el historial anterior a esta autorización de publicación.

Cambios: Centro Familiar infantil con Mi mundo, Mi camino y Para mi familia; mundos asignados por paciente y jugador existente; seguimiento, reservas, planes, sesiones, reportes y accesos adultos conservados. Recuperado Actualizar seguimiento en el panel integrado. Administración incorpora timeline de auditoría con datos reales del contrato, tarjetas de herramientas con logos y glass, cabeceras compactas y tabla de pacientes sin columnas ficticias. Registro usa desplegables propios, edad derivada y perfil profesional ampliado en campos existentes. Login limpia contenido y afina foco. Retirado En línea de mensajes porque no existe presencia del servidor. Sin nuevos endpoints, autenticación, esquema o migraciones.

Validación de cierre: 319 pruebas de componentes en 27 archivos aprobadas; 25 pruebas de rutas aprobadas. Casos nuevos verifican cambio de hijo por ID, mundos asignados, persistencia del intento mediante learningGames.attempt, reserva introductoria y terapia con paciente/plan correctos, actualización del seguimiento, errores/vacíos y selectores. La primera ejecución completa detectó expectativas antiguas de textos y nombres accesibles; se actualizaron manteniendo comprobaciones de payloads, adjuntos, permisos, errores y mensajes. Tras el último ajuste: typecheck aprobado, check:frontend385 aprobado, build1935 módulos aprobado, diff--check limpio, Graphify refresh/check actual y consulta de relaciones confirmada leyendo servicios/frontend y routers/backend. Build mantiene aviso existente DEP0205 module.register.

Comandos ejecutados desde frontend con Node local: `node node_modules/vitest/vitest.mjs run` (319/319), `node --experimental-strip-types --test tests/routing.test.mjs` (25/25), `node node_modules/typescript/bin/tsc --noEmit`, `node scripts/check-frontend.mjs`, `node node_modules/vite/bin/vite.js build`. En raíz: `python tools/knowledge/manage.py refresh`, `check`, `query "FamilyCenter FamilyTrackingPanel learningGames"` y `git diff --check`. No se ejecutó la suite clínica de backend que requiere BD descartable.

Alcance real: pruebas con respuestas HTTP y escrituras simuladas, más revisión visual previa aislada en escritorio y móvil con perfiles ficticios. No se crearon cuentas ni reservas, ni se modificaron datos de la BD real; no se probó una sesión auténtica de extremo a extremo. No afirmar funcionamiento al 100% a partir de estas pruebas. DNI/RENIEC del terapeuta sigue bloqueado por diseño; correo/videollamadas dependen de configuración existente. No constituye una nueva auditoría técnica ni reemplaza sus informes.

Publicación verificada: commit funcional `15ed694f57dacacfa397ef408f7969b759cb6926` (`V88_Mejorar_Centro_Familiar_Admin_Login`). `dev` avanzó por fast-forward desde V87; push atómico de `dev` y `feat/piero-dev` aprobado. `git ls-remote --heads origin dev feat/piero-dev` devolvió el mismo SHA para ambas ramas; árbol limpio. CI Knowledge map aprobado en [dev](https://github.com/sromansilva/ashakids-platform/actions/runs/38140227111) y [feat/piero-dev](https://github.com/sromansilva/ashakids-platform/actions/runs/38140227071). Es un chequeo del mapa, no de operación clínica. El mapa local se regeneró tras el cambio de SHA.

El cierre documental V89 registra esta publicación efectiva y no cambia fuentes ni pruebas. Se integra/publica también en ambas ramas sin reescribir V88. Siguiente acción: validación operativa autorizada con sesión real y revisión del usuario de las pantallas adultas existentes. No hay fallos de pruebas locales o CI pendientes en V88; quedan los límites operativos declarados arriba.

## Ajuste local pendiente — Centro Familiar infantil / 2026-10-11

Objetivo: implementar la propuesta elegida de dos opciones para el niño, con secciones pertinentes y glass. Rama `feat/piero-dev`, base `bf868da`/V87, trabajo anterior preservado. Archivos nuevos FamilyCenter, FamilyWorlds, FamilyCenterSections y family-center.css; ajustes en PadreHome, DashLayout, FamilyTrackingPanel, publicAssets y pruebas. Navegación por query params dentro de /padre, selección por paciente, mundos asignados y DemoWorldPlayer existente; familia mantiene seguimiento y accesos operativos. Sin nuevos endpoints ni escrituras de BD.

PASS: 57 casos entre family-center (5), family-tracking (12), demo-worlds (7) y phase3-coherence (33). Primer intento tuvo una espera asíncrona faltante y dos expectativas antiguas de una cabecera retirada antes de este cambio; corregidas para esperar Planes y validar el tratamiento persistido en su pestaña. Segundo pase aprobado. Revisión IAB aislada con Leo/Luna ficticios en escritorio y móvil375: inicio, mundos/niveles, camino y familia; cambio de perfil actualiza próxima cita, sin scroll horizontal ni imágenes rotas. Corrección de foco conserva cabecera al navegar y reduce altura para botones visibles en escritorio. Fixture temporal retirado, captura tmp/family-center-desktop.jpg y mobile.jpg, sin sesión real ni creación/reserva real.

Assets Ashi saludando y libro ilustrado generados como PNG con transparencia, derivados WebP320/640 mediante runtime Python/Pillow disponible. No se regeneró el manifiesto completo ni assets históricos. Sin commit/push; siguiente acción: revisión del usuario y continuación de observaciones antes de integrar/publicar. No afirmar sincronización remota ni despliegue.

Comprobaciones finales: typecheck, check:frontend385, build1935, detector[] y diff--check PASS; Graphify refresh/check actual. DEP0205 module.register existente durante build. No fixture temporal en fuentes/public/dist. Las verificaciones no incluyen login auténtico ni tráfico operacional real.

## Ajuste local pendiente — auditoría visual / 2026-10-11

Rama `feat/piero-dev`, base `bf868da` (V87). La vista Auditoría y seguridad sustituye tarjetas altas por una línea de tiempo agrupada por día en America/Lima, con iconos por acción, filtros por módulo, búsqueda por actor/registro/acción y fechas inclusivas. Contadores glass para total global y operaciones cargadas; eventos y controles sólidos para lectura. Detalle desplegable muestra únicamente ID, acción y fecha existentes. Conserva GET /admin/auditoria y permisos; el backend devuelve hasta 100 eventos CRUD recientes. No se inventan accesos, alertas, porcentajes ni datos de seguridad ausentes del contrato. Incluye carga, error/403, reintento, actualización y vacío filtrado.

Archivos: AdminAuditoria.tsx, auditView.ts, audit.css y tests/admin-audit.test.tsx. PASS: 3 pruebas de filtros/fecha Lima/orden, total global frente a cargados, detalle/limpieza/actualización y reintento; typecheck, check:frontend (380 archivos), build, detector [] y diff--check. Graphify refresh/check actual. Revisión visual aislada del componente en escritorio y 375 px con eventos ficticios, sin desbordamiento horizontal; no se verificó una sesión autenticada ni tráfico real contra BD. Avisos existentes: module.register DEP0205 y fetchPriority en PublicIllustration. Capturas locales ignoradas tmp/audit-desktop.jpg y tmp/audit-mobile.jpg; fixture temporal retirado del public y dist. No escrituras de BD.

Sin commit/push por la instrucción vigente de terminar todas las observaciones de diseño. Centro Familiar conserva sus tres propuestas visuales pendientes de elección; no se ha implementado una variante. Siguiente acción: revisar el diseño de auditoría con el usuario y continuar sus observaciones.

## Ajuste local pendiente — foco fino de campos login / 2026-10-11

Usuario y contraseña retiran outline interno3px; wrapper conserva borde1px violeta y halo2px suave mediante focus-within, sin choque con texto/iconos. Indicador de foco externo de botones conservado. Diff--check y Graphify refresh/check; sin nuevas pruebas de autenticación. Sin commit/push.

## Ajuste local pendiente — primer acceso bajo login / 2026-10-11

Aviso de primer acceso y Solicitar enlace se mueven debajo de Iniciar sesión, fuera del form dentro del panel, con separación24px. Ruta crear-contrasena conservada. Diff--check y Graphify refresh/check; sin nuevas pruebas funcionales. Sin commit/push hasta terminar observaciones.

## Ajuste local pendiente — limpieza del login / 2026-10-11

Retirados párrafo inferior de bienvenida y etiquetas Lenguaje, Seguimiento y24/7 Disponible, junto a estilos/imports sin uso. Título, ilustración y formulario conservados. Diff--check y Graphify refresh/check; sin nuevas pruebas de autenticación. Sin commit/push hasta completar observaciones.

## Ajuste local pendiente — idiomas y habilidades de terapeuta / 2026-10-11

Perfil profesional incorpora hasta3 idiomas (Español, Quechua, Aimara, Inglés, Portugués) y2 habilidades (Trabajo en equipo, Comunicación con familias, Escucha activa, Adaptación de actividades, Organización y seguimiento). Desplegables propios, opciones no repetidas, adicionales aparecen progresivamente y pueden quitarse. Sólo texto, sin medallas/puntuaciones. Idiomas conserva campo de50 caracteres; fortalezas se guardan como línea Habilidades en descripcion_profesional existente, preservando otras líneas; backend ya persiste ambos. Resumen muestra selecciones. Sin esquema ni escrituras reales.

PASS typecheck, check:frontend377 archivos, tres pruebas selector/perfil (idiomas distintos, habilidades y descripción conservada), detector[], diff--check y Graphify refresh/check. Sin verificación visual autenticada ni creación de cuenta. Sin commit/push hasta completar observaciones.

## Ajuste local pendiente — áreas del perfil de terapeuta / 2026-10-11

Especialidad de texto libre pasa a desplegable propio Área de especialización con cinco áreas vinculadas a Mundo ASHA: Habla y articulación, Comprensión y expresión del lenguaje, Fluidez del habla, Voz y Motricidad orofacial. No usa títulos de juegos. Conserva valor previo general hasta seleccionar un área y guarda selección en especialidad existente, sin cambios de esquema ni de cuentas reales. Idiomas y experiencia conservados. Typecheck, dos pruebas AccountSelect, detector[], diff--check y Graphify refresh/check. Sin verificación visual autenticada nueva; sin commit/push hasta completar observaciones.

## Ajuste local pendiente — DNI visual de terapeuta / 2026-10-11

Primer paso de crear terapeuta incorpora tipo DNI, número y botón Consultar RENIEC, todos bloqueados como presentación pendiente. No son obligatorios, no almacenan documento ni envían consultas; nombres/apellidos/correo conservan flujo. Typecheck y diff--check PASS; Graphify refresh/check. Sin nueva prueba de BD o visual autenticada. Sin commit/push por petición vigente.

## Ajuste local pendiente — edad derivada de nacimiento / 2026-10-11

Registro padre/hijos elimina input editable Edad y sube Sexo a la segunda columna junto a Fecha de nacimiento. Edad calculada en años cumplidos con fecha de Lima, mostrada como información bajo nacimiento y conservada en resumen. Al elegir/borrar fecha, editar o guardar hijo se deriva edad; validación3–12 recalcula desde nacimiento, sin exigir valor manual. Backend persiste fecha como antes; sin cambios de BD. PASS15 pruebas (edad, select y family-activation), typecheck, detector[], diff--check y Graphify refresh/check. Validación visual autenticada pendiente. Sin commit/push, avances admin anteriores preservados.

## Ajuste local pendiente — desplegables propios de registro / 2026-10-11

Parentesco y Sexo del flujo padre/hijos usan AccountSelect, con menú blanco, borde violeta, opciones lavanda y marca de selección. DNI bloqueado conserva presentación existente. Combobox/listbox con aria-activedescendant, selección controlada, flechas/Home/End, Enter/Espacio, búsqueda por inicial, Escape sin cerrar modal, cierre al salir de foco/clic exterior y estado disabled. Valores/payloads originales conservados. Sin cambios de BD. Foco inicial del paso incluye combobox.

PASS typecheck/check:frontend373 archivos, dos pruebas nuevas de interacción del selector y11 pruebas existentes de family-activation. Primer intento de escribir pruebas usó una ruta duplicada y falló; corregido, dos casos ejecutados después. Detector/diff--check y Graphify refresh/check. Verificación visual autenticada pendiente. Sin commit/push hasta completar observaciones; avances admin previos preservados.

## Ajuste local pendiente — tarjetas de herramientas y glass admin / 2026-10-11

Configuración sustituye párrafos técnicos por12 tarjetas de herramientas, logos SVG locales y función breve; integraciones conservan condición de configuración sin indicadores de servicio conectado. Logos de Devicon y Simple Icons, fuentes anotadas en frontend/public/technology/README.md. La descarga inicial del CDN devolvió403; recursos completos obtenidos desde repositorios oficiales de iconos.

Glass estandarizado como landing/login: blanco74%, blur18px, borde violeta20%, sombra suave; sidebar, toolbar, hero de dashboard, accesos y tarjetas de indicadores/configuración. Fondos lavanda/agua; tablas, campos y modales sólidos. Móvil<768px y sin soporte sólidos. Typecheck/check:frontend, build, detector[], diff--check y12 SVG XML válidos. Graphify refresh/check; sin validación visual autenticada nueva, pruebas de BD/login ni cambios de arquitectura. Base V87, cambios de navegación previos preservados. Sin commit/push hasta terminar observaciones de diseño. Siguiente: revisión del usuario en admin.

## Ajuste local pendiente — navegación y cabeceras admin / 2026-10-11

Base V87/bf868da, feat/piero-dev. Sin commit/push hasta terminar observaciones de diseño por petición actual. Botón de dashboard conserva /admin/pacientes y se llama Pacientes. Ruta confirmada en AppRouter; patientsService usa GET /api/v1/pacientes y usersService GET /api/v1/usuarios; backend pagina consulta SQLAlchemy de pacientes visibles. Lectura directa de BD configurada, transacción READ ONLY con rollback:5 pacientes,5 activos; sin datos personales en salida ni escrituras. No sesión HTTP autenticada nueva.

Se retiran aviso azul y pie técnico de pacientes, etiqueta azul de flujo en ASHA Core, columnas sin datos reales (terapeuta placeholder, consentimiento Sin API y soporte fijo). Pendientes de incorporación cuando tengan información real. Cabecera Pacientes con búsqueda y registro agrupados, títulos de rutas pacientes/citas/sesiones completados para móvil, barra admin sin título duplicado y altura56px. Typecheck/check:frontend PASS, detector[], diff--check; mapa refresh/check. Prueba de rutas registrada en salida del cierre; no validación visual autenticada ni nueva auditoría. Siguiente: continuar observaciones del usuario y revisar vista admin; conservar avance local sin publicar.

## V87 — Cabecera compacta de Gestión de Cuentas / 2026-10-11

Base V86/35c2fa4, feat/piero-dev. Se retira la etiqueta Gestión de accesos y reduce el espacio superior de cuentas en escritorio de38px combinados a12px; ajuste limitado a admin-accounts, sin cambios de formularios ni acceso. Typecheck PASS, detector[], diff--check y Graphify refresh/check. Sin nueva compilación o pruebas backend/BD. Verificación visual autenticada pendiente: navegador disponible en login; no se inició sesión ni se crearon usuarios. Cierre con publicación normal a feat/piero-dev y dev; SHA/refs efectivos consultables en Git. Siguiente: revisión del usuario dentro de admin.

## V86 — Glass y microinteracciones de landing y login / 2026-10-11

Base V85/5e331d85175f5f41094ffea58a777ac41f8c2a16, rama feat/piero-dev. Fetch confirma dev y origin/feat/piero-dev en la misma base, sin divergencias ni conflictos. Se consolida el avance visual: glass visible (blanco74%, borde violeta20%, blur18px) en tarjetas/navbar de landing y panel/barra de login; ejemplos familiares blanco80%. Fondos lavanda/agua/naranja, campos blancos y fallback móvil sólido. Hero y botones con tipografía menor. Microinteracciones breves de navbar, flechas, FAQ y tarjetas, con reduced-motion. Retirados textos de apoyo de especialistas y aviso de ejemplos señalados.

Verificación del cierre: typecheck y check:frontend PASS (370 archivos, máximo495 líneas), build PASS (1925 módulos), cuatro pruebas de interactions PASS, diff--check y Graphify check actual. El primer filtro de pruebas apuntó a un archivo inexistente; corregido a tests/interactions.test.tsx. Advertencia Node DEP0205 preexistente. Evidencia visual local heredada del avance: tmp/landing-glass-visible.jpg, tmp/landing-hero-smaller.jpg y tmp/login-glass.jpg; login desktop confirma blanco74%, blur18px y sin overflow. No nuevas pruebas de autenticación/backend/BD, CI ni deploy. Sin cambios de arquitectura. Publicación normal autorizada a feat/piero-dev y dev; resultado de SHA/refs verificable en Git. Siguiente: revisión visual del usuario.

## V85 - Especialistas informativos en landing / 2026-10-11

Rama feat/piero-dev; base V84/6e7dd7ea9dd7f8efdc3cbb4cbab6dddceae6e10f, dev y rama de usuario previamente sincronizadas. Se eliminan Agendar y su navegación a login de las tres tarjetas de especialistas; componente sin prop go ni imports de botón/flecha. Dashboard/reservas no modificados. PASS typecheck, check:frontend370/máximo495, cuatro interactions existentes y detector[]. IAB1480×811: tres tarjetas, cero botones en la sección; captura en docs/evidence/landing-v85. Graphify refresh/check AST local, quince fuentes sin símbolos. No build/suite completa/backend/login/BD/correo nuevos; no auditoría académica. Cierre V85/publicación normal autorizada a dev/feat/piero-dev; SHA/resultado efectivos en refs Git. Siguiente: revisión visual del usuario. CI/deploy no certificados.

## V84 - Tarjetas interactivas y contenido de landing / 2026-10-11

Rama feat/piero-dev, base V83/adf45198a1636f1f8a8d67ab6519266e1bae757c; V83 publicado y refs locales/remotas dev/feat/piero-dev verificadas. Mundo ASHA usa glass v1.1 (blanco84%, blur14px, borde violeta12%) y cinco invitaciones distintas; se retira el párrafo señalado, conservando catálogo, niveles y acceso autorizado. FAQ sustituye paquetes/factura por acompañamiento del lenguaje. Audiencias ahora voltean al pulsar, Enter o Espacio: frente con imagen/título; reverso informativo sobre el terapeuta, sin flechas ni navegación. Estado accesible por aria-expanded/aria-hidden y movimiento reducido declarado.

PASS: typecheck, check:frontend (370 archivos, máximo495), build (1925 módulos), cuatro interactions existentes y detector[]. IAB1480×811/375×812: cinco botones abren/cierra dialog de acceso, tres giros y vuelta, teclado Enter/Espacio, hash sin cambio al girar, FAQ expande y sin overflow. Capturas/evidencia en docs/evidence/landing-v84. Node DEP0205 y aviso React fetchPriority preexistentes. No nuevas pruebas backend, login, escrituras, correo/Zoom, ni auditoría académica. Graphify refresh/check AST local. Cierre V84/publicación normal autorizada; SHA/refs efectivos consultables en Git. Siguiente: aceptación visual del usuario; CI/deploy no certificados.

## V83 - Orden de navegación y limpieza del hero / 2026-10-11

Rama feat/piero-dev; base V82/e925f7164d5a3f95104cffe7852a982da2594c1b. Navbar de escritorio y móvil y secciones principales siguen Cómo funciona → Mundo ASHA → Especialistas → Preguntas frecuentes, inmediatamente después del hero. Audiencias, terapias y ejemplos se conservan después de FAQ; newsletter permanece al final. Enlaces internos por hash, sin abandonar la landing. Hero sin los dos indicadores con check ni la etiqueta Demostración de la burbuja; aviso de demostración del asistente interactivo conservado. Tipografía del hero reducida ligeramente (aprox. 4% escritorio, título móvil 33 px).

PASS: typecheck, check:frontend (369 archivos, máximo 495 líneas), build (1924 módulos), cuatro pruebas existentes de interactions y detector sin hallazgos. Navegador: cuatro enlaces desktop y cuatro móvil, menú móvil cierra al navegar, orden DOM y sin overflow en 1159 px y 375 px. Advertencias: Node DEP0205 y aviso React fetchPriority preexistente en PublicIllustration, no corregido en este alcance. Graphify AST local refresh/check. No login, escrituras de BD, correo, Zoom ni suite completa. Evidencia: docs/evidence/landing-v83/verification.md y capturas. Ajuste UX/UI, no nueva auditoría académica.

Vista local localhost:5174, proxy /api hacia API8000, override sólo del proceso; archivos .env intactos. Cierre autorizado con commit V83 y publicación normal a dev/feat/piero-dev; el resultado real de refs se registra al comprobar. Siguiente: aceptación visual del usuario y ajustes pequeños según sistema v1.1. CI/despliegue no certificados por este corte.

## V74 - Actualización de documentación maestra / 2026-10-11

Base V73/09afec8911c3a043343df0c14db1967f15a24960, feat/piero-dev; fetch confirma dev y rama de usuario sincronizadas. Maestro/PDF actualizados con avances V47-V73, estado de módulos, flujo, ampliaciones de datos, contrato local de 87 operaciones, seguridad, integraciones, evidencia heredada y pendientes. Nombre PDF V46 conservado; antecedentes originales rotulados históricos. Exportador permite generar sólo maestro y pie de corte vigente. Evidencia: docs/evidence/documentacion-maestra-2026-10-11.

Revisión documental, no nueva auditoría ni pruebas funcionales/BD/correo/Zoom. Comprobaciones: Git/Graphify, contrato local sin lifespan, PDF renderizado e inspeccionado. Cierre V74/publicación normal a dev y feat/piero-dev; SHA real consultable en Git. Siguiente: confirmar Live/CI y aceptación humana del recorrido completo; responsive V70/V72 y juegos finales pendientes.

## V72 - Reforma del terapeuta y opiniones de sesiones / 2026-10-11

Publicación confirmada: `738028ce2408403fb2a27ae4b0459ed1c8995a81`, push atómico normal a dev y feat/piero-dev, ambas refs verificadas y dev local sincronizado. V70/V71 preservados. Árbol limpio al cierre funcional. GitHub sin contexts/ejecuciones disponibles; Render OpenAPI todavía sin rutas nuevas al comprobar, sin certificar despliegue. PostgreSQL de prueba local detenido. Este resultado se registra en cierre documental V73, sin pruebas funcionales nuevas.

Objetivo: limpiar panel/prototipos, mejorar chat/horario para escritorio y hacer persistentes las valoraciones desde agenda histórica. Rama feat/piero-dev; base inicial V69/980a3eb, cierre conserva V70 mapa y V71 preview del equipo sin conflictos. Fuentes: PageFrame/capacidades, dashboard, mensajes, disponibilidad, configuración/pacientes/analíticas/valoraciones terapeuta, SessionReview/SessionActions, API/modelo/esquema/servicio valoraciones, migración011 y pruebas. ADR0024, diseño y evidencia de cierre añadidos.

PASS: typecheck/check368máximo500/build,25rutas/304componentes22archivos;29backendunit/modelos y1SQL/HTTP en PostgreSQL17 local descartable. Chrome1536×1024 con API sintética:11capturas, cero errores JS/overflow. Detector[]. Dos rondas: radio de estrellas/matriz corregidos; expectativas antiguas y carrera de pantalla corregidas. Sin QA móvil; responsive diferido. No opiniones/usuarios/pacientes de prueba compartidos, correo/Zoom/login real.

Migración011 adoptada explícitamente:backup privado559032bytes verificado,32tablas previas sin alteración de filas, RLS y grants SELECT/INSERT sin UPDATE/DELETE ni acceso público. Metadatos sanitizados en [evidencia](evidence/therapist-reform-2026-10-11/verification.md); credenciales/respaldo en tmp ignorado. Fallback Próximamente si otro entorno carece de tabla.

No transporte WebSocket; Actualizar permanece y notificaciones usan polling30s. Estimación y requisitos en evidencia. Siguiente: aceptación humana del panel publicado; fuentes de Próximamente, moderación de opiniones y responsive pendientes. Cierre con commit V72, publicar normal dev/feat/piero-dev y confirmar SHAs/CI reales. No declarar deploy por push. No auditoría académica nueva.

## V71 - Relevo de vista previa aislada de Mundo ASHA / 2026-10-11

V70 `900aa5e598dd90a39c00f94f4ec9878c4b83ebce` publicado con push atómico a dev y feat/piero-dev; ls-remote y ramas locales confirman coincidencia. Sin force-push. GitHub devuelve statuses vacíos, sin confirmación de CI/deploy. El trabajo concurrente de otros módulos sigue fuera de estos commits.

Archivos V71: tests/world-map-harness.tsx y verify-browser.cjs, contexto/relevo/evidencia. La vista previa DEV usa respuestas sintéticas locales por defecto, rotula los datos Demo y rechaza escrituras. El verificador usa ?verify=1 con intercepción externa. Chrome en :5177: mapa de cinco mundos, modal, intento rechazado localmente y cero solicitudes a API PASS. No se vuelven a atribuir 13 tests/build como ejecuciones nuevas de este pequeño cambio exclusivo del fixture. Graphify refresh/check de cierre. Sin cambios a fuentes de producción, backend o BD.

Cierre V71 con commit identificable y push normal a ambas ramas; verificar SHA/ref real al terminar. Preview aislado de escritorio en http://127.0.0.1:5177/tests/world-map-harness.html. Siguiente: revisión humana del diseño; responsive diferido y juegos finales pendientes.

## V70 - Relevo del mapa web de Mundo ASHA / 2026-10-11

Objetivo: mapa de cinco mundos con fondo acorde a las ilustraciones existentes, hover, ruta de niveles cuadrados y juego en modal. Rama feat/piero-dev, base 980a3eb42ee3b433709db77482ef50fa5436163f/V69. Se avanzó inicialmente a origin/dev con ff-only, sin conflictos ni eliminación de cambios locales ajenos.

Fuentes: MundoAshaHome, DemoWorldPlayer, WorldMap, WorldGameDialog, worldArt y world-map.css. Se conserva el contrato learningGames y la validación en servidor. Los cinco mundos son visibles; sólo se abren los asignados. Tres niveles libres, cierres sin premio y guardado protegido. PNG del fondo y WebP de 215 KB; cinco assets previos conservados. PRODUCT.md y brief scoped registran hechos/encargo.

Verificación nueva: tipos/check/build en copia aislada del árbol de entrega (366 fuentes/1921 módulos); 13 pruebas focalizadas y 25 rutas PASS. Chrome 1536/1440/1280 PASS, cinco rutas y modales, hover, Enter/Tab/Escape/foco, guardado y nivel 3 primero, child isolation, pendiente de asignación, errores/reintento, reduced-motion. Cero errores JS. Sólo fixtures/intercepción de API; sin escrituras/usuarios/login reales. Primera inspección detectó foco que escapaba al chrome del navegador y altura excesiva; corregidos y confirmados. Aviso Node DEP0205 y CRLF, sin fallo. Graphify refresh/check de cierre ejecutados; consultar resultado de cierre y no inferir vigencia de fuentes concurrentes.

[Evidencia, comandos, incidencias y capturas del árbol de publicación](evidence/world-map-v70/verification.md). No auditoría técnica académica nueva ni PDF requerido para este ajuste de diseño. Responsive diferido por petición explícita. Juegos finales y revisión profesional pendientes, sin declarar esa extensión completa. Preview de trabajo :5176; fixture aislado :5177.

Cierre autorizado: commit con objetivo concreto, revisar diff/secretos/remotos, publicar en dev y feat/piero-dev sin force. SHA/resultado real se registra después de publicar; el texto previo no sustituye el push. Mantener cambios ajenos del equipo fuera del commit. Siguiente: revisión humana de escritorio; responsive sólo cuando se retome ese alcance. No aplicar migraciones ni ampliar juegos o backend.

## V69 - Gestión y actualización de avatares de pacientes / 2026-10-11

Configuración y persistencia del campo nativo `PACIENTES.avatar_nombre` en la vista `/padre/config` (apartado Mis hijos).
Se implementaron 8 imágenes JPG en `frontend/public/avatar_paciente/` correspondientes a avatares de animales (`oso`, `zorro`, `conejo`, `panda`, `leon`, `koala`, `tortuga`, `buho`), coincidentes con el catálogo de backend `ALLOWED_AVATARS`.
Se actualizó la visualización en la tarjeta del hijo, el modal de creación y el modal de edición para permitir seleccionar y cambiar interactivamente el avatar con retroalimentación visual inmediata.
Se alineó el esquema backend `PacienteDatos`/`PacienteSalida` en `backend/app/schemas/clinica.py` y `PatientData` en frontend para validar y persistir `avatar_nombre` con valor predeterminado `'zorro'`.

Verificación:
PASS: frontend typecheck (`tsc --noEmit`), 293 pruebas vitest (21 suites), build Vite exitoso con derivados en `frontend/dist/avatar_paciente/`, backend hardening tests (39 PASS). Graphify check vigente. Sin migraciones de BD requeridas (la columna ya existe en PostgreSQL).

## V62 - Publicación de landing y sincronización con incidencias / 2026-10-11

Publicación autorizada a `dev` y sincronización de `codex/landing-publica`. Merge de `origin/dev` `7e958c8ec914866486764d6217e3e80b5f965c91` (V59 incidencias) sobre `92fa96774477a6ab0222d1d231ad4a651f57258a` (V61). Landing, Mundo ASHA, footer, favicon y diseño de login conservados; se incorporan las incidencias y simplificación administrativa del equipo. Conflicto únicamente documental en architecture.md, resuelto conservando el enlace explícito al ADR de correo y el apartado nuevo. Sin cambios funcionales añadidos durante la conciliación ni conflictos pendientes.

PASS: tipos, check:frontend (358 archivos, máximo 500), build (1916 módulos), 25 rutas y 288 componentes en 20 archivos; 14 unidades backend de correo/activación/incidencias y siete unidades/ASGI de mundos. Una prueba SQL de incidencias omitida deliberadamente al no habilitar BD descartable. Sin migraciones ni DML real ejecutados, usuarios, reservas, correos o autenticación real. La adopción de migración010 descrita por el equipo se conserva como evidencia heredada, no una ejecución nueva. Graphify refresh/check AST local: 2433 nodos, 103 comunidades, 14 fuentes sin símbolos.

[Evidencia de cierre](evidence/integration-v62/verification.md). Commit V62 de merge identificable en Git. Cierre autorizado: push normal, sin force, hacia dev y rama de trabajo; sincronizar dev local por avance de su referencia sólo si es ancestro. SHA y resultado efectivos deben comprobarse con las referencias locales/remotas; este documento no acredita por sí solo el push ni un deploy/CI exitoso. Render conserva su configuración remota de Auto-Deploy. `.gitignore` local preservado y excluido del commit.

Siguiente: verificar CI/despliegue y realizar aceptación del equipo sobre el sitio publicado. No ampliar módulos ni aplicar migraciones o pruebas reales de correo/BD sin alcance explícito.

## V61 - Integración local de dev y landing / 2026-10-11

Rama `codex/landing-publica`: integra `origin/dev` `498df42114833723d4aa55f6cac1ab5b029a5f21` (V58) sobre `018dc42d3649f2f309a7dd08dae1689819d83601` (V60). Se incorporan cinco commits remotos de auditoría administrativa, activación de contraseña por correo y documentación/configuración de Gmail/Render. Landing, Mundo ASHA, footer, favicon, diseño de login y retorno seguro conservados.

La integración automática encontró un único conflicto en `docs/architecture.md`: bloque remoto añadido frente a final local. Se conservaron ambas descripciones y se explicitaron los enlaces a los dos ADR identificados como 0022, sin renumerar decisiones previas. RouteAccess/paths se combinaron automáticamente: creación de contraseña pública y retorno al mundo elegido permanecen. Ningún archivo queda en conflicto. `.gitignore` local preservado byte por byte y fuera del commit.

PASS: tipos, check:frontend (355 archivos, máximo 500), build (1914 módulos), 25 rutas y 285 componentes en 19 archivos, nueve pruebas unitarias de activación/correo y siete unitarias/ASGI de mundos. Sin BD real, login real, envío de correos, usuarios ni reservas. Se instalaron pytest y pytest-asyncio, dependencias dev ya declaradas, sólo en el entorno backend. El archivo automático de conftest en tmp no acredita una prueba de PostgreSQL: se ejecutaron exclusivamente unidades con mocks. Graphify refresh/check local: 2400 nodos, 102 comunidades, 13 fuentes sin símbolos.

[Evidencia del merge](evidence/integration-v61/verification.md). Commit V61 de integración local consultable en Git. No push ni modificación de dev local (`396efda`): la publicación estaba condicionada a ausencia de conflictos y requiere aprobación tras esta resolución. Siguiente: aprobar publicación del resultado comprobado; entonces fetch de nuevo, comprobar concurrencia y publicar sin force-push, sincronizando dev local y rama de trabajo. La instrucción anterior de mantener todo local queda reemplazada únicamente por la autorización condicional de este corte.

## V60 - Inicio de sesión con diseño ASHAKids / 2026-10-10

Rama `codex/landing-publica`, base `47a5470` / V59; fetch exitoso y `origin/dev` conserva `498df42` / V58. Los cinco commits remotos pendientes no se integran en este ajuste visual. Dev local `396efda` preservado. Commit V60 sólo local, sin publicación ni merge hacia dev; `.gitignore` previo excluido.

`frontend/src/pages/auth/login.css`: tokens del sistema v1 dentro de `.asha-login`, Nunito, fondos cálidos/lavanda, cabecera suave con logo oficial, títulos y campos más amplios, acentos verde agua y botón violeta con relieve. Formulario blanco para lectura estable; bloque de desarrollo diferenciado. Selectores encapsulados, foco de teclado visible, controles mínimos de 44 px y movimiento reducido. Textos y arte de letras conservados exactamente; LoginPage, useAuth, validaciones, credenciales, endpoints, roles y retornos no se modifican. Recordarme conserva el estado visual existente; no se añade persistencia nueva.

Verificación: tipos, check:frontend (354 archivos, máximo 500) y build (1913 módulos) aprobados. Diez pruebas existentes de acceso, providers y destino de login en tres archivos: PASS; no se repite ni se atribuye la suite completa de V59 a este corte. Chrome en 320/375/768/1024/1536 px: sin overflow, botones pequeños ni errores JS; textos/arte contra baseline, vacío sin POST, prellenado sin autenticar, mostrar/ocultar contraseña, checkbox, carga deshabilitada, rechazo y recuperación del formulario, foco, movimiento reducido, inicio y recuperación comprobados con respuestas interceptadas. No autenticación real, escrituras, correo o reservas. [Evidencia y capturas](evidence/login-v60/verification.md).

Incidencias de revisión: se hizo explícito el outline de los campos porque el reset previo lo anulaba; el arnés espera la pantalla tras volver de recuperación. Graphify refresh/check vigente, extracción AST local sin LLM. Preview :5176 y API :8002 activos, recordatorios desactivados. Siguiente: revisión humana y conciliación de cambios remotos antes de publicar. No publicar hasta autorización explícita.

## V59 - Relevo de navegación interna y marca / 2026-10-10

Rama `codex/landing-publica`, base `4740ffe` / V56. Fetch de cierre exitoso: `origin/dev` avanzó a `498df42` / V58 con cinco commits de cuentas, correo y documentación. Se continúa numeración en V59; esos cambios remotos no se integran en este ajuste visual. Dev local `396efda` preservado. Commit V59 sólo local, sin push ni merge hacia dev; `.gitignore` previo excluido.

Se retira Ver todos de terapeutas y se conservan perfiles, textos y Agendar (login). Explorar terapeutas, tarjeta Terapeutas y enlace Especialistas del footer apuntan a `#landing-specialists`, sin abrir el directorio separado. La ruta externa de especialistas permanece disponible. Footer de landing rediseñado con fondo lavanda, logo oficial y marca violeta/naranja, columnas y contraste; otras variantes públicas conservadas. Favicon y apple-touch-icon reutilizan una copia exacta del logo oficial; sin imagen nueva ni cambios de marca.

Verificación: tipos, check de frontend (354 archivos, máximo 500) y build (1913 módulos) aprobados. Chrome en 320/375/768/1024/1536 px: sin overflow ni errores JS, logo cargado, enlaces internos, Agendar, footer de otra página y favicon 200 idéntico al original. Archivos: LandingTerapeutasCertificados, LandingElApoyoQue, LandingAudience, PublicFooter, landing-footer.css, index.html, favicon.png e interactions.test.tsx. Evidencia en [landing-v59](evidence/landing-v59/verification.md). La suite tenía una expectativa del antiguo enlace Especialistas como botón/directorio; se actualizó a los enlaces de sección solicitados. Resultado final: 25 rutas y 283 componentes en 19 archivos, PASS. Graphify refresh/check vigente (2374 nodos, 103 comunidades; 13 fuentes sin símbolos). Backend y servicios no modificados ni pruebas reales de login/BD/reservas/correo.

Preview :5176 y API :8002 reiniciados; recordatorios desactivados. Pendiente revisión humana y conciliación de los nuevos commits remotos antes de una futura publicación autorizada. No publicar en dev hasta aprobación explícita.

## V56 - Relevo de integración pública y optimización / 2026-10-10

Objetivo: integrar mundos conservando el hero, ordenar acciones, adaptar móvil y aligerar recursos. Rama `codex/landing-publica`, base `796fc28`; `origin/dev` conocido `ca9e1b3`. Fetch final falló en GitHub:443. Commit V56 local consultable en Git; sin push ni merge hacia dev, dev local `396efda` preservado. `.gitignore` previo excluido.

Archivos: LandingWorlds, WorldCards, PublicDialog, navegación, hero y componentes inferiores; PublicIllustration, manifiesto y WebP; helper loginDestination, guardia RouteAccess y callback de login; selección solicitada en MundoAshaHome; catálogo y resumen de juegos, caché de hosting, pruebas, ADR 0022 e informe PDF. Sin cambios de BD.

PASS: 25 rutas y 283 componentes en 19 archivos; tipos, check de frontend (353 archivos, máximo 500) y build (1912 módulos). Siete pruebas backend unitarias/ASGI sin BD; avisos asyncio de tareas lentas. Chrome en siete anchos de 320 a 1536 px: sin overflow, controles pequeños ni errores JS; foco/Tab/Escape, retorno al mundo asignado, roles, anclas, FAQ, Demo, WhatsApp y movimiento reducido. Newsletter: seis estados, POST interceptados. Catálogo local 200 sin ejercicios. Graphify refresh/check: 2373 nodos, 100 comunidades, 13 fuentes sin símbolos.

Incidencias corregidas: conversión de encoding, gaps de grid en 320 px, foco del modal, respuestas del layout en el arnés y carrera real del retorno de login. httpx faltaba en el entorno backend: se instaló desde la dependencia ya declarada; sin runtime nuevo. 18 PNG de 25,70 MB frente a 1,03 MB para variantes WebP máximas, 37 derivados; originales intactos. Sin Lighthouse, medición ambiental, BD, SMTP, Zoom o reservas reales. Evidencias e informe en `docs/evidence/landing-v56` y `docs/audits/auditoria-2026-10-10-01.md`.

Registro público inexistente: Solicitar cuenta abre instrucciones. Perfiles de ejemplo identificados, sin disponibilidad prometida. Reservas originales conservadas, sin E2E real. `noindex` conservado. Preview Vite :5176 y uvicorn :8002 actualizados, recordatorios desactivados; :8000 anterior no detenido. Siguiente: revisión humana y validación de servicios reales antes de publicar. No publicar sin autorización; reintentar fetch al restablecerse la conexión.

## V55 — relevo de ilustraciones y Mundo ASHA, sólo local / 2026-10-10

Objetivo: sustituir imágenes repetidas inferiores y extender diseño aprobado a Mundo
ASHA público y FAQ. Rama codex/landing-publica, padre0d1e285, remoto incorporado ca9e1b3.
Merge local con conflictos en Landing, Consejos y landing.css resueltos preservando
newsletter remoto y visuales V53. CommitV55 consultable en Git, sin push ni merge hacia
dev. Dev local396efda sin cambios; .gitignore previo no incluido. Sin nueva decisión
arquitectónica: se conserva ADR0021 heredado del correo remoto.

Archivos: PublicMundo/PublicNav, nuevo public-mundo.css, Landing, cuatro componentes
inferiores, landing-continuity.css/landing.css;14PNG transparentes únicos, DESIGN.md,
contexto y evidencia landing-v55 (prompts exactos, baselines, arneses, resultados, capturas).
Nombre de assets v54 corresponde al lote de generación previo al fetch, no al commit.
Ashi FAQ tiene pose propia; perfiles mantienen iniciales y ejemplos siguen rotulados.

Resultados: typecheck/check346máx500/build1906 PASS;25rutas y280componentes/18archivos
PASS. Chrome1536/1440/1280 landing y Mundo, contenido/controles/enlaces preservados,
8imágenes inferiores distintas, sin overflow ni botones<44px.5FAQ,5destinos landing,
4login mundo, carga/error/reintento, newsletter consentimiento/éxito/error/reintento
mock, dock único/Demo/Escape/foco/reduced-motion; cero errores JS. GET público real200
con5tarjetas y captura live. No envíos reales de correo/WhatsApp ni registros BD.
Graphify refresh2343/117comunidades/check vigente, advertencia12fuentes sin símbolos.
Backend pytest intentado: falta módulo pytest en backend/.venv, prueba no ejecutada.
Incidencia de arnés newsletter antiguo documentada/corregida; tres conflictos resueltos.

Pendientes: revisión humana, responsive y optimizaciónPNG antes de publicar. Recursos
creativos de escritorio integrados; no certificación de IA/voz/SMTP/paneles privados.
Preview Vite127.0.0.1:5176 activo. No publicar hasta aprobación; al retomar actualizar
referencias/revisar diff y comprobar servicios con el alcance autorizado, sin force-push.

## V53 — continuidad visual de landing completa, relevo local / 2026-10-10

Objetivo: extender la estructura visual aprobada del hero a toda la landing.
Rama `codex/landing-publica`, base d8eb10e/V52; fetch confirma origin/dev a6eda9f.
Commit local V53, SHA consultable en Git. Sin push/merge hacia dev; dev local396efda
sin cambios. `.gitignore` previo fuera del commit. No nueva decisión de arquitectura.

Fuentes: Landing y cuatro componentes inferiores; nueva landing-continuity.css.
Paso a paso ilustrado, terapias en tarjeta destacada, equipo con iniciales originales,
ejemplos ficticios cálidos, FAQ con Ashi, newsletter y pie con proporciones coherentes.
Reutiliza PNG V52 con loading lazy, sin generación nueva. Estilos sólo `.asha-landing`.
Reserva margen derecho para dock; no duplicación de asistente ni integración nueva.
Contenido, controles, estados, rutas y hooks preservados; Btn/Crd/paneles intactos.

Verificación: typecheck PASS; check frontend346/máximo498 PASS; build1906 PASS;
25rutas PASS (aviso experimental Type Stripping de Node). Browser Chrome API401
interceptada:1536/1440/1280, mismo contenido/nombres/estados/enlaces que V52;
assets cargan, sin overflow ni botones<44px,5FAQ y5destinos, newsletter sigue sin envío,
Demo/Escape/foco/únicoWSP, anclaFAQ y reduced-motion; cero errores runtime.
Capturas completas y de seis secciones en docs/evidence/landing-v53. Inspección visual
ajustó proporciones/márgenes del dock y restableció input vacío en capturas.
Graphify query1500 truncada40/99 (confirmada en código), refresh2292nodos95comunidades,
check vigente;12fuentes sin símbolos. Diff/secretos revisados antes de commit.

Límites: responsive diferido por usuario; sin prueba nueva de paneles/BD/IA/voz/envíos.
281componentes V52 históricos, no repetidos. Preview Vite127.0.0.1:5176 permanece activo.
Siguiente: revisión humana de toda la página local; mantener restricción de publicación.
Para publicar después, actualizar referencias y verificar nuevamente sin force-push.

## V52 — Ashi y composición desktop, relevo local / 2026-10-10

Objetivo: incorporar todo el pendiente visual de escritorio, incluida mascota, según
referencia del usuario. Rama `codex/landing-publica`; padre local5dacd55/V51, incorpora
remoto a6eda9f/V51 documental Zoom mediante merge local sin conflictos. Commit de fase
V52 consultable en Git; no push, dev local396efda intacto. `.gitignore` previo excluido.

Fuentes: Landing/hero/nuevoAudience, landing-reference.css; PublicNav condicional,
PublicFooter con Recursos sólo landing; AshhiFloat appearance=landing, avatar robot
público, nombre accesible de cierre. Cinco PNG transparentes en public/illustrations.
No cambios de Btn/Crd, hooks, contratos, auth, API, permisos o BD. Texto visible del hero
y tarjetas adaptado por nueva petición; resto de contenido/rutas conservado. Dock único
con Demo explícita; WSP sólo URL, onda decorativa, newsletter sin nueva integración.
Originales ImageGen conservados y prompts descriptivos/procedencia en evidenciaV52.

Verificación nueva: npm typecheck/check345máximo498/build1905; npm test25rutas y
281componentes/18archivos. Chrome API/v1 interceptada401: desktop1536/1440/1280,
assets cargan, sin overflow/controles<44px;5FAQ,5destinos, Demo/Escape/foco/únicoWSP,
anclaFAQ y reduced-motion; cero runtimeerrors. Capturas completas y viewport, máspanel,
en docs/evidence/landing-v52. Diff/secretos revisados antes de commit; sin auditoría nueva.
Graphify refresh/check final; advertencia heredada12fuentes sin símbolos.

Incidencias: se corrigieron márgenes de tarjetas, tamaño/posición de Ashi y especificidad
del logo inline; captura compara directamente referencia y corrige diferencias mayores.
Los assets son recreaciones, con diferencias menores; PNG~7.1MB sin optimizar.
Responsive V52 no verificado, diferido por usuario. Backend, IA real, envío WSP/correo,
voz y sesiones privadas no certificados por este corte. Preview activo127.0.0.1:5176.

Siguiente: revisión humana local. Mantener restricción de publicación; antes de publicar
revisar remotos, imagenresponsive y optimización si se autoriza. No usar force-push.

## V51 — rediseño de landing pública, relevo local / 2026-10-10

Objetivo: acercar la presentación pública a la imagen adjunta/kitv1 preservando V50.
Fetch actualizó origin/dev de396efda a5dd572cb37a679d5e8674a0cf1910426d925a1f9.
Rama nueva `codex/landing-publica` desde ese SHA; V51 sólo local, SHA consultable en Git.
Dev local permanece396efda, origin/dev baseV50. No push/merge por instrucción actual
del usuario; no afirmar recepción de cambios por el equipo. `.gitignore` previo excluido.

Fuentes: Landing y componentes visuales, landing.css/nuevo landing-kit.css, PublicNav
condicional para landing. Documentación: DESIGN, contexto, este relevo y evidenciaV51.
Contenido/hooks/datos, Btn/Crd, rutas, paneles y backend/BD intactos. Pasos redistribuidos
tras hero; violeta/relieve/cristal/fondos cálidos, lectura accesible y menú hasta1023px.
Ashi aprobado no tiene asset integrable: letras decorativas conservadas, no oso/emoji
ni robot nuevo. Ilustraciones del resto de la referencia pendientes. No flotante duplicado.

Checks nuevos:25rutas+281componentes/18archivos; tipos/check343máximo498/build1903.
Browser Chrome headless con API/v1 interceptada401:6anchos320–1920,sin overflow/controles
<44px;18destinos,5FAQ clic/Enter,newsletter sin envío, menú móvil y reduced-motion/foco.
Texto visible comparado contra línea base, mismos rótulos/destinos, cero errores runtime.
Capturas completas y viewport en docs/evidence/landing-v51; detalles verification.md.
Graphify setup/query1500/refresh2285nodos108comunidades/check;12archivos sin símbolos,
query truncada40/580. PostCSS205reglas, todos los selectores encapsulados en landing.
No nueva auditoría técnica ni backend, clínica, Zoom, IA/correo/WhatsApp certificados.

Incidencias corregidas: Python alias sin acceso; permisos Git/fetch; npm perdió flags
del preview; Chromium default ausente (Chrome instalado); filtro API demasiado amplio;
build sandbox EPERM repetido fuera; refresh sandbox detenido trasAST, repetido fuera;
comprobador CSS dividía comas de:is, falso positivo corregido con selectores PostCSS;
captura fullPage no incluía scroll de#root, recapturada
con expansión temporal; menú fotografiado durante animación, corregido. Sin secretos.

Siguiente desarrollador: revisar commit V51/codex/landing-publica y capturas contra referencia;
mantener `.gitignore` del usuario sin incluirlo. Integrar Ashi sólo con recurso aprobado.
Antes de publicar, obtener aprobación, actualizar remotos y volver a revisar diferencias
con dev; no force-push. No corregir texto/negocio ni ejecutar fixtures/BD en un corte visual.

## V49 — duración Basic y visualización del origen Zoom / 2026-10-10

Se alinearon disponibilidad, validación de citas, slots y creación Zoom mediante duración
configurable: 40 minutos por defecto en desarrollo/pruebas y 45 en producción. La respuesta
de citas expone `zoom_origen` (`AUTOMATICA` o `MANUAL`); el enlace automático existente no puede
ser reemplazado por el respaldo manual. Las vistas de familia, terapeuta y administración muestran
el texto correspondiente y abren el `zoom_join_url` recibido.

Pruebas finales: backend 161 aprobadas y 75 omitidas; frontend 281 aprobadas, typecheck y build
correctos. El mapa de conocimiento fue refrescado y `check` está vigente. Sigue pendiente verificar
el flujo real con una cuenta Zoom Basic y aplicar la migración 007 solo en una base aislada.
No se modificó `.env`, la base compartida ni secretos.

## V47 — Documentación del sistema de componentes UI / 2026-10-10

Objetivo: entregar la maqueta aprobada y una especificación textual implementable por IA.
Base: codex/2do-intento y dev, bb7d166df4a7201267d9cc88ad6861a137a49f8a/V46;
working tree inicialmente limpio, referencias remotas coincidentes tras fetch.
Entregables: docs/design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md y ASHAKIDS_UI_KIT.png.
La imagen aprobada se copió sin modificación; PNG1024x1536, SHA256
de88da159b984152f6d7fa5157ea615d1b97761bb5645ea1647b5384d1b211a4.
Guía: tokens, CSS completo scoped, HTML, variantes/estados, semántica, movimiento,
responsive propuesto y mapeo a Btn/Inp/Crd/Bdg/Ashi/AshhiFloat mediante fuentes leídas.
Graphify check vigente; query1500 devuelve relaciones truncadas, se confirmaron archivos
concretos. No fuentes runtime cambiadas: no refresh necesario para este corte documental.
Verificación nueva: PostCSS parseó1bloque/120reglas/55variables, sin tokens indefinidos
excepto parámetro de progreso con fallback documentado. Trece contrastes de texto sólido
>=4.5:1 y borde de campo4.20:1; enlaces locales/fences/hash correctos. git diff --check.
Sin fallos de estos checks; no pruebas funcionales, render de UI ni auditoría técnica nueva.
No se reemplazó DESIGN.md raíz ni se declaró migración; describe todavía V38.
Pendiente: assets robot con alpha real, galería aislada, eventos y adopción gradual con
capturas/pruebas. Ashi existente es oso SVG; no inventar fidelidad usando emoji o CSS.
Incidencia de cierre: primer commit rechazado por identidad Git ausente. Se reutiliza para
el comando la identidad noreply de los cinco commits anteriores, sin cambiar configuración
global. El primer cambio de ramas no integró novedades porque aún no existía el commit.
Cierre: commit V47 documental, integración/publicación en dev y rama propia; verificar SHA
con Git. Próxima acción: implementar galería siguiendo guía sin alterar negocio/API/BD.

## V47 — cierre P1 e integración Zoom / 2026-10-10

Base `bb7d166` en `dev`; cambios locales sin publicar. Se alinearon contraseñas personales a
12–128 caracteres y el PATCH propio exige `current_password`; ADMIN puede cambiar otra cuenta sin
esa contraseña y se revocan sesiones. El backend bloquea reportes con `NO_ASISTIO` y planes sin
observaciones, objetivos o próximos pasos con contenido; la UI refleja esos límites y deja como no
disponibles 2FA, autoeliminación y solicitud de edición de perfil.

Las citas virtuales usan Zoom Server-to-Server OAuth cuando `ZOOM_ENABLED=true`, guardan el ID y
enlace de participante, y devuelven error controlado sin confirmar si Zoom falla. Se añadió limpieza
compensatoria para fallos locales posteriores y el enlace manual HTTPS sigue restringido a ADMIN o al
terapeuta asignado. `007_zoom_meetings.sql` amplía las columnas a `VARCHAR(64)`/`VARCHAR(2048)` con
comprobaciones; no se ejecutó sobre ninguna base compartida.

Validación: backend `159 passed, 75 skipped`; frontend `281 passed`; `npm run typecheck`, `npm run build`,
`compileall`, `knowledge refresh` y `knowledge check` correctos. No se versionaron secretos, `backend/.env`,
certificados locales ni salidas de auditoría del usuario. Siguiente: configurar y probar una cuenta Zoom
técnica en una base aislada, aplicar 007 con respaldo, y ejecutar aceptación manual autorizada antes de Render.

## V46 — Documentación de flujo, BD y equipo / 2026-10-10

Steering del usuario: registrar inconsistencias para unificar criterios. Incorporado
REGISTRO_INCONSISTENCIAS_Y_CRITERIOS.md con12fichas (9inconsistencias,3criterios), fuentes/
lineas y aceptación propuesta. Ninguna marcada resuelta; no pruebas ni fixes nuevos.

Objetivo autorizado: dos fuentes detalladas de estado actual, una para estructurar Avance2
y otra para equipo/agentes. No implementar propuestas UX/credenciales/integraciones.
Rama codex/2do-intento; base62048038b70d2411234fb681284e327cf142d1b7/V45 en dev.
Archivos: DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md, GUIA_FLUJO_ESTADO_Y_PENDIENTES.md,
PDFsoutput/pdf, evidencia documentacion-etapa-2026-10-10, generador tools/reports y enlaces
de continuidad. Cada requisito del PDF del usuario se mapea, sin inventar feedback/sprints.
Usuario confirma recorrido Render hasta enlace Zoom; alta terapeuta ya aceptada por él.
Código revisado aclara inicio/cierre manual, reporte/planEN_CURSO, gatingTERAPIA y reemplazo
de material activo; múltiples diagnósticos/planes no implementados. Pendientes concretos
de contraseña y NO_ASISTIO documentados; no se corrigió lógica en esta fase.
Comprobaciones nuevas: cinco páginas PDF leídas/renderizadas; Graphifyquery/check;
catálogo SQL SETTRANSACTIONREADONLY30tablas207columnas113constraints41FK87índices/
70políticas/23ORM; GETopenapi/health/ready200,69operacionesAPI0.1.0/OpenAPI3.1.0.
Sin leer filas clínicas, crear cuentas, sesiones o modificar credenciales/BD. TestsV33–V45
son heredados y rotulados; no nueva corrida ni valoración académica.
Incidencias: PDFmodulefaltante/encodingcp1252, rutas supuestas y bytescharcatálogo corregidos
sin escrituras de negocio; detalle en evidenciaREADME. Generador PDF/revisión y validación
documental registran resultados finales en pdf-validation/validation. Mapa refresh/check al
incorporar herramienta de exportación; salidas locales sin versionar.
Commit/push V46 y sincronización de dev se verifican al cerrar; consultar SHA en Git.
Validación documental final: 19 enlaces locales, 30 tablas/207 columnas/113 restricciones/
41 FK, 69 operaciones y 12 fichas, sin errores. PDFs: 52 y 13 páginas; todas inspeccionadas,
con revisión ampliada de cobertura, diagrama y pendientes. Geometría sin incidencias.
Siguiente acción: aceptar cierre→reporte→plan→familia→terapia con otro profesional en Render,
con usuario autorizado; después mejoras UX separadas. PIN4/WSP/ZoomAPI quedan propuestas.

## Confirmación de despliegue y acceso — V45 / 2026-10-10

Render V44/1fc19b36598cf96cbc89d36a85fb9ca6c062eda3 confirmado Live, deploy
dep-db57tms9v7es738s1aa0, Auto-Deploy48.2s. dev/codex/2do-intento sincronizados.
12 respuestas ADMIN HTTPS repetidas después de ese despliegue, correctas; cookie
segura y revocación verificadas. No se ampliaron lógica, datos ni UI en este cierre.
El usuario confirmó crear un padre desde ADMIN e ingresar correctamente en Render;
esto es confirmación humana, no una nueva creación ni prueba automatizada del agente.
Se aclaró el supuesto pendiente de alta terapeuta: ya existe en Cuentas → pestaña
Terapeutas → Nueva cuenta. Formulario vacío abierto en producción, código automático,
DNI inicial y cambio obligatorio; fuente confirma POST/admin/cuentas/terapeutas.
No se envió ese formulario ni se creó una cuenta para probar. Queda verificar su alta,
activación e ingreso con credenciales vigentes; no afirmar que falta implementar el alta.
Imagen recortada al diálogo para excluir datos privados del listado: therapist-create-form.png.
Fuentes verificadas: AdminCuentas.tsx/handleCrear, AdminCuentasCrearModal.tsx,
adminService.ts y backend/app/services/admin_cuentas_creacion.py/crear_terapeuta.
V45 solo documenta aceptación, ubicación de la función y evidencia final de V44.
Siguiente: alta/activación terapeuta por ADMIN, publicar horarios y probar el recorrido
con cuentas autorizadas; después pulir inconsistencias visuales y responsive diferido.

## 2026-10-10 — V44 Actualización de BD y despliegue

Base V43/4d2f0725566021824d1b8c20bba6dd8c241e21a0, codex/2do-intento; cierre en dev.
Render tenía V42 actualizado pero PostgreSQL conservaba el esquema anterior: faltaban
migraciones002–005, incluida usuarios.password_change_required, y el login fallaba503.
Con autorización actual de dejar el flujo desplegado funcional, respaldo custom/public
134561bytes verificado por hash y pg_restore--list, seguido de adopción002–006 atómica.
Filas originales y ACL/políticas de26 tablas preservadas; sin cambios de cuentas,
contraseñas, clínica o .env. No se restauró el backup en el servidor ni se crearon usuarios.
006 extiende permisos mínimos del rol existente a cuatro tablas/tres secuencias;
RLS habilitada/12 políticas, sin acceso anon/authenticated/service_role. ADR0018.
23 modelos SELECT LIMIT0 y cero diferencias observadas, runtime TLS1.3. Esquema actualizado.
Backend157PASS/75omitidas/19avisos6.06s; no fixtures destructivas ni integraciones compartidas.
Graphify2219 nodos106comunidades vigente. Evidencia nueva operativa deploy-v44, sin auditoría nueva.
HTTPS12respuestas ADMIN esperadas, login200, cookie Secure/HttpOnly/Lax, logout y me401;
panel ADMIN cargado en navegador. Tutor/terapeuta aún sin verificar login actual:
sus contraseñas no coinciden con las credenciales de ensayo; confirmación solicitada.
Intentos iniciales: expectativa errónea de chat ADMIN200 (correcto403), tutor401;
se corrigió alcance sin reintentar contraseñas ni modificarlas. Primer intento ADMIN
interrumpido dejó una sesión nueva hasta expiración normal; posteriores HTTP cerraron sesión.
Error de escaneo textual de PNG en V43: UnicodeDecodeError; revisión de diff sin binarios
posterior dio cero coincidencias antes de publicar dev. Comandos con ruta duplicada/backend
y nombres de archivo inexistentes corregidos sin mutaciones. Sin ocultar fallos.
Render V43live50.1s; flag NOTIFICATION_REMINDERS_ENABLED=true guardado y despliegue44.8s
confirmado. Auto-Deploy estaba activo y no se cambió; secretos/CA/runtime intactos.
Disponibilidad nueva vacía: cada profesional publica sus turnos actuales para reservas;
no fabricar horarios, sesiones de origen ni mundos en planes antiguos. Anticipación excluida.
Pruebas del recorrido completo local V33–V37 son heredadas, no nuevos recorridos en producción.
Revisión de todos los diseños responsive y detalles pendientes; no ampliar ahora módulos demo.
Siguiente: confirmar ingreso tutor/terapeuta con credenciales vigentes y publicar horarios;
pulir inconsistencias visuales en cortes separados. SHA publicado y live final consultables en Git/Render.

## 2026-10-10 — V43 Rediseño de terapeuta UI

Base V42/cbf30c6; codex/2do-intento y publicación del cierre en dev, sin reescribir SHA.
Escritorio: shell profesional, resumen, pacientes, agenda, reportes y configuración con
marca Nunito/violeta/naranja/teal. Cristal y luz contenidos; campos y reportes opacos.
Iconos Lucide, foco visible y espacio reservado para ayuda. Responsive diferido.
Datos, consultas, permisos, handlers y autenticación intactos; no cambios de backend/BD.
Pruebas nuevas:281 componentes/18 archivos+25 rutas15.92s; tipos/check342/máximo498;
build final4.53s/1899 módulos. Graphify2219 nodos106 comunidades/check vigente.
Detector único: dos avisos de violeta heredado retenido por marca; DEP0205 heredado.
UI: diez destinos profesionales1280, inicio/config/reportes920; detalle paciente/cita,
vista previa reporte y bandeja. Cuenta sintética existente QA5175/API8002/PG6544.
Sin CRUD clínico, reservas, mensajes ni cambios de preferencias. Datos de actividad,
valoraciones e incidencias conservan sus rótulos demo. Anticipación semanal excluida.
Revisor inicial fix por metadatos del reporte; auto-fit corregido, recaptura real920×811
y1280×900, Resolved/Clear/ship limitado al defecto. Primera recaptura tenía tamaño erróneo
por tab Render activo; se sustituyó tras comprobar dimensiones. Comparación/evidencias
docs/design/THERAPIST_SYSTEM_CHECK.md y docs/evidence/therapist-v43/.
Se incorpora cierre documental tardío de FAMILY_SYSTEM_CHECK sin alterar el commit V42.
Incidencias de comandos: npm sin --prefix produjo ENOENT, corregido; espacio final en
Reportes corregido. No nueva auditoría ni cobertura total por build.
Siguiente: adopción autorizada de migraciones002–005 con respaldo/permisos runtime y
verificación de Render. Diagnóstico actual: código V42 live, conexión TLS correcta y
readiness200, pero esquema antiguo sin password_change_required provoca fallo del login.
Publicar código no equivale a adoptar BD. Resultado efectivo de commit/push: consultar Git.

## 2026-10-10 — V42 Rediseño del portal familiar UI

Base V41/5ca2713, rama codex/2do-intento; commit independiente y publicación en dev.
SHA y sincronización efectiva consultables en Git. Escritorio priorizado por el usuario;
responsive diferido. Shell familiar, seguimiento/recorrido, agenda, directorio y mundos
asignados conservan datos, consultas, condiciones, handlers, guards y progreso demo.
Nunito y marca violeta/naranja/teal; cristal/luz estática en navegación/resumen, campos y
reportes clínicos opacos. Ayuda fuera del carril de lectura. Sin backend, BD o hosting.
Pruebas nuevas: 281 componentes/18 archivos +25 rutas,16.33s; tipos/check341/máximo498,
build2.71s/1898 módulos. DEP0205 heredado. Graphify2218 nodos/110 comunidades, check vigente.
Detector único: dos avisos violeta heredado, retenido por paleta explícita. Revisor inicial
fix por opacidad de reportes; corregido y recapturado, veredicto final en evidencia.
UI: nueve secciones1280, inicio/mundos920, cambio Ana/Luis y apertura de reporte guardado.
Datos sintéticos QA5175/API8002/PG6544; sin reservas, mensajes, creación de cuentas ni DML clínico.
Capturas viewport/secciones en docs/evidence/family-v42, comparación docs/design/FAMILY_SYSTEM_CHECK.md.
Siguiente: terapeuta web UI con commit propio; después diagnóstico Render/BD. No declarar
adoptadas migraciones compartidas por publicar código ni certificar hosting mediante build.

## 2026-10-10 — V41 Rediseño de administración UI

- Objetivo: extender la marca al espacio ADMIN sin modificar lógica. Base V40/7c8f1ee,
  codex/2do-intento; integrar/publicar cierre en dev conservando SHA. Ver resultado efectivo en Git.
- Archivos: DashLayout, Sidebar, OperationalDashboard, siete Admin*.tsx y admin.css;
  contrato/comparación ADMIN*.md, evidencia admin-v41 y continuidad del equipo.
- Pruebas: 281 componentes/18 archivos +25 rutas, Vitest22.71s antes del último bloque cosmético.
  Tipos y build final3.45s/1897 módulos; check340/máximo498. DEP0205 y aviso npm --run innecesario.
  Refresh/check2216 nodos/108 comunidades; 12 archivos sin símbolos, aviso conocido.
- Detector una vez, salida1: color gris sobre violeta de acción de cuentas; corregido a violeta.
  Revisor inicial fix; dos hallazgos resueltos en un bloque, veredicto ship limitado a ellos.
  Franja móvil reservada para ayuda evita solapar Ver al desplazar; ML usa Lucide en acciones/gobernanza.
- UI: ocho secciones de navegación desktop1280, panel/cuentas920, muestras móvil390; filtros de cuentas,
  vacío, formulario arriba/abajo/cancelar/Escape y drawer. Capturas son viewport/secciones, no fullpage.
  Dos capturas de formulario se sustituyeron por ubicación de rueda/estado anterior; evidencia final válida.
- Entorno: localhost5175/API8002/PostgreSQL QA6544; ADMIN sintético existente a90001. Sin enviar formularios
  ni crear/editar/suspender/eliminar cuentas. Sin cambios de backend, BD, hosting ni Supabase.
- Siguiente solicitud del usuario: priorizar escritorio, responsive diferido; padre/tutor UI y terapeuta UI,
  cada rol con commit/dev, y después diagnóstico del error de conexión BD en Render. No declarar adopción
  compartida de migraciones ni despliegue exitoso por un push de código.

## 2026-10-10 — V40 Rediseño de login UI

Base V39/023e21b, codex/2do-intento. Login conserva autenticación, guard, handlers y prefills;
formulario cristal/luz, arte CSS de marca en escritorio, controles estándar accesibles.
Dos fuentes LoginPage.tsx/login.css y contrato/comparación docs/design/LOGIN*.md.
Pruebas nuevas:281 componentes/18 archivos+25 rutas16.35s, tipos/check339/máximo498,
build4.37s/1896 módulos; DEP0205 heredado. Detector único[]/exit0. Revisor ship, sin fixes.
Knowledge refresh2214 nodos/113 comunidades y check actual;12 archivos sin símbolos, aviso conocido.
Consulta inicial --budget no admitida por manage.py, repetida con presupuesto1500 por defecto.
UI escritorio1280/móvil390/panel920; error vacío, mostrar/ocultar y Recordarme comprobados.
Cuenta ADMIN sintética existente inicia sesión y abre dashboard; sin crear cuentas ni datos.
Producción excluye panel/códigos DEV, verificado en bundle. Captura del usuario era login
productivo anterior: sin añadir accesos demo a producción. No hosting/Supabase/migraciones.
Siguiente trabajo autorizado: admin UI, commit propio. Publicar cada cierre en dev y
sincronizar codex/2do-intento; feat/piero-dev conserva corte anterior. Ver SHA/push en Git.

## Publicación en dev — 2026-10-10

El usuario autorizó integrar todo el avance en dev. Integración local fast-forward desde
V32/ebb8632d3023338b1d19721122504092a58db2f6 hasta V38/fbffd46cbe4c8b38e46606e4d9df0f98272d8263:
V33–V38 conservan sus SHA, sin conflictos ni force-push. V39 actualiza solo continuidad documental.
Esta autorización reemplaza la restricción anterior de publicar exclusivamente codex/2do-intento.
Se publican dev y el mismo cierre en codex/2do-intento; verificar SHA remoto con Git.
Revisados árbol limpio inicial, referencias remotas, diff de193 archivos y patrones de secretos
sin hallazgos. Knowledge check actualizado. Evidencia técnica heredada de V37/V38: no nuevas
pruebas funcionales ni auditoría; integración conserva exactamente las fuentes ya verificadas.
Supabase/migraciones reales y hosting no se modifican. feat/piero-dev permanece en V32.
Siguiente: rediseño de roles uno por uno, sin ampliar lógica, un commit por rol.

## 2026-10-10 — V38 Rediseño de landing UI

- Objetivo: presentación llamativa, cristal/luz difuminada y microinteracciones con la marca
  existente, sin modificar comportamiento. Base V37/4fba7e9; solo codex/2do-intento.
- Archivos: seis módulos en frontend/src/pages/public/landing y landing.css; PRODUCT.md,
  DESIGN.md, .impeccable/config.json/design.json, contrato docs/design/LANDING.md y evidencia.
  Hook useLanding y componentes públicos compartidos sin cambios. Sin ADR/decisión arquitectónica.
- Comprobaciones nuevas:281 componentes/18 archivos +25 rutas; tipos, check338/máximo498;
  build inicial2.65s y final2.55s tras CSS. DEP0205 heredado. Detector único []/exit0.
  Knowledge refresh2213 nodos/108 comunidades y check;12 archivos sin símbolos, aviso conocido.
- Visual: hero1280/751/390/334, secciones desktop/móvil, FAQ abre por ratón/cierra Enter;
  CTA conserva guard y redirige a /terapeuta con sesión t90002 activa. Sin logout/escrituras BD.
  Dos fixes en un bloque: minmax(0,1fr) para ancho móvil y hover sin desplazamiento en
  reduced-motion. Revisor final ship limitado al cierre de ambos. No emulación SO/hover runtime.
- Capturas viewport/secciones, no fullpage: scroll vive en un DIV externo. Dos capturas
  finales se repitieron porque conservaban desplazamiento FAQ; reemplazadas por hero completo.
  Consulta inicial usó nombres inexistentes FLUJO_MASTER/PublicNav: corregidos sin cambios.
- API8002/Vite5175/QA sintética existentes sin cambios; sin tests backend, migraciones ni
  Supabase. Newsletter y afirmaciones heredadas permanecen pendientes de revisión funcional.
- Documentación de diseño YAML/JSON validada;8 secciones/24 colores/8 componentes;
  colores tonales auxiliares no se incorporan al CSS. Logo heredado, sin raster nuevo.
- Próxima tarea: rol elegido por el usuario, cada rol en commit separado; no ampliar lógica.
  Horario semanal con anticipación excluido por decisión del usuario. Revisar Git para SHA
  final/push V38; publicación de esta rama no autoriza integrar dev/feat/piero-dev.

## 2026-10-10 — V37 Notificaciones y preferencias profesionales

- Objetivo: convertir primero los avisos/preferencias demostrativos en funcionales.
  Base V36/583de51b241735538f0ade472cdb8b216cf2eb09; solo codex/2do-intento.
- Fuentes: models/schemas/api/services notificaciones, worker recordatorios, citas,
  mensajeria, main/config, migración005/db_creation y NotificationCenter/Preferences.
  ADR0017 y evidencia notifications-v37. Avisos propios, transaccionales e idempotentes;
  preferencias futuras, historial conservado, mensajes sin copiar contenido privado.
- Verificación nueva:207 backend/25 omitidas/19 deprecaciones64.40s;281 componentes/18
  archivos+25 rutas; tipos, check337/máximo498, build2.75s y tres tests después de CSS móvil.
  Comandos/errores y alcance detallados en evidencia. No reutilizar cifras de V36 como nuevas.
  Graphify refresh2212 nodos/101 comunidades y check antes del cierre; mapa no versionado.
- Migración005 solo local: test V34 separada de QA persistente, PG17.6/6544 y mismo rol
  runtime limitado; grants/políticas permisivos locales, no permisos exactos compartidos.
  API8002 proceso30504/session71459, Vite5175; .env intacto. Worker activado solo en QA.
- UI vio dos avisos reales, marcó uno leído, guardó nueva_cita=false y conservó al recargar.
  Reserva HTTP R6 no produjo aviso; R5 sí con preferencia activa. Worker emitió recordatorio
  R4. Switch restaurado true desde UI al terminar. Desktop/móvil inspeccionados.
- No correo/push/backfill ni adopción compartida. Worker requiere API activa; default false.
  Próximo trabajo: priorizar otros campos demo y versionar horario semanal con anticipación
  si se acuerda esa regla. No declarar estas extensiones completas. Consultar Git para SHA
  final/push V37; ningún avance de esta rama autoriza dev/feat/piero-dev ni Supabase.

## 2026-10-10 — V36 Paneles, agenda por niño, mundos y reunión externa

- Base V35/7faa66682fc1b03d57b23aa96f196a35dddfcc31; solo codex/2do-intento.
  Núcleo local mostrado y verificado; publicación no autoriza dev/piero-dev ni Supabase.
- Mundos asignados por plan persistido, tres niveles demo por mundo, pistas/quiz/secuencia,
  desbloqueo/repetición/final, sessionStorage por cuenta/niño/mundo. Sin métricas clínicas,
  escritura educativa ni persistencia entre dispositivos. Catálogo anterior queda prototipo.
- Paneles cuentan citas futuras, ASISTIO y EN_CURSO; analíticas filtra mes/año Lima.
  Agenda familiar comparte selección del niño, limpia detalle al cambiar y conserva historial.
  Resumen del profesional usa reportes/planes reales; asesor registra desde Cuentas.
- PUT /citas/{id}/reunion usa campo existente, HTTPS Zoom validado y propiedad profesional;
  familia solo consulta. Enlace externo sin crear reunión ni marcar asistencia. ADR0016.
- Fuentes principales DemoWorldPlayer/demoWorlds/MundoAshaHome, OperationalDashboard,
  VirtualMeeting, agendas, SessionActions, analíticas y citas/schema; no DDL.
- Verificación:201 backend/25 omitidas/19 deprecaciones en54.76s;278 componentes/17 archivos
  y25 rutas finales, tipos/check333/build3.03s. Tests exclusivamente DB local test V34.
  Graphify2148 nodos/112 comunidades, refresh/check correctos antes del cierre.
  PDF real local y PDF de segunda atención descargado desde UI renderizados/inspeccionados.
- API8002 proceso30188/session29117; Vite5175; QA ashakids_test_flujo_qa_20261010,
  tests ashakids_test_flujo_v34_20261010, PG17.6/6544. No tocar .env/Supabase.
  API CORS solo proceso admite127.0.0.1:5175 ylocalhost:5175 para intento de recuperar UI.
- Bloqueo anterior del navegador recuperado en la continuación. Primera introducción Ana
  se cerró por HTTP: evidencia anterior conservada. Segundo profesional abrió ese reporte
  de solo lectura, registró/inició sesión2, guardó reporte2 y cerró FINALIZADA/ASISTIO
  mediante la confirmación de la app; plan1 del autor inicial permanece vigente.
- Familia reservó por UI R4 con profesional2, reingresó y vio ambos reportes y PDF real.
  Luis conserva introducción propia pendiente y ningún plan; cambiar hijo no mezcla datos.
  Lenguaje completado3/3, error/reintento/desbloqueo/repetición y recarga/reingreso de
  pestaña comprobados. Enlace Zoom R4 guardado por profesional, lectura familiar sin editor.
  Asesor ADMIN abrió alta institucional. Autocompletado de login invadía formulario nuevo;
  atributos de nombre/contraseña corregidos y reapertura verificada con campos vacíos.
  Capturas1280x720/390x844 en flow-v36. Alta/activación heredadas V33; cambio de clave API.
- Incidencias corregidas: expectativas de maqueta anterior, selector agenda/modal duplicado,
  selector definition múltiple, importación X omitida; tipos finales correctos. Harness QA
  abortó seguro por nombre/parámetro/403 vs404; varias entradas agotaron limitador429.
  No desactivar límites ni ejecutar tests en QA para recuperarlo.
- Siguiente tarea del equipo: fetch de codex/2do-intento, reproducir el corte y coordinar
  adopción en otros clones. dev/feat/piero-dev y BD compartida requieren nueva aprobación.
  Núcleo local concluido; extensiones/pagos/progreso educativo servidor siguen diferidos.
- Aviso compartible docs/AVISO_EQUIPO.md. Consultar Git para SHA final V36 y verificar push;
  aún no atribuir este corte a dev ni al hosting. No nueva auditoría técnica académica.

## 2026-10-10 — V35 Planes profesionales e historial

- Base V34/84078ae, codex/2do-intento. Sesión origen/área/mundos/sesiones recomendadas,
  una publicación por atención, una versión profesional vigente y anteriores conservadas.
  POST legado /tratamientos devuelve410 a ADMIN y403 a otros; UI asesor solo consulta.
- Permisos: cita futura confirmada, sesión en curso o atención ASISTIO permiten preparar
  el contexto del niño. Cancelar única cita futura revoca vínculo; atención propia conserva
  lectura mientras cuenta activa. Reporte ajeno/PDF solo lectura, autor de sesión modifica.
  Mensajes usa el mismo vínculo, conserva lectura de conversaciones archivadas.
- Archivo principal services/planes.py; migración004; SessionPlan y permisos API
  puede_editar; corregido filtro paciente/contexto de PatientClinicalHistory. ADR0015.
- PostgreSQL local6544: misma DB test V34 con004 y QA separada con004. Tests nunca en QA.
  API8002 proceso3552/session55369; Vite5175 sigue funcionando. Sin .env editado/Supabase.
- Backend199 aprobadas,25 omitidas,19 deprecaciones;31 clínicas previas+3 nuevas. Frontend
  270 casos UI finales aprobados; tipos/check328/build2.56s correctos.
  Repetición relevante8 backend y knowledge check correctos antes del commit. No nueva auditoría académica.
- UI t90001 creó/inició sesión1 de Ana, guardó4 campos y publicó plan1 Lenguaje/Habla.
  Horario sintético se movió solo en QA a9oct08:00 para probar atención ya vencida.
  Reporte/plan comprobados en AX. Confirmación nativa de Finalizar congeló IAB tab2;
  recuperar con aviso al usuario, tab3 comparte sesión. Reemplazada por confirmación inline.
  No afirmar cierre visual hasta repetir. API/SQL cierre y persistencia sí están probados.
- Incidencias: un parche sin coincidencia fue rechazado sin cambios; expectativa frontend
  id_paciente ignorada se corrigió a paciente/contexto; npm check inexistente corregido a
  check:frontend. Identidad Git solo por comando, continuar versión publicada.
- Siguiente V36: conectar panel/analíticas propios, mundos demo por niño/asignación,
  enlace Zoom externo acordado y validación UI de continuidad/dos niños/reingreso/PDF.
  Pendientes V26 requieren transición, sin inventar introducciones. Sin dev/feat/piero-dev.

## 2026-10-10 — V34 Agenda, disponibilidad e introducción

- Objetivo: adaptar reserva introductoria y terapia al flujo maestro; base V33 45ee5ab,
  rama codex/2do-intento. Fase de agenda implementada; objetivo general sigue abierto.
- Archivos: modelos/schemas/services agenda; citas/pacientes/terapeutas; migración003 y
  db_creation; BookingDialog, AvailabilityEditor, IntroductionStatus, directorio familiar,
  reporte editable; tests clínicos y UI. ADR0014 y evidencia flow-v34.
- Verificación nueva:196 backend aprobadas,25 omitidas,19 advertencias; repetición
  posterior relevante17 aprobadas;267 componentes+25 rutas, tipos/check326/build.
- Incidencias: bootstrap roles con search_path vacío, npm script incorrecto y dos
  expectativas frontend V26 actualizadas. QA sintético reiniciado accidentalmente por
  repetición de tests: ahora hay DB QA separada. Sin pérdida de trabajo/datos compartidos.
- Entorno: PostgreSQL local6544. Tests ashakids_test_flujo_v34_20261010; QA
  ashakids_test_flujo_qa_20261010. API8002 y Vite5175. No ejecutar pytest sobre DB QA.
- Siguiente: plan del terapeuta con sesión origen/áreas/mundos/versiones; contexto
  clínico autorizado para quien reserva/atiende, solo autor modifica reporte; adaptar
  paneles/juegos demo; comprobar recorrido de tres roles+dos niños+segundo terapeuta.
- Incidencia Git: primer commit rechazado por identidad ausente; no hubo publicación
  en ese intento. Reintento con identidad noreply V33 solo para ese comando.
- Publicar solo codex/2do-intento; dev/feat/piero-dev requiere nueva autorización.
  Consultar Git para SHA final de V34; el cierre se registra después del push.

# ASHAKids — Avance y relevos del equipo

Actualizado: 2026-10-10. [Contexto](PROJECT_CONTEXT.md) · [Plan](IMPLEMENTATION_PLAN.md).
Este archivo se actualiza al cerrar una tarea y antes de cambiar de persona/asistente.
No es un registro automático: quien termina debe guardar y compartir su actualización.

## Punto de continuación actual

### Registro familiar y activación — 2026-10-10, avance V33

- Objetivo autorizado tras EMPECEMOS: adaptar maqueta/código al maestro hasta mostrar y
  verificar el recorrido completo. Trabajo exclusivo codex/2do-intento desde V32/ebb8632.
  Este avance no cierra el flujo entero. Integración dev/piero-dev exige aprobación posterior.
- Registro padre+hijos transaccional, DNI solo hash inicial, obligación persistente, guardas
  API/rutas directas y rotación/revocación de sesiones. Códigos compatibles sin distinguir
  caja, generación concurrente, índice único. ADR0013, migración002, formularios reales.
- SQL solo en BD NUEVA local PG17.6/6544 ashakids_test_flujo_v33_20261010, runtime local
  no superuser y propietario separado para fixture. Sin acceso/escrituras/migración Supabase.
  No .env habitual editado, despliegue ni integración en otras ramas. Entorno API8002/web5175.
- Backend191 aprobadas/25 omitidas/19 avisos con SQL local habilitado; frontend267 aprobadas
  (10 nuevas UI/cliente, incluida fecha al añadir hijo),25 rutas; tipos/check323/build correctos.
  No nueva auditoría ni calificación. Evidencia docs/evidence/flow-v33/.
- UI real: asesor ingresó, creó familia P90003 con dos hijos, obtuvo confirmación; ingreso
  de familia presenta activación antes del panel. Activación se inspeccionó en1280x720 y
 390x844 efectivos; envío/cambio de clave probado por API SQL, no operado en navegador.
- Fallos corregidos: fake SQL sin comparación de caja, email .invalid, limitador en suite,
  URL/CA remota heredadas en procesos locales. Primer ensayo de fechas reveló evento input
  sin cambio de estado; onInput/onChange y nueva alta de dos hijos correctos. Parche rechazado
  sin cambios parciales y timeout inicial de inventario navegador; reentrada correcta.
- Juegos: usuario eligió demostración rotulada primero. Plan educativo persistido se
  implementará aparte del progreso demo. Pagos fuera; soporte/reseñas/Zoom automático no son
  condiciones del mínimo. Contratos antiguos de altas con password larga conservan activación;
  pantalla alternativa Usuarios aún requiere adaptación al alta institucional.
- Siguiente: disponibilidad semanal/bloqueos, introducción independiente por niño, reserva
  automática45min y profesional separado del plan; cerrar criterios solicitados al usuario.
  Después plan/reporte/historial/PDF, continuidad con segundo terapeuta y juegos mínimos.
- V33 cierra este avance de registro/activación, no el flujo entero. Commit/push únicamente
  codex/2do-intento; comprobar SHA efectivo en Git. dev/feat/piero-dev siguenV32.

### Contexto del flujo actualizado — 2026-10-10

- Objetivo: condensar nuevo flujo de los tres roles y estimar impacto en tablas desde V26.
  Base piero-dev/da4e787e7e199f4457f053694f3b8c8fd0072c5b (V31), dev/remota personal
  coincidentes y árbol limpio al iniciar. Cierre documental V32; consultar SHA real en Git.
- Principal: docs/FLUJO_MAESTRO_ACTUALIZADO.md. Contexto, plan, Mundo ASHA y arquitectura
  enlazan alcance nuevo sin cambio funcional ni reactivación de propuestas V27–V30.
- Acordado: código institucional de 6 caracteres con inicial A/P/T y números; DNI solo contraseña inicial,
  cambio obligatorio; introducción por niño; disponibilidad profesional; reserva automática;
  elección libre de profesional; plan clínico y progresión educativa mínima reutilizable.
- Revisado: modelos/contratos/servicios locales, SQL histórico 02 y recuperación heredada.
  Sin consulta Supabase, migración, pruebas funcionales, cambio de runtime o escritura de datos.
  Graphify check vigente; consultas de 1500 tokens truncadas y confirmadas en archivos. Cambios solo Markdown
  no requieren refresh: manifiesto incluye fuentes de aplicación/tooling, no estos documentos.
- Incidencias: referencia lock-race-conditions.md inexistente, reemplazada por fuentes disponibles;
  primer parche rechazado por contexto architecture.md, sin cambios parciales; corregido.
- Validación documental: 18 enlaces del maestro comprobados, sin marcadores de conflicto ni
  patrones de credenciales detectados; git diff --check y knowledge check correctos.
  No se ejecutan suites de aplicación por cambios solo documentales. Destino de publicación:
  dev y feat/piero-dev; consultar refs/SHA efectivos en Git, no confundir con despliegue.
- Primer commit detenido por falta de user.name/user.email en el clon. Reintento con identidad
  de Piero ya publicada en V31, mediante git -c solo para ese comando, sin configuración global.
- Pendientes: activación inicial compatible con regla definitiva de 12–128 caracteres y códigos anteriores;
  horario exacto; cierre introductorio/transición; versiones del plan/acceso profesional;
  enlace Zoom y demo frente a persistencia inicial de juegos. No fijar número de tablas nuevas.
- Siguiente: equipo revisa maestro, cierra contrato mínimo y diseña migración/aceptación aislada.
  La publicación documental comparte alcance; no implementa ni despliega el recorrido.

### Recuperación de V26 — 2026-10-10

Base recuperada: `a81e465aa02522366eb97250c38827d11ed4a0e4`.
Código y documentos restaurados; esquema compartido compatible, registros y permisos
conservados. Las siguientes auditorías16/17 vuelven a ser la referencia vigente.
No continuar tareas posteriores a V26. Comprobaciones y límites en [RESTORE_V26](RESTORE_V26.md).
Cierre: `V31_Restauracion_Plataforma_V26`; verificar SHA y referencias mediante Git.

### Auditorías finales frontend y backend - cortes16 y17

- Dos Word separados y PDF académicos, seis páginas cada uno; fuentes docs/audits/ y
  evidencia sanitizada por corte. Puntajes técnicos propios:frontend91/100, backend91/100.
  No son notas del profesor ni certificaciones. Ejecución9oct21:14-21:33 Lima.
- Base auditada piero-dev V25/7fb36680e0c5856036bcf1de69263366247e9126, igual a dev y
  origin/feat/piero-dev al iniciar. Hosting continúa V24/62905fc, Auto Deploy Off.
  Cierre V26_Auditoria_Frontend_Backend_HTTPS:informes/harness/render Word, sin cambios app/BD.
  Comprobar publicación y SHA efectivo en Git; no atribuir una imagen nueva a este cierre.
- Resultados nuevos:257 componentes+25 rutas/tipos/check320 archivos/build6.78s;
  npm audit productivo0 vulnerabilidades. Backend138 unidades/19 deprecaciones;144 HTTPS
  finales esperados (101+29+14),52/54 contratos positivos;2 DELETE físicos omitidos.
  Hosting excluye raíz JSON local en OpenAPI, por eso54 y no55 del inventario anterior.
- TLS1.3 CERT_REQUIRED/hostname, ACL/RLS y modelo READ ONLY:26 tablas,154 columnas
  visibles al runtime,92 restricciones,71 índices,19 modelos sin diferencias;58 políticas.
  Concurrencia y revocación repetidas. Ajuste SCRAM se cita como evidencia heredada de15.
- Cohorte nueva AUDITORIA17_20261010_021551:usuarios78..83,pacientes97/98,
  tratamientos17/18,citas14/15,sesiones13/14,chat7. SQL final:1 reporte completo,3 mensajes
  (tercero UI),0 auth nuevas sin revocar. Sin modificación de datos anteriores/borrado físico.
- UI tres roles IAB1280x720; admin filtrado antes de capturar. Sesión familiar previa
  cerrada con autorización adicional expresa. Sin nueva aceptación móvil:override390x844
  no cambió tamaño efectivo y se restableció. No atribuir esa limitación al producto.
- F16-01 P1:editar reporte existente envía3 metadatos de lectura, backend422; conserva
  reporte previo y formulario. ReportWorkspace:14/SessionActions:32 -> editor:18 ->
  clinicalService:37. Separar4 campos al iniciar/serializar y añadir regresión con objeto real;
  no relajar extra=forbid. F16-02 contraste2.575:1 en etiquetas12px; F16-03 botón ojo sin
  nombre15x15 y Recordarme div sin semántica/estado sin uso. Son pendientes, no corregidos.
- Orden validado por usuario:entregar auditorías -> corregir reporte/accesibilidad -> verificar
  -> propuesta visual para validación -> implementación UX/UI por módulos. No rediseñar todavía.
  Restauración/carga/TTL natural/rotación anterior pendientes. Pagos excluidos.
- Fallos de entorno:spawnEPERM Vitest/Vite;tmpfixturesWinError5 pytest; reruns correctos.
  Harness:SyntaxError,Accept HTML omitido y serialización bytes corregidos antes del cómputo.
  Word render_docx.py sin LibreOffice/perfiltemp; Word COM read-only+Poppler como alternativa,
  todas las páginas inspeccionadas y cierre backend huérfano reparado. No afirmar éxito canónico.
- [Word frontend](../output/auditoria-final-2026-10-09/Auditoria_Frontend_AshaKids_2026-10-09-16.docx),
  [Word backend](../output/auditoria-final-2026-10-09/Auditoria_Backend_AshaKids_2026-10-09-17.docx).
  Informes audits/auditoria-2026-10-09-16.md y17.md. Reproducción:commands.md de cada corte,
  harness sanitizado solo evidencia; no reutilizar cohortes cerradas como pruebas nuevas.
  No ejecutar pytest general/phase2_sandbox en Supabase:fixtures destructivas.

### Despliegue Render HTTPS - corte2026-10-09-15

- URL pública https://ashakids.onrender.com; servicio ashakids/srv-db4penqjnfac7382hjhg,
  Free, Virginia, dev, Docker, un worker, Auto Deploy Off. Imagen V24/62905fc0480fffd21fb6b2d969592700608d64bb,
  deploy dep-db4peo2jnfac7382hl20, buildLinux57.9s y estado Live observados.
- Pooler oficial sesión5432 y ashakids_runtime. CA2021 Secret File, CERT_REQUIRED y
  hostname; TLS1.3 real. No .env local/contraseña aleatoria cambiada ni claves propietarias
  enviadas a Render. FORWARDED_ALLOW_IPS sigue127.0.0.1,::1; escrituras HTTPS aceptadas.
- Autorización expresa del responsable: SCRAM32768->4096 únicamente del rol nuevo
  para Supavisor2.9.10, conservar permisos/contraseña, guardar secreto y publicar gratis.
  Snapshots de atributos, ACL, propietarios, RLS y membresías idénticos. ADR0012.
  Menor coste offline asumido; recuperar coste mayor cuando pooler lo soporte y se pruebe.
- Nueva cohorte AUDITORIA_RENDER_20261010_014323 (UTC10oct; Lima9oct):101 respuestas
  HTTPS esperadas,0fallos;10 cookies Secure/HttpOnly/Lax; origen externo403. Concurrencia
  con sesiones auth distintas: reserva/sesión201+409, inicio/cierre200+409, reporte completo,
  chat único.8 smoke públicas adicionales. No prueba de carga ni QA visual exhaustiva.
- SQL READ ONLY posterior:6usuarios,2pacientes activos,2tratamientos,2reservas,
  2sesiones FINALIZADA,1reporte completo,2mensajes,0sesiones auth nuevas sin revocar.
  IDs72..77/95,96/15,16/12,13/11,12/chat6. Conservar/excluir de métricas; no borrar.
  ADMIN inicial usado solo local ASGI para crear nuevo seed; su secreto no salió a Render.
- CI V24:dos jobs graph aprobados (runs38002334489/38002334516); no son pruebas clínicas.
  Regresión138 pruebas/19avisos/tipos/build de V24 heredada, no reejecutada en corte15.
  Fallos iniciales CA/autenticación/pooler resueltos; DNS directo IPv6 no accesible aquí.
- [Informe15](audits/auditoria-2026-10-09-15.md), [PDF15](../output/pdf/Auditoria_Despliegue_AshaKids_2026-10-09-15.pdf),
  evidencia sanitizada docs/evidence/audit-2026-10-09-15/. Cierre previsto V25; cotejar SHA
  efectivo en Git. Auto Deploy Off conserva imagen V24 aunque se publique documentación.
- Siguiente: abrir URL antes de demo (despertar50s o más), usar cuentas habituales;
  actualizar imagen manualmente solo ante cambios funcionales. Backup/restauración,
  expiración natural, carga y rotación de cuentas anteriores siguen fuera de este ensayo.
  No pagos, TRUNCATE, DELETE físicos ni modificaciones de datos clínicos previos.

### Preparación de deploy gratuito Render - V24

2026-10-09. Rama piero-dev; base V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b.
Remotas dev/feat/piero-dev iguales al inicio; dev local actualizado por fast-forward.
Objetivo: paquete de hosting, no declarar publicada la extensión HTTPS pendiente.
Dockerfile/.dockerignore/render.yaml; backend/app/hosted.py, hosted_start.py,
core/frontend_hosting.py, tests/test_frontend_hosting.py; ADR0011 y DEPLOY_RENDER.md.
138 pruebas sin BD aprobadas/19avisos, tipos/build React y11 respuestas ASGI con dist
real aprobados. Sin consultas BD/sesiones; Graphify refresh/check vigente. Sandbox bloqueó
tmpdir pytest/esbuild; repetición autorizada.4 errores Windows/dotfile corregidos.
No Docker disponible ni build Linux. No .env cambiado, escrituras Supabase o servicio
pagado creado. Usuario eligió Free y necesita crear/vincular cuenta Render.
Siguiente: cuenta GitHub/Render, importar dev, pooler sesión IPv4 con runtime y TLS,
confirmar ingreso/proxies y recorrer HTTPS con cohortes nuevas AUDITORIA autorizadas.
No ejecutar TRUNCATE/DELETE físicos ni modificar datos previos. Preparación local no
certifica deploy. V24 identifica este avance; verificar SHA/publicación en Git al continuar.

### B02 aplicado en Supabase - corte 2026-10-09-14

- Base V21/e756e7b5865201c2a0bd311786746d20b940449f; rama de trabajo piero-dev, dev y feat/piero-dev comprobadas antes del cambio. V22_Seguridad_BD_Rol_Backend publicado y verificado en dev y feat/piero-dev: dd71407a8e21f0bacf6904bf430784d1c3b26dda. Informe/PDF14 y cierre de evidencia corresponden a V23_Auditoria_BD_Permisos_Backend; comprobar SHA remoto efectivo con Git al continuar.
- Autorización expresa para crear ashakids_runtime, GRANT por operación, políticas RLS y cambiar la conexión tras probar el candidato. Rol LOGIN sin superuser, BYPASSRLS, CREATEDB, CREATEROLE, replicación, propiedad ni pertenencia a otros roles. ACL exactas en 22 tablas, 58 políticas exclusivamente TO runtime y USAGE en 16 secuencias.
- Seis denegaciones SQL42501 comprobadas sin ejecutar DML destructivo: tabla y secuencia no concedidas, UPDATE/DELETE de mensajes, INSERT de roles y CREATE SCHEMA de ensayo con savepoint revertido. TRUNCATE/setval/DDL sobre tablas clínicas no se ejecutaron. Snapshots antes/después/final conservan roles, membresías anteriores, propietarios, RLS y ACL de otros destinatarios.
- Candidato FastAPI ASGI en proceso + SQL Supabase real: 99 respuestas esperadas. Después, API habitual8000 recargada: 99 núcleo+29 complemento+5 sistema=133 respuestas esperadas, 0 fallos, éxito en53/55 operaciones. Las2 operaciones DELETE físicas no se ensayaron. 114 pruebas backend sin BD/conftest,19 avisos; sin nueva ejecución frontend (regresión del corte13 heredada).
- Persistencia de cada cohorte: 2 reservas,2 sesiones FINALIZADA,1 reporte completo,2 mensajes y0 sesiones auth nuevas activas. Prefijo AUDITORIA13_ heredado del guion: candidato AUDITORIA13_222612, usuarios62..66/pacientes91,92/tratamientos11,12/citas8,9/sesiones7,8/chat4; HTTP final AUDITORIA13_222932, usuarios67..71/pacientes93,94/tratamientos13,14/citas10,11/sesiones9,10/chat5. Conservar y excluir de métricas clínicas; no borrar ni modificar cohortes anteriores.
- Solo DATABASE_URL de backend/.env cambió; host/puerto/BD y configuración TLS permanecen. Respaldo privado tmp/b02-env-before-private.txt y credencial nueva tmp/b02-runtime-private.json, ambos ignorados. No publicar URLs, contraseñas, SCRAM, cookies, tokens ni logs privados. ADMIN de AshaKids conserva funciones; propietario PostgreSQL conserva permisos separado del runtime. El push no cambia .env de otros clones: coordinar configuración por canal privado.
- PUBLIC CONNECT/TEMP y USAGE de public conservados; runtime no tiene CREATE en BD/schema ni funciones SECURITY DEFINER alcanzables. RLS USING true para el rol técnico no aísla familias en SQL; FastAPI sigue autorizando cada recurso. ADR0010 y B02_MINIMO_PRIVILEGIO.md documentan límites y reversión. No instancia nueva8001; una preexistente no fue usada ni detenida.
- Evidencia nueva docs/evidence/audit-2026-10-09-14/. B02 aplicado/verificado en este clon y destino real. HTTPS/hosting, rotación de cuentas anteriores, backup/restauración, carga, expiración natural y DELETE físicos siguen pendientes. CI remoto no observado. No ampliación de módulos ni pagos.
- [Informe14](audits/auditoria-2026-10-09-14.md), [PDF](../output/pdf/Auditoria_BD_Permisos_AshaKids_2026-10-09-14.pdf), valoración técnica86/100 (83 del corte13 heredado). PDF renderizado/revisado, manifest de integridad y evidencia sanitizada. Siguiente: configurar credencial runtime en clones por canal privado; después hosting HTTPS y recuperación con responsables. No confundir Git con despliegue público ni solicitar otra aprobación B02 ya concedida.

### Corrección backend B01-B06 - corte 2026-10-09-13

- Trabajo exclusivamente en piero-dev desde V19/a1930df. V20_Correccion_Backend_Seguridad_Contratos publicado y verificado en dev y feat/piero-dev: b76a34a6125cae42614e9bee6da41ccc28163d7b. Informe y complemento de evidencia corresponden al cierre V21_Auditoria_Backend_Supabase_Documentacion; comprobar su SHA remoto con Git antes de continuar.
- TLS remoto CERT_REQUIRED/hostname, CA2021 con compatibilidad explícita por keyUsage en Python3.13; conexión realTLS1.3 y confianza incorrecta rechazada. Producción valida HTTPS/orígenes; login limitado en un proceso; contraseñas nuevas12..128 y sexo compatibles centralizados. ADR0009 y guías operations.
- Servicios administrativos/pacientes divididos manteniendo27 cuerpos de funciones idénticos por comparación AST. Todos los Python modificados <=500líneas; test_auth_api499.
- 114 pruebas backend sin BD/conftest,19 avisos; 257 componentes/25 rutas frontend, tipos/check/build y pip check correctos. No suite destructiva ni BD descartable.
- Autorización humana explícita para nueva cohorteAUDITORIA en Supabase y sesiónADMIN inicial por credenciales privadas. Primera corrida95HTTP con una sesión por actor; final99HTTP con sesiones distintas para concurrencia,29HTTP complementarios y5HTTP de sistema:133 respuestas esperadas,0fallos;53/55 operaciones con éxito real. Los2 DELETE físicos quedan fuera del ensayo. SQL READ ONLY confirma2reservas/2sesionesFINALIZADA/1reportecompleto/2mensajes y0sesionesauth activas nuevas.
- Conservar IDs iniciales usuarios52..56,pacientes87/88,tratamientos7/8,citas4/5,sesiones3/4,chat2; finales usuarios57..61,pacientes89/90,tratamientos9/10,citas6/7,sesiones5/6,chat3. Excluir de métricas clínicas; no borrar. No cuentas clínicas anteriores modificadas, DDL/TRUNCATE ni permisos compartidos cambiados.
- B02 pendiente: propuesta operations/B02_MINIMO_PRIVILEGIO.md; BYPASSRLS/CREATEDB/CREATEROLE siguen activos. B03 parcial por rotación/HTTPS; B06 parcial por caída real/backup/restauración/escritores externos y cargas no ensayadas. DELETE físicos no autorizados; expiración natural/QA visual completa no certificadas.
- Evidencia nueva docs/evidence/audit-2026-10-09-13/. Credenciales bootstrap en backend/.env; credenciales nuevas en tmp/AUDITORIA13_*private.json ignorado. No publicar esos archivos. API habitual8000 conserva destinoSupabase y --reload; no8001 ni despliegue público.
- [Informe13](audits/auditoria-2026-10-09-13.md), [PDF](../output/pdf/Auditoria_Backend_AshaKids_2026-10-09-13.pdf), valoración técnica83/100 (anterior73 heredado); no calificación oficial ni certificación de producción. Evidencias sanitizadas, manifest de integridad y PDF renderizado/revisado. Siguiente: aprobación específicaB02 y ensayoHTTPS/rotación/backup por responsables. CI remoto no observado; no atribuirle pruebas locales.

### Corte vigente de correcciones y auditoría frontend, 2026-10-09-12

- Ejecutado en feat/sroman, base a397c0f y commit funcional V18/a60d671a8523a016a41b50395a7db92b05698f18; cambios CORS locales previos preservados.
- Reportes del profesional, historial por paciente y sesiones admin conectados manteniendo diseño. Identidad profesional/ASHI, vocabulario de sexo, proxy8000, envío duplicado y recuperación de red corregidos. Tres fragmentos simulados sin consumidores retirados y documentados.
- Última regresión:257 componentes +25 rutas,0 fallos/skip; tipos/check/build pasan;320 fuentes max495. 11 pruebas seleccionadas backend pasan sin fixture clínico; no se ejecutó suite completa contra Supabase.
- Recorrido real autorizado AUDITORIA: crear cuentas/paciente, asignar tratamiento, reservar/confirmar/registrar/iniciar, guardar reporte, finalizar con aceptación manual del usuario, consultar como familia/descargar PDF. Lectura independiente:28 HTTP correctos y SQL READ ONLY de la misma BD Supabase.
- IDs retenidos:50/51usuarios,86paciente,6tratamiento,3cita,2sesión. Archivo de verificación no guarda credenciales; requiere contraseña sintética externa y revisión de IDs.
- Se corrigió fixture que esperaba respaldo ficticio; aumentó timeout asíncrono a5s por prueba de mensajes lenta en Windows sin eliminar assertions. Fallos iniciales y límites están en informe.
- [Informe12](audits/auditoria-2026-10-09-12.md), [PDF](../output/pdf/Auditoria_Frontend_AshaKids_2026-10-09-12.pdf), [evidencia](evidence/audit-2026-10-09-12/). Frontend94/100; no declarar100 ni producción completa.
- Próxima acción: hosting HTTPS con proxy/cookies y QA de variantes/accesibilidad/expiración; backend debe revisar TLS y privilegios de BD señalados en auditoría real anterior. Pagos siguen fuera de alcance. Las afirmaciones históricas debajo no sustituyen esta aceptación pendiente.
- Publicación funcional completada: dev y feat/sroman apuntan a V18/a60d671, comprobadas con ls-remote. Corte documental V19 conserva informe12/PDF/evidencia y Word históricos; sus guiones locales con credenciales quedan fuera de Git. La configuración real .env sigue ignorada. Confirmar el SHA documental remoto al entregar; no confundir push con hosting público.
- PDF final de11 páginas renderizadas y revisadas; hash registrado en pdf-validation.json. .gitattributes preserva PDF/Word/imágenes como binarios frente a core.autocrlf de Windows; bytes fuente/index del PDF idénticos.

Estado histórico de Fase 7 — Paquete de Entrega Académica Consolidado:
1. Informe exhaustivo de rúbrica en `docs/academic/INFORME_ENTREGA_RUBRICA.md` con trazabilidad a los 3 criterios del profesor (Arquitectura Backend FastAPI, Modelo Físico/Integración Relacional en PostgreSQL con 26 tablas, Seguridad/RBAC y resultados de 376 pruebas aprobadas: 119 Pytest + 232 Vitest + 25 routing, 0 fallos).
2. Análisis comparativo y recomendación técnica de hosting gratuito en `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md` (F7-02), evaluando Vercel + Render vs Railway, y resolviendo el transporte de cookies HttpOnly Same-Origin mediante reglas de rewrite.
3. Guion de sustentación académica y demostración en vivo (8-10 min) en `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md` (F7-03) con los 3 roles sintéticos (`a90001`, `t90001`, `p90001`), descarga de reporte PDF y persistencia demostrada.
4. `DELIVERY_CHECKLIST.md` y `README.md` actualizados con acceso directo a todos los recursos de entrega antes de las 18:00 Lima.

### Relevo técnico: consolidación de entrega académica y cierre de Fase 7, 2026-10-09-11

- Responsable: desarrollo asistido en el entorno de HailQueso.
- Base: dev/7075cca (V16_Cierre_Extensiones_Fase6).
- Archivos generados y actualizados:
  * `docs/academic/INFORME_ENTREGA_RUBRICA.md`: Documento oficial de sustentación técnica trazado a los criterios de la rúbrica.
  * `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md`: Comparativa formal F7-02 de Vercel, Render y Railway con análisis de cookies HttpOnly y conexión a Supabase.
  * `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md`: Guion de defensa oral estructurado minuto a minuto.
  * `docs/DELIVERY_CHECKLIST.md`: Verificación de todos los entregables de salida de la entrega académica.
  * `README.md`: Instrucciones directas de arranque, credenciales sintéticas y enlaces principales.
  * `docs/PROJECT_CONTEXT.md` y `docs/IMPLEMENTATION_PROGRESS.md`: Estado consolidado del proyecto.
- Estado general: Fases 1 a 7 completadas. Proyecto listo para sustentación y entrega final antes de las 18:00 Lima.

### Relevo técnico: cierre formal de Fase 6 y paso a Fase 7, 2026-10-09-10

- Responsable: desarrollo asistido en el entorno de HailQueso.
- Base: dev/9227035 (V15_Configuracion_Proxy_Autenticacion_Cookies).
- Acción realizada:
  * Evaluación de las cuatro extensiones avanzadas frente a la rúbrica de evaluación y el plazo límite.
  * Publicación de [ADR 0008](decisions/0008-cierre-y-alcance-extensiones-fase6.md) documentando la arquitectura de teleconsulta por enlace/sala, juegos desacoplados en Mundo ASHA, asistente local seguro sin fugas a LLMs comerciales y mensajería en base de datos.
  * Actualización de `docs/IMPLEMENTATION_PLAN.md` marcando la Fase 6 como cerrada y diferida para el alcance evaluado.
- Siguiente tarea:
  * Ejecutar Fase 7: Consolidar evidencia para los 3 criterios de la rúbrica (Backend, BD, Seguridad/Pruebas), redactar análisis comparativo de hosting gratuito (F7-02) y preparar guion de sustentación académica reproducible.

### Relevo técnico: resolución de proxy y cookies de sesión para navegador Brave, 2026-10-09-09

- Responsable: desarrollo asistido en el entorno de HailQueso.
- Base: dev/b15b82b (V14_Aceptacion_Nucleo_Reportes_Mensajes).
- Causa raíz identificada:
  1. El frontend cargado en `http://127.0.0.1:5174` intentaba consumir la API en `http://localhost:8001/api/v1`.
  2. Debido a la disparidad de host (`localhost` vs `127.0.0.1`) y puerto (5174 vs 8001), los navegadores consideran la solicitud como cross-site/cross-origin.
  3. Las cookies HttpOnly con atributo `SameSite=lax` no son enviadas por los navegadores en subrecursos fetch entre orígenes cruzados.
  4. La siguiente petición autenticada devolvía 401 Unauthorized, lo que emitía el evento `ashakids:session-expired` y hacía que `RouteAccess` redirigiera instantáneamente a `/login`, aparentando una recarga de página.
- Solución aplicada:
  * `frontend/vite.config.ts`: configuración del bloque `server` con host `127.0.0.1`, puerto `5174` y proxy de `/api` hacia `http://127.0.0.1:8001`.
  * `frontend/.env.local`: `VITE_API_BASE_URL=/api/v1`.
  * `frontend/src/api/client.ts`: soporte transparente para proxy manteniendo fallback para suite de tests Vitest en jsdom/Node.
- Comprobaciones realizadas:
  * Suite de componentes: 232 pruebas aprobadas (0 fallos).
  * Suite de enrutamiento: 25 pruebas aprobadas (0 fallos).
  * `check:frontend` y `build`: 0 errores.
  * Petición HTTP al proxy: `POST /api/v1/auth/login` retornó 200 con `Set-Cookie: ashakids_session=...; SameSite=lax; Path=/`. `GET /api/v1/auth/me` con dicha cookie retornó 200 con la información del usuario autenticado.

### Relevo de aceptación del núcleo/PDF/mensajes en entorno independiente, 2026-10-09-08

- Responsable: desarrollo asistido en el entorno independiente de HailQueso.
- Base: dev/b3f84bd (V13_Integracion_Aceptacion_Nucleo).
- Entorno probado: Windows, Node v22.15.0 / npm 10.9.2, Python 3.13.7 en backend/.venv, PostgreSQL 18.4 local en puerto 5433.
  Bases nuevas descartables: ashakids_test_accept07_hq (recorrido de entrega) y ashakids_test_regress08 (regresión pytest).
- Resultados verificados:
  * Backend: 119 pruebas aprobadas, 25 omitidas (suites heredadas deshabilitadas), 19 advertencias. 0 fallos.
  * Frontend: 232 pruebas Vitest y 25 de enrutamiento aprobadas; tsc --noEmit, check:frontend (318 archivos, máx. 495 líneas) y build exitosos.
  * API y Entrega HTTP: 92 respuestas HTTP verificadas en http://127.0.0.1:8001/ con PostgreSQL local en puerto 5433. PDF generado (reporte-sesion-sintetica.pdf) verificado en texto y cabeceras. Mensajería privada probada con paginación de cursor y lectura tras relogin.
  * Modelo físico: 26 tablas públicas, 178 columnas, 221 restricciones y 71 índices inspeccionados.
- Limitaciones registradas:
  * El agente de navegador browser_subagent reportó fallo al instalar el driver de Playwright (HTTP 404 de azureedge CDN para versión 1.57.0). Conforme a las instrucciones del usuario, no se cambiaron puertos ni se evadió la herramienta. La interacción visual real en 5174 queda pendiente sin falsear estados.
  * Incidente 01 histórico: contenido y aislado localmente por guardas; el impacto histórico en Supabase requiere revisión de logs/baseline del equipo.
- Archivos generados/actualizados:
  * backend/scripts/verify_delivery_journey.py (soporte parametrizado para código de auditoría y entorno).
  * docs/audits/auditoria-2026-10-09-08.md y output/pdf/Auditoria_Aceptacion_Nucleo_PDF_Mensajes_AshaKids_2026-10-09-08.pdf.
  * docs/evidence/audit-2026-10-09-08/ (17 archivos de evidencia con manifest SHA-256).
  * docs/PROJECT_CONTEXT.md, docs/IMPLEMENTATION_PLAN.md, docs/IMPLEMENTATION_PROGRESS.md, docs/audits/README.md.
- Siguiente tarea:
  * Consolidar paquete de entrega académica y trazabilidad a rúbrica antes de 18:00 Lima.

### Relevo anterior de aceptación del núcleo/PDF/mensajes, 2026-10-09-07

- Archivos: verify_delivery_journey.py, test_delivery_guard.py y inspect_schema_compatibility.py
  (incluye mensajería). No cambios de UI ni endpoints/arquitectura del producto. V11 código;
  V12 auditoría/fuente/PDF/evidencia/contexto y guion. Publicación concreta: PR/historial V13.
- Entorno probado: clon e456294 en tmp/acceptance07/clone, Python3.13.7/venv vacío,
  requirements-dev.txt y npm ci; Node26.9.0/npm11.19.1. Cluster PG17.6 ya existente6544.
  Aplicación limpia; guion nuevo externo al clon. Mismo equipo/agente, no aceptación humana.
- BD nuevas accept07 y accept07_repeat: una clínica sintética por corrida, seis cuentas y dos
  mensajes; guion de92 respuestas repetido. Ajustes de tiempo/estado solo nuevos IDs, sin reset.
  regress07 exclusiva para pytest completo, cuyos fixtures sí hacen TRUNCATE. No reutilizar
  compat17 ni bases de aceptación para esa suite. Sin datos reales ni acceso a Supabase.
- Guardia: sesión emitida por API debe existir en BD local declarada, no revocada ni vencida,
  antes de primer paciente. Prueba real positiva/negativa y cuatro unidades; auth crea sesiones.
  Contiene la divergencia de instancia; no resuelve el impacto histórico de cuentas01.
- Comandos/resultados en evidencia07:115 del clon y119 finales/25 omitidas/19 avisos;
  232 frontend/25 rutas; schema READ ONLY26/178/92/71,19 modelos/0 diferencias;92 HTTP dos
  veces;6 restauración/guarda separadas. No sumar suites/corridas como cobertura diferente.
- API8001 vuelve al código primario y compat17, reporte02/historial14 comprobados. Conteos
  clínicos originales conservados; no snapshot completo. Vite5174 y otros puertos sin cierre.
- Fallos: restore public existente; grant antes de tabla roles; EPERM de Node/procesos y bind
  ocupado. Todos registrados y corregidos localmente. Backend19 avisos son deprecaciones;
 25 omitidas mantienen deshabilitadas20 HTTP heredadas y5 integración compartida.
- Navegador: getState disponible; getTab5174 rechazado una vez tras confirmación del usuario.
  Preferencia guardada sigue bloqueando. No usar otro origen/CDP/herramienta para eludirla.
- Próximo prompt: «Lee AGENTS.md, contexto, plan, auditoría07 y guion de aceptación. Confirma
  dev/V13 actualizado. Completa revisión visual real de núcleo+PDF+mensajes, desktop/móvil y
  teclado, cuando Codex permita5174; no eludas una denegación. Usa demo compat17 conservada,
  API8001/web5174/PG17.6 local6544 sin prepare/reset. Otro integrante debe repetir en una BD
  NUEVA con prefijo ashakids_test_accept07; usa regress separada para pytest. Revisa logs/
  baseline de incidencia01 y registra alcance real. Entrega nueva evidencia/PDF solo de pruebas
  nuevas; publica commits versionados reales en dev. No fase6/hosting/pagos/juegos MA completos
  antes de cerrar aceptación del alcance elegido. Fecha límite hoy18:00 Lima».

### Punto de continuación anterior, corte06

F5-01/PDF + mensajes implementados y verificados localmente; aceptación de conjunto pendiente.
Código de mensajes V08_Mensajes_Familia_Terapeuta, 7fddd59d6cc6ec594c666c9c80ba184a88c9a91d;
documentación V09_Auditoria_Mensajeria, auditoría2026-10-09-06 y ADR0007. Base dev/1398e70,
PDF previo integrado por PR105. Publicación de06 por PR hacia dev/V10_Integracion_Mensajeria:
consultar historial/PR para SHA efectivo; no se declara un merge futuro como ejecutado.
232 frontend,36 unitarias backend,25 rutas,53 HTTP + OpenAPI local; tipos/check/build correctos.
Dos corridas HTTP dejan14 mensajes sintéticos persistentes en conversación1; sin reset/DDL.
Navegador bloqueado por preferencia previa: no hay capturas nuevas ni E2E visual de mensajes.
Confirmar desktop/móvil, recaptura PDF05 y reproducción por otro clon. Fase5 sigue abierta.
Incidencia01 pendiente; recursos diferidos, juegos MA independientes y hosting tras estabilidad.

### Relevo funcional: mensajes familia/profesional, 2026-10-09-06

- Objetivo: intercambio privado y persistente con contactos realmente asignados. Backend:
  api/v1,models,schemas,services/mensajeria.py y main.py; guion verify_messaging.py y25 unidades.
  Frontend: messagingService, MessagesCenter/MessageThread, entradas de padre/terapeuta,
  ADMIN sin campaña ficticia y16 pruebas nuevas. Convención V08/V09/V10 concreta por módulo.
- Entorno: .venv313 Python3.13.7, API8001/web5174/PG17.6 local6544, ashakids_test_compat17.
  Sin nueva dependencia; las tablas provienen de la réplica02. No usar Supabase para estas
  escrituras; conservar fixtures y mensajes. El env habitual ignorado no se versiona.
- Comprobaciones:36 unidades (25 mensajes +11 PDF rerun),232 componentes,25 rutas;
  tipos/check/build; HTTP final53 + OpenAPI200, apertura concurrente misma pareja/envíos
  concurrentes, historial cursor14 sin duplicados y lectura idéntica tras logout/login.
  Estados cerrados/sin asignación son unidades con mocks; no nuevas mutaciones clínicas.
- Fallo inicial:230 frontend,229 aprobadas/1 expectativa antigua demo; corregida. Rerun230;
  después dos casos adicionales de respuesta POST inválida dan232 finales. Primer guion
  HTTP47 + OpenAPI, siete mensajes; final53 crea otros siete. Intentos originales preservados.
- Limitaciones: Actualizar manual, no leído/presencia/llamadas/adjuntos. Borradores solo memoria
  por chat; POST sin retry ni clave idempotente. Respuesta perdida exige actualizar antes de
  reenviar; UNIQUE pareja ausente, escritores externos requieren reglas equivalentes.
  ADMIN solo no consulta chats; historial del participante sigue visible al terminar asignación.
- Bloqueo: preferencia previa del navegador rechazó origen5174. No nuevo intento ni evasión
  en06. No decir que mocks/build verificaron UI real. Mantener deuda de aceptación visual.
- Publicación: revisar diff/secretos y referencias, push feat/piero-dev, PR hacia dev y merge
  V10; sincronizar dev y piero-dev por fast-forward sin force-push. Estado concreto en PR/Git.
- Próximo prompt: «Lee AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md y este relevo.
  Actualiza dev por fast-forward y confirma V10/PR de mensajería. Completa aceptación F5-01:
  núcleo con ADMIN/PADRE/TERAPEUTA, reporte guardado/PDF y mensajes privados entre dos
  participantes. Usa API8001/web5174/PG17.6 local6544 con datos sintéticos; no reset de demo.
  Confirma revisión visual desktop/móvil y recaptura PDF cuando navegador permita; no eludas
  una preferencia denegada. Reproduce en otro clon y revisa incidencia01; registra casos reales,
  errores y pendientes. Entrega auditoría PDF/evidencia nueva y commit/push versionado en dev.
  No ampliar fase6, pagos ni juegos completos MA antes de cerrar el alcance seleccionado».

### Relevo funcional: reportes guardados y descarga PDF, 2026-10-09-05

- Objetivo: descargar todos los campos compartidos guardados de una sesión autorizada.
  Cambios: backend api/services/report_pdf y sesiones; cliente binario/clinicalService;
  ReportDownload/SessionActions y Reportes familiar. No cambió el esquema ni la autorización.
- Entorno: .venv313, API8001/web5174/PG17.6 local6544, ashakids_test_compat17;
  pacientes/reportes sintéticos existentes. API8000/web5173 y Supabase no se auditaron.
  Dependencias nuevas registradas en requirements(-dev).txt; instalar antes de arrancar otro clon.
- Verificación: pytest limitado a test_report_pdf.py con dependencias simuladas; Vitest216;
  routing25; tipos/check/build. verify_report_pdf.py coteja PDF/JSON, lectura posterior y
  permisos propios/ajenos; requiere guardas de destino local. No ejecutar reset de fixtures.
- Fallos iniciales corregidos: tzdata ausente en Windows, lectura Blob.text no disponible
  en jsdom, espera de ruta lazy, claves React duplicadas y paginación que desplazaba campos
  largos. Intentos y resultados previos preservados en evidence/audit-2026-10-09-05/.
- Limitaciones: caracteres ajenos a Vera reciben 422; PDF es copia actual, sin historial
  inmutable o firma digital. Mensuales y /terapeuta/reportes demo aún no son informes reales.
- Comprobar dev/piero-dev/origin/feat/piero-dev después de integrar; no force-push.
  Publicación concreta: historial Git/PR correspondiente a V07_Integracion_Reportes_PDF.
- Próximo prompt: «Lee AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md y este relevo.
  Confirma dev actualizado y el corte05. Continúa F5-01 mensajes familia/terapeuta: investiga
  contratos/tablas existentes, acuerda autorización por participantes y asignaciones, implementa
  persistencia/paginación y estados de envío sin éxitos ficticios. Usa una BD local sintética
  para escrituras; conserva esta demo. Entrega auditoría nueva con PDF/evidencia/contexto y
  publica un avance coherente en dev con la siguiente versión concreta. No pagos; juegos
  completos en etapa MA. Recaptura móvil del PDF e incidencia01 siguen pendientes».

### Relevo documental: convención de commits, 2026-10-09

- Usuario pide títulos que expliquen acción y módulos: `VNN_Accion_Modulos`.
  Regla común para compañeros/agentes en AGENTS.md, incluidos PR y merge.
  Continuar desde la secuencia publicada V03; no reiniciar en V01.
- Se conservan V01_Fase3, V02_AuditoriaFase3 y V03_IntegrarFase3 publicados:
  renombrarlos cambiaría sus SHA y exigiría reescribir dev compartida y referencias
  de auditoría. El usuario permite conservarlos; nuevos títulos describen el contenido.
- Base de esta actualización: dev, 40d53875a1f87378e3651a68c101c2b7150af6da,
  integrado por PR #104 y previamente sincronizado con piero-dev/feat/piero-dev.
- Archivos: AGENTS.md, PROJECT_CONTEXT.md y este relevo. Solo documentación;
  no cambios funcionales, pruebas nuevas ni auditoría técnica nueva. Revisar diff,
  comprobar mapa y publicar el ajuste. Siguiente implementación sigue siendo F5-01.

## Tablero inicial

| ID | Tarea | Estado | Responsable | Cierre esperado |
| --- | --- | --- | --- | --- |
| F1-01 | Preparación local | Verificada localmente | Por asignar | Servicios y controles registrados; otro equipo pendiente |
| F2-01 | Identificar entrega backend auditada | Base dev e informe recibidos; SHA del informe por documentar | Backend/coordinación, personas por asignar | SHA exacto y defectos |
| F2-02 | Alinear API y frontend | Núcleo verificado localmente | Revisión asistida; equipo por asignar | SQL/avatar, estados y reportes comprobados |
| F2-03 | Recorrido de tres roles | Verificado localmente; compartir/reproducir pendientes | Revisión asistida; otro integrante por asignar | PDF nuevo y 27 casos HTTP; incidencia inicial abierta |
| F2-04 | Compatibilidad con BD y entorno de integración | Verificada en réplica local; reproducción del equipo pendiente | Revisión asistida; integrante por asignar | Corte 02: estructura PG 17.6, 0 diferencias de columnas tras corrección, 79 pruebas y 48 respuestas HTTP |
| F3-01/02 | Seguimiento y coherencia del núcleo | Cerrada/verificada localmente para el núcleo mínimo | Revisión asistida; revisor del equipo por asignar | Corte04: 198 componentes/25 rutas, 35 HTTP + OpenAPI, paneles/seguimiento/configuración/asignaciones |
| MA-00 | Base de Mundo ASHA por habilidades y niveles | Base verificada sin conexión educativa; etapa completa pendiente | Usuario/profesional/equipo | Catálogo draft-1, selección por ID, reglas puras; próxima MA-01 |
| F4-01 | Desarrollo de pagos simulados | Retirada por observación del profesor | No asignar | Maqueta existente solamente; sin nuevos commits de pagos |
| F5-01 | Reportes PDF y mensajes autorizados | PDF verificado localmente; mensajes pendientes | Revisión asistida; revisor del equipo por asignar | Corte05/ADR0006; siguiente persistencia/paginación de mensajes |
| F6-01 | Seleccionar extensiones avanzadas | Por confirmar | Coordinación, persona por asignar | Decisión según rúbrica/tiempo |
| F7-01 | Entrega reproducible | Pendiente | Equipo, personas por asignar | Guion y evidencia del alcance seleccionado |
| F7-02 | Elegir hosting gratuito | Pendiente; después de estabilizar alcance | Coordinación/arquitectura, persona por asignar | Comparación oficial vigente, coste/límites, recomendación y alternativa |
| F7-03 | Ensayar despliegue elegido | Depende de F7-02 y núcleo estable | Integración, persona por asignar | Mismo commit/esquema y recorrido funcionando en dominios reales |

Entrega confirmada: 2026-10-09 18:00 America/Lima. No hay porcentajes de avance inventados. Dividir tareas amplias antes de desarrollarlas.
Responsable por función no implica una persona asignada ni trabajo ya iniciado.

## Protocolo al iniciar un turno

1. Leer AGENTS.md, contexto maestro, plan y último relevo de este archivo.
2. Consultar git status y branch; actualizar referencias y acordar el SHA de partida.
   Si hay cambios locales, preservarlos; no resetear ni cambiar de rama a ciegas.
3. Comprobar mapa con tools/knowledge/manage.py check; consultar símbolos concretos.
4. Elegir una tarea acotada y registrar quién la toma. Antes de modificar, leer contratos
   y archivos señalados; confirmar por código las inferencias del grafo.
5. Continuar desde la evidencia anterior; ejecutar de nuevo lo afectado por cambios nuevos.

## Protocolo antes de agotar tokens o cambiar de integrante

1. Detenerse en un punto identificable, registrar trabajo completo y parcial, errores y siguiente paso.
2. Consultar git status/diff; evitar secretos, .env, logs y datos reales en commit o relevo.
3. Guardar cambios de código y este registro en la rama de tarea. Compartirlos mediante push/PR
   según el flujo acordado. La otra computadora solo recibe lo que se publicó en Git.
4. Indicar SHA final y destino compartido; si no se hizo commit/push, decirlo explícitamente.
5. Si quedó trabajo parcial, marcar implementada sin verificación o en curso; no marcar verificada.
6. La siguiente persona confirma el SHA recibido y toma la tarea; no depende del chat anterior.

Recomendación: ramas de tarea desde dev y PR a dev; un responsable integra cada contrato.
No hacer cambios incompatibles simultáneos al mismo dominio sin acordar quién integra.
El usuario autorizó publicación al cerrar cada fase (2026-10-09), además de la señal de relevo anticipado. Revisar cambios y sincronizar dev; no usar force-push.

## Ficha que debe copiar cada relevo

```text
Fecha y persona que entrega / recibe:
ID de tarea y fase:
Objetivo y criterio de aceptación:
Rama, SHA de inicio y SHA final:
PR o rama publicada (o indicar: solo local):
Estado: pendiente / en curso / bloqueada / implementada sin verificación / verificada:
Archivos y contratos modificados:
Qué funciona y qué quedó parcial:
Comandos y casos realmente ejecutados, entorno y resultados:
Fallos/bloqueos y causa conocida:
Siguiente acción concreta y archivo/símbolo de entrada:
Cambios locales aún sin commit y riesgos de integración:
Evidencia sanitizada y limitaciones:
Documentos/contexto/ADR actualizados:
```

## Evidencia inicial y límites

- auditoria-backend-2026-10-08.md: informe histórico de 63 pruebas correctas, 5 omitidas y
  19 advertencias; no ejecutadas de nuevo en esta revisión documental.
- tarea-1-frontend-informe.md: informe histórico de modularización; su descripción de UI
  simulada no sustituye la revisión del código actual.
- Preparación local de esta conversación: dependencias runtime/desarrollo, Graphify;
  build, typecheck y check:frontend correctos; /health y /health/ready 200. No E2E autenticado.
- Revisión de planificación: clinicalService y consumidores clínicos encontrados; tablas
  estructuradas según el equipo. No se ejecutaron escrituras de BD ni cambios de aplicación.

Guardar evidencias reproducibles sin secretos en docs/evidence/ o en el PR/CI.
Logs en tmp/ son locales y no se versionan. Datos de pruebas deben ser sintéticos.

## Pendientes de coordinación

Integrantes/revisores; SHA del corte auditado; entorno descartable de aceptación;
criterios no visibles de la rúbrica; hosting si se exige. No desarrollar persistencia de pagos.

### Relevo técnico — 2026-10-09, AUDIT-2026-10-09-01

- Responsable: revisión asistida por Codex; revisor humano por asignar. HEAD completo:
  82f868fd4a1b7e7d40a636651c13d9add472c71f, piero-dev + diff local sin commit/push.
- Núcleo verificado en 5174 -> 8001 -> PostgreSQL 18 local 6543/ashakids_test_phase2.
  Otro servidor habitual sigue separado en 8000/5173.
- Backend: 72 aprobadas, 25 omitidas, 19 advertencias; frontend 153 componentes y 25 rutas,
  tipos/check/build correctos. HTTP posterior 27 casos; datos persisten al reloguear/recargar.
  Regresión final guardas: 7 aprobadas/20 omitidas/1 aviso de caché, sin sumar esas repeticiones.
- Archivos: SQL/avatar + migración, guardas/tests heredados/configuración, scripts phase2_*,
  agenda familiar, aviso PageFrame, métricas de reportes, dos regresiones UI y espera screens.
  PDF/fuente/evidencias e índice actualizados. No se añadió backend de pagos.
- Primera ejecución heredada alcanzó API habitual compartida y operó cuentas de prueba.
  Ver sección 06 del informe y legacy-target-incident.json. Detenida; guardas posteriores
  probadas. No hay restauración ni garantía de ausencia de impacto en esa base.
- Estado final descartable: 5 usuarios, 1 paciente, 1 tratamiento, 1 cita COMPLETADA,
  1 sesión FINALIZADA/ASISTIO y 1 reporte. No ejecutar pytest sobre esa fixture si se quiere
  conservar para presentar. fresh-schema.txt verifica segunda base vacía con SQL actualizado.
- Próxima acción: equipo revisa incidente/logs, comparte cambios y otro integrante reproduce
  el guion de docs/evidence/audit-2026-10-09-01/README.md. Después F3-01: paneles demo,
  seguimiento y navegación administrativa. No rehacer autenticación ni tablas del núcleo.
- PDF: output/pdf/Auditoria_Fase2_AshaKids_2026-10-09-01.pdf; fuente en docs/audits/.

## Historial

2026-10-09, aclaración de entornos y despliegue: añadidos cierre de compatibilidad F2-04,
selección de hosting gratuito F7-02 y ensayo F7-03. No se ejecutó una auditoría nueva, consultas
a la BD compartida, migraciones, pruebas ni despliegues en esta actualización de planificación.
La auditoría PDF anterior conserva su corte; su manifest.json es histórico, no un hash del
estado documental posterior. La comparación de proveedores se hará cuando el alcance esté estable.
Usuario precisa: demostrar estabilidad antes de recomendar; comparar Vercel/Railway/Render
con condiciones vigentes y ayudarle a elegir. Proveedor/ejecución del despliegue aún pendientes.

2026-10-08: creado contexto maestro y plan. Usuario confirma backend en desarrollo con
 tablas estructuradas, trabajo por relevos al agotar tokens y pagos únicamente simulados.
Se prioriza continuar la base existente, alinear contratos y cerrar aceptación del núcleo.
Esta actualización documental queda local hasta que se haga commit/push; no se compartió con
otros integrantes automáticamente.


### Relevo documental — 2026-10-08

- Usuario confirma dev común; rama local piero-dev. PDF aportado leído y archivado sin alterar.
- Fecha límite: 2026-10-09 18:00 Lima. Rúbrica parcial transcrita en DELIVERY_CHECKLIST.md.
- AGENTS.md incorpora versiones en commits, enlace de repositorio en informes y obligación
  de PDF/fuente/evidencia por auditoría. No se creó un commit ni se reescribió historial.
- Fase de pagos nuevos retirada según observación docente; maqueta actual solo demostrativa.
- Creado protocolo/plantilla/índice de auditorías. Este turno documenta evidencia aportada,
  no ejecuta una auditoría técnica nueva ni reutiliza sus cifras como resultados actuales.
- Siguiente tarea: aceptación fase 2 y evidencias académicas en entorno descartable.
- Documentación local sin commit/push; debe compartirse mediante el flujo Git del equipo.

## Relevo 2026-10-09-02 - Compatibilidad

Objetivo completado: comparación compartida en solo lectura y aceptación del núcleo en
réplica PostgreSQL 17.6. Rama piero-dev, HEAD 82f868f, cambios locales sin commit/push.
Modelos corregidos: token_hash, progreso decimal, requisito/icono_logro. SQL inicial
alineado en logros; avatar_nombre ya existe en Supabase, sin migración compartida.

Herramientas: inspect_schema_compatibility, testing_database, verify_compatibility_journey.
Fixtures usan runtime no superusuario y propietario separado para limpieza local; 7 guardas
nuevas verificadas. Primera suite falló por propietario de secuencia; dos intentos HTTP
rechazaron campos incorrectos del guion (422). Todo conservado en evidencia corte 02.

Resultado final: 79 aprobadas, 25 omitidas, 19 advertencias; 48 respuestas HTTP verificadas; navegador
familiar conserva reporte al recargar. Mapa actualizado/check vigente. Entorno: API 8001, frontend 5174; PostgreSQL 17.6 local 6544, ashakids_test_compat17. No ejecutar prepare/pytest sobre
esta BD si se quiere conservar demo. API habitual 8000 y frontend 5173 siguen separados.

En este corte no hubo escrituras compartidas ni datos reales copiados. Incidencia del corte 01
sigue abierta: IDs 44/45 ausentes actualmente no determinan todo el impacto anterior.

Próximo paso F3-01: Centro Familiar y Mi Camino ASHA, sustituir contadores y pasos demo por
asignaciones/sesiones/reportes reales o vacíos claros. Equipo revisa incidencia histórica,
comparte commit con versión y reproduce. Después del alcance estable, comparar hosting
para orientar decisión del usuario; no desplegar por la mera selección de proveedor.

Informe: docs/audits/auditoria-2026-10-09-02.md; PDF output/pdf/Auditoria_Compatibilidad_AshaKids_2026-10-09-02.pdf;
evidencias docs/evidence/audit-2026-10-09-02/.

## Relevo 2026-10-09-03 - F3-01

Objetivo completado en Centro Familiar/Mi Camino: IDs del paciente, contadores/hitos del
servidor, última recomendación del reporte, próximas citas válidas y selección en móvil.
Sin niños de respaldo, porcentajes/firma/recomendación inventados ni toast de reprogramación.

Rama piero-dev, HEAD 82f868f más cambios locales sin commit/push. Fuente: FamilyTrackingPanel,
useFamilyTracking, familyTracking, dos entradas de pantalla, 12 casos en family-tracking.test.
ADR 0004 registra decisión nueva; arquitectura conserva React/HTTP/FastAPI/PostgreSQL.
Fragmentos antiguos de demo quedan sin importar desde las entradas actuales.

Verificado: 165 componentes, 25 rutas, tipos/check/build; navegador1366/390 px, dos hijos
homónimos, recarga desktop/móvil, familia vacía tras cambio de identidad, tratamiento,
reporte y navegación a agenda. Datos SQL reales sintéticos en PG 17.6 local 6544; script
phase3_tracking_fixture añadió hermano/cita futura sin reset, 7 respuestas verificadas.
El reporte con marcador02 se reutiliza, no se creó otra sesión/reporte.

Errores corregidos: arranque EPERM de Node/esbuild en sandbox; ejecución autorizada pasa.
Typecheck encontró dos opciones exact inválidas del test; regex y nueva ejecución correctos.
Un npm inicial usó raíz incorrecta; no cuenta como prueba aprobada. Ajuste de etiqueta
Sin medición para lectura móvil. Detector conserva dos avisos de paleta heredada.

No conexiones/escrituras Supabase aquí. Incidencia histórica01 pendiente. No ejecutar
prepare/pytest en la demostración si se quiere conservar el historial; truncan datos.
Contexto/plan/índice/lista actualizados. Mapa refresh/check vigente; ver evidencia corte 03.

Próximo: revisar promesas de otras pantallas (recuperación, evaluación/consentimiento y
resto demo) y definir mínimos F5-01 con equipo. Fase3 completa aún no certificada; no
desplegar ni escoger hosting antes de estabilidad del alcance. Equipo reproduce el corte.

El usuario acordó la señal tokens bajos dejar todo listo para siguiente desarollador:
entonces cerrar/relevar, revisar e integrar dev, commit/push identificables y prompt.
Señal no recibida en este corte; no afirmar que los cambios están publicados.

Informe docs/audits/auditoria-2026-10-09-03.md; PDF output/pdf/Auditoria_Fase3_AshaKids_2026-10-09-03.pdf;
evidencia docs/evidence/audit-2026-10-09-03/.

## Relevo 2026-10-09-04 - Fase 3 y etapa Mundo ASHA

- Implementación V01_Fase3, SHA 9a6b06160c5210ec05bd3273ef516bba6989560d. Consolidó
  también correcciones locales de auditorías anteriores; no atribuir sus pruebas como nuevas.
- Cierre del alcance mínimo de coherencia: recorrido/seguimiento usan FamilyTrackingPanel;
  paneles usan OperationalDashboard; familias consultan asignaciones y reserva real;
  configuración conserva identidad/CRUD y explica funciones sin contrato.
- Registro público/correo/consentimiento/2FA/notificaciones no implementados. Se sustituyeron
  éxitos ficticios por información; no se eliminó un endpoint público operativo.
- Nuevo useSelectedFamilyPatient; aprendizaje comparte ID autorizado. learningWorlds es
  catálogo draft-1 y cálculo puro de intentos ya verificados, NO una API ni juego terminado.
  null es sin conexión; no convertir en historial vacío/0%. Revisión oral profesional.
- Mundo ASHA se trabaja fuera de las fases del núcleo: MA-01 a MA-07 en su plan propio,
  por petición explícita del usuario. 4 mundos/24 niveles propuestos; cantidades por revisar.
- 198 componentes, 25 rutas, tipos/check/build; 35 HTTP + OpenAPI con fixtures 02/03. No se
  repitió pytest/prepare ni se modificaron filas clínicas. Login/logout crean/revocan sesiones.
- Fallos iniciales: 2 props omitidas/opción exact en tests (tipos), 7 etiquetas de login,
  selector Hijos/Mis hijos (8 casos), build spawn EPERM. Corregidos/repetidos; 198/198 final.
  UI móvil: solapamiento de nombres/acciones corregido. Automatización: expectativas de
  destino tras login agotaron esperas; un intento rechazado, posterior login correcto.
  Captura escritorio temporal recortada se reemplazó tras verificar 1366x900.
- Evidencia/PDF/fuente del corte04; los históricos01/02/03 se conservan. Manifest por corte.
  Graphify actualizado: 1744 nodos/92 comunidades, extracción AST sin LLM; 12 archivos sin
  símbolos y fallback secuencial por restricciones Windows no implican error de aplicación.
- No Supabase, migraciones compartidas, credenciales reales, despliegue ni selección de host.
  Mantener revisión histórica incidente01 y reproducción de equipo pendientes.
- Instrucción posterior del usuario: commit corto con versión y descripción breve obligatorio
  por fase cerrada, dev y sincronización de la rama propia. PR permitido; señal de tokens
  solo para anticipar relevo. No se publicó una modificación nueva de pagos.
- Próxima acción: decidir mínimos F5-01; para juegos, MA-01 con revisión detenida antes de
  implementar contenido. No ejecutar pytest/prepare sobre la demo que debe conservarse.

## V52 — correo Gmail y boletín con doble confirmación / 2026-10-10

Implementación local sobre `dev` a partir de `a6eda9f` (V51). Se añadió Gmail API
server-side OAuth opcional, con alcance documentado `gmail.send`, refresh token solo en
entorno y estados de bienvenida `ENVIADO`, `PENDIENTE` y `NO_CONFIGURADO` en las cuatro
rutas de alta ADMIN. El commit se ejecuta antes del envío y el mensaje no llega a JSON,
logs ni auditoría.

La landing ahora usa un formulario real con consentimiento obligatorio, estado de carga,
errores y enlaces de confirmación/baja. La API pública crea `suscripciones_boletin`, guarda
solo hashes de tokens, no enumera correos y aplica límite básico por IP. Se preparó la
migración `009_newsletter_subscriptions.sql`, sin ejecución sobre la base compartida (el número 008 ya pertenece a la migración de juegos de dev).
Se documentaron las variables de Render en `render.yaml`, `.env.example`, ADR0021 y
`docs/operations/DEPLOY_RENDER_EMAIL.md`.

Comprobaciones nuevas: `backend/.venv` unit tests de Gmail/boletín `4 passed`, importación
OpenAPI con las tres rutas, `npm run typecheck`, `npm run check:frontend`, `npm run build`,
`compileall`, `git diff --check`, `knowledge refresh` y `knowledge check`. No se probaron
OAuth real, Gmail real, la migración ni escrituras en Supabase/Render. Pendiente: configurar
OAuth publicado, aplicar 009 en una base aislada con respaldo y validar recepción/baja con
un buzón sintético antes de activar Gmail en producción.





## Relevo V50 — juegos persistentes, 2026-10-10

- Repositorio: https://github.com/sromansilva/ashakids-platform . Rama codex/2do-intento;
  base integrada origin/dev 396efda (V49). Continuar secuencia V50, conservar commits V48/V49.
- API juegos/catalogo y pacientes/{key}/juegos[/mundo/intentos]; modelos/schemas/servicios
  juegos*, catálogo versionado y migración008. UI learningGames, MundoAshaHome,
  DemoWorldPlayer, SessionPlan, PublicMundo e Insignias/Perfil. Se elimina demoWorlds.
- BD compartida:008 adoptada, cinco medallas; respaldo pg_dump/pg_restore list verificado,
  filas previas conservadas, rol runtime/RLS comprobados. Backup/credenciales privados en tmp
  ignorado. No se ejecutaron fixtures sobre BD compartida ni se crearon pacientes reales.
- PostgreSQL17 local aislado ashakids_test_games_v50:16 pruebas backend pasaron (juegos,
  planes, agenda y modelos). Migración incremental también probada en BD local independiente.
- Frontend:281/281 componentes; typecheck/build/check:frontend correctos. Advertencia Node
  module.register deprecado. Primer pase falló por cinco mocks/expectativas del flujo anterior
  y un cierre JSX en PublicMundo; corregidos. Backend combinado inicialmente alcanzó429
  por fixtures de login repetidas; repetido con límites1000IP/100par solo en proceso de tests.
  Un valor1000para par fue rechazado por configuración antes de ejecutar; corregido a100.
- Skill Impeccable: conserva UI básica, sin nuevo diseño. Detector objetivo MundoAshaHome: [].
- Este es un cambio funcional con verificación, no una auditoría nueva ni una validación clínica.
- Publicación: registrar commit/SHA y sincronización dev/rama propia al cierre en el informe
  del chat. Render tiene despliegue manual; no equiparar push con despliegue HTTPS.
- Próximo: juegos más llamativos y revisión profesional. ML/reporte mensual no implementados;
  resultados_nivel JSON dispone de respuesta, aciertos, tiempo, ayudas y versión para análisis
  futuro. Definir etiquetas antes de afirmar eficacia de mundos o emociones.

## V51 — configuración privada de Zoom / 2026-10-10

Objetivo: guardar las seis variables proporcionadas en Render para activar Zoom automático.
Base limpia codex/2do-intento, HEAD/origin/dev/origin/codex/2do-intento iguales a
5dd572cb37a679d5e8674a0cf1910426d925a1f9 tras git fetch origin; repositorio
https://github.com/sromansilva/ashakids-platform. Guía consultada: DEPLOY_RENDER_ZOOM.md
del escritorio. Cambios externos: seis variables ZOOM_* guardadas en ashakids, sin alterar
otros valores ni crear segunda instancia. Save, rebuild, and deploy confirmó Live
dep-db5em4flot8c73emqo2g /34,6s; código V50. Readiness HTTPS 200, ready/database reachable.
Persistencia comprobada al volver a Environment; captura con secretos ocultos en
docs/evidence/zoom-render-v51/environment.jpg. Archivos: contexto, relevo y evidencia.
No cambios de fuentes, BD ni .env; sin suites nuevas o auditoría nueva. Knowledge check
vigente y diff revisado antes del cierre documental. No errores de despliegue observados.
Siguiente: aceptación humana de nueva reserva virtual (AUTOMATICA/enlace Zoom) y revisar
licencia/duración: sin overrides producción usa 45; Basic requiere ambos valores en 40.
No se verificaron OAuth ni permisos creando reuniones/citas. Cierre documental V51:
integrar/publicar en dev y sincronizar rama propia; verificar SHA final con Git.

## Relevo V52 — mensajes con adjuntos,2026-10-10

- Repositorio https://github.com/sromansilva/ashakids-platform . Base codex/2do-intento
  a6eda9f/V51, limpia; comprobar secuencia remota antes de publicar.
- Archivos: modelos/schemas/mensajeria, services/adjuntos, APIadjuntos y lista mensajes,
  main/middleware, requirements python-multipart0.0.32, migración009/esquema inicial.
  Front: cliente multipart/binario, messagingService, MessageAttachment y MessageThread.
- BDcompartida009aplicada con pg_dump privado y pg_restore--list verificados;30tablas,
 3columnas nuevas, filasprevias conservadas, runtime SELECT/INSERT/RLS y anon/authenticated
  denegados. Evidencia docs/evidence/attachments-v52/database-adoption.json. No pruebas
  que inserten archivos o pacientes compartidos. Backup y credenciales quedan tmp ignorado.
- Local PostgreSQL17:ashakids_test_attachments_v52 creada para la suite;27backend pasaron
  (2integración+25mensajería).18pruebas chatfrontend y suitecompleta283pasaron. Typecheck,
  build1903módulos6.50s y checkfrontend343archivos correctos; Node DEP0205 heredada.
- Fallos corregidos antes de las pruebas: lectura Python cp1252 de archivo UTF8; ruta con
  backend duplicado al crear test; import helper sin paquete tests. No fallos funcionales
  en las suites ejecutadas. Detector Impeccable MessageThread: [].
- Nuevos casos:archivo sintexto, tutor/profesional descargan, ajeno404/admin403, mismoUUID
  no duplica, conflicto409, bytes falsos415/vacío422/exceso413, chatarchivado409, historial
  sincontenido binario, retryUI conserva selección/UUID y tamañoUI deshabilita envío.
- Límites:10MB/unarchivo,20/hora, solo formatos indicados. Validación cabeceras, noantivirus.
  Duraciónnullable; imágenes/audio/video requieren codec navegador. Legacy sinbytes404.
- Publicar V52 en dev/rama propia al cierre, registrar SHA en informe del chat. Comprobar
  API HTTPS posterior al push; un push no prueba despliegue. No auditoría nueva ni PDF nuevo.
- Próximo:aceptación humana y decidir storageprivado para archivos más grandes; no habilitar
  bucketpúblico ni usar disco efímero para persistencia. evaluaciones_ia aún sinmodeloML.

## Relevo V54 — eliminar Terapeutas demo de ADMIN, 2026-10-10

Repositorio: https://github.com/sromansilva/ashakids-platform . Base local a6eda9f,
codex/2do-intento; remoto dev efe46a7/V53 revisado antes de integración.
Se retiran AdminTerapeutas.tsx y referencias de Sidebar, AppRouter, lazyPages,
routeManifest, routeTitles y navigation. Cuentas conserva la gestión real.
25 pruebas de rutas pasaron; typecheck y build (1902 módulos) correctos. Aviso
Node DEP0205 heredado; detector Sidebar sin hallazgos; diff sin espacios inválidos.
Cambios previos de adjuntos preservados fuera de este commit; no publicar ese trabajo
como parte de la retirada. Sin auditoría técnica nueva, PDF ni pruebas sobre BD.
Publicar cierre en dev y sincronizar codex/2do-intento; SHA efectivo consultable en Git.
Siguiente: comprobar despliegue/aceptación humana y continuar el trabajo previo de adjuntos.

## Relevo V55 — auditoría ADMIN conectada a eventos reales / 2026-10-10

La pantalla demo se sustituyó por consulta de auditoria_cambios mediante GET protegido
/admin/auditoria. La creación de cuentas ya registra INSERT transaccional; ahora ADMIN
puede verlo en pantalla. El endpoint solo proyecta actor, tabla/registro, acción y hora,
con tope100 y total. Front incluye estados carga/error/vacío. No se exponen JSON antes/nuevo
ni se cambia/elimina historial. Verificados: Python compile, 25 pruebas de rutas,
282 componentes, typecheck, build, check:frontend y Graphify check. Sin consulta a BD real ni
prueba HTTP de extremo a extremo. Mapa Graphify actualizado en modo code-only.


## V56 — crear contraseña desde correo / 2026-10-10

Repositorio: https://github.com/sromansilva/ashakids-platform . Base codex/2do-intento
64cbb3599aa5d705a345ef0fabcfc11fdf384dbd/V55, origin/dev comprobado con fetch.
Las cuatro altas ADMIN generan hash de secreto aleatorio, no DNI ni contraseña entregada.
Correo HTML/texto con código y botón Crear mi contraseña, enlace24h de un uso; página
pública /crear-contrasena con confirmación12–128caracteres y reenvío por código.
Login bloquea pendientes anteriores/nuevos; activados conservan acceso. Antigua activación
por contraseña inicial retirada (410 con sesión válida). Sin migración ni nuevos permisos.
ADR0022 explica HMAC ligado al hash privado/correo, bloqueo de usuario y revocación.

Verificado:9unitarios backend,11frontend del flujo,25rutas;284componentes del árbol de
trabajo (incluye adjuntos locales previos), tipos/checkfrontend/build1903módulos correctos.
Detector de tres componentes []. Inspección escritorio1280x720 y móvil390x844 correcta.
9integraciónSQL omitidos por falta de ASHAKIDS_TEST_DATABASE_URL; casos adaptados para
activación pública/concurrencia futura. No OAuth/Gmail real, alta/pacientes compartidos
ni concurrenciaSQL verificados. AvisoNodeDEP0205 heredado. Graphify2396nodos/code-only
actualizado; check y diff antes de cierre. Es cambio funcional, no auditoría/PDF nuevo.

Render consultado:servicioashakids,dev,V55Live, no variables GMAIL_* en inventario.
Las credenciales entregadas no se guardaron en archivos ni Git. Siete variables privadas
Render guardadas tras autorización explícita posterior; deploy iniciado sobre V55. El cambio de código
se publica en dev/rama propia; registrar SHA efectivo en el chat. Push no prueba recepción.
Primer commit falló por identidadGit ausente; reintentar con identidadCodex ya usada en
V54/V55 solo para ese comando. Cambios previos de adjuntos preservados fuera del commit; en documentos
compartidos se incorpora únicamente este apartado al índice Git.
Siguiente:verificar redeployV56/recepción del botón
y crear contraseña manualmente desde buzón de prueba. No envío masivo ni recuperación de
contraseñas ya activadas. No ampliar newsletter/BD/pagos durante esta tarea.


## V57 — configuración Gmail y despliegue del acceso / 2026-10-10

Repositorio: https://github.com/sromansilva/ashakids-platform . Código V56:
66754c57aa7a7c38c0733acde5d149b0b3d0a017, publicado y comprobado igual en HEAD,
origin/dev y origin/codex/2do-intento. Se resolvió el primer fallo de identidad Git
usando Codex <codex@users.noreply.github.com>, como V54/V55, solo para el comando.
Acceso GitHub existente suficiente; no nuevo login ni configuración global.

Con autorización explícita, siete variables proporcionadas guardadas en Environment
solo del servicio ashakids de Render: seis GMAIL_* y PUBLIC_ORIGIN. Persistencia de
los siete nombres comprobada al volver a Environment, sin revelar valores en evidencia.
No cambios de OAuth/permisos Google ni secretos guardados en archivos/repositorio.
El guardado desplegó primero V55 (Live,44.9s); tras push, V56 Auto-Deploy quedó Live:
dep-db5fq4jrjlhs73aoh0d0,38.5s, SHA66754c5. ReadinessHTTPS200 ready/database reachable;
OpenAPI200 contiene POSTcreate-password y resend-activation. Página publicada
/crear-contrasena visible con solicitud de enlace sin sesión. Evidencia saneada:
render-live.png y https-smoke.json en docs/evidence/email-activation-v56/.

Este cierre documental incorpora resultado externo, sin nuevas pruebas clínicas,
auditoría/PDF ni cambios funcionales respecto a V56. No se crearon usuarios reales ni
se enviaron correos de prueba. OAuth/envío/recepción del botón y activación real quedan
pendientes de aceptación manual con una cuenta autorizada; la configuración guardada
no demuestra entrega a un buzón. Pruebas locales de V56 mantienen su alcance/omisiones.
Cambios previos de adjuntos continúan fuera de ambos commits, preservados en este clon.
Siguiente: en alta ADMIN autorizada comprobar correo_bienvenida ENVIADO, recibir botón,
crear contraseña manualmente y entrar con código; si falla, revisar configuración Google
sin exponer secretos y reintentar enlace. No ampliar newsletter ni tocar pacientes/BD.


## V58 — cierre operativo Gmail/boletín en Render / 2026-10-10

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama dev; código desplegado
d579a40ca28038f53c78e8bffdab63123c6e6eb3 (V53_Activar_autodeploy_Render_Gmail).
Deploy manual dep-db5h1tqd0e5s73fem3bg confirmado Live,51.4s. Servicio independiente:
no existe Blueprint ASHAKids asociado para sincronizar; rama dev, Auto-Deploy On Commit
y health check /health/ready verificados en el servicio existente, sin crear otro recurso.
Ocho variables Gmail/origen guardadas y comprobadas con valores solicitados, únicamente
en Render; secretos excluidos de archivos/Git/evidencia. DATABASE_URL, DB_SSL_CA_FILE
y DB_SSL_LEGACY_CA no editadas. El nombre del remitente quedó ASHAKids.

La misma BD/rol de Render tenía public.suscripciones_boletin con 11 columnas y RLS activo,
pero runtime sin SELECT/INSERT/UPDATE ni USAGE de secuencia y sin políticas: consulta
real falló42501. No se reaplicó009 ni se ejecutaron migraciones destructivas. Respaldo
custom/public179627bytes verificado con pg_restore--list y SHA256 antes del ajuste.
Se otorgaron únicamente SELECT/INSERT/UPDATE y USAGE a ashakids_runtime y tres políticas
por operación TO ese rol; DELETE sigue denegado y RLS activo. anon/authenticated/service_role
sin acceso; filas del boletín conservadas por fingerprint antes/después. SQL operativo
reproducible y metadatos sanitizados en docs/evidence/gmail-render-v58/. No nueva decisión
de arquitectura: se mantiene el rol técnico B02 y la autorización en FastAPI.

Verificación nueva: lectura runtime LIMIT0, grants/políticas/secuencia y HTTPS tras deploy:
/health200 healthy; /health/ready200 ready/database reachable. No altas, suscripciones
ni correos de prueba creados/enviados. El usuario hará manualmente boletín, recepción,
confirmación/baja y bienvenida ADMIN; OAuth/entrega real no certificados por configuración
o readiness. No auditoría académica nueva ni PDF. Primer query Graphify usó --budget
no admitido por wrapper, corregido a query con presupuesto predeterminado1500.
Cambios locales previos de adjuntos conservados fuera de este corte. Cierre documental
publicado con [skip render] para conservar el SHA d579a40 desplegado; el salto V58 continúa
la secuencia V57 existente, sin renumerar el V53 posterior.
Siguiente: prueba manual en landing/ADMIN; si falla, distinguir NO_CONFIGURADO/PENDIENTE
y503BD de401/403Gmail. Revisar logs sanitizados sin compartir OAuth ni enlaces privados.


## V59 — incidencias y simplificación ADMIN

Repositorio: https://github.com/sromansilva/ashakids-platform . Base498df42/V58,
codex/2do-intento y origin/dev coincidentes tras fetch. Nueva tabla incidencias con
formulario compartido PADRE/TERAPEUTA: tipo, título120 y descripción600; UUID estable
contra duplicados/concurrencia y permisos derivados de sesión. Lista paginada ADMIN
y estados LEIDA/RESUELTA persistentes. Operación ahora se llama Incidencias, conserva
URL anterior y elimina sesiones/reportes ficticios. Contenido y ML: Próximamente.
Configuración informativa: React/TypeScript/Vite/Tailwind/Lucide, FastAPI/SQLAlchemy/
asyncpg/PostgreSQL, Render/Supabase, permisos, Gmail/Zoom y herramientas; sin2FA.
Auditoría sigue consultando auditoria_cambios real; aviso amarillo demo eliminado.
Se alimenta con operaciones ya instrumentadas de cuentas/pacientes, no cada clic.

ADR0023/migración010 adoptada en BD compartida con respaldo180614bytes verificado,
31tablas previas conservadas, RLS/trespolíticas, grants mínimos runtime y sin acceso
de identidades públicas. Sin usuarios/incidencias clínicas de prueba compartidos.
Evidencia saneada docs/evidence/admin-incidents-v59/verification.md y JSON de adopción.
6pruebasbackend SQL/HTTP aisladas;25rutas/287componentes del árbollocal, tipos,
check346/máximo500 y build1905correctos; DEP0205heredado. DetectorUI[]. Navegador
harnesssinbackend:escritorio1280 y formulario390, sin afirmar recorrido productivo.
Fallos iniciales de conexión/puerto y unpackfixture corregidos y registrados.
Graphifyrefresh/check al cierre. Cambio funcional, no auditoría/PDF nuevos.

Publicar cierre en dev y codex/2do-intento preservando adjuntos locales previos fuera
del commit. SHA/push efectivo consultables en Git; aceptación humana siguiente:
enviar formulario autorizado en Render y comprobar lista/lectura/resolución con ADMIN.
No ampliar pagos,ML ni gestión de contenido. No nuevas pruebas reales de Gmail/Zoom.

## V63 — filtros de citas y limpieza de sesiones ADMIN / 2026-10-11

Repositorio: https://github.com/sromansilva/ashakids-platform . Base7e958c8/V59;
rama feat/piero-dev, autor Piero2311 <pieroah26@gmail.com>. El usuario autorizó
publicar los ajustes acumulados en dev y sincronizar su rama. SHA efectivo en Git.

AdminCitas: filtros acumulativos por terapeuta (ID), modalidad, fechas desde/hasta
y estado; consulta todas las páginas con useAppointments/readAllPages. Fechas
inclusivas por inicio de cita en Lima; extremos opcionales, validación de rango,
conteo de coincidencias y Limpiar filtros. Se retiran del listado Crear cita,
reprogramar, cancelar y confirmar; Detalle y SessionActions se conservan.
AdminSesiones: retirados avisos azules e indicadores de red Sin medición, junto
con campos de calidad/latencia/incidencias sin medición del detalle. Consulta,
permisos, estados y reportes existentes conservados. Sin backend/BD modificados.

Verificación nueva local:28 pruebas (3filtros con límites Lima y25remediation),
typecheck y checkfrontend347/máximo500 correctos; detectorUI[] en ambas pantallas.
Error TS inicial por opción exact de Testing Library corregido y3pruebas repetidas
correctas. Graphify2431nodos/111comunidades y checkvigente. Build del índice Git
comprobado antes de publicar; no certifica recorrido completo ni datos productivos.
Diff/secretos/referencias revisados antes del push. No auditoría/PDF nuevos.

Adjuntos y sus cambios/documentación anteriores permanecen locales fuera del
commit. La restricción de no publicar mientras se acumulaban ajustes queda
superada por la autorización actual de cierre. Sin force-push ni rama Codex.
Siguiente: aceptar filtros en web desplegada y continuar los ajustes que el usuario
solicite. No ampliar permisos API, pagos ni funciones clínicas por este cierre.

## V65 — publicación de adjuntos del chat / 2026-10-11

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama feat/piero-dev,
base 8d2ace2; autor Piero2311 <pieroah26@gmail.com>. Publicación de la implementación
local de adjuntos autorizada en dev y sincronización de la rama propia.
Envío multipart y descarga privados, metadatos de historial, vista previa de medios,
UUID de reintento, límite 10 MB y permisos de participantes. ADR y migración009
existentes incluidos; no se vuelve a ejecutar DDL ni se escriben datos compartidos.
Evidencia attachments-v52 es heredada del 10/11 de octubre, no pruebas nuevas.
Validación nueva: 18 pruebas frontend chat, 25 backend mensajería correctas;
2 pruebas SQL omitidas sin habilitar base descartable. Tipos, checkfrontend360
y build1917 correctos. Comando inicial backend con nombre inexistente corregido;
Python global sin pytest, se utilizó backend/.venv. Advertencia DEP0205 heredada.
Graphify refresh/check local. Integrar el nuevo cambio de correos origin/dev9184689
antes de publicar; SHA/push efectivos consultables en Git. Sin nueva auditoría/PDF.
Siguiente: aceptación de envío/descarga en web desplegada por participantes autorizados;
no afirmar despliegue por el push ni volver a aplicar una migración ya adoptada.

## V67 — relevo del rediseño de administrador

Objetivo: aplicar presentación ASHAKids al administrador exclusivamente. Rama
codex/landing-publica; base fb471a3/V62. Frontend: admin.css, OperationalDashboard
(adición decorativa sólo admin), clases en AdminOperacion/AdminConfig/AdminAuditoria/
AdminContenido/AdminML. Documentación DESIGN.md/contexto y evidencia admin-visual-v67.
Tipos/check/build correctos (358 archivos/1916 módulos); npm test 25 rutas y 288
componentes correctos. Chrome fixture con todas las peticiones interceptadas:
12 rutas, modal alta sin enviar, incidencia expandida/error, destino de acción,
escritorio 1536, dashboard 1024/390, Nunito/recursos/reduced-motion y terapeuta
sin clase admin. Evidencia sintética, no DB ni login real. Primer fallo del fixture
por formato paginado corregido, ejecución final correcta. Capturas inspeccionadas.
Graphify refresh/check y diff/secretos al cierre. Commit local V67; no push en esta
fase. SHA definitivo consultable en git log, no confundir base con commit final.
Fetch detectó origin/dev 61e6a39 con V63–V66 y correos; no mezclar sus cambios backend
con este corte exclusivamente visual. Próximo paso: revisión visual del usuario,
integrar dev preservando .gitignore local y repetir verificaciones antes de publicar.
No afirmar sincronización con dev ni despliegue remoto. Sin nuevos recursos pendientes
para la cabecera: Ashi aprobado reutilizado; responsive completo queda diferido.

## V68 — relevo de integración del administrador

Rama codex/landing-publica. Padres de integración: V67 5312b27 y dev 61e6a39.
Publicación autorizada por el usuario. Conflictos de contexto y progreso resueltos
conservando ambos trabajos; no conflictos de código. Cambios administrativos V67
conservados junto a citas/sesiones/adjuntos/correos del equipo. Backend sin ajustes
propios, sin DDL ni datos reales. Evidencia docs/evidence/integration-v68.
Nueva validación: 25 rutas,293 componentes/21 archivos, tipos, check360, build1917,
9 pruebas unitarias de correo, Chrome12 rutas admin/acciones/modal sin enviar,
incidencia expandida/error, 1536/1024/390, recursos/Nunito/reduced-motion y aislamiento
terapeuta correctos. API sintética, no sesión/BD reales. Sin auditoría académica nueva.
Graphify refresh/check y revisión de diff/secretos antes de commit/push. Merge V68
publicado en dev/codex/landing-publica sin reescribir commits; verificar SHA efectivo
con git log/ls-remote. .gitignore previo del usuario preservado sin versionarlo.
Siguiente: aceptación visual real del administrador; no afirmar despliegue por push.
## V75 - Espaciado y foco de campos ADMIN / 2026-10-11

Corrección CSS de inputs, selects y textareas de ADMIN: contorno de teclado interior para evitar invadir etiquetas. El modal de alta separa filas contiguas 16 px, presenta los controles como bloques y limita su ancho. Comprobación local del DNI enfocado: separación de 15.996 px respecto a la etiqueta de apellidos. Build Vite aprobado antes de sincronizar; sin altas reales ni cambios en BD. Trabajo previo del formulario conservado fuera de este commit. Base remota V74 integrada por rebase sin conflictos. No se acredita despliegue de Render.

## V75 - Guía glassmorphism del sistema visual / 2026-10-11

Se amplía `docs/design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md` a versión 1.1. Formaliza el alcance de `asha-glass`, tokens de opacidad/borde/desenfoque, contraste, superficies apropiadas, exclusiones para contenido clínico/formularios, fallback sólido, comportamiento móvil y movimiento reducido. Aclara que la landing ya usa glass selectivamente y que el kit completo no está adoptado globalmente. Cambio documental; no modifica UI de producción ni afirma verificación visual nueva. Commit local `8bf96b1`; publicación se completará con la integración concurrente de dev.
## V115 — exploración táctil del Taller de los Sonidos / 2026-10-21

Objetivo: hacer que «Descubrir sonidos» se sienta más exploratorio y dinámico. Rama
`dev`, base V114 `979574eb056fd42be848ce5acbb289439c3d6207` (Portal de Familia), detectada al
revisar origin/dev antes del cierre. Repositorio: https://github.com/sromansilva/ashakids-platform .

`SoundActivities.tsx` permite mover las cuatro tarjetas de animales hasta 44 px en
horizontal y 30 px en vertical con puntero/tacto, manteniendo su toque para escuchar.
`sound-ui.css` suma flotación, destello de orientación y decoración; el movimiento queda
desactivado por la regla existente `prefers-reduced-motion`. Contexto del proyecto
actualizado. Sin cambios backend/API/BD/permisos/dependencias.

Comprobaciones locales: typecheck PASS; `check:frontend` 432 archivos PASS; build Vite
1968 módulos PASS; Graphify refresh/check PASS (2945 nodos, 129 comunidades).
No se hizo recorrido visual en navegador ni prueba de gestos real en dispositivo.
`.gitignore` ya estaba modificado y permanece fuera de este cambio.

Cierre: revisión de diff y secretos completada. Commit `V115_Explorar_Taller_Sonidos`
rebasado sobre V114 y publicado por fast-forward en `dev`; sincronización confirmada.

## V116 — sincronización de exploración del Taller de los Sonidos / 2026-10-21

Cierre documental de V115, sin cambios funcionales ni pruebas nuevas. Commit V115_Explorar_Taller_Sonidos quedó publicado en rama dev, SHA 78a6c65e1c4ed87bb6f104d0a3d9115c0df7e62b; HEAD, origin/dev y git ls-remote origin refs/heads/dev coincidieron tras el push. Base de integración V114 Portal de Familia 979574eb056fd42be848ce5acbb289439c3d6207. El cambio local previo de .gitignore permanece sin publicar. No se verificó despliegue web ni gestos en dispositivo.
## V117 — enseñar a jugar y sumar movimiento a Sonidos / 2026-10-21

Objetivo: hacer más claras las instrucciones de voz, incorporar un tutorial visual
interactivo y dar más movimiento a las partidas. Rama `dev`, base V116
`f34db04ff58bebb32dcc0f4022c4a454efc62863`. Repositorio:
https://github.com/sromansilva/ashakids-platform . Commit publicado:
`V117_Ensenar_Jugar_Sonidos` (`56c4308f02e7e93a7176ef992f55999234411be6`).

Nuevo `SoundTutorial.tsx`: pasos específicos para cada juego, selector de pasos,
ejemplo tocable del sonido del pollito. Al abrir un juego, ASHA lee el objetivo y sus
pasos; también puede repetirse desde el tutorial o durante la partida. La narración
estática existente ya contiene las instrucciones completas de los nueve juegos. La ficha
de parejas se puede arrastrar en pantalla táctil tras escucharla; los toques siguen disponibles.
Animación de onda al escuchar y saltito al acertar en componentes compartidos.
Sin cambios backend/API/BD/permisos, dependencias o persistencia de intentos.

Verificación: pruebas focalizadas de Sonidos 30/30 PASS; typecheck PASS; `check:frontend`
435 archivos PASS; build Vite 1971 módulos PASS. Se guardó la clase por rol en una
constante antes del estrechamiento en `DashLayout.tsx`, resolviendo el error TS de V114
sin cambiar la interfaz. Graphify refresh/check PASS (2955 nodos, 137 comunidades).
No hubo prueba en dispositivo.
`.gitignore` previo permanece fuera de esta fase.

## V118 — publicación del tutorial interactivo de Sonidos / 2026-10-21

Cierre documental de V117, sin cambios funcionales ni pruebas nuevas. Rama dev: el commit 56c4308f02e7e93a7176ef992f55999234411be6 fue publicado por fast-forward. Después del push, HEAD, origin/dev y git ls-remote origin refs/heads/dev coincidieron. Build, typecheck, check:frontend (435 archivos), 30 pruebas focalizadas de Sonidos y Graphify refresh/check se ejecutaron antes de publicar. No se verificó el despliegue público ni un dispositivo táctil real. El .gitignore local previo sigue sin publicarse.

## V119 — escenas de práctica propias para los juegos de Sonidos / 2026-10-21

Objetivo: que los once juegos se expliquen con una pequeña acción y un escenario visual
del mismo tipo de actividad. Rama `dev`, base V118
`982cae09d644e9440e22603b8fc52944507a2afa`. Repositorio:
https://github.com/sromansilva/ashakids-platform . Cambios: nuevo
`SoundTutorialScene.tsx`; conexión del ID del juego desde `SoundWorld.tsx` y reemplazo
del ejemplo genérico del pollito en `SoundTutorial.tsx`; escenas y estados táctiles
estilizados en `sound-ui.css`; pruebas para los once tutoriales y acciones de parejas,
tren y memoria en `frontend/tests/sound-games.test.tsx`.

Las escenas reutilizan los audios e ilustraciones existentes: tocar animales para
explorar; oír una pista y elegir; oír una ficha y unirla; escuchar dos sonidos y
compararlos; escuchar varias veces y contar; voltear fichas hasta completar dos parejas;
escuchar y elegir quién no sonó; escuchar una fila y elegir primero/último; y escuchar
un coro para encontrar el sonido distinto. La actividad del tren muestra locomotora y
tres vagones, permite escuchar la secuencia y coloca los animales en el orden elegido.
La voz de ASHA conserva las instrucciones específicas ya existentes. Sin cambios de
backend/API/BD/permisos/dependencias ni intentos persistentes.

Verificación final: `npm run typecheck` PASS; `npm run check:frontend` PASS (436
archivos, máximo 495 líneas); `npx vitest run tests/sound-games.test.tsx
tests/sound-challenges.test.tsx` PASS (42/42); `npm run build` PASS (1972 módulos);
Graphify refresh/check PASS (2972 nodos, 127 comunidades) con
`.venv-graphify/Scripts/python.exe`. El Python global no satisface la versión requerida.
La inspección visual en navegador quedó pendiente: la ayuda `with_server.py` no inició
Vite desde la raíz de PowerShell y Python Playwright no está instalado; el navegador
integrado bloqueó el localhost. Sin captura de navegador ni dispositivo táctil real.
Revisión de diff, secretos, historial y referencias remotas: limpia; `git diff --check`
PASS. V119 `V119_Tutoriales_Interactivos_Sonidos`, commit
`d58e188229338c703ee25bfea6f3b764454d1394`, publicado por fast-forward en `dev`; después
del push, `HEAD`, `origin/dev` y GitHub `refs/heads/dev` coincidieron. El cambio previo
de `.gitignore` (`*.crt`, `*.pem`) sigue local y no se incluyó.

## V120 — relevo documental de escenas para Sonidos / 2026-10-21

Actualización de contexto y progreso para cerrar V119; sin código funcional ni pruebas
nuevas. V119 ya está publicado en `dev` con SHA
`d58e188229338c703ee25bfea6f3b764454d1394`. La inspección visual automatizada y en
dispositivo no se completó por las limitaciones descritas en V119; no se afirma que la
web pública ya muestre este cambio. Próximo paso: revisar apariencia, secuencias de voz
y zonas táctiles en un navegador y dispositivo familiar después de la publicación.
## V121 — demostraciones animadas propias para cada juego / 2026-10-21

Objetivo: que el tutorial de cada juego se distinga y muestre visualmente cómo se juega
sin exigir que el niño tenga que descubrir todo a base de clics. Rama `dev`, base V120
`4d3565a660179e144ab8a720ef1763c4fe9f2e4c`. Repositorio:
https://github.com/sromansilva/ashakids-platform .

`SoundTutorial.tsx` ahora titula el ejemplo con el nombre de la actividad y reinicia el
paso de voz/tutorial al cambiar de juego. `SoundTutorialScene.tsx` ofrece una secuencia
automática de tres mensajes visuales para cada uno de los once tipos; CSS mueve el foco
por los controles específicos de cada mecánica. En parejas, un hilo punteado dibuja la
unión; en el tren se recorre locomotora/vagones; memoria guía la comparación entre cartas;
contar, comparar, ausente, posición e intruso señalan su acción propia. La demostración
no activa audio sola; el niño sigue pudiendo tocar. Se respeta `prefers-reduced-motion`.
Sin cambios backend/API/BD/permisos/dependencias.

Comprobaciones ejecutadas: `npm run typecheck` PASS; `npm run build` PASS, 1972 módulos;
Graphify refresh/check PASS, mapa local de código 2973 nodos/139 comunidades;
`git diff --check` PASS. Commit V121
`98b82b6a78b90752118746ee2281bc8904dbfa1c` se publicó por fast-forward en dev.
No se ejecutaron pruebas de componentes ni revisión visual en navegador/dispositivo.
La comprobación Render quedó registrada por separado en V122. `.gitignore` mantiene su
modificación local preexistente `*.crt`/`*.pem` fuera de esta fase.

## V123 — crear minijuegos para Ritmo de las Palabras / 2026-10-21

Objetivo: que FLUIDEZ tenga juegos explorables con escenas e instrucciones propias.
Rama `dev`, base V122 `7a174ff270897fa18fb473de08f3a3462bb2a020`. Repositorio:
https://github.com/sromansilva/ashakids-platform . `DemoWorldPlayer.tsx` conecta el
mundo asignado `FLUIDEZ` con `FluencyWorld.tsx`; el acceso «Abrir niveles asignados con
progreso guardado» retorna al flujo previo. Catálogo editorial en
`fluencyContent.ts` y selección por edad en `fluencySelection.ts`; escenas de práctica
en `FluencyActivityScene.tsx`, demostraciones/tutorial en `FluencyGameDemo.tsx` y
`FluencyWorld.tsx`, estilos en `fluency-world.css`. La actividad Orejas que esperan
incluye escuchar una escena y elegir la imagen mencionada; el tren practica la secuencia
escuchar, esperar y responder. Las demás mecánicas usan palmadas, pausas, burbujas,
camino, cuento, puente y ronda de turnos. Las instrucciones Camila están en 89 MP3
estáticos, con textos y hashes en `docs/evidence/fluency-v1/clips.json`.

No usan micrófono, temporizador, puntuación, evaluación clínica ni intentos persistentes;
el contador de visita sólo vive durante la sesión. No se cambió API/backend/BD, roles,
dependencias o progreso guardado. Typecheck PASS; build Vite PASS (1980 módulos);
Graphify refresh/check PASS (3009 nodos); `git diff --check` PASS. No se ejecutaron
pruebas ni se inspeccionó navegador/dispositivo. Publicación en `dev` y verificación
pública de Render pendientes al registrar este relevo. `.gitignore` conservó cambio
local preexistente de `*.crt` y `*.pem`, fuera del commit.

## V122 — confirmar tutorial V121 en Render / 2026-10-21

Repositorio https://github.com/sromansilva/ashakids-platform, rama `dev`, código
V121 `98b82b6a78b90752118746ee2281bc8904dbfa1c`. A las 11:32 America/Lima, URL pública
`https://ashakids.onrender.com` dio health HTTP 200; JS y CSS de entrada y de Mundo ASHA
respondieron 200 y coincidieron por SHA-256 exacto con `frontend/dist`. Evidencia:
`docs/evidence/sounds-v121/render-live.json`. Es una comprobación de recursos estáticos,
no una lectura del SHA interno de Render ni un recorrido UI/audio/dispositivo. Sin
pruebas adicionales. `.gitignore` local preexistente sigue sin incluirse.

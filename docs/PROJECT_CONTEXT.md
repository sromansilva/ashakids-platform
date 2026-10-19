## V107 — publicación de la voz verificada / 2026-10-19

V106/3686f64330f5a0bd79cc0234d835cdcd0af26f21 publicado en dev y sincronizado.
Render https://ashakids.onrender.com comprobado19deoctubre08:56America/Lima:
health200, manifiesto230audios equivalente, chunk de juego y tres MP3 con hashes
exactos. Evidencia nueva [render-live.json](evidence/voice-v106/render-live.json).
Es comprobación de contenido público, no consulta del SHA de la API de Render.
Verificador ajustado para comparar JSON canónico entre CRLFWindows/LFLinux;
binarios/JS siguen comparándose porSHA256. Sin cambios de aplicación ni pruebas
funcionales nuevas respecto a V106. Repositorio:
https://github.com/sromansilva/ashakids-platform . Cierre V107_Verificar_Despliegue_Palabras
en dev, base3686f64. .gitignore previo conservado fuera del commit.
Siguiente: aceptación auditiva del usuario en «Escuchar voz de ASHA»; catálogo
sigue11/selección8, objetivo30por mundo pendiente.

## V106 — narración natural en Palabras / 2026-10-19

La Isla usa230 MP3 naturales con narradora sintética en español de Perú, Camila,
velocidad-8%/volumen-8%,sin subir artificialmente el tono. Palabras, instrucciones,
pistas e historias mantienen voz consistente sin depender de voces del dispositivo.
Muestra «Escuchar voz de ASHA» en menú, reproducción cancelable y aviso recuperable
si falla un recurso. Generación editorial previa de texto público: ningún servicio
TTS externo recibe texto durante el juego. Otros mundos/micrófono sin cambios.
Catálogo sigue11juegos con8iniciales por edad; treinta por mundo sigue pendiente.

Rama dev, base823d544a1b43c6bb572bad4f218c9175bf8c556a/V105, cierre
V106_Suavizar_Narracion_Palabras. Repositorio:
https://github.com/sromansilva/ashakids-platform . [ADR0027](decisions/0027-narracion-estatica-palabras.md),
[evidencia nueva](evidence/voice-v106/verification.md):389componentes/25rutas PASS,
tipos/estructura420;230MP3 reales decodificados en Chrome,3layouts sin overflow,
cero síntesis del sistema/escrituras API/errores JS. Graphify2907nodos/137comunidades
actual. Audios5,554,512bytes con hashes/créditos. Herramientaedge-tts sólo autoría,
sin dependencias runtime ni BD nuevas. Muestra móvil inspeccionada.

Siguiente: escuchar/aceptar timbre con usuario y comprobar hashes estáticos en Render
tras publicación automática de dev. El verificador de publicación no usa cuentas ni
datos clínicos. .gitignore local previo fuera del commit. No declarar completos los
treinta juegos ni eficacia/precisión fonética por pruebas de reproducción.

## V105 — ocho juegos por edad y micrófono en Palabras / 2026-10-19

Primera entrega del catálogo amplio solicitado: once juegos en LENGUAJE, ocho en
el menú según fecha de nacimiento (4–5/6–7/8+), catálogo familiar y modos de ayuda.
Franjas editoriales orientativas pendientes de aceptación profesional. Nombra el
dibujo añade tres rondas con grabación/reproducción, reconocimiento textual y
alternativa de imágenes. No mide pronunciación. Cambio de niño/salida apaga captura,
cancela petición y limpia visita. Sin BD, permisos, endpoints ni dependencias nuevas
declaradas. Se conserva práctica transitoria sin XP/medallas y basica-1 histórico.
[ADR0026](decisions/0026-seleccion-palabras-edad-y-voz-transitoria.md).

Rama dev, base 0aa0360d556981a72ce494ebc0856db7e958798c/V104; cierre
V105_Personalizar_Palabras_Edad_Microfono. Repositorio:
https://github.com/sromansilva/ashakids-platform . Evidencia nueva en
[words-v105](evidence/words-v105/verification.md):383componentes/25rutas, tipos,
estructura416 y build aprobados;16casos backend sin BD (inferencia real sobre tono),
7recorridos Chrome/13layouts sin errores JS/escrituras persistentes. ASR instalado
en .venv y modelo base cargado localmente. Graphify2897nodos/126comunidades actual.
Avisos de strip-types,22archivos sin símbolos y caché HF sin symlinks; límites en evidencia.

Siguiente: aceptación de bandas/contenido y voz humana en dispositivos familiares;
ampliar gradualmente hacia treinta por mundo. No se declara completo ese objetivo,
personalización profesional persistente ni reconocimiento remoto. .gitignore previo
fuera del commit. Publicación dev y SHA remoto se comprueban al cerrar esta entrega.

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

## V101 — diez juegos en La Isla de las Palabras / cierre 2026-10-18

Trabajo en `dev`, base 7bb67e130251113a9eb81055353ed4c8c44cfdcc/V100. LENGUAJE abre
diez juegos: vocabulario, memoria, clasificación, historia, opuestos, sílabas,
cantidades, posiciones, rimas y frases.24 ilustraciones ImageGen nuevas, optimizadas
a WebP transparente (376 KB total), hero/isla del inicio y tarjetas coloridas con volumen.
Menú libre, repetición, voz opcional del navegador, teclado, toque/arrastre y móvil.

Práctica de la visita sin XP/medallas, coherente con ADR0025. Las actividades previas
con progreso se conservan en «Para la familia» y se prueban con su contrato anterior.
Permisos/asignaciones intactos, sin backend/BD nueva ni dependencias. Evidencia nueva:
[words-v101](evidence/words-v101/verification.md), con diez juegos completados en Chrome,
44 layouts y 0 errores JS/escriturasAPI. Resultados finales de tests/build/mapa en sus logs.

Commit V101_Implementar_Juegos_Palabras destinado a dev; comprobar refs/SHA y Render
al cierre. `.gitignore` local anterior excluido. Repositorio:
https://github.com/sromansilva/ashakids-platform . Siguiente: aceptación de contenido,
apariencia y voz en dispositivos del usuario; persistencia nueva sigue diferida.


Implementación y evidencia inicial obtenidas el 16 de octubre. Revalidación y cierre
el 18 de octubre, con alcance confirmado únicamente en los diez juegos de la Isla.
Revalidación aprobada: 347 componentes, 25 rutas, tipos, estructura 410 archivos,
build 1952 módulos y diez recorridos/44 layouts en Chrome. Graphify actualizado: 2843
nodos y 144 comunidades; aviso de 22 archivos sin símbolos. Sin pruebas BD reales.

## V100 — acabado de juguete en juegos de sonidos / 2026-10-16

Rama de trabajo confirmada `dev`, base `e54c48084085c9a58e0324d3bf1deb3378bb5837`.
El usuario pide mantener la estructura de ASHA con SVG más creativos y volumen.
Cuatro animales refinados con gradientes, reflejos y sombras; escena garden.svg
original, marcos de juguete, teclas con relieve y pulsación hundida. Menú, tres
mecánicas, audio y límite de práctica sin XP conservados. No cambia la arquitectura.
Referencia orienta el acabado, sin reutilizar recursos del producto mostrado.

Verificación y capturas nuevas: [sounds-v100](evidence/sounds-v100/verification.md).
Entrega por commit `V100_Redisenar_Juegos_Sonidos` en dev, con comprobación de
publicación/Render al cierre. `.gitignore` previo permanece fuera del commit.
Repositorio: https://github.com/sromansilva/ashakids-platform . Siguiente: aceptación
visual del usuario; la persistencia nueva sigue diferida según ADR0025.

## V99 — juegos de sonidos en Mundo ASHA / 2026-10-16

Rama `amparitomaxi`, sincronizada antes de implementar con `origin/dev`
`f93f88957e2cf4d342f5004ce0489484783d96af`. HABLA/Taller de los Sonidos abre tres
juegos: Toca y descubre (cuatro animales), ¿Quién está sonando? (cinco rondas) y
Cada sonido en su lugar (dos y luego tres parejas). Ilustraciones SVG originales,
grabaciones reales MP3 locales con licencias/créditos, controles grandes, teclado,
toque/arrastre, errores recuperables y movimiento reducido. No hay música ni voz sintética.

Práctica en memoria de esta visita, sin enviar intentos ni otorgar XP/medallas. Las
actividades anteriores `basica-1` siguen accesibles desde «Para la familia» y conservan
su contrato/progreso. Acceso familiar y asignación siguen en API. Sin cambios de BD,
migraciones, cuentas reales ni módulos de otros mundos. [ADR0025](decisions/0025-practica-sonidos-sin-reinterpretar-intentos.md).

Verificación final tras incorporar dev V98: 335 pruebas de componentes/30 archivos y
25 rutas aprobados; tipos/check402/build1945 y Graphify2779nodos/127comunidades registrados
en [evidencia](evidence/sounds-v97/verification.md). Chrome real con API sintética:
seis recorridos, diez comprobaciones de layout (320/390/768/1366 y juego), cuatro MP3
decodificados/reproducidos, sin errores JS ni escrituras API. No certifica audio oído
por una persona, progreso clínico ni pantallas ajenas. No faltan recursos de animales.

Integración concurrente de dev `4cdd97bdf7b9bb4f65584de34ae0f1e8ec0b2230`: código
combinado automáticamente y entradas de V98/V99 conservadas al resolver los dos
conflictos documentales. Commit de cierre `V99_Implementar_Juegos_Sonidos`; comprobar SHA y referencias remotas
en Git antes de asumir publicación. `.gitignore` local previo queda fuera del commit.
Repositorio: https://github.com/sromansilva/ashakids-platform . Siguiente: aceptación
visual/escucha con el usuario; si se desea guardar esta práctica, definir catálogo
versionado y validación de servidor sin reinterpretar resultados históricos.

## V98 — Reconocimiento de voz local con Whisper en El Estudio de la Voz / 2026-10-16

Implementación del módulo lúdico «El Estudio de la Voz» (`VOZ`) con reconocimiento automático de voz (ASR) local mediante `faster-whisper` (modelo "base", ejecución en CPU con cuantización int8, no bloqueante vía thread pool). Validación estricta de formato por magic bytes (WebM, WAV, OGG, MP3), límite de 30s / 5MB y limpieza de archivos temporales. Comparador sintáctico normalizado (SequenceMatcher, umbral 70%) para calificar pronunciación y otorgar experiencia/medallas sin evaluación clínica.

Componente frontend `VoiceSpeechGame.tsx` con grabación en navegador vía `MediaRecorder`, manejo de estados (grabando, procesando, éxito, reintento) e integración transparente en `DemoWorldPlayer.tsx`. Tests unitarios de backend y frontend verificados.

## V96 — guardado de los cinco juegos / 2026-10-11

Corregido el HTTP503 al completar un mundo: resultados_nivel admite INSERT pero no UPDATE para runtime. El premio final del nivel más la medalla se calcula antes de insertar el intento; conserva transacción, UUID idempotente y bloqueo por paciente, sin ampliar permisos ni cambiar esquema/datos compartidos. Actividades básicas de simulación, sin medición clínica.

Validación nueva:8 pruebas API/SQL en PostgreSQL17.6 aislado con rol restringido,16 de frontend con API simulada,15 niveles en Chrome con React/API/SQL reales locales. Recarga y SELECT independiente confirman15 intentos,2000XP,nivel11 y5 medallas. Compartida:TLS,READ ONLY,8 lecturas/catálogo5medallas; no usuarios/sesiones auth/escrituras compartidas. Aviso cicloFK del comparador; diferencia ajena de adjuntos integer/bigint. Audio audible/carga/móvil/despliegue remoto no certificados. [Auditoría2026-10-11-02](audits/auditoria-2026-10-11-02.md) y [PDF](../output/pdf/Auditoria_Juegos_BD_ASHAKids_2026-10-11_02.pdf).

Inicio6558a0776dd41302d3435819f3644fa9f1ff33f8/V93; integrado por fast-forward el V94 del equipo7b647aa3f0ca1c5a106edc537ac466411ec1c84c sin conflictos. Cierre V96_Corregir_Guardado_Juegos en feat/piero-dev, publicar también dev y verificar SHA/CI. Servidor local8000 tiene --reload; no se interrumpió. Siguiente: aceptar reintento HABLA3 en sesión familiar autorizada con backend actualizado; sin migración ni permisos nuevos. Repositorio:https://github.com/sromansilva/ashakids-platform .

También se incorporó V95 de cabeceras del equipo,32df0e8b8459e8a5f78f1d7f311a029e4f58756e, por fast-forward sin conflictos; es la base final de V96. Se repitieron8 pruebas API/SQL después de esa integración, sin repetir navegador ni build de frontend.

## V93 — formulario guiado de reportes / 2026-10-11

Observaciones iniciales, objetivos trabajados y próximos pasos incorporan plantillas editables mediante `Usar plantilla` en campos vacíos. Nombre del paciente tomado de la sesión; hallazgos, evaluación/actividad, objetivos, recursos y mundo requieren completar los datos de la atención. No se insertan ni guardan notas automáticamente. El formulario bloquea el envío si quedan marcadores de la plantilla, anuncia los campos pendientes y enfoca el primero.

Nivel de ayuda usa cinco opciones descriptivas de intensidad, con radios nativos y explicación: Sin ayuda, Ayuda mínima, Ayuda moderada, Ayuda alta y Ayuda total. No selección automática; texto histórico conservado hasta elegir una opción. Es una clasificación descriptiva de la UI, no una escala clínica validada. Mismo editor en Reportes y acciones de sesión/admin; guarda los cuatro campos HTTP existentes. Describir un mundo no asigna acceso: se conserva el plan profesional existente. Sin cambios de arquitectura, BD o generación PDF.

Inicio `92a5ece`/V92 en `feat/piero-dev`, base de cierre `b1f2e2e` tras incorporar por fast-forward el commit de QA del equipo, conservado sin renumerar. Cierre `V93_Guiar_Formulario_Reportes`. Validación y límites en IMPLEMENTATION_PROGRESS.md; revisión visual aislada1274/375px y teclado con datos ficticios. Sin sesión clínica real ni despliegue remoto certificado. Repositorio: https://github.com/sromansilva/ashakids-platform . V92 publicado en dev/feat/piero-dev, ambas referencias verificadas en `92a5ecebe2486c4d9e2406d79d3c04ad1fc61ded`; CI Knowledge map aprobado en ambas ramas. Es evidencia del cierre anterior, no pruebas nuevas de V93.

## V92 — ubicación automática en reservas / 2026-10-11

El formulario familiar de reserva/reprogramación elimina la localización editable. Presencial muestra y envía `Jr. Ricardo Treneman 252, Chorrillos 15064`; Virtual muestra y envía `La reunión será mediante Zoom.`. El dato se deriva de la modalidad, cambia inmediatamente y se conserva en el resumen y en el contrato HTTP existente `localizacion`. No cambia la creación del enlace Zoom ni modifica reservas históricas o la BD directamente.

Base `f34dfee`/V91, rama `feat/piero-dev`; cierre identificado por `V92_Autocompletar_Ubicacion_Reservas`, destinado a `dev` y `feat/piero-dev`. Verificación nueva:42 pruebas en family-center/integration-ui, typecheck, check:frontend385, build1935, detector[] y revisión visual aislada1274/375px con datos ficticios, ambas modalidades sin overflow horizontal. Aviso Node DEP0205 existente. Sin reserva real ni comprobación operativa del proveedor Zoom o despliegue remoto. Detalles y siguiente acción en IMPLEMENTATION_PROGRESS.md. Repositorio: https://github.com/sromansilva/ashakids-platform .

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

## Corte V88 — Centro Familiar, administración y login / 2026-10-11

Publicado `15ed694f57dacacfa397ef408f7969b759cb6926` (`V88_Mejorar_Centro_Familiar_Admin_Login`) sobre base `bf868da`/V87. Push atómico y referencias remotas iguales en `dev` y `feat/piero-dev`; CI Knowledge map aprobado en ambas ramas. Repositorio: https://github.com/sromansilva/ashakids-platform . Los apartados pendientes inferiores conservan el historial previo. El cierre documental V89 registra los resultados de publicación; no añade cambios funcionales ni nuevas pruebas.

Centro Familiar adopta la propuesta infantil de dos destinos y un área Para mi familia: conserva selección por paciente, mundos asignados, jugador y guardado existente; reservas intro/terapia, actualización de seguimiento, planes, sesiones, reportes y navegación adulta siguen disponibles. Administración y login incluyen los ajustes documentados abajo: glass, herramientas con logos, auditoría agrupada con filtros, pacientes con campos respaldados, selectores, edad derivada y perfil profesional. Mensajes retira una indicación de presencia sin respaldo del servidor. Contratos HTTP, permisos y almacenamiento existentes conservados; sin cambios de arquitectura ni BD.

Evidencia nueva: 319 pruebas de componentes/27 archivos y 25 de rutas aprobadas, incluida reserva introductoria y terapia desde el panel familiar con paciente/plan correctos y actualización de lecturas. Typecheck, check:frontend385, build1935 módulos, diff y Graphify aprobados tras el último ajuste. Visual QA anterior aislada con datos ficticios en escritorio/móvil. La validación utiliza API simulada, no sesiones o escrituras reales; no acredita funcionamiento operacional al 100%. RENIEC permanece visual y bloqueado; proveedores externos dependen de su configuración. Detalles del cierre, comandos y límites en IMPLEMENTATION_PROGRESS.md.

## Ajuste local pendiente — Centro Familiar infantil / 2026-10-11

Rama `feat/piero-dev`, base `bf868da` (V87). Implementada la propuesta elegida de dos destinos ilustrados, Mi mundo y Mi camino, sin sidebar en /padre y su alias dashboard. Para mi familia abre seguimiento y herramientas adultas. Las secciones se seleccionan con `section=world|journey|family`; un mundo seleccionado añade `world`. Cambiar de perfil conserva el ID real y retira el mundo anterior. Glass breve consistente con landing/login; lectura clínica sólida, móvil opaco y movimiento reducido.

Mi mundo utiliza mundos asignados, niveles y guardado de learningGames existentes. Mi camino resume tres momentos derivados de los hitos registrados, sin métricas clínicas ni reportes visibles para el niño. El área familiar reutiliza FamilyTrackingPanel embebido con reservas, planes, sesiones y reportes, y accesos a agenda, mensajes, terapeutas, configuración, ayuda e incidencias. Las rutas adultas existentes conservan su navegación habitual. No cambios de API, autenticación, esquema o datos reales.

Verificación: 57 pruebas en cuatro archivos PASS (cinco nuevas de Centro Familiar, seguimiento, juegos y coherencia); se actualizan expectativas obsoletas de rutas antiguas para comprobar planes en su pestaña. Revisión visual con fixture temporal aislado y datos sintéticos: escritorio, 375 px, mundos/niveles, camino, área familiar y cambio de perfil; imágenes cargadas y sin desbordamiento horizontal en móvil. Fixture retirado, capturas ignoradas en tmp/family-center-*.jpg. No se ha comprobado el flujo completo con sesión real ni guardado contra BD. Assets nuevos transparentes con derivados WebP 320/640. Sin commit/push por petición de terminar observaciones; el nombre v88 de los assets no identifica una versión publicada.

Comprobaciones finales: typecheck, check:frontend (385 archivos), build (1935 módulos), detector de los cuatro archivos nuevos [] y diff--check PASS. Graphify refresh/check actual. Build conserva aviso DEP0205 module.register existente. Estas verificaciones no acreditan cobertura visual de todas las rutas ni despliegue.

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

## V72 - Panel terapeuta y valoraciones persistentes / 2026-10-11

V72 publicado y verificado en dev/feat/piero-dev: `738028ce2408403fb2a27ae4b0459ed1c8995a81`; dev local sincronizado, V70/V71 conservados. Cierre documental V73 registra resultado. CI no confirmado (sin contexts/ejecuciones disponibles) y Render todavía sin rutas de valoraciones en OpenAPI al comprobar: despliegue pendiente de confirmar.

Reforma de escritorio: inicio sin accesos repetidos, chat con lista/burbujas/compositor, horario compacto con selección por día y publicación explícita. Perfil real informativo; contraseña, notificaciones y disponibilidad siguen persistentes. Se retiran 2FA, autoeliminación, banners amarillos y pestañas clínicas simuladas; datos sin fuente muestran Próximamente. Sesiones/reportes autorizados conservados.

La familia puede calificar después una sesión FINALIZADA/ASISTIO desde su fecha de agenda:1–5estrellas y comentario opcional. Terapeuta ve opiniones reales, media y distribución calculadas. Migración011 adoptada con respaldo privado verificado, RLS/SELECT/INSERT runtime;32tablas previas conservadas y cero registros de prueba compartidos. ADR[0024](decisions/0024-valoraciones-sesion-atendida.md).

PASS: tipos/check/build,25rutas,304componentes/22archivos,29unidades backend y un escenario SQL/HTTP local. Chrome1536×1024:once capturas, sin errores JS/overflow. [Evidencia](evidence/therapist-reform-2026-10-11/verification.md). Responsive diferido. Sin WebSockets: invalidación local y polling de notificaciones; Actualizar conservado. Base V71/b9e92cd; cierre/publicación normal V72 en dev y feat/piero-dev. No nueva auditoría/PDF.

## V71 - Vista previa aislada de Mundo ASHA / 2026-10-11

V70 publicado mediante push atómico normal: `dev` y `feat/piero-dev` verificados en `900aa5e598dd90a39c00f94f4ec9878c4b83ebce`, y ramas locales sincronizadas. La consulta GitHub devolvió cero statuses; no acredita CI/despliegue. Cambios ajenos conservados sin publicar.

La vista previa DEV de diseño ahora sirve datos sintéticos localmente, rechaza guardados con explicación y muestra un aviso; sólo `?verify=1` habilita las peticiones interceptadas del arnés. Chrome: cinco mundos, modal y rechazo local del intento PASS, cero requests a API. Sin cambios de runtime de producción. Responsive sigue diferido.

## V70 - Mapa web de Mundo ASHA / 2026-10-11

Cinco mundos sobre un fondo de archipiélago acorde a las ilustraciones existentes de landing, hover/foco y estado pendiente de asignación. Cada mundo abre una ruta de tres niveles cuadrados; cada nivel abre la actividad vigente en un dialog accesible. Intentos/UUID, premios, contenido, permisos por niño y API conservados. Fondo ImageGen de 1536 × 1024 servido como WebP de 215 KB; PNG original y cinco ilustraciones previas conservados.

Escritorio: tipos, check:frontend, build, 13 pruebas focalizadas y 25 rutas PASS. Chrome 1536/1440/1280: cinco mapas de niveles y modales, hover, teclado/Escape/foco, guardado sintético, niño sin asignaciones, error/reintento y reduced-motion PASS. La copia aislada de publicación también pasa; cero errores JS. Evidencia en [world-map-v70](evidence/world-map-v70/verification.md). No se ejecutaron BD, usuarios, login, correo o intentos reales. Responsive diferido expresamente; juegos finales y revisión profesional de contenido pendientes. No nueva decisión de arquitectura ni auditoría académica.

Base 980a3eb/V69; rama feat/piero-dev. Cierre con commit versionado y publicación normal a dev y rama de usuario según autorización; confirmar resultados reales de refs/CI en el relevo. Cambios ajenos de terapeuta/valoraciones/mensajes excluidos y preservados.

## V69 - Gestión y actualización de avatares de pacientes / 2026-10-11

Persistencia del campo nativo `PACIENTES.avatar_nombre` y catálogo visual interactivo de 8 avatares infantiles (`oso`, `zorro`, `conejo`, `panda`, `leon`, `koala`, `tortuga`, `buho`) en `/padre/config`. Imágenes JPG alojadas en `frontend/public/avatar_paciente/` y alineadas con esquemas clínicos del backend.

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

## V59 - Terapeutas en landing y marca del footer / 2026-10-10

Rama `codex/landing-publica`, base `4740ffe` / V56. Fetch de cierre exitoso: `origin/dev` avanzó a `498df42` / V58 con cinco commits de cuentas, correo y documentación. Se continúa numeración en V59; esos cambios remotos no se integran en este ajuste visual. Dev local `396efda` preservado. Commit V59 sólo local, sin push ni merge hacia dev; `.gitignore` previo excluido.

Se retira Ver todos de terapeutas y se conservan perfiles, textos y Agendar (login). Explorar terapeutas, tarjeta Terapeutas y enlace Especialistas del footer apuntan a `#landing-specialists`, sin abrir el directorio separado. La ruta externa de especialistas permanece disponible. Footer de landing rediseñado con fondo lavanda, logo oficial y marca violeta/naranja, columnas y contraste; otras variantes públicas conservadas. Favicon y apple-touch-icon reutilizan una copia exacta del logo oficial; sin imagen nueva ni cambios de marca.

Verificación: tipos, check de frontend (354 archivos, máximo 500) y build (1913 módulos) aprobados. Chrome en 320/375/768/1024/1536 px: sin overflow ni errores JS, logo cargado, enlaces internos, Agendar, footer de otra página y favicon 200 idéntico al original. Evidencia en [landing-v59](evidence/landing-v59/verification.md). La suite tenía una expectativa del antiguo enlace Especialistas como botón/directorio; se actualizó a los enlaces de sección solicitados. Resultado final: 25 rutas y 283 componentes en 19 archivos, PASS. Graphify refresh/check vigente (2374 nodos, 103 comunidades; 13 fuentes sin símbolos). Backend y servicios no modificados ni pruebas reales de login/BD/reservas/correo.

Preview :5176 y API :8002 reiniciados; recordatorios desactivados. Pendiente revisión humana y conciliación de los nuevos commits remotos antes de una futura publicación autorizada. No publicar en dev hasta aprobación explícita.

## V56 - Landing unificada, acceso seguro y WebP, sólo local / 2026-10-10

Rama `codex/landing-publica`, base `796fc28` / V55; último `origin/dev` conocido `ca9e1b3`. El fetch de cierre falló al conectar a GitHub:443; no se confirma actualización remota. Commit V56 identificable en Git, sin push ni merge hacia dev. Dev local `396efda` y `.gitignore` previo preservados.

Hero, Ashi e ilustraciones conservados. Cinco mundos integrados tras los pasos, navegación por anclas, modal accesible y retorno al mundo elegido compatible con el rol. PADRE usa su módulo privado y la asignación del niño; otros roles reciben una explicación. El catálogo público sólo devuelve metadatos y números de niveles; el resumen entrega ejercicios de mundos asignados. Intentos mantienen controles de sesión, vínculo, rol y asignación. ADR 0022 documenta el contrato; sin tablas ni migraciones nuevas. Perfiles públicos de ejemplo rotulados como demostración; Agendar conservado. Solicitar cuenta abre las instrucciones existentes porque no hay autorregistro público.

37 WebP derivados de 18 originales, con srcset, transparencia, dimensiones y caché por hash. Los originales suman 25,70 MB frente a 1,03 MB de las variantes WebP máximas (96% de reducción en ese conjunto); originales conservados, sin medición de red. Chrome de 320 a 1536 px: sin desbordamiento ni controles menores de 44 px; foco, Tab, Escape, roles, retorno, asignación, cinco FAQ, Demo, WhatsApp y movimiento reducido verificados.

Tipos, check de frontend (353 archivos, máximo 500), build (1912 módulos), 25 rutas y 283 componentes en 19 archivos: PASS. Siete pruebas backend unitarias/ASGI sin BD: PASS. Newsletter con respuestas simuladas y catálogo local real 200 sin ejercicios. Se instaló httpx, dependencia de desarrollo ya declarada. Graphify: 2373 nodos, 100 comunidades, check vigente; 13 fuentes sin símbolos. Sin escrituras de BD, usuarios, login, correo ni reservas reales.

[Informe y capturas](evidence/landing-v56/verification.md) y [auditoría](audits/auditoria-2026-10-10-01.md). Preview en :5176 conectado a API actual :8002 con recordatorios desactivados; API anterior :8000 conservada. Siguiente: revisión humana y validaciones específicas de directorio, registro y servicios antes de publicar. `noindex` conservado. No publicar hasta autorización explícita.

## V55 — ilustraciones originales y Mundo ASHA público, sólo local / 2026-10-10

Rama `codex/landing-publica`, padre visual0d1e285/V53; incorpora origin/dev ca9e1b3/V54
mediante merge local. Sin push ni integración hacia dev; dev local396efda y `.gitignore`
del usuario preservados.14escenas ImageGen integradas, ocho inferiores distintas y seis
para Mundo ASHA; Ashi FAQ conserva identidad con nueva pose. Hero/audiencia aprobados
intactos. Mundo público, FAQ y newsletter mantienen Nunito/paleta/cristal/relieve; estilos
encapsulados y variante opt-in de PublicNav. Contenido, catálogo, rutas y acciones vigentes
conservados. Mundos privados/Btn/Crd/paneles no tienen rediseño en este corte.

Se conservó el nuevo formulario de newsletter remoto, consentimiento y feedback claros.
Checks PASS: tipos, check346/máximo500, build1906,25rutas,280componentes/18archivos;
Chrome1536/1440/1280 en landing/mundo, textos/controles/enlaces preservados, imágenes
únicas/cargadas,5FAQ, destinos, Demo/Escape/foco, estados catálogo y newsletter simulada,
sin overflow/controles pequeños ni errores JS. GET catálogo real200 muestra5tarjetas.
Graphify refresh2343/check vigente,12fuentes sin símbolos. Backend pytest no disponible
en backend/.venv; no cobertura backend nueva, migraciones, correos ni BD escritos.
[Capturas, prompts y alcance](evidence/landing-v55/verification.md). PNG lote-v54,
commitV55 por actualización de secuencia remota. Responsive/optimizaciónPNG diferidos;
recursos visuales de escritorio completos. Preview127.0.0.1:5176 activo.
Siguiente: revisión humana; no publicar hasta autorización explícita.

## V53 — continuidad visual de toda la landing, sólo local / 2026-10-10

Rama `codex/landing-publica`, base d8eb10e/V52. `origin/dev` continúa en a6eda9f;
no cambios remotos nuevos ni push. Dev local396efda y `.gitignore` del usuario intactos.
El estilo aprobado del hero se extiende a pasos, terapias, equipo, ejemplos, FAQ,
newsletter y pie, con escala común, cristal suave, ilustraciones V52 y margen del dock.
Los perfiles conservan iniciales y datos; las ilustraciones son decorativas, no fotos.
Se preservan todos los textos, nombres de controles, enlaces y estados deshabilitados,
incluidos avisos ficticios/Demo. Sin cambios de hooks, rutas, Btn/Crd, paneles o API/BD.

Checks nuevos: tipos, check346/máximo498, build1906,25rutas y Chrome desktop
1536/1440/1280. Comparación de palabras/controles/enlaces contra V52; imágenes cargan,
sin overflow/controles<44px;5FAQ,5destinos, newsletter sin envío, dock único/Demo/Escape,
foco y reduced-motion, cero errores JS. Graphify refresh2292/check vigente.
No repetición de281pruebas de componentes V52 ni backend/servicios externos.
[Capturas y alcance](evidence/landing-v53/verification.md). Preview127.0.0.1:5176 activo.
Siguiente: revisión humana del diseño completo local; responsive sigue diferido.
No publicar ni integrar hacia dev hasta autorización explícita.

## V52 — Ashi y composición de referencia, sólo local / 2026-10-10

Rama `codex/landing-publica`, avance anterior5dacd55 (V51 landing local). Incluye además
`origin/dev` a6eda9f (V51 documentación Zoom), integrado localmente sin conflictos.
V52 continúa la secuencia remota vigente; no se renombra el commit local anterior.
Sin push ni integración de la landing en dev por instrucción del usuario.
Dev local sigue396efda; `.gitignore` del usuario permanece fuera del commit.

Recreaciones ImageGen desde la referencia: Ashi robot en hero/dock/panel público,
familia, terapeuta y estrella/libros. Hero, navegación desktop y tarjetas adoptan
textos/composición de la referencia por nueva petición expresa. Lower sections, FAQ,
atribuciones, ejemplos y newsletter conservados; Recursos pasa al pie sólo en landing.
Btn/Crd/hooks/rutas/API/BD sin cambios. Assistant reutilizado con variante visual local;
Demo explícita, onda estática y URL WhatsApp existente, sin afirmar IA/voz/entrega reales.

Checks:281componentes/18archivos,25rutas, typecheck, check345/máximo498, build1905módulos.
Chrome desktop1536/1440/1280: imágenes cargan, sin overflow/controles<44px;5FAQ,
5destinos, un WhatsApp, Demo/Escape/foco, anclaFAQ y movimiento reducido; cero errores.
API interceptada401; no usuarios/BD ni servicios externos probados. Responsive V52
diferido por prioridad explícita; evidencia móvil V51 no certifica este corte.
Graphify refresh/check al cierre, mapa no versionado. [Evidencia](evidence/landing-v52/verification.md).
Siguiente: aprobación humana del diseño local; responsive/optimización de PNG antes
de publicar si se retoma ese alcance. No publicar hasta autorización.

## V51 — rediseño local de landing pública / 2026-10-10

Rama `codex/landing-publica` creada desde el último `origin/dev`,
`5dd572cb37a679d5e8674a0cf1910426d925a1f9`/V50. Commit local del rediseño;
no integración ni push a dev ni a otra rama, pendientes de aprobación del usuario.
El dev local previo permanece en396efda; `.gitignore` previo se conserva fuera del commit.

Landing adopta tokens del kitv1 sólo en `.asha-landing.asha-ui`: Nunito, violeta,
relieve inferior, blanco cálido, tarjetas de cristal y presentación responsive.
Los pasos siguen al hero; servicios/equipo/ejemplos/FAQ/newsletter/pie conservan textos,
controles y destinos. PublicNav sólo cambia presentación con `cur=landing`;
Btn/Crd/paneles/contratos/API/BD no cambian. DESIGN.md describe la adopción real.
No asset aprobado del robot Ashi ni ilustraciones separadas de la referencia;
espacio decorativo de letras existente explícitamente pendiente. Dock privado intacto.

Verificación nueva:281componentes/18archivos,25rutas,tipos/check343/build1903módulos.
Chrome con API interceptada:6anchos320–1920px, contenido/18destinos,5FAQ, menú,
foco y movimiento reducido; sin overflow ni botones visibles<44px de alto.
Capturas/comparación y límites en [evidencia](evidence/landing-v51/verification.md).
Graphify setup/query/refresh/check al cierre, mapa no versionado.
No auditoría técnica nueva, backend ni integraciones externas verificadas.
Siguiente: revisión humana del corte local y recursos Ashi; sólo publicar tras aprobación.
## V52 — adjuntos persistentes en mensajes / 2026-10-10

PADRE y TERAPEUTA pueden enviar un archivo por mensaje, con texto opcional, consultar
sus metadatos, visualizar imágenes/audio/video y descargarlo desde el chat. Formatos:
JPG/PNG/GIF/WebP, MP3/WAV/OGG, MP4/WebM, PDF/TXT. Límite10MB por archivo y20envíos/hora
por emisor. La comprobación de permisos usa participantes de la conversación; para
nuevos envíos exige el vínculo vigente y chat abierto, como el texto existente.

mensaje_adjuntos se conecta mediante ORM/FastAPI. Migración009 añade contenido BYTEA
nullable, UUID de envío único y SHA256: mensaje+archivo se confirman en una transacción,
reintento idéntico devuelve el mismo mensaje. Lecturas de historial cargan solo metadatos;
contenido se lee mediante descarga autorizada y no se devuelve en JSON ni URL pública.
El navegador carga medios al pulsar Ver archivo y revoca el blob al salir.

Se elige almacenamiento binario acotado en PostgreSQL porque existe infraestructura
persistente y solo una clave Supabase pública, insuficiente para un bucket privado.
Evita guardar en disco efímero de Render; no añade claves ni cambia autenticación.
Escala futura: mover archivos grandes a storage privado manteniendo el contrato.
Migración009 adoptada en BD compartida con respaldo verificado y filas conservadas.
No archivos/pacientes reales creados para pruebas; evidencia local sintética y metadatos
saneados en [attachments-v52](evidence/attachments-v52/verification.md).
ADR [0021](decisions/0021-adjuntos-pequenos-transaccionales.md). El contenido legada sin
bytes no se recupera desde URLs externas. No antivirus/transcodificación ni extracción
confiable de duración; se verifica formato por extensión y cabecera, no integridad total.

## V50 — cinco mundos básicos persistentes / 2026-10-10

Catálogo `basica-1`: HABLA (Taller de los Sonidos), LENGUAJE (La Isla de las Palabras),
FLUIDEZ (Ritmo de las Palabras), VOZ (El Estudio de la Voz) y OROFACIAL (Laboratorio de
los Gestos). Cada mundo tiene tres actividades básicas de selección/orden, con acceso
libre a sus niveles. El profesional asigna uno o varios de los cinco mundos en el plan.
Saltar al nivel 3 no completa los anteriores. El diseño definitivo sigue pendiente.

El backend valida respuestas y guarda intentos correctos/incorrectos por niño, mundo,
nivel y versión. Cada primer nivel correcto otorga 100 XP; completar los tres entrega
una medalla y 100 XP adicionales una sola vez. Nivel del perfil = 1 + XP // 200.
Reintentar una petición con el mismo UUID no duplica filas ni premios. La UI consulta
el servidor al recargar/cambiar de hijo; Insignias y Perfil muestran estos contadores.

Se reutilizan actividades, objetivos, mundos, niveles, resultados_nivel, perfiles,
logros y perfil_logros. Migración 008 aplicada a la BD compartida con respaldo privado
verificado y comparación de filas previas: conservadas; cinco medallas de catálogo
nuevas. No se insertaron pacientes ni intentos reales para probar. Evidencia saneada:
[adopción](evidence/games-v50/database-adoption.json), [verificación](evidence/games-v50/verification.md).
ADR [0020](decisions/0020-juegos-basicos-persistentes.md). Sin conexión React/PostgreSQL.

Los datos son simulación, no evaluación clínica ni inferencia de emociones. Quedan
pendientes juegos finales, revisión profesional de contenidos, modelo ML/dataset con
etiquetas y reporte/certificado mensual. Duración y ayudas son declaradas por el cliente.
Los catálogos draft-1 y demos históricos no representan este flujo persistente.

## Especificación de componentes UI — V47 / 2026-10-10

## V52 — correo de bienvenida y boletín

Se implementó Gmail API server-side OAuth opcional. Las cuatro rutas de alta devuelven
`correo_bienvenida` (`ENVIADO`, `PENDIENTE` o `NO_CONFIGURADO`) después de confirmar el
commit local; el mensaje nunca aparece en la respuesta, logs ni auditoría. La landing
envía suscripciones con consentimiento explícito. `POST /api/v1/newsletter/suscripciones`
crea o reinicia una solicitud pendiente sin enumerar correos, y los enlaces públicos de
confirmación/baja cambian el estado mediante tokens hash. El esquema requiere migración
`009_newsletter_subscriptions.sql`, aún no ejecutada en la base compartida. Gmail queda
deshabilitado por defecto hasta configurar OAuth publicado, refresh token y remitente en
Render. No hay campañas masivas ni panel administrativo en este corte.

Nuevo paquete de diseño aprobado como dirección visual: [guía Markdown](design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md)
y [lámina PNG](design/ashakids-ui-kit-v1/ASHAKIDS_UI_KIT.png). Tokens, CSS copiable,
componentes, estados, accesibilidad, contratos de interacción y mapa de adaptación.
Violeta/verde agua/naranja, Nunito, botones con relieve y cristal suave; Ashi robot LED.
Es especificación futura, no adopción en runtime: DESIGN.md raíz sigue describiendo V38.
Los recursos transparentes del robot, eventos y migración de pantallas quedan pendientes.
Ashi.tsx actual es oso SVG; AshhiFloat ya existe y debe adaptarse sin duplicar el dock.
Verificación nueva: CSS PostCSS120reglas/55variables,13pares texto>=4.5:1/borde>=3:1,
enlaces/fences y hash PNG1024x1536 idéntico al aprobado. No render ni pruebas funcionales
nuevas; no API/BD/credenciales modificadas. Siguiente: galería aislada y comparación visual
antes de migrar componentes. Base consultada bb7d166/V46, codex/2do-intento y dev.

## Fuente de etapa y aceptación humana — V46 / 2026-10-10

Solicitud posterior incorporada: REGISTRO_INCONSISTENCIAS_Y_CRITERIOS.md con doce fichas
abiertas (nueve contradicciones y tres criterios pendientes), fuentes/líneas, prioridades
y aceptación propuesta. Maestro§15 y guía§5 enlazan el registro; no correcciones funcionales.

Maestro actualizado: DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md (requisitos de cinco páginas
del Avance2, arquitectura, API, diccionario/relaciones, operaciones, seguridad y evidencia).
Guía operativa: GUIA_FLUJO_ESTADO_Y_PENDIENTES.md (12pasos, estados, inventario100%/parcial/
ausente, pendientes UX y límites). PDF exports en output/pdf, evidencia documental propia.
Base examinada6204803/V45, codex/2do-intento/dev. Corte documental, no auditoría nueva.
Usuario confirma alta/acceso padre y terapeuta, disponibilidad, reserva y enlace Zoom visible
en Render; supera el pendiente V45. No creación ni clínica nueva por agente para documentar.
Tramo cierre/reporte/plan/segunda reserva pendiente de aceptación humana en Render; código
y pruebas locales heredadas describen su comportamiento. Zoom no cierra la sesión: manual.
Plan/reporte permiten EN_CURSO; reservar terapia exige introducciónFINALIZADA/ASISTIO,
reporte válido y planACTIVO. Mundos leen el plan activo antes del cierre si ya fue publicado.
Plan nuevo finaliza anterior conservando historia, no biblioteca educativa acumulativa.
Catálogo actual READONLY30tablas207columnas113pg_constraint41FK87índices70políticas,
23ORM. OpenAPI público3.1.0/API0.1.0/69operaciones; health/ready200. No suites nuevas.
Pendientes específicos: UI contraseña8/API12; PATCHpropia no verifica actual; reporte backend
no bloqueaNO_ASISTIO como UI. PIN4, WSP/ZoomAPI, varios diagnósticos/material histórico son
backlog de seguridad/integración/dominio, no cambios estéticos ni implementados. No pagos,
no regla anticipación semanal; desktop primero. Siguiente: aceptar tramo final y pulir UX.

## Implementación local posterior a V46

Se alinearon los formularios de cambio de contraseña con la regla vigente de 12–128 caracteres
y el PATCH propio exige `current_password`; ADMIN conserva el cambio administrativo sin esa
verificación. El backend rechaza reportes de sesiones `NO_ASISTIO` y la publicación de planes
requiere contenido clínico útil, no solo la existencia de un registro vacío. Las acciones de 2FA,
autoeliminación y solicitud de edición de perfil se presentan como no disponibles, sin afirmar
envíos o cambios inexistentes.

Se preparó Zoom Server-to-Server OAuth opcional para citas virtuales. `ZOOM_ENABLED=false` mantiene
el enlace manual; cuando se habilite, `POST /api/v1/citas` crea una reunión con la duración de agenda
(40 minutos en desarrollo/Basic, 45 en producción institucional) y guarda solo `zoom_meeting_id` y
`zoom_join_url`. La migración `007_zoom_meetings.sql` amplía las columnas
externas y debe probarse en una base aislada antes de adoptar el esquema compartido. Las credenciales
Zoom son backend-only y siguen pendientes de configuración/validación con una cuenta técnica.

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

Base V40/7c8f1ee, rama codex/2do-intento; cierre independiente para publicar en dev y sincronizar
la rama de trabajo sin reescribir commits. SHA y publicación efectiva: consultar Git.
Shell ADMIN, panel, cuentas y presentación consistente de las ocho secciones de navegación.
Marca Nunito/violeta/naranja/teal, cristal y luz contenidos; formularios opacos, foco visible,
acciones accesibles e iconos Lucide. Datos, consultas, rutas, callbacks, autenticación y BD intactos.
Pruebas nuevas: 281 componentes + 25 rutas; tipos, check340/máximo498 y build final3.45s/1897 módulos.
Advertencias: DEP0205 heredado, argumento npm --run innecesario y 12 fuentes sin símbolos Graphify.
Mapa actual2216 nodos/108 comunidades. Detector único: aviso de color corregido, sin repetición.
Revisor inicial fix; veredicto ship acotado a dos fixes resueltos: ayuda móvil separada de las filas
e iconografía ML consistente. Evidencia viewport/secciones en docs/evidence/admin-v41/; sin auditoría nueva.
UI consultó únicamente datos sintéticos de QA, filtros, formulario sin enviar y menú; sin CRUD ni pruebas backend.
El usuario prioriza escritorio para futuros cambios; responsive puede esperar. Siguiente trabajo autorizado:
padre/tutor y terapeuta UI en commits separados, publicar dev y revisar error de conexión BD en Render.
No adoptar migraciones compartidas sin inspección y comprobaciones del entorno desplegado.

## 2026-10-10 — V40 Rediseño de login UI

Base V39/023e21b, codex/2do-intento. Login conserva autenticación, guard, handlers y prefills;
formulario cristal/luz, arte CSS de marca en escritorio, controles estándar accesibles.
Dos fuentes LoginPage.tsx/login.css y contrato/comparación docs/design/LOGIN*.md.
Pruebas nuevas:281 componentes/18 archivos+25 rutas16.35s, tipos/check339/máximo498,
build4.37s/1896 módulos; DEP0205 heredado. Detector único[]/exit0. Revisor ship, sin fixes.
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

## Avance V38 — rediseño visual de landing (2026-10-10)

Rama codex/2do-intento, base V37/4fba7e9ff18e24248072118f553bbb96243367eb.
Landing con paleta Nunito/violeta/naranja/teal, tarjetas glass, luces difuminadas,
arte tipográfico CSS y microinteracciones breves. Construcción directa elegida por el usuario.
Cambian seis módulos de presentación y CSS encapsulado; useLanding, rutas, API y BD intactos.
281 componentes/18 archivos +25 rutas, tipos/check338/máximo498 y build final2.55s correctos;
DEP0205 heredado. Graphify2213 nodos/108 comunidades, mapa actualizado. Sin tests backend nuevos.
Hero inspeccionado en1280/751/390/334px; secciones desktop/móvil, FAQ ratón/Enter y CTA con
sesión sintética activa. Ver evidencia landing-v38 y contrato docs/design/LANDING.md.
Revisor cerró los dos fixes originales (ancho móvil y reduced-motion): ship acotado a ellos.
Reduced-motion/hover revisados en fuente, sin emular preferencia del SO. No certificar toda la app.
Newsletter sin envío, textos heredados sobre pagos/Zoom y directorio demo quedan deuda existente.
Decisión vigente del usuario: cambiar horario semanal con anticipación queda fuera del alcance;
no es una extensión pendiente. La disponibilidad actual se conserva.
Siguiente: rediseñar cada rol por separado, un commit por rol. Sin Supabase/dev/feat/piero-dev,
sin auditoría académica nueva ni despliegue. Consultar Git para SHA publicado V38.

## Avance V37 — notificaciones profesionales (2026-10-10)

Rama codex/2do-intento, base V36/583de51. Bandeja y preferencias reales por terapeuta:
reservas, cancelaciones, cambios de cita, recordatorios y mensajes de familia autorizada.
Migración005 agrega dos tablas, solo aplicada en PostgreSQL local. ADR0017.
207 backend aprobadas/25 omitidas/19 avisos;281 componentes+25 rutas, tipos/check337/build.
UI comprobó bandeja, lectura, guardado/recarga y supresión de aviso al desactivar categoría;
reservas disparadoras por HTTP sintético. Preferencia restaurada true al acabar el ensayo.
Recordatorios requieren proceso API activo y flag explícito tras adoptar005. No correo/push.
Evidencia notifications-v37. Resto de campos demo y anticipación semanal siguen pendientes.
Sin dev/feat/piero-dev ni Supabase compartido; no nueva auditoría académica.

## Avance V36 — paneles, mundos y reunión externa (2026-10-10)

Rama codex/2do-intento, base V35/7faa666. Agenda familiar por niño, historial visible,
paneles/analíticas con atenciones reales, enlace Zoom externo persistido y mundos asignados
con tres niveles demo por mundo: completar/desbloquear/repetir. ADR0016, sin migración.
Asesor es persona con acceso ADMIN, aclaración explícita del usuario; usa el rol existente.
201 backend aprobadas/25 omitidas/19 deprecaciones;278 componentes+25 rutas, tipos,
check333/build correctos. Evidencia flow-v36; no auditoría académica nueva.
Núcleo mostrado en navegador local: familia con dos niños independientes, reserva de
terapia con otro profesional, historial ajeno de solo lectura, atención propia cerrada
FINALIZADA/ASISTIO mediante confirmación dentro de la app, reingreso, PDF descargado y
Lenguaje demo completado/repetido3/3. Revisadas vistas desktop1280x720/móvil390x844.
Cierre de primera introducción Ana fue HTTP; segunda atención sí se cerró en UI.
Alta/guarda de activación UI heredadas V33; envío de nueva contraseña solo por API.
El bloqueo anterior del navegador se recuperó. Núcleo local concluido, sin certificar
todas las pantallas, extensiones diferidas, llamada Zoom ni adopción compartida.
Publicar avances solo en esa rama; dev/feat/piero-dev siguen V32/ebb8632 y Supabase V26.

## Avance V35 — planes e historial (2026-10-10)

Rama codex/2do-intento, base V34/84078ae. Plan mensual del profesional desde sesión
iniciada/con reporte, origen y mundos persistidos, versiones inmutables; asesor no
prescribe. Contexto de lectura por cita futura/atención, edición por autor y relación
legada V26 conservada explícitamente. ADR0015/migración004 únicamente local.
199 backend aprobadas,25 omitidas,19 avisos;270 UI finales; tipos/check328/build.
UI real guardó reporte y plan de Ana; cierre visual detenido por confirmación nativa
IAB (no por API), sustituida por confirmación dentro de la app y pendiente de repetir.
Sigue pendiente mostrar todo el flujo, paneles, enlace externo y juegos demo. No cierre
del objetivo general ni adopción en Supabase/dev. Evidencia flow-v35.

## Avance V34 — agenda e introducción (2026-10-10)

En codex/2do-intento, base V33 45ee5ab, disponibilidad semanal/bloqueos persistidos,
directorio activo, introducción por niño sin plan, confirmación inmediata y calendario
familiar con resumen. Migración003 solo local; ADR0014. Se conserva sesión separada.
No integra dev/feat/piero-dev ni modifica Supabase. Plan profesional, permisos de
continuidad entre terapeutas y demo de juegos siguen pendientes: no dar por terminado
el flujo hasta demostrar todo el recorrido en la aplicación.
Pruebas nuevas y límites: docs/evidence/flow-v34/README.md. Tests DB V34 separado de
QA persistente ashakids_test_flujo_qa_20261010 (API8002/Vite5175).

# ASHAKids — Contexto maestro progresivo

Actualización: 2026-10-10. Base compartida del equipo: dev. Corte vigente identificado abajo;
los apartados anteriores conservan su entorno y SHA históricos. El PDF de referencia del
8 de octubre no declara un SHA de auditoría de su autor.

## Entrada única del equipo

### Nuevo flujo en desarrollo — 2026-10-10

- Usuario autorizó comenzar en codex/2do-intento desde V32/ebb8632. Cierre esperado:
  flujo maestro visible y operativo en la app, adaptando la maqueta actual a nuestro estilo.
  No integrar dev/piero-dev ni migrar/escribir en BD compartida sin aprobación.
- Primer avance: registro de padre e hijos en una transacción, activación obligatoria en
  API/UI, revocación/rotación de sesiones y compatibilidad de códigos. ADR0013.
- Pruebas nuevas en PostgreSQL17.6 local6544, BD NUEVA ashakids_test_flujo_v33_20261010:
  191 backend aprobadas,25 omitidas,19 deprecaciones; incluye9 casos nuevos con SQL real.
  Frontend257 previas+10 nuevas de activación; tipos/check/build correctos en sus rondas.
  UI y cierre Git se registrarán en el relevo; no auditoría técnica nueva ni despliegue.
- Juegos: usuario eligió **demostración rotulada primero**. No atribuirle persistencia
  entre dispositivos ni usar progreso demo como evolución clínica. Pagos fuera de la web.
- Resto del flujo sigue pendiente: introducción independiente, disponibilidad/reserva45min,
  terapeuta intercambiable, plan/reportes y mundos mínimos. No declarar tarea completa
  por cerrar este primer avance. Ver maestro y acceptance/NUEVO_FLUJO.md.

### Alcance nuevo acordado: flujo por tres roles — 2026-10-10

- [Contexto maestro del flujo actualizado](FLUJO_MAESTRO_ACTUALIZADO.md): registro por asesor,
  código institucional de 6 caracteres A/P/T, DNI solo como contraseña inicial y cambio obligatorio;
  introducción por niño, reserva según disponibilidad, cualquier terapeuta y plan profesional.
- Código sigue en V26 restaurado mediante V31/da4e787. El nuevo alcance no reactiva V27–V30
  ni declara implementados sus requisitos. Prevalece sobre propuestas históricas contradictorias.
- Impacto preliminar: reutilizar núcleo, ajustar reservas/planes/activación y permisos;
  persistir disponibilidad y revisar relaciones educativas. Demo frente a persistencia inicial
  de juegos, transición de niños existentes y extensiones pendientes de precisión.
- Corte documental V32; sin migración, cambio de aplicación/BD, despliegue ni auditoría técnica
  nueva. Siguiente: cerrar contratos y aceptación del recorrido mínimo de tres roles.

### Punto vigente: plataforma restaurada al corte V26

- Base funcional y documental: `a81e465aa02522366eb97250c38827d11ed4a0e4`,
  `V26_Auditoria_Frontend_Backend_HTTPS`. Las fuentes coinciden con ese corte.
- Esquema compartido recuperado, con registros y permisos conservados. El contexto activo
  vuelve a las auditorías16/17; no continuar planes posteriores a V26.
- [Registro de recuperación y verificaciones](RESTORE_V26.md). Los 91/100 siguientes
  corresponden a las auditorías originales; no son una puntuación nueva.

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

### Preparación Render gratis - 2026-10-09

- Solicitud: sincronizar dev con piero-dev y comenzar hosting gratuito para demo.
  Base V23/f7bc5ecbca68eb0d21895bcc7a19ff34fecacd0b. Remotas dev/feat/piero-dev ya
  coincidían; dev local avanzó4 commits por fast-forward y se volvió a piero-dev.
- Docker Node22/Python3.13, render.yaml dev/Free/manual, app.hosted sirve React + FastAPI
  en un origen. app.main conserva API local; no nuevas bases ni escrituras Supabase.
- ADR0011 y operations/DEPLOY_RENDER.md.138 pruebas sin BD aprobadas/19 avisos;
  tipos/build React y11 respuestas ASGI con dist real aprobados (sin BD/sesiones).
  Mapa refresh/check vigente.4 fallos Windows/dotfile corregidos; bloqueos sandbox
  de temporales/esbuild resueltos con acceso autorizado. Docker Linux no construido.
- Usuario necesita crear/vincular Render con GitHub. Cuenta, credencial pooler IPv4,
  CA y proxies de ingreso confirmados pendientes. Loopback por defecto rechaza escrituras
  HTTP del proxy no confiable. Sin URL pública ni aceptación HTTPS declarada.
  Cierre V24 corresponde al paquete revisable; publicación del hosting sigue pendiente.

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

### Corte vigente: corrección frontend y nueva auditoría real, 2026-10-09-12

- [Informe](audits/auditoria-2026-10-09-12.md), [PDF](../output/pdf/Auditoria_Frontend_AshaKids_2026-10-09-12.pdf), [evidencia](evidence/audit-2026-10-09-12/). Rama feat/sroman; SHA funcional a60d671a8523a016a41b50395a7db92b05698f18, V18_Correccion_Frontend_Reportes_Sesiones.
- Se cerraron los seis hallazgos anteriores del frontend y dos brechas adicionales de historial profesional/sesiones admin simulados. Diseño y prototipos sin API conservados; identidad y datos clínicos provienen del servidor.
- Puntuación técnica frontend94/100 (antes76). No es porcentaje de cobertura ni certificación de producción. Backend73 anterior no recalculado.
- Validación nueva:257 componentes/25 rutas, tipos/build/320 archivos max495, 0 vulnerabilidades productivas conocidas,11 backend seleccionadas sin BD,28 respuestas HTTP esperadas con SQL READ ONLY en Supabase. Recorrido por formularios reales conservó paciente/tratamiento/cita/sesión/reporte y PDF familiar.
- Proxy relativo /api/v1 hacia API8000 por defecto; override8001 solo explícito para pruebas aisladas. No hay hosting final HTTPS validado ni expiración natural/matriz completa. Riesgos TLS/privilegios BD del corte previo siguen pendientes.
- Nuevos registros AUDITORIA autorizados: usuarios50/51,paciente86,tratamiento6,cita3,sesión2/reporte. No borrar sin instrucción ni incluir en métricas clínicas. Finalización de sesión requirió aceptar diálogo nativo por el usuario.
- Estado Git funcional: V18/a60d671 publicado en dev y feat/sroman, ambas referencias remotas verificadas con el mismo SHA. El corte documental V19 incluye informe12/PDF/evidencia y archiva los Word anteriores sin publicar sus guiones con credenciales. No es un despliegue público.

### Corte de auditoría real Supabase del 9 de octubre de 2026

- [Auditoría frontend y backend](audits/auditoria-real-supabase-2026-10-09.md), con Word separados solicitados por el usuario. Base feat/sroman/a397c0f más CORS local existente.
- Web5174/API8000/BD Supabase real; escrituras AUDITORIA autorizadas. 103 respuestas corregidas esperadas, 47/55 operaciones con prueba HTTP específica; no cobertura integral ni certificación de producción.
- Frontend76/100 y backend73/100. Frontend257 pruebas aprobadas, backend selección segura63 aprobadas/2 omitidas; no TRUNCATE en BD compartida.
- Bloqueos prioritarios: reportes de terapeuta simulados sin aviso, proxy8001 frente a destino8000, TLS sin validación de certificado y usuario BD con privilegios amplios. Registros sintéticos permanecen identificados.
- Este corte no reemplaza resultados históricos locales ni declara hosting publicado o aceptación completa del equipo.

### Corte anterior: consolidación de entrega académica y cierre de Fase 7, 2026-10-09-11

- Paquete de entrega académica consolidado y alineado con los criterios del profesor para la entrega del 9 de octubre (18:00 Lima):
  1. **Informe de Rúbrica:** `docs/academic/INFORME_ENTREGA_RUBRICA.md` documentando la arquitectura de 3 capas desacopladas, contratos OpenAPI, modelo físico en PostgreSQL (26 tablas relacionales, 178 columnas, 221 constraints), RBAC para 3 roles, cookies HttpOnly SameSite=lax y 376 pruebas aprobadas (119 pytest + 232 vitest + 25 rutas, 0 fallos).
  2. **Análisis de Hosting Gratuito (F7-02):** `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md` evaluando Vercel (Front) + Render (API) + Supabase (PostgreSQL), resolviendo el transporte de cookies Same-Origin mediante rewrites en `vercel.json`.
  3. **Guion de Sustentación (F7-03):** `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md` con itinerario paso a paso de 8 a 10 minutos para la defensa en vivo con los tres roles sintéticos (`a90001`, `t90001`, `p90001`), reporte clínico en 4 campos, descarga de PDF y persistencia real tras recarga de navegador.
  4. **Documentación pública:** `README.md` y `docs/DELIVERY_CHECKLIST.md` actualizados con instrucciones de clonación y ejecución rápida.
- Estado de fases: Fases 1 a 7 completadas.

### Corte anterior: cierre formal de Fase 6 y transición a Fase 7, 2026-10-09-10

- Alcance formalizado en [ADR 0008](decisions/0008-cierre-y-alcance-extensiones-fase6.md) para cumplir con la prioridad académica del 9 de octubre (18:00 Lima) y la rúbrica del profesor:
  1. **Teleconsulta:** Soporte por enlace seguro de cita y salas en cliente (`/session/waiting`, `/session/active`); WebRTC nativo (STUN/TURN) diferido por infraestructura externa no exigida.
  2. **Voz:** Juegos fonéticos conservados en el plan desacoplado de Mundo ASHA ([MA-01..MA-07](MUNDO_ASHA_PLAN.md)); análisis acústico complejo diferido.
  3. **ASHI:** Asistente reactivo local seguro en cliente, preservando la privacidad de menores sin llamadas a LLMs de pago externos.
  4. **Correo (SMTP):** Resuelto mediante el subsistema de mensajería privada en PostgreSQL (ADR 0007).
- Estado de fases: Fase 6 cerrada formalmente. El proyecto entra en la Fase 7 (Resolución y Entrega Académica).

### Corte anterior: corrección de proxy local y cookies de sesión en navegador, 2026-10-09-09

- Diagnóstico resuelto: el bucle de recarga en login desde navegadores con escudos de privacidad (Brave) se debía a que `VITE_API_BASE_URL` apuntaba de forma cruzada a `http://localhost:8001/api/v1` mientras el frontend se abría en `http://127.0.0.1:5174/`. Al ser orígenes cruzados (`localhost` vs `127.0.0.1`), las cookies de sesión con `SameSite=lax` eran bloqueadas o no adjuntadas en peticiones fetch subsiguientes, provocando 401 Unauthorized y disparando el evento `ashakids:session-expired` que rebotaba a `/login`.
- Solución arquitectónica implementada:
  1. Configuración de proxy inverso en `frontend/vite.config.ts`: mapeo de `/api` hacia `http://127.0.0.1:8001` con `changeOrigin: true` y servidor fijado en `127.0.0.1:5174`.
  2. `frontend/.env.local` configurado con `VITE_API_BASE_URL=/api/v1` relativo, convirtiendo todas las peticiones fetch en estrictamente Same-Origin (primer origen).
  3. En `frontend/src/api/client.ts`, aislamiento del modo test (`import.meta.env.MODE === "test"`) preservando el origen absoluto para los analizadores de URL en pruebas Vitest, mientras el runtime usa `/api/v1`.
- Verificaciones: 232 pruebas de componentes Vitest y 25 pruebas de rutas pasadas; build limpio; endpoint `/auth/login` y `/auth/me` validados exitosamente a través del proxy devolviendo sesión activa 200 OK.

### Corte anterior: aceptación del núcleo/PDF/mensajes en entorno independiente, 2026-10-09-08

- Aplicación reproducida: dev/b3f84bd828c2002c7f80466410251d9df155550c, V13 y PR107 efectivamente
  integrados.
- [Auditoría08](audits/auditoria-2026-10-09-08.md) y [evidencia](evidence/audit-2026-10-09-08/):
  reproducción en máquina independiente (HailQueso), Node v22.15.0 / npm 10.9.2, Python 3.13.7,
  PostgreSQL 18.4 local en puerto 5433.
- Dos BDs nuevas locales: aceptación ashakids_test_accept07_hq y regresión ashakids_test_regress08.
  Sin conexión a Supabase ni reutilización destructiva de la demo de Piero (ashakids_test_compat17).
- Guion de entrega verify_delivery_journey.py pasó las 92 respuestas HTTP completas: gestión de cuentas,
  suspensión y reactivación, alta de paciente, asignación de tratamiento, reserva, confirmación, ciclo
  completo de sesión, reporte clínico en 4 campos estructurados, exportación y verificación de PDF (%PDF-),
  y mensajería privada con contactos autorizados, aperturas concurrentes, cursor y persistencia tras relogin.
- Suite de regresión pytest en ashakids_test_regress08: 119 pruebas aprobadas, 25 omitidas (suites heredadas
  deshabilitadas), 19 advertencias. 0 fallos.
- Frontend: 232 pruebas Vitest y 25 pruebas de enrutamiento aprobadas; tsc --noEmit, check:frontend (318
  archivos, máx. 495 líneas) y build Vite de producción correctos (bundle 292.83 kB).
- Estado del navegador: servidor Vite levantado en http://127.0.0.1:5174/ y API en http://127.0.0.1:8001/.
  Al intentar la aceptación visual automatizada, browser_subagent reportó fallo en el gestor de Playwright
  por error 404 al descargar el driver en azureedge CDN. Conforme a las instrucciones del usuario, no se
  evadieron puertos ni orígenes. La aceptación visual en navegador real se documenta como pendiente sin falsos cierres.
- Análisis de Incidente 01 histórico: documentado en la auditoría con sus tres capas de guardas vigentes;
  impacto en Supabase compartido permanece abierto a la revisión de línea base y logs por el equipo.
- Fase 5 se mantiene abierta en la dimensión de aceptación en navegador real. Siguiente paso: preparación del
  paquete de entrega académica y rúbrica antes de las 18:00 Lima.

### Corte anterior: aceptación del núcleo/PDF/mensajes, 2026-10-09-07

- Aplicación reproducida: dev/e456294cd7d13aea41dc5d00940b84aa782acbad, V10 y PR106
  efectivamente integrados. Código de verificación V11_Verificacion_Nucleo_Reportes_Mensajes,
  8578ca9cde56bac2ec04389a58ae282cc3fdc8e3. Documento/evidencia V12, integración por PR/V13;
  consultar historial para publicación efectiva, sin atribuir un merge futuro al SHA auditado.
- [Auditoría07](audits/auditoria-2026-10-09-07.md) y [guion](acceptance/CORE_PDF_MESSAGES.md):
  clon GitHub limpio, venv nuevo Python3.13.7/requisitos publicados y npm ci del lockfile;
  Node26.9.0/npm11.19.1. Se reutilizó cluster PostgreSQL17.6 local6544 existente.
  Mismo agente/ordenador; no comprobación de otro integrante/OS ni hosting.
- Dos BD nuevas ashakids_test_accept07 y _repeat pasaron92 respuestas HTTP cada una:
  administración de cuenta/revocación, paciente/asignación, reserva/confirmación/sesión/
  reporte/PDF y mensajes privados. Misma secuencia repetida, no184 casos distintos.
  Historial/reporte idénticos tras relogin; PDF cotejado y renderizado. Ajustes SQL de tiempo/
  estado solo en nuevos IDs; tratamiento finalizado/chat archivado bloquean envío real403/409.
- Suite completa en BD local regress07 separada: clon115 correctas/25 omitidas/19 advertencias;
  final con cuatro unidades de guarda119/25/19. 20 suites heredadas HTTP y5 compartidas no
  habilitadas. 232 componentes,25 rutas, tipos/check/build correctos; sin nuevas pruebas UI real.
- Guion final comprueba hash de sesión emitida por API en BD declarada, activa y no vencida,
  antes de clínica; destino divergente rechazado en prueba SQL real. No guarda tokens/hashes.
  Login/logout sí modifica sesiones sintéticas. Guarda contiene el error de destino; impacto
  histórico01 no restaurado/certificado, requiere logs/baseline del equipo.
- Modelo físico nuevo inspeccionado READ ONLY:26 tablas/178 columnas/92 restricciones/71
  índices;19 tablas modeladas,0 diferencias, incluida mensajería. SQL fuente de02 histórico,
  sin filas reales; solo CREATE SCHEMA public hecho idempotente en copia local. Sin Supabase.
- Demo compat17 conservada: mismos conteos5 usuarios/2 pacientes/2 citas/1 sesión/reporte/
  chat/14 mensajes; no snapshot byte a byte. API8001 restaurada, seis respuestas correctas
  y lectura de reporte02/historial14. API8000/5173 y otros servicios no se reiniciaron/auditaron.
- Fallos registrados: public ya existente al restaurar; grant/seed antes de tablas; Node EPERM
  y consulta procesos denegada/bind8001 ocupado. Correcciones acotadas y resultados preservados.
  Instalación npm avisa dependencia obsoleta/install scripts sin allowScripts; build funcionó.
- Navegador: tras respuesta del usuario indicando acceso habilitado, selección de pestaña5174
  volvió a ser denegada por preferencia guardada. Inventario1/intento1,0 capturas; sin evasión.
  Reiniciar API no cambia permisos. Ajustes de sitios de Codex deben retirar ese bloqueo.
- F5-01 aceptado por API/SQL, fase5 abierta para UI desktop/móvil, recaptura PDF y reproducción
  independiente. Siguiente: aceptación visual/equipo e incidencia01/paquete de rúbrica antes
  de18:00 Lima. No fase6 nueva, pagos, juegos completos MA ni hosting antes de estabilidad.

### Corte anterior: F5-01, mensajes familia/profesional, 2026-10-09-06

- Código V08_Mensajes_Familia_Terapeuta, 7fddd59d6cc6ec594c666c9c80ba184a88c9a91d,
  desarrollado en dev sobre 1398e706121fea153fe9f7481d24983d9e49911a. El corte PDF anterior
  está publicado: PR105 integrado en ese SHA (V07_Integracion_Reportes_PDF).
  Documentación/evidencias nuevas en V09_Auditoria_Mensajeria; integración dev por PR/V10.
  Consultar historial remoto para el SHA efectivo; no atribuir un merge futuro al corte auditado.
- [Auditoría06](audits/auditoria-2026-10-09-06.md) y ADR0007: se reutilizan conversaciones/
  mensajes existentes, sin DDL ni cambios de dependencias. Participantes por perfil de usuario;
  ADMIN por sí solo no lee chats privados. Contactos por asignación activa, chat por familia/
  profesional, sin duplicar por hijo. Historial accesible al participante tras finalizar relación;
  enviar requiere chat abierto/asignación activa/usuarios habilitados.
- Apertura de pareja serializada por tutor; envío bloquea conversación; commit antes del éxito.
  Cursor de IDs para conversaciones/mensajes, límite100, INTEGER positivo; entrada de texto
  1..4000 no vacía/NUL, sin campos de emisor/fecha/estado enviados por cliente.
- PadreMensajes/TerapeutaMensajes usan MessagesCenter/MessageThread/messagingService y
  cookie/API central. Sin respuestas ni contactos ficticios, llamadas/adjuntos/presencia/leído.
  Actualización manual; borradores en memoria por chat y por identidad. No POST automático
  ante error ni burbuja optimista. Respuesta inválida/red/5xx comunica incertidumbre y conserva
  texto; actualizar antes de reenviar. ADMIN informa campañas pendientes sin envío simulado.
- 232 componentes frontend (16 nuevos de mensajes), 36 unitarias backend (25 mensajes +11
  PDF de regresión), 25 rutas; tipos/estructura/build correctos. No suite backend completa nueva.
  HTTP final53 + OpenAPI; aperturas/envíos concurrentes, cursor y lectura idéntica tras relogin.
  Dos corridas conservaron14 mensajes sintéticos (siete cada una) en conversación1; no reset.
- API8001/web5174/PG17.6 local6544, ashakids_test_compat17; .venv313 Python3.13.7.
  Login/logout modifica sesiones sintéticas; solo chats/mensajes nuevos, sin usuarios ni clínica
  nueva, sin Supabase. Comparación del esquema02 es evidencia histórica, no repetida aquí.
- Limitaciones: sin UNIQUE pareja ni clave idempotente de envío; escritores externos deben
  respetar bloqueos/reglas. La revocación concurrente externa no tiene garantía atómica nueva.
  Archivado/asignación finalizada probado en unidad con mocks, sin mutaciones clínicas reales.
- Navegador sigue bloqueado por preferencia guardada previa; no se intentó eludirlo ni se
  obtuvieron capturas06. Pruebas jsdom no certifican UI real desktop/móvil. Recaptura móvil
  PDF05 también pendiente. Fase5 abierta para aceptación conjunta/reproducción por otro clon.
- Siguiente: recorrido del núcleo con tres roles + PDF + mensajes, aceptación visual/errores,
  incidencia01 y paquete de rúbrica. Recursos diferidos; juegos completos Mundo ASHA en MA.
  No iniciar nuevas extensiones ni hosting antes de comprobar estabilidad del alcance elegido.

### Corte anterior: F5-01, exportación de reportes guardados, 2026-10-09-05

- Código: V05_Reportes_Exportacion_PDF, a8df56fc912db76a01092b60caa1efa220dcd85b,
  desarrollado en dev desde add1d4f. Informe/evidencias en V06_Auditoria_Reportes_PDF.
  Destino compartido dev mediante PR; comprobar publicación e integración en historial.
- [Auditoría05](audits/auditoria-2026-10-09-05.md): GET /sesiones/{id}/reporte/pdf verifica
  los mismos permisos que la lectura JSON. PDF generado en memoria con paciente/profesional
  actuales, fecha/estado/asistencia y los cuatro campos guardados; sin notas privadas ni firma.
- Descarga reutilizable en detalle de citas/sesiones de los tres roles y Reportes familiar.
  El cliente central valida MIME/firma PDF, aborta por cambio de cuenta y comunica fallos;
  exporta la versión guardada aunque el formulario tenga cambios sin guardar.
- Reportes familiar usa sesiones reales e ID estable; informe mensual, métricas clínicas
  y firma/matrícula inventados se retiraron. Progreso mensual queda explícitamente pendiente.
  La pantalla independiente /terapeuta/reportes sigue siendo demostrativa.
- 216 pruebas frontend (18 nuevas), 11 backend unitarias nuevas, 25 rutas; tipos/check/build
  correctos. 28 respuestas HTTP reales + OpenAPI en API8001/PG17.6 local6544; PDF cotejado
  con JSON y lectura posterior sin cambio del reporte. No suite backend completa nueva.
- Navegador: descarga física familiar y capturas 1366/390 px verificadas antes del último
  ajuste móvil. Se añadió margen al texto junto a botones flotantes; su recaptura fue
  rechazada por permisos del navegador. Confirmación visual final móvil pendiente.
- Fuentes Vera incluidas en ReportLab; tildes/ñ, nulos, markup literal y texto largo probados.
  Caracteres no soportados (p. ej. ciertos emoji) devuelven 422 sin documento parcial.
  Fechas sin zona conservan esa condición. No certificación clínica, firma digital o carga.
- Dependencias nuevas: ReportLab y tzdata runtime; pypdf de desarrollo. Actualizar el entorno
  con requirements-dev.txt/requirements.txt según uso. Runtime auditado .venv313 Python3.13.7,
  ReportLab4.5.1, tzdata2026.5, pypdf6.19.0. Reiniciada únicamente API8001 de la réplica.
- No tablas/migraciones/filas clínicas nuevas ni acceso a Supabase. Login/logout modifica
  sesiones de las cuentas sintéticas existentes. No ejecutar prepare/pytest de integración
  sobre la demo si se desea conservar sus fixtures de los cortes02/03.
- Fase5 sigue abierta. Siguiente: mensajes autorizados familia/profesional, paginación,
  persistencia y entrega honesta de errores. Recursos diferidos; Mundo ASHA sigue MA-01.
  Incidencia01, reproducción por otro equipo y recaptura móvil pendientes; hosting después
  de acreditar estabilidad del alcance seleccionado.

### Corte anterior: fase 3, coherencia del núcleo, 2026-10-09-04

- [Informe](audits/auditoria-2026-10-09-04.md): cierre de fase 3 para el núcleo mínimo,
  sin certificar todas las extensiones ni estabilidad de toda la plataforma.
- Recorrido/Seguimiento familiar reutilizan registros persistentes; paneles ADMIN/TERAPEUTA
  calculan datos autorizados, sin nombres, mensajes, disponibilidad o métricas clínicas ficticios.
- Familias consultan profesionales por tratamientos asignados y reservan por el diálogo real.
  Configuración muestra todos los hijos sin límites de plan; baja lógica conserva historial.
- Alta y cambios de cuenta/credenciales por administración existente. Registro público,
  recuperación/verificación por correo, consentimiento, preferencias y 2FA pendientes:
  entradas explicativas, sin envío, guardado o aceptación simulados.
- 198 componentes (33 nuevos), 25 rutas, tipos/estructura/build correctos; 35 respuestas
  HTTP + OpenAPI en réplica local y navegador 1366/390 px. Sin clínica nueva ni Supabase.
- [Mundo ASHA](MUNDO_ASHA_PLAN.md) pasa a etapa propia MA-01..MA-07 por petición del usuario:
  mundos por habilidad, diferentes dificultades y niveles. Catálogo draft-1: 4 mundos,
  24 niveles propuestos (6/8/5/5), sujetos a revisión. Juegos actuales siguen prototipos.
  Cálculo secuencial probado con intentos sintéticos; todavía no conectado/persistente.
  Sin estrellas, rachas, asignaciones ni premios ficticios en portada/perfil/retos/academia.
- ADR 0005: experiencia del núcleo y límite educativo. Selección de hijo por ID compartida,
  identidad en claves de consulta; el almacenamiento local no concede autorización.
- Código identificado por V01_Fase3, 9a6b06160c5210ec05bd3273ef516bba6989560d.
  Documentación/evidencia se conserva en V02_AuditoriaFase3. Destino compartido: dev,
  integración por PR; consultar historial remoto para SHA de publicación y CI.
- Nueva regla del usuario: commit obligatorio corto con versión/objetivo y descripción
  breve al cerrar cada fase; publicar en dev y sincronizar su rama. No esperar la palabra
  clave. La señal de tokens bajos prepara un relevo anticipado incluso a mitad de fase.
- Convención afinada por el usuario: `VNN_Accion_Modulos` para todo el equipo y agentes;
  nombrar el trabajo y módulos concretos, sin títulos basados solo en fases. Consultar
  AGENTS.md. Los commits V01..V03 ya publicados se conservan con sus SHA; PR #104
  integrado en dev en 40d53875a1f87378e3651a68c101c2b7150af6da. Esta actualización
  es documental, sin pruebas ni auditoría técnica nuevas.
- Siguiente: F5-01, decidir mínimos de comunicación/documentos; MA-01 requiere revisión
  detenida de contenido/criterios con el usuario. Incidencia01 y reproducción del equipo
  pendientes; hosting solo se comparará después de demostrar estabilidad.

### Corte anterior: F3-01, seguimiento familiar persistente, 2026-10-09-03

- [Informe](audits/auditoria-2026-10-09-03.md): Centro Familiar y Mi Camino ASHA consumen
  registros del servidor; selección por ID también en móvil, sin niños ficticios de respaldo.
- Hitos y contadores proceden de perfil/tratamientos/citas/sesiones/reportes. Solo sesiones
  FINALIZADA/ASISTIO cuentan como realizadas; fechas y mes America/Lima. Progreso clínico
  sigue "Sin medición"; no se infiere mejoría a partir de sesiones o actividades.
- Próxima cita excluye completadas/canceladas/vencidas; recomendaciones salen del reporte
  profesional guardado. Reprogramación va a agenda real; no hay toast de éxito simulado.
- 165 componentes y 25 rutas aprobados; tipos/check/build correctos. 12 casos nuevos con
  mocks; navegador real 1366/390 px, hermanos homónimos, recarga, familia sin hijos y reporte.
- API 8001/PG 17.6 local 6544: añadido un segundo hijo sintético y una cita futura, sin reset.
  El reporte del corte 02 se reutiliza como dato persistente, no como reporte creado nuevamente.
  Supabase no se consultó ni se escribió en este corte. No repetir prepare/pytest en esta demo.
- ADR 0004 documenta modelo de lectura compartido y selección. Componentes antiguos demo
  permanecen sin importarse desde estas entradas; otros módulos aún pueden ser demostrativos.
- F3-01 verificado en las dos vistas; fase 3 general/otras pantallas no certificadas. Siguiente:
  cerrar decisiones/módulos mínimos de entrega F5-01 y revisar recuperación/consentimiento
  demostrativos antes de prometer esas capacidades. Incidencia histórica sigue abierta.
- Señal de relevo acordada: "tokens bajos dejar todo listo para siguiente desarollador".
  Al recibirla, preparar documentación, revisar/integrar en dev con commit/push y entregar prompt.
  Rama actual piero-dev, HEAD 82f868f más cambios sin commit/push; señal aún no recibida.

### Corte anterior: compatibilidad con esquema compartido, 2026-10-09-02

- [Informe nuevo](audits/auditoria-2026-10-09-02.md): Supabase inspeccionado en solo lectura;
  réplica local PostgreSQL 17.6 con 26 tablas, 178 columnas, 92 restricciones y 71 índices
  equivalentes. No se copiaron registros reales ni hubo escrituras compartidas en este corte.
- Corregidas 6 diferencias de columnas en 4 campos ORM; comparación posterior: 0 diferencias
  de tipo/longitud/nulabilidad/precisión/escala en columnas modeladas. avatar_nombre ya existe
  en Supabase; no aplicar allí la migración 001 por la falta que tenía el SQL inicial local.
- 79 pruebas backend aprobadas, 25 omitidas, 19 advertencias; 48 respuestas HTTP reales
  verificadas. Familia consulta reporte y lo conserva al recargar en navegador.
- Runtime SQL local no superusuario con BYPASSRLS, sin CREATEDB/CREATEROLE. Limpieza de
  fixtures usa propietario separado y guardas de mismo destino local descartable.
- Entorno nuevo: PostgreSQL 17.6 local 6544, ashakids_test_compat17; API 8001, frontend 5174.
  No ejecutar pytest/prepare sobre estos datos si se desea conservar la demostración.
- Rol compartido omite RLS y tiene CREATEDB/CREATEROLE. Antes de desplegar, acordar mínimos
  privilegios; autorización por recurso sigue en FastAPI. No se cambiaron permisos compartidos.
- Próxima implementación: F3-01, Centro Familiar y Mi Camino ASHA; retirar cifras/pasos demo
  que aparentan seguimiento real. Incidencia histórica y reproducción por otro integrante
  pendientes. HEAD 82f868f + cambios locales sin commit/push; hosting aún no seleccionado.

### Corte anterior: auditoría local de fase 2, 2026-10-09-01

- [Informe y evidencia](audits/auditoria-2026-10-09-01.md): núcleo ADMIN -> paciente/tratamiento ->
  PADRE/cita -> TERAPEUTA/sesión/reporte -> PADRE/lectura verificado en PostgreSQL descartable.
- 72 pruebas backend aprobadas, 25 omitidas y 19 advertencias; frontend 153 componentes y
  25 rutas aprobadas, tipos/check/build correctos. 27 casos HTTP posteriores verifican
  persistencia y acceso ajeno rechazado. Capturas en evidence/audit-2026-10-09-01/.
- Correcciones: columna avatar_nombre en SQL inicial y migración explícita; guardas de
  pruebas HTTP; retirada de confirmación ficticia; métricas inexistentes eliminadas de reportes.
- Incidencia: la primera suite heredada alcanzó API habitual 8000 y operó cuentas de prueba
  compartidas. Se detuvo; no se restauró esa base. Equipo debe revisar logs/impacto antes de
  cerrar la incidencia. No afirmar que toda esta auditoría estuvo aislada.
- HEAD 82f868fd4a1b7e7d40a636651c13d9add472c71f más cambios locales sin commit/push.
  Compartir el corte y reproducir en otro equipo; después continuar fase 3 (paneles/demo).
- Entorno de evidencia: PostgreSQL 18 local 6543, API 8001 y frontend 5174. La migración
  no se aplicó a Supabase. No volver a ejecutar pytest sobre fixtures que se quieran conservar.

Los apartados históricos inferiores describen cortes previos y no sustituyen este resultado.

### Objetivo de reproducción local y despliegue (2026-10-09)

El usuario confirma acceso a su configuración/BD y busca resultados persistentes reales que
puedan reproducirse al desplegar. La base descartable usa PostgreSQL real para pruebas que
reinician datos; el corte 02 comparó el esquema/configuración compartido y verificó una réplica
local representativa de su versión y estructura pública. El acceso facilitado permite avanzar en esa integración,
pero no convierte las fixtures destructivas actuales en apropiadas para una BD compartida.
Próximo paso: fase 3 y reproducción del corte por otro integrante; revisión de incidencia
histórica pendiente. La infraestructura y dominios del alojamiento no han sido ensayados.

Cuando el alcance esté estable, seleccionar el hosting gratuito más adecuado para React/Vite,
FastAPI y la BD actual, comprobando costes/límites vigentes y sesión en dominios reales.
Tareas F7-02/F7-03 añadidas al plan. Proveedor pendiente; selección y ensayo de despliegue
no realizados en esta actualización documental. No cambia la arquitectura vigente.
Precisión del usuario: primero demostrar estabilidad con pruebas del alcance; después entregar
información y una recomendación comparando Vercel, Railway, Render y alternativas para que él
decida. La etapa actual es de orientación; la ejecución del despliegue requiere petición posterior.

Este archivo reúne objetivo, alcance, estado y siguiente prioridad. Leer después:
- [Plan de implementación](IMPLEMENTATION_PLAN.md): fases y criterios de salida.
- [Avance y relevos](IMPLEMENTATION_PROGRESS.md): tarea activa, evidencias y traspaso.
- [Arquitectura](architecture.md) y [ADR](decisions/): reglas técnicas vigentes.

Los informes históricos conservan evidencia de su fecha, no certifican el estado actual.
Las propuestas de diseño en specs/pasted_text no incorporan automáticamente requisitos.
flujo_vistas_ashakids.md contiene referencias heredadas a Spring/Node/HTML; el producto
actual usa React/FastAPI/PostgreSQL.

## Objetivo y alcance académico

Web de apoyo a terapia de lenguaje infantil para familias, terapeutas y administración.
Recorrido prioritario: usuario -> paciente -> tratamiento asignado -> cita -> sesión ->
reporte -> seguimiento. Reutilizar las tablas y capas existentes; no reconstruir el backend.

| Capacidad | Alcance acordado o propuesto |
| --- | --- |
| Núcleo | Acceso por rol, pacientes, asignaciones, agenda, sesiones, reportes y seguimiento básico: primera entrega funcional propuesta |
| Pagos | Maqueta existente de demostración; sin desarrollo nuevo ni commits dedicados, conforme a la observación del profesor. Sin cobros reales |
| Actividades | Mundo ASHA por habilidades y niveles: etapa propia MA-01..MA-07, revisión detenida antes de juegos completos |
| Comunicación/documentos | Mensajes y PDF: seleccionar los mínimos exigidos por el curso |
| Avanzados | WebRTC, reconocimiento de voz, ASHI/IA, correo y límites de planes: decisión pendiente según rúbrica y tiempo |

La simulación visual existente puede conservarse con etiqueta de demostración. La observación
más reciente del profesor excluye pagos del alcance, por lo que se retira la fase de desarrollo
prevista anteriormente; no implementar persistencia o API de pagos ni un commit dedicado.
Agenda, sesiones y reportes deben poder demostrarse sin cobros reales o simulados obligatorios.

## Entrega confirmada y rúbrica recibida

Entrega: **2026-10-09 a las 18:00, America/Lima**. El equipo confirma dev como base común.
La fecha actual sustituye el horizonte del 10 de octubre del informe histórico.
Prioridades visibles de la rúbrica: arquitectura/backend, modelo físico/tablas/relaciones y
operaciones BD, seguridad/usuarios/permisos, pruebas funcionales y no funcionales con evidencias.
La captura es parcial; no consta puntuación ni todos los criterios.

- [Lista de entrega y evidencia](DELIVERY_CHECKLIST.md).
- [Índice y protocolo de auditorías](audits/README.md).
- [Plantilla de auditoría](audits/AUDIT_TEMPLATE.md).
- PDF aportado: evidence/backend-2026-10-08/Auditoria_Backend_AshaKids_2026-10-08.pdf.
- Repositorio para todos los informes: https://github.com/sromansilva/ashakids-platform .
- Commits con estructura de versiones y objetivo, conforme a AGENTS.md.

## Forma de trabajo: relevos de personas y asistentes

El equipo tiene conocimientos universitarios y desarrolla con apoyo de asistentes. Puede
continuar otra persona cuando la anterior agota sus tokens. El estado debe vivir en Git y
la documentación, no únicamente en chats. Para cada relevo registrar tarea, responsable,
rama/SHA, archivos cambiados, pruebas realmente ejecutadas, fallos y siguiente comando/acción.
Trabajar una tarea acotada a la vez por relevo; no continuar desde cambios que solo existen
localmente en la computadora de otra persona. Ver protocolo en IMPLEMENTATION_PROGRESS.md.
Nunca incluir secretos ni datos reales de pacientes en el traspaso.

## Estado observado y decisión inmediata

El usuario informa que el equipo desarrolla el backend y que las tablas ya están estructuradas.
En este clon existen API/services/models/schemas y contratos de usuarios, pacientes,
tratamientos, citas, sesiones y reportes. clinicalService.ts, SessionActions, usePadreHome,
usePadreAgenda y usePadreReportes tienen consumidores HTTP; useDemoWorkflow conserva simulaciones.
Hay pruebas de interfaz con fetch simulado; no equivalen a una prueba real de los tres roles.

Continuar el backend existente y sus auditorías. Primero identificar el SHA que está trabajando
el equipo, comparar su OpenAPI con los consumidores frontend y cerrar un recorrido persistente
ADMIN/PADRE/TERAPEUTA en PostgreSQL descartable. Después ampliar módulos. No repetir una auditoría
completa sin cambios nuevos como sustituto de integrar el producto.

No se ha contactado al equipo. Base dev, plazo y extracto de rúbrica confirmados por el usuario.
Personas responsables y requisitos no visibles de la rúbrica siguen por confirmar. Las fases
de extensión son una guía futura y no una promesa de completarlas antes de la entrega.

## Evidencia local y límites

En esta conversación se instalaron dependencias, se verificaron build, typecheck y check:frontend;
web y /health respondieron, y /health/ready confirmó conectividad. No se verificó el producto
completo con cuentas de los tres roles. Mapa local: 1673 nodos y check correcto.
Backend local: Python 3.13 en backend/.venv313, SQLAlchemy sin extensiones C opcionales por
bloqueo de DLL de Windows. Esto describe este equipo, no un requisito nuevo de arquitectura.

Entornos: API habitual 8000, frontend 5173; Postman aislado usa 8001. .env permanece ignorado.
Pruebas y semillas que escriben: solo datos sintéticos en una base descartable o staging
expresamente autorizado; no crear usuarios ni modificar tablas reales para pruebas.

## Mantenimiento

Actualizar contexto y avance en el mismo PR que cambia una capacidad. Al cerrar cada fase, commit obligatorio con versión/objetivo y descripción breve, publicar en dev y verificar sincronización (instrucción del usuario 2026-10-09). Marcar verificada solo
con fecha, SHA, entorno, casos y resultados. No usar porcentajes sin inventario, ni declarar
cierre por compilar, abrir una pantalla o recibir un 200 de salud. Para cambios de arquitectura,
actualizar architecture.md y crear ADR; este plan conserva las decisiones vigentes.

Historial: 2026-10-08 — inicialmente se incluyó desarrollo de pagos simulados. La observación
posterior del profesor lo sustituye por maqueta existente sin nuevas tareas/commits de pagos.
Se confirman base dev y entrega 2026-10-09 18:00 Lima; se incorpora auditoría PDF de referencia.

---

## Antecedentes técnicos (evidencia previa, no ejecutada nuevamente en esta revisión)


Actualizado: 2026-10-08. Base de implementación: Tarea 1 frontend (modularización, rutas declarativas y limpieza de dependencias) integrada en la rama dev. Esta documentación describe el estado comprobado; actualizarla junto a cambios importantes.

## Producto y estado
Plataforma de apoyo para terapia de lenguaje infantil, con áreas de familias, terapeutas y administración. Frontend React/TypeScript separado de una API FastAPI y PostgreSQL en Supabase. Autenticación propia, con sesiones y permisos por rol.

Las fases registradas en Git incluyen reorganización del frontend, modularización por dominio y navegación URL con React Router. Consultar los reportes de fases existentes en `docs/` para antecedentes.

## Verificación más reciente
- Tarea 1 y Fase 1: 25 pruebas originales de routing y 151 pruebas Vitest correctas (176 pruebas de frontend en total); tipos (`tsc --noEmit`) y build correctos.
- 292 archivos de código, estilos, configuración y pruebas revisados; máximo 495 líneas. Cero imports locales rotos, cruces internos entre roles o marcadores de conflicto detectados.
- Autoservicio de cambio de contraseña implementado en frontend para Padre y Terapeuta conectado a `PATCH /api/v1/usuarios/{id}` con hash Argon2id e invalidación de sesiones previas.
- Dashboard de Familia (`PadreHome`) conectado a `useFamilyPatients` y `useAppointments` para mostrar expedientes y próxima cita real desde PostgreSQL.
- Modales de gestión de hijos (`PadreConfigShowAddChildModal`, `PadreConfigEditChild`, `PadreConfigDeleteChild`) sincronizados para refrescar la lista de pacientes tras cada mutación.
- 12 pruebas unitarias y de seguridad de FastAPI correctas (aisladas de la BD compartida).
- Mapa de conocimiento sincronizado con 1418 nodos AST mediante `tools/knowledge/manage.py`.

Estas comprobaciones no demuestran cobertura completa de pantallas o funcionalidad clínica. Varias vistas muestran datos ilustrativos; comprobar conexión real antes de declarar una funcionalidad terminada.

## Pendientes conocidos
- Extensión pendiente: persistencia de juegos fonológicos; reconocimiento de voz sujeto al alcance académico acordado.
- Extensión pendiente: teleconsulta; elegir enlace externo o WebRTC según los requisitos del curso.
- Extensión pendiente: exportación PDF de reportes y mensajería entre terapeuta y tutor; no declarar certificación clínica.
- Preparación de entrega pendiente: migraciones versionadas, configuración de despliegue y límites de tráfico; correo sujeto al alcance acordado.
- Suite de integración con advertencias de conexiones sin cerrar: revisar inicialización/disposición del motor y el aislamiento de event loops.

## Backend: avance del 2026-10-08
- Implementados contratos persistentes para usuarios, pacientes, asignación de tratamientos, citas,
  sesiones y reportes. Conserva autenticación propia y las tablas existentes; no ejecuta DDL al iniciar.
- 32 operaciones HTTP en OpenAPI (29 de dominio/autenticación y 3 de sistema).
- 63 pruebas correctas, 5 de integración compartida omitidas por seguridad y 19 advertencias de
  deprecación. Incluye PostgreSQL 18 local descartable con el SQL del proyecto, no solo mocks.
- Supabase PostgreSQL 17.6: conexión correcta y SELECT LIMIT 0 exitoso para 16 modelos. No se
  escribieron datos clínicos ni se crearon usuarios reales durante esta auditoría.
- Backend actualizado en localhost:8000; `/health/ready` comprueba conectividad. `/health` sigue
  siendo liveness, no certificación de persistencia.
- RLS habilitada en 26 tablas públicas y cero políticas públicas observadas; el rol de conexión
  omite RLS. La autorización de FastAPI es esencial; reducir privilegios antes de producción.
- En frontend, `AuthContext` usa login, logout y `/auth/me`. Los servicios de perfil existen, pero
  su integración debe revisarse por pantalla. Hay consumidores reales de pacientes, citas, sesiones
  y reportes en el código actual; también quedan datos y coordinación de demostración.
  La presencia de llamadas HTTP no certifica el recorrido completo con persistencia.
- Para integración local aislada, `frontend/.env.local` y el entorno `ASHAKids Local Isolated` de
  Postman apuntan al backend de prueba en `localhost:8001`, conectado a PostgreSQL local descartable.
  El `.env.local` está ignorado por Git. El backend habitual `localhost:8000` conserva la conexión
  configurada en `backend/.env`.
- Pendientes de despliegue: rotar secretos compartidos, retirar usuarios/semillas débiles,
  rate limiting, auditoría de modificaciones, integración frontend, migraciones versionadas,
  hosting HTTPS y prueba end-to-end con identidades de staging autorizadas.
- Evidencia y alcance: `docs/auditoria-backend-2026-10-08.md`; informe PDF en `output/pdf/`.

Informe de Tarea 1: `docs/tarea-1-frontend-informe.md`. Inventario de eliminaciones: `docs/frontend-cleanup-inventory.md`. Backend intacto. Cambios integrados y publicados en rama `dev`.

## Incorporación al equipo
1. Seguir `README.md` para ejecutar frontend y backend; configurar credenciales por un canal autorizado, nunca en Git o documentación.
2. Leer `docs/architecture.md` y las decisiones de `docs/decisions/`.
3. Ejecutar `python tools/knowledge/manage.py setup` y consultar el mapa según `AGENTS.md`.
4. Trabajar en una rama de funcionalidad, actualizar contexto y mapa después de cambios importantes y entregar mediante PR.
## V49 — duración y visualización de Zoom / 2026-10-10

La agenda, el contrato de cita y Zoom comparten duración configurable: desarrollo/pruebas usan
40 minutos para el plan Basic y producción institucional 45 minutos. `CitaSalida` devuelve
`zoom_origen` para distinguir enlaces creados automáticamente de respaldos profesionales. Las
vistas PADRE, TERAPEUTA y ADMIN usan el `zoom_join_url` de la API y explican su procedencia; no
construyen meeting IDs. La cuenta Zoom y la migración 007 siguen pendientes de prueba aislada.

## V51 — configuración de Zoom en Render / 2026-10-10

Las seis variables ZOOM_ENABLED, ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET,
ZOOM_HOST_USER_ID y ZOOM_API_BASE_URL se guardaron privadamente en el servicio ashakids.
ZOOM_ENABLED=true; API base https://api.zoom.us/v2. No se versionaron credenciales.
Render confirmó Live para dep-db5em4flot8c73emqo2g (34,6s), código dev/V50
5dd572cb37a679d5e8674a0cf1910426d925a1f9. GET /health/ready respondió 200,
status ready/database reachable. Evidencia: [Environment](evidence/zoom-render-v51/environment.jpg).
No se crearon citas, usuarios ni reuniones para probar: falta aceptación de una reserva
virtual con zoom_origen AUTOMATICA y enlace real. Duraciones existentes conservadas;
sin overrides, producción usa 45 minutos; Zoom Basic requiere configurar ambas a 40.
Registro operativo, no auditoría técnica nueva ni prueba de permisos OAuth de Zoom.

## V54 — retirada de Terapeutas demo en ADMIN / 2026-10-10

Se elimina la pantalla de demostración AdminTerapeutas, su entrada del menú, ruta,
importación lazy, título y tipo de navegación. La gestión funcional permanece en
Cuentas → Terapeutas. La URL anterior muestra el estado de ruta inexistente.
Verificación local: 25 pruebas de rutas, typecheck y build correctos; detector Sidebar
sin hallazgos. Sin pruebas nuevas en producción ni cambios en API/BD.

## V55 — eventos reales en Auditoría ADMIN / 2026-10-10

Auditoría y seguridad consulta GET /admin/auditoria, restringido a ADMIN. Expone
solo actor, tabla/ID, acción y fecha; omite los JSON de cambios que pueden contener
datos personales. La respuesta limita el listado a los 100 eventos recientes e informa
el total. El panel reemplaza las filas ficticias con datos reales y maneja carga, error
y lista vacía. Las altas administrativas ya registraban auditoría en la misma
transacción. No se alteran eventos ni cuentas existentes.


## V56 — contraseña personal desde enlace de correo

Desde el alta ADMIN ya no se usa DNI ni una contraseña comunicada: se guarda un secreto
aleatorio y se envía código+botón Crear mi contraseña. La página /crear-contrasena permite
crear12–128caracteres, confirmar y solicitar enlace por código sin sesión. Enlace24h,
ligado al hash privado/correo, consumido bajo bloqueoSQL con revocación de sesiones.
Login rechaza cuentas pendientes nuevas/anteriores; cuentas activadas conservan contraseña.
No requiere migración. ADR0022; evidencia local en evidence/email-activation-v56/verification.md.
Siete variables Gmail guardadas en Render tras autorización explícita; despliegue y recepción
pendientes de comprobar en el cierre. Recepción real y concurrenciaSQL no comprobadas. Contextos V52 inferiores son
históricos y describen el mecanismo anterior reemplazado aquí. No auditoría nueva.


## V57 — Gmail configurado en Render y V56 Live

Las siete variables privadas autorizadas quedaron guardadas en Environment y persistieron
al volver a la pantalla. V56/66754c5 desplegado Live en38.5s; readinessHTTPS200 y OpenAPI
con ambas operaciones de creación/reenvío. La página pública funciona en Render.
Recepción real/OAuth/activación manual pendientes; no se crearon cuentas ni enviaron
correos para probar. Cierre documental y evidencia en email-activation-v56; no auditoría.


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

## V67 — rediseño visual de administración (local)

2026-10-11. Rama codex/landing-publica, base fb471a3/V62. Sólo presentación
frontend administrativa según UI kit: menú, cabecera con Ashi aprobado existente,
tarjetas, controles, cuentas, incidencias, auditoría, configuración y estados
Próximamente. Textos, rutas, acciones y permisos conservados. Sin cambios backend,
servicios HTTP, autenticación o datos; padre/terapeuta no migrados en este corte.
Ver docs/evidence/admin-visual-v67/verification.md y DESIGN.md.
Tipos/check358/build1916: PASS. 25 pruebas de rutas + 288 componentes: PASS.
Chrome con API sintética interceptada: 12 rutas admin, modal sin enviar, expansión
incidencia/error, destino de acción, 1536/1024/390, reduced-motion y aislamiento
terapeuta. No prueba productiva de datos reales ni responsive completo.
Fetch: origin/dev avanzó a 61e6a39, contiene V63–V66 y refinamientos de correo;
esta versión continúa como V67. No integrados ni publicados en este corte local.
Pendiente: aprobación visual e integrar dev/reverificar antes de publicar; conservar
.gitignore previo del usuario. Sin cambios de arquitectura ni ADR necesarios.

## V68 — integración y publicación del administrador

2026-10-11. Publicación visual aprobada por el usuario. Integración de V67
5312b27 con origin/dev 61e6a39, conservando sus cambios de citas/sesiones,
adjuntos y correos. Los dos conflictos documentales (contexto/progreso) se
resolvieron conservando ambas secciones; sin conflictos en código. Backend
idéntico a dev: ninguna modificación propia de backend ni operación de BD.
Verificación nueva: tipos/check360/build1917 PASS; 25 rutas +293 componentes en
21 archivos PASS; 9 unitarias de correo PASS. Chrome: 12 rutas admin y modal,
incidencias/error/destino de acción, 1536/1024/390, Nunito/imágenes/movimiento
reducido y aislamiento terapeuta PASS con todas las API interceptadas. Sin
cuentas reales, escrituras, correos enviados, migraciones ni Zoom. Graphify
refresh/check, diff/secretos y referencias revisados. Evidencia integration-v68.
Publicación dev y codex/landing-publica, sin force-push; SHA final y resultado
efectivo consultables en Git/remoto. .gitignore del usuario queda fuera del commit.
El push no certifica despliegue Render; siguiente paso: aceptación visual con la
cuenta administrativa del usuario. Responsive completo permanece diferido.
## V76 — formularios ADMIN y documento DNI / 2026-10-11

La creación de familia usa tres pasos: identificación, contacto/dirección e hijos.
El alcance actual admite únicamente DNI de ocho dígitos. El valor se mantiene en el
estado local `formPadre.numero_documento` para la futura consulta RENIEC, visible y
deshabilitada, pero no se envía ni persiste. La tabla `tutores` conserva su estructura
inicial. Cada hijo se captura individualmente, con edad de 3 a 12 años, y se añade a
la lista antes de crear la cuenta.

Edición de cuentas, alta/edición de usuarios y alta/edición de pacientes reutilizan
`AdminFormDialog`: cabecera, jerarquía, panel lavanda, campos blancos y pie de acciones
del sistema visual V67. Auditoría ya no muestra el aviso descriptivo azul superior.

Durante la revisión se comprobó `/health/ready` y una consulta de usuarios. El 503 de
Gestión de Cuentas era causado por una modificación ORM local que esperaba columnas
no existentes en `tutores`; esa modificación y su migración se retiraron por decisión
del usuario. No se ejecutó DDL ni se modificó la base compartida.

## Sistema visual: glassmorphism / V75

La versión 1.1 de `docs/design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md` documenta glass opt-in: 84% blanco, borde violeta 12%, blur 14px sobre fondos claros; fallback blanco y móvil opaco sin blur bajo 768px. Reservarlo para navegación, tarjetas ilustradas y paneles breves. Formularios y datos clínicos mantienen superficies sólidas. La landing ya aplica glass selectivamente; otros módulos no se consideran migrados por esta especificación. Contraste se revisa sobre el fondo final.

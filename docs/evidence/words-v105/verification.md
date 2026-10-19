# Palabras por edad y primer juego de micrófono — V105

Fecha: 2026-10-19, America/Lima. Repositorio:
https://github.com/sromansilva/ashakids-platform . Rama dev.
Base auditada para implementar: 0aa0360d556981a72ce494ebc0856db7e958798c (V104).
Cierre: V105_Personalizar_Palabras_Edad_Microfono; SHA final consultable en Git.
Verificación de implementación, no una auditoría académica nueva. Todas las cifras
inferiores proceden de ejecuciones de esta entrega.

## Entregado

Selección inicial de ocho actividades entre once para 4–5, 6–7 y 8+ usando fecha
de nacimiento, años cumplidos en Lima y validación de fechas. Fecha ausente/futura/
inválida no inventa edad: selección inicial y explicación familiar. Menores de
cuatro reciben aviso de acompañamiento. Agrupaciones editoriales pendientes de
revisión profesional; no son una escala de desarrollo ni restringen permisos.
Catálogo familiar completo, modos de ayuda y actividades históricas conservados.

Nombra el dibujo: tres palabras por partida, dos bancos, imagen/modelo audible,
captura por pulsación, límite10s/5MB, reproducción local, comparación del texto
reconocido, confirmación para avanzar y alternativa de selección de imágenes.
No muestra porcentajes de pronunciación. Error, audio vacío o desacierto no
completan rondas. Se detiene/cancela al salir, cambiar niño u ocultar página;
ignora permisos y respuestas tardíos, aborta peticiones y revoca blob URLs.

Reutiliza transcripción existente sin id_paciente/nivel/clave_intento, sin nuevos
intentos/XP/medallas. No BD, cuentas, migraciones, permisos ni endpoints nuevos.
Cliente HTTP admite señal de cancelación; extensión de OGG conservada en subida.

## Comprobaciones nuevas

| Comando / recorrido | Resultado | Evidencia |
| --- | --- | --- |
| npm run typecheck | PASS | typecheck.txt |
| npm run check:frontend | PASS,416 archivos; máximo495 líneas | frontend-check.txt |
| npm run test | PASS,25 rutas y383 componentes/33 archivos | frontend-tests.txt |
| npm run build | PASS,1956 módulos | build.txt |
| pytest tests/test_reconocimiento_voz.py -k 'not endpoint' -q | 16PASS,2deseleccionadas; incluye inferencia Whisper real con tono sintético | backend-voice.txt |
| verify-browser.cjs, Chrome con API interceptada | 7casos,13layouts,0errores JS/0escrituras persistentes | browser-results.json/browser.txt |
| manage.py refresh y check | PASS,2897nodos/126comunidades | graphify-refresh.txt/graphify-check.txt |

Los casos nuevos de componentes prueban cumpleaños/límite UTC-Lima, fechas
inválidas y franjas, catálogo, coincidencia/desacierto, confirmación, tres rondas,
alternativa, permisos, permiso tardío, cancelación, respuesta tardía, límite de
tiempo/tamaño, vacío, error y ocultación. Las actividades anteriores se recorren en
ambos modos en su suite existente. Los 59 casos focalizados iniciales también
pasaron; la ejecución completa posterior es la evidencia final conservada.

Chrome: edades4/6/8, catálogo familiar, captura con MediaRecorder real sobre
dispositivo ficticio, reproducción del blob, resultado simulado incorrecto/correcto,
completar tres rondas, cancelar al cambiar niño y limpiar la visita, permisos
denegados, tres rondas con imágenes en ambos modos e inicio por teclado. Menú a
320/390/768/1366 y resultado a esos cuatro anchos; meta/juego/denegación a390.
Layouts sin overflow, imágenes rotas ni botones menores de44px. PNG revisados:
menu-1366 y recognized-390, sin defectos que impidan uso. No todas las pantallas
de la aplicación quedan cubiertas por este recorrido.

## Entorno, avisos y límites

Windows, Node22.15.0, Vite6.4.4, Python3.11.9, Chrome instalado; frontend5174 y
backend8000 existentes. Instalado faster-whisper1.2.1 y sus dependencias sólo en
backend/.venv conforme al rango ya declarado; no cambia requirements ni lockfiles.
Modelo base CPU/int8 descargado a caché local y cargado correctamente. Inferencia
real sobre tono sintético aprobada; no certifica reconocimiento de voz infantil,
precisión fonética, latencia de producción ni audio oído por una persona.
La prueba de navegador usa respuestas ASR simuladas y no autentica usuarios reales.
Se excluyeron dos pruebas HTTP backend; no se crearon sesiones ni datos compartidos.

Avisos: Node ExperimentalWarning por strip-types; Graphify22 archivos sin símbolos;
caché Hugging Face sin symlinks en Windows y descarga pública sin token. No son
fallos de ejecución. Preparación corregida: el test usaba una opción exact de
Playwright que Testing Library no admite; eliminada y tipos finales aprobados.
Playwright no está instalado en frontend/node_modules de este clon: se usó el
paquete del runtime mediante PLAYWRIGHT_MODULE, sin añadir dependencias al proyecto.

En navegadores sin WebM/OGG compatible se ofrece la alternativa de imágenes. El
plazo45s puede agotarse en servidores lentos; no se certifica Render ni despliegue
remoto de ASR. Objetivo de treinta juegos por cada mundo, elección profesional
persistente y guardado de esta práctica siguen pendientes. No se afirma eficacia
pedagógica/terapéutica. Arte reutilizado y badge de micrófono de lucide-react.

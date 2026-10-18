# Diez juegos de La Isla de las Palabras — 2026-10-16

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: `dev`.
Base: `7bb67e130251113a9eb81055353ed4c8c44cfdcc` / V100.
Cierre: `V101_Implementar_Juegos_Palabras`; consultar SHA definitivo en Git.
Verificación de una implementación; no es una auditoría académica nueva.

## Alcance implementado

1. Tesoro de palabras: tres rondas de vocabulario palabra-imagen, pista hablada opcional.
2. Parejas escondidas: memoria de tres parejas, imágenes ocultas hasta tocar y reintento explícito.
3. Cestas de colores: seis imágenes clasificadas en frutas/animales, por toque o arrastre.
4. Pequeña historia: tres pasos semilla/regar/flor, selección ordenada y comprobación.
5. Amigos al revés: tres conexiones grande/pequeño, día/noche, arriba/abajo.
6. Taller de sílabas: gato, manzana, mariposa mediante fichas ordenables por toque.
7. Merienda de la isla: añadir/quitar frutas hasta cantidades2/3/4 y comprobar la cesta.
8. Dónde está mi amigo: colocar dentro/encima/debajo de una caja con zonas visuales;
   toque o arrastre, destino exterior como alternativa de reintento.
9. Rimas: gato/zapato, manzana/banana y zapato/gato, tres rondas con opciones ilustradas.
10. Tren de frases: tres frases de tres vagones, recomposición y cambio del orden.

Menú libre, repetición, feedback sin penalizaciones, foco, teclado y movimiento reducido.
Práctica en memoria de la visita, sin XP, medallas ni POST de intentos. Se preserva el
catálogo basica-1 y su flujo guardado en «Para la familia»; acceso/asignación siguen
en la API existente. Cambio de niño/mundo desmonta el juego. No nueva BD/API/dependencias.

## Arte y rendimiento

24 ilustraciones ImageGen propias en atlasRGBA, extraídas completas a WebP transparentes
288×288, 376156bytes totales. Original/prompt/coordenadas conservados; hero/isla reutilizan
el arte existente de la landing. No emojis como protagonistas ni imágenes de personas.
Verificación de paridad por hash de los24WebP con la compilación final:0diferencias.

## Verificación inicial del 16 de octubre y cierre del 18 de octubre

Node/React/Vite del proyecto, Windows, preview127.0.0.1:5174. Chrome real headless;
API sintética interceptada antes de red. SpeechSynthesis se instrumenta en el recorrido
para comprobar los textos solicitados, sin afirmar síntesis audible en el dispositivo.
Los juegos tienen alternativa visual/textual si la voz no existe/falla.

`verify-browser.cjs`: diez juegos completados y reiniciados,44layouts
(menú+10juegos ×320/390/768/1366),0erroresJS,0escriturasAPI. Clasificación con arrastre
de ratón nativo, selección con Espacio/Enter y partida completa en contexto táctil real.
Comprobación de imágenes cargadas, controles visibles≥44px y ausencia de overflow
horizontal. Capturas nuevas de los diez juegos/éxitos y menú. Inspección visual de
arte/menú/móvil; no se certifican otras pantallas ni un estudio de accesibilidad completo.

Vitest añade12casos con error/reintento/finalización/reinicio de los10juegos y foco,
limpieza de voz, imagen fallida y ausencia de escrituras. El test de Centro Familiar
que esperaba el antiguo nivel directo se actualiza a la colección nueva; el de
persistencia sigue probando el flujo anterior a través de «Para la familia».
La ejecución inicial del 16 de octubre aprobó 347 pruebas de componentes y 25 rutas.
El 18 de octubre se repiten tipos, estructura, compilación, suite y recorridos de
navegador antes de publicar; sus logs llevan el sufijo `current`. No se presentan
las pruebas anteriores como ejecuciones nuevas. El mapa local contiene 2843 nodos.

Cierre del 18 de octubre: tipos sin errores, estructura 410 archivos, build 1952
módulos, 25 rutas y 347 pruebas de componentes en 31 archivos aprobados (134.19 s).
El nuevo recorrido Chrome aprobó los diez juegos y 44 layouts, teclado, toque,
arrastre y movimiento reducido; cero errores JS y cero escrituras API.
Graphify advierte de 22 archivos sin símbolos extraíbles; no es un fallo de runtime.

## Incidencias y límites

Recorte inicial por cuadrícula dejó pequeños fragmentos vecinos del atlas; se corrigió
extrayendo los límites alfa de cada objeto antes de las capturas finales. El primer
verificador contaba un botón oculto de details como objetivo demasiado pequeño;
se corrigió para medir sólo controles visibles. Fallo heredado de expectativa de ruta
en Centro Familiar actualizado sin retirar su comprobación de cambio de paciente.

No cuentas/pacientes, operaciones clínicas o escrituras en Supabase para pruebas.
No inferencia clínica ni persistencia nueva: las marcas «Jugado en esta visita» se
reinician al desmontar/recargar. Pronunciación/disponibilidad de la voz requiere
aceptación humana en los dispositivos finales; sin reconocimiento de voz/ML nuevo.
Contenido educativo pendiente de revisión profesional para edad/objetivos de cada niño.

Durante el cierre se intentó abrir el harness de desarrollo desde `vite preview`:
esa página de pruebas no forma parte de dist y el recorrido no pudo comenzar. Se
repite en Vite de desarrollo, puerto 5175, con las mismas fuentes y API sintética.
El tipo `exact` de Playwright se había usado en dos consultas de Testing Library;
se retiró de los helpers de pruebas y el control de tipos pasa. Un intento de Vitest
desde la raíz tampoco ejecutó pruebas por resolución de alias; la ejecución correcta
se realiza desde frontend. Estas incidencias no se ocultan como pruebas aprobadas.

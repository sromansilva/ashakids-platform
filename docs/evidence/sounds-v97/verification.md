# Implementación de juegos de sonidos — 2026-10-16

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: `amparitomaxi`.
Base integrada por fast-forward: `f93f88957e2cf4d342f5004ce0489484783d96af` (dev).
Corte de cierre: `V99_Implementar_Juegos_Sonidos`; el SHA definitivo se consulta en Git.
El ID de evidencia sounds-v97 se conserva desde la preparación anterior al avance
concurrente V98. La base final incorpora dev `4cdd97b` sin cambiar el módulo VOZ.
Esta es verificación de una implementación, no una auditoría académica nueva.

## Alcance

Tres juegos en HABLA/Taller de los Sonidos: exploración de cuatro animales,
identificación en cinco rondas de dos/tres opciones y asociación en dos etapas de
dos/tres parejas por toque o arrastre. Sesión libre, sin cronómetro/vidas/penalización.
Audios MP3 locales y SVG originales con créditos consultables. Audio no superpuesto,
silencio/repetición, cancelación al salir, estados de carga/error y movimiento reducido.
Los ejercicios anteriores con persistencia siguen disponibles. Los juegos nuevos no
otorgan XP ni se envían a la API: práctica en memoria de la visita (ADR0025).

## Entorno y comprobaciones

Windows, Node/Vite/React/TypeScript del proyecto. Preview Vite 127.0.0.1:5174.
Chrome real headless mediante Playwright del runtime de herramientas. Sesión familiar,
niño y catálogo sintéticos: todas las rutas API del navegador se interceptan antes de
la red. MP3/SVG reales servidos por Vite, sin falsificar eventos de reproducción.
No se inicia sesión real ni se modifica PostgreSQL/Supabase para estas pruebas.

Comandos y resultados finales se conservan en los archivos de este directorio.
`verify-browser.cjs` reproduce el recorrido y genera `browser-results.json` y capturas.
Las pruebas de componentes usan HTMLMediaElement simulado; el navegador complementa
esa limitación reproduciendo/decodificando los archivos y verificando sus eventos.

## Incidencias resueltas y límites

La prueba inicial de un botón de audio esperaba un nombre accesible exacto, pero el
texto auxiliar formaba parte del nombre: se hizo estable el nombre «Escuchar sonido».
El arrastre automatizado inicial movió una imagen por el desplazamiento suave del
panel: el verificador coloca ambos extremos visibles con desplazamiento instantáneo
y mueve el ratón para generar eventos nativos. Las ilustraciones no son arrastrables.
Chrome detectó que volver al menú enfocaba un botón ya desmontado: se restaura el
foco en la nueva instancia del botón de nivel. Se añadió regresión de componente.

Se verifican decodificación, señal no silenciosa, reproducción y correspondencia de
las rutas con los animales; no una sesión de escucha humana ni calibración acústica
entre dispositivos. No evaluación clínica, validación profesional de contenidos,
reconocimiento de voz, certificación de accesibilidad ni pruebas de carga.
No se recibió la imagen de referencia mencionada en el texto; se usaron la descripción
detallada y la sección HABLA existente. No faltan medios para los cuatro animales.

## Resultado final sobre dev V98 integrado

- `npm run typecheck`, `npm run check:frontend`: PASS, 402 archivos.
- `npm run build`: PASS, 1945 módulos.
- `npm test`: 25 rutas y 335 componentes en 30 archivos, PASS.
- Pasada focalizada anterior: 13 casos en dos archivos, PASS; no sustituye la suite final.
- `verify-browser.cjs`: seis recorridos y diez layouts, PASS, cuatro MP3 con señal,
  sin errores JS, sin escrituras API. `verify-keyboard.cjs`: pareja completa con
  Espacio/Enter y retorno de foco, PASS. No se usan credenciales reales.
- Graphify refresh AST local y check: vigente, 2779 nodos y 127 comunidades.
  Advertencia: 22 fuentes sin símbolos extraíbles. No LLM ni análisis de secretos.
- Node avisa sobre Type Stripping experimental; no fallos ni pruebas omitidas.

La suite previa a integrar V98 tuvo 329 casos; el resultado final335 incluye también
las seis pruebas de voz del equipo. No se ejecutó Whisper ni se descargaron modelos.
Los conflictos de contexto/relevo se resolvieron conservando ambas entradas; el
código de voz remoto sigue intacto. No se aplicaron migraciones ni dependencias de
voz al entorno API del usuario para esta extensión de sonidos del frontend.

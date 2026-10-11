# Mundo ASHA: mapa web y juegos en modal

Repositorio: https://github.com/sromansilva/ashakids-platform . Fecha: 2026-10-11, America/Lima.
Corte visual: world-map-v70. Rama de trabajo: feat/piero-dev. Base: 980a3eb42ee3b433709db77482ef50fa5436163f (V69). El commit de este conjunto identifica el SHA de entrega; la versión de API continúa igual.

## Cambio y alcance

Mapa con las cinco ilustraciones existentes de la landing sobre un paisaje nuevo. Hover y foco elevan cada ilustración. Los mundos sin asignación siguen visibles y deshabilitados; no se entregan ejercicios nuevos ni se otorgan permisos. La ruta de cada mundo usa su ilustración y color, tres niveles cuadrados con acceso libre y el juego existente dentro de un dialog nativo. Se conserva el servicio HTTP, UUID de intento, validación del servidor, XP y medallas por niño. No se cambia backend, esquema o autenticación.

Diseño y aceptación de escritorio. Responsive diferido explícitamente por el usuario; el apilado básico no acredita diseño o aceptación móvil. Juegos definitivos y revisión profesional de contenidos siguen pendientes. Esto documenta la implementación y su verificación; no es una nueva auditoría académica ni hereda cifras de auditorías anteriores.

## Verificación nueva

- `npm run typecheck`: PASS.
- `npm run check:frontend`: PASS, 366 archivos en el árbol preparado, máximo 500 líneas.
- `npx vitest run tests/demo-worlds.test.tsx tests/login-destination.test.ts tests/access.test.tsx`: 13 PASS en tres archivos, incluidos siete casos de mundos. Comprueba nivel 3 primero, reintento con el mismo UUID, cambio de hijo, retorno de landing, asignación, cinco mundos y cierre sin guardar.
- `npm run test:routing`: 25 PASS; comprobación de rutas, no cobertura visual completa.
- `npm run build`: PASS, 1921 módulos en el árbol preparado.
- `PLAYWRIGHT_MODULE=<runtime>/playwright PREVIEW_URL=http://127.0.0.1:5177 EVIDENCE_OUT=docs/evidence/world-map-v70/publish-tree node docs/evidence/world-map-v70/verify-browser.cjs`: PASS. Chrome, escritorio 1536/1440/1280 × 1024. Cinco mundos, imágenes cargadas, cero overflow horizontal, botones de mínimo 44 px, hover, cinco rutas y cinco modales, Enter/Tab/Escape, devolución de foco, bloqueo de cierre al guardar, selección/orden, nivel 3 primero, cambio de niño, cinco mundos deshabilitados, error y reintento, reduced-motion. Cero errores JS.
- Detector Impeccable sobre los cinco objetivos UI: `[]`.
- Graphify: refresh/check AST local sin LLM, mapa no versionado. Cierre: 2542 nodos/113 comunidades y `Knowledge map is current`, advertencia de 15 fuentes sin símbolos. Un check intermedio detectó cambios concurrentes del equipo; el refresh de cierre los incorporó.

La primera compilación general (1923 módulos) y el browser de :5176 incluyen cambios locales de otros módulos y se distinguen de la copia aislada. `publish-tree/` contiene las capturas/resultados de la copia aislada del árbol preparado 1dab3611d5fba09fa7444de29a6901b340ede02e, con sólo las fuentes versionadas más este cambio. No incluye la reforma del terapeuta en curso. Tipos/check/tests/build de entrega se repitieron allí; no se repiten indiscriminadamente todas las suites.

## Incidencias resueltas y advertencias

Primer intento de npm desde la raíz falló porque package.json está en frontend; corregido el cwd. Primera ejecución browser interceptaba `/src/api/client.ts` por un patrón demasiado amplio; acotado a `/api/v1/**` antes de los resultados válidos. Tab alcanzaba el chrome del navegador al completar la vuelta: añadido confinamiento explícito del foco y verificado en Chrome. Se redujo la altura del mapa tras la primera inspección. Advertencias de Node `DEP0205` y conversión LF/CRLF, sin fallo de compilación.

Toda API de la prueba de navegador se interceptó. Datos sintéticos Ana/Luis Demo, IDs 901/902 y familia fixture; un POST de intento sintético, ninguna escritura real. El endpoint de progreso real sigue devolviendo los cinco mundos y retira `levels` de los no asignados (confirmado leyendo backend/app/services/juegos.py). No se ejecutaron pruebas backend/BD, login real, correo ni servicios externos. La voz/pista conserva speechSynthesis existente, sin medir su calidad.

## Recursos y evidencia

Fondo original `frontend/public/illustrations/asha-map-v70.png`, derivado servido `asha-map-v70.webp`: 1536 × 1024, 2 382 679 frente a 215 084 bytes. Se usó ImageGen integrado para el fondo; PNG originales de mundos conservados y variantes WebP existentes reutilizadas. Prompt en [image-prompt.md](image-prompt.md). Derivación local con Pillow quality=86/method=6; no edición manual del contenido generado.

Capturas principales de entrega: [mapa](publish-tree/map-1536.png), [niveles](publish-tree/levels-lenguaje-1536.png), [juego](publish-tree/game-lenguaje-1536.png). Otros mundos, estados, layouts y requests en [browser-results.json](publish-tree/browser-results.json). Resultados iniciales de la copia de trabajo conservados en el directorio superior y no confundidos con el árbol de publicación.

Publicación: registrar resultado real de commit/push/CI y coincidencia de refs en el cierre; este documento por sí solo no acredita un deploy. Cambios ajenos del equipo excluidos del commit y conservados localmente.

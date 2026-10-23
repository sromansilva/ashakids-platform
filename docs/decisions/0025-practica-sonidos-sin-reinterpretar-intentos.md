# 0025 — Práctica de sonidos y actividades guardadas

Fecha: 2026-10-16. Estado: implementada en la experiencia de sonidos.

## Contexto

El usuario solicita tres juegos de animales en Taller de los Sonidos. El catálogo
`basica-1` y sus intentos existentes representan palabras y frases diferentes.
Enviar resultados del nuevo juego como respuestas del catálogo anterior atribuiría
XP y niveles a ejercicios que no se realizaron.

## Decisión

Al abrir HABLA, el frontend presenta los tres juegos como práctica de la visita,
sin POST de intentos, XP ni medallas. Conserva las actividades anteriores y sus
contratos mediante «Para la familia → Actividades con progreso guardado».
El acceso sigue dependiendo de la sesión familiar y del mundo asignado por la API;
no se añaden rutas públicas, permisos, almacenamiento local ni autenticación nueva.

Contenido e ilustraciones/audio locales viven en `SoundGames` y
`frontend/public/sounds/animals`. Un reproductor por instancia cancela el audio al
cambiar de actividad, silenciar, ocultar la página o desmontar. Sólo un clip que
termina correctamente cuenta como escucha. Los niveles se pueden visitar libremente.

## Consecuencias

La nueva práctica funciona sin alterar el significado de datos históricos. Su avance
se reinicia al salir/cambiar de niño/recargar; se informa en la UI. La persistencia de
estos nuevos ejercicios requiere un catálogo versionado y validación del servidor
en una extensión futura; no está implementada ni se presenta como terminada.
No hay cambios de tablas, migraciones ni escrituras sobre la BD compartida.
No se infiere progreso clínico. Las licencias y ediciones de audio se documentan
en `frontend/public/sounds/animals/CREDITS.md` y se enlazan desde el juego.

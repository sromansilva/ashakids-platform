# ADR0026 — Selección orientativa por edad y voz transitoria en Palabras

Fecha: 2026-10-19. Estado: adoptado para la primera entrega de selección y micrófono.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama dev, base 0aa0360 (V104).

## Contexto

El usuario solicita un catálogo aproximado de treinta juegos por mundo, mostrando
unos ocho según la edad del niño, y juegos de Palabras con respuesta oral. Esta
entrega inicia ese objetivo en LENGUAJE con los diez juegos existentes y uno nuevo;
no declara terminado el catálogo de treinta ni aplica el filtro a otros mundos.

## Decisión

- Usar fecha_nacimiento del paciente ya autorizado, recibida vía FastAPI, para
  calcular años cumplidos con calendario America/Lima. No guardar una segunda edad.
- Elegir ocho juegos por bandas editoriales 4–5, 6–7 y 8+. No son normas de desarrollo,
  diagnóstico ni un nuevo permiso. Mantener la asignación de mundos del terapeuta.
- Conservar los dos modos de apoyo y acceso al catálogo desde Para la familia.
  Falta/fecha inválida: ocho iniciales y explicación, sin inventar edad. Menores
  de cuatro: misma selección inicial y aviso de acompañamiento profesional/familiar.
- Nombra el dibujo tiene tres rondas. Captura exclusivamente por acción del usuario,
  máximo diez segundos/cinco MB, reproducción local y confirmación de coincidencia
  textual antes de avanzar. La alternativa de imágenes exige selección correcta.
- Reutilizar POST /educacion/voz/transcribir sin paciente/nivel/UUID de intento;
  así no ejecuta la persistencia de VOZ/basica-1. No reinterpretar intentos históricos
  ni otorgar XP/medallas. Se conserva el límite de práctica de ADR0025.
- No mostrar un porcentaje de pronunciación. El sistema reconoce texto y puede
  equivocarse: no realiza comparación acústica/fonética ni evaluación clínica.
- Cancelar subida y apagar pistas al salir, cambiar niño, cancelar u ocultar página;
  ignorar respuestas y permisos tardíos; revocar URL local de grabación. Subida con
  AbortSignal y plazo de respuesta de 45s. El servidor conserva su limpieza temporal.

## Consecuencias y pendientes

Sin esquema, migración, permiso ni endpoint nuevo. La edad ordena la experiencia
en React; FastAPI mantiene la autorización existente. Sin progreso persistente de
estas once actividades. Preparar el motor/modelo ASR es requisito operativo local
y de despliegue; no basta con que la UI grabe. Se necesita aceptación humana de
micrófono, latencia y reconocimiento con los dispositivos de las familias.

Las bandas y selección requieren revisión del profesional; no se infiere que todos
los niños de igual edad tengan iguales habilidades. Quedan pendientes ampliar a
treinta actividades por mundo, catálogo versionado, personalización profesional
persistente y nueva definición de progreso si se solicita.

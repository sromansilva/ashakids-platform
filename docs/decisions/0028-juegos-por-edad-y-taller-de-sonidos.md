# ADR0028 — Nueve juegos por edad y ampliación del Taller de los Sonidos

Fecha: 2026-10-19. Estado: adoptado.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama `dev`, base V107 `503296d1866a8aeafc36782e5b8a7081a843b009`.

## Contexto

La Isla y el Taller son mundos infantiles. El usuario solicita nueve actividades
visibles por edad, que el Taller gane juegos propios y que la voz sea cálida como
la de la Isla. La meta aproximada de treinta actividades por mundo continúa como
ampliación gradual.

## Decisión

- Compartir el cálculo de edad calendario en America/Lima con la fecha de nacimiento
  autorizada del paciente. Seleccionar nueve juegos por bandas editoriales 4–5,
  6–7 y 8+. Para fecha inválida, mostrar nueve actividades iniciales con apoyo;
  para menores de cuatro, añadir un aviso para acompañar. No duplicar la edad ni
  usarla como permiso de acceso profesional.
- Mantener once actividades en este corte para cada uno de los dos mundos y dejar
  accesible a la familia el catálogo completo. No afirmar que el objetivo de treinta
  actividades por mundo ya esté terminado.
- Conservar las cuatro actividades de HABLA y añadir siete retos: comparar sonidos,
  ordenar una secuencia, contar repeticiones, emparejar por sonido, encontrar el
  sonido ausente, reconocer primero/al final y detectar un sonido diferente. Cada
  reto tiene tres rondas, dos modos con cantidad ajustada, una pista y respuesta
  verificable.
- Compartir el reproductor de voz estática es-PE-CamilaNeural que usa la Isla,
  velocidad y volumen -8%. Preparar previamente sólo textos públicos. Servir MP3 e
  ilustraciones WebP desde los recursos estáticos del mismo origen, sin síntesis
  remota durante el juego ni grabaciones de niños en HABLA.
- Mantener esta práctica de visita sin nuevas tablas, endpoints, XP/medallas,
  persistencia, permisos o evaluación de pronunciación. Conservar los resultados
  históricos de `basica-1`.

## Consecuencias y pendientes

React elige la selección; backend y asignación profesional conservan el contrato.
La visita se reinicia al salir o cambiar de niño. Cancelar el audio al navegar,
ocultar la página o iniciar otro sonido. La voz es sintética, no infantil ni clonada.
Su calidez editorial y las bandas necesitan aceptación humana; no son normas de
desarrollo ni evaluación clínica. Siguen pendientes aproximadamente treinta juegos
por mundo, revisión profesional del contenido y prueba auditiva por familias.

## Evidencia

Alcance, pruebas, capturas y hashes en [sounds-v108](../evidence/sounds-v108/verification.md).

# ADR0020 — simulación persistente de cinco mundos

Fecha:2026-10-10. Estado:aceptado para entrega básica.

## Contexto

La entrega necesita niveles navegables libremente, intentos durables, experiencia y medallas
por niño. El usuario aplaza juegos definitivos y diseño. Los modelos físicos educativos
existentes relacionan mundos con actividades de cada paciente.

## Decisión

React consume FastAPI HTTP/JSON; SQLAlchemy escribe PostgreSQL. El catálogo servidor
`basica-1` define cinco mundos y tres niveles cada uno. La API crea actividad, objetivo,
mundo y niveles por paciente al primer intento; no remodela FKs ni borra históricos.
resultados_nivel conserva cada envío (incluso error de respuesta); UUID global idempotente,
versión/solicitud en JSON y experiencia_otorgada permiten rastrear premios.

Una transacción bloquea la fila paciente y valida tutor, paciente activo y plan vigente.
Respuesta correcta calculada en backend, XP100por primer nivel/version y medalla100por
mundo completo. Perfil acumula XP y nivel1+XP//200; perfil_logros evita repetir la medalla.
Las sesiones y reportes clínicos conservan sus métricas propias. La UI no guarda premios
optimistas ni interpreta salto como aprobación. Cambiar el hijo cancela la vista anterior.

Migración008 explícita añade columnas nullable para históricos, índices, catálogo medallas,
cinco áreas de plan y permisos/RLS del rol privado. Se aplica fuera del arranque con backup;
solo el backend privado usa ese rol, cuyo acceso por paciente se limita en servicios API.
No Supabase Auth ni acceso frontend directo a tablas. db_creation incorpora la misma extensión.

## Consecuencias y límites

Actividades/objetivos reflejan participación en simulación, no cumplimiento clínico.
La cronología de intentos, versión, aciertos, respuestas, tiempo y ayudas queda disponible
para construir después un dataset. Tiempo/ayudas no son telemetría confiable de atención.
No hay modelo ML, diagnóstico, audio, deglución ni inferencia emocional. VOZ/OROFACIAL
son preguntas de identificación; requieren revisión profesional antes de uso terapéutico.
Una versión nueva debe decidir política de recompensas/medallas antes de publicarse.

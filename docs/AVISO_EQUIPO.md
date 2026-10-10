# Punto de continuidad del equipo

Equipo: continuamos en `codex/2do-intento`, desde vuestra base V32/ebb8632.
El corte nuevo es `V38_Rediseno_Landing_UI`: hagan fetch y usen su SHA publicado.
V38 pule solo la landing: paleta de marca, glass, luz difuminada, arte «hola» y
microinteracciones. Sin cambios de lógica ni BD; después sigue cada rol en un commit separado.

El núcleo local V33–V36 y notificaciones/preferencias V37 conservan su estado probado.
Asesor es una persona con acceso ADMIN. Juegos rotulados demo, progreso solo en pestaña.
Migraciones003–005 ensayadas únicamente en PostgreSQL local, no en Supabase compartido.
La regla de modificar horario semanal con anticipación quedó fuera del alcance.
Avatar/calificación y conexiones educativas no se declaran implementados por este cambio visual.

Antes de continuar lean PROJECT_CONTEXT.md, IMPLEMENTATION_PROGRESS.md,
FLUJO_MAESTRO_ACTUALIZADO.md y DESIGN.md. Evidencia visual: docs/evidence/landing-v38/.
Newsletter/afirmaciones heredadas de la landing requieren revisión funcional aparte.
Publicación solo en esta rama; dev/feat/piero-dev y adopción compartida requieren autorización.

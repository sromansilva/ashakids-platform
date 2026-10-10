# Punto de continuidad del equipo

Equipo: continuamos en `codex/2do-intento`. El punto de partida fue vuestro commit
`V32/ebb8632`; los avances llegan a `V37_Implementacion_Notificaciones_Terapeutas`.
Hagan fetch y usen el último SHA publicado de esa rama; `dev` todavía conserva V32.

El asesor es una persona con acceso **ADMIN**, como aclaró el usuario; se usa el rol
administrador existente para este flujo, sin crear otro rol técnico.

Está listo el registro familiar, la activación obligatoria, la disponibilidad y
la reserva introductoria por niño, el plan profesional y el historial autorizado.
La maqueta ya conecta paneles, agenda por niño, enlace externo y juegos demo al nuevo
flujo, a nuestro estilo. El núcleo se mostró funcionando localmente con dos niños,
otro terapeuta, cierre de atención, reingreso, PDF y práctica hasta completar/repetir
un mundo. Asignación profesional guardada; progreso del juego solo demo en la pestaña.

Ahora la bandeja y preferencias del terapeuta también funcionan y se guardan en servidor.
Migración005 solo ensayada localmente; avisos por reservas/cambios/cancelaciones/mensajes
y recordatorios opcionales con API activa. Aún pendientes otros campos demo y la regla
de cambiar disponibilidad con siete días de anticipación.

No migrar ni probar escrituras en Supabase. Consultar `IMPLEMENTATION_PROGRESS.md`,
`FLUJO_MAESTRO_ACTUALIZADO.md` y `acceptance/NUEVO_FLUJO.md` antes de continuar.
Siguiente paso del equipo: reproducir este corte y coordinar su adopción. Integrar
en dev/piero-dev o migrar la BD compartida requiere nueva autorización.

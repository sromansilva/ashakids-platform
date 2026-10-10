# ADR0015 — Plan desde atención y contexto profesional

Fecha:2026-10-10. Implementación en codex/2do-intento desde V34/84078ae.

El asesor registra y orienta; el profesional de una sesión iniciada con reporte publica
su plan mensual. Tratamiento conserva origen (FK única Sesion), área principal, mundos
FLUIDEZ/HABLA/LENGUAJE y 1..31 sesiones recomendadas. Mes usa primero del mes Lima;
no expira automáticamente ni limita las reservas por conteo/juegos.

Cada sesión publica como máximo una versión inmutable. La próxima atención puede conservar
el plan (solo reporte) o publicar otra versión: finaliza anteriores y conserva origen/autor.
Bloqueo del niño serializa publicación y reservas; índice parcial asegura una versión
profesional activa por expediente. El terapeuta de una reserva se elige aparte del autor.

V26 mantiene origen NULL, sin inventar introducciones ni convertir retrospectivamente
sus planes. No habilita terapia nueva sin introducción válida y plan con origen. La
transición requiere atención real; no se altera historia ni agenda preexistente.

Lectura profesional del contexto: cita propia futura CONFIRMADA, sesión EN_CURSO o
FINALIZADA/ASISTIO. Cancelación/expiración sin atención revoca el vínculo. Atención
registrada conserva lectura mientras cuenta activa; los administradores revocan cuentas.
Vínculo legado por plan sin origen se conserva para continuidad V26. Reportes/planes
ajenos son lectura; modificaciones requieren profesional de la sesión. API emite
puede_editar. Historial completo exige paciente/contexto explícitos; lista global de
sesiones sigue limitada al profesional, sin acceso indiscriminado. Chat texto habilita
contactos por estos vínculos, con lectura histórica por participantes como antes.

Migración004 explícita después de003, lock_timeout5s, sin cambiar grants/policies ni
crear tablas nuevas. Ensayo solo PG17.6 local; pendiente adopción coordinada y respaldo
en compartida. Reversión conservadora mantiene columnas/versiones exportables; no DROP.
Asignación de mundos sí se guarda en servidor; progreso educativo demo se difiere a V36
y no alimentará métricas clínicas ni las tablas/resultados educativos legados.

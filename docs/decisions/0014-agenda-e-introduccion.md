# ADR0014 — Turnos profesionales e introducción por niño

Fecha: 2026-10-10. Estado: implementado en codex/2do-intento; adopción compartida pendiente.
Base: V33, 45ee5abdeba6589b43eb67e79492e8493ab6a635.

La reserva V26 exigía un tratamiento y una confirmación posterior del profesional.
El flujo maestro requiere introducción sin plan, selección libre del profesional y
confirmación inmediata. Se conserva Reserva separada de Sesion y la creación clínica
por el profesional: no se inventa una sesión atendida al reservar.

## Decisión

- Reserva incluye tipo INTRODUCTORIA/TERAPIA; solo la introducción admite plan nulo.
  Las filas anteriores conservan tipo TERAPIA, IDs, horarios y estados. No se fabrican
  introducciones para pacientes anteriores.
- TurnosSemanal almacena día/hora por terapeuta, con unicidad; BloqueoAgenda conserva
  intervalos absolutos. Lectura de agenda no expone identidades de otras familias.
- Como mínimo técnico anunciado, lunes a sábado, inicios 08:00–17:00 en Lima;
  duración 45 minutos y horizonte de reserva 90 días. El profesional debe publicar
  disponibilidad explícita. No se habilita una jornada por defecto.
- Cambio de disponibilidad y reserva serializan sobre la fila del terapeuta. La reserva
  bloquea primero al paciente y después al profesional; vuelve a comprobar colisiones,
  ausencias y turno. Introducción pendiente única por niño también tiene índice parcial.
- Nuevas reservas y reprogramaciones se guardan CONFIRMADAS. La sesión clínica sigue
  siendo un registro separado; una cita con sesión registrada conserva el bloqueo V26
  de cancelación/reprogramación hasta definir una transición clínica coherente.
- Terapia requiere introducción finalizada con ASISTIO, reporte con contenido y plan
  activo. La comprobación es individual por ID del niño y se repite dentro de la
  transacción de reserva. La autoría/versiones del plan se completa en el siguiente avance.
- El directorio muestra solo profesionales activos y activados, sin contacto privado.
  Elegirlos no concede acceso clínico indiscriminado.

## Migración y límites

003_agenda_introduccion.sql se aplica explícitamente tras 002. Usa transacción y
lock_timeout de cinco segundos. Las dos tablas nuevas activan RLS sin políticas PUBLIC:
grants/políticas del runtime compartido requieren revisión de adopción por entorno.
Solo se ensayó en PostgreSQL local descartable, con rol de prueba sin bypass RLS y
políticas locales permisivas explícitas. No demuestra equivalencia con ACL de Supabase.

Restaurar NOT NULL exige resolver introducciones existentes sin perder historial;
no se ofrece una reversión que borre pacientes/reservas o cree planes ficticios.
Guardar horario nuevo no cancela citas confirmadas anteriormente.

Este corte no completa el flujo maestro: falta plan profesional con origen/áreas/mundos,
contexto autorizado para otro terapeuta, demo de progresión y aceptación final por roles.

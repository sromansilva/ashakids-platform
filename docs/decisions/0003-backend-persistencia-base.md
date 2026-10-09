# ADR 0003 - Persistencia base sobre el esquema existente

Fecha: 2026-10-08. Estado: implementado técnicamente; revisar reglas operativas con el equipo clínico.

## Contexto
La API solo exponía login, logout y perfiles. PostgreSQL ya contenía pacientes, expedientes,
tratamientos, reservas, sesiones y reportes. El frontend conserva clínica simulada.

## Decisión
- Extender capas api/services/schemas/models; evitar una migración de carpetas simultánea.
- Exponer reservas como `/api/v1/citas`, con `id_reserva` en respuestas para reflejar la persistencia.
- Crear tratamiento por ADMIN como asignación explícita entre familia y profesional. Si falta el
  expediente, abrirlo vacío sin escribir diagnósticos. La autoría clínica/edición de tratamiento
  se implementará al cerrar el contrato funcional, no se simula.
- Citas: PENDIENTE -> CONFIRMADA por profesional asignado/ADMIN; CANCELADA por participantes
  autorizados antes de registrar sesión; reprogramar devuelve a PENDIENTE.
- Sesión: PROGRAMADA -> EN_CURSO -> FINALIZADA. No iniciar antes del horario. NO_ASISTIO solo
  desde PROGRAMADA y después del final previsto. Cerrar marca cita COMPLETADA.
- Reportes en texto libre por profesional asignado/ADMIN, legibles por familia autorizada. No IA,
  diagnóstico automatizado, facturación ni videoconferencia real. Reportes editables tras cierre:
  falta historial de versiones/auditoría antes de uso clínico de producción.
- Estados legados desconocidos no se transforman automáticamente; se rechazan mutaciones ambiguas.
- Rechazar login sin roles válidos y seleccionar rol principal ADMIN > TERAPEUTA > PADRE.
- Persistir transacciones antes de enviar éxito HTTP; conservar errores de dominio y normalizar DB.
- Probar escrituras solo en una BD local descartable creada para la auditoría. Supabase solo SELECT.

## Consecuencias
No hay reescritura de DB ni pérdida de registros. Las interfaces nuevas requieren integración
frontend separada. Se mantiene el límite de 100 registros por página (limit/offset), sin total.
No se ofrece borrado físico, cambio de tutor/rol, reactivación de pacientes o anulación de sesión
cerrada: requieren contratos y trazabilidad. El bloqueo temporal solo protege escritores de la API.
No equivale a autorización de despliegue: resolver secretos, límites de tráfico, consentimiento,
auditoría clínica, privilegios DB, migraciones, copias/restauración y validación con staging.

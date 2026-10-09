import type { Appointment, Patient, Session, Treatment } from "@/types/clinical";

export const familyDate = (value: string) => new Date(value).toLocaleDateString("es-PE", { timeZone: "America/Lima" });
export const familyTime = (value: string) => new Date(value).toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit" });
const month = (value: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit" }).format(value);

/** Identity comes from patient IDs. Appointment counts never measure clinical improvement. */
export function summarizeFamily(patient: Patient, appointments: Appointment[], sessions: Session[], treatments: Treatment[], now = Date.now()) {
  const ownAppointments = appointments.filter(a => a.id_paciente === patient.id_paciente);
  const ownSessions = sessions.filter(s => s.cita.id_paciente === patient.id_paciente)
    .sort((a, b) => Date.parse(b.cita.fecha_hora_inicio) - Date.parse(a.cita.fecha_hora_inicio));
  const attended = ownSessions.filter(s => s.estado_sesion === "FINALIZADA" && s.asistencia === "ASISTIO");
  const running = ownSessions.find(s => s.estado_sesion === "EN_CURSO");
  const upcoming = ownAppointments.filter(a => ["PENDIENTE", "CONFIRMADA"].includes(a.estado_reserva) && Date.parse(a.fecha_hora_fin) > now)
    .sort((a, b) => Date.parse(a.fecha_hora_inicio) - Date.parse(b.fecha_hora_inicio))[0];
  const reportSessions = ownSessions.filter(s => s.reporte_disponible);
  const milestones = [
    { title: "Perfil del hijo", done: true, detail: "Perfil registrado" },
    { title: "Tratamiento", done: treatments.length > 0, detail: treatments.length ? "Asignación registrada" : "Sin tratamiento asignado" },
    { title: "Cita", done: ownAppointments.some(a => a.estado_reserva !== "CANCELADA"), detail: "Reserva no cancelada" },
    { title: "Sesión realizada", done: attended.length > 0, detail: "Finalizada con asistencia" },
    { title: "Reporte", done: reportSessions.length > 0, detail: "Disponible para la familia" },
  ];
  return { appointments: ownAppointments, sessions: ownSessions, attended,
    thisMonth: attended.filter(s => month(Date.parse(s.fecha_hora_inicio_real ?? s.cita.fecha_hora_inicio)) === month(now)).length,
    next: running?.cita ?? upcoming, reportSessions, latestReportSession: reportSessions[0], milestones };
}

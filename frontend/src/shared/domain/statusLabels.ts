/** Etiquetas legibles para estados clínicos. Los valores de datos y filtros no cambian. */
const reservation: Record<string, string> = {
  PENDIENTE: 'Por confirmar',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
};
const session: Record<string, string> = {
  PROGRAMADA: 'Programada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
};
const attendance: Record<string, string> = {
  ASISTIO: 'Asistió',
  NO_ASISTIO: 'No asistió',
};

function pretty(value: string) {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function label(map: Record<string, string>, value?: string | null, fallback = '') {
  if (!value) return fallback;
  return map[value.toUpperCase()] ?? pretty(value);
}

export const reservationStatusLabel = (value?: string | null) => label(reservation, value);
export const sessionStatusLabel = (value?: string | null) => label(session, value);
export const attendanceLabel = (value?: string | null, fallback = 'Asistencia pendiente') => label(attendance, value, fallback);

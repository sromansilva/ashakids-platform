export const APPOINTMENT_TIME_ZONE = 'America/Lima';

const WEEKDAY_NUMBER: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function getAppointmentLocalParts(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('La fecha de la cita no es válida.');
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const weekday = part('weekday');
  const year = part('year');
  const month = part('month');
  const day = part('day');
  const hour = part('hour');
  const minute = part('minute');
  if (!weekday || !year || !month || !day || !hour || !minute) throw new Error('No se pudo interpretar la hora local de la cita.');
  return {
    weekday: WEEKDAY_NUMBER[weekday] ?? 0,
    year,
    month,
    day,
    hour: Number(hour),
    minute: Number(minute),
    date: `${year}-${month}-${day}`,
  };
}

export function getNextCalendarDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('La fecha debe tener formato AAAA-MM-DD.');
  }
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

/** AshaKids appointments use Peru's fixed UTC-05:00 business time zone. */
export function appointmentLocalDateTime(date: string, hour: number, minute = 0): string {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-05:00`;
}

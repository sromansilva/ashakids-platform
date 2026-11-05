import { CalendarClock, Clock3, UserRound } from 'lucide-react';
import { reservationStatusLabel, sessionStatusLabel } from '@/shared/domain/statusLabels';
import type { Appointment, Session } from '@/modules/clinica/domain/clinical';

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  // Nunca se muestran miles de minutos: desde 1 hora se usan horas y días.
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, '0')} min`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Tiempo programado restante de una sesión en curso. Si arrancó antes de la hora programada,
 * la duración programada corre desde el inicio real; nunca devuelve más que esa duración.
 */
export function remainingScheduledTime({ start, end, now, realStart }: { start: number; end: number; now: number; realStart: number }):
  { kind: 'running'; ms: number } | { kind: 'ended' } | { kind: 'unknown' } {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return { kind: 'unknown' };
  const duration = end - start;
  const deadline = Number.isFinite(realStart) && realStart < start ? realStart + duration : end;
  const ms = deadline - now;
  if (ms <= 0) return { kind: 'ended' };
  return ms > duration ? { kind: 'unknown' } : { kind: 'running', ms };
}

function formatAppointmentTime(value: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Hora no disponible'
    : date.toLocaleString('es-PE', { timeZone: 'America/Lima', ...options });
}

export function ActiveSessionOverview({
  appointment,
  session,
  now,
}: {
  appointment: Appointment;
  session?: Session;
  now: number;
}) {
  const start = Date.parse(appointment.fecha_hora_inicio);
  const end = Date.parse(appointment.fecha_hora_fin);
  const isInProgress = session?.estado_sesion === 'EN_CURSO';
  const isUpcoming = Number.isFinite(start) && now < start;
  const countdownLabel = isInProgress ? 'Tiempo programado restante' : 'Inicio en';
  const countdown = isInProgress ? remainingScheduledTime({ start, end, now, realStart: Date.parse(session?.fecha_hora_inicio_real ?? '') }) : null;
  const upcomingCountdown = isUpcoming ? formatDuration(start - now) : null;
  const statusText = isInProgress
    ? countdown?.kind === 'running' ? `${countdownLabel} ${formatDuration(countdown.ms)}`
      : countdown?.kind === 'ended' ? 'El tiempo programado terminó; la sesión sigue abierta hasta que la cierres'
      : 'Tiempo programado no disponible'
    : session?.estado_sesion === 'FINALIZADA' ? 'Sesión cerrada'
    : upcomingCountdown ? `${countdownLabel} ${upcomingCountdown}` : 'Sin cuenta regresiva activa';
  const sessionLabel = session
    ? `Sesión #${session.id_sesion} · ${appointment.tipo_cita === 'INTRODUCTORIA' ? 'Introductoria' : 'Terapia'}`
    : appointment.tipo_cita === 'INTRODUCTORIA' ? 'Sesión introductoria' : 'Sesión de terapia';

  return (
    <section className="grid gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4" aria-label="Información de la sesión">
      <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8F7FC] p-3">
        <UserRound size={18} className="shrink-0 text-violet-700" />
        <div className="min-w-0"><p className="text-[11px] font-bold text-[#615274]">Paciente</p><p className="truncate text-sm font-extrabold text-[#1C1135]">{appointment.paciente_nombre}</p></div>
      </div>
      <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8F7FC] p-3">
        <UserRound size={18} className="shrink-0 text-violet-700" />
        <div className="min-w-0"><p className="text-[11px] font-bold text-[#615274]">Terapeuta</p><p className="truncate text-sm font-extrabold text-[#1C1135]">{appointment.terapeuta_nombre}</p></div>
      </div>
      <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8F7FC] p-3">
        <CalendarClock size={18} className="shrink-0 text-violet-700" />
        <div className="min-w-0"><p className="text-[11px] font-bold text-[#615274]">{sessionLabel}</p><p className="truncate text-sm font-extrabold text-[#1C1135]">{formatAppointmentTime(appointment.fecha_hora_inicio, { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
      </div>
      <div className="flex min-w-0 items-center gap-3 rounded-xl bg-violet-50 p-3" aria-live="polite">
        <Clock3 size={18} className="shrink-0 text-violet-700" />
        <div className="min-w-0"><p className="text-[11px] font-bold text-[#615274]">Estado: {session ? sessionStatusLabel(session.estado_sesion) : reservationStatusLabel(appointment.estado_reserva)}</p><p className="text-sm font-extrabold text-[#1C1135]">{statusText}</p></div>
      </div>
    </section>
  );
}

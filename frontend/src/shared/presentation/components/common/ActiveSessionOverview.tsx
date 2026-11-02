import { CalendarClock, Clock3, UserRound } from 'lucide-react';
import type { Appointment, Session } from '@/modules/clinica/domain/clinical';

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
  const countdown = isInProgress && Number.isFinite(end)
    ? formatDuration(end - now)
    : isUpcoming
      ? formatDuration(start - now)
      : null;
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
        <div className="min-w-0"><p className="text-[11px] font-bold text-[#615274]">Estado: {session?.estado_sesion ?? appointment.estado_reserva}</p><p className="text-sm font-extrabold text-[#1C1135]">{countdown ? `${countdownLabel} ${countdown}` : isInProgress ? 'Horario concluido; confirma el cierre' : 'Sin cuenta regresiva activa'}</p></div>
      </div>
    </section>
  );
}

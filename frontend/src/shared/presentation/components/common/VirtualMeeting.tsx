import { useEffect, useRef, useState } from 'react';
import { useWrite } from '@/shared/application/hooks/useRemoteData';
import { appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { Appointment } from '@/modules/clinica/domain/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

/** Cada cuánto la familia vuelve a consultar si el terapeuta ya inició la reunión. */
export const FAMILY_MEETING_REFRESH_MS = 15_000;

function limaTime(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });
}

function FamilyMeeting({ appointment, onRefresh }: { appointment: Appointment; onRefresh?: () => void }) {
  const live = appointment.estado_sesion === 'EN_CURSO';
  const finished = appointment.estado_sesion === 'FINALIZADA' || appointment.estado_reserva === 'COMPLETADA';
  const waiting = !live && !finished;
  const joinUrl = live && isMeetingUrl(appointment.meet_url) ? appointment.meet_url! : '';

  // El padre se vuelve a pintar cada segundo con una función nueva: si fuera dependencia,
  // el temporizador se reiniciaría siempre y nunca llegaría a dispararse.
  const latestRefresh = useRef(onRefresh);
  latestRefresh.current = onRefresh;
  useEffect(() => {
    if (!waiting) return;
    const timer = window.setInterval(() => latestRefresh.current?.(), FAMILY_MEETING_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [waiting]);

  const time = limaTime(appointment.fecha_hora_inicio);
  return <section className="space-y-3 text-sm text-[#4B4264]">
    {finished && <p role="status" className="rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-4 font-bold text-[#615274]">Esta reunión ya terminó.</p>}
    {waiting && <div role="status" className="rounded-2xl border border-violet-200 bg-[#F8F7FC] p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-[#6B46FE]">Reunión virtual</p>
      <p className="mt-1 text-base font-extrabold text-[#1C1135]">Tu terapeuta aún no inicia la reunión.</p>
      <p className="mt-1">Podrás entrar cuando la inicie{time ? ` (hora programada ${time})` : ''}. Esta pantalla se actualiza sola.</p>
    </div>}
    {live && joinUrl && <a
      aria-label="Entrar a la reunión"
      className="flex w-full items-center justify-center rounded-2xl bg-[#1A73E8] px-6 py-4 text-base font-extrabold text-white shadow-sm transition-colors hover:bg-[#1557B0] sm:w-auto"
      href={joinUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Entrar a la reunión
    </a>}
    {live && !joinUrl && <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-900">
      La reunión ya comenzó, pero todavía no tiene un enlace. Tu terapeuta te lo compartirá en breve.
    </p>}
  </section>;
}

export function VirtualMeeting({ appointment, professional, onRefresh }: { appointment: Appointment; professional: boolean; onRefresh?: () => void }) {
  const savedUrl = isMeetingUrl(appointment.meet_url) ? appointment.meet_url! : '';
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(savedUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const save = useWrite(() => appointmentsService.meeting(appointment.id_reserva, url.trim() || null), () => setEditing(false));
  if (appointment.modalidad !== 'VIRTUAL' || appointment.estado_reserva === 'CANCELADA') return null;
  if (!professional) return <FamilyMeeting appointment={appointment} onRefresh={onRefresh} />;
  const canEdit = appointment.puede_editar !== false;

  return <section className="space-y-4 text-sm text-[#4B4264]">
    <h3 className="font-bold text-[#1C1135]">Reunión virtual (Google Meet)</h3>
    {savedUrl ? <>
      <a
        aria-label="Abrir reunión de Google Meet"
        className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#1A73E8] px-5 py-2.5 text-sm font-bold text-white no-underline shadow-sm transition-colors hover:bg-[#1557B0] hover:no-underline"
        href={savedUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir reunión (Google Meet)
      </a>
      <p>{appointment.meet_origen === 'AUTOMATICA' ? 'Reunión creada automáticamente por Google Meet.' : 'Enlace compartido por el profesional.'} Al iniciar la cita se abrirá en paralelo al panel clínico de Ashakids. La familia solo podrá entrar cuando inicies la reunión.</p>
    </> : <p>
      {appointment.meet_automatico_configurado === false
        ? 'Google Meet automático no está configurado en este entorno.'
        : appointment.meet_automatico_configurado
          ? 'Google Meet está configurado, pero esta cita aún no tiene un enlace asignado.'
          : 'No hay un enlace de Google Meet guardado para esta cita.'}
      {' '}El profesional puede compartir un enlace manualmente.
    </p>}
    {canEdit && !editing && <Btn variant="outline" onClick={() => { setUrl(savedUrl); setEditing(true); }}>Compartir enlace de Google Meet</Btn>}
    {editing && canEdit && <form className="space-y-3" onSubmit={event => {
      event.preventDefault();
      const value = url.trim();
      if (value && !isMeetingUrl(value)) {
        setUrlError('Ingresa un enlace HTTPS de meet.google.com válido.');
        return;
      }
      setUrlError(null);
      void save.submit(undefined);
    }}>
      <label className="block font-bold">Enlace de Google Meet
        <input type="url" maxLength={2048} placeholder="https://meet.google.com/…" className="block mt-2 w-full p-3 border rounded-xl border-[#E8E5F4]" value={url} onChange={event => { setUrl(event.target.value); setUrlError(null); }}/>
      </label>
      <p>El terapeuta puede compartir aquí un enlace de Google Meet para la teleconsulta.</p>
      {urlError && <p role="alert" className="text-xs font-bold text-red-700">{urlError}</p>}
      <RemoteFeedback error={save.error}/>
      <div className="flex gap-3 flex-wrap">
        <Btn type="submit" disabled={save.isPending}>Guardar enlace</Btn>
        <Btn variant="ghost" disabled={save.isPending} onClick={() => { setEditing(false); setUrl(savedUrl); setUrlError(null); }}>Cancelar</Btn>
      </div>
    </form>}
  </section>;
}

export function isMeetingUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname.toLowerCase() === 'meet.google.com' &&
      !parsed.port && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

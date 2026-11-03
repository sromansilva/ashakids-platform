import { useState } from 'react';
import { useWrite } from '@/shared/application/hooks/useRemoteData';
import { appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { Appointment } from '@/modules/clinica/domain/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export function VirtualMeeting({ appointment, professional }: { appointment: Appointment; professional: boolean }) {
  const savedUrl = isMeetingUrl(appointment.meet_url) ? appointment.meet_url! : '';
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(savedUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const save = useWrite(() => appointmentsService.meeting(appointment.id_reserva, url.trim() || null), () => setEditing(false));
  if (appointment.modalidad !== 'VIRTUAL' || appointment.estado_reserva === 'CANCELADA') return null;
  const canEdit = professional && appointment.puede_editar !== false;

  return <section className="space-y-3 text-sm text-[#4B4264]">
    <h3 className="font-bold text-[#1C1135]">Reunión virtual (Google Meet)</h3>
    {savedUrl ? <>
      <a
        aria-label="Abrir reunión de Google Meet"
        className="inline-flex p-3 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold underline underline-offset-4 shadow-sm transition-colors"
        href={savedUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir reunión (Google Meet)
      </a>
      <p>{appointment.meet_origen === 'AUTOMATICA' ? 'Reunión creada automáticamente por Google Meet.' : 'Enlace compartido por el profesional.'} Al iniciar la cita se abrirá en paralelo al panel clínico de Ashakids.</p>
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



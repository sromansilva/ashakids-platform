import { useState } from 'react';
import { useWrite } from '@/hooks/useRemoteData';
import { appointmentsService } from '@/services/clinicalService';
import type { Appointment } from '@/types/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export function VirtualMeeting({ appointment, professional }: { appointment: Appointment; professional: boolean }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(appointment.zoom_join_url ?? '');
  const save = useWrite(() => appointmentsService.meeting(appointment.id_reserva, url.trim() || null), () => setEditing(false));
  if (appointment.modalidad !== 'VIRTUAL' || appointment.estado_reserva === 'CANCELADA') return null;
  const canEdit = professional && appointment.puede_editar !== false;
  return <section className="space-y-3 text-sm text-[#4B4264]">
    <h3 className="font-bold text-[#1C1135]">Reunión virtual</h3>
    {appointment.zoom_join_url ? <a className="inline-flex p-3 rounded-xl bg-violet-700 text-white font-bold underline underline-offset-4" href={appointment.zoom_join_url} target="_blank" rel="noopener noreferrer">Abrir enlace externo de Zoom</a> : <p>El profesional aún no ha compartido el enlace de Zoom.</p>}
    <p>Zoom se abre como servicio externo. El inicio y la asistencia clínica se registran por separado.</p>
    {canEdit && !editing && <Btn variant="outline" onClick={() => setEditing(true)}>Compartir enlace de Zoom</Btn>}
    {editing && canEdit && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}><label className="block font-bold">Enlace de Zoom<input type="url" maxLength={255} placeholder="https://zoom.us/j/…" className="block mt-2 w-full p-3 border rounded-xl border-[#E8E5F4]" value={url} onChange={e => setUrl(e.target.value)}/></label><p>Comparte el enlace acordado para esta cita. Deja el campo vacío para retirarlo.</p><RemoteFeedback error={save.error}/><div className="flex gap-3 flex-wrap"><Btn type="submit" disabled={save.isPending}>Guardar enlace</Btn><Btn variant="ghost" disabled={save.isPending} onClick={() => setEditing(false)}>Cancelar</Btn></div></form>}
  </section>;
}

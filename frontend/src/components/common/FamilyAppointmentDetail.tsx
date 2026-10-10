import { useState } from 'react';
import { useRemote } from '@/hooks/useRemoteData';
import { appointmentsService } from '@/services/clinicalService';
import { familyDate, familyTime } from '@/services/familyTracking';
import { BookingDialog } from './BookingDialog';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import { SessionActions } from './SessionActions';

export function FamilyAppointmentDetail({ id, cancel }: { id: number; cancel: () => void }) {
  const query = useRemote(['appointment', id], s => appointmentsService.get(id, s));
  const [reschedule, setReschedule] = useState(false);
  const a = query.error ? undefined : query.data;
  return <section className="space-y-3 text-sm text-[#4B4264]">
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    {a && <><p className="font-bold text-[#1C1135]">{a.tipo_cita === 'INTRODUCTORIA' ? 'Consulta introductoria' : 'Sesión de terapia'} · {a.estado_reserva}</p>
      <p>{a.paciente_nombre} · {a.terapeuta_nombre}</p><p>{familyDate(a.fecha_hora_inicio)} · {familyTime(a.fecha_hora_inicio)}–{familyTime(a.fecha_hora_fin)} (Lima)</p>
      <p>{a.modalidad === 'PRESENCIAL' ? a.localizacion || 'Coordina la dirección con el centro antes de asistir.' : 'Consulta con tu terapeuta el enlace de la reunión virtual.'}</p>
      {['PENDIENTE', 'CONFIRMADA'].includes(a.estado_reserva) && !a.id_sesion && <div className="flex gap-2 flex-wrap"><Btn variant="outline" onClick={() => setReschedule(true)}>Reprogramar cita</Btn><Btn variant="outline" onClick={cancel}>Cancelar cita</Btn></div>}
      <SessionActions appointmentId={id} />
      {reschedule && <BookingDialog appointment={a} close={() => setReschedule(false)} />}
    </>}
  </section>;
}

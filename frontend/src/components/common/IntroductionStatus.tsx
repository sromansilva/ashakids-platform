import { useState } from 'react';
import { useRemote } from '@/hooks/useRemoteData';
import { patientsService } from '@/services/clinicalService';
import { BookingDialog } from './BookingDialog';
import { RemoteFeedback } from './RemoteFeedback';
import { Btn } from './Btn';

export function IntroductionStatus({ patientId }: { patientId: number }) {
  const query = useRemote(['journey', patientId], s => patientsService.journey(patientId, s));
  const [booking, setBooking] = useState(false);
  const state = query.data;
  return <section aria-label="Primer paso de este niño" className="rounded-2xl border border-violet-200 bg-violet-50 p-5 space-y-3 text-violet-950">
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    {state && !query.error && <><h2 className="font-extrabold text-lg">{state.terapia_habilitada ? 'Listo para continuar su terapia' : 'Consulta introductoria de este niño'}</h2>
      <p>{state.terapia_habilitada ? 'Su introducción está atendida y tiene un plan guardado. Puedes reservar con cualquier terapeuta disponible.' : state.introduccion_pendiente ? 'Su introducción está reservada. Consulta los detalles en la agenda.' : state.introduccion_atendida ? 'La introducción está atendida; falta que el profesional guarde el plan.' : 'Reserva su primera consulta para que el terapeuta conozca al niño y proponga un plan. Cada hijo tiene su propia introducción.'}</p>
      {!state.introduccion_pendiente && (!state.introduccion_atendida || state.terapia_habilitada) && <Btn onClick={() => setBooking(true)}>{state.terapia_habilitada ? 'Reservar sesión de terapia' : 'Reservar introducción'}</Btn>}
    </>}
    {booking && <BookingDialog patientId={patientId} close={() => setBooking(false)} />}
  </section>;
}

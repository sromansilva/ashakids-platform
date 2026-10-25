import { useState } from 'react';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { patientsService } from '@/modules/clinica/infrastructure/clinicalService';
import { BookingDialog } from './BookingDialog';
import { RemoteFeedback } from './RemoteFeedback';
import { Btn } from './Btn';
import { ArrowRight, CalendarCheck2, Sparkles } from 'lucide-react';

export function IntroductionStatus({ patientId }: { patientId: number }) {
  const query = useRemote(['journey', patientId], s => patientsService.journey(patientId, s));
  const [booking, setBooking] = useState(false);
  const state = query.data;
  return <section aria-label="Primer paso de este niño" className="family-next-step relative isolate overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-orange-50 p-5 text-violet-950 shadow-sm shadow-violet-100 sm:p-6">
    <div className="pointer-events-none absolute -right-10 -top-16 -z-10 h-40 w-40 rounded-full bg-violet-200/30" />
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    {state && !query.error && <><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-violet-700"><Sparkles size={14} aria-hidden="true" /> Próximo paso</p><h2 className="font-black text-xl tracking-tight">{state.terapia_habilitada ? 'Listo para continuar su terapia' : 'Consulta introductoria de este niño'}</h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-violet-900/75">{state.terapia_habilitada ? 'Su introducción está atendida y tiene un plan guardado. Puedes reservar con cualquier terapeuta disponible.' : state.introduccion_pendiente ? 'Su introducción está reservada. Consulta los detalles en la agenda.' : state.introduccion_atendida ? 'La introducción está atendida; falta que el profesional guarde el plan.' : 'Reserva su primera consulta para que el terapeuta conozca al niño y proponga un plan. Cada hijo tiene su propia introducción.'}</p></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-violet-700 shadow-sm"><CalendarCheck2 size={23} aria-hidden="true" /></span></div>
      {!state.introduccion_pendiente && (!state.introduccion_atendida || state.terapia_habilitada) && <Btn onClick={() => setBooking(true)}>{state.terapia_habilitada ? 'Reservar sesión de terapia' : 'Reservar introducción'}<ArrowRight size={16} /></Btn>}
    </>}
    {booking && <BookingDialog patientId={patientId} close={() => setBooking(false)} />}
  </section>;
}

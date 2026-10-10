import { useState } from "react";
import type { View } from "@/types/navigation";
import type { AppointmentRequest } from "@/types/AppointmentRequest";
import { useRemote } from "@/hooks/useRemoteData";
import { agendaService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { BookingDialog } from "@/components/common/BookingDialog";
import { Btn } from "@/components/common/Btn";

export function PadrePsicologos({ go }: { go: (view: View) => void; onRequest: (request: AppointmentRequest) => void; bookedSlots?: { therapist: string; date: string; time: string }[] }) {
  const data = useRemote(['professionals'], s => readAllPages(o => agendaService.professionals({ limit: 100, offset: o }, s), s));
  const [booking, setBooking] = useState<number | null>(null);
  return <section className="p-4 sm:p-6 max-w-4xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-3">Encuentra a tu terapeuta</h1>
    <p className="text-base text-[#4B4264] mb-6">Elige un profesional para la introducción o para continuar el plan de tu hijo. Al reservar verás sus horarios disponibles.</p>
    <RemoteFeedback pending={data.isPending} error={data.error} retry={() => void data.refetch()} />
    {!data.error && data.data && <ul className="space-y-4">{data.data.map(t => <li key={t.id_terapeuta} className="bg-white border border-[#E8E5F4] rounded-2xl p-5 space-y-3"><h2 className="text-xl font-extrabold">{t.nombres} {t.apellidos}</h2><p className="text-[#4B4264]">{t.especialidad ?? 'Profesional de ASHAKids'}</p>{t.descripcion_profesional && <p className="text-[#4B4264] whitespace-pre-wrap break-words">{t.descripcion_profesional}</p>}<Btn onClick={() => setBooking(t.id_terapeuta)}>Ver horarios y reservar</Btn></li>)}</ul>}
    {data.isSuccess && !data.data.length && <p>Por ahora no hay profesionales activos disponibles en el directorio.</p>}
    <Btn variant="outline" className="mt-6" onClick={() => go('padre/agenda')}>Consultar mi agenda</Btn>
    {booking !== null && <BookingDialog therapistId={booking} close={() => setBooking(null)} />}
  </section>;
}

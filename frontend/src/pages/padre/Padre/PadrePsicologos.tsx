import { useState } from "react";
import type { View } from "@/types/navigation";
import type { AppointmentRequest } from "@/types/AppointmentRequest";
import { useFamilyTracking } from "@/hooks/useFamilyTracking";
import { BookingDialog } from "@/components/common/BookingDialog";
import { Btn } from "@/components/common/Btn";

export function PadrePsicologos({ go }: { go: (view: View) => void; onRequest: (request: AppointmentRequest) => void; bookedSlots?: { therapist: string; date: string; time: string }[] }) {
  const data = useFamilyTracking();
  const [booking, setBooking] = useState(false);
  return <section className="p-4 sm:p-6 max-w-4xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-3">Profesionales y tratamientos asignados</h1>
    <p className="text-base text-[#4B4264] mb-6">Administración vincula a cada hijo con un profesional mediante un tratamiento. Reserva desde una asignación vigente.</p>
    {data.error ? <div role="alert"><p>No pudimos consultar las asignaciones.</p><Btn onClick={data.retry} className="mt-3">Reintentar asignaciones</Btn></div> : data.pending ? <p role="status">Cargando asignaciones…</p> : !data.patient ? <><p className="mb-4">Aún no tienes hijos registrados.</p><Btn onClick={() => go("padre/config")}>Gestionar hijos</Btn></> : <>
      <label htmlFor="assigned-child" className="font-bold block mb-2">Hijo o hija</label>
      <select id="assigned-child" value={data.patient.id_paciente} onChange={e => data.selectPatient(Number(e.target.value))} className="w-full sm:max-w-md border border-[#C4BAE0] rounded-2xl bg-white px-4 py-3 text-base mb-6 focus-visible:outline-violet-700">{data.children.map(c => <option value={c.id_paciente} key={c.id_paciente}>{c.nombres_paciente} {c.apellidos_paciente}</option>)}</select>
      {data.treatments.length ? <ul className="space-y-4">{data.treatments.map(t => <li key={t.id_tratamiento} className="bg-white border border-[#E8E5F4] rounded-2xl p-5"><h2 className="text-xl font-extrabold">{t.nombre_tratamiento}</h2><p className="text-base text-[#4B4264] mt-3">{t.terapeuta_nombre}</p><p className="text-sm mt-2">Estado del tratamiento: {t.estado_tratamiento}</p>{t.descripcion && <p className="text-base mt-3 whitespace-pre-wrap break-words">{t.descripcion}</p>}</li>)}</ul> : <p className="text-base">Este hijo todavía no tiene un tratamiento asignado. Contacta a administración para coordinarlo.</p>}
      <div className="flex flex-wrap gap-3 mt-6">{data.treatments.some(t => t.estado_tratamiento === "ACTIVO") && <Btn onClick={() => setBooking(true)}>Reservar cita</Btn>}<Btn variant="outline" onClick={() => go("padre/agenda")}>Consultar agenda</Btn></div>
    </>}
    {booking && <BookingDialog close={() => setBooking(false)} />}
  </section>;
}

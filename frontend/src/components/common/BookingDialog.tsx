import { useState } from "react";
import { X } from "lucide-react";
import { Btn } from "./Btn";
import { RemoteFeedback } from "./RemoteFeedback";
import { useFamilyPatients } from "@/hooks/useFamilyPatients";
import { useRemote, useWrite } from "@/hooks/useRemoteData";
import { appointmentsService, treatmentsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import type { Appointment } from "@/types/clinical";
const field = 'w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium';
export function BookingDialog({ close, appointment }: { close: () => void; appointment?: Appointment }) {
  const family = useFamilyPatients(); const [patient, setPatient] = useState(appointment?.id_paciente ?? 0);
  const [treatment, setTreatment] = useState(appointment?.id_tratamiento ?? 0);
  const asInput = (date?: string) => date ? new Date(Date.parse(date)-5*3600000).toISOString().slice(0,16) : '';
  const [start, setStart] = useState(asInput(appointment?.fecha_hora_inicio)); const [end, setEnd] = useState(asInput(appointment?.fecha_hora_fin));
  const [mode, setMode] = useState<'VIRTUAL' | 'PRESENCIAL'>(appointment?.modalidad ?? 'PRESENCIAL');
  const [location, setLocation] = useState(appointment?.localizacion ?? '');
  const treatments = useRemote(['treatments', patient], signal => readAllPages(offset => treatmentsService.list(patient, { limit: 100, offset }, signal), signal), !!patient && !appointment);
  const save = useWrite(() => {
    const body = { fecha_hora_inicio: start + ':00-05:00', fecha_hora_fin: end + ':00-05:00', modalidad: mode, localizacion: location || null };
    return appointment ? appointmentsService.reschedule(appointment.id_reserva, body) : appointmentsService.create({ ...body, id_tratamiento: treatment });
  }, close);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <form className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]"><h2 className="font-extrabold text-[#1C1135]">{appointment ? 'Reprogramar cita' : 'Nueva cita'}</h2><button type="button" disabled={save.isPending} onClick={close} aria-label="Cerrar reserva"><X size={18} /></button></div>
      <div className="p-6 space-y-4 text-sm font-bold text-[#1C1135]">
        {!appointment && <><RemoteFeedback pending={family.query.isPending} error={family.query.error} retry={() => void family.query.refetch()} />
          <label className="block">Paciente<select required className={field} value={patient || ''} onChange={e => { setPatient(Number(e.target.value)); setTreatment(0); }}><option value="">Selecciona un paciente</option>{family.children.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}</select></label>
          {patient > 0 && <><RemoteFeedback pending={treatments.isPending} error={treatments.error} retry={() => void treatments.refetch()} /><label className="block">Tratamiento y profesional<select required className={field} value={treatment || ''} onChange={e => setTreatment(Number(e.target.value))}><option value="">Selecciona un tratamiento activo</option>{treatments.data?.filter(t => t.estado_tratamiento === 'ACTIVO').map(t => <option key={t.id_tratamiento} value={t.id_tratamiento}>{t.nombre_tratamiento} · {t.terapeuta_nombre}</option>)}</select></label>{treatments.isSuccess && !treatments.data.some(t => t.estado_tratamiento === 'ACTIVO') && <p>Administración debe asignar un tratamiento antes de reservar.</p>}</>}
        </>}
        <p className="text-xs text-[#7C6F9A]">America/Lima (UTC−05:00). El servidor valida los cruces de horario al guardar.</p>
        <label className="block">Fecha y hora de inicio<input required type="datetime-local" className={field} value={start} onChange={e => setStart(e.target.value)} /></label>
        <label className="block">Fecha y hora de fin<input required type="datetime-local" min={start} className={field} value={end} onChange={e => setEnd(e.target.value)} /></label>
        <label className="block">Modalidad<select className={field} value={mode} onChange={e => setMode(e.target.value as typeof mode)}><option value="PRESENCIAL">Presencial</option><option value="VIRTUAL">Virtual</option></select></label>
        <label className="block">Localización<input maxLength={255} className={field} value={location} onChange={e => setLocation(e.target.value)} /></label>
        <RemoteFeedback error={save.error} />
      </div><div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3"><Btn variant="secondary" disabled={save.isPending} onClick={close}>Cancelar</Btn><Btn type="submit" disabled={save.isPending || !treatment}>Guardar cita</Btn></div>
    </form></div>;
}

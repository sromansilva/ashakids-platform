import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import { useFamilyPatients } from '@/hooks/useFamilyPatients';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { agendaService, appointmentsService, patientsService, treatmentsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import type { Appointment } from '@/types/clinical';
const field = 'mt-1 w-full rounded-2xl border border-[#C8C2DC] bg-white px-4 py-3 text-base';
const localDate = (date: string) => new Date(Date.parse(date) - 5 * 3600000).toISOString().slice(0, 10);
const clock = (date: string) => new Date(date).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });

export function BookingDialog({ close, appointment, patientId = 0, therapistId = 0 }: {
  close: () => void; appointment?: Appointment; patientId?: number; therapistId?: number;
}) {
  const family = useFamilyPatients();
  const [patient, setPatient] = useState(appointment?.id_paciente ?? patientId);
  const [therapist, setTherapist] = useState(appointment?.id_terapeuta ?? therapistId);
  const [treatment, setTreatment] = useState(appointment?.id_tratamiento ?? 0);
  const [day, setDay] = useState(appointment ? localDate(appointment.fecha_hora_inicio) : localDate(new Date().toISOString()));
  const [start, setStart] = useState('');
  const [mode, setMode] = useState<'VIRTUAL' | 'PRESENCIAL'>(appointment?.modalidad ?? 'PRESENCIAL');
  const [location, setLocation] = useState(appointment?.localizacion ?? '');
  const [review, setReview] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    form.current?.querySelector<HTMLElement>('button,select')?.focus();
    return () => previous?.focus();
  }, []);
  const professionals = useRemote(['professionals'], s => readAllPages(o => agendaService.professionals({ limit: 100, offset: o }, s), s));
  const journey = useRemote(['journey', patient], s => patientsService.journey(patient, s), !!patient && !appointment);
  const plans = useRemote(['treatments', patient], s => readAllPages(o => treatmentsService.list(patient, { limit: 100, offset: o }, s), s), !!patient && !appointment);
  const slots = useRemote(['slots', therapist, day], s => agendaService.slots(therapist, day, s), !!therapist && !!day);
  const type = appointment?.tipo_cita ?? (journey.data?.terapia_habilitada ? 'TERAPIA' : 'INTRODUCTORIA');
  const selectedPlan = treatment || plans.data?.find(t => t.estado_tratamiento === 'ACTIVO')?.id_tratamiento;
  const selected = slots.data?.find(s => s.inicio === start && s.disponible);
  const blocked = !appointment && (journey.isPending || !!journey.error || !!journey.data?.introduccion_pendiente ||
    (!!journey.data?.introduccion_atendida && !journey.data.terapia_habilitada));
  const ready = !!patient && !!therapist && !!selected && !blocked && !slots.error && (type === 'INTRODUCTORIA' || !!selectedPlan);
  const save = useWrite(() => {
    if (!selected) throw new Error('Vuelve a seleccionar un horario disponible.');
    const body = { fecha_hora_inicio: selected.inicio, fecha_hora_fin: selected.fin, modalidad: mode, localizacion: location || null };
    return appointment ? appointmentsService.reschedule(appointment.id_reserva, body) : appointmentsService.create({ ...body,
      id_paciente: patient, id_terapeuta: therapist, id_tratamiento: type === 'TERAPIA' ? selectedPlan : null, tipo_cita: type });
  }, close);
  const change = () => { setStart(''); setReview(false); };
  const selectedChild = family.children.find(p => p.id === patient);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
    <form ref={form} role="dialog" aria-modal="true" aria-labelledby="booking-title" onKeyDown={e => {
      if (e.key === 'Escape' && !save.isPending) close();
      if (e.key === 'Tab') {
        const nodes = Array.from(form.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input:not(:disabled)') ?? []);
        const first = nodes[0], last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl text-[#1C1135]" onSubmit={e => {
      e.preventDefault(); if (!ready) return; if (!review) setReview(true); else void save.submit(undefined);
    }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4]"><h2 id="booking-title" className="font-extrabold text-lg">{appointment ? 'Reprogramar cita' : 'Reservar una cita'}</h2><button type="button" className="min-h-11 min-w-11" disabled={save.isPending} onClick={close} aria-label="Cerrar reserva"><X size={20} /></button></div>
      <fieldset disabled={save.isPending} className="p-6 space-y-4 text-sm font-bold">
        {!review ? <>
          {!appointment && <><RemoteFeedback pending={family.query.isPending} error={family.query.error} retry={() => void family.query.refetch()} />
            <label className="block">Hijo o hija<select required className={field} value={patient || ''} onChange={e => { setPatient(Number(e.target.value)); setTreatment(0); change(); }}><option value="">Selecciona un niño</option>{family.children.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}</select></label>
            {!!patient && <><RemoteFeedback pending={journey.isPending} error={journey.error || plans.error} retry={() => { void journey.refetch(); void plans.refetch(); }} />
              <p className="rounded-2xl bg-violet-50 p-3 text-violet-950">{journey.data?.introduccion_pendiente ? 'Este niño ya tiene una introducción reservada. Consúltala en la agenda.' : journey.data?.introduccion_atendida && !journey.data.terapia_habilitada ? 'El profesional debe guardar el plan antes de reservar terapia.' : type === 'INTRODUCTORIA' ? 'Consulta introductoria: el primer paso para este niño. Todavía no necesita un plan.' : 'Sesión de terapia: puedes elegir cualquier profesional disponible.'}</p>
              {type === 'TERAPIA' && <label className="block">Plan vigente<select required className={field} value={selectedPlan ?? ''} onChange={e => { setTreatment(Number(e.target.value)); setReview(false); }}>{plans.data?.filter(t => t.estado_tratamiento === 'ACTIVO').map(t => <option key={t.id_tratamiento} value={t.id_tratamiento}>{t.nombre_tratamiento}</option>)}</select></label>}
            </>}
          </>}
          <RemoteFeedback pending={professionals.isPending} error={professionals.error} retry={() => void professionals.refetch()} />
          <label className="block">Profesional<select required disabled={!!appointment} className={field} value={therapist || ''} onChange={e => { setTherapist(Number(e.target.value)); change(); }}><option value="">Selecciona un terapeuta</option>{professionals.data?.map(p => <option key={p.id_terapeuta} value={p.id_terapeuta}>{p.nombres} {p.apellidos}{p.especialidad ? ` · ${p.especialidad}` : ''}</option>)}</select></label>
          <label className="block">Día<input required type="date" className={field} min={localDate(new Date().toISOString())} max={localDate(new Date(Date.now() + 90 * 86400000).toISOString())} value={day} onInput={e => { setDay(e.currentTarget.value); change(); }} onChange={e => { setDay(e.target.value); change(); }} /></label>
          {!!therapist && <><RemoteFeedback pending={slots.isPending} error={slots.error} retry={() => void slots.refetch()} />
            <fieldset><legend>Horario en Lima · 45 minutos</legend><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">{!slots.error && slots.data?.map(s => <button type="button" key={s.inicio} disabled={!s.disponible} aria-pressed={start === s.inicio} onClick={() => setStart(s.inicio)} className={`min-h-14 rounded-xl border p-2 ${start === s.inicio ? 'bg-violet-700 text-white border-violet-700' : 'bg-white border-[#C8C2DC] disabled:bg-slate-100 disabled:text-slate-600'}`}><span className="block">{clock(s.inicio)}</span><span className="text-xs font-normal">{s.motivo ?? 'Disponible'}</span></button>)}</div></fieldset>
          </>}
          <label className="block">Modalidad<select className={field} value={mode} onChange={e => setMode(e.target.value as typeof mode)}><option value="PRESENCIAL">Presencial</option><option value="VIRTUAL">Virtual</option></select></label>
          <label className="block">{mode === 'PRESENCIAL' ? 'Localización acordada con el centro' : 'Observación para la cita'}<input maxLength={255} className={field} value={location} onChange={e => setLocation(e.target.value)} /></label>
        </> : <section aria-label="Resumen de la reserva" className="space-y-3"><h3 className="font-extrabold text-lg">Revisa tu cita</h3><p>{type === 'INTRODUCTORIA' ? 'Consulta introductoria' : 'Sesión de terapia'}</p><p>{selectedChild ? `${selectedChild.name} ${selectedChild.surname}` : appointment?.paciente_nombre}</p><p>{professionals.data?.find(p => p.id_terapeuta === therapist)?.nombres} {professionals.data?.find(p => p.id_terapeuta === therapist)?.apellidos}</p><p>{day} · {selected && `${clock(selected.inicio)}–${clock(selected.fin)}`} (Lima)</p><p>{mode === 'VIRTUAL' ? 'Virtual' : 'Presencial'}{location && ` · ${location}`}</p><p className="font-normal">La cita quedará confirmada al guardar. El servidor volverá a comprobar que el turno esté libre.</p><Btn variant="outline" onClick={() => setReview(false)}>Editar selección</Btn></section>}
        <RemoteFeedback error={save.error} />
      </fieldset><div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3"><Btn variant="secondary" disabled={save.isPending} onClick={close}>Cancelar</Btn><Btn type="submit" disabled={save.isPending || !ready}>{save.isPending ? 'Confirmando…' : review ? 'Confirmar cita' : 'Revisar reserva'}</Btn></div>
    </form></div>;
}

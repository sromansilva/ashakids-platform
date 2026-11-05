import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, CalendarDays, Check, MapPin, Sparkles, Stethoscope, UserRound, Video, X } from 'lucide-react';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import './booking-dialog.css';
import { useFamilyPatients } from '@/modules/padre/application/useFamilyPatients';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { agendaService, appointmentsService, patientsService, treatmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import { readAllPages } from '@/core/api/readAllPages';
import type { Appointment } from '@/modules/clinica/domain/clinical';
import { FamilyConsentManager } from './FamilyConsentManager';
const field = 'booking-field-input';
const localDate = (date: string) => new Date(Date.parse(date) - 5 * 3600000).toISOString().slice(0, 10);
const clock = (date: string) => new Date(date).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });

export function BookingDialog({
  close,
  appointment,
  patientId = 0,
  therapistId = 0,
  fixedTherapist = false,
}: {
  close: () => void;
  appointment?: Appointment;
  patientId?: number;
  therapistId?: number;
  fixedTherapist?: boolean;
}) {
  const family = useFamilyPatients();
  const { patient: activePatient } = useSelectedFamilyPatient();
  const resolvedPatientId = appointment?.id_paciente || patientId || activePatient?.id_paciente || family.children[0]?.id || 0;
  const [patient, setPatient] = useState(resolvedPatientId);
  const [therapist, setTherapist] = useState(appointment?.id_terapeuta ?? therapistId);
  const [treatment, setTreatment] = useState(appointment?.id_tratamiento ?? 0);
  const [day, setDay] = useState(appointment ? localDate(appointment.fecha_hora_inicio) : localDate(new Date().toISOString()));
  const [start, setStart] = useState('');
  const [mode, setMode] = useState<'VIRTUAL' | 'PRESENCIAL'>(appointment?.modalidad ?? 'PRESENCIAL');
  const location = mode === 'PRESENCIAL' ? 'Jr. Ricardo Treneman 252, Chorrillos 15064' : 'La reunión será mediante Google Meet.';
  const [review, setReview] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!appointment) {
      const target = patientId || activePatient?.id_paciente || family.children[0]?.id || 0;
      if (target && patient !== target) {
        setPatient(target);
      }
    }
  }, [appointment, patientId, activePatient?.id_paciente, family.children]);
  useEffect(() => {
    if (!appointment && therapistId && therapist !== therapistId) {
      setTherapist(therapistId);
    }
  }, [appointment, therapistId, therapist]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    form.current?.querySelector<HTMLElement>('button,select,input:not(:disabled)')?.focus();
    return () => previous?.focus();
  }, []);
  const professionals = useRemote(['professionals'], s => readAllPages(o => agendaService.professionals({ limit: 100, offset: o }, s), s));
  const journey = useRemote(['journey', patient], s => patientsService.journey(patient, s), !!patient && !appointment);
  const plans = useRemote(['treatments', patient], s => readAllPages(o => treatmentsService.list(patient, { limit: 100, offset: o }, s), s), !!patient && !appointment);
  const slots = useRemote(['slots', therapist, day], s => agendaService.slots(therapist, day, s), !!therapist && !!day);
  const type = appointment?.tipo_cita ?? (journey.data?.terapia_habilitada ? 'TERAPIA' : 'INTRODUCTORIA');
  const activePlans = plans.data?.filter(t => t.estado_tratamiento === 'ACTIVO') ?? [];
  const selectedPlan = treatment || activePlans[0]?.id_tratamiento;
  const selected = slots.data?.find(s => s.inicio === start && s.disponible);
  const durationMinutes = slots.data?.[0] ? Math.round((Date.parse(slots.data[0].fin) - Date.parse(slots.data[0].inicio)) / 60000) : 40;
  const blocked = !appointment && (journey.isPending || !!journey.error || !!journey.data?.introduccion_pendiente ||
    (!!journey.data?.introduccion_atendida && !journey.data.terapia_habilitada));
  const ready = !!patient && !!therapist && !!selected && !blocked && !slots.error && (type === 'INTRODUCTORIA' || activePlans.length === 0 || !!selectedPlan);
  const save = useWrite(() => {
    if (!selected) throw new Error('Vuelve a seleccionar un horario disponible.');
    const body = { fecha_hora_inicio: selected.inicio, fecha_hora_fin: selected.fin, modalidad: mode, localizacion: location };
    return appointment ? appointmentsService.reschedule(appointment.id_reserva, body) : appointmentsService.create({ ...body,
      id_paciente: patient, id_terapeuta: therapist, id_tratamiento: type === 'TERAPIA' ? (selectedPlan || null) : null, tipo_cita: type });
  }, close);
  const change = () => { setStart(''); setReview(false); };
  const isFixedTherapist = Boolean(fixedTherapist || appointment);
  const selectedChild = family.children.find(p => p.id === patient);
  const patientName = selectedChild
    ? `${selectedChild.name} ${selectedChild.surname}`
    : activePatient
    ? `${activePatient.nombres_paciente} ${activePatient.apellidos_paciente}`
    : appointment?.paciente_nombre || 'Sin seleccionar';
  const selectedProfessional = professionals.data?.find(p => p.id_terapeuta === therapist);
  const formattedDay = day ? day.split('-').reverse().join('/') : 'Elige una fecha';
  return createPortal(<div className="booking-dialog-overlay" onMouseDown={event => {
    if (event.target === event.currentTarget && !save.isPending) close();
  }}>
    <form ref={form} role="dialog" aria-modal="true" aria-labelledby="booking-title" aria-describedby="booking-description" className="booking-dialog" onKeyDown={e => {
      if (e.key === 'Escape' && !save.isPending) close();
      if (e.key === 'Tab') {
        const nodes = Array.from(form.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input:not(:disabled)') ?? []);
        const first = nodes[0], last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }} onSubmit={e => {
      e.preventDefault(); if (!ready) return; if (!review) setReview(true); else void save.submit(undefined);
    }}>
      <header className="booking-dialog-header">
        <div className="booking-dialog-heading">
          <span className="booking-dialog-icon"><CalendarDays size={19} aria-hidden="true" /></span>
          <div><p className="booking-eyebrow">Agenda familiar</p><h2 id="booking-title">{appointment ? 'Reprogramar cita' : 'Reservar una cita'}</h2></div>
        </div>
        <button type="button" className="booking-close" disabled={save.isPending} onClick={close} aria-label="Cerrar reserva"><X size={19} /></button>
        <p id="booking-description" className="booking-dialog-subtitle">{appointment ? 'Elige otro horario para esta atención.' : 'Elige un horario disponible y confirma los datos de la sesión.'}</p>
        <div className="booking-progress" aria-label={review ? 'Paso 2 de 2' : 'Paso 1 de 2'}>
          <span className="booking-progress-step is-complete"><span>1</span><span>Elige horario</span></span>
          <span className={`booking-progress-line ${review ? 'is-complete' : ''}`} aria-hidden="true" />
          <span className={`booking-progress-step ${review ? 'is-complete' : ''}`}><span>2</span><span>Confirma cita</span></span>
        </div>
      </header>
      <fieldset disabled={save.isPending} className="booking-dialog-body">
        {!review ? <>
          {!appointment && <div className="booking-patient-section">
            <RemoteFeedback pending={family.query.isPending} error={family.query.error} retry={() => void family.query.refetch()} />
            <label className="booking-field-label">Hijo o hija
              <input
                type="text"
                readOnly
                disabled
                className={`${field} cursor-default font-extrabold text-[#1C1135] bg-[#F8F7FC]`}
                value={patientName}
                aria-label="Hijo o hija seleccionado"
              />
            </label>
            {family.query.isSuccess && family.children.length === 0 && <p className="booking-inline-hint">No hay perfiles infantiles asociados. Añade uno en “Gestionar familia” para poder reservar.</p>}
            {!!patient && <>
              <RemoteFeedback pending={journey.isPending} error={journey.error || plans.error} retry={() => { void journey.refetch(); void plans.refetch(); }} />
              <div className={`booking-guidance ${blocked ? 'is-blocked' : ''}`} role="status">
                <span className="booking-guidance-icon"><Stethoscope size={17} aria-hidden="true" /></span>
                <span>{journey.isPending ? 'Estamos comprobando qué tipo de sesión necesita este niño.' : journey.error ? 'No pudimos validar el proceso de este niño. Vuelve a intentarlo antes de reservar.' : journey.data?.introduccion_pendiente ? 'Este niño ya tiene una consulta introductoria reservada. Puedes verla en la agenda.' : journey.data?.introduccion_atendida && !journey.data.terapia_habilitada ? 'El profesional debe guardar el plan antes de reservar una sesión de terapia.' : type === 'INTRODUCTORIA' ? 'Consulta introductoria: el primer paso para este niño. Aún no necesita un plan.' : 'Sesión de terapia: elige un profesional y un horario disponible.'}</span>
              </div>
              {type === 'TERAPIA' && (activePlans.length > 0 ? (
                <label className="booking-field-label">Plan vigente<select required className={field} value={selectedPlan ?? ''} onChange={e => { setTreatment(Number(e.target.value)); setReview(false); }}>{activePlans.map(t => <option key={t.id_tratamiento} value={t.id_tratamiento}>{t.nombre_tratamiento}</option>)}</select></label>
              ) : (
                <div className="booking-guidance"><span className="booking-guidance-icon"><Check size={16} aria-hidden="true" /></span><span><strong>Plan de trabajo:</strong> la sesión se registrará como seguimiento general.</span></div>
              ))}
            </>}
          </div>}
          <RemoteFeedback pending={professionals.isPending} error={professionals.error} retry={() => void professionals.refetch()} />
          <div className="booking-selection-grid">
            <div className="booking-selection-controls">
              <label className="booking-field-label">Profesional
                {isFixedTherapist ? (
                  <input
                    type="text"
                    readOnly
                    disabled
                    className={`${field} cursor-default font-extrabold text-[#1C1135] bg-[#F8F7FC]`}
                    value={selectedProfessional ? `${selectedProfessional.nombres} ${selectedProfessional.apellidos}${selectedProfessional.especialidad ? ` · ${selectedProfessional.especialidad}` : ''}` : (appointment?.terapeuta_nombre || 'Cargando profesional...')}
                    aria-label="Profesional asignado"
                  />
                ) : (
                  <select required className={field} value={therapist || ''} onChange={e => { setTherapist(Number(e.target.value)); change(); }}>
                    <option value="">Selecciona un terapeuta</option>
                    {professionals.data?.map(p => <option key={p.id_terapeuta} value={p.id_terapeuta}>{p.nombres} {p.apellidos}{p.especialidad ? ` · ${p.especialidad}` : ''}</option>)}
                  </select>
                )}
              </label>
              <label className="booking-field-label">Día<input required type="date" className={field} min={localDate(new Date().toISOString())} max={localDate(new Date(Date.now() + 90 * 86400000).toISOString())} value={day} onInput={e => { setDay(e.currentTarget.value); change(); }} onChange={e => { setDay(e.target.value); change(); }} /></label>
              <fieldset className="booking-mode-picker"><legend>Modalidad</legend>
                <label className={`booking-mode-option ${mode === 'PRESENCIAL' ? 'is-selected' : ''}`}><input type="radio" name="booking-mode" value="PRESENCIAL" checked={mode === 'PRESENCIAL'} onChange={() => setMode('PRESENCIAL')} /><span className="booking-mode-icon"><Building2 size={17} aria-hidden="true" /></span><span><strong>Presencial</strong><small>En el centro</small></span>{mode === 'PRESENCIAL' && <Check size={16} className="booking-mode-check" aria-hidden="true" />}</label>
                <label className={`booking-mode-option ${mode === 'VIRTUAL' ? 'is-selected' : ''}`}><input type="radio" name="booking-mode" value="VIRTUAL" checked={mode === 'VIRTUAL'} onChange={() => setMode('VIRTUAL')} /><span className="booking-mode-icon"><Video size={17} aria-hidden="true" /></span><span><strong>Virtual</strong><small>Por Google Meet</small></span>{mode === 'VIRTUAL' && <Check size={16} className="booking-mode-check" aria-hidden="true" />}</label>
              </fieldset>
              <div className="booking-location" aria-live="polite"><span className="booking-location-icon">{mode === 'PRESENCIAL' ? <MapPin size={17} aria-hidden="true" /> : <Video size={17} aria-hidden="true" />}</span><span><strong>{mode === 'PRESENCIAL' ? 'Lugar de atención' : 'Conexión virtual'}</strong><small>{location}</small></span></div>
            </div>
            <div className="booking-schedule">
              <div className="booking-schedule-heading"><div><h3>Elige un horario</h3><p>Horario en Lima · {durationMinutes} minutos</p></div>{selected && <span className="booking-selected-badge"><Check size={13} aria-hidden="true" /> Seleccionado</span>}</div>
              {!!therapist && <>
                <RemoteFeedback pending={slots.isPending} error={slots.error} retry={() => void slots.refetch()} />
                {!slots.isPending && !slots.error && slots.data?.length === 0 && <div className="booking-no-slots"><CalendarDays size={22} aria-hidden="true" /><strong>No hay horarios para este día</strong><span>Prueba con otra fecha para ver más opciones.</span></div>}
                <div className="booking-slots" role="group" aria-label={`Horarios disponibles para el ${formattedDay}`}>
                  {!slots.error && slots.data?.map(s => <button type="button" key={s.inicio} disabled={!s.disponible} aria-pressed={start === s.inicio} onClick={() => setStart(s.inicio)} className={`booking-slot ${start === s.inicio ? 'is-selected' : ''}`}><span className="booking-slot-time">{clock(s.inicio)}</span><span className="booking-slot-state">{s.motivo ?? (s.disponible ? 'Disponible' : 'No disponible')}</span></button>)}
                </div>
              </>}
              {!therapist && <div className="booking-no-slots"><Stethoscope size={22} aria-hidden="true" /><strong>Selecciona un profesional</strong><span>Mostraremos aquí los turnos disponibles.</span></div>}
            </div>
          </div>
        </> : <section aria-label="Resumen de la reserva" className="booking-review">
          <div className="booking-review-heading"><span className="booking-review-icon"><Check size={19} aria-hidden="true" /></span><div><p className="booking-eyebrow">Todo listo</p><h3>Revisa tu cita</h3><p>Comprueba los datos antes de confirmar la reserva.</p></div></div>
          <div className="booking-review-grid">
            <div className="booking-review-card"><span className="booking-review-card-icon"><UserRound size={17} aria-hidden="true" /></span><div><small>Paciente</small><strong>{patientName}</strong></div></div>
            <div className="booking-review-card"><span className="booking-review-card-icon"><Sparkles size={17} aria-hidden="true" /></span><div><small>Tipo de cita</small><strong>{type === 'INTRODUCTORIA' ? 'Consulta introductoria' : 'Sesión de terapia'}</strong></div></div>
            <div className="booking-review-card"><span className="booking-review-card-icon"><Stethoscope size={17} aria-hidden="true" /></span><div><small>Profesional</small><strong>{selectedProfessional ? `${selectedProfessional.nombres} ${selectedProfessional.apellidos}` : 'Sin seleccionar'}</strong></div></div>
            <div className="booking-review-card"><span className="booking-review-card-icon"><CalendarDays size={17} aria-hidden="true" /></span><div><small>Fecha y hora</small><strong>{formattedDay}{selected && ` · ${clock(selected.inicio)}–${clock(selected.fin)}`}</strong></div></div>
            <div className="booking-review-card"><span className="booking-review-card-icon">{mode === 'PRESENCIAL' ? <Building2 size={17} aria-hidden="true" /> : <Video size={17} aria-hidden="true" />}</span><div><small>{mode === 'PRESENCIAL' ? 'Atención presencial' : 'Atención virtual'}</small><strong>{location}</strong></div></div>
          </div>
          <p className="booking-review-note">La reserva quedará confirmada al guardar. El sistema volverá a comprobar que el horario siga disponible.</p>
          {!appointment && type === 'INTRODUCTORIA' && patient > 0 && (
            <aside className="mt-4 space-y-2 rounded-2xl border border-violet-100 bg-white p-4" aria-label="Permiso opcional para evaluación fonológica">
              <div>
                <h4 className="text-sm font-extrabold text-[#1C1135]">Antes de la primera consulta</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#615274]">
                  Puedes autorizar el uso de reconocimiento de voz para una prueba breve durante la sesión. Es opcional y no afecta la reserva; sin autorización, la prueba por voz permanecerá desactivada. Puedes cambiar esta decisión desde Privacidad y consentimientos.
                </p>
              </div>
              <FamilyConsentManager patientId={patient} patientName={patientName} />
            </aside>
          )}
        </section>}
        <RemoteFeedback error={save.error} />
      </fieldset>
      <footer className="booking-dialog-footer"><p>{review ? 'La cita se confirmará con los datos que aparecen arriba.' : 'Podrás revisar los datos antes de confirmar.'}</p><div><Btn variant="secondary" disabled={save.isPending} onClick={() => review ? setReview(false) : close()}>{review ? 'Editar selección' : 'Cancelar'}</Btn><Btn type="submit" disabled={save.isPending || !ready}>{save.isPending ? 'Confirmando…' : review ? 'Confirmar cita' : 'Revisar reserva'}</Btn></div></footer>
    </form>
  </div>, document.body);
}

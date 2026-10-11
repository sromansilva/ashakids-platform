import { useId, useState } from 'react';
import { useRoleProfile } from '@/hooks/useRoleProfile';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { agendaService } from '@/services/clinicalService';
import type { Availability } from '@/types/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import { Clock3, Check } from 'lucide-react';
import './workspace.css';
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hours = Array.from({ length: 10 }, (_, i) => i + 8);
const asInput = (date: string) => new Date(Date.parse(date) - 5 * 3600000).toISOString().slice(0, 16);

function Form({ id, initial }: { id: number; initial: Availability }) {
  const [form, setForm] = useState(initial);
  const [begin, setBegin] = useState('');
  const [end, setEnd] = useState('');
  const [dirty, setDirty] = useState(false);
  const labelId = useId();
  const save = useWrite(() => agendaService.publish(id, form), () => setDirty(false));
  const toggle = (dia: number, hora: number) => {
    setDirty(true);
    setForm(f => ({ ...f, turnos: f.turnos.some(t => t.dia === dia && t.hora === hora)
      ? f.turnos.filter(t => t.dia !== dia || t.hora !== hora) : [...f.turnos, { dia, hora }] }));
  };
  const replaceDay = (dia: number, selected: boolean) => {
    setDirty(true);
    setForm(f => ({ ...f, turnos: [...f.turnos.filter(t => t.dia !== dia), ...(selected ? hours.map(hora => ({ dia, hora })) : [])] }));
  };
  return <form className="availability-editor space-y-6 text-[#1C1135]" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
    <header><h2 className="font-extrabold text-xl">Tu disponibilidad semanal</h2><p className="text-base text-[#4B4264] mt-2">Elige los horarios en los que puedes atender.</p><div className="availability-meta"><span><Clock3 size={16} aria-hidden="true"/>Hora de Lima</span><span>{initial.duracion_minutos ?? 40} minutos por sesión</span><span>{form.turnos.length} turnos por semana</span></div></header>
    <fieldset disabled={save.isPending} className="space-y-4"><legend className="sr-only">Turnos semanales</legend>
      <div className="availability-week">{days.map((day, dia) => { const count = form.turnos.filter(t => t.dia === dia).length; return <fieldset key={day} className="availability-day"><legend className="sr-only">{day}</legend><div className="availability-day-heading"><div><h3>{day}</h3><p>{count ? `${count} turnos` : 'Sin atención'}</p></div><button type="button" className="availability-day-toggle" onClick={() => replaceDay(dia, count !== hours.length)}>{count === hours.length ? 'Desmarcar día' : 'Seleccionar día'}</button></div><div className="availability-slots">{hours.map(hora => { const checked = form.turnos.some(t => t.dia === dia && t.hora === hora); return <label key={hora} className={`availability-slot ${checked ? 'is-selected' : ''}`}><input type="checkbox" aria-label={`${day} ${String(hora).padStart(2,'0')}:00`} checked={checked} onChange={() => toggle(dia,hora)}/><span><Check size={14} aria-hidden="true"/>{String(hora).padStart(2,'0')}:00</span></label>; })}</div></fieldset>; })}</div>
      <section className="space-y-3" aria-label="Bloqueos de agenda"><h3 className="font-bold">Ausencias y bloqueos</h3>
        {!form.bloqueos.length && <p className="text-sm text-[#4B4264]">No hay bloqueos en esta edición. La última configuración publicada se conserva hasta publicar.</p>}
        {form.bloqueos.map((b, i) => <div key={`${b.inicio}:${i}`} className="flex flex-wrap gap-2 items-center text-sm"><p className="flex-1">{asInput(b.inicio).replace('T', ' ')} hasta {asInput(b.fin).replace('T', ' ')}</p><Btn variant="outline" onClick={() => { setDirty(true); setForm(f => ({ ...f, bloqueos: f.bloqueos.filter((_, j) => i !== j) })); }}>Quitar bloqueo {i + 1}</Btn></div>)}
        <div className="grid sm:grid-cols-2 gap-3"><label htmlFor={`${labelId}-begin`} className="text-sm font-bold">Inicio del bloqueo<input id={`${labelId}-begin`} type="datetime-local" value={begin} onInput={e => setBegin(e.currentTarget.value)} onChange={e => setBegin(e.target.value)} className="w-full border rounded-xl p-3 mt-1" /></label><label htmlFor={`${labelId}-end`} className="text-sm font-bold">Fin del bloqueo<input id={`${labelId}-end`} type="datetime-local" min={begin} value={end} onInput={e => setEnd(e.currentTarget.value)} onChange={e => setEnd(e.target.value)} className="w-full border rounded-xl p-3 mt-1" /></label></div>
        <Btn variant="outline" disabled={!begin || !end || end <= begin || form.bloqueos.length >= 60} onClick={() => {
          setDirty(true); setForm(f => ({ ...f, bloqueos: [...f.bloqueos, { inicio: begin + ':00-05:00', fin: end + ':00-05:00' }] })); setBegin(''); setEnd('');
        }}>Añadir bloqueo</Btn>
      </section>
    </fieldset>
    <RemoteFeedback error={save.error} />
    {dirty && <p role="status" className="text-sm text-[#4B4264]">Cambios pendientes de publicar.</p>}
    {save.isSuccess && !dirty && <p role="status" className="text-sm text-emerald-800">Disponibilidad publicada. Las familias ya pueden consultarla.</p>}
    <p className="text-sm text-[#4B4264]">Las reservas confirmadas se conservan si cambias tu horario.</p>
    <Btn type="submit" disabled={save.isPending}>{save.isPending ? 'Publicando…' : 'Publicar disponibilidad'}</Btn>
  </form>;
}

export function AvailabilityEditor() {
  const profile = useRoleProfile();
  const data = profile.data;
  const id = data && 'perfil_terapeuta' in data ? data.perfil_terapeuta?.id_terapeuta : undefined;
  const query = useRemote(['availability', id], s => agendaService.availability(id!, s), !!id);
  return <><RemoteFeedback pending={profile.isPending || (!!id && query.isPending)} error={profile.error || query.error} retry={() => { void profile.refetch(); if (id) void query.refetch(); }} />
    {id && query.data && !query.error && <Form key={id} id={id} initial={query.data} />}
  </>;
}

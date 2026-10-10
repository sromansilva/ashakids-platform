import { useId, useState } from 'react';
import { useRoleProfile } from '@/hooks/useRoleProfile';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { agendaService } from '@/services/clinicalService';
import type { Availability } from '@/types/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
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
  return <form className="space-y-5 text-[#1C1135]" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
    <h2 className="font-extrabold text-lg">Tu disponibilidad semanal</h2>
    <p className="text-sm text-[#4B4264]">Selecciona las horas de inicio en Lima. Cada sesión dura 45 minutos. Las reservas confirmadas se conservan si cambias tu horario.</p>
    <fieldset disabled={save.isPending} className="space-y-4"><legend className="sr-only">Turnos semanales</legend>
      {days.map((day, dia) => <fieldset key={day} className="rounded-2xl border border-[#E8E5F4] p-3"><legend className="px-1 font-bold">{day}</legend><div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{hours.map(hora => <label key={hora} className="flex min-h-11 items-center gap-2 rounded-lg px-2 bg-violet-50 text-violet-950"><input type="checkbox" checked={form.turnos.some(t => t.dia === dia && t.hora === hora)} onChange={() => toggle(dia, hora)} />{String(hora).padStart(2, '0')}:00</label>)}</div></fieldset>)}
      <section className="space-y-3" aria-label="Bloqueos de agenda"><h3 className="font-bold">Ausencias y bloqueos</h3>
        {!form.bloqueos.length && <p className="text-sm text-[#4B4264]">No hay bloqueos publicados.</p>}
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

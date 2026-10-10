import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import type { PlanData, Session, WorldArea } from '@/types/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export const areaLabels: Record<WorldArea, string> = { FLUIDEZ: 'Fluidez y ritmo', HABLA: 'Habla y articulación', LENGUAJE: 'Comprensión y expresión' };
export function SessionPlan({ session }: { session: Session }) {
  const { role } = useAuth();
  const query = useRemote(['session-plan', session.id_sesion], signal => sessionsService.plan(session.id_sesion, signal));
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PlanData>({ nombre_tratamiento: '', descripcion: '', area: 'LENGUAJE', mundos_asignados: ['LENGUAJE'], sesiones_recomendadas: 4 });
  const save = useWrite(() => sessionsService.publishPlan(session.id_sesion, form), () => setEditing(false));
  const canPublish = role === 'TERAPEUTA' && session.puede_editar !== false && session.reporte_disponible && ['EN_CURSO', 'FINALIZADA'].includes(session.estado_sesion) && session.asistencia !== 'NO_ASISTIO';
  const inputClass = 'block w-full rounded-xl border border-[#E8E5F4] p-3 bg-white mt-1';
  return <section className="border-t pt-4 space-y-3 border-[#E8E5F4]">
    <h3 className="font-extrabold text-[#1C1135]">Plan de trabajo</h3>
    <RemoteFeedback pending={query.isPending} error={query.error || save.error} retry={() => void query.refetch()} />
    {query.data && <div className="space-y-2 text-sm text-[#4B4264]"><p className="font-bold">{query.data.nombre_tratamiento} · {query.data.estado_tratamiento}</p><p>{query.data.area && areaLabels[query.data.area]} · {query.data.sesiones_recomendadas} sesiones recomendadas</p><p>Mundos: {query.data.mundos_asignados?.map(w => areaLabels[w]).join(', ')}</p><p className="whitespace-pre-wrap">{query.data.descripcion}</p><p>Autor: {query.data.terapeuta_nombre}. Mes: {query.data.fecha_inicio}. Origen: sesión #{query.data.id_sesion_origen}.</p><p>Esta versión se conserva. El profesional puede publicar otro plan en una atención posterior.</p></div>}
    {query.isSuccess && !query.data && !editing && <><p className="text-sm text-[#4B4264]">Esta sesión no publicó un plan. Un reporte puede conservar el plan vigente.</p>{canPublish && <Btn variant="outline" onClick={() => setEditing(true)}>Definir plan mensual</Btn>}</>}
    {editing && canPublish && <form className="space-y-4" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
      <label className="block text-sm font-bold">Nombre del plan<input required maxLength={100} className={inputClass} value={form.nombre_tratamiento} onChange={e => setForm({ ...form, nombre_tratamiento: e.target.value })}/></label>
      <label className="block text-sm font-bold">Área principal<select className={inputClass} value={form.area} onChange={e => setForm({ ...form, area: e.target.value as WorldArea })}>{Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-sm font-bold">Sesiones recomendadas este mes<input required type="number" min={1} max={31} className={inputClass} value={form.sesiones_recomendadas} onChange={e => setForm({ ...form, sesiones_recomendadas: Number(e.target.value) })}/></label>
      <fieldset className="space-y-2"><legend className="text-sm font-bold mb-2">Mundos para practicar</legend>{Object.entries(areaLabels).map(([key, label]) => <label key={key} className="flex items-center gap-3 py-1"><input type="checkbox" checked={form.mundos_asignados.includes(key as WorldArea)} onChange={e => setForm({ ...form, mundos_asignados: e.target.checked ? [...form.mundos_asignados, key as WorldArea] : form.mundos_asignados.filter(w => w !== key) })}/>{label}</label>)}</fieldset>
      <label className="block text-sm font-bold">Recomendaciones para la familia<textarea maxLength={10000} className={inputClass} rows={3} value={form.descripcion ?? ''} onChange={e => setForm({ ...form, descripcion: e.target.value })}/></label>
      <p className="text-sm text-[#4B4264]">Al publicar, este plan reemplaza al vigente y conserva su historial. Las sesiones son una recomendación; los juegos son demostrativos y no condicionan las reservas.</p>
      <div className="flex flex-wrap gap-3"><Btn type="submit" disabled={save.isPending || !form.nombre_tratamiento.trim() || !form.mundos_asignados.length}>Publicar plan</Btn><Btn variant="ghost" disabled={save.isPending} onClick={() => setEditing(false)}>Cancelar</Btn></div>
    </form>}
  </section>;
}

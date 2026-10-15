import { useState } from 'react';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { notificationsService, type NotificationPreferences as Preferences } from '@/services/notificationsService';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

const fields: { key: keyof Preferences; title: string; description: string }[] = [
  {key:'nueva_cita',title:'Nueva cita confirmada',description:'Cuando una familia reserva una consulta introductoria o sesión contigo.'},
  {key:'cancelacion',title:'Cancelaciones',description:'Cuando se cancela una cita de tu agenda.'},
  {key:'reprogramacion',title:'Cambios de cita',description:'Cuando cambian la fecha, la hora o la modalidad.'},
  {key:'recordatorio',title:'Recordatorios de cita',description:'Un aviso durante los 30 minutos anteriores al inicio.'},
  {key:'mensajes',title:'Nuevos mensajes',description:'Cuando recibes un mensaje de una familia autorizada.'},
];
function Form({ initial }: { initial: Preferences }) {
  const [form,setForm] = useState(initial);
  const [dirty,setDirty] = useState(false);
  const save = useWrite(() => notificationsService.savePreferences(form), () => setDirty(false));
  return <form className="space-y-5" onSubmit={e => {e.preventDefault(); void save.submit(undefined);}}>
    <fieldset disabled={save.isPending} className="divide-y divide-[#E8E5F4]"><legend className="sr-only">Tipos de notificación</legend>{fields.map(field => <label key={field.key} className="flex items-center justify-between gap-5 py-4 pr-12 sm:pr-0 cursor-pointer"><span><span className="block font-bold text-[#1C1135]">{field.title}</span><span className="block text-sm text-[#4B4264] mt-1">{field.description}</span></span><input type="checkbox" role="switch" className="h-5 w-5 shrink-0 accent-violet-700 focus-visible:outline-violet-700" checked={!!form[field.key]} onChange={e => {setDirty(true);setForm(f => ({...f,[field.key]:e.target.checked}));}}/></label>)}</fieldset>
    <RemoteFeedback error={save.error}/>
    {dirty && <p role="status" className="text-sm text-[#4B4264]">Tienes cambios sin guardar.</p>}
    {save.isSuccess && !dirty && <p role="status" className="text-sm font-bold text-emerald-800">Preferencias guardadas.</p>}
    <Btn type="submit" disabled={!dirty || save.isPending}>{save.isPending ? 'Guardando…' : 'Guardar preferencias'}</Btn>
  </form>;
}
export function NotificationPreferences() {
  const query = useRemote(['notification-preferences'],signal => notificationsService.preferences(signal));
  return <section className="space-y-3"><h2 className="font-extrabold text-lg text-[#1C1135]">Notificaciones</h2><p className="text-sm text-[#4B4264]">Elige los avisos que recibirás en tu bandeja de ASHAKids. Los cambios se aplican a los avisos nuevos; el historial anterior se conserva.</p><RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()}/>{query.data && !query.error && <Form initial={query.data}/>}</section>;
}

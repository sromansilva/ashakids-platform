import { useId, useState } from 'react';
import { Bell, Check, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useWrite } from '@/hooks/useRemoteData';
import { notificationsService } from '@/services/notificationsService';
import type { View } from '@/types/navigation';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

const date = (value: string) => new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'short',timeStyle:'short'}).format(new Date(value));
export function NotificationCenter({ go }: { go: (view: View) => void }) {
  const { user } = useAuth();
  const [open,setOpen] = useState(false);
  const [offset,setOffset] = useState(0);
  const [unread,setUnread] = useState(false);
  const panelId = useId();
  const query = useQuery({queryKey:[user?.id_usuario,'notifications',offset,unread],queryFn:({signal}) => notificationsService.inbox(offset,unread,signal),enabled:!!user,refetchInterval:30000});
  const read = useWrite((id:number) => notificationsService.read(id));
  const all = useWrite(() => notificationsService.readAll());
  const count = query.data?.sin_leer ?? 0;
  const items = query.error ? [] : query.data?.items ?? [];
  return <section className="px-4 sm:px-6 pt-3 text-[#1C1135]">
    <div className="flex justify-end"><button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(v => !v)} className="min-h-11 px-3 flex items-center gap-2 rounded-xl font-bold text-sm hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-700"><Bell size={18}/><span>Notificaciones</span>{query.error ? <span className="text-red-800">Sin conexión</span> : query.isPending ? <span>Cargando…</span> : <span className="tabular-nums">{count} sin leer</span>}<ChevronDown size={16} className={open ? 'rotate-180' : ''}/></button></div>
    {open && <div id={panelId} className="max-w-4xl ml-auto mt-3 p-4 sm:p-5 bg-white border border-[#E8E5F4] rounded-2xl" onKeyDown={e => {if(e.key==='Escape') {setOpen(false); document.querySelector<HTMLButtonElement>(`button[aria-controls="${panelId}"]`)?.focus();}}}>
      <div className="flex justify-between gap-4 flex-wrap items-center"><h2 className="text-xl font-extrabold">Tu bandeja de notificaciones</h2><Btn variant="outline" size="sm" onClick={() => go('terapeuta/config')}>Configurar avisos</Btn></div>
      <div className="mt-4 flex gap-4 flex-wrap justify-between items-center"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" className="accent-violet-700" checked={unread} onChange={e => {setUnread(e.target.checked);setOffset(0);}}/>Solo sin leer</label><div className="flex gap-2 flex-wrap"><Btn size="sm" variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>Actualizar bandeja</Btn><Btn size="sm" variant="outline" disabled={!count || all.isPending || !!query.error} onClick={() => void all.submit(undefined)}>Marcar todas como leídas</Btn></div></div>
      <RemoteFeedback pending={query.isPending} error={query.error || read.error || all.error} retry={() => void query.refetch()}/>
      {query.isSuccess && !query.error && (items.length ? <ul className="mt-3 divide-y divide-[#E8E5F4] max-h-[55vh] overflow-y-auto">{items.map(item => <li key={item.id_notificacion} className="py-4 space-y-2"><div className="flex gap-3 flex-wrap items-center"><h3 className="font-extrabold">{item.titulo}</h3><span className={`text-xs font-bold ${item.leida_en ? 'text-[#4B4264]' : 'text-violet-800'}`}>{item.leida_en ? 'Leída' : 'Sin leer'}</span></div><p className="text-sm leading-relaxed text-[#4B4264] break-words">{item.texto}</p><time className="block text-xs text-[#4B4264]" dateTime={item.fecha_creacion}>{date(item.fecha_creacion)}</time><div className="flex gap-2 flex-wrap">{item.id_reserva && <Btn size="sm" variant="outline" onClick={() => go('terapeuta/agenda')}>Ver agenda</Btn>}{item.id_conversacion && <Btn size="sm" variant="outline" onClick={() => go('terapeuta/mensajes')}>Ver mensajes</Btn>}{!item.leida_en && <Btn size="sm" variant="outline" disabled={read.isPending} onClick={() => void read.submit(item.id_notificacion)}><Check size={14}/>Marcar como leída</Btn>}</div></li>)}</ul> : <p className="py-6 text-sm text-[#4B4264]">{unread ? 'No tienes notificaciones sin leer.' : 'Todavía no tienes notificaciones. Aquí aparecerán los avisos nuevos que tengas activados.'}</p>)}
      <div className="mt-4 flex justify-between gap-3 pr-12 sm:pr-0"><Btn size="sm" variant="outline" disabled={!offset || query.isFetching} onClick={() => setOffset(v => Math.max(0,v-20))}>Más recientes</Btn><Btn size="sm" variant="outline" disabled={offset+20 >= (query.data?.total ?? 0) || query.isFetching || !!query.error} onClick={() => setOffset(v => v+20)}>Anteriores</Btn></div>
    </div>}
  </section>;
}

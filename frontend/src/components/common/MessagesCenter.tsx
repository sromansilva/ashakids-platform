import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { readAllPages } from '@/services/readAllPages';
import { ApiError } from '@/api/client';
import { messagingService, type Contact } from '@/services/messagingService';
import { RemoteFeedback } from './RemoteFeedback';
import { Btn } from './Btn';
import { MessageThread } from './MessageThread';

type Mode = 'PADRE' | 'TERAPEUTA';
export function MessagesCenter({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  return <MessagesWorkspace key={`${user?.id_usuario}-${mode}`} mode={mode} />;
}

function MessagesWorkspace({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const contacts = useRemote(['message-contacts'], signal => readAllPages(offset => messagingService.contacts(offset, signal), signal));
  const conversations = useInfiniteQuery({ queryKey: [user?.id_usuario, 'conversations'], initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam, signal }) => messagingService.conversations(pageParam, signal),
    getNextPageParam: page => page.next_before_id ?? undefined, enabled: !!user, retry: false });
  const open = useWrite(async (contact: Contact) => { const row = await messagingService.open(contact); setActiveId(row.id_conversacion); setShowList(false); });
  const rows = conversations.isError ? [] : [...new Map(conversations.data?.pages.flatMap(page => page.items).map(row => [row.id_conversacion, row]) ?? []).values()];
  const counterpart = (row: Contact) => mode === 'PADRE' ? row.terapeuta_nombre : row.tutor_nombre;
  const openError = open.error instanceof ApiError && (open.error.status === 0 || open.error.status >= 500) ? new Error(`${open.error.message}. No se confirmó la apertura. Actualiza la lista antes de reintentar.`) : open.error;
  return <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
    <h1 className="text-2xl font-black text-[#1C1135]">Mensajes</h1>
    <p className="text-base text-[#4B4264] mt-2 mb-5">Conversaciones entre familia y profesional. Los mensajes se guardan en el servidor; usa Actualizar para recibir respuestas.</p>
    <div className="grid md:grid-cols-[280px_minmax(0,1fr)] bg-white border border-[#E8E5F4] rounded-2xl overflow-hidden">
      <aside aria-label="Conversaciones" className={`${showList ? 'block' : 'hidden'} md:block border-b md:border-b-0 md:border-r border-[#E8E5F4] p-4 min-w-0`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 className="font-extrabold text-[#1C1135]">Conversaciones</h2>
          <Btn size="sm" variant="outline" className="min-h-11 text-sm" disabled={conversations.isFetching || contacts.isFetching} onClick={() => { void conversations.refetch(); void contacts.refetch(); }}><RefreshCw size={16} aria-hidden="true" />Actualizar lista</Btn></div>
        <RemoteFeedback pending={conversations.isPending} error={conversations.error} retry={() => void conversations.refetch()} />
        {conversations.isSuccess && rows.length === 0 && <p className="text-sm text-[#4B4264] py-3">Todavía no tienes conversaciones.</p>}
        <ul className="space-y-2">{rows.map(row => <li key={row.id_conversacion}><button aria-pressed={activeId === row.id_conversacion} onClick={() => { setActiveId(row.id_conversacion); setShowList(false); }}
          className={`w-full text-left p-3 rounded-xl border focus-visible:outline-2 focus-visible:outline-violet-700 ${activeId === row.id_conversacion ? 'bg-violet-50 border-violet-300' : 'border-[#E8E5F4] hover:bg-violet-50'}`}>
          <span className="font-bold text-base text-[#1C1135] break-words block">{counterpart(row)}</span><span className="text-sm text-[#4B4264]">{row.puede_enviar ? 'Asignación activa' : 'Solo lectura'}</span></button></li>)}</ul>
        {conversations.hasNextPage && <Btn variant="outline" disabled={conversations.isFetching} onClick={() => void conversations.fetchNextPage()}>Más conversaciones</Btn>}
        <h2 className="font-extrabold text-[#1C1135] mt-6 mb-2">Iniciar conversación</h2>
        <p className="text-sm text-[#4B4264]">Disponible con tratamientos activos. Se comparte por familia y profesional, sin crear un chat por hijo.</p>
        <RemoteFeedback pending={contacts.isPending || open.isPending} error={contacts.error || openError} retry={contacts.isError ? () => void contacts.refetch() : undefined} />
        {contacts.isSuccess && contacts.data?.length === 0 && <p className="text-sm text-[#4B4264] py-3">No hay asignaciones activas para iniciar un chat.</p>}
        {!contacts.isError && <ul className="space-y-2 mt-3">{contacts.data?.map(contact => <li key={`${contact.id_tutor}-${contact.id_terapeuta}`}><Btn variant="outline" className="w-full min-h-11 text-sm" disabled={open.isPending} onClick={() => void open.submit(contact)}><MessageCircle size={16} aria-hidden="true" /><span className="break-words min-w-0">Conversar con {counterpart(contact)}</span></Btn></li>)}</ul>}
      </aside>
      <section aria-label="Chat seleccionado" className={`${showList ? 'hidden' : 'block'} md:block p-4 sm:p-5 min-w-0`}>
        {activeId === null ? <p className="text-base text-[#4B4264] py-8">Selecciona una conversación o inicia una con una asignación activa.</p> :
          <MessageThread key={`${user?.id_usuario}-${activeId}`} id={activeId} draft={drafts[activeId] ?? ''} setDraft={value => setDrafts(current => ({ ...current, [activeId]: value }))} onBack={() => setShowList(true)} />}
      </section>
    </div>
  </div>;
}

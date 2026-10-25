import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Archive, CheckCircle2, FileText, MessageCircle, MessageSquare, Paperclip, RefreshCw, Search, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { readAllPages } from '@/core/api/readAllPages';
import { ApiError } from '@/core/api/client';
import { messagingService, type Contact } from '@/modules/comunicacion/infrastructure/messagingService';
import { RemoteFeedback } from './RemoteFeedback';
import { Btn } from './Btn';
import { MessageThread } from './MessageThread';
import { Av } from './Av';
import { B } from '@/shared/presentation/theme/brand/B';
import './workspace.css';

type Mode = 'PADRE' | 'TERAPEUTA';
export function MessagesCenter({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  return <MessagesWorkspace key={`${user?.id_usuario}-${mode}`} mode={mode} />;
}

function MessagesWorkspace({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const contacts = useRemote(['message-contacts'], signal => readAllPages(offset => messagingService.contacts(offset, signal), signal));
  const conversations = useInfiniteQuery({ queryKey: [user?.id_usuario, 'conversations'], initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam, signal }) => messagingService.conversations(pageParam, signal),
    getNextPageParam: page => page.next_before_id ?? undefined, enabled: !!user, retry: false });
  const open = useWrite(async (contact: Contact) => { const row = await messagingService.open(contact); setActiveId(row.id_conversacion); setShowList(false); });
  const rows = conversations.isError ? [] : [...new Map(conversations.data?.pages.flatMap(page => page.items).map(row => [row.id_conversacion, row]) ?? []).values()];
  const counterpart = (row: Contact) => mode === 'PADRE' ? row.terapeuta_nombre : row.tutor_nombre;
  const openError = open.error instanceof ApiError && (open.error.status === 0 || open.error.status >= 500) ? new Error(`${open.error.message}. No se confirmó la apertura. Actualiza la lista antes de reintentar.`) : open.error;
  const availableContacts = contacts.data?.filter(contact => !rows.some(row => row.id_tutor === contact.id_tutor && row.id_terapeuta === contact.id_terapeuta)) ?? [];
  const activeConversation = rows.find(row => row.id_conversacion === activeId);
  const visibleRows = rows.filter(row => counterpart(row).toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()));
  const initials = (name?: string) => name?.split(/\s+/).filter(Boolean).map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'AS';
  const roleLabel = mode === 'PADRE' ? 'Terapeuta asignado' : 'Familia asignada';
  return <div className="messages-center p-4 sm:p-6 max-w-6xl mx-auto pb-24" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
    <header className="messages-page-header mb-5">
      <div>
        <p className="messages-eyebrow"><MessageSquare size={15} aria-hidden="true" /> Comunicación familiar</p>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C1135] mt-2">Mensajes</h1>
        <p className="text-base text-[#4B4264] mt-2">Un espacio seguro para conversar y compartir con {mode === 'PADRE' ? 'tu terapeuta' : 'las familias'}.</p>
      </div>
      <div className="messages-page-status"><span className="messages-status-dot" aria-hidden="true" /> Canal protegido</div>
    </header>
    <div className="messages-workspace messages-shell grid md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_220px] bg-white border border-[#E8E5F4] rounded-3xl overflow-hidden">
      <aside aria-label="Conversaciones" className={`messages-sidebar ${showList ? 'block' : 'hidden'} md:block min-w-0`}>
        <div className="messages-sidebar-heading"><div><p className="messages-panel-kicker">Bandeja</p><h2 className="font-extrabold text-[#1C1135]">Conversaciones</h2></div>
          <Btn size="sm" variant="ghost" title="Actualizar lista" className="messages-icon-button" disabled={conversations.isFetching || contacts.isFetching} onClick={() => { void conversations.refetch(); void contacts.refetch(); }}><RefreshCw size={17} aria-hidden="true" /></Btn></div>
        <label className="messages-search-hint" htmlFor="conversation-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Buscar una conversación</span><input id="conversation-search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Busca una conversación" /></label>
        <RemoteFeedback pending={conversations.isPending} error={conversations.error} retry={() => void conversations.refetch()} />
        {conversations.isSuccess && rows.length === 0 && <div className="messages-empty-list"><MessageCircle size={22} aria-hidden="true" /><p>Todavía no tienes conversaciones.</p></div>}
        <ul className="messages-contact-list">{visibleRows.map(row => <li key={row.id_conversacion}><button aria-pressed={activeId === row.id_conversacion} onClick={() => { setActiveId(row.id_conversacion); setShowList(false); }}
          className={`messages-contact-card ${activeId === row.id_conversacion ? 'is-active' : ''}`}>
          <Av initials={initials(counterpart(row))} color={activeId === row.id_conversacion ? B.violet : B.teal} size="md" /><span className="messages-contact-copy"><span className="font-bold text-sm text-[#1C1135] break-words block">{counterpart(row)}</span><span className="text-xs text-[#6B5E8A]">{row.puede_enviar ? 'Asignación activa' : 'Solo lectura'}</span></span><span className="messages-contact-state" aria-hidden="true"><CheckCircle2 size={15} /></span></button></li>)}</ul>
        {conversations.hasNextPage && <Btn variant="outline" className="w-full mt-3" disabled={conversations.isFetching} onClick={() => void conversations.fetchNextPage()}>Más conversaciones</Btn>}
        <div className="messages-start-block"><p className="messages-panel-kicker">Nuevo mensaje</p><h2 className="font-extrabold text-[#1C1135] mt-1">Iniciar conversación</h2>
        <RemoteFeedback pending={contacts.isPending || open.isPending} error={contacts.error || openError} retry={contacts.isError ? () => void contacts.refetch() : undefined} />
        {contacts.isSuccess && contacts.data?.length === 0 && <p className="text-sm text-[#4B4264] py-3">No hay asignaciones activas para iniciar un chat.</p>}
        {!contacts.isError && <ul className="messages-contact-list mt-3">{availableContacts.map(contact => <li key={`${contact.id_tutor}-${contact.id_terapeuta}`}><button className="messages-new-contact" disabled={open.isPending} onClick={() => void open.submit(contact)}><Av initials={initials(counterpart(contact))} color={B.orange} size="sm" /><span><span className="font-bold text-sm text-[#1C1135] block">{counterpart(contact)}</span><span className="text-xs text-[#6B5E8A]">Abrir conversación</span></span><MessageCircle size={16} aria-hidden="true" /></button></li>)}</ul>}
        {contacts.isSuccess && availableContacts.length === 0 && !!contacts.data?.length && <p className="text-sm text-[#4B4264] mt-3">Tus contactos ya están en la lista de conversaciones.</p>}
        </div>
      </aside>
      <section aria-label="Chat seleccionado" className={`messages-thread-panel ${showList ? 'hidden' : 'block'} md:block min-w-0`}>
        {activeId === null ? <div className="message-welcome"><div className="message-welcome-art"><MessageCircle size={32} aria-hidden="true" /></div><p className="messages-panel-kicker">Tu espacio de acompañamiento</p><h2>Conecta con {mode === 'PADRE' ? 'tu terapeuta' : 'las familias'}</h2><p>Selecciona una conversación o inicia una con una asignación activa.</p><div className="message-welcome-note"><ShieldCheck size={17} aria-hidden="true" /><span>Tus mensajes y archivos se guardan de forma segura en cada conversación.</span></div></div> :
          <MessageThread key={`${user?.id_usuario}-${activeId}`} id={activeId} conversationSummary={activeConversation} draft={drafts[activeId] ?? ''} setDraft={value => setDrafts(current => ({ ...current, [activeId]: value }))} onBack={() => setShowList(true)} />}
      </section>
      <aside aria-label="Detalles de la conversación" className="messages-context hidden xl:flex">
        <div className="messages-context-profile"><div className="messages-context-icon"><UserRound size={18} aria-hidden="true" /></div><p className="messages-panel-kicker">Detalles</p><h2>{activeConversation ? counterpart(activeConversation) : 'Tu comunicación'}</h2><p>{activeConversation ? roleLabel : 'Acompañamiento ASHAKids'}</p></div>
        <div className="messages-context-section"><p className="messages-context-label">Estado</p><div className="messages-context-row"><span className="messages-status-dot" aria-hidden="true" />{activeConversation?.puede_enviar ? 'Asignación activa' : activeConversation ? 'Solo lectura' : 'Listo para conversar'}</div></div>
        <div className="messages-context-section"><p className="messages-context-label"><Paperclip size={14} aria-hidden="true" /> Archivos compartidos</p><div className="messages-context-empty"><FileText size={20} aria-hidden="true" /><span>Los adjuntos de la conversación aparecerán aquí.</span></div></div>
        <div className="messages-context-section messages-context-safe"><ShieldCheck size={17} aria-hidden="true" /><span>Espacio privado para tu familia.</span></div>
        <div className="messages-context-footer"><Archive size={14} aria-hidden="true" /> Historial de conversación</div>
      </aside>
    </div>
  </div>;
}

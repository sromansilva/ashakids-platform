import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { messagingService } from '@/services/messagingService';
import { ApiError } from '@/api/client';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export function MessageThread({ id, draft, setDraft, onBack }: { id: number; draft: string; setDraft: (value: string) => void; onBack: () => void }) {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const conversation = useRemote(['conversation', id], signal => messagingService.get(id, signal));
  const history = useInfiniteQuery({ queryKey: [user?.id_usuario, 'messages', id], initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam, signal }) => messagingService.messages(id, pageParam, signal),
    getNextPageParam: page => page.next_before_id ?? undefined, enabled: !!user, retry: false });
  const send = useWrite((text: string) => messagingService.send(id, text), () => { setDraft(''); setConfirmed(true); });
  const rows = history.isError || conversation.isError ? [] : [...new Map(history.data?.pages.flatMap(page => page.items).map(row => [row.id_mensaje, row]) ?? []).values()].sort((a, b) => a.id_mensaje - b.id_mensaje);
  const view = conversation.isError || history.isError ? undefined : conversation.data;
  const name = user?.id_usuario === view?.id_usuario_tutor ? view?.terapeuta_nombre : view?.tutor_nombre;
  const ready = conversation.isSuccess && history.isSuccess && !conversation.isFetching && !history.isFetching;
  const canSend = ready && !!view?.puede_enviar;
  const failure = send.error instanceof ApiError && (send.error.status === 0 || send.error.status >= 500) ? new Error(`${send.error.message}. No se confirmó el envío. Tu texto se conserva; actualiza la conversación antes de reintentar para evitar duplicados.`) : send.error;
  return <>
    <Btn variant="ghost" onClick={onBack} className="md:hidden"><ArrowLeft size={16} aria-hidden="true" />Volver a conversaciones</Btn>
    <div className="flex flex-wrap justify-between items-start gap-3 mb-3"><h2 className="font-extrabold text-lg text-[#1C1135] break-words min-w-0">{view ? name : 'Conversación'}</h2>
      <Btn size="sm" variant="outline" className="min-h-11 text-sm" disabled={conversation.isFetching || history.isFetching || send.isPending} onClick={() => { void conversation.refetch(); void history.refetch(); }}><RefreshCw size={16} aria-hidden="true" />Actualizar conversación</Btn></div>
    <RemoteFeedback pending={conversation.isPending || history.isPending} error={conversation.error || history.error} retry={() => { void conversation.refetch(); void history.refetch(); }} />
    {view && !view.puede_enviar && <p className="text-base text-[#4B4264] my-3">Conversación de solo lectura. El envío requiere una asignación activa y un chat abierto.</p>}
    {history.hasNextPage && <Btn variant="outline" disabled={history.isFetching} onClick={() => void history.fetchNextPage()}>Cargar mensajes anteriores</Btn>}
    {ready && rows.length === 0 && <p className="text-base text-[#4B4264] py-8">No hay mensajes guardados en esta conversación.</p>}
    <ol aria-label="Mensajes guardados" className="space-y-3 my-4 max-h-[55vh] overflow-y-auto pr-2">{rows.map(message => {
      const own = message.id_usuario_emisor === user?.id_usuario;
      const author = own ? 'Tú' : message.id_usuario_emisor === view?.id_usuario_tutor ? view?.tutor_nombre : message.id_usuario_emisor === view?.id_usuario_terapeuta ? view?.terapeuta_nombre : 'Emisor anterior no disponible';
      return <li key={message.id_mensaje} className={`p-3 rounded-xl max-w-[95%] ${own ? 'ml-auto bg-violet-50' : 'mr-auto bg-[#F5F3FF]'}`}>
        <p className="text-sm font-bold text-[#4B4264] break-words">{author}</p><p className="text-base text-[#1C1135] whitespace-pre-wrap [overflow-wrap:anywhere] my-1">{message.texto_mensaje ?? 'Mensaje sin texto; adjuntos no disponibles en esta vista.'}</p>
        <time dateTime={message.fecha_envio} className="text-sm text-[#4B4264]">{new Date(message.fecha_envio).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' })} (Lima)</time>
      </li>;
    })}</ol>
    <form className="space-y-3 pr-16 sm:pr-0" onSubmit={event => { event.preventDefault(); if (!canSend || !draft.trim() || send.isPending) return; setConfirmed(false); void send.submit(draft.trim()); }}>
      <label htmlFor={`message-${id}`} className="font-bold text-base text-[#1C1135] block">Escribir mensaje</label>
      <textarea id={`message-${id}`} value={draft} maxLength={4000} disabled={!canSend || send.isPending} onChange={event => { setDraft(event.target.value); setConfirmed(false); }} rows={3}
        className="w-full rounded-xl border border-[#E8E5F4] p-3 text-base bg-[#F5F3FF] text-[#1C1135] focus-visible:outline-2 focus-visible:outline-violet-700 disabled:opacity-60" />
      <p className="text-sm text-[#4B4264]">{draft.length}/4000 caracteres. Solo texto; llamadas y adjuntos no están disponibles.</p>
      <RemoteFeedback error={failure} />
      {confirmed && <p role="status" className="text-sm text-[#4B4264]">Mensaje guardado en el servidor.</p>}
      <Btn type="submit" className="min-h-11" disabled={!canSend || !draft.trim() || send.isPending}><Send size={16} aria-hidden="true" />{send.isPending ? 'Guardando mensaje…' : 'Enviar mensaje'}</Btn>
    </form>
  </>;
}

import { useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, RefreshCw, Paperclip, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { messagingService, type Conversation } from '@/services/messagingService';
import { ApiError } from '@/api/client';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import { MessageAttachment } from './MessageAttachment';

export function MessageThread({ id, conversationSummary, draft, setDraft, onBack }: { id: number; conversationSummary?: Conversation; draft: string; setDraft: (value: string) => void; onBack: () => void }) {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const key = useRef<string | null>(null);
  const conversation = useRemote(['conversation', id], signal => messagingService.get(id, signal));
  const history = useInfiniteQuery({ queryKey: [user?.id_usuario, 'messages', id], initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam, signal }) => messagingService.messages(id, pageParam, signal),
    getNextPageParam: page => page.next_before_id ?? undefined, enabled: !!user, retry: false });
  const send = useWrite((text: string) => file ? messagingService.attach(id, file, text, key.current ??= crypto.randomUUID()) : messagingService.send(id, text), () => { setDraft(''); setFile(null); key.current = null; if (input.current) input.current.value = ''; setConfirmed(true); });
  const rows = history.isError || conversation.isError ? [] : [...new Map(history.data?.pages.flatMap(page => page.items).map(row => [row.id_mensaje, row]) ?? []).values()].sort((a, b) => a.id_mensaje - b.id_mensaje);
  const view = conversation.isError || history.isError ? undefined : conversation.data;
  const name = user?.id_usuario === view?.id_usuario_tutor ? view?.terapeuta_nombre : view?.tutor_nombre;
  const ready = conversation.isSuccess && history.isSuccess && !conversation.isFetching && !history.isFetching;
  const canSend = ready && !!view?.puede_enviar;
  const failure = send.error instanceof ApiError && (send.error.status === 0 || send.error.status >= 500) ? new Error(`${send.error.message}. No se confirmó el envío. Tu texto y archivo se conservan; actualiza la conversación antes de reintentar para evitar duplicados.`) : send.error;
  return <>
    <Btn variant="ghost" onClick={onBack} className="md:hidden mb-2"><ArrowLeft size={16} aria-hidden="true" />Volver a conversaciones</Btn>
    <div className="message-thread-heading flex flex-wrap justify-between items-start gap-3 mb-3"><div className="message-thread-person"><div className="message-thread-avatar">{(name || conversationSummary?.tutor_nombre || 'AS').split(/\s+/).filter(Boolean).map(word => word[0]).join('').slice(0, 2).toUpperCase()}</div><div><p className="messages-panel-kicker">Conversación</p><h2 className="font-extrabold text-lg text-[#1C1135] break-words min-w-0">{view ? name : conversationSummary ? (conversationSummary.tutor_nombre || conversationSummary.terapeuta_nombre) : 'Conversación'}</h2><p className="text-sm text-[#4B4264] mt-1">{view?.puede_enviar ? 'Asignación activa' : 'Solo lectura'} · Hora de Lima</p></div></div>
      <div className="message-thread-actions"><span className="message-thread-online"><span className="messages-status-dot" aria-hidden="true" /> En línea</span><Btn size="sm" variant="outline" className="min-h-11 text-sm" disabled={conversation.isFetching || history.isFetching || send.isPending} onClick={() => { void conversation.refetch(); void history.refetch(); }}><RefreshCw size={16} aria-hidden="true" />Actualizar</Btn></div></div>
    <RemoteFeedback pending={conversation.isPending || history.isPending} error={conversation.error || history.error} retry={() => { void conversation.refetch(); void history.refetch(); }} />
    {view && !view.puede_enviar && <p className="text-base text-[#4B4264] my-3">Conversación de solo lectura. El envío requiere una asignación activa y un chat abierto.</p>}
    {history.hasNextPage && <Btn variant="outline" disabled={history.isFetching} onClick={() => void history.fetchNextPage()}>Cargar mensajes anteriores</Btn>}
    {ready && rows.length === 0 && <p className="text-base text-[#4B4264] py-8">No hay mensajes guardados en esta conversación.</p>}
    <ol aria-label="Mensajes guardados" className="message-history space-y-3 my-4 overflow-y-auto">{rows.map(message => {
      const own = message.id_usuario_emisor === user?.id_usuario;
      const author = own ? 'Tú' : message.id_usuario_emisor === view?.id_usuario_tutor ? view?.tutor_nombre : message.id_usuario_emisor === view?.id_usuario_terapeuta ? view?.terapeuta_nombre : 'Emisor anterior no disponible';
      return <li key={message.id_mensaje} className={`message-bubble ${own ? 'is-own' : 'is-received'}`}>
        <p className="text-sm font-bold text-[#4B4264] break-words">{author}</p><p className="text-base text-[#1C1135] whitespace-pre-wrap [overflow-wrap:anywhere] my-1">{message.texto_mensaje ?? ''}</p>
        {message.adjuntos?.map(attachment => <MessageAttachment key={attachment.id_adjunto} conversation={id} attachment={attachment}/>)}
        <time dateTime={message.fecha_envio} className="text-sm text-[#4B4264]">{new Date(message.fecha_envio).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' })} (Lima)</time>
      </li>;
    })}</ol>
    <form className="message-composer space-y-3" onSubmit={event => { event.preventDefault(); if (!canSend || (!draft.trim() && !file) || !!fileError || send.isPending) return; setConfirmed(false); void send.submit(draft.trim()); }}>
      <div className="message-composer-heading"><label htmlFor={`message-${id}`} className="font-bold text-base text-[#1C1135] block">Escribir mensaje</label><span><ShieldCheck size={14} aria-hidden="true" /> Mensaje privado</span></div>
      <textarea id={`message-${id}`} value={draft} maxLength={4000} disabled={!canSend || send.isPending} onChange={event => { setDraft(event.target.value); key.current = null; setConfirmed(false); }} rows={3}
        placeholder="Escribe aquí tu mensaje…" className="w-full rounded-xl border border-[#C8C2DC] p-3 text-base bg-white text-[#1C1135] focus-visible:outline-2 focus-visible:outline-violet-700 disabled:opacity-60" />
      <p className="text-sm text-[#4B4264]">{draft.length}/4000 caracteres. Un archivo por mensaje, hasta 10 MB: JPG, PNG, GIF, WebP, MP3, WAV, OGG, MP4, WebM, PDF o TXT.</p>
      <label className="message-attachment-label" htmlFor={`attachment-${id}`}><Paperclip size={18} aria-hidden="true"/>Adjuntar archivo</label>
      <input ref={input} id={`attachment-${id}`} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.mp4,.webm,.pdf,.txt" disabled={!canSend || send.isPending} className="block w-full min-w-0 text-sm text-[#4B4264]" onChange={event => {
        const selected = event.target.files?.[0] ?? null; setFile(selected); key.current = null; setConfirmed(false);
        setFileError(selected && (selected.size === 0 || selected.size > 10 * 1024 * 1024) ? 'Selecciona un archivo no vacío de hasta 10 MB.' : '');
      }}/>
      {file && <div className="flex flex-wrap items-center gap-2"><p className="break-all text-sm">Seleccionado: {file.name}</p><Btn size="sm" variant="ghost" disabled={send.isPending} onClick={() => { setFile(null); setFileError(''); key.current = null; if (input.current) input.current.value = ''; }}>Quitar archivo</Btn></div>}
      {fileError && <p role="alert" className="text-sm text-red-800">{fileError}</p>}
      <RemoteFeedback error={failure} />
      {confirmed && <p role="status" className="text-sm text-[#4B4264]">Mensaje guardado en el servidor.</p>}
      <Btn type="submit" className="message-send-button min-h-11" disabled={!canSend || (!draft.trim() && !file) || !!fileError || send.isPending}><Send size={16} aria-hidden="true" />{send.isPending ? 'Guardando mensaje…' : 'Enviar mensaje'}</Btn>
    </form>
  </>;
}

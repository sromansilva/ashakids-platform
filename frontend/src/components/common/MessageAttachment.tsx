import { useEffect, useRef, useState } from 'react';
import { Download, Paperclip, Eye } from 'lucide-react';
import { messagingService, type Attachment } from '@/services/messagingService';
import { Btn } from './Btn';

export function MessageAttachment({ conversation, attachment }: { conversation: number; attachment: Attachment }) {
  const [url, setUrl] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(true);
  const source = useRef('');
  const controller = useRef<AbortController | null>(null);
  const media = /^(image|audio|video)\//.test(attachment.mime_type);
  const size = attachment.tamano_bytes < 1024 ? `${attachment.tamano_bytes} B` : attachment.tamano_bytes < 1024 * 1024 ? `${(attachment.tamano_bytes / 1024).toFixed(1)} KB` : `${(attachment.tamano_bytes / 1024 / 1024).toFixed(2)} MB`;
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); if (source.current) URL.revokeObjectURL(source.current); }; }, []);
  async function load(download: boolean) {
    if (pending) return;
    setPending(true); setError('');
    try {
      let location = source.current;
      if (!location) {
        controller.current = new AbortController();
        const blob = await messagingService.download(conversation, attachment.id_adjunto, controller.current.signal);
        if (!active.current) return;
        if (blob.type.split(';')[0] !== attachment.mime_type || blob.size !== attachment.tamano_bytes) throw new Error('El archivo recibido no coincide con el adjunto. Actualiza la conversación.');
        location = URL.createObjectURL(blob); source.current = location;
      }
      if (download) {
        const anchor = document.createElement('a'); anchor.href = location; anchor.download = attachment.nombre_archivo; anchor.click();
      } else setUrl(location);
    } catch (failure) { if (active.current) setError(failure instanceof Error ? failure.message : 'No se pudo descargar el archivo.'); }
    finally { if (active.current) setPending(false); }
  }
  return <div className="my-3 space-y-2 min-w-0">
    <p className="text-sm font-bold break-words flex items-start gap-2"><Paperclip size={16} aria-hidden="true" className="shrink-0"/>{attachment.nombre_archivo} · {size}</p>
    <div className="flex flex-wrap gap-2">{media && !url && <Btn size="sm" variant="outline" disabled={pending} onClick={() => void load(false)}><Eye size={16} aria-hidden="true"/>Ver archivo</Btn>}<Btn size="sm" variant="outline" disabled={pending} onClick={() => void load(true)}><Download size={16} aria-hidden="true"/>{pending ? 'Descargando…' : 'Descargar archivo'}</Btn></div>
    {url && attachment.mime_type.startsWith('image/') && <img src={url} alt={attachment.nombre_archivo} className="max-w-full max-h-64 rounded-xl object-contain"/>}
    {url && attachment.mime_type.startsWith('audio/') && <audio controls src={url} aria-label={attachment.nombre_archivo} className="w-full"/>}
    {url && attachment.mime_type.startsWith('video/') && <video controls src={url} aria-label={attachment.nombre_archivo} className="max-w-full max-h-72"/>}
    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
  </div>;
}

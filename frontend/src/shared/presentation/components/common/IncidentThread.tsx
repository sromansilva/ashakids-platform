import { useEffect, useState } from 'react';
import type { IncidentNote } from '@/shared/domain/types/IncidentNote';

interface Props {
  id: number;
  load: (id: number, signal?: AbortSignal) => Promise<{ items: IncidentNote[] }>;
  reply?: (id: number, contenido: string, interna: boolean) => Promise<IncidentNote>;
}
export function IncidentThread({ id, load, reply }: Props) {
  const [notes, setNotes] = useState<IncidentNote[]>([]);
  const [text, setText] = useState('');
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setNotes([]); setText(''); setError(''); setLoading(true);
    load(id, controller.signal).then(({ items }) => { if (!controller.signal.aborted) setNotes(items); })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las respuestas.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, load]);
  return <section className="space-y-4" aria-label="Seguimiento de incidencia">
    <h2 className="text-lg font-extrabold text-[#1C1135]">Respuestas y seguimiento</h2>
    {loading ? <p role="status">Cargando respuestas…</p> : !notes.length && <p className="text-sm text-[#615274]">Todavía no hay respuestas.</p>}
    {notes.map((note) => <article key={note.id_nota} className={`rounded-2xl border border-[#E8E5F4] p-4 ${note.interna ? 'bg-[#EDE9FE]' : 'bg-white'}`}>
      <p className="text-xs font-bold text-[#615274]">{note.interna ? 'Nota interna · solo soporte' : note.autor} · {new Date(note.fecha_creacion).toLocaleString('es-PE')}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[#1C1135]">{note.contenido}</p>
    </article>)}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {reply && <form className="space-y-3" onSubmit={async (event) => {
      event.preventDefault(); if (busy || !text.trim()) return;
      setBusy(true); setError('');
      try { const note = await reply(id, text.trim(), internal); setNotes((current) => [...current, note]); setText(''); }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar.'); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm font-bold">Mensaje<textarea required maxLength={4000} value={text} disabled={busy} onChange={(event) => setText(event.target.value)} className="mt-2 block w-full rounded-2xl border border-[#E8E5F4] p-4" rows={4} /></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={internal} disabled={busy} onChange={(event) => setInternal(event.target.checked)} />Nota interna (no se muestra al solicitante)</label>
      <p className="text-xs text-[#615274]">Incluye solo información técnica. Evita datos clínicos, contraseñas y datos personales innecesarios.</p>
      <button disabled={busy || !text.trim()} className="rounded-xl bg-[#6B46FE] px-5 py-3 font-bold text-white hover:bg-[#5833EA] disabled:opacity-50">{busy ? 'Guardando…' : internal ? 'Guardar nota interna' : 'Enviar respuesta'}</button>
    </form>}
  </section>;
}

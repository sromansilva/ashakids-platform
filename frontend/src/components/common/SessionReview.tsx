import { useState } from 'react';
import { Star } from 'lucide-react';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { reviewsService, reviewsPending } from '@/services/reviewsService';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export function SessionReview({ id, therapist }: { id: number; therapist: string }) {
  const query = useRemote(['session-review', id], signal => reviewsService.get(id, signal));
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const write = useWrite(() => reviewsService.create(id, rating, comment));
  if (reviewsPending(query.error)) return <div className="py-5 border-t border-[#E8E5F4]"><h3 className="font-extrabold">Calificar a tu terapeuta</h3><p className="text-sm text-[#4B4264] mt-2">Próximamente</p></div>;
  return <section className="session-review py-5 border-t border-[#E8E5F4] space-y-3">
    <h3 className="font-extrabold text-lg text-[#1C1135]">Tu valoración de {therapist}</h3>
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()}/>
    {query.isSuccess && query.data && <div role="status"><p className="font-bold text-violet-800">Calificaste esta sesión con {query.data.calificacion} de 5 estrellas.</p>{query.data.comentario && <p className="whitespace-pre-wrap [overflow-wrap:anywhere] mt-2">{query.data.comentario}</p>}<p className="text-sm mt-2">Gracias por compartir tu experiencia.</p></div>}
    {query.isSuccess && !query.data && <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (rating && !write.isPending) void write.submit(undefined); }}>
      <p className="text-sm text-[#4B4264]">Puedes dejar tu opinión ahora o volver a este día en la agenda cuando quieras.</p>
      <fieldset disabled={write.isPending}><legend className="font-bold mb-2">Calificación</legend><div className="flex gap-2 flex-wrap">{[1,2,3,4,5].map(value => <label key={value} className="relative cursor-pointer">
        <input className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="radio" name={`rating-${id}`} value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}/>
        <span className="pointer-events-none flex flex-col items-center justify-center gap-1 min-w-12 min-h-14 px-3 py-2 rounded-xl border border-[#E8E5F4] peer-checked:border-violet-600 peer-checked:bg-violet-50 peer-focus-visible:outline-2 peer-focus-visible:outline-violet-700"><Star size={22} fill={value <= rating ? '#6d28d9' : 'none'} className="text-violet-700" aria-hidden="true"/><span className="text-xs font-bold">{value}</span></span>
      </label>)}</div></fieldset>
      <label className="block font-bold" htmlFor={`review-comment-${id}`}>Comentario (opcional)</label>
      <textarea id={`review-comment-${id}`} value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={3} disabled={write.isPending} placeholder="Cuéntanos cómo fue tu experiencia" className="w-full rounded-xl border border-[#C8C2DC] bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-violet-700"/>
      <p className="text-sm text-[#4B4264]">Tu terapeuta verá tu nombre, calificación y comentario. Evita incluir información clínica o personal de tu hijo.</p>
      <RemoteFeedback error={write.error}/>
      <Btn type="submit" disabled={!rating || write.isPending}>{write.isPending ? 'Guardando valoración…' : 'Enviar valoración'}</Btn>
    </form>}
  </section>;
}

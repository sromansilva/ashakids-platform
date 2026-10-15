import { Star, RefreshCw } from 'lucide-react';
import { useRemote } from '@/hooks/useRemoteData';
import { reviewsService, reviewsPending } from '@/services/reviewsService';
import { readAllPages } from '@/services/readAllPages';
import { Btn } from '@/components/common/Btn';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { ComingSoon } from '@/components/common/ComingSoon';

export function TerapeutaIngresos() { return <ComingSoon title="Ingresos"/>; }

export function TerapeutaValoraciones() {
  const query = useRemote(['therapist-reviews'], signal => readAllPages(offset => reviewsService.list({ limit: 100, offset }, signal), signal));
  if (reviewsPending(query.error)) return <ComingSoon title="Valoraciones" description="Las familias podrán calificar las sesiones atendidas desde su agenda."/>;
  const rows = query.error ? [] : query.data ?? [];
  const average = rows.length ? (rows.reduce((sum, row) => sum + row.calificacion, 0) / rows.length).toFixed(1) : null;
  const countLabel = `${rows.length} ${rows.length === 1 ? 'valoración' : 'valoraciones'}`;
  return <section className="p-4 sm:p-6 max-w-5xl mx-auto text-[#1C1135]">
    <header className="flex gap-4 flex-wrap justify-between items-start mb-6"><div><h1 className="text-2xl font-black">Valoraciones</h1><p className="text-base text-[#4B4264] mt-2">Opiniones de familias sobre sus sesiones contigo.</p></div><Btn variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw size={16}/>Actualizar valoraciones</Btn></header>
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()}/>
    {query.isSuccess && !rows.length && <div className="bg-white rounded-2xl border border-[#E8E5F4] py-12 px-5 text-center"><Star size={32} className="mx-auto text-violet-700 mb-4" aria-hidden="true"/><h2 className="text-lg font-extrabold">Todavía no tienes valoraciones</h2><p className="text-base text-[#4B4264] mt-2">Aparecerán aquí cuando una familia califique una sesión atendida.</p></div>}
    {!!rows.length && <><section aria-label="Resumen de valoraciones" className="grid md:grid-cols-[190px_1fr] gap-6 p-6 bg-white border border-[#E8E5F4] rounded-2xl mb-6"><div><p className="text-sm text-[#4B4264]">Calificación media</p><p className="text-4xl font-black my-2">{average}<span className="text-base font-bold text-[#4B4264]"> / 5</span></p><p className="text-sm">{countLabel}</p></div><dl className="space-y-2">{[5,4,3,2,1].map(stars => { const count = rows.filter(r => r.calificacion === stars).length; return <div key={stars} className="grid grid-cols-[3rem_1fr_2rem] gap-3 items-center text-sm"><dt>{stars} ★</dt><div aria-hidden="true" className="bg-violet-100 rounded-full h-2 overflow-hidden"><div className="h-full bg-violet-700 rounded-full" style={{width: `${count / rows.length * 100}%`}}/></div><dd className="font-bold tabular-nums">{count}</dd></div>; })}</dl></section>
    <ul className="space-y-4">{rows.map(row => <li key={row.id_valoracion} className="bg-white rounded-2xl border border-[#E8E5F4] p-5"><div className="flex gap-3 flex-wrap justify-between"><div><p className="font-extrabold">{row.autor_nombre}</p><p className="text-sm text-[#4B4264] mt-1">Sesión del {new Date(row.fecha_sesion).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p></div><p className="flex gap-1 items-center text-violet-800 font-bold"><Star size={18} aria-hidden="true"/>{row.calificacion} de 5</p></div>{row.comentario && <p className="whitespace-pre-wrap [overflow-wrap:anywhere] text-base mt-4">{row.comentario}</p>}<p className="text-sm text-[#4B4264] mt-4">Valoración del {new Date(row.fecha_creacion).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p></li>)}</ul></>}
  </section>;
}


import { Star, RefreshCw } from 'lucide-react';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { reviewsService, reviewsPending } from '@/modules/terapeuta/infrastructure/reviewsService';
import { readAllPages } from '@/core/api/readAllPages';
import { Btn } from '@/shared/presentation/components/common/Btn';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { ComingSoon } from '@/shared/presentation/components/common/ComingSoon';

export function TerapeutaIngresos() { return <ComingSoon title="Ingresos"/>; }

export function TerapeutaValoraciones() {
  const query = useRemote(['therapist-reviews'], signal => readAllPages(offset => reviewsService.list({ limit: 100, offset }, signal), signal));
  if (reviewsPending(query.error)) return <ComingSoon title="Valoraciones" description="Las familias podrán calificar las sesiones atendidas desde su agenda."/>;

  const rows = query.error ? [] : query.data ?? [];
  const average = rows.length ? (rows.reduce((sum, row) => sum + row.calificacion, 0) / rows.length).toFixed(1) : null;
  const countLabel = `${rows.length} ${rows.length === 1 ? 'valoración' : 'valoraciones'}`;

  return (
    <section className="therapist-page w-full px-4 py-4 text-[#1C1135] sm:px-6 sm:py-5 xl:px-8">
      <header className="therapist-animate mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E8E5F4] bg-gradient-to-r from-white to-[#F8F6FF] p-5 sm:p-6 shadow-sm">
        <div>
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#6B46FE]">Experiencia de las familias</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Valoraciones</h1>
          <p className="mt-1 text-sm font-semibold text-[#615274]">Opiniones de familias sobre sus sesiones contigo.</p>
        </div>
        <Btn variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} aria-hidden="true" />
          Actualizar valoraciones
        </Btn>
      </header>

      <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()}/>

      {query.isSuccess && !rows.length && (
        <div className="therapist-animate flex min-h-[min(48vh,440px)] flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9D1EF] bg-white px-6 py-12 text-center shadow-sm">
          <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#F2EDFF] text-[#6B46FE]">
            <Star size={27} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-extrabold">Todavía no tienes valoraciones</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#615274]">Aparecerán aquí cuando una familia califique una sesión atendida.</p>
        </div>
      )}

      {!!rows.length && (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.6fr)]">
          <section aria-label="Resumen de valoraciones" className="therapist-animate overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-[#6B46FE] via-[#7448F2] to-[#4C1D95] p-6 text-white shadow-[0_16px_38px_rgba(76,29,149,.16)]">
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-white/75">Calificación media</p>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-5xl font-black leading-none tabular-nums">{average}</p>
              <span className="pb-1 text-sm font-bold text-white/75">/ 5</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-amber-300" aria-label={`${average} de 5 estrellas`}>
              {[1, 2, 3, 4, 5].map(star => <Star key={star} size={17} fill={Number(average) >= star ? 'currentColor' : 'none'} aria-hidden="true" />)}
            </div>
            <dl className="mt-6 space-y-3 border-t border-white/20 pt-5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = rows.filter(row => row.calificacion === stars).length;
                const share = count / rows.length * 100;
                return (
                  <div key={stars} className="grid grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center gap-3 text-xs">
                    <dt className="inline-flex items-center gap-1 font-bold">{stars}<Star size={11} fill="currentColor" aria-hidden="true" /></dt>
                    <dd aria-label={`${share}%`} className="h-2 overflow-hidden rounded-full bg-white/20">
                      <span className="block h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${share}%` }} />
                    </dd>
                    <dd className="text-right font-bold tabular-nums">{count}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section aria-label="Opiniones recibidas" className="min-w-0 space-y-3">
            <div className="therapist-animate flex items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-base font-black">Opiniones recibidas</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#8C82A8]">Comentarios asociados a tus sesiones</p>
              </div>
              <span className="rounded-full border border-[#E8E5F4] bg-white px-3 py-1.5 text-xs font-extrabold text-[#615274]">{countLabel}</span>
            </div>
            <ul className={`grid grid-cols-1 gap-3 ${rows.length > 1 ? '2xl:grid-cols-2' : ''}`}>
              {rows.map(row => (
                <li key={row.id_valoracion} className="therapist-animate therapist-hover-card rounded-2xl border border-[#E8E5F4] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-extrabold">{row.autor_nombre}</p>
                      <p className="mt-1 text-xs font-semibold text-[#615274]">Sesión del {new Date(row.fecha_sesion).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F5F0FF] px-3 py-1.5 text-xs font-extrabold text-violet-800">
                      <Star size={14} fill="currentColor" aria-hidden="true" /> {row.calificacion} de 5
                    </span>
                  </div>
                  {row.comentario && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#4B4264] [overflow-wrap:anywhere]">“{row.comentario}”</p>}
                  <p className="mt-4 border-t border-[#F0EDF7] pt-3 text-[11px] font-semibold text-[#8C82A8]">Valoración del {new Date(row.fecha_creacion).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </section>
  );
}

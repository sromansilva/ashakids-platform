import { useEffect, useState } from 'react';
import { ChevronDown, Inbox } from 'lucide-react';
import { View } from '@/shared/domain/types/navigation';
import { Btn } from '@/shared/presentation/components/common/Btn';
import { incidenciasService, IncidenciaAdmin } from '@/modules/comunicacion/infrastructure/incidenciasService';

const estados = { NUEVA: 'Nueva', LEIDA: 'Leída', RESUELTA: 'Resuelta' };
export function AdminOperacion({ go: _go }: { go: (v: View) => void }) {
  const [items, setItems] = useState<IncidenciaAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setSelected(null); setActionError(''); setItems([]);
    incidenciasService.listar(page * 20, controller.signal).then(result => {
      if (!Array.isArray(result.items) || !Number.isInteger(result.total) || result.total < 0) throw new Error('El servidor devolvió una lista inválida. Intenta nuevamente.');
      if (!controller.signal.aborted) { setItems(result.items); setTotal(result.total); }
    }).catch(cause => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las incidencias.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, reload]);
  const update = async (id: number, estado: 'LEIDA' | 'RESUELTA') => {
    setSaving(id); setActionError('');
    try {
      const result = await incidenciasService.estado(id, estado);
      setItems(current => current.map(item => item.id_incidencia === id ? { ...item, ...result } : item));
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'No se pudo guardar el estado.'); }
    finally { setSaving(null); }
  };
  return <section className="p-4 sm:p-6 max-w-5xl mx-auto text-[#1C1135]">
    <div className="admin-page-heading flex flex-wrap items-start justify-between gap-4 mb-6">
      <div><h1 className="text-2xl font-black">Incidencias</h1>
        <p className="text-sm text-[#625779] mt-2">Reportes enviados por padres y terapeutas desde su formulario de incidencias.</p></div>
      <Btn variant="secondary" disabled={loading || saving !== null} onClick={() => setReload(v => v + 1)}>Actualizar</Btn>
    </div>
    {loading && <p role="status" className="bg-white rounded-2xl p-6">Cargando incidencias…</p>}
    {error && <div role="alert" className="bg-red-50 text-red-800 rounded-2xl p-5"><p>{error}</p>
      <button className="underline font-bold mt-3" onClick={() => setReload(v => v + 1)}>Reintentar</button></div>}
    {!loading && !error && <>
      <p className="text-sm text-[#625779] mb-4">{total} {total === 1 ? 'incidencia recibida' : 'incidencias recibidas'}</p>
      {items.length === 0 ? <div className="bg-white rounded-2xl p-8 text-center">
        <Inbox size={32} className="mx-auto text-violet-700 mb-3" aria-hidden="true" />
        <h2 className="font-extrabold">No hay incidencias en esta página</h2>
        <p className="text-sm text-[#625779] mt-2">Los reportes de los usuarios aparecerán aquí cuando los envíen.</p>
      </div> : <div className="bg-white rounded-2xl divide-y divide-[#E8E5F4] overflow-hidden">
        {items.map(item => <article key={item.id_incidencia}>
          <button type="button" disabled={saving !== null} className="w-full text-left p-5 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
            aria-expanded={selected === item.id_incidencia} aria-controls={`incident-${item.id_incidencia}`} onClick={() => { setSelected(selected === item.id_incidencia ? null : item.id_incidencia); setActionError(''); }}>
            <div className="flex items-start justify-between gap-3"><div className="min-w-0">
              <h2 className="font-extrabold break-words">{item.titulo}</h2>
              <p className="text-sm text-[#625779] mt-1 break-words">{item.usuario} · {item.rol === 'PADRE' ? 'Padre' : 'Terapeuta'}</p>
              <p className="text-xs text-[#625779] mt-2">{item.tipo} · {new Date(item.fecha_creacion).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</p>
            </div><div className="flex items-center gap-2 shrink-0"><span className="rounded-full bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1">{estados[item.estado]}</span><ChevronDown size={16} aria-hidden="true" /></div></div>
          </button>
          {selected === item.id_incidencia && <div id={`incident-${item.id_incidencia}`} className="px-5 pb-5">
            <h3 className="text-sm font-bold mb-2">Descripción</h3>
            <p className="text-sm whitespace-pre-wrap break-words mb-4">{item.descripcion}</p>
            {actionError && <p role="alert" className="text-red-800 mb-3">{actionError}</p>}
            <div className="flex gap-2 flex-wrap">
              {item.estado === 'NUEVA' && <Btn size="sm" variant="secondary" disabled={saving !== null} onClick={() => update(item.id_incidencia, 'LEIDA')}>Confirmar lectura</Btn>}
              {item.estado !== 'RESUELTA' && <Btn size="sm" disabled={saving !== null} onClick={() => update(item.id_incidencia, 'RESUELTA')}>{saving === item.id_incidencia ? 'Guardando…' : 'Marcar como resuelta'}</Btn>}
            </div>
          </div>}
        </article>)}
      </div>}
      {total > 20 && <nav aria-label="Páginas de incidencias" className="flex items-center gap-4 mt-5">
        <Btn size="sm" variant="secondary" disabled={page === 0 || saving !== null} onClick={() => setPage(p => p - 1)}>Anterior</Btn>
        <span className="text-sm">Página {page + 1} de {Math.ceil(total / 20)}</span>
        <Btn size="sm" variant="secondary" disabled={(page + 1) * 20 >= total || saving !== null} onClick={() => setPage(p => p + 1)}>Siguiente</Btn>
      </nav>}
    </>}
  </section>;
}

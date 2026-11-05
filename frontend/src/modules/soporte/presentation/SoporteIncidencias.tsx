import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { soporteService } from '../infrastructure/soporteService';
import { estadosSoporte, type TicketSoporte } from '../domain/soporte';
import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';

const field = 'rounded-xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm';
export function SoporteIncidencias() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<TicketSoporte[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    soporteService.listar({ search, estado: estado || undefined, prioridad: prioridad ? Number(prioridad) : undefined, offset, limit: 30 }, controller.signal)
      .then((data) => {
        if (!Array.isArray(data.items) || typeof data.total !== 'number') throw new Error('Respuesta inválida de la bandeja de soporte.');
        if (!controller.signal.aborted) { setItems(data.items); setTotal(data.total); }
      })
      .catch((cause: unknown) => { if (!controller.signal.aborted) { setItems([]); setError(cause instanceof Error ? cause.message : 'No se pudo cargar la bandeja.'); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, estado, prioridad, offset, refresh]);
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-black">Incidencias técnicas</h1><p className="mt-2 text-sm text-[#615274]">Atiende los problemas de la plataforma y registra su solución.</p></div>
      <button className="rounded-2xl bg-[#6B46FE] px-5 py-3 font-bold text-white hover:bg-[#5833EA]" onClick={() => setCreating(!creating)}>{creating ? 'Cerrar formulario' : 'Nueva incidencia'}</button>
    </div>
    {creating && <IncidentForm role="SOPORTE_TECNICO" defaultTipo="Soporte de Plataforma" title="Nueva incidencia técnica" subtitle="Describe el problema técnico sin incluir información clínica, credenciales ni datos personales innecesarios." submitButtonText="Registrar incidencia" submitIncident={soporteService.crear} onSuccess={(ticket) => navigate(`/soporte/incidencias/${ticket.id_incidencia}`)} />}
    <form className="flex flex-wrap gap-3" onSubmit={(event) => event.preventDefault()}>
      <label className="flex flex-col gap-1 text-sm">Buscar<input className={field} value={search} maxLength={150} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder="Ticket, tipo o descripción" /></label>
      <label className="flex flex-col gap-1 text-sm">Estado<select className={field} value={estado} onChange={(event) => { setEstado(event.target.value); setOffset(0); }}><option value="">Todos</option>{estadosSoporte.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm">Prioridad<select className={field} value={prioridad} onChange={(event) => { setPrioridad(event.target.value); setOffset(0); }}><option value="">Todas</option><option value="3">Alta</option><option value="2">Media</option><option value="1">Baja</option></select></label>
      <button className={`${field} self-end font-bold text-[#6B46FE]`} onClick={() => setRefresh((value) => value + 1)}>Actualizar</button>
    </form>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p role="status">Cargando incidencias…</p> : !error && <>
      <p className="text-sm text-[#615274]">{total} incidencias</p>
      {!items.length && <p className="rounded-3xl border border-[#E8E5F4] bg-white p-8">No hay incidencias que coincidan con los filtros.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((ticket) => <Link key={ticket.id_incidencia} to={`/soporte/incidencias/${ticket.id_incidencia}`} className="min-w-0 rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm hover:border-[#6B46FE] focus-visible:outline-2 focus-visible:outline-[#6B46FE]">
        <div className="flex flex-wrap justify-between gap-2 text-xs font-bold"><span className="text-[#6B46FE]">{ticket.ticket}</span><span>{['', 'Baja', 'Media', 'Alta'][ticket.prioridad]}</span></div>
        <h2 className="mt-3 font-extrabold">{ticket.tipo}</h2><p className="mt-2 line-clamp-3 break-words text-sm text-[#615274]">{ticket.descripcion}</p>
        <p className="mt-4 text-xs font-bold">{ticket.estado} · {new Date(ticket.fecha_creacion).toLocaleDateString('es-PE')}</p>
      </Link>)}</div>
      <div className="flex gap-3"><button className={field} disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 30))}>Anterior</button><button className={field} disabled={offset + 30 >= total} onClick={() => setOffset(offset + 30)}>Siguiente</button></div>
    </>}
  </div>;
}

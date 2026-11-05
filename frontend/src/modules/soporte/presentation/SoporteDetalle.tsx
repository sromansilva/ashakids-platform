import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { soporteService } from '../infrastructure/soporteService';
import { estadosSoporte, type EstadoSoporte, type TicketSoporte } from '../domain/soporte';
import { IncidentThread } from '@/shared/presentation/components/common/IncidentThread';

export function SoporteDetalle() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<TicketSoporte | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setTicket(null); setError(''); setLoading(true);
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) {
      setError('Identificador de incidencia inválido.'); setLoading(false); return () => controller.abort();
    }
    soporteService.obtener(Number(id), controller.signal).then((data) => { if (!controller.signal.aborted) setTicket(data); })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la incidencia.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);
  return <div className="space-y-6">
    <Link to="/soporte/incidencias" className="font-bold text-[#6B46FE]">← Volver a incidencias</Link>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading && <p role="status">Cargando detalle…</p>}
    {ticket && <>
      <section className="space-y-4 rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm">
        <p className="font-bold text-[#6B46FE]">{ticket.ticket}</p><h1 className="text-2xl font-black">{ticket.tipo}</h1>
        <p className="whitespace-pre-wrap break-words text-[#615274]">{ticket.descripcion}</p>
        <p className="text-sm">Prioridad: {['', 'Baja', 'Media', 'Alta'][ticket.prioridad]} · Creada: {new Date(ticket.fecha_creacion).toLocaleString('es-PE')}</p>
        <label className="block text-sm font-bold">Estado<select aria-label="Estado" value={ticket.estado} disabled={saving} className="ml-3 rounded-xl border border-[#E8E5F4] p-3" onChange={async (event) => {
          const estado = event.target.value as EstadoSoporte; setSaving(true); setError('');
          try { setTicket(await soporteService.estado(ticket.id_incidencia, estado)); }
          catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el estado.'); }
          finally { setSaving(false); }
        }}>
          {!estadosSoporte.includes(ticket.estado as EstadoSoporte) && <option>{ticket.estado}</option>}
          {estadosSoporte.map((estado) => <option key={estado}>{estado}</option>)}
        </select></label>{saving && <p role="status">Guardando estado…</p>}
      </section>
      <IncidentThread key={ticket.id_incidencia} id={ticket.id_incidencia} load={soporteService.notas} reply={soporteService.responder} />
    </>}
  </div>;
}

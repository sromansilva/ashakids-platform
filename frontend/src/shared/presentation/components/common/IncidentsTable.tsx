import { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Shield,
  Calendar,
  X,
  RefreshCw,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Incidencia } from '@/modules/comunicacion/infrastructure/incidenciasService';

interface IncidentsTableProps {
  items: Incidencia[];
  loading: boolean;
  onRefresh: () => void;
  canUpdateStatus?: boolean;
  onStatusChange?: (id: number, newStatus: string) => Promise<void>;
  emptyMessage?: string;
  isReceivedView?: boolean;
}

export function IncidentsTable({
  items,
  loading,
  onRefresh,
  canUpdateStatus = false,
  onStatusChange,
  emptyMessage = 'No se encontraron solicitudes.',
  isReceivedView = false,
}: IncidentsTableProps) {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('TODAS');
  const [selected, setSelected] = useState<Incidencia | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  // Normalizar y filtrar
  const filtered = items.filter((item) => {
    if (filterEstado !== 'TODAS') {
      const st = (item.estado || '').toUpperCase();
      if (filterEstado === 'RECIBIDA' && !['RECIBIDA', 'NUEVA', 'ABIERTA'].includes(st)) return false;
      if (filterEstado === 'LEIDA' && !['LEIDA', 'LEÍDA'].includes(st)) return false;
      if (filterEstado === 'EN_PROCESO' && !['EN PROCESO', 'EN_PROCESO'].includes(st)) return false;
      if (filterEstado === 'SOLUCIONADA' && !['SOLUCIONADA', 'ATENDIDA', 'RESUELTA'].includes(st)) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (item.ticket && item.ticket.toLowerCase().includes(q)) ||
        (item.tipo && item.tipo.toLowerCase().includes(q)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q)) ||
        (item.solicitante && item.solicitante.toLowerCase().includes(q)) ||
        (item.area_destino && item.area_destino.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (estado: string) => {
    const st = (estado || '').toUpperCase();
    if (['SOLUCIONADA', 'ATENDIDA', 'RESUELTA'].includes(st)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={13} /> Solucionada
        </span>
      );
    }
    if (['EN PROCESO', 'EN_PROCESO'].includes(st)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
          <Clock size={13} /> En Proceso
        </span>
      );
    }
    if (['LEIDA', 'LEÍDA'].includes(st)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
          <FileText size={13} /> Leída
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
        <AlertCircle size={13} /> Recibida
      </span>
    );
  };

  const getPriorityBadge = (prioridad?: number, texto?: string) => {
    const p = prioridad || (texto === 'ALTA' ? 3 : texto === 'BAJA' ? 1 : 2);
    if (p >= 3) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Alta
        </span>
      );
    }
    if (p === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Baja
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Media
      </span>
    );
  };

  const getAreaLabel = (area?: string, responsable?: string, terapeutaNombre?: string | null) => {
    if (area === 'TERAPEUTA') {
      return terapeutaNombre ? `Terapeuta: ${terapeutaNombre}` : 'Terapeuta Asignado';
    }
    if (area === 'SOPORTE_TECNICO') return 'Soporte Técnico';
    if (area === 'ADMINISTRACION') return 'Administración';
    return responsable || 'Administración';
  };

  const handleUpdate = async (id: number, newSt: string) => {
    if (!onStatusChange) return;
    setUpdatingId(id);
    setActionError('');
    try {
      await onStatusChange(id, newSt);
      if (selected && selected.id_incidencia === id) {
        setSelected({ ...selected, estado: newSt });
      }
    } catch (err: any) {
      setActionError(err?.message || 'Error al actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E5F4] p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ticket, asunto o texto..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F7FC] rounded-xl text-xs font-semibold text-[#1C1135] placeholder:text-[#9E95B7] border border-[#E8E5F4] focus:outline-hidden focus:border-[#6B46FE]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[#6B5E8A] shrink-0">Estado:</span>
          {(['TODAS', 'RECIBIDA', 'LEIDA', 'EN_PROCESO', 'SOLUCIONADA'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterEstado(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                filterEstado === st
                  ? 'bg-[#6B46FE] text-white shadow-xs'
                  : 'bg-[#F0EEF8] text-[#615274] hover:bg-[#E8E5F4]'
              }`}
            >
              {st === 'TODAS'
                ? 'Todas'
                : st === 'RECIBIDA'
                ? 'Recibidas'
                : st === 'LEIDA'
                ? 'Leídas'
                : st === 'EN_PROCESO'
                ? 'En Proceso'
                : 'Solucionadas'}
            </button>
          ))}

          <button
            type="button"
            onClick={onRefresh}
            title="Recargar"
            className="p-2 rounded-xl border border-[#E8E5F4] text-[#615274] hover:text-[#6B46FE] hover:bg-[#F8F7FC] transition-all ml-auto"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
          {actionError}
        </div>
      )}

      {/* Table / List */}
      <div className="bg-white rounded-3xl border border-[#E8E5F4] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-sm font-bold text-[#9E95B7]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#6B46FE]" />
            Cargando solicitudes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[#6B5E8A] px-4">
            <FileText size={36} className="mx-auto mb-3 text-[#C8C2DC]" />
            <p className="font-bold text-base text-[#1C1135]">{emptyMessage}</p>
            <p className="text-xs text-[#9E95B7] mt-1">No hay incidencias que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5F4] bg-[#FAF9FD] text-[11px] font-black tracking-wider uppercase text-[#8C82A8]">
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Descripción / Solicitud</th>
                  {isReceivedView && <th className="py-3.5 px-4">Solicitante</th>}
                  {!isReceivedView && <th className="py-3.5 px-4">Destinatario / Área</th>}
                  <th className="py-3.5 px-4">Prioridad</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEF8] text-xs font-semibold text-[#1C1135]">
                {filtered.map((item) => (
                  <tr
                    key={item.id_incidencia}
                    className="hover:bg-[#F8F7FC] transition-colors cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <td className="py-3.5 px-4 font-mono font-black text-[#6B46FE]">
                      {item.ticket || `INC-${String(item.id_incidencia).padStart(5, '0')}`}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1C1135] max-w-[140px] truncate">
                      {item.tipo}
                    </td>
                    <td className="py-3.5 px-4 text-[#615274] max-w-xs truncate">
                      {item.descripcion}
                    </td>
                    {isReceivedView && (
                      <td className="py-3.5 px-4 text-[#1C1135]">
                        <span className="font-bold">{item.solicitante || 'Usuario'}</span>
                        <span className="block text-[10px] text-[#9E95B7] uppercase font-bold">
                          {item.rol_solicitante || 'PADRE'}
                        </span>
                      </td>
                    )}
                    {!isReceivedView && (
                      <td className="py-3.5 px-4 font-medium text-[#1C1135]">
                        {getAreaLabel(item.area_destino, item.responsable, item.terapeuta_nombre)}
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(item.prioridad, item.prioridad_texto)}
                    </td>
                    <td className="py-3.5 px-4 text-[#8C82A8] text-[11px] whitespace-nowrap">
                      {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.estado)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(item);
                        }}
                        className="inline-flex items-center gap-1 text-[#6B46FE] hover:text-[#5835E5] font-black text-xs hover:underline"
                      >
                        Ver <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle Completo */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E8E5F4] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-[#E8E5F4] flex items-center justify-between bg-[#FAF9FD]">
              <div>
                <span className="font-mono text-xs font-black text-[#6B46FE]">
                  {selected.ticket || `INC-${String(selected.id_incidencia).padStart(5, '0')}`}
                </span>
                <h3 className="text-lg font-black text-[#1C1135] mt-0.5">{selected.tipo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#E8E5F4] text-[#615274] hover:text-[#1C1135] flex items-center justify-center transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Badges de Estado y Prioridad */}
              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(selected.estado)}
                {getPriorityBadge(selected.prioridad, selected.prioridad_texto)}
                <span className="text-xs font-bold text-[#8C82A8]">
                  Registrado el {new Date(selected.fecha_creacion).toLocaleString('es-PE')}
                </span>
              </div>

              {/* Solicitud / Descripción */}
              <div className="bg-[#F8F7FC] rounded-2xl p-4 border border-[#E8E5F4]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#6B5E8A] mb-1.5">
                  Descripción del reporte:
                </h4>
                <p className="text-sm text-[#1C1135] leading-relaxed whitespace-pre-wrap font-medium">
                  {selected.descripcion}
                </p>
              </div>

              {/* Información de Destinatario y Solicitante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-[#E8E5F4] bg-white">
                  <span className="block text-[11px] font-bold text-[#8C82A8] uppercase">Solicitante</span>
                  <p className="font-black text-[#1C1135] text-sm mt-0.5">{selected.solicitante || 'Usuario'}</p>
                  <p className="text-[#6B5E8A] font-semibold">{selected.rol_solicitante || 'PADRE'}</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#E8E5F4] bg-white">
                  <span className="block text-[11px] font-bold text-[#8C82A8] uppercase">Área Responsable</span>
                  <p className="font-black text-[#1C1135] text-sm mt-0.5">
                    {getAreaLabel(selected.area_destino, selected.responsable, selected.terapeuta_nombre)}
                  </p>
                  <p className="text-[#6B5E8A] font-semibold">
                    Destino: {selected.area_destino || 'ADMINISTRACION'}
                  </p>
                </div>
              </div>

              {/* Cambios de Estado para Responsables Autorizados */}
              {canUpdateStatus && onStatusChange && (
                <div className="pt-4 border-t border-[#E8E5F4]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#1C1135] mb-2.5">
                    Actualizar estado de atención:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updatingId !== null || ['LEIDA', 'LEÍDA'].includes(selected.estado.toUpperCase())}
                      onClick={() => handleUpdate(selected.id_incidencia, 'LEÍDA')}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-all"
                    >
                      Marcar como Leída
                    </button>
                    <button
                      type="button"
                      disabled={updatingId !== null || ['EN PROCESO', 'EN_PROCESO'].includes(selected.estado.toUpperCase())}
                      onClick={() => handleUpdate(selected.id_incidencia, 'EN PROCESO')}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-all"
                    >
                      Poner En Proceso
                    </button>
                    <button
                      type="button"
                      disabled={updatingId !== null || ['SOLUCIONADA', 'ATENDIDA', 'RESUELTA'].includes(selected.estado.toUpperCase())}
                      onClick={() => handleUpdate(selected.id_incidencia, 'SOLUCIONADA')}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition-all"
                    >
                      Marcar como Solucionada
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-[#E8E5F4] bg-[#FAF9FD] flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E8E5F4] text-[#1C1135] hover:bg-[#DDD8EE] transition-all"
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


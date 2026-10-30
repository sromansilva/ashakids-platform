import { useState } from 'react';
import {
  FileText,
  Calendar,
  Image as ImageIcon,
  Settings,
  User,
  ChevronRight,
} from 'lucide-react';

export interface AdminOperacionTableProps {
  items: any[];
  allItems: any[];
  selected: number | null;
  setSelected: (id: number | null) => void;
  onUpdateEstado: (id: number, estado: 'LEIDA' | 'RESUELTA') => void;
  saving: number | null;
  actionError: string;
}

export function AdminOperacionTable({
  items,
  allItems,
  selected,
  setSelected,
  onUpdateEstado,
  saving,
  actionError,
}: AdminOperacionTableProps) {
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'reportes':
        return <FileText size={16} className="text-[#615274]" />;
      case 'reservas':
        return <Calendar size={16} className="text-[#615274]" />;
      case 'visualización':
      case 'visualizacion':
        return <ImageIcon size={16} className="text-[#615274]" />;
      default:
        return <Settings size={16} className="text-[#615274]" />;
    }
  };

  const selectedItem = selected !== null ? allItems.find((i) => i.id_incidencia === selected) : null;

  return (
    <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-xs overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[#E8E5F4] bg-[#F8F7FD] text-xs font-extrabold text-[#615274]">
              <th className="py-4 px-6">Incidencia</th>
              <th className="py-4 px-6">Reportado por</th>
              <th className="py-4 px-6">Tipo</th>
              <th className="py-4 px-6">Estado</th>
              <th className="py-4 px-6">Fecha</th>
              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5F4] text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm font-bold text-[#615274]">
                  No hay incidencias en esta página
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selected === item.id_incidencia;
                return (
                  <tr key={item.id_incidencia} className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-[#6B46FE] block mb-0.5">
                        {item.codigo || `INC-${item.id_incidencia}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelected(isSelected ? null : item.id_incidencia)}
                        className="font-extrabold text-sm text-[#1C1135] text-left hover:text-[#6B46FE] cursor-pointer"
                      >
                        {item.titulo}
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-[#615274] font-medium">
                        <User size={16} className="text-[#8C82A8]" />
                        <span>
                          {item.usuario
                            ? `${item.usuario} (${item.rol === 'PADRE' ? 'Padre de familia' : 'Terapeuta'})`
                            : item.rol === 'PADRE'
                            ? 'Padre de familia'
                            : 'Terapeuta'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-[#615274] font-medium">
                        {getTipoIcon(item.tipo)}
                        <span>{item.tipo}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {['ABIERTA', 'NUEVA', 'RECIBIDA'].includes(item.estado) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                          {item.estado === 'NUEVA' ? 'Nueva' : 'Abierta'}
                        </span>
                      )}
                      {['EN_REVISION', 'LEIDA', 'LEÍDA', 'EN PROCESO', 'EN_PROCESO'].includes(item.estado) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          {item.estado === 'LEIDA' || item.estado === 'LEÍDA' ? 'Leída' : 'En revisión'}
                        </span>
                      )}
                      {['RESUELTA', 'SOLUCIONADA', 'ATENDIDA'].includes(item.estado) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                          Resuelta
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-[#615274] font-medium text-xs sm:text-sm">
                      {new Date(item.fecha_creacion).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelected(isSelected ? null : item.id_incidencia)}
                        className="inline-flex items-center gap-1 font-bold text-xs text-[#6B46FE] hover:text-[#5833EA] cursor-pointer"
                      >
                        Ver detalle
                        <ChevronRight size={14} className={isSelected ? 'rotate-90 transition-transform' : ''} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected incident expanded detail */}
      {selectedItem && (
        <div className="p-6 bg-[#FAF9FE] border-t border-[#E8E5F4]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#1C1135] mb-1">
                {selectedItem.codigo}: {selectedItem.titulo}
              </h3>
              <p className="text-xs text-[#615274] mb-3">
                Reportado por {selectedItem.usuario} ({selectedItem.rol}) el{' '}
                {new Date(selectedItem.fecha_creacion).toLocaleString('es-PE')}
              </p>
              <p className="text-sm text-[#4B4264] leading-relaxed max-w-3xl whitespace-pre-wrap">
                {selectedItem.descripcion}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {['ABIERTA', 'NUEVA', 'RECIBIDA'].includes(selectedItem.estado) && (
                <button
                  disabled={saving !== null}
                  onClick={() => onUpdateEstado(selectedItem.id_incidencia, 'LEIDA')}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-900 hover:bg-amber-200 transition cursor-pointer"
                >
                  Poner en revisión
                </button>
              )}
              {!['RESUELTA', 'SOLUCIONADA', 'ATENDIDA'].includes(selectedItem.estado) && (
                <button
                  disabled={saving !== null}
                  onClick={() => onUpdateEstado(selectedItem.id_incidencia, 'RESUELTA')}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6B46FE] text-white hover:bg-[#5833EA] transition cursor-pointer shadow-xs"
                >
                  {saving === selectedItem.id_incidencia ? 'Guardando…' : 'Marcar como resuelta'}
                </button>
              )}
            </div>
          </div>
          {actionError && <p role="alert" className="mt-2 text-xs text-red-600 font-bold">{actionError}</p>}
        </div>
      )}
    </div>
  );
}

import {
  FileText,
  Calendar,
  Image as ImageIcon,
  Settings,
  User,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { AdminIncidentDetailModal } from './AdminIncidentDetailModal';

export interface AdminOperacionTableProps {
  items: any[];
  allItems: any[];
  selected: number | null;
  setSelected: (id: number | null) => void;
  onUpdateEstado: (id: number, estado: 'EN ATENCIÓN' | 'RESUELTA') => Promise<void>;
  onRedirigir: (
    id: number,
    nuevaArea: 'ADMINISTRACION' | 'SOPORTE_TECNICO' | 'TERAPEUTA',
    idTerapeuta?: number | null
  ) => Promise<void>;
  onRevocar: (id: number) => Promise<void>;
  saving: number | null;
  actionError: string;
  sortOrder?: 'desc' | 'asc';
  onToggleSort?: () => void;
}

export function AdminOperacionTable({
  items,
  allItems,
  selected,
  setSelected,
  onUpdateEstado,
  onRedirigir,
  onRevocar,
  saving,
  actionError,
  sortOrder = 'desc',
  onToggleSort,
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
              <th className="py-4 px-6">Área</th>
              <th className="py-4 px-6">Estado</th>
              <th
                className={`py-4 px-6 ${onToggleSort ? 'cursor-pointer hover:text-[#6B46FE] transition-colors select-none' : ''}`}
                onClick={onToggleSort}
                title={onToggleSort ? 'Clic para ordenar por fecha' : undefined}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Fecha</span>
                  {onToggleSort && (
                    <ArrowUpDown size={12} className={sortOrder === 'desc' ? 'text-[#6B46FE]' : 'text-[#8C82A8]'} />
                  )}
                </div>
              </th>
              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5F4] text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm font-bold text-[#615274]">
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

                    <td className="py-4 px-6">{item.area_destino === 'SOPORTE_TECNICO' ? 'Soporte técnico' : item.area_destino === 'TERAPEUTA' ? 'Terapeuta' : 'Administración'}</td>
                    <td className="py-4 px-6">
                      {item.estado === 'RECIBIDA' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                          RECIBIDA
                        </span>
                      )}
                      {item.estado === 'EN ATENCIÓN' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          EN ATENCIÓN
                        </span>
                      )}
                      {item.estado === 'RESUELTA' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                          RESUELTA
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
                        type="button"
                        onClick={() => setSelected(item.id_incidencia)}
                        className="inline-flex items-center gap-1 font-bold text-xs text-[#6B46FE] hover:text-[#5833EA] cursor-pointer"
                      >
                        Ver detalle
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal con detalle completo, acciones de estado, revocación y redirección */}
      {selectedItem && (
        <AdminIncidentDetailModal
          item={selectedItem}
          onClose={() => setSelected(null)}
          onUpdateEstado={onUpdateEstado}
          onRedirigir={onRedirigir}
          onRevocar={onRevocar}
          saving={saving}
          actionError={actionError}
        />
      )}
    </div>
  );
}

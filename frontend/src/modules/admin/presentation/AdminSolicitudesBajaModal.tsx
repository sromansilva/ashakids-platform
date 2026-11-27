import React from "react";
import { CalendarDays, Inbox, Loader2, RefreshCw, User, UserX, X } from "lucide-react";
import type { SolicitudBajaItem } from "@/modules/admin/infrastructure/adminService";

interface AdminSolicitudesBajaModalProps {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  items: SolicitudBajaItem[];
  formatDate: (d?: string | null) => string;
  onClose: () => void;
  onRefresh: () => void;
  onInspectAccount?: (idUsuario: number) => void;
}

export const AdminSolicitudesBajaModal: React.FC<AdminSolicitudesBajaModalProps> = ({
  isOpen,
  loading,
  error,
  items,
  formatDate,
  onClose,
  onRefresh,
  onInspectAccount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-solicitudes-baja-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[#1C1135]/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-white border border-[#E8E5F4] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[#E8E5F4] bg-[#F8F7FC]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center shrink-0">
              <UserX size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="modal-solicitudes-baja-title"
                className="text-lg sm:text-xl font-extrabold text-[#1C1135] leading-tight"
              >
                Solicitudes de baja
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#615274]">
                Solicitudes de desactivación de cuenta enviadas por padres de familia.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Actualizar solicitudes de baja"
              className="w-9 h-9 rounded-xl border border-[#E8E5F4] bg-white text-[#615274] hover:bg-[#F5F3FF] hover:text-[#6B46FE] flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana"
              className="w-9 h-9 rounded-xl border border-[#E8E5F4] bg-white text-[#615274] hover:bg-violet-50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs sm:text-sm font-bold text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#615274]">
              <Loader2 size={28} className="animate-spin text-[#6B46FE]" />
              <p className="text-sm font-bold">Cargando solicitudes de baja…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-[#E8E5F4] bg-[#FBFAFF]">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#6B46FE] mx-auto mb-3 flex items-center justify-center">
                <Inbox size={22} aria-hidden="true" />
              </div>
              <p className="text-base font-extrabold text-[#1C1135]">No hay solicitudes de baja registradas</p>
              <p className="text-xs sm:text-sm font-medium text-[#615274] mt-1">
                Cuando un padre solicite la desactivación de su cuenta, aparecerá en este listado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#E8E5F4]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7FC] border-b border-[#E8E5F4] text-xs font-extrabold uppercase tracking-wider text-[#615274]">
                    <th className="px-4 py-3">Padre solicitante</th>
                    <th className="px-4 py-3">Fecha de solicitud</th>
                    <th className="px-4 py-3">Estado cuenta</th>
                    {onInspectAccount && <th className="px-4 py-3 text-right">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5F4] text-sm">
                  {items.map((item) => (
                    <tr key={item.id_solicitud} className="hover:bg-[#FBFAFF] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
                            <User size={15} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-[#1C1135] truncate">{item.padre_nombre}</p>
                            <p className="text-xs font-medium text-[#615274] truncate">
                              {item.codigo_usuario} · {item.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#1C1135]">
                          <CalendarDays size={14} className="text-[#6B46FE]" aria-hidden="true" />
                          {formatDate(item.fecha_solicitud)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            item.cuenta_activa
                              ? "bg-[#FFF4E5] text-[#C2410C]"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                          }`}
                        >
                          {item.cuenta_activa ? "Activa (por revisar)" : "Suspendida"}
                        </span>
                      </td>
                      {onInspectAccount && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onInspectAccount(item.id_usuario)}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#6B46FE] bg-[#EDE9FE] hover:bg-[#DDD6FE] transition-colors cursor-pointer"
                          >
                            Ver cuenta
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

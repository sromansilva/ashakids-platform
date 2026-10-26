import React from "react";
import { Loader2, Pencil } from "lucide-react";
import type { CuentaItem } from "@/modules/auth/domain/auth";

interface AdminCuentasTableProps {
  loading: boolean;
  visible: CuentaItem[];
  openDetail: (acc: CuentaItem) => void;
  openEditar: (acc: CuentaItem) => void;
  formatDate: (s?: string | null) => string;
}

export const AdminCuentasTable: React.FC<AdminCuentasTableProps> = ({
  loading,
  visible,
  openDetail,
  openEditar,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden">
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-[#615274]">
          <Loader2 className="animate-spin text-[#6B46FE]" size={24} />
          <span className="text-sm font-extrabold">Cargando cuentas…</span>
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="text-center py-16 text-[#8C82A8] font-medium text-sm">
          Sin cuentas que coincidan con los criterios.
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E8E5F4] bg-[#F8F7FD] text-xs font-extrabold text-[#615274]">
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6">Código</th>
                <th className="py-4 px-6">Correo</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Registro</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F4] text-sm">
              {visible.map((acc) => {
                const initials = `${acc.nombres[0] || ""}${acc.apellidos[0] || ""}`.toUpperCase();
                return (
                  <tr
                    key={acc.id_usuario}
                    className="hover:bg-[#F9F8FD] transition-colors"
                  >
                    {/* Usuario */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#6B46FE] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                          {initials}
                        </div>
                        <span className="font-extrabold text-[#1C1135]">
                          {acc.nombres} {acc.apellidos}
                        </span>
                      </div>
                    </td>

                    {/* Código */}
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-mono text-xs font-bold uppercase">
                        {acc.codigo_usuario}
                      </span>
                    </td>

                    {/* Correo */}
                    <td className="py-4 px-6 text-[#615274] font-medium">
                      {acc.email}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          acc.activo
                            ? "bg-[#ECFDF5] text-[#059669]"
                            : "bg-[#FEF2F2] text-[#DC2626]"
                        }`}
                      >
                        {acc.activo ? "Activa" : "Suspendida"}
                      </span>
                    </td>

                    {/* Registro */}
                    <td className="py-4 px-6 text-[#615274]">
                      {formatDate(acc.fecha_creacion)}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEditar(acc)}
                          title="Editar cuenta"
                          className="w-9 h-9 rounded-xl border border-[#E8E5F4] text-[#6B46FE] hover:bg-violet-50 transition flex items-center justify-center cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDetail(acc)}
                          className="px-3.5 h-9 rounded-xl border border-[#E8E5F4] font-bold text-xs text-[#1C1135] hover:bg-violet-50 transition flex items-center justify-center cursor-pointer"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminCuentasTable;

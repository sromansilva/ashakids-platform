import React from "react";
import { Loader2, Pencil } from "lucide-react";
import type { CuentaItem } from "@/types/auth";

const B = {
  violet: "#7C3AED",
  teal: "#0D9488",
};

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
    <div className="flex flex-col gap-2.5">
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-[#7C6F9A]">
          <Loader2 className="animate-spin text-violet-600" size={24} />
          <span className="text-sm font-extrabold">Cargando cuentas desde FastAPI…</span>
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="text-center py-16 text-[#9E95B7] font-medium text-sm bg-white border border-[#E8E5F4] rounded-2xl">
          Sin cuentas que coincidan con los criterios.
        </div>
      )}

      {!loading &&
        visible.map((acc) => {
          const initials = `${acc.nombres[0] || ""}${acc.apellidos[0] || ""}`.toUpperCase();
          return (
            <div
              key={acc.id_usuario}
              className="w-full bg-white border border-[#E8E5F4] rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-violet-300 hover:shadow-sm transition-all"
            >
              {/* Avatar */}
              <button
                onClick={() => openDetail(acc)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white flex-shrink-0 shadow-sm"
                style={{ background: acc.rol === "PADRE" ? B.violet : B.teal }}
              >
                {initials}
              </button>

              {/* Información Principal */}
              <div
                onClick={() => openDetail(acc)}
                className="flex-1 min-w-0 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm text-[#1C1135] truncate hover:text-violet-700 transition-colors">
                    {acc.nombres} {acc.apellidos}
                  </p>
                  <span className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                    {acc.codigo_usuario}
                  </span>
                </div>
                <p className="text-xs text-[#9E95B7] font-medium truncate">{acc.email}</p>
              </div>

              {/* Especialidad de terapeuta si existe */}
              {acc.rol === "TERAPEUTA" && acc.terapeuta?.especialidad && (
                <span
                  className="hidden sm:inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: "#F0FDFA", color: B.teal }}
                >
                  {acc.terapeuta.especialidad}
                </span>
              )}

              {/* Badge de estado Activo / Suspendido */}
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  acc.activo
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {acc.activo ? "Activa" : "Suspendida"}
              </span>

              <p className="hidden md:block text-[11px] text-[#C4BDD8] font-medium flex-shrink-0">
                {formatDate(acc.fecha_creacion)}
              </p>

              {/* Acciones Rápidas */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditar(acc)}
                  title="Editar cuenta"
                  className="p-2 rounded-xl text-gray-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => openDetail(acc)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  Ver
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default AdminCuentasTable;

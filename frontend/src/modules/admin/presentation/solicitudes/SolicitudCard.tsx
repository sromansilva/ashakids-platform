import { ChevronRight } from "lucide-react";
import { Av } from "@/shared/presentation/components/common/Av";
import type { SolicitudAcceso } from "@/modules/admin/infrastructure/adminService";
import { fecha, iniciales } from "./solicitudesFormat";

interface SolicitudCardProps {
  solicitud: SolicitudAcceso;
  selected: boolean;
  onSelect: () => void;
}

export function SolicitudCard({ solicitud: s, selected, onSelect }: SolicitudCardProps) {
  return (
    <button
      key={s.id_solicitud}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all hover:border-[#6B46FE]"
      style={{ borderColor: selected ? "#6B46FE" : "#E8E5F4" }}
    >
      <Av initials={iniciales(s)} color="#6B46FE" size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-[#1C1135]">
          {s.nombres} {s.apellidos}
        </p>
        <p className="truncate text-xs font-medium text-[#615274]">{s.email}</p>
        <p className="text-xs font-medium text-[#9E95B7]">
          {fecha(s.creado_en)}
          {s.estado === "PROCESANDO" ? " · Procesando" : ""}
        </p>
      </div>
      <ChevronRight size={14} className="shrink-0 text-[#9E95B7]" />
    </button>
  );
}

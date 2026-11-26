import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { DniVerificacionEstado } from "@/modules/admin/infrastructure/adminService";
import { tiempoRelativo } from "./solicitudesFormat";

interface DniVerificacionBadgeProps {
  estado: DniVerificacionEstado;
  verificadoEn?: string | null;
  nombreReniec?: string;
}

const CONFIGS: Record<
  DniVerificacionEstado,
  { label: string; icon: typeof CheckCircle2; tone: string; bg: string; border: string; text: string }
> = {
  COINCIDE: {
    label: "DNI verificado",
    icon: CheckCircle2,
    tone: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  NO_COINCIDE: {
    label: "Los datos no coinciden",
    icon: AlertTriangle,
    tone: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
  },
  NO_ENCONTRADO: {
    label: "DNI no encontrado en RENIEC",
    icon: XCircle,
    tone: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  NO_CONFIGURADO: {
    label: "Verificación no configurada",
    icon: Info,
    tone: "text-[#615274]",
    bg: "bg-[#F8F7FC]",
    border: "border-[#E8E5F4]",
    text: "text-[#615274]",
  },
  ERROR: {
    label: "No se pudo verificar, inténtalo de nuevo",
    icon: AlertTriangle,
    tone: "text-[#615274]",
    bg: "bg-[#F8F7FC]",
    border: "border-[#E8E5F4]",
    text: "text-[#615274]",
  },
};

export function DniVerificacionBadge({ estado, verificadoEn, nombreReniec }: DniVerificacionBadgeProps) {
  const c = CONFIGS[estado];
  if (!c) return null;
  const Icon = c.icon;
  const rel = verificadoEn ? tiempoRelativo(verificadoEn) : null;

  return (
    <div className="flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${c.bg} ${c.border} ${c.text}`}>
        <Icon size={14} className={c.tone} aria-hidden="true" />
        <span>{c.label}</span>
        {rel && <span className="font-normal opacity-75">· {rel}</span>}
      </div>
      {estado === "NO_COINCIDE" && nombreReniec && (
        <p className="text-xs font-semibold text-amber-900">
          RENIEC: <span className="font-bold">{nombreReniec}</span>
        </p>
      )}
    </div>
  );
}

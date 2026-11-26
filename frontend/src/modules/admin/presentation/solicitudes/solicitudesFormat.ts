import type {
  DniVerificacionEstado,
  ResultadoSolicitudAcceso,
  SolicitudAcceso,
} from "@/modules/admin/infrastructure/adminService";

export type Accion = "aprobar" | "rechazar";
export type Resultado = { tone: "ok" | "warn" | "error"; lines: string[] };

export interface DniFeedback {
  estado: DniVerificacionEstado;
  verificado_en: string | null;
  nombre_reniec?: string;
}

export const AVISO_TEXTO: Record<string, string> = {
  ENVIADO: "Aviso por WhatsApp enviado.",
  FUERA_DE_VENTANA: "No se avisó por WhatsApp: pasaron más de 24 horas desde su último mensaje.",
  ERROR: "El aviso por WhatsApp falló. La decisión sigue vigente.",
  NO_CONFIGURADO: "WhatsApp no está configurado, por eso no se envió aviso.",
  OMITIDO: "No se avisó por WhatsApp porque el correo de activación no salió.",
};

export function fecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" });
}

export function tiempoRelativo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return fecha(iso);
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "hace unos segundos";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras} h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias < 7) return `hace ${diffDias} d`;
  return fecha(iso);
}

export function iniciales(s: SolicitudAcceso): string {
  return `${s.nombres.charAt(0)}${s.apellidos.charAt(0)}`.toUpperCase() || "?";
}

export function describirResultado(accion: Accion, r: ResultadoSolicitudAcceso): Resultado {
  const lines: string[] = [];
  const aviso = r.aviso_whatsapp ? AVISO_TEXTO[r.aviso_whatsapp] ?? `Aviso por WhatsApp: ${r.aviso_whatsapp}.` : null;
  if (accion === "rechazar") {
    lines.push("Solicitud rechazada.");
    if (aviso) lines.push(aviso);
    return { tone: r.aviso_whatsapp === "ERROR" ? "warn" : "ok", lines };
  }
  const correoSalio = r.correo_bienvenida === "ENVIADO";
  if (correoSalio) {
    lines.push(`Cuenta creada. El enlace de activación se envió a ${r.solicitud.email}.`);
  } else {
    lines.push("Cuenta creada, pero el correo de activación NO salió.");
    lines.push("Usa el reenvío de activación para enviar el enlace a la familia.");
  }
  if (aviso) lines.push(aviso);
  return { tone: correoSalio && r.aviso_whatsapp !== "ERROR" ? "ok" : "warn", lines };
}

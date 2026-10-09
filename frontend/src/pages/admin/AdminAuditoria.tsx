import { useState } from "react";
import { Shield } from "lucide-react";
import { B } from "@/theme/brand/B";

// ─── Auditoría Operativa ──────────────────────────────────────────────────────

export function AdminAuditoria() {
  const [filter, setFilter] = useState<"todos" | "acceso" | "cambio" | "excepcion">("todos");
  const entries = [
    { actor: "Dra. Ana Ruiz",     tipo: "acceso",    accion: "Lectura de expediente clínico",         fecha: "30 Jul 2026 · 10:14", resultado: "Autorizado", motivo: "Vinculación activa" },
    { actor: "Laura Gómez",       tipo: "acceso",    accion: "Acceso a resumen compartido",            fecha: "30 Jul 2026 · 09:45", resultado: "Autorizado", motivo: "Acceso propio" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Verificación de estado de cuenta",       fecha: "30 Jul 2026 · 09:00", resultado: "Completado", motivo: "Soporte operativo" },
    { actor: "ASHI · Sistema",    tipo: "acceso",    accion: "Lectura de datos de perfil operativo",   fecha: "29 Jul 2026 · 18:00", resultado: "Autorizado", motivo: "Contextual · mínimo necesario" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Modificación de estado de terapeuta",    fecha: "29 Jul 2026 · 16:45", resultado: "Completado", motivo: "Verificación de credenciales" },
    { actor: "Lic. Carlos M.",    tipo: "acceso",    accion: "Lectura de expediente clínico",          fecha: "29 Jul 2026 · 11:20", resultado: "Autorizado", motivo: "Vinculación activa" },
    { actor: "Admin · Soporte",   tipo: "excepcion", accion: "Acceso a log de sesión técnica",         fecha: "28 Jul 2026 · 15:30", resultado: "Autorizado", motivo: "Incidente técnico reportado · ticket #4821" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Desactivación de cuenta inactiva",       fecha: "28 Jul 2026 · 09:00", resultado: "Completado", motivo: "90 días sin actividad · aviso previo enviado" },
    { actor: "ASHI · Sistema",    tipo: "acceso",    accion: "Análisis de métricas de plataforma",     fecha: "27 Jul 2026 · 08:00", resultado: "Autorizado", motivo: "Función operativa" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Activación de cuenta por reactivación",  fecha: "26 Jul 2026 · 14:15", resultado: "Completado", motivo: "Verificación de identidad superada" },
  ];

  const filtered = filter === "todos" ? entries : entries.filter(e => e.tipo === filter);

  const tipoColor: Record<string, { bg: string; color: string; label: string }> = {
    acceso:    { bg: "#EDE9FE", color: "#7C3AED", label: "Acceso" },
    cambio:    { bg: "#D1FAE5", color: "#059669", label: "Cambio" },
    excepcion: { bg: "#FEF3C7", color: "#D97706", label: "Excepción" },
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Registro operativo sin contenido clínico.</span> Solo se muestran actor, acción, fecha/hora, resultado y motivo de acceso. Los detalles clínicos están restringidos.
        </p>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135]">Auditoría operativa</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Registro de accesos y acciones · Datos simulados para demostración</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full border" style={{ background: B.orangeLight, color: B.orange, borderColor: "#FDBA74" }}>
          ⚠️ Datos simulados
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(["todos", "acceso", "cambio", "excepcion"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: filter === f ? B.violet : B.violetLight,
              color: filter === f ? "white" : B.violet,
            }}>
            {f === "todos" ? "Todos" : tipoColor[f].label}
          </button>
        ))}
      </div>

      {/* Audit table */}
      <div className="flex flex-col gap-2">
        {filtered.map((entry, i) => (
          <div key={i} className="rounded-2xl border border-[#E8E5F4] p-4 hover:bg-[#F5F3FF] transition-colors">
            <div className="flex items-start gap-3 flex-wrap">
              <span className="text-xs font-black px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5"
                style={{ background: tipoColor[entry.tipo].bg, color: tipoColor[entry.tipo].color }}>
                {tipoColor[entry.tipo].label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className="font-extrabold text-sm text-[#1C1135]">{entry.accion}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#D1FAE5", color: "#059669" }}>
                    {entry.resultado}
                  </span>
                </div>
                <p className="text-xs text-[#4B4869] font-medium mb-0.5">
                  Actor: <span className="font-bold">{entry.actor}</span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-[#9E95B7] font-medium">{entry.fecha}</p>
                  <p className="text-xs font-medium text-[#7C6F9A]">Motivo: {entry.motivo}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-[#9E95B7] font-medium mt-5 italic">
        Política de retención del registro de auditoría: pendiente de aprobación. · {filtered.length} registros mostrados.
      </p>
    </div>
  );
}

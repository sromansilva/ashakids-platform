
import { Calendar, Zap, Star, Globe, Bot, Stethoscope, Activity, Shield, Download, Bell } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";

export function AdminPanel({ go }: { go: (v: View) => void }) {
  const kpis = [
    { icon: <Calendar size={17} />, val: "24", label: "Reservas de hoy", urgency: "info", color: B.teal, bg: B.tealLight },
    { icon: <Zap size={17} />, val: "2", label: "Incidencias técnicas abiertas", urgency: "alta", color: "#DC2626", bg: "#FEE2E2" },
    { icon: <Star size={17} />, val: "5", label: "Contenidos pendientes", urgency: "media", color: "#8B5CF6", bg: "#EDE9FE" },
    { icon: <Globe size={17} />, val: "96.4 %", label: "Disponibilidad del sistema", urgency: "ok", color: "#059669", bg: "#D1FAE5" },
    { icon: <Bot size={17} />, val: "En validación", label: "Modelo ML", urgency: "info", color: B.violet, bg: B.violetLight },
  ];

  const alerts = [
    { level: "alta", icon: "🔴", text: "2 incidencias técnicas sin resolver en sesiones activas.", action: "Operación" },
    { level: "info", icon: "🔵", text: "Modelo ML v0.3-demo en fase de validación — sin publicar.", action: "Machine Learning" },
  ];

  const actionMap: Record<string, View> = {
    "Operación": "admin/operacion",
    "Pagos": "admin/pagos",
    "Terapeutas": "admin/terapeutas",
    "Machine Learning": "admin/ml",
  };

  const sessions = [
    { id: "SES-A7F2", therapist: "Dra. Ana Ruiz", av: "AR", color: B.violet, hora: "09:00", dur: "18 min", conectividad: "Estable", estado: "Normal" },
    { id: "SES-B3C8", therapist: "Lic. Carlos Mendoza", av: "CM", color: B.teal, hora: "09:15", dur: "12 min", conectividad: "Degradada", estado: "Revisión" },
    { id: "SES-D1E4", therapist: "Dra. María Torres", av: "MT", color: "#EC4899", hora: "08:45", dur: "24 min", conectividad: "Estable", estado: "Normal" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Page head */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest mb-0.5">Admin · Dashboard</p>
          <h1 className="text-2xl font-black text-[#1C1135]">Centro de operaciones</h1>
          <p className="text-sm text-[#7C6F9A] font-medium">30 Jul 2026 · Información operativa y técnica</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => go("admin/terapeutas")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Stethoscope size={13}/> Terapeutas</button>
          <button onClick={() => go("admin/operacion")}  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Activity size={13}/> Operación</button>
          <button onClick={() => go("admin/ml")}         className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Bot size={13}/> ML</button>
          <button onClick={() => go("admin/auditoria")}  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Shield size={13}/> Auditoría</button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Download size={13}/> Exportar resumen</button>
        </div>
      </div>

      {/* Simulated data notice */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-5 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">
        <span>⚠️</span> Datos simulados para demostración · No corresponden a usuarios ni sesiones reales
      </div>

      {/* 8 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: k.bg }}>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/70" style={{ color: k.color }}>{k.icon}</div>
              {k.urgency === "alta"  && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">Atención</span>}
              {k.urgency === "media" && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Revisar</span>}
              {k.urgency === "ok"    && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">OK</span>}
            </div>
            <p className="font-black text-xl text-[#1C1135] leading-none">{k.val}</p>
            <p className="text-xs font-medium text-[#7C6F9A] leading-tight">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Alertas operativas */}
        <Crd className="p-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><Bell size={15}/> Alertas operativas</h3>
          <div className="flex flex-col gap-2.5">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3 border border-[#F0EEF9]">
                <span className="text-base flex-shrink-0 mt-0.5">{a.icon}</span>
                <p className="text-xs font-medium text-[#1C1135] flex-1 leading-relaxed">{a.text}</p>
                <button onClick={() => go(actionMap[a.action])} className="text-xs font-bold text-violet-600 hover:underline flex-shrink-0 whitespace-nowrap">Ver →</button>
              </div>
            ))}
          </div>
        </Crd>

        {/* Sesiones activas — solo datos técnicos */}
        <Crd>
          <div className="p-4 pb-3 border-b border-[#E8E5F4] flex items-center justify-between">
            <h3 className="font-extrabold text-[#1C1135] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" style={{ boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
              Sesiones activas
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">{sessions.length} en curso</span>
          </div>
          <div className="text-xs text-[#9E95B7] font-medium px-4 py-2 bg-[#FAFAF9] border-b border-[#F0EEF9]">
            Datos técnicos únicamente · Sin contenido clínico
          </div>
          <div className="divide-y divide-[#F5F3FF]">
            {sessions.map((s, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 flex-wrap hover:bg-[#F9F8FE] transition-colors">
                <Av initials={s.av} color={s.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#1C1135] font-mono">{s.id}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{s.therapist}</p>
                </div>
                <div className="text-xs text-[#7C6F9A] font-medium text-right">
                  <p>{s.hora} · {s.dur}</p>
                  <p className={s.conectividad === "Estable" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>📶 {s.conectividad}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.estado === "Normal" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{s.estado}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#E8E5F4]">
            <button onClick={() => go("admin/operacion")} className="text-xs font-bold text-violet-600 hover:underline w-full text-center">Ver Operación completa →</button>
          </div>
        </Crd>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Shield, Activity } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";

export function AdminSesiones() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  // Operational data only — no clinical content
  const sessions = [
    { id: "SES-2026-0741", therapistAv: "AR", therapistColor: B.violet,  started: "08:52", dur: "8 min",  quality: "excelente", type: "Virtual",    status: "activa",     latency: "42 ms",  incidents: 0 },
    { id: "SES-2026-0742", therapistAv: "CM", therapistColor: B.teal,    started: "09:00", dur: "2 min",  quality: "buena",     type: "Virtual",    status: "activa",     latency: "87 ms",  incidents: 0 },
    { id: "SES-2026-0743", therapistAv: "MT", therapistColor: "#EC4899", started: "08:45", dur: "17 min", quality: "excelente", type: "Virtual",    status: "activa",     latency: "38 ms",  incidents: 0 },
    { id: "SES-2026-0738", therapistAv: "AR", therapistColor: B.violet,  started: "15:00", dur: "45 min", quality: "excelente", type: "Virtual",    status: "finalizada", latency: "45 ms",  incidents: 0 },
    { id: "SES-2026-0735", therapistAv: "CM", therapistColor: B.teal,    started: "10:00", dur: "60 min", quality: "buena",     type: "Presencial", status: "finalizada", latency: "—",      incidents: 1 },
  ];
  const sel = selectedSession !== null ? sessions[selectedSession] : null;
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Operational restriction notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Acceso administrativo limitado a información operativa.</span> El contenido clínico permanece restringido.
        </p>
      </div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Estado Técnico · ASHA Session</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Datos operativos de sesiones · Hoy · <span className="italic">Simulado para demostración</span></p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Activas ahora",    val: "3",      color: "#059669", bg: "#D1FAE5"     },
          { label: "Finalizadas hoy",  val: "9",      color: B.violet,  bg: B.violetLight },
          { label: "Duración promedio",val: "47 min", color: B.teal,    bg: B.tealLight   },
          { label: "Incidencias",      val: "1",      color: B.orange,  bg: B.orangeLight },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Crd>
            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: B.border }}>
              <h3 className="font-extrabold text-[#1C1135]">Sesiones del día</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>3 en vivo</span>
            </div>
            <div className="divide-y" style={{ borderColor: B.border }}>
              {sessions.map((s, i) => (
                <div key={i} className={`p-4 flex items-center gap-4 flex-wrap transition-colors cursor-pointer ${selectedSession === i ? "bg-[#F5F3FF]" : "hover:bg-[#FAFAF9]"}`}
                  onClick={() => setSelectedSession(selectedSession === i ? null : i)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Av initials={s.therapistAv} color={s.therapistColor} size="sm" />
                    <div>
                      <p className="font-extrabold text-sm text-[#1C1135]">ID: {s.id}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">{s.started} · {s.dur}</p>
                    </div>
                  </div>
                  <Bdg color="violet">{s.type}</Bdg>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: s.status === "activa" ? "#D1FAE5" : B.violetLight, color: s.status === "activa" ? "#059669" : B.violet }}>
                    {s.status}
                  </span>
                  <span className="text-xs font-medium" style={{ color: s.quality === "excelente" ? "#059669" : B.teal }}>📶 {s.quality}</span>
                  {s.status === "activa" && (
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedSession(i); }}>
                      <Activity size={12} /> Estado técnico
                    </Btn>
                  )}
                </div>
              ))}
            </div>
          </Crd>
        </div>
        {/* Operational detail panel */}
        <div>
          {sel ? (
            <Crd className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-[#1C1135] text-sm">Detalle operativo</h4>
                <button onClick={() => setSelectedSession(null)} className="p-1 rounded-lg text-[#9E95B7] hover:bg-[#F5F3FF]"><X size={14} /></button>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { label: "ID de sesión",        val: sel.id },
                  { label: "Horario de inicio",   val: sel.started },
                  { label: "Duración",            val: sel.dur },
                  { label: "Modalidad",           val: sel.type },
                  { label: "Estado",              val: sel.status },
                  { label: "Calidad técnica",     val: sel.quality },
                  { label: "Latencia (sim.)",     val: sel.latency },
                  { label: "Incidencias",         val: sel.incidents > 0 ? `${sel.incidents} registrada(s)` : "Ninguna" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2 border-b border-[#F5F3FF] last:border-0">
                    <span className="text-[#9E95B7] font-medium">{r.label}</span>
                    <span className="font-extrabold text-[#1C1135]">{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl border text-xs font-medium" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1D4ED8" }}>
                🔒 Audio, video, chat y notas clínicas son accesibles solo para terapeuta y representante legal.
              </div>
            </Crd>
          ) : (
            <Crd className="p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 220 }}>
              <Activity size={32} className="text-[#C4B5FD] mb-3" />
              <p className="text-sm font-extrabold text-[#9E95B7]">Selecciona una sesión</p>
              <p className="text-xs text-[#9E95B7] font-medium mt-1">Ver datos operativos</p>
            </Crd>
          )}
        </div>
      </div>
    </div>
  );
}

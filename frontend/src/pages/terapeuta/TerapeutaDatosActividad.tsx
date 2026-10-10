import { useState } from "react";
import { Shield, Database } from "lucide-react";
import { View } from "@/types/navigation";

export function TerapeutaDatosActividad({ go }: { go: (v: View) => void }) {
  const [filter, setFilter] = useState<"todos" | "asignadas" | "exploracion">("todos");

  const sessions = [
    { id: "ASHA-A3F1", patient: "B.R.", activity: "Bosque de los Cuentos", type: "asignada", date: "2026-08-22", duration: "4m 38s", scenes: 3, hints: 1, pauses: 0, inputMode: "manual", participation: "Completada" },
    { id: "ASHA-B2C9", patient: "M.L.", activity: "Montaña Musical", type: "asignada", date: "2026-08-22", duration: "5m 12s", scenes: 3, hints: 0, pauses: 1, inputMode: "sin micrófono", participation: "Completada" },
    { id: "ASHA-C7D4", patient: "S.T.", activity: "Valle de Adivinanzas", type: "exploracion", date: "2026-08-21", duration: "3m 57s", scenes: 2, hints: 4, pauses: 0, inputMode: "botones", participation: "Incompleta" },
    { id: "ASHA-D5E8", patient: "B.R.", activity: "Valle de Adivinanzas", type: "exploracion", date: "2026-08-21", duration: "6m 01s", scenes: 3, hints: 2, pauses: 1, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-E1F3", patient: "M.L.", activity: "Bosque de los Cuentos", type: "asignada", date: "2026-08-20", duration: "5m 44s", scenes: 3, hints: 0, pauses: 0, inputMode: "con micrófono (simulado)", participation: "Completada" },
    { id: "ASHA-F2G6", patient: "S.T.", activity: "Isla Creativa", type: "exploracion", date: "2026-08-23", duration: "6m 22s", scenes: 4, hints: 1, pauses: 0, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-G4H1", patient: "B.R.", activity: "Laboratorio · Circuito", type: "asignada",   date: "2026-08-23", duration: "7m 48s", scenes: 3, hints: 2, pauses: 1, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-H7J2", patient: "M.L.", activity: "Laboratorio · Asociación", type: "exploracion", date: "2026-08-23", duration: "3m 05s", scenes: 1, hints: 0, pauses: 0, inputMode: "botones", participation: "Completada" },
  ];

  const filtered = sessions.filter(s => filter === "todos" || (filter === "asignadas" ? s.type === "asignada" : s.type === "exploracion"));

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
          <h1 className="text-2xl font-black text-white mb-1">Datos de actividad · Mundo ASHA</h1>
          <p className="text-sm text-violet-200 font-medium">Registros de participación pseudonimizados · No reemplaza la evaluación clínica</p>
        </div>

        {/* Notice */}
        <div className="rounded-2xl p-4 mb-5 flex items-start gap-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
          <Shield size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#5B21B6] leading-relaxed">
            Estos datos son <strong>registros de participación</strong>, no evaluaciones clínicas. No usar como base para diagnóstico ni como sustituto de la sesión terapéutica. Los identificadores de paciente están pseudonimizados.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["todos", "asignadas", "exploracion"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all ${filter === f ? "border-violet-500 bg-violet-600 text-white" : "border-[#E8E5F4] bg-white text-[#7C6F9A] hover:bg-[#F5F3FF]"}`}>
              {f === "todos" ? "Todos" : f === "asignadas" ? "Asignadas ✓" : "Exploración libre"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDF8]">
                  {["ID sesión", "Paciente", "Actividad", "Tipo", "Fecha", "Duración", "Pistas", "Pausas", "Entrada", "Resultado"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={i} className="border-b border-[#F8F7FF] hover:bg-[#F5F3FF] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#7C6F9A]">{s.id}</td>
                    <td className="px-4 py-3 font-extrabold text-[#1C1135]">{s.patient}</td>
                    <td className="px-4 py-3 font-medium text-[#4B4869] whitespace-nowrap">{s.activity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.type === "asignada" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.type === "asignada" ? "Asignada ✓" : "Exploración"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#7C6F9A] whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4B4869]">{s.duration}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-[#1C1135]">{s.hints}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-[#1C1135]">{s.pauses}</td>
                    <td className="px-4 py-3 text-xs text-[#7C6F9A] whitespace-nowrap">{s.inputMode}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.participation === "Completada" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {s.participation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: "#F5F3FF" }}>
          <Database size={13} className="text-violet-400 flex-shrink-0" />
          <p className="text-xs font-bold text-[#7C6F9A]">Esquema de datos simulados · pendiente de aprobación regulatoria · v0.3-demo</p>
        </div>
      </div>
    </div>
  );
}

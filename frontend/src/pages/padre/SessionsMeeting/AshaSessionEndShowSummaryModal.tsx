import type { useAshaSessionEnd } from "@/pages/padre/SessionsMeeting/useAshaSessionEnd";
import { X, Download } from "lucide-react";
import { B } from "@/theme/brand/B";

type Props = Pick<ReturnType<typeof useAshaSessionEnd>, "setShowSummaryModal" | "downloadSessionPdf">;
export function AshaSessionEndShowSummaryModal({ setShowSummaryModal, downloadSessionPdf }: Props) {
return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummaryModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">📋 Resumen de sesión</h2>
              <button onClick={() => setShowSummaryModal(false)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: B.violet }}>AR</div>
                <div>
                  <p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">Terapia del Lenguaje</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#9E95B7]">Duración</p>
                  <p className="font-black text-[#1C1135] text-xl">45 min</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "📅", label: "Fecha", val: "30 Jul 2026" },
                  { icon: "⏰", label: "Inicio", val: "10:00 AM" },
                  { icon: "🎯", label: "Objetivos", val: "3 / 3" },
                  { icon: "💻", label: "Tipo", val: "Virtual" },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                    <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-3">🎯 Objetivos trabajados</p>
                {[["🗣️","Pronunciación de la R","completado"],["👂","Comprensión verbal","completado"],["🎮","Juego interactivo","completado"]].map(([icon,label,status]) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl p-2.5 mb-1.5 last:mb-0" style={{ background: "#DCFCE7" }}>
                    <span>{icon}</span>
                    <span className="text-sm font-bold text-[#1C1135] flex-1">{label}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{status === "completado" ? "✓" : "…"}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4" style={{ background: B.violetLight }}>
                <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">💬 Notas del terapeuta</p>
                <p className="text-sm text-[#4B4264] font-medium leading-relaxed">Excelente progreso en R inicial. Practica en casa con los ejercicios enviados. ¡Muy buen trabajo hoy!</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3">
              <button onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors">
                Cerrar
              </button>
              <button onClick={downloadSessionPdf}
                className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: B.violet }}>
                <Download size={14} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>);
}

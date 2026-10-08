import { useState } from "react";
import { X } from "lucide-react";
import { B } from "@/theme/brand/B";

export function RescheduleModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (date: string, time: string) => void }) {
  const dates = ["Lun 27 Jul 2026", "Mié 29 Jul 2026", "Vie 31 Jul 2026", "Lun 03 Ago 2026", "Mié 05 Ago 2026"];
  const times = ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00", "17:00"];
  const [selDate, setSelDate] = useState(dates[0]);
  const [selTime, setSelTime] = useState(times[2]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-[#1C1135] flex items-center gap-2"><span>📅</span> Cambiar horario</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
            <X size={18} className="text-[#7C6F9A]" />
          </button>
        </div>
        <p className="text-sm text-[#7C6F9A] font-medium mb-5">Selecciona una nueva fecha y hora disponibles para tu sesión.</p>
        <div className="mb-4">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Fecha</p>
          <div className="flex flex-wrap gap-2">
            {dates.map(d => (
              <button key={d} onClick={() => setSelDate(d)}
                className={`px-3 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${selDate === d ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-300"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Hora</p>
          <div className="flex flex-wrap gap-2">
            {times.map(t => (
              <button key={t} onClick={() => setSelTime(t)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${selTime === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-300"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-5 border border-violet-200" style={{ background: "#F5F3FF" }}>
          <p className="text-sm font-extrabold text-[#1C1135]">Nuevo horario: <span className="text-violet-700">{selDate} · {selTime}</span></p>
          <p className="text-xs text-[#9E95B7] font-medium mt-0.5">El terapeuta recibirá una notificación de confirmación.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">Cancelar</button>
          <button onClick={() => onConfirm(selDate, selTime)}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:brightness-105"
            style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}

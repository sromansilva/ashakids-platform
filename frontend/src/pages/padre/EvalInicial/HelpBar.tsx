import { X, HelpCircle, Play } from "lucide-react";
import { B } from "@/theme/brand/B";

// ─── Types ─────────────────────────────────────────────────────────────────────

export function HelpBar({ onHint, onPause, onExit, hintsLeft = 3 }: { onHint: () => void; onPause: () => void; onExit: () => void; hintsLeft?: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mt-4">
      <button onClick={onHint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8E5F4] hover:bg-violet-50 transition-colors" style={{ color: B.violet }}>
        <HelpCircle size={13} /> Pedir pista {hintsLeft > 0 && <span className="ml-1 bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 text-[10px]">{hintsLeft}</span>}
      </button>
      <button onClick={onPause} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8E5F4] hover:bg-gray-50 transition-colors text-[#7C6F9A]">
        <Play size={13} /> Pausar
      </button>
      <button onClick={onExit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8E5F4] hover:bg-red-50 transition-colors text-[#7C6F9A]">
        <X size={13} /> Salir
      </button>
    </div>
  );
}

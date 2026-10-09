import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

// ─── MUNDO ASHA ────────────────────────────────────────────────────────────────

export function AshaHUD({ stars, level, streak, go }: { stars: number; level: number; streak: number; go: (v: View) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={() => go("mundo-asha/perfil")}
        className="flex items-center gap-2 rounded-2xl px-3 py-1.5 border border-amber-200 hover:border-amber-400 transition-all"
        style={{ background: "#FEF3C7" }}>
        <span className="text-base">⭐</span>
        <span className="font-black text-amber-700 text-sm">{stars}</span>
      </button>
      <button onClick={() => go("mundo-asha/perfil")}
        className="flex items-center gap-2 rounded-2xl px-3 py-1.5 border border-violet-200 hover:border-violet-400 transition-all"
        style={{ background: B.violetLight }}>
        <span className="text-base">📈</span>
        <span className="font-black text-violet-700 text-sm">Nv.{level}</span>
      </button>
      <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 border border-orange-200"
        style={{ background: B.orangeLight }}>
        <span className="text-base">🔥</span>
        <span className="font-black text-orange-700 text-sm">{streak} días</span>
      </div>
    </div>
  );
}

import type { useMiCaminoAsha } from "@/pages/padre/journey/camino/useMiCaminoAsha";
import { B } from "@/theme/brand/B";
import { Ashi } from "@/components/illustrations/Ashi";

// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────

type Props = Pick<ReturnType<typeof useMiCaminoAsha>, "child" | "caminoTabs" | "setTab" | "tab">;
export function MiCaminoAshaHeader({ child, caminoTabs, setTab, tab }: Props) {
return (<div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, ${B.violet} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 px-4 sm:px-6 pt-8 pb-6 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl flex-shrink-0 shadow-lg border-2 border-white/20" style={{ background: child.bg }}>
              {child.emoji}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-violet-300 uppercase tracking-widest">🌱 Mi Camino ASHA</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-1">{child.name} Gómez</h1>
              <p className="text-violet-200 text-lg font-bold mb-3">{child.age} años · Terapia del Lenguaje</p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 bg-white/15 text-white px-3.5 py-2 rounded-full backdrop-blur-sm">
                  <span className="text-sm font-black">👩‍⚕️</span>
                  <span className="text-sm font-extrabold">Dra. Ana Ruiz</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 text-white px-3.5 py-2 rounded-full">
                  <span className="text-sm font-black">⏳</span>
                  <span className="text-sm font-extrabold">6 meses en ASHAKids</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-400/30 text-orange-200 px-3.5 py-2 rounded-full">
                  <span className="text-sm font-black">⭐</span>
                  <span className="text-sm font-extrabold">Nivel 4 · Explorador</span>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { val: "12", lbl: "Sesiones" },
                  { val: "78%", lbl: "Progreso" },
                  { val: "7 🔥", lbl: "Racha días" },
                  { val: "3/5", lbl: "Objetivos" },
                  { val: "47", lbl: "Actividades" },
                  { val: "7", lbl: "Insignias" },
                ].map(s => (
                  <div key={s.lbl} className="bg-white/10 rounded-2xl px-3 py-2 text-center">
                    <p className="text-lg font-black text-white">{s.val}</p>
                    <p className="text-xs font-medium text-violet-200">{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* ASHI */}
            <div className="hidden lg:block flex-shrink-0">
              <Ashi size={100} mood="happy" />
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex overflow-x-auto gap-0.5 pb-0 scrollbar-hide">
            {caminoTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-extrabold whitespace-nowrap transition-all flex-shrink-0 rounded-t-2xl
                  ${tab === t.id ? "bg-white text-[#1C1135]" : "text-violet-200 hover:text-white hover:bg-white/10"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>);
}

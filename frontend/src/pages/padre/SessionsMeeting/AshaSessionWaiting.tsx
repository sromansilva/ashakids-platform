import { useState } from "react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Av } from "@/components/common/Av";
import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { SESSION_THERAPIST } from "@/pages/padre/GamesShared";

export function AshaSessionWaiting({ go }: { go: (v: View) => void }) {
  const t = SESSION_THERAPIST;
  const tips = [
    "Respirá profundo. La sesión comenzará enseguida.",
    "Asegurate de estar en un lugar tranquilo y bien iluminado.",
    "Podés tener a mano el cuaderno y los materiales.",
    "El terapeuta revisará los objetivos al iniciar.",
  ];
  const [tipIdx] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #1E1148 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse"
            style={{ width: 4 + (i % 5) * 2, height: 4 + (i % 5) * 2, background: "white", opacity: 0.06 + (i % 4) * 0.03, top: `${(i * 17) % 100}%`, left: `${(i * 13 + 7) % 100}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 text-center">
        {/* Therapist avatar with pulse ring */}
        <div className="relative inline-block mb-7">
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${B.violet}30`, scale: "1.4" }} />
          <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${B.violet}20`, scale: "1.2" }} />
          <div className="relative">
            <Av initials={t.av} color={t.color} size="xl" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1E1148] flex items-center justify-center" style={{ background: B.teal }}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>

        <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Sala de espera</p>
        <h1 className="text-2xl font-black text-white mb-1">Conectando con {t.name}</h1>
        <p className="text-violet-300 text-sm font-medium mb-6">{t.specialty}</p>

        {/* Connection status */}
        <div className="rounded-2xl px-5 py-3 mb-7 inline-flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
          <span className="text-sm font-bold text-teal-300">Conectándose…</span>
        </div>

        {/* ASHI tip */}
        <div className="rounded-3xl p-5 mb-6 text-left" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Ashi size={48} mood="happy" />
            </div>
            <div>
              <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-1">ASHI te dice:</p>
              <p className="text-sm text-white font-medium leading-relaxed">{tips[tipIdx]}</p>
            </div>
          </div>
        </div>

        {/* Breathing exercise */}
        <div className="rounded-3xl p-5 mb-7" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">🌬️ Ejercicio de respiración</p>
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full border-4 border-violet-400/30 flex items-center justify-center animate-pulse" style={{ background: "rgba(124,58,237,0.2)" }}>
              <div className="w-12 h-12 rounded-full animate-ping" style={{ background: `${B.violet}40` }} />
            </div>
          </div>
          <p className="text-xs text-violet-300 font-medium">Inhala 4s · Sostén 4s · Exhala 4s</p>
        </div>

        <button onClick={() => go("session/active")}
          className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg shadow-violet-900/40 hover:brightness-110 transition-all"
          style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
          ▶ Entrar a la sesión
        </button>
        <button onClick={() => go("session")} className="mt-3 text-sm text-violet-400 hover:text-white font-bold transition-colors">
          Cancelar y volver
        </button>
      </div>
    </div>
  );
}

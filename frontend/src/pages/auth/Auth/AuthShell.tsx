import { AshaKidsLogo } from "@/components/illustrations/AshaKidsLogo";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

export function AuthShell({ children, side }: { children: React.ReactNode; side?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[46%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1a0b3b 0%, #2D1B69 40%, #4C1D95 75%, #6D28D9 100%)" }}>
        <style>{`
          @keyframes auth-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes auth-pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
          .auth-float{animation:auth-float 5s ease-in-out infinite}
          .auth-spin{animation:auth-spin 18s linear infinite}
          .auth-pulse{animation:auth-pulse 3s ease-in-out infinite}
        `}</style>
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #A78BFA, transparent 70%)" }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full opacity-10 auth-spin" style={{ border: "1px dashed rgba(255,255,255,.4)" }} />
        {[
          [60,90,"🌟","0s"],[310,60,"✨","1.2s"],
          [50,310,"💜","0.6s"],[340,290,"⭐","1.8s"],[185,380,"🎯","2.4s"],
        ].map(([x,y,e,d],i) => (
          <div key={i} className="absolute text-lg select-none auth-float" style={{ left: Number(x), top: Number(y), animationDelay: String(d) }}>{e}</div>
        ))}
        {side || (
          <div className="relative z-10 text-white text-center max-w-xs">
            <div className="flex justify-center mb-10">
              <AshaKidsLogo variant="auth" textColor="white" />
            </div>
            <div className="auth-float rounded-3xl p-6 mb-8" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}>
              <div className="text-6xl mb-4">🗣️</div>
              <h2 className="text-xl font-black mb-2">Terapia de lenguaje infantil, virtual y acompañada</h2>
              <p className="text-sm font-medium" style={{ color: "rgba(196,181,253,.85)" }}>Conectamos familias con especialistas en lenguaje infantil y seguimiento personalizado.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: "🎯", l: "Seguimiento" }, { v: "🌐", l: "Virtual" }, { v: "🔒", l: "Seguro" }].map(s => (
                <div key={s.l} className="rounded-2xl py-2.5 px-2" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)" }}>
                  <p className="text-base font-black text-white">{s.v}</p>
                  <p className="text-xs font-medium" style={{ color: "rgba(196,181,253,.75)" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-[#FAFAF9] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

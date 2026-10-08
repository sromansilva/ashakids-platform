import { ArrowRight, Sparkles } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Isotipo } from "@/components/illustrations/Isotipo";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

export function RegisterSelector({ go }: { go: (v: View) => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: "linear-gradient(180deg, #F8F6FF 0%, #FFFFFF 60%)" }}>
      <style>{`
        @keyframes ashi-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes ashi-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes ashi-glow{0%,100%{box-shadow:0 0 0 0 rgba(109,40,217,.12)}50%{box-shadow:0 0 0 20px rgba(109,40,217,0)}}
        @keyframes bubble-in{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes card-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .ashi-breathe{animation:ashi-breathe 3.5s ease-in-out infinite}
        .ashi-float{animation:ashi-float 4s ease-in-out infinite}
        .ashi-glow{animation:ashi-glow 3s ease-in-out infinite}
        .bubble-in{animation:bubble-in .5s cubic-bezier(.16,1,.3,1) both}
        .card-up-1{animation:card-up .55s cubic-bezier(.16,1,.3,1) .3s both}
        .card-up-2{animation:card-up .55s cubic-bezier(.16,1,.3,1) .45s both}
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button onClick={() => go("landing")} className="flex items-center gap-2.5">
          <Isotipo size={44} />
          <span className="font-black text-[#1C1135] text-lg tracking-tight">AshaKids</span>
        </button>
        <button onClick={() => go("login")} className="text-sm font-extrabold px-4 py-2 rounded-2xl border-2 transition-all hover:bg-violet-50" style={{ borderColor: B.violet, color: B.violet }}>
          Iniciar sesión
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 max-w-lg mx-auto w-full">

        {/* ASHI avatar + ring */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-36 h-36 rounded-full opacity-20 ashi-glow" style={{ background: `radial-gradient(circle, ${B.violet}, transparent 70%)` }} />
          <div className="absolute w-28 h-28 rounded-full border border-dashed opacity-30 ashi-float" style={{ borderColor: B.violet }} />
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl ashi-breathe shadow-xl" style={{ background: `linear-gradient(135deg, ${B.violetLight}, #EDE9FE)`, boxShadow: "0 20px 60px rgba(109,40,217,.2)" }}>
            🤖
          </div>
        </div>

        {/* ASHI speech bubble */}
        <div className="bubble-in w-full mb-8 rounded-3xl p-5 relative" style={{ background: "white", boxShadow: "0 4px 24px rgba(109,40,217,.08)", border: `1px solid ${B.border}` }}>
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 bg-white" style={{ border: `1px solid ${B.border}`, clipPath: "polygon(0 0,100% 0,100% 100%)" }} />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `linear-gradient(135deg, #0D9488, ${B.violet})` }}>
              <Sparkles size={14} color="white" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: B.violet }}>ASHI</p>
              <p className="text-sm font-medium leading-relaxed text-[#1C1135]">
                ¡Hola! Soy <strong>ASHI</strong>. Estoy aquí para ayudarte a encontrar la mejor experiencia para tu familia o acompañarte si deseas formar parte de nuestro equipo profesional.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#1C1135] text-center mb-1">¿Cómo quieres unirte?</h1>
        <p className="text-sm text-[#7C6F9A] font-medium text-center mb-7">Elige el tipo de cuenta que describe tu rol.</p>

        {/* Role cards */}
        <div className="flex flex-col gap-4 w-full mb-8">
          {/* Padre card */}
          <button onClick={() => go("register/padre")} className="card-up-1 group w-full text-left rounded-3xl p-5 bg-white border-2 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            style={{ borderColor: B.border, boxShadow: "0 4px 20px rgba(109,40,217,.06)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = B.violet; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(109,40,217,.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = B.border; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(109,40,217,.06)"; }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: B.violetLight }}>
                👨‍👩‍👧
              </div>
              <div className="flex-1">
                <p className="font-black text-lg text-[#1C1135]">Soy padre o madre</p>
                <p className="text-sm text-[#7C6F9A] font-medium">Registro gratuito · Sin contratos</p>
              </div>
              <ArrowRight size={18} className="text-[#9E95B7] group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
            <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed">
              Quiero acompañar el desarrollo de mi hijo mediante sesiones, actividades y seguimiento personalizado con ASHI.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 rounded-2xl py-2.5 text-center text-sm font-extrabold text-white transition-all" style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
                Comenzar →
              </div>
            </div>
          </button>

          {/* Terapeuta card */}
          <button onClick={() => go("register/terapeuta/landing")} className="card-up-2 group w-full text-left rounded-3xl p-5 bg-white border-2 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            style={{ borderColor: B.border, boxShadow: "0 4px 20px rgba(13,148,136,.06)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = B.teal; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(13,148,136,.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = B.border; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(13,148,136,.06)"; }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: B.tealLight }}>
                👩‍⚕️
              </div>
              <div className="flex-1">
                <p className="font-black text-lg text-[#1C1135]">Soy terapeuta</p>
                <p className="text-sm text-[#7C6F9A] font-medium">Proceso de selección · 2–5 días</p>
              </div>
              <ArrowRight size={18} className="text-[#9E95B7] group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
            <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed">
              Quiero ofrecer mis servicios profesionales y formar parte del equipo de especialistas de ASHAKids.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 rounded-2xl py-2.5 text-center text-sm font-extrabold text-white transition-all" style={{ background: `linear-gradient(135deg, ${B.teal}, #0f766e)` }}>
                Postularme →
              </div>
            </div>
          </button>
        </div>

        {/* Bottom login link */}
        <div className="flex items-center gap-3 w-full mb-4">
          <div className="flex-1 h-px bg-[#E8E5F4]" />
          <p className="text-sm text-[#9E95B7] font-medium flex-shrink-0">¿Ya tienes cuenta?</p>
          <div className="flex-1 h-px bg-[#E8E5F4]" />
        </div>
        <button onClick={() => go("login")} className="w-full rounded-2xl py-3 border-2 font-extrabold text-sm transition-all hover:bg-violet-50" style={{ borderColor: B.border, color: B.violet }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

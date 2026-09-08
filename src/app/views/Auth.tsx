import { useState } from "react";
import {
  ArrowRight, ArrowLeft, Check, CheckCircle, ChevronRight,
  Eye, EyeOff, Mail, Lock, Phone, Globe, Upload,
  Sparkles, Star,
} from "lucide-react";
import { B, View, Btn, Isotipo, AshaKidsLogo, Av } from "../shared";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

function AuthShell({ children, side }: { children: React.ReactNode; side?: React.ReactNode }) {
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

function FieldRow({ label, type = "text", placeholder, value, onChange, icon, error }: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; icon?: React.ReactNode; error?: string;
}) {
  const [show, setShow] = useState(false);
  const t = type === "password" && show ? "text" : type;
  return (
    <div>
      <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]">{icon}</div>}
        <input type={t} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium focus:outline-none transition-colors bg-white ${icon ? "pl-10" : ""} ${error ? "border-red-400 bg-red-50" : "border-[#E8E5F4] focus:border-violet-400"}`} />
        {type === "password" && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
          style={{ background: i < step ? B.violet : i === step ? `${B.violet}50` : "#E8E5F4" }} />
      ))}
      <span className="text-xs font-bold text-[#9E95B7] flex-shrink-0">{step}/{total}</span>
    </div>
  );
}

// ─── 1. Pantalla de bienvenida premium con ASHI ───────────────────────────────

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

// ─── 1b. Landing exclusiva para terapeutas ────────────────────────────────────

export function TerapeutaLanding({ go }: { go: (v: View) => void }) {
  return (
    <div className="min-h-screen" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <style>{`
        @keyframes tl-fade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .tl-fade{animation:tl-fade .7s cubic-bezier(.16,1,.3,1) both}
        .tl-fade-d1{animation-delay:.1s}.tl-fade-d2{animation-delay:.2s}.tl-fade-d3{animation-delay:.3s}
        .tl-fade-d4{animation-delay:.4s}.tl-fade-d5{animation-delay:.5s}
      `}</style>

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[#E8E5F4] px-6 py-3 flex items-center justify-between">
        <button onClick={() => go("landing")} className="flex items-center gap-2.5">
          <Isotipo size={44} />
          <span className="font-black text-[#1C1135] tracking-tight">AshaKids</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => go("login")} className="text-sm font-bold text-[#7C6F9A] hover:text-violet-600 transition-colors">Iniciar sesión</button>
          <button onClick={() => go("register/terapeuta")} className="text-sm font-extrabold px-4 py-2 rounded-2xl text-white transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${B.teal}, #0f766e)` }}>
            Postularme ahora
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #0D9488 0%, #0f766e 35%, #1C1135 100%)" }} className="px-6 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #A78BFA 0%, transparent 50%), radial-gradient(circle at 75% 70%, #34D399 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto tl-fade">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold mb-6" style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}>
            <span>🗣️</span> Plataforma de terapia de lenguaje infantil
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
            Acompaña el lenguaje.<br />
            <span style={{ color: "#6EE7B7" }}>Desde donde estés.</span>
          </h1>
          <p className="text-lg font-medium leading-relaxed mb-8" style={{ color: "rgba(209,250,229,.85)" }}>
            Únete al equipo de especialistas en lenguaje infantil. Tecnología de punta, familias que necesitan tu acompañamiento y ASHI como tu copiloto profesional.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button onClick={() => go("register/terapeuta")} className="px-8 py-4 rounded-2xl font-extrabold text-base text-white flex items-center gap-2 transition-all hover:opacity-90 hover:scale-105 active:scale-100" style={{ background: `linear-gradient(135deg, ${B.orange}, #ea580c)`, boxShadow: "0 8px 30px rgba(249,115,22,.4)" }}>
              Iniciar postulación <ArrowRight size={18} />
            </button>
            <a href="#proceso" className="text-sm font-bold underline underline-offset-4" style={{ color: "rgba(209,250,229,.8)" }}>Ver proceso de selección</a>
          </div>
        </div>

        {/* Hero pillars */}
        <div className="relative z-10 mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto tl-fade tl-fade-d2">
          {[
            { v: "🌐", l: "Atención virtual" },
            { v: "💰", l: "Gestión de pagos" },
            { v: "🤖", l: "ASHI copiloto" },
            { v: "⏱️", l: "Horario flexible" },
          ].map(s => (
            <div key={s.l} className="rounded-2xl py-4 px-3" style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)" }}>
              <p className="text-2xl font-black text-white">{s.v}</p>
              <p className="text-xs font-medium" style={{ color: "rgba(209,250,229,.75)" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 tl-fade">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: B.teal }}>Beneficios</span>
            <h2 className="text-3xl font-black text-[#1C1135] mt-2">¿Por qué ASHAKids?</h2>
            <p className="text-[#7C6F9A] font-medium mt-2">Una plataforma construida pensando en el terapeuta desde el primer día.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "⏰", title: "Horario 100% flexible", desc: "Trabaja cuando quieras, desde donde quieras. Tú pones las reglas.", color: B.teal, bg: B.tealLight },
              { icon: "💰", title: "Gestión de pagos integrada", desc: "Define tus tarifas y gestiona los pagos directamente desde la plataforma.", color: B.orange, bg: B.orangeLight },
              { icon: "🤖", title: "ASHI como copiloto", desc: "IA especializada que te ayuda con notas, reportes y recomendaciones.", color: B.violet, bg: B.violetLight },
              { icon: "👨‍👩‍👧", title: "Familias comprometidas", desc: "Padres activos, motivados y que invierten en el bienestar de sus hijos.", color: "#8B5CF6", bg: "#EDE9FE" },
              { icon: "📊", title: "Dashboard profesional", desc: "Controla tu agenda, progreso de pacientes y facturación en un solo lugar.", color: "#2563EB", bg: "#DBEAFE" },
              { icon: "🌍", title: "Impacto real", desc: "Cada sesión cambia la trayectoria de un niño. Tu trabajo importa.", color: "#D97706", bg: "#FEF3C7" },
            ].map((b, i) => (
              <div key={b.title} className="rounded-3xl p-5 border border-[#E8E5F4] hover:shadow-lg transition-shadow tl-fade" style={{ animationDelay: `${i * .08}s` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: b.bg }}>{b.icon}</div>
                <h3 className="font-extrabold text-[#1C1135] mb-1">{b.title}</h3>
                <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="px-6 py-16" style={{ background: B.violetLight }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: B.violet }}>Impacto social</span>
          <h2 className="text-3xl font-black text-[#1C1135] mt-2 mb-3">Qué encontrarás en ASHAKids</h2>
          <p className="text-[#7C6F9A] font-medium mb-10">Una plataforma pensada para que el especialista pueda enfocarse en la terapia.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { v: "🎯", u: "Seguimiento clínico", icon: "🎯" },
              { v: "📋", u: "Reportes asistidos", icon: "📋" },
              { v: "🌐", u: "Sesiones virtuales", icon: "🌐" },
              { v: "🤖", u: "ASHI Intelligence", icon: "🤖" },
            ].map(s => (
              <div key={s.u} className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-black text-[#1C1135]">{s.v}</p>
                <p className="text-xs font-bold text-[#9E95B7]">{s.u}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="proceso" className="px-6 py-16 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: B.teal }}>Proceso</span>
            <h2 className="text-3xl font-black text-[#1C1135] mt-2">Así de sencillo es unirte</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: B.border }} />
            {[
              { n: 1, title: "Completa tu postulación", desc: "Información personal, especialidades, experiencia y documentos. 15 minutos.", color: B.teal },
              { n: 2, title: "Revisión del equipo", desc: "Nuestros clínicos revisan tu perfil en 2–5 días hábiles.", color: B.violet },
              { n: 3, title: "Entrevista breve", desc: "Una llamada de 20 minutos para conocerte mejor y resolver dudas.", color: B.orange },
              { n: 4, title: "¡Bienvenido al equipo!", desc: "Recibes tu cuenta, acceso a ASHI y tu primer paciente en 48 hrs.", color: "#059669" },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-5 mb-8 last:mb-0">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0 relative z-10" style={{ background: step.color }}>
                  {step.n}
                </div>
                <div className="pt-2">
                  <h3 className="font-extrabold text-[#1C1135] mb-0.5">{step.title}</h3>
                  <p className="text-sm text-[#7C6F9A] font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16" style={{ background: "linear-gradient(135deg, #F8F6FF 0%, #F0FDF9 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: B.violet }}>Testimonios</span>
            <h2 className="text-3xl font-black text-[#1C1135] mt-2">Lo que dicen nuestros terapeutas</h2>
          </div>
          <p className="text-xs font-bold text-center mb-5" style={{ color: B.textMuted }}>Historias ilustrativas · Ejemplos ficticios para el prototipo</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { name: "Dra. Ana R.", role: "Terapia del Lenguaje", av: "AR", color: B.violet, quote: "ASHI me ayuda a generar reportes con rapidez. Puedo enfocarme en la sesión y completar la documentación clínica de manera más eficiente.", stars: 5 },
              { name: "Lic. Carlos M.", role: "Terapia del Lenguaje · Comprensión", av: "CM", color: "#2563EB", quote: "La plataforma me permite gestionar agenda, pacientes y comunicación en un solo lugar. Trabajar desde casa se volvió mucho más organizado.", stars: 5 },
              { name: "Lic. Patricia V.", role: "Terapia del Lenguaje · Fonología", av: "PV", color: B.teal, quote: "Aprecio poder revisar el historial de cada paciente antes de cada sesión y dejar notas directamente en la plataforma. Ahorra mucho tiempo.", stars: 5 },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-[#1C1135] font-medium leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <Av initials={t.av} color={t.color} size="sm" />
                  <div>
                    <p className="font-extrabold text-sm text-[#1C1135]">{t.name}</p>
                    <p className="text-xs text-[#9E95B7] font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background: `linear-gradient(135deg, #0D9488, #0f766e 50%, ${B.violetDeep})` }} className="px-6 py-16 text-center text-white">
        <div className="max-w-lg mx-auto">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-black mb-3">¿Lista para empezar?</h2>
          <p className="font-medium mb-8" style={{ color: "rgba(209,250,229,.85)" }}>
            El proceso toma 15 minutos. Nuestro equipo se comunicará contigo en menos de 5 días hábiles.
          </p>
          <button onClick={() => go("register/terapeuta")} className="px-10 py-4 rounded-2xl font-extrabold text-base text-white flex items-center gap-2 mx-auto transition-all hover:opacity-90 hover:scale-105 active:scale-100" style={{ background: `linear-gradient(135deg, ${B.orange}, #ea580c)`, boxShadow: "0 8px 30px rgba(249,115,22,.35)" }}>
            Iniciar postulación <ArrowRight size={18} />
          </button>
          <p className="text-xs font-medium mt-4" style={{ color: "rgba(209,250,229,.6)" }}>
            Sin costo · Sin compromisos · Solo tu talento
          </p>
        </div>
      </section>
    </div>
  );
}

// ─── 2. Registro de padre ──────────────────────────────────────────────────────

export function RegisterPadre({ go, onNameSet }: { go: (v: View) => void; onNameSet?: (name: string) => void }) {
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", pass: "", pass2: "", terms: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const isDisabled = !form.terms || !form.nombre.trim() || !form.apellido.trim() || !form.email.trim() || !form.pass.trim() || !form.pass2.trim() || form.pass !== form.pass2;

  const submit = () => {
    onNameSet?.(`${form.nombre} ${form.apellido}`);
    setLoading(true);
    setTimeout(() => { setLoading(false); go("register/verify"); }, 1000);
  };

  return (
    <AuthShell side={
      <div className="relative z-10 text-white text-center max-w-xs">
        <div className="flex justify-center mb-10">
          <AshaKidsLogo variant="auth" textColor="white" />
        </div>
        <div className="auth-float rounded-3xl p-6 mb-6" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}>
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="font-extrabold text-lg mb-2">El camino de tu hijo empieza aquí</h3>
          <p className="text-sm" style={{ color: "rgba(196,181,253,.85)" }}>Acceso a terapeutas certificados, seguimiento en tiempo real y ASHI para guiarte.</p>
        </div>
        {["Registro gratuito en 2 minutos", "Sin contratos, sin sorpresas", "ASHI te acompaña desde el día 1"].map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} style={{ color: "#34D399" }} />
            <span className="text-sm font-medium" style={{ color: "rgba(196,181,253,.9)" }}>{b}</span>
          </div>
        ))}
      </div>
    }>
      <div className="w-full max-w-md">
        <button onClick={() => go("landing")} className="flex items-center gap-1.5 text-sm font-bold text-[#7C6F9A] hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Volver
        </button>
        <h1 className="text-2xl font-black text-[#1C1135] mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-[#7C6F9A] font-medium mb-6">Es rápido, gratuito y sin tarjeta de crédito.</p>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Nombre" placeholder="Ana" value={form.nombre} onChange={set("nombre")} error={submitted && !form.nombre.trim() ? "Obligatorio" : undefined} />
            <FieldRow label="Apellido" placeholder="García" value={form.apellido} onChange={set("apellido")} error={submitted && !form.apellido.trim() ? "Obligatorio" : undefined} />
          </div>
          <FieldRow label="Correo electrónico" type="email" placeholder="ana@email.com" value={form.email} onChange={set("email")} icon={<Mail size={15} />} error={submitted && !form.email.trim() ? "El correo es obligatorio" : undefined} />
          <FieldRow label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={form.pass} onChange={set("pass")} icon={<Lock size={15} />} error={submitted && !form.pass.trim() ? "La contraseña es obligatoria" : undefined} />
          <FieldRow label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña" value={form.pass2} onChange={set("pass2")} icon={<Lock size={15} />} error={submitted && !form.pass2.trim() ? "Confirma tu contraseña" : submitted && form.pass !== form.pass2 ? "Las contraseñas no coinciden" : undefined} />

          <label className="flex items-start gap-3 cursor-pointer">
            <div onClick={() => set("terms")(!form.terms)}
              className="w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
              style={{ borderColor: form.terms ? B.violet : B.border, background: form.terms ? B.violet : "white" }}>
              {form.terms && <Check size={12} color="white" />}
            </div>
            <span className="text-sm text-[#7C6F9A] font-medium">Acepto los <span className="font-extrabold" style={{ color: B.violet }}>Términos de servicio</span> y la <span className="font-extrabold" style={{ color: B.violet }}>Política de privacidad</span></span>
          </label>

          <button
            onClick={() => { setSubmitted(true); if (!isDisabled && !loading) submit(); }}
            className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{ background: loading ? B.textMid : `linear-gradient(135deg, ${B.violet}, ${B.violetDark})`, opacity: loading || isDisabled ? 0.5 : 1, cursor: loading || isDisabled ? "not-allowed" : "pointer" }}>
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando cuenta…</> : <>Crear cuenta <ArrowRight size={16} /></>}
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E8E5F4]" />
            <span className="text-xs font-bold text-[#9E95B7]">o continúa con</span>
            <div className="flex-1 h-px bg-[#E8E5F4]" />
          </div>

          <button className="w-full rounded-2xl py-3 border border-[#E8E5F4] bg-white font-bold text-sm text-[#1C1135] hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center justify-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>
        </div>

        <p className="text-center text-sm text-[#7C6F9A] font-medium mt-5">
          ¿Ya tienes cuenta?{" "}
          <button onClick={() => go("login")} className="font-extrabold hover:underline" style={{ color: B.violet }}>Iniciar sesión</button>
        </p>
      </div>
    </AuthShell>
  );
}

// ─── 3. Verificar correo ───────────────────────────────────────────────────────

export function RegisterVerify({ go }: { go: (v: View) => void }) {
  const [resent, setResent] = useState(false);
  return (
    <AuthShell>
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: B.violetLight }}>📧</div>
        <h1 className="text-2xl font-black text-[#1C1135] mb-2">Revisa tu correo</h1>
        <p className="text-sm text-[#7C6F9A] font-medium mb-8">Enviamos un enlace de verificación a <strong className="text-[#1C1135]">ana@email.com</strong>. Haz clic en él para activar tu cuenta.</p>

        <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: B.violetLight }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #0D9488, ${B.violet})` }}>
              <Sparkles size={14} color="white" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-[#1C1135] mb-0.5">ASHI dice:</p>
              <p className="text-xs text-[#7C6F9A] font-medium leading-relaxed">Verifica tu correo y regresa aquí para comenzar a configurar tu cuenta. ¡Te espero con el primer paso!</p>
            </div>
          </div>
        </div>

        <button onClick={() => go("onboarding")}
          className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white mb-3 flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
          Ya verifiqué mi correo <ArrowRight size={16} />
        </button>

        <button onClick={() => setResent(true)}
          className="w-full rounded-2xl py-3 border border-[#E8E5F4] bg-white font-bold text-sm transition-all"
          style={{ color: resent ? B.success : B.textMid }}>
          {resent ? <><CheckCircle size={14} className="inline mr-1" />Correo reenviado</> : "Reenviar correo"}
        </button>
      </div>
    </AuthShell>
  );
}

// ─── 4. Onboarding guiado por ASHI ────────────────────────────────────────────

const STEPS = 5;

export function Onboarding({ go, onComplete }: { go: (v: View) => void; onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const screens = [
    {
      icon: "👋",
      title: "Bienvenido a AshaKids",
      text: "Tu cuenta familiar está lista. Antes de comenzar, conoce cómo te acompañaremos en cada etapa.",
    },
    {
      icon: "🎥",
      title: "Terapia virtual acompañada",
      text: "El padre agenda y acompaña al paciente; el terapeuta realiza la sesión y comparte el seguimiento desde un espacio seguro.",
    },
    {
      icon: "💬",
      title: "Todo en un mismo lugar",
      text: "Desde el Centro Familiar podrás revisar sesiones, mensajes, progreso y próximos pasos cuando los necesites.",
    },
  ];
  const current = screens[step];
  const finish = () => {
    if (step === screens.length - 1) {
      if (onComplete) { onComplete(); } else { go("padre"); }
    } else {
      setStep((value) => value + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6 bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5"><Isotipo size={44} /><span className="font-black text-[#1C1135] text-lg">AshaKids</span></div>
          <button onClick={() => onComplete ? onComplete() : go("padre")} className="text-xs font-bold text-[#7C6F9A] hover:text-violet-600">Ir al Centro Familiar</button>
        </div>
        <div className="flex gap-2 mb-6" aria-label={`Paso ${step + 1} de ${screens.length}`}>
          {screens.map((screen, index) => <span key={screen.title} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: index <= step ? B.violet : B.border }} />)}
        </div>
        <main className="rounded-3xl bg-white border border-[#E8E5F4] shadow-[0_18px_50px_rgba(76,29,149,.08)] p-6 sm:p-8 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5" style={{ background: B.violetLight }}>{current.icon}</div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] mb-2" style={{ color: B.violet }}>Así funciona AshaKids</p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1135] mb-3">{current.title}</h1>
          <p className="text-sm sm:text-base text-[#7C6F9A] font-medium leading-relaxed max-w-md mx-auto">{current.text}</p>
          <div className="mt-7 rounded-2xl p-4 text-left flex items-start gap-3" style={{ background: B.violetLight }}>
            <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ background: B.violet }}><Sparkles size={16} color="white" /></div>
            <p className="text-sm text-[#1C1135] font-medium leading-relaxed"><strong>ASHI te acompaña.</strong> Esta introducción es informativa: podrás completar y actualizar la información de tu familia desde el dashboard cuando la necesites.</p>
          </div>
          <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">
            {step > 0 && <button onClick={() => setStep((value) => value - 1)} className="sm:w-1/3 rounded-2xl py-3 font-extrabold text-sm text-[#7C6F9A] border border-[#E8E5F4] hover:bg-[#F8F6FF]">Anterior</button>}
            <button onClick={finish} className="flex-1 rounded-2xl py-3 font-extrabold text-sm text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>{step === screens.length - 1 ? "Ir al Centro Familiar" : "Continuar"}<ArrowRight size={16} /></button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── 5. Postulación de terapeuta (multi-step) ──────────────────────────────────

const T_STEPS = ["Personal", "Especialidades", "Experiencia", "Disponibilidad", "Documentos", "Resumen"];

export function RegisterTerapeuta({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", tel: "", ciudad: "", linkedin: "",
    especialidades: [] as string[],
    años: "", cedula: "", idiomas: [] as string[], sobre: "",
    dias: [] as string[], desde: "09:00", hasta: "17:00", duracion: "45 min",
    modalidad: [] as string[],
    tarifa: "",
  });

  const set = (k: keyof typeof form) => (v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: "especialidades" | "idiomas" | "dias" | "modalidad", v: string) =>
    setForm(f => ({ ...f, [k]: (f[k] as string[]).includes(v) ? (f[k] as string[]).filter(x => x !== v) : [...(f[k] as string[]), v] }));

  const next = () => step < T_STEPS.length - 1 ? setStep(s => s + 1) : go("register/terapeuta/success");

  return (
    <AuthShell side={
      <div className="relative z-10 text-white text-center max-w-xs">
        <div className="flex justify-center mb-10">
          <AshaKidsLogo variant="auth" textColor="white" />
        </div>
        <div className="auth-float rounded-3xl p-6 mb-6" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}>
          <div className="text-5xl mb-4">👩‍⚕️</div>
          <h3 className="font-extrabold text-lg mb-2">Únete al equipo de especialistas en lenguaje</h3>
          <p className="text-sm" style={{ color: "rgba(196,181,253,.85)" }}>Flexibilidad, tecnología de punta y familias que necesitan tu experiencia.</p>
        </div>
        {["Horarios flexibles", "ASHI como copiloto profesional", "Seguimiento clínico integrado", "Acompaña a familias que lo necesitan"].map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} style={{ color: "#34D399" }} />
            <span className="text-sm font-medium" style={{ color: "rgba(196,181,253,.9)" }}>{b}</span>
          </div>
        ))}
        {/* Step progress */}
        <div className="mt-6 flex flex-col gap-1.5">
          {T_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: i < step ? "#34D399" : i === step ? "white" : "rgba(255,255,255,.2)", color: i === step ? B.violetDeep : "white" }}>
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              <span className="text-xs font-bold" style={{ color: i <= step ? "white" : "rgba(196,181,253,.6)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    }>
      <div className="w-full max-w-md">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : go("register")} className="flex items-center gap-1.5 text-sm font-bold text-[#7C6F9A] hover:text-violet-600 mb-5 transition-colors">
          <ArrowLeft size={15} /> {step === 0 ? "Volver" : "Paso anterior"}
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0" style={{ background: B.teal }}>{step + 1}</div>
          <div>
            <h2 className="font-black text-xl text-[#1C1135]">{T_STEPS[step]}</h2>
            <p className="text-xs text-[#9E95B7] font-medium">Paso {step + 1} de {T_STEPS.length}</p>
          </div>
        </div>
        <ProgressBar step={step + 1} total={T_STEPS.length} />

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Nombre" placeholder="Ana" value={form.nombre} onChange={set("nombre")} />
              <FieldRow label="Apellido" placeholder="Ruiz" value={form.apellido} onChange={set("apellido")} />
            </div>
            <FieldRow label="Correo electrónico" type="email" placeholder="ana@email.com" value={form.email} onChange={set("email")} icon={<Mail size={15} />} />
            <FieldRow label="Teléfono" placeholder="+1 (555) 000-0000" value={form.tel} onChange={set("tel")} icon={<Phone size={15} />} />
            <FieldRow label="Ciudad / País" placeholder="Ciudad de México, México" value={form.ciudad} onChange={set("ciudad")} icon={<Globe size={15} />} />
            <FieldRow label="LinkedIn (opcional)" placeholder="linkedin.com/in/anaruiz" value={form.linkedin} onChange={set("linkedin")} />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {["Terapia del Lenguaje", "Articulación y Fonología", "Comprensión del Lenguaje", "Fluidez del Habla", "Pragmática y Habilidades Sociales", "Comunicación Funcional"].map(e => (
                  <button key={e} onClick={() => toggleArr("especialidades", e)}
                    className="px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all"
                    style={{ borderColor: form.especialidades.includes(e) ? B.teal : B.border, background: form.especialidades.includes(e) ? B.tealLight : "white", color: form.especialidades.includes(e) ? B.teal : B.textMid }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Idiomas</p>
              <div className="flex flex-wrap gap-2">
                {["Español", "Inglés", "Portugués", "Francés"].map(l => (
                  <button key={l} onClick={() => toggleArr("idiomas", l)}
                    className="px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all"
                    style={{ borderColor: form.idiomas.includes(l) ? B.teal : B.border, background: form.idiomas.includes(l) ? B.tealLight : "white", color: form.idiomas.includes(l) ? B.teal : B.textMid }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Modalidad</p>
              <div className="flex gap-2">
                {["Virtual", "Presencial", "Ambas"].map(m => (
                  <button key={m} onClick={() => toggleArr("modalidad", m)}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{ borderColor: form.modalidad.includes(m) ? B.teal : B.border, background: form.modalidad.includes(m) ? B.tealLight : "white", color: form.modalidad.includes(m) ? B.teal : B.textMid }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <FieldRow label="Años de experiencia" placeholder="8 años" value={form.años} onChange={set("años")} />
            <FieldRow label="Número de cédula profesional (opcional)" placeholder="TEL-2018-4821" value={form.cedula} onChange={set("cedula")} />
            <div>
              <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">Sobre mí y mi enfoque terapéutico</label>
              <textarea className="w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:border-teal-400 resize-none"
                rows={4} placeholder="Describe tu experiencia, metodología y por qué quieres formar parte de ASHAKids…"
                value={form.sobre} onChange={e => set("sobre")(e.target.value)} />
            </div>
            <FieldRow label="Tarifa por sesión (referencial)" placeholder="Ej: 65" value={form.tarifa} onChange={set("tarifa")} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Días disponibles</p>
              <div className="flex gap-2 flex-wrap">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                  <button key={d} onClick={() => toggleArr("dias", d)}
                    className="w-12 h-12 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{ borderColor: form.dias.includes(d) ? B.teal : B.border, background: form.dias.includes(d) ? B.tealLight : "white", color: form.dias.includes(d) ? B.teal : B.textMid }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">Hora inicio</label>
                <select className="w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm font-medium focus:outline-none" value={form.desde} onChange={e => set("desde")(e.target.value)}>
                  {["07:00","08:00","09:00","10:00","11:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">Hora fin</label>
                <select className="w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm font-medium focus:outline-none" value={form.hasta} onChange={e => set("hasta")(e.target.value)}>
                  {["16:00","17:00","18:00","19:00","20:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-2">Duración de sesión preferida</p>
              <div className="flex gap-2">
                {["30 min", "45 min", "60 min"].map(d => (
                  <button key={d} onClick={() => set("duracion")(d)}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{ borderColor: form.duracion === d ? B.teal : B.border, background: form.duracion === d ? B.tealLight : "white", color: form.duracion === d ? B.teal : B.textMid }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#7C6F9A] font-medium">Sube los documentos que respaldan tu trayectoria profesional.</p>
            {[
              { label: "Currículum / CV", icon: "📄", hint: "PDF, máx. 5MB" },
              { label: "Título profesional", icon: "🎓", hint: "JPG, PNG o PDF" },
              { label: "Cédula profesional", icon: "🪪", hint: "JPG, PNG o PDF (opcional)" },
              { label: "Carta de referencias", icon: "📝", hint: "PDF (opcional)" },
            ].map(doc => (
              <div key={doc.label} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-[#E8E5F4] bg-white hover:border-teal-300 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: B.tealLight }}>{doc.icon}</div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-[#1C1135]">{doc.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{doc.hint}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: B.tealLight, color: B.teal }}>
                  <Upload size={12} /> Subir
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#7C6F9A] font-medium mb-1">Revisa tu solicitud antes de enviarla.</p>
            {[
              { label: "Nombre", val: `${form.nombre} ${form.apellido}` || "—" },
              { label: "Correo", val: form.email || "—" },
              { label: "Especialidades", val: form.especialidades.join(", ") || "—" },
              { label: "Experiencia", val: form.años || "—" },
              { label: "Disponibilidad", val: form.dias.join(", ") || "—" },
              { label: "Tarifa referencial", val: form.tarifa ? `${form.tarifa}/sesión` : "—" },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-[#E8E5F4] last:border-0">
                <span className="text-sm font-extrabold text-[#9E95B7]">{r.label}</span>
                <span className="text-sm font-bold text-[#1C1135] text-right max-w-[60%]">{r.val}</span>
              </div>
            ))}
            <div className="rounded-2xl p-4" style={{ background: B.tealLight }}>
              <p className="text-xs font-extrabold mb-1" style={{ color: B.teal }}>¿Qué pasa después?</p>
              <p className="text-xs font-medium text-[#1C1135]">Nuestro equipo revisará tu solicitud en 2-5 días hábiles. Te notificaremos por correo con la decisión.</p>
            </div>
          </div>
        )}

        <button onClick={next}
          className="w-full mt-6 rounded-2xl py-3.5 font-extrabold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${B.teal}, #0f766e)` }}>
          {step === T_STEPS.length - 1 ? "Enviar solicitud" : "Continuar"} <ArrowRight size={16} />
        </button>
      </div>
    </AuthShell>
  );
}

// ─── 6. Éxito de postulación ───────────────────────────────────────────────────

export function RegisterTerapeutaSuccess({ go }: { go: (v: View) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="w-full max-w-md text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6" style={{ background: B.tealLight }}>🎉</div>
        <h1 className="text-3xl font-black text-[#1C1135] mb-3">¡Solicitud enviada!</h1>
        <p className="text-[#7C6F9A] font-medium mb-6">Gracias por postular a ASHAKids. Nuestro equipo revisará tu información y te notificará cuando tu cuenta sea aprobada.</p>
        <div className="rounded-3xl p-6 mb-6 text-left" style={{ background: `linear-gradient(135deg, ${B.tealLight}, ${B.violetLight})` }}>
          <p className="font-extrabold text-[#1C1135] mb-3">¿Qué sigue?</p>
          {["Revisión de tus documentos (2-5 días hábiles)", "Entrevista breve con nuestro equipo clínico", "Aprobación y creación de tu cuenta", "Acceso a ASHI y tu panel profesional"].map((s, i) => (
            <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0" style={{ background: B.teal }}>{i + 1}</div>
              <p className="text-sm font-medium text-[#1C1135]">{s}</p>
            </div>
          ))}
        </div>
        <button onClick={() => go("landing")}
          className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
          style={{ background: `linear-gradient(135deg, ${B.teal}, #0f766e)` }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── 7. Recuperar contraseña ──────────────────────────────────────────────────

export function ForgotPassword({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState<"email" | "sent" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [pass2, setPass2] = useState("");

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <button onClick={() => go("login")} className="flex items-center gap-2.5">
            <Isotipo size={44} />
            <span className="font-black text-[#1C1135] text-lg tracking-tight">AshaKids</span>
          </button>
        </div>

        {step === "email" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.violetLight }}>🔑</div>
              <h1 className="text-2xl font-black text-[#1C1135] mb-1">¿Olvidaste tu contraseña?</h1>
              <p className="text-sm text-[#7C6F9A] font-medium">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
            </div>
            <div className="flex flex-col gap-4">
              <FieldRow label="Correo electrónico" type="email" placeholder="tu@email.com" value={email} onChange={setEmail} icon={<Mail size={15} />} />
              <button onClick={() => setStep("sent")}
                className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
                Enviar enlace <ArrowRight size={16} />
              </button>
              <button onClick={() => go("login")} className="text-sm font-bold text-center text-[#7C6F9A] hover:text-violet-600 transition-colors">
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}

        {step === "sent" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.violetLight }}>📧</div>
            <h1 className="text-2xl font-black text-[#1C1135] mb-2">Revisa tu correo</h1>
            <p className="text-sm text-[#7C6F9A] font-medium mb-6">Enviamos un enlace a <strong className="text-[#1C1135]">{email || "tu correo"}</strong>. Válido por 30 minutos.</p>
            <div className="rounded-2xl p-4 mb-6" style={{ background: B.violetLight }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #0D9488, ${B.violet})` }}>
                  <Sparkles size={13} color="white" />
                </div>
                <p className="text-xs font-medium text-[#1C1135] leading-relaxed">Si no encuentras el correo, revisa tu carpeta de spam. ASHI estará aquí para ayudarte cuando regreses.</p>
              </div>
            </div>
            <button onClick={() => setStep("reset")}
              className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
              style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
              Ya tengo el enlace
            </button>
          </div>
        )}

        {step === "reset" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.violetLight }}>🔐</div>
              <h1 className="text-2xl font-black text-[#1C1135] mb-1">Nueva contraseña</h1>
              <p className="text-sm text-[#7C6F9A] font-medium">Elige una contraseña segura para tu cuenta.</p>
            </div>
            <div className="flex flex-col gap-4">
              <FieldRow label="Nueva contraseña" type="password" placeholder="Mínimo 8 caracteres" value={pass} onChange={setPass} icon={<Lock size={15} />} />
              <FieldRow label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" value={pass2} onChange={setPass2} icon={<Lock size={15} />} />
              <div className="flex gap-1.5">
                {["Mayúscula", "Número", "8+ chars"].map((r, i) => (
                  <div key={r} className="flex-1 text-center rounded-xl py-1.5 text-xs font-bold" style={{ background: pass.length > i * 3 ? B.successLight : "#F5F5F5", color: pass.length > i * 3 ? B.success : B.textMuted }}>
                    {r}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("done")}
                className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
                style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
                Guardar contraseña
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.successLight }}>✅</div>
            <h1 className="text-2xl font-black text-[#1C1135] mb-2">¡Contraseña actualizada!</h1>
            <p className="text-sm text-[#7C6F9A] font-medium mb-6">Tu contraseña fue cambiada con éxito. Ya puedes iniciar sesión.</p>
            <button onClick={() => go("login")}
              className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
              style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

// ─── 8. Admin — Solicitudes de terapeutas ─────────────────────────────────────

export function AdminSolicitudes() {
  const [filter, setFilter] = useState<"pendientes" | "aprobadas" | "rechazadas">("pendientes");
  const [selected, setSelected] = useState<number | null>(null);

  const requests = [
    { name: "Lic. María Fernández", specialty: "Terapia del Lenguaje", exp: "6 años", date: "28 Jul 2026", av: "MF", color: B.violet,  city: "Guadalajara, MX", status: "pendientes", rating: null },
    { name: "Lic. Jorge Salinas",   specialty: "Articulación y Fonología",  exp: "4 años", date: "27 Jul 2026", av: "JS", color: "#2563EB", city: "Monterrey, MX",   status: "pendientes", rating: null },
    { name: "Dra. Claudia Rojas",   specialty: "Comprensión del Lenguaje",  exp: "9 años", date: "25 Jul 2026", av: "CR", color: B.teal,    city: "Buenos Aires, AR",status: "pendientes", rating: null },
    { name: "Lic. Pablo Herrera",   specialty: "Fluidez del Habla",         exp: "3 años", date: "20 Jul 2026", av: "PH", color: B.orange,  city: "Bogotá, CO",      status: "aprobadas",  rating: null },
    { name: "Dra. Sofía Mendez",    specialty: "Pragmática",                exp: "7 años", date: "15 Jul 2026", av: "SM", color: "#EC4899", city: "Lima, PE",         status: "rechazadas", rating: null },
  ];

  const filtered = requests.filter(r => r.status === filter);
  const counts = { pendientes: requests.filter(r => r.status === "pendientes").length, aprobadas: requests.filter(r => r.status === "aprobadas").length, rechazadas: requests.filter(r => r.status === "rechazadas").length };

  return (
    <div className="p-4 sm:p-6 max-w-5xl" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">Solicitudes de terapeutas</h1>
        <p className="text-sm text-[#7C6F9A] font-medium">Revisa y gestiona las postulaciones recibidas.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([
          { k: "pendientes" as const, label: "Pendientes", color: B.warning,  bg: B.warningLight,  icon: "⏳" },
          { k: "aprobadas"  as const, label: "Aprobadas",  color: B.success,  bg: B.successLight,  icon: "✅" },
          { k: "rechazadas" as const, label: "Rechazadas", color: B.danger,   bg: B.dangerLight,   icon: "❌" },
        ]).map(s => (
          <button key={s.k} onClick={() => setFilter(s.k)}
            className="rounded-2xl p-4 border-2 transition-all text-left"
            style={{ background: filter === s.k ? s.bg : "white", borderColor: filter === s.k ? s.color : B.border }}>
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-2xl font-black" style={{ color: s.color }}>{counts[s.k]}</span>
            </div>
            <p className="text-xs font-bold text-[#7C6F9A]">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {filtered.length === 0 && <p className="text-sm text-[#9E95B7] font-medium text-center py-8">Sin solicitudes {filter}</p>}
          {filtered.map((r, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 text-left transition-all hover:border-violet-300"
              style={{ borderColor: selected === i ? B.violet : B.border }}>
              <Av initials={r.av} color={r.color} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135] truncate">{r.name}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{r.specialty}</p>
                <p className="text-xs text-[#9E95B7] font-medium">{r.date}</p>
              </div>
              <ChevronRight size={14} className="text-[#9E95B7] flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected === null ? (
            <div className="bg-white rounded-2xl border border-[#E8E5F4] p-10 text-center h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-3">👆</div>
              <p className="font-extrabold text-[#1C1135] mb-1">Selecciona una solicitud</p>
              <p className="text-sm text-[#7C6F9A] font-medium">Haz clic en una tarjeta para ver todos los detalles.</p>
            </div>
          ) : (() => {
            const r = filtered[selected];
            return (
              <div className="bg-white rounded-2xl border border-[#E8E5F4] p-5">
                <div className="flex items-start gap-4 mb-5">
                  <Av initials={r.av} color={r.color} size="xl" />
                  <div>
                    <h2 className="font-extrabold text-xl text-[#1C1135]">{r.name}</h2>
                    <p className="text-sm text-[#7C6F9A] font-medium">{r.specialty} · {r.exp} de experiencia</p>
                    <p className="text-xs text-[#9E95B7] font-medium">{r.city} · Solicitud: {r.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { l: "Especialidad", v: r.specialty },
                    { l: "Experiencia",  v: r.exp        },
                    { l: "Ciudad",       v: r.city       },
                    { l: "Modalidad",    v: "Virtual y presencial" },
                    { l: "Tarifa",       v: "$65/sesión"  },
                    { l: "Idiomas",      v: "Español, Inglés" },
                  ].map(f => (
                    <div key={f.l} className="rounded-xl p-3" style={{ background: B.bg }}>
                      <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{f.l}</p>
                      <p className="text-sm font-bold text-[#1C1135]">{f.v}</p>
                    </div>
                  ))}
                </div>
                {/* Documents */}
                <div className="mb-5">
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Documentos adjuntos</p>
                  <div className="flex flex-col gap-2">
                    {["Currículum / CV", "Título profesional", "Cédula profesional"].map(doc => (
                      <div key={doc} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E5F4]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📄</span>
                          <span className="text-sm font-bold text-[#1C1135]">{doc}</span>
                        </div>
                        <button className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: B.violetLight, color: B.violet }}>Ver</button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                {filter === "pendientes" && (
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-2xl py-2.5 text-sm font-extrabold text-white"
                      style={{ background: `linear-gradient(135deg, ${B.success}, #059669)` }}>
                      ✅ Aprobar
                    </button>
                    <button className="flex-1 rounded-2xl py-2.5 text-sm font-extrabold border-2"
                      style={{ borderColor: B.warning, color: B.warning }}>
                      ⚠️ Solicitar cambios
                    </button>
                    <button className="flex-1 rounded-2xl py-2.5 text-sm font-extrabold border-2"
                      style={{ borderColor: B.danger, color: B.danger }}>
                      ❌ Rechazar
                    </button>
                  </div>
                )}
                {filter === "aprobadas" && (
                  <div className="rounded-2xl p-3" style={{ background: B.successLight }}>
                    <p className="text-sm font-extrabold" style={{ color: B.success }}>✅ Cuenta creada — Correo de bienvenida enviado</p>
                  </div>
                )}
                {filter === "rechazadas" && (
                  <div className="rounded-2xl p-3" style={{ background: B.dangerLight }}>
                    <p className="text-sm font-extrabold" style={{ color: B.danger }}>❌ Solicitud rechazada</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

import { ArrowRight, Star } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Isotipo } from "@/components/illustrations/Isotipo";
import { Av } from "@/components/common/Av";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

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

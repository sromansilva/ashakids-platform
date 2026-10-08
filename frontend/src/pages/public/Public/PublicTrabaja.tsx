import { useState } from "react";
import { Send } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicTrabaja({ go }: { go: (v: View) => void }) {
  const [form, setForm] = useState({ name: "", email: "", specialty: "", years: "" });
  const benefits = [
    { icon: "⏱️", title: "Horarios flexibles",      desc: "Define tu disponibilidad y gestiona tu agenda desde la plataforma." },
    { icon: "🌍", title: "Atención virtual",         desc: "Atiende a tus pacientes desde cualquier lugar mediante ASHA Session." },
    { icon: "🤖", title: "ASHI como copiloto",       desc: "Asistente inteligente que te ayuda con reportes, objetivos y preparación de sesiones." },
    { icon: "📁", title: "Gestión organizada",       desc: "Historial de pacientes, agenda, reportes y comunicación en un solo lugar." },
    { icon: "📚", title: "Desarrollo profesional",   desc: "Accede a recursos clínicos y a una comunidad de especialistas en lenguaje." },
    { icon: "🛡️", title: "Plataforma estructurada", desc: "Entorno profesional con soporte técnico y gestión de pagos integrada." },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/trabaja" />
      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: `linear-gradient(135deg, ${B.violetLight}, ${B.tealLight})` }}>
        <span className="text-5xl block mb-4">👩‍⚕️</span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4">Únete a nuestro equipo de especialistas</h1>
        <p className="text-lg text-[#7C6F9A] font-medium max-w-2xl mx-auto mb-6">Ayuda a más familias, con más flexibilidad y mejores herramientas. ASHAKids es el lugar donde los mejores terapeutas crecen.</p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[{ v: "🗣️", l: "Terapia de lenguaje" }, { v: "🌐", l: "Sesiones virtuales" }, { v: "🤝", l: "Familias acompañadas" }].map(s => (
            <div key={s.l}><p className="text-2xl font-black text-[#1C1135]">{s.v}</p><p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p></div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Benefits */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">¿Por qué unirte a ASHAKids?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto justify-items-center">
          {benefits.map(b => (
            <div key={b.title} className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E8E5F4]">
              <span className="text-3xl block mb-3">{b.icon}</span>
              <p className="font-extrabold text-[#1C1135] mb-1">{b.title}</p>
              <p className="text-sm text-[#7C6F9A] font-medium">{b.desc}</p>
            </div>
          ))}
        </div>
        {/* Process */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Proceso de postulación</h2>
        <div className="grid sm:grid-cols-4 gap-4 mb-12">
          {["Completa el formulario", "Revisión de credenciales", "Entrevista con nuestro equipo", "¡Bienvenido a ASHAKids!"].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-extrabold text-white text-sm" style={{ background: B.violet }}>{i + 1}</div>
              <p className="text-sm font-extrabold text-[#1C1135]">{step}</p>
            </div>
          ))}
        </div>
        {/* Form */}
        <Crd className="p-6 max-w-lg mx-auto">
          <h3 className="font-extrabold text-[#1C1135] mb-5 text-center">Comenzar postulación</h3>
          <div className="flex flex-col gap-4">
            {[
              { key: "name",      label: "Nombre completo",      ph: "Lic. Ana García"     },
              { key: "email",     label: "Correo electrónico",   ph: "ana@email.com"        },
              { key: "specialty", label: "Especialidad principal",ph: "Terapia del Lenguaje" },
              { key: "years",     label: "Años de experiencia",  ph: "5 años"               },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">{f.label}</label>
                <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                  placeholder={f.ph} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <Btn variant="cta" onClick={() => {}} className="justify-center"><Send size={14} /> Enviar postulación</Btn>
          </div>
        </Crd>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

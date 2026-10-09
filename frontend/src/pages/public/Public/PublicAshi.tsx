import { BookOpen, Sparkles, MessageCircle, Zap, Shield } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicAshi({ go }: { go: (v: View) => void }) {
  const personas = [
    { icon: "👨‍👩‍👧", title: "Para Familias",     color: B.violet,  convos: [
      { role: "user", text: "¿Puedes explicarme el último reporte de Mateo?" },
      { role: "ashi", text: "¡Claro! El reporte muestra que Mateo mejoró su articulación un 15% este mes. En palabras simples: está pronunciando mejor las palabras difíciles. 🌟" },
    ]},
    { icon: "👩‍⚕️", title: "Para Terapeutas",  color: B.teal,    convos: [
      { role: "user", text: "Ayúdame a redactar los objetivos para la próxima sesión de Bruno" },
      { role: "ashi", text: "Basándome en el historial de Bruno, propongo: (1) Ejercicios de soplo 10 min, (2) Lectura guiada nivel B, (3) Juego fonológico de sílabas. ¿Lo ajustamos?" },
    ]},
    { icon: "🛡️", title: "Para Administradores", color: B.orange, convos: [
      { role: "user", text: "¿Cuáles son las tendencias de este mes?" },
      { role: "ashi", text: "Detecté 3 tendencias clave: sesiones virtuales +18%, hora pico 9-11 AM, y 89% retención en pacientes con 4+ sesiones. Recomiendo ampliar disponibilidad matutina." },
    ]},
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/ashi" />
      {/* Hero */}
      <div className="py-16 px-4 text-center" style={{ background: `linear-gradient(135deg, #0a7a71, ${B.violetDeep})` }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,255,255,.15)" }}>
          <Sparkles size={36} color="white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">ASHI Intelligence</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8 font-medium" style={{ color: "rgba(255,255,255,.8)" }}>
          La inteligencia artificial que acompaña a toda la plataforma. No es un chatbot — es un copiloto que observa, anticipa y ayuda.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
          {[{ v: "24/7", l: "Disponible siempre" }, { v: "👨‍👩‍👧 👩‍⚕️ 🛡️", l: "Adapta su rol" }, { v: "🔒", l: "Datos privados" }].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-black text-white">{s.v}</p>
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,.65)" }}>{s.l}</p>
            </div>
          ))}
        </div>
        <Btn variant="cta" size="lg" onClick={() => go("login")}>Probar ASHI ahora</Btn>
      </div>
      {/* Demo conversations */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-3">ASHI se adapta a cada usuario</h2>
        <p className="text-center text-[#7C6F9A] font-medium mb-10">Diferente contexto, diferente experiencia. Siempre la más útil.</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
          {personas.map(p => (
            <Crd key={p.title} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: `${p.color}15` }}>{p.icon}</div>
                <h3 className="font-extrabold text-[#1C1135]">{p.title}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {p.convos.map((c, i) => (
                  <div key={i} className={`flex gap-2 ${c.role === "user" ? "flex-row-reverse" : ""}`}>
                    {c.role === "ashi" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #0D9488, ${p.color})` }}>
                        <Sparkles size={10} color="white" />
                      </div>
                    )}
                    <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs font-medium leading-relaxed"
                      style={c.role === "ashi"
                        ? { background: `${p.color}10`, color: "#1C1135", borderTopLeftRadius: 4 }
                        : { background: `linear-gradient(135deg, #0D9488, ${p.color})`, color: "white", borderTopRightRadius: 4 }}>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>
            </Crd>
          ))}
        </div>
        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto justify-items-center">
          {[
            { icon: <Zap size={20} />,          title: "Proactivo",          desc: "Anticipa necesidades antes de que preguntes" },
            { icon: <Shield size={20} />,        title: "Privado y seguro",   desc: "Tus datos nunca salen de la plataforma" },
            { icon: <BookOpen size={20} />,      title: "Basado en evidencia",desc: "Respuestas con base clínica y terapéutica" },
            { icon: <MessageCircle size={20} />, title: "Siempre disponible", desc: "24 horas al día, 7 días a la semana" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-4 border border-[#E8E5F4] text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: B.violetLight, color: B.violet }}>{f.icon}</div>
              <p className="font-extrabold text-sm text-[#1C1135] mb-1">{f.title}</p>
              <p className="text-xs text-[#7C6F9A] font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

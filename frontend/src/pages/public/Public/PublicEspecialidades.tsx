import { useState } from "react";
import { ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";


// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicEspecialidades({ go }: { go: (v: View) => void }) {
  const [active, setActive] = useState(0);
  const specs = [
    { icon: "🗣️", title: "Lenguaje y Comunicación", color: B.violet, bg: B.violetLight,
      desc: "Intervención para niños que presentan dificultades en la expresión oral, el vocabulario, la comprensión y la comunicación funcional.",
      symptoms: ["Vocabulario limitado para su edad", "Dificultad para expresar ideas", "Comprensión verbal reducida", "Retrasos en el lenguaje"],
      benefits: ["Mayor capacidad de expresión oral", "Vocabulario activo ampliado", "Mejor comprensión de instrucciones", "Comunicación más fluida"],
      therapists: ["Dra. Ana Ruiz", "Dra. Lucía Vargas"] },
    { icon: "🔤", title: "Articulación y Pronunciación", color: B.teal, bg: B.tealLight,
      desc: "Trabajo específico sobre la producción correcta de sonidos, la claridad del habla y la inteligibilidad en la comunicación.",
      symptoms: ["Pronunciación poco clara", "Omisión o sustitución de sonidos", "Dificultad con sonidos complejos", "Habla difícil de entender"],
      benefits: ["Habla más clara e inteligible", "Producción correcta de sonidos", "Mayor confianza al hablar", "Comunicación efectiva con pares"],
      therapists: ["Lic. Pedro Sánchez", "Lic. Roberto Díaz"] },
    { icon: "🎵", title: "Fonología y Conciencia Fonológica", color: "#7C3AED", bg: "#F5F3FF",
      desc: "Desarrollo del sistema de sonidos del lenguaje y la conciencia fonológica, base para la lectura y escritura.",
      symptoms: ["Procesos fonológicos persistentes", "Dificultad para rimar o segmentar sílabas", "Confusión entre sonidos similares", "Habla simplificada"],
      benefits: ["Sistema fonológico organizado", "Base sólida para lectoescritura", "Discriminación auditiva mejorada", "Mayor precisión en el habla"],
      therapists: ["Dra. Ana Ruiz", "Lic. Roberto Díaz"] },
    { icon: "💬", title: "Fluidez del Habla", color: "#EC4899", bg: "#FDF2F8",
      desc: "Intervención para niños con tartamudez u otras disfluencias que afectan la fluidez y naturalidad de su comunicación.",
      symptoms: ["Repeticiones de sílabas o palabras", "Bloqueos al hablar", "Prolongaciones de sonidos", "Tensión visible al intentar hablar"],
      benefits: ["Habla más fluida y natural", "Estrategias de comunicación efectivas", "Mayor comodidad al expresarse", "Reducción de la tensión comunicativa"],
      therapists: ["Dra. María Torres"] },
    { icon: "📖", title: "Comprensión del Lenguaje", color: B.orange, bg: B.orangeLight,
      desc: "Trabajo sobre la comprensión de instrucciones, narrativas, conceptos y estructuras lingüísticas complejas.",
      symptoms: ["Dificultad para seguir instrucciones", "Comprensión literal limitada", "Problemas con narraciones", "Respuestas inapropiadas al contexto"],
      benefits: ["Mejor seguimiento de instrucciones", "Comprensión de textos e historias", "Mayor participación en conversaciones", "Lenguaje receptivo fortalecido"],
      therapists: ["Lic. Carlos Mendoza", "Dra. Lucía Vargas"] },
    { icon: "🧩", title: "Pragmática y Habilidades Sociales del Lenguaje", color: "#2563EB", bg: "#EFF6FF",
      desc: "Desarrollo del uso social del lenguaje: turnos conversacionales, adecuación al contexto e interacción comunicativa.",
      symptoms: ["Dificultad para iniciar o mantener conversaciones", "Respuestas fuera de contexto", "Uso rígido del lenguaje", "Poca adaptación al interlocutor"],
      benefits: ["Intercambios conversacionales más fluidos", "Uso contextual del lenguaje", "Mejor interacción con pares", "Comunicación social más efectiva"],
      therapists: ["Lic. Carlos Mendoza", "Dra. María Torres"] },
  ];
  const s = specs[active];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/especialidades" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Especialidades terapéuticas</h1>
          <p className="text-lg text-[#7C6F9A] font-medium">Cada niño es único. Encuentra el área de apoyo que tu hijo necesita.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="flex flex-col gap-3">
            {specs.map((sp, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                style={{ background: active === i ? sp.bg : "white", border: `1.5px solid ${active === i ? sp.color + "40" : B.border}` }}>
                <span className="text-2xl">{sp.icon}</span>
                <div>
                  <p className="font-extrabold text-sm text-[#1C1135]">{sp.title}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{sp.therapists.length} especialista{sp.therapists.length !== 1 ? "s" : ""}</p>
                </div>
                {active === i && <ChevronRight size={16} style={{ color: sp.color }} className="ml-auto" />}
              </button>
            ))}
          </div>
          {/* Detail */}
          <div className="lg:col-span-2">
            <Crd className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <h2 className="text-xl font-black text-[#1C1135]">{s.title}</h2>
                  <p className="text-sm text-[#7C6F9A] font-medium">{s.therapists.length} especialistas disponibles</p>
                </div>
              </div>
              <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-6">{s.desc}</p>
              <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto justify-items-center mb-6">
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Señales de alerta</p>
                  <div className="flex flex-col gap-2">
                    {s.symptoms.map((sym, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: s.color }} />
                        <p className="text-sm text-[#7C6F9A] font-medium">{sym}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Beneficios de la intervención</p>
                  <div className="flex flex-col gap-2">
                    {s.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                        <p className="text-sm text-[#7C6F9A] font-medium">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Btn variant="cta" onClick={() => go("public/especialistas")}>Ver especialistas en {s.title} <ArrowRight size={14} /></Btn>
            </Crd>
          </div>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

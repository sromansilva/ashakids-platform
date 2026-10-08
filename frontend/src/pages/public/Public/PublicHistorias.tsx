import { ArrowRight } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicHistorias({ go }: { go: (v: View) => void }) {
  const stories = [
    { name: "Laura G.", child: "Mateo, 7 años", specialty: "Terapia del Lenguaje", av: "LG", color: B.violet,
      text: "Desde que comenzamos con la terapia de lenguaje, Mateo participa más en clase y se expresa con mayor soltura. La plataforma nos facilita el seguimiento y la comunicación con la terapeuta.",
      before: "Pronunciación confusa, poca participación oral", after: "Mayor expresión y participación en clase" },
    { name: "Carlos y Patricia R.", child: "Bruno, 9 años", specialty: "Terapia del Lenguaje", av: "CP", color: B.teal,
      text: "El acompañamiento de la terapeuta y las actividades de Mundo ASHA han sido un complemento valioso. Apreciamos poder ver el avance de Bruno de forma organizada y accesible.",
      before: "Dificultades en la comunicación oral", after: "Mayor claridad y fluidez en el habla" },
    { name: "Rosa L.", child: "Valentina, 5 años", specialty: "Terapia del Lenguaje", av: "RL", color: "#EC4899",
      text: "La Dra. María diseñó un plan de fonología muy adaptado a Valentina. El apoyo de ASHI para recordarme los ejercicios en casa ha sido de gran ayuda para mantener la continuidad.",
      before: "Dificultades fonológicas y de articulación", after: "Progreso sostenido en la pronunciación" },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/historias" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Historias ilustrativas</h1>
          <p className="text-lg text-[#7C6F9A] font-medium mb-3">Ejemplos de cómo las familias acompañan el proceso terapéutico en ASHAKids.</p>
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>
            ⚠️ Ejemplos ficticios para el prototipo · No representan casos reales
          </span>
        </div>
        <div className="grid gap-6 mb-12">
          {stories.map((s, i) => (
            <Crd key={i} className="p-6">
              <div className="flex items-start gap-5 flex-wrap">
                <Av initials={s.av} color={s.color} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="font-extrabold text-[#1C1135]">{s.name}</p>
                    <span className="text-xs font-bold text-[#9E95B7]">{s.child}</span>
                  </div>
                  <p className="text-xs font-bold text-violet-600 mb-3">{s.specialty}</p>
                  <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-4 italic">"{s.text}"</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl p-3" style={{ background: "#FEE2E2" }}>
                      <p className="text-xs font-extrabold text-red-600 mb-1">Situación inicial</p>
                      <p className="text-xs text-red-700 font-medium">{s.before}</p>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: "#D1FAE5" }}>
                      <p className="text-xs font-extrabold text-emerald-600 mb-1">Evolución observada</p>
                      <p className="text-xs text-emerald-700 font-medium">{s.after}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Crd>
          ))}
        </div>
        <div className="rounded-3xl p-8 text-center" style={{ background: B.violetLight }}>
          <h2 className="text-2xl font-black text-[#1C1135] mb-2">Acompaña el desarrollo del lenguaje de tu hijo</h2>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Regístrate y accede a especialistas en terapia de lenguaje, seguimiento personalizado y Mundo ASHA.</p>
          <Btn variant="cta" size="lg" onClick={() => go("login")}>Comenzar ahora <ArrowRight size={16} /></Btn>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

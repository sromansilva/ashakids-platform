import { ArrowRight } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicMundo({ go }: { go: (v: View) => void }) {
  const items = [
    { icon: "📖", cat: "Cuentos",       count: 48, color: B.violet,  bg: B.violetLight, desc: "Historias mágicas para desarrollar el lenguaje" },
    { icon: "🎵", cat: "Canciones",      count: 32, color: B.teal,    bg: B.tealLight,   desc: "Ritmos y melodías para la memoria y expresión" },
    { icon: "🎮", cat: "Juegos",         count: 56, color: B.orange,  bg: B.orangeLight, desc: "Actividades interactivas que estimulan el aprendizaje" },
    { icon: "💬", cat: "Trabalenguas",   count: 24, color: "#8B5CF6", bg: "#EDE9FE",     desc: "Ejercicios de articulación y pronunciación" },
    { icon: "🧩", cat: "Adivinanzas",    count: 40, color: "#EC4899", bg: "#FDF2F8",     desc: "Razonamiento y vocabulario en formato divertido" },
    { icon: "🎓", cat: "Academia ASHA",  count: 18, color: "#2563EB", bg: "#EFF6FF",     desc: "Lecciones interactivas por especialistas" },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/mundo" />
      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: `linear-gradient(135deg, ${B.violetLight}, ${B.tealLight})` }}>
        <span className="text-6xl block mb-4">🌎</span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4">Mundo ASHA</h1>
        <p className="text-lg text-[#7C6F9A] font-medium max-w-2xl mx-auto mb-6">Un universo de actividades diseñadas por terapeutas para hacer el aprendizaje una aventura increíble.</p>
        <div className="flex items-center justify-center gap-6 flex-wrap text-center mb-8">
          {[{ v: "6", l: "Áreas de actividad" }, { v: "Virtual", l: "Disponible siempre" }, { v: "🎯", l: "Diseñado por especialistas" }].map(s => (
            <div key={s.l}><p className="text-2xl font-black text-[#1C1135]">{s.v}</p><p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p></div>
          ))}
        </div>
        <Btn variant="cta" size="lg" onClick={() => go("login")}>Desbloquear Mundo ASHA <ArrowRight size={16} /></Btn>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 max-w-5xl mx-auto justify-items-center">
          {items.map(item => (
            <div key={item.cat} className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E8E5F4] hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 opacity-30" style={{ background: item.color }} />
              <span className="text-4xl block mb-4">{item.icon}</span>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-extrabold text-[#1C1135]">{item.cat}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: item.bg, color: item.color }}>{item.count} actividades</span>
              </div>
              <p className="text-sm text-[#7C6F9A] font-medium mb-4">{item.desc}</p>
              <Btn variant="secondary" size="sm" onClick={() => go("login")}>Desbloquear <ArrowRight size={12} /></Btn>
            </div>
          ))}
        </div>
        {/* CTA strip */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${B.violetDeep}, #1a3461)` }}>
          <h2 className="text-2xl font-black text-white mb-3">¿Listo para comenzar la aventura?</h2>
          <p className="text-sm font-medium mb-6" style={{ color: "rgba(255,255,255,.7)" }}>Regístrate gratis y accede a todo el Mundo ASHA desde el primer día.</p>
          <Btn variant="cta" size="lg" onClick={() => go("login")}>Crear cuenta gratuita</Btn>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

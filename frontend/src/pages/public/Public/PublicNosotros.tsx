import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Av } from "@/components/common/Av";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicNosotros({ go }: { go: (v: View) => void }) {
  const team = [
    { name: "Ing. Amparito Maximiliano", role: "CEO & Fundadora",          av: "AM", color: B.violet  },
    { name: "Ing. Sergio Roman",         role: "Director del Proyecto",     av: "SR", color: B.teal    },
    { name: "Nicolás Lavado",            role: "Desarrollador Backend",     av: "NL", color: "#2563EB" },
    { name: "Piero Anticona",            role: "Desarrollador Frontend",    av: "PA", color: "#EC4899" },
    { name: "Fabricio del Castillo",     role: "Arquitectura y datos",      av: "FC", color: B.orange  },
  ];
  const values = [
    { icon: "❤️",  title: "Calidez",       desc: "Cada interacción debe sentirse humana y cercana"      },
    { icon: "🔬",  title: "Evidencia",      desc: "Todo lo que hacemos tiene base científica"             },
    { icon: "🌱",  title: "Crecimiento",    desc: "Creemos en el potencial de cada niño"                  },
    { icon: "🔐",  title: "Privacidad",     desc: "Los datos de las familias son sagrados"                },
    { icon: "🤝",  title: "Confianza",      desc: "Construimos relaciones a largo plazo"                  },
    { icon: "✨",  title: "Innovación",     desc: "La tecnología al servicio del bienestar"               },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/nosotros" />
      {/* Hero */}
      <div className="py-16 px-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-5">Nuestra misión es <span style={{ color: B.violet }}>acompañar a cada niño</span></h1>
        <p className="text-lg text-[#7C6F9A] font-medium leading-relaxed">ASHAKids nació en 2024 con una idea simple: los niños que necesitan apoyo terapéutico deberían tener acceso a los mejores especialistas, sin importar dónde vivan.</p>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        {/* Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[{ v: "🗣️", l: "Terapia de lenguaje" }, { v: "🎯", l: "Seguimiento personalizado" }, { v: "🌎", l: "Atención virtual" }, { v: "🔒", l: "Privacidad familiar" }].map(s => (
            <div key={s.l} className="bg-white rounded-2xl p-5 text-center border border-[#E8E5F4]">
              <p className="text-3xl font-black text-[#1C1135] mb-1" style={{ color: B.violet }}>{s.v}</p>
              <p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p>
            </div>
          ))}
        </div>
        {/* Values */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Nuestros valores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-2xl p-4 border border-[#E8E5F4]">
              <span className="text-3xl block mb-2">{v.icon}</span>
              <p className="font-extrabold text-[#1C1135] mb-1">{v.title}</p>
              <p className="text-xs text-[#7C6F9A] font-medium">{v.desc}</p>
            </div>
          ))}
        </div>
        {/* Team */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Equipo fundador</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto justify-items-center">
          {team.map(t => (
            <div key={t.name} className="w-full max-w-xs min-h-[190px] bg-white rounded-2xl p-6 border border-[#E8E5F4] flex flex-col items-center justify-center text-center">
              <div className="flex w-full justify-center mb-4"><Av initials={t.av} color={t.color} size="xl" /></div>
              <p className="w-full font-extrabold text-[#1C1135] leading-snug">{t.name}</p>
              <p className="w-full text-xs text-[#7C6F9A] font-medium mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

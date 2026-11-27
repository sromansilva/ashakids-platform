import { B } from "@/shared/presentation/theme/brand/B";
import { View } from "@/shared/domain/types/navigation";
import { Av } from "@/shared/presentation/components/common/Av";
import { PublicPageShell } from "./PublicPageShell";

const team = [
  { name: "Ing. Amparito Maximiliano", role: "CEO & Fundadora", av: "AM", color: B.violet },
  { name: "Ing. Sergio Roman", role: "Director del Proyecto", av: "SR", color: B.teal },
  { name: "Nicolás Lavado", role: "Desarrollador Backend", av: "NL", color: "#2563EB" },
  { name: "Piero Anticona", role: "Desarrollador Frontend", av: "PA", color: "#EC4899" },
  { name: "Fabricio del Castillo", role: "Arquitectura y datos", av: "FC", color: B.orange },
];

const pillars = [
  { v: "🗣️", l: "Terapia de lenguaje" },
  { v: "🎯", l: "Seguimiento personalizado" },
  { v: "🌎", l: "Atención virtual" },
  { v: "🔒", l: "Privacidad familiar" },
];

const values = [
  { icon: "❤️", title: "Calidez", desc: "Cada interacción debe sentirse humana y cercana" },
  { icon: "🔬", title: "Evidencia", desc: "Todo lo que hacemos tiene base científica" },
  { icon: "🌱", title: "Crecimiento", desc: "Creemos en el potencial de cada niño" },
  { icon: "🔐", title: "Privacidad", desc: "Los datos de las familias son sagrados" },
  { icon: "🤝", title: "Confianza", desc: "Construimos relaciones a largo plazo" },
  { icon: "✨", title: "Innovación", desc: "La tecnología al servicio del bienestar" },
];

export function PublicNosotros({ go }: { go: (v: View) => void }) {
  return (
    <PublicPageShell go={go} cur="public/nosotros">
      <section className="asha-public-hero">
        <div className="landing-container asha-public-hero-inner">
          <span className="asha-public-eyebrow">Sobre Nosotros</span>
          <h1>
            Nuestra misión es <span>acompañar a cada niño</span>
          </h1>
          <p className="asha-public-lead">
            ASHAKids nació en 2024 con una idea simple: los niños que necesitan apoyo terapéutico deberían tener acceso
            a los mejores especialistas, sin importar dónde vivan.
          </p>
        </div>
      </section>

      <section className="asha-public-section">
        <div className="landing-container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {pillars.map((s) => (
              <div key={s.l} className="asha-card asha-glass text-center">
                <p className="text-3xl mb-2" aria-hidden="true">
                  {s.v}
                </p>
                <p className="text-sm font-extrabold text-[#1C1135]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="asha-public-section asha-public-section--tinted">
        <div className="landing-container">
          <div className="landing-section-heading text-center mb-10">
            <h2>
              Nuestros <span>valores</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <article key={v.title} className="asha-card asha-glass">
                <span className="text-3xl block mb-3" aria-hidden="true">
                  {v.icon}
                </span>
                <h3 className="text-lg font-extrabold text-[#1C1135] mb-1.5">{v.title}</h3>
                <p className="text-sm text-[#615274] font-medium">{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="asha-public-section">
        <div className="landing-container">
          <div className="landing-section-heading text-center mb-10">
            <h2>
              Equipo <span>fundador</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
            {team.map((t) => (
              <article
                key={t.name}
                className="asha-card asha-glass w-full max-w-xs min-h-[196px] flex flex-col items-center justify-center text-center"
              >
                <div className="flex w-full justify-center mb-4">
                  <Av initials={t.av} color={t.color} size="xl" />
                </div>
                <h3 className="w-full text-base font-extrabold text-[#1C1135] leading-snug">{t.name}</h3>
                <p className="w-full text-sm text-[#615274] font-medium mt-1">{t.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

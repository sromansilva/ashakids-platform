import { AlertTriangle, CalendarCheck, ClipboardList, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { B } from "@/shared/presentation/theme/brand/B";
import type { View } from "@/shared/domain/types/navigation";
import { PublicPageShell } from "./PublicPageShell";

const examples = [
  {
    icon: "👨‍👩‍👧",
    title: "Para familias",
    color: B.violet,
    prompt: "¿Dónde reviso un informe?",
    response:
      "Los informes publicados están en la sección Reportes de tu cuenta. La interpretación clínica corresponde a tu terapeuta.",
  },
  {
    icon: "👩‍⚕️",
    title: "Para terapeutas",
    color: B.teal,
    prompt: "¿Qué pasa con una transcripción de voz?",
    response:
      "La transcripción es tentativa y queda pendiente de revisión profesional antes de incorporarse al reporte. El terapeuta puede ver indicadores de apoyo sin validación clínica, que no se muestran a la familia.",
  },
  {
    icon: "🛡️",
    title: "Privacidad",
    color: B.orange,
    prompt: "¿Se procesa voz sin autorización?",
    response:
      "No. La muestra de voz es opcional y el consentimiento vigente del tutor se comprueba antes del análisis.",
  },
];

const features = [
  {
    icon: <CalendarCheck size={20} />,
    title: "Agenda",
    desc: "Las familias pueden consultar profesionales y solicitar horarios disponibles.",
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Registro clínico",
    desc: "La evaluación y el reporte se revisan en el flujo de sesión.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Consentimiento",
    desc: "El procesamiento de una muestra de voz requiere autorización del tutor.",
  },
];

export function PublicAshi({ go }: { go: (view: View) => void }) {
  return (
    <PublicPageShell go={go} cur="public/ashi">
      <section className="asha-public-hero">
        <div className="landing-container asha-public-hero-inner">
          <span className="asha-public-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Vista demostrativa
          </span>
          <h1>
            ASHI <span>Intelligence</span> en ASHAKids
          </h1>
          <p className="asha-public-lead">
            Ejemplos ilustrativos para explicar cómo acompaña ASHI los flujos de la plataforma. Esta página pública no
            consulta expedientes, no genera recomendaciones y no muestra estadísticas reales.
          </p>
          <div className="asha-public-pill-row">
            {["Ejemplos ilustrativos", "Sin datos reales", "Revisión profesional"].map((label) => (
              <span key={label} className="asha-public-pill">
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button type="button" className="asha-btn asha-btn--lg" onClick={() => go("login")}>
              Ingresar al portal <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="asha-public-section asha-public-section--tinted">
        <div className="landing-container">
          <div
            className="mb-10 max-w-4xl mx-auto rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900"
            role="note"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                <strong>Importante:</strong> las conversaciones siguientes son ilustraciones de interfaz. No representan
                pacientes, resultados ni respuestas generadas en tiempo real.
              </p>
            </div>
          </div>

          <div className="landing-section-heading text-center mb-10">
            <h2>
              Ejemplos de orientación <span>dentro del flujo</span>
            </h2>
            <p className="mx-auto">
              Las decisiones clínicas y las conclusiones de una evaluación quedan siempre a cargo del terapeuta.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {examples.map((example) => (
              <article key={example.title} className="asha-card asha-glass flex flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                    style={{ background: `${example.color}18` }}
                    aria-hidden="true"
                  >
                    {example.icon}
                  </div>
                  <h3 className="font-extrabold text-[#1C1135]">{example.title}</h3>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <p
                    className="max-w-[90%] self-end rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-white"
                    style={{ background: `linear-gradient(135deg, #0D9488, ${example.color})` }}
                  >
                    {example.prompt}
                  </p>
                  <p
                    className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm font-medium leading-relaxed text-[#1C1135]"
                    style={{ background: `${example.color}12` }}
                  >
                    {example.response}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="asha-card text-center">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "var(--asha-lavender)", color: "var(--asha-primary-dark)" }}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 text-base font-extrabold text-[#1C1135]">{feature.title}</h3>
                <p className="text-sm font-medium text-[#615274]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

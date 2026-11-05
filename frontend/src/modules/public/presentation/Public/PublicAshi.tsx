import { AlertTriangle, CalendarCheck, ClipboardList, ShieldCheck, Sparkles } from "lucide-react";
import { B } from "@/shared/presentation/theme/brand/B";
import type { View } from "@/shared/domain/types/navigation";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Crd } from "@/shared/presentation/components/common/Crd";
import { PublicNav } from "@/modules/public/presentation/Public/PublicNav";
import { PublicFooter } from "@/modules/public/presentation/Public/PublicFooter";

const examples = [
  {
    icon: "👨‍👩‍👧",
    title: "Para familias",
    color: B.violet,
    prompt: "¿Dónde reviso un informe?",
    response: "Los informes publicados están en la sección Reportes de tu cuenta. La interpretación clínica corresponde a tu terapeuta.",
  },
  {
    icon: "👩‍⚕️",
    title: "Para terapeutas",
    color: B.teal,
    prompt: "¿Qué pasa con una transcripción de voz?",
    response: "La transcripción es tentativa y queda pendiente de revisión profesional antes de incorporarse al reporte. El terapeuta puede ver indicadores de apoyo sin validación clínica, que no se muestran a la familia.",
  },
  {
    icon: "🛡️",
    title: "Privacidad",
    color: B.orange,
    prompt: "¿Se procesa voz sin autorización?",
    response: "No. La muestra de voz es opcional y el consentimiento vigente del tutor se comprueba antes del análisis.",
  },
];

export function PublicAshi({ go }: { go: (view: View) => void }) {
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/ashi" />
      <section className="px-4 py-16 text-center" style={{ background: `linear-gradient(135deg, #0a7a71, ${B.violetDeep})` }}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: "rgba(255,255,255,.15)" }}>
          <Sparkles size={36} color="white" aria-hidden="true" />
        </div>
        <p className="mx-auto mb-4 w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
          Vista demostrativa
        </p>
        <h1 className="mb-4 text-3xl font-black text-white sm:text-5xl">ASHI en Ashakids</h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-white/80">
          Ejemplos estáticos para explicar los flujos de la plataforma. Esta página pública no consulta expedientes,
          no genera recomendaciones y no muestra estadísticas reales.
        </p>
        <div className="mx-auto mb-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-sm font-bold text-white">
          {["Ejemplos ilustrativos", "Sin datos reales", "Revisión profesional"].map((label) => (
            <span key={label} className="rounded-full border border-white/25 bg-white/10 px-4 py-2">{label}</span>
          ))}
        </div>
        <Btn variant="cta" size="lg" onClick={() => go("login")}>Ingresar al portal</Btn>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p><strong>Importante:</strong> las conversaciones siguientes son ilustraciones de interfaz. No representan pacientes, resultados ni respuestas generadas en tiempo real.</p>
          </div>
        </div>
        <h2 className="mb-3 text-center text-2xl font-black text-[#1C1135]">Ejemplos de orientación dentro del flujo</h2>
        <p className="mb-10 text-center font-medium text-[#7C6F9A]">Las decisiones clínicas y las conclusiones de una evaluación quedan a cargo del terapeuta.</p>

        <div className="mx-auto grid max-w-5xl justify-items-center gap-6 md:grid-cols-3">
          {examples.map((example) => (
            <Crd key={example.title} className="w-full p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `${example.color}15` }} aria-hidden="true">{example.icon}</div>
                <h3 className="font-extrabold text-[#1C1135]">{example.title}</h3>
              </div>
              <div className="flex flex-col gap-3">
                <p className="max-w-[90%] self-end rounded-2xl rounded-tr-sm px-3 py-2 text-xs font-medium leading-relaxed text-white" style={{ background: `linear-gradient(135deg, #0D9488, ${example.color})` }}>{example.prompt}</p>
                <p className="rounded-2xl rounded-tl-sm px-3 py-2 text-xs font-medium leading-relaxed text-[#1C1135]" style={{ background: `${example.color}10` }}>{example.response}</p>
              </div>
            </Crd>
          ))}
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl justify-items-center gap-4 sm:grid-cols-3">
          {[
            { icon: <CalendarCheck size={20} />, title: "Agenda", desc: "Las familias pueden consultar profesionales y solicitar horarios disponibles." },
            { icon: <ClipboardList size={20} />, title: "Registro clínico", desc: "La evaluación y el reporte se revisan en el flujo de sesión." },
            { icon: <ShieldCheck size={20} />, title: "Consentimiento", desc: "El procesamiento de una muestra de voz requiere autorización del tutor." },
          ].map((feature) => (
            <div key={feature.title} className="w-full rounded-2xl border border-[#E8E5F4] bg-white p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: B.violetLight, color: B.violet }}>{feature.icon}</div>
              <p className="mb-1 text-sm font-extrabold text-[#1C1135]">{feature.title}</p>
              <p className="text-xs font-medium text-[#7C6F9A]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <PublicFooter go={go} />
    </div>
  );
}

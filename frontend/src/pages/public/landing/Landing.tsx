import { useLanding } from "@/pages/public/landing/useLanding";
import { LandingConsejosDeTerapia } from "@/pages/public/landing/LandingConsejosDeTerapia";
import { LandingElApoyoQue } from "@/pages/public/landing/LandingElApoyoQue";
import { LandingTerapeutasCertificados } from "@/pages/public/landing/LandingTerapeutasCertificados";
import { LandingTerapiasEspecializadas } from "@/pages/public/landing/LandingTerapiasEspecializadas";
import { LandingComoUnaFamiliaPodria } from "@/pages/public/landing/LandingComoUnaFamiliaPodria";
import { ChevronDown } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Bdg } from "@/components/common/Bdg";
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function Landing(props: Parameters<typeof useLanding>[0]) {
const { go, faqOpen, setFaqOpen, email, setEmail, services, steps, testimonials, faqs } = useLanding(props);
return (
    <div
      style={{
        fontFamily: '"Nunito", system-ui, sans-serif',
        backgroundColor: B.bg,
      }}
    >
      <PublicNav go={go} cur="landing" />

      {/* ── Hero (deep violet) ── */}
      <LandingElApoyoQue go={go} />

      {/* ── Services ── */}
      <LandingTerapiasEspecializadas services={services} go={go} />

      {/* ── How it works ── */}
      <section
        className="py-20"
        style={{ background: B.violetLight }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Bdg color="violet">¿Cómo funciona?</Bdg>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight">
              Comenzar es muy sencillo
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="relative text-center"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] right-0 h-px bg-violet-300 z-0" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white font-black text-violet-700 text-3xl mb-5 shadow-sm shadow-violet-100">
                  {step.icon}
                </div>
                <div className="text-xs font-black text-violet-400 mb-1 tracking-widest uppercase">
                  {step.n}
                </div>
                <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#7C6F9A] leading-relaxed max-w-xs mx-auto font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Therapists ── */}
      <LandingTerapeutasCertificados go={go} />

      {/* ── Historias ilustrativas ── */}
      <LandingComoUnaFamiliaPodria testimonials={testimonials} />

      {/* ── FAQ ── */}
      <section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Bdg color="teal">FAQ</Bdg>
            <h2 className="mt-4 text-3xl font-black text-[#1C1135] tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-extrabold text-[#1C1135] hover:bg-violet-50 transition-colors text-sm sm:text-base"
                  onClick={() =>
                    setFaqOpen(faqOpen === i ? null : i)
                  }
                >
                  {faq.q}
                  <ChevronDown
                    size={17}
                    className={`text-[#9E95B7] flex-shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#7C6F9A] leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Newsletter (orange) ── */}
      <LandingConsejosDeTerapia email={email} setEmail={setEmail} />

      <PublicFooter go={go} />
    </div>
  );

}

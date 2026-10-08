import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Isotipo } from "@/components/illustrations/Isotipo";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

export function Onboarding({ go, onComplete }: { go: (v: View) => void; onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const screens = [
    {
      icon: "👋",
      title: "Bienvenido a AshaKids",
      text: "Tu cuenta familiar está lista. Antes de comenzar, conoce cómo te acompañaremos en cada etapa.",
    },
    {
      icon: "🎥",
      title: "Terapia virtual acompañada",
      text: "El padre agenda y acompaña al paciente; el terapeuta realiza la sesión y comparte el seguimiento desde un espacio seguro.",
    },
    {
      icon: "💬",
      title: "Todo en un mismo lugar",
      text: "Desde el Centro Familiar podrás revisar sesiones, mensajes, progreso y próximos pasos cuando los necesites.",
    },
  ];
  const current = screens[step];
  const finish = () => {
    if (step === screens.length - 1) {
      if (onComplete) { onComplete(); } else { go("padre"); }
    } else {
      setStep((value) => value + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6 bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5"><Isotipo size={44} /><span className="font-black text-[#1C1135] text-lg">AshaKids</span></div>
          <button onClick={() => onComplete ? onComplete() : go("padre")} className="text-xs font-bold text-[#7C6F9A] hover:text-violet-600">Ir al Centro Familiar</button>
        </div>
        <div className="flex gap-2 mb-6" aria-label={`Paso ${step + 1} de ${screens.length}`}>
          {screens.map((screen, index) => <span key={screen.title} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: index <= step ? B.violet : B.border }} />)}
        </div>
        <main className="rounded-3xl bg-white border border-[#E8E5F4] shadow-[0_18px_50px_rgba(76,29,149,.08)] p-6 sm:p-8 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5" style={{ background: B.violetLight }}>{current.icon}</div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] mb-2" style={{ color: B.violet }}>Así funciona AshaKids</p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1135] mb-3">{current.title}</h1>
          <p className="text-sm sm:text-base text-[#7C6F9A] font-medium leading-relaxed max-w-md mx-auto">{current.text}</p>
          <div className="mt-7 rounded-2xl p-4 text-left flex items-start gap-3" style={{ background: B.violetLight }}>
            <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ background: B.violet }}><Sparkles size={16} color="white" /></div>
            <p className="text-sm text-[#1C1135] font-medium leading-relaxed"><strong>ASHI te acompaña.</strong> Esta introducción es informativa: podrás completar y actualizar la información de tu familia desde el dashboard cuando la necesites.</p>
          </div>
          <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">
            {step > 0 && <button onClick={() => setStep((value) => value - 1)} className="sm:w-1/3 rounded-2xl py-3 font-extrabold text-sm text-[#7C6F9A] border border-[#E8E5F4] hover:bg-[#F8F6FF]">Anterior</button>}
            <button onClick={finish} className="flex-1 rounded-2xl py-3 font-extrabold text-sm text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>{step === screens.length - 1 ? "Ir al Centro Familiar" : "Continuar"}<ArrowRight size={16} /></button>
          </div>
        </main>
      </div>
    </div>
  );
}

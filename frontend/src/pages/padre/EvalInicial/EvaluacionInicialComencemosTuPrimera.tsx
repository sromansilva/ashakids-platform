import type { useEvaluacionInicial } from "@/pages/padre/EvalInicial/useEvaluacionInicial";
import { AlertTriangle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

type Props = Pick<ReturnType<typeof useEvaluacionInicial>, "childName" | "ageYears" | "ageMonthsRem" | "setStep" | "go">;
export function EvaluacionInicialComencemosTuPrimera({ childName, ageYears, ageMonthsRem, setStep, go }: Props) {
return (<div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FFF8F0 100%)" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
              🦋
            </div>
            <h1 className="text-2xl font-black text-[#1C1135] mb-2">¡Comencemos tu primera<br />aventura ASHA!</h1>
            <p className="text-sm font-medium text-[#7C6F9A] leading-relaxed">
              Acompaña a Asha por diferentes estaciones y ayúdala a completar pequeñas misiones de comunicación.
            </p>
          </div>

          <Crd className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white" style={{ background: B.violet }}>
                {childName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold text-[#1C1135]">{childName}</p>
                <p className="text-xs text-[#7C6F9A]">{ageYears} años {ageMonthsRem > 0 ? `y ${ageMonthsRem} meses` : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: "🗺️", label: "5 estaciones" },
                { icon: "⏱️", label: "10–15 minutos" },
                { icon: "⏸️", label: "Puedes pausar" },
              ].map(item => (
                <div key={item.label} className="text-center p-3 rounded-2xl bg-[#F5F0FF]">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs font-bold text-[#7C6F9A]">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: "#FFF8EC", border: "1px solid #FDE68A" }}>
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-800">
                <strong>Para el adulto:</strong> Esta experiencia ofrece orientación inicial y no constituye un diagnóstico clínico. Acompaña al niño durante toda la aventura.
              </p>
            </div>
          </Crd>

          <Btn variant="cta" className="w-full justify-center mb-3" onClick={() => setStep("consent")}>
            Comenzar aventura 🚀
          </Btn>
          <button onClick={() => go("padre")} className="w-full text-center py-3 text-sm font-bold text-[#9E95B7] hover:text-[#7C6F9A] transition-colors">
            Realizar más tarde
          </button>
        </div>
      </div>);
}

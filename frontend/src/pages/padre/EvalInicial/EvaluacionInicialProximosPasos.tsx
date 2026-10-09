import type { useEvaluacionInicial } from "@/pages/padre/EvalInicial/useEvaluacionInicial";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof useEvaluacionInicial>, "setStep" | "childName" | "go" | "downloadPdf">;
export function EvaluacionInicialProximosPasos({ setStep, childName, go, downloadPdf }: Props) {
return (<div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => setStep("adult-result")} className="flex items-center gap-2 text-sm font-bold text-[#7C6F9A] mb-6 hover:text-[#1C1135] transition-colors">
          <ArrowLeft size={16} /> Volver al resultado
        </button>
        <h2 className="text-xl font-black text-[#1C1135] mb-1">Próximos pasos</h2>
        <p className="text-sm text-[#7C6F9A] mb-6">Opciones disponibles para continuar el proceso de {childName}.</p>

        <div className="space-y-3 mb-6">
          {[
            {
              icon: "👩‍⚕️",
              title: "Buscar terapeuta",
              desc: "Encuentra un especialista en comunicación infantil.",
              action: () => go("padre/psicologos"),
              variant: "cta" as const,
            },
            {
              icon: "📋",
              title: "Solicitar revisión profesional",
              desc: "Un terapeuta revisará tu orientación inicial.",
              action: () => go("padre/agenda"),
              variant: "secondary" as const,
            },
            {
              icon: "💾",
              title: "Guardar resultado",
              desc: "El resultado queda guardado en el perfil de {childName}.".replace("{childName}", childName),
              action: () => {},
              variant: "secondary" as const,
            },
            {
              icon: "📥",
              title: "Descargar resumen orientativo",
              desc: "Descarga el PDF con los resultados.",
              action: downloadPdf,
              variant: "secondary" as const,
            },
          ].map(item => (
            <button
              key={item.title}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-[#F5F0FF] hover:border-violet-200 transition-all text-left"
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{item.title}</p>
                <p className="text-xs text-[#9E95B7] mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-[#9E95B7] flex-shrink-0" />
            </button>
          ))}
        </div>

        <Btn variant="cta" className="w-full justify-center" onClick={() => go("padre/recorrido")}>
          Volver a Mi Camino ASHA
        </Btn>
      </div>
    </div>);
}

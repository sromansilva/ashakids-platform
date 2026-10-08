import type { useEvaluacionInicial } from "@/pages/padre/EvalInicial/useEvaluacionInicial";
import { ArrowLeft } from "lucide-react";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

type Props = Pick<ReturnType<typeof useEvaluacionInicial>, "setStep" | "childName" | "ageYears" | "ageMonthsRem" | "childLangs" | "setChildLangs" | "childBackground" | "setChildBackground" | "childNotes" | "setChildNotes" | "setCurrentStation">;
export function EvaluacionInicialInformacionDe({ setStep, childName, ageYears, ageMonthsRem, childLangs, setChildLangs, childBackground, setChildBackground, childNotes, setChildNotes, setCurrentStation }: Props) {
return (<div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setStep("consent")} className="flex items-center gap-2 text-sm font-bold text-[#7C6F9A] mb-6 hover:text-[#1C1135] transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <h2 className="text-xl font-black text-[#1C1135] mb-1">Información de {childName}</h2>
          <p className="text-sm text-[#7C6F9A] mb-6">Confirma o corrige antes de comenzar la aventura.</p>

          <Crd className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#F5F0FF" }}>
              <span className="text-2xl">🎂</span>
              <div>
                <p className="text-xs font-bold text-[#9E95B7]">Edad</p>
                <p className="font-extrabold text-[#1C1135]">{ageYears} años {ageMonthsRem > 0 ? `y ${ageMonthsRem} meses` : ""}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Idioma(s) en casa</label>
              <input
                value={childLangs}
                onChange={e => setChildLangs(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400"
                placeholder="Ej: Español, Inglés"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Antecedentes relevantes (opcional)</label>
              <textarea
                value={childBackground}
                onChange={e => setChildBackground(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none"
                placeholder="Condiciones, apoyos, antecedentes médicos relevantes..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Observaciones del representante (opcional)</label>
              <textarea
                value={childNotes}
                onChange={e => setChildNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none"
                placeholder="Lo que quieras compartir sobre su comunicación..."
              />
            </div>
          </Crd>

          <Btn variant="cta" className="w-full justify-center" onClick={() => { setCurrentStation(1); setStep("adventure-map"); }}>
            Todo está correcto, ¡adelante! 🗺️
          </Btn>
        </div>
      </div>);
}

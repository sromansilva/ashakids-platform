import type { useEvaluacionInicial } from "@/pages/padre/EvalInicial/useEvaluacionInicial";
import { CheckCircle } from "lucide-react";
import { Btn } from "@/components/common/Btn";
import { AdventureStep } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { ProgressBar } from "@/pages/padre/EvalInicial/ProgressBar";

type Props = Pick<ReturnType<typeof useEvaluacionInicial>, "completedStations" | "currentStation" | "setStep">;
export function EvaluacionInicialMapaDeLaAventura({ completedStations, currentStation, setStep }: Props) {
return (<div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FFF8F0 100%)" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🗺️</div>
            <h2 className="text-xl font-black text-[#1C1135]">Mapa de la Aventura</h2>
            <p className="text-sm text-[#7C6F9A] mt-1">{completedStations.length} de 5 estaciones completadas</p>
          </div>

          <ProgressBar current={completedStations.length} total={5} label="Progreso de la aventura" />

          <div className="space-y-3 mb-8">
            {STATIONS.map((station, idx) => {
              const isCompleted = completedStations.includes(station.id);
              const isCurrent = station.id === currentStation && !isCompleted;
              return (
                <div
                  key={station.id}
                  className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${
                    isCompleted
                      ? "border-green-300 bg-green-50"
                      : isCurrent
                      ? "border-violet-400 bg-violet-50 shadow-md scale-[1.02]"
                      : "border-[#E8E5F4] bg-white opacity-60"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: isCompleted ? "#DCF5E7" : station.bg }}>
                    {isCompleted ? "✅" : station.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-extrabold text-sm ${isCompleted ? "text-green-700" : isCurrent ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>
                      {station.name}
                    </p>
                    <p className="text-xs text-[#9E95B7] truncate">{station.desc}</p>
                  </div>
                  {isCompleted && <CheckCircle size={20} className="text-green-500 flex-shrink-0" />}
                  {isCurrent && <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-violet-600 text-white flex-shrink-0">Actual</span>}
                </div>
              );
            })}
          </div>

          {currentStation <= 5 && !completedStations.includes(currentStation) && (
            <Btn variant="cta" className="w-full justify-center" onClick={() => setStep(`station-${currentStation}` as AdventureStep)}>
              ¡Ir a {STATIONS[currentStation - 1].name}! {STATIONS[currentStation - 1].icon}
            </Btn>
          )}
        </div>
      </div>);
}

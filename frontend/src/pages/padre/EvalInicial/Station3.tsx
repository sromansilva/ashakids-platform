import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Btn } from "@/components/common/Btn";

// ─── Types ─────────────────────────────────────────────────────────────────────
import { StationResult } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { ProgressBar } from "@/pages/padre/EvalInicial/ProgressBar";
import { HelpBar } from "@/pages/padre/EvalInicial/HelpBar";
import { FeedbackBubble } from "@/pages/padre/EvalInicial/FeedbackBubble";

export function Station3({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hints, setHints] = useState(3);
  const [hintMsg, setHintMsg] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [paused, setPaused] = useState(false);

  const activities = ageMonths <= 60
    ? [
        {
          prompt: "Asha dice: \"Toca la estrella.\"",
          options: [{ emoji: "⭐", label: "Estrella" }, { emoji: "🌙", label: "Luna" }, { emoji: "☁️", label: "Nube" }],
          correct: 0,
          hint: "Es brillante y tiene puntitas.",
        },
      ]
    : ageMonths <= 96
    ? [
        {
          prompt: "Asha dice: \"Primero toca el árbol y después la flor.\" ¿Cuál tocas primero?",
          options: [{ emoji: "🌸", label: "Flor" }, { emoji: "🌳", label: "Árbol" }, { emoji: "🍄", label: "Hongo" }],
          correct: 1,
          hint: "Recuerda, 'primero' indica el orden.",
        },
      ]
    : [
        {
          prompt: "Asha dice: \"Coloca la manzana encima de la caja y la estrella debajo.\" ¿Qué va encima?",
          options: [{ emoji: "⭐", label: "Estrella" }, { emoji: "🍎", label: "Manzana" }, { emoji: "📦", label: "Caja" }],
          correct: 1,
          hint: "'Encima' significa arriba del objeto.",
        },
      ];

  const current = activities[step];

  function handleSelect(idx: number) {
    setSelected(idx);
    setAttempts(a => a + 1);
    if (idx === current.correct) {
      setFeedback("¡Misión completada! ¡Seguiste la instrucción!");
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        setHintMsg("");
        if (step + 1 < activities.length) {
          setStep(s => s + 1);
        } else {
          onComplete({ stationId: 3, completed: true, hintsUsed, attempts, method: "buttons", timeApprox: 70 });
        }
      }, 1500);
    } else {
      setFeedback("¡Buen intento! Probemos otra forma.");
      setShowFeedback(true);
      setTimeout(() => { setShowFeedback(false); setSelected(null); }, 1200);
    }
  }

  function handleHint() {
    if (hints > 0) {
      setHintMsg(current.hint);
      setHints(h => h - 1);
      setHintsUsed(h => h + 1);
    }
  }

  if (paused) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⏸️</div>
        <h3 className="text-xl font-extrabold text-[#1C1135] mb-2">Aventura pausada</h3>
        <Btn variant="cta" onClick={() => setPaused(false)}>Continuar aventura</Btn>
      </div>
    );
  }

  return (
    <div>
      <ProgressBar current={step + 1} total={activities.length} label={`Actividad ${step + 1} de ${activities.length}`} />
      <FeedbackBubble message={feedback} show={showFeedback} />
      {hintMsg && (
        <div className="p-3 rounded-xl mb-4 flex items-center gap-2" style={{ background: "#FEF9C3", border: "1px solid #FDE047" }}>
          <span>💡</span>
          <p className="text-sm font-medium text-yellow-800">{hintMsg}</p>
        </div>
      )}
      <div className="rounded-3xl p-6 mb-6 text-center" style={{ background: STATIONS[2].bg }}>
        <div className="text-4xl mb-3">🌊</div>
        <p className="text-base font-bold text-[#1C1135] leading-relaxed">{current.prompt}</p>
        <button className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-bold bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors">
          <Volume2 size={14} /> Escuchar instrucción
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={showFeedback}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
              selected === idx ? "border-sky-400 bg-sky-50" : "border-[#E8E5F4] bg-white hover:border-sky-200"
            }`}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="text-xs font-bold text-[#1C1135]">{opt.label}</span>
          </button>
        ))}
      </div>
      <HelpBar onHint={handleHint} onPause={() => setPaused(true)} onExit={() => onComplete({ stationId: 3, completed: false, hintsUsed, attempts, method: "buttons", timeApprox: 35 })} hintsLeft={hints} />
    </div>
  );
}

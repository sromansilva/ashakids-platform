import { useState } from "react";
import { Btn } from "@/components/common/Btn";

// ─── Types ─────────────────────────────────────────────────────────────────────
import { StationResult } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { ProgressBar } from "@/pages/padre/EvalInicial/ProgressBar";
import { HelpBar } from "@/pages/padre/EvalInicial/HelpBar";
import { FeedbackBubble } from "@/pages/padre/EvalInicial/FeedbackBubble";

export function Station5({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hints, setHints] = useState(3);
  const [hintMsg, setHintMsg] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [paused, setPaused] = useState(false);

  const scenarios = [
    {
      scene: "Asha necesita ir al baño pero no sabe cómo decírselo a la maestra. ¿Qué puede hacer?",
      options: ["Levantar la mano y pedir permiso", "Quedarse callada", "Llorar sin decir nada"],
      correct: 0,
      hint: "Pedir ayuda es siempre una buena idea.",
    },
    {
      scene: "Tu amigo está hablando y no entendiste lo que dijo. ¿Qué dices?",
      options: ["\"¿Me lo puedes repetir?\"", "No dices nada", "Te vas sin responder"],
      correct: 0,
      hint: "Está bien pedir que te repitan algo.",
    },
  ];

  const current = scenarios[step];

  function handleSelect(idx: number) {
    setSelected(idx);
    setAttempts(a => a + 1);
    if (idx === current.correct) {
      setFeedback("¡Muy bien! Esa es una gran respuesta.");
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        setHintMsg("");
        if (step + 1 < scenarios.length) {
          setStep(s => s + 1);
        } else {
          onComplete({ stationId: 5, completed: true, hintsUsed, attempts, method: "buttons", timeApprox: 80 });
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
      <ProgressBar current={step + 1} total={scenarios.length} label={`Situación ${step + 1} de ${scenarios.length}`} />
      <FeedbackBubble message={feedback} show={showFeedback} />
      {hintMsg && (
        <div className="p-3 rounded-xl mb-4 flex items-center gap-2" style={{ background: "#FEF9C3", border: "1px solid #FDE047" }}>
          <span>💡</span>
          <p className="text-sm font-medium text-yellow-800">{hintMsg}</p>
        </div>
      )}
      <div className="rounded-3xl p-6 mb-5" style={{ background: STATIONS[4].bg }}>
        <div className="text-4xl text-center mb-3">🌟</div>
        <p className="text-base font-bold text-[#1C1135] leading-relaxed text-center">{current.scene}</p>
        <p className="text-sm text-center mt-2" style={{ color: STATIONS[4].color }}>¿Qué podría decir el personaje?</p>
      </div>
      <div className="space-y-3 mb-4">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={showFeedback}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
              selected === idx ? "border-pink-400 bg-pink-50 text-pink-800" : "border-[#E8E5F4] bg-white text-[#1C1135] hover:border-pink-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <HelpBar onHint={handleHint} onPause={() => setPaused(true)} onExit={() => onComplete({ stationId: 5, completed: false, hintsUsed, attempts, method: "buttons", timeApprox: 40 })} hintsLeft={hints} />
    </div>
  );
}

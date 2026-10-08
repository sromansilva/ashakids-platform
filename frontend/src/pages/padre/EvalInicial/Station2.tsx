import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Btn } from "@/components/common/Btn";

// ─── Types ─────────────────────────────────────────────────────────────────────
import { StationResult } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { ProgressBar } from "@/pages/padre/EvalInicial/ProgressBar";
import { HelpBar } from "@/pages/padre/EvalInicial/HelpBar";
import { FeedbackBubble } from "@/pages/padre/EvalInicial/FeedbackBubble";

export function Station2({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hints, setHints] = useState(3);
  const [hintMsg, setHintMsg] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [paused, setPaused] = useState(false);

  const pairs = [
    {
      prompt: "¿Qué animal hace este sonido? 🔊 \"Miau\"",
      options: [{ emoji: "🐶", label: "Perro" }, { emoji: "🐱", label: "Gato" }, { emoji: "🐸", label: "Rana" }],
      correct: 1,
      hint: "Es un animal doméstico que maúlla.",
    },
    {
      prompt: "¿Cuál de estas palabras empieza con el sonido 'ssss'?",
      options: [{ emoji: "🌙", label: "Luna" }, { emoji: "☀️", label: "Sol" }, { emoji: "🐍", label: "Serpiente" }],
      correct: 2,
      hint: "Piensa en un animal que se arrastra.",
    },
  ];

  const current = pairs[step];

  function handleSelect(idx: number) {
    setSelected(idx);
    setAttempts(a => a + 1);
    if (idx === current.correct) {
      setFeedback("¡Buen oído! ¡Lo encontraste!");
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        setHintMsg("");
        if (step + 1 < pairs.length) {
          setStep(s => s + 1);
        } else {
          onComplete({ stationId: 2, completed: true, hintsUsed, attempts, method: "buttons", timeApprox: 80 });
        }
      }, 1500);
    } else {
      setFeedback("¡Buen intento! Asha te dará una pista.");
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
      <ProgressBar current={step + 1} total={pairs.length} label={`Actividad ${step + 1} de ${pairs.length}`} />
      <FeedbackBubble message={feedback} show={showFeedback} />
      {hintMsg && (
        <div className="p-3 rounded-xl mb-4 flex items-center gap-2" style={{ background: "#FEF9C3", border: "1px solid #FDE047" }}>
          <span>💡</span>
          <p className="text-sm font-medium text-yellow-800">{hintMsg}</p>
        </div>
      )}
      <div className="rounded-3xl p-6 mb-6 text-center" style={{ background: STATIONS[1].bg }}>
        <div className="text-4xl mb-3">🦇</div>
        <p className="text-base font-bold text-[#1C1135] leading-relaxed">{current.prompt}</p>
        <button className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
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
              selected === idx ? "border-purple-400 bg-purple-50" : "border-[#E8E5F4] bg-white hover:border-purple-200"
            }`}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="text-xs font-bold text-[#1C1135]">{opt.label}</span>
          </button>
        ))}
      </div>
      <HelpBar onHint={handleHint} onPause={() => setPaused(true)} onExit={() => onComplete({ stationId: 2, completed: false, hintsUsed, attempts, method: "buttons", timeApprox: 40 })} hintsLeft={hints} />
    </div>
  );
}

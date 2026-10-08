import { useState } from "react";
import { Btn } from "@/components/common/Btn";

// ─── Types ─────────────────────────────────────────────────────────────────────
import { StationResult } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { ProgressBar } from "@/pages/padre/EvalInicial/ProgressBar";
import { HelpBar } from "@/pages/padre/EvalInicial/HelpBar";
import { FeedbackBubble } from "@/pages/padre/EvalInicial/FeedbackBubble";

export function Station1({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [hints, setHints] = useState(3);
  const [hintMsg, setHintMsg] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const activities = ageMonths <= 60
    ? [
        {
          prompt: "Asha quiere preparar su mochila. ¿Cuál de estos objetos sirve para beber agua?",
          options: [{ emoji: "📚", label: "Libro" }, { emoji: "💧", label: "Botella" }, { emoji: "✏️", label: "Lápiz" }],
          correct: 1,
          hint: "Piensa en lo que usas cuando tienes sed.",
        },
        {
          prompt: "¿Cuál de estos animales vive en el mar?",
          options: [{ emoji: "🐱", label: "Gato" }, { emoji: "🐟", label: "Pez" }, { emoji: "🐢", label: "Tortuga" }],
          correct: 1,
          hint: "Es un animal que nada en el agua.",
        },
      ]
    : [
        {
          prompt: "¿Cuál de estos objetos usamos para cortar?",
          options: [{ emoji: "🍽️", label: "Plato" }, { emoji: "🔪", label: "Tijeras" }, { emoji: "🥄", label: "Cuchara" }],
          correct: 1,
          hint: "Tiene dos partes que se juntan para cortar papel.",
        },
        {
          prompt: "¿Qué objeto necesitas para leer un libro por la noche?",
          options: [{ emoji: "💡", label: "Lámpara" }, { emoji: "🧸", label: "Osito" }, { emoji: "🎮", label: "Videojuego" }],
          correct: 0,
          hint: "Da luz para ver mejor.",
        },
      ];

  const current = activities[step];

  function handleSelect(idx: number) {
    setSelected(idx);
    setAttempts(a => a + 1);
    if (idx === current.correct) {
      setFeedback("¡Misión completada! ¡Excelente elección!");
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        setHintMsg("");
        if (step + 1 < activities.length) {
          setStep(s => s + 1);
        } else {
          onComplete({ stationId: 1, completed: true, hintsUsed, attempts, method: "buttons", timeApprox: 90 });
        }
      }, 1500);
    } else {
      setFeedback("¡Buen intento! Probemos otra opción.");
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
        <p className="text-sm text-[#7C6F9A] mb-6">Puedes continuar cuando quieras.</p>
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
      <div className="rounded-3xl p-6 mb-6 text-center" style={{ background: STATIONS[0].bg }}>
        <div className="text-4xl mb-3">🌻</div>
        <p className="text-base font-bold text-[#1C1135] leading-relaxed">{current.prompt}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={showFeedback}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
              selected === idx ? "border-violet-400 bg-violet-50" : "border-[#E8E5F4] bg-white hover:border-violet-200"
            }`}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="text-xs font-bold text-[#1C1135]">{opt.label}</span>
          </button>
        ))}
      </div>
      <HelpBar onHint={handleHint} onPause={() => setPaused(true)} onExit={() => onComplete({ stationId: 1, completed: false, hintsUsed, attempts, method: "buttons", timeApprox: 45 })} hintsLeft={hints} />
    </div>
  );
}

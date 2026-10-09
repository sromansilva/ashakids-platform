import { useState } from "react";
import { Check } from "lucide-react";
import { Btn } from "@/components/common/Btn";

// ─── Types ─────────────────────────────────────────────────────────────────────
import { StationResult } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { HelpBar } from "@/pages/padre/EvalInicial/HelpBar";

export function Station4({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
  const scenes = [
    { id: "A", emoji: "🌅", label: "Asha se despierta por la mañana" },
    { id: "B", emoji: "🎒", label: "Asha prepara su mochila" },
    { id: "C", emoji: "🚌", label: "Asha toma el autobús a la escuela" },
    { id: "D", emoji: "📚", label: "Asha llega a clase y saluda" },
  ];
  const correctOrder = ["A", "B", "C", "D"];

  const [order, setOrder] = useState(["C", "A", "D", "B"]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hints, setHints] = useState(3);
  const [hintMsg, setHintMsg] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [paused, setPaused] = useState(false);

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setOrder(next);
  }

  function moveDown(idx: number) {
    if (idx === order.length - 1) return;
    const next = [...order];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setOrder(next);
  }

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => {
      onComplete({ stationId: 4, completed: true, hintsUsed, attempts: 1, method: "buttons", timeApprox: 120 });
    }, 2000);
  }

  function handleHint() {
    if (hints > 0) {
      setHintMsg("Piensa en el orden de un día escolar: mañana, preparar, ir, llegar.");
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

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🌲✨</div>
        <h3 className="text-xl font-extrabold text-[#1C1135] mb-2">¡Historia completada!</h3>
        <p className="text-sm text-[#7C6F9A]">¡Gracias por participar!</p>
      </div>
    );
  }

  return (
    <div>
      {hintMsg && (
        <div className="p-3 rounded-xl mb-4 flex items-center gap-2" style={{ background: "#FEF9C3", border: "1px solid #FDE047" }}>
          <span>💡</span>
          <p className="text-sm font-medium text-yellow-800">{hintMsg}</p>
        </div>
      )}
      <div className="rounded-3xl p-5 mb-5" style={{ background: STATIONS[3].bg }}>
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">🌲</div>
          <p className="text-base font-bold text-[#1C1135]">Ordena la historia de Asha</p>
          <p className="text-sm text-[#7C6F9A] mt-1">Usa las flechas para poner las escenas en el orden correcto.</p>
        </div>
        <div className="space-y-2 mt-4">
          {order.map((id, idx) => {
            const scene = scenes.find(s => s.id === id)!;
            return (
              <div key={id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-[#E8E5F4]">
                <span className="text-2xl">{scene.emoji}</span>
                <span className="flex-1 text-sm font-medium text-[#1C1135]">{scene.label}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 rounded-lg hover:bg-amber-50 disabled:opacity-30 transition-colors text-amber-600 text-xs font-bold">▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === order.length - 1} className="p-1 rounded-lg hover:bg-amber-50 disabled:opacity-30 transition-colors text-amber-600 text-xs font-bold">▼</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Btn variant="cta" className="w-full justify-center mb-2" onClick={handleSubmit}>
        Así es la historia <Check size={15} className="ml-1" />
      </Btn>
      <HelpBar onHint={handleHint} onPause={() => setPaused(true)} onExit={() => onComplete({ stationId: 4, completed: false, hintsUsed, attempts: 1, method: "buttons", timeApprox: 60 })} hintsLeft={hints} />
    </div>
  );
}

import React, { useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle, X, Download,
  AlertTriangle, ChevronRight, Trophy,
  HelpCircle, Volume2, Play,
} from "lucide-react";
import { B, View, Btn, Crd } from "../shared";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AdventureStep =
  | "welcome"
  | "consent"
  | "context"
  | "adventure-map"
  | "station-1"
  | "station-2"
  | "station-3"
  | "station-4"
  | "station-5"
  | "parent-observations"
  | "child-celebration"
  | "adult-result"
  | "next-steps";

type StationId = 1 | 2 | 3 | 4 | 5;

type ParentAnswer = "Frecuentemente" | "Algunas veces" | "Todavía no" | "No estoy seguro";

interface StationResult {
  stationId: StationId;
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  method: "buttons" | "voice";
  timeApprox: number; // seconds
}


type ResultCategory =
  | "sin-senales"
  | "seguimiento"
  | "evaluacion-prof"
  | "evaluacion-prioritaria";

// ─── Station data ───────────────────────────────────────────────────────────────

const STATIONS = [
  { id: 1 as StationId, name: "Jardín de las Palabras", icon: "🌻", color: "#22C55E", bg: "#F0FDF4", desc: "Vocabulario y palabras" },
  { id: 2 as StationId, name: "Cueva de los Sonidos", icon: "🦇", color: "#8B5CF6", bg: "#F5F3FF", desc: "Sonidos y discriminación" },
  { id: 3 as StationId, name: "Río de las Instrucciones", icon: "🌊", color: "#0EA5E9", bg: "#F0F9FF", desc: "Comprensión de instrucciones" },
  { id: 4 as StationId, name: "Bosque de las Historias", icon: "🌲", color: "#D97706", bg: "#FFFBEB", desc: "Secuencia narrativa" },
  { id: 5 as StationId, name: "Plaza de las Emociones", icon: "🌟", color: "#EC4899", bg: "#FDF2F8", desc: "Comunicación social" },
] as const;

const PARENT_QUESTIONS = [
  { id: "pq1", text: "¿Cómo se comunica habitualmente tu hijo en casa?" },
  { id: "pq2", text: "¿Comprende instrucciones cotidianas con facilidad?" },
  { id: "pq3", text: "¿Cómo expresa sus necesidades o emociones?" },
  { id: "pq4", text: "¿Ha observado cambios en su comunicación recientemente?" },
  { id: "pq5", text: "¿En qué situaciones necesita más apoyo para comunicarse?" },
];

const PARENT_ANSWERS: ParentAnswer[] = ["Frecuentemente", "Algunas veces", "Todavía no", "No estoy seguro"];

// ─── Shared UI helpers ──────────────────────────────────────────────────────────

function ProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#7C6F9A]">{label ?? `${current} de ${total}`}</span>
        <span className="text-xs font-bold" style={{ color: B.violet }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#E8E5F4] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${B.violet}, #A78BFA)` }}
        />
      </div>
    </div>
  );
}

function HelpBar({ onHint, onPause, onExit, hintsLeft = 3 }: { onHint: () => void; onPause: () => void; onExit: () => void; hintsLeft?: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mt-4">
      <button onClick={onHint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8E5F4] hover:bg-violet-50 transition-colors" style={{ color: B.violet }}>
        <HelpCircle size={13} /> Pedir pista {hintsLeft > 0 && <span className="ml-1 bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 text-[10px]">{hintsLeft}</span>}
      </button>
      <button onClick={onPause} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8E5F4] hover:bg-gray-50 transition-colors text-[#7C6F9A]">
        <Play size={13} /> Pausar
      </button>
      <button onClick={onExit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8E5F4] hover:bg-red-50 transition-colors text-[#7C6F9A]">
        <X size={13} /> Salir
      </button>
    </div>
  );
}

function FeedbackBubble({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl mb-4 animate-[fadeIn_0.3s_ease]" style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC" }}>
      <span className="text-2xl">✨</span>
      <p className="text-sm font-bold text-green-700">{message}</p>
    </div>
  );
}

// ─── Station 1: Jardín de las Palabras ─────────────────────────────────────────

function Station1({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
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

// ─── Station 2: Cueva de los Sonidos ──────────────────────────────────────────

function Station2({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
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

// ─── Station 3: Río de las Instrucciones ───────────────────────────────────────

function Station3({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
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

// ─── Station 4: Bosque de las Historias ────────────────────────────────────────

function Station4({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
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

// ─── Station 5: Plaza de las Emociones ─────────────────────────────────────────

function Station5({ ageMonths, onComplete }: { ageMonths: number; onComplete: (result: Partial<StationResult>) => void }) {
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

// ─── Main component ─────────────────────────────────────────────────────────────

export function EvaluacionInicial({
  go,
  childName = "Mateo",
  childAgeMonths = 84,
}: {
  go: (v: View) => void;
  childName?: string;
  childAgeMonths?: number;
}) {
  const [step, setStep] = useState<AdventureStep>("welcome");
  const [consentGeneral, setConsentGeneral] = useState(false);
  const [consentMic, setConsentMic] = useState(false);
  const [_useMic, setUseMic] = useState(false);
  const [stationResults, setStationResults] = useState<Partial<StationResult>[]>([]);
  const [completedStations, setCompletedStations] = useState<StationId[]>([]);
  const [currentStation, setCurrentStation] = useState<StationId>(1);
  const [parentObs, setParentObs] = useState<Record<string, ParentAnswer>>({});
  const [processing, setProcessing] = useState(false);
  const [resultCategory, setResultCategory] = useState<ResultCategory>("seguimiento");

  // Context fields
  const [childLangs, setChildLangs] = useState("Español");
  const [childBackground, setChildBackground] = useState("");
  const [childNotes, setChildNotes] = useState("");

  const ageYears = Math.floor(childAgeMonths / 12);
  const ageMonthsRem = childAgeMonths % 12;

  function handleStationComplete(result: Partial<StationResult>) {
    const newResults = [...stationResults, result];
    setStationResults(newResults);
    if (result.stationId) {
      setCompletedStations(prev => [...prev, result.stationId!]);
    }
    // Move to next station or parent observations
    if (currentStation < 5) {
      const next = (currentStation + 1) as StationId;
      setCurrentStation(next);
      setStep("adventure-map");
    } else {
      setStep("parent-observations");
    }
  }

  function handleParentObsChange(qId: string, answer: ParentAnswer) {
    setParentObs(prev => ({ ...prev, [qId]: answer }));
  }

  function handleParentObsSubmit() {
    setStep("processing" as any);
    setProcessing(true);
    setTimeout(() => {
      // Compute result
      const answeredCount = Object.keys(parentObs).length;
      const todonoCount = Object.values(parentObs).filter(a => a === "Todavía no").length;
      const ratio = answeredCount > 0 ? todonoCount / answeredCount : 0;
      let cat: ResultCategory = "sin-senales";
      if (ratio > 0.6) cat = "evaluacion-prioritaria";
      else if (ratio > 0.4) cat = "evaluacion-prof";
      else if (ratio > 0.2) cat = "seguimiento";
      setResultCategory(cat);
      setProcessing(false);
      setStep("child-celebration");
    }, 2800);
  }

  function downloadPdf() {
    const content = `ORIENTACIÓN INICIAL ASHA\nDatos simulados para demostración\n\nNiño: ${childName}\nEdad: ${ageYears} años ${ageMonthsRem} meses\nFecha: ${new Date().toLocaleDateString("es-ES")}\n\nResultado orientativo: ${resultCategory}\n\nEste resultado es orientativo y no constituye un diagnóstico clínico.\nVersión evaluación: 1.0-demo | Modelo: ASHA-Eval-v1`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orientacion-asha-${childName.toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Step: Welcome ─────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FFF8F0 100%)" }}>
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
      </div>
    );
  }

  // ── Step: Consent ─────────────────────────────────────────────────────────────
  if (step === "consent") {
    const canContinue = consentGeneral;
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setStep("welcome")} className="flex items-center gap-2 text-sm font-bold text-[#7C6F9A] mb-6 hover:text-[#1C1135] transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <h2 className="text-xl font-black text-[#1C1135] mb-1">Para el adulto</h2>
          <p className="text-sm text-[#7C6F9A] mb-6">Antes de comenzar, necesitamos tu consentimiento explícito.</p>

          <Crd className="mb-4">
            <h3 className="font-extrabold text-[#1C1135] mb-3">Consentimiento específico</h3>
            <div className="space-y-3">
              {[
                "Autorizo el procesamiento de las respuestas de esta evaluación.",
                "Entiendo que se registrarán las interacciones del niño con fines orientativos.",
                "Comprendo que se generará una orientación automatizada revisable por un terapeuta.",
                "He leído que este resultado NO es un diagnóstico clínico.",
              ].map((text, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <button
                    onClick={() => { if (i === 0) setConsentGeneral(v => !v); }}
                    className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition-all mt-0.5 ${
                      consentGeneral ? "border-violet-600 bg-violet-600" : "border-[#C4BAE0]"
                    }`}
                  >
                    {consentGeneral && <Check size={11} className="text-white" />}
                  </button>
                  <span className="text-sm font-medium text-[#4B4468] leading-snug">{text}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-[#9E95B7] mt-4">Consentimiento v1.0 · {new Date().toLocaleDateString("es-ES")} · Revocable en Configuración</p>
          </Crd>

          <Crd className="mb-6">
            <h3 className="font-extrabold text-[#1C1135] mb-1">Uso del micrófono (opcional)</h3>
            <p className="text-sm text-[#7C6F9A] mb-3">Algunas actividades pueden hacerse con voz. Siempre hay alternativa con botones.</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                onClick={() => setConsentMic(v => !v)}
                className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition-all mt-0.5 ${
                  consentMic ? "border-violet-600 bg-violet-600" : "border-[#C4BAE0]"
                }`}
              >
                {consentMic && <Check size={11} className="text-white" />}
              </button>
              <span className="text-sm font-medium text-[#4B4468] leading-snug">
                Autorizo el uso del micrófono de forma opcional para actividades de voz.
              </span>
            </label>
          </Crd>

          <Btn
            variant="cta"
            className="w-full justify-center"
            onClick={() => { setUseMic(consentMic); setStep("context"); }}
            disabled={!canContinue}
          >
            Continuar <ArrowRight size={15} className="ml-1" />
          </Btn>
          {!canContinue && (
            <p className="text-center text-xs text-[#9E95B7] mt-2">Acepta el consentimiento para continuar.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Context ─────────────────────────────────────────────────────────────
  if (step === "context") {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
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
      </div>
    );
  }

  // ── Step: Adventure map ────────────────────────────────────────────────────────
  if (step === "adventure-map") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FFF8F0 100%)" }}>
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
      </div>
    );
  }

  // ── Steps: Stations ───────────────────────────────────────────────────────────
  const stationSteps: Record<string, React.ReactElement> = {
    "station-1": <Station1 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-2": <Station2 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-3": <Station3 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-4": <Station4 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-5": <Station5 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
  };

  if (step.startsWith("station-")) {
    const stationIdx = parseInt(step.split("-")[1]) - 1;
    const station = STATIONS[stationIdx];
    return (
      <div className="min-h-screen" style={{ background: station.bg }}>
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("adventure-map")} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
              <ArrowLeft size={18} style={{ color: station.color }} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{station.icon}</span>
              <div>
                <p className="font-extrabold text-sm text-[#1C1135]">{station.name}</p>
                <p className="text-xs" style={{ color: station.color }}>Estación {station.id} de 5</p>
              </div>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: station.color + "20", color: station.color }}>
              {childAgeMonths <= 60 ? "3–5 años" : childAgeMonths <= 96 ? "6–8 años" : "9–12 años"}
            </div>
          </div>
          {stationSteps[step]}
        </div>
      </div>
    );
  }

  // ── Step: Parent observations ──────────────────────────────────────────────────
  if (step === "parent-observations") {
    const allAnswered = PARENT_QUESTIONS.every(q => parentObs[q.id]);
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👨‍👩‍👧</div>
            <h2 className="text-xl font-black text-[#1C1135]">Cuéntanos lo que observas</h2>
            <p className="text-sm text-[#7C6F9A] mt-1">Responde brevemente sobre la comunicación de {childName} en casa.</p>
          </div>

          <div className="space-y-4 mb-6">
            {PARENT_QUESTIONS.map(q => (
              <Crd key={q.id}>
                <p className="text-sm font-bold text-[#1C1135] mb-3 leading-snug">{q.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PARENT_ANSWERS.map(ans => (
                    <button
                      key={ans}
                      onClick={() => handleParentObsChange(q.id, ans)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        parentObs[q.id] === ans
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-[#E8E5F4] bg-white text-[#7C6F9A] hover:border-violet-200"
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </Crd>
            ))}
          </div>

          <Btn
            variant="cta"
            className="w-full justify-center"
            onClick={handleParentObsSubmit}
            disabled={!allAnswered}
          >
            Completar aventura <Trophy size={15} className="ml-1" />
          </Btn>
          {!allAnswered && (
            <p className="text-center text-xs text-[#9E95B7] mt-2">Responde todas las preguntas para continuar.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Processing ───────────────────────────────────────────────────────────
  if (step === ("processing" as any) || processing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FFF8F0 100%)" }}>
        <div className="text-center px-6">
          <div className="text-5xl mb-4 animate-bounce">🦋</div>
          <h3 className="text-xl font-black text-[#1C1135] mb-2">Preparando tu orientación...</h3>
          <p className="text-sm text-[#7C6F9A] max-w-xs mx-auto leading-relaxed">
            Estamos preparando una orientación inicial. Este resultado no reemplaza la evaluación de un terapeuta.
          </p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: B.violet, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Child celebration ────────────────────────────────────────────────────
  if (step === "child-celebration") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #F5F0FF 100%)" }}>
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-2">¡Aventura completada!</h2>
          <p className="text-sm text-[#7C6F9A] mb-6">¡{childName} lo hizo increíble! Gracias por participar.</p>

          <div className="grid grid-cols-5 gap-2 mb-8">
            {STATIONS.map(s => (
              <div key={s.id} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-1" style={{ background: s.bg, border: `2px solid ${s.color}40` }}>
                  {completedStations.includes(s.id) ? "✅" : s.icon}
                </div>
                <p className="text-[10px] font-bold text-[#9E95B7] leading-tight">{s.name.split(" ").slice(0, 2).join(" ")}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl p-6 mb-6" style={{ background: "white", border: "2px solid #E8E5F4" }}>
            <div className="text-4xl mb-2">🌟</div>
            <p className="font-extrabold text-[#1C1135] mb-1">Insignia de Participación</p>
            <p className="text-xs text-[#9E95B7]">Esta insignia celebra la participación, no el desempeño clínico.</p>
          </div>

          <Btn variant="cta" className="w-full justify-center mb-3" onClick={() => setStep("adult-result")}>
            Ver resultado orientativo (adulto)
          </Btn>
          <button onClick={() => go("padre")} className="w-full text-center py-3 text-sm font-bold text-[#9E95B7] hover:text-[#7C6F9A] transition-colors">
            Volver al Centro Familiar
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Adult result ─────────────────────────────────────────────────────────
  const RESULT_INFO: Record<ResultCategory, { icon: string; label: string; desc: string; color: string; bg: string }> = {
    "sin-senales": {
      icon: "✅",
      label: "Sin señales relevantes por ahora",
      desc: "Las actividades y observaciones no muestran áreas de preocupación inmediata. Continúa con el seguimiento regular de su desarrollo.",
      color: "#16A34A",
      bg: "#F0FDF4",
    },
    "seguimiento": {
      icon: "🔍",
      label: "Seguimiento recomendado",
      desc: "Algunas respuestas sugieren que puede ser útil un seguimiento en los próximos meses. No es urgente, pero es recomendable.",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    "evaluacion-prof": {
      icon: "👩‍⚕️",
      label: "Evaluación profesional recomendada",
      desc: "Las observaciones indican que sería beneficioso consultar con un terapeuta del habla para una evaluación más detallada.",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
    "evaluacion-prioritaria": {
      icon: "⚠️",
      label: "Evaluación prioritaria",
      desc: "Varias áreas muestran señales que conviene revisar pronto con un profesional especializado.",
      color: "#DC2626",
      bg: "#FEF2F2",
    },
  };

  const result = RESULT_INFO[resultCategory];

  if (step === "adult-result") {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("child-celebration")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft size={18} className="text-[#7C6F9A]" />
            </button>
            <div>
              <h2 className="text-xl font-black text-[#1C1135]">Resultado orientativo</h2>
              <p className="text-xs text-[#9E95B7]">Exclusivo para el adulto responsable</p>
            </div>
          </div>

          <div className="rounded-3xl p-6 mb-4 border-2" style={{ background: result.bg, borderColor: result.color + "40" }}>
            <div className="text-4xl mb-3 text-center">{result.icon}</div>
            <h3 className="font-black text-lg text-center mb-3" style={{ color: result.color }}>{result.label}</h3>
            <p className="text-sm font-medium text-[#4B4468] leading-relaxed text-center">{result.desc}</p>
          </div>

          <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: "#FFF8EC", border: "1px solid #FDE68A" }}>
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800">Este resultado es orientativo y no constituye un diagnóstico clínico.</p>
          </div>

          <Crd className="mb-4 space-y-3">
            <h4 className="font-extrabold text-[#1C1135] text-sm">Detalles del resultado</h4>
            {[
              { label: "Estaciones completadas", value: `${completedStations.length} de 5` },
              { label: "Idioma del hogar", value: childLangs || "Español" },
              { label: "Información del representante", value: "Incluida" },
              { label: "Nivel de confianza", value: "Orientativo — baja certeza clínica" },
              { label: "Versión evaluación", value: "1.0-demo" },
              { label: "Versión modelo", value: "ASHA-Eval-v1" },
              { label: "Fecha", value: new Date().toLocaleDateString("es-ES") },
              { label: "Estado de revisión", value: "Pendiente" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#F0EDF8] last:border-0">
                <span className="text-xs font-medium text-[#7C6F9A]">{item.label}</span>
                <span className="text-xs font-bold text-[#1C1135]">{item.value}</span>
              </div>
            ))}
          </Crd>

          <p className="text-xs text-center text-[#9E95B7] mb-4">Datos simulados para demostración · Versión demo</p>

          <div className="space-y-3">
            <Btn variant="cta" className="w-full justify-center" onClick={() => setStep("next-steps")}>
              Próximos pasos <ArrowRight size={15} className="ml-1" />
            </Btn>
            <Btn variant="secondary" className="w-full justify-center" onClick={downloadPdf}>
              <Download size={14} className="mr-1" /> Descargar resumen orientativo
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Next steps ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
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
              action: () => go("padre/directorio"),
              variant: "cta" as const,
            },
            {
              icon: "📋",
              title: "Solicitar revisión profesional",
              desc: "Un terapeuta revisará tu orientación inicial.",
              action: () => go("padre/citas"),
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
    </div>
  );
}

import { useState } from "react";
import { ChevronRight, ChevronLeft, Volume2, Pause, Play, RotateCcw, HelpCircle } from "lucide-react";

import { View } from "@/types/navigation";

import { Crd } from "@/components/common/Crd";







import { speakForChild } from "@/pages/padre/Sessions/speakForChild";



import { SimulatedDataLog, ExitConfirmModal } from "@/pages/padre/GamesShared";

export function MundoAshaAdivinanzas({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [riddle, setRiddle] = useState(0);
  // lastChoice: key of the last tap; wrongThisRiddle: wrongs before Next is available
  const [lastChoice, setLastChoice] = useState<string | null>(null);
  const [wrongThisRiddle, setWrongThisRiddle] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [completed, setCompleted] = useState(0);   // riddles answered (correct or after 2 wrong)
  const [attempts, setAttempts] = useState(0);     // total taps across all riddles
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [events, setEvents] = useState<object[]>([]);
  const isAssigned = false;

  const riddles = [
    {
      q: "Tengo hojas pero no soy árbol, tengo lomo pero no soy animal. ¿Qué soy?",
      art: "📚", answer: "Un libro",
      hints: ["Sirve para aprender y leer.", "Lo encuentras en la biblioteca.", "Tiene páginas y palabras."],
      options: [
        { key: "arbol", label: "🌳 Un árbol" },
        { key: "libro", label: "📖 Un libro" },
        { key: "animal", label: "🐻 Un animal" },
        { key: "cuaderno", label: "📓 Un cuaderno" },
      ],
      correct: "libro",
    },
    {
      q: "Cuanto más me secas, más mojado me pongo. ¿Qué soy?",
      art: "🛁", answer: "Una toalla",
      hints: ["La usas después de bañarte.", "Es suave y absorbente.", "Cuelga en el baño."],
      options: [
        { key: "esponja", label: "🧽 Una esponja" },
        { key: "jabon", label: "🧼 El jabón" },
        { key: "toalla", label: "🏖️ Una toalla" },
        { key: "agua", label: "💧 El agua" },
      ],
      correct: "toalla",
    },
    {
      q: "Soy redonda, vivo en el cielo y me ven mejor de noche. ¿Qué soy?",
      art: "🌙", answer: "La luna",
      hints: ["No es el sol.", "Aparece cuando oscurece.", "Los poetas le escriben canciones."],
      options: [
        { key: "sol", label: "☀️ El sol" },
        { key: "estrella", label: "⭐ Una estrella" },
        { key: "nube", label: "☁️ Una nube" },
        { key: "luna", label: "🌙 La luna" },
      ],
      correct: "luna",
    },
  ];

  const current = riddles[riddle];
  const isCorrect = lastChoice === current.correct;
  // Show the "Next / reveal" controls when: correct, OR second wrong attempt, OR manually revealed
  const showNextControls = isCorrect || wrongThisRiddle >= 2 || revealed;

  const resetRiddleState = () => {
    setLastChoice(null);
    setWrongThisRiddle(0);
    setRevealed(false);
    setHintLevel(0);
  };

  const start = () => {
    setPhase("playing");
    setStartTime(Date.now());
    setRiddle(0);
    setCompleted(0);
    setAttempts(0);
    setHintsUsed(0);
    setPauseCount(0);
    setEvents([]);
    resetRiddleState();
  };

  const choose = (key: string) => {
    if (showNextControls) return; // locked after correct or 2 wrongs
    const correct = key === current.correct;
    setAttempts(a => a + 1);
    setLastChoice(key);
    setEvents(prev => [...prev, {
      riddle: riddle + 1, choice: key, correct,
      attempt: wrongThisRiddle + 1, hintsUsed: hintLevel,
      timeSeconds: Math.round((Date.now() - startTime) / 1000),
    }]);
    if (!correct) setWrongThisRiddle(w => w + 1);
    if (correct) setCompleted(c => c + 1);
  };

  const next = () => {
    if (!isCorrect && !revealed) setCompleted(c => c + 1); // count even if revealed after 2 wrongs
    if (riddle < riddles.length - 1) {
      setRiddle(r => r + 1);
      resetRiddleState();
    } else {
      setPhase("done");
    }
  };

  const addHint = () => {
    if (hintLevel < current.hints.length) {
      const h = hintLevel;
      setHintLevel(h + 1);
      setHintsUsed(n => n + 1);
      speakForChild(current.hints[h]);
    }
  };

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const dataLog = {
    sessionId: `ASHA-SIM-${Date.now().toString(36).toUpperCase()}`,
    profileId: "P-0421 (pseudonimizado)",
    activityType: "valle-adivinanzas",
    version: "v1.0-demo",
    assigned: isAssigned,
    timestamp: new Date().toISOString(),
    durationSeconds: phase === "done" ? elapsedSec : null,
    totalAttempts: attempts,
    hintsUsedAsSupport: hintsUsed,
    pauseCount,
    riddlesParticipated: phase === "done" ? riddles.length : riddle,
    events,
    note: "Datos simulados · No datos reales · Pistas registradas como apoyo, no penalización",
  };

  // PRE
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)" }}>
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🧩</span>
          <div>
            <p className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">Mundo 3</p>
            <h1 className="text-3xl font-black text-white">Valle de Adivinanzas</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>🔭 Exploración libre</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>⏱ ~5 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Crd className="p-5">
          <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Actividad de exploración</h2>
          <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-4">
            3 adivinanzas con 4 opciones ilustradas. Tienes dos intentos por adivinanza y pistas de apoyo cuando las necesites.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🧩", label: "3 adivinanzas · 4 opciones ilustradas" },
              { icon: "🔁", label: "Dos intentos antes de ver la respuesta" },
              { icon: "💡", label: "Pistas de apoyo · hasta 3 por adivinanza" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              ℹ️ Actividad de exploración libre. El número de intentos y pistas se registra como apoyo, sin penalización. La exploración no equivale a progreso clínico.
            </p>
          </div>
        </Crd>
        <button onClick={start} aria-label="Comenzar adivinanzas" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #B45309, #92400E)" }}>
          <Play size={16} aria-hidden="true" /> Comenzar adivinanzas
        </button>
      </div>
    </div>
  );

  // EXIT CONFIRM
  if (phase === "exit-confirm") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />
    </div>
  );

  // DONE
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">¡Actividad completada!</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Valle de Adivinanzas · 3 adivinanzas</p>
        </div>
        <Crd className="p-5 mb-4">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Tu participación</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Adivinanzas completadas", value: `${riddles.length} / ${riddles.length}` },
              { label: "Total de intentos", value: String(attempts) },
              { label: "Pistas utilizadas", value: String(hintsUsed) },
              { label: "Tiempo total", value: `${Math.max(1, elapsedSec)} seg` },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#FFFBEB" }}>
                <p className="font-extrabold text-[#1C1135] text-lg">{s.value}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              ✅ Exploración registrada. Las pistas e intentos son apoyos, no penalizaciones. La exploración no equivale a progreso clínico.
            </p>
          </div>
        </Crd>
        <SimulatedDataLog log={dataLog} />
        <div className="flex gap-3 mt-5">
          <button onClick={start} aria-label="Repetir actividad" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-amber-50 transition-all bg-white">
            <RotateCcw size={15} aria-hidden="true" /> Repetir
          </button>
          <button onClick={() => go("mundo-asha")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #B45309, #92400E)" }}>
            Volver al mapa <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  // PLAYING / PAUSED
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
            aria-label="Salir de la actividad" title="Salir de la actividad"
            className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white transition-colors">
            <ChevronLeft size={16} aria-hidden="true" /> Salir
          </button>
          <div className="flex items-center gap-2">
            {riddles.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < riddle ? "white" : i === riddle ? "#FDE68A" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-amber-300 ml-1">{riddle + 1}/{riddles.length}</span>
          </div>
          <button
            onClick={() => { if (phase === "playing") { setPauseCount(p => p + 1); setPhase("paused"); } else setPhase("playing"); }}
            aria-label={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            title={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            className="p-2 rounded-xl text-amber-300 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {phase === "paused" && (
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Continúa cuando estés listo.</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => setPhase("playing")} aria-label="Reanudar actividad"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#B45309" }}>
              <Play size={15} aria-hidden="true" /> Reanudar actividad
            </button>
            <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
              aria-label="Salir sin completar"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-amber-50">
              Salir
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <Crd className="p-5">
            {/* Riddle text — tap to listen */}
            <div className="text-center mb-5">
              <div className="text-6xl mb-3" aria-hidden="true">{current.art}</div>
              <button
                onClick={() => speakForChild(current.q)}
                aria-label={`Escuchar adivinanza en voz alta: ${current.q}`}
                title="Toca para escuchar la adivinanza"
                className="w-full text-left p-4 rounded-2xl text-base font-extrabold text-[#1C1135] leading-relaxed hover:bg-amber-50 transition-colors"
                style={{ background: "#FFFBEB" }}>
                &ldquo;{current.q}&rdquo;
                <span className="flex items-center gap-1 text-xs font-bold text-amber-700 mt-1">
                  <Volume2 size={11} aria-hidden="true" /> Toca para escuchar
                </span>
              </button>
            </div>

            {/* Progressive hints */}
            {hintLevel > 0 && (
              <div className="mb-4 flex flex-col gap-1">
                {current.hints.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="rounded-xl px-3 py-2 text-xs font-bold text-amber-800" style={{ background: "#FEF3C7" }}>
                    💡 Pista {i + 1}: {h}
                  </div>
                ))}
              </div>
            )}

            {/* First-wrong gentle feedback (before second attempt) */}
            {lastChoice && !isCorrect && wrongThisRiddle === 1 && (
              <div className="rounded-xl p-3 mb-4 text-sm font-bold text-center" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                😊 No es esa, ¡inténtalo una vez más! Puedes pedir una pista si la necesitas.
              </div>
            )}

            {/* Revealed answer after 2 wrongs */}
            {showNextControls && (
              <div className={`rounded-xl p-3 mb-4 text-sm font-bold text-center border ${isCorrect ? "bg-green-50 text-green-700 border-green-300" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                {isCorrect ? `🎉 ¡Muy bien! La respuesta es: ${current.answer}` : `💛 La respuesta es: ${current.answer}. ¡Seguimos!`}
              </div>
            )}

            {/* Choice grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {current.options.map((opt) => {
                const optCorrect = opt.key === current.correct;
                const isChosen = lastChoice === opt.key;
                const locked = showNextControls;
                return (
                  <button key={opt.key}
                    onClick={() => choose(opt.key)}
                    disabled={locked || (isChosen && !isCorrect && wrongThisRiddle === 1)}
                    aria-label={`Elegir: ${opt.label}`}
                    aria-pressed={isChosen}
                    className={`py-3 px-3 rounded-2xl font-extrabold text-sm text-center border-2 transition-all ${
                      locked
                        ? optCorrect ? "border-green-400 bg-green-50 text-green-800"
                          : isChosen && !isCorrect ? "border-amber-300 bg-amber-50 text-amber-700 opacity-70"
                          : "border-transparent bg-[#F5F3FF] text-[#9E95B7] opacity-40"
                        : isChosen && !isCorrect && wrongThisRiddle === 1
                          ? "border-amber-300 bg-amber-50 text-amber-700 opacity-60 cursor-not-allowed"
                          : "border-[#E8E5F4] bg-[#F5F3FF] text-[#1C1135] hover:border-amber-400 hover:bg-amber-50"
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom controls: hint | next */}
            <div className="flex items-center justify-between gap-3">
              {!showNextControls && hintLevel < current.hints.length ? (
                <button onClick={addHint}
                  aria-label={`Pedir pista. ${hintLevel} de ${current.hints.length} usadas`}
                  title="Escuchar pista de apoyo"
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors">
                  <HelpCircle size={13} aria-hidden="true" /> Pedir pista ({hintLevel}/{current.hints.length})
                </button>
              ) : <div />}
              {showNextControls && (
                <button onClick={next}
                  aria-label={riddle < riddles.length - 1 ? "Ir a la siguiente adivinanza" : "Ver resumen de participación"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white ml-auto transition-all" style={{ background: "#B45309" }}>
                  {riddle < riddles.length - 1 ? "Siguiente" : "Ver resultado"} <ChevronRight size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </Crd>

          {/* Status footer — no score */}
          <div className="flex justify-between mt-3 px-1 text-xs font-bold text-[#9E95B7]">
            <span>Intentos: {attempts}</span>
            <span>Pistas usadas: {hintsUsed}</span>
          </div>
        </div>
      )}
    </div>
  );
}



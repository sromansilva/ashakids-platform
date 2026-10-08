import { useState } from "react";
import { ChevronRight, ChevronLeft, Volume2, Pause, Play, RotateCcw, HelpCircle } from "lucide-react";

import { View } from "@/types/navigation";

import { Crd } from "@/components/common/Crd";







import { speakForChild } from "@/pages/padre/Sessions/speakForChild";



import { SimulatedDataLog, ExitConfirmModal } from "@/pages/padre/GamesShared";

export function MundoAshaCanciones({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [selected, setSelected] = useState<string | null>(null);
  const [simPlaying, setSimPlaying] = useState(false);
  const [events, setEvents] = useState<object[]>([]);
  const isAssigned = true;

  const rounds = [
    {
      art: "🎵🐘", title: "¿Cuál sonido es diferente?",
      instruction: "Escucha tres sonidos de animales. Uno es diferente. ¿Cuál es el intruso?",
      sounds: [
        { label: "🐘 Elefante", key: "elefante", sim: "bajo y profundo" },
        { label: "🐘 Elefante", key: "elefante2", sim: "bajo y profundo" },
        { label: "🐦 Pájaro", key: "pajaro", sim: "agudo y suave" },
      ],
      answer: "pajaro",
      hint: "Los elefantes hacen sonidos graves. Los pájaros hacen sonidos agudos.",
    },
    {
      art: "🎶🥁", title: "¿Cuál ritmo es diferente?",
      instruction: "Hay tres ritmos. Dos son iguales y uno es distinto. ¿Cuál es el diferente?",
      sounds: [
        { label: "🥁 Rápido-rápido-lento", key: "rrls", sim: "tam-tam-pam" },
        { label: "🥁 Rápido-lento-rápido", key: "rlr", sim: "tam-pam-tam" },
        { label: "🥁 Rápido-rápido-lento", key: "rrls2", sim: "tam-tam-pam" },
      ],
      answer: "rlr",
      hint: "Escucha cuándo cae el golpe lento. En dos de ellos el lento va al final.",
    },
    {
      art: "🎤🔤", title: "Escucha: /mi/ · ¿Qué vocal escuchas al final?",
      instruction: "Escucha la sílaba simulada: /mi/. ¿Qué vocal suena al final?",
      sounds: [
        { label: "🔊 Escuchar sílaba /mi/ (síntesis simulada)", key: "play-mi", sim: "/mi/" },
      ],
      answer: "i",
      hint: "La sílaba es /mi/. Mi-mi-mi… ¿qué vocal suena al final? Empieza por la M y termina en…",
    },
  ];

  const current = rounds[round];

  const start = () => {
    setPhase("playing");
    setStartTime(Date.now());
    setRound(0);
    setScore(0);
    setAttempts(0);
    setHintsUsed(0);
    setPauseCount(0);
    setSelected(null);
    setEvents([]);
  };

  const simulateSound = (key: string, label: string) => {
    setSimPlaying(true);
    speakForChild(`Simulando: ${label}`);
    setTimeout(() => setSimPlaying(false), 1500);
  };

  const choose = (key: string) => {
    setSelected(key);
    const isCorrect = key === current.answer || key === current.answer + "2";
    setAttempts(a => a + 1);
    setEvents(prev => [...prev, { round: round + 1, choice: key, correct: isCorrect, timeSeconds: Math.round((Date.now() - startTime) / 1000) }]);
    if (isCorrect) setScore(s => s + 10);
    setTimeout(() => {
      setSelected(null);
      if (round < rounds.length - 1) {
        setRound(r => r + 1);
      } else {
        setPhase("done");
      }
    }, 1200);
  };

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const dataLog = {
    sessionId: `ASHA-SIM-${Date.now().toString(36).toUpperCase()}`,
    profileId: "P-0421 (pseudonimizado)",
    activityType: "montana-musical",
    version: "v1.0-demo",
    assigned: isAssigned,
    timestamp: new Date().toISOString(),
    durationSeconds: phase === "done" ? elapsedSec : null,
    totalAttempts: attempts,
    hintsUsed,
    pauseCount,
    roundsCompleted: phase === "done" ? rounds.length : round,
    participationScore: score,
    events,
    note: "Datos simulados · No datos reales · No se captura audio real",
  };

  // PRE
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🎵</span>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Mundo 2</p>
            <h1 className="text-3xl font-black text-white">Montaña Musical</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#0D9488", color: "white" }}>✓ Asignada por terapeuta</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>⏱ ~5 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Crd className="p-5">
          <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Objetivo informado por el terapeuta</h2>
          <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-4">
            Practicar discriminación auditiva: identificar sonidos, ritmos y vocales diferentes. Actividad de 3 rondas sin grabación de audio real.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🎧", label: "3 rondas · discriminación auditiva simulada" },
              { icon: "⏱", label: "Duración estimada: 5 minutos" },
              { icon: "🔇", label: "No se graba audio · solo interacción con botones" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              🔒 Privacidad: La simulación de sonidos utiliza síntesis de voz del sistema, no se almacena audio. Esta actividad no requiere micrófono.
            </p>
          </div>
        </Crd>
        <button onClick={start} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          <Play size={16} /> Iniciar actividad
        </button>
      </div>
    </div>
  );

  // EXIT CONFIRM
  if (phase === "exit-confirm") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />
    </div>
  );

  // DONE
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">¡Actividad completada!</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Montaña Musical · 3 rondas</p>
        </div>
        <Crd className="p-5 mb-4">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Tu participación</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Rondas completadas", value: "3 / 3" },
              { label: "Participación", value: `${score} pts` },
              { label: "Tiempo", value: `${Math.max(1, elapsedSec)} seg` },
              { label: "Intentos", value: String(attempts) },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#F5F3FF" }}>
                <p className="font-extrabold text-[#1C1135] text-lg">{s.value}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
            <p className="text-xs font-bold text-[#5B21B6] leading-snug">
              ✅ Participación registrada. El análisis de progreso corresponde al terapeuta.
            </p>
          </div>
        </Crd>
        <SimulatedDataLog log={dataLog} />
        <div className="flex gap-3 mt-5">
          <button onClick={start} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-all bg-white">
            <RotateCcw size={15} /> Repetir
          </button>
          <button onClick={() => go("mundo-asha")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            Volver al mapa <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  // PLAYING / PAUSED
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
            aria-label="Salir de la actividad" title="Salir de la actividad"
            className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Salir
          </button>
          <div className="flex items-center gap-2">
            {rounds.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < round ? "white" : i === round ? "#C4B5FD" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-violet-300 ml-1">Ronda {round + 1}/{rounds.length}</span>
          </div>
          <button
            onClick={() => { if (phase === "playing") { setPauseCount(p => p + 1); setPhase("paused"); } else setPhase("playing"); }}
            aria-label={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            title={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            className="p-2 rounded-xl text-violet-300 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {phase === "paused" && (
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Continúa cuando estés listo.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("playing")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#7C3AED" }}>
              <Play size={15} /> Continuar
            </button>
            <button onClick={() => go("mundo-asha")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF]">
              Salir
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <Crd className="p-5 mb-4">
            <div className="text-center mb-5">
              <div className="text-6xl mb-3">{current.art}</div>
              <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">{current.title}</h3>
              <p className="text-sm text-[#4B4869] font-medium leading-relaxed">{current.instruction}</p>
            </div>

            {/* Listen / repeat-sound buttons */}
            <div className="flex flex-col gap-3 mb-4">
              {current.sounds.map((sound) => (
                <button key={sound.key}
                  onClick={() => { simulateSound(sound.key, sound.label); speakForChild(sound.sim); }}
                  aria-label={`Escuchar: ${sound.label}. Síntesis simulada, no se graba audio.`}
                  title="Síntesis de voz simulada · No se graba audio"
                  className="flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-bold border-2 border-[#E8E5F4] hover:border-violet-300 hover:bg-violet-50 transition-all bg-white text-[#4B4869]">
                  <Volume2 size={15} className="text-violet-500 flex-shrink-0" aria-hidden="true" />
                  {sound.label}
                  <span className="ml-auto text-xs text-[#9E95B7] italic">{sound.sim}</span>
                </button>
              ))}
            </div>

            {/* Choice options — for round 3 (vocal ID) show /a/ /e/ /i/ instead of sound list */}
            {round === 2 ? (
              <>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Elige la vocal que escuchas</p>
                <div className="flex gap-3">
                  {[
                    { key: "a", label: "/a/" },
                    { key: "e", label: "/e/" },
                    { key: "i", label: "/i/" },
                  ].map((opt) => {
                    const isCorrect = opt.key === current.answer;
                    const isChosen = selected === opt.key;
                    const showFeedback = selected !== null;
                    return (
                      <button key={opt.key}
                        onClick={() => !selected && choose(opt.key)}
                        disabled={!!selected}
                        aria-label={`Elegir vocal ${opt.label}`}
                        className={`flex-1 py-4 rounded-2xl font-black text-2xl border-2 transition-all ${
                          showFeedback
                            ? isCorrect ? "border-green-400 bg-green-50 text-green-700" : isChosen ? "border-red-300 bg-red-50 text-red-600" : "border-transparent bg-[#F5F3FF] text-[#9E95B7] opacity-50"
                            : "border-[#E8E5F4] bg-[#F5F3FF] text-[#1C1135] hover:border-violet-400 hover:bg-violet-50"
                        }`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#9E95B7] font-medium mt-2 text-center italic">
                  Síntesis de voz simulada · No se graba audio real
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">¿Cuál es diferente?</p>
                <div className="flex flex-col gap-2">
                  {current.sounds.map((sound) => {
                    const isCorrect = sound.key === current.answer || sound.key === current.answer + "2";
                    const isSelected = selected === sound.key;
                    const showFeedback = selected !== null;
                    return (
                      <button key={`choice-${sound.key}`}
                        onClick={() => !selected && choose(sound.key)}
                        disabled={!!selected}
                        aria-label={`Elegir: ${sound.label}`}
                        className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm border-2 transition-all text-left ${
                          showFeedback
                            ? isCorrect ? "border-green-400 bg-green-50 text-green-800" : isSelected ? "border-red-300 bg-red-50 text-red-700" : "border-transparent bg-[#F5F3FF] text-[#9E95B7]"
                            : "border-transparent bg-[#F5F3FF] text-[#1C1135] hover:border-violet-300 hover:bg-violet-50"
                        }`}>
                        {showFeedback && isCorrect ? "✅ " : showFeedback && isSelected ? "❌ " : ""}{sound.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button onClick={() => { setHintsUsed(h => h + 1); speakForChild(current.hint); }}
              aria-label={`Pedir pista. ${hintsUsed} pistas usadas`}
              title="Escuchar pista en voz alta"
              className="flex items-center gap-1.5 text-xs font-bold text-[#9E95B7] hover:text-[#1C1135] transition-colors mt-4">
              <HelpCircle size={13} aria-hidden="true" /> Pedir pista ({hintsUsed} usadas)
            </button>
          </Crd>
        </div>
      )}
    </div>
  );
}



import { useEffect, useRef, useState } from "react";
import {
  Star, ChevronRight, ChevronLeft, ArrowRight, Check, X, Plus, Search, Download,
  Video, Clock, Mic, MicOff, VideoOff, PhoneOff, MessageCircle, Sparkles,
  Users, PlayCircle, BookOpen, Activity, Globe, Phone, CheckCircle, Calendar, Volume2,
  Pause, Play, RotateCcw, HelpCircle, Flag, FileText, BarChart2, Shield, Database,
} from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, StatCard, Skeleton, EmptyState, AshiMsg, Isotipo } from "@/components/shared";
import { speakForChild, normalizeVoiceText, Ashi, MundoAshaHome } from "./Sessions";
import { SimulatedDataLog, ExitConfirmModal, type VoiceRecognition, Confetti } from "./GamesShared";

export function MundoAshaLaberinto({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [stage, setStage] = useState(0);
  const [repeats, setRepeats] = useState<number[]>([0, 0, 0]);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [simPlaying, setSimPlaying] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isRepeat, setIsRepeat] = useState(false);
  const isAssigned = true;
  const MAX_STARS = 20;

  const stages = [
    {
      id: 0,
      fragment: "El perro de Roque no tiene rabo",
      fullText: "El perro de Roque no tiene rabo",
      question: "¿Qué no tiene el perro de Roque?",
      options: [
        { key: "rabo",   label: "Rabo" },
        { key: "nombre", label: "Nombre" },
        { key: "casa",   label: "Casa" },
      ],
      answer: "rabo",
      hint: "Escucha la última palabra del trabalenguas: «no tiene…»",
      emoji: "🐶",
    },
    {
      id: 1,
      fragment: "porque Ramón Ramírez se lo ha robado",
      fullText: "porque Ramón Ramírez se lo ha robado",
      question: "¿Quién le robó el rabo al perro?",
      options: [
        { key: "ramon",  label: "Ramón Ramírez" },
        { key: "roque",  label: "Roque" },
        { key: "nadie",  label: "Nadie" },
      ],
      answer: "ramon",
      hint: "¿Recuerdas qué nombre empieza con R en el trabalenguas?",
      emoji: "🦹",
    },
    {
      id: 2,
      fragment: "El perro de Roque no tiene rabo porque Ramón Ramírez se lo ha robado",
      fullText: "El perro de Roque no tiene rabo porque Ramón Ramírez se lo ha robado",
      question: "¿Cuántas veces aparece la letra R en el trabalenguas completo?",
      options: [
        { key: "4", label: "4 veces" },
        { key: "7", label: "7 veces" },
        { key: "10", label: "10 veces" },
      ],
      answer: "7",
      hint: "Roque, Ramón, Ramírez, rabo, robado… cuenta las R mayúsculas y minúsculas.",
      emoji: "🌀",
    },
  ];

  const cur = stages[stage];
  const elapsedSec = Math.round((Date.now() - startTime) / 1000);

  const fmtDur = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")} min`;

  const start = () => {
    setPhase("playing");
    setStage(0);
    setRepeats([0, 0, 0]);
    setAttempts(0);
    setCorrect(0);
    setSelected(null);
    setStartTime(Date.now());
  };

  const playFragment = (text: string) => {
    setSimPlaying(true);
    speakForChild(text);
    setTimeout(() => setSimPlaying(false), 2000);
    setRepeats(prev => { const n = [...prev]; n[stage] = (n[stage] || 0) + 1; return n; });
  };

  const choose = (key: string) => {
    if (selected) return;
    setSelected(key);
    const ok = key === cur.answer;
    setAttempts(a => a + 1);
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => {
      setSelected(null);
      if (stage < stages.length - 1) setStage(s => s + 1);
      else setPhase("done");
    }, 1300);
  };

  const pct = attempts > 0 ? Math.round((correct / stages.length) * 100) : 0;
  const starsEarned = isRepeat ? 0 : (pct >= 90 ? MAX_STARS : pct >= 70 ? Math.round(MAX_STARS * 0.75) : Math.round(MAX_STARS * 0.5));

  // ── PRE ──
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F0FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🌀</span>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Laberinto de Trabalenguas</p>
            <h1 className="text-3xl font-black text-white">Trabalenguas nivel 2</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              {isAssigned && <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#059669", color: "white" }}>⭐ Asignada por tu terapeuta</span>}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>⏱ ~5 min</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>⭐ Máx. {MAX_STARS}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Crd className="p-5">
          <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Tu misión en el laberinto</h2>
          <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-4">
            Recorre el laberinto de palabras por etapas. Escucha cada fragmento, repítelo y responde la pregunta para avanzar. ¡3 etapas te separan de la salida!
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🎧", label: "Escucha el fragmento usando síntesis de voz" },
              { icon: "🗣️", label: "Repite el trabalenguas en voz alta" },
              { icon: "❓", label: "Responde la pregunta para avanzar a la siguiente etapa" },
              { icon: "🔇", label: "No se graba audio · solo interacción con botones" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              🔒 Privacidad: La síntesis de voz es local. No se graba ni almacena audio.
            </p>
          </div>
        </Crd>
        <button onClick={start} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)" }}>
          <Play size={16} /> Entrar al laberinto
        </button>
      </div>
    </div>
  );

  // ── DONE ──
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F0FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="text-center px-6 pt-8 pb-5" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-xl font-black text-white mb-1">¡Actividad completada!</h2>
        <p className="text-white/80 text-sm font-medium">Trabalenguas nivel 2 · Laberinto de Trabalenguas</p>
      </div>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Stars */}
        <div className={`rounded-2xl text-center py-5 border-2 ${isRepeat ? "border-gray-200 bg-gray-50" : "border-yellow-300 bg-amber-50"}`}>
          {isRepeat ? (
            <>
              <p className="text-3xl font-black text-gray-400">+0 ⭐</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Recompensa obtenida anteriormente. Tu nuevo resultado sí quedó registrado.</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-1">⭐</p>
              <p className="text-3xl font-black" style={{ color: "#D97706" }}>+{starsEarned} estrellas</p>
              <p className="text-xs font-bold text-amber-700 mt-1">¡Primera finalización!</p>
            </>
          )}
        </div>

        {/* Stats */}
        <Crd className="p-5">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Tu participación</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { icon: "🌀", label: "Etapas completadas", val: `${stages.length} de ${stages.length}` },
              { icon: "✅", label: "Respuestas correctas", val: String(correct) },
              { icon: "❌", label: "Errores", val: String(stages.length - correct) },
              { icon: "⏱️", label: "Duración", val: fmtDur(elapsedSec) },
              { icon: "🔁", label: "Escuchas totales", val: repeats.reduce((a, b) => a + b, 0).toString() },
              { icon: "🎯", label: "Resultado", val: `${pct} %` },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#F5F3FF" }}>
                <p className="text-xl mb-0.5">{s.icon}</p>
                <p className="font-extrabold text-[#1C1135] text-lg">{s.val}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Feedback message */}
          <div className="rounded-xl p-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
            <p className="text-sm font-bold text-violet-800 leading-relaxed">
              {pct >= 90
                ? "¡Encontraste la salida del laberinto! Completaste el trabalenguas con gran esfuerzo."
                : pct >= 70
                  ? "¡Ya casi llegas a la salida! Repite lentamente cada fragmento y sigue avanzando."
                  : "¡Buen intento! Los trabalenguas se dominan paso a paso. Puedes escucharlo y practicar nuevamente."}
            </p>
          </div>
        </Crd>

        {/* Disclaimer */}
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
          <p className="text-[10px] text-amber-700 text-center">Este resumen refleja tu participación, no un resultado clínico. El análisis del avance corresponde únicamente al terapeuta.</p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setIsRepeat(true); start(); }}
              className="py-3 rounded-2xl font-extrabold text-white text-sm" style={{ background: "#7C3AED" }}>
              Volver a jugar
            </button>
            <button onClick={() => go("mundo-asha")}
              className="py-3 rounded-2xl font-bold text-sm border-2 border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
              Elegir otra
            </button>
          </div>
          <button onClick={() => go("mundo-asha")}
            className="w-full py-2.5 rounded-2xl font-bold text-sm border border-[#E8E5F4] text-[#9E95B7] hover:bg-gray-50">
            Volver al mapa
          </button>
        </div>
      </div>
    </div>
  );

  // ── PLAYING ──
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F0FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Topbar */}
      <div className="relative px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => setPhase("pre")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Salir
          </button>
          {/* Stage dots */}
          <div className="flex items-center gap-2">
            {stages.map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: i < stage ? "white" : i === stage ? "#C4B5FD" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-violet-300 ml-1">Etapa {stage + 1}/{stages.length}</span>
          </div>
          <button onClick={() => setPhase(phase === "paused" ? "playing" : "paused")}
            className="p-2 rounded-xl text-violet-300 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {phase === "paused" ? (
        <div className="max-w-xl mx-auto px-4 py-10 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] mb-5">Continúa cuando estés listo.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("playing")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#7C3AED" }}>
              <Play size={15} /> Continuar
            </button>
            <button onClick={() => go("mundo-asha")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF]">
              Salir
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-4 py-6">
          <Crd className="p-5 mb-4">
            {/* Fragment display */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{cur.emoji}</div>
              <p className="text-xs font-extrabold text-violet-500 uppercase tracking-wide mb-2">Etapa {stage + 1} de {stages.length}</p>
              <div className="rounded-2xl px-5 py-4 mb-3" style={{ background: "#EDE9FE" }}>
                <p className="text-xl font-extrabold text-[#1C1135] leading-relaxed">{cur.fragment}</p>
              </div>
              <p className="text-xs text-[#9E95B7]">Escuchas de este fragmento: {repeats[stage]}</p>
            </div>

            {/* Listen button */}
            <button
              onClick={() => playFragment(cur.fullText)}
              disabled={simPlaying}
              aria-label="Escuchar fragmento en síntesis de voz"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm border-2 mb-4 transition-all ${simPlaying ? "border-violet-300 bg-violet-100 text-violet-600" : "border-violet-300 bg-white text-violet-700 hover:bg-violet-50"}`}>
              <Volume2 size={16} aria-hidden />
              {simPlaying ? "Reproduciendo…" : "🎧 Escuchar fragmento"}
              <span className="ml-auto text-[10px] font-normal text-violet-400">síntesis simulada</span>
            </button>

            {/* Question */}
            <p className="text-sm font-extrabold text-[#1C1135] mb-3">{cur.question}</p>
            <div className="flex flex-col gap-2 mb-4">
              {cur.options.map(opt => {
                const isCorrect = opt.key === cur.answer;
                const isChosen = selected === opt.key;
                const showFb = selected !== null;
                return (
                  <button key={opt.key}
                    onClick={() => !selected && choose(opt.key)}
                    disabled={!!selected}
                    aria-label={`Elegir: ${opt.label}`}
                    className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm border-2 transition-all text-left ${
                      showFb
                        ? isCorrect ? "border-green-400 bg-green-50 text-green-800" : isChosen ? "border-red-300 bg-red-50 text-red-700" : "border-transparent bg-[#F5F3FF] text-[#9E95B7] opacity-60"
                        : "border-[#E8E5F4] bg-[#F5F3FF] text-[#1C1135] hover:border-violet-400 hover:bg-violet-50"
                    }`}>
                    {showFb && isCorrect ? "✅ " : showFb && isChosen ? "❌ " : ""}{opt.label}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <button onClick={() => speakForChild(cur.hint)}
              aria-label="Escuchar pista"
              className="flex items-center gap-1.5 text-xs font-bold text-[#9E95B7] hover:text-violet-700 transition-colors">
              <HelpCircle size={13} aria-hidden /> Pedir pista
            </button>
          </Crd>
        </div>
      )}
    </div>
  );
}



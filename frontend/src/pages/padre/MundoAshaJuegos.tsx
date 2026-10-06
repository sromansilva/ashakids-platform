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

export function MundoAshaJuegos({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  type GameId = 1 | 2 | 3;
  type Diff = "basic" | "medium";
  type GMode = "single" | "circuit";

  const sessionId = useRef("LAB-" + Math.random().toString(36).slice(2, 6).toUpperCase());

  const [phase, setPhase]           = useState<Phase>("pre");
  const [savedPhase, setSavedPhase] = useState<Phase>("playing");
  const [difficulty, setDifficulty] = useState<Diff>("basic");
  const [gameMode, setGameMode]     = useState<GMode>("circuit");
  const [selectedGame, setSelectedGame] = useState<GameId>(1);
  const [circuitStep, setCircuitStep]   = useState(0);
  const [round, setRound]               = useState(0);
  const [wrongThisRound, setWrongThisRound] = useState(0);
  const [revealedThis, setRevealedThis]     = useState(false);
  const [lastChoice, setLastChoice]         = useState<string | null>(null);
  const [g3Phase, setG3Phase] = useState<"showing" | "recalling">("showing");
  const [showIdx, setShowIdx] = useState(0);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [helps, setHelps]           = useState(0);
  const [pauses, setPauses]         = useState(0);
  const [attempts, setAttempts]     = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);

  const C = { blue: "#0284C7", blueBg: "#E0F2FE", blueBorder: "#7DD3FC" };

  type G1Round = { word: string; options: string[]; answer: string };
  type G2Round = { item: string; emoji: string; answer: string; cats: string[] };

  const G1: Record<Diff, G1Round[]> = {
    basic: [
      { word: "PERRO",   options: ["🐶","🐱","🐟","🐸"],  answer: "🐶" },
      { word: "MANZANA", options: ["🍊","🍎","🍇","🍌"],  answer: "🍎" },
      { word: "CASA",    options: ["🏠","🚗","⛵","✈️"], answer: "🏠" },
    ],
    medium: [
      { word: "MARIPOSA",   options: ["🦋","🐝","🐛","🐞"], answer: "🦋" },
      { word: "TELESCOPIO", options: ["🔭","🔬","📡","🎯"], answer: "🔭" },
      { word: "GUITARRA",   options: ["🎸","🎹","🎺","🥁"], answer: "🎸" },
    ],
  };

  const G2: Record<Diff, G2Round[]> = {
    basic: [
      { item: "Perro",   emoji: "🐶", answer: "Animales", cats: ["Animales","Frutas","Objetos"] },
      { item: "Manzana", emoji: "🍎", answer: "Frutas",   cats: ["Animales","Frutas","Objetos"] },
      { item: "Silla",   emoji: "🪑", answer: "Objetos",  cats: ["Animales","Frutas","Objetos"] },
    ],
    medium: [
      { item: "Mariposa", emoji: "🦋", answer: "Animales",  cats: ["Animales","Plantas","Vehículos"] },
      { item: "Girasol",  emoji: "🌻", answer: "Plantas",   cats: ["Animales","Plantas","Vehículos"] },
      { item: "Tren",     emoji: "🚂", answer: "Vehículos", cats: ["Animales","Plantas","Vehículos"] },
    ],
  };

  const G3: Record<Diff, string[][]> = {
    basic:  [["🐶","🍎","🏠"], ["🚂","🌸","🎈"], ["🦁","🍌","⭐"]],
    medium: [["🦋","🎸","🌊"], ["🔭","🐬","🎃"], ["🌻","🚂","🎯"]],
  };
  const G3_SCRAMBLES = [[2,0,1],[1,2,0],[0,2,1]];

  const activeGame: GameId = gameMode === "circuit" ? ([1,2,3][circuitStep] as GameId) : selectedGame;

  useEffect(() => {
    if (phase !== "playing") return;
    const iv = window.setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => window.clearInterval(iv);
  }, [phase]);

  const fmtTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const resetRound = () => {
    setWrongThisRound(0); setRevealedThis(false); setLastChoice(null);
    setG3Phase("showing"); setShowIdx(0); setUserSeq([]); setHintShown(false);
  };

  const advanceRound = () => {
    const next = round + 1;
    if (next >= 3) {
      setGamesCompleted(n => n + 1);
      if (gameMode === "circuit" && circuitStep < 2) { setCircuitStep(s => s + 1); setRound(0); }
      else { setPhase("done"); }
    } else { setRound(next); }
    resetRound();
  };

  const doPause = () => { setSavedPhase(phase); setPhase("paused"); setPauses(p => p + 1); };
  const doHelp  = (text: string) => { speakForChild(text); setHelps(h => h + 1); };

  const buildLog = (completed: boolean) => ({
    schema: "v0.3-demo", sessionId: sessionId.current,
    game: "Laboratorio de Juegos", version: "v85",
    mode: "exploracion", difficulty, gameMode,
    timestamp: new Date().toISOString(),
    n1: { totalElapsedSec: elapsedSec, pauses, abandoned: !completed },
    n2: { gamesCompleted, totalAttempts: attempts, helps, completed },
    n3Eligible: false, mlNote: "Machine learning futuro · No activo en esta demo",
  });

  const catIcon = (cat: string) =>
    cat === "Animales" ? "🐾" : cat === "Frutas" ? "🍏" : cat === "Objetos" ? "🪑" :
    cat === "Plantas" ? "🌿" : cat === "Vehículos" ? "🚗" : "📦";

  const nextLabel = round < 2 ? "Siguiente ronda →"
    : (gameMode === "circuit" && circuitStep < 2) ? "Siguiente juego →" : "Ver resumen 🎉";

  // Inline control bar (stateless, defined before conditional returns)
  const CtrlBar = ({ helpText }: { helpText: string }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {gameMode === "circuit" && (
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-6 h-2 rounded-full transition-all" style={{ background: i < circuitStep ? "#0284C7" : i === circuitStep ? "#0EA5E9" : "#BFDBFE" }} />
            ))}
          </div>
        )}
        <span className="text-xs font-extrabold" style={{ color: C.blue }}>Ronda {round+1}/3</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => doHelp(helpText)} className="rounded-xl p-2 border bg-white hover:bg-blue-50 transition-colors" style={{ borderColor: C.blueBorder }} aria-label="Escuchar las instrucciones" title="Escuchar instrucciones"><Volume2 size={15} style={{ color: C.blue }} /></button>
        <button onClick={doPause} className="rounded-xl p-2 border bg-white hover:bg-blue-50 transition-colors" style={{ borderColor: C.blueBorder }} aria-label="Pausar la actividad" title="Pausar"><Pause size={15} style={{ color: C.blue }} /></button>
        <button onClick={() => { setSavedPhase(phase); setPhase("exit-confirm"); }} className="rounded-xl p-2 border bg-white hover:bg-blue-50 transition-colors" style={{ borderColor: C.blueBorder }} aria-label="Salir de la actividad" title="Salir"><X size={15} style={{ color: C.blue }} /></button>
      </div>
    </div>
  );

  const wrapStyle = { background: "linear-gradient(180deg, #EFF6FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' };

  // ── PRE ─────────────────────────────────────────────────────────────────────
  if (phase === "pre") {
    const opts: { id: GameId | "circuit"; label: string; emoji: string; desc: string }[] = [
      { id: 1,         label: "Asociación",    emoji: "🔤", desc: "Palabra ↔ imagen" },
      { id: 2,         label: "Clasificación", emoji: "🏷️",  desc: "Categorías semánticas" },
      { id: 3,         label: "Memoria",       emoji: "🧠", desc: "Secuencia visual" },
      { id: "circuit", label: "Circuito",      emoji: "⚡", desc: "Los tres juegos en orden" },
    ];
    return (
      <div className="min-h-screen" style={wrapStyle}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          <button onClick={() => go("mundo-asha")} className="self-start flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80" style={{ color: C.blue }} aria-label="Volver al mapa del mundo">
            <ChevronLeft size={16} /> Mapa del Mundo
          </button>
          <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #0369A1 100%)` }}>
            <Ashi size={80} mood="happy" />
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mt-2">Mundo 5 · Laboratorio de Juegos</p>
            <h1 className="text-2xl font-black text-white mt-1">¡A explorar con las palabras!</h1>
          </div>
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <span>🔬</span>
            <div>
              <p className="text-xs font-extrabold text-[#92400E]">Machine learning futuro · No activo en esta demo</p>
              <p className="text-xs font-medium text-[#B45309] mt-0.5">Datos simulados · Prototipo de instrumentación · v0.3-demo</p>
            </div>
          </div>
          {/* Difficulty */}
          <div>
            <p className="text-sm font-extrabold text-[#1C1135] mb-2">Dificultad demo</p>
            <p className="text-xs font-medium text-[#9E95B7] mb-2">Elegida manualmente · sin adaptación automática</p>
            <div className="flex gap-2">
              {(["basic","medium"] as Diff[]).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="flex-1 rounded-2xl py-3 text-sm font-extrabold border-2 transition-all"
                  style={{ background: difficulty === d ? C.blue : "white", borderColor: difficulty === d ? C.blue : C.blueBorder, color: difficulty === d ? "white" : "#1C1135" }}
                  aria-pressed={difficulty === d} aria-label={`Dificultad ${d === "basic" ? "básica" : "media"}`}>
                  {d === "basic" ? "🌱 Básica" : "🚀 Media"}
                </button>
              ))}
            </div>
          </div>
          {/* Game selection */}
          <div>
            <p className="text-sm font-extrabold text-[#1C1135] mb-2">Elige la actividad</p>
            <div className="grid grid-cols-2 gap-3">
              {opts.map(opt => {
                const isCircuit = opt.id === "circuit";
                const isSel = isCircuit ? gameMode === "circuit" : (gameMode === "single" && selectedGame === opt.id);
                return (
                  <button key={String(opt.id)}
                    onClick={() => { if (isCircuit) setGameMode("circuit"); else { setGameMode("single"); setSelectedGame(opt.id as GameId); } }}
                    className="rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-0.5"
                    style={{ background: isSel ? C.blueBg : "white", borderColor: isSel ? C.blue : C.blueBorder }}
                    aria-pressed={isSel} aria-label={`Elegir actividad: ${opt.label}`}>
                    <span className="text-3xl">{opt.emoji}</span>
                    <p className="font-extrabold text-[#1C1135] mt-1 text-sm">{opt.label}</p>
                    <p className="text-xs font-medium text-[#7C6F9A]">{opt.desc}</p>
                    {isCircuit && <span className="text-xs font-bold px-1.5 py-0.5 rounded-md mt-1.5 inline-block text-white" style={{ background: C.blue }}>Recomendado</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => { setRound(0); setCircuitStep(0); setGamesCompleted(0); setAttempts(0); setHelps(0); setPauses(0); setElapsedSec(0); resetRound(); setPhase("playing"); speakForChild("¡Comenzamos el laboratorio! Vamos a jugar."); }}
            className="w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:-translate-y-0.5"
            style={{ background: C.blue }} aria-label="Comenzar el laboratorio de juegos">
            ¡Comenzar! 🧪
          </button>
          <SimulatedDataLog log={buildLog(false)} />
        </div>
      </div>
    );
  }

  // ── EXIT CONFIRM ─────────────────────────────────────────────────────────────
  if (phase === "exit-confirm") {
    return <ExitConfirmModal onStay={() => setPhase(savedPhase)} onExit={() => go("mundo-asha")} />;
  }

  // ── PAUSED ───────────────────────────────────────────────────────────────────
  if (phase === "paused") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={wrapStyle}>
        <Ashi size={90} mood="wave" />
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: C.blue }}>Laboratorio en pausa</p>
          <h2 className="text-2xl font-black text-[#1C1135]">¡El juego te espera!</h2>
          <p className="text-sm font-medium text-[#7C6F9A] mt-1">Pulsa Reanudar cuando quieras continuar.</p>
        </div>
        <button onClick={() => setPhase(savedPhase)} className="rounded-2xl px-8 py-3 text-base font-black text-white flex items-center gap-2" style={{ background: C.blue }} aria-label="Reanudar la actividad">
          <Play size={16} /> Reanudar
        </button>
        <button onClick={() => setPhase("exit-confirm")} className="text-sm font-bold text-[#9E95B7] hover:text-[#0284C7] transition-colors" aria-label="Salir sin completar">
          Salir sin completar
        </button>
      </div>
    );
  }

  // ── PLAYING ──────────────────────────────────────────────────────────────────
  if (phase === "playing") {

    // ── G1: Asociación palabra–imagen ─────────────────────────────────────────
    if (activeGame === 1) {
      const r = G1[difficulty][round];
      const isCorrect = lastChoice === r.answer;
      const showNext  = isCorrect || wrongThisRound >= 2 || revealedThis;
      return (
        <div className="min-h-screen" style={wrapStyle}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <CtrlBar helpText={`Busca la imagen que corresponde a la palabra: ${r.word.toLowerCase()}`} />
            <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🔤 Asociación · Ronda {round+1}/3</p>
              <p className="text-5xl font-black text-[#1C1135] mb-1 tracking-wide">{r.word}</p>
              <p className="text-sm font-medium text-[#7C6F9A]">Elige la imagen que corresponde a esta palabra.</p>
              <button onClick={() => doHelp(`La palabra es ${r.word.toLowerCase()}`)} className="mt-2 text-xs font-bold hover:underline" style={{ color: C.blue }} aria-label="Escuchar la palabra" title="Escuchar">🔊 Escuchar</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {r.options.map(opt => {
                const chosen = lastChoice === opt;
                const correct = opt === r.answer;
                const highlight = (chosen && isCorrect) || (revealedThis && correct);
                return (
                  <button key={opt}
                    onClick={() => {
                      if (showNext) return;
                      setAttempts(a => a + 1);
                      setLastChoice(opt);
                      if (opt !== r.answer) { setWrongThisRound(w => w + 1); speakForChild("No es esa. Inténtalo una vez más."); }
                      else speakForChild("¡Muy bien! Correcto.");
                    }}
                    className="rounded-3xl py-8 text-6xl text-center border-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: highlight ? "#DCFCE7" : (chosen && !isCorrect ? "#FEF3C7" : "white"), borderColor: highlight ? "#16A34A" : (chosen && !isCorrect ? "#FCD34D" : C.blueBorder) }}
                    aria-label={`Elegir imagen: ${opt}`}>
                    {opt}
                    {highlight && <span className="block text-xs font-black text-green-700 mt-1">✓</span>}
                  </button>
                );
              })}
            </div>
            {lastChoice && isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#DCFCE7" }}>
                <p className="text-sm font-extrabold text-green-700">🌟 ¡Muy bien!</p>
              </div>
            )}
            {lastChoice && !isCorrect && wrongThisRound === 1 && !revealedThis && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FEF3C7" }}>
                <p className="text-sm font-extrabold text-[#B45309]">😊 No es esa. ¡Inténtalo una vez más!</p>
                <button onClick={() => { setRevealedThis(true); setHelps(h => h + 1); speakForChild("La respuesta es " + r.word.toLowerCase()); }} className="text-xs font-bold underline mt-1" style={{ color: "#B45309" }} aria-label="Ver la respuesta correcta">Ver respuesta</button>
              </div>
            )}
            {!isCorrect && (wrongThisRound >= 2 || revealedThis) && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#F0FDF4" }}>
                <p className="text-sm font-bold text-green-700">La respuesta era: {r.answer} ({r.word.toLowerCase()})</p>
              </div>
            )}
            {showNext && (
              <button onClick={advanceRound} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label={nextLabel}>
                {nextLabel}
              </button>
            )}
            <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
          </div>
        </div>
      );
    }

    // ── G2: Clasificación semántica ───────────────────────────────────────────
    if (activeGame === 2) {
      const r = G2[difficulty][round];
      const isCorrect = lastChoice === r.answer;
      const showNext  = isCorrect || wrongThisRound >= 2 || revealedThis;
      return (
        <div className="min-h-screen" style={wrapStyle}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <CtrlBar helpText={`¿En qué categoría va ${r.item}? Elige la categoría correcta.`} />
            <div className="rounded-3xl p-6 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🏷️ Clasificación · Ronda {round+1}/3</p>
              <span className="text-8xl">{r.emoji}</span>
              <h2 className="text-2xl font-black text-[#1C1135] mt-2">{r.item}</h2>
              <p className="text-sm font-medium text-[#7C6F9A] mt-1">¿A qué categoría pertenece?</p>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {r.cats.map(cat => {
                const chosen = lastChoice === cat;
                const correct = cat === r.answer;
                const highlight = (chosen && isCorrect) || (revealedThis && correct);
                return (
                  <button key={cat}
                    onClick={() => {
                      if (showNext) return;
                      setAttempts(a => a + 1);
                      setLastChoice(cat);
                      if (cat !== r.answer) { setWrongThisRound(w => w + 1); speakForChild("No es esa categoría. Inténtalo una vez más."); }
                      else speakForChild("¡Correcto! " + r.item + " es " + r.answer + ".");
                    }}
                    className="rounded-2xl py-4 px-5 text-base font-extrabold border-2 text-left flex items-center gap-3 transition-all hover:-translate-y-0.5"
                    style={{ background: highlight ? "#DCFCE7" : (chosen && !isCorrect ? "#FEF3C7" : "white"), borderColor: highlight ? "#16A34A" : (chosen && !isCorrect ? "#FCD34D" : C.blueBorder), color: "#1C1135" }}
                    aria-label={`Clasificar como: ${cat}`}>
                    <span className="text-2xl">{catIcon(cat)}</span>
                    {cat}{highlight ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
            {lastChoice && isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#DCFCE7" }}>
                <p className="text-sm font-extrabold text-green-700">🌟 ¡Muy bien! {r.item} es {r.answer}.</p>
              </div>
            )}
            {lastChoice && !isCorrect && wrongThisRound === 1 && !revealedThis && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FEF3C7" }}>
                <p className="text-sm font-extrabold text-[#B45309]">😊 No es esa categoría. ¡Inténtalo una vez más!</p>
                <button onClick={() => { setRevealedThis(true); setHelps(h => h + 1); speakForChild(r.item + " pertenece a " + r.answer); }} className="text-xs font-bold underline mt-1" style={{ color: "#B45309" }} aria-label="Ver la respuesta correcta">Ver respuesta</button>
              </div>
            )}
            {!isCorrect && (wrongThisRound >= 2 || revealedThis) && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#F0FDF4" }}>
                <p className="text-sm font-bold text-green-700">{r.item} pertenece a: {r.answer}</p>
              </div>
            )}
            {showNext && (
              <button onClick={advanceRound} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label={nextLabel}>
                {nextLabel}
              </button>
            )}
            <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
          </div>
        </div>
      );
    }

    // ── G3: Secuencia de memoria ──────────────────────────────────────────────
    if (activeGame === 3) {
      const seq      = G3[difficulty][round];
      const scramble = G3_SCRAMBLES[round];
      const isComplete = userSeq.length === seq.length;
      const isCorrect  = isComplete && userSeq.every((v, i) => v === i);

      // Showing phase
      if (g3Phase === "showing") {
        return (
          <div className="min-h-screen" style={wrapStyle}>
            <div className="max-w-2xl mx-auto px-4 py-6">
              <CtrlBar helpText="Memoriza los elementos que aparecen en pantalla, uno a uno." />
              <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🧠 Memoria · Ronda {round+1}/3</p>
                <h2 className="text-xl font-black text-[#1C1135] mb-1">¡Memoriza la secuencia!</h2>
                <p className="text-sm font-medium text-[#7C6F9A]">Mira cada elemento con calma.</p>
              </div>
              <div className="rounded-3xl bg-white border-2 p-10 mb-5 text-center" style={{ borderColor: C.blueBorder }}>
                <p className="text-xs font-black uppercase tracking-widest text-[#9E95B7] mb-3">Elemento {showIdx+1} de {seq.length}</p>
                <span className="text-9xl">{seq[showIdx]}</span>
                <div className="flex gap-2 justify-center mt-5">
                  {seq.map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full transition-all" style={{ background: i <= showIdx ? C.blue : "#BFDBFE" }} />
                  ))}
                </div>
              </div>
              {showIdx < seq.length - 1 ? (
                <button onClick={() => setShowIdx(i => i + 1)} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label="Ver el siguiente elemento de la secuencia">
                  Ver siguiente →
                </button>
              ) : (
                <button onClick={() => { setG3Phase("recalling"); speakForChild("Ahora reproduce la secuencia en el mismo orden."); }} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label="Pasar a reproducir la secuencia">
                  ¡Ahora a recordar! →
                </button>
              )}
              <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
            </div>
          </div>
        );
      }

      // Recalling phase
      return (
        <div className="min-h-screen" style={wrapStyle}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <CtrlBar helpText="Toca los elementos en el mismo orden en que aparecieron." />
            <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🧠 Memoria · Ronda {round+1}/3</p>
              <h2 className="text-xl font-black text-[#1C1135] mb-1">¿En qué orden aparecieron?</h2>
              <p className="text-sm font-medium text-[#7C6F9A]">Toca los elementos en el orden correcto.</p>
            </div>
            {/* Progress slots */}
            <div className="flex gap-2 justify-center mb-4">
              {seq.map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all"
                  style={{ background: i < userSeq.length ? "#DBEAFE" : "#F0F9FF", borderColor: i < userSeq.length ? C.blue : "#BFDBFE" }}>
                  {i < userSeq.length ? seq[userSeq[i]] : "?"}
                </div>
              ))}
            </div>
            {/* Scrambled options */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {scramble.map(realIdx => {
                const already = userSeq.includes(realIdx);
                return (
                  <button key={realIdx}
                    onClick={() => {
                      if (already || isComplete) return;
                      setAttempts(a => a + 1);
                      setUserSeq(s => [...s, realIdx]);
                    }}
                    disabled={already}
                    className="rounded-2xl py-8 text-5xl text-center border-2 transition-all disabled:opacity-40 hover:enabled:-translate-y-0.5"
                    style={{ background: already ? "#F0F9FF" : "white", borderColor: already ? "#BFDBFE" : C.blueBorder }}
                    aria-label={`Elegir elemento: ${seq[realIdx]}`}>
                    {seq[realIdx]}
                  </button>
                );
              })}
            </div>
            {!isComplete && (
              <div className="flex gap-2 mb-3">
                <button onClick={() => { doHelp("La secuencia era: " + seq.join(", ")); setHintShown(true); }}
                  className="flex-1 rounded-2xl py-2.5 text-sm font-bold border-2 transition-colors"
                  style={{ borderColor: C.blueBorder, color: C.blue }} aria-label="Pedir pista con la secuencia correcta">💡 Pista</button>
                {userSeq.length > 0 && (
                  <button onClick={() => setUserSeq([])}
                    className="flex-1 rounded-2xl py-2.5 text-sm font-bold border-2 transition-colors flex items-center justify-center gap-1"
                    style={{ borderColor: "#FCA5A5", color: "#DC2626" }} aria-label="Reiniciar esta ronda">
                    <RotateCcw size={13} /> Reintentar
                  </button>
                )}
              </div>
            )}
            {hintShown && !isComplete && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FFFBEB" }}>
                <p className="text-sm font-bold text-[#B45309]">Secuencia: {seq.join(" → ")}</p>
              </div>
            )}
            {isComplete && isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#DCFCE7" }}>
                <p className="text-sm font-extrabold text-green-700">🌟 ¡Perfecto! Recordaste toda la secuencia.</p>
              </div>
            )}
            {isComplete && !isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FEF3C7" }}>
                <p className="text-sm font-bold text-[#B45309]">La secuencia correcta era: {seq.join(" → ")}</p>
              </div>
            )}
            {isComplete && (
              <button onClick={advanceRound} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label={nextLabel}>
                {nextLabel}
              </button>
            )}
            <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
          </div>
        </div>
      );
    }
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const modeName = gameMode === "circuit" ? "Circuito" : activeGame === 1 ? "Asociación" : activeGame === 2 ? "Clasificación" : "Memoria";
    return (
      <div className="min-h-screen" style={wrapStyle}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #0369A1 100%)` }}>
            <Ashi size={80} mood="celebrate" />
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mt-2">¡Laboratorio completado!</p>
            <h1 className="text-2xl font-black text-white mt-1">{modeName} · ¡Terminado! 🎉</h1>
          </div>
          <div className="rounded-3xl bg-white border border-[#E8E5F4] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[#9E95B7] mb-3">Resumen de participación</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Juegos completados", value: String(gamesCompleted) },
                { label: "Intentos totales",   value: String(attempts) },
                { label: "Ayudas usadas",      value: String(helps) },
                { label: "Pausas",             value: String(pauses) },
                { label: "Tiempo total",       value: fmtTime(elapsedSec) },
                { label: "Dificultad",         value: difficulty === "basic" ? "Básica" : "Media" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-3" style={{ background: C.blueBg }}>
                  <p className="text-xs font-medium text-[#9E95B7]">{item.label}</p>
                  <p className="font-extrabold text-sm text-[#1C1135] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-[#9E95B7] mt-3">Este resumen registra la participación. No evalúa habilidades clínicas ni hace recomendaciones.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPhase("pre"); setGamesCompleted(0); setAttempts(0); setHelps(0); setPauses(0); setElapsedSec(0); setRound(0); setCircuitStep(0); resetRound(); }}
              className="w-full rounded-2xl py-3 text-base font-black border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ borderColor: C.blue, color: C.blue, background: "white" }} aria-label="Repetir el laboratorio">
              <RotateCcw size={16} /> Repetir
            </button>
            <button onClick={() => go("mundo-asha")} className="w-full rounded-2xl py-3 text-base font-black text-white transition-all hover:-translate-y-0.5" style={{ background: C.blue }} aria-label="Volver al mapa del mundo">
              Volver al mapa 🗺️
            </button>
          </div>
          <SimulatedDataLog log={buildLog(true)} />
        </div>
      </div>
    );
  }

  return null;
}



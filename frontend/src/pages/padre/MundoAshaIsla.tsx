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

export function MundoAshaIsla({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "stage1" | "stage2" | "stage3" | "word" | "done" | "paused" | "exit-confirm";

  const sessionId = useRef("ISLA-" + Math.random().toString(36).slice(2, 6).toUpperCase());
  const stageStartRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("pre");
  const [savedPhase, setSavedPhase] = useState<Phase>("stage1");
  const [protagonist, setProtagonist] = useState<{ label: string; emoji: string } | null>(null);
  const [setting, setSetting] = useState<{ label: string; emoji: string } | null>(null);
  const [action, setAction] = useState<{ label: string; emoji: string } | null>(null);
  const [sceneAssigned, setSceneAssigned] = useState<(number | null)[]>([null, null, null]);
  const [nextPos, setNextPos] = useState(1);
  const [descriptor, setDescriptor] = useState<string | null>(null);
  const [helps, setHelps] = useState(0);
  const [pauses, setPauses] = useState(0);
  const [changes, setChanges] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [stageTimes, setStageTimes] = useState<Record<string, number>>({});

  const SHUFFLE = [2, 0, 1];
  const posLabel = ["INICIO", "DESARROLLO", "FINAL"];
  const posColors = ["#0D9488", "#7C3AED", "#F97316"];
  const posEmoji = ["🌅", "⚡", "🌟"];
  const posBg = ["#CCFBF1", "#EDE9FE", "#FFF1E6"];
  const C = { pink: "#DB2777", pinkBg: "#FCE7F3", pinkBorder: "#F9A8D4" };

  const protagonists = [
    { label: "Asha", emoji: "👧" },
    { label: "Leo el León", emoji: "🦁" },
    { label: "Luna la Conejita", emoji: "🐰" },
  ];
  const settings = [
    { label: "el bosque encantado", emoji: "🌳" },
    { label: "la playa mágica", emoji: "🏖️" },
    { label: "la montaña de las nubes", emoji: "🏔️" },
  ];
  const actions = [
    { label: "encontró algo muy especial", emoji: "🔍" },
    { label: "ayudó a un amigo en apuros", emoji: "🤝" },
    { label: "descubrió su superpoder", emoji: "🌟" },
  ];
  const descriptors = ["Valiente", "Divertida", "Sorprendente", "Amistosa", "Mágica"];

  useEffect(() => {
    const active = phase === "stage1" || phase === "stage2" || phase === "stage3" || phase === "word";
    if (!active) return;
    const iv = window.setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => window.clearInterval(iv);
  }, [phase]);

  const recordStage = (key: string) => {
    const elapsed = Math.round((Date.now() - stageStartRef.current) / 1000);
    setStageTimes(t => ({ ...t, [key]: elapsed }));
    stageStartRef.current = Date.now();
  };

  const getSceneText = (realIdx: number): string => {
    const p = protagonist?.label ?? "El protagonista";
    const s = setting?.label ?? "un lugar mágico";
    const a = action?.label ?? "vivió una aventura";
    const scenes = [
      `${p} estaba en ${s} cuando todo era tranquilo y hermoso.`,
      `De repente, ${p} ${a} y algo increíble ocurrió.`,
      `Al final, ${p} sonrió feliz y regresó a casa con un gran secreto.`,
    ];
    return scenes[realIdx];
  };

  const buildStory = (): string[] => {
    const lines: string[] = ["", "", ""];
    SHUFFLE.forEach((realIdx, si) => {
      const pos = sceneAssigned[si];
      if (pos !== null) lines[pos - 1] = getSceneText(realIdx);
    });
    return lines;
  };

  const buildLog = (completed: boolean) => ({
    schema: "v0.3-demo",
    sessionId: sessionId.current,
    game: "Isla Creativa · Construye tu historia",
    version: "v84",
    mode: "exploracion",
    timestamp: new Date().toISOString(),
    n1: { totalElapsedSec: elapsedSec, pauses, abandoned: !completed, stageTimes },
    n2: {
      protagonist: protagonist?.label ?? null,
      setting: setting?.label ?? null,
      action: action?.label ?? null,
      sceneOrder: sceneAssigned,
      descriptor,
      helps,
      changes,
      completed,
    },
    n3Eligible: false,
    mlNote: "Machine learning futuro · No activo en esta demo",
  });

  const doPause = () => { setSavedPhase(phase); setPhase("paused"); setPauses(p => p + 1); };
  const doExit = () => go("mundo-asha");
  const doHelp = (text: string) => { speakForChild(text); setHelps(h => h + 1); };

  const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const ControlBar = ({ step, helpText }: { step: string; helpText: string }) => (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-extrabold" style={{ color: C.pink }}>{step}</span>
      <div className="flex gap-2">
        <button onClick={() => doHelp(helpText)} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }} aria-label="Escuchar las instrucciones" title="Escuchar instrucciones"><Volume2 size={15} style={{ color: C.pink }} /></button>
        <button onClick={doPause} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }} aria-label="Pausar la actividad" title="Pausar"><Pause size={15} style={{ color: C.pink }} /></button>
        <button onClick={() => { setSavedPhase(phase); setPhase("exit-confirm"); }} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }} aria-label="Salir de la actividad" title="Salir"><X size={15} style={{ color: C.pink }} /></button>
      </div>
    </div>
  );

  const ProgressBar = ({ pct }: { pct: number }) => (
    <div className="h-2.5 rounded-full mb-6" style={{ background: "#FCE7F3" }}>
      <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: C.pink }} />
    </div>
  );

  const StageHeader = ({ label, title, subtitle }: { label: string; title: string; subtitle: string }) => (
    <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.pinkBg, border: `2px solid ${C.pinkBorder}` }}>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.pink }}>{label}</p>
      <h2 className="text-xl font-black text-[#1C1135] mb-1">{title}</h2>
      <p className="text-sm font-medium text-[#7C6F9A]">{subtitle}</p>
    </div>
  );

  // ── PRE ──────────────────────────────────────────────────────────────────────
  if (phase === "pre") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center gap-6 text-center">
          <button onClick={() => go("mundo-asha")} className="self-start flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80" style={{ color: C.pink }} aria-label="Volver al mapa del mundo">
            <ChevronLeft size={16} /> Mapa del Mundo
          </button>
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] text-5xl" style={{ background: C.pinkBg, border: `2px solid ${C.pinkBorder}` }}>🎨</div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: C.pink }}>Mundo 4 · Isla Creativa</p>
            <h1 className="text-3xl font-black text-[#1C1135] mb-2">Construye tu historia</h1>
            <p className="text-base font-medium text-[#7C6F9A] leading-relaxed max-w-md">Elige un personaje, un escenario y una acción, ordena las escenas y elige una palabra para tu cuento.</p>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
            {[{ emoji: "🧩", label: "Personaje" }, { emoji: "🌍", label: "Escenario" }, { emoji: "🎬", label: "Escenas" }, { emoji: "✨", label: "Descriptor" }].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2" style={{ background: C.pinkBg }}>
                <span className="text-xl">{s.emoji}</span>
                <span className="text-xs font-bold" style={{ color: C.pink }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="w-full rounded-2xl p-4 flex items-start gap-3 text-left" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <span className="text-base">🔬</span>
            <div>
              <p className="text-xs font-extrabold text-[#92400E]">Machine learning futuro · No activo en esta demo</p>
              <p className="text-xs font-medium text-[#B45309] mt-0.5">Datos simulados · Prototipo de instrumentación · Esquema v0.3-demo</p>
            </div>
          </div>
          <button
            onClick={() => { stageStartRef.current = Date.now(); setPhase("stage1"); speakForChild("¡Bienvenida a la Isla Creativa! Vamos a construir una historia. Primero, elige al protagonista."); }}
            className="rounded-2xl px-8 py-4 text-lg font-black text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: C.pink }} aria-label="Comenzar la actividad Construye tu historia">
            ¡Comenzar! 🎨
          </button>
          <SimulatedDataLog log={buildLog(false)} />
        </div>
      </div>
    );
  }

  // ── EXIT CONFIRM ──────────────────────────────────────────────────────────────
  if (phase === "exit-confirm") {
    return <ExitConfirmModal onStay={() => setPhase(savedPhase)} onExit={doExit} />;
  }

  // ── PAUSED ────────────────────────────────────────────────────────────────────
  if (phase === "paused") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <Ashi size={90} mood="wave" />
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: C.pink }}>Historia en pausa</p>
          <h2 className="text-2xl font-black text-[#1C1135]">¡Tu historia te espera!</h2>
          <p className="text-sm font-medium text-[#7C6F9A] mt-1">Cuando quieras continuar, pulsa Reanudar.</p>
        </div>
        <button onClick={() => setPhase(savedPhase)} className="rounded-2xl px-8 py-3 text-base font-black text-white flex items-center gap-2" style={{ background: C.pink }} aria-label="Reanudar la actividad">
          <Play size={16} /> Reanudar
        </button>
        <button onClick={() => setPhase("exit-confirm")} className="text-sm font-bold text-[#9E95B7] hover:text-[#DB2777] transition-colors" aria-label="Salir sin completar">
          Salir sin completar
        </button>
      </div>
    );
  }

  // ── STAGE 1: Protagonist ──────────────────────────────────────────────────────
  if (phase === "stage1") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ControlBar step="Paso 1 de 4" helpText="¿Quién es el protagonista de tu historia? Elige uno de los tres personajes." />
          <ProgressBar pct={25} />
          <StageHeader label="Paso 1 · Protagonista" title="¿Quién protagoniza tu historia?" subtitle="Elige uno de los tres personajes para comenzar." />
          <div className="grid grid-cols-3 gap-4">
            {protagonists.map(p => (
              <button key={p.label}
                onClick={() => {
                  if (protagonist && protagonist.label !== p.label) setChanges(c => c + 1);
                  setProtagonist(p);
                  speakForChild(p.label + ". ¡Buena elección!");
                  recordStage("stage1");
                  setPhase("stage2");
                }}
                className="flex flex-col items-center gap-2 rounded-3xl py-6 px-3 border-2 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: protagonist?.label === p.label ? C.pinkBg : "white", borderColor: protagonist?.label === p.label ? C.pink : C.pinkBorder }}
                aria-label={`Elegir protagonista: ${p.label}`}>
                <span className="text-5xl">{p.emoji}</span>
                <span className="text-sm font-extrabold text-[#1C1135] text-center leading-tight">{p.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── STAGE 2: Setting → Action ─────────────────────────────────────────────────
  if (phase === "stage2") {
    const pickingSetting = !setting;
    const items = pickingSetting ? settings : actions;
    const subTitle = pickingSetting
      ? "Elige el lugar donde vivirá la aventura."
      : `${protagonist?.emoji} ${protagonist?.label} está en ${setting?.emoji} ${setting?.label}. ¿Qué hace?`;

    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ControlBar
            step={`Paso 2 de 4 · ${pickingSetting ? "Escenario" : "Acción"}`}
            helpText={pickingSetting ? "Elige el escenario donde ocurre la historia." : "¿Qué hace el protagonista en su aventura?"}
          />
          <ProgressBar pct={50} />
          <StageHeader
            label={`Paso 2 · ${pickingSetting ? "Escenario" : "Acción"}`}
            title={pickingSetting ? "¿Dónde ocurre la historia?" : "¿Qué hace el protagonista?"}
            subtitle={subTitle}
          />
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <button key={item.label}
                onClick={() => {
                  speakForChild(item.label);
                  if (pickingSetting) {
                    if (setting && setting.label !== item.label) setChanges(c => c + 1);
                    setSetting(item);
                  } else {
                    if (action && action.label !== item.label) setChanges(c => c + 1);
                    setAction(item);
                    recordStage("stage2");
                    setPhase("stage3");
                  }
                }}
                className="flex items-center gap-4 rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md bg-white"
                style={{ borderColor: C.pinkBorder }}
                aria-label={`Elegir: ${item.label}`}>
                <span className="text-4xl w-12 text-center flex-shrink-0">{item.emoji}</span>
                <span className="text-base font-extrabold text-[#1C1135]">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── STAGE 3: Scene ordering ───────────────────────────────────────────────────
  if (phase === "stage3") {
    const allAssigned = sceneAssigned.every(v => v !== null);
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-extrabold" style={{ color: C.pink }}>Paso 3 de 4</span>
            <div className="flex gap-2">
              <button onClick={() => doHelp("Ordena las escenas de tu historia. Toca primero la escena de Inicio, luego el Desarrollo y por último el Final.")}
                className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Escuchar las instrucciones" title="Escuchar instrucciones"><Volume2 size={15} style={{ color: C.pink }} /></button>
              <button onClick={() => { setSceneAssigned([null, null, null]); setNextPos(1); setChanges(c => c + 1); }}
                className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Reiniciar el orden de escenas" title="Reiniciar orden"><RotateCcw size={15} style={{ color: C.pink }} /></button>
              <button onClick={doPause} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Pausar la actividad" title="Pausar"><Pause size={15} style={{ color: C.pink }} /></button>
              <button onClick={() => { setSavedPhase(phase); setPhase("exit-confirm"); }}
                className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Salir de la actividad" title="Salir"><X size={15} style={{ color: C.pink }} /></button>
            </div>
          </div>
          <ProgressBar pct={75} />
          <StageHeader label="Paso 3 · Orden de escenas" title="¿En qué orden ocurre tu historia?" subtitle="Toca las escenas en orden: primero el Inicio, luego el Desarrollo, por último el Final." />
          {/* Position guide */}
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {posLabel.map((lbl, i) => (
              <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white transition-opacity" style={{ background: posColors[i], opacity: nextPos > i + 1 ? 1 : nextPos === i + 1 ? 1 : 0.35 }}>
                {posEmoji[i]} {lbl} {nextPos === i + 1 && <span className="ml-1 animate-pulse">← siguiente</span>}
              </div>
            ))}
          </div>
          {/* Scene cards */}
          <div className="flex flex-col gap-3 mb-5">
            {SHUFFLE.map((realIdx, si) => {
              const assigned = sceneAssigned[si];
              const isAssigned = assigned !== null;
              return (
                <button key={si}
                  onClick={() => {
                    if (isAssigned || nextPos > 3) return;
                    const newAssigned = [...sceneAssigned];
                    newAssigned[si] = nextPos;
                    setSceneAssigned(newAssigned);
                    setNextPos(p => p + 1);
                    if (assigned !== null) speakForChild(posLabel[assigned - 1] + ". " + getSceneText(realIdx));
                    else speakForChild(posLabel[nextPos - 1] + ". " + getSceneText(realIdx));
                  }}
                  disabled={isAssigned}
                  className="rounded-3xl p-5 border-2 text-left transition-all disabled:cursor-default hover:enabled:shadow-md hover:enabled:-translate-y-0.5"
                  style={{
                    background: isAssigned && assigned !== null ? posBg[assigned - 1] : "white",
                    borderColor: isAssigned && assigned !== null ? posColors[assigned - 1] : C.pinkBorder,
                  }}
                  aria-label={isAssigned && assigned !== null ? `Escena asignada como ${posLabel[assigned - 1]}` : `Toca para asignar como ${posLabel[(nextPos - 1) % 3]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-extrabold text-[#1C1135] leading-relaxed">{getSceneText(realIdx)}</p>
                    {isAssigned && assigned !== null ? (
                      <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black text-white" style={{ background: posColors[assigned - 1] }}>
                        {posEmoji[assigned - 1]} {posLabel[assigned - 1]}
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border" style={{ borderColor: C.pinkBorder, color: C.pink }}>
                        Toca aquí
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {allAssigned && (
            <button onClick={() => { recordStage("stage3"); setPhase("word"); speakForChild("¡Genial! Ahora elige una palabra que describa tu historia."); }}
              className="w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:-translate-y-0.5"
              style={{ background: C.pink }} aria-label="Continuar al paso 4: elegir descriptor">
              Continuar →
            </button>
          )}
          <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── WORD PICKER ───────────────────────────────────────────────────────────────
  if (phase === "word") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ControlBar step="Paso 4 de 4" helpText="¿Con qué palabra describirías tu historia? Elige la que más te guste." />
          <ProgressBar pct={100} />
          <StageHeader label="Paso 4 · Descriptor" title="¿Cómo es tu historia?" subtitle="Elige la palabra que mejor describe tu cuento." />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {descriptors.map(d => (
              <button key={d}
                onClick={() => {
                  if (descriptor && descriptor !== d) setChanges(c => c + 1);
                  setDescriptor(d);
                  speakForChild(d);
                }}
                className="rounded-2xl py-4 px-5 text-base font-extrabold border-2 transition-all hover:-translate-y-0.5"
                style={{
                  background: descriptor === d ? C.pink : "white",
                  borderColor: descriptor === d ? C.pink : C.pinkBorder,
                  color: descriptor === d ? "white" : "#1C1135",
                }}
                aria-pressed={descriptor === d}
                aria-label={`Elegir descriptor: ${d}`}>
                {d}
              </button>
            ))}
          </div>
          {descriptor && (
            <button onClick={() => { recordStage("word"); setPhase("done"); speakForChild("¡Bravo! Tu historia está lista. Vamos a escucharla."); }}
              className="w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:-translate-y-0.5"
              style={{ background: C.pink }} aria-label="Ver la historia completa">
              Ver mi historia completa 🎉
            </button>
          )}
          <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const story = buildStory();
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          {/* Celebration header */}
          <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.pink} 0%, #BE185D 100%)` }}>
            <Ashi size={80} mood="celebrate" />
            <p className="text-xs font-black uppercase tracking-widest text-pink-200 mt-2">¡Historia completada!</p>
            <h1 className="text-2xl font-black text-white mt-1">Tu cuento está listo 🎉</h1>
          </div>
          {/* Story card */}
          <div className="rounded-3xl border-2 overflow-hidden" style={{ borderColor: C.pinkBorder }}>
            <div className="px-5 py-4" style={{ background: C.pinkBg }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: C.pink }}>Tu historia</p>
              <h2 className="font-extrabold text-[#1C1135] mt-0.5">Una historia {descriptor}</h2>
            </div>
            <div className="bg-white px-5 py-4 flex flex-col gap-4">
              {story.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ background: posColors[i] }}>
                    {posEmoji[i]}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: posColors[i] }}>{posLabel[i]}</p>
                    <p className="text-sm font-medium text-[#1C1135] leading-relaxed">{line}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 flex justify-between items-center" style={{ background: C.pinkBg }}>
              <p className="text-xs font-bold text-[#7C6F9A]">Una historia <span style={{ color: C.pink }}>{descriptor}</span></p>
              <button onClick={() => speakForChild(story.join(" "))} className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ background: C.pink }} aria-label="Escuchar la historia completa" title="Escuchar la historia">
                <Volume2 size={14} /> Escuchar
              </button>
            </div>
          </div>
          {/* Participation summary */}
          <div className="rounded-3xl bg-white border border-[#E8E5F4] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[#9E95B7] mb-3">Resumen de participación</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tiempo total", value: fmtTime(elapsedSec) },
                { label: "Cambios de selección", value: String(changes) },
                { label: "Ayudas usadas", value: String(helps) },
                { label: "Pausas", value: String(pauses) },
                { label: "Finalización", value: "Completada ✓" },
                { label: "Sesión ID", value: sessionId.current },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-3" style={{ background: C.pinkBg }}>
                  <p className="text-xs font-medium text-[#9E95B7]">{item.label}</p>
                  <p className="font-extrabold text-sm text-[#1C1135] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-[#9E95B7] mt-3 leading-relaxed">Este resumen registra la participación. No evalúa la creatividad ni el lenguaje.</p>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPhase("pre"); setProtagonist(null); setSetting(null); setAction(null); setSceneAssigned([null, null, null]); setNextPos(1); setDescriptor(null); setHelps(0); setPauses(0); setChanges(0); setElapsedSec(0); setStageTimes({}); }}
              className="w-full rounded-2xl py-3 text-base font-black border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ borderColor: C.pink, color: C.pink, background: "white" }}
              aria-label="Crear otra historia">
              <RotateCcw size={16} /> Crear otra historia
            </button>
            <button onClick={() => go("mundo-asha")} className="w-full rounded-2xl py-3 text-base font-black text-white transition-all hover:-translate-y-0.5" style={{ background: C.pink }} aria-label="Volver al mapa del mundo">
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



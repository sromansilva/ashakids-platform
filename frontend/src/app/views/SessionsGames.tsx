import { useEffect, useRef, useState } from "react";
import {
  Star, ChevronRight, ChevronLeft, ArrowRight, Check, X, Plus, Search, Download,
  Video, Clock, Mic, MicOff, VideoOff, PhoneOff, MessageCircle, Sparkles,
  Users, PlayCircle, BookOpen, Activity, Globe, Phone, CheckCircle, Calendar, Volume2,
  Pause, Play, RotateCcw, HelpCircle, Flag, FileText, BarChart2, Shield, Database,
} from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, StatCard, Skeleton, EmptyState, AshiMsg, Isotipo } from "../shared";
import { speakForChild, normalizeVoiceText, Ashi, MundoAshaHome } from "./Sessions";

type VoiceRecognition = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; };

function SimulatedDataLog({ log }: { log: object }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-2xl border border-[#E8E5F4] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">
        <span className="flex items-center gap-2"><Database size={13} /> 🔬 Prototipo de instrumentación · Datos simulados</span>
        <ChevronRight size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706" }}>Datos simulados · No datos reales</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#EDE9FE", color: "#7C3AED" }}>Esquema v0.3-demo</span>
          </div>
          <pre className="text-xs text-[#4B4869] bg-[#F5F3FF] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(log, null, 2)}
          </pre>
          <p className="text-xs text-[#9E95B7] font-medium mt-2 italic">
            En producción estos datos se pseudonimizan antes de almacenarse. El consentimiento para entrenamiento de ML es opcional y separado.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Shared: ExitConfirmModal ───────────────────────────────────────────────────
function ExitConfirmModal({ onStay, onExit }: { onStay: () => void; onExit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onStay} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-3">🚪</div>
        <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">¿Salir de la actividad?</h3>
        <p className="text-sm text-[#7C6F9A] font-medium mb-5 leading-relaxed">
          Perderás el progreso de esta ronda. Podrás volver a intentarlo cuando quieras.
        </p>
        <div className="flex gap-3">
          <button onClick={onStay} aria-label="Continuar actividad" className="flex-1 py-2.5 rounded-xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-colors">
            Continuar actividad
          </button>
          <button onClick={onExit} aria-label="Salir sin completar" className="flex-1 py-2.5 rounded-xl font-extrabold text-sm text-white transition-colors" style={{ background: "#DC2626" }}>
            Salir sin completar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bosque de los Cuentos ──────────────────────────────────────────────────────
export function MundoAshaCuentos({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [inputMode, setInputMode] = useState<"manual" | "mic">("manual");
  const [scene, setScene] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [micSim, setMicSim] = useState<"idle" | "listening" | "done">("idle");
  const [events, setEvents] = useState<object[]>([]);
  const [isRepeat, setIsRepeat] = useState(false);
  const [starsEarned, setStarsEarned] = useState(15);
  const [performanceLevel, setPerformanceLevel] = useState<"alto"|"medio"|"inicial">("alto");
  const [currentWorld] = useState("bosque");
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  const scenes = [
    {
      art: "🌳🌙", title: "El Bosque Mágico",
      text: "Asha llegó al gran Bosque Mágico al atardecer. Estaba oscureciendo y necesitaba un lugar para descansar. ¿Qué eligió para protegerse?",
      options: [
        { label: "🌳 Árbol hueco", key: "arbol" },
        { label: "💧 Orilla del charco", key: "charco" },
        { label: "🌿 Pastizal abierto", key: "pastizal" },
      ],
      therapistSuggested: 0,
      keyword: "árbol",
    },
    {
      art: "🦔✨", title: "El Encuentro",
      text: "Dentro del árbol hueco, Asha escuchó un ruidito suave. Era un animal amistoso que quería ayudar a encontrar el camino. ¿Quién era?",
      options: [
        { label: "🐦 Un pájaro cantor", key: "pajaro" },
        { label: "🦔 Un erizito", key: "erizo" },
        { label: "🐸 Una ranita", key: "rana" },
      ],
      therapistSuggested: 1,
      keyword: "erizito",
    },
    {
      art: "⭐🏠", title: "La Solución",
      text: "El erizito conocía el bosque muy bien. Juntos decidieron encontrar el camino de vuelta a casa. ¿Cómo lo lograron?",
      options: [
        { label: "⭐ Siguiendo las estrellas", key: "estrellas" },
        { label: "🍃 Comiendo hojas del camino", key: "hojas" },
        { label: "💤 Esperando hasta el amanecer", key: "esperar" },
      ],
      therapistSuggested: 0,
      keyword: "estrellas",
    },
  ];

  const current = scenes[scene];
  const isAssigned = true;

  const startGame = (mode: "manual" | "mic") => {
    setInputMode(mode);
    setPhase("playing");
    setStartTime(Date.now());
    setScene(0);
    setChoices([]);
    setAttempts(0);
    setHintsUsed(0);
    setPauseCount(0);
    setEvents([]);
    speakForChild(scenes[0].text);
  };

  const choose = (optKey: string, optLabel: string) => {
    const isTherapistPick = current.options.findIndex(o => o.key === optKey) === current.therapistSuggested;
    const sceneTime = Math.round((Date.now() - startTime) / 1000);
    setAttempts(a => a + 1);
    setEvents(prev => [...prev, { scene: scene + 1, choice: optKey, therapistSuggested: isTherapistPick, timeSeconds: sceneTime }]);
    setChoices(prev => [...prev, optLabel]);
    if (scene < scenes.length - 1) {
      setScene(s => s + 1);
      setTimeout(() => speakForChild(scenes[scene + 1].text), 300);
    } else {
      setPhase("done");
    }
  };

  const simulateMic = () => {
    setMicSim("listening");
    setTimeout(() => {
      setMicSim("done");
      setTimeout(() => {
        setMicSim("idle");
        choose(current.options[current.therapistSuggested].key, current.options[current.therapistSuggested].label);
      }, 800);
    }, 2000);
  };

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const dataLog = {
    sessionId: `ASHA-SIM-${Date.now().toString(36).toUpperCase()}`,
    profileId: "P-0421 (pseudonimizado)",
    activityType: "bosque-cuentos",
    version: "v1.0-demo",
    assigned: isAssigned,
    timestamp: new Date().toISOString(),
    durationSeconds: phase === "done" ? elapsedSec : null,
    attempts,
    hintsUsed,
    pauseCount,
    inputMode,
    levelCompleted: phase === "done" ? scenes.length : scene,
    events,
    note: "Datos simulados · No datos reales",
  };

  // PRE-GAME
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" }}>
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-green-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🌳</span>
          <div>
            <p className="text-xs font-black text-green-300 uppercase tracking-widest mb-1">Mundo 1</p>
            <h1 className="text-3xl font-black text-white">Bosque de los Cuentos</h1>
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
            Practicar secuencias narrativas y vocabulario en contexto de historia. El niño elige opciones para completar una historia de 3 escenas.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🎭", label: "3 escenas · elegir imágenes o palabras" },
              { icon: "⏱", label: "Duración estimada: 5 minutos" },
              { icon: "🎤", label: "Disponible con micrófono o con botones" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              🔒 Privacidad: En esta demo no se graba audio real. La simulación de voz no almacena grabaciones reproducibles. El consentimiento para procesamiento de voz es opcional y separado del consentimiento de uso de la plataforma.
            </p>
          </div>
        </Crd>
        <div className="flex gap-3">
          <button onClick={() => startGame("mic")} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #16A34A, #0D9488)" }}>
            <Mic size={16} /> Iniciar con micrófono
          </button>
          <button onClick={() => startGame("manual")} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-all bg-white">
            <Flag size={16} /> Continuar sin micrófono
          </button>
        </div>
      </div>
    </div>
  );

  // EXIT CONFIRM
  if (phase === "exit-confirm") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />
    </div>
  );

  // DONE
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E8E5F4]">
          {/* Encabezado */}
          <div className="text-center px-6 pt-6 pb-4" style={{background:"linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)"}}>
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-black text-white mb-1">¡Actividad completada!</h2>
            <p className="text-white/90 font-bold text-sm">El osito viajero</p>
            <p className="text-white/70 text-xs">Bosque de los Cuentos</p>
          </div>

          {/* Stars reward */}
          <div className={`text-center py-4 mx-6 mt-4 rounded-2xl ${isRepeat ? "bg-gray-50 border border-gray-200" : "border-2 border-yellow-300"}`}
            style={isRepeat ? {} : {background:"linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"}}>
            {isRepeat ? (
              <>
                <p className="text-2xl font-black text-gray-400">+0 ⭐</p>
                <p className="text-xs font-bold text-gray-500 mt-1">Recompensa obtenida anteriormente</p>
                <p className="text-xs text-gray-400 mt-1">Tu nuevo resultado sí quedó registrado</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-1">⭐</div>
                <p className="text-3xl font-black" style={{color:"#D97706"}}>+{starsEarned} estrellas</p>
                <p className="text-xs font-bold text-amber-700 mt-1">¡Primera finalización completada!</p>
              </>
            )}
          </div>

          {/* Stats cards */}
          <div className="px-6 mt-4">
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Tu participación</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "📝", label: "Escenas", val: `${scenes.length} de ${scenes.length}` },
                { icon: "✅", label: "Correctas", val: String(scenes.length) },
                { icon: "❌", label: "Errores", val: String(Math.max(0, attempts - scenes.length)) },
                { icon: "⏱️", label: "Duración", val: `${Math.floor(Math.max(1, elapsedSec) / 60)}:${String(Math.max(1, elapsedSec) % 60).padStart(2, "0")} min` },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-[#E8E5F4] p-3 text-center bg-white">
                  <p className="text-xl mb-0.5">{s.icon}</p>
                  <p className="text-base font-extrabold text-[#1C1135]">{s.val}</p>
                  <p className="text-[10px] text-[#9E95B7] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Best result */}
            <div className="mt-2 rounded-2xl p-3 border border-[#E8E5F4] bg-white flex justify-between items-center">
              <span className="text-xs font-bold text-[#7C6F9A]">Mejor resultado</span>
              <span className="text-sm font-extrabold text-green-600">100% ⭐</span>
            </div>
          </div>

          {/* Feedback message by world + performance */}
          <div className="px-6 mt-4">
            <div className="rounded-2xl p-4" style={{background:"#F5F0FF"}}>
              <p className="text-sm font-bold text-violet-800 leading-relaxed">
                {performanceLevel === "alto" && currentWorld === "bosque" && "¡Excelente explorador! Comprendiste muy bien la historia y encontraste las respuestas correctas."}
                {performanceLevel === "medio" && currentWorld === "bosque" && "¡Muy buen recorrido por el bosque! Recuerda algunos detalles de la historia y vuelve a intentarlo cuando quieras."}
                {performanceLevel === "inicial" && currentWorld === "bosque" && "¡Buen intento! Cada cuento te ayuda a descubrir nuevas palabras. Puedes volver a leerlo con calma."}
                {performanceLevel === "alto" && currentWorld === "musical" && "¡Tienes un oído increíble! Escuchaste con mucha atención la canción."}
                {performanceLevel === "medio" && currentWorld === "musical" && "¡Muy buen ritmo! Vuelve a escuchar algunas partes y descubrirás nuevos sonidos."}
                {performanceLevel === "inicial" && currentWorld === "musical" && "¡La música también se aprende practicando! Escucha nuevamente la canción cuando quieras."}
                {performanceLevel === "alto" && currentWorld === "adivinanzas" && "¡Gran detective! Descubriste las respuestas escondidas en las pistas."}
                {performanceLevel === "medio" && currentWorld === "adivinanzas" && "¡Estuviste muy cerca! Observa las pistas y vuelve a intentarlo."}
                {performanceLevel === "inicial" && currentWorld === "adivinanzas" && "¡Buen intento, detective! Cada pista te ayudará a encontrar la respuesta."}
                {performanceLevel === "alto" && currentWorld === "laberinto" && "¡Encontraste la salida del laberinto! Completaste el trabalenguas con gran esfuerzo."}
                {performanceLevel === "medio" && currentWorld === "laberinto" && "¡Ya casi llegas a la salida! Repite lentamente cada fragmento y sigue avanzando."}
                {performanceLevel === "inicial" && currentWorld === "laberinto" && "¡Buen intento! Los trabalenguas se dominan paso a paso. Puedes escucharlo y practicar nuevamente."}
                {performanceLevel === "alto" && currentWorld === "laboratorio" && "¡Experimento completado! Superaste esta aventura con un excelente resultado."}
                {performanceLevel === "medio" && currentWorld === "laboratorio" && "¡Buen trabajo en el laboratorio! Sigue practicando para mejorar tu resultado."}
                {performanceLevel === "inicial" && currentWorld === "laboratorio" && "¡Cada intento cuenta! Vuelve al laboratorio cuando estés listo para otra prueba."}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-6 mt-3">
            <div className="rounded-xl p-2 bg-[#FFF7ED] border border-[#FED7AA]">
              <p className="text-[10px] text-orange-700 text-center">Este resumen refleja tu participación, no un resultado clínico. El análisis del avance corresponde únicamente al terapeuta.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 mt-4 pb-6 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setIsRepeat(true); setPhase("pre"); setScene(0); setChoices([]); setAttempts(0); setHintsUsed(0); setPauseCount(0); setEvents([]); }}
                className="py-3 rounded-2xl font-extrabold text-white text-sm" style={{background:"#7C3AED"}}>
                Volver a jugar
              </button>
              <button onClick={() => go("mundo-asha")} className="py-3 rounded-2xl font-bold text-sm border-2 border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
                Elegir otra
              </button>
            </div>
            <button onClick={() => go("mundo-asha")} className="w-full py-2.5 rounded-2xl font-bold text-sm border border-[#E8E5F4] text-[#9E95B7] hover:bg-gray-50">
              Volver al mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // PLAYING / PAUSED
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {phase === "exit-confirm" && <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">¿Quieres salir de la actividad?</h3>
            <p className="text-sm text-[#7C6F9A] leading-relaxed mb-5">
              Guardaremos tu avance para que puedas continuar después.
            </p>
            <div className="space-y-2">
              <button onClick={() => setShowAbandonConfirm(false)}
                className="w-full py-3 rounded-2xl font-extrabold text-white text-sm" style={{background:"#7C3AED"}}>
                Seguir jugando
              </button>
              <button onClick={() => { setShowAbandonConfirm(false); go("mundo-asha"); }}
                className="w-full py-2.5 rounded-2xl font-bold text-sm border-2 border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
                Salir y guardar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => setShowAbandonConfirm(true)}
            aria-label="Salir de la actividad" title="Salir de la actividad"
            className="flex items-center gap-1.5 text-sm font-bold text-green-200 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Salir
          </button>
          <div className="flex items-center gap-2">
            {scenes.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < scene ? "white" : i === scene ? "#86EFAC" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-green-200 ml-1">Escena {scene + 1}/{scenes.length}</span>
          </div>
          <button
            onClick={() => { if (phase === "playing") { setPauseCount(p => p + 1); setPhase("paused"); } else setPhase("playing"); }}
            aria-label={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            title={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            className="p-2 rounded-xl text-green-200 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {phase === "paused" && (
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Cuando estés listo, continúa desde donde lo dejaste.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("playing")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#16A34A" }}>
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
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{current.art}</div>
              <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">{current.title}</h3>
              <p className="text-sm text-[#4B4869] font-medium leading-relaxed">{current.text}</p>
            </div>
            <button onClick={() => speakForChild(current.text)}
              aria-label="Escuchar consigna en voz alta" title="Escuchar consigna en voz alta"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold mb-4 hover:bg-green-50 transition-colors" style={{ color: "#16A34A", border: "1px solid #BBF7D0" }}>
              <Volume2 size={14} /> Escuchar consigna
            </button>
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Elige una opción:</p>
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => (
                <button key={opt.key} onClick={() => choose(opt.key, opt.label)}
                  className="w-full py-3 px-4 rounded-2xl font-extrabold text-sm text-left border-2 border-transparent hover:border-green-300 hover:bg-green-50 transition-all bg-[#F5F3FF] text-[#1C1135]">
                  {opt.label}
                </button>
              ))}
            </div>
            {inputMode === "mic" && (
              <div className="mt-4">
                <p className="text-xs text-[#9E95B7] font-medium text-center mb-2">— o responde con voz —</p>
                <button onClick={simulateMic} disabled={micSim !== "idle"}
                  aria-label={micSim === "listening" ? "Escuchando respuesta de voz…" : "Responder con voz (simulado)"}
                  title="Simulación de voz · No se graba audio real"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-extrabold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: micSim === "listening" ? "#DC2626" : "#16A34A" }}>
                  <Mic size={15} className={micSim === "listening" ? "animate-pulse" : ""} />
                  {micSim === "idle" ? "Responder con voz (simulado)" : micSim === "listening" ? "Escuchando…" : "Voz detectada ✓"}
                </button>
                {micSim === "listening" && (
                  <p className="text-xs text-center font-medium text-[#9E95B7] mt-1">En esta demo no se graba audio real.</p>
                )}
              </div>
            )}
          </Crd>
          <button onClick={() => { setHintsUsed(h => h + 1); speakForChild(`Pista: la palabra clave es ${current.keyword}.`); }}
            aria-label={`Pedir pista. ${hintsUsed} pistas usadas hasta ahora`}
            title="Pedir pista de la escena actual"
            className="flex items-center gap-1.5 text-xs font-bold text-[#9E95B7] hover:text-[#1C1135] transition-colors">
            <HelpCircle size={13} /> Pedir pista ({hintsUsed} usadas)
          </button>
        </div>
      )}
    </div>
  );
}

// ── [unused legacy story catalog removed] ──────────────────────────────────────
function _UnusedStoryCatalog({ go }: { go: (v: View) => void }) {
  const stories = [
    { id: 1, title: "El León y el Ratón", age: "4+", dur: "5 min", color: "#DCFCE7", emoji: "🦁", genre: "Fábula", popular: true, rating: 4.9, subtitle: "Un pequeño amigo puede hacer una gran diferencia.", scenes: ["🦁", "🪢", "🐭"], words: ["león", "ratón", "amigo"], activity: "Di en voz alta: león, ratón y amigo. Después cuenta quién ayudó al león." },
    { id: 2, title: "Caperucita Roja", age: "3+", dur: "7 min", color: "#FEF3C7", emoji: "🐺", genre: "Clásico", popular: true, rating: 4.8, subtitle: "Una aventura por el bosque para visitar a la abuelita.", scenes: ["👧", "🧺", "🌲"], words: ["capa", "canasta", "bosque"], activity: "Señala y repite: capa roja, canasta y bosque. ¿A quién visita Caperucita?" },
    { id: 3, title: "Los Tres Cerditos", age: "4+", dur: "6 min", color: "#FEE2E2", emoji: "🐷", genre: "Clásico", popular: false, rating: 4.7, subtitle: "Tres hermanos construyen casas muy diferentes.", scenes: ["🐷", "🧱", "🏠"], words: ["cerdito", "casa", "ladrillo"], activity: "Repite: casa de ladrillo. ¿Cuál casa fue la más fuerte?" },
    { id: 4, title: "La Tortuga y la Liebre", age: "5+", dur: "5 min", color: "#E0F2FE", emoji: "🐢", genre: "Fábula", popular: false, rating: 4.6, subtitle: "Ir despacio y constante también puede llevarte a la meta.", scenes: ["🐢", "🐇", "🏁"], words: ["tortuga", "liebre", "correr"], activity: "Di tortuga muy despacio y liebre muy rápido. ¿Quién llegó primero?" },
    { id: 5, title: "El Patito Feo", age: "4+", dur: "8 min", color: "#F3E8FF", emoji: "🦆", genre: "Clásico", popular: true, rating: 4.9, subtitle: "Una historia sobre crecer, conocerse y sentirse especial.", scenes: ["🥚", "🦆", "🦢"], words: ["patito", "plumas", "cisne"], activity: "Repite: patito, plumas y cisne. ¿En qué se convirtió el patito?" },
    { id: 6, title: "Hansel y Gretel", age: "6+", dur: "10 min", color: "#FCE7F3", emoji: "🍬", genre: "Clásico", popular: false, rating: 4.5, subtitle: "Dos hermanos siguen un camino de migas y encuentran una casa dulce.", scenes: ["👫", "🍞", "🍬"], words: ["hermanos", "migas", "dulce"], activity: "Di: migas de pan. ¿Qué dejaron Hansel y Gretel en el camino?" },
  ];
  const storyDetails: Record<number, { pages: { art: string; title: string; text: string }[]; phrases: string[]; warmup: string; plan: string[] }> = {
    1: { pages: [{ art: "🦁🌳", title: "El león atrapado", text: "Un león grande caminaba por la selva. Un ratoncito pequeño pasó corriendo sobre su pata. El león lo atrapó, pero decidió dejarlo libre." }, { art: "🐭🪢", title: "Un amigo pequeño", text: "Días después, el león quedó atrapado en una red. El ratón escuchó su rugido y mordió las cuerdas hasta liberarlo." }, { art: "🤝⭐", title: "La enseñanza", text: "El león agradeció al ratón. Comprendió que un amigo pequeño también puede ayudar mucho." }], phrases: ["El león ruge", "El ratón ayuda"], warmup: "Abre la boca como un león: a, a, a. Luego haz un rugido suave: rrr.", plan: ["1 min · Calentamiento", "2 min · Leer y escuchar", "2 min · Palabras y frases"] },
    2: { pages: [{ art: "👧🧺", title: "Una visita especial", text: "Caperucita se puso su capa roja y preparó una canasta con comida. Iba a visitar a su abuelita que vivía al otro lado del bosque." }, { art: "🌲🐺", title: "En el bosque", text: "En el camino encontró a un lobo. Caperucita habló con él, pero siguió caminando sin alejarse del sendero." }, { art: "🏡👵", title: "Llegó a casa", text: "Caperucita llegó a la casa de la abuelita. Al final, todos aprendieron a caminar con cuidado y escuchar los consejos." }], phrases: ["Capa roja", "Canasta grande", "Voy al bosque"], warmup: "Di despacio: ca, co, cu. Después repite: capa roja.", plan: ["1 min · Vocales ca-co-cu", "3 min · Cuento por páginas", "3 min · Frases y comprensión"] },
    3: { pages: [{ art: "🐷🌾", title: "Tres hermanos", text: "Tres cerditos querían construir sus casas. El primero usó paja, el segundo usó palitos y el tercero eligió ladrillos." }, { art: "🌬️🏠", title: "Sopla el lobo", text: "El lobo llegó y sopló muy fuerte. La casa de paja y la casa de palitos se cayeron." }, { art: "🧱🐷", title: "La casa fuerte", text: "Los tres cerditos se refugiaron en la casa de ladrillos. Era fuerte y segura." }], phrases: ["Casa de paja", "Ladrillo fuerte"], warmup: "Junta los labios y sopla suave: p, p, p. Repite: paja y palitos.", plan: ["1 min · Soplo y sonido P", "3 min · Leer el cuento", "2 min · Palabras y frases"] },
    4: { pages: [{ art: "🐇🏁", title: "Una carrera", text: "La liebre se burlaba de la tortuga porque caminaba despacio. La tortuga propuso hacer una carrera hasta la meta." }, { art: "😴🐇", title: "Una siesta", text: "La liebre corrió muy rápido y decidió descansar. Pensó que tendría tiempo para ganar después." }, { art: "🐢🏆", title: "Paso a paso", text: "La tortuga siguió caminando sin detenerse. Llegó a la meta antes que la liebre." }], phrases: ["La tortuga camina", "La liebre corre"], warmup: "Di lento: toor-tu-ga. Ahora rápido: lie-bre. Cambia la velocidad de tu voz.", plan: ["1 min · Voz lenta y rápida", "2 min · Leer la carrera", "2 min · Frases y respuesta"] },
    5: { pages: [{ art: "🥚🦆", title: "Un patito diferente", text: "En una granja nacieron varios patitos. Uno era más grande y tenía plumas grises. Los demás no sabían que era especial." }, { art: "🌧️🦆", title: "Busca su lugar", text: "El patito caminó y nadó por muchos lugares. A veces se sintió triste, pero siguió creciendo." }, { art: "🦢✨", title: "Un hermoso cisne", text: "Cuando llegó la primavera, el patito vio su reflejo en el agua. Ya no era un patito feo: era un cisne hermoso." }], phrases: ["El patito nada", "Un cisne blanco", "Tengo plumas"], warmup: "Sonríe y di: i, i, i. Después redondea los labios: u, u, u. Repite: patito y cisne.", plan: ["2 min · Vocales I-U", "3 min · Cuento por páginas", "3 min · Vocabulario y frases"] },
    6: { pages: [{ art: "👫🌲", title: "El camino", text: "Hansel y Gretel caminaron con cuidado por el bosque. Hansel dejó migas de pan para recordar el camino de vuelta." }, { art: "🍬🏠", title: "La casa dulce", text: "Los hermanos encontraron una pequeña casa hecha de dulces. Olía a galletas y caramelos." }, { art: "⭐🏡", title: "Juntos son valientes", text: "Hansel y Gretel usaron su ingenio y trabajaron juntos. Finalmente encontraron el camino seguro a casa." }], phrases: ["Migas de pan", "Casa de dulces", "Vamos juntos"], warmup: "Di ma-me-mi-mo-mu. Después repite: migas de pan.", plan: ["2 min · Sílabas M", "4 min · Lectura guiada", "4 min · Frases y narración"] },
  };
  const [search, setSearch] = useState("");
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [listeningWord, setListeningWord] = useState<string | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const currentStory = stories.find(story => story.id === activeStory) ?? null;
  const currentDetail = currentStory ? storyDetails[currentStory.id] : null;
  const practiceItems = currentStory && currentDetail ? [...currentStory.words, ...currentDetail.phrases] : [];
  const filtered = stories.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  const practiceWord = (word: string) => {
    const VoiceAPI = (window as unknown as { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => VoiceRecognition }).webkitSpeechRecognition;
    if (!VoiceAPI) {
      setVoiceFeedback("Tu navegador no tiene reconocimiento de voz. Prueba en Chrome o Edge.");
      return;
    }
    setListeningWord(word);
    setVoiceFeedback(`Te escucho… di: ${word}`);
    const recognition = new VoiceAPI();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      const heard = normalizeVoiceText(event.results[0][0].transcript);
      const expected = normalizeVoiceText(word);
      if (heard.includes(expected)) {
        setSpokenWords(words => words.includes(word) ? words : [...words, word]);
        setVoiceFeedback(`¡Muy bien! Dijiste “${word}”.`);
      } else {
        setVoiceFeedback(`Escuché “${event.results[0][0].transcript}”. Inténtalo otra vez: ${word}.`);
      }
    };
    recognition.onerror = () => setVoiceFeedback("No pudimos escucharte. Revisa el permiso del micrófono e inténtalo otra vez.");
    recognition.onend = () => setListeningWord(null);
    recognition.start();
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Hero */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-green-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🌳</span>
          <div>
            <p className="text-xs font-black text-green-300 uppercase tracking-widest mb-1">Mundo 1</p>
            <h1 className="text-3xl font-black text-white">Bosque de los Cuentos</h1>
            <p className="text-green-200 text-sm font-medium mt-1">Descubrí historias mágicas, fábulas y aventuras</p>
            <div className="flex gap-3 mt-3">
              <Bdg color="green">12 cuentos</Bdg>
              <Bdg color="green">+45 ⭐ disponibles</Bdg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input placeholder="Buscar cuentos…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300/30 focus:border-green-400 font-medium" />
        </div>

        {/* Continue reading */}
        <div className="rounded-3xl p-5 mb-7 border-2 border-green-200" style={{ background: "#F0FDF4" }}>
          <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-2">📖 Continuar leyendo</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#DCFCE7" }}>🦆</div>
            <div className="flex-1">
              <p className="font-extrabold text-[#1C1135]">El Patito Feo</p>
              <div className="h-2 rounded-full mt-1.5 mb-1" style={{ background: "#BBF7D0" }}>
                <div className="h-2 rounded-full" style={{ width: "60%", background: "#16A34A" }} />
              </div>
              <p className="text-xs text-[#7C6F9A] font-medium">60% completado</p>
            </div>
            <Btn size="sm" onClick={() => { setActiveStory(5); setPageIndex(0); setSpokenWords([]); setVoiceFeedback(""); speakForChild("Continuamos con El Patito Feo. Escucha con atención y repite las palabras nuevas."); }} className="!bg-green-600 !text-white">Continuar</Btn>
          </div>
        </div>

        {currentStory && (
          <section className="mb-7 overflow-hidden rounded-[2rem] border-2 border-green-200 bg-white shadow-lg">
            <div className="relative overflow-hidden bg-green-700 p-6 text-white sm:p-8">
              <div className="absolute -right-8 -top-9 text-[11rem] opacity-15">{currentStory.emoji}</div>
              <div className="relative flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-200">Cuento seleccionado · lectura guiada</p><h2 className="mt-2 text-3xl font-black">{currentStory.title}</h2><p className="mt-2 max-w-xl text-sm font-bold text-green-100">{currentStory.subtitle}</p></div><button onClick={() => setActiveStory(null)} className="rounded-xl bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Cerrar cuento"><X size={18} /></button></div>
              <div className="relative mt-5 flex gap-3">{currentStory.scenes.map((scene, index) => <div key={index} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl">{scene}</div>)}</div>
            </div>
            {currentDetail && <div className="grid gap-5 p-6 lg:grid-cols-[1.12fr_.88fr]">
              <article className="self-start overflow-hidden rounded-3xl border-2 border-green-100 bg-[#F8FFFA]">
                <div className="flex items-center justify-between border-b border-green-100 bg-white px-5 py-3"><span className="text-xs font-black uppercase tracking-wider text-green-700">Página {pageIndex + 1} de {currentDetail.pages.length}</span><div className="flex gap-1">{currentDetail.pages.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i === pageIndex ? "bg-green-600" : "bg-green-200"}`} />)}</div></div>
                <div className="p-6 text-center"><div className="mx-auto flex h-32 max-w-sm items-center justify-center rounded-3xl bg-white text-7xl shadow-sm">{currentDetail.pages[pageIndex].art}</div><h3 className="mt-5 text-xl font-black text-[#1C1135]">{currentDetail.pages[pageIndex].title}</h3><p className="mx-auto mt-3 max-w-lg text-left text-base font-semibold leading-7 text-[#4A4560]">{currentDetail.pages[pageIndex].text}</p><button onClick={() => speakForChild(currentDetail.pages[pageIndex].text)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white"><Volume2 size={17} /> Leer esta página</button></div>
                <div className="flex items-center justify-between border-t border-green-100 bg-white p-4"><Btn variant="outline" size="sm" disabled={pageIndex === 0} onClick={() => setPageIndex(page => Math.max(0, page - 1))}><ChevronLeft size={15} /> Anterior</Btn><Btn size="sm" onClick={() => setPageIndex(page => Math.min(currentDetail.pages.length - 1, page + 1))} disabled={pageIndex === currentDetail.pages.length - 1} className="!bg-green-600 !text-white">Siguiente <ChevronRight size={15} /></Btn></div>
              </article>
              <aside className="rounded-[2rem] border-2 border-violet-100 bg-violet-50 p-5 sm:p-6">
                <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm"><Ashi size={52} mood="wave" /></div><p className="mt-3 text-xs font-black uppercase tracking-wider text-violet-600">Di con ASHI</p><h3 className="mt-1 text-xl font-black text-[#1C1135]">¡Tu voz hace magia!</h3><p className="mt-2 text-sm font-medium text-[#7C6F9A]">Toca una tarjeta, escucha y repite. Se pintará cuando ASHI te entienda.</p></div>
                <div className="mt-5 flex flex-col gap-2">{practiceItems.map(item => { const completed = spokenWords.includes(item); const listening = listeningWord === item; return <button key={item} onClick={() => practiceWord(item)} disabled={listeningWord !== null} className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${completed ? "border-green-400 bg-green-100 text-green-800" : "border-white bg-white text-[#4A4560] hover:border-violet-300"}`}><span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${completed ? "bg-green-500 text-white" : "bg-violet-100 text-violet-600"}`}>{listening ? <Mic size={17} className="animate-pulse" /> : completed ? <Check size={17} /> : <Mic size={17} />}</span><span className="flex-1 text-base font-black">{item}</span>{completed && <span className="text-lg">⭐</span>}</button>; })}</div>
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-center"><p className="text-sm font-black text-violet-700">{spokenWords.filter(item => practiceItems.includes(item)).length} de {practiceItems.length} ¡muy bien!</p>{voiceFeedback && <p className="mt-1 text-xs font-bold text-[#7C6F9A]">{voiceFeedback}</p>}</div>
              </aside>
            </div>}
          </section>
        )}
        <h2 className="font-extrabold text-[#1C1135] mb-4">⭐ Más populares</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(story => (
            <button key={story.id} onClick={() => { setActiveStory(story.id); setPageIndex(0); setSpokenWords([]); setVoiceFeedback(""); speakForChild(`Vamos a leer ${story.title}. Escucha y repite las palabras importantes.`); }}
              className="rounded-3xl border-2 border-transparent hover:border-green-300 hover:shadow-md p-5 text-left transition-all duration-200"
              style={{ backgroundColor: story.color }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{story.emoji}</div>
                {story.popular && <Bdg color="green">Popular</Bdg>}
              </div>
              <p className="font-extrabold text-[#1C1135] mb-1">{story.title}</p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Bdg color="gray">{story.age}</Bdg>
                <Bdg color="gray">⏱ {story.dur}</Bdg>
                <Bdg color="gray">{story.genre}</Bdg>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= Math.floor(story.rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"} />)}
                <span className="text-xs text-[#7C6F9A] ml-1 font-bold">{story.rating}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-green-700 bg-green-100 rounded-xl px-3 py-1">📖 Leer</span>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 rounded-xl px-3 py-1">🔊 Escuchar</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Montaña Musical ────────────────────────────────────────────────────────────
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

// ── Laberinto de Trabalenguas ──────────────────────────────────────────────────
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

// ── Trabalenguas ───────────────────────────────────────────────────────────────
export function MundoAshaTrabalenguas({ go }: { go: (v: View) => void }) {
  const [active,    setActive]    = useState<number | null>(null);
  const [practicing, setPracticing] = useState(false);

  const items = [
    { id: 1, text: "Tres tristes tigres comen trigo en un trigal.", level: "Fácil",  pts: 10, color: "#DCFCE7", emoji: "🐯" },
    { id: 2, text: "Pepe Pecas pica papas con un pico.",             level: "Fácil",  pts: 10, color: "#FEF3C7", emoji: "🥔" },
    { id: 3, text: "El cielo está enladrillado, ¿quién lo desenladrillará? El desenladrillador que lo desenladrille, buen desenladrillador será.", level: "Difícil", pts: 25, color: "#FEE2E2", emoji: "🧱" },
    { id: 4, text: "Pablito clavó un clavito. ¿Qué clavito clavó Pablito?", level: "Medio", pts: 15, color: "#E0F2FE", emoji: "🔨" },
  ];

  const startTimer = () => { setPracticing(true); const item = items.find(i => i.id === active); if (item) speakForChild(`Escucha y repite despacio: ${item.text}`); };
  const stopTimer  = () => setPracticing(false);

  return (
    <div style={{ background: "linear-gradient(180deg, #CCFBF1 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.teal} 0%, #0F766E 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-teal-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🗣️</span>
          <div>
            <p className="text-xs font-black text-teal-300 uppercase tracking-widest mb-1">Actividad adicional</p>
            <h1 className="text-3xl font-black text-white">Trabalenguas</h1>
            <p className="text-teal-100 text-sm font-medium mt-1">Entrena tu pronunciación jugando</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {active !== null ? (() => {
          const item = items.find(i => i.id === active)!;
          return (
            <div>
              <button onClick={() => { setActive(null); setPracticing(false); }} className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:underline mb-5">
                <ChevronLeft size={14} /> Volver a la lista
              </button>
              <Crd className="p-7 text-center mb-5">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <Bdg color={item.level === "Fácil" ? "green" : item.level === "Medio" ? "orange" : "red"}>{item.level}</Bdg>
                <p className="text-2xl font-extrabold text-[#1C1135] leading-relaxed mt-5 mb-5">{item.text}</p>
                <div className="flex gap-3 justify-center flex-wrap mb-2">
                  {!practicing
                    ? <Btn size="lg" onClick={startTimer} className="!bg-teal-600 !text-white">🎤 Practicar</Btn>
                    : <>
                        <div className="flex items-center gap-2 text-teal-600 font-extrabold text-lg">
                          <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse inline-block" /> Practicando…
                        </div>
                        <Btn size="lg" variant="outline" onClick={stopTimer}>⏹ Parar</Btn>
                      </>
                  }
                </div>
              </Crd>
              <Crd className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#1C1135]">Recompensa por completar</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">Practica 3 veces seguidas</p>
                </div>
                <div className="text-2xl font-black text-amber-600">+{item.pts} ⭐</div>
              </Crd>
            </div>
          );
        })() : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map(item => (
              <button key={item.id} onClick={() => { setActive(item.id); speakForChild(`Preparados para practicar. ${item.text}`); }}
                className="rounded-3xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-teal-300"
                style={{ backgroundColor: item.color }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <Bdg color={item.level === "Fácil" ? "green" : item.level === "Medio" ? "orange" : "red"}>{item.level}</Bdg>
                </div>
                <p className="font-extrabold text-[#1C1135] mb-2 line-clamp-2">{item.text}</p>
                <p className="text-xs font-extrabold text-amber-600">+{item.pts} ⭐ al completar</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Adivinanzas ────────────────────────────────────────────────────────────────
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

// ── Laboratorio de Juegos ──────────────────────────────────────────────────────
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

// ── Academia ASHA ──────────────────────────────────────────────────────────────
export function MundoAshaAcademia({ go }: { go: (v: View) => void }) {
  const modules = [
    { emoji: "🔤", name: "Letras",   desc: "Aprende el abecedario",     progress: 80, color: "#7C3AED", bg: "#EDE9FE",   total: 26, done: 21 },
    { emoji: "🔢", name: "Números",  desc: "Del 1 al 100",               progress: 60, color: "#0284C7", bg: "#E0F2FE",   total: 20, done: 12 },
    { emoji: "🎨", name: "Colores",  desc: "Identifica cada color",     progress: 100, color: "#DB2777", bg: "#FCE7F3",   total: 12, done: 12 },
    { emoji: "🔷", name: "Figuras",  desc: "Formas geométricas básicas", progress: 45, color: "#B45309", bg: "#FEF3C7",   total: 8,  done: 3  },
    { emoji: "📝", name: "Palabras", desc: "Vocabulario cotidiano",      progress: 30, color: "#16A34A", bg: "#DCFCE7",   total: 50, done: 15 },
    { emoji: "🌍", name: "El Mundo", desc: "Animales, frutas y más",     progress: 15, color: "#0D9488", bg: "#CCFBF1",   total: 40, done: 6  },
  ];
  return (
    <div style={{ background: "linear-gradient(180deg, #EDE9FE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #4C1D95 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🚀</span>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Mundo 6</p>
            <h1 className="text-3xl font-black text-white">Academia ASHA</h1>
            <p className="text-violet-200 text-sm font-medium mt-1">Letras, números, colores y más</p>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(m => (
            <button key={m.name} onClick={() => speakForChild(`Misión de ${m.name}. ${m.desc}. Di en voz alta una palabra que conozcas.`)} className="bg-white rounded-3xl border border-[#E8E5F4] p-6 text-left hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{ backgroundColor: m.bg }}>{m.emoji}</div>
              <p className="font-extrabold text-[#1C1135] text-lg mb-1">{m.name}</p>
              <p className="text-xs text-[#7C6F9A] font-medium mb-4">{m.desc}</p>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#7C6F9A] font-medium">{m.done} / {m.total} completadas</span>
                <span className="font-extrabold" style={{ color: m.color }}>{m.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: m.bg }}>
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${m.progress}%`, background: m.color }} />
              </div>
              {m.progress === 100 && (
                <div className="mt-3 flex items-center gap-1 text-xs font-extrabold text-emerald-600">
                  <CheckCircle size={13} /> ¡Completado!
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Camino de los Retos ────────────────────────────────────────────────────────
export function MundoAshaRetos({ go }: { go: (v: View) => void }) {
  const steps = [
    { n: 1, icon: "📖", label: "Lee un cuento",           pts: 15, done: true,    world: "mundo-asha/cuentos"      as View },
    { n: 2, icon: "🧩", label: "Resuelve 3 adivinanzas",  pts: 30, done: true,    world: "mundo-asha/adivinanzas"  as View },
    { n: 3, icon: "🎵", label: "Escucha 2 canciones",     pts: 24, done: false,   world: "mundo-asha/canciones"    as View },
    { n: 4, icon: "🗣️", label: "Practica un trabalenguas",pts: 20, done: false,   world: "mundo-asha/trabalenguas" as View },
    { n: 5, icon: "🧠", label: "Completa un mini juego",  pts: 25, done: false,   world: "mundo-asha/juegos"       as View },
    { n: 6, icon: "🏆", label: "¡Recompensa final!",      pts: 50, done: false,   world: "mundo-asha/insignias"    as View },
  ];
  const doneCount = steps.filter(s => s.done).length;
  return (
    <div style={{ background: "linear-gradient(180deg, #FFF1E6 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-orange-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🏆</span>
          <div>
            <p className="text-xs font-black text-orange-200 uppercase tracking-widest mb-1">Mundo 7</p>
            <h1 className="text-3xl font-black text-white">Camino de los Retos</h1>
            <p className="text-orange-100 text-sm font-medium mt-1">Completa cada desafío y obtén la recompensa final</p>
          </div>
          <div className="ml-auto bg-white/15 rounded-2xl px-4 py-2 text-white text-center">
            <p className="font-black text-2xl">{doneCount}/{steps.length}</p>
            <p className="text-xs text-orange-200 font-bold">completados</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-[#7C6F9A] mb-2">
            <span>Progreso del reto</span>
            <span>{Math.round((doneCount / steps.length) * 100)}%</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "#FDE68A" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%`, background: B.orange }} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-7 top-full h-4 w-0.5 z-0" style={{ background: step.done ? B.orange : "#FDE68A" }} />
              )}
              <div className={`relative z-10 flex items-center gap-4 rounded-3xl p-5 border-2 transition-all
                ${step.done ? "bg-white border-orange-300 shadow-sm" : i === doneCount ? "bg-white border-orange-400 border-dashed" : "bg-[#FAFAF9] border-[#E8E5F4] opacity-60"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${step.done ? "bg-orange-100" : "bg-[#F5F3FF]"}`}>
                  {step.done ? "✅" : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-extrabold ${step.done ? "text-[#1C1135]" : "text-[#7C6F9A]"}`}>{step.label}</p>
                  <p className="text-xs font-bold text-amber-600">+{step.pts} ⭐</p>
                </div>
                {step.done
                  ? <CheckCircle size={22} className="text-orange-500 flex-shrink-0" />
                  : i === doneCount
                  ? <Btn size="sm" variant="cta" onClick={() => go(step.world)}>Ir ahora</Btn>
                  : <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#D4D0E5] flex-shrink-0" />
                }
              </div>
            </div>
          ))}
        </div>

        {doneCount === steps.length && (
          <div className="mt-7 rounded-3xl p-7 text-center" style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
            <div className="text-5xl mb-3">🎁</div>
            <p className="text-xl font-black text-white mb-1">¡Reto completado!</p>
            <p className="text-orange-100 text-sm font-medium mb-4">Ganaste la recompensa especial</p>
            <Btn size="lg" variant="cta" onClick={() => go("mundo-asha/insignias")}>Ver mis insignias 🏅</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Galería de Insignias ───────────────────────────────────────────────────────
export function MundoAshaInsignias({ go }: { go: (v: View) => void }) {
  const badges = [
    { icon: "📖", name: "Primer Cuento",     desc: "Leíste tu primer cuento",        earned: true,  date: "12 Jul" },
    { icon: "🧩", name: "Detective",         desc: "Resolviste 10 adivinanzas",       earned: true,  date: "18 Jul" },
    { icon: "🎵", name: "Mini Músico",       desc: "Escuchaste 5 canciones",          earned: true,  date: "22 Jul" },
    { icon: "🗣️", name: "Lengua de Plata",  desc: "Completaste 5 trabalenguas",      earned: true,  date: "24 Jul" },
    { icon: "🔢", name: "Matemático",        desc: "Dominaste los números del 1 al 20",earned: false, date: "" },
    { icon: "🌈", name: "Artista de Colores",desc: "Completaste el módulo de colores",earned: true,  date: "26 Jul" },
    { icon: "🧠", name: "Genio del Juego",   desc: "Ganaste 5 mini juegos",           earned: false, date: "" },
    { icon: "🔤", name: "Abecedario",        desc: "Aprendiste todas las letras",     earned: false, date: "" },
    { icon: "🔥", name: "Racha Épica",       desc: "7 días seguidos activo",          earned: true,  date: "29 Jul" },
    { icon: "🏆", name: "Campeón ASHA",      desc: "Completaste el camino de retos",  earned: false, date: "" },
    { icon: "🚀", name: "Explorador",        desc: "Visitaste todos los mundos",      earned: false, date: "" },
    { icon: "⭐", name: "Constelación",      desc: "Acumulaste 100 estrellas",        earned: false, date: "" },
  ];
  const earned = badges.filter(b => b.earned).length;
  return (
    <div style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #92400E 0%, #78350F 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">⭐</span>
          <div>
            <h1 className="text-3xl font-black text-white">Galería de Insignias</h1>
            <p className="text-amber-100 text-sm font-medium mt-1">Tu colección de logros</p>
          </div>
          <div className="ml-auto bg-white/15 rounded-2xl px-4 py-2 text-white text-center">
            <p className="font-black text-2xl">{earned}/{badges.length}</p>
            <p className="text-xs text-amber-200 font-bold">ganadas</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5 mb-7 shadow-sm">
          <div className="flex justify-between text-xs font-bold text-[#7C6F9A] mb-2">
            <span>Colección completada</span>
            <span>{Math.round((earned / badges.length) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#FEF3C7" }}>
            <div className="h-full rounded-full" style={{ width: `${(earned / badges.length) * 100}%`, background: "#B45309" }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map(b => (
            <div key={b.name}
              className={`rounded-3xl p-5 border-2 text-center transition-all ${b.earned ? "bg-white border-amber-300 shadow-sm hover:shadow-md hover:-translate-y-0.5" : "bg-[#FAFAF9] border-dashed border-[#E8E5F4] opacity-50"}`}>
              <div className={`text-5xl mb-3 ${!b.earned ? "grayscale" : ""}`}>{b.icon}</div>
              <p className={`text-sm font-extrabold mb-1 ${b.earned ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>{b.name}</p>
              <p className="text-xs font-medium leading-snug" style={{ color: b.earned ? B.textMid : "#B5B0C8" }}>{b.desc}</p>
              {b.earned && b.date && (
                <p className="text-xs font-bold text-amber-600 mt-2">{b.date}</p>
              )}
              {!b.earned && (
                <p className="text-xs font-bold text-[#C4B5FD] mt-2">🔒 Por desbloquear</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Perfil del Niño ────────────────────────────────────────────────────────────
export function MundoAshaPerfil({ go }: { go: (v: View) => void }) {
  const activities = [
    { icon: "📖", name: "El Patito Feo",      type: "Cuento",       pts: 15, time: "hace 2h"  },
    { icon: "🧩", name: "3 Adivinanzas",       type: "Adivinanzas",  pts: 30, time: "ayer"     },
    { icon: "🎵", name: "Abecedario Bailarín", type: "Canción",      pts: 12, time: "ayer"     },
    { icon: "🚀", name: "Academia — Letras",   type: "Academia",     pts: 20, time: "hace 2d"  },
  ];
  const badges = ["📖", "🧩", "🎵", "🗣️", "🌈", "🔥"];
  return (
    <div style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #4C1D95 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mundo ASHA
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <div style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))" }}>
            <Ashi size={80} mood="celebrate" />
          </div>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Perfil del explorador</p>
            <h1 className="text-3xl font-black text-white">Mateo 🦊</h1>
            <p className="text-violet-200 text-sm font-medium">7 años · Explorador Nivel 3</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              <div className="bg-white/15 rounded-2xl px-3 py-1.5 text-white flex items-center gap-1.5">
                <span className="text-base">⭐</span>
                <span className="font-black text-sm">47 estrellas</span>
              </div>
              <div className="bg-white/15 rounded-2xl px-3 py-1.5 text-white flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                <span className="font-black text-sm">7 días seguidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {/* Level progress */}
        <Crd className="p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-extrabold text-[#1C1135]">Nivel 3 — Explorador</p>
              <p className="text-xs text-[#7C6F9A] font-medium">47 / 80 estrellas para Nivel 4</p>
            </div>
            <div className="text-4xl">🚀</div>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: B.violetLight }}>
            <div className="h-full rounded-full" style={{ width: "59%", background: B.violet }} />
          </div>
          <p className="text-xs text-right text-[#9E95B7] font-medium mt-1.5">59% — próximo nivel</p>
        </Crd>

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {/* Stats */}
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-4">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "📖", val: "8",  lbl: "Cuentos leídos",      bg: "#DCFCE7", c: "#16A34A" },
                { icon: "🧩", val: "15", lbl: "Adivinanzas",          bg: "#FEF3C7", c: "#B45309" },
                { icon: "🎵", val: "12", lbl: "Canciones",            bg: "#F3E8FF", c: "#7C3AED" },
                { icon: "🧠", val: "5",  lbl: "Mini juegos",          bg: "#E0F2FE", c: "#0284C7" },
              ].map(s => (
                <div key={s.lbl} className="rounded-2xl p-3 text-center" style={{ backgroundColor: s.bg }}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="font-black text-xl" style={{ color: s.c }}>{s.val}</p>
                  <p className="text-xs font-medium text-[#7C6F9A]">{s.lbl}</p>
                </div>
              ))}
            </div>
          </Crd>

          {/* Recent badges */}
          <Crd className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Últimas insignias</h3>
              <button onClick={() => go("mundo-asha/insignias")} className="text-sm font-bold text-violet-600 hover:underline flex items-center gap-1">
                Ver todas <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.map((b, i) => (
                <div key={i} className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: B.violetLight }}>
                  {b}
                </div>
              ))}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 border-dashed border-[#C4B5FD] text-[#C4B5FD]">
                +6
              </div>
            </div>
          </Crd>
        </div>

        {/* Recent activity */}
        <Crd>
          <div className="p-5 border-b border-[#F5F3FF]">
            <h3 className="font-extrabold text-[#1C1135]">Actividades recientes</h3>
          </div>
          <div className="divide-y divide-[#FAFAF9]">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: B.violetLight }}>{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{a.name}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{a.type} · {a.time}</p>
                </div>
                <span className="text-xs font-extrabold text-amber-600">+{a.pts} ⭐</span>
              </div>
            ))}
          </div>
        </Crd>
      </div>
    </div>
  );
}

// Keep old PadreRecompensas as a redirect shim (unused path)
function PadreRecompensas({ go }: { go: (v: View) => void }) {
  return <MundoAshaHome go={go} />;
}

// ─── ASHA Session ───────────────────────────────────────────────────────────────

export const SESSION_THERAPIST = {
  name: "Dra. Ana Ruiz", specialty: "Terapia del Lenguaje",
  av: "AR", color: B.violet, date: "30 Jul 2026", time: "10:00 AM",
  duration: "45 min", type: "Virtual", status: "Confirmada",
};

// Confetti burst (CSS-only)
export function Confetti() {
  const colors = ["#7C3AED", "#F97316", "#0D9488", "#EC4899", "#FCD34D", "#34D399", "#60A5FA"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 56 }).map((_, i) => (
        <div key={i}
          className="absolute rounded-sm animate-bounce"
          style={{
            width:  Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            left:   `${Math.random() * 100}%`,
            top:    `-${Math.random() * 20}%`,
            background: colors[i % colors.length],
            opacity: 0.85,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Isla Creativa · Construye tu historia ─────────────────────────────────────
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


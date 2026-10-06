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



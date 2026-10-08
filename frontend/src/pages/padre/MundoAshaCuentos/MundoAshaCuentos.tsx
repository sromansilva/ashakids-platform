import { useState } from "react";
import { ChevronLeft, Mic, Volume2, Pause, Play, HelpCircle, Flag } from "lucide-react";
import { View } from "@/types/navigation";
import { Crd } from "@/components/common/Crd";
import { speakForChild } from "@/pages/padre/Sessions/speakForChild";
import { ExitConfirmModal } from "@/pages/padre/GamesShared";

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

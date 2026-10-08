import type { useVozAventuraGame } from "@/pages/padre/MundoAsha/useVozAventuraGame";
import { VOZ_W } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_H } from "@/pages/padre/MundoAsha/voiceConfig";

type Props = Pick<ReturnType<typeof useVozAventuraGame>, "canvasRef" | "phase" | "inputMode" | "touchHeldRef" | "countdown" | "survivedSecs" | "micPct" | "isSpeaking" | "setP" | "bestTime" | "lastTickRef" | "startCountdown" | "stopMic" | "requestMic" | "startTouchMode">;
export function VozAventuraGameVozAventura({ canvasRef, phase, inputMode, touchHeldRef, countdown, survivedSecs, micPct, isSpeaking, setP, bestTime, lastTickRef, startCountdown, stopMic, requestMic, startTouchMode }: Props) {
return (<div className="flex flex-col h-full gap-2">
      <div className="relative flex-1 rounded-2xl overflow-hidden" style={{minHeight:260}}>
        <canvas ref={canvasRef} width={VOZ_W} height={VOZ_H} className="w-full h-full block"
          style={{cursor: phase==="playing"&&inputMode==="touch"?"pointer":"default"}}
          onPointerDown={()=>{ if(phase==="playing"&&inputMode==="touch") touchHeldRef.current=true; }}
          onPointerUp={()=>{ touchHeldRef.current=false; }}
          onPointerLeave={()=>{ touchHeldRef.current=false; }}
        />

        {/* Countdown */}
        {phase==="countdown"&&(
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {countdown>0
                ?<div className="text-8xl font-black text-white" style={{textShadow:"0 4px 24px rgba(0,0,0,0.35)"}}>{countdown}</div>
                :<div className="text-xl font-black text-white px-6 py-3 rounded-2xl" style={{background:"rgba(124,58,237,0.88)"}}>{inputMode==="touch"?"¡Toca para volar! 👆":"¡Habla para volar! 🎤"}</div>
              }
            </div>
          </div>
        )}

        {/* Playing HUD */}
        {phase==="playing"&&(
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
            <div className="bg-white/92 rounded-xl px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] text-[#7C6F9A] font-medium">Tiempo</p>
              <p className="text-xl font-black text-[#1C1135]">{survivedSecs}<span className="text-xs ml-0.5">s</span></p>
            </div>
            <div className="bg-white/92 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm pointer-events-auto">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-20 h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all duration-75" style={{width:`${micPct}%`,background:isSpeaking?"#7C3AED":"#CBD5E1"}} />
                </div>
                <p className="text-[9px] font-bold" style={{color:isSpeaking?"#7C3AED":"#94A3B8"}}>
                  {inputMode==="touch"?(isSpeaking?"👆 Presionando":"👆 Suelta para bajar"):(isSpeaking?"🎤 Voz detectada":"🤫 Silencio")}
                </p>
              </div>
              <button onClick={()=>setP("paused")} className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-gray-100 text-gray-500">⏸</button>
            </div>
            <div className="bg-white/92 rounded-xl px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] text-[#7C6F9A] font-medium">Récord</p>
              <p className="text-xl font-black text-[#0D9488]">{bestTime}<span className="text-xs ml-0.5">s</span></p>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {phase==="paused"&&(
          <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.42)"}}>
            <div className="bg-white rounded-3xl p-6 w-60 text-center shadow-xl">
              <p className="text-xl font-black text-[#1C1135] mb-1">Juego en pausa</p>
              <p className="text-[#7C6F9A] text-sm mb-4">Tiempo: {survivedSecs}s</p>
              <div className="flex flex-col gap-2">
                <button onClick={()=>{lastTickRef.current=Date.now();setP("playing");}} className="py-2.5 rounded-2xl text-white font-extrabold text-sm" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>▶ Continuar</button>
                <button onClick={startCountdown} className="py-2 rounded-2xl font-bold text-sm text-[#7C6F9A] border border-[#E8E5F4]">🔄 Reiniciar</button>
                <button onClick={()=>{stopMic();setP("pre");}} className="py-2 rounded-2xl font-bold text-sm text-red-500 border border-red-100">Salir</button>
              </div>
            </div>
          </div>
        )}

        {/* Pre-game overlay */}
        {(["pre","requesting","allowed","blocked","calibrating","noisy"] as (typeof phase)[]).includes(phase)&&(
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white/96 rounded-3xl p-5 w-full max-w-xs shadow-lg border border-[#E8E5F4]">
              {phase==="pre"&&(
                <>
                  <div className="text-center mb-3">
                    <h2 className="text-xl font-black text-[#1C1135]">Voz Aventura</h2>
                    <p className="text-[#7C6F9A] text-sm font-medium">¡Usa tu voz para volar!</p>
                  </div>
                  <div className="bg-violet-50 rounded-2xl p-3 mb-3 text-center border border-violet-100">
                    <p className="text-violet-700 text-sm font-semibold">Habla para subir · Silencio para bajar</p>
                  </div>
                  <div className="flex items-start gap-2 mb-3 text-xs text-[#7C6F9A] p-2.5 rounded-xl" style={{background:"#F8F7FF"}}>
                    <span className="mt-0.5">🔒</span>
                    <p>El micrófono se utiliza únicamente mientras juegas. No se guarda ni se reproduce tu voz.</p>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-[#7C6F9A] font-medium">Mejor tiempo:</span>
                    <span className="font-extrabold text-[#0D9488]">{bestTime}s · Mateo</span>
                  </div>
                  <button onClick={requestMic} className="w-full py-3 rounded-2xl text-white font-extrabold mb-2" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>🎤 Preparar micrófono</button>
                  <button onClick={startTouchMode} className="w-full py-2.5 rounded-2xl font-bold text-sm border border-[#E8E5F4] text-[#7C6F9A]">👆 Jugar tocando la pantalla</button>
                </>
              )}
              {phase==="requesting"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3 animate-pulse">🎤</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Solicitando permiso...</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Acepta el permiso del micrófono en tu navegador</p>
                  <button onClick={startTouchMode} className="py-2 rounded-xl text-xs font-bold text-[#7C6F9A] border border-[#E8E5F4] px-4">Saltar y jugar con toque</button>
                </div>
              )}
              {phase==="calibrating"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3">🔊</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Calibrando sonido...</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Guarda silencio un momento</p>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-400 animate-pulse" style={{width:"65%"}} />
                  </div>
                </div>
              )}
              {phase==="noisy"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3">📢</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Entorno demasiado ruidoso</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Intenta jugar en un lugar más tranquilo, o usa el modo táctil.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={requestMic} className="py-2.5 rounded-2xl text-white font-extrabold text-sm" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>Intentar nuevamente</button>
                    <button onClick={startTouchMode} className="py-2 rounded-xl text-sm font-bold text-[#7C6F9A] border border-[#E8E5F4]">👆 Jugar con toque / teclado</button>
                    <button onClick={()=>setP("pre")} className="py-1.5 rounded-xl text-xs font-bold text-[#9E95B7]">Volver</button>
                  </div>
                </div>
              )}
              {phase==="blocked"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3">🎤</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Micrófono no disponible</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">No fue posible acceder al micrófono. Puedes igualmente jugar tocando la pantalla o con las teclas ↑ / Espacio.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={startTouchMode} className="py-2.5 rounded-2xl text-white font-extrabold text-sm" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>👆 Jugar con toque / teclado</button>
                    <button onClick={requestMic} className="py-2 rounded-xl text-sm font-bold text-[#7C6F9A] border border-[#E8E5F4]">Intentar micrófono de nuevo</button>
                    <button onClick={()=>setP("pre")} className="py-1.5 rounded-xl text-xs font-bold text-[#9E95B7]">Volver</button>
                  </div>
                </div>
              )}
              {phase==="allowed"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">¡Micrófono listo!</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Di una palabra para confirmar que te escuchamos</p>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-100" style={{width:`${micPct}%`,background:isSpeaking?"#7C3AED":"#CBD5E1"}} />
                  </div>
                  <p className="text-xs font-bold mb-4" style={{color:isSpeaking?"#7C3AED":"#94A3B8"}}>{isSpeaking?"✓ Voz detectada":"Habla ahora..."}</p>
                  <button onClick={startCountdown} className="w-full py-3 rounded-2xl text-white font-extrabold transition-all" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>
                    🚀 Comenzar aventura
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>);
}

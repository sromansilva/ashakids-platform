import { useVozAventuraGame } from "@/pages/padre/MundoAsha/useVozAventuraGame";
import { VozAventuraGameVozAventura } from "@/pages/padre/MundoAsha/VozAventuraGameVozAventura";


export function VozAventuraGame() {
const { canvasRef, animRef, micStreamRef, analyserRef, audioCtxRef, phaseRef, noiseFloorRef, smoothedRef, isSpeakingRef, survivedRef, lastTickRef, bestTimeRef, isFirstRef, touchHeldRef, useMicRef, phase, setPhase, countdown, setCountdown, survivedSecs, setSurvivedSecs, bestTime, setBestTime, attemptNum, setAttemptNum, isSpeaking, setIsSpeaking, micPct, setMicPct, lastResult, setLastResult, inputMode, setInputMode, gRef, stopMic, getRaw, setP, requestMic, startCountdown, startTouchMode, getFeedback } = useVozAventuraGame();
if(phase==="done"&&lastResult){
    const stars=isFirstRef.current?15:0;
    if(isFirstRef.current) isFirstRef.current=false;
    const diff=lastResult.survived-lastResult.prevBest;
    return(
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex-1 rounded-2xl p-5" style={{background:"linear-gradient(135deg,#EDE9FE,#E0F2FE)"}}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🦋</div>
            <h2 className="text-2xl font-black text-[#1C1135]">¡Buen intento!</h2>
            <p className="text-[#7C6F9A] font-medium text-sm">Tu aventura duró {lastResult.survived} segundo{lastResult.survived!==1?"s":""}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-[#E8E5F4]">
              <p className="text-xs text-[#7C6F9A] font-medium mb-1">Tiempo</p>
              <p className="text-3xl font-black text-[#7C3AED]">{lastResult.survived}<span className="text-base ml-1">s</span></p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-[#E8E5F4]">
              <p className="text-xs text-[#7C6F9A] font-medium mb-1">Mejor tiempo</p>
              <p className="text-3xl font-black text-[#0D9488]">{Math.max(lastResult.survived,lastResult.prevBest)}<span className="text-base ml-1">s</span></p>
            </div>
          </div>
          {lastResult.isRecord&&(
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3 text-center">
              <p className="text-amber-700 font-extrabold text-sm">🏆 ¡Nuevo récord! Superaste tu mejor tiempo por {diff} segundo{diff!==1?"s":""}</p>
            </div>
          )}
          {stars>0?(
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-3 mb-3 text-center">
              <p className="text-violet-700 font-extrabold text-sm">⭐ +{stars} estrellas ganadas</p>
            </div>
          ):(
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-3 text-center">
              <p className="text-gray-500 text-xs">+0 estrellas · Ya recibiste la recompensa de esta actividad. Tu nuevo tiempo sí quedó registrado.</p>
            </div>
          )}
          <div className="bg-white rounded-2xl p-3 mb-3 border border-[#E8E5F4]">
            <p className="text-[#1C1135] font-medium text-sm text-center">{getFeedback(lastResult.survived)}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-[#7C6F9A] mb-4">
            <span>Intento #{attemptNum}</span><span>Mateo · Voz Aventura · Laboratorio de Juegos</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={startCountdown} className="w-full py-3 rounded-2xl text-white font-extrabold text-base" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>🔄 Jugar de nuevo</button>
            <button onClick={()=>setP("pre")} className="w-full py-2.5 rounded-2xl font-bold text-sm text-[#7C6F9A] border border-[#E8E5F4] bg-white">Volver al Laboratorio</button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <VozAventuraGameVozAventura canvasRef={canvasRef} phase={phase} inputMode={inputMode} touchHeldRef={touchHeldRef} countdown={countdown} survivedSecs={survivedSecs} micPct={micPct} isSpeaking={isSpeaking} setP={setP} bestTime={bestTime} lastTickRef={lastTickRef} startCountdown={startCountdown} stopMic={stopMic} requestMic={requestMic} startTouchMode={startTouchMode} />
  );

}

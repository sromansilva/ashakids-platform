import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Square, RefreshCw, Volume2, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { voiceService, type TranscripcionRespuesta, type ComparacionResultado } from '@/services/voiceService';
import { speakForChild } from './speakForChild';

import type { GameProgress } from '@/services/learningGames';

export type VoiceGameState = 'ready' | 'requesting' | 'recording' | 'processing' | 'transcribed' | 'empty' | 'error' | 'blocked';

interface VoiceSpeechGameProps {
  targetPhrase?: string;
  levelNumber?: number;
  patientId?: number;
  worldVersion?: string;
  onSaved?: (progress: GameProgress) => void;
  onCompleted?: () => void;
  onExit?: () => void;
}

export function VoiceSpeechGame({
  targetPhrase = 'El perro corre',
  levelNumber = 1,
  patientId,
  worldVersion = 'basica-1',
  onSaved,
  onCompleted,
  onExit,
}: VoiceSpeechGameProps) {
  const [state, setState] = useState<VoiceGameState>('ready');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcription, setTranscription] = useState<TranscripcionRespuesta | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [helps, setHelps] = useState(0);
  const [savedNotice, setSavedNotice] = useState<{ id_intento?: number; xp: number } | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Limpieza al desmontar
  const cleanupStream = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop(); } catch { /* Inactivo */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupStream();
    };
  }, [cleanupStream]);

  // Selección de MIME soportado por el navegador
  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
    return candidates.find(cand => MediaRecorder.isTypeSupported(cand)) || '';
  };

  // Iniciar grabación
  const startRecording = async () => {
    setErrorMessage('');
    setTranscription(null);
    setSavedNotice(null);
    setState('requesting');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState('blocked');
        setErrorMessage('Tu navegador no permite acceso al micrófono.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (!isMountedRef.current) return;
        const mime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mime });

        // Si es demasiado pequeño (< 500 bytes), considerar vacío
        if (audioBlob.size < 500) {
          setState('empty');
          setErrorMessage('La grabación fue muy breve o no capturó sonido.');
          return;
        }

        // Procesar en backend con Whisper y persistir intento si hay contexto de paciente
        setState('processing');
        try {
          const claveIntento = crypto.randomUUID();
          const resultado = await voiceService.transcribe(audioBlob, {
            targetPhrase,
            patientId,
            level: levelNumber,
            claveIntento,
            duracionSegundos: Math.max(1, elapsedSeconds),
            ayudasUsadas: helps,
          });
          if (!isMountedRef.current) return;

          setTranscription(resultado);
          if (resultado.estado === 'AUDIO_VACIO' || resultado.estado === 'AUDIO_CORTO') {
            setState('empty');
            setErrorMessage(resultado.mensaje || 'No detectamos palabras claras.');
          } else if (resultado.estado === 'OK') {
            setState('transcribed');
            if (resultado.guardado && resultado.resumen) {
              setSavedNotice({
                id_intento: resultado.id_intento,
                xp: resultado.experiencia_otorgada ?? 0,
              });
              onSaved?.(resultado.resumen);
            }
            if (resultado.comparacion?.es_coincidente && onCompleted) {
              onCompleted();
            }
          } else {
            setState('error');
            setErrorMessage(resultado.mensaje || 'Hubo un inconveniente al procesar el audio.');
          }
        } catch (err) {
          if (!isMountedRef.current) return;
          setState('error');
          setErrorMessage(
            err instanceof Error ? err.message : 'No se pudo conectar con el servicio de transcripción.'
          );
        }
      };

      recorder.start(250); // Emitir chunks cada 250ms
      setState('recording');
      setElapsedSeconds(0);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(sec => {
          // Límite de seguridad: máximo 20 segundos de grabación infantil
          if (sec >= 19) {
            stopRecording();
            return 20;
          }
          return sec + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setState('blocked');
      const isDenied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      setErrorMessage(
        isDenied
          ? 'Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador para continuar.'
          : 'No se pudo acceder al micrófono del dispositivo.'
      );
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Escuchar la frase modelo con síntesis de voz (TTS)
  const handleListenPrompt = () => {
    setHelps(h => h + 1);
    speakForChild(targetPhrase);
  };

  // Reiniciar para un nuevo intento
  const handleRetry = () => {
    cleanupStream();
    setTranscription(null);
    setErrorMessage('');
    setElapsedSeconds(0);
    setSavedNotice(null);
    setState('ready');
  };

  const comp: ComparacionResultado | undefined = transcription?.comparacion;

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4 sm:p-6 bg-white/95 rounded-2xl border border-violet-100 shadow-sm" aria-live="polite">
      {/* Encabezado y navegación */}
      <div className="flex items-center justify-between pb-2 border-b border-violet-100">
        {onExit && (
          <Btn variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft size={16} /> Volver a niveles
          </Btn>
        )}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          Nivel {levelNumber} · El Estudio de la Voz
        </span>
      </div>

      {/* Frase objetivo a pronunciar */}
      <div className="text-center space-y-3 py-2">
        <p className="text-sm text-slate-500 font-medium">Pronuncia la siguiente frase en voz alta:</p>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 shadow-inner inline-block w-full">
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1C1135] tracking-wide" data-testid="target-phrase">
            «{targetPhrase}»
          </p>
        </div>
        <div>
          <Btn variant="outline" size="sm" onClick={handleListenPrompt} title="Escuchar pronunciación guiada">
            <Volume2 size={16} className="text-blue-600" /> Escuchar frase modelo
          </Btn>
        </div>
      </div>

      {/* Panel interactivo según estado */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-h-[210px] text-center space-y-4">
        {/* ESTADO: LISTO */}
        {state === 'ready' && (
          <>
            <p className="text-sm text-slate-600">
              Cuando estés listo, presiona el botón para comenzar a hablar.
            </p>
            <button
              type="button"
              onClick={startRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Iniciar grabación de voz"
              data-testid="record-btn"
            >
              <Mic size={36} className="transition-transform group-hover:scale-110" />
            </button>
            <p className="text-xs text-slate-400">El audio se procesa en tu equipo y no se almacena permanentemente.</p>
          </>
        )}

        {/* ESTADO: SOLICITANDO PERMISO */}
        {state === 'requesting' && (
          <>
            <Loader2 size={36} className="text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Activando micrófono…</p>
            <p className="text-xs text-slate-500">Por favor, concede el permiso en tu navegador si te lo solicita.</p>
          </>
        )}

        {/* ESTADO: GRABANDO */}
        {state === 'recording' && (
          <>
            <div className="relative flex items-center justify-center">
              <span className="absolute w-24 h-24 rounded-full bg-red-400/30 animate-ping" />
              <button
                type="button"
                onClick={stopRecording}
                className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
                aria-label="Detener grabación"
                data-testid="stop-btn"
              >
                <Square size={30} fill="currentColor" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-600 animate-pulse flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Grabando tu voz ({elapsedSeconds}s)
              </p>
              <p className="text-xs text-slate-500">Presiona el botón rojo cuando hayas terminado de decir la frase.</p>
            </div>
          </>
        )}

        {/* ESTADO: PROCESANDO */}
        {state === 'processing' && (
          <>
            <Loader2 size={40} className="text-indigo-600 animate-spin" />
            <p className="text-base font-bold text-indigo-900" role="status">
              Escuchando y transcribiendo tu voz con Whisper…
            </p>
            <p className="text-xs text-slate-500">Un momento, estamos analizando las palabras con el modelo local.</p>
          </>
        )}

        {/* ESTADO: TRANSCRITO / RESULTADO */}
        {state === 'transcribed' && transcription && (
          <div className="w-full space-y-4 text-left" data-testid="transcription-result">
            {/* Mensaje motivacional infantil */}
            <div className={`p-4 rounded-xl flex items-start gap-3 ${
              comp?.es_coincidente
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}>
              {comp?.es_coincidente ? (
                <Sparkles size={24} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={24} className="text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-base">
                  {comp?.es_coincidente
                    ? '¡Excelente pronunciación! 🎉'
                    : '¡Buen intento! Estuviste muy cerca ✨'}
                </h4>
                <p className="text-xs mt-1">
                  {comp?.es_coincidente
                    ? 'Has dicho todas las palabras de la frase con gran claridad.'
                    : 'Puedes escuchar la frase modelo de nuevo e intentar repetirla despacio.'}
                </p>
              </div>
            </div>

            {/* Lo que escuchó el sistema */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Lo que escuchó el explorador:
              </span>
              <p className="text-lg font-bold text-slate-800 italic" data-testid="transcribed-text">
                «{transcription.transcripcion}»
              </p>

              {/* Desglose de palabras esperadas */}
              {comp && comp.desglose && comp.desglose.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-slate-500 mr-1">Palabras:</span>
                  {comp.desglose.map((pal, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pal.estado === 'correcta'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pal.palabra} {pal.estado === 'correcta' ? '✓' : '—'}
                    </span>
                  ))}
                  {comp.palabras_adicionales.length > 0 && (
                    <span className="text-xs text-slate-400 ml-1">
                      (adicionales: {comp.palabras_adicionales.join(', ')})
                    </span>
                  )}
                </div>
              )}

              {/* Métrica de coincidencia lúdica */}
              {comp && (
                <div className="pt-2 text-right">
                  <span className="text-xs text-slate-500 font-medium">
                    Coincidencia textual: <strong className="text-indigo-700">{comp.porcentaje_coincidencia}%</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Banner de confirmación de persistencia de progreso */}
            {savedNotice && (
              <div
                className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 flex items-center justify-between text-xs font-semibold"
                role="status"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-violet-600" />
                  Intento guardado en tu progreso
                </span>
                {savedNotice.xp > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-200 text-violet-900 font-bold">
                    +{savedNotice.xp} XP
                  </span>
                )}
              </div>
            )}

            {/* Controles para repetir o continuar */}
            <div className="flex gap-2 flex-wrap justify-center pt-2">
              <Btn variant="outline" size="sm" onClick={handleRetry} data-testid="retry-btn">
                <RefreshCw size={15} /> Intentar de nuevo
              </Btn>
              {comp?.es_coincidente && onExit && (
                <Btn size="sm" onClick={onExit}>
                  <CheckCircle2 size={15} /> Finalizar nivel
                </Btn>
              )}
            </div>
          </div>
        )}

        {/* ESTADO: AUDIO VACÍO O CORTO */}
        {state === 'empty' && (
          <div className="space-y-3">
            <AlertCircle size={36} className="text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800">No pudimos escuchar tu voz</h4>
            <p className="text-sm text-slate-600 max-w-sm">
              {errorMessage || 'Asegúrate de hablar cerca del micrófono con voz clara y tranquila.'}
            </p>
            <Btn size="sm" onClick={handleRetry}>
              <RefreshCw size={15} /> Volver a intentar
            </Btn>
          </div>
        )}

        {/* ESTADO: ERROR RECUPERABLE */}
        {state === 'error' && (
          <div className="space-y-3">
            <AlertCircle size={36} className="text-red-500 mx-auto" />
            <h4 className="font-bold text-slate-800">Ocurrió un problema temporal</h4>
            <p className="text-sm text-slate-600 max-w-sm">
              {errorMessage || 'No se pudo completar el reconocimiento. Intenta grabar de nuevo.'}
            </p>
            <Btn size="sm" onClick={handleRetry}>
              <RefreshCw size={15} /> Reintentar grabación
            </Btn>
          </div>
        )}

        {/* ESTADO: MICRÓFONO BLOQUEADO / DENEGADO */}
        {state === 'blocked' && (
          <div className="space-y-3">
            <MicOff size={36} className="text-rose-500 mx-auto" />
            <h4 className="font-bold text-slate-800">Micrófono no disponible</h4>
            <p className="text-sm text-slate-600 max-w-sm">
              {errorMessage || 'Verifica que tu navegador tenga permiso para usar el micrófono en este sitio.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Btn variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw size={15} /> Comprobar de nuevo
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Nota de delimitación no clínica obligatoria */}
      <p className="text-[11px] text-slate-400 text-center leading-relaxed italic">
        🔒 Actividad formativa: La coincidencia de texto es una herramienta lúdica y no constituye
        un diagnóstico ni una evaluación clínica fonoaudiológica. Las grabaciones se procesan de forma
        efímera y no se almacenan.
      </p>
    </div>
  );
}

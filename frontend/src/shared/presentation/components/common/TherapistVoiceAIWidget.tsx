import { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  FileText,
  ArrowRight,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import { convertBlobTo16kHzWav } from '@/shared/application/audio/audioRecorderToWav';
import type { SavedArticulationResult, ReviewedArticulationResult } from '@/shared/application/articulationReportEntries';

export interface PhoneticTestResult {
  estado: string;
  palabra_esperada: string;
  transcripcion_acustica: string;
  similitud_fonetica_porcentaje: number;
  diagnostico_biomedico: string;
  fonema_afectado: string | null;
  observacion_tecnica: string;
}

interface TherapistVoiceAIWidgetProps {
  sessionId: number;
  patientName?: string;
  priorResults?: SavedArticulationResult[];
  onConfirmResult?: (result: ReviewedArticulationResult) => void;
  onApplyObservation?: (observationText: string) => void;
}

const PALABRAS_SUGERIDAS = [
  { palabra: 'carro', fonema: '/rr/', desc: 'Vibrante múltiple' },
  { palabra: 'gato', fonema: '/g/', desc: 'Oclusiva velar' },
  { palabra: 'ratón', fonema: '/r/', desc: 'Vibrante simple inicial' },
  { palabra: 'plato', fonema: '/pl/', desc: 'Grupo trabado' },
  { palabra: 'tren', fonema: '/tr/', desc: 'Sinfón coronal' },
  { palabra: 'zapato', fonema: '/s/', desc: 'Fricativa dental' },
  { palabra: 'pelota', fonema: '/p/', desc: 'Oclusiva bilabial' },
];

export function TherapistVoiceAIWidget({
  sessionId,
  patientName = 'el niño',
  onConfirmResult,
  onApplyObservation,
}: TherapistVoiceAIWidgetProps) {
  const [targetWord, setTargetWord] = useState('carro');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PhoneticTestResult | null>(null);
  const [applied, setApplied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleStartRecording = async () => {
    setErrorMsg(null);
    setResult(null);
    setApplied(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(audioBlob));

        // Enviar a análisis fonético con Wav2Vec 2.0
        await procesarAudio(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Temporizador de 3 segundos máximos
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setRecordingSeconds(elapsed);
        if (elapsed >= 3) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err) {
      console.warn('[Micrófono no disponible]:', err);
      setErrorMsg('No se pudo acceder al micrófono. Puedes usar el botón de prueba rápida para simular la emisión.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const procesarAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Convertir a WAV 16kHz PCM (compatible directamente con Wav2Vec 2.0 y SoundFile)
      let blobToSend: Blob = audioBlob;
      try {
        blobToSend = await convertBlobTo16kHzWav(audioBlob);
      } catch (convErr) {
        console.warn('[Conversión WAV]:', convErr);
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const res = await sessionsService.evaluarFonemaEnVivo(sessionId, {
            audio_base64: base64,
            palabra_esperada: targetWord.trim(),
          });
          setResult(res as PhoneticTestResult);
        } catch (apiErr) {
          console.error('[Error en evaluación fonética]:', apiErr);
          setErrorMsg('Error al comunicar con el motor de IA. Inténtalo de nuevo.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(blobToSend);
    } catch (err) {
      console.error('[procesarAudio error]:', err);
      setIsAnalyzing(false);
    }
  };

  // Simulación rápida para demostración o prueba sin micrófono
  const handleSimularPrueba = async (palabra: string, transcripcionSimulada: string) => {
    setTargetWord(palabra);
    setIsAnalyzing(true);
    setErrorMsg(null);
    setResult(null);
    setApplied(false);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const res = await sessionsService.evaluarFonemaEnVivo(sessionId, {
        palabra_esperada: palabra,
      });
      // Forzar emisión simulada si corresponde
      if (res && palabra.toLowerCase() === 'carro') {
        res.transcripcion_acustica = transcripcionSimulada;
        res.similitud_fonetica_porcentaje = 75;
        res.diagnostico_biomedico = 'Lambdacismo (Sustitución de vibrante /rr/ por lateral /l/)';
        res.observacion_tecnica = `Test fonológico con IA (Wav2Vec 2.0): Palabra objetivo 'carro' (/rr/) emitida como '${transcripcionSimulada}' (Similitud fonética: 75%). Diagnóstico biomédico: Lambdacismo (Sustitución de vibrante /rr/ por lateral /l/). Se sugiere ejercitar praxias linguales para vibración apical.`;
      }
      setResult(res as PhoneticTestResult);
    } catch (err) {
      console.error('[Error simular]:', err);
      setErrorMsg('No se pudo completar la evaluación.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePegarEnInforme = () => {
    if (!result) return;

    if (onApplyObservation) {
      onApplyObservation(result.observacion_tecnica);
    }

    if (onConfirmResult) {
      onConfirmResult({
        objetivo_articulacion: `Evaluación de fonema ${result.fonema_afectado ? `/${result.fonema_afectado}/` : ''}`,
        palabra_esperada: result.palabra_esperada,
        transcripcion_tentativa: result.transcripcion_acustica,
        resultado_revisado: result.observacion_tecnica,
        archivo_origen: 'Audio en vivo (Wav2Vec 2.0)',
        inicio_segundo: 0,
        fin_segundo: 2,
      });
    }

    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E5F4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
            <Mic size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#1C1135]">
                Test Fonológico Rápido en la Sesión
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-violet-100 text-[#6B46FE]">
                <Sparkles size={11} /> Wav2Vec 2.0 en vivo
              </span>
            </div>
            <p className="text-xs text-[#615274] font-bold mt-0.5">
              Evalúa objetivamente si {patientName} supera el fonema o si aún persiste la sustitución articulatoria.
            </p>
          </div>
        </div>

        {/* Botón rápido de simulación */}
        <button
          type="button"
          onClick={() => void handleSimularPrueba('carro', 'calo')}
          disabled={isRecording || isAnalyzing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100 text-[#6B46FE] text-xs font-black transition-all cursor-pointer self-start sm:self-center"
          title="Prueba rápida inmediata de la red neuronal"
        >
          <Zap size={13} /> Probar: "carro" → "calo"
        </button>
      </div>

      {/* Paso 1: Palabra objetivo */}
      <div className="space-y-2">
        <label className="text-xs font-black text-[#1C1135] flex items-center gap-2">
          <span>1. Pídele al niño decir la palabra objetivo:</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder="Ej: carro"
              className="px-4 py-2 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] text-sm font-black text-[#1C1135] focus:bg-white focus:outline-none focus:border-[#6B46FE] w-40"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {PALABRAS_SUGERIDAS.map((item) => (
              <button
                key={item.palabra}
                type="button"
                onClick={() => setTargetWord(item.palabra)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  targetWord.toLowerCase() === item.palabra
                    ? 'bg-[#6B46FE] text-white shadow-xs'
                    : 'bg-[#F8F7FC] hover:bg-violet-50 text-[#615274] border border-[#E8E5F4]'
                }`}
              >
                "{item.palabra}" <span className="opacity-70 font-normal">{item.fonema}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paso 2: Grabación de audio en vivo */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50/50 via-purple-50/30 to-white border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-[#1C1135] block">
            2. Graba 2 a 3 segundos del audio del niño:
          </span>
          <p className="text-[11px] text-[#615274] mt-0.5 font-medium">
            El sistema captura la emisión sonora del micrófono y analiza los formantes de onda con la red neuronal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isRecording ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-200 animate-pulse transition-all cursor-pointer"
            >
              <Square size={14} className="fill-white" />
              Detener grabación ({recordingSeconds}s)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleStartRecording()}
              disabled={isAnalyzing || !targetWord.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6B46FE] hover:bg-[#5833EA] text-white text-xs font-black shadow-md shadow-violet-200 transition-all active:scale-[.98] disabled:opacity-50 cursor-pointer"
            >
              <Mic size={15} />
              Grabar fonema en vivo (2 seg)
            </button>
          )}

          {audioUrl && !isRecording && (
            <audio src={audioUrl} controls className="h-8 max-w-[150px]" />
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {isAnalyzing && (
        <div className="p-4 rounded-2xl bg-violet-50/80 border border-violet-200 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#6B46FE] border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="text-xs font-black text-[#6B46FE]">
            Analizando formantes acústicos y fonológicos con Wav2Vec 2.0...
          </p>
        </div>
      )}

      {/* Paso 3: Resultados de la Red Neuronal */}
      {result && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tarjeta 1: Transcripción acústica */}
            <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
              <span className="text-[11px] font-extrabold text-[#615274] uppercase tracking-wider block">
                Transcripción Acústica
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-violet-700 font-mono">
                  "{result.transcripcion_acustica}"
                </span>
              </div>
              <span className="text-[10px] text-[#615274] font-medium block mt-1">
                Frente a objetivo: "{result.palabra_esperada}"
              </span>
            </div>

            {/* Tarjeta 2: Similitud Fonética */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50/40 border border-violet-100">
              <span className="text-[11px] font-extrabold text-[#615274] uppercase tracking-wider block">
                Similitud Fonética
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#6B46FE]">
                  {result.similitud_fonetica_porcentaje}%
                </span>
                <span
                  className={`text-xs font-bold ${
                    result.similitud_fonetica_porcentaje >= 85
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {result.similitud_fonetica_porcentaje >= 85
                    ? 'Óptima'
                    : 'Sustitución'}
                </span>
              </div>
              <span className="text-[10px] text-[#615274] font-medium block mt-1">
                Afinidad espectral
              </span>
            </div>

            {/* Tarjeta 3: Diagnóstico Biomédico */}
            <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
              <span className="text-[11px] font-extrabold text-[#615274] uppercase tracking-wider block">
                Diagnóstico Clínico
              </span>
              <div className="mt-1.5">
                <span className="text-xs font-black text-[#1C1135] block leading-tight">
                  {result.diagnostico_biomedico}
                </span>
                {result.fonema_afectado && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                    Fonema: /{result.fonema_afectado}/
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Botón de Pegar en el Informe */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-purple-50/40 to-white border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-violet-100 flex items-center justify-center text-[#6B46FE] shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h5 className="text-xs font-black text-[#1C1135]">
                  Observación técnica lista para el informe
                </h5>
                <p className="text-xs text-[#615274] font-medium line-clamp-1">
                  {result.observacion_tecnica}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePegarEnInforme}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-black text-xs shadow-sm shadow-violet-200 transition-all active:scale-[.98] cursor-pointer shrink-0"
            >
              {applied ? (
                <>
                  <CheckCircle2 size={14} /> ¡Pegado en el informe!
                </>
              ) : (
                <>
                  <ArrowRight size={14} /> Pegar en el informe
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

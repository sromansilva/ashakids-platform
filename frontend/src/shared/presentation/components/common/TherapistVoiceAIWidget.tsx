import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Mic, Square } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { clinicaService, sessionsService, type FamilyCaptureStatus } from '@/modules/clinica/infrastructure/clinicalService';
import { ApiError } from '@/core/api/client';
import type { ReviewedArticulationResult } from '@/shared/application/articulationReportEntries';
import { useFamilyCaptureResult } from '@/shared/application/hooks/useFamilyCaptureResult';
import {
  PHONETIC_TARGETS,
  PHONETIC_SAMPLE_RATE,
  PHONETIC_PACKET_SAMPLES,
  PHONETIC_MAX_CAPTURE_SAMPLES,
  encodePcm16,
} from '@/shared/application/audio/phoneticCaptureConstants';
import { NO_VOICE_MESSAGE, VoiceLevelTracker } from '@/shared/application/audio/voiceSignal';
import { AudioDecibelMeter } from '@/shared/presentation/components/common/AudioDecibelMeter';
import { PhoneticReviewCard, type PendingPhoneticReview } from '@/shared/presentation/components/common/PhoneticReviewCard';
import { MLServiceUnavailableBanner } from '@/shared/presentation/components/common/MLServiceUnavailableBanner';

type TranscriptionResult = NonNullable<FamilyCaptureStatus['resultado']>;

const OWN_ORIGIN = 'Micrófono de este dispositivo durante la sesión';
const FAMILY_ORIGIN = 'Micrófono del dispositivo familiar; sin pista remota de Google Meet';
const RECOVERED_ORIGIN = 'Muestra de la sesión recuperada para revisión del terapeuta';

interface TherapistVoiceAIWidgetProps {
  sessionId: number;
  patientId?: number;
  patientName?: string;
  onConfirmResult?: (result: ReviewedArticulationResult) => void;
}

export function TherapistVoiceAIWidget({
  sessionId,
  patientId,
  patientName = 'el niño',
  onConfirmResult,
}: TherapistVoiceAIWidgetProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [targetWord, setTargetWord] = useState('carro');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mlOffline, setMlOffline] = useState(false);
  const [familyCaptureId, setFamilyCaptureId] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const muteRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef(false);
  const captureIdRef = useRef<string | null>(null);
  const packetNumberRef = useRef(0);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const uploadFailedRef = useRef(false);
  const packetSamplesRef = useRef(new Float32Array(PHONETIC_PACKET_SAMPLES));
  const packetSamplesCountRef = useRef(0);
  const totalSamplesRef = useRef(0);
  const captureStartedAtRef = useRef(0);
  const levelRef = useRef(new VoiceLevelTracker());
  const originsRef = useRef(new Map<number, { origin: string; duration: number | null }>());

  // Las muestras PENDIENTE_REVISION sobreviven a una recarga y a un panel cerrado: se leen del
  // servidor (indicadores recalculados allí). Solo equipo clínico; la familia no recibe estos datos.
  const pendingKey = [user?.id_usuario, 'phonological-evaluations', patientId];
  const pendingQuery = useQuery({
    queryKey: pendingKey,
    queryFn: ({ signal }) => clinicaService.phonologicalEvaluations(patientId!, signal),
    enabled: !!user && !!patientId,
    refetchInterval: 10_000,
  });
  const pending: PendingPhoneticReview[] = (pendingQuery.error ? [] : pendingQuery.data ?? [])
    .filter((row) => row.id_sesion === sessionId && row.estado === 'PENDIENTE_REVISION' && !!row.palabra_objetivo)
    .map((row) => {
      const known = originsRef.current.get(row.id_evaluacion);
      return {
        id_evaluacion: row.id_evaluacion,
        palabra_esperada: row.palabra_objetivo!,
        transcripcion_tentativa: row.transcripcion_detectada ?? '',
        duracion_segundos: known?.duration ?? null,
        origen: known?.origin ?? RECOVERED_ORIGIN,
        ...(row.similitud_texto_porcentaje != null && row.tipo_error_sugerido ? {
          indicadores_apoyo: {
            similitud_texto_porcentaje: row.similitud_texto_porcentaje,
            tipo_error_sugerido: row.tipo_error_sugerido,
            hipotesis_sugerida: row.hipotesis_sugerida ?? null,
          },
        } : {}),
      };
    });
  const registerResult = (result: TranscriptionResult, origin: string) => {
    originsRef.current.set(result.id_evaluacion, { origin, duration: result.duracion_segundos });
    setError(null);
    setSaved(false);
    void pendingQuery.refetch();
  };

  useEffect(() => {
    let active = true;
    setConsent(null);
    if (!patientId) {
      setConsent(false);
      return () => { active = false; };
    }
    clinicaService.getConsent(patientId)
      .then((result) => { if (active) setConsent(result.consentido); })
      .catch(() => { if (active) setConsent(false); });
    return () => { active = false; };
  }, [patientId]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordingRef.current = false;
    if (processorRef.current) processorRef.current.onaudioprocess = null;
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    muteRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    packetSamplesRef.current.fill(0);
    const context = audioContextRef.current;
    if (context && context.state !== 'closed') void context.close().catch(() => undefined);
    const captureId = captureIdRef.current;
    captureIdRef.current = null;
    if (captureId) {
      void uploadQueueRef.current.finally(() => sessionsService.descartarCapturaFonologica(sessionId, captureId).catch(() => undefined));
    }
  }, [sessionId]);

  useFamilyCaptureResult(sessionId, familyCaptureId, (result) => {
    registerResult(result, FAMILY_ORIGIN);
    setFamilyCaptureId(null);
  }, () => {
    setError('La solicitud de captura familiar expiró. Solicita una nueva muestra durante la sesión.');
    setFamilyCaptureId(null);
  });

  const queuePcmPacket = (samples: Float32Array) => {
    const captureId = captureIdRef.current;
    if (!captureId || samples.length === 0) return;
    const packetNumber = packetNumberRef.current++;
    const packet = encodePcm16(samples);
    uploadQueueRef.current = uploadQueueRef.current.then(async () => {
      if (uploadFailedRef.current) {
        packet.fill(0);
        return;
      }
      const formData = new FormData();
      const packetCopy = packet.buffer.slice(packet.byteOffset, packet.byteOffset + packet.byteLength) as ArrayBuffer;
      formData.append('audio', new Blob([packetCopy], { type: 'application/octet-stream' }), `paquete-${packetNumber}.pcm`);
      formData.append('numero_paquete', String(packetNumber));
      try {
        await sessionsService.enviarPaqueteFonologico(sessionId, captureId, formData);
      } catch {
        uploadFailedRef.current = true;
      } finally {
        formData.delete('audio');
        packet.fill(0);
      }
    });
  };

  const stopAudioDevices = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    muteRef.current?.disconnect();
    muteRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => undefined);
  };

  const stopRecording = () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    stopAudioDevices();
    const pendingSamples = packetSamplesCountRef.current;
    if (pendingSamples > 0) {
      queuePcmPacket(packetSamplesRef.current.slice(0, pendingSamples));
      packetSamplesRef.current.fill(0);
      packetSamplesCountRef.current = 0;
    }
    const captureId = captureIdRef.current;
    if (!captureId) return;
    setError(null);
    if (!levelRef.current.hasVoice) {
      // Señal insuficiente: no se envía al modelo ni se crea ninguna evaluación.
      setError(NO_VOICE_MESSAGE);
      captureIdRef.current = null;
      void uploadQueueRef.current.finally(() => sessionsService.descartarCapturaFonologica(sessionId, captureId).catch(() => undefined));
      return;
    }
    setAnalyzing(true);
    void (async () => {
      try {
        await uploadQueueRef.current;
        if (uploadFailedRef.current) throw new Error('packet-upload-failed');
        if (totalSamplesRef.current < PHONETIC_SAMPLE_RATE * 2 || totalSamplesRef.current > PHONETIC_MAX_CAPTURE_SAMPLES) {
          throw new Error('invalid-duration');
        }
        const response = await sessionsService.finalizarCapturaFonologica(sessionId, captureId);
        registerResult(response, OWN_ORIGIN);
        setMlOffline(false);
      } catch (err: unknown) {
        const isOffline = typeof err === 'object' && err !== null && ('status' in err && (err as { status: number }).status === 503);
        if (isOffline) {
          setMlOffline(true);
        } else if (err instanceof ApiError && err.status === 422 && err.message === NO_VOICE_MESSAGE) {
          setError(NO_VOICE_MESSAGE);
        } else {
          setError('No se pudo transcribir la muestra. Revisa la conexión, el consentimiento y que la sesión siga en curso.');
        }
        void sessionsService.descartarCapturaFonologica(sessionId, captureId).catch(() => undefined);
      } finally {
        if (captureIdRef.current === captureId) captureIdRef.current = null;
        setAnalyzing(false);
      }
    })();
  };

  const startRecording = async () => {
    setError(null);
    setSaved(false);
    setMlOffline(false);
    if (consent !== true) {
      setError('Se requiere consentimiento vigente del tutor para enviar audio al servicio de transcripción.');
      return;
    }
    const target = PHONETIC_TARGETS.find((entry) => entry.word === targetWord);
    if (!target) {
      setError('Selecciona una palabra y un fonema disponibles.');
      return;
    }
    let captureId: string | null = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      streamRef.current = stream;
      captureId = crypto.randomUUID();
      await sessionsService.iniciarCapturaFonologica(sessionId, {
        captura_id: captureId,
        palabra_objetivo: target.word,
        fonema_objetivo: target.phoneme,
      });
      captureIdRef.current = captureId;
      packetNumberRef.current = 0;
      uploadQueueRef.current = Promise.resolve();
      uploadFailedRef.current = false;
      packetSamplesRef.current.fill(0);
      packetSamplesCountRef.current = 0;
      totalSamplesRef.current = 0;
      levelRef.current.reset();
      captureStartedAtRef.current = Date.now();

      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) throw new Error('audio-context-unavailable');
      const context = new AudioContextConstructor({ sampleRate: PHONETIC_SAMPLE_RATE });
      audioContextRef.current = context;
      if (context.sampleRate !== PHONETIC_SAMPLE_RATE) throw new Error('unsupported-sample-rate');
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const mute = context.createGain();
      mute.gain.value = 0;
      sourceRef.current = source;
      processorRef.current = processor;
      muteRef.current = mute;
      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        let index = 0;
        while (index < input.length && totalSamplesRef.current < PHONETIC_MAX_CAPTURE_SAMPLES) {
          const room = PHONETIC_PACKET_SAMPLES - packetSamplesCountRef.current;
          const remainingCapture = PHONETIC_MAX_CAPTURE_SAMPLES - totalSamplesRef.current;
          const count = Math.min(room, input.length - index, remainingCapture);
          levelRef.current.push(input.subarray(index, index + count));
          packetSamplesRef.current.set(input.subarray(index, index + count), packetSamplesCountRef.current);
          index += count;
          packetSamplesCountRef.current += count;
          totalSamplesRef.current += count;
          if (packetSamplesCountRef.current === PHONETIC_PACKET_SAMPLES) {
            queuePcmPacket(packetSamplesRef.current);
            packetSamplesRef.current.fill(0);
            packetSamplesCountRef.current = 0;
          }
        }
        for (let channel = 0; channel < event.outputBuffer.numberOfChannels; channel += 1) {
          event.outputBuffer.getChannelData(channel).fill(0);
        }
        setSeconds(Math.floor(totalSamplesRef.current / PHONETIC_SAMPLE_RATE));
        if (totalSamplesRef.current >= PHONETIC_MAX_CAPTURE_SAMPLES) stopRecording();
      };
      source.connect(processor);
      processor.connect(mute);
      mute.connect(context.destination);
      recordingRef.current = true;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        const elapsed = Math.min(3, Math.floor((Date.now() - captureStartedAtRef.current) / 1000));
        setSeconds(elapsed);
        if (elapsed >= 3) stopRecording();
      }, 200);
    } catch {
      recordingRef.current = false;
      stopAudioDevices();
      packetSamplesRef.current.fill(0);
      packetSamplesCountRef.current = 0;
      if (captureId) void sessionsService.descartarCapturaFonologica(sessionId, captureId).catch(() => undefined);
      if (captureIdRef.current === captureId) captureIdRef.current = null;
      setRecording(false);
      setError('No se pudo iniciar la captura de audio PCM a 16 kHz. Revisa el micrófono, el consentimiento y la conexión.');
    }
  };

  const requestFamilyCapture = async () => {
    setError(null);
    setSaved(false);
    if (consent !== true) {
      setError('Se requiere consentimiento vigente del tutor para solicitar una muestra de voz.');
      return;
    }
    const target = PHONETIC_TARGETS.find((entry) => entry.word === targetWord);
    if (!target) {
      setError('Selecciona una palabra y un fonema disponibles.');
      return;
    }
    try {
      const captureId = crypto.randomUUID();
      await sessionsService.solicitarCapturaFamiliar(sessionId, {
        captura_id: captureId,
        palabra_objetivo: target.word,
        fonema_objetivo: target.phoneme,
      });
      setFamilyCaptureId(captureId);
    } catch {
      setError('No se pudo solicitar la muestra familiar. Confirma que la sesión esté en curso y el consentimiento vigente.');
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-violet-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-black text-[#1C1135]">Transcripción fonológica para revisión</h3>
        <p className="mt-1 text-xs text-[#615274]">
          Captura de 2 a 3 segundos desde el micrófono de este dispositivo, con paquetes PCM de 250 ms, cuando {patientName} esté junto al terapeuta.
          El modelo propone una transcripción; los indicadores de apoyo se calculan desde el texto, no tienen validación clínica ni constituyen un diagnóstico.
        </p>
      </div>

      <MLServiceUnavailableBanner
        visible={mlOffline}
        onDismiss={() => setMlOffline(false)}
        onRetry={() => { setMlOffline(false); void startRecording(); }}
      />

      {consent !== true && (
        <p role="note" className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {consent === null
            ? 'Consultando el consentimiento vigente…'
            : 'La transcripción de audio está bloqueada hasta que el tutor otorgue consentimiento vigente.'}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-bold text-[#1C1135]" htmlFor={'phonetic-word-' + sessionId}>Palabra objetivo</label>
        <select
          id={'phonetic-word-' + sessionId}
          value={targetWord}
          disabled={recording || analyzing}
          onChange={(event) => setTargetWord(event.target.value)}
          className="rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] px-3 py-2 text-sm font-bold"
        >
          {PHONETIC_TARGETS.map((target) => <option key={target.word} value={target.word}>{target.word} {target.phoneme}</option>)}
        </select>
      </div>

      {recording && (
        <AudioDecibelMeter
          recording={recording}
          stream={streamRef.current}
          label="Nivel sonoro capturado"
        />
      )}

      {recording ? (
        <button type="button" onClick={stopRecording} disabled={seconds < 2} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
          <Square size={14} /> {seconds < 2 ? `Capturando (${seconds}s)` : `Detener (${seconds}s)`}
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={consent !== true || analyzing || !!familyCaptureId || !targetWord.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            <Mic size={14} /> Grabar en este dispositivo
          </button>
          <button
            type="button"
            onClick={() => void requestFamilyCapture()}
            disabled={consent !== true || analyzing || !!familyCaptureId || !targetWord.trim()}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 disabled:opacity-50"
          >
            <Mic size={14} /> Solicitar muestra en dispositivo familiar
          </button>
        </div>
      )}

      {familyCaptureId && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">Solicitud enviada. La familia debe abrir esta sesión en su dispositivo y tocar “Iniciar prueba de voz”. No se graba Google Meet.</p>}
      {analyzing && <p role="status" className="text-xs font-semibold text-violet-700">Procesando audio temporalmente para obtener una transcripción tentativa…</p>}
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800"><AlertCircle size={15} />{error}</p>}
      {saved && <p role="status" className="flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} />Revisión guardada; el reporte puede guardarse ahora.</p>}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-[#1C1135]">Muestras pendientes de revisión ({pending.length})</h4>
          <ul className="space-y-3">
            {pending.map((item) => (
              <PhoneticReviewCard
                key={item.id_evaluacion}
                item={item}
                onConfirmResult={onConfirmResult}
                onDone={() => {
                  setSaved(true);
                  void queryClient.invalidateQueries({ queryKey: pendingKey });
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

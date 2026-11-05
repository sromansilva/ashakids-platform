import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Mic, Square } from 'lucide-react';
import { sessionsService, type FamilyCapturePending } from '@/modules/clinica/infrastructure/clinicalService';
import {
  PHONETIC_SAMPLE_RATE as SAMPLE_RATE,
  PHONETIC_PACKET_SAMPLES as PACKET_SAMPLES,
  PHONETIC_MIN_CAPTURE_SAMPLES as MIN_SAMPLES,
  PHONETIC_MAX_CAPTURE_SAMPLES as MAX_SAMPLES,
  encodePcm16,
} from '@/shared/application/audio/phoneticCaptureConstants';
import { NO_VOICE_MESSAGE } from '@/shared/application/audio/voiceSignal';
import { ApiError } from '@/core/api/client';
import { AudioDecibelMeter } from '@/shared/presentation/components/common/AudioDecibelMeter';

export function FamilyPhoneticCaptureWidget({ sessionId, patientName = 'el niño' }: { sessionId: number; patientName?: string }) {
  const queryClient = useQueryClient();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const muteRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef(false);
  const captureIdRef = useRef<string | null>(null);
  const packetNumberRef = useRef(0);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const uploadFailedRef = useRef(false);
  const packetSamplesRef = useRef(new Float32Array(PACKET_SAMPLES));
  const packetSamplesCountRef = useRef(0);
  const totalSamplesRef = useRef(0);
  const captureStartedAtRef = useRef(0);

  const query = useQuery({
    queryKey: ['family-phonetic-capture', sessionId],
    queryFn: ({ signal }) => sessionsService.capturaFamiliarPendiente(sessionId, signal),
    refetchInterval: 3000,
  });
  const request: FamilyCapturePending | undefined = query.data;

  const stopDevices = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      processorRef.current.disconnect();
    }
    processorRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    muteRef.current?.disconnect();
    muteRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => undefined);
  };

  const discard = (id: string) => {
    void uploadQueueRef.current.finally(() => sessionsService.descartarCapturaFamiliar(sessionId, id).catch(() => undefined));
  };

  const queuePacket = (samples: Float32Array) => {
    const id = captureIdRef.current;
    if (!id || !samples.length) return;
    const packetNumber = packetNumberRef.current++;
    const packet = encodePcm16(samples);
    uploadQueueRef.current = uploadQueueRef.current.then(async () => {
      if (uploadFailedRef.current) {
        packet.fill(0);
        return;
      }
      const formData = new FormData();
      const copy = packet.buffer.slice(packet.byteOffset, packet.byteOffset + packet.byteLength) as ArrayBuffer;
      formData.append('audio', new Blob([copy], { type: 'application/octet-stream' }), `paquete-${packetNumber}.pcm`);
      formData.append('numero_paquete', String(packetNumber));
      try {
        await sessionsService.enviarPaqueteCapturaFamiliar(sessionId, id, formData);
      } catch {
        uploadFailedRef.current = true;
      } finally {
        formData.delete('audio');
        packet.fill(0);
      }
    });
  };

  const stopRecording = () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    stopDevices();
    const count = packetSamplesCountRef.current;
    if (count > 0) {
      queuePacket(packetSamplesRef.current.slice(0, count));
      packetSamplesRef.current.fill(0);
      packetSamplesCountRef.current = 0;
    }
    const id = captureIdRef.current;
    if (!id) return;
    void (async () => {
      try {
        await uploadQueueRef.current;
        if (uploadFailedRef.current) throw new Error('packet-upload-failed');
        if (totalSamplesRef.current < MIN_SAMPLES || totalSamplesRef.current > MAX_SAMPLES) throw new Error('invalid-duration');
        await sessionsService.finalizarCapturaFamiliar(sessionId, id);
        setSent(true);
        await queryClient.invalidateQueries({ queryKey: ['family-phonetic-capture', sessionId] });
      } catch (err) {
        // El servidor mide el PCM recibido; si no hay voz reabre la solicitud para repetir la muestra.
        const noVoice = err instanceof ApiError && err.status === 422 && err.message === NO_VOICE_MESSAGE;
        setError(noVoice
          ? NO_VOICE_MESSAGE
          : 'No se pudo enviar la muestra. Confirma que la sesión continúa y que el consentimiento sigue vigente.');
        if (!noVoice) discard(id);
      } finally {
        if (captureIdRef.current === id) captureIdRef.current = null;
      }
    })();
  };

  const startRecording = async () => {
    if (!request || request.estado !== 'SOLICITADA') return;
    setError(null);
    setSent(false);
    let id: string | null = null;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      streamRef.current = stream;
      await sessionsService.iniciarCapturaFamiliar(sessionId, request.captura_id);
      id = request.captura_id;
      captureIdRef.current = id;
      packetNumberRef.current = 0;
      uploadQueueRef.current = Promise.resolve();
      uploadFailedRef.current = false;
      packetSamplesRef.current.fill(0);
      packetSamplesCountRef.current = 0;
      totalSamplesRef.current = 0;
      captureStartedAtRef.current = Date.now();

      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) throw new Error('audio-context-unavailable');
      const context = new AudioContextConstructor({ sampleRate: SAMPLE_RATE });
      contextRef.current = context;
      if (context.sampleRate !== SAMPLE_RATE) throw new Error('unsupported-sample-rate');
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
        while (index < input.length && totalSamplesRef.current < MAX_SAMPLES) {
          const room = PACKET_SAMPLES - packetSamplesCountRef.current;
          const remaining = MAX_SAMPLES - totalSamplesRef.current;
          const length = Math.min(room, input.length - index, remaining);
          packetSamplesRef.current.set(input.subarray(index, index + length), packetSamplesCountRef.current);
          index += length;
          packetSamplesCountRef.current += length;
          totalSamplesRef.current += length;
          if (packetSamplesCountRef.current === PACKET_SAMPLES) {
            queuePacket(packetSamplesRef.current);
            packetSamplesRef.current.fill(0);
            packetSamplesCountRef.current = 0;
          }
        }
        for (let channel = 0; channel < event.outputBuffer.numberOfChannels; channel += 1) event.outputBuffer.getChannelData(channel).fill(0);
        setSeconds(Math.floor(totalSamplesRef.current / SAMPLE_RATE));
        if (totalSamplesRef.current >= MAX_SAMPLES) stopRecording();
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
      stopDevices();
      packetSamplesRef.current.fill(0);
      packetSamplesCountRef.current = 0;
      if (id) discard(id);
      else if (stream) stream.getTracks().forEach((track) => track.stop());
      captureIdRef.current = null;
      setRecording(false);
      setError('No se pudo iniciar el micrófono a 16 kHz. Revisa el permiso del navegador e inténtalo nuevamente.');
    }
  };

  const cancelRequest = async () => {
    if (!request || request.estado !== 'EN_CAPTURA') return;
    try {
      await sessionsService.descartarCapturaFamiliar(sessionId, request.captura_id);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['family-phonetic-capture', sessionId] });
    } catch {
      setError('No se pudo cancelar la captura. Actualiza la página e inténtalo nuevamente.');
    }
  };

  useEffect(() => () => {
    recordingRef.current = false;
    stopDevices();
    packetSamplesRef.current.fill(0);
    const id = captureIdRef.current;
    captureIdRef.current = null;
    if (id) discard(id);
  }, [sessionId]);

  useEffect(() => {
    if (!query.isError || !recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    stopDevices();
    uploadFailedRef.current = true;
    packetSamplesRef.current.fill(0);
    packetSamplesCountRef.current = 0;
    totalSamplesRef.current = 0;
    const id = captureIdRef.current;
    captureIdRef.current = null;
    if (id) discard(id);
    setError('La sesión o el consentimiento dejaron de estar vigentes; se detuvo la grabación.');
  }, [query.isError]);

  return (
    <section id={`family-capture-${sessionId}`} tabIndex={-1} className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 outline-none" aria-live="polite">
      <div>
        <h3 className="text-sm font-black text-[#1C1135]">Prueba breve desde el dispositivo familiar</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#615274]">
          Si el terapeuta solicita una palabra, puedes grabar aquí a {patientName}. Se usa el micrófono de este dispositivo, no el audio de Google Meet. El fragmento dura de 2 a 3 segundos, se procesa para obtener una transcripción tentativa y el terapeuta la revisa; el audio no se guarda.
        </p>
      </div>
      {query.isPending && <p className="text-xs font-semibold text-[#615274]">Buscando una solicitud del terapeuta…</p>}
      {query.error && <p role="alert" className="text-xs font-semibold text-amber-800">No se pudo consultar la solicitud. La página volverá a intentarlo.</p>}
      {query.isSuccess && !request && !sent && <p className="text-xs text-[#615274]">No hay una prueba pendiente. El terapeuta puede solicitarla durante la sesión.</p>}
      {request?.estado === 'SOLICITADA' && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold text-[#1C1135]">Palabra solicitada: <span className="text-violet-700">{request.palabra_objetivo}</span> · {request.fonema_objetivo}</p>
          <button type="button" onClick={() => void startRecording()} disabled={recording} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
            <Mic size={14} /> Iniciar prueba de voz
          </button>
        </div>
      )}
      {request?.estado === 'OCUPADA' && <p role="status" className="text-xs font-semibold text-amber-800">La muestra ya está en captura desde otro dispositivo familiar.</p>}
      {request?.estado === 'EN_CAPTURA' && !recording && (
        <div className="flex flex-wrap items-center gap-2">
          <p role="status" className="text-xs font-semibold text-violet-800">La prueba está reservada en este dispositivo.</p>
          <button type="button" onClick={() => void cancelRequest()} className="text-xs font-bold text-[#615274] underline">Cancelar y pedir otra</button>
        </div>
      )}
      {request?.estado === 'PROCESANDO' && <p role="status" className="text-xs font-semibold text-violet-800">La muestra se está procesando temporalmente.</p>}
      
      {recording && (
        <AudioDecibelMeter
          recording={recording}
          stream={streamRef.current}
          label="Nivel de voz del niño"
        />
      )}

      {recording && (
        <button type="button" onClick={stopRecording} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-xs font-bold text-violet-800">
          <Square size={14} /> Detener muestra · {seconds}/3 s
        </button>
      )}
      {sent && <p role="status" className="text-xs font-bold text-emerald-800">Muestra enviada. El terapeuta revisará la transcripción durante la sesión.</p>}
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800"><AlertCircle size={15} />{error}</p>}
    </section>
  );
}

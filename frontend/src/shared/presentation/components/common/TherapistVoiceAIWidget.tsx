import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Mic, Square } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { clinicaService, sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { ReviewedArticulationResult } from '@/shared/application/articulationReportEntries';
import { useFamilyCaptureResult } from '@/shared/application/hooks/useFamilyCaptureResult';

interface TranscriptionResult {
  id_evaluacion: number;
  palabra_esperada: string;
  transcripcion_tentativa: string;
  duracion_segundos: number | null;
  aviso: string;
}

interface TherapistVoiceAIWidgetProps {
  sessionId: number;
  patientId?: number;
  patientName?: string;
  onConfirmResult?: (result: ReviewedArticulationResult) => void;
}

const TARGETS = [
  { word: 'carro', phoneme: '/rr/' },
  { word: 'ratón', phoneme: '/r/' },
  { word: 'plato', phoneme: '/pl/' },
  { word: 'tren', phoneme: '/tr/' },
  { word: 'zapato', phoneme: '/s/' },
];

const SAMPLE_RATE = 16_000;
const PACKET_SAMPLES = 4_000;
const MAX_CAPTURE_SAMPLES = SAMPLE_RATE * 3;

function encodePcm16(samples: Float32Array) {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return bytes;
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
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [therapistNote, setTherapistNote] = useState('');
  const [clinicalOutcome, setClinicalOutcome] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [familyCaptureId, setFamilyCaptureId] = useState<string | null>(null);
  const [captureOrigin, setCaptureOrigin] = useState('Micrófono de este dispositivo durante la sesión');
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
  const packetSamplesRef = useRef(new Float32Array(PACKET_SAMPLES));
  const packetSamplesCountRef = useRef(0);
  const totalSamplesRef = useRef(0);
  const captureStartedAtRef = useRef(0);

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
    setTranscription(result);
    setEditedTranscript(result.transcripcion_tentativa);
    setTherapistNote('');
    setClinicalOutcome('');
    setCaptureOrigin('Micrófono del dispositivo familiar; sin pista remota de Google Meet');
    setSaved(false);
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
      const packetCopy = packet.buffer.slice(packet.byteOffset, packet.byteOffset + packet.byteLength);
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
    setAnalyzing(true);
    setError(null);
    void (async () => {
      try {
        await uploadQueueRef.current;
        if (uploadFailedRef.current) throw new Error('packet-upload-failed');
        if (totalSamplesRef.current < SAMPLE_RATE * 2 || totalSamplesRef.current > MAX_CAPTURE_SAMPLES) {
          throw new Error('invalid-duration');
        }
        const response = await sessionsService.finalizarCapturaFonologica(sessionId, captureId);
        setTranscription(response);
        setEditedTranscript(response.transcripcion_tentativa);
        setCaptureOrigin('Micrófono de este dispositivo durante la sesión');
        setTherapistNote('');
        setClinicalOutcome('');
        setSaved(false);
      } catch {
        setError('No se pudo transcribir la muestra. Revisa la conexión, el consentimiento y que la sesión siga en curso.');
        void sessionsService.descartarCapturaFonologica(sessionId, captureId).catch(() => undefined);
      } finally {
        if (captureIdRef.current === captureId) captureIdRef.current = null;
        setAnalyzing(false);
      }
    })();
  };

  const startRecording = async () => {
    setError(null);
    setTranscription(null);
    setSaved(false);
    if (consent !== true) {
      setError('Se requiere consentimiento vigente del tutor para enviar audio al servicio de transcripción.');
      return;
    }
    const target = TARGETS.find((entry) => entry.word === targetWord);
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
      captureStartedAtRef.current = Date.now();

      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) throw new Error('audio-context-unavailable');
      const context = new AudioContextConstructor({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = context;
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
        while (index < input.length && totalSamplesRef.current < MAX_CAPTURE_SAMPLES) {
          const room = PACKET_SAMPLES - packetSamplesCountRef.current;
          const remainingCapture = MAX_CAPTURE_SAMPLES - totalSamplesRef.current;
          const count = Math.min(room, input.length - index, remainingCapture);
          packetSamplesRef.current.set(input.subarray(index, index + count), packetSamplesCountRef.current);
          index += count;
          packetSamplesCountRef.current += count;
          totalSamplesRef.current += count;
          if (packetSamplesCountRef.current === PACKET_SAMPLES) {
            queuePcmPacket(packetSamplesRef.current);
            packetSamplesRef.current.fill(0);
            packetSamplesCountRef.current = 0;
          }
        }
        for (let channel = 0; channel < event.outputBuffer.numberOfChannels; channel += 1) {
          event.outputBuffer.getChannelData(channel).fill(0);
        }
        setSeconds(Math.floor(totalSamplesRef.current / SAMPLE_RATE));
        if (totalSamplesRef.current >= MAX_CAPTURE_SAMPLES) stopRecording();
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
    setTranscription(null);
    setSaved(false);
    if (consent !== true) {
      setError('Se requiere consentimiento vigente del tutor para solicitar una muestra de voz.');
      return;
    }
    const target = TARGETS.find((entry) => entry.word === targetWord);
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
      setCaptureOrigin('Micrófono del dispositivo familiar; sin pista remota de Google Meet');
    } catch {
      setError('No se pudo solicitar la muestra familiar. Confirma que la sesión esté en curso y el consentimiento vigente.');
    }
  };

  const review = async (discard = false) => {
    if (!transcription) return;
    if (!discard && (!editedTranscript.trim() || !therapistNote.trim() || !clinicalOutcome)) {
      setError('Corrige la transcripción, registra una observación y selecciona el resultado observado antes de confirmar.');
      return;
    }
    setError(null);
    try {
      await clinicaService.reviewPhoneticEvaluation(transcription.id_evaluacion, {
        estado: discard ? 'DESCARTADO' : 'CONFIRMADO_TERAPEUTA',
        transcripcion_revisada: discard ? undefined : editedTranscript.trim(),
        observacion_terapeuta: discard ? 'Descartada por el terapeuta.' : therapistNote.trim(),
        resultado_clinico: discard ? undefined : clinicalOutcome as 'ALCANZADO' | 'EN_PROCESO' | 'REQUIERE_APOYO',
      });
      if (patientId && user?.id_usuario) {
        await queryClient.invalidateQueries({ queryKey: [user.id_usuario, 'phonological-evaluations', patientId] });
      }
      if (!discard) {
        const target = TARGETS.find((entry) => entry.word === transcription.palabra_esperada);
        onConfirmResult?.({
          objetivo_articulacion: target ? 'Observación del objetivo ' + target.phoneme : 'Observación de pronunciación',
          palabra_esperada: transcription.palabra_esperada,
          transcripcion_tentativa: transcription.transcripcion_tentativa,
          resultado_revisado: therapistNote.trim() + ' Transcripción revisada: "' + editedTranscript.trim() + '". Resultado del objetivo en esta muestra: ' + clinicalOutcome.replaceAll('_', ' ').toLocaleLowerCase('es') + '.',
          archivo_origen: captureOrigin,
          inicio_segundo: 0,
          fin_segundo: Math.max(0.5, transcription.duracion_segundos ?? 3),
        });
      }
      setSaved(true);
      setTranscription(null);
    } catch {
      setError('No se pudo guardar la revisión. La sesión o la evaluación pueden haber cambiado.');
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-violet-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-black text-[#1C1135]">Transcripción fonológica para revisión</h3>
        <p className="mt-1 text-xs text-[#615274]">
          Captura de 2 a 3 segundos desde el micrófono de este dispositivo, con paquetes PCM de 250 ms, cuando {patientName} esté junto al terapeuta.
          El modelo propone una transcripción; no califica sonidos ni emite diagnósticos.
        </p>
      </div>

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
          {TARGETS.map((target) => <option key={target.word} value={target.word}>{target.word} {target.phoneme}</option>)}
        </select>
      </div>

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

      {transcription && (
        <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3">
          <p className="text-xs font-semibold text-[#615274]">{transcription.aviso}</p>
          <label className="block text-xs font-bold text-[#1C1135]">
            Transcripción tentativa (edítala según lo escuchado)
            <input
              value={editedTranscript}
              onChange={(event) => setEditedTranscript(event.target.value)}
              maxLength={500}
              className="mt-1 block w-full rounded-lg border border-[#E8E5F4] bg-white p-2 text-sm"
            />
          </label>
          <label className="block text-xs font-bold text-[#1C1135]">
            Observación del terapeuta
            <textarea
              value={therapistNote}
              onChange={(event) => setTherapistNote(event.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-[#E8E5F4] bg-white p-2 text-sm"
              placeholder="Describe lo observado, sin convertir la transcripción automática en diagnóstico."
            />
          </label>
          <label className="block text-xs font-bold text-[#1C1135]">
            Resultado del objetivo observado por el terapeuta
            <select
              value={clinicalOutcome}
              onChange={(event) => setClinicalOutcome(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#E8E5F4] bg-white p-2 text-sm"
            >
              <option value="">Seleccionar resultado</option>
              <option value="ALCANZADO">Alcanzado en esta muestra</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="REQUIERE_APOYO">Requiere apoyo</option>
            </select>
            <span className="mt-1 block font-normal text-[#615274]">Describe esta muestra revisada; no es una conclusión automática ni un diagnóstico.</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void review(false)} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white">
              Guardar revisión y añadir al reporte
            </button>
            <button type="button" onClick={() => void review(true)} className="rounded-xl border border-[#E8E5F4] px-3 py-2 text-xs font-bold text-[#615274]">
              Descartar transcripción
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

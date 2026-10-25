import { useEffect, useRef, useState } from 'react';
import { voiceService, type TranscripcionRespuesta } from '@/modules/mundo_asha/infrastructure/voiceService';

type Phase = 'ready' | 'requesting' | 'recording' | 'processing' | 'result' | 'error';

export function useWordRecorder(target: string, stopSpeech: () => void) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<TranscripcionRespuesta | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const phaseRef = useRef<Phase>('ready');
  const generation = useRef(0);
  const alive = useRef(true);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef<AbortController | null>(null);
  const url = useRef('');
  const chunks = useRef<Blob[]>([]);
  const busy = phase === 'requesting' || phase === 'recording' || phase === 'processing';

  function update(next: Phase) { phaseRef.current = next; setPhase(next); }
  function closeTracks() {
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  function release() {
    generation.current++;
    request.current?.abort();
    request.current = null;
    if (recorder.current) {
      recorder.current.onstop = null;
      recorder.current.ondataavailable = null;
      recorder.current.onerror = null;
      if (recorder.current.state !== 'inactive') recorder.current.stop();
      recorder.current = null;
    }
    closeTracks();
    chunks.current = [];
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = '';
  }
  function cancel() {
    release(); setRecordingUrl(''); setResult(null); update('ready');
    setMessage('La grabación se ha detenido. Puedes volver a empezar.');
  }
  useEffect(() => {
    alive.current = true;
    const hide = () => { if (document.hidden && ['requesting', 'recording', 'processing'].includes(phaseRef.current)) cancel(); };
    document.addEventListener('visibilitychange', hide);
    return () => { alive.current = false; release(); document.removeEventListener('visibilitychange', hide); };
    // This hook belongs to a single keyed word round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    if (['requesting', 'recording', 'processing'].includes(phaseRef.current)) return;
    release(); stopSpeech(); setRecordingUrl(''); setResult(null); setMessage('');
    const token = generation.current;
    const current = () => alive.current && generation.current === token;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      update('error'); setMessage('Aquí no está disponible el micrófono. Puedes seguir con las imágenes.'); return;
    }
    update('requesting');
    try {
      const device = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!current()) { device.getTracks().forEach(track => track.stop()); return; }
      stream.current = device;
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(type => MediaRecorder.isTypeSupported(type));
      // Do not record a format which the existing backend cannot decode/validate.
      if (!mimeType || mimeType === 'audio/mp4') throw new Error('Este navegador no ofrece un formato de grabación compatible. Puedes jugar con las imágenes.');
      const deviceRecorder = new MediaRecorder(device, { mimeType });
      recorder.current = deviceRecorder;
      let size = 0;
      deviceRecorder.ondataavailable = event => {
        if (!current() || !event.data.size) return;
        size += event.data.size;
        if (size > 5 * 1024 * 1024) {
          release(); update('error'); setMessage('La grabación es muy grande. Prueba con una palabra breve.'); return;
        }
        chunks.current.push(event.data);
      };
      deviceRecorder.onerror = () => {
        if (!current()) return;
        release(); update('error'); setMessage('El micrófono se ha interrumpido. Puedes intentarlo otra vez.');
      };
      deviceRecorder.onstop = async () => {
        if (!current()) return;
        closeTracks();
        const audio = new Blob(chunks.current, { type: deviceRecorder.mimeType || mimeType });
        chunks.current = [];
        if (audio.size < 500) { update('error'); setMessage('La grabación fue muy breve. Pulsa el micrófono y di la palabra.'); return; }
        url.current = URL.createObjectURL(audio); setRecordingUrl(url.current);
        update('processing');
        const controller = new AbortController(); request.current = controller;
        timer.current = setTimeout(() => controller.abort(), 45000);
        try {
          // No patient, level or attempt ID: this is transient LENGUAJE practice.
          const response = await voiceService.transcribe(audio, { targetPhrase: target, signal: controller.signal });
          if (!current()) return;
          if (response.estado !== 'OK' || !response.transcripcion.trim() || !response.comparacion) {
            update('error'); setMessage('No logramos reconocer la palabra. Escúchala y vuelve a probar, o sigue con las imágenes.'); return;
          }
          setResult(response); update('result');
        } catch (error) {
          if (!current()) return;
          update('error');
          setMessage(controller.signal.aborted ? 'La respuesta está tardando. Puedes volver a intentar o jugar con las imágenes.' : 'No pudimos reconocer la grabación ahora. Puedes volver a intentar o jugar con las imágenes.');
        } finally {
          if (current()) { if (timer.current) clearTimeout(timer.current); timer.current = null; request.current = null; }
        }
      };
      deviceRecorder.start(250);
      update('recording');
      timer.current = setTimeout(() => { if (current() && deviceRecorder.state === 'recording') deviceRecorder.stop(); }, 10000);
    } catch (error) {
      if (!current()) return;
      release(); update('error');
      setMessage(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'El micrófono no tiene permiso. Puedes habilitarlo en el navegador o seguir con las imágenes.'
        : error instanceof Error && error.message.includes('formato') ? error.message
          : 'No encontramos un micrófono disponible. Puedes conectarlo o seguir con las imágenes.');
    }
  }
  return { phase, busy, message, result, recordingUrl, start, cancel, stop: () => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  } };
}

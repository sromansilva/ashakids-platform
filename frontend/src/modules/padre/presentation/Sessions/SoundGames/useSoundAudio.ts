import { useCallback, useEffect, useRef, useState } from 'react';
import { animalById, type AnimalId } from './soundContent';

/** One player per mounted world. Completion means the whole clip ended, not a tap. */
export function useSoundAudio(beforePlay?: () => void) {
  const player = useRef<HTMLAudioElement | null>(null);
  const cancel = useRef<(() => void) | null>(null);
  const live = useRef(true);
  const silent = useRef(false);
  const epoch = useRef(0);
  const [muted, setMuted] = useState(false);
  const [active, setActive] = useState<AnimalId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [last, setLast] = useState<AnimalId | null>(null);
  const stop = useCallback(() => {
    epoch.current++;
    cancel.current?.();
    cancel.current = null;
    if (player.current) { player.current.pause(); player.current.removeAttribute('src'); player.current.load(); }
    if (live.current) { setActive(null); setLoading(false); }
  }, []);
  useEffect(() => {
    live.current = true;
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => { live.current = false; stop(); player.current = null; document.removeEventListener('visibilitychange', hide); };
  }, [stop]);
  const play = useCallback((id: AnimalId): Promise<boolean> => {
    stop();
    beforePlay?.();
    setError(''); setLast(id);
    if (silent.current) { setError('Activa el sonido para escuchar y continuar.'); return Promise.resolve(false); }
    window.speechSynthesis?.cancel();
    const audio = player.current ?? new Audio();
    player.current = audio;
    audio.volume = 0.7;
    audio.preload = 'auto';
    audio.src = animalById(id).audio;
    setLoading(true);
    return new Promise(resolve => {
      let finished = false;
      let timeout: ReturnType<typeof setTimeout>;
      const finish = (ok: boolean, message = '') => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        audio.onended = null; audio.onerror = null; audio.onplaying = null;
        cancel.current = null;
        if (live.current) { setActive(null); setLoading(false); if (message) setError(message); }
        if (!ok) audio.pause();
        resolve(ok);
      };
      cancel.current = () => finish(false);
      timeout = setTimeout(() => finish(false, 'El sonido tarda en cargar. Toca otra vez para reintentar.'), 15000);
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false, 'No pudimos reproducir el sonido. Toca otra vez para reintentar.');
      audio.onplaying = () => { if (!finished && live.current) { setLoading(false); setActive(id); } };
      try {
        void audio.play().catch(() => finish(false, 'No pudimos reproducir el sonido. Toca otra vez para reintentar.'));
      } catch { finish(false, 'El audio no está disponible en este navegador. Intenta con otro.'); }
    });
  }, [stop, beforePlay]);
  const toggleMuted = () => { stop(); silent.current = !silent.current; setMuted(silent.current); setError(''); };
  return { play, stop, active, loading, muted, toggleMuted, error, last, revision: () => epoch.current };
}
export type SoundAudio = ReturnType<typeof useSoundAudio>;

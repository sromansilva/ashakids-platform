import { useEffect, useState } from 'react';
import { createGameNarrator } from '../gameNarrator';
import { soundVoiceFiles } from './soundVoiceIndex';
export const soundNarratorPreview = 'Hola. Vamos a descubrir sonidos juntos. Escucha con calma y juega a tu ritmo.';
export function useSoundNarration() {
  const [notice, setNotice] = useState('');
  const [narrator] = useState(() => createGameNarrator(soundVoiceFiles, '/sounds/voice/v108', setNotice));
  useEffect(() => { const hide = () => { if (document.hidden) narrator.stop(); }; document.addEventListener('visibilitychange', hide); return () => { narrator.stop(); document.removeEventListener('visibilitychange', hide); }; }, [narrator]);
  return { ...narrator, notice };
}

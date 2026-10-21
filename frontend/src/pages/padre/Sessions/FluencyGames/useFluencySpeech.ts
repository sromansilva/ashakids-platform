import { useEffect, useState } from 'react';
import { createGameNarrator } from '../gameNarrator';
import { fluencyVoiceFiles } from './fluencyVoiceIndex';

export function useFluencySpeech() {
  const [notice, setNotice] = useState('');
  const [narrator] = useState(() => createGameNarrator(fluencyVoiceFiles, '/words/voice/fluency-v1', setNotice));
  useEffect(() => {
    const hide = () => { if (document.hidden) narrator.stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => { narrator.stop(); document.removeEventListener('visibilitychange', hide); };
  }, [narrator]);
  return { ...narrator, notice };
}

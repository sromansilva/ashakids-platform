import { useEffect, useState } from 'react';
import { createGameNarrator } from '../gameNarrator';
import { wordVoiceFiles } from '../WordGames/wordVoiceIndex';
import { fluencyVoiceFiles } from './fluencyVoiceIndex';

const beatVoiceFiles = { ...fluencyVoiceFiles };
for (const [phrase, word] of [
  ['mariposa: ma, ri, po, sa. son 4 trocitos.', 'mariposa'],
  ['manzana: man, za, na. son 3 trocitos.', 'manzana'],
  ['conejo: co, ne, jo. son 3 trocitos.', 'conejo'],
  ['pelota: pe, lo, ta. son 3 trocitos.', 'pelota'],
  ['casa: ca, sa. son 2 trocitos.', 'casa'],
  ['gato: ga, to. son 2 trocitos.', 'gato'],
]) {
  const phraseFile = wordVoiceFiles[phrase];
  const wordFile = wordVoiceFiles[word];
  if (phraseFile) beatVoiceFiles[phrase] = `/words/voice/v106/${phraseFile}`;
  if (wordFile) beatVoiceFiles[word] = `/words/voice/v106/${wordFile}`;
}

export function useFluencySpeech() {
  const [notice, setNotice] = useState('');
  const [narrator] = useState(() => createGameNarrator(beatVoiceFiles, '/words/voice/fluency-v1', setNotice));
  useEffect(() => {
    const hide = () => { if (document.hidden) narrator.stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => { narrator.stop(); document.removeEventListener('visibilitychange', hide); };
  }, [narrator]);
  return { ...narrator, notice };
}

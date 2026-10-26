import { createGameNarrator } from '../gameNarrator';
import { wordVoiceFiles } from './wordVoiceIndex';
export { voiceKey } from '../gameNarrator';
export const narratorPreview = 'Hola. Vamos a descubrir palabras juntos. Escucha y juega a tu ritmo.';
export function createWordNarrator(notice: (message: string) => void) {
  return createGameNarrator(wordVoiceFiles, '/words/voice/v106', notice);
}

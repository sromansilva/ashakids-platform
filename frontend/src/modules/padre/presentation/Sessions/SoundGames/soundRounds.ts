import { animalById, animals, shuffled, type AnimalId } from './soundContent';
export type ChallengeKind = 'same' | 'sequence' | 'count' | 'missing' | 'order' | 'odd';
export interface SoundRound { sounds: AnimalId[]; options: string[]; answer: string; prompt: string; hint: string; sequence?: boolean }
export function soundRounds(kind: ChallengeKind, challenge: boolean): SoundRound[] {
  return Array.from({ length: 3 }, (_, index) => {
    const ids = shuffled(animals.map(animal => animal.id)), [a, b, c] = ids;
    if (kind === 'same') {
      const same = shuffled([true, false])[0];
      return { sounds: [a, same ? a : b], options: ['same', 'different'], answer: same ? 'same' : 'different', prompt: 'Escucha dos sonidos. ¿Son iguales o diferentes?', hint: same ? 'Los dos sonidos son del mismo amigo.' : 'Cada sonido pertenece a un amigo diferente.' };
    }
    if (kind === 'sequence') {
      const sounds = ids.slice(0, challenge ? 3 : 2);
      return { sounds, options: shuffled(ids.slice(0, challenge ? 4 : 3)), answer: sounds.join(','), sequence: true, prompt: 'Escucha el tren y coloca a los amigos en ese orden.', hint: `El tren lleva: ${sounds.map(id => animalById(id).name).join(', ')}.` };
    }
    if (kind === 'count') {
      const amount = index + (challenge ? 2 : 1);
      return { sounds: Array.from({ length: amount }, () => a), options: Array.from({ length: challenge ? 4 : 3 }, (_, i) => String(i + 1)), answer: String(amount), prompt: 'Escucha y cuenta cuántas veces suena el amigo.', hint: `El amigo suena ${amount} ${amount === 1 ? 'vez' : 'veces'}. Cuenta con tus dedos mientras escuchas.` };
    }
    if (kind === 'missing') {
      const shown = ids.slice(0, challenge ? 4 : 3), missing = shown.at(-1)!;
      return { sounds: shuffled(shown.filter(id => id !== missing)), options: shuffled(shown), answer: missing, prompt: 'Mira a los amigos. Escucha y busca quién no sonó.', hint: `${animalById(missing).name} se quedó en silencio. Mira a todos los amigos y escucha otra vez.` };
    }
    if (kind === 'order') {
      const sounds = ids.slice(0, challenge ? 3 : 2), last = index === 1 || (challenge && index === 2), answer = last ? sounds.at(-1)! : sounds[0];
      return { sounds, options: shuffled(sounds), answer, prompt: last ? '¿Quién sonó al final?' : '¿Quién sonó primero?', hint: `Buscamos a ${animalById(answer).name}, que sonó ${last ? 'al final' : 'primero'}.` };
    }
    return { sounds: shuffled([a, a, b]), options: shuffled(challenge ? [a, b, c] : [a, b]), answer: b, prompt: 'Escucha tres sonidos. Uno es diferente.', hint: `${animalById(a).name} suena dos veces. Busca al amigo que suena una sola vez.` };
  });
}

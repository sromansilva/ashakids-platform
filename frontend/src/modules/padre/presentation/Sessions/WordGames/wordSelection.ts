import { gameAge } from '../gameAge';
import { wordGames, type WordGameId } from './wordContent';
export { ageInLima } from '../gameAge';

const selections: Record<'early' | 'middle' | 'older', readonly WordGameId[]> = {
  early: ['treasure', 'memory', 'sort', 'story', 'opposites', 'syllables', 'count', 'positions', 'naming'],
  middle: ['treasure', 'memory', 'sort', 'story', 'syllables', 'count', 'rhymes', 'sentence', 'naming'],
  older: ['treasure', 'sort', 'story', 'opposites', 'syllables', 'positions', 'rhymes', 'sentence', 'naming'],
};
export function selectWordGames(birthDate?: string, now = new Date()) {
  const selection = gameAge(birthDate, now);
  return { ...selection, games: selections[selection.band].map(id => wordGames.find(game => game.id === id)!) };
}

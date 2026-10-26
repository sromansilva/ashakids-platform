import { gameAge } from '../gameAge';
import { fluencyGames, type FluencyGameId } from './fluencyContent';

const selections: Record<'early' | 'middle' | 'older', readonly FluencyGameId[]> = {
  early: ['beat', 'islands', 'turns', 'train', 'echo', 'chat', 'wordpath', 'story', 'listen'],
  middle: ['beat', 'islands', 'turns', 'train', 'echo', 'chat', 'wordpath', 'bridge', 'round'],
  older: ['islands', 'turns', 'train', 'echo', 'chat', 'wordpath', 'story', 'bridge', 'round'],
};

export function selectFluencyGames(birthDate?: string, now = new Date()) {
  const selection = gameAge(birthDate, now);
  return { ...selection, games: selections[selection.band].map(id => fluencyGames.find(game => game.id === id)!) };
}

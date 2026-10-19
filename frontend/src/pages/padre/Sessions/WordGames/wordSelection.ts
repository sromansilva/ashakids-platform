import { wordGames, type WordGameId } from './wordContent';

// Editorial starting points, not developmental norms or access permissions.
const selections: Record<'early' | 'middle' | 'older', readonly WordGameId[]> = {
  early: ['treasure', 'memory', 'sort', 'opposites', 'syllables', 'count', 'positions', 'naming'],
  middle: ['treasure', 'memory', 'sort', 'story', 'syllables', 'rhymes', 'sentence', 'naming'],
  older: ['treasure', 'story', 'opposites', 'syllables', 'positions', 'rhymes', 'sentence', 'naming'],
};

export function ageInLima(birthDate?: string, now = new Date()): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [year, month, day] = birthDate.split('-').map(Number);
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month - 1 || birth.getUTCDate() !== day) return null;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (name: string) => Number(today.find(value => value.type === name)?.value);
  const age = part('year') - year - Number(part('month') < month || (part('month') === month && part('day') < day));
  return age < 0 || age > 120 ? null : age;
}

export function selectWordGames(birthDate?: string, now = new Date()) {
  const age = ageInLima(birthDate, now);
  const band = age !== null && age >= 8 ? 'older' : age !== null && age >= 6 ? 'middle' : 'early';
  const ids = selections[band];
  return {
    age,
    label: age === null ? 'Una selección para empezar' : age < 4 ? 'Una selección para jugar acompañado' : `Una selección para tus ${age} años`,
    games: ids.map(id => wordGames.find(game => game.id === id)!),
  };
}

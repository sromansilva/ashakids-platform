// Calendar age selects editorial content; it never grants access to a world.
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
export function gameAge(birthDate?: string, now = new Date()) {
  const age = ageInLima(birthDate, now);
  return {
    age,
    band: age !== null && age >= 8 ? 'older' as const : age !== null && age >= 6 ? 'middle' as const : 'early' as const,
    label: age === null ? 'Una selección para empezar' : age < 4 ? 'Una selección para jugar acompañado' : `Una selección para tus ${age} años`,
  };
}

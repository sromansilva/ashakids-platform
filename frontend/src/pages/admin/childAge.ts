/** Completed years at the current date in Lima; invalid dates yield no age. */
export function childAge(value: string, now = new Date()): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month - 1 || birth.getUTCDate() !== day) return undefined;
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Lima', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
  const current = (part: string) => Number(parts.find(item => item.type === part)?.value);
  return current('year') - year - (current('month') < month || (current('month') === month && current('day') < day) ? 1 : 0);
}

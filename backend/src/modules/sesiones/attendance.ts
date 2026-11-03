export type AttendanceStatus = 'ASISTIO' | 'NO_ASISTIO' | null;

/** Normalize the current text contract plus legacy boolean encodings. */
export function normalizeAttendance(value: unknown): AttendanceStatus {
  if (value === true) return 'ASISTIO';
  if (value === false) return 'NO_ASISTIO';
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toUpperCase();
  if (['ASISTIO', 'TRUE', 'T', '1'].includes(normalized)) return 'ASISTIO';
  if (['NO_ASISTIO', 'FALSE', 'F', '0'].includes(normalized)) return 'NO_ASISTIO';
  return null;
}

export function isAttendedOrActiveSession(state: unknown, attendance: unknown): boolean {
  const normalizedAttendance = normalizeAttendance(attendance);
  if (normalizedAttendance === 'NO_ASISTIO') return false;
  if (state === 'EN_CURSO') return true;
  return state === 'FINALIZADA' && normalizedAttendance === 'ASISTIO';
}

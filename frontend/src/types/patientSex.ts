/** Normalize historical API vocabularies without silently assigning Masculino. */
export type PatientSex = 'Masculino' | 'Femenino' | 'Otro';
export function normalizePatientSex(value: string | null | undefined): PatientSex | '' {
  switch (value?.trim().toLowerCase()) {
    case 'm': case 'masculino': return 'Masculino';
    case 'f': case 'femenino': return 'Femenino';
    case 'otro': return 'Otro';
    default: return '';
  }
}

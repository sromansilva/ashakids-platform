import type { ReportData } from '@/modules/clinica/domain/clinical';

export const helpLevels = [
  { value: 'Sin ayuda', description: 'Realiza la actividad de forma autónoma.' },
  { value: 'Ayuda mínima', description: 'Necesita indicaciones o recordatorios ocasionales.' },
  { value: 'Ayuda moderada', description: 'Necesita indicaciones frecuentes y apoyo en parte de la actividad.' },
  { value: 'Ayuda alta', description: 'Necesita apoyo continuo durante gran parte de la actividad.' },
  { value: 'Ayuda total', description: 'Necesita acompañamiento paso a paso durante toda la actividad.' },
] as const;

export type NarrativeField = Exclude<keyof ReportData, 'nivel_ayuda'>;
export function reportTemplates(patientName?: string): Record<NarrativeField, string> {
  return {
    observaciones_iniciales: `Durante la sesión, se observó a ${patientName?.trim() || '[nombre del paciente]'} mediante [evaluación o actividad realizada]. Se identificaron los siguientes hallazgos: [hallazgos observados].`,
    objetivos_trabajados: 'En base a los hallazgos observados, se trabajaron los siguientes objetivos durante la sesión: [objetivos trabajados y respuesta del paciente].',
    proximos_pasos: 'A continuación, se brindaron recursos para [propósito de los recursos] y se acordó el acceso al mundo de [mundo acordado en el plan], para enfocarse en el desarrollo de [área terapéutica y siguiente actividad].',
  };
}
const templateMarkers = [
  '[nombre del paciente]', '[evaluación o actividad realizada]', '[hallazgos observados]',
  '[objetivos trabajados y respuesta del paciente]', '[propósito de los recursos]',
  '[mundo acordado en el plan]', '[área terapéutica y siguiente actividad]',
];
export function incompleteTemplateFields(form: ReportData): NarrativeField[] {
  return (Object.keys(reportTemplates()) as NarrativeField[]).filter(key =>
    templateMarkers.some(marker => form[key]?.includes(marker)));
}

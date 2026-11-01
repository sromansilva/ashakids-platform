import type { ReportData } from '@/modules/clinica/domain/clinical';
import type { SavedArticulationResult } from './articulationReportEntries';

export interface PlanNarrativeDraft {
  baseline: string;
  confirmedObjectives: string;
  previousResults: string;
  objectives: string;
  activities: string;
  recommendations: string;
}

export const planNarrativeLabels: Record<keyof PlanNarrativeDraft, string> = {
  baseline: 'Línea base confirmada',
  confirmedObjectives: 'Objetivos trabajados en la introductoria',
  previousResults: 'Resultados previos revisados',
  objectives: 'Objetivos del plan',
  activities: 'Actividades propuestas',
  recommendations: 'Recomendaciones para la familia',
};

export const emptyPlanNarrative = (): PlanNarrativeDraft => ({
  baseline: '',
  confirmedObjectives: '',
  previousResults: '',
  objectives: '',
  activities: '',
  recommendations: '',
});

const markers: Array<[keyof PlanNarrativeDraft, string]> = [
  ['baseline', '[LÍNEA BASE CONFIRMADA]'],
  ['confirmedObjectives', '[OBJETIVOS TRABAJADOS EN INTRODUCTORIA]'],
  ['previousResults', '[RESULTADOS PREVIOS REVISADOS]'],
  ['objectives', '[OBJETIVOS DEL PLAN]'],
  ['activities', '[ACTIVIDADES DEL PLAN]'],
  ['recommendations', '[RECOMENDACIONES PARA LA FAMILIA]'],
];

/** Copies only persisted introductory observations and worked objectives as editable context. */
export function introPlanDraftFromReport(report: ReportData): PlanNarrativeDraft {
  return {
    ...emptyPlanNarrative(),
    baseline: report.observaciones_iniciales?.trim() ?? '',
    confirmedObjectives: report.objetivos_trabajados?.trim() ?? '',
  };
}

/** Carries only the human-reviewed items already visible in the report history. */
export function followUpPlanDraftFromSavedResults(results: SavedArticulationResult[]): PlanNarrativeDraft {
  return {
    ...emptyPlanNarrative(),
    previousResults: results.map((result) =>
      `Sesión #${result.id_sesion} · ${new Date(result.fecha_hora_inicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium' })}\nObjetivo: ${result.objetivo_articulacion} · Palabra: ${result.palabra_esperada}\nResultado revisado: ${result.resultado_revisado}`,
    ).join('\n\n'),
  };
}

export function encodePlanNarrative(draft: PlanNarrativeDraft): string | null {
  const sections = markers.flatMap(([key, marker]) => {
    const value = draft[key].trim();
    return value ? [`${marker}\n${value}`] : [];
  });
  return sections.length ? sections.join('\n\n') : null;
}

export function parsePlanNarrative(description: string | null | undefined): PlanNarrativeDraft {
  const draft = emptyPlanNarrative();
  const text = description?.trim() ?? '';
  if (!text) return draft;

  const sections = markers
    .map(([key, marker]) => ({ key, marker, index: text.indexOf(marker) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index);

  if (!sections.length) {
    draft.recommendations = text;
    return draft;
  }

  sections.forEach((entry, index) => {
    const start = entry.index + entry.marker.length;
    const end = sections[index + 1]?.index ?? text.length;
    draft[entry.key] = text.slice(start, end).trim();
  });
  return draft;
}

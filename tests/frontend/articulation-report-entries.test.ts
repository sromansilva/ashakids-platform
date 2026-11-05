import { describe, expect, it } from 'vitest';
import {
  appendArticulationResultToObservations,
  encodeArticulationResult,
  parseArticulationHistory,
  type ReviewedArticulationResult,
} from '@/shared/application/articulationReportEntries';
import { introPlanDraftFromReport } from '@/shared/application/planDraft';
import type { ReportData } from '@/modules/clinica/domain/clinical';

const result: ReviewedArticulationResult = {
  objetivo_articulacion: 'Observación del objetivo /r/',
  palabra_esperada: 'ratón',
  transcripcion_tentativa: 'ratón',
  resultado_revisado: 'El terapeuta confirmó la producción en esta muestra.',
  archivo_origen: 'Micrófono local durante la sesión',
  inicio_segundo: 0,
  fin_segundo: 2.5,
};

describe('clinical articulation report entries', () => {
  it('adds reviewed phonetics to observations while preserving existing text and preventing duplicates', () => {
    const entry = encodeArticulationResult(result);
    const updated = appendArticulationResultToObservations('Observación inicial.', result);

    expect(updated).toContain('Observación inicial.');
    expect(updated).toContain(entry);
    expect(appendArticulationResultToObservations(updated, result)).toBe(updated);
  });

  it('reads new observation entries and legacy objective entries from saved reports', () => {
    const entry = encodeArticulationResult(result);
    const records = parseArticulationHistory([
      {
        id_sesion: 4,
        tipo_cita: 'INTRODUCTORIA' as const,
        fecha_hora_inicio: '2026-10-20T15:00:00.000Z',
        observaciones_iniciales: entry,
      },
      {
        id_sesion: 3,
        tipo_cita: 'TERAPIA' as const,
        fecha_hora_inicio: '2026-10-19T15:00:00.000Z',
        objetivos_trabajados: entry,
      },
    ]);

    expect(records.map((record) => record.id_sesion)).toEqual([4, 3]);
    expect(records[0].palabra_esperada).toBe('ratón');
    expect(records[1].resultado_revisado).toContain('El terapeuta confirmó');
  });

  it('rotula la similitud como indicador de apoyo, la conserva al releer y nunca incluye la hipótesis', () => {
    const entry = encodeArticulationResult({ ...result, similitud_apoyo: 75 });
    expect(entry).toContain('Similitud de texto (indicador de apoyo, sin validación clínica): 75 %');
    expect(entry).not.toMatch(/hip[oó]tesis|lambdacismo|rotacismo|sigmatismo/i);
    const [record] = parseArticulationHistory([
      { id_sesion: 1, tipo_cita: 'TERAPIA' as const, fecha_hora_inicio: '2026-10-19T15:00:00.000Z', observaciones_iniciales: entry },
    ]);
    expect(record.similitud_apoyo).toBe(75);
    expect(encodeArticulationResult(result)).not.toContain('Similitud');
  });

  it('el borrador del plan no arrastra la similitud a un texto visible para la familia', () => {
    const entry = encodeArticulationResult({ ...result, similitud_apoyo: 75 });
    const draft = introPlanDraftFromReport({ observaciones_iniciales: entry, objetivos_trabajados: '' } as ReportData);
    expect(draft.baseline).toContain('ratón');
    expect(draft.baseline).not.toContain('Similitud');
  });
});

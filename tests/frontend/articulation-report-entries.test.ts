import { describe, expect, it } from 'vitest';
import {
  appendArticulationResultToObservations,
  encodeArticulationResult,
  parseArticulationHistory,
  type ReviewedArticulationResult,
} from '@/shared/application/articulationReportEntries';

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
});

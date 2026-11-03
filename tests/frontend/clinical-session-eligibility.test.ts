import { describe, expect, it } from 'vitest';
import { canDocumentClinicalSession } from '../../frontend/src/modules/clinica/domain/clinical';

describe('clinical documentation session eligibility', () => {
  it('allows documentation during a live session unless it is marked no-show', () => {
    expect(canDocumentClinicalSession({ estado_sesion: 'EN_CURSO', asistencia: null })).toBe(true);
    expect(canDocumentClinicalSession({ estado_sesion: 'EN_CURSO', asistencia: 'ASISTIO' })).toBe(true);
    expect(canDocumentClinicalSession({ estado_sesion: 'EN_CURSO', asistencia: 'NO_ASISTIO' })).toBe(false);
  });

  it('requires confirmed attendance after a session closes', () => {
    expect(canDocumentClinicalSession({ estado_sesion: 'FINALIZADA', asistencia: 'ASISTIO' })).toBe(true);
    expect(canDocumentClinicalSession({ estado_sesion: 'FINALIZADA', asistencia: 'NO_ASISTIO' })).toBe(false);
    expect(canDocumentClinicalSession({ estado_sesion: 'FINALIZADA', asistencia: null })).toBe(false);
    expect(canDocumentClinicalSession({ estado_sesion: 'PROGRAMADA', asistencia: null })).toBe(false);
  });
});

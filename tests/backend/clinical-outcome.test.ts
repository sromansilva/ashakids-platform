import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluacionFonologicaSchema, revisionEvaluacionFonologicaSchema } from '../../backend/src/modules/clinica/dtos/clinica.dto.ts';

const confirmed = {
  estado: 'CONFIRMADO_TERAPEUTA' as const,
  transcripcion_revisada: 'carro',
  observacion_terapeuta: 'Producción clara en la muestra.',
};

test('clinical phoneme confirmation requires a therapist-recorded outcome', () => {
  assert.equal(revisionEvaluacionFonologicaSchema.safeParse(confirmed).success, false);
  assert.equal(revisionEvaluacionFonologicaSchema.safeParse({ ...confirmed, resultado_clinico: 'ALCANZADO' }).success, true);
});

test('discarding a phoneme transcript does not require a clinical outcome', () => {
  assert.equal(revisionEvaluacionFonologicaSchema.safeParse({ estado: 'DESCARTADO' }).success, true);
  assert.equal(revisionEvaluacionFonologicaSchema.safeParse({
    estado: 'DESCARTADO',
    resultado_clinico: 'INVALIDO',
  }).success, false);
});

test('structured phoneme evaluations must belong to an in-session clinical flow', () => {
  const valid = {
    id_sesion: 42,
    id_paciente: 18,
    fonema_objetivo: '/rr/',
    palabra_objetivo: 'carro',
    transcripcion_detectada: 'carro',
  };
  assert.equal(evaluacionFonologicaSchema.safeParse(valid).success, true);
  assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, id_sesion: undefined }).success, false);
  assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, origen_evaluacion: 'LUDICO' }).success, false);
  assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, similitud_porcentaje: 87 }).success, false);
});

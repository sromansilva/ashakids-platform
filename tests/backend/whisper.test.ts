import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { whisperService } from '../../backend/dist/modules/mundo_asha/services/whisper.service.js';

describe('Whisper Speech Recognition & Evaluation Tests (TypeScript)', () => {
  it('1. Normalizes Spanish text correctly (removes accents and punctuation)', () => {
    assert.equal(whisperService.normalizeText('¡Hola, Niño! ¿Cómo estás?'), 'hola nino como estas');
    assert.equal(whisperService.normalizeText('Árbol de Manzana'), 'arbol de manzana');
  });

  it('2. Calculates phonetic similarity score accurately', () => {
    // Exact match
    assert.equal(whisperService.calculateSimilarity('pelota', 'pelota'), 1.0);

    // Minor typo or phonetic deformation (e.g. child says 'perota' instead of 'pelota')
    const scoreChild = whisperService.calculateSimilarity('perota', 'pelota');
    assert.ok(scoreChild >= 0.8, `Score was ${scoreChild}`);

    // Completely different word
    const scoreDiff = whisperService.calculateSimilarity('casa', 'pelota');
    assert.ok(scoreDiff < 0.4, `Score was ${scoreDiff}`);
  });

  it('3. Evaluates speech audio and returns therapeutic feedback', async () => {
    const dummyAudioBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEA'; // minimal WAV header
    const result = await whisperService.evaluarPronunciacion(dummyAudioBase64, 'manzana');

    assert.equal(result.palabra_esperada, 'manzana');
    assert.ok(typeof result.similitud === 'number');
    assert.ok(result.feedback.length > 0);
    assert.ok(result.motor === 'whisper-api' || result.motor === 'whisper-local-simulated');
  });
});


import assert from 'node:assert/strict';
import test from 'node:test';
import { PHONEME_LABYRINTH_LEVELS, PHONEME_LABYRINTH_TARGETS } from '../../backend/src/modules/juegos/phoneme-labyrinth.ts';

test('rhotic labyrinth levels are catalogued as phoneme practice in the language world', () => {
  assert.deepEqual(
    PHONEME_LABYRINTH_TARGETS.map((target) => [target.number, target.fonema_objetivo]),
    [[15, '/rr/'], [16, '/rr/'], [17, '/rr/'], [18, '/r/'], [19, '/r/'], [20, '/r/']],
  );

  for (const target of PHONEME_LABYRINTH_TARGETS) {
    const level = PHONEME_LABYRINTH_LEVELS.find((candidate) => candidate.number === target.number);
    assert.ok(level, `Missing language level ${target.number}`);
    assert.equal(level.fonema_objetivo, target.fonema_objetivo);
    assert.ok(Array.isArray(level.answer) && level.choices.includes(level.answer[0]));
  }
});

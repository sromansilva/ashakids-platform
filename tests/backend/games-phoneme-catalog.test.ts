import assert from 'node:assert/strict';
import test from 'node:test';
import { PHONEME_AWARENESS_LEVELS } from '../../backend/src/modules/juegos/phoneme-awareness.ts';
import { PHONEME_LABYRINTH_LEVELS, PHONEME_LABYRINTH_TARGETS } from '../../backend/src/modules/juegos/phoneme-labyrinth.ts';
import { PHONEME_NAMING_LEVELS, PHONEME_NAMING_TARGETS } from '../../backend/src/modules/juegos/phoneme-naming.ts';

test('the language world has three validated labyrinth stages for each supported phoneme', () => {
  assert.deepEqual(
    PHONEME_LABYRINTH_TARGETS.map((target) => target.number),
    Array.from({ length: 15 }, (_, index) => index + 15),
  );
  assert.deepEqual(
    Object.fromEntries([...new Set(PHONEME_LABYRINTH_TARGETS.map((target) => target.fonema_objetivo))]
      .map((phoneme) => [phoneme, PHONEME_LABYRINTH_TARGETS.filter((target) => target.fonema_objetivo === phoneme).length])),
    { '/rr/': 3, '/r/': 3, '/s/': 3, '/pl/': 3, '/tr/': 3 },
  );

  for (const target of PHONEME_LABYRINTH_TARGETS) {
    const level = PHONEME_LABYRINTH_LEVELS.find((candidate) => candidate.number === target.number);
    assert.ok(level, `Missing language level ${target.number}`);
    assert.equal(level.fonema_objetivo, target.fonema_objetivo);
    assert.ok(Array.isArray(level.answer) && level.choices.includes(level.answer[0]));
  }
});

test('language-world naming levels cover the five clinical focus phonemes', () => {
  assert.deepEqual(
    [...new Set(PHONEME_NAMING_TARGETS.map((target) => target.fonema_objetivo))],
    ['/rr/', '/r/', '/s/', '/pl/', '/tr/'],
  );
  assert.equal(PHONEME_NAMING_LEVELS.length, PHONEME_NAMING_TARGETS.length);

  for (const target of PHONEME_NAMING_TARGETS) {
    const level = PHONEME_NAMING_LEVELS.find((candidate) => candidate.number === target.number);
    assert.ok(level, `Missing language naming level ${target.number}`);
    assert.equal(level.fonema_objetivo, target.fonema_objetivo);
    assert.equal(level.target_word_id, target.target_word_id);
    assert.deepEqual(level.answer, [target.word]);
    assert.equal(level.choices[0], target.word);
  }
});

test('the sound island has a correct, target-labelled recognition level for each supported phoneme', () => {
  assert.deepEqual(
    PHONEME_AWARENESS_LEVELS.map((level) => [level.number, level.fonema_objetivo]),
    [[4, '/rr/'], [5, '/r/'], [6, '/s/'], [7, '/pl/'], [8, '/tr/']],
  );

  for (const level of PHONEME_AWARENESS_LEVELS) {
    assert.equal(level.answer.length, 1);
    assert.ok(level.choices.includes(level.answer[0]));
    assert.match(level.title, /Isla Mágica/);
  }
});

export const PHONEME_NAMING_TARGETS = [
  { number: 4, target_word_id: 'dog', fonema_objetivo: '/rr/', word: 'Perro' },
  { number: 5, target_word_id: 'car', fonema_objetivo: '/rr/', word: 'Carro' },
  { number: 6, target_word_id: 'mouse', fonema_objetivo: '/r/', word: 'Ratón' },
  { number: 7, target_word_id: 'tree', fonema_objetivo: '/r/', word: 'Árbol' },
  { number: 8, target_word_id: 'flower', fonema_objetivo: '/r/', word: 'Flor' },
  { number: 9, target_word_id: 'snail', fonema_objetivo: '/r/', word: 'Caracol' },
  { number: 10, target_word_id: 'carrot', fonema_objetivo: '/r/', word: 'Zanahoria' },
  { number: 11, target_word_id: 'sun', fonema_objetivo: '/s/', word: 'Sol' },
  { number: 12, target_word_id: 'shoe', fonema_objetivo: '/s/', word: 'Zapato' },
  { number: 13, target_word_id: 'plate', fonema_objetivo: '/pl/', word: 'Plato' },
  { number: 14, target_word_id: 'train', fonema_objetivo: '/tr/', word: 'Tren' },
] as const;

export const PHONEME_NAMING_LEVELS = PHONEME_NAMING_TARGETS.map((target) => ({
  number: target.number,
  title: `Nombra ${target.word.toLocaleLowerCase('es')}`,
  prompt: `Escucha y nombra el dibujo: ${target.word}.`,
  choices: [target.word],
  answer: [target.word],
  sequence: false,
  target_word_id: target.target_word_id,
  fonema_objetivo: target.fonema_objetivo,
}));

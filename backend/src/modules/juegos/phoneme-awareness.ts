export const PHONEME_AWARENESS_LEVELS = [
  {
    number: 4,
    title: 'Isla Mágica: encuentra /rr/',
    prompt: 'Escucha las palabras y elige la que empieza con el sonido fuerte de R.',
    choices: ['Risa', 'Mesa', 'Sapo'],
    answer: ['Risa'],
    sequence: false,
    fonema_objetivo: '/rr/',
  },
  {
    number: 5,
    title: 'Isla Mágica: encuentra /r/',
    prompt: '¿Qué palabra tiene el sonido suave de R en medio?',
    choices: ['Caracol', 'Silla', 'Nube'],
    answer: ['Caracol'],
    sequence: false,
    fonema_objetivo: '/r/',
  },
  {
    number: 6,
    title: 'Isla Mágica: encuentra /s/',
    prompt: '¿Qué palabra empieza con el sonido /s/?',
    choices: ['Sapo', 'Pato', 'Luna'],
    answer: ['Sapo'],
    sequence: false,
    fonema_objetivo: '/s/',
  },
  {
    number: 7,
    title: 'Isla Mágica: encuentra /pl/',
    prompt: '¿Qué palabra empieza con los sonidos /pl/?',
    choices: ['Plato', 'Pato', 'Luna'],
    answer: ['Plato'],
    sequence: false,
    fonema_objetivo: '/pl/',
  },
  {
    number: 8,
    title: 'Isla Mágica: encuentra /tr/',
    prompt: '¿Qué palabra empieza con los sonidos /tr/?',
    choices: ['Tren', 'Pez', 'Mesa'],
    answer: ['Tren'],
    sequence: false,
    fonema_objetivo: '/tr/',
  },
] as const;

export const PHONEME_AWARENESS_TARGETS = PHONEME_AWARENESS_LEVELS.map((level) => ({
  number: level.number,
  word: level.answer[0],
  fonema_objetivo: level.fonema_objetivo,
}));

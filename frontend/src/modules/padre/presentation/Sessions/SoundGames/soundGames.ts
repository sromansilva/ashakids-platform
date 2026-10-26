import { gameAge } from '../gameAge';
import { soundLevels } from './soundContent';

export const soundGames = [
  ...soundLevels.map((level, index) => ({ ...level, id: ['explore', 'identify', 'pairs2', 'pairs3'][index],
    color: ['#FFE8AB', '#DFD0FB', '#C6EDDB', '#FFCFC3'][index],
    goal: ['Descubre cómo suenan los cuatro amigos.', 'Encuentra al amigo que hizo el sonido.', 'Une cada uno de los dos sonidos con su amigo.', 'Une cada uno de los tres sonidos con su amigo.'][index],
    steps: ['Mira y escucha con calma.', 'Toca el dibujo o la ficha para jugar.', 'Puedes repetir el sonido cuando lo necesites.'],
  })),
  { id: 'same', title: '¿Suenan igual?', instruction: 'Escucha dos sonidos. ¿Son iguales o diferentes?', description: 'Dos sonidos tienen una sorpresa.', action: 'Comparar', color: '#C7E9F5', image: '/sounds/games/sound-same-v108.webp', goal: 'Descubre si dos sonidos son iguales o diferentes.', steps: ['Pulsa el altavoz y escucha los dos sonidos.', 'Decide si son iguales o diferentes.', 'Puedes escucharlos otra vez antes de elegir.'] },
  { id: 'sequence', title: 'El tren de sonidos', instruction: 'Escucha el tren y coloca a los amigos en ese orden.', description: 'Cada amigo tiene su vagón.', action: 'Ordenar', color: '#CFDDFB', image: '/sounds/games/sound-sequence-v108.webp', goal: 'Construye el tren en el orden que escuchaste.', steps: ['Escucha todos los sonidos del tren.', 'Toca los animales en el mismo orden.', 'Comprueba tu tren o cambia el último vagón.'] },
  { id: 'count', title: 'Uno, dos… ¡a escuchar!', instruction: 'Escucha y cuenta cuántas veces suena el amigo.', description: 'Cuenta sonidos, sin correr.', action: 'Contar', color: '#FFE8AB', image: '/sounds/games/sound-count-v108.webp', goal: 'Cuenta cuántas veces escuchas el sonido.', steps: ['Pulsa el altavoz y escucha hasta el final.', 'Cuenta cada vez que suena el amigo.', 'Elige la cantidad que escuchaste.'] },
  { id: 'memory', title: 'Parejas que se escuchan', instruction: 'Escucha dos fichas y encuentra sus parejas.', description: 'Una memoria llena de sonidos.', action: 'Recordar', color: '#DFD0FB', image: '/sounds/games/sound-memory-v108.webp', goal: 'Encuentra las fichas que tienen el mismo sonido.', steps: ['Toca una ficha y escucha su sonido.', 'Toca otra y escucha si son iguales.', 'Encuentra todas las parejas a tu ritmo.'] },
  { id: 'missing', title: 'El sonido que falta', instruction: 'Mira a los amigos. Escucha y busca quién no sonó.', description: 'Un amigo se quedó calladito.', action: 'Descubrir', color: '#C6EDDB', image: '/sounds/games/sound-missing-v108.webp', goal: 'Descubre cuál de los amigos no hizo su sonido.', steps: ['Mira a los amigos de esta ronda.', 'Escucha a los que sí hicieron su sonido.', 'Elige al amigo que se quedó en silencio.'] },
  { id: 'order', title: 'Primero y al final', instruction: 'Escucha la fila de sonidos y busca el lugar indicado.', description: 'Cada sonido ocupa un lugar.', action: 'Ubicar', color: '#F7CCE1', image: '/sounds/games/sound-order-v108.webp', goal: 'Descubre quién sonó primero o al final.', steps: ['Escucha toda la fila de sonidos.', 'Mira si buscamos al primero o al último.', 'Toca al amigo que ocupa ese lugar.'] },
  { id: 'odd', title: 'El intruso del coro', instruction: 'Escucha tres sonidos. Uno es diferente.', description: '¿Quién canta una nota distinta?', action: 'Distinguir', color: '#FFCFC3', image: '/sounds/games/sound-odd-v108.webp', goal: 'Encuentra el sonido diferente dentro del coro.', steps: ['Escucha los tres sonidos del coro.', 'Dos pertenecen al mismo amigo.', 'Elige al amigo que suena diferente.'] },
] as const;
export type SoundGameId = typeof soundGames[number]['id'];
const selections: Record<'early' | 'middle' | 'older', readonly string[]> = {
  early: ['explore', 'identify', 'pairs2', 'same', 'sequence', 'count', 'memory', 'missing', 'order'],
  middle: ['explore', 'identify', 'pairs3', 'same', 'sequence', 'count', 'memory', 'missing', 'odd'],
  older: ['identify', 'pairs3', 'same', 'sequence', 'count', 'memory', 'missing', 'order', 'odd'],
};
export function selectSoundGames(birthDate?: string, now = new Date()) {
  const age = gameAge(birthDate, now);
  return { ...age, games: selections[age.band].map(id => soundGames.find(game => game.id === id)!) };
}

export type AnimalId = 'cow' | 'cat' | 'dog' | 'chick';
export interface SoundAnimal { id: AnimalId; name: string; image: string; audio: string; voice: string; color: string }
export const animals: SoundAnimal[] = [
  { id: 'cow', name: 'Vaca', voice: '¡Muuu!', color: '#E6DDFC', image: '/sounds/animals/cow.svg', audio: '/sounds/animals/cow.mp3' },
  { id: 'cat', name: 'Gato', voice: '¡Miau!', color: '#FFE0D2', image: '/sounds/animals/cat.svg', audio: '/sounds/animals/cat.mp3' },
  { id: 'dog', name: 'Perro', voice: '¡Guau!', color: '#CFF1EB', image: '/sounds/animals/dog.svg', audio: '/sounds/animals/dog.mp3' },
  { id: 'chick', name: 'Pollito', voice: '¡Pío, pío!', color: '#FFF0B6', image: '/sounds/animals/chick.svg', audio: '/sounds/animals/chick.mp3' },
];
export const animalById = (id: AnimalId) => animals.find(animal => animal.id === id)!;
export const soundLevels = [
  { title: 'Toca y descubre', instruction: '¡Toca un animal y escucha!', description: 'Cuatro amigos tienen algo que contarte.', action: 'Explorar', icon: 'touch' },
  { title: '¿Quién está sonando?', instruction: 'Escucha… ¿quién es?', description: 'Abre bien tus oídos y encuentra a tu amigo.', action: 'Escuchar', icon: 'listen' },
  { title: 'Mis primeras dos parejas', instruction: 'Escucha una ficha y toca su animal.', description: 'Dos sonidos, dos amigos. Un paso pequeño para empezar.', action: 'Unir dos parejas', icon: 'match' },
  { title: 'El reto de tres parejas', instruction: 'Escucha una ficha y toca su animal.', description: 'Elige este juego cuando quieras descubrir tres parejas.', action: 'Unir tres parejas', icon: 'match' },
] as const;
export function shuffled<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function identificationRounds() {
  return [...shuffled(animals), shuffled(animals)[0]].map((answer, index) => ({
    answer: answer.id,
    options: shuffled([answer, ...shuffled(animals.filter(a => a.id !== answer.id)).slice(0, index < 2 ? 1 : 2)]),
  }));
}

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SoundWorld } from '@/modules/padre/presentation/Sessions/SoundGames/SoundWorld';
import { animals, soundLevels } from '@/modules/padre/presentation/Sessions/SoundGames/soundContent';
import { SoundTutorialScene } from '@/modules/padre/presentation/Sessions/SoundGames/SoundTutorialScene';
import { soundGames, type SoundGameId } from '@/modules/padre/presentation/Sessions/SoundGames/soundGames';
import type { SoundAudio } from '@/modules/padre/presentation/Sessions/SoundGames/useSoundAudio';

let player: HTMLAudioElement;
beforeEach(() => {
  vi.stubGlobal('Audio', function (source?: string) { player = document.createElement('audio'); if (source) player.src = source; return player; });
});
function mount(level = 1) {
  const back = vi.fn(), legacy = vi.fn();
  const view = render(<SoundWorld back={back} legacy={legacy}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Explorar los 11 juegos en familia' }));
  fireEvent.click(screen.getByRole('button', { name: `Jugar ${soundLevels[level - 1].title}` }));
  fireEvent.click(screen.getByRole('button', { name: '¡Vamos a jugar!' }));
  return { ...view, back };
}
async function endSound() { await act(async () => { fireEvent.playing(player); fireEvent.ended(player); }); }
const currentAnimal = () => animals.find(a => player.src.endsWith(a.audio))!;
function firePointer(target: Element, type: string, values: Record<string, string | number>) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
  fireEvent(target, event);
}

it('guía cada juego con voz completa y una escena de práctica propia', async () => {
  render(<SoundWorld back={vi.fn()} legacy={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Explorar los 11 juegos en familia' }));
  fireEvent.click(screen.getByRole('button', { name: 'Jugar Toca y descubre' }));
  expect(screen.getByRole('region', { name: 'Tutorial: Toca y descubre' })).toBeInTheDocument();
  expect(player.src).toContain('/sounds/voice/v108/');
  expect(screen.getByText('Mira y escucha con calma.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Escuchar instrucciones' }));
  expect(player.src).toContain('/sounds/voice/v108/');
  fireEvent.click(screen.getByRole('button', { name: 'Ver paso 2' }));
  expect(screen.getByText('Toca el dibujo o la ficha para jugar.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  expect(player.src).toContain('/cow.mp3');
  fireEvent.click(screen.getByRole('button', { name: '¡Vamos a jugar!' }));
  expect(screen.getByRole('button', { name: /Repetir instrucciones/ })).toBeInTheDocument();
});

it.each(soundGames.map(game => [game.id, game.title] as const))('presenta una mecánica interactiva para %s (%s)', gameId => {
  const audio = { play: vi.fn(async () => true), active: null, muted: false } as unknown as SoundAudio;
  render(<SoundTutorialScene gameId={gameId as SoundGameId} audio={audio}/>);
  expect(screen.getByTestId('sound-tutorial-scene')).toHaveClass(`sound-tutorial-demo-${gameId}`);
  expect(screen.getAllByText(/Toca|Escucha|Pulsa|Mira|Voltea/).length).toBeGreaterThan(0);
  if (gameId === 'sequence') expect(screen.getByRole('list', { name: 'Vagones del tren de sonidos' })).toBeInTheDocument();
  if (gameId === 'pairs2' || gameId === 'pairs3') expect(screen.getByLabelText('Fichas con sonido')).toBeInTheDocument();
  if (gameId === 'memory') expect(screen.getAllByRole('button', { name: /Voltear ficha/ })).toHaveLength(4);
});

it('permite practicar una unión, llenar el tren y encontrar una pareja de memoria', async () => {
  const audio = { play: vi.fn(async () => true), active: null, muted: false, loading: false } as unknown as SoundAudio;
  const pairing = render(<SoundTutorialScene gameId="pairs2" audio={audio}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Ficha 1' }));
  await waitFor(() => expect(screen.getByText(/Ahora toca a/)).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Vaca' })).toBeDisabled());
  pairing.unmount();

  const train = render(<SoundTutorialScene gameId="sequence" audio={audio}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Escuchar el tren' }));
  await waitFor(() => expect(screen.getByText(/Ahora toca los amigos/)).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  await waitFor(() => expect(screen.getByText(/busca al gato/)).toBeInTheDocument());
  expect(screen.getByRole('img', { name: 'Vaca' })).toBeInTheDocument();
  train.unmount();

  const memory = render(<SoundTutorialScene gameId="memory" audio={audio}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Voltear ficha 1' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ficha 1: Vaca' })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Voltear ficha 3' }));
  await waitFor(() => expect(screen.getByText('¡Son pareja! Busca otra.')).toBeInTheDocument());
  memory.unmount();
});

it('cuenta audios terminados, permite repetir y limpia audio al salir', async () => {
  const view = mount();
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  expect(player.src).toContain('/cow.mp3');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  fireEvent.click(screen.getByRole('button', { name: 'Gato' })); // Cancels cow.
  await endSound();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  for (const name of ['Vaca', 'Perro', 'Pollito']) { fireEvent.click(screen.getByRole('button', { name })); await endSound(); }
  expect(screen.getByRole('heading', { name: '¡Ya conoces sus sonidos!' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Vaca' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Otra vez' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  const pause = vi.spyOn(player, 'pause');
  fireEvent.click(screen.getByRole('button', { name: 'Volver a los juegos' }));
  expect(screen.getByRole('button', { name: 'Jugar Toca y descubre' })).toHaveFocus();
  expect(player.getAttribute('src')).toBeNull(); expect(pause).toHaveBeenCalled();
  view.unmount(); expect(fetch).not.toHaveBeenCalled();
});

it('un error o el silencio no completa actividades y se puede reintentar', async () => {
  const view = mount();
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  await act(async () => { fireEvent.error(player); });
  expect(screen.getByRole('alert')).toHaveTextContent('reintentar');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  fireEvent.click(screen.getByRole('button', { name: 'Silenciar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Activa el sonido');
  fireEvent.click(screen.getByRole('button', { name: 'Activar sonido' }));
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' })); await endSound();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  const pause = vi.spyOn(player, 'pause'); view.unmount(); expect(pause).toHaveBeenCalled();
});

it('identifica cinco sonidos con reintento amable, dos y luego tres opciones', async () => {
  mount(2);
  for (let round = 0; round < 5; round++) {
    const choices = document.querySelectorAll<HTMLButtonElement>('.sound-animal');
    expect(choices).toHaveLength(round < 2 ? 2 : 3);
    fireEvent.click(choices[0]); expect(screen.getByText('Primero toca el altavoz y escucha.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Escuchar sonido/ }));
    const answer = currentAnimal(); await endSound();
    expect(screen.queryByText(answer.voice)).not.toBeInTheDocument();
    const wrong = [...choices].find(choice => choice.getAttribute('aria-label') !== answer.name)!;
    fireEvent.click(wrong); expect(screen.getByText('Escuchemos otra vez')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: answer.name }));
    expect(screen.getByText('¡Lo encontraste!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: round === 4 ? 'Terminar' : 'Siguiente ronda' }));
  }
  expect(screen.getByRole('heading', { name: '¡Qué buenos oídos!' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Otra vez' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});

it.each([2, 3] as const)('relaciona %i parejas en su propio juego y reinicia sin cambiar de dificultad', async count => {
  mount(count === 2 ? 3 : 4);
  {
    const tokens = within(screen.getByLabelText('Fichas de sonido')).getAllByRole('button');
    expect(tokens).toHaveLength(count);
    for (let index = 0; index < count; index++) {
      fireEvent.click(tokens[index]); const answer = currentAnimal(); await endSound();
      const target = screen.getByRole('button', { name: `Relacionar con ${answer.name}` });
      if (index === 0) {
        const wrong = [...document.querySelectorAll<HTMLButtonElement>('.sound-animal')].find(b => b !== target && !b.disabled)!;
        fireEvent.click(wrong); expect(screen.getByText(/Casi…/)).toBeInTheDocument();
        fireEvent.click(tokens[index]); await endSound();
        const data = new Map<string, string>();
        const dataTransfer = { setData: (key: string, value: string) => data.set(key, value), getData: (key: string) => data.get(key) ?? '' };
        fireEvent.dragStart(tokens[index], { dataTransfer }); fireEvent.drop(target, { dataTransfer });
      } else fireEvent.click(target);
      if (index < count - 1) { expect(target).toBeDisabled(); expect(tokens[index]).toBeDisabled(); }
    }

  }
  expect(screen.getByRole('heading', { name: '¡Cada sonido encontró su lugar!' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Fichas de sonido')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Vamos con tres/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Otra vez' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  expect(within(screen.getByLabelText('Fichas de sonido')).getAllByRole('button')).toHaveLength(count);
});

it('permite arrastrar con tacto una ficha escuchada hasta su animal', async () => {
  mount(3);
  const token = within(screen.getByLabelText('Fichas de sonido')).getAllByRole('button')[0];
  fireEvent.click(token);
  const answer = currentAnimal(); await endSound();
  const target = screen.getByRole('button', { name: `Relacionar con ${answer.name}` });
  vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ left: 40, right: 100, top: 0, bottom: 80, width: 60, height: 80, x: 40, y: 0, toJSON: () => ({}) } as DOMRect);
  const pointer = { pointerId: 7, pointerType: 'touch', clientX: 0, clientY: 0 };
  firePointer(token, 'pointerdown', pointer);
  firePointer(token, 'pointermove', { ...pointer, clientX: 60, clientY: 40 });
  firePointer(token, 'pointerup', { ...pointer, clientX: 60, clientY: 40 });
  expect(target).toBeDisabled();
  expect(screen.getByText('¡Una pareja más!')).toBeInTheDocument();
});

it('evita completar por clics rápidos, al silenciar, reiniciar o desmontar', async () => {
  const view = mount(2);
  fireEvent.click(screen.getByRole('button', { name: 'Escuchar sonido' }));
  const correct = currentAnimal();
  fireEvent.click(screen.getByRole('button', { name: correct.name }));
  expect(screen.queryByText('¡Lo encontraste!')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Empezar otra vez' }));
  await act(async () => { fireEvent.ended(player); });
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  view.unmount(); expect(player.getAttribute('src')).toBeNull();
});

it('muestra un fallo de imagen legible y mantiene el control utilizable', async () => {
  mount();
  const card = screen.getByRole('button', { name: 'Gato' });
  fireEvent.error(card.querySelector('img')!);
  await waitFor(() => expect(within(card).getByText('Imagen no disponible: Gato')).toBeInTheDocument());
  fireEvent.click(card); await endSound();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
});

it('mantiene nueve juegos independientes, vuelve al menú tras completar y restaura foco', async () => {
  render(<SoundWorld back={vi.fn()} legacy={vi.fn()}/>);
  const menu = screen.getByLabelText('Juegos del taller');
  expect(within(menu).getAllByRole('button')).toHaveLength(9);
  fireEvent.click(screen.getByRole('button', { name: 'Jugar Toca y descubre' }));
  expect(screen.queryByLabelText('Juegos del taller')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '¡Vamos a jugar!' }));
  for (const animal of animals) {
    fireEvent.click(screen.getByRole('button', { name: animal.name })); await endSound();
  }
  fireEvent.click(screen.getByRole('button', { name: 'Elegir otro juego' }));
  expect(screen.getByRole('button', { name: 'Jugar Toca y descubre' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Explorar los 11 juegos en familia' }));
  fireEvent.click(screen.getByRole('button', { name: 'Jugar El reto de tres parejas' }));
  fireEvent.click(screen.getByRole('button', { name: '¡Vamos a jugar!' }));
  expect(within(screen.getByLabelText('Fichas de sonido')).getAllByRole('button')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Volver a los juegos' }));
  expect(screen.getByRole('button', { name: 'Jugar El reto de tres parejas' })).toHaveFocus();
  expect(fetch).not.toHaveBeenCalled();
});

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SoundWorld } from '@/pages/padre/Sessions/SoundGames/SoundWorld';
import { animals } from '@/pages/padre/Sessions/SoundGames/soundContent';

let player: HTMLAudioElement;
beforeEach(() => {
  vi.stubGlobal('Audio', function () { player = document.createElement('audio'); return player; });
});
function mount(level = 1) {
  const back = vi.fn(), legacy = vi.fn();
  const view = render(<SoundWorld back={back} legacy={legacy}/>);
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`Jugar nivel ${level}:`) }));
  return { ...view, back };
}
async function endSound() { await act(async () => { fireEvent.playing(player); fireEvent.ended(player); }); }
const currentAnimal = () => animals.find(a => player.src.endsWith(a.audio))!;

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
  fireEvent.click(screen.getByRole('button', { name: 'Otra vez' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  fireEvent.click(screen.getByRole('button', { name: 'Vaca' }));
  const pause = vi.spyOn(player, 'pause');
  fireEvent.click(screen.getByRole('button', { name: 'Volver a niveles' }));
  expect(screen.getByRole('button', { name: /Jugar nivel 1:/ })).toHaveFocus();
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

it('relaciona por toque y arrastre; pasa de dos a tres parejas y reinicia', async () => {
  mount(3);
  for (const count of [2, 3]) {
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
      expect(target).toBeDisabled(); expect(tokens[index]).toBeDisabled();
    }
    if (count === 2) fireEvent.click(screen.getByRole('button', { name: /Vamos con tres parejas/ }));
  }
  expect(screen.getByRole('heading', { name: '¡Cada sonido encontró su lugar!' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Otra vez' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  expect(within(screen.getByLabelText('Fichas de sonido')).getAllByRole('button')).toHaveLength(2);
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

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SoundWorld } from '@/pages/padre/Sessions/SoundGames/SoundWorld';
import { selectSoundGames } from '@/pages/padre/Sessions/SoundGames/soundGames';
import { soundRounds, type ChallengeKind } from '@/pages/padre/Sessions/SoundGames/soundRounds';
import { selectWordGames } from '@/pages/padre/Sessions/WordGames/wordSelection';

let player: HTMLAudioElement;
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(.999);
  vi.stubGlobal('Audio', function () { player = document.createElement('audio'); return player; });
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function open(title: string, challenge = false) {
  const view = render(<SoundWorld back={vi.fn()} legacy={vi.fn()}/>);
  click('Explorar los 11 juegos en familia');
  if (challenge) click(/Un poquito más/);
  click(`Jugar ${title}`); click('¡Vamos a jugar!'); return view;
}
async function listen(count: number) {
  vi.useFakeTimers(); click('Escuchar la ronda');
  for (let i = 0; i < count; i++) {
    await act(async () => { fireEvent.playing(player); fireEvent.ended(player); });
    if (i < count - 1) await act(async () => { vi.advanceTimersByTime(300); });
  }
  vi.useRealTimers();
}
it.each(['2022-01-01', '2020-01-01', '2018-01-01', undefined])('ambos mundos muestran nueve juegos únicos para %s', birth => {
  const now = new Date('2026-10-19T15:00:00Z');
  for (const selection of [selectSoundGames(birth, now), selectWordGames(birth, now)]) {
    expect(selection.games).toHaveLength(9); expect(new Set(selection.games.map(game => game.id)).size).toBe(9);
  }
});
it('las franjas cambian contenido del taller sin eliminar el catálogo familiar', () => {
  const now = new Date('2026-10-19T15:00:00Z');
  expect(selectSoundGames('2022-01-01', now).games.map(game => game.id)).toContain('pairs2');
  expect(selectSoundGames('2018-01-01', now).games.map(game => game.id)).not.toContain('explore');
  render(<SoundWorld back={vi.fn()} legacy={vi.fn()}/>);
  expect(screen.getAllByRole('button', { name: /^Jugar / })).toHaveLength(9);
  click('Explorar los 11 juegos en familia'); expect(screen.getAllByRole('button', { name: /^Jugar / })).toHaveLength(11);
  click('Volver a mis nueve juegos'); expect(screen.getAllByRole('button', { name: /^Jugar / })).toHaveLength(9);
});
it('las siete tarjetas nuevas apuntan a sus ilustraciones transparentes optimizadas', () => {
  render(<SoundWorld back={vi.fn()} legacy={vi.fn()}/>);
  fireEvent.click(screen.getByText('Para la familia')); click('Explorar los 11 juegos en familia');
  const images = [...document.querySelectorAll('.sound-game-art img')].map(image => image.getAttribute('src'));
  expect(images.filter(path => path?.includes('sound-') && path?.endsWith('-v108.webp'))).toHaveLength(7);
  expect(document.querySelector('.sound-image-error')).toBeNull();
});
it.each([false, true])('compara sonidos %s, bloquea respuestas antes del audio y completa tres rondas', async challenge => {
  open('¿Suenan igual?', challenge);
  expect(screen.getByRole('button', { name: 'Suenan iguales' })).toBeDisabled();
  for (let i = 0; i < 3; i++) {
    await listen(2); click('Suenan diferentes'); expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
    click('Dame una pista'); expect(screen.getByRole('note')).toHaveTextContent('mismo amigo');
    click('Suenan iguales'); click(i === 2 ? 'Terminar juego' : 'Continuar');
  }
  expect(screen.getByRole('region', { name: 'Actividad completada' })).toBeInTheDocument();
  click('Elegir otro juego'); expect(screen.getByText('Jugado en esta visita')).toBeInTheDocument(); expect(fetch).not.toHaveBeenCalled();
});
it.each([false, true])('tren %s: orden incorrecto no completa, puede quitar y ordenar', async challenge => {
  open('El tren de sonidos', challenge);
  for (let i = 0; i < 3; i++) {
    await listen(challenge ? 3 : 2);
    click('Gato'); click('Vaca'); if (challenge) click('Perro'); click('Comprobar mi tren');
    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
    click('Vaca'); click('Gato'); if (challenge) { click('Perro'); click('Quitar último vagón'); click('Perro'); }
    click('Comprobar mi tren'); click(i === 2 ? 'Terminar juego' : 'Continuar');
  }
  expect(screen.getByRole('region', { name: 'Actividad completada' })).toBeInTheDocument();
});
it.each([false, true])('cuenta %s sin premiar cantidad incorrecta', async challenge => {
  open('Uno, dos… ¡a escuchar!', challenge);
  for (let i = 0; i < 3; i++) {
    const amount = i + (challenge ? 2 : 1); await listen(amount);
    click(amount === 1 ? '2 sonidos' : '1 sonido'); expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
    click(`${amount} ${amount === 1 ? 'sonido' : 'sonidos'}`); click(i === 2 ? 'Terminar juego' : 'Continuar');
  }
  expect(screen.getByRole('region', { name: 'Actividad completada' })).toBeInTheDocument();
});
it.each([false, true])('sonido ausente %s, primero/último e intruso tienen respuestas verificables', challenge => {
  for (const kind of ['same', 'sequence', 'count', 'missing', 'order', 'odd'] as ChallengeKind[]) {
    const rounds = soundRounds(kind, challenge);
    expect(rounds).toHaveLength(3);
    for (const round of rounds) {
      if (kind === 'sequence') expect(round.answer).toBe(round.sounds.join(','));
      else expect(round.options).toContain(round.answer);
      if (kind === 'missing') expect(round.sounds).not.toContain(round.answer);
      if (kind === 'count') expect(Number(round.answer)).toBe(round.sounds.length);
      if (kind === 'odd') expect(round.sounds.filter(id => id === round.answer)).toHaveLength(1);
    }
  }
});
it.each(['El sonido que falta', 'Primero y al final', 'El intruso del coro'])('completa %s y deja reintentar un desacierto', async title => {
  open(title);
  for (let i = 0; i < 3; i++) {
    await listen(title === 'El intruso del coro' ? 3 : 2);
    const answer = title === 'El sonido que falta' ? 'Perro' : title === 'El intruso del coro' || i === 1 ? 'Gato' : 'Vaca';
    click(answer === 'Vaca' ? 'Gato' : 'Vaca'); expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
    click(answer); click(i === 2 ? 'Terminar juego' : 'Continuar');
  }
  expect(screen.getByRole('region', { name: 'Actividad completada' })).toBeInTheDocument();
});
it.each([false, true])('memoria auditiva %s: exige escuchar y conserva parejas correctas', async challenge => {
  open('Parejas que se escuchan', challenge); const pairs = challenge ? 3 : 2;
  click('Ver una pista'); expect(document.querySelectorAll('.sound-memory img')).toHaveLength(pairs * 2);
  click('Ocultar pista');
  for (let i = 1; i <= pairs; i++) {
    click(`Escuchar carta ${i}`); expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(i - 1));
    await act(async () => { fireEvent.ended(player); });
    click(`Escuchar carta ${i + pairs}`); await act(async () => { fireEvent.ended(player); });
  }
  expect(screen.getByRole('heading', { name: '¡Encontraste las parejas sonoras!' })).toBeInTheDocument();
});
it('cancelar entre clips, silenciar y salir nunca reanudan una secuencia', async () => {
  const view = open('El tren de sonidos');
  vi.useFakeTimers(); click('Escuchar la ronda'); await act(async () => { fireEvent.ended(player); });
  click('Silenciar'); const plays = vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length;
  await act(async () => { vi.advanceTimersByTime(500); });
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(plays); expect(screen.getByRole('button', { name: 'Vaca' })).toBeDisabled();
  view.unmount(); await act(async () => { vi.runOnlyPendingTimers(); }); vi.useRealTimers(); expect(fetch).not.toHaveBeenCalled();
});

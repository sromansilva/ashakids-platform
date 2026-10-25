import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ageInLima, selectWordGames } from '@/modules/padre/presentation/Sessions/WordGames/wordSelection';
import { WordWorld } from '@/modules/padre/presentation/Sessions/WordGames/WordWorld';

const today = new Date('2026-10-19T15:00:00Z');
it('calcula cumpleaños en Lima sin adelantarlo por UTC, valida fechas y no inventa edad', () => {
  expect(ageInLima('2020-10-19', new Date('2026-10-19T03:00:00Z'))).toBe(5);
  expect(ageInLima('2020-10-19', today)).toBe(6);
  expect(ageInLima('2020-02-29', today)).toBe(6);
  for (const date of [undefined, '', '2023-02-29', '2026-10-20', '2099-01-01', '2020-13-01', '2020-01-01T00:00:00Z']) expect(ageInLima(date, today)).toBeNull();
});
it.each(['2022-10-19', '2020-10-19', '2018-10-19', '2010-10-19', undefined])('ofrece nueve juegos únicos y micrófono para %s', date => {
  const games = selectWordGames(date, today).games;
  expect(games).toHaveLength(9);
  expect(new Set(games.map(game => game.id)).size).toBe(9);
  expect(games.some(game => game.id === 'naming')).toBe(true);
});
it('cambia la selección entre franjas sin convertir la edad en un permiso', () => {
  const early = selectWordGames('2022-01-01', today).games.map(game => game.id);
  const middle = selectWordGames('2020-01-01', today).games.map(game => game.id);
  const older = selectWordGames('2018-01-01', today).games.map(game => game.id);
  expect(early).toContain('count'); expect(early).not.toContain('sentence');
  expect(middle).toContain('sentence'); expect(middle).not.toContain('positions');
  expect(older).toContain('positions'); expect(older).not.toContain('memory');
});
it('muestra nueve inicialmente y permite explorar y volver al catálogo orientativo', () => {
  render(<WordWorld birthDate="2022-01-01" back={vi.fn()} legacy={vi.fn()}/>);
  expect(screen.getAllByRole('button', { name: /^Jugar / })).toHaveLength(9);
  fireEvent.click(screen.getByRole('button', { name: 'Explorar los 11 juegos en familia' }));
  expect(screen.getAllByRole('button', { name: /^Jugar / })).toHaveLength(11);
  fireEvent.click(screen.getByRole('button', { name: 'Volver a mis nueve juegos' }));
  expect(screen.getAllByRole('button', { name: /^Jugar / })).toHaveLength(9);
  expect(screen.getByText('0/9 aventuras')).toBeInTheDocument();
});
it('explica la selección inicial si falta la fecha y el acompañamiento para menores de cuatro', () => {
  const view = render(<WordWorld back={vi.fn()} legacy={vi.fn()}/>);
  expect(screen.getByText(/No tenemos una fecha de nacimiento válida/)).toBeInTheDocument();
  view.rerender(<WordWorld birthDate="2026-01-01" back={vi.fn()} legacy={vi.fn()}/>);
  expect(screen.getByText(/Esta colección está pensada desde los 4 años/)).toBeInTheDocument();
});

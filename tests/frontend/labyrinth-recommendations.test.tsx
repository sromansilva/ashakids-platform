import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MundoAshaLaberinto } from '@/modules/padre/presentation/MundoAshaLaberinto';

vi.mock('@/modules/padre/application/useSelectedFamilyPatient', () => ({
  useSelectedFamilyPatient: () => ({
    patients: { isPending: false },
    patient: { id_paciente: 7 },
  }),
}));

vi.mock('@/shared/application/hooks/useRemoteData', () => ({
  useRemote: () => ({
    data: {
      version: 'basica-1',
      mundos: [{
        id: 'LENGUAJE',
        asignado: true,
        recomendado_esta_semana: true,
        fonemas_recomendados: ['/r/', '/rr/', '/s/', '/pl/', '/tr/'],
      }],
    },
    isPending: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

it('allows choosing any recommended phoneme and preserves the selected target across stages', () => {
  render(<MundoAshaLaberinto go={vi.fn()} />);

  const singleR = screen.getByRole('button', { name: 'Practicar /r/ recomendado esta semana' });
  const doubleR = screen.getByRole('button', { name: 'Practicar /rr/ recomendado esta semana' });
  const clusterTr = screen.getByRole('button', { name: 'Practicar /tr/ recomendado esta semana' });
  expect(singleR).toHaveAttribute('aria-pressed', 'true');
  expect(doubleR).toHaveAttribute('aria-pressed', 'false');
  expect(clusterTr).toBeInTheDocument();

  fireEvent.click(doubleR);
  expect(singleR).toHaveAttribute('aria-pressed', 'false');
  expect(doubleR).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('⭐ Recomendada para /rr/')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Entrar al laberinto' }));
  expect(screen.getByText('El perro de Roque no tiene rabo')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
  fireEvent.click(screen.getByRole('button', { name: 'Practicar /tr/ recomendado esta semana' }));
  expect(screen.getByText('⭐ Recomendada para /tr/')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar al laberinto' }));
  expect(screen.getByText('El tren atraviesa el puente')).toBeInTheDocument();
});

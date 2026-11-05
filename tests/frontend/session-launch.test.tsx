import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Appointment } from '@/modules/clinica/domain/clinical';
import { SessionLaunchControls, startBlockReason } from '@/shared/presentation/components/common/SessionLaunchControls';

const start = vi.fn().mockResolvedValue({});
const create = vi.fn().mockResolvedValue({ id_sesion: 77 });
vi.mock('@/modules/auth/application/useAuth', () => ({ useAuth: () => ({ user: { id_usuario: 3 }, role: 'TERAPEUTA' }) }));
vi.mock('@/modules/clinica/infrastructure/clinicalService', () => ({
  sessionsService: { start: (...args: unknown[]) => start(...args), create: (...args: unknown[]) => create(...args) },
  appointmentsService: {},
}));

const MEET = 'https://meet.google.com/abc-defg-hij';
const START = Date.parse('2026-11-05T15:00:00Z');
const appointment: Appointment = {
  id_reserva: 45, id_paciente: 12, id_terapeuta: 4, id_tratamiento: null,
  paciente_nombre: 'Paciente', terapeuta_nombre: 'Terapeuta',
  fecha_hora_inicio: '2026-11-05T15:00:00Z', fecha_hora_fin: '2026-11-05T15:40:00Z',
  modalidad: 'VIRTUAL', localizacion: null, estado_reserva: 'CONFIRMADA', fecha_creacion: '2026-11-01T12:00:00Z',
  tipo_cita: 'TERAPIA', id_sesion: null, meet_url: MEET, estado_sesion: null,
};
const view = (value: Partial<Appointment>, now: number) => render(
  <QueryClientProvider client={new QueryClient()}><SessionLaunchControls appointment={{ ...appointment, ...value }} now={now} /></QueryClientProvider>,
);
afterEach(() => { vi.restoreAllMocks(); start.mockClear(); create.mockClear(); });

it('explica por que el inicio esta apagado segun el horario', () => {
  expect(startBlockReason(appointment, START - 6 * 60_000)).toBe('Se habilita a las 09:55, 5 minutos antes de la cita.');
  expect(startBlockReason(appointment, START - 4 * 60_000)).toBeNull();
  expect(startBlockReason(appointment, START + 41 * 60_000)).toMatch(/ya terminó/);
  expect(startBlockReason({ ...appointment, estado_reserva: 'PENDIENTE' }, START)).toMatch(/confirmada/);
});

it('fuera de horario el boton esta apagado, muestra el motivo y no hay modo prueba sin permiso', () => {
  view({}, START - 60 * 60_000);
  expect(screen.getByRole('button', { name: 'Iniciar reunión' })).toBeDisabled();
  expect(screen.getByText(/Se habilita a las 09:55/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /modo prueba/ })).not.toBeInTheDocument();
});

it('el modo prueba abre panel y Meet de inmediato, crea la sesion y la inicia con modo_prueba', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  view({ modo_prueba_disponible: true }, START - 60 * 60_000);
  expect(screen.getByText('Solo para pruebas: ignora el horario.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Iniciar ahora \(modo prueba\)/ }));
  expect(open).toHaveBeenNthCalledWith(1, '/terapeuta/sesion/45', '_blank', 'noopener,noreferrer');
  expect(open).toHaveBeenNthCalledWith(2, MEET, '_blank', 'noopener,noreferrer');
  await waitFor(() => expect(start).toHaveBeenCalledWith(77, true));
  expect(create).toHaveBeenCalledWith(45);
});

it('el inicio normal usa las pestanas de espera y no activa el modo prueba', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  view({ id_sesion: 9 }, START + 60_000);
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar reunión' }));
  expect(open).toHaveBeenNthCalledWith(1, '/terapeuta/sesion/espera/45/panel', '_blank', 'noopener,noreferrer');
  expect(open).toHaveBeenNthCalledWith(2, '/terapeuta/sesion/espera/45/meet', '_blank', 'noopener,noreferrer');
  await waitFor(() => expect(start).toHaveBeenCalledWith(9, false));
  expect(create).not.toHaveBeenCalled();
});

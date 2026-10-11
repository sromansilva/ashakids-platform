import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { AdminCitas } from '@/pages/admin/AdminModulosGenerales/AdminCitas';
import { useAppointments } from '@/hooks/useAppointments';

vi.mock('@/hooks/useAppointments', () => ({ useAppointments: vi.fn() }));
vi.mock('@/components/common/SessionActions', () => ({ SessionActions: ({ appointmentId }: { appointmentId: number }) => <p>Detalle de cita {appointmentId}</p> }));
const appointment = (id: number, therapist: number, modality: string, start: string, status = 'CONFIRMADA') => ({
  id_reserva: id, paciente_nombre: `Paciente ${id}`, id_terapeuta: therapist,
  terapeuta_nombre: `Terapeuta ${therapist}`, modalidad: modality, fecha_hora_inicio: start,
  fecha_hora_fin: new Date(Date.parse(start) + 40 * 60000).toISOString(), estado_reserva: status,
});
beforeEach(() => {
  vi.mocked(useAppointments).mockReturnValue({ query: {
    data: [
      appointment(1, 10, 'VIRTUAL', '2026-10-12T04:59:59Z'), // 11 octubre Lima
      appointment(2, 10, 'VIRTUAL', '2026-10-12T05:00:00Z'), // inicio del día12
      appointment(3, 10, 'PRESENCIAL', '2026-10-12T12:00:00Z'),
      appointment(4, 20, 'VIRTUAL', '2026-10-12T13:00:00Z'),
      appointment(5, 10, 'VIRTUAL', '2026-10-13T04:59:59Z', 'CANCELADA'), // final día12
      appointment(6, 10, 'VIRTUAL', '2026-10-13T05:00:00Z'), // inicio día13
    ], isPending: false, error: null, refetch: vi.fn(),
  } } as never);
});

it('combina terapeuta, modalidad, fecha de Lima y estado; limpia todos los filtros', () => {
  render(<AdminCitas />);
  fireEvent.change(screen.getByLabelText('Terapeuta'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'VIRTUAL' } });
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-12' } });
  fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-12' } });
  expect(screen.getByText('Mostrando 2 de 6 citas.')).toBeInTheDocument();
  expect(screen.getByText('Paciente 2')).toBeInTheDocument();
  expect(screen.getByText('Paciente 5')).toBeInTheDocument();
  for (const id of [1, 3, 4, 6]) expect(screen.queryByText(`Paciente ${id}`)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^confirmada$/ }));
  expect(screen.getByText('Mostrando 1 de 6 citas.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
  expect(screen.getByText('Mostrando 6 de 6 citas.')).toBeInTheDocument();
  expect(screen.getByLabelText('Desde')).toHaveValue('');
});

it('avisa rangos invertidos y permite filtrar sin fecha final', () => {
  render(<AdminCitas />);
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-13' } });
  expect(screen.getByText('Mostrando 1 de 6 citas.')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-12' } });
  expect(screen.getByRole('alert')).toHaveTextContent('La fecha hasta');
  expect(screen.queryByText('Paciente 6')).not.toBeInTheDocument();
});

it('conserva detalle y elimina creación, reprogramación y cancelación del panel', () => {
  render(<AdminCitas />);
  for (const name of ['Crear cita', 'Reprogramar cita', 'Cancelar cita']) expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Detalle' })[0]);
  expect(screen.getByText('Detalle de cita 1')).toBeInTheDocument();
});

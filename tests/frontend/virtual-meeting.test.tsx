import { afterEach, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Appointment } from '@/modules/clinica/domain/clinical';
import { VirtualMeeting, FAMILY_MEETING_REFRESH_MS } from '@/shared/presentation/components/common/VirtualMeeting';

vi.mock('@/modules/auth/application/useAuth', () => ({ useAuth: () => ({ user: { id_usuario: 3 }, role: 'PADRE' }) }));

const MEET = 'https://meet.google.com/abc-defg-hij';
const appointment: Appointment = {
  id_reserva: 45, id_paciente: 12, id_terapeuta: 4, id_tratamiento: null,
  paciente_nombre: 'Paciente de prueba', terapeuta_nombre: 'Terapeuta de prueba',
  fecha_hora_inicio: '2026-11-05T15:00:00Z', fecha_hora_fin: '2026-11-05T15:40:00Z',
  modalidad: 'VIRTUAL', localizacion: null, estado_reserva: 'CONFIRMADA', fecha_creacion: '2026-11-01T12:00:00Z',
  tipo_cita: 'TERAPIA', id_sesion: 9, meet_url: null, estado_sesion: 'PROGRAMADA',
};

const family = (value: Partial<Appointment>, onRefresh?: () => void) => render(
  <QueryClientProvider client={new QueryClient()}>
    <VirtualMeeting appointment={{ ...appointment, ...value }} professional={false} onRefresh={onRefresh} />
  </QueryClientProvider>,
);

afterEach(() => { vi.useRealTimers(); });

it('antes del inicio la familia ve la espera, sin enlace, y la pantalla se actualiza cada 15 s', () => {
  vi.useFakeTimers();
  const onRefresh = vi.fn();
  // Aunque llegara un enlace por error, no se muestra mientras la sesión no esté en curso.
  family({ meet_url: MEET }, onRefresh);
  expect(screen.getByText('Tu terapeuta aún no inicia la reunión.')).toBeInTheDocument();
  expect(screen.getByText(/Podrás entrar cuando la inicie \(hora programada 10:00\)/)).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(document.body.innerHTML).not.toContain('meet.google.com');
  expect(screen.queryByText(/profesional puede compartir/i)).not.toBeInTheDocument();
  act(() => { vi.advanceTimersByTime(FAMILY_MEETING_REFRESH_MS * 2); });
  expect(onRefresh).toHaveBeenCalledTimes(2);
});

it('sigue refrescando aunque el padre se vuelva a pintar cada segundo con una función nueva', () => {
  vi.useFakeTimers();
  const onRefresh = vi.fn();
  const tree = (tick: number) => (
    <QueryClientProvider client={new QueryClient()}>
      <VirtualMeeting key="reunion" appointment={{ ...appointment, id_paciente: appointment.id_paciente + 0 * tick }} professional={false} onRefresh={() => onRefresh()} />
    </QueryClientProvider>
  );
  const view = render(tree(0));
  for (let second = 1; second <= 16; second += 1) {
    act(() => { vi.advanceTimersByTime(1000); });
    view.rerender(tree(second));
  }
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

it('con la sesión en curso la familia puede entrar a la reunión', () => {
  const onRefresh = vi.fn();
  family({ estado_sesion: 'EN_CURSO', meet_url: MEET, reunion_disponible: true }, onRefresh);
  const link = screen.getByRole('link', { name: 'Entrar a la reunión' });
  expect(link).toHaveAttribute('href', MEET);
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.queryByText('Tu terapeuta aún no inicia la reunión.')).not.toBeInTheDocument();
});

it('con la sesión finalizada la familia ve que la reunión terminó y no hay enlace', () => {
  family({ estado_sesion: 'FINALIZADA', estado_reserva: 'COMPLETADA', meet_url: MEET });
  expect(screen.getByText('Esta reunión ya terminó.')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

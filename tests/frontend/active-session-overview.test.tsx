import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Appointment, Session } from '@/modules/clinica/domain/clinical';
import { ActiveSessionOverview, remainingScheduledTime } from '@/shared/presentation/components/common/ActiveSessionOverview';

const appointment: Appointment = {
  id_reserva: 45,
  id_paciente: 12,
  id_terapeuta: 4,
  id_tratamiento: null,
  paciente_nombre: 'Paciente de prueba',
  terapeuta_nombre: 'Terapeuta de prueba',
  fecha_hora_inicio: '2026-11-02T17:00:00Z',
  fecha_hora_fin: '2026-11-02T17:40:00Z',
  modalidad: 'VIRTUAL',
  localizacion: null,
  estado_reserva: 'CONFIRMADA',
  fecha_creacion: '2026-11-01T12:00:00Z',
  tipo_cita: 'INTRODUCTORIA',
  id_sesion: 9,
};

const session: Session = {
  id_sesion: 9,
  id_reserva: 45,
  cita: appointment,
  reporte_disponible: false,
  fecha_hora_inicio_real: '2026-11-02T17:00:00Z',
  fecha_hora_fin_real: null,
  asistencia: null,
  estado_sesion: 'EN_CURSO',
};

it('shows patient, therapist, session type, scheduled time, status, and remaining time', () => {
  render(<ActiveSessionOverview appointment={appointment} session={session} now={Date.parse('2026-11-02T17:10:00Z')} />);

  const panel = screen.getByRole('region', { name: 'Información de la sesión' });
  expect(panel).toHaveTextContent('Paciente de prueba');
  expect(panel).toHaveTextContent('Terapeuta de prueba');
  expect(panel).toHaveTextContent('Sesión #9 · Introductoria');
  expect(panel).toHaveTextContent('Estado: En curso');
  expect(panel).toHaveTextContent('Tiempo programado restante 30:00');
});

it('does not show the raw EN_CURSO status', () => {
  render(<ActiveSessionOverview appointment={appointment} session={session} now={Date.parse('2026-11-02T17:10:00Z')} />);
  expect(screen.getByRole('region', { name: 'Información de la sesión' })).not.toHaveTextContent('EN_CURSO');
});

it('counts the scheduled duration from the real start when the session began before the scheduled time', () => {
  const early = { ...session, fecha_hora_inicio_real: '2026-11-02T16:50:00Z' };
  render(<ActiveSessionOverview appointment={appointment} session={early} now={Date.parse('2026-11-02T16:55:00Z')} />);
  // 40 min programados desde 16:50: quedan 35 min, no los 45 que daría la hora programada.
  expect(screen.getByRole('region', { name: 'Información de la sesión' })).toHaveTextContent('Tiempo programado restante 35:00');
});

it('never shows thousands of minutes for a test session started days before the scheduled time', () => {
  const early = { ...session, fecha_hora_inicio_real: '2026-10-29T10:00:00Z' };
  const { container } = render(<ActiveSessionOverview appointment={appointment} session={early} now={Date.parse('2026-10-29T10:05:00Z')} />);
  expect(container).toHaveTextContent('Tiempo programado restante 35:00');
  const range = { start: Date.parse(appointment.fecha_hora_inicio), end: Date.parse(appointment.fecha_hora_fin), now: Date.parse('2026-10-29T12:00:00Z') };
  expect(remainingScheduledTime({ ...range, realStart: Date.parse('2026-10-29T10:00:00Z') })).toEqual({ kind: 'ended' });
  expect(remainingScheduledTime({ ...range, realStart: NaN })).toEqual({ kind: 'unknown' });
});

it('says the scheduled time ended without closing the session', () => {
  render(<ActiveSessionOverview appointment={appointment} session={session} now={Date.parse('2026-11-02T17:45:00Z')} />);
  const panel = screen.getByRole('region', { name: 'Información de la sesión' });
  expect(panel).toHaveTextContent('El tiempo programado terminó; la sesión sigue abierta hasta que la cierres');
  expect(panel).not.toHaveTextContent(/\d{3,}:\d{2}/);
});

import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Appointment, Session } from '@/modules/clinica/domain/clinical';
import { ActiveSessionOverview } from '@/shared/presentation/components/common/ActiveSessionOverview';

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
  expect(panel).toHaveTextContent('Estado: EN_CURSO');
  expect(panel).toHaveTextContent('Tiempo programado restante 30:00');
});

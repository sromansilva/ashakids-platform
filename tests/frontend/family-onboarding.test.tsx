import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/modules/auth/application/AuthContext';
import type { SemanticRole, User } from '@/modules/auth/domain/auth';
import type { Patient, Appointment } from '@/modules/clinica/domain/clinical';
import { patientsService, clinicaService, appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import { FamilyOnboarding } from '@/modules/padre/presentation/dashboard/FamilyOnboarding';

const mockChild: Patient = {
  id_paciente: 42,
  id_tutor: 1,
  nombres_paciente: 'Mateo',
  apellidos_paciente: 'García',
  fecha_nacimiento: '2019-05-15',
  sexo: 'Masculino',
  activo: true,
  fecha_registro: '2026-01-10',
};

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const user: User = {
    id_usuario: 1,
    codigo_usuario: 'P0001',
    nombres: 'Familia',
    apellidos: 'García',
    email: 'familia@example.com',
    rol: 'PADRE',
    roles: ['PADRE'],
    activo: true,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user,
            role: 'PADRE' as SemanticRole,
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
          }}
        >
          <FamilyOnboarding />
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

it('sin hijos -> paso 1 actual, pasos 2 y 3 bloqueados con aviso explicativo', async () => {
  vi.spyOn(patientsService, 'list').mockResolvedValue({ items: [], total: 0 });

  renderComponent();

  // Encabezado principal y progreso inicial
  expect(await screen.findByRole('heading', { name: 'Tus primeros pasos en ASHA' })).toBeInTheDocument();
  expect(screen.getByText('0 de 3 completados')).toBeInTheDocument();

  // Paso 1 activo
  const step1 = screen.getByRole('listitem', { current: 'step' });
  expect(within(step1).getByRole('heading', { name: 'Registra a tu hijo o hija' })).toBeInTheDocument();
  expect(within(step1).getByRole('button', { name: 'Registrar hijo' })).toBeInTheDocument();

  // Pasos 2 y 3 bloqueados
  const blockedButtons = screen.getAllByRole('button', { name: 'Primero registra a tu hijo' });
  expect(blockedButtons).toHaveLength(2);
  blockedButtons.forEach((btn) => {
    expect(btn).toBeDisabled();
  });
});

it('con hijo sin consentimiento -> paso 2 actual con el nombre del niño', async () => {
  vi.spyOn(patientsService, 'list').mockResolvedValue({ items: [mockChild], total: 1 });
  vi.spyOn(clinicaService, 'getConsent').mockResolvedValue({
    id_paciente: 42,
    consentido: false,
    estado: 'NO_SOLICITADO',
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    fecha_concesion: null,
  });
  vi.spyOn(appointmentsService, 'list').mockResolvedValue({ items: [], total: 0 });

  renderComponent();

  // Encabezado y progreso
  expect(await screen.findByRole('heading', { name: 'Tus primeros pasos en ASHA' })).toBeInTheDocument();
  expect(screen.getByText('1 de 3 completados')).toBeInTheDocument();

  // Paso 1 completado
  const stepItems = screen.getAllByRole('listitem');
  expect(within(stepItems[0]).getByText('Listo')).toBeInTheDocument();

  // Paso 2 actual con el nombre del niño
  const step2 = screen.getByRole('listitem', { current: 'step' });
  expect(
    within(step2).getByRole('heading', { name: 'Autoriza las muestras de voz de Mateo' }),
  ).toBeInTheDocument();
  expect(within(step2).getByRole('button', { name: 'Autorizar muestras' })).toBeInTheDocument();
  expect(
    within(step2).getByText(/es para que el terapeuta pueda pedir muestras breves de voz durante la sesión; se puede revocar/i),
  ).toBeInTheDocument();

  // Paso 3 bloqueado con motivo referenciando a Mateo
  const step3Button = within(stepItems[2]).getByRole('button', { name: 'Primero autoriza la voz de Mateo' });
  expect(step3Button).toBeDisabled();
});

it('con hijo y sin consentimiento no se pide /citas', async () => {
  const consentSpy = vi.spyOn(clinicaService, 'getConsent').mockResolvedValue({
    id_paciente: 42,
    consentido: false,
    estado: 'NO_SOLICITADO',
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    fecha_concesion: null,
  });
  const appointmentsSpy = vi.spyOn(appointmentsService, 'list');
  vi.spyOn(patientsService, 'list').mockResolvedValue({ items: [mockChild], total: 1 });

  renderComponent();

  // Paso 2 actual visible
  expect(await screen.findByRole('heading', { name: 'Autoriza las muestras de voz de Mateo' })).toBeInTheDocument();

  // Se consultó consentimiento para Mateo, pero appointmentsService.list no debe haberse llamado
  expect(consentSpy).toHaveBeenCalledWith(42, expect.anything());
  expect(appointmentsSpy).not.toHaveBeenCalled();
});

it('con hijo con consentimiento pero sin cita -> paso 3 actual con el nombre del niño', async () => {
  vi.spyOn(patientsService, 'list').mockResolvedValue({ items: [mockChild], total: 1 });
  vi.spyOn(clinicaService, 'getConsent').mockResolvedValue({
    id_paciente: 42,
    consentido: true,
    estado: 'CONCEDIDO',
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    fecha_concesion: '2026-01-15T10:00:00Z',
  });
  vi.spyOn(appointmentsService, 'list').mockResolvedValue({ items: [], total: 0 });

  renderComponent();

  // Progreso: 2 de 3
  expect(await screen.findByText('2 de 3 completados')).toBeInTheDocument();

  // Paso 3 actual
  const step3 = screen.getByRole('listitem', { current: 'step' });
  expect(
    within(step3).getByRole('heading', { name: 'Reserva la sesión introductoria de Mateo' }),
  ).toBeInTheDocument();
  expect(within(step3).getByRole('button', { name: 'Reservar cita' })).toBeInTheDocument();
});

it('todo completo -> mensaje final y descarte en localStorage por id de hijo', async () => {
  vi.spyOn(patientsService, 'list').mockResolvedValue({ items: [mockChild], total: 1 });
  vi.spyOn(clinicaService, 'getConsent').mockResolvedValue({
    id_paciente: 42,
    consentido: true,
    estado: 'CONCEDIDO',
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    fecha_concesion: '2026-01-15T10:00:00Z',
  });
  vi.spyOn(appointmentsService, 'list').mockResolvedValue({
    items: [
      {
        id_reserva: 10,
        id_paciente: 42,
        id_terapeuta: 2,
        id_tratamiento: null,
        tipo_cita: 'INTRODUCTORIA',
        paciente_nombre: 'Mateo García',
        terapeuta_nombre: 'Lic. Especialista',
        id_sesion: null,
        estado_reserva: 'CONFIRMADA',
        fecha_creacion: '2026-01-16T12:00:00Z',
        fecha_hora_inicio: '2026-01-20T10:00:00Z',
        fecha_hora_fin: '2026-01-20T10:45:00Z',
        modalidad: 'VIRTUAL',
        localizacion: 'La reunión será mediante Google Meet.',
      } as Appointment,
    ],
    total: 1,
  });

  renderComponent();

  // Mensaje final
  expect(
    await screen.findByRole('heading', { name: '¡Todo listo! Te esperamos en la sesión introductoria' }),
  ).toBeInTheDocument();
  expect(
    screen.getByText('Ya completaste los pasos iniciales para comenzar tu acompañamiento en ASHA.'),
  ).toBeInTheDocument();

  // Botón de cierre que persiste en localStorage
  const dismissBtn = screen.getByRole('button', { name: 'Cerrar aviso de primeros pasos' });
  fireEvent.click(dismissBtn);

  await waitFor(() => {
    expect(localStorage.getItem('ashakids:onboarding-dismissed:42')).toBe('true');
    expect(
      screen.queryByRole('heading', { name: '¡Todo listo! Te esperamos en la sesión introductoria' }),
    ).not.toBeInTheDocument();
  });
});

it('con el aviso cerrado en localStorage no se hace ninguna petición a /citas ni a consentimientos', async () => {
  localStorage.setItem('ashakids:onboarding-dismissed:42', 'true');
  const consentSpy = vi.spyOn(clinicaService, 'getConsent');
  const appointmentsSpy = vi.spyOn(appointmentsService, 'list');
  vi.spyOn(patientsService, 'list').mockResolvedValue({ items: [mockChild], total: 1 });

  renderComponent();

  // El componente devuelve null inmediatamente y no debe renderizar el onboarding ni las consultas
  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: 'Tus primeros pasos en ASHA' })).not.toBeInTheDocument();
  });
  expect(screen.queryByRole('heading', { name: '¡Todo listo! Te esperamos en la sesión introductoria' })).not.toBeInTheDocument();

  expect(consentSpy).not.toHaveBeenCalled();
  expect(appointmentsSpy).not.toHaveBeenCalled();
});

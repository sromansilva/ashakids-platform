import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { clinicaService } from '@/modules/clinica/infrastructure/clinicalService';
import { FamilyConsentPrompt } from '@/shared/presentation/components/common/FamilyConsentPrompt';

beforeEach(() => vi.restoreAllMocks());

function renderPrompt(estado: 'NO_SOLICITADO' | 'CONCEDIDO' | 'REVOCADO' = 'NO_SOLICITADO') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.spyOn(clinicaService, 'getConsent').mockResolvedValue({
    id_paciente: 42,
    consentido: estado === 'CONCEDIDO',
    estado,
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    fecha_concesion: null,
  });
  return render(
    <QueryClientProvider client={client}>
      <FamilyConsentPrompt patientId={42} patientName="Mateo" />
    </QueryClientProvider>,
  );
}

it('pide consentimiento en contexto de la primera cita y guarda la autorización expresa', async () => {
  const grant = vi.spyOn(clinicaService, 'grantConsent').mockResolvedValue({
    id_consentimiento: 5,
    id_paciente: 42,
    consentido: true,
    estado: 'CONCEDIDO',
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
  });
  renderPrompt();

  expect(await screen.findByRole('dialog', { name: '¿Autorizas una prueba breve de voz?' })).toBeInTheDocument();
  expect(screen.getByText(/nunca se toma de Google Meet/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Sí, autorizo' }));

  await waitFor(() => expect(grant).toHaveBeenCalledWith({
    id_paciente: 42,
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    estado: 'CONCEDIDO',
  }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('registra el rechazo y permite continuar sin bloquear la atención', async () => {
  const grant = vi.spyOn(clinicaService, 'grantConsent').mockResolvedValue({
    id_consentimiento: 6,
    id_paciente: 42,
    consentido: false,
    estado: 'REVOCADO',
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
  });
  renderPrompt();
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'No autorizar IA' }));

  await waitFor(() => expect(grant).toHaveBeenCalledWith({
    id_paciente: 42,
    tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
    estado: 'REVOCADO',
  }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it.each(['CONCEDIDO', 'REVOCADO'] as const)('no vuelve a mostrar el prompt si el consentimiento ya fue %s', async (estado) => {
  renderPrompt(estado);
  await waitFor(() => expect(clinicaService.getConsent).toHaveBeenCalledWith(42));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

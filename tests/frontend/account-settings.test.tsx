import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AccountSettings } from '@/modules/auth/presentation/AccountSettings';
import { authService } from '@/modules/auth/infrastructure/authService';

vi.mock('@/modules/auth/application/useAuth', () => ({
  useAuth: () => ({ user: { id_usuario: 5, email: 'soporte@example.invalid', nombres: 'Agente', apellidos: 'Soporte', codigo_usuario: 'S00001', rol: 'SOPORTE_TECNICO', roles: ['SOPORTE_TECNICO'], activo: true } }),
}));
vi.mock('@/modules/auth/infrastructure/authService', () => ({ authService: {
  get2faStatus: vi.fn(), changePassword: vi.fn(), setup2fa: vi.fn(), confirm2faSetup: vi.fn(), disable2fa: vi.fn(),
} }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(authService.get2faStatus).mockResolvedValue({ totp_activado: false });
  vi.mocked(authService.changePassword).mockResolvedValue({ success: true, message: 'Contraseña actualizada.' });
});

it('muestra el perfil individual y cambia la contraseña con validación y confirmación', async () => {
  render(<AccountSettings />);
  expect(screen.getByText('S00001')).toBeInTheDocument();
  expect(screen.getByText('soporte@example.invalid')).toBeInTheDocument();
  expect(await screen.findByText('Estado: desactivada')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Contraseña actual'), { target: { value: 'ActualSegura123' } });
  fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'NuevaSegura123' } });
  fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'OtraNueva123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('no coinciden');
  expect(authService.changePassword).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'NuevaSegura123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  await waitFor(() => expect(authService.changePassword).toHaveBeenCalledWith('ActualSegura123', 'NuevaSegura123'));
  expect(await screen.findByRole('status')).toHaveTextContent('Contraseña actualizada.');
});

it('configura 2FA solo cuando el usuario lo solicita y valida el código', async () => {
  vi.mocked(authService.setup2fa).mockResolvedValue({ qr_code: 'data:image/png;base64,abc', secret: 'secret', manual_code: 'secret', uri: 'otpauth://test' });
  vi.mocked(authService.confirm2faSetup).mockResolvedValue({ success: true, message: 'Activada', totp_activado: true });
  render(<AccountSettings />);
  expect(await screen.findByRole('button', { name: 'Activar 2FA' })).toBeInTheDocument();
  expect(authService.setup2fa).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Activar 2FA' }));
  expect(await screen.findByAltText('Código QR para configurar autenticación en dos pasos')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Código de 6 dígitos'), { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar y activar' }));
  await waitFor(() => expect(authService.confirm2faSetup).toHaveBeenCalledWith('123456'));
  expect(await screen.findByText('Estado: activada')).toBeInTheDocument();
});

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AdminSolicitudes } from '@/modules/admin/presentation/AdminSolicitudes';
import { adminService, type SolicitudAcceso } from '@/modules/admin/infrastructure/adminService';
import { ApiError } from '@/core/api/client';

const base: SolicitudAcceso = {
  id_solicitud: 7, telefono: '51999888777', nombres: 'Ana María', apellidos: 'Pérez Gómez', dni: '12345678',
  email: 'ana@example.com', estado: 'PENDIENTE', consentimiento_en: '2026-11-05T15:00:00Z', id_usuario_creado: null,
  revisado_por: null, revisado_en: null, correo_estado: null, aviso_whatsapp_estado: null,
  ultimo_mensaje_en: '2026-11-05T15:00:00Z', creado_en: '2026-11-05T15:00:00Z',
};
const approved = { ...base, estado: 'APROBADA' as const };

async function openDetail() {
  render(<AdminSolicitudes />);
  fireEvent.click(await screen.findByRole('button', { name: /Ana María Pérez Gómez/ }));
  expect(screen.getByText('12345678')).toBeInTheDocument();
  expect(screen.getByText('51999888777')).toBeInTheDocument();
}

it('muestra la bandeja real, sin datos ficticios de terapeutas', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  await openDetail();
  expect(screen.getByRole('heading', { name: 'Solicitudes de acceso' })).toBeInTheDocument();
  expect(screen.queryByText(/Lic\. María Fernández/)).not.toBeInTheDocument();
});

it('aprobar con confirmación muestra el resultado con correo y aviso enviados', async () => {
  const list = vi.spyOn(adminService, 'getSolicitudesAcceso')
    .mockResolvedValueOnce({ items: [base], total: 1 })
    .mockResolvedValue({ items: [approved], total: 1 });
  const approve = vi.spyOn(adminService, 'aprobarSolicitudAcceso').mockResolvedValue({
    message: 'ok', solicitud: approved, correo_bienvenida: 'ENVIADO', aviso_whatsapp: 'ENVIADO',
  });
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
  expect(approve).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar aprobación' }));
  const status = await screen.findByRole('status');
  expect(approve).toHaveBeenCalledWith(7);
  expect(within(status).getByText(/enlace de activación se envió a ana@example.com/)).toBeInTheDocument();
  expect(within(status).getByText('Aviso por WhatsApp enviado.')).toBeInTheDocument();
  await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
});

it('si el correo no salió muestra la advertencia y remite al reenvío de activación', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  vi.spyOn(adminService, 'aprobarSolicitudAcceso').mockResolvedValue({
    message: 'ok', solicitud: approved, correo_bienvenida: 'NO_CONFIGURADO', aviso_whatsapp: 'OMITIDO',
  });
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar aprobación' }));
  const status = await screen.findByRole('status');
  expect(within(status).getByText(/correo de activación NO salió/)).toBeInTheDocument();
  expect(within(status).getByText(/reenvío de activación/)).toBeInTheDocument();
  expect(within(status).queryByText(/se envió a/)).not.toBeInTheDocument();
  expect(within(status).getByText(/porque el correo de activación no salió/)).toBeInTheDocument();
});

it('un 409 por correo duplicado se muestra como error', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  vi.spyOn(adminService, 'aprobarSolicitudAcceso').mockRejectedValue(new ApiError('Ya existe una cuenta con ese correo.', 409));
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar aprobación' }));
  expect(await screen.findByText('Ya existe una cuenta con ese correo.')).toBeInTheDocument();
});

it('rechazar pide confirmación y ofrece volver sin llamar al servidor', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  const reject = vi.spyOn(adminService, 'rechazarSolicitudAcceso');
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
  expect(reject).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument();
});

it('muestra estado de error con reintento y estado vacío', async () => {
  const list = vi.spyOn(adminService, 'getSolicitudesAcceso')
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({ items: [], total: 0 });
  render(<AdminSolicitudes />);
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await screen.findByText(/No hay solicitudes pendientes/);
  expect(list).toHaveBeenCalledTimes(2);
});


it('permite reenviar con carga y confirma el envio', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [{ ...approved, id_usuario_creado: 42, correo_estado: 'PENDIENTE' }], total: 1 });
  let finish!: (value: { correo_estado: 'ENVIADO' }) => void;
  const send = vi.spyOn(adminService, 'reenviarActivacion').mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  render(<AdminSolicitudes />);
  fireEvent.click(await screen.findByRole('button', { name: /Aprobadas/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Ana Mar/ }));
  fireEvent.click(screen.getByRole('button', { name: /Reenviar activaci/ }));
  expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  expect(send).toHaveBeenCalledWith(42);
  finish({ correo_estado: 'ENVIADO' });
  await screen.findByText('Correo de activación enviado.');
});

it('muestra un error si falla el reenvio', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [{ ...approved, id_usuario_creado: 42, correo_estado: 'PENDIENTE' }], total: 1 });
  vi.spyOn(adminService, 'reenviarActivacion').mockRejectedValue(new Error('Error de reenvio'));
  render(<AdminSolicitudes />);
  fireEvent.click(await screen.findByRole('button', { name: /Aprobadas/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Ana Mar/ }));
  fireEvent.click(screen.getByRole('button', { name: /Reenviar activaci/ }));
  await screen.findByText('Error de reenvio');
});

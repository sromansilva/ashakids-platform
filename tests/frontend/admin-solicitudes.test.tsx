import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminSolicitudes } from '@/modules/admin/presentation/AdminSolicitudes';
import { adminService, type SolicitudAcceso } from '@/modules/admin/infrastructure/adminService';
import { ApiError } from '@/core/api/client';

const base: SolicitudAcceso = {
  id_solicitud: 7,
  telefono: '51999888777',
  nombres: 'Ana María',
  apellidos: 'Pérez Gómez',
  dni: '12345678',
  email: 'ana@example.com',
  estado: 'PENDIENTE',
  consentimiento_en: '2026-11-05T15:00:00Z',
  id_usuario_creado: null,
  revisado_por: null,
  revisado_en: null,
  correo_estado: null,
  aviso_whatsapp_estado: null,
  motivo_rechazo: null,
  dni_verificacion_estado: null,
  dni_verificado_en: null,
  ultimo_mensaje_en: '2026-11-05T15:00:00Z',
  creado_en: '2026-11-05T15:00:00Z',
};
const approved = { ...base, estado: 'APROBADA' as const };
const approvedWithUser: SolicitudAcceso = {
  ...base,
  estado: 'APROBADA',
  id_usuario_creado: 42,
  correo_estado: 'PENDIENTE',
};

function renderSolicitudes() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminSolicitudes />
    </QueryClientProvider>
  );
}

async function openDetail() {
  renderSolicitudes();
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
    message: 'ok',
    solicitud: approved,
    correo_bienvenida: 'ENVIADO',
    aviso_whatsapp: 'ENVIADO',
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
    message: 'ok',
    solicitud: approved,
    correo_bienvenida: 'NO_CONFIGURADO',
    aviso_whatsapp: 'OMITIDO',
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

it('rechazar exige motivo de al menos 10 caracteres y envía el motivo al servidor', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  const reject = vi.spyOn(adminService, 'rechazarSolicitud').mockResolvedValue({
    message: 'Solicitud rechazada.',
    solicitud: { ...base, estado: 'RECHAZADA', motivo_rechazo: 'DNI no coincide con los apellidos indicados' },
    aviso_whatsapp: 'ENVIADO',
  });
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

  const confirmBtn = screen.getByRole('button', { name: 'Rechazar solicitud' });
  expect(confirmBtn).toBeDisabled();

  const textarea = screen.getByPlaceholderText(/No pudimos verificar/);
  fireEvent.change(textarea, { target: { value: 'Corto' } });
  expect(confirmBtn).toBeDisabled();

  fireEvent.change(textarea, { target: { value: 'DNI no coincide con los apellidos indicados' } });
  expect(confirmBtn).not.toBeDisabled();

  fireEvent.click(confirmBtn);
  await waitFor(() => {
    expect(reject).toHaveBeenCalledWith(7, 'DNI no coincide con los apellidos indicados');
  });
});

it('permite cancelar el diálogo de rechazo sin llamar al servidor', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  const reject = vi.spyOn(adminService, 'rechazarSolicitud');
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(reject).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument();
});

it('verificar DNI muestra insignia COINCIDE', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  const verify = vi.spyOn(adminService, 'verificarDniSolicitud').mockResolvedValue({
    estado: 'COINCIDE',
    verificado_en: '2026-11-05T15:10:00Z',
    solicitud: { ...base, dni_verificacion_estado: 'COINCIDE', dni_verificado_en: '2026-11-05T15:10:00Z' },
  });
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Verificar DNI' }));
  expect(verify).toHaveBeenCalledWith(7);
  expect(await screen.findByText('DNI verificado')).toBeInTheDocument();
});

it('verificar DNI muestra insignia NO_COINCIDE con el nombre de RENIEC', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [base], total: 1 });
  vi.spyOn(adminService, 'verificarDniSolicitud').mockResolvedValue({
    estado: 'NO_COINCIDE',
    verificado_en: '2026-11-05T15:10:00Z',
    nombre_reniec: 'ANA MARÍA PÉREZ RAMÍREZ',
    solicitud: { ...base, dni_verificacion_estado: 'NO_COINCIDE', dni_verificado_en: '2026-11-05T15:10:00Z' },
  });
  await openDetail();
  fireEvent.click(screen.getByRole('button', { name: 'Verificar DNI' }));
  expect(await screen.findByText('Los datos no coinciden')).toBeInTheDocument();
  expect(screen.getByText('ANA MARÍA PÉREZ RAMÍREZ')).toBeInTheDocument();
});

it('muestra el motivo guardado en solicitudes rechazadas', async () => {
  const rejected: SolicitudAcceso = {
    ...base,
    estado: 'RECHAZADA',
    motivo_rechazo: 'Documentación incompleta tras reiteradas llamadas.',
    revisado_en: '2026-11-05T16:00:00Z',
  };
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({ items: [rejected], total: 1 });
  renderSolicitudes();
  fireEvent.click(await screen.findByRole('button', { name: /Rechazadas/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Ana María Pérez Gómez/ }));
  expect(screen.getByText('Documentación incompleta tras reiteradas llamadas.')).toBeInTheDocument();
});

it('muestra estado de error con reintento y estado vacío', async () => {
  const list = vi.spyOn(adminService, 'getSolicitudesAcceso')
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({ items: [], total: 0 });
  renderSolicitudes();
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await screen.findByText(/No hay solicitudes pendientes/);
  expect(list).toHaveBeenCalledTimes(2);
});

it('permite reenviar con carga y confirma el envio', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({
    items: [approvedWithUser],
    total: 1,
  });
  let finish!: (value: { correo_estado: 'ENVIADO' }) => void;
  const send = vi.spyOn(adminService, 'reenviarActivacion').mockImplementation(
    () => new Promise((resolve) => { finish = resolve; }),
  );
  renderSolicitudes();
  fireEvent.click(await screen.findByRole('button', { name: /Aprobadas/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Ana Mar/ }));
  fireEvent.click(screen.getByRole('button', { name: /Reenviar activaci/ }));
  expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  expect(send).toHaveBeenCalledWith(42);
  finish({ correo_estado: 'ENVIADO' });
  await screen.findByText('Correo de activación enviado.');
});

it('muestra un error si falla el reenvio', async () => {
  vi.spyOn(adminService, 'getSolicitudesAcceso').mockResolvedValue({
    items: [approvedWithUser],
    total: 1,
  });
  vi.spyOn(adminService, 'reenviarActivacion').mockRejectedValue(new Error('Error de reenvio'));
  renderSolicitudes();
  fireEvent.click(await screen.findByRole('button', { name: /Aprobadas/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Ana Mar/ }));
  fireEvent.click(screen.getByRole('button', { name: /Reenviar activaci/ }));
  await screen.findByText('Error de reenvio');
});

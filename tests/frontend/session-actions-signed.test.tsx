import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/modules/auth/application/AuthContext';
import { SessionActions } from '@/shared/presentation/components/common/SessionActions';

const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': '1' } });

function setup(reportState: 'BORRADOR' | 'FIRMADO') {
  let closed = false;
  const appointment = () => ({ id_reserva: 1, id_paciente: 12, id_terapeuta: 1, id_tratamiento: null, tipo_cita: 'TERAPIA', paciente_nombre: 'Ana', terapeuta_nombre: 'Profe', id_sesion: 9,
    fecha_hora_inicio: '2026-11-02T17:00:00Z', fecha_hora_fin: '2026-11-02T17:40:00Z', modalidad: 'PRESENCIAL', localizacion: 'Centro', estado_reserva: 'CONFIRMADA', fecha_creacion: '2026-11-01T12:00:00Z' });
  const session = () => ({ id_sesion: 9, id_reserva: 1, cita: appointment(), reporte_disponible: true, fecha_hora_inicio_real: '2026-11-02T17:00:00Z',
    fecha_hora_fin_real: closed ? '2026-11-02T17:40:00Z' : null, asistencia: closed ? 'ASISTIO' : null, estado_sesion: closed ? 'FINALIZADA' : 'EN_CURSO', puede_editar: true });
  vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1', '');
    if (path === '/citas/1') return reply(appointment());
    if (path === '/sesiones/9/cerrar' && init.method === 'POST') { closed = true; return reply(session()); }
    if (path === '/sesiones/9') return reply(session());
    if (path === '/sesiones/9/reporte') return reply({ id_reporte_sesion: 3, id_sesion: 9, fecha_creacion: '2026-11-02T17:41:00Z', estado_reporte: reportState, id_usuario_firma: null, fecha_firma: null, firmado_por: null,
      observaciones_iniciales: 'a', objetivos_trabajados: 'b', nivel_ayuda: '2', proximos_pasos: 'c' });
    return reply([]);
  });
  const user = { id_usuario: 1, codigo_usuario: 't', nombres: 'Profe', apellidos: 'Uno', rol: 'TERAPEUTA' as const, roles: ['TERAPEUTA' as const], activo: true, email: 't@example.invalid' };
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter>
    <AuthContext.Provider value={{ user, role: 'TERAPEUTA', isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() }}>
      <SessionActions appointmentId={1} />
    </AuthContext.Provider></MemoryRouter></QueryClientProvider>);
}

async function finalize() {
  fireEvent.click(await screen.findByRole('button', { name: 'Finalizar sesión' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar cierre' }));
}

it('pide completar y firmar el reporte cuando sigue en borrador', async () => {
  setup('BORRADOR');
  await finalize();
  expect(await screen.findByText('Sesión finalizada. Completa y firma el reporte.')).toBeInTheDocument();
});

it('indica que el reporte ya está firmado y no pide firmarlo otra vez', async () => {
  setup('FIRMADO');
  await finalize();
  expect(await screen.findByText('Sesión finalizada. El reporte ya está firmado; puedes preparar el plan.')).toBeInTheDocument();
  expect(screen.queryByText('Sesión finalizada. Completa y firma el reporte.')).not.toBeInTheDocument();
});

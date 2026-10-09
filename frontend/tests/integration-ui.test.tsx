import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderRoute } from './helpers';
import { appointmentsService, patientsService, sessionsService, treatmentsService, usersService } from '@/services/clinicalService';
import { apiClient, invalidateIdentityRequests } from '@/api/client';

const patient = { id_paciente: 12, id_tutor: 7, nombres_paciente: 'Paciente', apellidos_paciente: 'Aislado', fecha_nacimiento: '2019-02-01', sexo: 'M', activo: true, fecha_registro: '2026-01-01' };
const account = { id_usuario: 17, id_tutor: 7, id_terapeuta: null, nombres: 'Tutor', apellidos: 'Aislado', codigo_usuario: 'p90001', email: 'test@example.invalid', roles: ['PADRE'], activo: true };
const appointment = { id_reserva: 25, id_paciente: 12, id_tratamiento: 5, id_terapeuta: 4, paciente_nombre: 'Paciente Aislado', terapeuta_nombre: 'Profesional Aislado', fecha_hora_inicio: '2026-01-01T10:00:00-05:00', fecha_hora_fin: '2026-01-01T11:00:00-05:00', modalidad: 'PRESENCIAL', localizacion: 'Consultorio', estado_reserva: 'CONFIRMADA', id_sesion: 9 };
const report = { id_sesion: 9, observaciones_iniciales: 'Observación guardada', objetivos_trabajados: 'Objetivo guardado', nivel_ayuda: 'Apoyo mínimo', proximos_pasos: 'Continuar', fecha_creacion: '2026-01-01', id_reporte_sesion: 1 };
const session = { id_sesion: 9, id_reserva: 25, cita: appointment, reporte_disponible: true, estado_sesion: 'EN_CURSO', asistencia: null, fecha_hora_inicio_real: appointment.fecha_hora_inicio, fecha_hora_fin_real: null };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(Array.isArray(body) ? body.length : 1) } });
function mockApi(overrides?: (path: string, init: RequestInit) => Response | Promise<Response> | undefined) {
  return vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1', '');
    const custom = overrides?.(path, init); if (custom) return custom;
    if (path === '/usuarios') return response([account]);
    if (path === '/pacientes') return response([patient]);
    if (path === '/citas') return response([appointment]);
    if (path === '/citas/25') return response(appointment);
    if (path === '/sesiones') return response([session]);
    if (path === '/sesiones/9') return response(session);
    if (path === '/sesiones/9/reporte') return response(report);
    if (path === '/pacientes/12/tratamientos') return response([{ id_tratamiento: 5, estado_tratamiento: 'ACTIVO', nombre_tratamiento: 'Lenguaje', terapeuta_nombre: 'Profesional Aislado' }]);
    return response([]);
  });
}

it('Family reports distinguish persisted session data from demo metrics', async () => {
  mockApi(); renderRoute('/padre/reportes', 'PADRE');
  expect(await screen.findByText('Sin medición')).toBeInTheDocument();
  expect(screen.getByText('Sin registro')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Progreso mensual (pendiente)' })).toBeInTheDocument();
  expect(screen.queryByText('78%')).not.toBeInTheDocument();
});

it('Family cannot simulate professional confirmation of a pending appointment', async () => {
  const now = new Date();
  mockApi(path => path === '/citas' ? response([{ ...appointment,
    estado_reserva: 'PENDIENTE', fecha_hora_inicio: now.toISOString(),
    fecha_hora_fin: new Date(now.getTime() + 3600000).toISOString(),
  }]) : undefined);
  renderRoute('/padre/agenda', 'PADRE');
  expect(await screen.findByText(/La confirmación corresponde al terapeuta asignado/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Simular confirmación/ })).not.toBeInTheDocument();
});

it('Keeps the original admin patient table and opens the real treatment selector', async () => {
  mockApi(); renderRoute('/admin/pacientes', 'ADMIN');
  expect(await screen.findByText('Paciente Aislado')).toBeInTheDocument();
  expect(screen.getByText('Perfiles Vinculados')).toBeInTheDocument();
  fireEvent.click(screen.getByTitle('Ver detalle operativo'));
  expect(await screen.findByText(/Lenguaje · Profesional Aislado · ACTIVO/)).toBeInTheDocument();
});

it('Keeps patient input and displays a server failure instead of fake success', async () => {
  const requests = mockApi((path, init) => path === '/pacientes/12' && init.method === 'PUT' ? response({ detail: 'Conflicto de prueba' }, 409) : undefined);
  renderRoute('/admin/pacientes', 'ADMIN'); await screen.findByText('Paciente Aislado');
  fireEvent.click(screen.getByTitle('Ver detalle operativo'));
  fireEvent.change(screen.getByDisplayValue('Paciente'), { target: { value: 'Nuevo nombre' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar paciente' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Conflicto de prueba');
  expect(screen.getByDisplayValue('Nuevo nombre')).toBeInTheDocument();
  expect(requests.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(1);
});

it('Books against an authorized treatment inside the existing agenda, with explicit Lima dates', async () => {
  const requests = mockApi((path, init) => path === '/citas' && init.method === 'POST' ? response(appointment, 201) : undefined);
  renderRoute('/padre/agenda', 'PADRE');
  fireEvent.click((await screen.findAllByRole('button', { name: /Solicitar cita/ }))[0]);
  await screen.findByRole('option', { name: 'Paciente Aislado' });
  fireEvent.change(screen.getByLabelText('Paciente'), { target: { value: '12' } });
  await screen.findByRole('option', { name: 'Lenguaje · Profesional Aislado' });
  fireEvent.change(screen.getByLabelText('Tratamiento y profesional'), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText('Fecha y hora de inicio'), { target: { value: '2027-01-01T10:00' } });
  fireEvent.change(screen.getByLabelText('Fecha y hora de fin'), { target: { value: '2027-01-01T11:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cita' }));
  await waitFor(() => expect(screen.queryByText('Nueva cita')).not.toBeInTheDocument());
  const call = requests.mock.calls.find(([, init]) => init?.method === 'POST');
  expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ id_tratamiento: 5, fecha_hora_inicio: '2027-01-01T10:00:00-05:00' });
});

it('Shows saved session report fields to the family without clinical mutation controls', async () => {
  mockApi(); renderRoute('/padre/reportes', 'PADRE');
  fireEvent.click(await screen.findByRole('button', { name: /Paciente Aislado/ }));
  expect(await screen.findByText('Observación guardada')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Guardar reporte' })).not.toBeInTheDocument();
});

it('Edits the four real report fields inside the administrator appointment detail', async () => {
  const requests = mockApi(); renderRoute('/admin/citas', 'ADMIN');
  fireEvent.click(await screen.findByRole('button', { name: 'Detalle' }));
  await screen.findByDisplayValue('Observación guardada');
  fireEvent.change(screen.getByLabelText('Objetivos trabajados'), { target: { value: 'Objetivo actualizado' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar reporte' }));
  await screen.findByText('Reporte guardado en el servidor.');
  const call = requests.mock.calls.find(([, init]) => init?.method === 'PUT');
  expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ objetivos_trabajados: 'Objetivo actualizado' });
});

it('Does not populate the users table with demo accounts on a network error', async () => {
  vi.mocked(fetch).mockRejectedValue(new TypeError('Offline'));
  renderRoute('/admin/usuarios', 'ADMIN');
  expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión');
  expect(screen.queryByText('Laura Gómez')).not.toBeInTheDocument();
});

describe('Domain service contracts', () => {
  const cases: [string, string, () => Promise<unknown>][] = [
    ['GET', '/usuarios', () => usersService.list()], ['GET', '/usuarios/1', () => usersService.get(1)],
    ['POST', '/usuarios', () => usersService.create({ nombres: 'A', apellidos: 'B', email: 'a@example.invalid', codigo_usuario: 'p90009', password: 'SyntheticOnly123!', rol: 'PADRE' })],
    ['PATCH', '/usuarios/1', () => usersService.edit(1, { activo: false })],
    ['GET', '/pacientes', () => patientsService.list()], ['GET', '/pacientes/12', () => patientsService.get(12)],
    ['POST', '/pacientes', () => patientsService.create(patient)], ['PUT', '/pacientes/12', () => patientsService.edit(12, patient)], ['DELETE', '/pacientes/12', () => patientsService.deactivate(12)],
    ['GET', '/pacientes/12/tratamientos', () => treatmentsService.list(12)], ['POST', '/tratamientos', () => treatmentsService.create({ id_paciente: 12, id_terapeuta: 4, nombre_tratamiento: 'Lenguaje' })],
    ['GET', '/citas', () => appointmentsService.list()], ['GET', '/citas/25', () => appointmentsService.get(25)], ['POST', '/citas', () => appointmentsService.create({ ...appointment, modalidad: 'PRESENCIAL' })],
    ['PUT', '/citas/25', () => appointmentsService.reschedule(25, { ...appointment, modalidad: 'PRESENCIAL' })], ['PATCH', '/citas/25/estado', () => appointmentsService.state(25, 'CONFIRMADA')],
    ['GET', '/sesiones', () => sessionsService.list()], ['GET', '/sesiones/9', () => sessionsService.get(9)], ['POST', '/sesiones', () => sessionsService.create(25)],
    ['POST', '/sesiones/9/iniciar', () => sessionsService.start(9)], ['POST', '/sesiones/9/cerrar', () => sessionsService.close(9, 'ASISTIO')],
    ['GET', '/sesiones/9/reporte', () => sessionsService.report(9)], ['PUT', '/sesiones/9/reporte', () => sessionsService.saveReport(9, report)],
  ];
  it.each(cases)('%s %s uses the centralized cookie client', async (method, path, call) => {
    const requests = mockApi(); await call();
    expect(requests).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`/api/v1${path}$`)), expect.objectContaining({ method, credentials: 'include' }));
  });
});

it('Reads pagination totals and serializes false/zero filters without dropping them', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response('[]', { headers: { 'Content-Type': 'application/json', 'X-Total-Count': '42' } }));
  expect(await usersService.list({ activo: false, offset: 0, q: 'dos palabras' })).toEqual({ items: [], total: 42 });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('activo=false&offset=0&q=dos+palabras'), expect.anything());
});

it('Discards a delayed result after the authenticated identity changes', async () => {
  let release!: (r: Response) => void;
  vi.mocked(fetch).mockImplementation(() => new Promise(resolve => { release = resolve; }));
  const result = apiClient.get('/pacientes');
  invalidateIdentityRequests(); release(response([patient]));
  await expect(result).rejects.toMatchObject({ name: 'AbortError' });
});

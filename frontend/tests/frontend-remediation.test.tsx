import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderRoute } from './helpers';
import { normalizePatientSex } from '@/types/patientSex';
import { capabilityNotice } from '@/app/routeCapabilities';

const appointment = { id_reserva: 45, id_paciente: 12, id_tratamiento: 5, id_terapeuta: 4,
  paciente_nombre: 'AUDITORIA Paciente', terapeuta_nombre: 'AUDITORIA Profesional',
  fecha_hora_inicio: '2026-01-01T10:00:00-05:00', fecha_hora_fin: '2026-01-01T11:00:00-05:00',
  modalidad: 'PRESENCIAL', localizacion: 'Consultorio', estado_reserva: 'COMPLETADA', id_sesion: 9 };
const session = { id_sesion: 9, id_reserva: 45, cita: appointment, reporte_disponible: true,
  estado_sesion: 'FINALIZADA', asistencia: 'ASISTIO', fecha_hora_inicio_real: null, fecha_hora_fin_real: null };
const report = { id_sesion: 9, id_reporte_sesion: 1, fecha_creacion: '2026-01-01',
  observaciones_iniciales: 'AUDITORIA guardada', objetivos_trabajados: 'Objetivo real', nivel_ayuda: 'Mínima', proximos_pasos: 'Continuar' };
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status,
  headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(Array.isArray(data) ? data.length : 1) } });
function mockApi(override?: (path: string, init: RequestInit) => Response | Promise<Response> | undefined) {
  return vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1', '');
    const custom = override?.(path, init); if (custom) return custom;
    if (path === '/sesiones') return response([session]);
    if (path === '/sesiones/9/reporte') return response(report);
    return response([]);
  });
}
describe('Reportes profesionales persistentes, sin rediseño', () => {
  it('consulta sesiones/reportes reales y mantiene tarjetas y plantillas', async () => {
    const calls = mockApi(); renderRoute('/terapeuta/reportes', 'TERAPEUTA');
    expect(await screen.findByDisplayValue('AUDITORIA guardada')).toBeInTheDocument();
    expect(screen.getByText('Plantillas descargables')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Firmar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    expect(screen.queryByText('Dra. Ana Ruiz')).not.toBeInTheDocument();
    expect(calls.mock.calls.some(([url]) => String(url).includes('/usuarios'))).toBe(false);
  });
  it('no inventa pacientes ni reportes al recibir una lista vacía', async () => {
    mockApi(path => path === '/sesiones' ? response([]) : undefined);
    renderRoute('/terapeuta/reportes', 'TERAPEUTA');
    expect(await screen.findByText(/No hay reportes guardados/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar reporte' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo reporte' }));
    expect(screen.getByRole('button', { name: 'Crear reporte' })).toBeDisabled();
  });
  it('crea solo para una sesión elegible y persiste los cuatro campos', async () => {
    let saved = false;
    const calls = mockApi((path, init) => {
      if (path === '/sesiones') return response([{ ...session, reporte_disponible: saved }]);
      if (path === '/sesiones/9/reporte' && init.method === 'PUT') { saved = true; return response(report); }
    });
    renderRoute('/terapeuta/reportes', 'TERAPEUTA');
    await screen.findByText(/No hay reportes guardados/);
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo reporte' }));
    fireEvent.change(screen.getByLabelText('Sesión', { exact: true }), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear reporte' }));
    fireEvent.change(await screen.findByLabelText('Observaciones iniciales'), { target: { value: 'AUDITORIA edición' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar reporte' }));
    expect(await screen.findByText('Reporte guardado en el servidor.')).toBeInTheDocument();
    const write = calls.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(JSON.parse(String(write?.[1]?.body))).toEqual({ observaciones_iniciales: 'AUDITORIA edición', objetivos_trabajados: '', nivel_ayuda: '', proximos_pasos: '' });
  });
  it('excluye sesiones programadas y con inasistencia del selector', async () => {
    mockApi(path => path === '/sesiones' ? response([{ ...session, reporte_disponible: false, asistencia: 'NO_ASISTIO' }, { ...session, id_sesion: 10, estado_sesion: 'PROGRAMADA', reporte_disponible: false }]) : undefined);
    renderRoute('/terapeuta/reportes', 'TERAPEUTA'); await screen.findByText(/No hay reportes guardados/);
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo reporte' }));
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
  it('conserva el borrador tras conflicto, sin mostrar guardado ficticio', async () => {
    mockApi((path, init) => path.endsWith('/reporte') && init.method === 'PUT' ? response({ detail: 'Transición inválida' }, 409) : undefined);
    renderRoute('/terapeuta/reportes', 'TERAPEUTA'); await screen.findByDisplayValue('AUDITORIA guardada');
    fireEvent.change(screen.getByLabelText('Observaciones iniciales'), { target: { value: 'Borrador conservado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar reporte' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Transición inválida');
    expect(screen.getByDisplayValue('Borrador conservado')).toBeInTheDocument();
    expect(screen.queryByText('Reporte guardado en el servidor.')).not.toBeInTheDocument();
  });
  it('bloquea doble envío mientras la escritura responde lentamente', async () => {
    let finish!: (value: Response) => void;
    const calls = mockApi((path, init) => path.endsWith('/reporte') && init.method === 'PUT' ? new Promise(resolve => { finish = resolve; }) : undefined);
    renderRoute('/terapeuta/reportes', 'TERAPEUTA'); await screen.findByDisplayValue('AUDITORIA guardada');
    const button = screen.getByRole('button', { name: 'Guardar reporte' });
    fireEvent.click(button); fireEvent.click(button);
    await waitFor(() => expect(calls.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Guardando reporte…' })).toBeDisabled();
    finish(response(report)); await screen.findByText('Reporte guardado en el servidor.');
  });
  it('muestra desconexión y reintento sin recurrir a mocks', async () => {
    mockApi(); const originalRead = vi.mocked(fetch).getMockImplementation()!;
    let failed = false;
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (!failed && new URL(String(input)).pathname.endsWith('/sesiones')) {
        failed = true; return Promise.reject(new TypeError('Failed to fetch'));
      }
      return originalRead(input, init);
    });
    renderRoute('/terapeuta/reportes', 'TERAPEUTA');
    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByDisplayValue('AUDITORIA guardada')).toBeInTheDocument();
  });
  it('la vista previa muestra campos guardados y no contiene controles de escritura', async () => {
    mockApi(); renderRoute('/terapeuta/reportes', 'TERAPEUTA'); await screen.findByDisplayValue('AUDITORIA guardada');
    fireEvent.click(screen.getByRole('button', { name: 'Vista previa' }));
    const dialog = screen.getByRole('dialog', { name: 'Vista previa del reporte' });
    expect(await within(dialog).findByText('AUDITORIA guardada')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Guardar reporte' })).not.toBeInTheDocument();
  });
  it('oculta controles clínicos cacheados al fallar la actualización y permite recuperarlos', async () => {
    let offline = false;
    mockApi(path => {
      if (path === '/citas/45') return response(appointment);
      if (path === '/sesiones/9') return offline ? Promise.reject(new TypeError('Failed to fetch')) : response(session);
    });
    renderRoute('/padre/reportes', 'PADRE');
    fireEvent.click(await screen.findByRole('button', { name: /AUDITORIA Paciente/ }));
    await screen.findByRole('button', { name: 'Descargar reporte PDF' });
    offline = true;
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión');
    expect(screen.queryByRole('button', { name: 'Descargar reporte PDF' })).not.toBeInTheDocument();
    offline = false;
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('button', { name: 'Descargar reporte PDF' })).toBeInTheDocument();
  });
});
describe('Coherencia de identidad, permisos y vocabulario', () => {
  it('administración consulta sesiones reales sin inventar telemetría', async () => {
    const calls = mockApi(); renderRoute('/admin/sesiones', 'ADMIN');
    expect(await screen.findByText('ID: 9')).toBeInTheDocument();
    expect(screen.getByText('AUDITORIA Paciente')).toBeInTheDocument();
    expect(screen.queryByText('SES-2026-0741')).not.toBeInTheDocument();
    expect(screen.queryByText('42 ms')).not.toBeInTheDocument();
    expect(calls.mock.calls.some(([url]) => String(url).includes('/sesiones'))).toBe(true);
  });
  it('los accesos clínicos administrativos son alcanzables desde Operación', async () => {
    mockApi(); renderRoute('/admin/operacion', 'ADMIN');
    fireEvent.click(await screen.findByRole('button', { name: 'Sesiones y reportes' }));
    expect(await screen.findByRole('heading', { name: 'Sesiones · ASHA Session' })).toBeInTheDocument();
  });
  it('un terapeuta sin asignaciones no recibe pacientes demostrativos', async () => {
    mockApi(); renderRoute('/terapeuta/pacientes', 'TERAPEUTA');
    expect(await screen.findByText(/Sin pacientes autorizados/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abrir expediente' })).not.toBeInTheDocument();
  });
  it('el expediente consulta sesiones por el identificador real, nunca por el índice', async () => {
    const calls = mockApi(path => path === '/pacientes' ? response([{ id_paciente: 12, nombres_paciente: 'AUDITORIA', apellidos_paciente: 'Paciente', fecha_nacimiento: '2020-01-01', activo: true }]) : undefined);
    renderRoute('/terapeuta/pacientes', 'TERAPEUTA');
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir expediente' }));
    expect(screen.getByText(/Consulta el reporte y el plan de cada atención/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Sesiones$/ }));
    expect(await screen.findByRole('button', { name: /Sesión #9/ })).toBeInTheDocument();
    expect(calls.mock.calls.some(([url]) => String(url).includes('paciente=12') && String(url).includes('contexto=true'))).toBe(true);
    expect(screen.queryByText('28 Jul 2026')).not.toBeInTheDocument();
  });
  it.each([['M', 'Masculino'], ['F', 'Femenino'], ['OTRO', 'Otro'], ['Otro', 'Otro'], ['Masculino', 'Masculino'], ['Femenino', 'Femenino'], ['desconocido', ''], ['', '']])('normaliza %s sin asignar un sexo distinto', (input, expected) => expect(normalizePatientSex(input)).toBe(expected));
  it('precarga Otro en el formulario administrativo y guarda el vocabulario familiar', async () => {
    const calls = mockApi((path, init) => {
      if (path === '/pacientes') return response([{ id_paciente: 12, id_tutor: 7, nombres_paciente: 'AUDITORIA', apellidos_paciente: 'Paciente', fecha_nacimiento: '2020-01-01', sexo: 'OTRO', activo: true }]);
      if (path === '/pacientes/12' && init.method === 'PUT') return response({});
    });
    renderRoute('/admin/pacientes', 'ADMIN');
    fireEvent.click(await screen.findByTitle('Ver detalle operativo'));
    expect(screen.getByLabelText('Sexo')).toHaveValue('Otro');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar paciente' }));
    await waitFor(() => expect(calls.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true));
    const call = calls.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(JSON.parse(String(call?.[1]?.body)).sexo).toBe('Otro');
  });
  it('consulta perfil profesional y no muestra identidad ficticia', async () => {
    mockApi(path => path === '/terapeutas/me' ? response({ user: { nombres: 'AUDITORIA', apellidos: 'Profesional', email: 'auditoria@example.invalid' }, perfil_terapeuta: { especialidad: 'Lenguaje', anios_experiencia: 3, descripcion_profesional: 'Perfil real' } }) : undefined);
    renderRoute('/terapeuta/config', 'TERAPEUTA');
    expect(await screen.findByDisplayValue('AUDITORIA Profesional')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lenguaje')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Dra. Ana Ruiz')).not.toBeInTheDocument();
  });
  it('ASHI saluda a la identidad conectada y etiqueta sus ejemplos', async () => {
    mockApi(); renderRoute('/terapeuta', 'TERAPEUTA');
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir asistente ASHI' }));
    expect(screen.getByText(/¡Hola, Usuario!/)).toBeInTheDocument();
    expect(screen.getByText(/Ejemplos ilustrativos/)).toBeInTheDocument();
  });
  it('cuentas reales no reciben el aviso genérico y configuración distingue sus límites', () => {
    expect(capabilityNotice('/admin/cuentas')).toBeNull();
    expect(capabilityNotice('/terapeuta/config')).toContain('La disponibilidad se guarda al publicar');
    expect(capabilityNotice('/terapeuta/config')).toContain('preferencias de notificaciones');
    expect(capabilityNotice('/mundo-asha/juegos')).toContain('prototipos');
  });
});

import { expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderRoute } from './helpers';

const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(Array.isArray(data) ? data.length : 1) } });
const day = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
const patient = (id: number, name: string) => ({ id_paciente:id,id_tutor:1,nombres_paciente:name,apellidos_paciente:'Demostración',fecha_nacimiento:'2020-01-01',sexo:'Otro',activo:true });
const appointment = (id = 1, patientId = 1, name = 'Ana Demostración') => ({ id_reserva:id,id_paciente:patientId,id_terapeuta:1,id_tratamiento:null,tipo_cita:'INTRODUCTORIA',paciente_nombre:name,terapeuta_nombre:'Profesional Demostración',fecha_hora_inicio:day()+'T10:00:00-05:00',fecha_hora_fin:day()+'T10:45:00-05:00',modalidad:'VIRTUAL',estado_reserva:'CONFIRMADA',id_sesion:null,puede_editar:true,zoom_join_url:null });
function mockApi(read: (path: string, init: RequestInit) => Response | undefined) {
  return vi.mocked(fetch).mockImplementation(async (input, init = {}) => read(new URL(String(input)).pathname.replace('/api/v1',''),init) ?? response([]));
}

it('separates siblings in the agenda and preserves completed appointment details', async () => {
  sessionStorage.clear();
  const a = {...appointment(), estado_reserva:'COMPLETADA', zoom_join_url:'https://zoom.us/j/123456789'};
  const b = appointment(2,2,'Luis Demostración');
  mockApi(path => path === '/pacientes' ? response([patient(1,'Ana'),patient(2,'Luis')]) : path === '/citas' ? response([a,b]) : path === '/citas/1' ? response(a) : path === '/citas/2' ? response(b) : undefined);
  renderRoute('/padre/agenda','PADRE');
  fireEvent.click(await screen.findByRole('button',{name:/Ana Demostración.*Completada/}));
  expect(await screen.findByText(/Consulta introductoria · COMPLETADA/)).toBeInTheDocument();
  expect(await screen.findByRole('link',{name:'Abrir enlace externo de Zoom'})).toHaveAttribute('href',a.zoom_join_url);
  expect(screen.queryByRole('button',{name:'Compartir enlace de Zoom'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Cancelar cita'})).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Hijo o hija'),{target:{value:'2'}});
  expect(await screen.findByRole('button',{name:/Luis Demostración.*Confirmada/})).toBeInTheDocument();
  expect(screen.queryByText(/Consulta introductoria · COMPLETADA/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/Ana Demostración.*Completada/})).not.toBeInTheDocument();
});

it('counts only future appointments and exposes running sessions separately', async () => {
  const future = {...appointment(),fecha_hora_inicio:new Date(Date.now()+60000).toISOString(),fecha_hora_fin:new Date(Date.now()+2700000).toISOString()};
  const past = {...appointment(2),fecha_hora_inicio:new Date(Date.now()-3600000).toISOString(),fecha_hora_fin:new Date(Date.now()-900000).toISOString()};
  mockApi(path => path === '/citas' ? response([future,past]) : path === '/sesiones' ? response([{id_sesion:1,estado_sesion:'EN_CURSO',asistencia:null,cita:past}]) : undefined);
  renderRoute('/terapeuta','TERAPEUTA');
  await screen.findByRole('button',{name:'Continuar atención'});
  expect(screen.getByText('Pacientes atendidos').parentElement).toHaveTextContent('0');
  expect(screen.getByText('Citas por comenzar hoy').parentElement).toHaveTextContent('1');
  expect(screen.getAllByRole('button',{name:'Ver en agenda'})).toHaveLength(1);
});

it('opens completed professional attention from the agenda without offering cancellation', async () => {
  const a = {...appointment(),estado_reserva:'COMPLETADA'};
  mockApi(path => path === '/citas' ? response([a]) : path === '/citas/1' ? response(a) : undefined);
  renderRoute('/terapeuta/agenda','TERAPEUTA');
  fireEvent.click(await screen.findByRole('button',{name:/Ana 10:00/}));
  const dialog = await screen.findByRole('dialog',{name:'Detalle de la atención'});
  expect(screen.queryByRole('button',{name:'Cancelar sesión'})).not.toBeInTheDocument();
  fireEvent.keyDown(dialog,{key:'Escape'});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('filters persisted attendance by Lima month without counting scheduled or absent sessions as attended', async () => {
  const year = new Date().getFullYear();
  const session = (id: number, month: number, state: string, attendance: string | null) => ({id_sesion:id,cita:{...appointment(),fecha_hora_inicio:`${year}-${String(month).padStart(2,'0')}-01T10:00:00-05:00`},estado_sesion:state,asistencia:attendance});
  mockApi(path => path === '/sesiones' ? response([session(1,1,'FINALIZADA','ASISTIO'),session(2,2,'FINALIZADA','ASISTIO'),session(3,2,'FINALIZADA','NO_ASISTIO'),session(4,2,'PROGRAMADA',null)]) : undefined);
  renderRoute('/terapeuta/analiticas','TERAPEUTA');
  await screen.findByText('Sesiones atendidas');
  expect(screen.getByText('Sesiones atendidas').parentElement).toHaveTextContent('2');
  expect(screen.getByText('Pacientes atendidos').parentElement).toHaveTextContent('1');
  fireEvent.change(screen.getByLabelText('Mes'),{target:{value:'2'}});
  expect(screen.getByText('Sesiones atendidas').parentElement).toHaveTextContent('1');
  expect(screen.getByText('Inasistencias').parentElement).toHaveTextContent('1');
});

it('keeps a meeting draft after server rejection and publishes only after real success', async () => {
  let saved: string | null = null;
  let fail = true;
  const a = appointment();
  const calls = mockApi((path, init) => {
    if(path === '/citas') return response([a]);
    if(path === '/citas/1') return response({...a,zoom_join_url:saved});
    if(path === '/citas/1/reunion' && init.method === 'PUT') {
      if(fail) return response({detail:'Conflicto sintético'},409);
      saved = JSON.parse(String(init.body)).zoom_join_url;
      return response({...a,zoom_join_url:saved});
    }
  });
  renderRoute('/admin/citas','ADMIN');
  fireEvent.click(await screen.findByRole('button',{name:'Detalle'}));
  fireEvent.click(await screen.findByRole('button',{name:'Compartir enlace de Zoom'}));
  const url = 'https://zoom.us/j/123456789';
  fireEvent.change(screen.getByLabelText('Enlace de Zoom'),{target:{value:url}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar enlace'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Conflicto sintético');
  expect(screen.getByDisplayValue(url)).toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Abrir enlace externo de Zoom'})).not.toBeInTheDocument();
  fail = false;
  fireEvent.click(screen.getByRole('button',{name:'Guardar enlace'}));
  expect(await screen.findByRole('link',{name:'Abrir enlace externo de Zoom'})).toHaveAttribute('href',url);
  await waitFor(() => expect(screen.queryByRole('button',{name:'Guardar enlace'})).not.toBeInTheDocument());
  expect(calls.mock.calls.filter(([,init]) => init?.method === 'PUT')).toHaveLength(2);
});

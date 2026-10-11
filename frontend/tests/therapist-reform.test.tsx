import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderRoute } from './helpers';

const appointment = { id_reserva: 1, id_paciente: 1, id_terapeuta: 2, id_tratamiento: 1, id_sesion: 3, paciente_nombre: 'Niño Sintético', terapeuta_nombre: 'Profesional Sintético', fecha_hora_inicio: '2020-01-06T13:00:00Z', fecha_hora_fin: '2020-01-06T13:45:00Z', estado_reserva: 'COMPLETADA', modalidad: 'PRESENCIAL', localizacion: null, fecha_creacion: '2020-01-01T00:00:00Z' };
const session = { id_sesion: 3, id_reserva: 1, cita: appointment, estado_sesion: 'FINALIZADA', asistencia: 'ASISTIO', reporte_disponible: false };
const savedReview = { id_valoracion: 8, id_sesion: 3, calificacion: 4, comentario: 'Gracias por la atención', fecha_creacion: '2026-10-11T15:00:00Z' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type':'application/json', 'X-Total-Count': Array.isArray(body) ? String(body.length) : '0'}});
function api(overrides?: (path:string, method:string, init:RequestInit) => Response | undefined) {
  return vi.mocked(fetch).mockImplementation(async (input, init={}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1','');
    const custom = overrides?.(path, init.method ?? 'GET', init); if (custom) return custom;
    if (path === '/pacientes') return response([{id_paciente:1,id_tutor:1,nombres_paciente:'Niño',apellidos_paciente:'Sintético',fecha_nacimiento:'2018-01-01',activo:true}]);
    if (path === '/citas') return response([appointment]);
    if (path === '/citas/1') return response(appointment);
    if (path === '/sesiones') return response([session]);
    if (path === '/sesiones/3') return response(session);
    if (path === '/sesiones/3/plan' || path === '/sesiones/3/valoracion') return response(null);
    if (path === '/terapeutas/me') return response({user:{nombres:'Profesional',apellidos:'Sintético',email:'test@example.invalid'},perfil_terapeuta:{id_terapeuta:2,especialidad:'Lenguaje',anios_experiencia:0}});
    if (path === '/terapeutas/2/disponibilidad') return response({turnos:[{dia:0,hora:8}],bloqueos:[],duracion_minutos:45});
    return response([]);
  });
}

it('therapist dashboard keeps refresh and removes redundant actions and note', async () => {
  api(); renderRoute('/terapeuta','TERAPEUTA');
  await screen.findByText('Pacientes atendidos');
  expect(screen.getByRole('button',{name:'Actualizar panel'})).toBeInTheDocument();
  expect(screen.queryByRole('navigation',{name:'Acciones del panel'})).not.toBeInTheDocument();
  expect(screen.queryByText(/Los conteos reflejan/)).not.toBeInTheDocument();
});

it('profile uses recorded values and removes fake edits, MFA and deletion', async () => {
  api(); renderRoute('/terapeuta/config','TERAPEUTA');
  expect(await screen.findByDisplayValue('Profesional Sintético')).toHaveAttribute('readonly');
  expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  expect(screen.getAllByText('Próximamente')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button',{name:'Seguridad'}));
  expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
  expect(screen.queryByText(/Autenticación en dos pasos|Zona de peligro/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Eliminar cuenta'})).not.toBeInTheDocument();
});

it('availability changes a whole day and preserves explicit publish semantics', async () => {
  let payload: { turnos: {dia:number;hora:number}[] } | undefined;
  api((path, method, init) => {if(path.endsWith('/disponibilidad') && method === 'PUT') {payload=JSON.parse(String(init.body));return response(payload);} });
  renderRoute('/terapeuta/config','TERAPEUTA');fireEvent.click(await screen.findByRole('button',{name:'Disponibilidad'}));
  await screen.findByRole('checkbox',{name:'Lunes 08:00'});
  fireEvent.click(screen.getAllByRole('button',{name:'Seleccionar día'})[0]);
  expect(screen.getByRole('checkbox',{name:'Lunes 17:00'})).toBeChecked();
  expect(screen.getByRole('checkbox',{name:'Domingo 08:00'})).not.toBeChecked();
  fireEvent.click(screen.getByRole('checkbox',{name:'Domingo 08:00'}));
  expect(payload).toBeUndefined();
  fireEvent.click(screen.getByRole('button',{name:'Publicar disponibilidad'}));
  await waitFor(() => expect(payload?.turnos.filter(t=>t.dia===0)).toHaveLength(10));
  expect(payload?.turnos.filter(t=>t.dia===6)).toEqual([{dia:6,hora:8}]);
});

it('review list only calculates metrics from recorded reviews', async () => {
  api(path => path === '/valoraciones' ? response([{...savedReview,autor_nombre:'Familia Sintética',fecha_sesion:appointment.fecha_hora_inicio}]) : undefined);
  renderRoute('/terapeuta/valoraciones','TERAPEUTA');
  await screen.findByText('Familia Sintética');
  expect(screen.getByText('1 valoración')).toBeInTheDocument();
  expect(screen.getByText('4.0')).toBeInTheDocument();
  expect(screen.queryByText(/Laura Gómez|98%|Puntualidad|Recomendarían/)).not.toBeInTheDocument();
});

it('review list has a real empty state and pending schema has a distinct state', async () => {
  api();const view=renderRoute('/terapeuta/valoraciones','TERAPEUTA');
  await screen.findByText('Todavía no tienes valoraciones');view.unmount();
  api(path=>path==='/valoraciones'?response({detail:'Valoraciones: próximamente.'},503):undefined);
  renderRoute('/terapeuta/valoraciones','TERAPEUTA');await screen.findByRole('heading',{name:'Próximamente'});
});

it('the family can rate an old attended appointment from its calendar and reload the opinion', async () => {
  let review: unknown = null;
  const calls = api((path,method,init) => {
    if (path === '/sesiones/3/valoracion') {
      if(method==='POST') {expect(JSON.parse(String(init.body))).toEqual({calificacion:4,comentario:'Gracias por la atención'});review=savedReview;}
      return response(review,method==='POST'?201:200);
    }
  });
  vi.useFakeTimers({toFake:['Date']});
  vi.setSystemTime(new Date('2020-01-06T18:00:00Z'));
  try {
  renderRoute('/padre/agenda','PADRE');
  const item = await screen.findByRole('button', { name: /6 Ene 2020.*Completada/ });
  fireEvent.click(item);
  await screen.findByRole('radio',{name:'4 estrellas'});
  fireEvent.click(screen.getByRole('radio',{name:'4 estrellas'}));
  fireEvent.change(screen.getByLabelText('Comentario (opcional)'),{target:{value:'Gracias por la atención'}});
  fireEvent.click(screen.getByRole('button',{name:'Enviar valoración'}));
  await screen.findByText('Calificaste esta sesión con 4 de 5 estrellas.');
  expect(calls.mock.calls.filter(([,init])=>init?.method==='POST')).toHaveLength(1);
  } finally { vi.useRealTimers(); }
});

it.each(['/terapeuta/datos-actividad','/session/rating','/mundo-asha/cuentos'])('%s hides invented content and yellow notices', async path => {
  api();renderRoute(path,path.startsWith('/terapeuta') ? 'TERAPEUTA' : 'PADRE');
  await screen.findByRole('heading',{name:'Próximamente'});
  expect(screen.queryByText(/Módulo de demostración|ASHA-A3F1/)).not.toBeInTheDocument();
});

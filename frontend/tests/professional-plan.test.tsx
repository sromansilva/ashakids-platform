import { it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderRoute } from './helpers';

const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(Array.isArray(data) ? data.length : 1) } });
const day = new Date(); day.setHours(8, 0, 0, 0);
const appointment = { id_reserva: 45, id_paciente: 12, id_terapeuta: 1, id_tratamiento: null, tipo_cita: 'INTRODUCTORIA', paciente_nombre: 'Ana Prueba', terapeuta_nombre: 'Profesional', fecha_hora_inicio: day.toISOString(), fecha_hora_fin: new Date(day.getTime()+45*60000).toISOString(), modalidad: 'PRESENCIAL', estado_reserva: 'CONFIRMADA', id_sesion: 9 };
const session = { id_sesion: 9, id_reserva: 45, cita: appointment, estado_sesion: 'EN_CURSO', asistencia: null, puede_editar: true, reporte_disponible: true };
const plan = { id_tratamiento: 1, id_sesion_origen: 9, nombre_tratamiento: 'Plan de Ana', area: 'LENGUAJE', mundos_asignados: ['LENGUAJE'], sesiones_recomendadas: 4, estado_tratamiento: 'ACTIVO', terapeuta_nombre: 'Profesional', fecha_inicio: '2026-10-01' };
async function open(options: { readonly?: boolean; published?: boolean; fail?: boolean } = {}) {
  let published = !!options.published;
  const calls = vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1','');
    if (path === '/citas') return reply([appointment]);
    if (path === '/citas/45') return reply(appointment);
    if (path === '/sesiones/9') return reply({ ...session, puede_editar: !options.readonly });
    if (path === '/sesiones/9/reporte') return reply({ objetivos_trabajados: 'Reporte guardado' });
    if (path === '/sesiones/9/plan') {
      if(init.method === 'POST') { if(options.fail) return reply({ detail: 'Conflicto del servidor' },409); published=true; return reply(plan,201); }
      return reply(published ? plan : null);
    }
    return reply([]);
  });
  renderRoute('/terapeuta/agenda','TERAPEUTA');
  fireEvent.click(await screen.findByText('Ana',{exact:true}));
  return calls;
}
it('publica desde una sesión real sin enviar autor ni paciente controlables por el formulario', async () => {
  const calls = await open();
  fireEvent.click(await screen.findByRole('button',{name:'Definir plan mensual'}));
  fireEvent.change(screen.getByLabelText('Nombre del plan'),{target:{value:'Plan de Ana'}});
  fireEvent.click(screen.getByRole('button',{name:'Publicar plan'}));
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  const write=calls.mock.calls.find(([,init])=>init?.method==='POST');
  expect(String(write?.[0])).toContain('/sesiones/9/plan');
  expect(JSON.parse(String(write?.[1]?.body))).toEqual({ nombre_tratamiento:'Plan de Ana', descripcion:'', area:'LENGUAJE', mundos_asignados:['LENGUAJE'], sesiones_recomendadas:4 });
});
it('conserva el borrador si el servidor rechaza la publicación', async () => {
  await open({fail:true});
  fireEvent.click(await screen.findByRole('button',{name:'Definir plan mensual'}));
  fireEvent.change(screen.getByLabelText('Nombre del plan'),{target:{value:'Borrador de Ana'}});
  fireEvent.click(screen.getByRole('button',{name:'Publicar plan'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Conflicto del servidor');
  expect(screen.getByLabelText('Nombre del plan')).toHaveValue('Borrador de Ana');
});
it('presenta plan y reporte ajenos en lectura según permiso de la API', async () => {
  await open({readonly:true,published:true});
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Guardar reporte'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Definir plan mensual'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Finalizar sesión'})).not.toBeInTheDocument();
});

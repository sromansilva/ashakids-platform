import { it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderRoute } from './helpers';

const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(Array.isArray(data) ? data.length : 1) } });
const day = new Date(); day.setHours(8, 0, 0, 0);
const appointment = { id_reserva: 45, id_paciente: 12, id_terapeuta: 1, id_tratamiento: null, tipo_cita: 'INTRODUCTORIA', paciente_nombre: 'Ana Prueba', terapeuta_nombre: 'Profesional', fecha_hora_inicio: day.toISOString(), fecha_hora_fin: new Date(day.getTime()+45*60000).toISOString(), modalidad: 'PRESENCIAL', estado_reserva: 'CONFIRMADA', id_sesion: 9 };
const session = { id_sesion: 9, id_reserva: 45, cita: appointment, estado_sesion: 'EN_CURSO', asistencia: null, puede_editar: true, reporte_disponible: true };
const plan = { id_tratamiento: 1, id_sesion_origen: 9, nombre_tratamiento: 'Plan de Ana', area: 'LENGUAJE', mundos_asignados: ['LENGUAJE'], sesiones_recomendadas: 4, estado_tratamiento: 'ACTIVO', terapeuta_nombre: 'Profesional', fecha_inicio: '2026-10-01' };
async function open(options: { readonly?: boolean; published?: boolean; fail?: boolean; sessionType?: 'INTRODUCTORIA' | 'TERAPIA'; savedResults?: unknown[] } = {}) {
  let published = !!options.published;
  const currentAppointment = { ...appointment, tipo_cita: options.sessionType ?? appointment.tipo_cita };
  const currentSession = { ...session, cita: currentAppointment };
  const calls = vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1','');
    if (path === '/citas') return reply([currentAppointment]);
    if (path === '/citas/45') return reply(currentAppointment);
    if (path === '/sesiones/9') return reply({ ...currentSession, puede_editar: !options.readonly });
    if (path === '/sesiones/9/reporte') return reply({ observaciones_iniciales: 'Línea base confirmada sintética', objetivos_trabajados: 'Objetivo trabajado en introductoria' });
    if (path === '/sesiones/9/seguimiento-articulacion') return reply(options.savedResults ?? []);
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
it('convierte el reporte guardado en contexto editable y exige completar objetivos del plan antes de publicar', async () => {
  const calls = await open();
  fireEvent.click(await screen.findByRole('button',{name:'Iniciar borrador desde línea base guardada'}));
  expect(screen.getByLabelText('Línea base confirmada (editable)')).toHaveValue('Línea base confirmada sintética');
  expect(screen.getByLabelText('Objetivos trabajados en la introductoria (editable)')).toHaveValue('Objetivo trabajado en introductoria');
  expect(screen.getByLabelText('Objetivos del plan *')).toHaveValue('');
  expect(screen.getByLabelText('Actividades propuestas *')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('Nombre del plan'),{target:{value:'Plan de Ana'}});
  fireEvent.change(screen.getByLabelText('Área principal definida por el terapeuta'),{target:{value:'HABLA'}});
  fireEvent.change(screen.getByLabelText('Objetivos del plan *'),{target:{value:'Practicar el objetivo confirmado según criterio profesional.'}});
  fireEvent.change(screen.getByLabelText('Actividades propuestas *'),{target:{value:'Actividad definida por el terapeuta.'}});
  fireEvent.change(screen.getByLabelText('Sesiones recomendadas por el terapeuta'),{target:{value:'4'}});
  fireEvent.click(screen.getByRole('checkbox',{name:'Comprensión y expresión'}));
  fireEvent.click(screen.getByRole('button',{name:'Aprobar y publicar plan'}));
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  const write=calls.mock.calls.find(([,init])=>init?.method==='POST');
  expect(String(write?.[0])).toContain('/sesiones/9/plan');
  expect(JSON.parse(String(write?.[1]?.body))).toEqual({
    nombre_tratamiento:'Plan de Ana',
    descripcion:'[LÍNEA BASE CONFIRMADA]\nLínea base confirmada sintética\n\n[OBJETIVOS TRABAJADOS EN INTRODUCTORIA]\nObjetivo trabajado en introductoria\n\n[OBJETIVOS DEL PLAN]\nPracticar el objetivo confirmado según criterio profesional.\n\n[ACTIVIDADES DEL PLAN]\nActividad definida por el terapeuta.',
    area:'HABLA', mundos_asignados:['LENGUAJE'], sesiones_recomendadas:4,
  });
});
it('conserva el borrador si el servidor rechaza la publicación', async () => {
  await open({fail:true});
  fireEvent.click(await screen.findByRole('button',{name:'Iniciar borrador desde línea base guardada'}));
  fireEvent.change(screen.getByLabelText('Nombre del plan'),{target:{value:'Borrador de Ana'}});
  fireEvent.change(screen.getByLabelText('Área principal definida por el terapeuta'),{target:{value:'HABLA'}});
  fireEvent.change(screen.getByLabelText('Objetivos del plan *'),{target:{value:'Objetivo editable de prueba'}});
  fireEvent.change(screen.getByLabelText('Actividades propuestas *'),{target:{value:'Actividad editable de prueba'}});
  fireEvent.change(screen.getByLabelText('Sesiones recomendadas por el terapeuta'),{target:{value:'3'}});
  fireEvent.click(screen.getByRole('checkbox',{name:'Comprensión y expresión'}));
  fireEvent.click(screen.getByRole('button',{name:'Aprobar y publicar plan'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Conflicto del servidor');
  expect(screen.getByLabelText('Nombre del plan')).toHaveValue('Borrador de Ana');
});
it('usa resultados previos guardados como contexto editable y deja objetivos y actividades en blanco', async () => {
  await open({
    sessionType: 'TERAPIA',
    savedResults: [{
      id_sesion: 8,
      tipo_cita: 'TERAPIA',
      fecha_hora_inicio: '2026-10-20T15:00:00.000Z',
      objetivos_trabajados: [
        '[Resultado de articulación: análisis clínico]',
        'Objetivo de articulación: objetivo guardado',
        'Palabra esperada: palabra sintética',
        'Transcripción tentativa del modelo: texto de referencia',
        'Resultado revisado por terapeuta: resultado confirmado',
        'Fuente confirmada por terapeuta: Pista local individual del participante · pista.m4a',
        'Fragmento: 01.00–03.00 s',
        '[/Resultado de articulación]',
      ].join('\n'),
    }],
  });
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar borrador con resultados previos guardados' }));
  const previousResults = screen.getByLabelText('Resultados previos revisados (contexto editable)') as HTMLTextAreaElement;
  expect(previousResults.value).toContain('Sesión #8');
  expect(previousResults.value).toContain('objetivo guardado');
  expect(previousResults.value).toContain('palabra sintética');
  expect(previousResults.value).toContain('resultado confirmado');
  expect(screen.getByLabelText('Objetivos del plan *')).toHaveValue('');
  expect(screen.getByLabelText('Actividades propuestas *')).toHaveValue('');
});
it('presenta plan y reporte ajenos en lectura según permiso de la API', async () => {
  await open({readonly:true,published:true});
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Guardar reporte'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Iniciar borrador desde línea base guardada'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Finalizar sesión'})).not.toBeInTheDocument();
});

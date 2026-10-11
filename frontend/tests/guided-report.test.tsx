import { expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderRoute } from './helpers';

const patientName = 'Leo Ejemplo';
const legacy = { observaciones_iniciales: 'Observación registrada', objetivos_trabajados: 'Objetivo registrado', nivel_ayuda: 'Apoyo personalizado anterior', proximos_pasos: 'Continuar lo acordado' };
function api(initial = legacy) {
  const session = { id_sesion: 9, id_reserva: 45, estado_sesion: 'FINALIZADA', asistencia: 'ASISTIO', reporte_disponible: true,
    cita: { id_reserva: 45, paciente_nombre: patientName, terapeuta_nombre: 'Profesional Ejemplo', fecha_hora_inicio: '2026-10-11T15:00:00Z' } };
  return vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname;
    const data = path.endsWith('/sesiones') ? [session] : path.endsWith('/sesiones/9/reporte') ? {
      ...initial, ...(init.method === 'PUT' ? JSON.parse(String(init.body)) : {}), id_sesion: 9, id_reporte_sesion: 1, fecha_creacion: '2026-10-11',
    } : [];
    return new Response(JSON.stringify(data), {headers:{'Content-Type':'application/json','X-Total-Count':String(Array.isArray(data)?data.length:1)}});
  });
}

it('inserts personalized templates on demand, blocks incomplete text and saves completed narratives with the selected help level', async () => {
  const calls = api({observaciones_iniciales:'',objetivos_trabajados:'',nivel_ayuda:'',proximos_pasos:''});
  renderRoute('/terapeuta/reportes','TERAPEUTA');
  const observations = await screen.findByLabelText('Observaciones iniciales');
  expect(observations).toHaveValue('');
  expect(observations).toHaveAttribute('placeholder',expect.stringContaining(patientName));
  expect(screen.getAllByRole('radio')).toHaveLength(5);
  expect(screen.getAllByRole('radio').every(input => !(input as HTMLInputElement).checked)).toBe(true);
  for (const name of ['observaciones iniciales','objetivos trabajados','próximos pasos']) {
    fireEvent.click(screen.getByRole('button',{name:`Usar plantilla de ${name}`}));
  }
  expect((observations as HTMLTextAreaElement).value).toContain(`se observó a ${patientName}`);
  expect(screen.queryByRole('button',{name:'Usar plantilla de observaciones iniciales'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Guardar reporte'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Completa la plantilla antes de guardar');
  expect(observations).toHaveAttribute('aria-invalid','true');
  expect(observations).toHaveFocus();
  expect(calls.mock.calls.some(([,init])=>init?.method==='PUT')).toBe(false);
  const completed = {
    observaciones_iniciales:`Durante la sesión, se observó a ${patientName} mediante una actividad de denominación. Se identificaron los siguientes hallazgos: respondió con apoyo visual.`,
    objetivos_trabajados:'En base a los hallazgos observados, se trabajó la denominación de animales.',
    proximos_pasos:'Se acordó practicar con imágenes y el mundo de lenguaje incluido en el plan.',
  };
  for(const [key,label] of [['observaciones_iniciales','Observaciones iniciales'],['objetivos_trabajados','Objetivos trabajados'],['proximos_pasos','Próximos pasos']] as const) {
    fireEvent.change(screen.getByLabelText(label),{target:{value:completed[key]}});
  }
  for(const name of ['Sin ayuda','Ayuda mínima','Ayuda moderada','Ayuda alta','Ayuda total']) {
    fireEvent.click(screen.getByRole('radio',{name}));
    expect(screen.getByRole('radio',{name})).toBeChecked();
    expect(screen.getAllByRole('radio').filter(input=>(input as HTMLInputElement).checked)).toHaveLength(1);
  }
  expect(screen.getByText('Necesita acompañamiento paso a paso durante toda la actividad.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Guardar reporte'}));
  await screen.findByText('Reporte guardado en el servidor.');
  const writes=calls.mock.calls.filter(([,init])=>init?.method==='PUT');
  expect(writes).toHaveLength(1);
  expect(JSON.parse(String(writes[0][1]?.body))).toEqual({...completed,nivel_ayuda:'Ayuda total'});
});

it('preserves historical free text and its help level until the professional selects a new intensity', async () => {
  const calls = api(); renderRoute('/terapeuta/reportes','TERAPEUTA');
  expect(await screen.findByDisplayValue(legacy.observaciones_iniciales)).toBeInTheDocument();
  expect(screen.getByText(`Nivel guardado: ${legacy.nivel_ayuda}. Puedes conservarlo o elegir una de las cinco opciones.`)).toBeInTheDocument();
  expect(screen.queryByRole('textbox',{name:'Nivel de ayuda'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/Usar plantilla/})).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Objetivos trabajados'),{target:{value:'Objetivo actualizado'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar reporte'}));
  await screen.findByText('Reporte guardado en el servidor.');
  const write=calls.mock.calls.find(([,init])=>init?.method==='PUT');
  expect(JSON.parse(String(write?.[1]?.body))).toEqual({...legacy,objetivos_trabajados:'Objetivo actualizado'});
  fireEvent.click(screen.getByRole('radio',{name:'Ayuda moderada'}));
  expect(screen.getByRole('radio',{name:'Ayuda moderada'})).toBeChecked();
  expect(screen.queryByText(/Nivel guardado:/)).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Cambios sin guardar.');
});

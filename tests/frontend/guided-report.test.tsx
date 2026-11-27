import { expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
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

it('autosaves partial clinical notes after 20 seconds of inactivity without saving prematurely', async () => {
  const calls = api({ observaciones_iniciales: '', objetivos_trabajados: '', nivel_ayuda: '', proximos_pasos: '' });
  renderRoute('/terapeuta/reportes', 'TERAPEUTA');
  const observations = await screen.findByLabelText('Observaciones iniciales');

  vi.useFakeTimers();
  try {
    fireEvent.change(observations, { target: { value: 'Nota clínica inicial.' } });
    expect(screen.getByRole('status')).toHaveTextContent('Se guardarán automáticamente tras 20 segundos sin edición.');

    // Después de 10 segundos no debe haberse guardado todavía
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(calls.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0);

    // Si el terapeuta escribe de nuevo, el temporizador de 20s se reinicia
    fireEvent.change(observations, { target: { value: 'Nota clínica durante la sesión.' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(calls.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0);

    // Tras completar los 20 segundos sin edición, guarda automáticamente
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_100);
    });
    const writes = calls.mock.calls.filter(([, init]) => init?.method === 'PUT');
    expect(writes).toHaveLength(1);
    expect(JSON.parse(String(writes[0][1]?.body))).toEqual({
      observaciones_iniciales: 'Nota clínica durante la sesión.',
      objetivos_trabajados: '',
      nivel_ayuda: '',
      proximos_pasos: '',
    });
  } finally {
    vi.useRealTimers();
  }
});

it('inserts personalized templates on demand, blocks incomplete text and saves completed narratives with inverted autosuficiencia stars', async () => {
  const calls = api({observaciones_iniciales:'',objetivos_trabajados:'',nivel_ayuda:'',proximos_pasos:''});
  renderRoute('/terapeuta/reportes','TERAPEUTA');
  const observations = await screen.findByLabelText('Observaciones iniciales');
  expect(observations).toHaveValue('');
  expect(observations).toHaveAttribute('placeholder',expect.stringContaining(patientName));
  expect(screen.getByText('Nivel de autosuficiencia')).toBeInTheDocument();
  const radios = screen.getAllByRole('radio');
  expect(radios).toHaveLength(5);
  expect(radios.every(input => !(input as HTMLInputElement).checked)).toBe(true);
  // 1 estrella = Ayuda total, 5 estrellas = Sin ayuda
  expect((radios[0] as HTMLInputElement).value).toBe('Ayuda total');
  expect((radios[4] as HTMLInputElement).value).toBe('Sin ayuda');

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
  for(const name of ['Ayuda total','Ayuda alta','Ayuda moderada','Ayuda mínima','Sin ayuda']) {
    fireEvent.click(screen.getByRole('radio',{name}));
    expect(screen.getByRole('radio',{name})).toBeChecked();
    expect(screen.getAllByRole('radio').filter(input=>(input as HTMLInputElement).checked)).toHaveLength(1);
  }
  expect(screen.getByText('Logró realizar la actividad por sí solo, sin necesitar ayuda.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Guardar reporte'}));
  await screen.findByText('Reporte guardado en el servidor.');
  const writes=calls.mock.calls.filter(([,init])=>init?.method==='PUT');
  expect(writes).toHaveLength(1);
  expect(JSON.parse(String(writes[0][1]?.body))).toEqual({...completed,nivel_ayuda:'Sin ayuda'});
});

it('preserves historical free text and its help level until the professional selects a new intensity', async () => {
  const calls = api(); renderRoute('/terapeuta/reportes','TERAPEUTA');
  expect(await screen.findByDisplayValue(legacy.observaciones_iniciales)).toBeInTheDocument();
  expect(screen.getByText(`Nivel guardado: ${legacy.nivel_ayuda}. Puedes conservarlo o elegir una de las cinco opciones.`)).toBeInTheDocument();
  expect(screen.queryByRole('textbox',{name:'Nivel de autosuficiencia'})).not.toBeInTheDocument();
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

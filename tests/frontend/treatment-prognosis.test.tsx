import { it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderRoute } from './helpers';

const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(Array.isArray(data) ? data.length : 1) } });
const day = new Date(); day.setHours(8, 0, 0, 0);
const appointment = { id_reserva: 45, id_paciente: 12, id_terapeuta: 1, id_tratamiento: null, tipo_cita: 'INTRODUCTORIA', paciente_nombre: 'Ana Prueba', terapeuta_nombre: 'Profesional', fecha_hora_inicio: day.toISOString(), fecha_hora_fin: new Date(day.getTime() + 45 * 60000).toISOString(), modalidad: 'PRESENCIAL', estado_reserva: 'CONFIRMADA', id_sesion: 9 };
const session = { id_sesion: 9, id_reserva: 45, cita: appointment, estado_sesion: 'EN_CURSO', asistencia: null, puede_editar: true, reporte_disponible: true };
const catalog = { etiqueta: 'Código diagnóstico preliminar asignado por el terapeuta', aviso: 'Clasificación preliminar.', codigos: [
  { code: 0, label: 'Dislalia funcional' }, { code: 1, label: 'Retraso simple del habla' },
  { code: 2, label: 'Trastorno del lenguaje (TEL)' }, { code: 3, label: 'Deglución atípica' }] };
const prediction = { id_prediccion: 77, estado_confirmacion: 'SUGERIDO', sesiones_estimadas: 14.2, rango_min: 12, rango_max: 16, riesgo_desercion: 'BAJO', probabilidad_desercion: 0.1, confianza: 0.88, diagnostico_descripcion: 'Trastorno del lenguaje (TEL)', advertencia_clinica: 'Estimación de apoyo; decide el terapeuta.', version_modelo: 'modelo-de-prueba' };

async function openPlan(model: boolean) {
  let published = false;
  const calls = vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1', '');
    if (path === '/citas') return reply([appointment]);
    if (path === '/citas/45') return reply(appointment);
    if (path === '/sesiones/9') return reply(session);
    if (path === '/sesiones/9/reporte') return reply({ observaciones_iniciales: 'Línea base sintética', objetivos_trabajados: 'Objetivo', nivel_ayuda: 'Ayuda alta' });
    if (path === '/sesiones/9/plan') {
      if (init.method === 'POST') { published = true; return reply({ id_tratamiento: 1, id_sesion_origen: 9, nombre_tratamiento: 'Plan de Ana', area: 'HABLA', mundos_asignados: ['HABLA', 'LENGUAJE'], sesiones_recomendadas: 14, estado_tratamiento: 'ACTIVO', terapeuta_nombre: 'Profesional', fecha_inicio: '2026-10-01' }, 201); }
      return reply(published ? { id_tratamiento: 1, id_sesion_origen: 9, nombre_tratamiento: 'Plan de Ana', area: 'HABLA', mundos_asignados: ['HABLA'], sesiones_recomendadas: 14, estado_tratamiento: 'ACTIVO', terapeuta_nombre: 'Profesional', fecha_inicio: '2026-10-01' } : null);
    }
    if (path === '/clinica/diagnosticos-preliminares') return reply(catalog);
    if (path === '/clinica/tratamientos/pronostico-estado') return reply({ disponible: model, version_modelo: model ? 'modelo-de-prueba' : null });
    if (path === '/clinica/evaluaciones-fonologicas/12') return reply([{ id_evaluacion: 1, id_sesion: 9, fonema_objetivo: '/r/', estado: 'CONFIRMADO_TERAPEUTA' }]);
    if (path === '/pacientes/12') return reply({ id_paciente: 12, nombres_paciente: 'Ana', apellidos_paciente: 'Prueba', fecha_nacimiento: '2020-01-01', activo: true });
    if (path === '/clinica/tratamientos/predecir-plan') return reply(prediction);
    return reply([]);
  });
  renderRoute('/terapeuta/agenda', 'TERAPEUTA');
  fireEvent.click(await screen.findByText('Ana', { exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar borrador desde línea base guardada' }));
  return calls;
}
const fill = () => {
  fireEvent.change(screen.getByLabelText('Nombre del plan'), { target: { value: 'Plan de Ana' } });
  fireEvent.change(screen.getByLabelText('Área principal definida por el terapeuta'), { target: { value: 'HABLA' } });
  fireEvent.change(screen.getByLabelText('Frecuencia semanal'), { target: { value: '2' } });
};
const goToPublish = (extra?: () => void) => {
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  fireEvent.change(screen.getByLabelText('Objetivos del plan *'), { target: { value: 'Objetivo del terapeuta' } });
  fireEvent.change(screen.getByLabelText('Actividades propuestas *'), { target: { value: 'Actividad del terapeuta' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  fireEvent.change(screen.getByLabelText('Recomendaciones'), { target: { value: 'Pautas para la familia' } });
  extra?.();
};
const postedPlan = (calls: ReturnType<typeof vi.mocked<typeof fetch>>) => {
  const write = calls.mock.calls.find(([input, init]) => init?.method === 'POST' && String(input).includes('/sesiones/9/plan'));
  return JSON.parse(String(write?.[1]?.body));
};

it('sin modelo aprobado ofrece el catalogo diagnostico, muestra el aviso discreto y no consulta el catalogo del predictor', async () => {
  const calls = await openPlan(false);
  expect(await screen.findByText('Pronóstico no disponible: aún no hay un modelo aprobado. Define las sesiones según tu criterio.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Solicitar pronóstico' })).not.toBeInTheDocument();
  expect(calls.mock.calls.some(([input]) => String(input).includes('predictor-catalog'))).toBe(false);
  const select = await screen.findByLabelText('Código diagnóstico preliminar asignado por el terapeuta');
  expect(await screen.findByRole('option', { name: 'Deglución atípica' })).toBeInTheDocument();
  fill();
  fireEvent.change(screen.getByLabelText('Sesiones recomendadas por el terapeuta'), { target: { value: '6' } });
  expect(await screen.findByRole('checkbox', { name: '/r/' })).toBeChecked(); // precargado desde la evaluación confirmada
  // Sin código diagnóstico el plan no avanza.
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('código diagnóstico preliminar');
  fireEvent.change(select, { target: { value: '0' } });
  goToPublish();
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar y publicar plan' }));
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  const body = postedPlan(calls);
  expect(body).toMatchObject({ codigo_diagnostico: 0, sesiones_recomendadas: 6, frecuencia_semanal: 2 });
  expect(body.id_prediccion).toBeUndefined();
});

it('con modelo aprobado muestra sesiones, rango, riesgo y confianza, y una sugerencia se acepta con un clic', async () => {
  const calls = await openPlan(true);
  fill();
  expect(await screen.findByRole('checkbox', { name: '/r/' })).toBeChecked(); // precargado desde la evaluación confirmada
  await screen.findByRole('option', { name: 'Trastorno del lenguaje (TEL)' });
  fireEvent.change(screen.getByLabelText('Código diagnóstico preliminar asignado por el terapeuta'), { target: { value: '2' } });
  const request = await screen.findByRole('button', { name: 'Solicitar pronóstico' });
  await waitFor(() => expect(request).toBeEnabled());
  fireEvent.click(request);
  expect(await screen.findByText(/Sesiones estimadas: 14 \(rango 12–16\)/)).toBeInTheDocument();
  expect(screen.getByText(/Riesgo de abandono estimado: BAJO/)).toBeInTheDocument();
  expect(screen.getByText(/Confianza del clasificador de riesgo: 88%/)).toBeInTheDocument();
  expect(screen.getByText('Estimación de apoyo; decide el terapeuta.')).toBeInTheDocument();
  const predictionCall = calls.mock.calls.find(([input]) => String(input).includes('/predecir-plan'));
  expect(JSON.parse(String(predictionCall?.[1]?.body))).toEqual({ id_sesion: 9, codigo_diagnostico: 2, frecuencia_semanal: 2 });

  fireEvent.click(screen.getByRole('button', { name: 'Aceptar sugerencia' }));
  expect(screen.getByLabelText('Sesiones recomendadas por el terapeuta')).toHaveValue(14);
  goToPublish();
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar y publicar plan' }));
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  expect(postedPlan(calls)).toMatchObject({
    codigo_diagnostico: 2, sesiones_recomendadas: 14, id_prediccion: 77, decision_prediccion: 'CONFIRMADO_CLINICO',
  });
});

it('tras aceptar la sugerencia, un ajuste manual exige el motivo y se registra como modificado', async () => {
  const calls = await openPlan(true);
  fill();
  expect(await screen.findByRole('checkbox', { name: '/r/' })).toBeChecked(); // precargado desde la evaluación confirmada
  await screen.findByRole('option', { name: 'Retraso simple del habla' });
  fireEvent.change(screen.getByLabelText('Código diagnóstico preliminar asignado por el terapeuta'), { target: { value: '1' } });
  const request = await screen.findByRole('button', { name: 'Solicitar pronóstico' });
  await waitFor(() => expect(request).toBeEnabled());
  fireEvent.click(request);
  fireEvent.click(await screen.findByRole('button', { name: 'Aceptar sugerencia' }));
  fireEvent.change(screen.getByLabelText('Sesiones recomendadas por el terapeuta'), { target: { value: '18' } });
  goToPublish();
  expect(screen.getByRole('button', { name: 'Aprobar y publicar plan' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/Motivo del ajuste manual de la sugerencia/), { target: { value: 'Bilingüismo' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar y publicar plan' }));
  expect(await screen.findByText('Plan de Ana · ACTIVO')).toBeInTheDocument();
  expect(postedPlan(calls)).toMatchObject({
    sesiones_recomendadas: 18, id_prediccion: 77, decision_prediccion: 'MODIFICADO_MANUAL', observaciones_prediccion: 'Bilingüismo',
  });
});

it('el expediente muestra «Sesión X de N», el estado del plan y cierra el tratamiento con confirmación', async () => {
  let closed = false;
  const treatment = (state: string) => ({ id_tratamiento: 5, id_expediente: 1, id_paciente: 12, id_terapeuta: 1, id_sesion_origen: 9, nombre_tratamiento: 'Plan de Ana', area: 'HABLA', mundos_asignados: ['HABLA'], sesiones_recomendadas: 12, sesiones_realizadas: 3, estado_tratamiento: state, paciente_nombre: 'Ana Prueba', terapeuta_nombre: 'Profesional', fecha_inicio: '2026-10-01', fecha_fin: null });
  const calls = vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const url = new URL(String(input));
    const path = url.pathname.replace('/api/v1', '');
    if (path === '/pacientes') return reply([{ id_paciente: 12, nombres_paciente: 'Ana', apellidos_paciente: 'Prueba', fecha_nacimiento: '2020-01-01', activo: true }]);
    if (path === '/pacientes/12/tratamientos') return reply([treatment(closed ? 'ALTA' : 'ACTIVO')]);
    if (path === '/clinica/tratamientos/5/desenlace' && init.method === 'PATCH') { closed = true; return reply({ id_tratamiento: 5, estado_tratamiento: 'ALTA', fecha_fin: '2026-11-05', observaciones_cierre: null, citas_futuras_pendientes: 2 }); }
    return reply([]);
  });
  renderRoute('/terapeuta/pacientes', 'TERAPEUTA');
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir expediente' }));
  expect(await screen.findByText('Sesión 3 de 12')).toBeInTheDocument();
  expect(screen.getByText('Plan activo')).toBeInTheDocument();
  expect(screen.queryByText('Próximamente')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cerrar tratamiento' }));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent('Esta acción no se puede deshacer');
  expect(calls.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false); // nada se envía antes de confirmar
  fireEvent.click(screen.getByLabelText('Abandono'));
  fireEvent.change(screen.getByLabelText('Observación (opcional)'), { target: { value: 'La familia se mudó' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));
  expect(await screen.findByText(/Quedan 2 cita\(s\) futura\(s\)/)).toBeInTheDocument();
  const patch = calls.mock.calls.find(([, init]) => init?.method === 'PATCH');
  expect(JSON.parse(String(patch?.[1]?.body))).toEqual({ desenlace: 'ABANDONO', observacion: 'La familia se mudó' });
  fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
  expect(await screen.findByText('Alta terapéutica')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cerrar tratamiento' })).not.toBeInTheDocument();
});

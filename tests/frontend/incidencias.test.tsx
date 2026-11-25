import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';
import { AdminOperacion } from '@/modules/admin/presentation/AdminOperacion';
import { incidenciasService } from '@/modules/comunicacion/infrastructure/incidenciasService';
import { capabilityNotice } from '@/core/router/routeCapabilities';
import { IncidentsTable } from '@/shared/presentation/components/common/IncidentsTable';

vi.mock('@/modules/comunicacion/infrastructure/incidenciasService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/modules/comunicacion/infrastructure/incidenciasService')>();
  return {
    ...actual,
    incidenciasService: {
    crear: vi.fn(),
    listar: vi.fn(),
    estado: vi.fn(),
    notas: vi.fn(),
    terapeutasRelacionados: vi.fn(),
    },
  };
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(incidenciasService.notas).mockResolvedValue({ items: [] });
  vi.mocked(incidenciasService.terapeutasRelacionados).mockResolvedValue({
    previos: [],
    disponibles: [
      { id_terapeuta: 12, nombre: 'Dr. Roberto Mendoza', especialidad: 'Fluidez y Habla' },
    ],
  });
});

it('conserva borrador y UUID si falla; confirma solo el envío real', async () => {
  vi.mocked(incidenciasService.crear).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce({id_incidencia: 7} as never);
  render(<IncidentForm />);
  const labels = Array.from(document.querySelectorAll('label')).map(el => el.textContent);
  expect(labels).toContain('Tipo general de incidencia');
  fireEvent.change(screen.getByLabelText('Tipo general de incidencia'), {target: {value:'Problemas técnicos'}});
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), {target: {value:'Funcional'}});
  fireEvent.change(screen.getByLabelText('Título'), {target: {value:'Guardar falla'}});
  fireEvent.change(screen.getByLabelText('Descripción breve'), {target: {value:'No termina de guardar.'}});
  fireEvent.click(screen.getByRole('button', {name:'Enviar solicitud'}));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Título')).toHaveValue('Guardar falla');
  expect(screen.queryByText(/Reporte #/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Enviar solicitud'}));
  await screen.findByText('Reporte #7 enviado');
  const calls = vi.mocked(incidenciasService.crear).mock.calls;
  expect(calls[0][0].envio_id).toBe(calls[1][0].envio_id);
});

it('solo muestra registros del servidor y conserva estado ante fallo', async () => {
  vi.mocked(incidenciasService.listar).mockResolvedValue({total:1, items:[{
    id_incidencia:2, usuario:'Usuario de prueba', rol:'PADRE', tipo:'Otro', titulo:'Problema reportado', descripcion:'Descripción real del reporte', estado:'RECIBIDA', fecha_creacion:'2026-10-10T12:00:00Z',
  }]});
  vi.mocked(incidenciasService.estado).mockRejectedValue(new Error('No guardado'));
  render(<AdminOperacion go={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', {name:/Problema reportado/}));
  expect(screen.getByText('Descripción real del reporte')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Marcar como resuelta'}));
  await screen.findByText('No guardado');
  expect(screen.getAllByText('RECIBIDA').length).toBeGreaterThan(0);
  expect(screen.queryByText('Sesiones activas')).not.toBeInTheDocument();
  await waitFor(() => expect(incidenciasService.estado).toHaveBeenCalledWith(2,'RESUELTA'));
});

it('no presenta auditoría ni incidencias reales como demostración', () => {
  for (const path of ['/admin/auditoria','/admin/operacion','/admin/config','/padre/incidencias','/terapeuta/incidencias']) expect(capabilityNotice(path)).toBeNull();
});

it('la tabla compartida usa solo los tres estados y permite poner una incidencia en atención', async () => {
  vi.mocked(incidenciasService.notas).mockResolvedValue({ items: [] });
  const update = vi.fn().mockResolvedValue(undefined);
  render(<IncidentsTable items={[{ id_incidencia: 32, tipo: 'Funcional', titulo: 'Problema técnico', descripcion: 'Descripción técnica', estado: 'RECIBIDA', fecha_creacion: '2026-11-05T12:00:00Z' }]} loading={false} onRefresh={vi.fn()} canUpdateStatus onStatusChange={update} />);
  for (const estado of ['RECIBIDA', 'EN ATENCIÓN', 'RESUELTA']) expect(screen.getByRole('button', { name: estado, exact: true })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Leída|Solucionada|En Proceso/i })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Descripción técnica'));
  fireEvent.click(screen.getAllByRole('button', { name: 'EN ATENCIÓN', exact: true }).at(-1)!);
  await waitFor(() => expect(update).toHaveBeenCalledWith(32, 'EN ATENCIÓN'));
});

it('muestra categorías y variedades, y evita el autoenrutamiento', async () => {
  vi.mocked(incidenciasService.terapeutasRelacionados).mockResolvedValue({
    previos: [{ id_terapeuta: 12, nombre: 'Terapeuta relacionado', especialidad: 'Lenguaje' }],
    disponibles: [],
  });
  const { rerender } = render(<IncidentForm role="PADRE" />);
  const category = screen.getByLabelText('Tipo general de incidencia');
  fireEvent.change(category, { target: { value: 'Problemas técnicos' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Funcional' } });
  expect(screen.getByLabelText('Área de destino')).toHaveValue('Soporte Técnico');
  fireEvent.change(category, { target: { value: 'Problemas de permisos' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Cuentas y Permisos' } });
  expect(screen.getByLabelText('Área de destino')).toHaveValue('Administración');
  fireEvent.change(category, { target: { value: 'Problemas de información' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Paciente / Agenda' } });
  await waitFor(() => expect(screen.getByLabelText('Área de destino')).toHaveValue('Terapeuta relacionado'));

  rerender(<IncidentForm role="TERAPEUTA" />);
  expect(Array.from((screen.getByLabelText('Tipo general de incidencia') as HTMLSelectElement).options).map((option) => option.value)).toEqual(['', 'Problemas técnicos', 'Problemas de permisos']);
  fireEvent.change(screen.getByLabelText('Tipo general de incidencia'), { target: { value: 'Problemas técnicos' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Funcional' } });
  expect(screen.getByLabelText('Área de destino')).toHaveValue('Soporte Técnico');

  rerender(<IncidentForm role="ADMIN" />);
  expect(Array.from((screen.getByLabelText('Tipo general de incidencia') as HTMLSelectElement).options).map((option) => option.value)).toEqual(['', 'Problemas técnicos']);
  fireEvent.change(screen.getByLabelText('Tipo general de incidencia'), { target: { value: 'Problemas técnicos' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Funcional' } });
  expect(screen.getByLabelText('Área de destino')).toHaveValue('Soporte Técnico');
});

it('filtra y aclara las variedades de información según el rol', () => {
  const parent = render(<IncidentForm role="PADRE" />);
  fireEvent.change(screen.getByLabelText('Tipo general de incidencia'), { target: { value: 'Problemas de información' } });
  expect(screen.getByRole('option', { name: 'Mi perfil familiar' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Datos de mis hijos' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Juegos y actividad de Mundo ASHA' })).toBeInTheDocument();
  parent.unmount();

  const therapist = render(<IncidentForm role="TERAPEUTA" />);
  expect(screen.queryByRole('option', { name: 'Problemas de información' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Tipo general de incidencia'), { target: { value: 'Problemas de permisos' } });
  expect(screen.getByRole('option', { name: 'No puedo abrir un paciente que tengo asignado' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'No tengo permiso para consultar mi agenda o sesiones' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'No puedo crear o consultar reportes clínicos' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'No puedo usar una herramienta de mi módulo' })).toBeInTheDocument();
  therapist.unmount();

  render(<IncidentForm role="ADMIN" />);
  expect(screen.queryByRole('option', { name: 'Problemas de permisos' })).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Problemas de información' })).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Seguimiento Terapéutico' })).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Mundo ASHA' })).not.toBeInTheDocument();
});

it('permite a soporte solo escalar solicitudes de permisos a Administración', async () => {
  vi.mocked(incidenciasService.terapeutasRelacionados).mockResolvedValue({ previos: [], disponibles: [] });
  render(<IncidentForm role="SOPORTE_TECNICO" />);
  const category = screen.getByLabelText('Tipo general de incidencia');
  expect(Array.from((category as HTMLSelectElement).options).map((option) => option.value)).toEqual(['', 'Problemas de permisos']);
  fireEvent.change(category, { target: { value: 'Problemas de permisos' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Cuentas y Permisos' } });
  expect(screen.getByLabelText('Área de destino')).toHaveValue('Administración');
});

it('envía solo la categoría y la descripción; el servidor determina el destinatario', async () => {
  vi.mocked(incidenciasService.crear).mockResolvedValue({ id_incidencia: 88, ticket: 'INC-00088' } as never);
  render(<IncidentForm role="TERAPEUTA" />);
  fireEvent.change(screen.getByLabelText('Tipo general de incidencia'), { target: { value: 'Problemas técnicos' } });
  fireEvent.change(screen.getByLabelText('Variedad de incidencia'), { target: { value: 'Funcional' } });
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'El botón no responde' } });
  fireEvent.change(screen.getByLabelText('Descripción breve'), { target: { value: 'No puedo guardar.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
  await waitFor(() => expect(incidenciasService.crear).toHaveBeenCalled());
  expect(incidenciasService.crear).toHaveBeenCalledWith(expect.objectContaining({
    tipo: 'Funcional', titulo: 'El botón no responde', descripcion: 'No puedo guardar.',
  }));
  const request = vi.mocked(incidenciasService.crear).mock.calls[0][0];
  expect(request).not.toHaveProperty('area_destino');
  expect(request).not.toHaveProperty('id_terapeuta');
});

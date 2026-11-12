import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';
import { AdminOperacion } from '@/modules/admin/presentation/AdminOperacion';
import { incidenciasService } from '@/modules/comunicacion/infrastructure/incidenciasService';
import { capabilityNotice } from '@/core/router/routeCapabilities';
import { IncidentsTable } from '@/shared/presentation/components/common/IncidentsTable';

vi.mock('@/modules/comunicacion/infrastructure/incidenciasService', () => ({
  tiposIncidencia: ['Funcional', 'Cuentas y Permisos', 'Seguimiento Terapéutico', 'Otro'],
  incidenciasService: {
    crear: vi.fn(),
    listar: vi.fn(),
    estado: vi.fn(),
    notas: vi.fn(),
    terapeutasRelacionados: vi.fn(),
  },
}));
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
  expect(labels).toEqual(['Tipo de incidencia','Título','Descripción breve']);
  fireEvent.change(screen.getByLabelText('Tipo de incidencia'), {target: {value:'Funcional'}});
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

it('muestra cuadro no editable para incidencias dirigidas a administración y soporte técnico', async () => {
  render(<IncidentForm />);
  
  // Seleccionar Funcional -> Soporte Técnico no editable
  fireEvent.change(screen.getByLabelText('Tipo de incidencia'), { target: { value: 'Funcional' } });
  const areaInputTech = screen.getByLabelText('Área de destino') as HTMLInputElement;
  expect(areaInputTech).toBeDisabled();
  expect(areaInputTech.value).toBe('Soporte Técnico');
  expect(screen.getByText(/esta incidencia será atendida por Soporte Técnico/i)).toBeInTheDocument();

  // Seleccionar Cuentas y Permisos -> Administración no editable
  fireEvent.change(screen.getByLabelText('Tipo de incidencia'), { target: { value: 'Cuentas y Permisos' } });
  const areaInputAdmin = screen.getByLabelText('Área de destino') as HTMLInputElement;
  expect(areaInputAdmin).toBeDisabled();
  expect(areaInputAdmin.value).toBe('Administración');
  expect(screen.getByText(/esta incidencia será atendida por Administración/i)).toBeInTheDocument();
});

it('para tipo Otro permite editar el área y seleccionar un terapeuta registrado al elegir Terapeuta', async () => {
  vi.mocked(incidenciasService.crear).mockResolvedValue({ id_incidencia: 88, ticket: 'INC-00088' } as never);
  render(<IncidentForm />);

  fireEvent.change(screen.getByLabelText('Tipo de incidencia'), { target: { value: 'Otro' } });
  
  // El cuadro de área ahora es un select editable
  const areaSelect = screen.getByLabelText('Área de destino') as HTMLSelectElement;
  expect(areaSelect.tagName).toBe('SELECT');
  expect(areaSelect).not.toBeDisabled();

  // Cambiar a Soporte Técnico -> No hay selector de terapeuta
  fireEvent.change(areaSelect, { target: { value: 'SOPORTE_TECNICO' } });
  expect(screen.queryByLabelText(/Terapeuta asignado/i)).not.toBeInTheDocument();

  // Cambiar a Terapeuta -> Aparece el selector de terapeutas registrados
  fireEvent.change(areaSelect, { target: { value: 'TERAPEUTA' } });
  await waitFor(() => expect(screen.getByLabelText(/Terapeuta asignado/i)).toBeInTheDocument());

  // Llenar campos requeridos y enviar
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Consulta especial sobre sesión' } });
  fireEvent.change(screen.getByLabelText('Descripción breve'), { target: { value: 'Deseo consultar sobre el progreso.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

  await waitFor(() => {
    expect(incidenciasService.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'Otro',
        area_destino: 'TERAPEUTA',
        id_terapeuta: 12,
        titulo: 'Consulta especial sobre sesión',
        descripcion: 'Deseo consultar sobre el progreso.',
      })
    );
  });
});

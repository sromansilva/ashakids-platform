import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { IncidentForm } from '@/components/common/IncidentForm';
import { AdminOperacion } from '@/pages/admin/AdminOperacion';
import { incidenciasService } from '@/services/incidenciasService';
import { capabilityNotice } from '@/app/routeCapabilities';

vi.mock('@/services/incidenciasService', () => ({
  tiposIncidencia: ['Funcional','Otro'],
  incidenciasService: { crear: vi.fn(), listar: vi.fn(), estado: vi.fn() },
}));
beforeEach(() => vi.resetAllMocks());

it('conserva borrador y UUID si falla; confirma solo el envío real', async () => {
  vi.mocked(incidenciasService.crear).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce({id_incidencia: 7} as never);
  render(<IncidentForm />);
  const labels = Array.from(document.querySelectorAll('label')).map(el => el.textContent);
  expect(labels).toEqual(['Tipo de incidencia','Título','Descripción breve']);
  fireEvent.change(screen.getByLabelText('Tipo de incidencia'), {target: {value:'Funcional'}});
  fireEvent.change(screen.getByLabelText('Título'), {target: {value:'Guardar falla'}});
  fireEvent.change(screen.getByLabelText('Descripción breve'), {target: {value:'No termina de guardar.'}});
  fireEvent.click(screen.getByRole('button', {name:'Enviar a administración'}));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Título')).toHaveValue('Guardar falla');
  expect(screen.queryByText(/Reporte #/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Enviar a administración'}));
  await screen.findByText('Reporte #7 enviado');
  const calls = vi.mocked(incidenciasService.crear).mock.calls;
  expect(calls[0][0].envio_id).toBe(calls[1][0].envio_id);
});

it('solo muestra registros del servidor y conserva estado ante fallo', async () => {
  vi.mocked(incidenciasService.listar).mockResolvedValue({total:1, items:[{
    id_incidencia:2, usuario:'Usuario de prueba', rol:'PADRE', tipo:'Otro', titulo:'Problema reportado', descripcion:'Descripción real del reporte', estado:'NUEVA', fecha_creacion:'2026-10-10T12:00:00Z',
  }]});
  vi.mocked(incidenciasService.estado).mockRejectedValue(new Error('No guardado'));
  render(<AdminOperacion go={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', {name:/Problema reportado/}));
  expect(screen.getByText('Descripción real del reporte')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Marcar como resuelta'}));
  await screen.findByText('No guardado');
  expect(screen.getByText('Nueva')).toBeInTheDocument();
  expect(screen.queryByText('Sesiones activas')).not.toBeInTheDocument();
  await waitFor(() => expect(incidenciasService.estado).toHaveBeenCalledWith(2,'RESUELTA'));
});

it('no presenta auditoría ni incidencias reales como demostración', () => {
  for (const path of ['/admin/auditoria','/admin/operacion','/admin/config','/padre/incidencias','/terapeuta/incidencias']) expect(capabilityNotice(path)).toBeNull();
});

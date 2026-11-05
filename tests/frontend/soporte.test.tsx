import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SoporteIncidencias } from '@/modules/soporte/presentation/SoporteIncidencias';
import { SoporteDetalle } from '@/modules/soporte/presentation/SoporteDetalle';
import { soporteService } from '@/modules/soporte/infrastructure/soporteService';

vi.mock('@/modules/soporte/infrastructure/soporteService', () => ({ soporteService: {
  listar: vi.fn(), obtener: vi.fn(), crear: vi.fn(), estado: vi.fn(), notas: vi.fn(), responder: vi.fn(),
} }));
const ticket = { id_incidencia: 7, ticket: 'INC-00007', tipo: 'Funcional', descripcion: 'No carga la pantalla.', rol_solicitante: 'PADRE', prioridad: 2, estado: 'RECIBIDA', fecha_creacion: '2026-11-05T12:00:00Z', fecha_actualizacion: '2026-11-05T12:00:00Z' };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(soporteService.listar).mockResolvedValue({ items: [ticket], total: 1 });
  vi.mocked(soporteService.obtener).mockResolvedValue(ticket);
  vi.mocked(soporteService.notas).mockResolvedValue({ items: [] });
});

it('lists technical incidents with server filters and supports creating one with the shared form', async () => {
  vi.mocked(soporteService.crear).mockResolvedValue({ ...ticket, titulo: ticket.tipo });
  render(<MemoryRouter initialEntries={['/soporte']}><Routes><Route path="/soporte" element={<SoporteIncidencias />} /><Route path="/soporte/incidencias/:id" element={<p>Detalle creado</p>} /></Routes></MemoryRouter>);
  expect(await screen.findByText('INC-00007')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'EN ATENCIÓN' } });
  fireEvent.change(screen.getByLabelText('Prioridad'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'pantalla' } });
  await waitFor(() => expect(soporteService.listar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'EN ATENCIÓN', prioridad: 3, search: 'pantalla', offset: 0 }), expect.any(AbortSignal)));
  fireEvent.click(screen.getByRole('button', { name: 'Nueva incidencia' }));
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Pantalla de ayuda' } });
  fireEvent.change(screen.getByLabelText('Descripción breve'), { target: { value: 'Error al abrir la ayuda.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar incidencia' }));
  expect(await screen.findByText('Detalle creado')).toBeInTheDocument();
  expect(soporteService.crear).toHaveBeenCalledWith(expect.objectContaining({ descripcion: 'Error al abrir la ayuda.' }));
});

it('shows detail, saves replies and internal notes, and resolves the ticket', async () => {
  vi.mocked(soporteService.estado).mockResolvedValue({ ...ticket, estado: 'RESUELTA' });
  vi.mocked(soporteService.responder).mockImplementation(async (_id, contenido, interna) => ({ id_nota: interna ? 2 : 1, contenido, interna, fecha_creacion: ticket.fecha_creacion, autor: 'Soporte Técnico' }));
  render(<MemoryRouter initialEntries={['/soporte/incidencias/7']}><Routes><Route path="/soporte/incidencias/:id" element={<SoporteDetalle />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'Funcional' })).toBeInTheDocument();
  expect(screen.getAllByRole('option').map((option) => (option as HTMLOptionElement).value)).toEqual(['RECIBIDA', 'EN ATENCIÓN', 'RESUELTA']);
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Se corrigió la pantalla.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
  expect(await screen.findByText('Se corrigió la pantalla.')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Nota privada.' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar nota interna' }));
  expect(await screen.findByText('Nota privada.')).toBeInTheDocument();
  expect(soporteService.responder).toHaveBeenLastCalledWith(7, 'Nota privada.', true);
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'RESUELTA' } });
  await waitFor(() => expect(screen.getByLabelText('Estado')).toHaveValue('RESUELTA'));
  expect(soporteService.estado).toHaveBeenCalledWith(7, 'RESUELTA');
});

it('retains a failed reply draft and reports loading failures without inventing tickets', async () => {
  vi.mocked(soporteService.responder).mockRejectedValue(new Error('No se pudo persistir.'));
  render(<MemoryRouter initialEntries={['/soporte/incidencias/7']}><Routes><Route path="/soporte/incidencias/:id" element={<SoporteDetalle />} /></Routes></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Funcional' });
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Conservar borrador' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo persistir.');
  expect(screen.getByLabelText('Mensaje')).toHaveValue('Conservar borrador');
});

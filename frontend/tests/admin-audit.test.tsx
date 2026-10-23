import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AdminAuditoria } from '../src/pages/admin/AdminAuditoria';
import { adminService, type AuditoriaItem } from '../src/services/adminService';
import { auditDay, filterAudit, groupAudit } from '../src/pages/admin/auditView';

const items: AuditoriaItem[] = [
  {id_auditoria:1,actor:'Ana',nombre_tabla:'usuarios',nombre_entidad:'10',accion:'INSERT',fecha_evento:'2026-10-11T04:30:00Z'},
  {id_auditoria:2,actor:'Luis',nombre_tabla:'pacientes',nombre_entidad:'20',accion:'UPDATE',fecha_evento:'2026-10-11T06:00:00Z'},
  {id_auditoria:3,actor:null,nombre_tabla:'otros',nombre_entidad:'30',accion:'DELETE',fecha_evento:'2026-10-11T07:00:00Z'},
];
it('filters on the Lima date, actor and actual module and orders event groups', () => {
  expect(auditDay(items[0].fecha_evento)).toBe('2026-10-10');
  expect(filterAudit(items,'all','','2026-10-11','2026-10-11')).toHaveLength(2);
  expect(filterAudit(items,'users','Ana','','')).toEqual([items[0]]);
  expect(filterAudit(items,'patients','actualización','','')).toEqual([items[1]]);
  expect(groupAudit(items).map(([day,rows]) => [day,rows.map(r=>r.id_auditoria)])).toEqual([
    ['2026-10-11',[3,2]],['2026-10-10',[1]],
  ]);
});
it('distinguishes global total from loaded counts and supports filters, details and refresh', async () => {
  const get = vi.spyOn(adminService,'getAuditoria').mockResolvedValue({items,total:120});
  render(<AdminAuditoria/>);
  await screen.findByText(/3 eventos visibles de 3 cargados/);
  expect(screen.getByText('120')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:/Pacientes/}));
  expect(screen.getByText(/1 eventos visibles/)).toBeInTheDocument();
  expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Ver detalle'));
  expect(screen.getByText('#2')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Buscar eventos por actor, registro o acción'),{target:{value:'inexistente'}});
  expect(screen.getByText('No hay eventos con estos filtros')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Limpiar filtros'}));
  expect(screen.getByText(/3 eventos visibles/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Actualizar eventos'}));
  await waitFor(()=>expect(get).toHaveBeenCalledTimes(2));
  get.mockRestore();
});
it('offers retry on endpoint failure instead of presenting fake events', async () => {
  const get = vi.spyOn(adminService,'getAuditoria').mockRejectedValueOnce(new Error('offline')).mockResolvedValue({items:[],total:0});
  render(<AdminAuditoria/>);
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button',{name:'Reintentar'}));
  await screen.findByText('Todavía no hay operaciones registradas');
  get.mockRestore();
});

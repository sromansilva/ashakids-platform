import { expect,it,vi } from 'vitest';
import { fireEvent,screen,waitFor } from '@testing-library/react';
import { renderRoute } from './helpers';
const response = (data:unknown,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const defaults = {nueva_cita:true,cancelacion:true,reprogramacion:true,recordatorio:true,mensajes:true};
const notification = {id_notificacion:7,tipo:'NUEVA_CITA',titulo:'Nueva cita confirmada',texto:'María reservó una cita para Ana el 20/10/2026 a las 10:00.',id_reserva:3,id_conversacion:null,fecha_creacion:'2026-10-10T15:00:00Z',leida_en:null};
it('saves real preferences, preserves a failed draft and restores persisted values after remount',async () => {
  let saved = {...defaults}, fail = true;
  const api = vi.mocked(fetch).mockImplementation(async(input,init={}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1','');
    if(path==='/notificaciones/preferencias') {
      if(init.method==='PUT') {if(fail) return response({detail:'Preferencias no disponibles'},503);saved=JSON.parse(String(init.body));}
      return response(saved);
    }
    if(path==='/notificaciones') return response({items:[],total:0,sin_leer:0});
    return response([]);
  });
  const view = renderRoute('/terapeuta/config','TERAPEUTA');
  fireEvent.click(await screen.findByRole('button',{name:/Notificaciones$/}));
  const toggle = await screen.findByRole('switch',{name:/Nueva cita confirmada/});
  expect(toggle).toBeChecked();fireEvent.click(toggle);
  fireEvent.click(screen.getByRole('button',{name:'Guardar preferencias'}));
  await screen.findByText('Preferencias no disponibles');
  expect(toggle).not.toBeChecked();expect(screen.queryByText('Preferencias guardadas.')).not.toBeInTheDocument();
  fail=false;fireEvent.click(screen.getByRole('button',{name:'Guardar preferencias'}));
  await screen.findByText('Preferencias guardadas.');
  expect(saved.nueva_cita).toBe(false);
  expect(api.mock.calls.some(([input,init])=>String(input).endsWith('/notificaciones/preferencias')&&init?.method==='PUT')).toBe(true);
  view.unmount();renderRoute('/terapeuta/config','TERAPEUTA');
  fireEvent.click(await screen.findByRole('button',{name:/Notificaciones$/}));
  expect(await screen.findByRole('switch',{name:/Nueva cita confirmada/})).not.toBeChecked();
});
it('shows persisted events and changes unread state only after server success',async () => {
  let item = {...notification},fail=true;
  vi.mocked(fetch).mockImplementation(async(input,init={})=>{
    const url=new URL(String(input)),path=url.pathname.replace('/api/v1','');
    if(path==='/notificaciones/7/leida'&&init.method==='PATCH') {
      if(fail) return response({detail:'No se pudo marcar'},503);
      item={...item,leida_en:'2026-10-10T15:05:00Z'} as typeof item;
      return response(item);
    }
    if(path==='/notificaciones') return response({items:[item],total:1,sin_leer:item.leida_en?0:1});
    return response([]);
  });
  renderRoute('/terapeuta','TERAPEUTA');
  fireEvent.click(await screen.findByRole('button',{name:/Notificaciones 1 sin leer/}));
  await screen.findByText(notification.texto);
  fireEvent.click(screen.getByRole('button',{name:'Marcar como leída'}));
  await screen.findByText('No se pudo marcar');expect(screen.getByText('Sin leer')).toBeInTheDocument();
  fail=false;fireEvent.click(screen.getByRole('button',{name:'Marcar como leída'}));
  await screen.findByText('Leída');
  expect(await screen.findByRole('button',{name:/Notificaciones 0 sin leer/})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Ver agenda'}));
  await screen.findByRole('heading',{name:/^Agenda$/});
});
it('reports inbox failure without exposing stale entries and keeps notifications out of other roles',async () => {
  vi.mocked(fetch).mockImplementation(async input=>String(input).includes('/notificaciones')?response({detail:'Bandeja no disponible'},503):response([]));
  const view=renderRoute('/terapeuta','TERAPEUTA');
  fireEvent.click(await screen.findByRole('button',{name:/Notificaciones Sin conexión/}));
  await screen.findByText('Bandeja no disponible');
  expect(screen.queryByText(notification.texto)).not.toBeInTheDocument();
  view.unmount();vi.mocked(fetch).mockClear();renderRoute('/padre','PADRE');
  await screen.findByText('Centro Familiar',{selector:'h1'});
  await waitFor(()=>expect(vi.mocked(fetch).mock.calls.every(([input])=>!String(input).includes('/notificaciones'))).toBe(true));
});

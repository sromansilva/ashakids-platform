import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi, it, expect } from 'vitest';
import { renderRoute } from './helpers';
const contact = { id_tutor: 3, id_terapeuta: 4, tutor_nombre: 'Familia sintética', terapeuta_nombre: 'Profesional sintético' };
const conversation = { ...contact, id_conversacion: 12, estado: 'ACTIVA', ultima_actividad: '2026-10-09T15:00:00Z', puede_enviar: true, id_usuario_tutor: 1, id_usuario_terapeuta: 2 };
const message = { id_mensaje: 10, id_conversacion: 12, id_usuario_emisor: 2, texto_mensaje: 'Mensaje persistente del profesional', fecha_envio: '2026-10-09T15:00:00Z' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'X-Total-Count': '1' } });
function api(overrides?: (path: string, method: string, init: RequestInit) => Response | Promise<Response> | undefined) {
  return vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace('/api/v1', '');
    const custom = overrides?.(path, init.method ?? 'GET', init); if (custom) return custom;
    if (path === '/conversaciones/contactos') return response([contact]);
    if (path === '/conversaciones' && init.method === 'POST') return response(conversation);
    if (path === '/conversaciones') return response({ items: [conversation], next_before_id: null });
    if (path === '/conversaciones/12') return response(conversation);
    if (path === '/conversaciones/12/mensajes') return response({ items: [message], next_before_id: null });
    return response([]);
  });
}
async function open() {
  fireEvent.click(await screen.findByRole('button', { name: 'Profesional sintético Asignación activa' }));
  const input = await screen.findByLabelText('Escribir mensaje');
  await waitFor(() => expect(input).not.toBeDisabled());
  return input;
}

it('reads persisted family messages without invented names, calls or replies', async () => {
  api(); renderRoute('/padre/mensajes', 'PADRE'); await open();
  expect(await screen.findByText(message.texto_mensaje)).toBeInTheDocument();
  expect(screen.queryByText('Laura Gómez')).not.toBeInTheDocument();
  expect(screen.queryByText(/En línea|Llamando/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /adjuntar|llamar/i })).not.toBeInTheDocument();
});

it('explains an empty assignment list without fallback chats', async () => {
  api(path => path === '/conversaciones/contactos' ? response([]) : path === '/conversaciones' ? response({ items: [], next_before_id: null }) : undefined);
  renderRoute('/padre/mensajes', 'PADRE');
  expect(await screen.findByText('No hay asignaciones activas para iniciar un chat.')).toBeInTheDocument();
  expect(screen.getByText('Todavía no tienes conversaciones.')).toBeInTheDocument();
  expect(screen.queryByLabelText('Escribir mensaje')).not.toBeInTheDocument();
});

it('opens only a server-supplied contact with participant ids', async () => {
  const requests=api();
  renderRoute('/padre/mensajes', 'PADRE');
  fireEvent.click(await screen.findByRole('button', { name: 'Conversar con Profesional sintético' }));
  await screen.findByText(message.texto_mensaje);
  const post=requests.mock.calls.find(([,init]) => init?.method==='POST');
  expect(JSON.parse(String(post?.[1]?.body))).toEqual({ id_tutor: 3, id_terapeuta: 4 });
});

it('waits for server confirmation and prevents duplicate simultaneous submissions', async () => {
  let finish!: (r: Response) => void;
  const requests=api((path,method) => path.endsWith('/mensajes') && method==='POST' ? new Promise(resolve => { finish=resolve; }) : undefined);
  renderRoute('/padre/mensajes', 'PADRE'); const input=await open();
  fireEvent.change(input,{target:{value:'Borrador sin confirmar'}}); fireEvent.click(screen.getByRole('button',{name:'Enviar mensaje'}));
  await screen.findByRole('button',{name:'Guardando mensaje…'});
  expect(screen.queryByText('Mensaje guardado en el servidor.')).not.toBeInTheDocument();
  expect(screen.queryByText('Borrador sin confirmar',{selector:'p'})).not.toBeInTheDocument();
  fireEvent.submit(input.closest('form')!);
  expect(requests.mock.calls.filter(([,init])=>init?.method==='POST')).toHaveLength(1);
  finish(response({...message, id_mensaje:11, id_usuario_emisor:1, texto_mensaje:'Borrador sin confirmar'},201));
  await screen.findByText('Mensaje guardado en el servidor.');
  expect(input).toHaveValue('');
});

it('keeps the draft on 503 without a fake message or automatic retry', async () => {
  const requests=api((path,method)=>path.endsWith('/mensajes')&&method==='POST'?response({detail:'Base no disponible'},503):undefined);
  renderRoute('/padre/mensajes','PADRE'); const input=await open();
  fireEvent.change(input,{target:{value:'Conservar este texto'}});fireEvent.click(screen.getByRole('button',{name:'Enviar mensaje'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Base no disponible');
  expect(input).toHaveValue('Conservar este texto');expect(screen.queryByText('Mensaje guardado en el servidor.')).not.toBeInTheDocument();
  expect(requests.mock.calls.filter(([,init])=>init?.method==='POST')).toHaveLength(1);
});

it('describes uncertain delivery honestly after network failure', async () => {
  api((path,method)=>path.endsWith('/mensajes')&&method==='POST'?Promise.reject(new TypeError('Offline')):undefined);
  renderRoute('/padre/mensajes','PADRE');const input=await open();
  fireEvent.change(input,{target:{value:'Entrega incierta'}});fireEvent.click(screen.getByRole('button',{name:'Enviar mensaje'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se confirmó el envío');expect(input).toHaveValue('Entrega incierta');
  expect(screen.queryByText('Tus cambios no se han guardado.')).not.toBeInTheDocument();
});

it('shows inactive-assignment history in read-only mode', async () => {
  api(path=>path==='/conversaciones/12'?response({...conversation,puede_enviar:false}):undefined);
  renderRoute('/padre/mensajes','PADRE');fireEvent.click(await screen.findByRole('button',{name:'Profesional sintético Asignación activa'}));
  expect(await screen.findByText(message.texto_mensaje)).toBeInTheDocument();
  expect(screen.getByLabelText('Escribir mensaje')).toBeDisabled();expect(screen.getByRole('button',{name:'Enviar mensaje'})).toBeDisabled();
});

it('hides cached messages when an update loses access', async () => {
  let revoked=false;api(path=>revoked&&path.startsWith('/conversaciones/12')?response({detail:'Conversación no encontrada.'},404):undefined);
  renderRoute('/padre/mensajes','PADRE');await open();await screen.findByText(message.texto_mensaje);
  revoked=true;fireEvent.click(screen.getByRole('button',{name:'Actualizar conversación'}));
  await screen.findByRole('alert');expect(screen.queryByText(message.texto_mensaje)).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Enviar mensaje'})).toBeDisabled();
});

it('loads older pages with the server cursor and deduplicates rows', async () => {
  api(path=>path.endsWith('/mensajes')?response({items:[message],next_before_id:10}):undefined);
  renderRoute('/padre/mensajes','PADRE');await open();
  vi.mocked(fetch).mockImplementation(async input=>{
    const url=new URL(String(input));
    if(url.pathname.endsWith('/mensajes')) return response({items:[{...message,id_mensaje:9,texto_mensaje:'Mensaje anterior'},message],next_before_id:null});
    return response(conversation);
  });
  fireEvent.click(screen.getByRole('button',{name:'Cargar mensajes anteriores'}));
  await screen.findByText('Mensaje anterior');expect(screen.getAllByText(message.texto_mensaje)).toHaveLength(1);
  expect(vi.mocked(fetch).mock.calls.some(([input])=>String(input).includes('before_id=10'))).toBe(true);
});

it('preserves separate drafts while switching conversation ids', async () => {
  const other={...conversation,id_conversacion:13,terapeuta_nombre:'Otro profesional'};
  api(path=>path==='/conversaciones'?response({items:[conversation,other],next_before_id:null}):path==='/conversaciones/13'?response(other):path==='/conversaciones/13/mensajes'?response({items:[],next_before_id:null}):undefined);
  renderRoute('/padre/mensajes','PADRE');const input=await open();fireEvent.change(input,{target:{value:'Borrador uno'}});
  fireEvent.click(screen.getByRole('button',{name:'Otro profesional Asignación activa'}));
  const otherInput=await screen.findByLabelText('Escribir mensaje');await waitFor(()=>expect(otherInput).not.toBeDisabled());expect(otherInput).toHaveValue('');
  fireEvent.change(otherInput,{target:{value:'Borrador dos'}});fireEvent.click(screen.getByRole('button',{name:'Profesional sintético Asignación activa'}));
  expect(await screen.findByLabelText('Escribir mensaje')).toHaveValue('Borrador uno');
});

it('renders message markup literally without injecting images', async () => {
  const text='<img src="https://invalid.example" onerror="alert(1)"> Niño 🎈';
  api(path=>path.endsWith('/mensajes')?response({items:[{...message,texto_mensaje:text}],next_before_id:null}):undefined);
  const view=renderRoute('/padre/mensajes','PADRE');await open();expect(await screen.findByText(text)).toBeInTheDocument();
  expect(view.container.querySelector('img[src="https://invalid.example"]')).toBeNull();
});

it('does not invent a name for a removed historical sender', async () => {
  api(path=>path.endsWith('/mensajes')?response({items:[{...message,id_usuario_emisor:null}],next_before_id:null}):undefined);
  renderRoute('/padre/mensajes','PADRE');await open();expect(await screen.findByText('Emisor anterior no disponible')).toBeInTheDocument();
});

it('administrator sees pending campaigns without fake counts or private chats', async () => {
  const requests=api();renderRoute('/admin/mensajes','ADMIN');await screen.findByText('Comunicaciones administrativas');
  expect(screen.queryByText('342')).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Nueva campaña'})).not.toBeInTheDocument();
  expect(requests.mock.calls.some(([input])=>String(input).includes('/conversaciones'))).toBe(false);
});

it('therapist opens the family conversation with the same service', async () => {
  api(path=>path==='/conversaciones'?response({items:[conversation],next_before_id:null}):undefined);
  renderRoute('/terapeuta/mensajes','TERAPEUTA');fireEvent.click(await screen.findByRole('button',{name:'Familia sintética Asignación activa'}));
  expect(await screen.findByText(message.texto_mensaje)).toBeInTheDocument();
});

it('does not clear a draft or claim success for an invalid successful response', async () => {
  api((path,method)=>path.endsWith('/mensajes')&&method==='POST'?response('<html>Gateway</html>'):undefined);
  renderRoute('/padre/mensajes','PADRE');const input=await open();
  fireEvent.change(input,{target:{value:'Texto por confirmar'}});fireEvent.click(screen.getByRole('button',{name:'Enviar mensaje'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('no confirmó un mensaje guardado válido');
  expect(input).toHaveValue('Texto por confirmar');expect(screen.queryByText('Mensaje guardado en el servidor.')).not.toBeInTheDocument();
});

it('rejects an open response for a different participant pair', async () => {
  api((path,method)=>path==='/conversaciones'&&method==='POST'?response({...conversation,id_tutor:99}):undefined);
  renderRoute('/padre/mensajes','PADRE');fireEvent.click(await screen.findByRole('button',{name:'Conversar con Profesional sintético'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('no confirmó una conversación válida');
  expect(screen.queryByLabelText('Escribir mensaje')).not.toBeInTheDocument();
});

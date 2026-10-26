import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, screen, within, waitFor } from '@testing-library/react';
import { renderRoute } from './helpers';
import type { Patient } from '@/modules/clinica/domain/clinical';
import type { GameProgress } from '@/modules/mundo_asha/infrastructure/learningGames';
import { learningGames } from '@/modules/mundo_asha/infrastructure/learningGames';
import { appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';

const child: Patient = {id_paciente:21,id_tutor:1,nombres_paciente:'Leo',apellidos_paciente:'Ejemplo',fecha_nacimiento:'2020-01-01',sexo:'Masculino',activo:true,fecha_registro:'2026-01-01'};
const sibling: Patient = {...child,id_paciente:22,nombres_paciente:'Luna'};
const progress: GameProgress = {id_paciente:21,version:'basica-1',experiencia:0,nivel:1,intentos_totales:0,experiencia_siguiente_nivel:200,medallas:[],mundos:[
  {id:'LENGUAJE',version:'basica-1',name:'La Isla de las Palabras',description:'Palabras e historias',asignado:true,completados:[],intentos:0,medalla:false,levels:[{number:1,title:'Elige una palabra',prompt:'Elige el animal',choices:['Gato','Mesa'],sequence:false}]},
  {id:'VOZ',version:'basica-1',name:'El Estudio de la Voz',description:'Explora tu voz',asignado:false,completados:[],intentos:0,medalla:false,levels:[]},
]};
function api({empty = false, error = false}: {empty?: boolean; error?: boolean} = {}) {
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const path = new URL(String(input),'http://localhost').pathname.replace(/^\/api\/v1/,'');
    const data = error ? {detail:'Servicio no disponible'} : path === '/pacientes' ? empty ? [] : [child,sibling] : path.endsWith('/juegos') ? {...progress,id_paciente:Number(path.split('/')[2]),mundos:path.includes('/22/') ? [] : progress.mundos} : [];
    return new Response(JSON.stringify(data),{status:error?503:200,headers:{'Content-Type':'application/json','X-Total-Count':Array.isArray(data)?String(data.length):'1'}});
  });
}
beforeEach(()=>{
  sessionStorage.clear();
  Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(this: HTMLDialogElement){this.setAttribute('open','');}});
  Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(this: HTMLDialogElement){this.removeAttribute('open');}});
});

it('starts with two child destinations, keeps clinical information secondary and removes the sidebar', async()=>{
  api(); renderRoute('/padre','PADRE');
  await screen.findByRole('heading',{name:'¡Hola, Leo!'});
  expect(screen.getByRole('heading',{name:'Mi mundo'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Mi camino'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Actualizar seguimiento'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Dashboard'})).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Registros del hijo seleccionado')).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.every(([url])=>!/\/(citas|sesiones|tratamientos)/.test(String(url)))).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'Para mi familia'}));
  await screen.findByRole('navigation',{name:'Herramientas para mi familia'});
  expect(screen.getByRole('button',{name:'Agenda y sesiones'})).toBeInTheDocument();
  expect(await screen.findByRole('button',{name:'Planes'})).toBeInTheDocument();
  const refresh = await screen.findByRole('button',{name:'Actualizar seguimiento'});
  await waitFor(()=>expect(refresh).toBeEnabled());
  const reads = vi.mocked(fetch).mock.calls.filter(([url])=>String(url).includes('/pacientes/21/tratamientos')).length;
  fireEvent.click(refresh);
  await waitFor(()=>expect(vi.mocked(fetch).mock.calls.filter(([url])=>String(url).includes('/pacientes/21/tratamientos')).length).toBeGreaterThan(reads));
  fireEvent.click(screen.getByRole('button',{name:'Volver al inicio'}));
  expect(screen.getByRole('heading',{name:'¡Hola, Leo!'})).toHaveFocus();
});

it('shows assigned worlds, opens the word collection and changes siblings by patient ID',async()=>{
  api(); renderRoute('/padre?section=world','PADRE');
  const worlds=await screen.findByRole('list',{name:'Mis mundos asignados'});
  expect(within(worlds).getByRole('heading',{name:'La Isla de las Palabras'})).toBeInTheDocument();
  expect(screen.queryByRole('heading',{name:'El Estudio de la Voz'})).not.toBeInTheDocument();
  fireEvent.click(within(worlds).getByRole('button',{name:'Explorar'}));
  await screen.findByRole('button',{name:'Jugar El tesoro de palabras'});
  fireEvent.click(screen.getByText('Leo',{selector:'summary span'}));
  fireEvent.click(screen.getByRole('button',{name:'Luna Ejemplo'}));
  await screen.findByRole('heading',{name:'Tu aventura se está preparando'});
  expect(screen.queryByRole('button',{name:'Jugar El tesoro de palabras'})).not.toBeInTheDocument();
  expect(sessionStorage.getItem('ashakids:selected-patient:1')).toBe('22');
});

it('does not open a world through an unassigned URL or invent journey events',async()=>{
  api(); const view=renderRoute('/padre?section=world&world=VOZ','PADRE');
  await screen.findByText(/Este mundo no está disponible/);
  expect(screen.queryByRole('button',{name:/Jugar nivel/})).not.toBeInTheDocument();
  view.unmount(); renderRoute('/padre?section=journey','PADRE');
  await screen.findByRole('list',{name:'Mi recorrido con mi equipo'});
  expect(screen.getByText('Tu familia prepara tu primer encuentro.')).toBeInTheDocument();
  expect(screen.queryByText('Ya es parte de tu historia')).not.toBeInTheDocument();
});

it('handles empty profiles and retries errors without falling back to sample names',async()=>{
  api({empty:true}); const view=renderRoute('/padre','PADRE');
  await screen.findByRole('heading',{name:'Aún no tienes hijos registrados'});
  expect(screen.queryByRole('button',{name:'Explorar'})).not.toBeInTheDocument();
  view.unmount(); api({error:true}); renderRoute('/padre','PADRE');
  await screen.findByRole('alert'); api();
  fireEvent.click(screen.getByRole('button',{name:'Reintentar'}));
  await screen.findByRole('heading',{name:'¡Hola, Leo!'});
});

it('saves the embedded game through the existing patient-specific service',async()=>{
  api(); const attempt = vi.spyOn(learningGames,'attempt').mockResolvedValue({id_intento:9,correcto:true,experiencia_otorgada:100,repetido:false,resumen:{...progress,experiencia:100,intentos_totales:1,mundos:[{...progress.mundos[0],completados:[1],intentos:1},progress.mundos[1]]}});
  renderRoute('/padre?section=world&world=LENGUAJE','PADRE');
  fireEvent.click(await screen.findByText('Para la familia'));
  fireEvent.click(screen.getByRole('button',{name:/Actividades con progreso guardado/}));
  fireEvent.click(await screen.findByRole('button',{name:'Jugar nivel 1'}));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button',{name:'Gato'}));
  fireEvent.click(within(dialog).getByRole('button',{name:'Comprobar y guardar'}));
  await screen.findByText(/¡Lo lograste! Intento guardado/);
  expect(attempt).toHaveBeenCalledWith(21,'LENGUAJE',expect.objectContaining({nivel:1,respuestas:['Gato'],clave_intento:expect.any(String)}));
  fireEvent.click(within(dialog).getByRole('button',{name:'Cerrar juego'}));
  expect(screen.getByRole('button',{name:'Repetir nivel 1'})).toBeInTheDocument();
});

it.each([
  {therapy:false,mode:'PRESENCIAL'}, {therapy:false,mode:'VIRTUAL'},
  {therapy:true,mode:'PRESENCIAL'}, {therapy:true,mode:'VIRTUAL'},
])('keeps the booking flow and automatic location (therapy: $therapy, mode: $mode)',async ({therapy,mode})=>{
  api(); const base = vi.mocked(fetch).getMockImplementation()!;
  const start = new Date(Date.now()+86400000).toISOString();
  const end = new Date(Date.parse(start)+2400000).toISOString();
  vi.mocked(fetch).mockImplementation(async(input,init)=>{
    const path=new URL(String(input),'http://localhost').pathname;
    const data=path.endsWith('/recorrido') ? {introduccion_atendida:therapy,introduccion_pendiente:false,terapia_habilitada:therapy} : path.endsWith('/terapeutas') ? [{id_terapeuta:4,nombres:'Profesional',apellidos:'Ejemplo',activo:true}] : path.endsWith('/turnos') ? [{inicio:start,fin:end,disponible:true}] : path.endsWith('/tratamientos') ? therapy ? [{id_tratamiento:8,id_paciente:21,nombre_tratamiento:'Plan persistido',estado_tratamiento:'ACTIVO',terapeuta_nombre:'Profesional Ejemplo'}] : [] : undefined;
    return data===undefined ? base(input,init) : new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','X-Total-Count':String(Array.isArray(data)?data.length:1)}});
  });
  const create=vi.spyOn(appointmentsService,'create').mockResolvedValue({id_reserva:90} as Awaited<ReturnType<typeof appointmentsService.create>>);
  renderRoute('/padre?section=family','PADRE');
  fireEvent.click(await screen.findByRole('button',{name:therapy?'Reservar sesión de terapia':'Reservar introducción'}));
  const dialog=await screen.findByRole('dialog');
  expect(within(dialog).getByLabelText('Hijo o hija')).toHaveValue('21');
  const address='Jr. Ricardo Treneman 252, Chorrillos 15064';
  const zoom='La reunión será mediante Zoom.';
  expect(within(dialog).getByText(address)).toBeInTheDocument();
  expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
  fireEvent.change(within(dialog).getByLabelText('Modalidad'),{target:{value:'VIRTUAL'}});
  expect(within(dialog).getByText(zoom)).toBeInTheDocument();
  expect(within(dialog).queryByText(address)).not.toBeInTheDocument();
  fireEvent.change(within(dialog).getByLabelText('Modalidad'),{target:{value:mode}});
  await within(dialog).findByRole('option',{name:'Profesional Ejemplo'});
  fireEvent.change(within(dialog).getByLabelText('Profesional'),{target:{value:'4'}});
  fireEvent.click(await within(dialog).findByRole('button',{name:/Disponible/}));
  fireEvent.click(within(dialog).getByRole('button',{name:'Revisar reserva'}));
  expect(within(dialog).getByText(`${mode==='PRESENCIAL'?'Presencial':'Virtual'} · ${mode==='PRESENCIAL'?address:zoom}`)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Confirmar cita'}));
  await waitFor(()=>expect(create).toHaveBeenCalledWith(expect.objectContaining({id_paciente:21,id_terapeuta:4,id_tratamiento:therapy?8:null,tipo_cita:therapy?'TERAPIA':'INTRODUCTORIA',fecha_hora_inicio:start,fecha_hora_fin:end,modalidad:mode,localizacion:mode==='PRESENCIAL'?address:zoom})));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

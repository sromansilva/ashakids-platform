import { beforeEach, it, expect, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderRoute } from './helpers';
import type { GameProgress } from '@/modules/mundo_asha/infrastructure/learningGames';

const names = ['Taller de los Sonidos','La Isla de las Palabras','Ritmo de las Palabras','El Estudio de la Voz','Laboratorio de los Gestos'];
const codes = ['HABLA','LENGUAJE','FLUIDEZ','VOZ','OROFACIAL'] as const;
function initial(): GameProgress {
  return {id_paciente:1,version:'basica-1',experiencia:0,nivel:1,medallas:[],intentos_totales:0,experiencia_siguiente_nivel:200,
    mundos:codes.map((id,i)=>({id,version:'basica-1',name:names[i],description:'Actividad básica',asignado:true,completados:[],intentos:0,medalla:false,
      levels:[1,2,3].map(number=>({number,title:`Actividad ${number}`,prompt:'Elige gato',choices:['Gato','Perro'],sequence:false}))}))};
}
let progress: GameProgress;
beforeEach(()=>{
  sessionStorage.clear();progress=initial();
  // JSDOM has no native top-layer dialog behavior; Chrome verifies it separately.
  Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(this: HTMLDialogElement){this.setAttribute('open','');}});
  Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(this: HTMLDialogElement){this.removeAttribute('open');}});
});
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','X-Total-Count':'1'}});
function api(failOnce=false) {
  let failed=false;
  return vi.mocked(fetch).mockImplementation(async (input,init)=>{
    const path=new URL(String(input)).pathname.replace('/api/v1','');
    if(path==='/pacientes') return reply([{id_paciente:1,nombres_paciente:'Ana',apellidos_paciente:'Demo',activo:true},{id_paciente:2,nombres_paciente:'Luis',apellidos_paciente:'Demo',activo:true}],200);
    if(path==='/pacientes/2/juegos') return reply({...initial(),id_paciente:2,mundos:initial().mundos.map(w=>({...w,asignado:false}))});
    if(path==='/pacientes/1/juegos') return reply(progress);
    if(path.endsWith('/intentos')) {
      if(failOnce&&!failed){failed=true;throw new Error('Sin red');}
      const data=JSON.parse(String(init?.body));
      const code=path.split('/').at(-2);
      const world=progress.mundos.find(w=>w.id===code)!;
      const correct=data.respuestas[0]==='Gato';
      const award=correct&&!world.completados.includes(data.nivel)?100:0;
      progress={...progress,experiencia:progress.experiencia+award,intentos_totales:progress.intentos_totales+1,
        mundos:progress.mundos.map(w=>w.id===code?{...w,intentos:w.intentos+1,completados:correct?[...new Set([...w.completados,data.nivel])]:w.completados}:w)};
      return reply({id_intento:progress.intentos_totales,correcto:correct,experiencia_otorgada:award,repetido:false,resumen:progress});
    }
    return reply([]);
  });
}
async function open(){const view=renderRoute('/mundo-asha','PADRE');fireEvent.click(await screen.findByRole('button',{name:'Abrir Taller de los Sonidos'}));fireEvent.click(screen.getByText('Para la familia'));fireEvent.click(screen.getByRole('button',{name:/Actividades con progreso guardado/}));return view;}
it('permite jugar nivel 3 primero y solo completa ese nivel después de guardar',async()=>{
  api();await open();
  expect(screen.getByRole('button',{name:'Jugar nivel 3'})).toBeEnabled();
  fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 3'}));
  fireEvent.click(screen.getByRole('button',{name:'Gato'}));
  fireEvent.click(screen.getByRole('button',{name:'Comprobar y guardar'}));
  expect(await screen.findByText(/Intento guardado.*100 XP/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Regresar al listado de niveles'}));
  expect(screen.getByRole('button',{name:'Repetir nivel 3'})).toBeEnabled();
  expect(screen.getByRole('button',{name:'Jugar nivel 1'})).toBeEnabled();
  expect(screen.getByText(/1 de 3 niveles completados/)).toBeInTheDocument();
});
it('reintenta el mismo UUID tras un error de red sin completar optimistamente',async()=>{
  const fetch=api(true);await open();fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 1'}));
  fireEvent.click(screen.getByRole('button',{name:'Gato'}));fireEvent.click(screen.getByRole('button',{name:'Comprobar y guardar'}));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByText(/0 de 3 niveles completados/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Reintentar guardado'}));
  expect(await screen.findByText(/Intento guardado.*100 XP/)).toBeInTheDocument();
  const calls=fetch.mock.calls.filter(([path])=>String(path).endsWith('/intentos'));
  expect(calls[0][1]?.body).toEqual(calls[1][1]?.body);
});
it('la recarga usa el servidor y otro hijo conserva su progreso separado',async()=>{
  api();progress.experiencia=400;progress.nivel=3;
  const view=await open();expect(screen.getByText(/Nivel 3 · 400 XP/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Hijo o hija'),{target:{value:'2'}});
  expect(await screen.findByRole('heading',{name:'Mundos pendientes para Luis'})).toBeInTheDocument();
  expect(screen.getByText(/Nivel 1 · 0 XP/)).toBeInTheDocument();
  view.unmount();sessionStorage.setItem('ashakids:selected-patient:1','1');await open();
  expect(screen.getByText(/Nivel 3 · 400 XP/)).toBeInTheDocument();
});

it('abre el mundo solicitado por la landing sólo si está asignado y permite volver',async()=>{
  api();renderRoute('/mundo-asha?world=HABLA','PADRE');
  expect(await screen.findByRole('button',{name:'Jugar Mis primeras dos parejas'})).toBeEnabled();
  fireEvent.click(screen.getByRole('button',{name:'Volver a mundos'}));
  expect(await screen.findByRole('button',{name:'Abrir Taller de los Sonidos'})).toBeEnabled();
});
it('rechaza el mundo solicitado para un niño sin asignación',async()=>{
  api();sessionStorage.setItem('ashakids:selected-patient:1','2');
  renderRoute('/mundo-asha?world=HABLA','PADRE');
  expect(await screen.findByText(/Este mundo no está habilitado/)).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Jugar nivel 1'})).not.toBeInTheDocument();
});
it('muestra los cinco mundos y distingue los que aún no están asignados',async()=>{
  api();progress.mundos[1].asignado=false;
  renderRoute('/mundo-asha','PADRE');
  const map=await screen.findByRole('list',{name:'Los cinco mundos de ASHA'});
  expect(within(map).getAllByRole('button')).toHaveLength(5);
  expect(within(map).getByRole('button',{name:'Sin asignar: La Isla de las Palabras'})).toBeDisabled();
  expect(within(map).getByRole('button',{name:'Abrir Taller de los Sonidos'})).toBeEnabled();
});
it('abre el juego en modal y cerrar no guarda ni completa el nivel',async()=>{
  const fetch=api();await open();
  fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 2'}));
  const dialog=screen.getByRole('dialog',{name:'Nivel 2: Actividad 2'});
  expect(within(dialog).getByRole('button',{name:'Comprobar y guardar'})).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('button',{name:'Gato'}));
  fireEvent.click(within(dialog).getByRole('button',{name:'Cerrar juego'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Jugar nivel 2'})).toBeEnabled();
  expect(fetch.mock.calls.filter(([path])=>String(path).endsWith('/intentos'))).toHaveLength(0);
});

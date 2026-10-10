import { beforeEach, it, expect, vi } from 'vitest';
import { fireEvent, screen, render } from '@testing-library/react';
import { renderRoute } from './helpers';
import { DEMO_WORLDS, demoProgressKey } from '@/services/demoWorlds';
import { DemoWorldPlayer } from '@/pages/padre/Sessions/DemoWorldPlayer';

const reply=(data:unknown)=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','X-Total-Count':String(Array.isArray(data)?data.length:1)}});
beforeEach(()=>sessionStorage.clear());
function api() {
  return vi.mocked(fetch).mockImplementation(async input=>{
    const path=new URL(String(input)).pathname.replace('/api/v1','');
    if(path==='/pacientes') return reply([1,2].map(id=>({id_paciente:id,nombres_paciente:id===1?'Ana':'Luis',apellidos_paciente:'Demo',activo:true})));
    if(path==='/pacientes/1/tratamientos') return reply([{id_tratamiento:1,id_sesion_origen:9,estado_tratamiento:'ACTIVO',nombre_tratamiento:'Plan de Ana',mundos_asignados:['LENGUAJE'],terapeuta_nombre:'Profesional',sesiones_recomendadas:4}]);
    return reply([]);
  });
}
async function open() {api();const view=renderRoute('/mundo-asha','PADRE');fireEvent.click(await screen.findByRole('button',{name:'Abrir Comprensión y expresión'}));return view;}
function solve(words:string[]) {for(const word of words)fireEvent.click(screen.getByRole('button',{name:word}));fireEvent.click(screen.getByRole('button',{name:'Comprobar respuesta'}));}
it('completa tres niveles, desbloquea, llega al final y repite sin inflar el progreso',async()=>{
  await open();
  expect(screen.getAllByRole('button',{name:'Bloqueado'})).toHaveLength(2);
  fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 1'}));solve(['Perro']);
  expect(screen.queryByRole('button',{name:'Completar nivel'})).not.toBeInTheDocument();
  solve(['Gato']);fireEvent.click(screen.getByRole('button',{name:'Completar nivel'}));
  fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 2'}));solve(['Para protegerse de la lluvia']);fireEvent.click(screen.getByRole('button',{name:'Completar nivel'}));
  fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 3'}));solve(['Despertar','Desayunar','Salir']);fireEvent.click(screen.getByRole('button',{name:'Completar nivel'}));
  expect(screen.getByRole('status')).toHaveTextContent('Mundo de demostración terminado');
  fireEvent.click(screen.getByRole('button',{name:'Repetir nivel 1'}));solve(['Gato']);fireEvent.click(screen.getByRole('button',{name:'Terminar repetición'}));
  expect(sessionStorage.getItem(demoProgressKey(1,1,'LENGUAJE'))).toBe('3');
  expect(vi.mocked(fetch).mock.calls.every(([,init])=>!init?.method || init.method==='GET')).toBe(true);
});
it('recargar conserva la demo de Ana, cambiar a Luis conserva su asignación independiente',async()=>{
  const view=await open();fireEvent.click(screen.getByRole('button',{name:'Jugar nivel 1'}));solve(['Gato']);fireEvent.click(screen.getByRole('button',{name:'Completar nivel'}));
  fireEvent.change(screen.getByLabelText('Hijo o hija'),{target:{value:'2'}});
  expect(await screen.findByRole('heading',{name:'Mundos pendientes para Luis'})).toBeInTheDocument();
  view.unmount();sessionStorage.setItem('ashakids:selected-patient:1','1');await open();
  expect(screen.getByRole('button',{name:'Jugar nivel 2'})).toBeInTheDocument();
});
it('el avance de otra cuenta no aparece y datos locales inválidos no desbloquean niveles',()=>{
  sessionStorage.setItem(demoProgressKey(1,1,'LENGUAJE'),'3');
  sessionStorage.setItem(demoProgressKey(2,1,'LENGUAJE'),'99');
  render(<DemoWorldPlayer world={DEMO_WORLDS[2]} userId={2} patientId={1} back={()=>{}}/>);
  expect(screen.getByRole('button',{name:'Jugar nivel 1'})).toBeInTheDocument();
  expect(screen.getAllByRole('button',{name:'Bloqueado'})).toHaveLength(2);
});

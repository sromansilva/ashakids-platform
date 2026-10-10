import type { WorldArea } from '@/types/clinical';
export interface DemoLevel { title: string; prompt: string; choices: string[]; answer: string[]; sequence?: boolean }
export interface DemoWorld { id: WorldArea; name: string; description: string; levels: DemoLevel[] }
export const DEMO_WORLDS: DemoWorld[] = [
  { id: 'FLUIDEZ', name: 'Fluidez y ritmo', description: 'Escucha, reconoce patrones y juega con su orden.', levels: [
    { title: 'Un ritmo corto', prompt: 'Escucha: sol, luna, sol. ¿Qué palabra se repite?', choices: ['Sol','Luna','Mar'], answer: ['Sol'] },
    { title: 'Dos pausas', prompt: 'Escucha: uno, pausa, dos, pausa, tres. ¿Cuántas pausas hay?', choices: ['Una','Dos','Tres'], answer: ['Dos'] },
    { title: 'Tu secuencia', prompt: 'Escucha: sol, mar, luna. Elige las palabras en ese orden.', choices: ['Luna','Sol','Mar'], answer: ['Sol','Mar','Luna'], sequence: true },
  ]},
  { id: 'HABLA', name: 'Habla y articulación', description: 'Escucha palabras y distingue sus sonidos iniciales.', levels: [
    { title: 'Escucha la palabra', prompt: 'Escucha: mesa. ¿Qué palabra oíste?', choices: ['Casa','Mesa','Sapo'], answer: ['Mesa'] },
    { title: 'Un sonido inicial', prompt: 'Mesa empieza con eme. ¿Cuál también empieza con eme?', choices: ['Luna','Sol','Mano'], answer: ['Mano'] },
    { title: 'Palabras en orden', prompt: 'Escucha: mano, mesa, mono. Elige las palabras en ese orden.', choices: ['Mono','Mano','Mesa'], answer: ['Mano','Mesa','Mono'], sequence: true },
  ]},
  { id: 'LENGUAJE', name: 'Comprensión y expresión', description: 'Resuelve pistas y ordena acciones de una historia.', levels: [
    { title: 'Una pista', prompt: 'Tiene cuatro patas, dice miau y le gusta dormir. ¿Qué animal es?', choices: ['Perro','Gato','Pez'], answer: ['Gato'] },
    { title: 'Comprende la historia', prompt: 'Ana lleva un paraguas porque llueve. ¿Para qué lo usa?', choices: ['Para comer','Para dormir','Para protegerse de la lluvia'], answer: ['Para protegerse de la lluvia'] },
    { title: 'Cuenta en orden', prompt: 'Primero despertamos, después desayunamos y luego salimos. Elige las acciones en ese orden.', choices: ['Salir','Despertar','Desayunar'], answer: ['Despertar','Desayunar','Salir'], sequence: true },
  ]},
];
export const demoProgressKey = (userId: number, patientId: number, worldId: WorldArea) => `ashakids:demo-world:v1:${userId}:${patientId}:${worldId}`;
export function readDemoProgress(key: string): number {
  try { const value = Number(sessionStorage.getItem(key)); return Number.isInteger(value) && value >= 0 && value <= 3 ? value : 0; } catch { return 0; }
}

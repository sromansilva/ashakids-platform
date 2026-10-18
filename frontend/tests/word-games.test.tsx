import { beforeEach,expect,it,vi } from 'vitest';
import { fireEvent,render,screen } from '@testing-library/react';
import { WordWorld } from '@/pages/padre/Sessions/WordGames/WordWorld';
import { wordGames,type WordPlayMode } from '@/pages/padre/Sessions/WordGames/wordContent';
beforeEach(()=>{
 vi.spyOn(Math,'random').mockReturnValue(.999);
 vi.stubGlobal('speechSynthesis',{speak:vi.fn(),cancel:vi.fn(),getVoices:()=>[]});
 vi.stubGlobal('SpeechSynthesisUtterance',class {text:string;lang='';rate=1;pitch=1;onerror=null;constructor(text:string){this.text=text;}});
});
const click=(name:string|RegExp)=>fireEvent.click(screen.getByRole('button',{name}));
function open(id:string,mode:WordPlayMode='gentle',start=true){
 const game=wordGames.find(g=>g.id===id)!,back=vi.fn(),legacy=vi.fn(),view=render(<WordWorld back={back} legacy={legacy}/>);
 if(mode==='challenge')click(/Un poquito más/);click(`Jugar ${game.title}`);if(start)click('¡Vamos a jugar!');return {...view,back,legacy};
}
const done=()=>expect(screen.getByRole('region',{name:'Juego completado'})).toBeInTheDocument();
const advance=()=>click(screen.queryByRole('button',{name:'Continuar'})?'Continuar':'Terminar juego');
const modes:WordPlayMode[]=['gentle','challenge'];
it('presenta diez portadas y una bienvenida con meta antes de jugar, restaura foco y limpia voz',()=>{
 const view=open('treasure','gentle',false);
 expect(screen.getByRole('heading',{name:'El tesoro de palabras'})).toHaveFocus();expect(screen.getByRole('region',{name:'Antes de jugar'})).toBeInTheDocument();expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
 click('Escuchar cómo jugar');expect(window.speechSynthesis.speak).toHaveBeenCalled();click('¡Vamos a jugar!');expect(screen.queryByRole('region',{name:'Antes de jugar'})).not.toBeInTheDocument();
 click('Volver a los juegos');expect(screen.getByRole('button',{name:'Jugar El tesoro de palabras'})).toHaveFocus();expect(screen.getAllByRole('button',{name:/^Jugar /})).toHaveLength(10);
 expect(document.querySelectorAll('.word-game-card img[src^="/words/games/"]')).toHaveLength(10);view.unmount();expect(window.speechSynthesis.cancel).toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
});
it.each(modes)('vocabulario %s: pistas, errores sin premio y tres tesoros',mode=>{
 open('treasure',mode);expect(document.querySelectorAll('.word-choice-grid button')).toHaveLength(mode==='gentle'?2:3);click('Perro');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();click('Perro');expect(screen.getByRole('note')).toHaveTextContent('bigotes');
 for(const name of ['Gato','Barco','Flor']){click(name);advance();}done();click('Elegir otro juego');expect(screen.getByText('Jugado en esta visita')).toBeInTheDocument();
});
it.each(modes)('memoria %s: estudio previo, desacierto visible, pistas y parejas completas',mode=>{
 open('memory',mode);const pairs=mode==='gentle'?2:4;
 expect(document.querySelectorAll('.word-memory img')).toHaveLength(pairs*2);expect(screen.getByRole('button',{name:'Gato, carta 1'})).toBeDisabled();click('Ya las vi');expect(document.querySelectorAll('.word-memory img')).toHaveLength(0);
 click('Descubrir carta 1');click('Descubrir carta 2');expect(screen.getByRole('status')).toHaveTextContent('son diferentes');expect(screen.queryByRole('button',{name:'Terminar juego'})).not.toBeInTheDocument();click('Volver a intentar');
 click('Mirar otra vez');expect(document.querySelectorAll('.word-memory img')).toHaveLength(pairs*2);click('Ya las vi');
 for(let i=1;i<=pairs;i++){click(`Descubrir carta ${i}`);click(`Descubrir carta ${i+pairs}`);}click('Terminar juego');done();click('Otra vez');expect(screen.getByRole('button',{name:'Ya las vi'})).toBeInTheDocument();
});
it.each(modes)('clasificación %s: un dibujo por turno, cesta incorrecta, drop y familias completas',mode=>{
 open('sort',mode);click('Cesta de frutas');expect(screen.getByRole('status')).toHaveTextContent('familia');expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');
 fireEvent.drop(screen.getByRole('button',{name:'Cesta de animales'}),{dataTransfer:{getData:()=> 'cat'}});expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
 const categories=['animales','frutas','frutas',...(mode==='challenge'?['transportes','transportes']:[])];
 for(const category of categories)click(`Cesta de ${category}`);click('Terminar juego');done();
});
const storySteps=[['Plantamos la semilla','Regamos con agua','Crece una flor'],['Guardamos los juguetes','Leemos un cuento','Nos acostamos'],['Lavamos la manzana','La ponemos en la cesta','Compartimos la merienda']];
it.each(modes)('historias %s: exige una secuencia lógica, corrige el último paso y narra',mode=>{
 open('story',mode);click('Crece una flor');click('Plantamos la semilla');click('Regamos con agua');click('Comprobar historia');expect(screen.queryByRole('button',{name:'Terminar juego'})).not.toBeInTheDocument();
 for(let i=0;i<3;i++)click('Quitar último paso');
 for(const steps of storySteps.slice(0,mode==='gentle'?1:3)){for(const step of steps)click(step);click('Comprobar historia');click('Escuchar mi historia');advance();}done();
});
it.each(modes)('opuestos %s: una pareja cada vez y explicación de los contrarios',mode=>{
 open('opposites',mode);click('Grande');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();
 for(const answer of ['Pequeño','Noche','Abajo']){click(answer);advance();}done();
});
it('sílabas con palmadas: escucha por partes, cuenta sin leer, corrige y termina',()=>{
 open('syllables');click('Escuchar por partes');click('Comprobar palmadas');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();
 for(const count of [2,2,3]){for(let i=0;i<count+1;i++)click('Dar una palmada');click('Quitar una palmada');expect(screen.getByLabelText(`${count} palmadas`)).toBeInTheDocument();click('Comprobar palmadas');advance();}done();
});
it('sílabas con más piezas: no acepta un orden incorrecto y permite quitar sólo la última',()=>{
 open('syllables','challenge');click('to');click('ga');click('Comprobar palabra');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();click('Quitar último trocito');click('Quitar último trocito');
 for(const parts of [['ga','to'],['ca','sa'],['pe','lo','ta']]){for(const part of parts)click(part);click('Comprobar palabra');advance();}done();
});
it.each(modes)('merienda %s: correspondencia uno a uno, quitar extras y tres cantidades',mode=>{
 open('count',mode);click('¡La merienda está lista!');expect(screen.getByRole('status')).toHaveTextContent('platos vacíos');
 for(const count of (mode==='gentle'?[2,3,4]:[3,4,5])){expect(screen.getByLabelText(`Mesa para ${count} amigos`)).toBeInTheDocument();for(let i=0;i<count+1;i++)click('Añadir una fruta');click('Quitar una fruta');expect(screen.getByLabelText(`Cesta con ${count} frutas`)).toBeInTheDocument();click('¡La merienda está lista!');advance();}done();
});
it.each(modes)('posiciones %s: modelo visual de ayuda, no premia error y admite toque/drop',mode=>{
 open('positions',mode);click('Colocar encima');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();click('Dame una pista');expect(screen.getByLabelText('Ejemplo: dentro de la caja')).toBeInTheDocument();click('Colocar dentro');advance();
 fireEvent.drop(screen.getByRole('button',{name:'Colocar encima'}),{dataTransfer:{getData:()=> 'bird'}});advance();click('Colocar debajo');advance();done();
});
it.each(modes)('rimas %s: escuchar opciones, confirmar selección y aprender finales distintos',mode=>{
 open('rhymes',mode);expect(screen.getByRole('button',{name:'¡Estas riman!'})).toBeDisabled();click('Escuchar Zapato');click('Elegir Zapato');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();
 for(const answer of ['Zapato','Caracol','Tambor']){click(`Elegir ${answer}`);click('¡Estas riman!');advance();}done();
});
it.each(modes)('frases %s: pictogramas, orden semántico y vagones corregibles',mode=>{
 open('sentence',mode);click('duerme');click('El gato');click('en casa');click('Comprobar frase');expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();for(let i=0;i<3;i++)click('Quitar último vagón');
 for(const parts of [['El gato','duerme','en casa'],['El pájaro','vuela','por el cielo'],['El conejo','come','zanahoria']]){for(const part of parts)click(part);click('Comprobar frase');click('Escuchar mi frase');advance();}done();
});
it('repetir genera otra variante, reinicia las ayudas y no envía intentos a API',()=>{
 open('treasure');for(const target of ['Gato','Barco','Flor']){click(target);advance();}done();vi.mocked(Math.random).mockReturnValue(0);click('Otra vez');expect(screen.getByText('Busca lo que viaja por el agua.')).toBeInTheDocument();expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');expect(screen.queryByRole('note')).not.toBeInTheDocument();expect(fetch).not.toHaveBeenCalled();
});
it('recupera imágenes fallidas y funciona con voz no disponible',()=>{
 const view=open('treasure','gentle',false);fireEvent.error(document.querySelector<HTMLImageElement>('.word-mission img')!);expect(screen.getByText(/imagen no disponible/)).toBeInTheDocument();
 vi.stubGlobal('speechSynthesis',undefined);click('¡Vamos a jugar!');expect(screen.getByText('La voz no está disponible aquí. Puedes seguir con las imágenes y el texto.')).toBeInTheDocument();click('Gato');advance();view.unmount();expect(fetch).not.toHaveBeenCalled();
});

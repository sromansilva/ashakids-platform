import { beforeEach,expect,it,vi } from 'vitest';
import { fireEvent,render,screen,within } from '@testing-library/react';
import { WordWorld } from '@/pages/padre/Sessions/WordGames/WordWorld';
import { wordGames,words } from '@/pages/padre/Sessions/WordGames/wordContent';
beforeEach(()=>{vi.spyOn(Math,'random').mockReturnValue(.999);});
function open(id:string){const game=wordGames.find(g=>g.id===id)!;const back=vi.fn(),legacy=vi.fn();const view=render(<WordWorld back={back} legacy={legacy}/>);fireEvent.click(screen.getByRole('button',{name:`Jugar ${game.title}`}));return {...view,back,legacy};}
const click=(name:string)=>fireEvent.click(screen.getByRole('button',{name}));
const done=()=>expect(screen.getByRole('region',{name:'Juego completado'})).toBeInTheDocument();
const advance=()=>click(screen.queryByRole('button',{name:'Continuar'})?'Continuar':'Terminar juego');
it('ofrece diez juegos distintos y restaura foco, voz y estado de la visita',()=>{
 const view=render(<WordWorld back={vi.fn()} legacy={vi.fn()}/>);expect(screen.getAllByRole('button',{name:/^Jugar /})).toHaveLength(10);
 click('Jugar El tesoro de palabras');expect(screen.getByRole('heading',{name:'El tesoro de palabras'})).toHaveFocus();click('Escuchar');
 click('Volver a los juegos');expect(screen.getByRole('button',{name:'Jugar El tesoro de palabras'})).toHaveFocus();expect(window.speechSynthesis.cancel).toHaveBeenCalled();
 view.unmount();expect(fetch).not.toHaveBeenCalled();
});
it('busca vocabulario en tres rondas y acepta reintentos sin completar antes',()=>{
 open('treasure');click('Perro');expect(screen.getByText('Vamos a probar otra vez.')).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Continuar'})).not.toBeInTheDocument();
 for(const target of ['Gato','Barco','Flor']){click(target);advance();}done();
 click('Elegir otro juego');expect(screen.getByText('Jugado en esta visita')).toBeInTheDocument();click('Jugar El tesoro de palabras');expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');
});
it('oculta imágenes en memoria, mantiene el desacierto visible y completa tres parejas',()=>{
 open('memory');expect(document.querySelectorAll('.word-memory img')).toHaveLength(0);click('Descubrir carta 1');click('Descubrir carta 2');expect(screen.getByRole('button',{name:'Volver a intentar'})).toBeInTheDocument();click('Volver a intentar');
 for(const [a,b] of [[1,4],[2,5],[3,6]]){click(`Descubrir carta ${a}`);click(`Descubrir carta ${b}`);}click('Terminar juego');done();click('Otra vez');expect(document.querySelectorAll('.word-memory img')).toHaveLength(0);
});
it('clasifica por toque y arrastre y rechaza una cesta incorrecta',()=>{
 open('sort');click('Elegir Manzana');click('Cesta de animales');expect(screen.getByText(/va en otra cesta/)).toBeInTheDocument();
 const dataTransfer={getData:()=> 'apple'};fireEvent.drop(screen.getByRole('button',{name:'Cesta de frutas'}),{dataTransfer});
 expect(screen.getByRole('button',{name:'Elegir Manzana'})).toBeDisabled();
 for(const [name,category] of [['Gato','animales'],['Perro','animales'],['Conejo','animales'],['Banana','frutas'],['Uvas','frutas']]){click(`Elegir ${name}`);click(`Cesta de ${category}`);}click('Terminar juego');done();
});
it('ordena la historia, permite cambiar el orden y exige los tres pasos correctos',()=>{
 open('story');for(const step of ['Crece una flor','Plantamos la semilla','Regamos con agua'])click(step);click('Comprobar historia');expect(screen.getByText(/Vamos a cambiar el orden/)).toBeInTheDocument();click('Cambiar');
 for(const step of ['Plantamos la semilla','Regamos con agua','Crece una flor'])click(step);click('Comprobar historia');click('Terminar juego');done();
});
it('conecta los tres opuestos sin aceptar combinaciones diferentes',()=>{
 open('opposites');click('Noche');expect(screen.getByText(/primero una imagen/)).toBeInTheDocument();click('Grande');click('Abajo');expect(screen.getByText(/busca lo contrario/)).toBeInTheDocument();
 for(const [a,b] of [['Grande','Pequeño'],['Día','Noche'],['Arriba','Abajo']]){click(a);click(b);}click('Terminar juego');done();
});
it('construye tres palabras con sílabas y corrige un orden incorrecto',()=>{
 open('syllables');click('to');click('ga');click('Comprobar');expect(screen.getByText('Vamos a probar otra vez.')).toBeInTheDocument();click('Cambiar');
 for(const syllables of [['ga','to'],['man','za','na'],['ma','ri','po','sa']]){for(const syllable of syllables)click(syllable);click('Comprobar');advance();}done();
});
it('cuenta añadiendo y quitando piezas; tres cantidades reales',()=>{
 open('count');click('¡La cesta está lista!');expect(screen.getByText('Vamos a probar otra vez.')).toBeInTheDocument();
 for(const amount of [2,3,4]){for(let i=0;i<amount+1;i++)click('Añadir una fruta');click('Quitar una fruta');expect(screen.getByLabelText(`Cesta con ${amount} frutas`)).toBeInTheDocument();click('¡La cesta está lista!');advance();}done();
});
it('coloca imágenes dentro, encima y debajo con toque o drop',()=>{
 open('positions');click('Colocar fuera');expect(screen.getByText('Vamos a probar otra vez.')).toBeInTheDocument();click('Colocar dentro');advance();
 fireEvent.drop(screen.getByRole('button',{name:'Colocar encima'}),{dataTransfer:{getData:()=> 'bird'}});advance();click('Colocar debajo');advance();done();
});
it('reconoce rimas reales en tres rondas y mantiene el reintento',()=>{
 open('rhymes');click('Manzana');expect(screen.getByText('Vamos a probar otra vez.')).toBeInTheDocument();for(const answer of ['Zapato','Banana','Gato']){click(answer);advance();}done();
});
it('arma tres frases, permite vaciar vagones y evita completar un orden incorrecto',()=>{
 open('sentence');for(const token of ['duerme','El gato','en casa'])click(token);click('Comprobar');expect(screen.getByText('Vamos a probar otra vez.')).toBeInTheDocument();click('Cambiar');
 for(const tokens of [['El gato','duerme','en casa'],['El pájaro','vuela','muy alto'],['El conejo','come','una zanahoria']]){for(const token of tokens)click(token);click('Comprobar');advance();}done();
});
it('recupera un fallo de imagen y conserva la práctica sin escribir en API',()=>{
 open('treasure');const target=screen.getByRole('button',{name:'Gato'});fireEvent.error(target.querySelector('img')!);expect(within(target).getByText(/imagen no disponible/)).toBeInTheDocument();click('Gato');advance();
 click('Empezar otra vez');expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');expect(fetch).not.toHaveBeenCalled();expect(words.apple.syllables).toEqual(['man','za','na']);
});

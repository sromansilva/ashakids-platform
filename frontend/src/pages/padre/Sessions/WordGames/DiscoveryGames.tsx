import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { rhymes,shuffle,vocabulary,words,type WordId } from './wordContent';
import { GameInstruction,PictureButton,RoundFooter,useRounds,WordPicture,WordProgress,WordScene,type WordSpeech } from './WordParts';
export interface WordActivityProps {finish:()=>void;speech:WordSpeech}

export function TreasureGame({finish,speech}:WordActivityProps){
  const state=useRounds(finish),round=vocabulary[state.round];
  const [orders]=useState(()=>vocabulary.map(r=>shuffle(r.options)));
  const prompt=`Encuentra: ${words[round.target].name.toLowerCase()}.`;
  return <><WordProgress value={state.round} total={3}/><GameInstruction text={prompt} speech={speech}>Busca <strong>{words[round.target].name.toLowerCase()}</strong> entre los tesoros.</GameInstruction><div className="word-choice-grid">{orders[state.round].map(id=><PictureButton key={id} id={id} complete={state.solved&&id===round.target} disabled={state.solved} onClick={()=>state.check(id===round.target)}/>)}</div><RoundFooter state={state}/></>;
}
export function RhymeGame({finish,speech}:WordActivityProps){
  const state=useRounds(finish),round=rhymes[state.round];
  const [orders]=useState(()=>rhymes.map(r=>shuffle(r.options)));
  return <><WordProgress value={state.round} total={3}/><GameInstruction text={`¿Qué palabra rima con ${words[round.target].name}? Escucha: ${orders[state.round].map(id=>words[id].name).join(', ')}.`} speech={speech}>¿Qué palabra rima con <strong>{words[round.target].name.toLowerCase()}</strong>?</GameInstruction><div className="word-rhyme-target"><WordPicture id={round.target} label/><Link2 size={30} aria-hidden="true"/></div><div className="word-choice-grid">{orders[state.round].map(id=><PictureButton key={id} id={id} complete={state.solved&&id===round.answer} disabled={state.solved} onClick={()=>{speech.speak(words[id].name);state.check(id===round.answer);}}/>)}</div><RoundFooter state={state}/></>;
}

const opposites=[{id:'size',left:'Grande',right:'Pequeño',art:'ball'},{id:'time',left:'Día',right:'Noche',art:'sun'},{id:'height',left:'Arriba',right:'Abajo',art:'bird'}] as const;
export function OppositesGame({finish,speech}:WordActivityProps){
  const [selected,setSelected]=useState<string|null>(null),[matched,setMatched]=useState<string[]>([]),[message,setMessage]=useState('');
  const [right]=useState(()=>shuffle(opposites));
  function match(id:string){if(!selected){setMessage('Toca primero una imagen de la izquierda.');return;}if(selected===id){setMatched(previous=>[...previous,id]);setSelected(null);setMessage('¡Son opuestos!');}else setMessage('Casi… busca lo contrario.');}
  return <><WordProgress value={matched.length} total={3} label="Parejas de opuestos"/><GameInstruction text="Une cada imagen de la izquierda con su contrario de la derecha." speech={speech}>Toca una imagen y después su contrario.</GameInstruction><div className="word-opposites">{[opposites,right].map((column,index)=><div key={index}>{column.map(pair=><button type="button" key={pair.id} disabled={matched.includes(pair.id)} aria-label={index===0?pair.left:pair.right} aria-pressed={index===0?selected===pair.id:undefined} className={`word-opposite ${selected===pair.id&&index===0?'is-selected':''} ${matched.includes(pair.id)?'is-complete':''}`} onClick={()=>{speech.speak(index===0?pair.left:pair.right);if(index===0){setSelected(pair.id);setMessage('Ahora busca su contrario.');}else match(pair.id);}}><WordScene id={(index===1&&pair.id==='time'?'moon':pair.art) as WordId} variant={`${pair.id} ${index===0?'first':'opposite'}`}/><strong>{index===0?pair.left:pair.right}</strong>{matched.includes(pair.id)&&<span>¡Unidos!</span>}</button>)}</div>)}</div><p role="status" className="word-feedback">{message}</p>{matched.length===3&&<button type="button" className="word-button word-next" onClick={finish}>Terminar juego</button>}</>;
}

export function MemoryGame({finish,speech}:WordActivityProps){
  const [cards]=useState(()=>shuffle(['cat','apple','car','cat','apple','car'] as WordId[]));
  const [open,setOpen]=useState<number[]>([]),[matched,setMatched]=useState<WordId[]>([]),[message,setMessage]=useState('');
  function flip(index:number){if(open.length===2||open.includes(index)||matched.includes(cards[index]))return;const next=[...open,index];setOpen(next);speech.speak(words[cards[index]].name);if(next.length===2){if(cards[next[0]]===cards[next[1]]){setMatched(previous=>[...previous,cards[index]]);setOpen([]);setMessage('¡Una pareja encontrada!');}else setMessage('Mira las dos imágenes. Puedes volver a intentar.');}}
  return <><WordProgress value={matched.length} total={3} label="Parejas encontradas"/><GameInstruction text="Toca dos cartas y busca las imágenes iguales." speech={speech}>¿Dónde está su pareja?</GameInstruction><div className="word-memory">{cards.map((id,index)=>{const visible=open.includes(index)||matched.includes(id);return <button type="button" key={index} className={`word-memory-card ${visible?'is-open':''} ${matched.includes(id)?'is-complete':''}`} aria-label={visible?`${words[id].name}, carta ${index+1}`:`Descubrir carta ${index+1}`} disabled={matched.includes(id)||(open.length===2&&!open.includes(index))} onClick={()=>flip(index)}>{visible?<WordPicture id={id} label/>:<><span className="word-memory-shell" aria-hidden="true">?</span><span>Carta {index+1}</span></>}</button>;})}</div><p role="status" className="word-feedback">{message}</p>{open.length===2&&<button type="button" className="word-button is-light word-next" onClick={()=>{setOpen([]);setMessage('¡Busca otra pareja!');}}>Volver a intentar</button>}{matched.length===3&&<button type="button" className="word-button word-next" onClick={finish}>Terminar juego</button>}</>;
}

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { pickRounds,shuffle,words,type WordId } from './wordContent';
import { GameInstruction,Hint,RoundFooter,useRounds,WordPicture,WordProgress,type WordSpeech } from './WordParts';
import type { WordActivityProps } from './DiscoveryGames';

const basketTypes=[{id:'animal',label:'Animales',art:'cat'},{id:'fruta',label:'Frutas',art:'apple'},{id:'transporte',label:'Transportes',art:'car'}] as const;
const sortingPools={animal:['cat','dog','rabbit','bird'],fruta:['apple','banana','grapes'],transporte:['car','boat']} as const;
export function SortGame({finish,speech,mode}:WordActivityProps) {
  const [baskets]=useState(()=>basketTypes.slice(0,mode==='gentle'?2:3));
  const [items]=useState(()=>shuffle(baskets.flatMap(b=>pickRounds<WordId>(sortingPools[b.id],2))));
  const [placed,setPlaced]=useState<WordId[]>([]),[message,setMessage]=useState(''),[misses,setMisses]=useState(0),[help,setHelp]=useState(false);
  const done=placed.length===items.length,current=items[Math.min(placed.length,items.length-1)];
  const hint=`${words[current].name} va con ${baskets.find(b=>b.id===words[current].category)!.label.toLowerCase()}. Mira el dibujo de esa cesta.`;
  function place(category:string,id:WordId=current) {
    if(done||id!==current||placed.includes(id))return;
    if(words[id].category===category){setPlaced(previous=>previous.includes(id)?previous:[...previous,id]);setMisses(0);setHelp(false);setMessage(`¡${words[id].name} está en su familia!`);}
    else{setMisses(n=>n+1);setMessage('Mira los dibujos de las cestas. ¿Cuál es su familia?');}
  }
  return <><WordProgress value={placed.length} total={items.length} label="Dibujos ordenados"/>
    <GameInstruction text={done?'¡Todos los dibujos están en su familia!':`¿Dónde va ${words[current].name.toLowerCase()}? Toca su cesta.`} speech={speech}>{done?'¡La isla ya está ordenada!':<>¿Dónde va <strong>{words[current].name.toLowerCase()}</strong>?</>}</GameInstruction>
    {!done&&<div className="word-sort-stage"><button type="button" className="word-sort-current" aria-label={`Escuchar ${words[current].name}`} draggable onDragStart={event=>{event.dataTransfer.setData('application/x-asha-word',current);event.dataTransfer.effectAllowed='move';}} onClick={()=>speech.speak(words[current].name)}><WordPicture key={current} id={current} label/><span>Escucha o arrastra</span></button></div>}
    <div className={`word-baskets ${baskets.length===3?'has-three':''}`}>{baskets.map(basket=><button type="button" key={basket.id} className={`word-basket basket-${basket.id} ${(help||misses>=2)&&!done&&words[current].category===basket.id?'is-selected':''}`} aria-label={`Cesta de ${basket.label.toLowerCase()}`} disabled={done} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();place(basket.id,event.dataTransfer.getData('application/x-asha-word') as WordId);}} onClick={()=>place(basket.id)}><div className="word-basket-example"><WordPicture id={basket.art}/><strong>{basket.label}</strong></div><div className="word-basket-pictures">{placed.filter(id=>words[id].category===basket.id).map(id=><WordPicture key={id} id={id}/>)}</div><span>{placed.filter(id=>words[id].category===basket.id).length} dibujos</span></button>)}</div>
    {!done&&<Hint text={hint} speech={speech} visible={help||misses>=2} reveal={()=>setHelp(true)}/>}
    <p role="status" className="word-feedback">{message}</p>{done&&<button type="button" className="word-button word-next" onClick={finish}>Terminar juego</button>}</>;
}

const guestIds:WordId[]=['cat','dog','rabbit','bird','snail'];
export function CountGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>(mode==='gentle'?[2,3,4]:[3,4,5]).map(amount=>({amount,id:pickRounds<WordId>(['apple','banana'],1)[0]})));
  const state=useRounds(finish,rounds.length);
  return <CountRound key={state.round} target={rounds[state.round]} state={state} speech={speech}/>;
}
function CountRound({target,state,speech}:{target:{id:WordId;amount:number};state:ReturnType<typeof useRounds>;speech:WordSpeech}) {
  const [count,setCount]=useState(0);
  const hint=`Hay ${target.amount} amigos. Necesitamos ${target.amount} piezas de merienda: una para cada uno.`;
  return <><WordProgress value={state.round} total={state.total} label="Meriendas preparadas"/>
    <GameInstruction text={`Vienen ${target.amount} amigos. Pon una pieza de merienda para cada uno.`} speech={speech}>¡Vienen <strong>{target.amount} amigos</strong> a merendar!</GameInstruction>
    <div className="word-picnic" aria-label={`Mesa para ${target.amount} amigos`}>{Array.from({length:target.amount},(_,i)=><div className="word-picnic-place" key={i}><WordPicture id={guestIds[i]}/><div className={`word-plate ${i<count?'is-filled':''}`} aria-label={`Plato ${i+1}${i<count?' con merienda':' vacío'}`}>{i<count?<WordPicture id={target.id}/>:<span aria-hidden="true">＋</span>}</div></div>)}</div>
    <div className="word-count-controls"><WordPicture id={target.id}/><div><button type="button" className="word-button" aria-label="Añadir una fruta" disabled={state.solved||count===6} onClick={()=>{setCount(n=>n+1);state.setMessage('');}}><Plus size={24}/> Una más</button><button type="button" className="word-button is-light" aria-label="Quitar una fruta" disabled={state.solved||count===0} onClick={()=>{setCount(n=>n-1);state.setMessage('');}}><Minus size={24}/> Una menos</button></div></div>
    <div className="word-portion-count" aria-label={`Cesta con ${count} frutas`} aria-live="polite">{count} en la mesa {count>target.amount&&<span className="word-extra-snack">Sobran {count-target.amount}</span>}</div>
    <Hint text={hint} speech={speech} visible={state.hint} reveal={state.showHint}/>
    {!state.solved&&<button type="button" className="word-button word-next" onClick={()=>state.check(count===target.amount,'¡Todos tienen merienda! Ni falta ni sobra.',count<target.amount?'Todavía hay platos vacíos. Añade una pieza.':'Hay más merienda que amigos. Quita una pieza.')}>¡La merienda está lista!</button>}<RoundFooter state={state}/></>;
}

const positions=[
 {id:'rabbit',zone:'inside',label:'dentro de la caja'},
 {id:'bird',zone:'above',label:'encima de la caja'},
 {id:'cat',zone:'below',label:'debajo de la caja'},
 {id:'dog',zone:'outside',label:'fuera de la caja'},
 {id:'rabbit',zone:'left',label:'a la izquierda de la caja'},
 {id:'cat',zone:'right',label:'a la derecha de la caja'},
] as const;
const zones=[{id:'above',label:'Encima'},{id:'inside',label:'Dentro'},{id:'below',label:'Debajo'},{id:'outside',label:'Fuera'},{id:'left',label:'Izquierda'},{id:'right',label:'Derecha'}] as const;
export function PositionsGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(mode==='gentle'?positions.slice(0,4):positions.filter(p=>p.zone!=='outside')));
  const state=useRounds(finish,rounds.length);return <PositionRound key={state.round} target={rounds[state.round]} state={state} speech={speech} mode={mode}/>;
}
function PositionRound({target,state,speech,mode}:{target:typeof positions[number];state:ReturnType<typeof useRounds>;speech:WordSpeech;mode:WordActivityProps['mode']}) {
  const [placed,setPlaced]=useState('');const available=zones.filter(z=>mode==='gentle'?!['left','right'].includes(z.id):z.id!=='outside');
  function choose(zone:string){if(state.solved)return;setPlaced(zone);state.check(zone===target.zone,`¡Está ${target.label}!`,'Mira la caja y escucha otra vez. Puedes moverlo.');}
  return <><WordProgress value={state.round} total={state.total} label="Lugares encontrados"/>
    <GameInstruction text={`El ${words[target.id].name.toLowerCase()} quiere estar ${target.label}. Llévalo allí.`} speech={speech}>Lleva a tu amigo <strong>{target.label}</strong>.</GameInstruction>
    <div className="word-position-friend" draggable={!state.solved} onDragStart={event=>event.dataTransfer.setData('application/x-asha-position',target.id)}><WordPicture id={target.id}/><p>Toca un lugar o arrastra a tu amigo.</p></div>
    <div className="word-position-board"><div className="word-position-box" aria-hidden="true"/>{available.map(zone=><button type="button" key={zone.id} className={`word-position-zone zone-${zone.id} ${placed===zone.id?'has-friend':''}`} aria-label={`Colocar ${zone.label.toLowerCase()}`} disabled={state.solved} onClick={()=>choose(zone.id)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(event.dataTransfer.getData('application/x-asha-position')===target.id)choose(zone.id);}}>{placed===zone.id?<WordPicture id={target.id}/>:<span className="word-position-marker" aria-hidden="true"/>}<strong>{zone.label}</strong></button>)}</div>
    <Hint text={`Mira el ejemplo: tu amigo está ${target.label}.`} speech={speech} visible={state.hint} reveal={state.showHint}/>
    {state.hint&&<div className={`word-position-model model-${target.zone}`} aria-label={`Ejemplo: ${target.label}`}><span className="model-box"/><span className="model-friend"><WordPicture id={target.id}/></span></div>}
    <RoundFooter state={state}/></>;
}

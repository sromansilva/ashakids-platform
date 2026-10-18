import { useState } from 'react';
import { Eye, Link2, Volume2 } from 'lucide-react';
import { choiceWords,pickRounds,rhymes,shuffle,vocabulary,words,type WordId,type WordPlayMode } from './wordContent';
import { GameInstruction,Hint,PictureButton,RoundFooter,useRounds,WordPicture,WordProgress,WordScene,type WordSpeech } from './WordParts';
export interface WordActivityProps {finish:()=>void;speech:WordSpeech;mode:WordPlayMode}

export function TreasureGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(vocabulary));
  const [orders]=useState(()=>rounds.map(r=>choiceWords(r.target,r.options,mode)));
  const state=useRounds(finish,rounds.length),round=rounds[state.round];
  return <><WordProgress value={state.round} total={state.total} label="Tesoros en el cofre"/>
    <GameInstruction text={round.clue} speech={speech}>{round.clue}</GameInstruction>
    <div className="word-choice-grid">{orders[state.round].map(id=><PictureButton key={id} id={id} selected={state.hint&&id===round.target} complete={state.solved&&id===round.target} disabled={state.solved} onClick={()=>state.check(id===round.target,`¡Un tesoro! Es ${words[round.target].name.toLowerCase()}.`,round.hint)}/>)}</div>
    <Hint text={round.hint} speech={speech} visible={state.hint} reveal={state.showHint}/>
    <div className="word-treasure-collection" aria-label="Tus tesoros">{rounds.slice(0,state.round+(state.solved?1:0)).map(r=><WordPicture key={r.target} id={r.target}/>)}</div>
    <RoundFooter state={state}/></>;
}

export function RhymeGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(rhymes));const state=useRounds(finish,rounds.length);
  return <RhymeRound key={state.round} round={rounds[state.round]} state={state} speech={speech} mode={mode}/>;
}
function RhymeRound({round,state,speech,mode}:{round:typeof rhymes[number];state:ReturnType<typeof useRounds>;speech:WordSpeech;mode:WordPlayMode}) {
  const [options]=useState(()=>choiceWords(round.answer,round.options,mode));const [selected,setSelected]=useState<WordId|null>(null);
  const pair=`${words[round.target].name} y ${words[round.answer].name} terminan en ${round.ending}.`;
  return <><WordProgress value={state.round} total={state.total} label="Rimas descubiertas"/>
    <GameInstruction text={`Escucha: ${words[round.target].name}. Busca una palabra que termine parecido.`} speech={speech}>¿Qué termina parecido a <strong>{words[round.target].name.toLowerCase()}</strong>?</GameInstruction>
    <div className="word-rhyme-target"><WordPicture id={round.target} label/><Link2 size={30} aria-hidden="true"/></div>
    <div className="word-choice-grid">{options.map(id=><div className="word-rhyme-choice" key={id}><PictureButton id={id} label={`Elegir ${words[id].name}`} selected={selected===id} complete={state.solved&&id===round.answer} disabled={state.solved} onClick={()=>{setSelected(id);state.setMessage('');speech.speak(`${words[round.target].name}. ${words[id].name}.`);}}/><button type="button" className="word-back" onClick={()=>speech.speak(words[id].name)} aria-label={`Escuchar ${words[id].name}`}><Volume2 size={20}/> Escuchar</button></div>)}</div>
    <Hint text={pair} speech={speech} visible={state.hint} reveal={state.showHint}/>
    {!state.solved&&<button type="button" className="word-button word-next" disabled={!selected} onClick={()=>state.check(selected===round.answer,`¡Riman! ${pair}`,'Escucha sus finales. ¿Suenan parecido?')}>¡Estas riman!</button>}
    <RoundFooter state={state}/></>;
}

const opposites = [
  {id:'size',left:'Grande',right:'Pequeño',art:'ball',otherArt:'ball',hint:'La pelota grande y la pelota pequeña son contrarias.'},
  {id:'time',left:'Día',right:'Noche',art:'sun',otherArt:'moon',hint:'De día vemos el sol. Por la noche vemos la luna.'},
  {id:'height',left:'Arriba',right:'Abajo',art:'bird',otherArt:'bird',hint:'Un pájaro está arriba y el otro está abajo.'},
] as const;
export function OppositesGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(opposites));const state=useRounds(finish,rounds.length);
  return <OppositeRound key={state.round} pair={rounds[state.round]} state={state} speech={speech} mode={mode}/>;
}
function OppositeRound({pair,state,speech,mode}:{pair:typeof opposites[number];state:ReturnType<typeof useRounds>;speech:WordSpeech;mode:WordPlayMode}) {
  const [order]=useState(()=>shuffle(mode==='gentle'?['opposite','same']:['opposite','same','other']));
  return <><WordProgress value={state.round} total={state.total} label="Contrarios descubiertos"/>
    <GameInstruction text={`Mira: ${pair.left}. Busca lo contrario.`} speech={speech}>Lo contrario de <strong>{pair.left.toLowerCase()}</strong> es…</GameInstruction>
    <div className="word-opposite-model"><WordScene id={pair.art} variant={`${pair.id} first`}/><strong>{pair.left}</strong></div>
    <div className="word-choice-grid">{order.map(kind=>{const opposite=kind==='opposite',label=opposite?pair.right:kind==='same'?pair.left:'Flor';return <button type="button" key={kind} className={`word-opposite ${state.solved&&opposite?'is-complete':''} ${state.hint&&opposite?'is-selected':''}`} aria-label={label} disabled={state.solved} onClick={()=>{speech.speak(label);state.check(opposite,`¡Sí! ${pair.left} y ${pair.right} son contrarios.`,pair.hint);}}><WordScene id={kind==='other'?'flower':opposite?pair.otherArt:pair.art} variant={kind==='other'?'':`${pair.id} ${opposite?'opposite':'first'}`}/><strong>{label}</strong></button>;})}</div>
    <Hint text={pair.hint} speech={speech} visible={state.hint} reveal={state.showHint}/><RoundFooter state={state}/></>;
}

const memoryPool:WordId[]=['cat','apple','car','bird','ball','flower','rabbit','book'];
export function MemoryGame({finish,speech,mode}:WordActivityProps) {
  const [cards]=useState(()=>{const chosen=pickRounds(memoryPool,mode==='gentle'?2:4);return shuffle([...chosen,...chosen]);});
  const [peek,setPeek]=useState(true),[open,setOpen]=useState<number[]>([]),[matched,setMatched]=useState<WordId[]>([]),[message,setMessage]=useState('');
  const total=cards.length/2;
  function flip(index:number) {
    if(peek||open.length===2||open.includes(index)||matched.includes(cards[index]))return;
    const next=[...open,index];setOpen(next);speech.speak(words[cards[index]].name);
    if(next.length===2){const a=cards[next[0]],b=cards[next[1]];
      if(a===b){setMatched(previous=>[...previous,a]);setOpen([]);setMessage(`¡Una pareja de ${words[a].name.toLowerCase()}!`);}
      else setMessage(`${words[a].name} y ${words[b].name} son diferentes. Míralos y vuelve a probar.`);
    }
  }
  return <><WordProgress value={matched.length} total={total} label="Parejas encontradas"/>
    <GameInstruction text={peek?'Mira dónde están los dibujos iguales. Cuando estés listo, toca Ya las vi.':'Toca dos cartas y busca los dibujos iguales.'} speech={speech}>{peek?'Mira los dibujos. ¿Dónde están las parejas?':'¿Recuerdas dónde está su pareja?'}</GameInstruction>
    <div className={`word-memory ${mode==='challenge'?'has-eight':''}`} aria-label="Cartas de memoria">{cards.map((id,index)=>{const visible=peek||open.includes(index)||matched.includes(id);return <button type="button" key={index} className={`word-memory-card ${visible?'is-open':''} ${matched.includes(id)?'is-complete':''}`} aria-label={visible?`${words[id].name}, carta ${index+1}`:`Descubrir carta ${index+1}`} disabled={peek||matched.includes(id)||(open.length===2&&!open.includes(index))} onClick={()=>flip(index)}>{visible?<WordPicture id={id} label/>:<><span className="word-memory-shell" aria-hidden="true">?</span><span>Carta {index+1}</span></>}</button>;})}</div>
    <p role="status" className="word-feedback">{message}</p>
    {peek?<button type="button" className="word-button word-next" onClick={()=>{setPeek(false);setOpen([]);setMessage('¡Ahora busca una pareja!');}}>Ya las vi</button>:matched.length<total&&<button type="button" className="word-back word-next" onClick={()=>{setPeek(true);setOpen([]);setMessage('Puedes mirar otra vez. Tómate tu tiempo.');}}><Eye size={20}/> Mirar otra vez</button>}
    {!peek&&open.length===2&&<button type="button" className="word-button is-light word-next" onClick={()=>{setOpen([]);setMessage('¡Busca otra pareja!');}}>Volver a intentar</button>}
    {matched.length===total&&<button type="button" className="word-button word-next" onClick={finish}>Terminar juego</button>}
  </>;
}

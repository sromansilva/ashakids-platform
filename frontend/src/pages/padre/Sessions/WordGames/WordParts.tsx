import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, Lightbulb, Mic, RotateCcw, Volume2 } from 'lucide-react';
import { gameIllustration, words, type WordId } from './wordContent';
import { createWordNarrator } from './wordNarrator';

export function WordPicture({ id, label=false }: {id:WordId; label?:boolean}) {
  const [failed,setFailed]=useState(false);
  return <span className="word-picture">{failed ? <span className="word-image-error">{words[id].name} · imagen no disponible</span> : <img src={words[id].image} alt="" width="220" height="220" draggable={false} onError={()=>setFailed(true)}/>} {label&&<strong>{words[id].name}</strong>}</span>;
}
export function PictureButton({ id, onClick, selected, complete, disabled, label }: {id:WordId;onClick:()=>void;selected?:boolean;complete?:boolean;disabled?:boolean;label?:string}) {
  return <button type="button" className={`word-picture-button ${selected?'is-selected':''} ${complete?'is-complete':''}`} aria-label={label??words[id].name} aria-pressed={selected} disabled={disabled} onClick={onClick}><WordPicture id={id} label/>{complete&&<span className="word-card-check"><Check size={20}/> Encontrado</span>}</button>;
}
export function useWordSpeech() {
  const [notice,setNotice]=useState('');
  const [narrator]=useState(()=>createWordNarrator(setNotice));
  useEffect(()=>{const hide=()=>{if(document.hidden)narrator.stop();};document.addEventListener('visibilitychange',hide);return()=>{narrator.stop();document.removeEventListener('visibilitychange',hide);};},[narrator]);
  return {...narrator,notice};
}
export type WordSpeech=ReturnType<typeof useWordSpeech>;
export function Listen({ text, speech,label='Escuchar',disabled=false }: {text:string;speech:WordSpeech;label?:string;disabled?:boolean}) {return <button type="button" disabled={disabled} className="word-button is-light" onClick={()=>speech.speak(text)}><Volume2 size={20}/> {label}</button>;}
export function WordProgress({ value,total,label='Tu aventura' }: {value:number;total:number;label?:string}) {
  return <div className="word-progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}><span>{label}</span><div aria-hidden="true">{Array.from({length:total},(_,i)=><span key={i} className={i<value?'is-done':''}>{i<value?<Check size={14}/>:i+1}</span>)}</div><span>{value}/{total}</span></div>;
}
export function useRounds(finish:()=>void,total=3) {
  const [round,setRound]=useState(0),[solved,setSolved]=useState(false),[message,setMessage]=useState('');
  const [hint,setHint]=useState(false),[misses,setMisses]=useState(0);
  function check(ok:boolean,success='¡Lo lograste!',repair='Mira con calma. Puedes volver a probar.') {
    if(solved)return;
    setSolved(ok);setMessage(ok?success:repair);
    if(!ok)setMisses(n=>n+1);
  }
  function advance(){if(!solved)return;if(round===total-1)finish();else{setRound(r=>r+1);setSolved(false);setMessage('');setHint(false);setMisses(0);}}
  return {round,total,solved,message,check,advance,setMessage,hint:hint||misses>=2,showHint:()=>setHint(true)};
}
export function RoundFooter({ state,total=state.total }: {state:ReturnType<typeof useRounds>;total?:number}) {
  return <><p className={`word-feedback ${state.solved?'is-good':''}`} role="status">{state.solved&&<Check size={24} aria-hidden="true"/>} {state.message}</p>{state.solved&&<button type="button" className="word-button word-next" onClick={state.advance}>{state.round===total-1?'Terminar juego':'Continuar'}</button>}</>;
}
export function Hint({text,speech,visible,reveal}:{text:string;speech:WordSpeech;visible:boolean;reveal:()=>void}) {
  return <aside className="word-help"><button type="button" className="word-back" onClick={()=>{reveal();speech.speak(text);}}><Lightbulb size={20}/> Dame una pista</button>{visible&&<p role="note">{text}</p>}</aside>;
}
export function GameArtwork({id,title}:{id:string;title:string}) {
  const [failed,setFailed]=useState(false);
  return <span className="word-game-art">{failed?<span className="word-image-error">{title} · imagen no disponible</span>:<img src={gameIllustration(id)} alt="" width="384" height="384" draggable={false} onError={()=>setFailed(true)}/>} {id==='naming'&&<span className="word-mic-badge" aria-hidden="true"><Mic size={30}/></span>}</span>;
}
export function GameInstruction({ children,text,speech }: {children:ReactNode;text:string;speech:WordSpeech}) {
  const instruction=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{instruction.current?.focus();},[text]);
  return <div className="word-instruction"><p ref={instruction} tabIndex={-1}>{children}</p><Listen text={text} speech={speech}/></div>;
}
export function Undo({onClick,disabled=false,label='Cambiar'}:{onClick:()=>void;disabled?:boolean;label?:string}){return <button type="button" className="word-button is-light" onClick={onClick} disabled={disabled}><RotateCcw size={18}/> {label}</button>;}
export function WordScene({ id,variant='',style }: {id:WordId;variant?:string;style?:CSSProperties}) {return <div className={`word-scene ${variant}`} style={style}><WordPicture id={id}/></div>;}

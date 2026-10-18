import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, RotateCcw, Volume2 } from 'lucide-react';
import { words, type WordId } from './wordContent';

export function WordPicture({ id, label=false }: {id:WordId; label?:boolean}) {
  const [failed,setFailed]=useState(false);
  return <span className="word-picture">{failed ? <span className="word-image-error">{words[id].name} · imagen no disponible</span> : <img src={words[id].image} alt="" width="220" height="220" draggable={false} onError={()=>setFailed(true)}/>} {label&&<strong>{words[id].name}</strong>}</span>;
}
export function PictureButton({ id, onClick, selected, complete, disabled, label }: {id:WordId;onClick:()=>void;selected?:boolean;complete?:boolean;disabled?:boolean;label?:string}) {
  return <button type="button" className={`word-picture-button ${selected?'is-selected':''} ${complete?'is-complete':''}`} aria-label={label??words[id].name} aria-pressed={selected} disabled={disabled} onClick={onClick}><WordPicture id={id} label/>{complete&&<span className="word-card-check"><Check size={20}/> Encontrado</span>}</button>;
}
export function useWordSpeech() {
  const [notice,setNotice]=useState('');
  const mounted=useRef(true);
  const stop=()=>{window.speechSynthesis?.cancel();};
  useEffect(()=>{mounted.current=true;const hide=()=>{if(document.hidden)window.speechSynthesis?.cancel();};document.addEventListener('visibilitychange',hide);return()=>{mounted.current=false;window.speechSynthesis?.cancel();document.removeEventListener('visibilitychange',hide);};},[]);
  function speak(text:string) {
    stop();setNotice('');
    if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){setNotice('La voz no está disponible aquí. Puedes seguir con las imágenes y el texto.');return;}
    const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-PE';utterance.rate=.78;utterance.pitch=1.05;
    utterance.onerror=event=>{if(mounted.current&&event.error!=='canceled'&&event.error!=='interrupted')setNotice('No se pudo escuchar. Toca el altavoz para reintentar.');};
    try{window.speechSynthesis.speak(utterance);}catch{setNotice('No se pudo escuchar. Puedes seguir con las imágenes y el texto.');}
  }
  return {speak,stop,notice};
}
export type WordSpeech=ReturnType<typeof useWordSpeech>;
export function Listen({ text, speech }: {text:string;speech:WordSpeech}) {return <button type="button" className="word-button is-light" onClick={()=>speech.speak(text)}><Volume2 size={20}/> Escuchar</button>;}
export function WordProgress({ value,total,label='Tu aventura' }: {value:number;total:number;label?:string}) {
  return <div className="word-progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}><span>{label}</span><div aria-hidden="true">{Array.from({length:total},(_,i)=><span key={i} className={i<value?'is-done':''}>{i<value?<Check size={14}/>:i+1}</span>)}</div><span>{value}/{total}</span></div>;
}
export function useRounds(finish:()=>void,total=3) {
  const [round,setRound]=useState(0),[solved,setSolved]=useState(false),[message,setMessage]=useState('');
  function check(ok:boolean) {setSolved(ok);setMessage(ok?'¡Lo lograste!':'Vamos a probar otra vez.');}
  function advance(){if(!solved)return;if(round===total-1)finish();else{setRound(r=>r+1);setSolved(false);setMessage('');}}
  return {round,solved,message,check,advance,setMessage};
}
export function RoundFooter({ state,total=3 }: {state:ReturnType<typeof useRounds>;total?:number}) {
  return <><p className={`word-feedback ${state.solved?'is-good':''}`} role="status">{state.solved&&<Check size={24}/>} {state.message}</p>{state.solved&&<button type="button" className="word-button word-next" onClick={state.advance}>{state.round===total-1?'Terminar juego':'Continuar'}</button>}</>;
}
export function GameInstruction({ children,text,speech }: {children:ReactNode;text:string;speech:WordSpeech}) {
  return <div className="word-instruction"><p>{children}</p><Listen text={text} speech={speech}/></div>;
}
export function Undo({onClick,disabled=false}:{onClick:()=>void;disabled?:boolean}){return <button type="button" className="word-button is-light" onClick={onClick} disabled={disabled}><RotateCcw size={18}/> Cambiar</button>;}
export function WordScene({ id,variant='',style }: {id:WordId;variant?:string;style?:CSSProperties}) {return <div className={`word-scene ${variant}`} style={style}><WordPicture id={id}/></div>;}

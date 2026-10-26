import { useState } from 'react';
import { Hand, Moon, Utensils, Wind, CircleDot } from 'lucide-react';
import { pickRounds,sentenceRounds,shuffle,words,type WordId } from './wordContent';
import { GameInstruction,Hint,Listen,RoundFooter,Undo,useRounds,WordPicture,WordProgress,type WordSpeech } from './WordParts';
import type { WordActivityProps } from './DiscoveryGames';

const syllablePool:WordId[]=['cat','house','ball','apple','rabbit','butterfly'];
export function SyllableGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(mode==='gentle'?syllablePool.slice(0,5):syllablePool));
  const state=useRounds(finish,rounds.length),id=rounds[state.round];
  return mode==='gentle'?<ClapRound key={state.round} id={id} state={state} speech={speech}/>:<SyllablePuzzle key={state.round} id={id} state={state} speech={speech}/>;
}
interface SyllableProps {id:WordId;state:ReturnType<typeof useRounds>;speech:WordSpeech}
function ClapRound({id,state,speech}:SyllableProps) {
  const [claps,setClaps]=useState(0),word=words[id];
  return <><WordProgress value={state.round} total={state.total} label="Palabras con palmadas"/>
    <GameInstruction text={`Escucha ${word.name}. Toca una palmada por cada trocito de la palabra.`} speech={speech}>¿Cuántas palmadas tiene <strong>{word.name.toLowerCase()}</strong>?</GameInstruction>
    <div className="word-puzzle-art"><WordPicture id={id} label/></div>
    <div className="word-center"><Listen text={word.syllables.join('. ')+'.'} speech={speech} label="Escuchar por partes"/></div>
    <div className="word-claps" aria-label={`${claps} palmadas`} aria-live="polite">{claps===0?<span>Toca una vez por cada trocito</span>:Array.from({length:claps},(_,i)=><span className="word-clap-dot" key={i}><Hand size={25}/><small>{i+1}</small></span>)}</div>
    <button type="button" className="word-clap-button" aria-label="Dar una palmada" disabled={state.solved||claps===6} onClick={()=>{setClaps(n=>n+1);state.setMessage('');}}><Hand size={46}/> ¡Palma!</button>
    <div className="word-puzzle-actions"><Undo label="Quitar una palmada" disabled={state.solved||claps===0} onClick={()=>{setClaps(n=>n-1);state.setMessage('');}}/>{!state.solved&&<button type="button" className="word-button" onClick={()=>state.check(claps===word.syllables.length,`¡${word.syllables.length} palmadas! ${word.syllables.join(' · ')}.`, 'Escucha la palabra por partes y cuenta despacito.')}>Comprobar palmadas</button>}</div>
    <Hint text={`${word.name}: ${word.syllables.join(', ')}. Son ${word.syllables.length} trocitos.`} speech={speech} visible={state.hint} reveal={state.showHint}/>
    {state.hint&&<div className="word-syllable-model" aria-label="Trocitos de la palabra">{word.syllables.map((part,i)=><span key={i}>{part}<Hand size={18}/></span>)}</div>}
    <RoundFooter state={state}/></>;
}
function SyllablePuzzle({id,state,speech}:SyllableProps) {
  const word=words[id],[order]=useState(()=>shuffle(word.syllables.map((text,id)=>({id,text})))),[chosen,setChosen]=useState<number[]>([]);
  return <><WordProgress value={state.round} total={state.total} label="Palabras construidas"/>
    <GameInstruction text={`Escucha por partes: ${word.syllables.join('. ')}. Junta los trocitos para formar ${word.name}.`} speech={speech}>Construye <strong>{word.name.toLowerCase()}</strong> con sus trocitos.</GameInstruction>
    <div className="word-puzzle-art"><WordPicture id={id}/></div>
    <ol className="word-puzzle-slots" aria-label="Tu construcción">{word.syllables.map((_,i)=><li key={i}><span className="word-slot-number">{i+1}</span><strong>{chosen[i]===undefined?'…':word.syllables[chosen[i]]}</strong></li>)}</ol>
    <div className="word-chips">{order.map(token=><button type="button" key={token.id} className="word-chip" disabled={state.solved||chosen.includes(token.id)} onClick={()=>{setChosen(previous=>[...previous,token.id]);state.setMessage('');speech.speak(token.text);}}>{token.text}</button>)}</div>
    <div className="word-puzzle-actions"><Undo label="Quitar último trocito" disabled={state.solved||chosen.length===0} onClick={()=>{setChosen(previous=>previous.slice(0,-1));state.setMessage('');}}/>{!state.solved&&<button type="button" className="word-button" disabled={chosen.length!==word.syllables.length} onClick={()=>state.check(chosen.every((id,i)=>id===i),`¡Formaste ${word.name.toLowerCase()}!`,'Escucha el primer trocito. Puedes quitar el último y cambiarlo.')}>Comprobar palabra</button>}</div>
    <Hint text={`${word.name} se forma así: ${word.syllables.join(', ')}.`} speech={speech} visible={state.hint} reveal={state.showHint}/><RoundFooter state={state}/></>;
}

const actionIcons=[Moon,Wind,Utensils,CircleDot];
function SentencePiece({round,index}:{round:typeof sentenceRounds[number];index:number}) {
  if(index===1){const Action=actionIcons[sentenceRounds.indexOf(round)];return <span className="word-action-symbol"><Action size={64} aria-hidden="true"/></span>;}
  return <WordPicture id={index===3?'book':round.pictures[index]}/>;
}
export function SentenceGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(sentenceRounds));const state=useRounds(finish,rounds.length);
  return <SentenceRound key={state.round} round={rounds[state.round]} state={state} speech={speech} mode={mode}/>;
}
function SentenceRound({round,state,speech,mode}:{round:typeof sentenceRounds[number];state:ReturnType<typeof useRounds>;speech:WordSpeech;mode:WordActivityProps['mode']}) {
  const [order]=useState(()=>shuffle(mode==='gentle'?[0,1,2]:[0,1,2,3])),[chosen,setChosen]=useState<number[]>([]);
  const label=(i:number)=>i===3?'con un libro':round.words[i];
  return <><WordProgress value={state.round} total={state.total} label="Frases en el tren"/>
    <GameInstruction text={`Vamos a contar: ${round.phrase} Elige primero quién, después qué hace y al final dónde o qué.`} speech={speech}>Escucha y construye: <strong>{round.phrase}</strong></GameInstruction>
    <ol className="word-puzzle-slots is-train word-sentence-slots" aria-label="Tu frase">{[0,1,2].map(i=><li key={i}><span className="word-slot-number">{['¿Quién?','¿Qué hace?','¿Dónde o qué?'][i]}</span>{chosen[i]===undefined?<span className="word-empty-wagon" aria-hidden="true">…</span>:<><SentencePiece round={round} index={chosen[i]}/><strong>{label(chosen[i])}</strong></>}<span className="word-train-wheels" aria-hidden="true"/></li>)}</ol>
    <div className="word-sentence-choices">{order.map(i=><button type="button" className="word-sentence-piece" key={i} aria-label={label(i)} disabled={state.solved||chosen.includes(i)||chosen.length===3} onClick={()=>{setChosen(previous=>[...previous,i]);state.setMessage('');speech.speak(label(i));}}><SentencePiece round={round} index={i}/><strong>{label(i)}</strong></button>)}</div>
    <div className="word-puzzle-actions"><Undo label="Quitar último vagón" disabled={state.solved||chosen.length===0} onClick={()=>{setChosen(previous=>previous.slice(0,-1));state.setMessage('');}}/>{!state.solved&&<button type="button" className="word-button" disabled={chosen.length!==3} onClick={()=>state.check(chosen.every((id,i)=>id===i),'¡Tu tren cuenta lo que pasa!','¿Quién va primero? Puedes cambiar el último vagón.')}>Comprobar frase</button>}{state.solved&&<Listen label="Escuchar mi frase" text={round.phrase} speech={speech}/>}</div>
    <Hint text={`Primero ${round.words[0].toLowerCase()}, después ${round.words[1]}, al final ${round.words[2]}.`} speech={speech} visible={state.hint} reveal={state.showHint}/><RoundFooter state={state}/></>;
}

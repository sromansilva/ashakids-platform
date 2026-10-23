import { useState } from 'react';
import { Droplets, Moon, Sprout } from 'lucide-react';
import { pickRounds,shuffle } from './wordContent';
import { GameInstruction,Hint,Listen,RoundFooter,Undo,useRounds,WordPicture,WordProgress } from './WordParts';
import type { WordActivityProps } from './DiscoveryGames';

const stories=[
 {title:'La flor del jardín',steps:[{scene:'seed',text:'Plantamos la semilla'},{scene:'water',text:'Regamos con agua'},{scene:'flower',text:'Crece una flor'}]},
 {title:'¡A dormir!',steps:[{scene:'toys',text:'Guardamos los juguetes'},{scene:'book',text:'Leemos un cuento'},{scene:'sleep',text:'Nos acostamos'}]},
 {title:'Una merienda para compartir',steps:[{scene:'wash',text:'Lavamos la manzana'},{scene:'pack',text:'La ponemos en la cesta'},{scene:'share',text:'Compartimos la merienda'}]},
] as const;
type StoryScene=typeof stories[number]['steps'][number]['scene'];
function StoryPicture({scene}:{scene:StoryScene}) {
  return <div className={`word-growth growth-${scene}`} aria-hidden="true">
    {scene==='seed'&&<><span className="word-seed-soil"/><span className="word-seed"/></>}
    {scene==='water'&&<><span className="word-seed-soil"/><Droplets size={58}/><Sprout size={58}/></>}
    {scene==='flower'&&<WordPicture id="flower"/>}
    {scene==='toys'&&<><WordPicture id="ball"/><WordPicture id="car"/><span className="word-toy-box"/></>}
    {scene==='book'&&<WordPicture id="book"/>}
    {scene==='sleep'&&<><WordPicture id="cat"/><span className="word-blanket"/><Moon size={36}/></>}
    {scene==='wash'&&<><WordPicture id="apple"/><Droplets size={45}/></>}
    {scene==='pack'&&<><WordPicture id="apple"/><span className="word-mini-basket"/></>}
    {scene==='share'&&<><WordPicture id="cat"/><WordPicture id="apple"/><WordPicture id="rabbit"/></>}
  </div>;
}
export function StoryGame({finish,speech,mode}:WordActivityProps) {
  const [rounds]=useState(()=>pickRounds(stories,mode==='gentle'?1:3)),state=useRounds(finish,rounds.length);
  return <StoryRound key={state.round} story={rounds[state.round]} state={state} speech={speech}/>;
}
function StoryRound({story,state,speech}:{story:typeof stories[number];state:ReturnType<typeof useRounds>;speech:WordActivityProps['speech']}) {
  const [cards]=useState(()=>shuffle([0,1,2])),[chosen,setChosen]=useState<number[]>([]);
  const narrative=story.steps.map((step,i)=>`${['Primero','Después','Al final'][i]}, ${step.text.toLowerCase()}`).join('. ')+'.';
  return <><WordProgress value={state.round} total={state.total} label="Historias creadas"/>
    <GameInstruction text={`${story.title}. Mira las tres imágenes. ¿Qué pasa primero, después y al final?`} speech={speech}><strong>{story.title}</strong>: ¿qué pasa primero?</GameInstruction>
    <ol className="word-story-order" aria-label="Tu historia">{[0,1,2].map(i=><li key={i}><span>{['Primero','Después','Al final'][i]}</span>{chosen[i]===undefined?<strong>Elige un dibujo</strong>:<><StoryPicture scene={story.steps[chosen[i]].scene}/><strong>{story.steps[chosen[i]].text}</strong></>}</li>)}</ol>
    <div className="word-story-cards">{cards.map(id=><button type="button" key={id} className={`word-story-card ${state.hint&&chosen.every((step,i)=>step===i)&&id===chosen.length?'is-selected':''}`} aria-label={story.steps[id].text} disabled={state.solved||chosen.includes(id)} onClick={()=>{setChosen(previous=>[...previous,id]);state.setMessage('');speech.speak(story.steps[id].text);}}><StoryPicture scene={story.steps[id].scene}/><strong>{story.steps[id].text}</strong></button>)}</div>
    <div className="word-puzzle-actions"><Undo label="Quitar último paso" disabled={state.solved||chosen.length===0} onClick={()=>{setChosen(previous=>previous.slice(0,-1));state.setMessage('');}}/>{!state.solved&&<button type="button" className="word-button" disabled={chosen.length!==3} onClick={()=>state.check(chosen.every((id,i)=>id===i),'¡Tu historia tiene principio y final!','Pensemos juntos: ¿qué necesitamos hacer primero?')}>Comprobar historia</button>}{state.solved&&<Listen label="Escuchar mi historia" text={narrative} speech={speech}/>}</div>
    <Hint text={narrative} speech={speech} visible={state.hint} reveal={state.showHint}/><RoundFooter state={state}/></>;
}

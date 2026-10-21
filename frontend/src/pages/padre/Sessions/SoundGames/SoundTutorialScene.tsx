import { useEffect, useState, type ReactNode } from 'react';
import { Check, Equal, Volume2 } from 'lucide-react';
import { AnimalCard } from './SoundParts';
import { animalById, animals, type AnimalId } from './soundContent';
import type { SoundGameId } from './soundGames';
import type { SoundAudio } from './useSoundAudio';

const animalsForPairing: AnimalId[] = ['cow', 'cat', 'dog'];
const animalOptions: AnimalId[] = ['dog', 'cow', 'chick', 'cat'];
const withArticle = (id: AnimalId) => id === 'cow' ? 'a la vaca' : `al ${animalById(id).name.toLowerCase()}`;
const demoCues: Record<SoundGameId, readonly [string, string, string]> = {
  explore: ['Mira a los amigos.', 'Toca uno para escucharlo.', 'Descubre los cuatro sonidos.'],
  identify: ['Primero escucha la pista.', 'Busca quién hizo ese sonido.', 'Toca al animal correcto.'],
  pairs2: ['Escucha una ficha.', 'Encuentra a su amigo.', 'Une las dos parejas.'],
  pairs3: ['Escucha una ficha.', 'Encuentra a su amigo.', 'Une las tres parejas.'],
  same: ['Escucha el primer sonido.', 'Ahora escucha el segundo.', 'Elige: ¿iguales o diferentes?'],
  sequence: ['El tren escucha a sus amigos.', 'Recuerda quién sonó primero.', 'Después, llena los vagones en orden.'],
  count: ['El pollito hace un sonido.', 'Cada sonido cuenta una vez.', 'Al final, elige cuántos oíste.'],
  memory: ['Voltea una ficha y escucha.', 'Voltea otra para comparar.', 'Guarda en tu memoria cada pareja.'],
  missing: ['Escucha a los amigos.', 'Recuerda quiénes sí sonaron.', 'Busca al que quedó en silencio.'],
  order: ['Escucha la fila completa.', 'Fíjate quién aparece primero.', 'También puedes buscar al último.'],
  odd: ['Escucha el coro.', 'Dos amigos repiten su sonido.', 'Encuentra al que suena distinto.'],
};

function Creature({ id, audio, label, ...props }: {
  id: AnimalId; audio: SoundAudio; label?: string; completed?: boolean; active?: boolean; disabled?: boolean; onClick?: () => void;
}) {
  return <AnimalCard animal={animalById(id)} label={label} active={props.active ?? audio.active === id} completed={props.completed} disabled={!!props.disabled || audio.muted || audio.loading || !!audio.active} onClick={props.onClick ?? (() => void audio.play(id))}/>;
}

function SmallPrompt({ children }: { children: ReactNode }) {
  return <p className="sound-tutorial-demo-prompt" aria-live="polite">{children}</p>;
}

function ExploreScene({ audio }: { audio: SoundAudio }) {
  const [visited, setVisited] = useState<AnimalId[]>([]);
  return <>
    <SmallPrompt>Toca a los amigos para descubrir cómo suena cada uno.</SmallPrompt>
    <div className="sound-tutorial-animal-grid">{animals.map(animal => <Creature key={animal.id} id={animal.id} audio={audio} completed={visited.includes(animal.id)} onClick={() => { setVisited(current => current.includes(animal.id) ? current : [...current, animal.id]); void audio.play(animal.id); }}/>)}</div>
    <span className="sound-tutorial-progress-note">{visited.length === animals.length ? '¡Ya conoces a todos!' : `${visited.length} de ${animals.length} amigos escuchados`}</span>
  </>;
}

function IdentifyScene({ audio }: { audio: SoundAudio }) {
  const [ready, setReady] = useState(false);
  const [answer, setAnswer] = useState<AnimalId | null>(null);
  return <>
    <SmallPrompt>{answer === 'cat' ? '¡Lo encontraste! Era el gato.' : answer ? 'Ese amigo hizo otro sonido. ¡Prueba de nuevo!' : 'Escucha la pista y encuentra al gato.'}</SmallPrompt>
    <button type="button" className="sound-tutorial-listen" disabled={audio.muted || audio.loading || !!audio.active} onClick={async () => setReady(await audio.play('cat'))}><Volume2 size={24}/> Escuchar la pista</button>
    <div className="sound-tutorial-animal-grid is-compact">{animalOptions.map(id => <Creature key={id} id={id} audio={audio} disabled={!ready || audio.muted} completed={answer === id && id === 'cat'} onClick={() => { setAnswer(id); if (id !== 'cat') void audio.play(id); }}/>)}</div>
  </>;
}

function PairingScene({ audio, count }: { audio: SoundAudio; count: 2 | 3 }) {
  const [selected, setSelected] = useState<AnimalId | null>(null);
  const [matched, setMatched] = useState<AnimalId[]>([]);
  const ids = animalsForPairing.slice(0, count);
  return <>
    <SmallPrompt>{matched.length === count ? '¡Todas las fichas llegaron a su amigo!' : selected ? `Ahora toca ${withArticle(selected)} para unir la pareja.` : 'Escucha una ficha y toca al amigo que hace ese sonido.'}</SmallPrompt>
    <div className="sound-tutorial-match-board"><svg className="sound-tutorial-match-thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M 37 26 C 47 18, 54 34, 64 28"/></svg><div className="sound-tutorial-token-list" aria-label="Fichas con sonido">{ids.map((id, index) => <button type="button" className={`sound-tutorial-token ${selected === id ? 'is-selected' : ''} ${matched.includes(id) ? 'is-complete' : ''}`} key={id} disabled={audio.muted || audio.loading || !!audio.active || matched.includes(id)} aria-pressed={selected === id} onClick={async () => { if (await audio.play(id)) setSelected(id); }}><Volume2 size={20}/><span>Ficha {index + 1}</span>{matched.includes(id) && <Check size={17}/>}</button>)}</div>
      <div className="sound-tutorial-animal-grid is-compact">{ids.map(id => <Creature key={id} id={id} audio={audio} disabled={audio.muted || !selected || matched.includes(id)} completed={matched.includes(id)} onClick={() => { if (!selected) return; if (selected === id) { setMatched(current => [...current, id]); setSelected(null); } else { setSelected(null); void audio.play(id); } }}/>)}</div></div>
  </>;
}

function SameScene({ audio }: { audio: SoundAudio }) {
  const [heard, setHeard] = useState<AnimalId[]>([]);
  const [answer, setAnswer] = useState<'same' | 'different' | null>(null);
  const pair: AnimalId[] = ['cow', 'dog'];
  return <>
    <SmallPrompt>{answer === 'different' ? '¡Correcto! La vaca y el perro suenan diferente.' : answer ? 'Esta vez los sonidos son diferentes. Inténtalo otra vez.' : 'Escucha los dos amigos y decide si suenan igual.'}</SmallPrompt>
    <div className="sound-tutorial-sound-pair">{pair.map((id, index) => <button type="button" className={`sound-tutorial-listen ${heard.includes(id) ? 'is-heard' : ''}`} key={id} disabled={audio.muted || audio.loading || !!audio.active} onClick={async () => { if (await audio.play(id)) setHeard(current => current.includes(id) ? current : [...current, id]); }}><Volume2 size={22}/><span>Sonido {index + 1}<strong>{animalById(id).name}</strong></span>{heard.includes(id) && <Check size={18}/>}</button>)}</div>
    <div className="sound-tutorial-answer-row"><button type="button" className="sound-tutorial-answer" disabled={heard.length < 2} aria-label="Suenan iguales" onClick={() => setAnswer('same')}><Equal size={26}/> Iguales</button><button type="button" className="sound-tutorial-answer" disabled={heard.length < 2} onClick={() => setAnswer('different')}><span aria-hidden="true">≠</span> Diferentes</button></div>
  </>;
}

function TrainScene({ audio }: { audio: SoundAudio }) {
  const sequence: AnimalId[] = ['cow', 'cat', 'dog'];
  const [chosen, setChosen] = useState<AnimalId[]>([]);
  const [heard, setHeard] = useState(false);
  const next = sequence[chosen.length];
  return <>
    <SmallPrompt>{chosen.length === sequence.length ? '¡Todos subieron al tren en el orden correcto!' : heard ? 'Ahora toca los amigos en ese mismo orden para llenar los vagones.' : 'Escucha el tren y luego acomoda a los amigos en sus vagones.'}</SmallPrompt>
    <button type="button" className="sound-tutorial-listen" disabled={audio.muted || audio.loading || !!audio.active} onClick={async () => { for (const id of sequence) if (!await audio.play(id)) return; setHeard(true); }}><Volume2 size={23}/> Escuchar el tren</button>
    <div className="sound-tutorial-train-wrap"><div className="sound-tutorial-locomotive" aria-label="Locomotora"><span aria-hidden="true">🚂</span><small>¡Chucu!</small></div><ol className="sound-tutorial-train" aria-label="Vagones del tren de sonidos">{sequence.map((_, index) => <li key={index} aria-label={`Vagón ${index + 1}`} className={chosen[index] ? 'is-filled' : ''}><span>{index + 1}</span>{chosen[index] ? <img src={animalById(chosen[index]).image} alt={animalById(chosen[index]).name}/> : <span className="sound-tutorial-empty-car">?</span>}</li>)}</ol></div>
    <div className="sound-tutorial-choice-row">{[...sequence].reverse().map(id => <Creature key={id} id={id} audio={audio} disabled={!heard || chosen.includes(id) || chosen.length === sequence.length} completed={chosen.includes(id)} onClick={async () => { if (await audio.play(id)) setChosen(current => [...current, id]); }}/>)}</div>
    {chosen.length > 0 && chosen.at(-1) !== sequence[chosen.length - 1] && <button type="button" className="sound-tutorial-undo" onClick={() => setChosen(current => current.slice(0, -1))}>Quitar el último amigo</button>}
    {next && <span className="sound-tutorial-progress-note">Pista: busca al {animalById(next).name.toLowerCase()} para el siguiente vagón.</span>}
  </>;
}

function CountScene({ audio }: { audio: SoundAudio }) {
  const [count, setCount] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  return <>
    <SmallPrompt>{answer === 3 ? '¡Muy bien! Escuchaste tres sonidos.' : answer ? 'Casi. Escucha otra vez y cuenta cada sonido.' : 'Pulsa tres veces para practicar: cuenta cada sonido del pollito.'}</SmallPrompt>
    <div className="sound-tutorial-count-button"><Creature id="chick" audio={audio} onClick={async () => { if (await audio.play('chick')) setCount(value => Math.min(value + 1, 3)); }}/><strong>Escuchar un sonido</strong><span className="sound-tutorial-count-dots" aria-label={`${count} sonidos escuchados`}>{[0, 1, 2].map(index => <i key={index} className={index < count ? 'is-on' : ''}>♪</i>)}</span></div>
    <div className="sound-tutorial-answer-row">{[1, 2, 3].map(value => <button type="button" className="sound-tutorial-number" key={value} disabled={count < 3} onClick={() => setAnswer(value)}>{value}<small>{value === 1 ? 'vez' : 'veces'}</small></button>)}</div>
  </>;
}

function MemoryScene({ audio }: { audio: SoundAudio }) {
  const cards: AnimalId[] = ['cow', 'cat', 'cow', 'cat'];
  const [opened, setOpened] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [message, setMessage] = useState('Voltea dos fichas y escucha si son pareja.');
  return <>
    <SmallPrompt>{matched.length === 4 ? '¡Encontraste todas las parejas!' : message}</SmallPrompt>
    <div className="sound-tutorial-memory-grid">{cards.map((id, index) => { const visible = opened.includes(index) || matched.includes(index); return <button type="button" className={`sound-tutorial-memory-card ${matched.includes(index) ? 'is-complete' : ''}`} key={index} aria-label={visible ? `Ficha ${index + 1}: ${animalById(id).name}` : `Voltear ficha ${index + 1}`} aria-pressed={visible} disabled={audio.muted || audio.loading || !!audio.active || opened.includes(index) || matched.includes(index) || opened.length === 2} onClick={async () => { if (!await audio.play(id)) return; if (opened.length === 1) { const first = opened[0]; if (cards[first] === id) { setMatched(current => [...current, first, index]); setOpened([]); setMessage('¡Son pareja! Busca otra.'); } else { setOpened([index]); setMessage('No son iguales. Busca otra pareja.'); } } else setOpened([index]); }}>
      {visible ? <img src={animalById(id).image} alt=""/> : <><Volume2 size={29}/><span>Ficha {index + 1}</span></>}{matched.includes(index) && <Check size={17}/>}</button>; })}</div>
  </>;
}

function MissingScene({ audio }: { audio: SoundAudio }) {
  const [heard, setHeard] = useState(false);
  const [answer, setAnswer] = useState<AnimalId | null>(null);
  return <>
    <SmallPrompt>{answer === 'dog' ? '¡Lo descubriste! El perro no sonó.' : answer ? 'Ese amigo sí hizo un sonido. ¿Quién falta?' : 'Escucha a los amigos y descubre quién se quedó callado.'}</SmallPrompt>
    <button type="button" className="sound-tutorial-listen" disabled={audio.muted || audio.loading || !!audio.active} onClick={async () => { const first = await audio.play('cow'); if (first) setHeard(await audio.play('cat')); }}><Volume2 size={23}/> Escuchar a los amigos</button>
    <div className="sound-tutorial-animal-grid is-compact">{animalOptions.map(id => <Creature key={id} id={id} audio={audio} disabled={!heard || audio.muted} completed={answer === 'dog' && id === answer} onClick={() => { setAnswer(id); if (id !== 'dog') void audio.play(id); }}/>)}</div>
  </>;
}

function OrderScene({ audio }: { audio: SoundAudio }) {
  const sequence: AnimalId[] = ['cat', 'cow', 'dog'];
  const [position, setPosition] = useState<0 | 2>(0);
  const [answer, setAnswer] = useState<AnimalId | null>(null);
  const [heard, setHeard] = useState(false);
  return <>
    <SmallPrompt>{answer === sequence[position] ? `¡Sí! ${animalById(answer).name} sonó ${position === 0 ? 'primero' : 'al final'}.` : answer ? 'Mira la fila de sonidos y vuelve a probar.' : 'Escucha la fila y busca quién sonó en ese lugar.'}</SmallPrompt>
    <button type="button" className="sound-tutorial-listen" disabled={audio.muted || audio.loading || !!audio.active} onClick={async () => { for (const id of sequence) if (!await audio.play(id)) return; setHeard(true); }}><Volume2 size={23}/> Escuchar la fila</button>
    <div className="sound-tutorial-order-row" aria-label="Fila de sonidos">{sequence.map((id, index) => <div className="sound-tutorial-order-place" key={id}><span>{index === 0 ? 'Primero' : index === 2 ? 'Al final' : 'En medio'}</span><img src={animalById(id).image} alt={animalById(id).name}/></div>)}</div>
    <div className="sound-tutorial-answer-row"><button type="button" className={`sound-tutorial-position ${position === 0 ? 'is-selected' : ''}`} aria-pressed={position === 0} onClick={() => { setPosition(0); setAnswer(null); }}>¿Quién fue primero?</button><button type="button" className={`sound-tutorial-position ${position === 2 ? 'is-selected' : ''}`} aria-pressed={position === 2} onClick={() => { setPosition(2); setAnswer(null); }}>¿Quién fue al final?</button></div>
    <div className="sound-tutorial-choice-row">{(['cat', 'cow', 'dog'] as AnimalId[]).map(id => <Creature key={id} id={id} audio={audio} disabled={!heard} completed={answer === id && answer === sequence[position]} onClick={() => { setAnswer(id); if (id !== sequence[position]) void audio.play(id); }}/>)}</div>
  </>;
}

function OddScene({ audio }: { audio: SoundAudio }) {
  const chorus: AnimalId[] = ['cow', 'dog', 'cow'];
  const [heard, setHeard] = useState(false);
  const [answer, setAnswer] = useState<AnimalId | null>(null);
  return <>
    <SmallPrompt>{answer === 'dog' ? '¡Encontraste al intruso! El perro suena diferente.' : answer ? 'Ese amigo sí se repite en el coro. Busca el sonido distinto.' : 'Escucha el coro: dos amigos suenan igual y uno diferente.'}</SmallPrompt>
    <button type="button" className="sound-tutorial-listen" disabled={audio.muted || audio.loading || !!audio.active} onClick={async () => { for (const id of chorus) if (!await audio.play(id)) return; setHeard(true); }}><Volume2 size={23}/> Escuchar el coro</button>
    <div className="sound-tutorial-chorus" aria-label="Tres sonidos del coro">{chorus.map((id, index) => <span key={index}>{index + 1}<img src={animalById(id).image} alt={animalById(id).name}/></span>)}</div>
    <div className="sound-tutorial-choice-row">{animalOptions.slice(0, 3).map(id => <Creature key={id} id={id} audio={audio} disabled={!heard || audio.muted} completed={answer === 'dog' && id === answer} onClick={() => { setAnswer(id); if (id !== 'dog') void audio.play(id); }}/>)}</div>
  </>;
}

export function SoundTutorialScene({ gameId, audio }: { gameId: SoundGameId; audio: SoundAudio }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setPhase(0);
    const timer = window.setInterval(() => setPhase(value => (value + 1) % 3), 2100);
    return () => window.clearInterval(timer);
  }, [gameId]);
  let scene: ReactNode;
  switch (gameId) {
    case 'explore': scene = <ExploreScene audio={audio}/>; break;
    case 'identify': scene = <IdentifyScene audio={audio}/>; break;
    case 'pairs2': scene = <PairingScene key={gameId} audio={audio} count={2}/>; break;
    case 'pairs3': scene = <PairingScene key={gameId} audio={audio} count={3}/>; break;
    case 'same': scene = <SameScene audio={audio}/>; break;
    case 'sequence': scene = <TrainScene audio={audio}/>; break;
    case 'count': scene = <CountScene audio={audio}/>; break;
    case 'memory': scene = <MemoryScene audio={audio}/>; break;
    case 'missing': scene = <MissingScene audio={audio}/>; break;
    case 'order': scene = <OrderScene audio={audio}/>; break;
    case 'odd': scene = <OddScene audio={audio}/>; break;
  }
  return <div key={gameId} className={`sound-tutorial-demo sound-tutorial-demo-${gameId}`} data-demo-phase={phase} data-testid="sound-tutorial-scene">
    <span className="sound-tutorial-auto-cue" aria-hidden="true"><span>Así se juega</span>{demoCues[gameId][phase]}</span>
    {scene}
  </div>;
}

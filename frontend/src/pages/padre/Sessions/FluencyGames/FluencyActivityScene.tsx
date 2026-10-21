import { useState } from 'react';
import { ArrowRight, Ear, Drum, Heart, MessageCircle, Pause, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { WordPicture } from '../WordGames/WordParts';
import { fluencyBeatPrompts, fluencyBeatSyllables, fluencyBeatWordPrompt, type FluencyGameId } from './fluencyContent';

const turnSteps = [
  { id: 'listen', label: 'Escuchar', Icon: Ear },
  { id: 'wait', label: 'Esperar', Icon: Pause },
  { id: 'respond', label: 'Responder', Icon: MessageCircle },
] as const;

function BeatGame({ complete, onSpeak }: { complete: () => void; onSpeak: (text: string) => void }) {
  const [count, setCount] = useState(0);
  const [heard, setHeard] = useState(false);
  const [wordHeard, setWordHeard] = useState(false);
  const current = fluencyBeatSyllables[count];
  return <>
    <div className="fluency-picture"><WordPicture id="butterfly" label/></div>
    <p className="fluency-prompt">Toca el tambor para escuchar cada trocito. Después, repítelo en voz alta si quieres.</p>
    <div className="fluency-syllable-row" aria-label={`Trocito ${Math.min(count + 1, fluencyBeatSyllables.length)} de ${fluencyBeatSyllables.length}`}>
      {fluencyBeatSyllables.map((part, index) => <button className={`fluency-syllable-drum ${index < count ? 'is-done' : ''} ${index === count ? 'is-current' : ''}`} type="button" key={part} disabled={index !== count} aria-label={`Tambor ${index + 1}: escuchar ${part}`} onClick={() => { onSpeak(fluencyBeatPrompts[index]); setHeard(true); }}><Drum aria-hidden="true"/><span>{index < count ? part : index === count ? part : '· · ·'}</span></button>)}
    </div>
    {current && <p className="fluency-feedback" aria-live="polite">{heard ? `Ahora puedes repetir «${current}» en voz alta, si quieres.` : `Toca el tambor ${current} para escucharlo.`}</p>}
    {current && heard && <div className="fluency-action-row"><button className="fluency-secondary" type="button" onClick={() => onSpeak(fluencyBeatPrompts[count])}><Volume2/> Escuchar «{current}» otra vez</button><button className="fluency-action" type="button" onClick={() => { setCount(value => value + 1); setHeard(false); }}><ArrowRight/> Siguiente trocito</button></div>}
    {count === fluencyBeatSyllables.length && <><p className="fluency-feedback">¡Mariposa! Ya exploraste todos sus trocitos.</p><div className="fluency-action-row"><button className="fluency-secondary" type="button" onClick={() => { onSpeak(fluencyBeatWordPrompt); setWordHeard(true); }}><Volume2/> Escuchar «mariposa» completa</button><button className="fluency-secondary" type="button" onClick={() => { setCount(0); setHeard(false); setWordHeard(false); }}><RotateCcw/> Repetir la ronda</button></div><p className="fluency-feedback" aria-live="polite">{wordHeard ? 'Si quieres, repite «mariposa» completa.' : 'Puedes escuchar la palabra completa o terminar la ronda.'}</p><button className="fluency-action fluency-next" type="button" onClick={complete}>¡Terminé! <Heart/></button></>}
  </>;
}

function PauseGame({ complete, bridge = false }: { complete: () => void; bridge?: boolean }) {
  const [placed, setPlaced] = useState(false);
  return <>
    <p className="fluency-prompt">{bridge ? 'Une estas dos ideas con un pequeño espacio.' : 'Deja una islita entre las dos ideas.'}</p>
    <div className={`fluency-sentence ${placed ? 'has-pause' : ''}`}><span>Cuando llega mi turno</span><button type="button" aria-label={placed ? 'Quitar la pausa' : 'Colocar una pausa'} aria-pressed={placed} onClick={() => setPlaced(value => !value)}>{placed ? bridge ? '🌉' : '🏝️' : '＋'}</button><span>comparto mi idea</span></div>
    <p className="fluency-feedback" aria-live="polite">{placed ? 'Las ideas están conectadas y tienen espacio.' : 'Toca el espacio para colocar tu puente.'}</p>
    {placed && <button className="fluency-action fluency-next" type="button" onClick={complete}>¡Sigamos el camino! <ArrowRight/></button>}
  </>;
}

function TurnGame({ complete, simple = false }: { complete: () => void; simple?: boolean }) {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const labels = simple ? ['Escuchar', 'Esperar', 'Compartir'] : turnSteps.map(item => item.label);
  const Icon = simple ? [Ear, Pause, Heart][step] : turnSteps[step].Icon;
  return <>
    <div className="fluency-friend"><span aria-hidden="true">🐰</span><p>{step === 0 ? 'Quiero contarte algo…' : step === 1 ? 'Mi amigo sigue hablando.' : 'Ya terminó. Ahora podemos compartir.'}</p></div>
    <div className="fluency-turn-path" aria-label={`Momento ${step + 1} de 3`}>{labels.map((label, index) => <span className={index <= step ? 'is-active' : ''} key={label}>{label}</span>)}</div>
    <button className="fluency-action" type="button" onClick={() => { if (step === 2) complete(); else { setStep(value => value + 1); setMessage('¡Muy bien! El turno avanza con calma.'); } }}><Icon/> {labels[step]} <ArrowRight/></button>
    <p className="fluency-feedback" aria-live="polite">{message || 'Toca el botón cuando quieras avanzar.'}</p>
  </>;
}

function TrainGame({ complete }: { complete: () => void }) {
  const [order, setOrder] = useState<number[]>([]);
  const [hint, setHint] = useState('El primer vagón escucha.');
  const nextIndex = order.length;
  function choose(index: number) {
    const expected = [0, 1, 2][nextIndex];
    if (index !== expected) { setHint('Prueba con el vagón que escucha primero.'); return; }
    const next = [...order, index]; setOrder(next);
    setHint(next.length === 1 ? 'Ahora el tren hace una pausa para esperar.' : next.length === 2 ? '¡Bien! El último vagón puede responder.' : '¡El tren de la conversación está listo!');
  }
  return <>
    <p className="fluency-prompt">Toca los vagones en el orden de una conversación.</p>
    <ol className="fluency-train-cars">{turnSteps.map((part, index) => { const Icon = part.Icon; return <li key={part.id} className={order.includes(index) ? 'is-filled' : ''}><span>{index + 1}</span>{order.includes(index) ? <><Icon/><strong>{part.label}</strong></> : <i>?</i>}</li>; })}</ol>
    <div className="fluency-choice-row">{turnSteps.map((part, index) => { const Icon = part.Icon; return <button type="button" key={part.id} disabled={order.includes(index)} onClick={() => choose(index)}><Icon/>{part.label}</button>; })}</div>
    <p className="fluency-feedback" role="status">{hint}</p>
    {order.length === 3 && <button className="fluency-action fluency-next" type="button" onClick={complete}>¡Todos subieron! <ArrowRight/></button>}
  </>;
}

function EchoGame({ complete }: { complete: () => void }) {
  const parts = ['Hola,', 'amiga,', '¿jugamos?'];
  const [chosen, setChosen] = useState<string[]>([]);
  return <>
    <p className="fluency-prompt">Sigue el eco tocando cada burbuja en orden. Puedes ir a tu ritmo.</p>
    <div className="fluency-echo-line" aria-live="polite">{parts.map((part, index) => <span className={index < chosen.length ? 'is-done' : ''} key={part}>{index < chosen.length ? chosen[index] : '…'}</span>)}</div>
    <div className="fluency-choice-row">{parts.map((part, index) => <button type="button" key={part} disabled={chosen.length !== index} onClick={() => setChosen(value => [...value, part])}><MessageCircle/>{part}</button>)}</div>
    {chosen.length === parts.length && <button className="fluency-action fluency-next" type="button" onClick={complete}>¡El eco llegó! <ArrowRight/></button>}
  </>;
}

function ChatGame({ complete, listenOnly = false }: { complete: () => void; listenOnly?: boolean }) {
  const [ready, setReady] = useState(false);
  const [reply, setReply] = useState('');
  return <>
    <div className="fluency-friend"><span aria-hidden="true">🐱</span><p>Me gusta jugar con el tambor.</p></div>
    {!ready ? <button type="button" className="fluency-action" onClick={() => setReady(true)}><Ear/> Ya terminé de escuchar</button> : <>
      <p className="fluency-prompt">{listenOnly ? 'Ahora es tu turno de responder.' : '¿Qué te gustaría compartir?'}</p>
      <div className="fluency-choice-row"><button type="button" onClick={() => setReply('¡Cuéntame más!')}>¡Cuéntame más!</button><button type="button" onClick={() => setReply('A mí también me gusta.')}>A mí también me gusta.</button></div>
      {reply && <div className="fluency-child-reply"><span aria-hidden="true">🦊</span><p>{reply}</p><button className="fluency-action" type="button" onClick={complete}>Compartimos el turno <Heart/></button></div>}
    </>}
  </>;
}

function ListenGame({ complete }: { complete: () => void }) {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState('');
  return <>
    <div className="fluency-friend"><span aria-hidden="true">🐶</span><p>Fui al parque y vi una mariposa.</p></div>
    {!ready ? <button type="button" className="fluency-action" onClick={() => setReady(true)}><Ear/> Ya terminé de escuchar</button> : <>
      <p className="fluency-prompt">¿Qué vio tu amigo en el parque?</p>
      <div className="fluency-choice-row">{(['butterfly', 'flower', 'car'] as const).map((id, index) => <button type="button" key={id} aria-pressed={choice === id} onClick={() => setChoice(id)}><WordPicture id={id} label={false}/>{['Una mariposa', 'Una flor', 'Un carro'][index]}</button>)}</div>
      {choice && <><p className="fluency-feedback" role="status">{choice === 'butterfly' ? '¡Sí! Escuchaste toda la idea.' : 'Escuchemos la idea otra vez: fue al parque y vio una mariposa.'}</p>{choice === 'butterfly' && <button className="fluency-action fluency-next" type="button" onClick={complete}>Ahora puedo responder <Heart/></button>}</>}
    </>}
  </>;
}

function WordPathGame({ complete }: { complete: () => void }) {
  const words = ['Hoy', 'yo', 'elijo', 'mi', 'ritmo'];
  const [step, setStep] = useState(0);
  return <>
    <p className="fluency-prompt">Avanza una piedra cada vez. Haz una pausa si quieres.</p>
    <div className="fluency-path"><span className="fluency-path-friend">🐌</span>{words.map((word, index) => <button type="button" key={word} className={index < step ? 'is-done' : ''} disabled={index !== step} onClick={() => setStep(value => value + 1)}>{index < step ? word : '· · ·'}</button>)}</div>
    <p className="fluency-feedback">{step === words.length ? '¡Llegaste sin correr!' : `${step} de ${words.length} pasos. Tú eliges cuándo seguir.`}</p>
    {step === words.length && <button className="fluency-action fluency-next" type="button" onClick={complete}>Llegué a mi ritmo <Heart/></button>}
  </>;
}

function StoryGame({ complete }: { complete: () => void }) {
  const [step, setStep] = useState(0);
  const scenes = [{ id: 'sun' as const, text: 'Sale el sol.' }, { id: 'flower' as const, text: 'Crece una flor.' }, { id: 'butterfly' as const, text: 'Llega una mariposa.' }];
  return <>
    <p className="fluency-prompt">Cada amigo añade una idea para contar el cuento.</p>
    <div className="fluency-story-cards">{scenes.map((scene, index) => <button type="button" key={scene.id} className={index < step ? 'is-done' : ''} disabled={index !== step} onClick={() => setStep(value => value + 1)}><WordPicture id={scene.id} label={index < step}/><span>{index < step ? scene.text : index === step ? 'Añadir esta idea' : 'Después…'}</span></button>)}</div>
    {step === scenes.length && <><p className="fluency-feedback">¡El cuento creció con las ideas de todos!</p><button className="fluency-action fluency-next" type="button" onClick={complete}>¡Fin del cuento! <Sparkles/></button></>}
  </>;
}

function RoundGame({ complete }: { complete: () => void }) {
  const friends = ['🐰', '🦊', '🐻'];
  const [step, setStep] = useState(0);
  return <>
    <p className="fluency-prompt">Toca a cada amigo para pasarle el turno.</p>
    <div className="fluency-friend-circle">{friends.map((friend, index) => <button type="button" className={index < step ? 'is-done' : ''} disabled={index !== step} key={friend} onClick={() => setStep(value => value + 1)}><span>{friend}</span><small>{index < step ? 'Compartió' : index === step ? 'Tu turno' : 'Después'}</small></button>)}</div>
    {step === friends.length && <button className="fluency-action fluency-next" type="button" onClick={complete}>¡La ronda terminó! <Heart/></button>}
  </>;
}

export function FluencyActivityScene({ gameId, onComplete, onSpeak }: { gameId: FluencyGameId; onComplete: () => void; onSpeak: (text: string) => void }) {
  switch (gameId) {
    case 'beat': return <BeatGame complete={onComplete} onSpeak={onSpeak}/>;
    case 'islands': return <PauseGame complete={onComplete}/>;
    case 'turns': return <TurnGame complete={onComplete}/>;
    case 'train': return <TrainGame complete={onComplete}/>;
    case 'echo': return <EchoGame complete={onComplete}/>;
    case 'chat': return <ChatGame complete={onComplete}/>;
    case 'wordpath': return <WordPathGame complete={onComplete}/>;
    case 'story': return <StoryGame complete={onComplete}/>;
    case 'listen': return <ListenGame complete={onComplete}/>;
    case 'bridge': return <PauseGame complete={onComplete} bridge/>;
    case 'round': return <RoundGame complete={onComplete}/>;
  }
}

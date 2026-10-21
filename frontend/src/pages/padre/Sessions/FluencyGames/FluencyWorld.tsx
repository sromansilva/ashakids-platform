import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, Heart, RotateCcw, Shell, Sparkles, Sprout, Volume2 } from 'lucide-react';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { WordPicture } from '../WordGames/WordParts';
import { fluencyGames, type FluencyGameId } from './fluencyContent';
import { selectFluencyGames } from './fluencySelection';
import { FluencyGameDemo } from './FluencyGameDemo';
import { FluencyActivityScene } from './FluencyActivityScene';
import { useFluencySpeech } from './useFluencySpeech';
import './fluency-world.css';

function FluencyTutorial({ game, speech, onStart }: {
  game: typeof fluencyGames[number]; speech: ReturnType<typeof useFluencySpeech>; onStart: () => void;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [game.id]);
  return <section className="fluency-tutorial" aria-label={`Tutorial: ${game.title}`}>
    <header><div><span>Antes de empezar</span><h3>Así se juega: {game.title}</h3></div>
      <button type="button" className="fluency-secondary" onClick={() => speech.speak(`${game.goal} ${game.steps.join(' ')}`)}><Volume2/> Escuchar instrucciones</button>
    </header>
    <div className="fluency-tutorial-grid">
      <div className="fluency-demo-panel"><span className="fluency-demo-label">Mira cómo se juega</span><FluencyGameDemo gameId={game.id}/><p>Se muestra automáticamente. Puedes tocar cuando quieras.</p></div>
      <div className="fluency-tutorial-guide">
        <p className="fluency-tutorial-goal">{game.goal}</p>
        <div className="fluency-tutorial-steps" role="group" aria-label="Pasos del juego">{game.steps.map((text, index) => <button type="button" key={text} aria-pressed={step === index} onClick={() => setStep(index)}><span>{index < step ? <Check size={16}/> : index + 1}</span><span>{text}</span></button>)}</div>
        <div className="fluency-tutorial-actions"><button type="button" className="fluency-secondary" disabled={step === 0} onClick={() => setStep(value => value - 1)}>Atrás</button>
          {step < game.steps.length - 1 && <button type="button" className="fluency-secondary" onClick={() => setStep(value => value + 1)}>Siguiente paso <ArrowRight/></button>}
          <button type="button" className="fluency-action" onClick={onStart}>¡Vamos a jugar! <ArrowRight/></button>
        </div>
      </div>
    </div>
  </section>;
}

export function FluencyWorld({ back, legacy, birthDate }: { back: () => void; legacy: () => void; birthDate?: string }) {
  const selection = selectFluencyGames(birthDate);
  const [active, setActive] = useState<FluencyGameId | null>(null);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const [visited, setVisited] = useState<FluencyGameId[]>([]);
  const speech = useFluencySpeech();
  const heading = useRef<HTMLHeadingElement>(null);
  const game = fluencyGames.find(item => item.id === active);
  const menu = catalog ? fluencyGames : selection.games;
  const visitedCount = menu.filter(item => visited.includes(item.id)).length;
  useEffect(() => { if (active) heading.current?.focus(); }, [active, started, complete]);

  function open(id: FluencyGameId | null) {
    speech.stop(); setActive(id); setStarted(false); setComplete(false);
    const selected = fluencyGames.find(item => item.id === id);
    if (selected) speech.speak(`${selected.goal} ${selected.steps.join(' ')}`);
  }
  function finish() { if (active) setVisited(previous => previous.includes(active) ? previous : [...previous, active]); setComplete(true); }
  function repeat() { speech.stop(); setComplete(false); setStarted(true); }

  return <section className="fluency-world" aria-label="Ritmo de las Palabras" style={game ? { '--fluency-accent': game.color } as CSSProperties : undefined}>
    <nav className="fluency-toolbar" aria-label="Navegación del mundo"><button type="button" onClick={() => { speech.stop(); active ? open(null) : back(); }}><ArrowLeft/> {active ? 'Volver a los juegos' : 'Volver a mundos'}</button>
      <span><Compass/>{game ? game.action : 'Un mundo para compartir a tu ritmo'}</span><button type="button" onClick={() => speech.speak('Hola. Bienvenido al Ritmo de las Palabras. Aquí compartimos ideas a nuestro propio ritmo.')}><Volume2/> Escuchar a ASHA</button></nav>
    <header className={`fluency-hero ${active ? 'is-playing' : ''}`}><div><p className="fluency-world-name">Mundo de Fluidez</p><h2 ref={heading} tabIndex={-1}>{game?.title ?? 'Ritmo de las Palabras'}</h2><p>{game?.detail ?? 'Un lugar tranquilo para jugar con palabras, ideas y turnos.'}</p></div>
      {!active && <PublicIllustration src="/illustrations/world-fluidez-v54.png" alt="" width={220} height={150}/>}</header>
    {speech.notice && <p className="fluency-notice" role="status">{speech.notice}</p>}
    {!active ? <>
      <div className="fluency-welcome"><p><Sprout/> Elige una aventura. Aquí no hay cronómetros ni respuestas sobre cómo debe sonar tu voz.</p>
        <div className="fluency-session-progress"><Shell/><span>Tu ronda de hoy</span><strong>{visitedCount}/{menu.length} juegos visitados</strong></div>
      </div>
      {catalog && <button type="button" className="fluency-secondary" onClick={() => setCatalog(false)}>Volver a mis nueve juegos</button>}
      <div className="fluency-menu" aria-label="Juegos de Ritmo de las Palabras">{menu.map((item, index) => <button type="button" key={item.id} style={{ '--fluency-card': item.color } as CSSProperties} onClick={() => open(item.id)}>
        <span className="fluency-card-number">{visited.includes(item.id) ? <Check/> : index + 1}</span><WordPicture id={item.art} label/><small>{item.action}</small><strong>{item.title}</strong><span>{item.detail}</span><span className="fluency-card-link">¡A jugar! <ArrowRight/></span>
      </button>)}</div>
      <p className="fluency-menu-note">Puedes hacer una pausa, cambiar de juego o volver a intentarlo cuando quieras.</p>
      <details className="fluency-family"><summary>Para la familia</summary><p>Las actividades proponen turnos, pausas y ritmo en forma de juego. No evalúan fluidez, pronunciación ni desarrollo; no usan el micrófono ni guardan intentos. La colección se reinicia al salir. Los niveles asignados y su progreso guardado siguen disponibles.</p>
        {selection.age === null && <p>No hay una fecha de nacimiento válida para elegir la colección inicial. Se muestran nueve actividades con apoyo.</p>}
        <button type="button" className="fluency-secondary" onClick={() => setCatalog(value => !value)}>{catalog ? 'Mostrar mis nueve juegos' : `Explorar los ${fluencyGames.length} juegos en familia`}</button>
        <button type="button" className="fluency-secondary" onClick={legacy}>Abrir niveles asignados con progreso guardado <ArrowRight/></button>
      </details>
    </> : <div className="fluency-playground">
      {!started ? <FluencyTutorial game={game!} speech={speech} onStart={() => { speech.stop(); setStarted(true); }}/>
        : complete ? <section className="fluency-celebration" aria-label="Juego terminado"><div><Sparkles/><Heart size={48}/><Sparkles/></div><h3>¡Qué buena ronda!</h3><WordPicture id={game!.art} label/><p>{game!.detail} Cada quien tiene su manera de compartir.</p>
          <button type="button" className="fluency-secondary" onClick={repeat}><RotateCcw/> Otra vez</button><button type="button" className="fluency-action" onClick={() => open(null)}>Elegir otro juego <ArrowRight/></button>
        </section> : <>
          <div className="fluency-session-bar"><button type="button" className="fluency-secondary" onClick={repeat}><RotateCcw/> Empezar otra vez</button><button type="button" className="fluency-secondary" onClick={() => speech.speak(`${game!.goal} ${game!.steps.join(' ')}`)}><Volume2/> Repetir instrucciones</button></div>
          <div className="fluency-activity-card"><FluencyActivityScene key={active} gameId={active} onComplete={finish} onSpeak={speech.speak}/></div>
        </>}
    </div>}
  </section>;
}

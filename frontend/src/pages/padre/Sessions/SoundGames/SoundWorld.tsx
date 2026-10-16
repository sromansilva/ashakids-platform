import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Hand, Headphones, Link2, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { animals, soundLevels } from './soundContent';
import { AnimalPicture } from './SoundParts';
import { ExploreSounds, IdentifySounds, MatchSounds } from './SoundActivities';
import { useSoundAudio } from './useSoundAudio';
import './sound-world.css';

export function SoundWorld({ back, legacy }: { back: () => void; legacy: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const audio = useSoundAudio();
  const title = useRef<HTMLHeadingElement>(null);
  const opener = useRef<number | null>(null);
  const levelButtons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (level !== null) title.current?.focus();
    else if (opener.current !== null) levelButtons.current[opener.current]?.focus();
  }, [level]);
  function open(value: number | null) { audio.stop(); setLevel(value); setRun(r => r + 1); }
  const icons = [Hand, Headphones, Link2];
  return <section className="sound-world" aria-label="Juegos de sonidos">
    <div className="sound-toolbar"><button type="button" className="sound-back" onClick={() => { audio.stop(); level === null ? back() : open(null); }}><ArrowLeft size={20}/>{level === null ? 'Volver a mundos' : 'Volver a niveles'}</button>
      <button type="button" className="sound-control" aria-pressed={audio.muted} onClick={audio.toggleMuted}>{audio.muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}<span>{audio.muted ? 'Activar sonido' : 'Silenciar'}</span></button></div>
    <header className={`sound-heading ${level === null ? 'is-welcome' : ''}`}>
      <div><p className="sound-world-name">Taller de los Sonidos {level !== null && <span>· Nivel {level + 1}</span>}</p>
        <h2 ref={title} tabIndex={-1}>{level === null ? 'Una granja llena de sorpresas' : soundLevels[level].title}</h2>
        <p>{level === null ? 'Toca, escucha y juega con tus nuevos amigos.' : soundLevels[level].instruction}</p></div>
      {level === null && <div className="sound-friends" aria-hidden="true">{animals.slice(0, 3).map(animal => <AnimalPicture key={animal.id} animal={animal}/>)}</div>}
    </header>
    {level === null ? <>
      <div className="sound-levels">{soundLevels.map((item, index) => { const Icon = icons[index]; return <button type="button" ref={node => { levelButtons.current[index] = node; }} className={`sound-level sound-level-${index + 1}`} key={item.title} aria-label={`Jugar nivel ${index + 1}: ${item.title}`} onClick={() => { opener.current = index; open(index); }}>
        <span className="sound-level-number">{index + 1}</span><AnimalPicture animal={animals[index === 2 ? 3 : index]}/><span className="sound-level-kind"><Icon size={18}/>{item.action}</span><h3>{item.title}</h3><p>{item.description}</p><span className="sound-level-start">¡A jugar! <ArrowRight size={20}/></span>
      </button>; })}</div>
      <p className="sound-parent-note">Elige cualquier nivel y juega a tu ritmo. Sin reloj ni penalizaciones.</p>
      <details className="sound-family-details"><summary>Para la familia</summary><p>Esta práctica de sonidos no guarda intentos, XP ni medallas. Las actividades anteriores conservan su progreso por niño. No es una evaluación clínica.</p><button type="button" className="sound-back" onClick={legacy}>Actividades con progreso guardado <ArrowRight size={18}/></button><a href="/sounds/animals/CREDITS.md" target="_blank" rel="noreferrer">Créditos de sonidos e ilustraciones</a></details>
    </> : <div className="sound-playground">
      <div className="sound-session-controls"><button type="button" className="sound-back" onClick={() => { audio.stop(); setRun(r => r + 1); }}><RotateCcw size={18}/> Empezar otra vez</button>
        {level === 0 && <button type="button" className="sound-back" disabled={!audio.last} onClick={() => { if (audio.last) void audio.play(audio.last); }}><Volume2 size={18}/> Repetir sonido</button>}</div>
      {audio.muted && <p className="sound-audio-notice" role="status">El sonido está silenciado. Actívalo para escuchar y continuar.</p>}
      {audio.error && <p className="sound-audio-notice" role="alert">{audio.error}</p>}
      <span className="sound-sr" role="status">{audio.loading ? 'Cargando sonido' : audio.active ? 'Reproduciendo sonido' : ''}</span>
      {level === 0 ? <ExploreSounds key={run} audio={audio} next={() => open(1)}/> : level === 1 ? <IdentifySounds key={run} audio={audio} next={() => open(2)}/> : <MatchSounds key={run} audio={audio} next={() => open(null)}/>}
    </div>}
  </section>;
}

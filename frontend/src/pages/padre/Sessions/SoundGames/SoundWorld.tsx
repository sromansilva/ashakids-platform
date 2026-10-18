import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Hand, Headphones, Link2, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { soundLevels } from './soundContent';
import { SoundGamePicture } from './SoundParts';
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
  }, [level, run]);
  function open(value: number | null) { audio.stop(); setLevel(value); setRun(r => r + 1); }
  const icons = [Hand, Headphones, Link2, Link2];
  return <section className="sound-world" aria-label="Juegos de sonidos">
    <nav className="sound-toolbar" aria-label="Navegación del taller"><button type="button" className="sound-back" onClick={() => { audio.stop(); level === null ? back() : open(null); }}><ArrowLeft size={20}/>{level === null ? 'Volver a mundos' : 'Volver a los juegos'}</button>
      <button type="button" className="sound-control" aria-pressed={audio.muted} onClick={audio.toggleMuted}>{audio.muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}<span>{audio.muted ? 'Activar sonido' : 'Silenciar'}</span></button></nav>
    <header className={`sound-heading ${level === null ? 'is-welcome' : ''}`}>
      <div><p className="sound-world-name">Taller de los Sonidos</p>
        <h2 ref={title} tabIndex={-1}>{level === null ? 'Una granja llena de sorpresas' : soundLevels[level].title}</h2>
        <p>{level === null ? 'Elige una aventura. Aquí jugamos una cosa a la vez.' : soundLevels[level].instruction}</p></div>
      {level === null && <PublicIllustration src="/illustrations/world-habla-v54.png" alt="" width={300} height={240} sizes="(max-width:640px) 220px,300px"/>}
    </header>
    {level === null ? <>
      <div className="sound-levels" aria-label="Cuatro juegos independientes">{soundLevels.map((item, index) => { const Icon = icons[index]; return <button type="button" ref={node => { levelButtons.current[index] = node; }} className={`sound-level sound-level-${index + 1}`} key={item.title} aria-label={`Jugar ${item.title}`} onClick={() => { opener.current = index; open(index); }}>
        <SoundGamePicture src={item.image} title={item.title}/><span className="sound-level-kind"><Icon size={18}/>{item.action}</span><h3>{item.title}</h3><p>{item.description}</p><span className="sound-level-start">¡A jugar! <ArrowRight size={20}/></span>
      </button>; })}</div>
      <p className="sound-parent-note">Cuatro juegos separados. Elige cualquiera y vuelve al menú cuando quieras.</p>
      <details className="sound-family-details"><summary>Para la familia</summary><p>Esta práctica de sonidos no guarda intentos, XP ni medallas. Las actividades anteriores conservan su progreso por niño. No es una evaluación clínica.</p><button type="button" className="sound-back" onClick={legacy}>Actividades con progreso guardado <ArrowRight size={18}/></button><a href="/sounds/animals/CREDITS.md" target="_blank" rel="noreferrer">Créditos de sonidos e ilustraciones</a></details>
    </> : <div className="sound-playground">
      <div className="sound-session-controls"><button type="button" className="sound-back" onClick={() => { audio.stop(); setRun(r => r + 1); }}><RotateCcw size={18}/> Empezar otra vez</button>
        {level === 0 && <button type="button" className="sound-back" disabled={!audio.last} onClick={() => { if (audio.last) void audio.play(audio.last); }}><Volume2 size={18}/> Repetir sonido</button>}</div>
      {audio.muted && <p className="sound-audio-notice" role="status">El sonido está silenciado. Actívalo para escuchar y continuar.</p>}
      {audio.error && <p className="sound-audio-notice" role="alert">{audio.error}</p>}
      <span className="sound-sr" role="status">{audio.loading ? 'Cargando sonido' : audio.active ? 'Reproduciendo sonido' : ''}</span>
      {level === 0 ? <ExploreSounds key={run} audio={audio} next={() => open(null)}/> : level === 1 ? <IdentifySounds key={run} audio={audio} next={() => open(null)}/> : <MatchSounds key={run} audio={audio} count={level === 2 ? 2 : 3} next={() => open(null)}/>}
    </div>}
  </section>;
}

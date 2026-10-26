import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, RotateCcw, Shell, Sparkles, Sprout, Volume2, VolumeX } from 'lucide-react';
import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { soundGames, selectSoundGames } from './soundGames';
import { SoundGamePicture } from './SoundParts';
import { SoundTutorial } from './SoundTutorial';
import { ExploreSounds, IdentifySounds, MatchSounds } from './SoundActivities';
import { SoundChallenges } from './SoundChallenges';
import { SoundMemory } from './SoundMemory';
import type { ChallengeKind } from './soundRounds';
import { useSoundAudio } from './useSoundAudio';
import { soundNarratorPreview, useSoundNarration } from './useSoundNarration';
import './sound-world.css';
import '../WordGames/word-world.css';
import './sound-challenges.css';
import './sound-ui.css';

export function SoundWorld({ back, legacy, birthDate }: { back: () => void; legacy: () => void; birthDate?: string }) {
  const selection = selectSoundGames(birthDate);
  const [level, setLevel] = useState<string | null>(null), [started, setStarted] = useState(false), [run, setRun] = useState(0);
  const [challenge, setChallenge] = useState(selection.band !== 'early'), [catalog, setCatalog] = useState(false), [visited, setVisited] = useState<string[]>([]);
  const narration = useSoundNarration(), audio = useSoundAudio(narration.stop);
  const title = useRef<HTMLHeadingElement>(null), opener = useRef<string | null>(null), buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const menu = catalog ? soundGames : selection.games, game = soundGames.find(item => item.id === level);
  const visitedCount = menu.filter(item => visited.includes(item.id)).length;
  const markVisited = useCallback(() => { if (level) setVisited(previous => previous.includes(level) ? previous : [...previous, level]); }, [level]);
  useEffect(() => { if (level !== null) title.current?.focus(); else if (opener.current) buttons.current[opener.current]?.focus(); }, [level, run, started]);
  function stop() { audio.stop(); narration.stop(); }
  function open(value: string | null) {
    stop(); setLevel(value); setStarted(false); setRun(previous => previous + 1);
    const selected = soundGames.find(item => item.id === value);
    if (selected && !audio.muted) narration.speak(`${selected.goal} ${selected.steps.join(' ')}`);
  }
  function speak(text: string) { audio.stop(); if (!audio.muted) narration.speak(text); }
  const next = () => open(null);
  return <section className="sound-world word-world" aria-label="Juegos de sonidos" style={game ? { '--word-accent': game.color } as CSSProperties : undefined}>
    <nav className="word-toolbar" aria-label="Navegación del taller"><button type="button" className="sound-back" onClick={() => { stop(); level === null ? back() : open(null); }}><ArrowLeft size={20}/>{level === null ? 'Volver a mundos' : 'Volver a los juegos'}</button><span><Compass size={18}/>{game ? game.action : `${menu.length} aventuras para explorar`}</span>
      <button type="button" className="sound-control" aria-pressed={audio.muted} onClick={() => { narration.stop(); audio.toggleMuted(); }}>{audio.muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}<span>{audio.muted ? 'Activar sonido' : 'Silenciar'}</span></button></nav>
    <header className={`word-hero ${level ? 'is-playing' : ''}`}><div><p className="word-world-name">Taller de los Sonidos</p><h2 ref={title} tabIndex={-1}>{game?.title ?? '¡Escucha, juega y descubre!'}</h2><p>{game?.description ?? 'Un taller lleno de amigos y pequeñas sorpresas para tus oídos.'}</p></div>{!level && <PublicIllustration src="/illustrations/world-habla-v54.png" alt="" width={320} height={240} sizes="(max-width:640px) 240px,320px"/>}</header>
    {audio.muted && <p className="sound-audio-notice" role="status">El sonido está silenciado. Actívalo para escuchar y continuar.</p>}
    {audio.error && <p className="sound-audio-notice" role="alert">{audio.error}</p>}
    {narration.notice && <p className="sound-audio-notice" role="status">{narration.notice}</p>}
    <span className="sound-sr" role="status">{audio.loading ? 'Cargando sonido' : audio.active ? 'Reproduciendo sonido' : ''}</span>
    {!game ? <>
      <div className="word-narrator-preview"><button type="button" className="word-button is-light" disabled={audio.muted} onClick={() => speak(soundNarratorPreview)}><Volume2 size={20}/> Escuchar voz de ASHA</button><span>Escucha con calma. Aquí puedes volver a probar.</span></div>
      <div className="word-welcome"><p><Sprout size={20}/> {catalog ? 'El catálogo para explorar en familia' : selection.label}. {menu.length} aventuras, a tu ritmo.</p><div className="word-modes" role="group" aria-label="Cómo quieres jugar"><button type="button" aria-pressed={!challenge} onClick={() => setChallenge(false)}><Sprout size={22}/><span><strong>Primeros pasos</strong><small>Menos sonidos y más ayuda</small></span></button><button type="button" aria-pressed={challenge} onClick={() => setChallenge(true)}><Sparkles size={22}/><span><strong>Un poquito más</strong><small>Más sonidos para descubrir</small></span></button></div><div className="word-visit" aria-label={`${visitedCount} de ${menu.length} aventuras en esta visita`}><Shell size={23}/><span>Tu taller de hoy</span><strong>{visitedCount}/{menu.length} aventuras</strong></div></div>
      {catalog && <button type="button" className="word-back" onClick={() => setCatalog(false)}>Volver a mis nueve juegos</button>}
      <div className="word-menu" aria-label="Juegos del taller">{menu.map((item, index) => <button type="button" ref={node => { buttons.current[item.id] = node; }} className="word-game-card" style={{ '--card-color': item.color } as CSSProperties} key={item.id} aria-label={`Jugar ${item.title}`} onClick={() => { opener.current = item.id; open(item.id); }}><span className={`word-game-number ${visited.includes(item.id) ? 'is-visited' : ''}`}>{visited.includes(item.id) ? <Check size={15}/> : index + 1}</span><SoundGamePicture src={item.image} title={item.title}/><span className="word-skill">{item.action}</span><h3>{item.title}</h3><p>{item.description}</p><span className={`word-visited ${visited.includes(item.id) ? '' : 'is-empty'}`} aria-hidden={!visited.includes(item.id)}>{visited.includes(item.id) && <><Check size={16}/> Jugado en esta visita</>}</span><span className="word-game-action">¡A jugar! <ArrowRight size={20}/></span></button>)}</div>
      <p className="word-menu-note">Escucha, descubre y vuelve a jugar. Sin prisa y sin perder vidas.</p>
      <details className="word-family"><summary>Para la familia</summary><p>La fecha de nacimiento orienta nueve juegos para 4–5, 6–7 y 8 años en adelante. Son agrupaciones editoriales, no una evaluación del desarrollo. Ajusta las ayudas y acompaña al niño. Los mundos asignados por el terapeuta se conservan.</p>{selection.age === null && <p>No tenemos una fecha de nacimiento válida. Mostramos nueve actividades iniciales con ayuda.</p>}{selection.age !== null && selection.age < 4 && <p>Esta colección está pensada desde los 4 años. Consulta al profesional y acompaña la actividad.</p>}<button type="button" className="word-back" onClick={() => setCatalog(value => !value)}>{catalog ? 'Mostrar mis nueve juegos' : `Explorar los ${soundGames.length} juegos en familia`}</button><p>Sonidos reales de animales y narración suave. Esta práctica no guarda intentos, XP ni medallas. No es una evaluación clínica; la colección de visita se reinicia al salir o cambiar de niño.</p><button type="button" className="word-back" onClick={legacy}>Actividades con progreso guardado <ArrowRight size={18}/></button><a href="/sounds/animals/CREDITS.md" target="_blank" rel="noreferrer">Créditos de sonidos e ilustraciones</a><a href="/sounds/voice/CREDITS.md" target="_blank" rel="noreferrer">Créditos de la narración</a></details>
    </> : <div className="sound-playground">
      {!started ? <div className="sound-first-steps"><div className="sound-first-steps-art"><SoundGamePicture src={game.image} title={game.title}/><p className="word-mission-mode">{challenge ? 'Un poquito más' : 'Primeros pasos'}</p></div><SoundTutorial title={game.title} gameId={game.id} goal={game.goal} steps={game.steps} audio={audio} onSpeak={() => speak(`${game.goal} ${game.steps.join(' ')}`)} onStart={() => { stop(); setStarted(true); }}/></div> : <>
        <div className="sound-session-controls"><button type="button" className="sound-back" onClick={() => { stop(); setRun(value => value + 1); }}><RotateCcw size={18}/> Empezar otra vez</button><button type="button" className="sound-back" disabled={audio.muted} onClick={() => speak(`${game.goal} ${game.steps.join(' ')}`)}><Volume2 size={18}/> Repetir instrucciones</button></div>
        {level === 'explore' ? <ExploreSounds key={run} audio={audio} next={next} onComplete={markVisited}/> : level === 'identify' ? <IdentifySounds key={run} audio={audio} next={next} onComplete={markVisited}/> : level === 'pairs2' || level === 'pairs3' ? <MatchSounds key={run} audio={audio} count={level === 'pairs2' ? 2 : 3} next={next} onComplete={markVisited}/> : level === 'memory' ? <SoundMemory key={run} audio={audio} challenge={challenge} next={next} onComplete={markVisited}/> : <SoundChallenges key={run} kind={level as ChallengeKind} audio={audio} challenge={challenge} next={next} onComplete={markVisited}/>}
      </>}
    </div>}
  </section>;
}

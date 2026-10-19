import { useEffect, useRef, useState } from 'react';
import { Check, Equal, Lightbulb, ListOrdered, RotateCcw, Volume2 } from 'lucide-react';
import { animalById, type AnimalId } from './soundContent';
import { AnimalCard, AnimalPicture, SoundCelebration, SoundProgress } from './SoundParts';
import { soundRounds, type ChallengeKind, type SoundRound } from './soundRounds';
import type { SoundAudio } from './useSoundAudio';

export function SoundChallenges({ kind, audio, challenge, next, onComplete }: {
  kind: ChallengeKind; audio: SoundAudio; challenge: boolean; next: () => void; onComplete: () => void;
}) {
  const [rounds] = useState(() => soundRounds(kind, challenge));
  const [round, setRound] = useState(0);
  return round === rounds.length ? <SoundCelebration title="¡Un descubrimiento para tu taller!" onComplete={onComplete} repeat={() => setRound(0)} next={next}>Escuchaste, comparaste y descubriste a tu ritmo.</SoundCelebration> : <>
    <SoundProgress value={round} total={rounds.length} label="Descubrimientos del taller"/>
    <ChallengeRound key={round} round={rounds[round]} audio={audio} advance={() => { audio.stop(); setRound(value => value + 1); }} last={round === rounds.length - 1}/>
  </>;
}
function ChallengeRound({ round, audio, advance, last }: { round: SoundRound; audio: SoundAudio; advance: () => void; last: boolean }) {
  const [heard, setHeard] = useState(false), [playing, setPlaying] = useState(false), [solved, setSolved] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]), [message, setMessage] = useState(''), [hint, setHint] = useState(false);
  const generation = useRef(0), live = useRef(true), busy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; resolve: () => void } | null>(null);
  useEffect(() => { live.current = true; heading.current?.focus(); return () => { live.current = false; generation.current++; if (pending.current) { clearTimeout(pending.current.timer); pending.current.resolve(); } }; }, []);
  async function listen() {
    if (busy.current || solved) return;
    busy.current = true; setPlaying(true); setHeard(false); setMessage('Escucha hasta el final.');
    const token = ++generation.current;
    let revision = audio.revision(), ok = true;
    for (let i = 0; i < round.sounds.length; i++) {
      if (!live.current || token !== generation.current || revision !== audio.revision()) { ok = false; break; }
      const playback = audio.play(round.sounds[i]); revision = audio.revision();
      if (!await playback || !live.current || token !== generation.current || revision !== audio.revision()) { ok = false; break; }
      if (i < round.sounds.length - 1) await new Promise<void>(resolve => { pending.current = { resolve, timer: setTimeout(() => { pending.current = null; resolve(); }, 300) }; });
    }
    busy.current = false;
    if (live.current && token === generation.current) { setPlaying(false); setHeard(ok); setMessage(ok ? 'Ya puedes elegir. También puedes escuchar otra vez.' : 'El sonido se ha detenido. Puedes volver a escucharlo.'); }
  }
  function check(answer: string) {
    if (!heard || playing || solved) return;
    const correct = answer === round.answer; setSolved(correct);
    setMessage(correct ? '¡Lo descubriste! Escuchar con calma ayuda.' : 'Probemos otra vez. Puedes volver a escuchar o pedir una pista.');
    if (!correct) setChosen([]);
  }
  return <div className="sound-challenge">
    <h3 className="sound-round-prompt" tabIndex={-1} ref={heading}>{round.prompt}</h3>
    <button type="button" className="sound-listen sound-button" disabled={playing || solved} onClick={() => void listen()}><Volume2 size={28}/>{playing ? 'Escuchando…' : 'Escuchar la ronda'}</button>
    {round.sequence && <ol className="sound-train" aria-label="Tu tren">{round.sounds.map((_, index) => <li key={index}><span>{index + 1}</span>{chosen[index] ? <AnimalPicture animal={animalById(chosen[index] as AnimalId)}/> : <ListOrdered size={34}/>}</li>)}</ol>}
    <div className={`sound-animal-grid sound-round-options ${round.options.some(id => id === 'same' || /^\d+$/.test(id)) ? 'sound-symbol-options' : ''}`}>
      {round.options.map(id => ['same', 'different'].includes(id) ? <button type="button" className="sound-symbol" key={id} disabled={!heard || playing || solved} onClick={() => check(id)}>{id === 'same' ? <Equal size={42}/> : <span aria-hidden="true">≠</span>}<strong>{id === 'same' ? 'Suenan iguales' : 'Suenan diferentes'}</strong></button> : /^\d+$/.test(id) ? <button type="button" key={id} className="sound-symbol" aria-label={`${id} ${id === '1' ? 'sonido' : 'sonidos'}`} disabled={!heard || playing || solved} onClick={() => check(id)}><span>{id}</span><span className="sound-count-dots" aria-hidden="true">{'● '.repeat(Number(id))}</span></button> : <AnimalCard key={id} animal={animalById(id as AnimalId)} disabled={!heard || playing || solved || (!!round.sequence && chosen.includes(id))} active={chosen.includes(id)} onClick={() => round.sequence ? setChosen(previous => previous.length < round.sounds.length ? [...previous, id] : previous) : check(id)}/>)}
    </div>
    {round.sequence && <div className="sound-actions"><button type="button" className="sound-button is-secondary" disabled={!chosen.length || solved || playing} onClick={() => setChosen(previous => previous.slice(0, -1))}><RotateCcw size={18}/> Quitar último vagón</button><button type="button" className="sound-button" disabled={!heard || chosen.length !== round.sounds.length || playing || solved} onClick={() => check(chosen.join(','))}>Comprobar mi tren</button></div>}
    <button type="button" className="sound-back" disabled={playing || solved} onClick={() => setHint(true)}><Lightbulb size={20}/> Dame una pista</button>
    {hint && <p className="sound-hint" role="note">{round.hint}</p>}
    <p className="sound-feedback" role="status">{solved && <Check size={22}/>} {message}</p>
    {solved && <button type="button" className="sound-button sound-continue" onClick={advance}>{last ? 'Terminar juego' : 'Continuar'}</button>}
  </div>;
}

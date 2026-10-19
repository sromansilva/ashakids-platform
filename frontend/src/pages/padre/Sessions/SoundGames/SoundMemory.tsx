import { useEffect, useRef, useState } from 'react';
import { Eye, Volume2 } from 'lucide-react';
import { animals, animalById, shuffled, type AnimalId } from './soundContent';
import { AnimalPicture, SoundCelebration, SoundProgress } from './SoundParts';
import type { SoundAudio } from './useSoundAudio';

export function SoundMemory({ audio, challenge, next, onComplete }: { audio: SoundAudio; challenge: boolean; next: () => void; onComplete: () => void }) {
  const [cards] = useState(() => { const set = shuffled(animals).slice(0, challenge ? 3 : 2).map(animal => animal.id); return shuffled([...set, ...set]); });
  const [opened, setOpened] = useState<number[]>([]), [matched, setMatched] = useState<AnimalId[]>([]), [peek, setPeek] = useState(false), [message, setMessage] = useState('');
  const live = useRef(true), busy = useRef(false);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  async function flip(index: number) {
    if (busy.current || opened.length === 2 || opened.includes(index) || matched.includes(cards[index])) return;
    busy.current = true; setPeek(false);
    const ok = await audio.play(cards[index]); busy.current = false;
    if (!ok || !live.current) return;
    const nextOpened = [...opened, index]; setOpened(nextOpened);
    if (nextOpened.length === 2) {
      if (cards[nextOpened[0]] === cards[nextOpened[1]]) { setMatched(previous => [...previous, cards[index]]); setOpened([]); setMessage('¡Una pareja que suena igual!'); }
      else setMessage('Estos sonidos son diferentes. Escucha otra pareja cuando quieras.');
    } else setMessage('Ahora escucha otra ficha.');
  }
  if (matched.length === cards.length / 2) return <SoundCelebration onComplete={onComplete} title="¡Encontraste las parejas sonoras!" repeat={() => { setOpened([]); setMatched([]); setPeek(false); setMessage(''); }} next={next}>Recordaste dónde se escondían los sonidos.</SoundCelebration>;
  return <>
    <SoundProgress value={matched.length} total={cards.length / 2} label="Parejas sonoras"/>
    <p className="sound-round-prompt">Toca una ficha, escucha y busca su pareja.</p>
    <div className="sound-memory" aria-label="Memoria de sonidos">{cards.map((id, index) => <button key={index} type="button" className={`sound-memory-card ${matched.includes(id) ? 'is-complete' : ''}`} aria-label={`Escuchar carta ${index + 1}`} disabled={matched.includes(id) || opened.includes(index) || opened.length === 2} onClick={() => void flip(index)}>{peek || opened.includes(index) || matched.includes(id) ? <AnimalPicture animal={animalById(id)}/> : <Volume2 size={40}/>}<span>Ficha {index + 1}</span></button>)}</div>
    <div className="sound-actions">{opened.length === 2 && <button type="button" className="sound-button" onClick={() => { setOpened([]); setMessage(''); }}>Probar otra pareja</button>}<button type="button" className="sound-button is-secondary" onClick={() => { audio.stop(); setPeek(value => !value); }}><Eye size={20}/>{peek ? 'Ocultar pista' : 'Ver una pista'}</button></div>
    <p className="sound-feedback" role="status">{message}</p>
  </>;
}

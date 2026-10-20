import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Volume2 } from 'lucide-react';
import { animals, identificationRounds, shuffled, type AnimalId } from './soundContent';
import { AnimalCard, MatchDemo, SoundCelebration, SoundFeedback, SoundProgress } from './SoundParts';
import type { SoundAudio } from './useSoundAudio';

interface ActivityProps { audio: SoundAudio; next: () => void; onComplete?: () => void }
export function ExploreSounds({ audio, next, onComplete }: ActivityProps) {
  const [explored, setExplored] = useState<AnimalId[]>([]);
  const [last, setLast] = useState<AnimalId | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const current = useRef(true);
  useEffect(() => { current.current = true; return () => { current.current = false; }; }, []);
  async function explore(id: AnimalId) {
    setLast(id);
    if (!await audio.play(id) || !current.current) return;
    setExplored(previous => previous.includes(id) ? previous : [...previous, id]);
  }
  useEffect(() => { if (explored.length === animals.length) setCelebrate(true); }, [explored]);
  if (celebrate) return <SoundCelebration onComplete={onComplete} title="¡Ya conoces sus sonidos!" repeat={() => { audio.stop(); setExplored([]); setLast(null); setCelebrate(false); }} next={next}>Tus cuatro amigos te esperan cuando quieras volver.</SoundCelebration>;
  return <>
    <SoundProgress label="Amigos escuchados" value={explored.length} total={animals.length}/>
    <div className="sound-animal-grid">{animals.map(animal => <AnimalCard key={animal.id} animal={animal} onClick={() => void explore(animal.id)} active={audio.active === animal.id} completed={explored.includes(animal.id)} voice={last === animal.id}/>)}</div>
  </>;
}

export function IdentifySounds({ audio, next, onComplete }: ActivityProps) {
  const [rounds, setRounds] = useState(identificationRounds);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState(false);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'neutral' | 'success' | 'retry'>('neutral');
  const [attempted, setAttempted] = useState<AnimalId | null>(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  const complete = round === rounds.length;
  const challenge = rounds[Math.min(round, rounds.length - 1)];
  async function listen() {
    const version = ++generation.current;
    setFeedback(''); setFeedbackTone('neutral'); setAttempted(null);
    const ok = await audio.play(challenge.answer);
    if (ok && version === generation.current) setHeard(true);
  }
  function choose(id: AnimalId) {
    if (!heard) { setFeedback('Primero toca el altavoz y escucha.'); setFeedbackTone('retry'); return; }
    if (id === challenge.answer) { audio.stop(); setSolved(true); setAttempted(null); setFeedback('¡Lo encontraste!'); setFeedbackTone('success'); }
    else { setAttempted(id); setFeedback('Escuchemos otra vez'); setFeedbackTone('retry'); }
  }
  function advance() { audio.stop(); generation.current++; setHeard(false); setSolved(false); setFeedback(''); setFeedbackTone('neutral'); setAttempted(null); setRound(r => r + 1); }
  return complete ? <SoundCelebration onComplete={onComplete} title="¡Qué buenos oídos!" repeat={() => { audio.stop(); setRounds(identificationRounds()); setRound(0); setHeard(false); setSolved(false); setFeedback(''); setFeedbackTone('neutral'); setAttempted(null); }} next={next}>Encontraste a tus amigos en las cinco rondas.</SoundCelebration> : <>
    <SoundProgress label="Sonidos encontrados" value={round} total={5}/>
    <button type="button" aria-label="Escuchar sonido" aria-busy={audio.loading} className={`sound-listen ${audio.active ? 'is-active' : ''}`} onClick={() => void listen()}><Volume2 size={42} aria-hidden="true"/><span>{audio.loading ? 'Cargando…' : audio.active ? 'Escuchando…' : 'Escuchar sonido'}</span><small>Puedes escucharlo otra vez</small></button>
    <div className="sound-animal-grid is-choices">{challenge.options.map(animal => <AnimalCard key={animal.id} animal={animal} onClick={() => choose(animal.id)} incorrect={attempted === animal.id} completed={solved && challenge.answer === animal.id} active={solved && challenge.answer === animal.id} disabled={solved}/>)}</div>
    <SoundFeedback message={feedback || '¿Quién hizo ese sonido?'} tone={feedbackTone}/>
    {solved && <button type="button" className="sound-button sound-continue" onClick={advance}>{round === 4 ? 'Terminar' : 'Siguiente ronda'}<ArrowRight size={20}/></button>}
  </>;
}

export function MatchSounds({ audio, next, count, onComplete }: ActivityProps & { count: 2 | 3 }) {
  const [set, setSet] = useState(() => shuffled(animals).slice(0, count));
  const [tokens, setTokens] = useState(() => shuffled(set));
  const [selected, setSelected] = useState<AnimalId | null>(null);
  const [heard, setHeard] = useState<AnimalId[]>([]);
  const [matched, setMatched] = useState<AnimalId[]>([]);
  const [feedback, setFeedback] = useState('Elige una ficha y escucha su sonido.');
  const [feedbackTone, setFeedbackTone] = useState<'neutral' | 'success' | 'retry'>('neutral');
  const [wrongTarget, setWrongTarget] = useState<AnimalId | null>(null);
  const current = useRef(true);
  const heardRef = useRef<AnimalId[]>([]);
  useEffect(() => { current.current = true; return () => { current.current = false; }; }, []);
  async function listen(id: AnimalId) {
    setSelected(id); setFeedback('Escucha y busca su animal.'); setFeedbackTone('neutral'); setWrongTarget(null);
    if (await audio.play(id) && current.current) { heardRef.current = [...new Set([...heardRef.current, id])]; setHeard(heardRef.current); }
  }
  function match(target: AnimalId, token: AnimalId | null = selected) {
    if (!token || !heardRef.current.includes(token)) { setFeedback('Primero toca una ficha y escucha su sonido completo.'); setFeedbackTone('retry'); setWrongTarget(null); return; }
    if (matched.includes(token) || matched.includes(target)) return;
    audio.stop();
    if (token === target) { setMatched(previous => [...previous, target]); setSelected(null); setWrongTarget(null); setFeedback('¡Una pareja más!'); setFeedbackTone('success'); }
    else { setSelected(null); setWrongTarget(target); setFeedback('Casi… toca la ficha para escuchar otra vez.'); setFeedbackTone('retry'); }
  }
  function reset() {
    audio.stop(); const values = shuffled(animals).slice(0, count); setSet(shuffled(values)); setTokens(shuffled(values)); setSelected(null); setHeard([]); heardRef.current = []; setMatched([]); setWrongTarget(null); setFeedback('Elige una ficha y escucha su sonido.'); setFeedbackTone('neutral');
  }
  const done = matched.length === set.length;
  if (done) return <SoundCelebration onComplete={onComplete} title="¡Cada sonido encontró su lugar!" repeat={reset} next={next}>Uniste {count === 2 ? 'dos' : 'tres'} parejas. ¡Bien hecho!</SoundCelebration>;
  return <>
    <SoundProgress label="Parejas encontradas" value={matched.length} total={set.length}/>
    <MatchDemo/>
    <div className="sound-tokens" aria-label="Fichas de sonido">{tokens.map((animal, index) => <button type="button" key={animal.id} className={`sound-token ${selected === animal.id ? 'is-selected' : ''}`} aria-label={`Escuchar ficha ${index + 1}`} aria-pressed={selected === animal.id} disabled={matched.includes(animal.id)}
      draggable={heard.includes(animal.id) && !matched.includes(animal.id)} onDragStart={event => { event.dataTransfer.setData('application/x-asha-sound', animal.id); event.dataTransfer.effectAllowed = 'move'; setSelected(animal.id); }} onClick={() => void listen(animal.id)}>
      {matched.includes(animal.id) ? <Check size={32} aria-hidden="true"/> : <Volume2 size={32} aria-hidden="true"/>}<span>Sonido {index + 1}</span>{selected === animal.id && <small>Ahora toca su animal</small>}
    </button>)}</div>
    <div className="sound-animal-grid is-choices">{set.map(animal => <AnimalCard key={animal.id} animal={animal} label={`Relacionar con ${animal.name}`} incorrect={wrongTarget === animal.id} active={matched.includes(animal.id)} completed={matched.includes(animal.id)} disabled={matched.includes(animal.id)} onClick={() => match(animal.id)}
      onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('application/x-asha-sound'); if (tokens.some(t => t.id === id)) match(animal.id, id as AnimalId); }}/>)}</div>
    <SoundFeedback message={feedback} tone={feedbackTone}/>
  </>;
}

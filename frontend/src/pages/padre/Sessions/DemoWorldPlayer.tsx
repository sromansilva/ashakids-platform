import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LockKeyhole, Volume2 } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { demoProgressKey, readDemoProgress, type DemoWorld, type DemoLevel } from '@/services/demoWorlds';
import { speakForChild } from './speakForChild';

function LevelActivity({ level, completed, onComplete, exit }: { level: DemoLevel; completed: boolean; onComplete: () => void; exit: () => void }) {
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [solved, setSolved] = useState(false);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  function check() {
    const correct = choices.length === level.answer.length && choices.every((value, i) => value === level.answer[i]);
    setSolved(correct);
    setFeedback(correct ? '¡Lo lograste! Puedes completar este nivel.' : 'Prueba otra vez. Escucha la pista y cambia tu respuesta.');
  }
  return <section aria-label="Actividad de demostración" className="space-y-5">
    <Btn variant="ghost" onClick={exit}><ArrowLeft size={16}/> Volver a niveles</Btn>
    <h3 className="text-2xl font-black">{level.title}</h3>
    <p className="text-lg text-[#4B4264] leading-relaxed">{level.prompt}</p>
    <Btn variant="outline" onClick={() => speakForChild(level.prompt)}><Volume2 size={18}/> Escuchar pista</Btn>
    <p className="font-bold">{level.sequence ? 'Elige una palabra tras otra.' : 'Elige una respuesta.'}</p>
    <div className="flex flex-wrap gap-3">{level.choices.map(choice => <button key={choice} disabled={solved || (!!level.sequence && choices.includes(choice))} aria-pressed={choices.includes(choice)} className={`rounded-xl border-2 px-5 py-4 text-base font-bold disabled:opacity-60 focus-visible:outline-violet-700 ${choices.includes(choice) ? 'border-violet-700 bg-violet-100' : 'border-[#E8E5F4] bg-white hover:border-violet-400'}`} onClick={() => { setFeedback(''); setChoices(level.sequence ? [...choices, choice] : [choice]); }}>{choice}</button>)}</div>
    {level.sequence && <p className="text-base" aria-live="polite">Tu orden: {choices.join(' → ') || 'Elige la primera palabra'}</p>}
    {feedback && <p role="status" className="font-bold text-[#4B4264]">{feedback}</p>}
    <div className="flex gap-3 flex-wrap">{!solved ? <><Btn disabled={choices.length !== level.answer.length} onClick={check}>Comprobar respuesta</Btn>{level.sequence && <Btn variant="ghost" onClick={() => { setChoices([]); setFeedback(''); }}>Cambiar orden</Btn>}</> : <Btn onClick={onComplete}>{completed ? 'Terminar repetición' : 'Completar nivel'}</Btn>}</div>
    <p className="text-sm text-[#4B4264]">Participación de demostración. No evalúa pronunciación ni evolución clínica.</p>
  </section>;
}

export function DemoWorldPlayer({ world, userId, patientId, back }: { world: DemoWorld; userId: number; patientId: number; back: () => void }) {
  const key = demoProgressKey(userId, patientId, world.id);
  const [completed, setCompleted] = useState(() => readDemoProgress(key));
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  function finish() {
    const next = Math.max(completed, (levelIndex ?? 0) + 1);
    setCompleted(next);
    try { sessionStorage.setItem(key, String(next)); } catch { setStorageUnavailable(true); }
    setLevelIndex(null);
  }
  return <section className="rounded-2xl bg-white border border-[#E8E5F4] p-5 sm:p-7 space-y-5">
    <Btn variant="outline" onClick={back}><ArrowLeft size={16}/> Volver a mundos</Btn>
    <h2 className="text-2xl font-black">{world.name}</h2>
    <p className="text-base text-[#4B4264]">{world.description}</p>
    <p className="font-bold">Demostración: {completed} de {world.levels.length} niveles completados en esta pestaña.</p>
    {storageUnavailable && <p role="status">El navegador no permite guardar la demo; el avance durará mientras esta vista siga abierta.</p>}
    {levelIndex === null ? <>
      {completed === world.levels.length && <p role="status" className="flex gap-2 items-center font-bold text-emerald-800"><CheckCircle2 size={22}/> ¡Mundo de demostración terminado! Puedes repetir sus niveles.</p>}
      <ol className="divide-y divide-[#E8E5F4]">{world.levels.map((level, index) => <li key={level.title} className="py-4 flex flex-wrap justify-between gap-3 items-center"><div><h3 className="text-lg font-bold">Nivel {index+1}: {level.title}</h3><p className="text-sm text-[#4B4264]">{index < completed ? 'Completado en la demo' : index === completed ? 'Disponible' : 'Completa el nivel anterior para abrirlo'}</p></div><Btn variant={index < completed ? 'outline' : 'primary'} disabled={index > completed} onClick={() => setLevelIndex(index)}>{index > completed ? <><LockKeyhole size={16}/> Bloqueado</> : index < completed ? `Repetir nivel ${index+1}` : `Jugar nivel ${index+1}`}</Btn></li>)}</ol>
    </> : <LevelActivity key={levelIndex} level={world.levels[levelIndex]} completed={levelIndex < completed} onComplete={finish} exit={() => setLevelIndex(null)}/>}
  </section>;
}

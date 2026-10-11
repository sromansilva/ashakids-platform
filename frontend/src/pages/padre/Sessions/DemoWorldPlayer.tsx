import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Award, Volume2 } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { learningGames, type AttemptData, type BasicLevel, type GameProgress, type WorldProgress } from '@/services/learningGames';
import { speakForChild } from './speakForChild';

function LevelActivity({ level, world, patientId, onSaved, exit }: {
  level: BasicLevel; world: WorldProgress; patientId: number; onSaved: (progress: GameProgress) => void; exit: () => void;
}) {
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [solved, setSolved] = useState(false);
  const [helps, setHelps] = useState(0);
  const started = useRef(Date.now());
  const request = useRef<AttemptData | null>(null);
  const live = useRef(true);
  const locked = useRef(false);
  useEffect(() => { live.current = true; return () => { live.current = false; window.speechSynthesis?.cancel(); }; }, []);
  async function check() {
    if (locked.current) return;
    locked.current = true; setPending(true); setError('');
    request.current ??= { clave_intento: crypto.randomUUID(), version: world.version, nivel: level.number,
      respuestas: choices, duracion_segundos: Math.min(3600, Math.floor((Date.now() - started.current) / 1000)), ayudas_usadas: helps };
    try {
      const result = await learningGames.attempt(patientId, world.id, request.current);
      if (!live.current) return;
      onSaved(result.resumen); setSolved(result.correcto);
      setFeedback(result.correcto ? `¡Lo lograste! Intento guardado. +${result.experiencia_otorgada} XP.` : 'Intento guardado. Prueba otra respuesta; puedes usar la pista.');
      request.current = null; started.current = Date.now(); setHelps(0);
    } catch (err) { if (live.current) setError(err instanceof Error ? err.message : 'No se pudo guardar el intento.'); }
    finally { locked.current = false; if (live.current) setPending(false); }
  }
  return <section aria-label="Actividad básica" className="space-y-5">
    <Btn variant="ghost" onClick={exit} disabled={pending}><ArrowLeft size={16}/> Volver a niveles</Btn>
    <h3 className="text-2xl font-black">Nivel {level.number}: {level.title}</h3>
    <p className="text-lg text-[#4B4264] leading-relaxed">{level.prompt}</p>
    <Btn variant="outline" disabled={pending || solved} onClick={() => { setHelps(h => h + 1); speakForChild(level.prompt); }}><Volume2 size={18}/> Escuchar pista</Btn>
    <p className="font-bold">{level.sequence ? 'Elige las palabras en el orden indicado.' : 'Elige una respuesta.'}</p>
    <div className="flex flex-wrap gap-3">{level.choices.map(choice => <button key={choice} disabled={pending || solved || (!!level.sequence && choices.includes(choice))} aria-pressed={choices.includes(choice)} className={`rounded-xl border-2 px-5 py-4 text-base font-bold disabled:opacity-60 focus-visible:outline-violet-700 ${choices.includes(choice) ? 'border-violet-700 bg-violet-100' : 'border-[#E8E5F4] bg-white hover:border-violet-400'}`} onClick={() => { request.current = null; setError(''); setFeedback(''); setChoices(level.sequence ? [...choices, choice] : [choice]); }}>{choice}</button>)}</div>
    {level.sequence && <p className="text-base" aria-live="polite">Tu orden: {choices.join(' → ') || 'Elige la primera palabra'}</p>}
    {feedback && <p role="status" className="font-bold text-[#4B4264]">{feedback}</p>}
    {error && <p role="alert" className="text-red-800">{error}</p>}
    <div className="flex gap-3 flex-wrap">{!solved ? <><Btn disabled={pending || choices.length !== (level.sequence ? level.choices.length : 1)} onClick={() => void check()}>{pending ? 'Guardando…' : error ? 'Reintentar guardado' : 'Comprobar y guardar'}</Btn>{level.sequence && <Btn variant="ghost" disabled={pending} onClick={() => { request.current = null; setChoices([]); setFeedback(''); setError(''); }}>Cambiar orden</Btn>}</> : <Btn onClick={exit}>Regresar al listado de niveles</Btn>}</div>
  </section>;
}

export function DemoWorldPlayer({ world, patientId, onSaved, back }: {
  world: WorldProgress; patientId: number; onSaved: (progress: GameProgress) => void; back: () => void;
}) {
  const [levelNumber, setLevelNumber] = useState<number | null>(null);
  const level = world.levels.find(l => l.number === levelNumber);
  return <section className="rounded-2xl bg-white border border-[#E8E5F4] p-5 sm:p-7 space-y-5">
    {!level && <Btn variant="outline" onClick={back}><ArrowLeft size={16}/> Volver a mundos</Btn>}
    <h2 className="text-2xl font-black">{world.name}</h2>
    <p className="text-base text-[#4B4264]">{world.description}</p>
    <p className="font-bold">{world.completados.length} de {world.levels.length} niveles completados · {world.intentos} intentos guardados.</p>
    <p className="text-sm text-[#4B4264]">Puedes visitar cualquier nivel. Saltar a otro nivel no completa los anteriores. Actividades básicas de simulación; no miden mejoría clínica.</p>
    {world.medalla && <p role="status" className="flex gap-2 items-center font-bold text-emerald-800"><Award size={22}/> Medalla obtenida por completar este mundo.</p>}
    {level ? <LevelActivity key={level.number} level={level} world={world} patientId={patientId} onSaved={onSaved} exit={() => setLevelNumber(null)}/> :
      <ol className="divide-y divide-[#E8E5F4]">{world.levels.map(item => <li key={item.number} className="py-4 flex flex-wrap justify-between gap-3 items-center"><div><h3 className="text-lg font-bold">Nivel {item.number}: {item.title}</h3><p className="text-sm text-[#4B4264]">{world.completados.includes(item.number) ? 'Completado · repetir no vuelve a otorgar XP' : 'Disponible'}</p></div><Btn variant={world.completados.includes(item.number) ? 'outline' : 'primary'} onClick={() => setLevelNumber(item.number)}>{world.completados.includes(item.number) ? `Repetir nivel ${item.number}` : `Jugar nivel ${item.number}`}</Btn></li>)}</ol>}
  </section>;
}

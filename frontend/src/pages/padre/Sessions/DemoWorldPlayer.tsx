import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, Award, Check, Flag, Play, Volume2 } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { learningGames, type AttemptData, type BasicLevel, type GameProgress, type WorldProgress } from '@/services/learningGames';
import { speakForChild } from './speakForChild';
import { VoiceSpeechGame } from './VoiceSpeechGame';
import { WorldGameDialog } from './WorldGameDialog';
import { worldArt } from './worldArt';

function LevelActivity({ level, world, patientId, onSaved, exit, onPending }: {
  level: BasicLevel; world: WorldProgress; patientId: number; onSaved: (progress: GameProgress) => void; exit: () => void; onPending: (pending: boolean) => void;
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
    locked.current = true; setPending(true); onPending(true); setError('');
    request.current ??= { clave_intento: crypto.randomUUID(), version: world.version, nivel: level.number,
      respuestas: choices, duracion_segundos: Math.min(3600, Math.floor((Date.now() - started.current) / 1000)), ayudas_usadas: helps };
    try {
      const result = await learningGames.attempt(patientId, world.id, request.current);
      if (!live.current) return;
      onSaved(result.resumen); setSolved(result.correcto);
      setFeedback(result.correcto ? `¡Lo lograste! Intento guardado. +${result.experiencia_otorgada} XP.` : 'Intento guardado. Prueba otra respuesta; puedes usar la pista.');
      request.current = null; started.current = Date.now(); setHelps(0);
    } catch (err) { if (live.current) setError(err instanceof Error ? err.message : 'No se pudo guardar el intento.'); }
    finally { locked.current = false; if (live.current) { setPending(false); onPending(false); } }
  }
  return <section aria-label="Actividad básica" className="asha-level-activity space-y-5">
    <Btn variant="ghost" onClick={exit} disabled={pending}><ArrowLeft size={16}/> Volver a niveles</Btn>
    <p className="text-lg text-[#4B4264] leading-relaxed">{level.prompt}</p>
    <Btn variant="outline" disabled={pending || solved} onClick={() => { setHelps(h => h + 1); speakForChild(level.prompt); }}><Volume2 size={18}/> Escuchar pista</Btn>
    <p className="font-bold">{level.sequence ? 'Elige las palabras en el orden indicado.' : 'Elige una respuesta.'}</p>
    <div className="asha-game-choices">{level.choices.map(choice => <button key={choice} disabled={pending || solved || (!!level.sequence && choices.includes(choice))} aria-pressed={choices.includes(choice)} className="asha-game-choice" onClick={() => { request.current = null; setError(''); setFeedback(''); setChoices(level.sequence ? [...choices, choice] : [choice]); }}>{choice}</button>)}</div>
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
  const [pending, setPending] = useState(false);
  const level = world.levels.find(l => l.number === levelNumber);
  const art = worldArt[world.id];
  const next = world.levels.find(item => !world.completados.includes(item.number))?.number;
  return <section className="asha-world-route" style={{ '--world-color': art.color, '--world-soft': art.soft } as CSSProperties}>
    <button type="button" className="asha-map-back" onClick={back}><ArrowLeft size={18} aria-hidden="true"/> Volver a mundos</button>
    <div className="asha-route-header"><div><h2>{world.name}</h2><p>{world.description}</p><p className="asha-route-progress">{world.completados.length} de {world.levels.length} niveles completados · {world.intentos} intentos guardados.</p></div><PublicIllustration src={`/illustrations/world-${art.image}-v54.png`} alt="" width={180} height={120}/></div>
    <div className="asha-level-map">
      <PublicIllustration src={`/illustrations/world-${art.image}-v54.png`} alt="" width={440} height={300} className="asha-route-scenery" sizes="440px"/>
      <ol className="asha-level-path">{world.levels.map(item => {
        const complete = world.completados.includes(item.number);
        return <li key={item.number} className={`asha-level-stop ${complete ? 'is-complete' : ''} ${next === item.number ? 'is-next' : ''}`}>
          <button type="button" className="asha-level-square" aria-label={`${complete ? 'Repetir' : 'Jugar'} nivel ${item.number}`} onClick={() => setLevelNumber(item.number)}><span>{complete ? <Check size={32} aria-hidden="true"/> : next === item.number ? <Play size={28} fill="currentColor" aria-hidden="true"/> : <Flag size={28} aria-hidden="true"/>}</span><span className="asha-level-number">{item.number}</span></button>
          <h3>{item.title}</h3><p>{complete ? 'Completado · puedes repetir' : 'Disponible'}</p>
        </li>;
      })}</ol>
    </div>
    <div className="asha-route-footer"><Award size={28} aria-hidden="true"/><div>{world.medalla ? <p role="status">Medalla obtenida por completar este mundo.</p> : <p>Completa los {world.levels.length} niveles para obtener la medalla de este mundo.</p>}<p>Puedes visitar cualquier nivel. Saltar a otro nivel no completa los anteriores. Repetir un nivel completado no vuelve a otorgar XP.</p></div></div>
    {level && <WorldGameDialog title={`Nivel ${level.number}: ${level.title}`} pending={pending} onClose={() => setLevelNumber(null)}>
      {world.id === 'VOZ' ? (
        <VoiceSpeechGame
          key={level.number}
          levelNumber={level.number}
          targetPhrase={level.choices?.[0] || 'El perro corre'}
          patientId={patientId}
          worldVersion={world.version}
          onSaved={onSaved}
          onExit={() => setLevelNumber(null)}
        />
      ) : (
        <LevelActivity key={level.number} level={level} world={world} patientId={patientId} onSaved={onSaved} onPending={setPending} exit={() => setLevelNumber(null)}/>
      )}
    </WorldGameDialog>}
  </section>;
}

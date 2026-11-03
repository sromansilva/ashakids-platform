import { useEffect, useRef, useState } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';
import type { PhonemeTarget } from '@/modules/clinica/domain/clinical';
import { learningGames, type AttemptData, type GameProgress } from '@/modules/mundo_asha/infrastructure/learningGames';
import { choiceWords, pickRounds, words, type FocusedWordLevel, type WordId, type WordPlayMode } from './wordContent';
import { Listen, PictureButton, RoundFooter, useRounds, WordPicture, WordProgress, type WordSpeech } from './WordParts';
import { useWordRecorder } from './useWordRecorder';

function NamingRound({ target, speech, solved, saving, tracked, patientId, solve }: {
  target: WordId; speech: WordSpeech; solved: boolean; saving: boolean; tracked: boolean; patientId: number; solve: (target: WordId) => void;
}) {
  const recording = useWordRecorder(words[target].name, speech.stop, patientId);
  const [images, setImages] = useState(false);
  const [selectionNotice, setSelectionNotice] = useState('');
  const [options] = useState(() => choiceWords(target, [target, 'dog', 'apple', 'book'].filter((id, i, values) => values.indexOf(id) === i) as WordId[], 'gentle'));
  const match = recording.result?.comparacion?.es_coincidente === true;
  return <section className="word-naming" aria-label="Nombra el dibujo">
    <div className="word-naming-model"><WordPicture id={target} label/><Listen disabled={recording.busy} label="Escuchar la palabra" text={words[target].name} speech={speech}/></div>
    {!images ? <>
      <p>Di la palabra cuando pulses el micrófono. Se detiene a los 10 segundos.</p>
      <div className="word-naming-controls">
        {!recording.busy && !solved && <button type="button" disabled={saving} className="word-button" onClick={() => void recording.start()}><Mic size={23}/>{recording.recordingUrl ? 'Grabar otra vez' : 'Pulsar para hablar'}</button>}
        {recording.phase === 'recording' && <button type="button" className="word-button" onClick={recording.stop}><Square size={22}/> Terminar grabación</button>}
        {recording.busy && <button type="button" className="word-button is-light" onClick={recording.cancel}>Cancelar grabación</button>}
      </div>
      <p role="status" className="word-feedback">{recording.phase === 'requesting' ? 'Permite el micrófono en tu navegador para empezar.' : recording.phase === 'recording' ? 'Te escuchamos. Di la palabra a tu ritmo.' : recording.phase === 'processing' ? 'Estamos escuchando tu grabación…' : recording.message}</p>
      {recording.recordingUrl && <div className="word-recording"><label htmlFor={`recording-${target}`}>Escuchar mi grabación</label><audio id={`recording-${target}`} aria-label="Escuchar mi grabación" src={recording.recordingUrl} controls onPlay={speech.stop}/></div>}
      {recording.result && <div className="word-naming-result" role="status"><p>El sistema escuchó: <strong>«{recording.result.transcripcion}»</strong></p><p>{match ? '¡Encontramos la palabra! Puedes escuchar tu grabación y continuar.' : 'Escucha tu grabación y el modelo. Puedes volver a probar o seguir con las imágenes.'}</p>{match && !solved && <button type="button" disabled={saving} className="word-button" onClick={() => solve(target)}>{saving ? 'Guardando intento…' : '¡Ya dije la palabra!'}</button>}</div>}
      {!solved && <button type="button" disabled={saving} className="word-back" onClick={() => { recording.cancel(); setImages(true); }}>Seguir con imágenes</button>}
      <p className="word-naming-note">Al grabar, el audio se envía al servidor para reconocer palabras y no se guarda la grabación. {tracked ? 'Este intento se registra como progreso de juego y puede sumar XP.' : 'Esta visita no registra XP.'} El reconocimiento puede equivocarse y no evalúa tu pronunciación.</p>
    </> : <>
      <p>Escucha la palabra y encuentra su dibujo.</p>
      <div className="word-choice-grid">{options.map(id => <PictureButton key={id} id={id} disabled={solved || saving} onClick={() => {
        if (id === target) solve(target); else setSelectionNotice('Escucha otra vez y mira los dibujos.');
      }}/>)}</div>
      <p role="status">{selectionNotice}</p>
      {!solved && <button type="button" className="word-back" onClick={() => { setSelectionNotice(''); setImages(false); }}><RotateCcw size={18}/> Volver al micrófono</button>}
    </>}
  </section>;
}

export function NamingGame({ speech, finish, mode, patientId, focusedPhonemes = [], focusedWordLevels = [], gameVersion = 'basica-1', onProgressSaved }: {
  speech: WordSpeech;
  finish: () => void;
  mode: WordPlayMode;
  patientId: number;
  focusedPhonemes?: PhonemeTarget[];
  focusedWordLevels?: FocusedWordLevel[];
  gameVersion?: string;
  onProgressSaved?: (progress: GameProgress) => void;
}) {
  const [rounds] = useState(() => {
    const targetedWords = Array.from(new Set(focusedWordLevels
      .filter((item) => focusedPhonemes.includes(item.phoneme) && Object.prototype.hasOwnProperty.call(words, item.wordId))
      .map((item) => item.wordId as WordId)));
    const defaultWords = mode === 'gentle' ? ['cat', 'house', 'ball', 'sun', 'apple', 'dog'] : ['butterfly', 'carrot', 'snail', 'rabbit', 'banana', 'bird'];
    const pool = focusedPhonemes.length ? targetedWords : defaultWords;
    return pickRounds<WordId>(pool as WordId[], Math.min(3, pool.length));
  });
  const state = useRounds(finish, rounds.length);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const savingRef = useRef(false);
  const requestRef = useRef<AttemptData | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    requestRef.current = null;
    startedAt.current = Date.now();
    setSaveError('');
  }, [state.round]);

  if (focusedPhonemes.length > 0 && rounds.length === 0) {
    return <p role="alert" className="word-feedback">No están disponibles las palabras asociadas a los fonemas de este plan. Pide al terapeuta que revise la asignación de actividades.</p>;
  }

  const solveTarget = async (target: WordId) => {
    if (savingRef.current || state.solved) return;
    const targetLevel = focusedPhonemes.length
      ? focusedWordLevels.find((item) => item.wordId === target && focusedPhonemes.includes(item.phoneme))
      : undefined;
    if (focusedPhonemes.length > 0 && !targetLevel) {
      setSaveError('No se encontró el nivel guardado para esta palabra; este intento no se registrará.');
      state.check(true, 'Palabra explorada; puedes continuar.');
      return;
    }
    if (targetLevel) {
      savingRef.current = true;
      setSaving(true);
      setSaveError('');
      requestRef.current ??= {
        clave_intento: crypto.randomUUID(),
        version: gameVersion,
        nivel: targetLevel.level,
        respuestas: [words[target].name],
        duracion_segundos: Math.max(0, Math.min(3600, Math.floor((Date.now() - startedAt.current) / 1000))),
        ayudas_usadas: 0,
      };
      try {
        const result = await learningGames.attempt(patientId, 'LENGUAJE', requestRef.current);
        if (!result.correcto) throw new Error('El intento no se pudo registrar como completado.');
        onProgressSaved?.(result.resumen);
      } catch {
        setSaveError('No se pudo guardar este intento. Puedes volver a probar sin perder la palabra.');
        return;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    }
    state.check(true, '¡Una palabra más para tu isla!');
  };

  return <>
    <WordProgress value={state.round} total={rounds.length} label="Palabras por descubrir"/>
    <div className="word-instruction"><p>{focusedPhonemes.length ? `Palabras seleccionadas para practicar ${focusedPhonemes.join(', ')}. El reconocimiento de voz compara la palabra, no evalúa la pronunciación.` : 'Mira, escucha y prueba con tu voz.'}</p></div>
    {saveError && <p role="alert" className="word-feedback">{saveError}</p>}
    <NamingRound key={state.round} target={rounds[state.round]} speech={speech} solved={state.solved} saving={saving} tracked={focusedPhonemes.length > 0} patientId={patientId} solve={(target) => void solveTarget(target)}/>
    <RoundFooter state={state}/>
  </>;
}

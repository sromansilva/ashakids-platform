import { useState } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';
import { choiceWords, pickRounds, words, type WordId, type WordPlayMode } from './wordContent';
import { Listen, PictureButton, RoundFooter, useRounds, WordPicture, WordProgress, type WordSpeech } from './WordParts';
import { useWordRecorder } from './useWordRecorder';

function NamingRound({ target, speech, solved, solve }: {
  target: WordId; speech: WordSpeech; solved: boolean; solve: () => void;
}) {
  const recording = useWordRecorder(words[target].name, speech.stop);
  const [images, setImages] = useState(false);
  const [selectionNotice, setSelectionNotice] = useState('');
  const [options] = useState(() => choiceWords(target, [target, 'dog', 'apple', 'book'].filter((id, i, values) => values.indexOf(id) === i) as WordId[], 'gentle'));
  const match = recording.result?.comparacion?.es_coincidente === true;
  return <section className="word-naming" aria-label="Nombra el dibujo">
    <div className="word-naming-model"><WordPicture id={target} label/><Listen disabled={recording.busy} label="Escuchar la palabra" text={words[target].name} speech={speech}/></div>
    {!images ? <>
      <p>Di la palabra cuando pulses el micrófono. Se detiene a los 10 segundos.</p>
      <div className="word-naming-controls">
        {!recording.busy && !solved && <button type="button" className="word-button" onClick={() => void recording.start()}><Mic size={23}/>{recording.recordingUrl ? 'Grabar otra vez' : 'Pulsar para hablar'}</button>}
        {recording.phase === 'recording' && <button type="button" className="word-button" onClick={recording.stop}><Square size={22}/> Terminar grabación</button>}
        {recording.busy && <button type="button" className="word-button is-light" onClick={recording.cancel}>Cancelar grabación</button>}
      </div>
      <p role="status" className="word-feedback">{recording.phase === 'requesting' ? 'Permite el micrófono en tu navegador para empezar.' : recording.phase === 'recording' ? 'Te escuchamos. Di la palabra a tu ritmo.' : recording.phase === 'processing' ? 'Estamos escuchando tu grabación…' : recording.message}</p>
      {recording.recordingUrl && <div className="word-recording"><label htmlFor={`recording-${target}`}>Escuchar mi grabación</label><audio id={`recording-${target}`} aria-label="Escuchar mi grabación" src={recording.recordingUrl} controls onPlay={speech.stop}/></div>}
      {recording.result && <div className="word-naming-result" role="status"><p>El sistema escuchó: <strong>«{recording.result.transcripcion}»</strong></p><p>{match ? '¡Encontramos la palabra! Puedes escuchar tu grabación y continuar.' : 'Escucha tu grabación y el modelo. Puedes volver a probar o seguir con las imágenes.'}</p>{match && !solved && <button type="button" className="word-button" onClick={solve}>¡Ya dije la palabra!</button>}</div>}
      {!solved && <button type="button" className="word-back" onClick={() => { recording.cancel(); setImages(true); }}>Seguir con imágenes</button>}
      <p className="word-naming-note">Al grabar, el audio se envía al servidor para reconocer palabras. En este juego no se guarda la grabación ni se otorgan XP. El reconocimiento puede equivocarse y no evalúa tu pronunciación.</p>
    </> : <>
      <p>Escucha la palabra y encuentra su dibujo.</p>
      <div className="word-choice-grid">{options.map(id => <PictureButton key={id} id={id} disabled={solved} onClick={() => {
        if (id === target) solve(); else setSelectionNotice('Escucha otra vez y mira los dibujos.');
      }}/>)}</div>
      <p role="status">{selectionNotice}</p>
      {!solved && <button type="button" className="word-back" onClick={() => { setSelectionNotice(''); setImages(false); }}><RotateCcw size={18}/> Volver al micrófono</button>}
    </>}
  </section>;
}

export function NamingGame({ speech, finish, mode }: { speech: WordSpeech; finish: () => void; mode: WordPlayMode }) {
  const [rounds] = useState(() => pickRounds<WordId>(mode === 'gentle' ? ['cat', 'house', 'ball', 'sun', 'apple', 'dog'] : ['butterfly', 'carrot', 'snail', 'rabbit', 'banana', 'bird']));
  const state = useRounds(finish, rounds.length);
  return <>
    <WordProgress value={state.round} total={rounds.length} label="Palabras por descubrir"/>
    <div className="word-instruction"><p>Mira, escucha y prueba con tu voz.</p></div>
    <NamingRound key={state.round} target={rounds[state.round]} speech={speech} solved={state.solved} solve={() => state.check(true, '¡Una palabra más para tu isla!')}/>
    <RoundFooter state={state}/>
  </>;
}

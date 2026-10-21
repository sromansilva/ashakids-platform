import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Hand, Volume2, VolumeX } from 'lucide-react';
import { SoundTutorialScene } from './SoundTutorialScene';
import type { SoundGameId } from './soundGames';
import type { SoundAudio } from './useSoundAudio';

export function SoundTutorial({ title, gameId, goal, steps, audio, onSpeak, onStart }: {
  title: string; gameId: SoundGameId; goal: string; steps: readonly string[]; audio: SoundAudio;
  onSpeak: () => void; onStart: () => void;
}) {
  const [step, setStep] = useState(0);
  return <section className="sound-tutorial" aria-label={`Tutorial: ${title}`}>
    <header className="sound-tutorial-heading"><div><span>Antes de empezar</span><h3>¡Probemos juntos!</h3></div><button type="button" className="sound-button is-secondary" disabled={audio.muted} onClick={onSpeak}><Volume2 size={20}/> Escuchar instrucciones</button></header>
    <div className="sound-tutorial-body">
      <div className="sound-tutorial-scene">
        <span className="sound-tutorial-scene-label">Prueba cómo se juega</span>
        <SoundTutorialScene gameId={gameId} audio={audio}/>
        <p>{audio.muted ? <><VolumeX size={16}/> Activa el sonido para probar</> : <><Hand size={16}/> Toca y juega el ejemplo</>}</p>
      </div>
      <div className="sound-tutorial-guide">
        <div className="sound-tutorial-progress" role="group" aria-label="Pasos del tutorial">
          {steps.map((_, index) => <button key={index} type="button" aria-label={`Ver paso ${index + 1}`} aria-pressed={step === index} onClick={() => setStep(index)}><span>{index < step ? <Check size={15}/> : index + 1}</span></button>)}
        </div>
        <p className="sound-tutorial-count">Paso {step + 1} de {steps.length}</p>
        <p className="sound-tutorial-goal">{goal}</p>
        <p className="sound-tutorial-instruction" aria-live="polite">{steps[step]}</p>
        <div className="sound-tutorial-actions">
          <button type="button" className="sound-button is-secondary" disabled={step === 0} onClick={() => setStep(value => value - 1)}><ArrowLeft size={18}/> Atrás</button>
          {step < steps.length - 1 && <button type="button" className="sound-button is-secondary" onClick={() => setStep(value => value + 1)}>Siguiente paso <ArrowRight size={18}/></button>}
          <button type="button" className="sound-button" onClick={onStart}>¡Vamos a jugar! <ArrowRight size={18}/></button>
        </div>
      </div>
    </div>
  </section>;
}

import { useEffect, useState, type CSSProperties, type DragEvent, type PointerEventHandler, type ReactNode } from 'react';
import { Check, CircleCheck, Hand, RotateCcw, Sparkles, Star, Volume2, X } from 'lucide-react';
import type { SoundAnimal } from './soundContent';

export function SoundGamePicture({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return <span className="sound-game-art word-game-art">{failed ? <span className="sound-image-error">{title} · imagen no disponible</span> : <img src={src} alt="" width="320" height="320" draggable={false} onError={() => setFailed(true)}/>}</span>;
}

export function AnimalPicture({ animal }: { animal: SoundAnimal }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return <span className={`sound-picture ${loaded ? 'is-loaded' : ''}`}>
    {failed ? <span className="sound-image-error">Imagen no disponible: {animal.name}</span> : <img src={animal.image} alt="" width="240" height="240" draggable={false} onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/>}
  </span>;
}
export function AnimalCard({ animal, onClick, active, completed, incorrect, voice, disabled, onDrop, label, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }: {
  animal: SoundAnimal; onClick: () => void; active?: boolean; completed?: boolean; incorrect?: boolean; voice?: boolean;
  disabled?: boolean; onDrop?: (event: DragEvent<HTMLButtonElement>) => void; label?: string;
  onPointerDown?: PointerEventHandler<HTMLButtonElement>; onPointerMove?: PointerEventHandler<HTMLButtonElement>;
  onPointerUp?: PointerEventHandler<HTMLButtonElement>; onPointerCancel?: PointerEventHandler<HTMLButtonElement>;
}) {
  return <button type="button" className={`sound-animal ${active ? 'is-active' : ''} ${completed ? 'is-complete' : ''} ${incorrect ? 'is-incorrect' : ''}`} style={{ '--animal-soft': animal.color } as CSSProperties}
    aria-label={label ?? animal.name} aria-pressed={active} disabled={disabled} onClick={onClick} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onDragOver={event => { if (onDrop) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }} onDrop={onDrop}>
    <span className="sound-card-check" aria-hidden="true">{incorrect ? <X size={18}/> : completed ? <Check size={18}/> : <Volume2 size={18}/>}</span>
    <AnimalPicture animal={animal}/><strong>{animal.name}</strong>
    <span className="sound-card-caption">{incorrect ? 'Intenta otra vez' : completed ? '¡Encontrado!' : active ? 'Seleccionado' : voice ? animal.voice : 'Toca aquí'}</span>
    {onDrop && <span className={`sound-pair-slot ${completed ? 'is-filled' : ''}`}><Volume2 size={16} aria-hidden="true"/>{completed ? 'Sonido en su lugar' : 'Pon aquí su sonido'}{completed && <Check size={16} aria-hidden="true"/>}</span>}
    {completed && <span className="sound-sr">Completado</span>}
  </button>;
}
export function SoundFeedback({ message, tone = 'neutral' }: { message: string; tone?: 'neutral' | 'success' | 'retry' }) {
  return <p className="sound-feedback" role="status" data-tone={tone}>
    <span className="sound-feedback-icon" aria-hidden="true">{tone === 'success' ? <CircleCheck size={22}/> : tone === 'retry' ? <RotateCcw size={20}/> : <Volume2 size={20}/>}</span>
    <span>{message}</span>
  </p>;
}
export function SoundProgress({ value, total, label }: { value: number; total: number; label: string }) {
  return <div className="sound-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
    <span>{label}</span><span className="sound-progress-dots" aria-hidden="true">{Array.from({ length: total }, (_, i) => <span key={i} className={i < value ? 'is-done' : ''}>{i < value ? <Check size={14}/> : i + 1}</span>)}</span><span>{value}/{total}</span>
  </div>;
}
export function SoundCelebration({ title, children, repeat, next, nextLabel = 'Elegir otro juego', onComplete }: {
  title: string; children: ReactNode; repeat: () => void; next: () => void; nextLabel?: string; onComplete?: () => void;
}) {
  useEffect(() => { onComplete?.(); }, [onComplete]);
  return <section className="sound-celebration" aria-label="Actividad completada">
    <div className="sound-celebration-stars" aria-hidden="true"><Sparkles/><Star fill="currentColor" size={58}/><Sparkles/></div>
    <h3 tabIndex={-1} ref={node => node?.focus()}>{title}</h3><p>{children}</p>
    <div className="sound-actions"><button type="button" className="sound-button is-secondary" onClick={repeat}><RotateCcw size={20}/> Otra vez</button><button type="button" className="sound-button" onClick={next}>{nextLabel}</button></div>
  </section>;
}
export function MatchDemo() {
  return <div className="sound-match-demo"><Hand size={24} aria-hidden="true"/><span>Toca un altavoz, escucha y toca su animal. También puedes arrastrarlo.</span></div>;
}

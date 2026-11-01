import { useState } from 'react';
import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';

const audiences = [
  { title: 'Familias', image: 'family', description: 'El terapeuta orienta a la familia y comparte las notas de cada sesión para acompañar la práctica en casa.' },
  { title: 'Terapeutas', image: 'therapist', description: 'El terapeuta organiza las sesiones, define el plan de atención y da seguimiento a las actividades de cada niño.' },
  { title: 'Mundo ASHA', image: 'world', description: 'El terapeuta selecciona los mundos de práctica para cada niño. La familia acompaña las actividades entre sesiones.' },
];

export function LandingAudience() {
  const [flipped, setFlipped] = useState<string[]>([]);
  function toggle(title: string) {
    setFlipped(current => current.includes(title) ? current.filter(item => item !== title) : [...current, title]);
  }
  return <section className="landing-audience"><div className="landing-audience-container">
    <h2><span className="landing-heading-rays" aria-hidden="true"/>Un equipo para acompañar <span>cada paso</span><span className="landing-heading-rays" aria-hidden="true"/></h2>
    <div className="landing-audience-grid">{audiences.map((audience, index) => {
      const isFlipped = flipped.includes(audience.title);
      return <button type="button" key={audience.title} className={`landing-flip-card ${isFlipped ? 'is-flipped' : ''}`} aria-label={`${isFlipped ? 'Volver a la imagen de' : 'Ver información de'} ${audience.title}`} aria-expanded={isFlipped} aria-controls={`audience-info-${index}`} onClick={() => toggle(audience.title)}>
        <span className="landing-flip-inner">
          <span className="landing-flip-face landing-flip-front" aria-hidden={isFlipped}>
            <PublicIllustration src={`/illustrations/${audience.image}-v1.png`} alt="" width={176} height={176} loading="lazy"/>
            <strong>{audience.title}</strong>
          </span>
          <span id={`audience-info-${index}`} className="landing-flip-face landing-flip-back" aria-hidden={!isFlipped}>
            <strong>{audience.title}</strong><span>{audience.description}</span>
            <small>Vuelve a pulsar para ver la imagen</small>
          </span>
        </span>
      </button>;
    })}</div>
  </div></section>;
}

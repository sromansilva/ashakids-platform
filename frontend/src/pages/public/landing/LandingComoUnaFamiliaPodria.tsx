import type { useLanding } from './useLanding';
import { Quote } from 'lucide-react';
type Props = Pick<ReturnType<typeof useLanding>, 'testimonials'>;
export function LandingComoUnaFamiliaPodria({ testimonials }: Props) {
  return <section className="landing-section landing-stories"><div className="landing-container">
    <div className="landing-section-heading"><h2>Cómo una familia podría<br/><span>usar la plataforma</span></h2><p>Ejemplos ficticios para el prototipo · No representan casos clínicos reales</p></div>
    <div className="landing-story-grid">{testimonials.map(t => <figure key={t.name} className="landing-glass landing-story"><Quote size={30} aria-hidden="true"/><blockquote>{t.text}</blockquote><figcaption><span className="landing-story-avatar" style={{background:t.color}} aria-hidden="true">{t.av}</span><span><strong>{t.name}</strong><span>{t.child}</span></span></figcaption></figure>)}</div>
  </div></section>;
}

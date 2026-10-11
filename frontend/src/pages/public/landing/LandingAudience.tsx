import { ArrowRight } from 'lucide-react';
import type { View } from '@/types/navigation';

const audiences: { title: string; description: string; image: string; view: View }[] = [
  { title: 'Familias', description: 'Acompaña su camino', image: 'family', view: 'login' },
  { title: 'Terapeutas', description: 'Conecta y da seguimiento', image: 'therapist', view: 'public/especialistas' },
  { title: 'Mundo ASHA', description: 'Descubre y aprende jugando', image: 'world', view: 'public/mundo' },
];

export function LandingAudience({ go }: { go: (view: View) => void }) {
  return <section className="landing-audience"><div className="landing-audience-container">
    <h2><span className="landing-heading-rays" aria-hidden="true"/>Un equipo para acompañar <span>cada paso</span><span className="landing-heading-rays" aria-hidden="true"/></h2>
    <div className="landing-audience-grid">{audiences.map(audience => <button type="button" key={audience.title} className="asha-card asha-glass landing-audience-card" onClick={() => go(audience.view)}>
      <img src={`/illustrations/${audience.image}-v1.png`} alt="" width={176} height={176}/>
      <span className="landing-audience-copy"><strong>{audience.title}</strong><span>{audience.description}</span></span>
      <span className="landing-audience-arrow" aria-hidden="true"><ArrowRight size={22}/></span>
    </button>)}</div>
  </div></section>;
}

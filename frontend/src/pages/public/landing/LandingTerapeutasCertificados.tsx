import type { useLanding } from './useLanding';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { therapists } from '@/mocks/demo';
type Props = Pick<ReturnType<typeof useLanding>, 'go'>;
export function LandingTerapeutasCertificados({ go }: Props) {
  return <section className="landing-section landing-team"><div className="landing-container">
    <div className="landing-heading-row"><div className="landing-section-heading"><h2>Terapeutas certificados<br/><span>y comprometidos</span></h2></div><Btn variant="outline" onClick={() => go('login')}>Ver todos <ArrowRight size={17}/></Btn></div>
    <div className="landing-team-grid">{therapists.slice(0,3).map((t,i) => <article key={t.id} className={`landing-glass landing-therapist landing-therapist-${i}`}>
      <div className="landing-therapist-portrait" aria-hidden="true"><span>{t.av}</span><div className="landing-portrait-orbit"/></div>
      <div className="landing-therapist-info"><h3>{t.name}</h3><p>{t.specialty}</p><ul className="landing-tags">{t.tags.map(tag => <li key={tag}>{tag}</li>)}<li>{t.experience}</li></ul><Btn size="sm" variant={t.available ? 'primary' : 'outline'} disabled={!t.available} onClick={() => go('login')}>{t.available ? <>Agendar <ArrowUpRight size={16}/></> : 'No disponible'}</Btn></div>
    </article>)}</div>
  </div></section>;
}

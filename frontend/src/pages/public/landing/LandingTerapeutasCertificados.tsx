import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import type { useLanding } from './useLanding';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { therapists } from '@/mocks/demo';
type Props = Pick<ReturnType<typeof useLanding>, 'go'>;
export function LandingTerapeutasCertificados({ go }: Props) {
  return <section id="landing-specialists" className="landing-section landing-team"><div className="landing-container">
    <div className="landing-heading-row"><div className="landing-section-heading landing-team-heading"><PublicIllustration src="/illustrations/team-care-v54.png" alt="" loading="lazy" width={180} height={160}/><h2>Terapeutas certificados<br/><span>y comprometidos</span></h2></div><Btn variant="outline" className="asha-btn asha-btn--outline" onClick={() => go('public/especialistas')}>Ver todos <ArrowRight size={17}/></Btn></div>
    <p className="landing-demo-note">Perfiles de demostración · Credenciales y disponibilidad por confirmar en la agenda.</p><div className="landing-team-grid">{therapists.slice(0,3).map((t,i) => <article key={t.id} className={`asha-card asha-glass landing-glass landing-therapist landing-therapist-${i}`}>
      <div className="landing-therapist-portrait" aria-hidden="true"><span>{t.av}</span><div className="landing-portrait-orbit"/></div>
      <div className="landing-therapist-info"><h3>{t.name}</h3><p>{t.specialty}</p><ul className="landing-tags">{t.tags.map(tag => <li key={tag}>{tag}</li>)}<li>{t.experience}</li></ul><Btn size="sm" className="asha-btn asha-btn--sm asha-btn--outline" variant="outline" onClick={() => go('login')}>Agendar <ArrowUpRight size={16}/></Btn></div>
    </article>)}</div>
  </div></section>;
}

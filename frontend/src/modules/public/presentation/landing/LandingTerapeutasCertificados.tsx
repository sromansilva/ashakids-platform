import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { therapists } from '@/shared/domain/mocks/demo';
export function LandingTerapeutasCertificados() {
  return <section id="landing-specialists" className="landing-section landing-team"><div className="landing-container">
    <div className="landing-heading-row"><div className="landing-section-heading landing-team-heading"><PublicIllustration src="/illustrations/team-care-v54.png" alt="" loading="lazy" width={180} height={160}/><h2>Terapeutas certificados<br/><span>y comprometidos</span></h2></div></div>
    <div className="landing-team-grid">{therapists.slice(0,3).map((t,i) => <article key={t.id} className={`asha-card asha-glass landing-glass landing-therapist landing-therapist-${i}`}>
      <div className="landing-therapist-portrait" aria-hidden="true"><span>{t.av}</span><div className="landing-portrait-orbit"/></div>
      <div className="landing-therapist-info"><h3>{t.name}</h3><p>{t.specialty}</p><ul className="landing-tags">{t.tags.map(tag => <li key={tag}>{tag}</li>)}<li>{t.experience}</li></ul></div>
    </article>)}</div>
  </div></section>;
}

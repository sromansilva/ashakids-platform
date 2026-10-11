import { useEffect } from 'react';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { useLanding } from './useLanding';
import { LandingConsejosDeTerapia } from './LandingConsejosDeTerapia';
import { LandingElApoyoQue } from './LandingElApoyoQue';
import { LandingTerapeutasCertificados } from './LandingTerapeutasCertificados';
import { LandingTerapiasEspecializadas } from './LandingTerapiasEspecializadas';
import { LandingComoUnaFamiliaPodria } from './LandingComoUnaFamiliaPodria';
import { ChevronDown, ClipboardPenLine, Search, CalendarDays, CircleHelp } from 'lucide-react';
import { PublicNav } from '@/pages/public/Public/PublicNav';
import { PublicFooter } from '@/pages/public/Public/PublicFooter';
import { LandingAudience } from './LandingAudience';
import { AshhiFloat } from '@/components/assistant/AshhiFloat';
import './landing-kit.css';
import './landing.css';
import './landing-reference.css';
import './landing-continuity.css';
import './landing-unified.css';
import { LandingWorlds } from './LandingWorlds';
const stepIcons = [ClipboardPenLine, Search, CalendarDays];
const stepArt = ['step-account-v54', 'step-specialist-v54', 'step-session-v54'];
export function Landing(props: Parameters<typeof useLanding>[0]) {
  const { go, faqOpen, setFaqOpen, email, setEmail, newsletterConsent, setNewsletterConsent, newsletterSubmitting, newsletterMessage, newsletterError, submitNewsletter, services, steps, testimonials, faqs } = useLanding(props);
  useEffect(() => {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical'; canonical.href = `${window.location.origin}/`;
    document.head.append(canonical);
    return () => canonical.remove();
  }, []);
  return <div className="asha-landing asha-ui asha-unified">
    <a className="landing-skip" href="#landing-content">Saltar al contenido</a>
    <PublicNav go={go} cur="landing"/>
    <main id="landing-content">
      <LandingElApoyoQue go={go}/>
      <LandingAudience go={go}/>
      <section id="landing-steps" className="landing-section landing-steps"><div className="landing-container">
        <div className="landing-section-heading"><h2>Comenzar es<br/> <span>muy sencillo</span></h2></div>
        <ol className="landing-step-list">{steps.map((step,i) => {const Icon = stepIcons[i]; return <li key={step.n}><div className="landing-step-marker"><Icon size={27} strokeWidth={1.6}/><span>{step.n}</span></div><PublicIllustration className="landing-step-illustration" src={`/illustrations/${stepArt[i]}.png`} alt="" loading="lazy" width={180} height={180}/><h3>{step.title}</h3><p>{step.desc}</p></li>;})}</ol>
      </div></section>
      <LandingWorlds/>
      <LandingTerapiasEspecializadas services={services} go={go}/>
      <LandingTerapeutasCertificados go={go}/><LandingComoUnaFamiliaPodria testimonials={testimonials}/>
      <section id="landing-faq" className="landing-section landing-faq"><div className="landing-container landing-faq-layout">
        <div className="landing-section-heading"><h2>Preguntas<br/><span>frecuentes</span></h2><div className="landing-faq-illustration" aria-hidden="true"><PublicIllustration src="/illustrations/faq-ashi-v54.png" alt="" loading="lazy" width={320} height={280}/><span><CircleHelp size={36}/></span></div></div>
        <div className="landing-faq-list">{faqs.map((faq,i) => <div key={faq.q} className={`landing-faq-item ${faqOpen===i ? 'is-open' : ''}`}>
          <h3><button type="button" aria-expanded={faqOpen===i} aria-controls={`landing-faq-${i}`} onClick={() => setFaqOpen(faqOpen===i ? null : i)}>{faq.q}<ChevronDown size={20}/></button></h3>
          {faqOpen===i && <div id={`landing-faq-${i}`} className="landing-faq-answer"><p>{faq.a}</p></div>}
        </div>)}</div>
      </div></section>
      <LandingConsejosDeTerapia email={email} setEmail={setEmail} newsletterConsent={newsletterConsent} setNewsletterConsent={setNewsletterConsent} newsletterSubmitting={newsletterSubmitting} newsletterMessage={newsletterMessage} newsletterError={newsletterError} submitNewsletter={submitNewsletter}/>
    </main><PublicFooter go={go} landing/>
    <AshhiFloat role={null} appearance="landing"/>
  </div>;
}

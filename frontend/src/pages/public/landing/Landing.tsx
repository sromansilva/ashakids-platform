import { useLanding } from './useLanding';
import { LandingConsejosDeTerapia } from './LandingConsejosDeTerapia';
import { LandingElApoyoQue } from './LandingElApoyoQue';
import { LandingTerapeutasCertificados } from './LandingTerapeutasCertificados';
import { LandingTerapiasEspecializadas } from './LandingTerapiasEspecializadas';
import { LandingComoUnaFamiliaPodria } from './LandingComoUnaFamiliaPodria';
import { ChevronDown, ClipboardPenLine, Search, CalendarDays } from 'lucide-react';
import { PublicNav } from '@/pages/public/Public/PublicNav';
import { PublicFooter } from '@/pages/public/Public/PublicFooter';
import './landing.css';
const stepIcons = [ClipboardPenLine, Search, CalendarDays];
export function Landing(props: Parameters<typeof useLanding>[0]) {
  const { go, faqOpen, setFaqOpen, email, setEmail, services, steps, testimonials, faqs } = useLanding(props);
  return <div className="asha-landing">
    <a className="landing-skip" href="#landing-content">Saltar al contenido</a>
    <PublicNav go={go} cur="landing"/>
    <main id="landing-content">
      <LandingElApoyoQue go={go}/><LandingTerapiasEspecializadas services={services} go={go}/>
      <section className="landing-section landing-steps"><div className="landing-container">
        <div className="landing-section-heading"><h2>Comenzar es<br/><span>muy sencillo</span></h2></div>
        <ol className="landing-step-list">{steps.map((step,i) => {const Icon = stepIcons[i]; return <li key={step.n}><div className="landing-step-marker"><Icon size={27} strokeWidth={1.6}/><span>{step.n}</span></div><h3>{step.title}</h3><p>{step.desc}</p></li>;})}</ol>
      </div></section>
      <LandingTerapeutasCertificados go={go}/><LandingComoUnaFamiliaPodria testimonials={testimonials}/>
      <section className="landing-section landing-faq"><div className="landing-container landing-faq-layout">
        <div className="landing-section-heading"><h2>Preguntas<br/><span>frecuentes</span></h2></div>
        <div className="landing-faq-list">{faqs.map((faq,i) => <div key={faq.q} className={`landing-faq-item ${faqOpen===i ? 'is-open' : ''}`}>
          <h3><button type="button" aria-expanded={faqOpen===i} aria-controls={`landing-faq-${i}`} onClick={() => setFaqOpen(faqOpen===i ? null : i)}>{faq.q}<ChevronDown size={20}/></button></h3>
          {faqOpen===i && <div id={`landing-faq-${i}`} className="landing-faq-answer"><p>{faq.a}</p></div>}
        </div>)}</div>
      </div></section>
      <LandingConsejosDeTerapia email={email} setEmail={setEmail}/>
    </main><PublicFooter go={go}/>
  </div>;
}

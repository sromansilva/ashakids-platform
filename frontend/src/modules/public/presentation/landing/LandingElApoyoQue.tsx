import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { ArrowRight, AudioLines } from 'lucide-react';
import { ACCOUNT_REQUEST_WHATSAPP_URL } from '@/shared/domain/contact';

export function LandingElApoyoQue() {
  return <section className="landing-hero landing-reference-hero">
    <div className="landing-container landing-hero-layout">
      <div className="landing-hero-copy">
        <p className="landing-purpose">Terapia de lenguaje infantil</p>
        <h1>Cada palabra,<br/><span className="landing-title-line">un pequeño <span>gran paso.</span></span></h1>
        <p className="landing-intro">Un espacio para conectar a familias y terapeutas,<br className="landing-desktop-break"/> acompañar su desarrollo y aprender jugando.</p>
        <div className="landing-hero-actions">
          <a href={ACCOUNT_REQUEST_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="asha-btn asha-btn--lg landing-primary" aria-label="Solicitar información de cuenta por WhatsApp">
            Solicitar cuenta <ArrowRight size={20}/>
          </a>
          <a className="asha-btn asha-btn--outline asha-btn--lg" href="#landing-specialists">Explorar terapeutas</a>
        </div>
      </div>
      <div className="landing-ashi-scene">
        <PublicIllustration className="landing-ashi-hero" sizes="(max-width: 1023px) 100vw, 620px" src="/illustrations/ashi-hero-v1.png" alt="Ashi, robot blanco y violeta con sonrisa luminosa y corazón verde agua, saluda junto a bloques de letras." fetchPriority="high"/>
        <div className="landing-ashi-bubble"><strong>¡Hola! Soy Ashi</strong><span>Tu asistente de IA</span></div>
        <AudioLines className="landing-voice-decoration" size={40} strokeWidth={2.2} aria-hidden="true"/>
      </div>
    </div>
  </section>;
}

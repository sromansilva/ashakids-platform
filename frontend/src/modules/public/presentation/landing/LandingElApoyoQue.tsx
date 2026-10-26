import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import type { useLanding } from './useLanding';
import { ArrowRight, AudioLines } from 'lucide-react';
import { Btn } from '@/shared/presentation/components/common/Btn';

type Props = Pick<ReturnType<typeof useLanding>, 'go'>;
export function LandingElApoyoQue({ go }: Props) {
  return <section className="landing-hero landing-reference-hero">
    <div className="landing-container landing-hero-layout">
      <div className="landing-hero-copy">
        <p className="landing-purpose">Terapia de lenguaje infantil</p>
        <h1>Cada palabra,<br/><span className="landing-title-line">un pequeño <span>gran paso.</span></span></h1>
        <p className="landing-intro">Un espacio para conectar a familias y terapeutas,<br className="landing-desktop-break"/> acompañar su desarrollo y aprender jugando.</p>
        <div className="landing-hero-actions">
          <Btn size="lg" className="asha-btn asha-btn--lg landing-primary" onClick={() => go('register')}>Solicitar cuenta <ArrowRight size={24}/></Btn>
          <a className="asha-btn asha-btn--outline asha-btn--lg" href="#landing-specialists">Explorar terapeutas</a>
        </div>
      </div>
      <div className="landing-ashi-scene">
        <PublicIllustration className="landing-ashi-hero" sizes="(max-width: 1023px) 100vw, 930px" src="/illustrations/ashi-hero-v1.png" alt="Ashi, robot blanco y violeta con sonrisa luminosa y corazón verde agua, saluda junto a bloques de letras." fetchPriority="high"/>
        <div className="landing-ashi-bubble"><strong>¡Hola! Soy Ashi</strong><span>Tu asistente de IA</span></div>
        <AudioLines className="landing-voice-decoration" size={72} strokeWidth={2.2} aria-hidden="true"/>
      </div>
    </div>
  </section>;
}

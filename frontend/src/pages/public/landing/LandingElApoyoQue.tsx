import type { useLanding } from './useLanding';
import { ArrowRight, AudioLines, Check } from 'lucide-react';
import { Btn } from '@/components/common/Btn';

type Props = Pick<ReturnType<typeof useLanding>, 'go'>;
export function LandingElApoyoQue({ go }: Props) {
  return <section className="landing-hero landing-reference-hero">
    <div className="landing-container landing-hero-layout">
      <div className="landing-hero-copy">
        <p className="landing-purpose">Terapia de lenguaje infantil</p>
        <h1>Cada palabra,<br/><span className="landing-title-line">un pequeño <span>gran paso.</span></span></h1>
        <p className="landing-intro">Un espacio para conectar a familias y terapeutas,<br className="landing-desktop-break"/> acompañar su desarrollo y aprender jugando.</p>
        <div className="landing-hero-actions">
          <Btn size="lg" className="asha-btn asha-btn--lg landing-primary" onClick={() => go('public/nosotros')}>Conocer ASHAKids <ArrowRight size={24}/></Btn>
          <Btn size="lg" variant="outline" className="asha-btn asha-btn--outline asha-btn--lg" onClick={() => go('public/mundo')}>Explorar Mundo ASHA</Btn>
        </div>
        <ul className="landing-benefits">
          <li><Check size={24}/><span>Acompañamiento familiar</span></li>
          <li><Check size={24}/><span>Aprendizaje con juego</span></li>
        </ul>
      </div>
      <div className="landing-ashi-scene">
        <img className="landing-ashi-hero" src="/illustrations/ashi-hero-v1.png" alt="Ashi, robot blanco y violeta con sonrisa luminosa y corazón verde agua, saluda junto a bloques de letras." fetchPriority="high"/>
        <div className="landing-ashi-bubble"><strong>¡Hola! Soy Ashi</strong><span>Tu asistente de IA</span><small>Demostración</small></div>
        <AudioLines className="landing-voice-decoration" size={72} strokeWidth={2.2} aria-hidden="true"/>
      </div>
    </div>
  </section>;
}

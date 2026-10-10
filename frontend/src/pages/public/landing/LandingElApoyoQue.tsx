import type { useLanding } from './useLanding';
import { ArrowRight, AudioLines, MessageCircle, ShieldCheck, Target } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
type Props = Pick<ReturnType<typeof useLanding>, 'go'>;
export function LandingElApoyoQue({ go }: Props) {
  return <section className="landing-hero">
    <div className="landing-container landing-hero-layout">
      <div className="landing-hero-copy">
        <h1>El apoyo que<br/>tu hijo necesita,<br/><span>en un solo lugar</span></h1>
        <p className="landing-intro">Conecta con terapeutas certificados, agenda sesiones virtuales y acompaña el desarrollo de tu hijo desde cualquier lugar.</p>
        <Btn size="lg" variant="cta" onClick={() => go('login')} className="landing-primary">Iniciar sesión <ArrowRight size={19}/></Btn>
        <p className="landing-purpose">Plataforma de apoyo para terapia de lenguaje infantil</p>
      </div>
      <div className="landing-language-art" aria-hidden="true">
        <div className="landing-art-orbit"/>
        <div className="landing-letter landing-letter-h">h</div><div className="landing-letter landing-letter-o">o</div>
        <div className="landing-letter landing-letter-l">l</div><div className="landing-letter landing-letter-a">a</div>
        <div className="landing-art-voice"><AudioLines size={40} strokeWidth={1.6}/></div>
        <div className="landing-art-chat"><MessageCircle size={44} strokeWidth={1.5}/></div>
        <div className="landing-art-caption">Cada palabra cuenta.</div>
      </div>
    </div>
    <ul className="landing-container landing-benefits">
      <li><AudioLines size={22}/><span>Terapia del Lenguaje</span></li>
      <li><Target size={22}/><span>Sesiones personalizadas</span></li>
      <li><ShieldCheck size={22}/><span>Privacidad y acompañamiento</span></li>
    </ul>
  </section>;
}

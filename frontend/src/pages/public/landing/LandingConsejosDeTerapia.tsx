import type { useLanding } from './useLanding';
import { ArrowRight, Mail } from 'lucide-react';
type Props = Pick<ReturnType<typeof useLanding>, 'email' | 'setEmail'>;
export function LandingConsejosDeTerapia({ email, setEmail }: Props) {
  return <section className="landing-section landing-newsletter"><div className="landing-container landing-newsletter-panel">
    <div><h2>Consejos de terapia<br/>directamente en tu correo</h2><p>Cada semana, ejercicios y tips de nuestros especialistas para estimular el desarrollo de tu hijo en casa.</p></div>
    <div className="landing-newsletter-controls"><label htmlFor="landing-email">Newsletter semanal · Gratis</label><div className="landing-email-row"><Mail size={20} aria-hidden="true"/><input id="landing-email" type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)}/></div><button type="button">Suscribirme gratis <ArrowRight size={17}/></button><p>Sin spam. Cancela cuando quieras. Solo información relevante sobre terapia de lenguaje.</p></div>
  </div></section>;
}

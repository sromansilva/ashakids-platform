import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import type { useLanding } from './useLanding';
import { ArrowRight, Mail } from 'lucide-react';
type Props = Pick<ReturnType<typeof useLanding>, 'email' | 'setEmail' | 'newsletterConsent' | 'setNewsletterConsent' | 'newsletterSubmitting' | 'newsletterMessage' | 'newsletterError' | 'submitNewsletter'>;
export function LandingConsejosDeTerapia({ email, setEmail, newsletterConsent, setNewsletterConsent, newsletterSubmitting, newsletterMessage, newsletterError, submitNewsletter }: Props) {
  return <section className="landing-section landing-newsletter"><div className="landing-container landing-newsletter-panel">
    <div className="landing-newsletter-copy"><PublicIllustration src="/illustrations/newsletter-v54.png" alt="" loading="lazy" width={160} height={170}/><div><h2>Consejos de terapia<br/>directamente en tu correo</h2><p>Cada semana, ejercicios y tips de nuestros especialistas para estimular el desarrollo de tu hijo en casa.</p></div></div>
    <form className="landing-newsletter-controls" onSubmit={e => { e.preventDefault(); void submitNewsletter(); }}>
      <label htmlFor="landing-email">Newsletter semanal · Gratis</label>
      <div className="landing-email-row"><Mail size={20} aria-hidden="true"/><input id="landing-email" name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={Boolean(newsletterError)}/></div>
      <label className="landing-newsletter-consent"><input type="checkbox" checked={newsletterConsent} onChange={e => setNewsletterConsent(e.target.checked)}/><span>Acepto recibir consejos y novedades de ASHAKids.</span></label>
      <button className="asha-btn" type="submit" disabled={newsletterSubmitting}>{newsletterSubmitting ? "Enviando…" : "Suscribirme gratis"} <ArrowRight size={17}/></button>
      {newsletterMessage && <p className="landing-newsletter-status" role="status">{newsletterMessage}</p>}
      {newsletterError && <p className="landing-newsletter-status" role="alert">{newsletterError}</p>}
      <p>Sin spam. Cancela cuando quieras. Solo información relevante sobre terapia de lenguaje.</p>
    </form>
  </div></section>;
}

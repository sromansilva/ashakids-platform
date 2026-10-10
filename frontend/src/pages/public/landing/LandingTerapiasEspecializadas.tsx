import type { useLanding } from './useLanding';
import { ArrowUpRight, AudioLines, MessageCircle } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
type Props = Pick<ReturnType<typeof useLanding>, 'services' | 'go'>;
export function LandingTerapiasEspecializadas({ services, go }: Props) {
  return <section className="landing-section landing-services">
    <div className="landing-container landing-service-layout">
      <div className="landing-section-heading"><h2>Terapias especializadas<br/><span>para cada niño</span></h2><p>Cada niño es único. Nuestros especialistas diseñan planes personalizados para potenciar las fortalezas de tu hijo.</p></div>
      {services.map(service => <article key={service.title} className="landing-glass landing-service-card">
        <div className="landing-service-art" aria-hidden="true"><MessageCircle size={90} strokeWidth={1.2}/><AudioLines size={48} strokeWidth={1.5}/></div>
        <div className="landing-service-copy"><h3>{service.title}</h3><p>{service.desc}</p><Btn variant="outline" onClick={() => go('login')}>Iniciar sesión <ArrowUpRight size={17}/></Btn></div>
      </article>)}
    </div>
  </section>;
}

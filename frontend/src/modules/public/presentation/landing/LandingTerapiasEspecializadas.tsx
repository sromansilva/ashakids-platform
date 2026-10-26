import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import type { useLanding } from './useLanding';
import { ArrowUpRight, AudioLines, MessageCircle } from 'lucide-react';
type Props = Pick<ReturnType<typeof useLanding>, 'services' | 'go'>;
export function LandingTerapiasEspecializadas({ services }: Props) {
  return <section className="landing-section landing-services">
    <div className="landing-container landing-service-layout">
      <div className="landing-section-heading"><h2>Terapias especializadas<br/><span>para cada niño</span></h2><p>Cada niño es único. Nuestros especialistas diseñan planes personalizados para potenciar las fortalezas de tu hijo.</p></div>
      {services.map(service => <article key={service.title} className="asha-card asha-glass landing-glass landing-service-card">
        <div className="landing-service-art" aria-hidden="true"><PublicIllustration src="/illustrations/therapy-play-v54.png" alt="" loading="lazy" width={230} height={230}/><span className="landing-service-speech"><MessageCircle size={34} strokeWidth={1.8}/><AudioLines size={24} strokeWidth={1.8}/></span></div>
        <div className="landing-service-copy"><h3>{service.title}</h3><p>{service.desc}</p><a className="landing-context-link" href="#landing-specialists">Conocer especialistas <ArrowUpRight size={17}/></a></div>
      </article>)}
    </div>
  </section>;
}

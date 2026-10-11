import { useQuery } from '@tanstack/react-query';
import { learningGames } from '@/services/learningGames';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { ArrowRight } from 'lucide-react';
import type { View } from '@/types/navigation';
import { Btn } from '@/components/common/Btn';
import { PublicNav } from '@/pages/public/Public/PublicNav';
import { PublicFooter } from '@/pages/public/Public/PublicFooter';
import '../landing/landing-kit.css';
import '../landing/landing.css';
import '../landing/landing-reference.css';
import '../landing/landing-continuity.css';
import './public-mundo.css';

const worldArt = { HABLA: 'habla', LENGUAJE: 'lenguaje', FLUIDEZ: 'fluidez', VOZ: 'voz', OROFACIAL: 'orofacial' };

export function PublicMundo({ go }: { go: (v: View) => void }) {
  const catalog = useQuery({ queryKey: ['public-basic-worlds'], queryFn: ({ signal }) => learningGames.catalog(signal) });
  const items = catalog.data ?? [];
  return <div className="asha-landing asha-ui asha-mundo">
    <PublicNav go={go} cur="public/mundo" presentation="asha"/>
    <main>
      <section className="mundo-hero"><div className="mundo-container mundo-hero-layout">
        <div className="mundo-hero-copy">
          <h1>Mundo <span>ASHA</span></h1>
          <p className="mundo-intro">Cinco mundos de práctica con niveles básicos. El profesional selecciona los mundos de cada niño; los juegos definitivos se desarrollarán después.</p>
          <div className="mundo-stats">{[{ v: '5', l: 'Mundos de práctica' }, { v: '15', l: 'Niveles básicos' }, { v: 'Libre', l: 'Orden de niveles' }].map(s => <div key={s.l}><p>{s.v}</p><p>{s.l}</p></div>)}</div>
          <Btn variant="cta" size="lg" className="asha-btn asha-btn--lg" onClick={() => go('login')}>Ingresar a Mundo ASHA <ArrowRight size={24}/></Btn>
        </div>
        <div className="mundo-hero-art"><img src="/illustrations/mundo-hero-v54.png" alt="Cinco pequeñas islas de juego con sonidos, palabras, ritmo, voz y gestos." width={700} height={500} fetchPriority="high"/></div>
      </div></section>
      <section className="mundo-catalog"><div className="mundo-container">
        <RemoteFeedback pending={catalog.isPending} error={catalog.error} retry={() => void catalog.refetch()}/>
        <div className="mundo-grid">{items.map(item => <article key={item.id} className={`asha-card asha-glass mundo-card mundo-card-${worldArt[item.id]}`}>
          <div className="mundo-card-art"><img src={`/illustrations/world-${worldArt[item.id]}-v54.png`} alt="" width={240} height={200} loading="lazy"/></div>
          <div className="mundo-card-copy"><h3>{item.name}</h3><span className="mundo-levels">{item.levels.length} niveles</span><p>{item.description}</p><Btn variant="secondary" size="sm" className="asha-btn asha-btn--outline" onClick={() => go('login')}>Ingresar <ArrowRight size={18}/></Btn></div>
        </article>)}</div>
        <div className="mundo-cta"><h2>¿Listo para comenzar la aventura?</h2><p>Ingresa con tu cuenta familiar para ver los mundos asignados, intentos guardados y medallas.</p><Btn variant="cta" size="lg" className="asha-btn asha-btn--lg" onClick={() => go('login')}>Ingresar</Btn></div>
      </div></section>
    </main><PublicFooter go={go}/>
  </div>;
}

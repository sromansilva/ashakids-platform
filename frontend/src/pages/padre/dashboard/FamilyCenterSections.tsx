import { ArrowRight, Check, CircleHelp } from 'lucide-react';
import { useFamilyTracking } from '@/hooks/useFamilyTracking';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { FamilyTrackingPanel } from '@/components/common/FamilyTrackingPanel';
import type { View } from '@/types/navigation';

export function FamilyChildJourney({ onWorld, onFamily }: { onWorld: () => void; onFamily: () => void }) {
  const data = useFamilyTracking();
  const summary = !data.error && !data.pending ? data.summary : null;
  const stages = summary ? [
    { title: 'Nos conocemos', done: summary.milestones[1].done, detail: summary.milestones[1].done ? 'Ya compartimos nuestro primer encuentro.' : 'Tu familia prepara tu primer encuentro.', image: 'family-play-v54' },
    { title: 'Preparamos tu aventura', done: summary.milestones[3].done, detail: summary.milestones[3].done ? 'Tu equipo preparó tu plan de actividades.' : 'Tu equipo te ayudará a descubrir tus actividades.', image: 'team-care-v54' },
    { title: 'Seguimos juntos', done: summary.milestones[4].done, detail: summary.milestones[4].done ? 'Tu familia ha reservado un encuentro de terapia.' : 'Tu familia organiza tus próximos encuentros.', image: 'family-storybook-v88' },
  ] : [];
  return <div className="fc-journey">
    <RemoteFeedback pending={data.pending} error={data.error} retry={data.retry}/>
    {summary && <><ol className="fc-journey-list" aria-label="Mi recorrido con mi equipo">{stages.map(stage => <li key={stage.title} className="fc-glass">
      <PublicIllustration src={`/illustrations/${stage.image}.png`} alt="" width={220} height={200}/>
      <h2>{stage.title}</h2><p>{stage.detail}</p>{stage.done && <span className="fc-recorded"><Check size={17} aria-hidden="true"/>Ya es parte de tu historia</span>}
    </li>)}</ol><div className="fc-journey-actions"><button className="fc-button" type="button" onClick={onWorld}>Explorar mi mundo<ArrowRight size={20} aria-hidden="true"/></button><button className="fc-text-button" type="button" onClick={onFamily}>Ver detalles con mi familia</button></div></>}
  </div>;
}

export function FamilyAdultArea({ go, familyName }: { go: (view: View) => void; familyName?: string }) {
  return <div className="fc-adult">
    <FamilyTrackingPanel mode="journey" go={go} familyName={familyName} embedded/>
    <nav className="fc-family-support" aria-label="Más opciones de familia">
      <button type="button" onClick={() => go('padre/ayuda')}><CircleHelp size={18} aria-hidden="true"/>Ayuda</button>
    </nav>
  </div>;
}

import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { ArrowRight } from 'lucide-react';
import type { PublicWorld } from '@/services/learningGames';
import type { WorldArea } from '@/types/clinical';
const invitations: Record<WorldArea, string> = { HABLA: 'Descubre los sonidos', LENGUAJE: 'Juega con las palabras', FLUIDEZ: 'Encuentra tu ritmo', VOZ: 'Explora tu voz', OROFACIAL: 'Descubre los gestos' };
const art = { HABLA: 'habla', LENGUAJE: 'lenguaje', FLUIDEZ: 'fluidez', VOZ: 'voz', OROFACIAL: 'orofacial' };
export function WorldCards({ items, onExplore, disabled }: { items: PublicWorld[]; onExplore: (world: WorldArea) => void; disabled: boolean }) {
  return <div className="mundo-grid">{items.map(item => <article key={item.id} className={`asha-card asha-glass mundo-card mundo-card-${art[item.id]}`}>
    <div className="mundo-card-art"><PublicIllustration src={`/illustrations/world-${art[item.id]}-v54.png`} alt="" width={240} height={200} loading="lazy"/></div>
    <div className="mundo-card-copy"><h3>{item.name}</h3><span className="mundo-levels">{item.levels.length} niveles</span><p>{item.description}</p>
      <button type="button" className="asha-btn asha-btn--outline" aria-label={`${invitations[item.id]}: ${item.name}`} disabled={disabled} onClick={() => onExplore(item.id)}>{invitations[item.id]} <ArrowRight size={18} aria-hidden="true"/></button>
    </div>
  </article>)}</div>;
}

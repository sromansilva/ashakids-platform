import type { CSSProperties } from 'react';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import type { WorldProgress } from '@/services/learningGames';
import type { WorldArea } from '@/types/clinical';
import { worldArt } from './worldArt';

export function WorldMap({ worlds, onOpen }: { worlds: WorldProgress[]; onOpen: (id: WorldArea) => void }) {
  return <div className="asha-world-map">
    <ul className="asha-map-worlds" aria-label="Los cinco mundos de ASHA">
      {worlds.map(world => {
        const art = worldArt[world.id];
        return <li key={world.id} className={`asha-map-stop asha-map-stop--${art.image}`} style={{ '--world-color': art.color, '--world-soft': art.soft } as CSSProperties}>
          <button type="button" className="asha-world-island" disabled={!world.asignado} aria-label={`${world.asignado ? 'Abrir' : 'Sin asignar:'} ${world.name}`} onClick={() => onOpen(world.id)}>
            <PublicIllustration src={`/illustrations/world-${art.image}-v54.png`} alt="" width={240} height={160} sizes="(max-width: 600px) 150px, 240px" className="asha-island-art"/>
            <span className="asha-island-label"><span>{world.name}</span>{world.asignado ? <ArrowRight size={16} aria-hidden="true"/> : <LockKeyhole size={16} aria-hidden="true"/>}</span>
            <span className="asha-island-progress">{world.asignado ? ['HABLA','LENGUAJE'].includes(world.id) ? world.id==='HABLA' ? '4 juegos · práctica libre' : '8 juegos para ti · según tu edad' : <>{world.completados.length}/{world.levels.length} niveles <span className="asha-level-dots" aria-hidden="true">{world.levels.map(level => <span key={level.number} className={world.completados.includes(level.number) ? 'is-complete' : ''}>{world.completados.includes(level.number) && <Check size={10}/>}</span>)}</span></> : 'Pendiente de asignación'}</span>
          </button>
        </li>;
      })}
    </ul>
  </div>;
}

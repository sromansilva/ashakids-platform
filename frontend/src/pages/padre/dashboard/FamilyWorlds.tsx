import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { useRemote } from '@/hooks/useRemoteData';
import type { GameProgress } from '@/services/learningGames';
import type { WorldArea } from '@/types/clinical';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { DemoWorldPlayer } from '../Sessions/DemoWorldPlayer';
import { worldArt } from '../Sessions/worldArt';
import '../Sessions/world-map.css';

export function FamilyWorlds({ patientId, progress, worldId, onOpen, onBack, onFamily }: {
  patientId: number; progress: ReturnType<typeof useRemote<GameProgress>>; worldId: string | null;
  onOpen: (id: WorldArea) => void; onBack: () => void; onFamily: () => void;
}) {
  const { user } = useAuth();
  const client = useQueryClient();
  const assigned = progress.data?.mundos.filter(world => world.asignado) ?? [];
  const selected = assigned.find(world => world.id === worldId);
  return <div className="fc-worlds asha-worlds">
    <RemoteFeedback pending={progress.isPending} error={progress.error} retry={() => void progress.refetch()}/>
    {progress.isSuccess && !progress.error && <>
      {worldId && !selected && <p className="fc-notice" role="status">Este mundo no está disponible en tu perfil. Puedes elegir uno de tus mundos.</p>}
      {selected ? <DemoWorldPlayer key={`${patientId}:${selected.id}`} world={selected} patientId={patientId} back={onBack} onSaved={value => client.setQueryData([user?.id_usuario, 'game-progress', patientId], value)}/> : assigned.length ? <ul className="fc-world-list" aria-label="Mis mundos asignados">
        {assigned.map(world => <li key={world.id} className="fc-glass">
          <PublicIllustration src={`/illustrations/world-${worldArt[world.id].image}-v54.png`} alt="" width={300} height={200}/>
          <h2>{world.name}</h2><button className="fc-button" type="button" onClick={() => onOpen(world.id)}>Explorar<ArrowRight size={20} aria-hidden="true"/></button>
        </li>)}
      </ul> : <div className="fc-empty"><PublicIllustration src="/illustrations/family-storybook-v88.png" alt="" width={150} height={150}/><h2>Tu aventura se está preparando</h2><p>Tu familia y tu terapeuta te ayudarán a empezar.</p><button className="fc-button fc-button--outline" type="button" onClick={onFamily}>Ir con mi familia</button></div>}
    </>}
  </div>;
}

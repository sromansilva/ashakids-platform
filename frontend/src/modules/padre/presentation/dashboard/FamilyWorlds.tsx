import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import type { useRemote } from '@/shared/application/hooks/useRemoteData';
import type { GameProgress } from '@/modules/mundo_asha/infrastructure/learningGames';
import type { WorldArea } from '@/modules/clinica/domain/clinical';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { DemoWorldPlayer } from '../Sessions/DemoWorldPlayer';

const worldCardsData: { id: WorldArea; name: string; image: string }[] = [
  {
    id: 'HABLA',
    name: 'Taller de los Sonidos',
    image: '/illustrations/optimized/world-habla-v54-640-7077559296.webp',
  },
  {
    id: 'LENGUAJE',
    name: 'La Isla de las Palabras',
    image: '/illustrations/optimized/world-lenguaje-v54-640-6f46efcc02.webp',
  },
  {
    id: 'FLUIDEZ',
    name: 'Ritmo de las Palabras',
    image: '/illustrations/optimized/world-fluidez-v54-640-b44769ba04.webp',
  },
  {
    id: 'VOZ',
    name: 'El Estudio de la Voz',
    image: '/illustrations/optimized/world-voz-v54-640-54efd359d2.webp',
  },
  {
    id: 'OROFACIAL',
    name: 'Laboratorio de los Gestos',
    image: '/illustrations/optimized/world-orofacial-v54-640-32062e7d41.webp',
  },
];

export function FamilyWorlds({
  patientId,
  progress,
  worldId,
  onOpen,
  onBack,
  onFamily,
  birthDate,
}: {
  patientId: number;
  progress: ReturnType<typeof useRemote<GameProgress>>;
  worldId: string | null;
  onOpen: (id: WorldArea) => void;
  onBack: () => void;
  onFamily: () => void;
  birthDate?: string | null;
}) {
  const { user } = useAuth();
  const client = useQueryClient();
  const assigned = progress.data?.mundos.filter((world) => world.asignado) ?? [];
  const selected = assigned.find((w) => w.id === worldId);

  return (
    <div className={`family-worlds-stage ${worldId ? 'family-worlds-stage--selected' : 'family-worlds-stage--list'}`} style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <RemoteFeedback pending={progress.isPending} error={progress.error} retry={() => void progress.refetch()} />

      {progress.isSuccess && !progress.error && (
        <>
          {worldId && !selected && (
            <p className="p-4 mb-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-sm font-bold" role="status">
              Este mundo no está disponible en tu perfil. Puedes elegir uno de tus mundos asignados.
            </p>
          )}

          {selected ? (
            <DemoWorldPlayer
              key={`${patientId}:${selected.id}`}
              world={selected}
              patientId={patientId}
              birthDate={birthDate}
              back={onBack}
              onSaved={(value) => client.setQueryData([user?.id_usuario, 'game-progress', patientId], value)}
            />
          ) : assigned.length > 0 ? (
            <div className="space-y-6">
              <ul className={`family-worlds-grid family-worlds-grid--${Math.min(assigned.length, 5)}`} aria-label="Mis mundos asignados">
                {assigned.map((w) => {
                  const card = worldCardsData.find((item) => item.id === w.id);
                  const image = card?.image || '/illustrations/optimized/world-lenguaje-v54-640-6f46efcc02.webp';
                  return (
                    <li key={w.id} className={`family-world-card family-world-card--${w.id.toLowerCase()}`}>
                      <div className="family-world-card-art">
                        <img
                          src={image}
                          alt=""
                          className="family-world-card-image"
                        />
                      </div>
                      <div className="family-world-card-content">
                        <h2>{w.name}</h2>
                        <button
                          type="button"
                          onClick={() => onOpen(w.id)}
                          className="family-world-card-action"
                        >
                          <span>Explorar</span>
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img src="/illustrations/family-storybook-v88.png" alt="" className="w-40 h-40 object-contain mb-4" />
              <h2 className="text-2xl font-black text-[#1C1135] mb-2">Tu aventura se está preparando</h2>
              <p className="text-sm font-bold text-[#615274] mb-6">Tu familia y tu terapeuta te ayudarán a empezar.</p>
              <button
                type="button"
                onClick={onFamily}
                className="px-6 py-3 rounded-2xl border-2 border-[#6B46FE] text-[#6B46FE] hover:bg-violet-50 font-black text-sm transition-all"
              >
                Ir con mi familia
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

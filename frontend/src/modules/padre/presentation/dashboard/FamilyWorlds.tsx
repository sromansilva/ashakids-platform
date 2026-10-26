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
  onFamily: _onFamily,
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
  const allWorlds = progress.data?.mundos ?? [];
  const selected = allWorlds.find((w) => w.id === worldId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
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
          ) : (
            <div className="space-y-6">
              {/* Top Row: 3 Worlds */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worldCardsData.slice(0, 3).map((w) => (
                  <div
                    key={w.id}
                    className="bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-xs flex flex-col items-center text-center justify-between min-h-[380px] hover:border-violet-300 transition-all group"
                  >
                    <div className="w-full flex items-center justify-center py-4 flex-1">
                      <img
                        src={w.image}
                        alt={w.name}
                        className="w-56 h-44 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200 select-none"
                      />
                    </div>
                    <div className="w-full mt-2">
                      <h2 className="text-2xl font-black text-[#1C1135] mb-5">{w.name}</h2>
                      <button
                        type="button"
                        onClick={() => onOpen(w.id)}
                        className="w-full flex items-center justify-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-md shadow-[#6B46FE]/20 transition-all active:scale-[.98]"
                      >
                        <span>Explorar</span>
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Row: 2 Worlds (Centered) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {worldCardsData.slice(3, 5).map((w) => (
                  <div
                    key={w.id}
                    className="bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-xs flex flex-col items-center text-center justify-between min-h-[380px] hover:border-violet-300 transition-all group"
                  >
                    <div className="w-full flex items-center justify-center py-4 flex-1">
                      <img
                        src={w.image}
                        alt={w.name}
                        className="w-56 h-44 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200 select-none"
                      />
                    </div>
                    <div className="w-full mt-2">
                      <h2 className="text-2xl font-black text-[#1C1135] mb-5">{w.name}</h2>
                      <button
                        type="button"
                        onClick={() => onOpen(w.id)}
                        className="w-full flex items-center justify-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-md shadow-[#6B46FE]/20 transition-all active:scale-[.98]"
                      >
                        <span>Explorar</span>
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

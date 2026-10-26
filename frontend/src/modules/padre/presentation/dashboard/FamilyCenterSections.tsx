import { ArrowRight, Check, CircleHelp } from 'lucide-react';
import { useFamilyTracking } from '@/modules/padre/application/useFamilyTracking';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { FamilyTrackingPanel } from '@/shared/presentation/components/common/FamilyTrackingPanel';
import type { View } from '@/shared/domain/types/navigation';

export function FamilyChildJourney({ onWorld, onFamily }: { onWorld: () => void; onFamily: () => void }) {
  const data = useFamilyTracking();
  const summary = !data.error && !data.pending ? data.summary : null;

  const stages = summary
    ? [
        {
          step: 1,
          title: 'Nos conocemos',
          done: summary.milestones[1]?.done ?? false,
          detail: summary.milestones[1]?.done
            ? 'Ya compartimos nuestro primer encuentro.'
            : 'Tu familia prepara tu primer encuentro.',
          image: '/illustrations/optimized/step-account-v54-640-9a7c8a92d7.webp',
        },
        {
          step: 2,
          title: 'Preparamos tu aventura',
          done: summary.milestones[3]?.done ?? false,
          detail: summary.milestones[3]?.done
            ? 'Tu equipo preparó tu plan de actividades.'
            : 'Tu equipo te ayudará a descubrir tus actividades.',
          image: '/illustrations/optimized/step-specialist-v54-640-248feffb34.webp',
        },
        {
          step: 3,
          title: 'Seguimos juntos',
          done: summary.milestones[4]?.done ?? false,
          detail: summary.milestones[4]?.done
            ? 'Tu familia ha reservado un encuentro de terapia.'
            : 'Tu familia organiza tus próximos encuentros.',
          image: '/illustrations/optimized/family-storybook-v88-640-384ae4ef06.webp',
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <RemoteFeedback pending={data.pending} error={data.error} retry={data.retry} />

      {summary && (
        <>
          {/* 3 Connected Stages */}
          <div className="relative mt-8 mb-12">
            {/* Curved connection line behind step badges */}
            <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#C8C2DC] -z-0" />

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10" aria-label="Mi recorrido con mi equipo">
              {stages.map((stage) => (
                <li
                  key={stage.title}
                  className="bg-white rounded-3xl border border-[#E8E5F4] p-6 sm:p-7 shadow-xs flex flex-col items-center text-center justify-between min-h-[460px] relative transition-all hover:border-violet-300"
                >
                  {/* Floating Step Number Pill */}
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-black text-lg shadow-md">
                    {stage.step}
                  </div>

                  {/* 3D Illustration */}
                  <div className="w-full flex items-center justify-center pt-4 pb-2">
                    <img
                      src={stage.image}
                      alt={stage.title}
                      className="w-48 h-44 object-contain drop-shadow-sm select-none"
                    />
                  </div>

                  {/* Text Info */}
                  <div className="w-full mb-6">
                    <h2 className="text-2xl font-black text-[#1C1135] mb-2">{stage.title}</h2>
                    <p className="text-sm text-[#6B5E8A] font-medium leading-relaxed max-w-xs mx-auto">
                      {stage.detail}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="w-full min-h-[36px]">
                    {stage.done && (
                      <span className="w-full rounded-2xl bg-[#E6F8F5] text-[#0D9488] font-black text-xs py-2.5 px-4 flex items-center justify-center gap-2 shadow-2xs">
                        <Check size={16} aria-hidden="true" className="shrink-0" />
                        <span>Ya es parte de tu historia</span>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onWorld}
              className="flex items-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-[#6B46FE]/30 transition-all active:scale-[.98]"
            >
              <span>Explorar mi mundo</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onFamily}
              className="bg-white border-2 border-[#6B46FE] text-[#6B46FE] hover:bg-violet-50 px-8 py-3.5 rounded-2xl font-black text-base transition-colors shadow-xs"
            >
              Ver detalles con mi familia
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function FamilyAdultArea({ go, familyName }: { go: (view: View) => void; familyName?: string }) {
  return (
    <div className="fc-adult">
      <FamilyTrackingPanel mode="journey" go={go} familyName={familyName} embedded />
      <nav className="fc-family-support" aria-label="Más opciones de familia">
        <button type="button" onClick={() => go('padre/ayuda')}>
          <CircleHelp size={18} aria-hidden="true" />
          Ayuda
        </button>
      </nav>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { learningGames } from '@/modules/mundo_asha/infrastructure/learningGames';
import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import type { View } from '@/shared/domain/types/navigation';
import type { WorldArea } from '@/modules/clinica/domain/clinical';
import { FamilyWorlds } from './FamilyWorlds';
import { FamilyChildJourney, FamilyAdultArea } from './FamilyCenterSections';
import './family-center.css';

type Section = 'world' | 'journey' | 'family';
const sectionTitles = { world: 'Mi mundo', journey: 'Mi camino ASHA', family: 'Para mi familia' };

export function FamilyCenter({ go, familyName }: { go: (view: View) => void; familyName?: string }) {
  const routerNavigate = useNavigate();
  const { patients, patient } = useSelectedFamilyPatient();
  const progress = useRemote(
    ['game-progress', patient?.id_paciente],
    (signal) => learningGames.progress(patient!.id_paciente, signal),
    !!patient,
  );
  const [search, setSearch] = useSearchParams();
  const requestedSection = search.get('section');
  const section = ['world', 'journey', 'family'].includes(requestedSection ?? '')
    ? (requestedSection as Section)
    : null;
  const world = search.get('world');
  const heading = useRef<HTMLHeadingElement>(null);
  const previousSection = useRef(`${section ?? ''}:${world ?? ''}`);

  useEffect(() => {
    const destination = `${section ?? ''}:${world ?? ''}`;
    if (previousSection.current !== destination) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.closest('.family-center')?.scrollIntoView({ block: 'start' });
    }
    previousSection.current = destination;
  }, [section, world]);

  if (!section) {
    return <Navigate to="/padre/welcome" replace />;
  }

  function open(next: Section | null, nextWorld?: WorldArea) {
    const params = new URLSearchParams();
    if (next) params.set('section', next);
    if (nextWorld) params.set('world', nextWorld);
    setSearch(params);
  }

  const navigate = (view: View) => (view === 'mundo-asha' ? open('world') : go(view));

  return (
    <section className={`family-center${section === 'world' ? (world ? ' family-center--world-open' : ' family-center--world-list') : ''}`}>
      <div className="fc-welcome fc-welcome--small">
        <PublicIllustration
          src="/illustrations/family-ashi-wave-v88.png"
          alt=""
          width={160}
          height={180}
          className="fc-ashi"
        />
        <div>
          <h1 ref={heading} tabIndex={-1}>
            {sectionTitles[section]}
          </h1>
          <p>
            {section === 'world'
              ? world
                ? 'Elige una aventura para explorar.'
                : 'Juega, explora y descubre nuevas formas de comunicarte.'
              : section === 'journey'
                ? 'Cada encuentro es parte de tu historia.'
                : 'El acompañamiento de tu familia, en un solo lugar.'}
          </p>
        </div>
      </div>
      <RemoteFeedback pending={patients.isPending} error={patients.error} retry={() => void patients.refetch()} />
      {patient && !patients.error && section === 'world' && (
        <FamilyWorlds
          patientId={patient.id_paciente}
          progress={progress}
          worldId={world}
          birthDate={patient.fecha_nacimiento}
          onOpen={(id) => open('world', id)}
          onBack={() => open('world')}
          onFamily={() => open('family')}
        />
      )}
      {patient && !patients.error && section === 'journey' && (
        <FamilyChildJourney
          key={patient.id_paciente}
          onWorld={() => open('world')}
          onFamily={() => open('family')}
        />
      )}
      {!patient && !patients.error && !patients.isPending && section === 'journey' && (
        <div className="fc-empty my-6 mx-auto max-w-xl rounded-3xl border border-[#E8E5F4] bg-white p-8 text-center shadow-sm sm:p-12">
          <h2 className="text-2xl font-black text-[#1C1135]">Aún no hay un perfil registrado</h2>
          <p className="mt-2 text-[#615274]">
            Registra el perfil de tu hijo o hija para comenzar su camino y seguir su evolución.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#6B46FE] px-6 py-3 font-bold text-white shadow-sm transition hover:bg-[#5833EA]"
            onClick={() => routerNavigate('/padre/config?tab=hijos')}
          >
            Añadir a mi hijo o hija
          </button>
        </div>
      )}
      {!patients.error && section === 'family' && (
        <FamilyAdultArea
          key={patient?.id_paciente ?? 'empty'}
          go={navigate}
          familyName={familyName}
        />
      )}
    </section>
  );
}

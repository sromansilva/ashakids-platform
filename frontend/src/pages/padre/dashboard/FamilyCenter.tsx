import { useEffect, useRef } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useSelectedFamilyPatient } from '@/hooks/useSelectedFamilyPatient';
import { useRemote } from '@/hooks/useRemoteData';
import { learningGames } from '@/services/learningGames';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import type { View } from '@/types/navigation';
import type { WorldArea } from '@/types/clinical';
import { FamilyWorlds } from './FamilyWorlds';
import { FamilyChildJourney, FamilyAdultArea } from './FamilyCenterSections';
import './family-center.css';

type Section = 'world' | 'journey' | 'family';
const sectionTitles = { world: 'Mi mundo', journey: 'Mi camino ASHA', family: 'Para mi familia' };

export function FamilyCenter({ go, familyName }: { go: (view: View) => void; familyName?: string }) {
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
    <section className="family-center">
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
              ? 'Elige una aventura para explorar.'
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

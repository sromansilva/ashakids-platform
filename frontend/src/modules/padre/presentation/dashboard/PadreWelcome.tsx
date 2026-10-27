import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { learningGames } from '@/modules/mundo_asha/infrastructure/learningGames';
import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import type { View } from '@/shared/domain/types/navigation';
import { worldArt } from '../Sessions/worldArt';
import './family-center.css';

export function PadreWelcome({
  go,
  padreUserName,
}: {
  go: (view: View) => void;
  padreUserName?: string;
  padrePlan?: 'exploracion' | 'familia';
}) {
  const navigate = useNavigate();
  const { patients, patient } = useSelectedFamilyPatient();
  const progress = useRemote(
    ['game-progress', patient?.id_paciente],
    (signal) => learningGames.progress(patient!.id_paciente, signal),
    !!patient,
  );
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [patient?.id_paciente]);

  const assigned = !progress.error ? progress.data?.mundos.filter((item) => item.asignado) ?? [] : [];
  const art = assigned[0] ? worldArt[assigned[0].id].image : 'lenguaje';

  return (
    <section className="family-center family-welcome-page">
      <div className="fc-welcome">
        <PublicIllustration
          src="/illustrations/family-ashi-wave-v88.png"
          alt=""
          width={160}
          height={180}
          className="fc-ashi"
        />
        <div>
          <h1 ref={heading} tabIndex={-1}>
            {patient ? `¡Hola, ${patient.nombres_paciente}!` : '¡Hola!'}
          </h1>
          <p>¿Qué te gustaría explorar?</p>
        </div>
      </div>

      <RemoteFeedback pending={patients.isPending} error={patients.error} retry={() => void patients.refetch()} />

      {!patients.error && !patients.isPending && !patient && (
        <div className="fc-empty">
          <h2>Aún no tienes hijos registrados</h2>
          <p>Tu familia puede añadir un perfil para empezar.</p>
          <button className="fc-button" type="button" onClick={() => go('padre/config')}>
            Gestionar hijos
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {!patients.error && !patients.isPending && patient && (
        <div className="fc-destinations">
          <article className="fc-destination fc-destination--world">
            <PublicIllustration
              src={`/illustrations/world-${art}-v54.png`}
              alt=""
              width={640}
              height={380}
              sizes="(max-width: 767px) 90vw, 600px"
              className="fc-destination-art"
            />
            <div>
              <h2>Mi mundo</h2>
              <p>{assigned.length === 1 ? assigned[0].name : 'Juega y descubre'}</p>
              <button className="fc-button" type="button" onClick={() => navigate('/padre?section=world')}>
                Explorar
                <ArrowRight size={23} aria-hidden="true" />
              </button>
            </div>
          </article>
          <article className="fc-destination fc-destination--journey">
            <PublicIllustration
              src="/illustrations/family-storybook-v88.png"
              alt=""
              width={380}
              height={380}
              sizes="(max-width: 767px) 80vw, 380px"
              className="fc-destination-art"
            />
            <div>
              <h2>Mi camino</h2>
              <button
                className="fc-button fc-button--outline"
                type="button"
                onClick={() => navigate('/padre?section=journey')}
              >
                Ver mi camino
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}


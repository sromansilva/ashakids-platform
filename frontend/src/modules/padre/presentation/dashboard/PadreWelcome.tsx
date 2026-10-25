import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Users } from 'lucide-react';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { learningGames } from '@/modules/mundo_asha/infrastructure/learningGames';
import { getPacienteAvatarImage } from '@/core/config/avatars';
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
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const progress = useRemote(
    ['game-progress', patient?.id_paciente],
    (signal) => learningGames.progress(patient!.id_paciente, signal),
    !!patient,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const picker = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [patient?.id_paciente]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (picker.current && !picker.current.contains(event.target as Node)) {
        picker.current.open = false;
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  const assigned = !progress.error ? progress.data?.mundos.filter((item) => item.asignado) ?? [] : [];
  const art = assigned[0] ? worldArt[assigned[0].id].image : 'lenguaje';

  return (
    <section className="family-center family-welcome-page">
      <header className="fc-top">
        <button
          className="fc-home-link"
          type="button"
          onClick={() => {
            navigate('/padre/welcome');
          }}
        >
          Centro Familiar
        </button>
        {patient && (
          <details
            className="fc-profile"
            ref={picker}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                picker.current!.open = false;
                picker.current?.querySelector('summary')?.focus();
              }
            }}
          >
            <summary aria-label={`Elegir perfil: ${patient.nombres_paciente} ${patient.apellidos_paciente}`}>
              <img src={getPacienteAvatarImage(patient.avatar_nombre)} alt="" width={48} height={48} />
              <span>{patient.nombres_paciente}</span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="fc-profile-menu">
              <p>¿Quién va a explorar?</p>
              {children.map((child) => (
                <button
                  type="button"
                  key={child.id_paciente}
                  aria-pressed={child.id_paciente === patient.id_paciente}
                  onClick={() => {
                    selectPatient(child.id_paciente);
                    picker.current!.open = false;
                    picker.current?.querySelector('summary')?.focus();
                  }}
                >
                  {child.nombres_paciente} {child.apellidos_paciente}
                  {child.id_paciente === patient.id_paciente && <Check size={16} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </details>
        )}
        <button
          type="button"
          className="fc-family-button"
          onClick={() => navigate('/padre?section=family')}
        >
          <Users size={20} aria-hidden="true" />
          Para mi familia
        </button>
      </header>

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


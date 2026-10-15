import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Users } from 'lucide-react';
import { useSelectedFamilyPatient } from '@/hooks/useSelectedFamilyPatient';
import { useRemote } from '@/hooks/useRemoteData';
import { learningGames } from '@/services/learningGames';
import { getPacienteAvatarImage } from '@/config/avatars';
import { PublicIllustration } from '@/components/illustrations/PublicIllustration';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import type { View } from '@/types/navigation';
import type { WorldArea } from '@/types/clinical';
import { worldArt } from '../Sessions/worldArt';
import { FamilyWorlds } from './FamilyWorlds';
import { FamilyChildJourney, FamilyAdultArea } from './FamilyCenterSections';
import './family-center.css';

type Section = 'world' | 'journey' | 'family';
const sectionTitles = { world: 'Mi mundo', journey: 'Mi camino', family: 'Para mi familia' };

export function FamilyCenter({ go, familyName }: { go: (view: View) => void; familyName?: string }) {
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const progress = useRemote(['game-progress', patient?.id_paciente], signal => learningGames.progress(patient!.id_paciente, signal), !!patient);
  const [search, setSearch] = useSearchParams();
  const requestedSection = search.get('section');
  const section = ['world', 'journey', 'family'].includes(requestedSection ?? '') ? requestedSection as Section : null;
  const world = search.get('world');
  const heading = useRef<HTMLHeadingElement>(null);
  const picker = useRef<HTMLDetailsElement>(null);
  const previousSection = useRef(`${section ?? ''}:${world ?? ''}`);
  useEffect(() => {
    const destination = `${section ?? ''}:${world ?? ''}`;
    if (previousSection.current !== destination) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.closest('.family-center')?.scrollIntoView({ block: 'start' });
    }
    previousSection.current = destination;
  }, [section, world]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (picker.current && !picker.current.contains(event.target as Node)) picker.current.open = false;
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  function open(next: Section | null, nextWorld?: WorldArea) {
    const params = new URLSearchParams();
    if (next) params.set('section', next);
    if (nextWorld) params.set('world', nextWorld);
    setSearch(params);
  }
  const navigate = (view: View) => view === 'mundo-asha' ? open('world') : go(view);
  const assigned = !progress.error ? progress.data?.mundos.filter(item => item.asignado) ?? [] : [];
  const art = assigned[0] ? worldArt[assigned[0].id].image : 'lenguaje';
  return <section className="family-center">
    <header className="fc-top">
      <button className="fc-home-link" type="button" onClick={() => open(null)}>Centro Familiar</button>
      {patient && <details className="fc-profile" ref={picker} onKeyDown={event => {
        if (event.key === 'Escape') { picker.current!.open = false; picker.current?.querySelector('summary')?.focus(); }
      }}>
        <summary aria-label={`Elegir perfil: ${patient.nombres_paciente} ${patient.apellidos_paciente}`}>
          <img src={getPacienteAvatarImage(patient.avatar_nombre)} alt="" width={48} height={48}/>
          <span>{patient.nombres_paciente}</span><ChevronDown size={18} aria-hidden="true"/>
        </summary>
        <div className="fc-profile-menu"><p>¿Quién va a explorar?</p>{children.map(child => <button type="button" key={child.id_paciente} aria-pressed={child.id_paciente === patient.id_paciente} onClick={() => {
          selectPatient(child.id_paciente);
          const params = new URLSearchParams(search); params.delete('world'); setSearch(params, { replace: true });
          picker.current!.open = false; picker.current?.querySelector('summary')?.focus();
        }}>{child.nombres_paciente} {child.apellidos_paciente}{child.id_paciente === patient.id_paciente && <Check size={16} aria-hidden="true"/>}</button>)}</div>
      </details>}
      <button type="button" className="fc-family-button" aria-pressed={section === 'family'} onClick={() => open('family')}><Users size={20} aria-hidden="true"/>Para mi familia</button>
    </header>
    {section && <button type="button" className="fc-back" onClick={() => open(null)}><ArrowLeft size={18} aria-hidden="true"/>Volver al inicio</button>}
    <div className={`fc-welcome ${section ? 'fc-welcome--small' : ''}`}>
      <PublicIllustration src="/illustrations/family-ashi-wave-v88.png" alt="" width={160} height={180} className="fc-ashi"/>
      <div><h1 ref={heading} tabIndex={-1}>{section ? sectionTitles[section] : patient ? `¡Hola, ${patient.nombres_paciente}!` : '¡Hola!'}</h1>
        <p>{section === 'world' ? 'Elige una aventura para explorar.' : section === 'journey' ? 'Cada encuentro es parte de tu historia.' : section === 'family' ? 'El acompañamiento de tu familia, en un solo lugar.' : '¿Qué te gustaría explorar?'}</p>
      </div>
    </div>
    <RemoteFeedback pending={patients.isPending} error={patients.error} retry={() => void patients.refetch()}/>
    {!patients.error && !patients.isPending && !patient && <div className="fc-empty"><h2>Aún no tienes hijos registrados</h2><p>Tu familia puede añadir un perfil para empezar.</p><button className="fc-button" type="button" onClick={() => go('padre/config')}>Gestionar hijos<ArrowRight size={18} aria-hidden="true"/></button></div>}
    {!patients.error && !patients.isPending && patient && !section && <div className="fc-destinations">
      <article className="fc-destination fc-destination--world">
        <PublicIllustration src={`/illustrations/world-${art}-v54.png`} alt="" width={640} height={380} sizes="(max-width: 767px) 90vw, 600px" className="fc-destination-art"/>
        <div><h2>Mi mundo</h2><p>{assigned.length === 1 ? assigned[0].name : 'Juega y descubre'}</p><button className="fc-button" type="button" onClick={() => open('world')}>Explorar<ArrowRight size={23} aria-hidden="true"/></button></div>
      </article>
      <article className="fc-destination fc-destination--journey">
        <PublicIllustration src="/illustrations/family-storybook-v88.png" alt="" width={380} height={380} sizes="(max-width: 767px) 80vw, 380px" className="fc-destination-art"/>
        <div><h2>Mi camino</h2><button className="fc-button fc-button--outline" type="button" onClick={() => open('journey')}>Ver mi camino</button></div>
      </article>
    </div>}
    {patient && !patients.error && section === 'world' && <FamilyWorlds patientId={patient.id_paciente} progress={progress} worldId={world} onOpen={id => open('world', id)} onBack={() => open('world')} onFamily={() => open('family')}/>}
    {patient && !patients.error && section === 'journey' && <FamilyChildJourney key={patient.id_paciente} onWorld={() => open('world')} onFamily={() => open('family')}/>}
    {!patients.error && section === 'family' && <FamilyAdultArea key={patient?.id_paciente ?? 'empty'} go={navigate} familyName={familyName}/>}
  </section>;
}

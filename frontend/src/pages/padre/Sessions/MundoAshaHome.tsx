import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { View } from '@/types/navigation';
import { Btn } from '@/components/common/Btn';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { useSelectedFamilyPatient } from '@/hooks/useSelectedFamilyPatient';
import { useAuth } from '@/hooks/useAuth';
import { useRemote } from '@/hooks/useRemoteData';
import { learningGames, type GameProgress } from '@/services/learningGames';
import type { WorldArea } from '@/types/clinical';
import { DemoWorldPlayer } from './DemoWorldPlayer';
import { WorldMap } from './WorldMap';
import './world-map.css';

export function MundoAshaHome({ go }: { go: (view: View) => void; padrePlan?: 'exploracion' | 'familia' }) {
  const { user, role } = useAuth();
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const family = role === 'PADRE';
  const queryClient = useQueryClient();
  const catalog = useQuery({ queryKey: ['public-basic-worlds'], queryFn: ({ signal }) => learningGames.catalog(signal), enabled: !family });
  const progress = useRemote(['game-progress', patient?.id_paciente], signal => learningGames.progress(patient!.id_paciente, signal), family && !!patient);
  const [search, setSearch] = useSearchParams();
  const requested = search.get('world');
  const [worldId, setWorldId] = useState<WorldArea | null>(null);
  const worlds = progress.data?.mundos ?? [];
  const world = worlds.find(w => w.asignado && w.id === (worldId ?? requested));
  function saved(value: GameProgress) { queryClient.setQueryData([user?.id_usuario, 'game-progress', value.id_paciente], value); }
  return <section className="asha-worlds"><div className="asha-worlds-inner">
    <header className="asha-worlds-header"><div><h1>Mundo ASHA</h1><p>Una pequeña aventura en cada nivel.</p></div><span className="asha-worlds-badge"><Sparkles size={18} aria-hidden="true"/> Cinco mundos por descubrir</span></header>
    {!family ? <><p>Ingresa como familia para practicar en los mundos asignados a cada niño.</p><Btn onClick={() => go('login')}>Ingresar</Btn><RemoteFeedback pending={catalog.isPending} error={catalog.error} retry={() => void catalog.refetch()}/><ul>{catalog.data?.map(w => <li key={w.id}><h2>{w.name}</h2><p>{w.description} · {w.levels.length} niveles básicos.</p></li>)}</ul></> : <>
      <RemoteFeedback pending={patients.isPending || (!!patient && progress.isPending)} error={patients.error || progress.error} retry={() => { void patients.refetch(); if (patient) void progress.refetch(); }}/>
      {patient && <div className="asha-explorer-bar"><div className="asha-explorer-child"><label htmlFor="learning-child">Hijo o hija</label><select id="learning-child" value={patient.id_paciente} onChange={e => { selectPatient(Number(e.target.value)); setWorldId(null); setSearch({}); }}>{children.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombres_paciente} {p.apellidos_paciente}</option>)}</select></div>
        {progress.data && !progress.error && <div className="asha-explorer-progress"><p className="asha-explorer-score">Nivel {progress.data.nivel} · {progress.data.experiencia} XP · {progress.data.medallas.length} medallas</p><progress aria-label="Experiencia para el próximo nivel" max={200} value={progress.data.experiencia % 200}/><p>{progress.data.intentos_totales} intentos · Próximo nivel: {progress.data.experiencia_siguiente_nivel} XP.</p></div>}
      </div>}
      {requested && progress.isSuccess && !progress.error && !world && <p role="status" className="asha-world-notice">Este mundo no está habilitado para el niño seleccionado. Puedes elegir otro niño o consultar los mundos asignados por su terapeuta.</p>}
      {!patients.error && !progress.error && progress.isSuccess && patient && (world ? <DemoWorldPlayer key={`${user?.id_usuario}:${patient.id_paciente}:${world.id}`} world={world} patientId={patient.id_paciente} birthDate={patient.fecha_nacimiento} onSaved={saved} back={() => { setWorldId(null); setSearch({}); }}/> : <section aria-label="Mundos asignados">
        <div className="asha-map-heading"><div><h2>Elige tu mundo, {patient.nombres_paciente}</h2><p>Explora una isla para ver sus niveles.</p></div><span>Mapa de aventuras</span></div>
        <WorldMap worlds={worlds} onOpen={setWorldId}/>
        {!worlds.some(w => w.asignado) ? <div className="asha-world-notice"><h2>Mundos pendientes para {patient.nombres_paciente}</h2><p>El profesional puede asignar los cinco mundos desde el plan de este niño.</p><Btn onClick={() => go('padre/camino')}>Ver el recorrido de mi hijo</Btn></div> : worlds.some(w => !w.asignado) && <p className="asha-map-help">Los mundos pendientes se habilitan cuando el terapeuta los asigna en el plan de tu hijo.</p>}
      </section>)}
      {progress.data?.medallas.length ? <section className="asha-world-medals"><h2><Award size={22} aria-hidden="true"/> Medallas del perfil</h2><ul>{progress.data.medallas.map(m => <li key={m.codigo}>{m.nombre} · {new Date(m.fecha).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</li>)}</ul></section> : null}
      {patients.isSuccess && children.length === 0 && <p>Aún no tienes hijos registrados.</p>}
    </>}
    <p role="note" className="asha-map-help">El progreso guardado corresponde a las actividades básicas por niño. Los juegos de sonidos y la selección de palabras por edad son práctica de esta visita, sin XP ni medallas. Estas actividades no acreditan progreso clínico.</p>
  </div></section>;
}

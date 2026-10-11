import { useState } from 'react';
import { AudioLines, ChevronRight, MessageCircle, Mic, Music2, Smile } from 'lucide-react';
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
import { Ashi } from './Ashi';

const worldIcons = { FLUIDEZ: Music2, HABLA: AudioLines, LENGUAJE: MessageCircle, VOZ: Mic, OROFACIAL: Smile };
export function MundoAshaHome({ go }: { go: (view: View) => void; padrePlan?: 'exploracion' | 'familia' }) {
  const { user, role } = useAuth();
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const family = role === 'PADRE';
  const queryClient = useQueryClient();
  const catalog = useQuery({ queryKey: ['public-basic-worlds'], queryFn: ({ signal }) => learningGames.catalog(signal), enabled: !family });
  const progress = useRemote(['game-progress', patient?.id_paciente], signal => learningGames.progress(patient!.id_paciente, signal), family && !!patient);
  const [worldId, setWorldId] = useState<WorldArea | null>(null);
  const worlds = progress.data?.mundos.filter(w => w.asignado) ?? [];
  const world = worlds.find(w => w.id === worldId);
  function saved(value: GameProgress) { queryClient.setQueryData([user?.id_usuario, 'game-progress', value.id_paciente], value); }
  return <section className="family-worlds min-h-screen p-4 sm:p-6 text-[#1C1135] bg-[#F5F3FF]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}><div className="max-w-5xl mx-auto pb-12 space-y-6">
    <header className="flex items-center gap-4"><Ashi size={64} mood="wave"/><div><h1 className="text-3xl font-black">Mundo ASHA</h1><p className="text-base text-[#4B4264] mt-2">Cinco mundos con actividades básicas y niveles de acceso libre.</p></div></header>
    <p role="note" className="text-base leading-relaxed text-[#4B4264]">Los intentos, experiencia y medallas se guardan por niño. El avance corresponde a actividades de simulación; no acredita progreso clínico. Los juegos definitivos se incorporarán después.</p>
    {!family ? <><p>Ingresa como familia para practicar en los mundos asignados a cada niño.</p><Btn onClick={() => go('login')}>Ingresar</Btn><RemoteFeedback pending={catalog.isPending} error={catalog.error} retry={() => void catalog.refetch()}/><ul className="space-y-3">{catalog.data?.map(w => <li key={w.id}><h2 className="text-lg font-bold">{w.name}</h2><p>{w.description} · {w.levels.length} niveles básicos.</p></li>)}</ul></> : <>
      <RemoteFeedback pending={patients.isPending || (!!patient && progress.isPending)} error={patients.error || progress.error} retry={() => { void patients.refetch(); if (patient) void progress.refetch(); }}/>
      {patient && <div><label className="block font-bold mb-2" htmlFor="learning-child">Hijo o hija</label><select id="learning-child" className="w-full sm:max-w-md rounded-xl border border-[#C4BAE0] bg-white px-4 py-3 text-base" value={patient.id_paciente} onChange={e => { selectPatient(Number(e.target.value)); setWorldId(null); }}>{children.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombres_paciente} {p.apellidos_paciente}</option>)}</select></div>}
      {progress.data && !progress.error && <p className="font-bold">Nivel {progress.data.nivel} · {progress.data.experiencia} XP · {progress.data.medallas.length} medallas · {progress.data.intentos_totales} intentos. Próximo nivel: {progress.data.experiencia_siguiente_nivel} XP.</p>}
      {!patients.error && !progress.error && progress.isSuccess && patient && (world ? <DemoWorldPlayer key={`${user?.id_usuario}:${patient.id_paciente}:${world.id}`} world={world} patientId={patient.id_paciente} onSaved={saved} back={() => setWorldId(null)}/> : worlds.length ? <section aria-label="Mundos asignados"><h2 className="text-xl font-extrabold mb-3">Mundos de {patient.nombres_paciente}</h2><ul className="family-world-list divide-y divide-[#E8E5F4]">{worlds.map(w => { const Icon = worldIcons[w.id]; return <li key={w.id} className="py-5 flex flex-wrap justify-between items-center gap-4"><Icon size={36} strokeWidth={1.6} aria-hidden="true"/><div><h3 className="text-xl font-extrabold">{w.name}</h3><p className="text-base text-[#4B4264] mt-2">{w.description}</p><p className="text-sm mt-2 font-bold">{w.completados.length}/{w.levels.length} niveles · {w.intentos} intentos{w.medalla ? ' · Medalla obtenida' : ''}</p></div><Btn onClick={() => setWorldId(w.id)}>Abrir {w.name} <ChevronRight size={16}/></Btn></li>; })}</ul></section> : <div className="space-y-3"><h2 className="text-xl font-bold">Mundos pendientes para {patient.nombres_paciente}</h2><p>El profesional puede asignar los cinco mundos desde el plan de este niño.</p><Btn onClick={() => go('padre/camino')}>Ver el recorrido de mi hijo</Btn></div>)}
      {progress.data?.medallas.length ? <section><h2 className="text-xl font-bold">Medallas del perfil</h2><ul className="space-y-2 mt-3">{progress.data.medallas.map(m => <li key={m.codigo}>{m.nombre} · {new Date(m.fecha).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</li>)}</ul></section> : null}
      {patients.isSuccess && children.length === 0 && <p>Aún no tienes hijos registrados.</p>}
    </>}
  </div></section>;
}

import { useState } from 'react';
import { ChevronRight, AudioLines, MessageCircle, Music2 } from 'lucide-react';
import type { View } from '@/types/navigation';
import { Btn } from '@/components/common/Btn';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { useSelectedFamilyPatient } from '@/hooks/useSelectedFamilyPatient';
import { useAuth } from '@/hooks/useAuth';
import { useRemote } from '@/hooks/useRemoteData';
import { treatmentsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import { DEMO_WORLDS } from '@/services/demoWorlds';
import type { WorldArea } from '@/types/clinical';
import { DemoWorldPlayer } from './DemoWorldPlayer';
import { Ashi } from './Ashi';

const worldIcons = { FLUIDEZ: Music2, HABLA: AudioLines, LENGUAJE: MessageCircle };

export function MundoAshaHome({ go }: { go: (view: View) => void; padrePlan?: 'exploracion' | 'familia' }) {
  const { user, role } = useAuth();
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const family = role === 'PADRE';
  const plans = useRemote(['learning-plans', patient?.id_paciente], signal => readAllPages(offset => treatmentsService.list(patient!.id_paciente, { limit:100, offset }, signal), signal), family && !!patient);
  const [worldId, setWorldId] = useState<WorldArea | null>(null);
  const plan = plans.data?.find(p => p.estado_tratamiento === 'ACTIVO' && p.id_sesion_origen);
  const worlds = DEMO_WORLDS.filter(w => plan?.mundos_asignados?.includes(w.id));
  const world = worlds.find(w => w.id === worldId);
  return <section className="family-worlds min-h-screen p-4 sm:p-6 text-[#1C1135] bg-[#F5F3FF]" style={{ fontFamily:'"Nunito", system-ui, sans-serif' }}><div className="max-w-5xl mx-auto pb-12 space-y-6">
    <header className="flex items-center gap-4"><Ashi size={64} mood="wave"/><div><h1 className="text-3xl font-black">Mundo ASHA</h1><p className="text-base text-[#4B4264] mt-2">Practica en los mundos que tu profesional asignó.</p></div></header>
    <p role="note" className="text-base leading-relaxed text-[#4B4264]">Demostración de juegos: jugar, completar, desbloquear y repetir. El avance se conserva por niño y cuenta en esta pestaña; no se guarda en el servidor ni se comparte con otros dispositivos. No mide mejoría clínica ni condiciona las reservas.</p>
    {!family ? <><p>Ingresa como familia para consultar los mundos asignados a cada niño.</p><Btn onClick={() => go('login')}>Ingresar</Btn><ul className="space-y-3">{DEMO_WORLDS.map(w => <li key={w.id}><h2 className="text-lg font-bold">{w.name}</h2><p>{w.description} · 3 niveles de demostración.</p></li>)}</ul></> : <>
      <RemoteFeedback pending={patients.isPending || (!!patient && plans.isPending)} error={patients.error || plans.error} retry={() => { void patients.refetch(); if(patient) void plans.refetch(); }}/>
      {patient && <div><label className="block font-bold mb-2" htmlFor="learning-child">Hijo o hija</label><select id="learning-child" className="w-full sm:max-w-md rounded-xl border border-[#C4BAE0] bg-white px-4 py-3 text-base" value={patient.id_paciente} onChange={e => { selectPatient(Number(e.target.value)); setWorldId(null); }}>{children.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombres_paciente} {p.apellidos_paciente}</option>)}</select></div>}
      {!patients.error && !plans.error && plans.isSuccess && patient && (world && user ? <DemoWorldPlayer key={`${user.id_usuario}:${patient.id_paciente}:${world.id}`} world={world} userId={user.id_usuario} patientId={patient.id_paciente} back={() => setWorldId(null)}/> : worlds.length ? <section aria-label="Mundos asignados"><h2 className="text-xl font-extrabold mb-3">Mundos de {patient.nombres_paciente}</h2><p className="text-base mb-5">Plan: {plan!.nombre_tratamiento} · {plan!.terapeuta_nombre} · {plan!.sesiones_recomendadas} sesiones recomendadas.</p><ul className="family-world-list divide-y divide-[#E8E5F4]">{worlds.map(w => { const Icon = worldIcons[w.id]; return <li key={w.id} className="py-5 flex flex-wrap justify-between items-center gap-4"><Icon size={36} strokeWidth={1.6} aria-hidden="true"/><div><h3 className="text-xl font-extrabold">{w.name}</h3><p className="text-base text-[#4B4264] mt-2">{w.description}</p><p className="text-sm mt-2 font-bold">3 niveles · Demostración</p></div><Btn onClick={() => setWorldId(w.id)}>Abrir {w.name} <ChevronRight size={16}/></Btn></li>; })}</ul></section> : <div className="space-y-3"><h2 className="text-xl font-bold">Mundos pendientes para {patient.nombres_paciente}</h2><p>El profesional los asignará desde su plan. Consulta la introducción y el reporte de este niño.</p><Btn onClick={() => go('padre/camino')}>Ver el recorrido de mi hijo</Btn></div>)}
      {patients.isSuccess && !patient && <div className="space-y-3"><p>Aún no tienes hijos registrados.</p><Btn onClick={() => go('padre/config')}>Gestionar hijos</Btn></div>}
    </>}
  </div></section>;
}

import { ChevronLeft, Eye, Video } from 'lucide-react';
import { useTerapeutaPacientes } from './useTerapeutaPacientes';
import { PatientClinicalHistory } from './PatientClinicalHistory';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { Btn } from '@/components/common/Btn';
import { Crd } from '@/components/common/Crd';
import { Av } from '@/components/common/Av';
import { Inp } from '@/components/common/Inp';

export function TerapeutaPacientes(props: Parameters<typeof useTerapeutaPacientes>[0]) {
  const { query, sessions, appointments, selected, setSelected, expTab, setExpTab, search, setSearch, patientsList } = useTerapeutaPacientes(props);
  const p = patientsList.find(row => row.id === selected);
  const feedback = <RemoteFeedback pending={query.isPending} error={query.error || sessions.error || appointments.error} retry={() => { void query.refetch(); void sessions.refetch(); void appointments.refetch(); }}/>;
  if (p) return <div className="p-4 sm:p-6 max-w-6xl mx-auto text-[#1C1135]">
    <Btn variant="ghost" className="mb-5" onClick={() => setSelected(null)}><ChevronLeft size={18}/>Volver a pacientes</Btn>
    {feedback}
    <header className="professional-patient-summary bg-white rounded-2xl p-5 sm:p-6 mb-6 border border-[#E8E5F4]">
      <div className="flex gap-4 items-center flex-wrap"><Av initials={p.av} color={p.color} size="lg"/><div className="flex-1 min-w-0"><h1 className="font-black text-2xl break-words">{p.name}</h1><p className="text-sm text-[#4B4264]">{p.age} años · {p.status}</p></div><Btn onClick={() => setExpTab('sesiones')}><Video size={16}/>Sesión</Btn></div>
      <dl className="grid sm:grid-cols-3 gap-4 mt-6">{[['Sesiones atendidas', p.sessions], ['Progreso', 'Próximamente'], ['Próxima sesión', p.nextSession]].map(([label, value]) => <div key={label}><dt className="text-sm text-[#4B4264]">{label}</dt><dd className="font-bold text-base mt-1">{value}</dd></div>)}</dl>
    </header>
    <nav aria-label="Expediente" className="flex gap-2 mb-6 flex-wrap">{(['resumen', 'sesiones', 'reportes'] as const).map(tab => <button key={tab} aria-pressed={expTab === tab} onClick={() => setExpTab(tab)} className={`px-5 py-3 rounded-xl font-bold text-sm ${expTab === tab ? 'bg-violet-700 text-white' : 'text-[#4B4264] hover:bg-violet-50'}`}>{tab === 'resumen' ? 'Resumen' : tab === 'sesiones' ? 'Sesiones' : 'Reportes'}</button>)}</nav>
    {expTab === 'resumen' && <div className="space-y-3"><h2 className="text-lg font-extrabold">Reportes y planes del paciente</h2><p className="text-base text-[#4B4264]">Consulta el reporte y el plan de cada atención.</p><PatientClinicalHistory key={`summary-${p.id}`} patientId={p.id} reportsOnly/></div>}
    {expTab === 'sesiones' && <PatientClinicalHistory key={`sessions-${p.id}`} patientId={p.id}/>}
    {expTab === 'reportes' && <PatientClinicalHistory key={`reports-${p.id}`} patientId={p.id} reportsOnly/>}
  </div>;
  const filtered = patientsList.filter(row => row.name.toLowerCase().includes(search.toLowerCase()));
  return <div className="p-4 sm:p-6 max-w-6xl mx-auto text-[#1C1135]">
    <header className="flex gap-4 flex-wrap items-center justify-between mb-6"><div><h1 className="font-black text-2xl">Pacientes</h1><p className="text-sm text-[#4B4264] mt-1">{patientsList.length} pacientes activos</p></div><Inp placeholder="Buscar paciente…" value={search} onChange={setSearch}/></header>
    {feedback}
    {query.isSuccess && !query.error && !filtered.length && <p className="py-8">Sin pacientes autorizados que coincidan con la búsqueda.</p>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{filtered.map(row => <Crd key={row.id} className="p-5"><div className="flex items-center gap-3 mb-5"><Av initials={row.av} color={row.color} size="lg"/><div className="min-w-0"><h2 className="font-extrabold break-words">{row.name}</h2><p className="text-sm text-[#4B4264]">{row.age} años · {row.status}</p></div></div><dl className="space-y-3 mb-5">{[['Próxima sesión',row.nextSession],['Sesiones atendidas',row.sessions],['Progreso','Próximamente']].map(([label,value]) => <div key={label}><dt className="text-sm text-[#4B4264]">{label}</dt><dd className="font-bold text-sm">{value}</dd></div>)}</dl><Btn variant="secondary" className="w-full" onClick={() => { setSelected(row.id); setExpTab('resumen'); }}><Eye size={16}/>Abrir expediente</Btn></Crd>)}</div>
  </div>;
}

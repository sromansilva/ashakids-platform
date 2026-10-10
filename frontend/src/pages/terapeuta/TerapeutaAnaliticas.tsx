import { useState } from 'react';
import { useRemote } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';

function period(value: string) {
  const parts = new Intl.DateTimeFormat('en', { timeZone:'America/Lima',year:'numeric',month:'numeric' }).formatToParts(new Date(value));
  return { year:Number(parts.find(p => p.type === 'year')?.value), month:Number(parts.find(p => p.type === 'month')?.value) };
}
export function TerapeutaAnaliticas() {
  const query = useRemote(['therapist-analytics'], signal => readAllPages(offset => sessionsService.list({limit:100,offset}, signal), signal));
  const current = period(new Date().toISOString());
  const [year,setYear] = useState(current.year);
  const [month,setMonth] = useState(0);
  const rows = query.error ? [] : query.data ?? [];
  const years = [...new Set([current.year,...rows.map(s => period(s.cita.fecha_hora_inicio).year)])].sort((a,b) => b-a);
  const yearly = rows.filter(s => period(s.cita.fecha_hora_inicio).year === year);
  const selected = yearly.filter(s => !month || period(s.cita.fecha_hora_inicio).month === month);
  const attended = selected.filter(s => s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO');
  const months = Array.from({length:12}, (_,index) => ({ month:index+1, label: new Date(2020,index,1).toLocaleDateString('es-PE',{month:'long'}), count:yearly.filter(s => s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO' && period(s.cita.fecha_hora_inicio).month === index+1).length }));
  const max = Math.max(1,...months.map(m => m.count));
  return <section className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-[#1C1135]">
    <header><h1 className="text-2xl font-black">Analíticas</h1><p className="text-base text-[#4B4264] mt-2">Tus sesiones registradas por mes y año, en horario de Lima.</p></header>
    <div className="flex gap-4 flex-wrap"><label className="font-bold text-sm">Año<select value={year} onChange={e => setYear(Number(e.target.value))} className="block mt-2 p-3 rounded-xl bg-white border border-[#E8E5F4]">{years.map(y => <option key={y}>{y}</option>)}</select></label><label className="font-bold text-sm">Mes<select value={month} onChange={e => setMonth(Number(e.target.value))} className="block mt-2 p-3 rounded-xl bg-white border border-[#E8E5F4]"><option value={0}>Todos los meses</option>{months.map(m => <option key={m.month} value={m.month}>{m.label}</option>)}</select></label></div>
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()}/>
    {query.isSuccess && !query.error && <><dl className="grid gap-4 sm:grid-cols-3">{[
      ['Sesiones atendidas',attended.length],['Pacientes atendidos',new Set(attended.map(s => s.cita.id_paciente)).size],['Inasistencias',selected.filter(s => s.asistencia === 'NO_ASISTIO').length],
    ].map(([label,count]) => <div key={label} className="py-4"><dt className="font-bold text-[#4B4264]">{label}</dt><dd className="text-3xl font-black tabular-nums mt-2">{count}</dd></div>)}</dl>
    <section><h2 className="text-lg font-extrabold mb-4">Sesiones atendidas por mes · {year}</h2><ol className="space-y-3">{months.map(m => <li key={m.month} className="grid grid-cols-[6rem_1fr_2rem] gap-4 items-center text-sm"><span className="capitalize font-bold">{m.label}</span><div aria-hidden="true" className="h-3 bg-violet-100 rounded-full overflow-hidden"><div className="h-full bg-violet-700 rounded-full" style={{width:`${m.count/max*100}%`}}/></div><span className="tabular-nums font-bold">{m.count}</span></li>)}</ol></section>
    {!selected.length && <p>No hay sesiones registradas en este periodo.</p>}
    <p className="text-sm text-[#4B4264]">Los conteos corresponden a tus atenciones autorizadas. Objetivos alcanzados y evolución clínica siguen sin una medición conectada; los juegos demo no alimentan estas cifras.</p></>}
  </section>;
}

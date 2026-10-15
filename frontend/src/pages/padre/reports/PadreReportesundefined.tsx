import type { usePadreReportes } from './usePadreReportes';
import { ChevronRight, Video, Building2 } from 'lucide-react';
import { B } from '@/theme/brand/B';
import { SessionActions } from '@/components/common/SessionActions';

type Props = Pick<ReturnType<typeof usePadreReportes>, 'tab' | 'setTab' | 'sessions' | 'openSession' | 'setOpenSession'> & { ready: boolean };
export function PadreReportesundefined({ tab, setTab, sessions, openSession, setOpenSession, ready }: Props) {
  return <div className="p-4 sm:p-6 max-w-3xl" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
    <div className="mb-6"><h1 className="text-2xl font-black text-[#1C1135]">Reportes de sesiones</h1>
      <p className="text-base text-[#4B4264] mt-2">Historial y reportes guardados por el profesional asignado. Abre una sesión para consultar o descargar su PDF.</p></div>
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {[{ value: ready ? String(sessions.length) : 'Sin datos', label: 'Sesiones totales' }, { value: 'Sin medición', label: 'Progreso general' }, { value: 'Sin registro', label: 'Valoración terapeuta' }].map(item =>
        <div key={item.label} className="bg-white rounded-2xl p-4 border border-[#E8E5F4]"><dt className="text-sm text-[#4B4264]">{item.label}</dt><dd className="text-lg font-black mt-1" style={{ color: B.violet }}>{item.value}</dd></div>)}
    </dl>
    <div className="flex flex-wrap gap-2 mb-5 bg-white border border-[#E8E5F4] rounded-2xl p-1">
      {([['sesiones', 'Sesiones'], ['progreso', 'Progreso mensual (pendiente)']] as const).map(([id, label]) =>
        <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)} className="flex-1 min-w-32 py-3 px-2 rounded-xl text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-violet-700 focus-visible:outline-offset-2"
          style={{ background: tab === id ? B.violet : 'transparent', color: tab === id ? 'white' : B.textMid }}>{label}</button>)}
    </div>
    {tab === 'progreso' ? <section className="text-base text-[#4B4264] space-y-2"><h2 className="font-extrabold text-[#1C1135]">Informes mensuales pendientes</h2>
      <p>Todavía no hay un registro de evaluación mensual. Consulta los reportes de sesión para ver las observaciones y próximos pasos del profesional.</p>
      <p>El número de sesiones no mide la mejoría clínica.</p></section> : <div className="space-y-3">
      {ready && sessions.length === 0 && <p className="text-base text-[#4B4264]">No hay sesiones registradas.</p>}
      {sessions.map(s => <div key={s.id} className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden">
        <button aria-expanded={openSession === s.id} aria-controls={`session-detail-${s.id}`} className="w-full flex items-center gap-3 p-4 text-left hover:bg-violet-50/40 focus-visible:outline-2 focus-visible:outline-violet-700 focus-visible:outline-offset-[-2px]" onClick={() => setOpenSession(openSession === s.id ? null : s.id)}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.type === 'virtual' ? B.violetLight : B.tealLight }}>{s.type === 'virtual' ? <Video size={20} aria-hidden="true" /> : <Building2 size={20} aria-hidden="true" />}</span>
          <span className="flex-1 min-w-0 break-words"><span className="font-extrabold text-base text-[#1C1135] block">{s.date} · {s.time}</span>
            <span className="text-sm text-[#4B4264] block">{s.patient} · {s.therapist}</span>
            <span className="text-sm text-[#4B4264] block mt-1">{s.type} · {s.state} · {s.duration}</span>
            <span className="text-sm font-bold text-violet-800 block mt-1">{s.reportAvailable ? 'Reporte guardado disponible' : 'Sin reporte guardado'}</span></span>
          <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-violet-800" style={{ transform: openSession === s.id ? 'rotate(90deg)' : 'none' }} />
        </button>
        {openSession === s.id && <div id={`session-detail-${s.id}`} className="px-4 pb-4 border-t border-[#E8E5F4]"><SessionActions appointmentId={s.appointmentId} /></div>}
      </div>)}
    </div>}
  </div>;
}

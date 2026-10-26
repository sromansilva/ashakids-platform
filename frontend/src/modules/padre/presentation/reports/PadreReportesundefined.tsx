import type { usePadreReportes } from './usePadreReportes';
import { ChevronRight, Video, Building2, Calendar, BarChart2, User, FileText } from 'lucide-react';
import { SessionActions } from '@/shared/presentation/components/common/SessionActions';

type Props = Pick<ReturnType<typeof usePadreReportes>, 'tab' | 'setTab' | 'sessions' | 'openSession' | 'setOpenSession'> & { ready: boolean };

export function PadreReportesundefined({ tab, setTab, sessions, openSession, setOpenSession, ready }: Props) {
  return (
    <div className="p-4 sm:p-8 max-w-5xl text-[#1C1135]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Reportes de sesiones</h1>
        <p className="text-sm font-medium text-[#6B5E8A] mt-1.5 max-w-3xl leading-relaxed">
          Historial y reportes guardados por el profesional asignado. Abre una sesión para consultar o descargar su PDF.
        </p>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2FE] flex items-center justify-center text-[#6B46FE] shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8C82A8]">Sesiones totales</p>
            <p className="text-2xl font-black text-[#6B46FE] mt-0.5">
              {ready ? String(sessions.length) : 'Sin datos'}
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F8F5] flex items-center justify-center text-[#0D9488] shrink-0">
            <BarChart2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8C82A8]">Progreso general</p>
            <p className="text-lg font-black text-[#6B46FE] mt-0.5">Sin medición</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF3E8] flex items-center justify-center text-[#EA580C] shrink-0">
            <User size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8C82A8]">Valoración terapeuta</p>
            <p className="text-lg font-black text-[#6B46FE] mt-0.5">Sin registro</p>
          </div>
        </div>
      </div>

      {/* Tabs Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-white border border-[#E8E5F4] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setTab('sesiones')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
            tab === 'sesiones'
              ? 'bg-[#6B46FE] text-white shadow-md shadow-[#6B46FE]/20'
              : 'text-[#6B5E8A] hover:text-[#6B46FE]'
          }`}
        >
          <FileText size={16} />
          <span>Sesiones</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('progreso')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
            tab === 'progreso'
              ? 'bg-[#6B46FE] text-white shadow-md shadow-[#6B46FE]/20'
              : 'text-[#6B5E8A] hover:text-[#6B46FE]'
          }`}
        >
          <BarChart2 size={16} />
          <span>Progreso mensual (pendiente)</span>
        </button>
      </div>

      {/* Content */}
      {tab === 'progreso' ? (
        <section className="bg-white rounded-3xl border border-[#E8E5F4] p-8 text-sm text-[#6B5E8A] space-y-3">
          <h2 className="font-black text-xl text-[#1C1135]">Informes mensuales pendientes</h2>
          <p className="leading-relaxed">
            Todavía no hay un registro de evaluación mensual consolidado. Consulta los reportes de sesión para ver las observaciones clínicas y los próximos pasos fijados por el profesional.
          </p>
          <p className="text-xs text-[#8C82A8] font-bold">
            Nota: El número de sesiones no mide de forma lineal la mejoría clínica.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {ready && sessions.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#E8E5F4] p-8 text-center text-sm font-bold text-[#8C82A8]">
              No hay sesiones registradas actualmente para este hijo.
            </div>
          )}

          {sessions.map((s) => {
            const isExpanded = openSession === s.id;
            const isVirtual = s.type === 'virtual';

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden transition-all hover:border-violet-300 shadow-xs"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`session-detail-${s.id}`}
                  onClick={() => setOpenSession(isExpanded ? null : s.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors gap-4"
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isVirtual ? 'bg-[#F4EFFE] text-[#6B46FE]' : 'bg-[#E6F8F5] text-[#0D9488]'
                      }`}
                    >
                      {isVirtual ? <Video size={20} /> : <Building2 size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-base text-[#1C1135] truncate">
                        {s.date} · {s.time}
                      </p>
                      <p className="text-xs font-semibold text-[#8C82A8] mt-0.5 truncate">
                        {s.patient} · {s.therapist}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                        <span className="text-[#6B5E8A] font-bold capitalize">{s.type}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            s.state === 'FINALIZADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-violet-100 text-violet-800'
                          }`}
                        >
                          {s.state}
                        </span>
                        <span className="text-[#8C82A8]">· {s.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Report status badge & Arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          s.reportAvailable
                            ? 'bg-[#E6F8F5] text-[#0D9488]'
                            : 'bg-[#F5F2FE] text-[#8C82A8]'
                        }`}
                      >
                        <FileText size={18} />
                      </div>
                      <span
                        className={`text-xs font-black hidden sm:inline ${
                          s.reportAvailable ? 'text-[#6B46FE]' : 'text-[#8C82A8]'
                        }`}
                      >
                        {s.reportAvailable ? 'Reporte guardado disponible' : 'Sin reporte guardado'}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-[#6B46FE] transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div
                    id={`session-detail-${s.id}`}
                    className="p-5 border-t border-[#F0EEF8] bg-[#FBFBFE]"
                  >
                    <SessionActions appointmentId={s.appointmentId} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

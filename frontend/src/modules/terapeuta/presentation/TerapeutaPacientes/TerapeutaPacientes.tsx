import { ChevronLeft, Eye, Video, Search, Calendar, FileText, BarChart3 } from 'lucide-react';
import { useTerapeutaPacientes } from './useTerapeutaPacientes';
import { PatientClinicalHistory } from './PatientClinicalHistory';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { Btn } from '@/shared/presentation/components/common/Btn';
import { Av } from '@/shared/presentation/components/common/Av';

export function TerapeutaPacientes(props: Parameters<typeof useTerapeutaPacientes>[0]) {
  const {
    query,
    sessions,
    appointments,
    selected,
    setSelected,
    expTab,
    setExpTab,
    search,
    setSearch,
    patientsList,
  } = useTerapeutaPacientes(props);

  const p = patientsList.find((row) => row.id === selected);
  const feedback = (
    <RemoteFeedback
      pending={query.isPending}
      error={query.error || sessions.error || appointments.error}
      retry={() => {
        void query.refetch();
        void sessions.refetch();
        void appointments.refetch();
      }}
    />
  );

  if (p) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
        <Btn variant="ghost" className="mb-5 inline-flex items-center gap-2 font-bold text-[#6B46FE]" onClick={() => setSelected(null)}>
          <ChevronLeft size={18} />
          Volver a pacientes
        </Btn>
        {feedback}
        <header className="bg-white rounded-3xl p-6 sm:p-8 mb-6 border border-[#E8E5F4] shadow-sm">
          <div className="flex gap-4 items-center justify-between flex-wrap pb-6 border-b border-[#E8E5F4]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#6B46FE] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
                {p.av}
              </div>
              <div className="min-w-0">
                <h1 className="font-black text-2xl text-[#1C1135] break-words">{p.name}</h1>
                <p className="text-sm text-[#615274] mt-0.5">
                  {p.age} años · <span className="text-[#16A34A] font-bold">● {p.status}</span>
                </p>
              </div>
            </div>
            <Btn onClick={() => setExpTab('sesiones')} className="bg-[#6B46FE] hover:bg-[#5833EA] text-white">
              <Video size={16} />
              Ver sesiones
            </Btn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">Próxima sesión</p>
                <p className="text-base font-extrabold text-[#1C1135] mt-0.5">{p.nextSession || "Por programar"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">Sesiones atendidas</p>
                <p className="text-base font-extrabold text-[#1C1135] mt-0.5">{p.sessions || 2}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">Progreso</p>
                <p className="text-base font-extrabold text-[#1C1135] mt-0.5">Próximamente</p>
              </div>
            </div>
          </div>
        </header>

        <nav aria-label="Expediente" className="flex gap-2 mb-6 flex-wrap">
          {(['resumen', 'sesiones', 'reportes'] as const).map((tab) => (
            <button
              key={tab}
              aria-pressed={expTab === tab}
              onClick={() => setExpTab(tab)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                expTab === tab
                  ? 'bg-[#6B46FE] text-white shadow-sm'
                  : 'bg-white border border-[#E8E5F4] text-[#615274] hover:bg-violet-50'
              }`}
            >
              {tab === 'resumen' ? 'Resumen' : tab === 'sesiones' ? 'Sesiones' : 'Reportes'}
            </button>
          ))}
        </nav>

        {expTab === 'resumen' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#1C1135]">Reportes y planes del paciente</h2>
              <p className="text-sm text-[#615274]">Consulta el reporte y el plan de cada atención.</p>
            </div>
            <PatientClinicalHistory key={`summary-${p.id}`} patientId={p.id} reportsOnly />
          </div>
        )}
        {expTab === 'sesiones' && <PatientClinicalHistory key={`sessions-${p.id}`} patientId={p.id} />}
        {expTab === 'reportes' && <PatientClinicalHistory key={`reports-${p.id}`} patientId={p.id} reportsOnly />}
      </div>
    );
  }

  const filtered = patientsList.filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Pacientes</h1>
          <p className="text-sm font-bold text-[#615274] mt-1">
            {patientsList.length} paciente{patientsList.length === 1 ? '' : 's'} activo{patientsList.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input
            type="text"
            placeholder="Buscar paciente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-[#E8E5F4] text-sm text-[#1C1135] placeholder:text-[#9E95B7] focus:outline-none focus:ring-2 focus:ring-[#6B46FE] shadow-sm"
          />
        </div>
      </header>

      {feedback}

      {query.isSuccess && !query.error && !filtered.length && (
        <div className="bg-white rounded-3xl p-8 border border-[#E8E5F4] text-center my-6">
          <p className="text-sm font-bold text-[#615274]">Sin pacientes autorizados que coincidan con la búsqueda.</p>
        </div>
      )}

      {/* Patient List */}
      <div className="space-y-4 mb-10">
        {filtered.map((row) => (
          <div
            key={row.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-violet-300 transition-all"
          >
            {/* Identity */}
            <div className="flex items-center gap-4 min-w-[220px]">
              <div className="w-14 h-14 rounded-full bg-[#6B46FE] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {row.av}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-[#1C1135] truncate">{row.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#615274]">{row.age} años</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#16A34A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    Activo
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1 max-w-2xl px-0 lg:px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#615274]">Próxima sesión</p>
                  <p className="text-sm font-extrabold text-[#1C1135] mt-0.5">{row.nextSession || "Por programar"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#615274]">Sesiones atendidas</p>
                  <p className="text-sm font-extrabold text-[#1C1135] mt-0.5">{row.sessions || 2}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#615274]">Progreso</p>
                  <p className="text-sm font-extrabold text-[#1C1135] mt-0.5">Próximamente</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                setSelected(row.id);
                setExpTab('resumen');
              }}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-sm shadow-sm transition-all active:scale-[.98] cursor-pointer shrink-0"
            >
              <Eye size={17} />
              Abrir expediente
            </button>
          </div>
        ))}
      </div>

      {/* Centered Empty / Prompt State */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <img
          src="/illustrations/ashi-folder.png"
          alt="Ashi con carpeta clínica"
          className="w-80 h-auto object-contain drop-shadow-sm mb-4"
        />
        <h3 className="text-xl font-black text-[#1C1135]">
          Selecciona un paciente para consultar su expediente.
        </h3>
        <p className="text-sm text-[#615274] mt-1.5 max-w-md">
          Aquí podrás ver sus sesiones, agenda y más información.
        </p>
      </div>
    </div>
  );
}

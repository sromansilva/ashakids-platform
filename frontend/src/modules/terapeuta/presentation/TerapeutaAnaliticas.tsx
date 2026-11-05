import { useState } from 'react';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { patientsService, sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import { readAllPages } from '@/core/api/readAllPages';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { Users, User, Calendar, BarChart3, TrendingUp } from 'lucide-react';

function period(value: string) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date(value));
  return {
    year: Number(parts.find((p) => p.type === 'year')?.value),
    month: Number(parts.find((p) => p.type === 'month')?.value),
  };
}

const MONTH_LABELS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

export function TerapeutaAnaliticas() {
  const query = useRemote(['therapist-analytics'], (signal) =>
    readAllPages((offset) => sessionsService.list({ limit: 100, offset }, signal), signal)
  );
  const current = period(new Date().toISOString());
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(0);

  const [evolutionPatient, setEvolutionPatient] = useState(0);
  const rows = query.error ? [] : query.data ?? [];
  const years = [...new Set([current.year, ...rows.map((s) => period(s.cita.fecha_hora_inicio).year)])].sort((a, b) => b - a);
  const yearly = rows.filter((s) => period(s.cita.fecha_hora_inicio).year === year);
  const selected = yearly.filter((s) => !month || period(s.cita.fecha_hora_inicio).month === month);
  const attended = selected.filter((s) => s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO');

  // Generate 12 months data
  const months = Array.from({ length: 12 }, (_, index) => {
    const count = yearly.filter(
      (s) =>
        s.estado_sesion === 'FINALIZADA' &&
        s.asistencia === 'ASISTIO' &&
        period(s.cita.fecha_hora_inicio).month === index + 1
    ).length;
    return {
      month: index + 1,
      shortLabel: MONTH_LABELS_SHORT[index],
      count,
    };
  });

  const highestMonthCount = Math.max(0, ...months.map((m) => m.count));
  const max = Math.max(2, Math.ceil(highestMonthCount / 2) * 2);
  const axisTicks = [max, max / 2, 0];
  const patientOptions = [...new Map(
    rows
      .filter((s) => s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO')
      .map((s) => [s.cita.id_paciente, s.cita.paciente_nombre] as const),
  ).entries()];
  const activePatient = evolutionPatient || patientOptions[0]?.[0] || 0;
  const evolutionQuery = useRemote(
    ['phoneme-evolution', activePatient],
    (signal) => patientsService.phonemeEvolution(activePatient, signal),
    activePatient > 0,
  );
  const evolution = evolutionQuery.data?.sesiones ?? [];
  const attendedCount = attended.length;
  const uniquePatientsCount = new Set(attended.map((s) => s.cita.id_paciente)).size;
  const missedCount = selected.filter((s) => s.asistencia === 'NO_ASISTIO').length;

  return (
    <div className="therapist-page w-full max-w-none px-4 py-4 text-[#1C1135] sm:px-6 sm:py-5 lg:px-8">
      {/* Header with Filters & Ashi */}
      <div className="therapist-animate mb-5 flex flex-col gap-5 overflow-hidden rounded-3xl border border-[#E8E5F4] bg-gradient-to-r from-white via-white to-[#F8F6FF] p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-[#1C1135] sm:text-3xl">Analíticas</h1>
          <p className="mt-1 text-sm font-semibold text-[#615274]">
            Tus sesiones registradas por mes y año.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="analytics-year" className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C82A8]">
                Año
            </label>
            <select
              id="analytics-year"
              aria-label="Año"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl border border-[#E8E5F4] bg-white px-3.5 py-2 text-xs font-extrabold text-[#1C1135] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6B46FE]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="analytics-month" className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C82A8]">
                Mes
            </label>
            <select
              id="analytics-month"
              aria-label="Mes"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-xl border border-[#E8E5F4] bg-white px-3.5 py-2 text-xs font-extrabold text-[#1C1135] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6B46FE]"
            >
              <option value={0}>Todos los meses</option>
              {MONTH_LABELS_SHORT.map((label, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden shrink-0 xl:block xl:w-40 2xl:w-44">
          <img
            src="/illustrations/ashi-tablet.png"
            alt="Robot Ashi Analíticas"
            className="h-24 w-full object-contain drop-shadow-sm"
          />
        </div>
      </div>

      <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />

      {/* Row 1: KPI Metrics Cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Sesiones atendidas',
            count: attendedCount,
            icon: Users,
            bg: 'bg-[#EDE9FE]',
            color: 'text-[#6B46FE]',
          },
          {
            label: 'Pacientes atendidos',
            count: uniquePatientsCount,
            icon: User,
            bg: 'bg-[#CCFBF1]',
            color: 'text-[#0D9488]',
          },
          {
            label: 'Inasistencias',
            count: missedCount,
            icon: Calendar,
            bg: 'bg-[#FFEDD5]',
            color: 'text-[#EA580C]',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="therapist-animate therapist-hover-card relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#E8E5F4] bg-white p-5 shadow-[0_6px_20px_rgba(48,33,87,0.04)]"
          >
            <div className="z-10 flex items-center gap-3.5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={21} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-black tabular-nums text-[#1C1135]">{stat.count}</p>
              </div>
            </div>
            <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
              <stat.icon size={64} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Bar Chart Card */}
      <div className="therapist-animate mb-5 rounded-2xl border border-[#E8E5F4] bg-white p-5 shadow-[0_6px_20px_rgba(48,33,87,0.04)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F2EDFF] text-[#6B46FE]"><BarChart3 size={18} /></span>
            <div>
              <h2 className="text-base font-black text-[#1C1135]">Sesiones atendidas por mes</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#8C82A8]">Distribución anual · {year}</p>
            </div>
          </div>
        </div>

        <div className="relative pt-5 pb-1">
          {/* Grid lines */}
          <div className="pointer-events-none absolute inset-x-0 top-5 bottom-10 flex flex-col justify-between">
            {axisTicks.map((tick, index) => (
              <div key={`${tick}-${index}`} className={`relative w-full border-b ${index === axisTicks.length - 1 ? 'border-[#E8E5F4]' : 'border-dashed border-[#E8E5F4]'}`}>
                <span className="absolute -left-0.5 -translate-y-1/2 text-[10px] font-bold text-[#9E95B7]">{tick}</span>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative z-10 grid h-56 grid-cols-12 items-end gap-1 pl-6 sm:h-60 sm:gap-4">
            {months.map((m) => {
              const heightPercent = max > 0 ? (m.count / max) * 100 : 0;
              const hasData = m.count > 0;
              return (
                <div key={m.month} className="group flex h-full flex-col items-center justify-end">
                  <span className={`mb-1.5 text-[11px] font-black tabular-nums ${hasData ? 'text-[#6B46FE]' : 'text-transparent'}`}>
                    {hasData ? m.count : '0'}
                  </span>
                  <div className="flex w-full max-w-[44px] flex-1 items-end justify-center">
                    {hasData ? (
                      <div
                        className="therapist-chart-bar w-full rounded-t-xl bg-gradient-to-t from-[#6B46FE] to-[#9B7AFF] shadow-[0_4px_12px_rgba(107,70,254,0.18)] transition-all duration-500"
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />
                    ) : (
                      <div className="mb-0.5 h-1 w-2/3 rounded-full bg-[#E8E5F4]" />
                    )}
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-[#615274] sm:text-[11px]">{m.shortLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Evolución fonológica clínica (solo evaluaciones confirmadas por el terapeuta) */}
      <div className="therapist-animate mb-5 rounded-2xl border border-[#E8E5F4] bg-white p-5 shadow-[0_6px_20px_rgba(48,33,87,0.04)] sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F2EDFF] text-[#6B46FE]"><TrendingUp size={18} /></span>
            <div>
              <h2 className="text-base font-black text-[#1C1135]">Evolución fonológica por sesión</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#8C82A8]">
                % de evaluaciones clínicas confirmadas por ti con resultado «Alcanzado». No incluye juegos ni el % de similitud de texto.
              </p>
            </div>
          </div>
          {patientOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label htmlFor="evolution-patient" className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C82A8]">Paciente</label>
              <select
                id="evolution-patient"
                value={activePatient}
                onChange={(e) => setEvolutionPatient(Number(e.target.value))}
                className="rounded-xl border border-[#E8E5F4] bg-white px-3.5 py-2 text-xs font-extrabold text-[#1C1135] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6B46FE]"
              >
                {patientOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
          )}
        </div>
        {evolutionQuery.isError ? (
          <p role="alert" className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">No se pudo cargar la evolución fonológica.</p>
        ) : evolution.length === 0 ? (
          <p className="rounded-xl bg-[#F8F7FC] p-3 text-xs font-semibold text-[#615274]">
            Aún no hay evaluaciones fonológicas confirmadas para este paciente.
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Evolución fonológica por sesión">
            {evolution.map((item) => (
              <li key={item.id_sesion} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-xs sm:grid-cols-[7rem_1fr_auto]">
                <span className="font-bold text-[#615274]">
                  {new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short' }).format(new Date(item.fecha_hora_inicio))}
                </span>
                <span className="h-3 overflow-hidden rounded-full bg-[#EDE9FE]" role="img" aria-label={`${item.porcentaje_alcanzado} % alcanzado`}>
                  <span className="block h-full rounded-full bg-[#6B46FE]" style={{ width: `${item.porcentaje_alcanzado}%` }} />
                </span>
                <span className="font-black tabular-nums text-[#1C1135]">{item.porcentaje_alcanzado} % <span className="font-semibold text-[#8C82A8]">({item.alcanzados}/{item.total})</span></span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

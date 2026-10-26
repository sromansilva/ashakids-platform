import { useState } from 'react';
import type { View } from '@/shared/domain/types/navigation';
import { Gamepad2, Trophy, Star, RotateCw, User, Calendar, Info, ArrowRight, Mic, Sparkles, Volume2 } from 'lucide-react';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { patientsService } from '@/modules/clinica/infrastructure/clinicalService';
import { readAllPages } from '@/core/api/readAllPages';

export function TerapeutaDatosActividad({ go }: { go: (v: View) => void }) {
  const patients = useRemote(['activity-patients'], (signal) =>
    readAllPages((offset) => patientsService.list({ activo: true, limit: 100, offset }, signal), signal)
  );
  const [selectedPatient, setSelectedPatient] = useState('Juan Anticona');
  const [period, setPeriod] = useState('Octubre 2026');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const worlds = [
    {
      id: 'voz',
      name: 'El Estudio de la Voz',
      desc: 'Explora tu voz, identifica sonidos y practica.',
      progress: '1 de 5 niveles',
      attempts: '15 intentos',
      view: 'mundo-asha/isla' as View,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#6B46FE]',
      icon: Mic,
    },
    {
      id: 'gestos',
      name: 'Laboratorio de los Gestos',
      desc: 'Reconoce y practica gestos y expresiones.',
      progress: '0 de 3 niveles',
      attempts: '0 intentos',
      view: 'mundo-asha/laberinto' as View,
      iconBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      icon: Sparkles,
    },
    {
      id: 'sonidos',
      name: 'Taller de los Sonidos',
      desc: 'Descubre, escucha y reproduce sonidos.',
      progress: '0 de 9 aventuras',
      attempts: '—',
      view: 'mundo-asha/juegos' as View,
      iconBg: 'bg-[#FFEDD5]',
      iconColor: 'text-[#EA580C]',
      icon: Volume2,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight">Datos de actividad</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE9FE] text-[#6B46FE]">
              Vista demostrativa <Info size={13} />
            </span>
          </div>
          <p className="text-sm font-bold text-[#615274] mt-2">
            Consulta la participación en los mundos y actividades educativas.
          </p>

          {/* Filters Bar */}
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
              <User size={16} className="text-[#6B46FE]" />
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#1C1135] focus:outline-none cursor-pointer"
              >
                <option value="Juan Anticona">Juan Anticona</option>
                {patients.data?.map((p) => (
                  <option key={p.id_paciente} value={`${p.nombres} ${p.apellidos}`}>
                    {p.nombres} {p.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
              <Calendar size={16} className="text-[#6B46FE]" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#1C1135] focus:outline-none cursor-pointer"
              >
                <option value="Octubre 2026">Octubre 2026</option>
                <option value="Noviembre 2026">Noviembre 2026</option>
                <option value="Diciembre 2026">Diciembre 2026</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="hidden md:block w-56 lg:w-64 shrink-0 z-10">
          <img
            src="/illustrations/ashi-hero-v1.png"
            alt="Robot Ashi Actividad"
            className="w-full h-auto object-contain max-h-44 drop-shadow-md"
          />
        </div>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-3xl p-6 border border-[#E8E5F4] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
              <Gamepad2 size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#615274]">Intentos guardados</p>
              <p className="text-3xl font-black text-[#1C1135] mt-1 tabular-nums">15</p>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
            <Gamepad2 size={80} className="text-[#6B46FE]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E8E5F4] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center shrink-0">
              <Trophy size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#615274]">Niveles completados</p>
              <p className="text-3xl font-black text-[#1C1135] mt-1 tabular-nums">1</p>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
            <Trophy size={80} className="text-[#0D9488]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E8E5F4] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
              <Star size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#615274]">Taller de los Sonidos</p>
              <p className="text-2xl font-black text-[#1C1135] mt-1">0 de 9 aventuras</p>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
            <Star size={80} className="text-[#EA580C]" />
          </div>
        </div>
      </div>

      {/* Row 2: Main Layout (Table Left + Donut Chart Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
        {/* Table Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-[#1C1135] mb-5">Actividad por mundo</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E8E5F4] text-[11px] font-extrabold text-[#615274] uppercase tracking-wider">
                    <th className="pb-3 pr-4">Mundo</th>
                    <th className="pb-3 px-4">Progreso</th>
                    <th className="pb-3 px-4">Intentos guardados</th>
                    <th className="pb-3 pl-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5F4]">
                  {worlds.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F8F7FC] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl ${w.iconBg} ${w.iconColor} flex items-center justify-center shrink-0 shadow-sm`}>
                            <w.icon size={22} />
                          </div>
                          <div>
                            <p className="font-black text-sm text-[#1C1135]">{w.name}</p>
                            <p className="text-xs text-[#615274] mt-0.5">{w.desc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-xs text-[#1C1135] whitespace-nowrap">
                        {w.progress}
                      </td>
                      <td className="py-4 px-4 font-bold text-xs text-[#1C1135] whitespace-nowrap">
                        {w.attempts}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => go(w.view)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#6B46FE] hover:bg-[#EDE9FE] transition-colors cursor-pointer"
                        >
                          Ver actividad <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Donut Chart Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full text-left mb-2">
            <h3 className="text-base font-black text-[#1C1135]">Avance en El Estudio de la Voz</h3>
            <p className="text-xs font-bold text-[#615274] mt-0.5">Actividad educativa</p>
          </div>

          {/* Donut SVG */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle / unfilled segments */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#EDE9FE"
                strokeWidth="12"
                strokeDasharray="47.7 2"
                className="opacity-70"
              />
              {/* Active 1st segment (1 of 5 = 20%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#6B46FE"
                strokeWidth="12"
                strokeDasharray="47 190"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#1C1135] leading-none">1 de 5</span>
              <span className="text-xs font-bold text-[#615274] mt-1">niveles</span>
            </div>
          </div>

          {/* Bottom Illustration */}
          <div className="w-full flex justify-center mt-2">
            <img
              src="/illustrations/voice-studio-bottom.png"
              alt="Estudio de la voz"
              className="w-52 h-auto object-contain max-h-24 drop-shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Bottom Info Alert */}
      <div className="rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4] p-4 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
          <Info size={18} />
        </div>
        <div>
          <p className="text-xs font-extrabold text-[#1C1135]">El avance del juego no mide mejoría clínica.</p>
          <p className="text-xs text-[#615274] mt-0.5">
            Los datos de actividad muestran la participación en los mundos y actividades educativas de AshaKids.
          </p>
        </div>
      </div>
    </div>
  );
}

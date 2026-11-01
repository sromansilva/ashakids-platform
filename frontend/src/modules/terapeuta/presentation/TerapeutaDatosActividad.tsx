import type { View } from '@/shared/domain/types/navigation';
import { ArrowRight, Gamepad2, Info, Mic, Sparkles, Volume2 } from 'lucide-react';

const activities = [
  {
    id: 'voz',
    name: 'El Estudio de la Voz',
    description: 'Explora tu voz, identifica sonidos y practica.',
    view: 'mundo-asha/isla' as View,
    icon: Mic,
    color: 'bg-[#EDE9FE] text-[#6B46FE]',
  },
  {
    id: 'gestos',
    name: 'Laboratorio de los Gestos',
    description: 'Reconoce y practica gestos y expresiones.',
    view: 'mundo-asha/laberinto' as View,
    icon: Sparkles,
    color: 'bg-[#CCFBF1] text-[#0D9488]',
  },
  {
    id: 'sonidos',
    name: 'Taller de los Sonidos',
    description: 'Descubre, escucha y reproduce sonidos.',
    view: 'mundo-asha/juegos' as View,
    icon: Volume2,
    color: 'bg-[#FFEDD5] text-[#EA580C]',
  },
];

export function TerapeutaDatosActividad({ go }: { go: (view: View) => void }) {
  return (
    <div className="mx-auto max-w-7xl p-4 text-[#1C1135] sm:p-6 lg:p-8">
      <header className="mb-6 rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EDE9FE] text-[#6B46FE]">
            <Gamepad2 size={25} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Datos de actividad</h1>
            <p className="mt-2 text-sm font-bold text-[#615274]">
              Acceso a las actividades educativas de Mundo ASHA.
            </p>
          </div>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4" role="note">
        <div className="flex items-start gap-3">
          <Info size={19} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-extrabold text-blue-950">Los indicadores reales de participación aún no están disponibles aquí.</h2>
            <p className="mt-1 text-xs leading-relaxed text-blue-900">
              Esta vista no muestra cifras de ejemplo ni consulta reportes clínicos. Los intentos de juego y el progreso por objetivo se mantienen en flujos separados; una actividad no representa evolución clínica.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Actividades educativas" className="grid gap-4 md:grid-cols-3">
        {activities.map(({ id, name, description, view, icon: Icon, color }) => (
          <article key={id} className="flex flex-col rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
              <Icon size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-black">{name}</h2>
            <p className="mt-1 flex-1 text-sm text-[#615274]">{description}</p>
            <button
              type="button"
              onClick={() => go(view)}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#6B46FE] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#5833EA]"
            >
              Abrir actividad <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
        ))}
      </section>

      <p className="mt-6 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-4 text-xs leading-relaxed text-[#615274]">
        El historial clínico por objetivo se obtiene únicamente de reportes de sesión guardados. Esta sección no lee esos reportes ni presenta intentos de juego como resultados terapéuticos.
      </p>
    </div>
  );
}

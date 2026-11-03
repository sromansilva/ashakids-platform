import { AlertTriangle, CalendarDays, ClipboardCheck, ShieldCheck } from "lucide-react";
import type { View } from "@/shared/domain/types/navigation";
import { Btn } from "@/shared/presentation/components/common/Btn";

export function EvaluacionInicial({ go }: { go: (view: View) => void }) {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4" role="status">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} aria-hidden="true" />
          <div>
            <p className="font-extrabold text-amber-900">La evaluación se realiza durante una sesión con el terapeuta</p>
            <p className="mt-1 text-sm text-amber-800">
              Esta página no aplica pruebas, no genera resultados y no guarda información clínica.
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#1C1135]">Evaluación inicial</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#615274]">
          El terapeuta realiza y revisa las actividades clínicas durante la sesión. Si se propone una muestra de voz,
          el tutor puede decidir si autoriza su procesamiento; la transcripción automática es tentativa y requiere
          revisión profesional.
        </p>

        <div className="my-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#F8F7FC] p-4">
            <CalendarDays className="mb-2 text-[#6B46FE]" size={20} aria-hidden="true" />
            <p className="text-sm font-bold text-[#1C1135]">Agenda una sesión</p>
            <p className="mt-1 text-xs text-[#615274]">Elige profesional y horario disponible.</p>
          </div>
          <div className="rounded-2xl bg-[#F8F7FC] p-4">
            <ShieldCheck className="mb-2 text-[#6B46FE]" size={20} aria-hidden="true" />
            <p className="text-sm font-bold text-[#1C1135]">Tú decides</p>
            <p className="mt-1 text-xs text-[#615274]">La autorización de voz es opcional y revocable.</p>
          </div>
          <div className="rounded-2xl bg-[#F8F7FC] p-4">
            <ClipboardCheck className="mb-2 text-[#6B46FE]" size={20} aria-hidden="true" />
            <p className="text-sm font-bold text-[#1C1135]">Revisión del terapeuta</p>
            <p className="mt-1 text-xs text-[#615274]">Los resultados se confirman antes del reporte.</p>
          </div>
        </div>

        <Btn variant="cta" className="w-full justify-center" onClick={() => go("padre/agenda")}>
          Ir a la agenda
        </Btn>
        <button
          type="button"
          onClick={() => go("padre")}
          className="mt-3 w-full py-2 text-sm font-bold text-[#7C6F9A] hover:text-[#1C1135]"
        >
          Volver al inicio familiar
        </button>
      </section>
    </main>
  );
}

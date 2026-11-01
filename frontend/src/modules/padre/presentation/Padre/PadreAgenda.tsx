import { BookingDialog } from "@/shared/presentation/components/common/BookingDialog";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { usePadreAgenda } from "./usePadreAgenda";
import { PadreAgendaMiAgenda } from "./PadreAgendaMiAgenda";
import { Plus } from "lucide-react";
import { MONTHS } from "./MONTHS";

export function PadreAgenda(props: Parameters<typeof usePadreAgenda>[0]) {
  const agenda = usePadreAgenda(props);

  return (
    <div className="w-full max-w-[1320px] mx-auto p-4 sm:p-6 text-[#1C1135]">
      <RemoteFeedback
        pending={agenda.appointmentsQuery.isPending || agenda.patientsQuery.isPending}
        error={agenda.appointmentsQuery.error || agenda.patientsQuery.error || agenda.cancel.error}
        retry={() => {
          void agenda.appointmentsQuery.refetch();
          void agenda.patientsQuery.refetch();
        }}
      />
      {agenda.showNew && (
        <BookingDialog patientId={agenda.patient?.id_paciente} close={() => agenda.setShowNew(false)} />
      )}

      {/* Top Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-[#1C1135] tracking-tight">Mi Agenda</h1>
          <p className="text-sm font-semibold text-[#8C82A8] mt-1">
            {MONTHS[agenda.month]} · {agenda.year}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {agenda.children.length > 0 && (
            <label className="block text-xs font-extrabold text-[#615274]">
              Hijo o hija
              <select
                aria-label="Hijo o hija"
                value={agenda.patient?.id_paciente ?? ''}
                onChange={(event) => agenda.selectPatient(Number(event.target.value))}
                disabled={agenda.children.length < 2}
                className="mt-1 block min-w-52 rounded-xl border border-[#E8E5F4] bg-white px-3 py-2.5 text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-70"
              >
                {agenda.children.map((child) => (
                  <option key={child.id_paciente} value={child.id_paciente}>
                    {child.nombres_paciente} {child.apellidos_paciente}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() => agenda.setShowNew(true)}
            className="flex items-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-md shadow-[#6B46FE]/20 transition-all active:scale-[.98]"
          >
            <Plus size={16} />
            <span>Reservar cita</span>
          </button>
        </div>
      </div>

      <PadreAgendaMiAgenda {...agenda} />
    </div>
  );
}

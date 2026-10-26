import { BookingDialog } from "@/shared/presentation/components/common/BookingDialog";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { usePadreAgenda } from "./usePadreAgenda";
import { PadreAgendaMiAgenda } from "./PadreAgendaMiAgenda";
import { Plus } from "lucide-react";
import { MONTHS } from "./MONTHS";

export function PadreAgenda(props: Parameters<typeof usePadreAgenda>[0]) {
  const agenda = usePadreAgenda(props);

  return (
    <div className="p-4 sm:p-8 max-w-5xl text-[#1C1135]">
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
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Mi Agenda</h1>
          <p className="text-sm font-semibold text-[#8C82A8] mt-1">
            {MONTHS[agenda.month]} · {agenda.year}
          </p>
        </div>
        <button
          type="button"
          onClick={() => agenda.setShowNew(true)}
          className="flex items-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#6B46FE]/20 transition-all active:scale-[.98]"
        >
          <Plus size={16} />
          <span>Reservar cita</span>
        </button>
      </div>

      {/* Child selector */}
      {agenda.patient && (
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#8C82A8] mb-1.5">Hijo o hija</label>
          <div className="relative max-w-xs">
            <select
              className="w-full p-2.5 pr-8 rounded-2xl border border-[#E8E5F4] bg-white text-sm font-extrabold text-[#1C1135] shadow-xs focus:outline-hidden focus:border-[#6B46FE]"
              value={agenda.patient.id_paciente}
              onChange={(e) => agenda.selectPatient(Number(e.target.value))}
            >
              {agenda.children.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombres_paciente} {p.apellidos_paciente}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <PadreAgendaMiAgenda {...agenda} />
    </div>
  );
}

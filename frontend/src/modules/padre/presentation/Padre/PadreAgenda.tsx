import { BookingDialog } from "@/shared/presentation/components/common/BookingDialog";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { usePadreAgenda } from "./usePadreAgenda";
import { PadreAgendaMiAgenda } from "./PadreAgendaMiAgenda";
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
      </div>

      <PadreAgendaMiAgenda {...agenda} />
    </div>
  );
}

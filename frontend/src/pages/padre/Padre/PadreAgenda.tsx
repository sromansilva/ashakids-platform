import { BookingDialog } from "@/components/common/BookingDialog";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { usePadreAgenda } from "./usePadreAgenda";
import { PadreAgendaMiAgenda } from "./PadreAgendaMiAgenda";

export function PadreAgenda(props: Parameters<typeof usePadreAgenda>[0]) {
  const agenda = usePadreAgenda(props);
  return <><RemoteFeedback pending={agenda.appointmentsQuery.isPending || agenda.patientsQuery.isPending} error={agenda.appointmentsQuery.error || agenda.patientsQuery.error || agenda.cancel.error} retry={() => { void agenda.appointmentsQuery.refetch(); void agenda.patientsQuery.refetch(); }}/>
    {agenda.showNew && <BookingDialog patientId={agenda.patient?.id_paciente} close={() => agenda.setShowNew(false)}/>}
    {agenda.patient && <label className="block max-w-6xl mx-auto px-4 sm:px-6 pt-5 text-sm font-bold">Hijo o hija<select className="block mt-2 w-full sm:max-w-md p-3 rounded-xl border border-[#E8E5F4] bg-white" value={agenda.patient.id_paciente} onChange={e => agenda.selectPatient(Number(e.target.value))}>{agenda.children.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombres_paciente} {p.apellidos_paciente}</option>)}</select></label>}
    <PadreAgendaMiAgenda {...agenda}/>
  </>;
}

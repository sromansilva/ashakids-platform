import { useSelectedFamilyPatient } from "./useSelectedFamilyPatient";
import { useRemote } from "./useRemoteData";
import { appointmentsService, sessionsService, treatmentsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import { summarizeFamily } from "@/services/familyTracking";

export function useFamilyTracking() {
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const appointments = useRemote(["appointments"], signal => readAllPages(offset => appointmentsService.list({ limit: 100, offset }, signal), signal));
  const sessions = useRemote(["sessions"], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const treatments = useRemote(["patient-treatments", patient?.id_paciente], signal => readAllPages(offset => treatmentsService.list(patient!.id_paciente, { limit: 100, offset }, signal), signal), !!patient);
  const summary = patient ? summarizeFamily(patient, appointments.data ?? [], sessions.data ?? [], treatments.data ?? []) : null;
  const reportId = summary?.latestReportSession?.id_sesion;
  const report = useRemote(["report", reportId], signal => sessionsService.report(reportId!, signal), !!reportId);
  // Errors hide cached summaries: stale numbers must not look current after a failed refresh.
  const lists = [patients, appointments, sessions, ...(patient ? [treatments] : [])];
  const error = lists.find(q => q.error)?.error;
  const pending = lists.some(q => q.isPending);
  const retry = () => { lists.forEach(q => { void q.refetch(); }); };
  return { children, patient, selectPatient, summary, treatments: treatments.data ?? [], report,
    error, pending, refreshing: lists.some(q => q.isFetching), retry };
}

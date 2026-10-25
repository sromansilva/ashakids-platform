import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { usePadreReportes } from "@/modules/padre/presentation/reports/usePadreReportes";
import { PadreReportesundefined } from "@/modules/padre/presentation/reports/PadreReportesundefined";


export function PadreReportes() {
const { sessionsQuery, tab, setTab, openSession, setOpenSession, sessions } = usePadreReportes();
return (
    <><RemoteFeedback pending={sessionsQuery.isPending} error={sessionsQuery.error} retry={() => void sessionsQuery.refetch()} />
    <PadreReportesundefined setTab={setTab} tab={tab} sessions={sessions} setOpenSession={setOpenSession} openSession={openSession} ready={sessionsQuery.isSuccess} /></>
  );

}

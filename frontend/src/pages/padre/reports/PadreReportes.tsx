import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { usePadreReportes } from "@/pages/padre/reports/usePadreReportes";
import { PadreReportesundefined } from "@/pages/padre/reports/PadreReportesundefined";


export function PadreReportes() {
const { sessionsQuery, tab, setTab, openSession, setOpenSession, sessions } = usePadreReportes();
return (
    <><RemoteFeedback pending={sessionsQuery.isPending} error={sessionsQuery.error} retry={() => void sessionsQuery.refetch()} />
    <PadreReportesundefined setTab={setTab} tab={tab} sessions={sessions} setOpenSession={setOpenSession} openSession={openSession} ready={sessionsQuery.isSuccess} /></>
  );

}

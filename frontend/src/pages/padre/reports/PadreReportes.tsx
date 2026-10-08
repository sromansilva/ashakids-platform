import { usePadreReportes } from "@/pages/padre/reports/usePadreReportes";
import { PadreReportesundefined } from "@/pages/padre/reports/PadreReportesundefined";


export function PadreReportes() {
const { tab, setTab, toast, setToast, openSession, setOpenSession, reportViewId, setReportViewId, showToast, sessions, reports, selectedReport, downloadPdf, downloadReport } = usePadreReportes();
return (
    <PadreReportesundefined toast={toast} selectedReport={selectedReport} setReportViewId={setReportViewId} downloadReport={downloadReport} setTab={setTab} tab={tab} sessions={sessions} setOpenSession={setOpenSession} openSession={openSession} downloadPdf={downloadPdf} showToast={showToast} reports={reports} />
  );

}

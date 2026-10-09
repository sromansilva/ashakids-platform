import { BookingDialog } from "@/components/common/BookingDialog";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { usePadreAgenda } from "@/pages/padre/Padre/usePadreAgenda";
import { PadreAgendaMiAgenda } from "@/pages/padre/Padre/PadreAgendaMiAgenda";


export function PadreAgenda(props: Parameters<typeof usePadreAgenda>[0]) {
const { appointmentsQuery, cancel, go, apts, onAppointmentsChange, today, year, setYear, month, setMonth, selDay, setSelDay, setApts, showNew, setShowNew, cancelId, setCancelId, toast, setToast, timelineSel, setTimelineSel, expandedReservationIds, setExpandedReservationIds, newStep, setNewStep, newTherapist, setNewTherapist, newDay, setNewDay, newTime, setNewTime, newChild, setNewChild, newModality, setNewModality, daysInMonth, firstDay, SHORT_MONTHS, aptDays, prevMonth, nextMonth, selectedApts, pendingCount, confirmedApts, waitingApts, rejectedApts, cancelApt, confirmNew, bookSlots } = usePadreAgenda(props);
return (
    <><RemoteFeedback pending={appointmentsQuery.isPending} error={appointmentsQuery.error || cancel.error} retry={() => void appointmentsQuery.refetch()} />
    {showNew && <BookingDialog close={() => setShowNew(false)} />}
    <PadreAgendaMiAgenda toast={toast} setToast={setToast} cancelId={cancelId} cancelApt={cancelApt} setCancelId={setCancelId} month={month} year={year} pendingCount={pendingCount} setShowNew={setShowNew} setNewStep={setNewStep} prevMonth={prevMonth} nextMonth={nextMonth} firstDay={firstDay} daysInMonth={daysInMonth} today={today} aptDays={aptDays} selDay={selDay} setSelDay={setSelDay} selectedApts={selectedApts} waitingApts={waitingApts} setApts={setApts} rejectedApts={rejectedApts} go={go} confirmedApts={confirmedApts} expandedReservationIds={expandedReservationIds} setExpandedReservationIds={setExpandedReservationIds} timelineSel={timelineSel} setTimelineSel={setTimelineSel} showNew={false} newStep={newStep} setNewTherapist={setNewTherapist} newTherapist={newTherapist} setNewModality={setNewModality} newModality={newModality} setNewChild={setNewChild} newChild={newChild} setNewDay={setNewDay} newDay={newDay} bookSlots={bookSlots} setNewTime={setNewTime} newTime={newTime} confirmNew={confirmNew} /></>
  );

}

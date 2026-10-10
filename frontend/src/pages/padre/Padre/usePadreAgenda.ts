import { useSelectedFamilyPatient } from "@/hooks/useSelectedFamilyPatient";
import { useAppointments } from "@/hooks/useAppointments";
import { useWrite } from "@/hooks/useRemoteData";
import { appointmentsService } from "@/services/clinicalService";
import { useEffect, useState } from "react";
import { View } from "@/types/navigation";



// ─── Shared micro components ──────────────────────────────────────────────────

import { getDaysInMonth } from "@/pages/padre/Padre/getDaysInMonth";
import { getFirstDayOfWeek } from "@/pages/padre/Padre/getFirstDayOfWeek";
import { Apt } from "@/pages/padre/Padre/Apt";

export function usePadreAgenda({ go, appointments: _apts, onAppointmentsChange }: { go: (v: View) => void; appointments: Apt[]; onAppointmentsChange: React.Dispatch<React.SetStateAction<Apt[]>> }) {
const { query: appointmentsQuery, appointments: liveAppointments } = useAppointments();
const { patients: patientsQuery, children, patient, selectPatient } = useSelectedFamilyPatient();
const allowed = new Set((appointmentsQuery.data ?? []).filter(a => a.id_paciente === patient?.id_paciente).map(a => a.id_reserva));
const apts = appointmentsQuery.error || patientsQuery.error ? [] : liveAppointments.filter(a => allowed.has(a.id));
const today = new Date();
const [year, setYear]     = useState(today.getFullYear());
const [month, setMonth]   = useState(today.getMonth());
const [selDay, setSelDay] = useState<number | null>(today.getDate());

const [showNew, setShowNew] = useState(false);
const [cancelId, setCancelId] = useState<number | null>(null);
const [toast, setToast]   = useState("");
const [timelineSel, setTimelineSel] = useState<Apt | null>(null);
const [expandedReservationIds, setExpandedReservationIds] = useState<number[]>([]);
useEffect(() => { setTimelineSel(null); setExpandedReservationIds([]); setCancelId(null); }, [patient?.id_paciente]);
const daysInMonth = getDaysInMonth(year, month);
const firstDay    = getFirstDayOfWeek(year, month);
const SHORT_MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const aptDays = new Set(
    apts
      .filter(a => { const p = a.date.split(" "); return p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; })
      .map(a => parseInt(a.date.split(" ")[0]))
  );
const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelDay(null); setTimelineSel(null);
  };
const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelDay(null); setTimelineSel(null);
  };
const selectedApts = selDay
    ? apts.filter(a => { const p = a.date.split(" "); return parseInt(p[0]) === selDay && p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; })
    : apts.filter(a => { const p = a.date.split(" "); return p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; });
const pendingCount = apts.filter(apt => apt.status === "por confirmar").length;
const confirmedApts = selectedApts.filter((apt) => ["confirmada", "completada", "cancelada"].includes(apt.status));
const waitingApts = selectedApts.filter((apt) => apt.status === "por confirmar");
const cancel = useWrite((id: number) => appointmentsService.state(id, "CANCELADA"), () => { setCancelId(null); void appointmentsQuery.refetch(); setToast("Cita cancelada en el servidor"); });
const cancelApt = (id: number) => { void cancel.submit(id); };
return { patientsQuery, children, patient, selectPatient, appointmentsQuery, cancel, go, apts, today, year, month, selDay, setSelDay, showNew, setShowNew, cancelId, setCancelId, toast, setToast, timelineSel, setTimelineSel, expandedReservationIds, setExpandedReservationIds, daysInMonth, firstDay, aptDays, prevMonth, nextMonth, selectedApts, pendingCount, confirmedApts, waitingApts, cancelApt };
}

import { useSelectedFamilyPatient } from "@/modules/padre/application/useSelectedFamilyPatient";
import { useAppointments } from "@/shared/application/hooks/useAppointments";
import { useWrite } from "@/shared/application/hooks/useRemoteData";
import { appointmentsService } from "@/modules/clinica/infrastructure/clinicalService";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { View } from "@/shared/domain/types/navigation";



// ─── Shared micro components ──────────────────────────────────────────────────

import { getDaysInMonth } from "@/modules/padre/presentation/Padre/getDaysInMonth";
import { getFirstDayOfWeek } from "@/modules/padre/presentation/Padre/getFirstDayOfWeek";

export function usePadreAgenda({ go }: { go: (v: View) => void }) {
const { query: appointmentsQuery, appointments: liveAppointments } = useAppointments();
const { patients: patientsQuery, children, patient, selectPatient } = useSelectedFamilyPatient();
const allowed = new Set((appointmentsQuery.data ?? []).filter(a => a.id_paciente === patient?.id_paciente).map(a => a.id_reserva));
const apts = appointmentsQuery.error || patientsQuery.error ? [] : liveAppointments.filter(a => allowed.has(a.id));
const today = new Date();
const [year, setYear]     = useState(today.getFullYear());
const [month, setMonth]   = useState(today.getMonth());
const [selDay, setSelDay] = useState<number | null>(today.getDate());

const [searchParams, setSearchParams] = useSearchParams();
const autoBooking = searchParams.get('booking') === 'true' || searchParams.get('reservar') === 'true';
const [showNew, setShowNewState] = useState(autoBooking);

useEffect(() => {
  if (autoBooking && !showNew) {
    setShowNewState(true);
  }
}, [autoBooking]);

const setShowNew = (open: boolean) => {
  setShowNewState(open);
  if (!open && (searchParams.has('booking') || searchParams.has('reservar'))) {
    const next = new URLSearchParams(searchParams);
    next.delete('booking');
    next.delete('reservar');
    setSearchParams(next, { replace: true });
  }
};
const [cancelId, setCancelId] = useState<number | null>(null);
const [toast, setToast]   = useState("");
const [expandedReservationIds, setExpandedReservationIds] = useState<number[]>([]);
useEffect(() => { setExpandedReservationIds([]); setCancelId(null); }, [patient?.id_paciente]);
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
    setSelDay(null);
  };
const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelDay(null);
  };
// Enlace desde un aviso (?cita=ID): abre el día de esa cita y la deja expandida, una sola vez.
const requestedCita = Number(searchParams.get("cita"));
const openedCita = useRef<number | null>(null);
useEffect(() => {
  if (!Number.isInteger(requestedCita) || requestedCita <= 0 || openedCita.current === requestedCita) return;
  const target = apts.find(a => a.id === requestedCita);
  if (!target) return;
  const parts = target.date.split(" ");
  const monthIndex = SHORT_MONTHS.indexOf(parts[1]);
  if (monthIndex < 0) return;
  openedCita.current = requestedCita;
  setYear(parseInt(parts[2])); setMonth(monthIndex); setSelDay(parseInt(parts[0]));
  setExpandedReservationIds(cur => cur.includes(requestedCita) ? cur : [...cur, requestedCita]);
}, [requestedCita, apts]);
const selectedApts = selDay
    ? apts.filter(a => { const p = a.date.split(" "); return parseInt(p[0]) === selDay && p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; })
    : apts.filter(a => { const p = a.date.split(" "); return p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; });
const pendingCount = apts.filter(apt => apt.status === "por confirmar").length;
const confirmedApts = selectedApts.filter((apt) => ["confirmada", "completada", "cancelada"].includes(apt.status));
const waitingApts = selectedApts.filter((apt) => apt.status === "por confirmar");
const cancel = useWrite((id: number) => appointmentsService.state(id, "CANCELADA"), () => { setCancelId(null); void appointmentsQuery.refetch(); setToast("Cita cancelada en el servidor"); });
const cancelApt = (id: number) => { void cancel.submit(id); };
return { patientsQuery, children, patient, selectPatient, appointmentsQuery, cancel, go, apts, today, year, month, selDay, setSelDay, showNew, setShowNew, cancelId, setCancelId, toast, setToast, expandedReservationIds, setExpandedReservationIds, daysInMonth, firstDay, aptDays, prevMonth, nextMonth, selectedApts, pendingCount, confirmedApts, waitingApts, cancelApt };
}

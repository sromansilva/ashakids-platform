import { useState } from "react";
import { View } from "@/types/navigation";
import { therapists } from "@/mocks/demo";


// ─── Shared micro components ──────────────────────────────────────────────────
import { MONTHS } from "@/pages/padre/Padre/MONTHS";
import { getDaysInMonth } from "@/pages/padre/Padre/getDaysInMonth";
import { getFirstDayOfWeek } from "@/pages/padre/Padre/getFirstDayOfWeek";
import { Apt } from "@/pages/padre/Padre/Apt";

export function usePadreAgenda({ go, appointments: apts, onAppointmentsChange }: { go: (v: View) => void; appointments: Apt[]; onAppointmentsChange: React.Dispatch<React.SetStateAction<Apt[]>> }) {
const today = new Date();
const [year, setYear]     = useState(today.getFullYear());
const [month, setMonth]   = useState(today.getMonth());
const [selDay, setSelDay] = useState<number | null>(today.getDate());
const setApts = onAppointmentsChange;
const [showNew, setShowNew] = useState(false);
const [cancelId, setCancelId] = useState<number | null>(null);
const [toast, setToast]   = useState("");
const [timelineSel, setTimelineSel] = useState<Apt | null>(null);
const [expandedReservationIds, setExpandedReservationIds] = useState<number[]>([]);
const [newStep, setNewStep] = useState(0);
const [newTherapist, setNewTherapist] = useState("");
const [newDay, setNewDay]   = useState<number | null>(null);
const [newTime, setNewTime] = useState("");
const [newChild, setNewChild] = useState("Mateo");
const [newModality, setNewModality] = useState<"virtual"|"presencial"|null>(null);
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
const confirmedApts = selectedApts.filter((apt) => apt.status === "confirmada");
const waitingApts = selectedApts.filter((apt) => apt.status === "por confirmar");
const rejectedApts = selectedApts.filter((apt) => apt.status === "rechazada");
const cancelApt = (id: number) => {
    setApts(prev => prev.filter(a => a.id !== id));
    setCancelId(null);
    setToast("Cita cancelada correctamente");
  };
const confirmNew = () => {
    const newApt: Apt = {
      id: Date.now(),
      therapist: newTherapist,
      specialty: therapists.find(t => t.name === newTherapist)?.specialty ?? "Terapia",
      child: newChild,
      date: `${newDay} ${MONTHS[month].slice(0,3)} ${year}`,
      time: newTime,
      type: newModality ?? "virtual",
      status: "por confirmar",
    };
    setApts(prev => [...prev, newApt]);
    setShowNew(false);
    setNewStep(0);
    setNewTherapist("");
    setNewDay(null);
    setNewTime("");
    setNewModality(null);
    setToast("Solicitud enviada. Te avisaremos cuando sea aceptada.");
  };
const bookSlots = ["08:00","09:00","10:00","10:30","11:00","12:00","14:00","15:00","15:30","16:00","17:00"];
return { go, apts, onAppointmentsChange, today, year, setYear, month, setMonth, selDay, setSelDay, setApts, showNew, setShowNew, cancelId, setCancelId, toast, setToast, timelineSel, setTimelineSel, expandedReservationIds, setExpandedReservationIds, newStep, setNewStep, newTherapist, setNewTherapist, newDay, setNewDay, newTime, setNewTime, newChild, setNewChild, newModality, setNewModality, daysInMonth, firstDay, SHORT_MONTHS, aptDays, prevMonth, nextMonth, selectedApts, pendingCount, confirmedApts, waitingApts, rejectedApts, cancelApt, confirmNew, bookSlots };
}

import { FamilyAppointmentDetail } from "@/components/common/FamilyAppointmentDetail";
import type { usePadreAgenda } from "@/pages/padre/Padre/usePadreAgenda";
import { ChevronLeft, ChevronRight, Plus, Video, X, CalendarDays } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";

// ─── Shared micro components ──────────────────────────────────────────────────
// ─── Shared micro components ──────────────────────────────────────────────────
import { Toast } from "@/pages/padre/Padre/Toast";
import { ConfirmModal } from "@/pages/padre/Padre/ConfirmModal";
import { MONTHS } from "@/pages/padre/Padre/MONTHS";
import { DAYS_LABEL } from "@/pages/padre/Padre/DAYS_LABEL";

type Props = Pick<ReturnType<typeof usePadreAgenda>, "toast" | "setToast" | "cancelId" | "cancelApt" | "setCancelId" | "month" | "year" | "pendingCount" | "setShowNew" | "prevMonth" | "nextMonth" | "firstDay" | "daysInMonth" | "today" | "aptDays" | "selDay" | "setSelDay" | "selectedApts" | "waitingApts" | "confirmedApts" | "expandedReservationIds" | "setExpandedReservationIds" | "timelineSel" | "setTimelineSel">;
export function PadreAgendaMiAgenda({ toast, setToast, cancelId, cancelApt, setCancelId, month, year, pendingCount, setShowNew, prevMonth, nextMonth, firstDay, daysInMonth, today, aptDays, selDay, setSelDay, selectedApts, waitingApts, confirmedApts, expandedReservationIds, setExpandedReservationIds, timelineSel, setTimelineSel }: Props) {
return (<div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      {cancelId !== null && (
        <ConfirmModal
          title="Cancelar cita"
          desc="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
          onConfirm={() => cancelApt(cancelId!)}
          onClose={() => setCancelId(null)}
        />
      )}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Mi Agenda</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-[#7C6F9A] font-medium">{MONTHS[month]} · {year}</p>
            {pendingCount > 0 && <Bdg color="orange">{pendingCount} por confirmar</Bdg>}
          </div>
        </div>
        <Btn variant="cta" size="sm" onClick={() => { setShowNew(true); }}>
          <Plus size={14} /> Reservar cita
        </Btn>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <Crd className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#1C1135]">{MONTHS[month]} {year}</h3>
            <div className="flex gap-1">
              <button onClick={prevMonth} aria-label="Mes anterior" className="p-1.5 hover:bg-violet-50 rounded-xl transition-colors">
                <ChevronLeft size={15} className="text-[#7C6F9A]" />
              </button>
              <button onClick={nextMonth} aria-label="Mes siguiente" className="p-1.5 hover:bg-violet-50 rounded-xl transition-colors">
                <ChevronRight size={15} className="text-[#7C6F9A]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS_LABEL.map(d => <div key={d} className="text-center text-xs text-[#9E95B7] font-extrabold py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const hasApt  = aptDays.has(day);
              const isSel   = selDay === day;
              return (
                <button key={day} onClick={() => setSelDay(d => d === day ? null : day)}
                  className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all relative font-bold
                    ${isToday ? "bg-violet-700 text-white" : isSel ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400" : "hover:bg-violet-50 text-[#1C1135]"}`}>
                  {day}
                  {hasApt && !isToday && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: B.orange }} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E5F4] flex items-center justify-between text-xs text-[#9E95B7] font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> Cita agendada</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-700" /> Hoy</div>
          </div>
        </Crd>

        {/* Appointments card — same grid height as calendar */}
        <Crd className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#F5F3FF] flex items-center justify-between flex-shrink-0">
            <h3 className="font-extrabold text-[#1C1135]">
              {selDay ? `Citas del ${selDay} de ${MONTHS[month]}` : "Todas las citas"} ({selectedApts.length})
            </h3>
            {selDay && (
              <button onClick={() => setSelDay(null)} className="text-xs font-bold text-[#9E95B7] hover:text-violet-600 transition-colors">
                Ver todas
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {selectedApts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <CalendarDays size={36} className="text-violet-700 mb-3" aria-hidden="true"/>
                <p className="font-extrabold text-[#1C1135] mb-1">Sin citas</p>
                <p className="text-sm text-[#7C6F9A] font-medium mb-4">No hay citas para este período. ¿Quieres agendar una?</p>
                <Btn size="sm" variant="cta" onClick={() => setShowNew(true)}><Plus size={13} /> Reservar cita</Btn>
              </div>
            )}
            {waitingApts.map((apt) => (
              <div key={apt.id} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-extrabold text-[#1C1135]">{apt.date} · {apt.time}</p><p className="text-xs text-[#7C6F9A] font-medium mt-1">{apt.therapist} · {apt.child} · {apt.type === "presencial" ? "Presencial" : "Virtual"}</p></div><Bdg color="orange">Por confirmar</Bdg></div>
                <p className="mt-3 text-xs font-medium text-orange-800">La confirmación corresponde al terapeuta asignado. El estado se actualizará desde el servidor.</p>
              </div>
            ))}
            {confirmedApts.map((apt) => {
              const isExpanded = expandedReservationIds.includes(apt.id);
              const detailsId = `reservation-details-${apt.id}`;
              return <div key={apt.id} className="rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden transition-shadow hover:shadow-sm">
                <button type="button" onClick={() => setExpandedReservationIds((current) => current.includes(apt.id) ? current.filter((id) => id !== apt.id) : [...current, apt.id])} aria-expanded={isExpanded} aria-controls={detailsId} className="w-full min-h-12 p-4 flex items-center gap-3 text-left hover:bg-[#FAFAF9] focus-visible:ring-2 focus-visible:ring-violet-500">
                  <Av initials={apt.therapist.split(" ").map((word) => word[0]).join("").slice(0, 2)} color={B.violet} size="sm" />
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-[#1C1135] truncate">{apt.date} · {apt.time}</p><p className="text-xs text-[#7C6F9A] font-medium truncate mt-0.5">{apt.therapist} · {apt.child} · {apt.type === "presencial" ? "Presencial" : "Virtual"}</p></div>
                  <Bdg color={apt.status === "confirmada" ? "green" : apt.status === "completada" ? "teal" : "orange"}>{apt.status === "confirmada" ? "Confirmada" : apt.status === "completada" ? "Completada" : "Cancelada"}</Bdg><ChevronRight size={17} className={`shrink-0 text-[#7C6F9A] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                {isExpanded && <div id={detailsId} className="border-t border-[#F5F3FF] px-4 pb-4 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <FamilyAppointmentDetail id={apt.id} cancel={() => setCancelId(apt.id)} />
                </div>}
              </div>;
            })}
          </div>
        </Crd>
      </div>

      {/* ── Timeline horizontal ── */}
      <Crd className="p-5 mt-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-[#1C1135]">Línea de tiempo</h3>
            <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
              {selDay ? `${selDay} de ${MONTHS[month]} ${year}` : `${MONTHS[month]} ${year}`}
              {" · "}{selectedApts.length} {selectedApts.length === 1 ? "cita" : "citas"}
            </p>
          </div>
          {timelineSel && (
            <button onClick={() => setTimelineSel(null)} className="p-1.5 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7] transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Horizontal scroll rail */}
        <div className="overflow-x-auto pb-1">
          <div className="relative" style={{ width: `${10 * 92}px`, height: 100 }}>
            {/* Hour columns */}
            {Array.from({ length: 11 }, (_, i) => 8 + i).map(hour => (
              <div key={hour} className="absolute top-0 bottom-0"
                style={{ left: `${(hour - 8) * 92}px` }}>
                <div className="h-full border-l border-dashed border-[#E8E5F4]" />
                <span className="absolute top-0 left-1.5 text-[10px] text-[#9E95B7] font-bold whitespace-nowrap">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}

            {/* Appointment boxes */}
            {selectedApts.map(apt => {
              const [h, m] = apt.time.split(":").map(Number);
              const leftPx = ((h - 8) + m / 60) * 92;
              const isSel = timelineSel?.id === apt.id;
              const isVirtual = apt.type === "virtual";
              return (
                <button key={apt.id}
                  onClick={() => setTimelineSel(isSel ? null : apt)}
                  className="absolute top-7 rounded-2xl px-3 py-2 border text-left transition-all active:scale-95"
                  style={{
                    left: leftPx,
                    background: isSel
                      ? (isVirtual ? "rgba(196,181,253,0.65)" : "rgba(147,197,253,0.65)")
                      : (isVirtual ? "rgba(196,181,253,0.28)" : "rgba(147,197,253,0.28)"),
                    borderColor: isVirtual ? "#c4b5fd" : "#7dd3fc",
                    minWidth: 110,
                    boxShadow: isSel ? "0 4px 14px rgba(0,0,0,0.10)" : undefined,
                    transform: isSel ? "scale(1.03)" : undefined,
                    zIndex: isSel ? 10 : 1,
                  }}>
                  <p className="text-xs font-extrabold text-[#1C1135] whitespace-nowrap">{apt.time}</p>
                  <p className="text-[11px] text-[#7C6F9A] font-medium whitespace-nowrap">{apt.therapist.split(" ").slice(-1)[0]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini card on selection */}
        {timelineSel && (
          <div className="mt-4 rounded-2xl border p-4 flex items-center justify-between gap-3 transition-all"
            style={{ background: "rgba(196,181,253,0.15)", borderColor: "#c4b5fd" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,181,253,0.45)" }}>
                <Video size={17} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-[#1C1135] text-sm leading-tight truncate">
                  {timelineSel.time} · {timelineSel.therapist}
                </p>
                <p className="text-xs text-[#7C6F9A] font-medium truncate">
                  {timelineSel.specialty} · 45 min · {timelineSel.date}
                </p>
              </div>
            </div>
            <Btn size="sm" variant="cta" onClick={() => { setExpandedReservationIds(ids => ids.includes(timelineSel.id) ? ids : [...ids, timelineSel.id]); setTimelineSel(null); }}>
              <Video size={12} /> Ver detalle real
            </Btn>
          </div>
        )}
      </Crd>

    </div>);
}
